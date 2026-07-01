import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from pydantic import TypeAdapter

from app.db import pool
from app.exceptions import DuplicateMovieError
from app.models import MovieBase, MovieFull, MoviePerson

movies_adapter = TypeAdapter(list[MovieFull])


async def insert_movie_people(cur, movie_id: int, people: list[MoviePerson]) -> None:
    """Upsert people (by tmdb_id) and link them to a movie via movie_people.

    Runs on a caller-provided cursor so it can share the caller's transaction
    (used by both add_movie and the backfill script). ON CONFLICT DO UPDATE on
    people so the RETURNING id comes back even for an already-known person.
    """
    for p in people:
        await cur.execute(
            """
            INSERT INTO people (tmdb_id, name)
            VALUES (%(tmdb_id)s, %(name)s)
            ON CONFLICT (tmdb_id) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            """,
            {"tmdb_id": p.tmdb_id, "name": p.name},
        )
        row = await cur.fetchone()
        assert row is not None
        await cur.execute(
            """
            INSERT INTO movie_people (movie_id, person_id, role, character_name, billing_order)
            VALUES (%(movie_id)s, %(person_id)s, %(role)s, %(character_name)s, %(billing_order)s)
            ON CONFLICT (movie_id, person_id, role) DO NOTHING
            """,
            {
                "movie_id": movie_id,
                "person_id": row[0],
                "role": p.role,
                "character_name": p.character,
                "billing_order": p.billing_order,
            },
        )


async def get_movies() -> list[MovieFull]:
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("""
                SELECT
                    name, year, tagline, description, original_title, poster_path, tmdb_id, id,
					ARRAY(
						SELECT genres.name
						FROM movie_genres 
                            JOIN genres ON movie_genres.genre_id = genres.id
                        WHERE movie_id = movies.id
                        ORDER BY genres.name
					) AS genres,
                    languages.english_name AS language
                FROM movies
                LEFT JOIN languages
                    ON movies.language = languages.code
                ORDER BY name;
            """)
            rows = await cur.fetchall()
    return movies_adapter.validate_python(rows)


async def get_movie(id: int):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                SELECT
                    id, name, year, tagline, description, original_title, tmdb_id,
                    poster_path, tmdb_poster_path, issues,
                    languages.english_name AS language,
                    ARRAY(
                        SELECT g.name
                        FROM movie_genres mg JOIN genres g ON g.id = mg.genre_id
                        WHERE mg.movie_id = movies.id
                        ORDER BY g.name
                    ) AS genres,
                    (
                        SELECT json_agg(
                            json_build_object('name', p.name, 'role', mp.character_name)
                            ORDER BY mp.billing_order
                        )
                        FROM movie_people mp JOIN people p ON p.id = mp.person_id
                        WHERE mp.movie_id = movies.id AND mp.role = 'cast'
                    ) AS cast_members,
                    ARRAY(
                        SELECT p.name
                        FROM movie_people mp JOIN people p ON p.id = mp.person_id
                        WHERE mp.movie_id = movies.id AND mp.role = 'director'
                        ORDER BY p.name
                    ) AS directors,
                    ARRAY(
                        SELECT p.name
                        FROM movie_people mp JOIN people p ON p.id = mp.person_id
                        WHERE mp.movie_id = movies.id AND mp.role = 'writer'
                        ORDER BY p.name
                    ) AS writers,
                    ARRAY(
                        SELECT p.name
                        FROM movie_people mp JOIN people p ON p.id = mp.person_id
                        WHERE mp.movie_id = movies.id AND mp.role = 'source'
                        ORDER BY p.name
                    ) AS source_authors
                FROM movies
                LEFT JOIN languages ON movies.language = languages.code
                WHERE movies.id = %s
                """,
                (id,),
            )
            item = await cur.fetchone()
    return MovieFull.model_validate(item) if item else None


async def delete_movie(id: int) -> bool:
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM movies WHERE id = %s RETURNING id", (id,))
            result = await cur.fetchone()
    return result is not None


async def add_movie(movie: MovieBase, people: list[MoviePerson] | None = None):
    params = movie.model_dump()
    params["cast_members"] = Jsonb(params["cast_members"])
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO movies (
                        name, year, language, tagline, genres, description,
                        original_title, tmdb_id, issues, poster_path,
                        tmdb_poster_path, cast_members
                    ) VALUES (
                        %(name)s, %(year)s, %(language)s, %(tagline)s, %(genres)s, %(description)s,
                        %(original_title)s, %(tmdb_id)s, %(issues)s, %(poster_path)s,
                        %(tmdb_poster_path)s, %(cast_members)s
                    )
                    RETURNING id
                    """,
                    params,
                )
                row = await cur.fetchone()
                assert row is not None

                # dual-write genres: keep the TEXT[] column above, and also link
                # rows in the normalized genres/movie_genres tables (same transaction).
                if movie.genres:
                    params["id"] = row[0]
                    await cur.execute(
                        """
                        INSERT INTO genres(name) SELECT unnest(%(genres)s::text[])
                        ON CONFLICT (name) DO NOTHING;
                        """,
                        params,
                    )
                    await cur.execute(
                        """
                        INSERT INTO movie_genres(movie_id, genre_id)
                        SELECT %(id)s, id FROM genres WHERE name = ANY(%(genres)s);
                        """,
                        params,
                    )

                # normalize cast + curated crew into people/movie_people
                # (same transaction). cast is still dual-written to the
                # cast_members JSONB blob above as a safety net.
                if people:
                    await insert_movie_people(cur, row[0], people)
    except psycopg.errors.UniqueViolation as e:
        if e.diag.constraint_name == "movies_tmdb_id_key":
            # i don't think this would ever happen in this case but we have to assert here for the linter to not complain
            assert movie.tmdb_id is not None
            raise DuplicateMovieError(movie.tmdb_id) from e
        raise

    # model_construct does not re-validate - ok here since we already have the MovieBase type passed
    # and this is more efficient than dump and validate again
    # aka: return MovieFull(**movie.model_dump(), id=row[0])
    return MovieFull.model_construct(id=row[0], **dict(movie))

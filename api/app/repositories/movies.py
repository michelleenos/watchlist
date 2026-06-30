# from psycopg import errors
import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from pydantic import TypeAdapter

from app.db import pool
from app.exceptions import DuplicateMovieError
from app.models import MovieBase, MovieFull

movies_adapter = TypeAdapter(list[MovieFull])


async def load_movies() -> list[MovieFull]:
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM movies ORDER BY name;")
            rows = await cur.fetchall()
    return movies_adapter.validate_python(rows)


async def get_movie(id: int):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM movies WHERE id = %s", (id,))
            item = await cur.fetchone()
    return MovieFull.model_validate(item) if item else None


async def delete_movie(id: int) -> bool:
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM movies WHERE id = %s RETURNING id", (id,))
            result = await cur.fetchone()
    return result is not None


async def add_movie(movie: MovieBase):
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
    except psycopg.errors.UniqueViolation as e:
        if e.diag.constraint_name == "movies_tmdb_id_key":
            # i don't think this would ever happen in this case but we have to assert here for the linter to not complain
            assert movie.tmdb_id is not None
            raise DuplicateMovieError(movie.tmdb_id) from e
        raise

    assert row is not None
    # model_construct does not re-validate - ok here since we already have the MovieBase type passed
    # and this is more efficient than dump and validate again
    # aka: return MovieFull(**movie.model_dump(), id=row[0])
    return MovieFull.model_construct(id=row[0], **dict(movie))

from app.exceptions import ImageError
from app.external.images import download_poster
from app.external.tmdb import get_tmdb_data
from app.models import MovieBase, MovieMember, MoviePerson, TMDBMovieDetails
from app.repositories.movies import add_movie

# TMDB crew `job` → our coarse `role`. Everything not listed is skipped, which
# drops Writing-department noise like "Story Artist"/"Head of Story" (verified
# live: animated films dump storyboard crafts into the Writing department).
DIRECTOR_JOBS = {"Director"}
WRITER_JOBS = {"Screenplay", "Writer", "Story", "Original Story"}
SOURCE_JOBS = {
    "Novel",
    "Book",
    "Short Story",
    "Characters",
    "Comic Book",
    "Graphic Novel",
    "Adaptation",
}


def _crew_role(job: str) -> str | None:
    if job in DIRECTOR_JOBS:
        return "director"
    if job in WRITER_JOBS:
        return "writer"
    if job in SOURCE_JOBS:
        return "source"
    return None


def tmdb_people_transform(data: TMDBMovieDetails) -> list[MoviePerson]:
    """Cast (top 5 by billing) + curated crew, deduped to one row per role.

    Deduping on (tmdb_id, role) collapses TMDB's Screenplay/Story-style splits
    into a single 'writer' row while keeping genuine multi-role people (e.g. a
    director who also writes) as separate rows.
    """
    people: dict[tuple[int, str], MoviePerson] = {}

    for c in sorted(data.credits.cast, key=lambda c: c.order)[:5]:
        key = (c.id, "cast")
        if key not in people:
            people[key] = MoviePerson(
                tmdb_id=c.id,
                name=c.name,
                role="cast",
                character=c.character,
                billing_order=c.order,
            )

    for c in data.credits.crew:
        role = _crew_role(c.job)
        if role is None:
            continue
        key = (c.id, role)
        if key not in people:
            people[key] = MoviePerson(tmdb_id=c.id, name=c.name, role=role)

    return list(people.values())


def tmdb_movie_transform(data: TMDBMovieDetails) -> MovieBase:
    cast_data = data.credits.cast
    cast_members: list[MovieMember] = [
        MovieMember(name=c.name, role=c.character) for c in cast_data[:5]
    ]

    year = None
    original_title = None

    if data.release_date:
        year = int(data.release_date.split("-")[0])

    if data.original_title != data.title:
        original_title = data.original_title

    return MovieBase(
        name=data.title,
        year=year,
        language=data.original_language,
        cast_members=cast_members,
        tagline=data.tagline,
        genres=[g.name for g in data.genres],
        description=data.overview,
        original_title=original_title,
        tmdb_id=data.id,
        tmdb_poster_path=data.poster_path,
    )


async def add_movie_from_tmdb(tmdb_id: int, added_by: str | None = None):
    data = await get_tmdb_data(tmdb_id)
    transformed = tmdb_movie_transform(data)
    transformed.added_by = added_by
    people = tmdb_people_transform(data)
    if transformed.tmdb_poster_path:
        try:
            transformed.poster_path = await download_poster(
                transformed.name, transformed.tmdb_poster_path
            )
        except ImageError as e:
            transformed.issues.append(str(e))
    return await add_movie(transformed, people)

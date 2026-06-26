import nanoid

from app.exceptions import ImageError
from app.external.images import download_poster
from app.external.tmdb import get_tmdb_data
from app.models import MovieFull, MovieMember, TMDBMovieDetails
from app.repositories.movies import add_movie


def tmdb_movie_transform(data: TMDBMovieDetails) -> MovieFull:
    cast_data = data.credits.cast
    cast: list[MovieMember] = [
        MovieMember(name=c.name, role=c.character) for c in cast_data[:5]
    ]

    year = None
    original_title = None

    if data.release_date:
        year = int(data.release_date.split("-")[0])

    if data.original_title != data.title:
        original_title = data.original_title

    return MovieFull(
        name=data.title,
        year=year,
        language=data.original_language,
        cast=cast,
        tagline=data.tagline,
        genres=[g.name for g in data.genres],
        description=data.overview,
        original_title=original_title,
        tmdb_id=data.id,
        tmdb_poster_path=data.poster_path,
        id=nanoid.generate(),
    )


async def add_movie_from_tmdb(tmdb_id: int):
    data = await get_tmdb_data(tmdb_id)
    transformed = tmdb_movie_transform(data)
    if transformed.tmdb_poster_path:
        try:
            transformed.poster_path = await download_poster(
                transformed.name, transformed.tmdb_poster_path
            )
        except ImageError as e:
            transformed.errors.append(str(e))
    await add_movie(transformed)
    return transformed

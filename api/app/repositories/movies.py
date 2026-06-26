import json

import aiofiles
from pydantic import TypeAdapter

from app.config import settings
from app.models import MovieFull

movies_adapter = TypeAdapter(list[MovieFull])


async def load_movies() -> list[MovieFull]:
    async with aiofiles.open(settings.movies_path) as f:
        contents = await f.read()

    contents = json.loads(contents)
    return movies_adapter.validate_python(contents)


async def get_movie(id: str):
    movies = await load_movies()
    return next((m for m in movies if m.id == id), None)


def save_movies(movies: list[MovieFull]) -> None:
    data = movies_adapter.dump_json(
        movies, by_alias=True, exclude_none=True, indent=4
    )
    with open(settings.movies_path, "wb") as f:
        f.write(data + b"\n")


async def delete_movie(id: str) -> bool:
    movies = await load_movies()
    remaining = [m for m in movies if m.id != id]
    if len(remaining) == len(movies):
        return False
    save_movies(remaining)
    return True


async def add_movie(movie: MovieFull):
    movies = await load_movies()
    new_movies = sorted([*movies, movie], key=lambda m: m.name)
    save_movies(new_movies)
    return True

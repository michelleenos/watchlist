import json

from pydantic import TypeAdapter

from app.config import settings
from app.models import MovieFull

movies_adapter = TypeAdapter(list[MovieFull])


def load_movies():
    with open(settings.movies_path) as f:
        j = json.load(f)
        return movies_adapter.validate_python(j)


def get_movies():
    return load_movies()


def get_movie(id: str):
    movies = load_movies()
    return next((m for m in movies if m.id == id), None)


def delete_movie(id: str) -> bool:
    movies = load_movies()
    remaining = [m for m in movies if m.id != id]
    if len(remaining) == len(movies):
        return False
    data = movies_adapter.dump_json(remaining, by_alias=True, exclude_none=True)
    with open(settings.movies_path, "wb") as f:
        f.write(data)
    return True

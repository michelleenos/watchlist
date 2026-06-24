import json

from pydantic import TypeAdapter

from app.config import settings
from app.models import MovieFull


def load_movies():
    with open(settings.movies_path) as f:
        j = json.load(f)
        return TypeAdapter(list[MovieFull]).validate_python(j)


def get_movies():
    return load_movies()


def get_movie(id: str):
    movies = load_movies()
    return next((m for m in movies if m.id == id), None)

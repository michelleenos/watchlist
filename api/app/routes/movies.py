from fastapi import APIRouter

from app.models import MovieFull
from app.repositories.movies import get_movie, get_movies

router = APIRouter()


@router.get("", response_model=list[MovieFull], response_model_exclude_none=True)
async def list_movies():
    return get_movies()


@router.get("/{movie_id}/", response_model=MovieFull)
async def get_movie_by_id(movie_id: str):
    movie = get_movie(movie_id)

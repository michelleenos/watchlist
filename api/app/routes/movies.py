from fastapi import APIRouter, HTTPException

from app.models import MovieFull
from app.repositories.movies import delete_movie, get_movie, get_movies

router = APIRouter()


@router.get("", response_model=list[MovieFull], response_model_exclude_none=True)
async def list_movies():
    return get_movies()


@router.get("/{movie_id}", response_model=MovieFull, response_model_exclude_none=True)
async def get_movie_by_id(movie_id: str):
    movie = get_movie(movie_id)
    if not movie:
        raise HTTPException(status_code=404)
    return movie


@router.delete("/{movie_id}")
async def remove_movie(movie_id: str):
    found = delete_movie(movie_id)
    if not found:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"success": True}

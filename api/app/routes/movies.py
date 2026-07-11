from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.auth import get_authenticated_user
from app.models import MovieFull
from app.repositories.movies import delete_movie, get_movie, get_movies
from app.services.add_movie import add_movie_from_tmdb

router = APIRouter()


@router.get("", response_model=list[MovieFull], response_model_exclude_none=True)
async def list_movies():
    return await get_movies()


@router.get(
    "/{movie_id}",
    response_model=MovieFull,
    response_model_exclude_none=True,
    responses={404: {"description": "Movie not found"}},
)
async def get_movie_by_id(movie_id: int):
    movie = await get_movie(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.delete("/{movie_id}", dependencies=[Depends(get_authenticated_user)])
async def remove_movie(movie_id: int):
    found = await delete_movie(movie_id)
    if not found:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"success": True}


class AddFromTmdbParams(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, validate_by_alias=True, validate_by_name=True
    )
    tmdb_id: int


@router.post(
    "",
    response_model=MovieFull,
    responses={409: {"description": "Movie with tmdb_id already exists"}},
    dependencies=[Depends(get_authenticated_user)],
)
async def add_from_tmdb(body: AddFromTmdbParams):
    movie = await add_movie_from_tmdb(body.tmdb_id)
    return movie

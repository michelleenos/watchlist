from fastapi import APIRouter

from app.external.tmdb import get_tmdb_data, tmdb_search

router = APIRouter()


@router.get("/search")
async def search(name: str):
    return await tmdb_search(name)


@router.get("/movie/{tmdb_id}")
async def get_tmdb_movie(tmdb_id: int):
    return await get_tmdb_data(tmdb_id)

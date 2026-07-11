from fastapi import APIRouter, Depends

from app.auth import get_authenticated_user
from app.external.tmdb import get_tmdb_data, tmdb_search
from app.models import TMDBSearchResult

router = APIRouter()


@router.get(
    "/search",
    response_model=list[TMDBSearchResult],
    dependencies=[Depends(get_authenticated_user)],
)
async def search(name: str):
    return await tmdb_search(name)


@router.get("/movie/{tmdb_id}", dependencies=[Depends(get_authenticated_user)])
async def get_tmdb_movie(tmdb_id: int):
    return await get_tmdb_data(tmdb_id)

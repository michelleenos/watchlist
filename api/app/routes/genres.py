from fastapi import APIRouter

from app.repositories.genres import get_genres

router = APIRouter()


@router.get("", response_model=list[str])
async def list_genres():
    return await get_genres()

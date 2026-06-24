from fastapi import APIRouter

from app.repositories.decades import get_decades

router = APIRouter()


@router.get("", response_model=list[int])
async def list_decades():
    return get_decades()

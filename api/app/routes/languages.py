from fastapi import APIRouter

from app.repositories.languages import get_languages

router = APIRouter()


@router.get("", response_model=list[str])
async def list_languages():
    return await get_languages()

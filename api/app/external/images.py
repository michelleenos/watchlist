import os
from io import BytesIO

import httpx
from PIL import Image

from app.config import settings
from app.exceptions import ImageError
from app.utils import to_filename


async def download_poster(name: str, tmdb_poster_path: str, *, replace: bool = False):
    filename = to_filename(name)

    tmdb_url = f"https://image.tmdb.org/t/p/w500/{tmdb_poster_path}"
    local_path = f"{settings.images_dir}/{filename}.webp"
    frontend_path = f"/images/{filename}.webp"

    if os.path.exists(local_path) and not replace:
        return frontend_path

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(tmdb_url)
            response.raise_for_status()
    except httpx.HTTPError as e:
        raise ImageError(f"poster download failed for {name}: {e}") from e

    try:
        img = Image.open(BytesIO(response.content))
        img.thumbnail((500, 750))
        img.save(local_path, "WEBP", quality=70)
    except (OSError, ValueError) as e:
        raise ImageError(f"poster resize failed for {name!r}: {e}") from e

    return frontend_path

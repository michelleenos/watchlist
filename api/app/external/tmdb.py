import httpx
from pydantic import TypeAdapter

from app.config import settings
from app.exceptions import TMDBError
from app.models import TMDBMovieDetails, TMDBSearchResult

TMDB_BASE = "https://api.themoviedb.org/3"

tmdb_headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.tmdb_api_key}",
}


async def tmdb_search(name: str) -> list[TMDBSearchResult]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{TMDB_BASE}/search/movie",
                headers=tmdb_headers,
                params={"query": name},
            )
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        raise TMDBError(
            f"TMDB search for {name!r} returnd {e.response.status_code}",
            status_code=e.response.status_code,
        ) from e
    except httpx.HTTPError as e:
        raise TMDBError(f"TMDB search for {name!r} failed: {e}") from e
    return TypeAdapter(list[TMDBSearchResult]).validate_python(data["results"])


async def get_tmdb_data(tmdb_id: int) -> TMDBMovieDetails:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{TMDB_BASE}/movie/{tmdb_id}",
                headers=tmdb_headers,
                params={"append_to_response": "credits"},
            )
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        raise TMDBError(
            f"TMDB movie {tmdb_id} returned {e.response.status_code}",
            status_code=e.response.status_code,
        ) from e
    except httpx.HTTPError as e:
        raise TMDBError(f"TMDB movie {tmdb_id} failed: {e}") from e
    return TMDBMovieDetails.model_validate(data)

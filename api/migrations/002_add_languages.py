import asyncio

import httpx

from app.config import settings
from app.db import pool

TMDB_BASE = "https://api.themoviedb.org/3"

tmdb_headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.tmdb_api_key}",
}


async def get_languages():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_BASE}/configuration/languages",
            headers=tmdb_headers,
        )

        data = response.json()
    return data


async def main():
    languages = await get_languages()
    # print(languages)
    await pool.open()
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.executemany(
                """
                INSERT INTO languages(code, english_name)
                VALUES(%s, %s);
                """,
                [(lan["iso_639_1"], lan["english_name"]) for lan in languages],
            )


if __name__ == "__main__":
    asyncio.run(main())

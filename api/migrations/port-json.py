import asyncio
import json

import aiofiles
from psycopg.types.json import Jsonb
from pydantic import TypeAdapter

from app.config import settings
from app.db import pool
from app.models import MovieFullJson

movies_adapter = TypeAdapter(list[MovieFullJson])


async def load_movies_json():
    async with aiofiles.open(settings.movies_path) as f:
        contents = await f.read()

    contents = json.loads(contents)
    return movies_adapter.validate_python(contents)


async def main():
    movies = await load_movies_json()
    movies_data = []
    for m in movies:
        d = m.model_dump()
        d["cast_members"] = Jsonb(d["cast"])
        movies_data.append(d)

    await pool.open()
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.executemany(
                """
                INSERT INTO movies(name, year, language, tagline, genres, description, original_title, tmdb_id, issues, poster_path, tmdb_poster_path, cast_members)
                VALUES(%(name)s, %(year)s, %(language)s, %(tagline)s, %(genres)s, %(description)s, %(original_title)s, %(tmdb_id)s, %(issues)s, %(poster_path)s, %(tmdb_poster_path)s, %(cast_members)s)
                ON CONFLICT DO NOTHING;
                """,
                movies_data,
            )


if __name__ == "__main__":
    asyncio.run(main())

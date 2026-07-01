"""Backfill people/movie_people for existing movies.

Run manually after 005_add_people_tables.sql is applied:

    uv run python migrations/005_backfill_people.py

For every movie with a tmdb_id, re-fetch its TMDB credits and normalize cast +
curated crew into people/movie_people. Idempotent (ON CONFLICT DO NOTHING), so
it is safe to re-run. Each movie is its own connection/transaction, so one bad
fetch doesn't roll back the rest.
"""

import asyncio

from app.db import pool
from app.external.tmdb import get_tmdb_data
from app.repositories.movies import insert_movie_people
from app.services.add_movie import tmdb_people_transform


async def main():
    await pool.open()

    async with pool.connection() as conn, conn.cursor() as cur:
        await cur.execute(
            "SELECT id, tmdb_id, name FROM movies WHERE tmdb_id IS NOT NULL ORDER BY id"
        )
        movies = await cur.fetchall()

    ok = 0
    for movie_id, tmdb_id, name in movies:
        try:
            data = await get_tmdb_data(tmdb_id)
            people = tmdb_people_transform(data)
            async with pool.connection() as conn, conn.cursor() as cur:
                await insert_movie_people(cur, movie_id, people)
            ok += 1
            print(f"ok  {movie_id:>4}  {name}  ({len(people)} people)")
        except Exception as e:
            print(f"ERR {movie_id:>4}  {name}: {e}")

    print(f"\ndone: {ok}/{len(movies)} movies backfilled")
    await pool.close()


if __name__ == "__main__":
    asyncio.run(main())

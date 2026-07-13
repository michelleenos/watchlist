import asyncio

from app.db import pool
from app.external.images import download_poster

# this script is just used once for migration to railway - redownload posters and store them in the railway volume


async def main():
    await pool.open()

    async with pool.connection() as conn, conn.cursor() as cur:
        await cur.execute(
            "SELECT name, tmdb_poster_path FROM movies WHERE tmdb_poster_path IS NOT NULL"
        )
        rows = await cur.fetchall()
        ok = 0
        fail = 0
        for name, tmdb_poster_path in rows:
            try:
                frontend_path = await download_poster(name, tmdb_poster_path)
                print(f"Downloaded {frontend_path}")
                ok += 1
            except Exception as e:
                print(f"Download Failed: {name} - {e}")
                fail += 1

    await pool.close()
    print(f"ok: {ok}, fail: {fail}")


asyncio.run(main())

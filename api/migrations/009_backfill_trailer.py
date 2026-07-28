import asyncio

from app.db import pool
from app.external.tmdb import get_tmdb_data
from app.services.add_movie import tmdb_trailer_transform


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
            trailer_key = tmdb_trailer_transform(data)
            if trailer_key is not None:
                async with pool.connection() as conn, conn.cursor() as cur:
                    await cur.execute(
                        "UPDATE movies SET trailer_key = %s WHERE id = %s",
                        [trailer_key, movie_id],
                    )
                    print(f"{movie_id:>4}  ✅ updated ({name})")
                    ok += 1
            else:
                print(f"{movie_id:>4} 🟡 no trailer found ({name})")
        except Exception as e:
            print(f"🔴 ERR {movie_id:>4} ({name}): {e}")

    print(f"\n✨ done: {ok}/{len(movies)} movies updated")
    await pool.close()


if __name__ == "__main__":
    asyncio.run(main())

from app.db import pool


async def get_genres() -> list[str]:
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT DISTINCT unnest(genres) AS genre FROM movies ORDER BY genre;"
            )
            rows = await cur.fetchall()
    return [r[0] for r in rows]

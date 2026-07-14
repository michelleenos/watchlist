from app.db import cursor


async def get_decades() -> list[int]:
    async with cursor() as cur:
        await cur.execute(
            """
            SELECT
                DISTINCT year - year % 10 AS decade
            FROM movies
            ORDER BY decade;
            """
        )
        rows = await cur.fetchall()
    return [r[0] for r in rows if r[0] is not None]

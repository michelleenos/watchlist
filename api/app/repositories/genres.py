from app.db import cursor


async def get_genres() -> list[str]:
    async with cursor() as cur:
        await cur.execute(
            """
            SELECT DISTINCT g.name
            FROM genres g JOIN movie_genres mg ON mg.genre_id = g.id
            ORDER BY g.name;
            """
        )
        rows = await cur.fetchall()
    return [r[0] for r in rows]

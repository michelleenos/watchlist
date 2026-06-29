from app.db import pool


async def get_languages() -> list[str]:
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT DISTINCT language FROM movies;")
            rows = await cur.fetchall()
    languages: list[str] = [r[0] for r in rows if r[0]]
    return languages

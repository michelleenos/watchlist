from app.db import cursor


async def get_languages() -> list[str]:
    async with cursor() as cur:
        await cur.execute("""
			SELECT DISTINCT english_name
			FROM languages JOIN movies ON movies.language = languages.code;
		""")
        rows = await cur.fetchall()
    languages: list[str] = [r[0] for r in rows if r[0]]
    return languages

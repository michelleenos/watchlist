from app.repositories.movies import load_movies


async def get_languages() -> list[str]:
    movies = await load_movies()
    languages = {m.language for m in movies if m.language}
    return sorted(languages)

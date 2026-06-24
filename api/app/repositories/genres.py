from app.repositories.movies import load_movies


async def get_genres() -> list[str]:
    movies = await load_movies()
    genres = {g.lower() for m in movies if m.genres for g in m.genres}
    return sorted(genres)

from app.repositories.movies import load_movies


async def get_decades() -> list[int]:
    movies = await load_movies()
    decades = {m.year - m.year % 10 for m in movies if m.year}
    return sorted(decades)

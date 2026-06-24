from app.repositories.movies import load_movies


def get_genres() -> list[str]:
    movies = load_movies()
    genres = {g.lower() for m in movies if m.genres for g in m.genres}
    return sorted(genres)

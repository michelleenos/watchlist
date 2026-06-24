from app.repositories.movies import load_movies


def get_languages() -> list[str]:
    movies = load_movies()
    languages = {m.language for m in movies if m.language}
    return sorted(languages)

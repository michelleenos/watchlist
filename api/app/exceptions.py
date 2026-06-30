class TMDBError(Exception):
    def __init__(self, message: str, *, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class DuplicateMovieError(Exception):
    def __init__(self, tmdb_id: int):
        super().__init__(f"Movie with tmdb_id {tmdb_id} already exists")


class ImageError(Exception):
    pass

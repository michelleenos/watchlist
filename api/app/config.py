from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    tmdb_api_key: str
    log_level: str = "INFO"
    movies_path: str = "data/movies.json"
    images_dir: str = "public/images"
    database_url: str
    session_secret: str
    auth_users: str
    cookie_https_only: bool = True


settings = Settings()  # pyright: ignore[reportCallIssue]

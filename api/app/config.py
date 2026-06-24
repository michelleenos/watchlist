from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    tmdb_api_key: str
    movies_path: str = "../server/data/movies.json"
    images_dir: str = "../server/public/images"


settings = Settings()  # pyright: ignore[reportCallIssue]

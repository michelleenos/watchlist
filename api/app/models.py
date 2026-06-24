from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class MovieMember(BaseModel):
    name: str
    role: str


class MovieFull(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        extra="allow",
    )

    name: str
    year: int | None = None
    language: str | None = None
    crew: list[MovieMember] | None = None
    cast: list[MovieMember] | None = None
    tmdb_popularity: float | None = None
    tmdb_vote_average: float | None = None
    tmdb_vote_count: float | None = None
    tagline: str | None = None
    genres: list[str] | None = None
    description: str | None = None
    original_title: str | None = None
    tmdb_id: int | None = None
    errors: list[str] = []
    poster_path: str | None = None
    id: str

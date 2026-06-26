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
    # crew: list[MovieMember] | None = None
    cast: list[MovieMember] | None = None
    # tmdb_popularity: float | None = None
    # tmdb_vote_average: float | None = None
    # tmdb_vote_count: float | None = None
    tagline: str | None = None
    genres: list[str] | None = None
    description: str | None = None
    original_title: str | None = None
    tmdb_id: int | None = None
    errors: list[str] = []
    poster_path: str | None = None
    tmdb_poster_path: str | None = None
    id: str


class TMDBGenre(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: int
    name: str


class TMDBCreditCast(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int
    name: str
    profile_path: str | None = None
    cast_id: int
    character: str
    credit_id: str
    gender: int  # 1 seems to be female, 2 is male


class TMDBCreditCrew(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int
    gender: int
    name: str
    profile_path: str | None = None
    credit_id: str
    department: str
    job: str


class TMDBCredit(BaseModel):
    cast: list[TMDBCreditCast]
    crew: list[TMDBCreditCrew]


class TMDBMovieDetails(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: int
    title: str
    original_title: str | None = None
    release_date: str | None = None
    original_language: str | None = None
    poster_path: str | None = None
    tagline: str | None = None
    overview: str | None = None
    genres: list[TMDBGenre] = []
    popularity: float | None = None
    vote_average: float | None = None
    vote_count: int | None = None
    credits: TMDBCredit


class TMDBSearchResult(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, validate_by_name=True, extra="allow"
    )

    id: int
    title: str
    overview: str
    release_date: str | None = None
    original_language: str | None = None
    poster_path: str | None = None

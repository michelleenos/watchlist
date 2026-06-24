# Backend Migration Plan — Pass 1 (Fastify/TS → FastAPI/Python)

Port the existing Node backend (`server/`) to Python/FastAPI in a new `api/` folder,
**keeping JSON storage** for now. Goal: behavioral parity with the Node server so
responses can be diffed. Postgres comes later (Pass 2), in this same `api/` folder.

## Decisions

- **Location:** new `api/` folder, sibling of `client/` and `server/`. This is the
  permanent home for the Python backend — Pass 2 (Postgres + psycopg3, migrations,
  schema) lands here too. Only `api/repositories/` internals change between passes.
- **JSON I/O:** Python repo reads/writes the existing `server/data/movies.json` and
  `server/public/images/` (relative path via config). No data copy. Throwaway code,
  deleted in Pass 2.
- **Port:** stay on `3000`, no `/api` prefix — Vite's dev proxy strips `/api`, so the
  client + Vite config need zero changes.
- **Repo methods are `async` from the start** (per handoff) so swapping in psycopg3's
  async API later doesn't change call signatures.

## Endpoints to port

| Endpoint                                  | Handler chain                                                     |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `GET /movies`                             | repo `getMovies`                                                  |
| `POST /movies` `{tmdbId}`                 | service `addMovieFromTmdb` → TMDB fetch + image + repo `addMovie` |
| `GET /movies/:id`                         | repo `getMovie` (404 if missing)                                  |
| `DELETE /movies/:id`                      | repo `deleteMovie` (404 `{error}` / `{success:true}`)             |
| `GET /tmdb/search?name=`                  | `tmdbSearch`                                                      |
| `GET /genres` / `/decades` / `/languages` | derived distinct scans over movies.json                           |
| static `/images/*`, `/`                   | `@fastify/static` over `./public`                                 |

## Dependency / concept mapping

| Node                  | Python                                                      |
| --------------------- | ----------------------------------------------------------- |
| Fastify               | FastAPI + uvicorn                                           |
| TypeBox `Static`      | Pydantic v2                                                 |
| `tmdb-ts`             | httpx calling TMDB REST directly (search, details, credits) |
| `axios` (image dl)    | httpx                                                       |
| `sharp` (resize→webp) | Pillow                                                      |
| `nanoid`              | nanoid (PyPI) or `secrets.token_urlsafe`                    |
| `@fastify/static`     | Starlette `StaticFiles` (bundled)                           |
| `dotenv`              | pydantic-settings                                           |
| `fs/promises` JSON    | aiofiles + json                                             |

## Target structure

```
api/
  pyproject.toml          # uv-managed
  uv.lock
  .env                    # TMDB_API_KEY (copy from server/)
  app/
    main.py               # FastAPI app, route includes, static mount, :3000
    config.py             # pydantic-settings
    models.py             # Pydantic (movie-type.ts port)
    utils.py              # toFilename slug
    routes/               # movies, tmdb, genres, decades, languages
    services/             # add_movie
    repositories/         # movies (JSON now → psycopg3 in Pass 2), genres, decades, languages
    external/             # tmdb, images
```

## Setup

```
brew install uv

cd /Users/michelleenos/dev/movies
uv init api --no-workspace
cd api
uv add fastapi "uvicorn[standard]" httpx pillow pydantic-settings aiofiles nanoid
# copy server/.env -> api/.env  (TMDB_API_KEY)
uv run uvicorn app.main:app --reload --port 3000
```

## Build order (one thing at a time, diffable against Node)

Run Node on 3000, Python on 3001 while comparing; flip Python to 3000 when done.
`curl -s localhost:3000/genres | jq` vs `localhost:3001/...`.

1. **`app/main.py` hello-world** — bare FastAPI on the port, confirm it boots.

2. **`app/config.py`** — pydantic-settings: `TMDB_API_KEY`, `MOVIES_PATH`/`IMAGES_DIR`
   pointing at `../server/data/movies.json` and `../server/public/images`.

3. **`app/models.py`** — port `movie-type.ts`: `MovieTMDB`, `MovieFull`,
   `TMDBSearchResult`. Use `Field(alias=...)` + `populate_by_name` so JSON camelCase
   (`tmdbId`, `posterPath`) round-trips while writing Python snake_case. Keep
   `errors: list[str]`.

4. **`repositories/movies.py`** — `async` `get_movies`, `get_movie(id)`, `add_movie`,
   `delete_movie` via aiofiles. **Skip backup + re-sort-on-write** (throwaway). Keep
   add's alphabetical sort for list parity if desired.

5. **`routes/movies.py`** — `GET /movies`, `GET /movies/{id}` (404),
   `DELETE /movies/{id}` (`{error}` 404 / `{success: true}`). No prefix.

6. **`repositories/{genres,decades,languages}.py` + routes** — distinct/derived scans.

7. **`external/tmdb.py`** — `httpx.AsyncClient` → `/search/movie`, `/movie/{id}`,
   `/movie/{id}/credits`. Port cast(5)/crew(10) slicing + field mapping.
   Functions: `tmdb_search`, `get_tmdb_data`.

8. **`routes/tmdb.py`** — `GET /tmdb/search?name=`.

9. **`external/images.py`** — httpx download → Pillow resize (width 400, no enlarge)
   → `.save(webp, quality=70)`. Port `toFilename` slug to `utils.py`. Return path or
   error, same shape.
10. **`services/add_movie.py` + `POST /movies`** — `get_tmdb_data` → nanoid id → image
    → `add_movie`. Push image/poster errors into `errors[]` like Node.
11. **Static mount** — `app.mount("/images", StaticFiles(directory=settings.images_dir))`.

## Parity check & cutover

- Diff every endpoint's JSON (Node vs Python) for the same requests.
- Watch for: camelCase aliases, optional-field omission, 404 body shapes.

## Gotchas

- **`exclude_none`:** TS omits `undefined` keys; Pydantic includes `None` by default.
  Use `model_dump(by_alias=True, exclude_none=True)` (or `response_model_exclude_none`)
  to match Node output.
- **No ORM / no psycopg yet** — Pass 1 is JSON-only. DB is Pass 2 in this same folder.

---

⏺ 1. Scaffold

brew install uv
cd /Users/michelleenos/dev/movies
uv init api
cd api
uv add fastapi "uvicorn[standard]" httpx pillow pydantic-settings aiofiles nanoid

uv init drops a main.py and a hello() in the root — delete those, you'll use an app/ package.

2. Layout

```
  api/
    pyproject.toml
    .env                 # TMDB_API_KEY=...
    app/
      __init__.py
      main.py
      config.py
      models.py
      routes/
        __init__.py
        movies.py
```

Every folder that's a package needs an **init**.py (can be empty).

3. Config — app/config.py

```python
  from pydantic_settings import BaseSettings, SettingsConfigDict

  class Settings(BaseSettings):
      model_config = SettingsConfigDict(env_file=".env")

      tmdb_api_key: str
      movies_path: str = "../server/data/movies.json"
      images_dir: str = "../server/public/images"

  settings = Settings()
```

4. App entry — app/main.py

```python
  from fastapi import FastAPI
  from app.routes import movies
  class Settings(BaseSettings):
      model_config = SettingsConfigDict(env_file=".env")

      tmdb_api_key: str
      movies_path: str = "../server/data/movies.json"
      images_dir: str = "../server/public/images"

  settings = Settings()
```

4. App entry — app/main.py

```python
  from fastapi import FastAPI
  from app.routes import movies

  app = FastAPI()
  app.include_router(movies.router, prefix="/movies", tags=["movies"])

  @app.get("/health")
  async def health():
      return {"ok": True}
```

5. A model — app/models.py

```python
  from pydantic import BaseModel, ConfigDict, Field

  class MovieFull(BaseModel):
      model_config = ConfigDict(populate_by_name=True)  # accept snake_case OR alias

      id: str
      name: str
      year: int | None = None
      tmdb_id: int | None = Field(default=None, alias="tmdbId")
      poster_path: str | None = Field(default=None, alias="posterPath")
      genres: list[str] | None = None
      errors: list[str] = []
```

6. A router — app/routes/movies.py

```python
  from fastapi import APIRouter, HTTPException
  from app.models import MovieFull

  router = APIRouter()

  @router.get("", response_model=list[MovieFull], response_model_exclude_none=True)
  async def list_movies():
      return await get_movies()          # your repo fn

  @router.get("/{movie_id}", response_model=MovieFull, response_model_exclude_none=True)
  async def get_one(movie_id: str):
      movie = await get_movie(movie_id)
      if not movie:
          raise HTTPException(status_code=404)
      return movie
```

- Path/query params: just type the function args (movie_id: str, name: str) — FastAPI parses + validates.
- Body: type the arg as a Pydantic model — async def add(body: AddMovieBody).
- response_model_exclude_none=True matches Node's "drop undefined keys" output.

7. Run

uv run uvicorn app.main:app --reload --port 3001

Hit localhost:3001/health, then /docs for the auto-generated Swagger UI (free with FastAPI — use it to eyeball your routes).

That's the skeleton — from here it's filling in repos/services/external per the build order in migrate-plan.md.

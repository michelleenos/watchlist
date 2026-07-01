# Backend reference (data layer)

Deep detail for the FastAPI/Postgres backend. **Read when working on the data layer, migrations, or credits — not needed every session.** High-level structure is in `AGENTS.md`; current work + decisions are in `.agents/handoff.md`.

## Connection pool & cursors

- Module-level `AsyncConnectionPool` in `app/db.py`, opened/closed in the FastAPI `lifespan`.
- **Always go through an explicit cursor** — `row_factory` is set _per cursor_: `dict_row` for movie reads (validate into Pydantic by column name), plain tuples for flat-list repos (`return [r[0] for r in rows]`, skip validation). `conn.execute()` only uses the connection default, so there's no per-call place to pass `row_factory`.
- **Standalone scripts** (importer, backfills) must `await pool.open()` before `pool.connection()` — the lifespan doesn't run for them; close with `await pool.close()`.
- The `async with pool.connection() … / conn.cursor(…) …` pair is repeated in every repo function — candidate refactor (see handoff Next steps).

## Migrations

- Manual numbered SQL in `api/migrations/*.sql` + a `migrate.py` runner; applied files tracked in `schema_migrations` (by filename **stem**). Un-applied files run in filename order. Not auto-run on container start.
- Run: `uv run migrate` (bare-metal) or `docker compose exec api python -m migrations.migrate`.
- Some steps need a **Python companion** for data seeding/backfill that requires TMDB, run manually — e.g. `002_add_languages.py`, `005_backfill_people.py`. Naming: `NNN_*.py`, run **directly** (`docker compose exec api python migrations/NNN_*.py`), _not_ via `-m` (a leading digit isn't an importable module name).

## Models (`app/models.py`)

- `MovieBase` (all fields, **no `id`**) → `MovieFull(MovieBase)` (adds `id: int`). The Pydantic equivalent of `Omit<MovieFull,'id'>` — build up, don't subtract.
- `extra="allow"` keeps undeclared keys through validate+dump. ⚠️ Side effect: a mistyped kwarg to `MovieFull(...)` is silently absorbed as an extra field, not an error.
- `MovieFullJson` — one-off JSON-import model (`id: str`). `MoviePerson` — a cast/crew row bound for `people`/`movie_people`.
- Named SQL params (`%(name)s`) everywhere so column order can't silently misalign.
- `alias_generator=to_camel` + `validate_by_name/alias` round-trips snake_case (Python) ↔ camelCase (JSON); routes use `response_model_exclude_none=True`.

## `add_movie` flow (`services/add_movie.py` → `repositories/movies.py`)

- `POST /movies`: TMDB fetch → `tmdb_movie_transform` (→ `MovieBase`) + `tmdb_people_transform` (→ `list[MoviePerson]`) → `download_poster` (httpx + Pillow resize 400w→webp, skip-if-exists; **failure is non-fatal** — caught, appended to `issues`, saved anyway) → `add_movie`.
- `add_movie` INSERTs the movie (`RETURNING id`), then dual-writes the genres join **and** calls `insert_movie_people` — all one transaction. Returns `MovieFull` via `model_construct` (no re-validation; we already have the typed `MovieBase`).
- `issues` (renamed from `errors`) holds non-fatal problems like a failed poster.
- **Route gotcha:** collection routes use `""` (`@router.get("")`+`@router.post("")` → `/movies`) so GET/POST share one path; a mismatched `"/"` → 405.

## Error handling (global handlers in `main.py`; routes have no try/except)

- **409** `DuplicateMovieError`: `add_movie` catches psycopg `UniqueViolation`, narrows on `constraint_name == "movies_tmdb_id_key"`, re-raises others. (Fires only after the wasted TMDB fetch + poster download — accepted; dups are rare.)
- **404**: `GET /movies/{id}` when `get_movie` returns `None` (⚠️ guard `None` before `model_validate`). Documented via `responses={404: ...}` (manual `HTTPException`s aren't auto-added to the schema).
- **503**: `@app.exception_handler(psycopg.OperationalError)`; plus a catch-all `Exception` → 500 `{detail, path}` (no `str(exc)` leak; uvicorn still logs the traceback). Precedence is by type specificity, not order. Test 503 via `docker compose stop db` while the api runs.
- **TMDBError** (kw `status_code`): global handler maps 404→404 else→502.

## Poster images

- Store only the **filename** in the DB. Files live at `api/public/images/` (gitignored), served by FastAPI `StaticFiles` at `/images`; dev Vite proxies `/images` → the api. Prod → object storage (R2), set `VITE_POSTER_BASE_URL` to the CDN base.

---

## Normalized tables

Movies, genres, languages, and people/credits are all normalized in Postgres.

### languages

- `languages(code TEXT PK, english_name TEXT)` + FK `movies.language → languages(code)`. Seeded from TMDB `GET /configuration/languages` via `002_add_languages.py`.
- Movie reads use **`LEFT JOIN languages`** (INNER dropped the one `NULL`-language movie and 404'd its detail). The languages repo queries the table directly.

### genres

- `genres(id PK, name UNIQUE)` + `movie_genres(movie_id → movies ON DELETE CASCADE, genre_id)`. Keyed by name, **no TMDB seed** (populated from `unnest(movies.genres)`, join backfilled by name).
- Reads use a correlated `ARRAY(…) AS genres` subquery. `add_movie` **dual-writes** the join alongside the still-present `genres TEXT[]` column (`unnest(%(genres)s::text[])` cast needed). ⚠️ `TEXT[]` column drop is pending (handoff Next steps).

### people / credits (`005_add_people_tables.sql`)

- `people(id PK, tmdb_id UNIQUE, name)` + `movie_people(movie_id → movies ON DELETE CASCADE, person_id → people, role, character_name, billing_order, PK (movie_id, person_id, role))` + `movie_people_person_idx` on `person_id` (for future "filter by person").
- **`role`** is coarse: `cast` | `director` | `writer` | `source`. Cast rows carry `character_name` + `billing_order`; crew rows leave them NULL. **`character_name`, not `character`** — `CHARACTER` is a reserved word (same trap as `cast`).
- **Extraction** (`tmdb_people_transform`): TMDB `job` → `role` via allowlists — `WRITER_JOBS = {Screenplay, Writer, Story, Original Story}`, `SOURCE_JOBS = {Novel, Book, Short Story, Characters, Comic Book, Graphic Novel, Adaptation}`, `DIRECTOR_JOBS = {Director}`; everything else **skipped** (drops `Story Artist` etc. — the Writing _department_ is polluted with storyboard crafts, so we select by `job`, never `department`). Cast = top 5 by `order`. **Deduped on `(tmdb_id, role)`** — collapses TMDB's Screenplay/Story credit splits into one row while keeping genuine multi-role people (director *and* writer) as separate rows. Composer intentionally not captured yet.
- **Write path** (`insert_movie_people(cur, movie_id, people)`): upsert people `ON CONFLICT (tmdb_id) DO UPDATE SET name = EXCLUDED.name` (so `RETURNING id` fires even on conflict — `DO NOTHING` returns no row) then INSERT `movie_people` `ON CONFLICT DO NOTHING`. Takes a caller cursor so it shares `add_movie`'s transaction and is reused by the backfill.
- **Reads** (`get_movie`): `cast_members` = `json_agg` of `{name, role: character_name}` ordered by `billing_order`; `directors`/`writers`/`source_authors` = `ARRAY(…)` subqueries. `get_movies` (list) stays cast-free. ⚠️ crew arrays come back `[]` when empty (not omitted; matches genres); `cast_members` is `null`/omitted when empty (`json_agg` → NULL).
- **`cast_members JSONB` on `movies` is superseded** — reads come from the join; the blob is only dual-written as a safety net. Drop is pending (handoff Next steps).
- **Backfill**: `005_backfill_people.py` — re-fetches each movie's credits, one connection/transaction per movie so one bad fetch doesn't roll back the rest. Idempotent.

# Project Handoff

A movie tracking/display app. Frontend is Vue. The backend has been rewritten in Python (FastAPI) — **Pass 1 is complete**; the FastAPI server (`api/`) is now the active dev backend (Vite proxies to it). The old Fastify/TS server (`server/`) has been removed. **Pass 2 (Postgres) is in progress** — repositories now read/write Postgres, not JSON. Everything is on `main` and working. Stable structure (repo layout, backend overview, frontend components, the `gen:types` convention) lives in `AGENTS.md`.

---

## Frozen Decisions

Settled — don't relitigate. (The library/tooling choices themselves now live in `AGENTS.md`; this section keeps the *why*, so we don't re-propose rejected alternatives.)

- **Backend = FastAPI + Pydantic, tooling = uv** (replaced Fastify/TypeBox). Rationale: Python practice + do the DB migration once, in Python.
- **Database:** migrate JSON → **PostgreSQL**, driver **psycopg3** (`psycopg[binary]`), raw SQL, **no ORM** (deliberate).
- **Poster images:** store only the filename in the DB. Files live at `api/public/images/` (gitignored), served by FastAPI `StaticFiles` at `/images`; dev Vite proxies `/images` → `http://localhost:3000`. Prod → object storage (R2), set `VITE_POSTER_BASE_URL` to the CDN base. *(Still a bit in flux — kept here rather than AGENTS.md for now.)*

---

## Backend rewrite — status

**Pass 1 (port to FastAPI, keep JSON storage) — COMPLETE.** All endpoints implemented + verified, frontend talks to it. (App layout, route list, and the `MovieFull` schema-source-of-truth basics are in `AGENTS.md`.) Non-obvious facts worth keeping:

- **`MovieFull` carries both `tmdb_poster_path`** (raw) **and `poster_path`** (local `/images/...`).
- **`extra="allow"` on `MovieFull`** keeps undeclared JSON keys through validation+dump (non-destructive rewrites). ⚠️ Side effect: a mistyped kwarg to `MovieFull(...)` is silently absorbed as an extra field, not an error.
- **`POST /movies`** (`services/add_movie.py`): TMDB fetch → map → `download_poster` (httpx + Pillow resize 400w→webp, skip-if-exists, `ImageError`) → `repo.add_movie`. **Poster failure is non-fatal** — caught, appended to the movie's `errors`, saved anyway. Poster is downloaded server-side *before* POST returns, so the response already has `poster_path`.
- **Repo writes** consolidated in `repositories/movies.py` (`save_movies` helper, `indent=4`). Reads are `async` (`aiofiles`); writes still sync (fine for throwaway JSON, becomes psycopg3 async in Pass 2).
- **TMDB client** (`external/tmdb.py`): per-call `httpx.AsyncClient`, Bearer auth, `append_to_response=credits` (now parsed → `cast` populated, top-5). Errors → `TMDBError` (kw `status_code`), global handler maps 404→404 else→502; routes have no try/except.
- **`movies.json` is gitignored/untracked** (throwaway, replaced by Postgres; recoverable from git history). Lives at `api/data/movies.json`, `config.py` paths are relative to `api/` (run the server from `api/`).
- **Gotcha:** collection routes use `""` (`@router.get("")`+`@router.post("")` → `/movies`) so GET/POST share one path; a mismatched `"/"` → 405.

**Pass 2 (swap storage to Postgres) — IN PROGRESS (movies-only slice ~done).** All repositories now hit Postgres via the connection pool. See "Database setup" below for what landed today; the people-table slice is still future work.

---

## Migration finalization (retiring the TS server) — DONE

The TS server is gone and dev runs on Docker Compose. What's worth keeping:

- **Docker Compose** (`docker-compose.yml` at repo root): `client` (Vite, `:5173`) + `api` (FastAPI, `:3000`), each from its own `Dockerfile.dev`, plus `db` (Pass 2). Live reload via bind mounts; `docker compose up --build` runs them.
    - **Proxy is env-driven:** `client/vite.config.ts` reads `API_PROXY_TARGET` (default `http://localhost:3000` bare-metal; compose sets `http://api:3000` — service name = hostname on the compose network).
    - **Bind-mount masking** (recurring trap): `- ./api:/app` / `- ./client:/app` shadow image-built deps — fixed with anonymous volumes `- /app/.venv` (api) and `- /app/node_modules` (client). Bind-mounting `./api` also persists `public/images` + `data/movies.json` to the host.
- **Standalone `client/` pnpm project** (root pnpm workspace removed). `client/pnpm-workspace.yaml` holds `allowBuilds` (native deps: `esbuild`, `@tailwindcss/oxide`, `@parcel/watcher`); pnpm pinned to `11.9.0` (`allowBuilds` needs ≥10.26).
- **Client type imports must be top-level `import type { … }`**, not inline `import { type … }` — esbuild fully erases the former; the latter leaves a side-effect import that fails to resolve in-container.
- **Types generated from the API schema** via `openapi-typescript`: `client/src/types/api.d.ts` (generated) → `client/src/types/index.ts` re-exports clean names (`MovieFull`, `MovieMember`, `TMDBSearchResult`). **Gotcha:** Pydantic `str | None` generates as `string | null` (not optional/undefined) — watch for null-vs-undefined mismatches.

---

## Database setup (Pass 2)

**Done (movies-only slice):**

- **Postgres in Compose:** `db` service (postgres image, healthcheck, `pgdata` volume). `api` reads `database_url` via `pydantic-settings` (`config.py`); host is `db` in compose (not `localhost`).
- **Connection pool** (basics in `AGENTS.md`). ⚠️ Standalone scripts (e.g. the importer) must `await pool.open()` themselves *before* `pool.connection()` — the lifespan doesn't run for them. **Always go through an explicit cursor** — not for blocking reasons (`await conn.execute()` is genuinely async here), but because `row_factory` is set *per cursor*: movie reads need `dict_row` (validate into Pydantic by column name), flat-list repos want plain tuples. `conn.execute()` only uses the connection's default factory, so there's no per-call place to pass `row_factory`.
- **Migrations — manual numbered SQL** (decided; *not* yoyo/dbmate). Runner + run command in `AGENTS.md`. The `schema_migrations` table records applied files; un-applied files run in filename order.
- **`001_init.sql` (movies table) — non-obvious decisions** (column types are in the schema):
    - `tmdb_id INT UNIQUE` guards against duplicate adds (frontend check is just UX). ⚠️ Once existed *without* the UNIQUE constraint, which let dup imports through.
    - **`cast_members JSONB` is temporary** — replaced by the `people`/`movie_people` tables later. (Renamed from `cast` — reserved word — model field too.)
    - `errors` was renamed to **`issues`** (column + Pydantic field + source JSON) — watch for stale `errors` refs.
- **Models split:** `MovieBase` (all fields, **no `id`**) + `MovieFull(MovieBase)` (adds required `id: int`) — the Pydantic equivalent of `Omit<MovieFull,'id'>` (build up, don't subtract). `tmdb_movie_transform` returns `MovieBase`; `add_movie` INSERTs and returns a `MovieFull` with the new id (via `RETURNING id`). `MovieFullJson` exists for the one-off import. Named SQL params (`%(name)s`) used so column order can't silently misalign.
- **One-off import:** `migrations/port-json.py` loads `movies.json` (validated through `MovieFullJson`), wraps cast in `Jsonb(...)`, bulk-INSERTs with `ON CONFLICT DO NOTHING`. The `db.py` pool must be opened manually (see above).
- **Repositories migrated:** `movies` (get/add/delete), `genres` (`SELECT DISTINCT unnest(genres)`), `decades` (`year - year % 10`), `languages` (queries `languages` table). Flat-list repos return `[r[0] for r in rows]` from plain (non-`dict_row`) cursors and skip Pydantic validation (trusted own columns); movie reads use `dict_row` + validate into `MovieFull`. ⚠️ `get_movie` must guard `None` before `model_validate` (returns `None` for a missing id → route 404s).
- **Language lookup table — DONE.** `languages(code TEXT PK, english_name TEXT)` + FK `movies.language → languages(code)`. Seeded from TMDB `GET /configuration/languages` via `002_add_languages.py` (run manually between `002` create and `003` FK migration). Movies query JOINs to return english name; languages repo queries the table directly.
- **`uv` packaging:** `[tool.uv] package=true` + `[tool.setuptools]` in `pyproject.toml` so `uv run migrate` entry point works. `*.egg-info/` gitignored.
- **Logging:** `app/logging_config.py` (dictConfig, `settings.log_level`), catch-all handler logs exceptions.
- **Error handling** (mirrors the `TMDBError` pattern, global handlers in `main.py`):
    - **Writes → 409:** `DuplicateMovieError(tmdb_id)`; `add_movie` catches `psycopg.errors.UniqueViolation`, narrows on `constraint_name == "movies_tmdb_id_key"`, re-raises other unique violations. (Fires only after the wasted TMDB fetch + poster download — accepted; dups are rare.)
    - **Reads → 404:** `GET /movies/{id}` returns 404 (`detail="Movie not found"`), documented via `responses={404: ...}` (manual `HTTPException`s aren't auto-added to the schema).
    - **Infra failures → 503:** `@app.exception_handler(psycopg.OperationalError)`, plus a catch-all `Exception` → 500 `{detail, path}` (generic message, no `str(exc)` leak; uvicorn still logs the traceback). Handler precedence is by type specificity, not order. Test 503 via `docker compose stop db` while the api runs (can't boot with db down — `pool.wait()` in lifespan fails fast).

**Still open:**

- **Genres normalization** (planned): move `genres TEXT[]` → a `genres` table + `movie_genres` join table, same shape as the people slice below. Additive; `/genres` becomes a join instead of `unnest(genres)`.
- **People/credits normalization** — the additive slice below, still future. Want to add `director` (+ maybe a couple other crew roles) when it lands.
- **Cleanup — connection boilerplate:** the `async with pool.connection() as conn: / async with conn.cursor(...) as cur:` pair is now repeated across every repo function. Investigate factoring it out (a helper / context manager / small `fetch_all`/`fetch_one`/`execute` wrappers) to cut the repetition.
- Hosting in prod — later.

---

## Crew / credits restructuring (planned)

`director` was dropped (was Letterboxd-scraped) and will be re-sourced from TMDB. The old "first 10 of `credits.crew`" slice is broken (crew is large + unordered, often omits the director).

**Selection (verified live, 2026-06-24):** select by **`job`**, not `department`. `cast` = top ~5 by `order`; `directors` = `job=='Director'` (handles co-directors); maybe `writers` (Writing jobs `Screenplay`/`Writer`/`Story`) + `composer` (`Original Music Composer`); producers skipped (noise).

**Storage — decided: normalize into a `people` table** (discrete rows make "filter by a big name" a clean join). Sequenced as its own additive slice; the movies-only Postgres migration is now **done**, so this is next-ish. Target: `people (id, tmdb_id, name)` + `movie_people (movie_id, person_id, role/job, billing_order)` + a TMDB backfill. Additive — nothing on the `movies` table changes (trivial at ~132 rows). **`tmdb_id` is already on `movies`** (the planned hedge — enables the backfill). Normalizing resolves the old dedup question (one person row, one join row per job).

**Current state:** cast is stored *temporarily* as `cast_members JSONB` on `movies` (the deliberately-rejected-long-term blob, used as a stopgap for the movies-only slice). `director`/crew aren't stored at all yet. When this slice lands, cast moves out of jsonb into `movie_people`. **Still open:** store `writers`/`composer` at all, vs. directors + cast only.

---

## Frontend — todo

- **Toast leave animation** is jittery — try separate enter/leave translations; check `max-height` snapping; test multiple in sequence.
- **Loading state on MoviesIndex** is plain "LOADING" text — want spinner/skeleton. Open question: on `refresh()` (every add/delete) the whole list blanks to loading — decide whether to dim/overlay existing content instead and reserve full-blank for initial mount.
- **Error UI:** `useMovies()` exposes an `error` ref nothing consumes yet — wire it into MoviesIndex (MovieSingle already handles its own).
- **Re-check add UX** against the new backend (poster now returned ready; surface `errors[]` on failed poster).
- Sort by (field TBD); maybe revive display options (`client/src/display-options.ts`, retained but unimported).

---

## Current State (quick map)

- **Repo:** no root pnpm workspace anymore. `client/` is a standalone pnpm project (pnpm 11), `api/` (uv Python) is the active backend. `docker compose up` runs `client` + `api` (api on `:3000`).
- **`client/`:** Vue 3 + Vite + Tailwind. Router: `/` → `MoviesIndex.vue`, child `/movie/:id` → `MovieSingle.vue`. Composables use a module-scope shared-ref pattern (`useToast`, `useMovies`). Component details in `AGENTS.md`.
- **Proxy:** client calls `/api/...`; Vite strips `/api` → proxy target. Target is `API_PROXY_TARGET` env var (default `http://localhost:3000` bare-metal, `http://api:3000` in compose). `/images/*` → same target (no rewrite).
- **Prettier:** `client/` only (`pnpm format`). **ESLint:** client-only.

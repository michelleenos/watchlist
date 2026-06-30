# Project Handoff

A movie tracking/display app. Frontend is Vue. The backend has been rewritten in Python (FastAPI) — **Pass 1 is complete**; the FastAPI server (`api/`) is now the active dev backend (Vite proxies to it). The old Fastify/TS server (`server/`) has been removed. **Pass 2 (Postgres) is in progress** on the **`postgres-experiments`** branch — repositories now read/write Postgres, not JSON. Stable frontend component/page details live in `AGENTS.md`.

---

## Frozen Decisions

Settled — don't relitigate.

- **Backend:** Python + **FastAPI**, models via **Pydantic** (replaced Fastify/TypeBox). Rationale: Python practice + do the DB migration once, in Python.
- **Python tooling:** **uv** (env, deps, `uv.lock`). Backend in `api/` with its own `pyproject.toml`, not in the pnpm workspace.
- **Database:** migrate JSON → **PostgreSQL**, driver **psycopg3** (`psycopg[binary]`), raw SQL, no ORM.
- **Poster images:** store only the filename in the DB. Files live at `api/public/images/` (gitignored), served by FastAPI `StaticFiles` at `/images`; dev Vite proxies `/images` → `http://localhost:3000`. Prod → object storage (R2), set `VITE_POSTER_BASE_URL` to the CDN base.

---

## Backend rewrite — status

**Pass 1 (port to FastAPI, keep JSON storage) — COMPLETE.** All endpoints implemented + verified, frontend talks to it. `api/app/` = `config.py`, `models.py`, `exceptions.py`, `main.py`, `utils.py`, `routes/`, `repositories/`, `external/`, `services/`. Routes: `GET/POST /movies`, `GET/DELETE /movies/{id}`, `GET /tmdb/search`, `GET /genres|decades|languages`, `/health`, `/images` mount. Non-obvious facts worth keeping:

- **`MovieFull` (`models.py`) is the schema source of truth** heading into Pass 2. `alias_generator=to_camel` + `validate_by_name/alias` round-trips snake_case ↔ camelCase JSON; routes use `response_model_exclude_none=True`. Carries both `tmdb_poster_path` (raw) and `poster_path` (local `/images/...`).
- **`extra="allow"` on `MovieFull`** keeps undeclared JSON keys through validation+dump (non-destructive rewrites). ⚠️ Side effect: a mistyped kwarg to `MovieFull(...)` is silently absorbed as an extra field, not an error.
- **`POST /movies`** (`services/add_movie.py`): TMDB fetch → map → `download_poster` (httpx + Pillow resize 400w→webp, skip-if-exists, `ImageError`) → `repo.add_movie`. **Poster failure is non-fatal** — caught, appended to the movie's `errors`, saved anyway. Poster is downloaded server-side *before* POST returns, so the response already has `poster_path`.
- **Repo writes** consolidated in `repositories/movies.py` (`save_movies` helper, `indent=4`). Reads are `async` (`aiofiles`); writes still sync (fine for throwaway JSON, becomes psycopg3 async in Pass 2).
- **TMDB client** (`external/tmdb.py`): per-call `httpx.AsyncClient`, Bearer auth, `append_to_response=credits` (now parsed → `cast` populated, top-5). Errors → `TMDBError` (kw `status_code`), global handler maps 404→404 else→502; routes have no try/except.
- **`movies.json` is gitignored/untracked** (throwaway, replaced by Postgres; recoverable from git history). Lives at `api/data/movies.json`, `config.py` paths are relative to `api/` (run the server from `api/`).
- **Gotcha:** collection routes use `""` (`@router.get("")`+`@router.post("")` → `/movies`) so GET/POST share one path; a mismatched `"/"` → 405.

**Pass 2 (swap storage to Postgres) — IN PROGRESS (movies-only slice ~done).** All repositories now hit Postgres via the connection pool. See "Database setup" below for what landed today; the people-table slice is still future work.

---

## Migration finalization (retiring the TS server)

Full plan: `~/.claude/plans/outline-how-i-should-jolly-nebula.md`. Dev orchestration target: **Docker Compose** (`client` + `api`; `db` in Pass 2).

- **A1 — DONE:** relocated `movies.json` + images into `api/`; backend is self-contained.
- **A2 — DONE:** Docker Compose (`docker-compose.yml` at repo root), `client` + `api`, each built from its own `Dockerfile.dev`. Live reload via bind mounts; `docker compose up --build` runs both. Key details/gotchas learned:
    - **Proxy is env-driven:** `client/vite.config.ts` reads `API_PROXY_TARGET` (default `http://localhost:3000` for bare-metal), compose sets it to `http://api:3000` (service name = hostname on the compose network). `localhost` inside the client container is the client, not api.
    - **Vite dev port = 5173** (changed from 8080); `ports: "5173:5173"`. api on `3000:3000` (unified — was split 3001 bare-metal / 8000 compose).
    - **Bind-mount masking** (the recurring trap): `- ./api:/app` / `- ./client:/app` shadow the image-built deps. Fixed with anonymous volumes `- /app/.venv` (api, venv kept at uv default `/app/.venv`) and `- /app/node_modules` (client). Bind-mounting `./api` also persists `public/images` + `data/movies.json` writes to the host.
    - **Client type imports must be `import type { … }`** (top-level form), not inline `import { type … }`. esbuild fully erases the former; the latter leaves a side-effect `import '…/server/…'` that fails to resolve in the container (no `server/`). Converted the offending files.
    - **pnpm build-script approval:** `client/pnpm-workspace.yaml` `allowBuilds:` lists native-build deps (`esbuild`, `@tailwindcss/oxide`, `@parcel/watcher`). Note `allowBuilds` needs pnpm ≥10.26 — only honored since the v11 pin (see A3). `@parcel/watcher` arrived with the Tailwind 4.1.13→4.3.x bump.
    - **Tailwind bumped to ^4.3** (was 4.1.13) so `mauve` default color exists in-container — lockfile had pinned the old version. Bump both `tailwindcss` + `@tailwindcss/vite`.
    - **Healthcheck** (api `/health` → `client: condition: service_healthy`) was added then commented out — it fixed the startup-race ECONNREFUSED noise but the polling log lines were annoying. `depends_on: [api]` only waits for container start, not app-ready, so the race can recur; revisit if it bothers you. **HMR** may still need Vite `usePolling`.
    - **`client/.pnpm-store/`** appeared (project-local pnpm store fallback) — add to `.gitignore`, it's a cache.
- **A3 — DONE:** root pnpm layer removed entirely (`pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json`, `node_modules`). `client/` is now a standalone pnpm project (its own `pnpm-workspace.yaml` holds `allowBuilds`); `packageManager` + a `format` script moved into `client/package.json`. `server/` files kept on disk until B2 (B1 cut the type imports, so it's now dead weight).
    - **pnpm pinned to `11.9.0`** (was 10.6.3): the `allowBuilds` key only exists in pnpm ≥10.26, so the old pin silently ignored it. v11 also adds a `minimumReleaseAge` cooldown (~24h) — `client/pnpm-workspace.yaml` carries `minimumReleaseAgeExclude: [prettier@3.8.5]` to unblock a same-day prettier release.
    - **Docker:** `client/Dockerfile.dev` has `ENV CI=true` (non-interactive modules purge) and uses corepack, so the container runs the pnpm version from `packageManager` in `package.json`.
- **B1 — DONE:** client→server type cord cut via `openapi-typescript`. `client/src/types/api.d.ts` is generated from the FastAPI schema; `client/src/types/index.ts` re-exports clean names (`MovieFull`, `MovieMember`, `TMDBSearchResult`). All 6 imports repointed `server/src/...` → `../types`. Regen with `pnpm gen:types` (script hits `http://localhost:3000/openapi.json` — run the api first). Added `response_model=list[TMDBSearchResult]` to `GET /tmdb/search`. **Gotcha:** Pydantic `str | None` generates as `string | null` (the old hand-written types used optional `string`/undefined) — widened `MovieTitle`'s `originalTitle` prop to `string | null`; watch for similar null-vs-undefined mismatches.
- **B2 — DONE:** `server/` deleted entirely (+ orphaned `.gitignore` lines removed). The TS server is gone; client builds green against the generated types. → **B3** Postgres into compose (Pass 2).
- ⚠️ **Caveat:** the generated types reflect the *current* movie response shape. The DB pass + crew/credits restructuring will change it — rerun `pnpm gen:types` after, and expect a fresh `api.d.ts` diff.

---

## Database setup (Pass 2)

**Done (movies-only slice):**

- **Postgres in Compose:** `db` service (postgres image, healthcheck, `pgdata` volume). `api` reads `database_url` via `pydantic-settings` (`config.py`); host is `db` in compose (not `localhost`).
- **Connection pool:** `app/db.py` holds a module-level `AsyncConnectionPool(database_url, open=False)`; opened/closed in the FastAPI `lifespan`. ⚠️ Standalone scripts (e.g. the importer) must `await pool.open()` themselves *before* `pool.connection()` — the lifespan doesn't run for them. Repos use `async with pool.connection() as conn` + `async with conn.cursor(...) as cur`; **always go through an explicit cursor** — not for blocking reasons (`await conn.execute()` is genuinely async here), but because `row_factory` is set *per cursor*: movie reads need `dict_row` (validate into Pydantic by column name), flat-list repos want plain tuples. `conn.execute()` only uses the connection's default factory, so there's no per-call place to pass `row_factory`.
- **Migrations — manual numbered SQL** (decided; not yoyo/dbmate). `api/migrations/*.sql` + `migrate.py` runner: ensures a `schema_migrations(id, applied_at)` table, runs un-applied files in filename order, records each. Run with `docker compose exec api python -m migrations.migrate` (from a running `db`). Not auto-run on container start — deliberate.
- **`001_init.sql` (movies table) — schema decisions:**
    - `id` is now a **DB-generated identity** (`BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`), replacing the old nanoid `TEXT` id. Model `id` is `int` (not `str`).
    - `tmdb_id INT UNIQUE` — guards against duplicate adds (the frontend check is just UX). Nullable; multiple NULLs are fine under `UNIQUE`. ⚠️ Was initially added *without* the UNIQUE constraint, which let dup imports through — re-add via truncate + re-import if it recurs.
    - `genres TEXT[]` (scalar array); **`cast_members JSONB`** — renamed from `cast` (reserved word) **and** the model field `cast` → `cast_members` to match. jsonb chosen over array because cast entries are `{name, role}` objects, not scalars. Temporary — replaced by the `people`/`movie_people` tables later.
    - `errors` renamed to **`issues`** (column + Pydantic field + the source JSON). Watch for stale `errors` refs (model, `add_movie` service, client after `gen:types`).
- **Models split:** `MovieBase` (all fields, **no `id`**) + `MovieFull(MovieBase)` (adds required `id: int`) — the Pydantic equivalent of `Omit<MovieFull,'id'>` (build up, don't subtract). `tmdb_movie_transform` returns `MovieBase`; `add_movie` INSERTs and returns a `MovieFull` with the new id (via `RETURNING id`). `MovieFullJson` exists for the one-off import. Named SQL params (`%(name)s`) used so column order can't silently misalign.
- **One-off import:** `migrations/port-json.py` loads `movies.json` (validated through `MovieFullJson`), wraps cast in `Jsonb(...)`, bulk-INSERTs with `ON CONFLICT DO NOTHING`. The `db.py` pool must be opened manually (see above).
- **Repositories migrated:** `movies` (get/add/delete), `genres` (`SELECT DISTINCT unnest(genres)`), `decades` (`year - year % 10`), `languages` (queries `languages` table). Flat-list repos return `[r[0] for r in rows]` from plain (non-`dict_row`) cursors and skip Pydantic validation (trusted own columns); movie reads use `dict_row` + validate into `MovieFull`. ⚠️ `get_movie` must guard `None` before `model_validate` (returns `None` for a missing id → route 404s).
- **Language lookup table — DONE.** `languages(code TEXT PK, english_name TEXT)` + FK `movies.language → languages(code)`. Seeded from TMDB `GET /configuration/languages` via `002_add_languages.py` (run manually between `002` create and `003` FK migration). Movies query JOINs to return english name; languages repo queries the table directly.
- **`uv` packaging:** `[tool.uv] package=true` + `[tool.setuptools]` in `pyproject.toml` so `uv run migrate` entry point works. `*.egg-info/` gitignored.
- **Logging:** `app/logging_config.py` (dictConfig, `settings.log_level`), catch-all handler logs exceptions.

**Still open:**

- **Genres normalization** (planned): move `genres TEXT[]` → a `genres` table + `movie_genres` join table, same shape as the people slice below. Additive; `/genres` becomes a join instead of `unnest(genres)`.
- **People/credits normalization** — the additive slice below, still future. Want to add `director` (+ maybe a couple other crew roles) when it lands.
- **Error handling — DONE.** All three pieces landed (one focused pass, mirrors the `TMDBError` pattern):
    - **Writes → 409:** new `DuplicateMovieError(tmdb_id)` (`exceptions.py`); `add_movie` (`repositories/movies.py`) wraps the whole connection block in `try/except psycopg.errors.UniqueViolation`, narrows on `e.diag.constraint_name == "movies_tmdb_id_key"` (Postgres auto-name for the inline `tmdb_id INT UNIQUE`) → raises `DuplicateMovieError`, re-raises any *other* unique violation (→ 500). Global handler in `main.py` → 409. ⚠️ NULL `tmdb_id` can't violate the constraint, so an `assert movie.tmdb_id is not None` narrows the type before the raise.
    - **Not-found (reads) → 404:** confirmed `GET /movies/{id}` 404s for a missing id; gave it `detail="Movie not found"` to match DELETE, and documented it via `responses={404: ...}` (manually-raised `HTTPException`s aren't auto-added to the OpenAPI schema).
    - **Infrastructure failures → 503:** global `@app.exception_handler(psycopg.OperationalError)` in `main.py`. Plus a catch-all `@app.exception_handler(Exception)` → 500 `{detail, path}` (returns a *generic* message — no `str(exc)` leak; uvicorn still logs the traceback since `ServerErrorMiddleware` re-raises). Handler precedence is by type specificity, not order, so the catch-all doesn't shadow the specific ones; 404/422 still flow through their own handlers.
    - **Note:** the dup fires only *after* the (wasted) TMDB fetch + poster download in `add_movie_from_tmdb` — accepted; dups are rare and the constraint is the real guard. 503 can't be tested by booting with the db down (`pool.wait()` in lifespan fails fast → app won't start); test it by `docker compose stop db` while the api is running, then hit an endpoint. Client types regenerated (`pnpm gen:types`) so the documented 404/409 are in `api.d.ts`.
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

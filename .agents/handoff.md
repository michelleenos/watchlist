# Project Handoff

A movie tracking/display app. Frontend is Vue. The backend has been rewritten in Python (FastAPI) — **Pass 1 is complete**; the FastAPI server (`api/`) is now the active dev backend (Vite proxies to it). The old Fastify/TS server (`server/`) is being retired. Work is on the **`python-migration`** branch. Stable frontend component/page details live in `AGENTS.md`.

---

## Frozen Decisions

Settled — don't relitigate.

- **Backend:** Python + **FastAPI**, models via **Pydantic** (replaced Fastify/TypeBox). Rationale: Python practice + do the DB migration once, in Python.
- **Python tooling:** **uv** (env, deps, `uv.lock`). Backend in `api/` with its own `pyproject.toml`, not in the pnpm workspace.
- **Database:** migrate JSON → **PostgreSQL**, driver **psycopg3** (`psycopg[binary]`), raw SQL, no ORM.
- **Poster images:** store only the filename in the DB. Files live at `api/public/images/` (gitignored), served by FastAPI `StaticFiles` at `/images`; dev Vite proxies `/images` → `http://localhost:3001`. Prod → object storage (R2), set `VITE_POSTER_BASE_URL` to the CDN base.

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

**Pass 2 (swap storage to Postgres) — TODO.** Only `repositories/movies.py` changes — all JSON reads/writes are consolidated there. See Database setup + the people-table slice below.

---

## Migration finalization (retiring the TS server)

Full plan: `~/.claude/plans/outline-how-i-should-jolly-nebula.md`. Dev orchestration target: **Docker Compose** (`client` + `api`; `db` in Pass 2).

- **A1 — DONE:** relocated `movies.json` + images into `api/`; backend is self-contained.
- **A2 — TODO:** Docker Compose, `client` + `api` (two containers, shared network). **Gotcha:** in compose the Vite proxy can't use `localhost:3001` — target the service name (`http://api:8000`); make it an env var so it works in/out of Docker. HMR may need `usePolling`.
- **A3 — TODO:** stop running Fastify (root `pnpm dev` = `pnpm --parallel -r dev`) → `docker compose up`; remove `server` from `pnpm-workspace.yaml` (client imports `server/src` by relative path, not as a package — safe, but keep files on disk until B1).
- **B (with the DB pass):** **B1** cut the client→server type cord via `openapi-typescript` (FastAPI serves `/openapi.json`; gen `client/src/types/api.d.ts`, repoint imports) → **B2** delete `server/src` etc. → **B3** Postgres into compose. Don't wire B1 until the response shape settles post-DB.

**Blocker for deleting `server/`:** client still imports `MovieTypeFull` (`server/src/movie-type.ts`) + `TMDBSearchReturn` (`server/src/external/tmdb.ts`) across 6 files — B1 cuts this. Also: `GET /tmdb/search` has no `response_model` (works via `to_camel`); add `response_model=list[TMDBSearchResult]` when wiring B1.

---

## Database setup (Pass 2)

- Docker Compose for local Postgres; `.env` connection string (read via `pydantic-settings`).
- Migration strategy: numbered SQL + runner, or `yoyo-migrations`/`dbmate` — undecided.
- Hosting in prod — later.
- `/decades`, `/languages`, `/genres` each scan all movies now; not worth optimizing — they become trivial `SELECT DISTINCT` / `EXTRACT(DECADE …)` post-migration.

---

## Crew / credits restructuring (planned)

`director` was dropped (was Letterboxd-scraped) and will be re-sourced from TMDB. The old "first 10 of `credits.crew`" slice is broken (crew is large + unordered, often omits the director).

**Selection (verified live, 2026-06-24):** select by **`job`**, not `department`. `cast` = top ~5 by `order`; `directors` = `job=='Director'` (handles co-directors); maybe `writers` (Writing jobs `Screenplay`/`Writer`/`Story`) + `composer` (`Original Music Composer`); producers skipped (noise).

**Storage — decided: normalize into a `people` table** (rejected a jsonb cast blob — discrete rows make "filter by a big name" a clean join). Sequenced as its own additive slice **after** the movies-only Postgres migration: `people (id, tmdb_id, name)` + `movie_people (movie_id, person_id, role/job, billing_order)` + a TMDB backfill. Nothing on the `movies` table changes when it lands; additive DDL is trivial at ~132 rows. **Cheap hedge: keep `tmdb_id` on `movies` from the start** (enables the backfill). Normalizing resolves the old dedup question (one person row, one join row per job). **Still open:** store `writers`/`composer` at all, vs. directors + cast only.

---

## Frontend — todo

- **Toast leave animation** is jittery — try separate enter/leave translations; check `max-height` snapping; test multiple in sequence.
- **Loading state on MoviesIndex** is plain "LOADING" text — want spinner/skeleton. Open question: on `refresh()` (every add/delete) the whole list blanks to loading — decide whether to dim/overlay existing content instead and reserve full-blank for initial mount.
- **Error UI:** `useMovies()` exposes an `error` ref nothing consumes yet — wire it into MoviesIndex (MovieSingle already handles its own).
- **Re-check add UX** against the new backend (poster now returned ready; surface `errors[]` on failed poster).
- Sort by (field TBD); maybe revive display options (`client/src/display-options.ts`, retained but unimported).

---

## Current State (quick map)

- **Monorepo:** pnpm workspace `client/` + `server/` (root `dev`/`build`); `api/` (uv Python) is separate and is the active backend.
- **`client/`:** Vue 3 + Vite + Tailwind. Router: `/` → `MoviesIndex.vue`, child `/movie/:id` → `MovieSingle.vue`. Composables use a module-scope shared-ref pattern (`useToast`, `useMovies`). Component details in `AGENTS.md`.
- **Proxy:** client calls `/api/...`; Vite strips `/api` → Python `:3001`. `/images/*` → same server (no rewrite).
- **`server/` (legacy TS):** Fastify, kept only for the type imports the client still uses (until B1). Leftover `server/data/movies-new.json` + `old/` unused.
- **Prettier:** per-package. **ESLint:** client-only.

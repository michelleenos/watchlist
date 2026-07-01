**Always read `.agents/handoff.md` at the start of a new session.**

## Movie Tracking Project

A movie tracking/display app. Two parts:

- `client/` — Vue 3 + Vite + Tailwind. Standalone pnpm project (pnpm 11; no root workspace).
- `api/` — FastAPI + Python, uv-managed. The active backend (the old Fastify/TS `server/` has been removed).

`docker compose up` runs the dev stack: `client` (`:5173`) + `api` (`:3000`) + `db` (Postgres). The client calls `/api/...`; Vite strips `/api` and proxies to `API_PROXY_TARGET` (default `http://localhost:3000` bare-metal, `http://api:3000` in compose). `/images/*` proxies to the same target (no rewrite).

The JSON-file → PostgreSQL migration is essentially complete (movies, genres, languages, people/credits all normalized). See `.agents/handoff.md` for current state, decisions, and next steps; deep backend/data-layer detail is in `.agents/reference/backend.md` (read only when working in that area).

## Backend (`api/`)

FastAPI + **Pydantic** for models (settled — see Frozen Decisions in `.agents/handoff.md`). Python tooling is **uv** (env, deps, `uv.lock`); `api/` has its own `pyproject.toml` and is not part of any pnpm setup. Database is **PostgreSQL** via **psycopg3**, raw SQL, no ORM.

Stable layout (`api/app/`): `config.py`, `models.py`, `exceptions.py`, `main.py`, `utils.py`, plus `routes/`, `repositories/`, `external/`, `services/`. Routes: `GET/POST /movies`, `GET/DELETE /movies/{id}`, `GET /tmdb/search`, `GET /genres|decades|languages`, `/health`, and the `/images` static mount.

- **`MovieFull` (`models.py`) is the schema source of truth.** `MovieBase` holds all fields without `id`; `MovieFull(MovieBase)` adds the DB-generated `id: int`. `alias_generator=to_camel` + `validate_by_name/alias` round-trips snake_case (Python) ↔ camelCase (JSON); routes use `response_model_exclude_none=True`.
- **DB access:** module-level `AsyncConnectionPool` in `app/db.py`, opened/closed in the FastAPI `lifespan`. Repos go through an explicit cursor (`row_factory` is per-cursor: `dict_row` for movie reads, plain tuples for flat-list repos).
- **Normalized data:** movies + join tables `genres`/`movie_genres`, `languages` (FK), `people`/`movie_people` (cast + directors/writers/source authors). Movie-detail reads assemble credits via subqueries. Full mechanics in `.agents/reference/backend.md`.
- **Migrations:** manual numbered SQL in `api/migrations/*.sql` + a `migrate.py` runner (tracks applied files in `schema_migrations`). Run via `uv run migrate` (or `docker compose exec api python -m migrations.migrate`); not auto-run on container start. Some steps have a manual `NNN_*.py` companion for TMDB-backed seeding/backfill.

**Convention:** backend changes that alter the API response shape require re-running `pnpm gen:types` from `client/` (regenerates `client/src/types/api.d.ts` from the FastAPI OpenAPI schema — run the api first). `client/src/types/index.ts` re-exports clean names (`MovieFull`, `MovieMember`, `TMDBSearchResult`).

## Frontend

Vue 3 + Vite + Tailwind in `client/src/`. Pages in `pages/`, components in `components/`, composables in `composables/`.

- **Routing:** Vue Router (`createWebHistory`): `/` → `MoviesIndex.vue`, with `/movie/:id` → `MovieSingle.vue` nested as a child of `/`. `MovieCard` RouterLink must include the leading slash (`/movie/:id`, not `movie/:id`).
- **MoviesIndex:** main page — fetches movies/genres/decades/languages via `useMovies()`, has genre/decade/language filters, 2-column grid on `lg+`, includes `AddMovie`.
- **MovieCard:** the whole card is a `<RouterLink>` to `/movie/:id`. Shows poster, title, original title, tagline, year, language, overview, genre pills.
- **MovieSingle:** right-slide panel via `AppDialog` (`pageSide` prop). Fetches single movie, re-fetches on route param change. Inline delete confirmation (button → "Really remove? [Cancel] [Remove]"), navigates back + toasts on success.
- **AddMovie:** modal dialog (uses `AppDialog`) with TMDB search. Disables "Add" for already-added movies (duplicate check via `useMovies()`). Calls `refresh()` after add.
- **AppDialog:** reusable `<dialog>` wrapper — `pageSide` prop for side panels or centered modal; exposes `open()`/`close()` via `defineExpose`.
- **FilterItems:** generic filter component (`generic="TValue extends string | number"`); accepts plain values or `{ value, label }` options; used for genres, decades, languages.
- **Decades:** fetched from `/api/decades` (`number[]`), mapped client-side to `{ value, label: '${d}s' }`.
- **Composables:** `useToast()` and `useMovies()` use a shared module-scope reactive instance pattern (initialized once at module import, all callers share state — avoids Pinia). `useMovies()` holds `moviesData` ({ movies, genres, decades, languages }) + `loading`/`error` refs + `refresh()`; consumed by MoviesIndex/AddMovie/MovieSingle, which call `refresh()` after add/delete.
- **Toast notifications:** `useToast()` (`add(message | { html }, type, duration?)`); `ToastNotifications.vue` renders fixed bottom-right stack, auto-dismisses after 3s default, supports HTML messages.

Open frontend work (toast animation, poster-on-add UX, sort, loading/error states) lives in `.agents/handoff.md` ("Frontend — todo").

## Dev environment gotchas

- **Bind-mount masking:** `- ./api:/app` / `- ./client:/app` shadow image-built deps — fixed with anonymous volumes `- /app/.venv` (api) and `- /app/node_modules` (client).
- **client is a standalone pnpm project** (no root workspace), pnpm pinned to `11.9.0`; native deps (`esbuild`, `@tailwindcss/oxide`, `@parcel/watcher`) are listed in `client/pnpm-workspace.yaml` `allowBuilds` (needs pnpm ≥10.26).
- **Client type imports must be top-level `import type { … }`**, not inline `import { type … }` — esbuild fully erases the former; the latter leaves a side-effect import that fails to resolve in-container.
- **`gen:types` gotcha:** Pydantic `str | None` generates as `string | null` (not optional/undefined) — watch for null-vs-undefined mismatches.

---

## User instructions

Do not make edits unless the user explicitly directs you to. For example:

- "Configure tests for the DELETE handler" -> go for it, start writing & wiring up the tests.
- "How should I configure tests for the DELETE handler?" -> do not make edits, just respond in chat with examples and explanation.

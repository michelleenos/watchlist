# Project Handoff

A movie tracking/display app. Frontend is Vue. Backend is currently Fastify (Node.js/TypeScript) but is planned to be rewritten in Python (FastAPI) — see Frozen Decisions and "Backend rewrite to Python" below.

---

## Frozen Decisions

These are settled — don't relitigate them. (Not all are implemented yet.)

- **Backend language/framework:** Rewrite the backend in **Python with FastAPI** (replacing the current Fastify/TypeScript server). Request/response models via **Pydantic** (replacing TypeBox). Reasons: practice/exposure with Python + FastAPI's ergonomics. Doing it now (before the Postgres work lands) means the DB migration happens once, in Python, rather than twice.
- **Python tooling:** Use **uv** for environment + dependency management (handles Python version, venv, install, and `uv.lock`). The Python backend lives in its own folder with its own `pyproject.toml`, alongside the pnpm-managed `client/`.
- **Database:** Migrate from JSON files to PostgreSQL.
- **Driver:** Use **psycopg3** (PyPI package `psycopg`, installed as `psycopg[binary]`) — no ORM, raw SQL. (Supersedes the earlier `postgres.js` decision, which is dropped along with the Node backend.)
- **Poster images:** Store only the filename in the DB (e.g. `anora.webp`). Images live locally at `server/public/images/` (gitignored), served by Fastify via `@fastify/static`. In dev, Vite proxies `/images` → `http://localhost:3000`. In prod, will move to object storage (R2 or similar) — when that happens, set `VITE_POSTER_BASE_URL` in the client env to the CDN base URL.

---

## Open — In Progress

### Frontend redesign

The redesign is essentially done — stable component/page details now live in `AGENTS.md`. Remaining open work:

### Frontend — todo

- **Toast transition fix:** ToastNotifications currently has jittery leave animation. Consider: (1) separate enter/leave translations (e.g. enter from left, leave to right), (2) ensure `max-height` doesn't cause snapping, (3) test with multiple toasts in sequence.
- **Poster images on newly added movies:** After `POST /api/movies`, the new movie object is returned but the poster may not be available immediately (TMDB fetch is async on server). Either: (1) poll until poster is available, (2) show a placeholder and lazy-load, or (3) wait for the full fetch to complete server-side before returning. Current UX likely shows empty poster thumbnail.
- Sort by (field TBD)
- Possibly bring back display options (wired out of the UI but the file is retained — `client/src/display-options.ts` still exports `MovieDisplayOptions` + `defaultDisplayOptions`, just not imported anywhere)
- **Loading state on MoviesIndex:** currently shows plain "LOADING" text — replace with spinner or skeleton.
    - **Refresh indicator (to discuss/decide):** `refresh()` sets the shared `loading` true, so on _every_ add/delete the whole index is replaced by the loading state — this is intentional (want a visible "we're refreshing" cue), not a bug. Open question: rather than fully blanking the list, keep the existing content visible but faded/dimmed (or overlay a spinner) during a refresh, and reserve the full loading state for the initial mount. Decide on the treatment for initial-load vs. refresh.
- **Error handling on the frontend (deferred):** `useMovies()` exposes an `error` ref but nothing consumes it yet — `MoviesIndex` has no error UI (only `loading` → "LOADING" → list). Wire `error` into an error state/message on the index eventually. (`MovieSingle` already has its own local error handling for the single-movie fetch; this is specifically the list/composable-level error.)

### Backend rewrite to Python

Two passes, deliberately sequenced so only one thing changes at a time:

**Pass 1 — Port the API to FastAPI, keep JSON storage.** Rebuild the existing endpoints in FastAPI with Pydantic models, but keep the repository layer reading the current `movies.json`. Goal is behavioral parity with the Node server (responses can be diffed against the old server for the same requests). This isolates the language/framework switch from the storage switch and avoids relearning FastAPI + async DB at the same time.

- Mirror the current server structure (`routes` / `services` / `repositories` / `external`) in the Python project.
- **Make repository methods `async` from the start**, even while backed by JSON, so swapping in psycopg3's async API later doesn't change call signatures (no `await` added after the fact).
- Treat the Pydantic model as the schema source of truth (the role `movie-type.ts` plays now), but don't finalize it yet — the movie shape may firm up during the DB pass.
- The JSON-backed repository here is throwaway code (replaced in Pass 2). Keep it minimal.

**Pass 1 progress (as of 2026-06-23):** The Python backend lives in `api/` (uv-managed, `app/` package: `config.py`, `models.py`, `routes/`, `repositories/`).

- **Done — read/delete routes (JSON-backed):** `GET /movies`, `GET /movies/{id}` (404 if missing), `DELETE /movies/{id}`, `GET /genres`, `GET /decades`, `GET /languages`. All registered in `app/main.py` with Node-matching prefixes; verified against the JSON data (counts, distinct lists, camelCase output, 404s). `app/main.py` also has a `/health` route.
- **Models:** `MovieFull` + `MovieMember` in `app/models.py`. Uses `alias_generator=to_camel` + `validate_by_name`/`validate_by_alias` (not per-field aliases) so snake_case fields round-trip to/from the camelCase JSON. Output is camelCase via response-model aliasing; routes use `response_model_exclude_none=True` to match Node omitting `undefined`. `TMDBGenre`/`TMDBMovieDetails`/`TMDBSearchResult` added with the external layer (see below).
- **Repo:** `app/repositories/movies.py` (`load_movies`, `get_movies`, `get_movie`, `delete_movie`) + `genres.py`/`decades.py`/`languages.py`. `delete_movie` writes back with `by_alias=True, exclude_none=True` and **skips** Node's backup + re-sort (throwaway). Reads/writes the shared `../server/data/movies.json` via `settings.movies_path`.
- **Deferred (need the orchestration layer):** `POST /movies` — depends on `external/images.py` (httpx download + Pillow resize→webp) + `services/add_movie.py` (orchestrate `get_tmdb_data` → map to `MovieFull` → image download → repo `add_movie`) + the POST route. The TMDB external client and `GET /tmdb/search` are done — see "External TMDB layer" below.
- **Done — repo functions `async`:** `load_movies`/`get_movie`/`delete_movie` (+ the filter repos) are now `async` using `aiofiles` (commit `45f5e18`), so signatures won't change when psycopg3's async API swaps in.
- **`extra="allow"` on `MovieFull`:** undeclared JSON keys survive validation **and** are re-emitted on dump, so `delete_movie`'s file rewrite is non-destructive to fields not in the model. (This is why the field cleanup below had to be done deliberately — nothing was being dropped by accident.)

#### Field / schema cleanup (done 2026-06-24)

Settled the movie field shape (the Pydantic model is the schema source of truth heading into Pass 2). Each change was applied across all four places the movie shape lives: `server/data/movies.json` (one-time migration script over the data), `api/app/models.py` (`MovieFull`), the Vue client, and `server/src/movie-type.ts` (the still-running TS server). Both `tsc` (server) and `vue-tsc` (client) typecheck clean afterward.

- **`tmdbOverview` → `description`:** consolidated the old overlapping `description` / `descriptionAlt` / `letterboxdDescription` / `tmdbOverview` fields into a single `description`, sourced from the TMDB overview (131/132 movies have it). `tmdb.ts` add-movie builder now writes `description`.
- **`tmdbGenres` → `genres`:** collapsed to one `genres` field, backfilled from `tmdbGenres` (which is what the frontend actually displayed and filtered on, so it won where the two diverged on 6 movies). All 132 now have `genres`. This also fixed a latent bug: the genre filter _options_ (`/genres` endpoint) were derived from `genres` while the filter _matching_ in `MoviesIndex.vue` ran against `tmdbGenres` — now both use `genres`.
- **Dropped all Letterboxd legacy fields** (decision: don't keep, don't re-source): `letterboxdGenres`, `letterboxdUrl`, `letterboxdDescription`, `themes`, `genresMore`, `descriptionAlt`, and **`director`** (was Letterboxd-scraped). Director will be re-sourced from TMDB instead — see the crew plan in Notes below.

#### External TMDB layer (done 2026-06-24)

- **`app/external/tmdb.py`:** httpx async client. `tmdb_search(name)` → `list[TMDBSearchResult]` (powers `GET /tmdb/search`); `get_tmdb_data(tmdb_id)` → `TMDBMovieDetails` (will power `POST /movies`). Per-call `httpx.AsyncClient()` — no lifespan wiring (fine for low-traffic one-off calls; revisit a shared client if TMDB calls get frequent). Auth via Bearer token in `Authorization` header (TMDB's recommended method, not the `api_key` query param).
- **`get_tmdb_data` already passes `append_to_response=credits`** — set up for the crew restructuring. `TMDBMovieDetails` has `extra="ignore"` so credits are dropped on validation for now.
- **Error handling via domain exception:** `app/exceptions.py` defines `TMDBError(Exception)` carrying an optional kw-only `status_code`. `tmdb.py` catches `httpx.HTTPStatusError` (reads `.response.status_code`) then the broader `httpx.HTTPError`, raising `TMDBError` with `from e` chaining. Global handler in `main.py` maps 404→404, else→502. Routes have no try/except — errors bubble through the service layer, so `POST /movies` will inherit the same handling. `TMDBError` lives in its own module (not `models.py`) since exceptions are control-flow, not data shape; `ImageError` will join it when `external/images.py` is built.
- **Models added to `app/models.py`:** `TMDBGenre`, `TMDBMovieDetails` (snake_case, `extra="ignore"` — internal parse of TMDB response), `TMDBSearchResult` (`to_camel` aliasing + `validate_by_name` so it parses TMDB's snake_case and emits camelCase to match the TS `TMDBSearchReturn` shape).
- **Routes (`app/routes/tmdb.py`):** `GET /search`, `GET /movie/{tmdb_id}` (temporary debug route for `get_tmdb_data` — drop or keep once `POST /movies` is wired). Router included in `main.py` at `/tmdb` prefix.
- **Dependency added:** `httpx`. (Pillow comes with `external/images.py` next.)
- **Simplifications vs. TS `tmdb.ts`:** dropped the string-name branch in `get_tmdb_data` (TS accepted `nameOrId: string | number`); dropped the `MovieErrorType` union + `isTmdbMovie` type guard in favor of exceptions (Python idiom). `get_tmdb_data` returns `TMDBMovieDetails` (not a `MovieTMDB` intermediate), so the mapping to `MovieFull` (year from `release_date`, genres → `list[str]`, nanoid id, local `poster_path` after image download) will be deferred to `services/add_movie.py` — keeps `tmdb.py` a pure TMDB client.
- **Decision — cast/crew omitted this pass:** for Pass 1 parity, did not implement directors/writers/composer extraction. The decided crew plan (see Notes) is deferred to its own change. `MovieMember` stays in `models.py` (Optional), unpopulated.
- **To verify when wiring the frontend:** `GET /search` has no `response_model=list[TMDBSearchResult]` declared. Confirm FastAPI still emits camelCase via the model's `to_camel` config (frontend expects `releaseDate`/`originalLanguage`/`posterPath`); if output comes back snake_case, add `response_model=list[TMDBSearchResult]` (enables `response_model_by_alias=True`).
- **Crew exploration in progress:** scratchpad work in `api/app/scratchpad/` (gitignored) querying live TMDB credits to examine the directors/writers/composer data shape. No decision yet on the open crew questions in Notes.

**Pass 2 — Swap storage to Postgres.** Only the repository layer changes — bring in psycopg3, define the schema + migrations, finalize the response models. (See "Database setup" below.)

After the shape settles (Pass 2), wire up the client/server type boundary via FastAPI's OpenAPI output + a TS generator (e.g. `openapi-typescript`) instead of the current cross-package TS imports — see "Shared types" below.

### Database setup

- Set up Docker Compose for local Postgres
- Decide on migration strategy (numbered SQL files + a runner script, or a Python-friendly tool like `yoyo-migrations` / `dbmate`)
- Set up environment variables / `.env` for DB connection string (read in Python, e.g. via `os.environ` / `pydantic-settings`)
- Hosting: where/how to deploy Postgres in production — not urgent, figure out later

### Shared types: client importing from server

The client (`client/src/`) currently imports types directly from the server package. This works for now but is not a clean boundary. Current cross-package imports:

- `MovieTypeFull` from `server/src/movie-type.ts` — used in `MoviesIndex.vue`, `MovieCard.vue`, `MovieSingle.vue`, `MovieMetaDl.vue`
- `TMDBSearchReturn` from `server/src/external/tmdb.ts` — used in `AddMovie.vue`

Note: the Python backend rewrite **forces this boundary to change** — the client can no longer import TS types from the server (there won't be any). Resolution, once the API shape settles in Pass 2:

- **Generate TS types from the OpenAPI schema** (preferred) — FastAPI emits OpenAPI automatically; run a generator like `openapi-typescript` to produce client types. Turns the current cross-package import hack into a clean, single-source-of-truth boundary.
- **Duplicate the types on the client by hand** — simplest fallback, fine for a small number of interfaces.

Don't wire up the generator until the movie response shape settles (post-DB migration), so the types are generated once against the stable shape.

---

## Current State

- **Structure:** pnpm workspace monorepo with `client/` and `server/` packages; root `package.json` has `dev` and `build` scripts. A separate `api/` directory (uv-managed Python, not part of the pnpm workspace) holds the in-progress FastAPI rewrite — see "Backend rewrite to Python" above.
- **Server (current, TS):** Fastify (`server/src/index.ts`), organized into `routes/`, `services/`, `repositories/`, `external/`.
- **Server (in progress, Python):** `api/` (FastAPI, uv-managed, `app/` package: `config.py`, `models.py`, `exceptions.py`, `main.py`, `routes/`, `repositories/`, `external/`). Pass 1 read/delete routes + TMDB external layer done; `POST /movies` + image layer pending. See "Backend rewrite to Python" above for status.
- **Routes:** `GET/POST /movies`, `DELETE /movies/:id`, `GET /movies/:id`, `GET /tmdb/search`, `GET /genres`, `GET /decades`, `GET /languages` — registered in `index.ts` with per-group prefixes (`/movies`, `/tmdb`, etc.); there is no `/api` prefix on the server. The client calls these as `/api/...` and Vite's dev proxy strips the `/api` prefix (`rewrite: /^\/api/ → ''`) before forwarding to `http://localhost:3000`.
- **Decades / Languages / Genres:** `repositories/` + `routes/` pairs returning derived/distinct lists from movie data.
- **Schema validation:** TypeBox for request schemas + genres response. Movie response schemas deferred until DB schema settles.
- **Data:** `server/data/movies.json` (flat JSON — being replaced by Postgres).
- **Client:** Vue 3 + Vite + Tailwind in `client/src/`. Pages in `pages/`, components in `components/`, composables in `composables/`.
- **Routing:** Vue Router (`createWebHistory`): `/` → `MoviesIndex.vue`, with `/movie/:id` → `MovieSingle.vue` nested as a child of `/`.
- **Reusable components:** `MoviePoster`, `MovieTitle`, `MovieTagline`, `MovieMetaDl` (+`MovieMetaDt`), `PillItem`, `CloseButton`, `LoadingSpinner`, `AppTypography`, `AppBtn`, `AppDialog`, `AddMovie`, `ToastNotifications`.
    - `AppTypography` — text-style source of truth via `variant` (+ optional `tag`).
    - `AppBtn` — polymorphic (`button`/`<a>`/`RouterLink`), brass styling, forwards attrs.
    - `PillItem` — pill badge/toggle (`selectable` + `active` props, peer-checked styles).
    - `AppDialog` — `<dialog>` wrapper; `pageSide` prop; exposes `open()`/`close()`; native focus trapping via `showModal()`.
    - `ToastNotifications` — fixed bottom-right stack, `TransitionGroup`, auto-dismiss; plain text or `{ html }` messages.
- **Composables:** `useToast()` — module-scope `ref` shared pattern; `add(message | { html }, type, duration?)` API.
- **Images:** `server/public/images/` (gitignored), served at `/images/*` via `@fastify/static` (server must be started from `server/` directory).
- **Prettier:** per-package configs (`client/.prettierrc`, `server/.prettierrc`). **ESLint:** client-only (`client/eslint.config.ts`); server relies on TS strict.

## Notes for Future Sessions

### Crew / credits restructuring (planned — not yet implemented)

`director` was dropped in the 2026-06-24 cleanup and will be re-sourced from TMDB. The whole crew-storage approach needs rework — currently `tmdb.ts` stores `cast` = first 5 of `credits.cast` (fine — TMDB pre-sorts by billing `order`) and `crew` = first 10 of `credits.crew` (**broken** — `credits.crew` is large and unordered, so the slice is random and often omits the director).

**Selection rules (verified against live TMDB, 2026-06-24):** select by **`job`**, not `department` (`department === 'Directing'` wrongly includes AD/script supervisor/etc.).

- `cast` — top ~5, sort by `order` explicitly.
- `directors` — `job === 'Director'` (handles co-directors, e.g. both Daniels).
- `writers` (maybe) — Writing jobs `Screenplay` / `Writer` / `Story` (+ `Novel`/`Author` for adaptations if wanted).
- `composer` (maybe) — `job === 'Original Music Composer'`.
- **Producer intentionally skipped** (numerous, mostly vanity/financier noise); debug view only.
- Use one request: `GET /movie/{id}?append_to_response=credits` returns details + credits together (collapse the old two calls).

**Storage shape — decided: normalize into a `people` table.** A `jsonb`/array cast blob was considered and rejected; discrete person rows make "sort/filter by a big name" a clean join rather than JSON parsing. Sequenced as its own additive slice **after** the movies-only Postgres migration (see Database migration → people table). The earlier "deferred open questions" are largely resolved by normalizing: a person is **one** row in `people` and **one row per job** in the `movie_people` join (so Bong Joon Ho = one person, three credits) — collapse-or-not for display becomes a query/frontend choice, not storage. Still open: whether to store `writers`/`composer` at all, vs. directors + cast only.

**Touches when implemented:** `tmdb.ts` builder, the new fields/tables, and frontend display.

### Database migration

- **People / cast / crew as a separate, later slice (decided):** do the first Postgres migration with the `movies` table only (no cast/crew) to get comfortable with psycopg3 + migrations on the simple case. Add cast/crew afterward as a purely additive change — `people (id, tmdb_id, name)` + `movie_people (movie_id, person_id, role/job, billing_order)` join tables + a TMDB backfill script. Nothing about the `movies` table changes when this lands. Additive schema changes are trivial at this row count (~132), so deferring costs nothing. Cheap hedge to enable the later backfill: keep `tmdb_id` on the `movies` table from the start.
- When starting work on the DB migration, read `server/src/movie-type.ts` first — it has the full TypeScript type for a movie record and is the source of truth for the schema
- **`repositories/movies.ts` is the only file that needs to change for the DB migration** — all JSON reads/writes are consolidated there. Routes and services don't touch storage directly.
- `server/src/index.ts` registers `@fastify/static` to serve `server/public/` using `process.cwd()` — server must be started from the `server/` directory (the dev script handles this).
- `utils.ts` now only contains `toFilename` (slug utility).
- Response schemas for movie routes should be added after the DB migration, not before — the shape may change.
- The `/api/decades`, `/api/languages`, and `/api/genres` endpoints each iterate over all movies separately. A combined `/api/filters` endpoint was considered to avoid redundant reads, but decided against it — these become trivial SQL queries post-migration (`SELECT DISTINCT`, `EXTRACT(DECADE FROM ...)`) so optimizing the JSON version isn't worth it.

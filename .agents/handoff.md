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

The redesign is underway. Current state:

- **Routing:** Vue Router is set up (`main.ts`) with `createWebHistory`. `/` → `MoviesIndex.vue`, with `/movie/:id` → `MovieSingle.vue` nested as a child route of `/`. Pages live in `client/src/pages/`.
- **Main page (`MoviesIndex.vue`):** Fetches movies, genres, decades, and languages in parallel on mount. Has genre, decade, and language filters. Shows movie count, 2-column grid on `lg+`. Includes `AddMovie` component (passes movies array as prop for duplicate checking).
- **MovieCard (`components/MovieCard.vue`):** The entire card is a `<RouterLink>` to `/movie/:id`. Shows poster, title, original title, tagline, year, language, overview, genre pills.
- **MovieSingle (`pages/MovieSingle.vue`):** Uses `AppDialog` component with `pageSide` prop for a right-slide panel. Fetches single movie from `/api/movies/:id` and re-fetches on route param change. Includes inline delete confirmation (button changes to "Really remove? [Cancel] [Remove]") with loading state. Calls `DELETE /api/movies/:id` and navigates back on success. Shows toast notification on delete.
- **AddMovie (`components/AddMovie.vue`):** Modal dialog with search box. Uses AppDialog. Search input with icon button on right. Displays TMDB results with duplicate checking (computed `existingTmdbIds` set). Disables "Add" button and shows "Already added" text for duplicates. Emits `added` event and shows toast with movie name on success.
- **AppDialog (`components/AppDialog.vue`):** Reusable dialog wrapper. Props: `pageSide` (for side panels like MovieSingle, or centered modal). Exposes `open()`/`close()` via `defineExpose`. Emits `close` event.
- **FilterItems component:** Generic Vue component (`generic="TValue extends string | number"`). Accepts `options` as `TValue[]` (plain values) or `Array<{ value: TValue, label: string }>` (object options). Model is `TValue[]`. Used for genres (strings), decades (numbers via object options), and languages (strings).
- **Decade options:** Fetched from `/api/decades` (returns `number[]`), mapped client-side to `{ value: number, label: '${d}s' }[]`.
- **Toast notifications:** `useToast()` composable in `composables/useToast.ts` with module-scope `ref` for shared state. `add(message | { html }, type, duration?)` API. `ToastNotifications.vue` renders fixed stack (bottom-right). Supports HTML messages for inline formatting (e.g. `{ html: 'added <strong>movie</strong>' }`). Auto-dismisses after 3s by default.

### Frontend — todo

- **useMovies() composable — DONE (implemented).** `composables/useMovies.ts` holds a module-scope `reactive` `moviesData` ({ movies, genres, decades, languages }) + `loading`/`error` refs + `refresh()` (shared pattern like `useToast`). `MoviesIndex`, `AddMovie`, and `MovieSingle` all consume it; `AddMovie`/`MovieSingle` call `refresh()` after add/delete (the `@added` emit + `:movies` prop are gone).
- **Toast transition fix:** ToastNotifications currently has jittery leave animation. Consider: (1) separate enter/leave translations (e.g. enter from left, leave to right), (2) ensure `max-height` doesn't cause snapping, (3) test with multiple toasts in sequence.
- **Poster images on newly added movies:** After `POST /api/movies`, the new movie object is returned but the poster may not be available immediately (TMDB fetch is async on server). Either: (1) poll until poster is available, (2) show a placeholder and lazy-load, or (3) wait for the full fetch to complete server-side before returning. Current UX likely shows empty poster thumbnail.
- Sort by (field TBD)
- Possibly bring back display options (wired out of the UI but the file is retained — `client/src/display-options.ts` still exports `MovieDisplayOptions` + `defaultDisplayOptions`, just not imported anywhere)
- **Loading state on MoviesIndex:** currently shows plain "LOADING" text — replace with spinner or skeleton.
    - **Refresh indicator (to discuss/decide):** `refresh()` sets the shared `loading` true, so on *every* add/delete the whole index is replaced by the loading state — this is intentional (want a visible "we're refreshing" cue), not a bug. Open question: rather than fully blanking the list, keep the existing content visible but faded/dimmed (or overlay a spinner) during a refresh, and reserve the full loading state for the initial mount. Decide on the treatment for initial-load vs. refresh.
- **Error handling on the frontend (deferred):** `useMovies()` exposes an `error` ref but nothing consumes it yet — `MoviesIndex` has no error UI (only `loading` → "LOADING" → list). Wire `error` into an error state/message on the index eventually. (`MovieSingle` already has its own local error handling for the single-movie fetch; this is specifically the list/composable-level error.)

### Backend rewrite to Python

Two passes, deliberately sequenced so only one thing changes at a time:

**Pass 1 — Port the API to FastAPI, keep JSON storage.** Rebuild the existing endpoints in FastAPI with Pydantic models, but keep the repository layer reading the current `movies.json`. Goal is behavioral parity with the Node server (responses can be diffed against the old server for the same requests). This isolates the language/framework switch from the storage switch and avoids relearning FastAPI + async DB at the same time.

- Mirror the current server structure (`routes` / `services` / `repositories` / `external`) in the Python project.
- **Make repository methods `async` from the start**, even while backed by JSON, so swapping in psycopg3's async API later doesn't change call signatures (no `await` added after the fact).
- Treat the Pydantic model as the schema source of truth (the role `movie-type.ts` plays now), but don't finalize it yet — the movie shape may firm up during the DB pass.
- The JSON-backed repository here is throwaway code (replaced in Pass 2). Keep it minimal.

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

- **Structure:** pnpm workspace monorepo with `client/` and `server/` packages; root `package.json` has `dev` and `build` scripts.
- **Server:** Fastify (`server/src/index.ts`), organized into `routes/`, `services/`, `repositories/`, `external/`.
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

### Director field — missing from MovieTypeFull

- `director` is not currently retrieved from TMDB and is absent from `MovieTypeFull`. It used to come from Letterboxd. It lives in the credits **crew** array (filter for `job === 'Director'`) — and the TMDB fetch already makes a credits call, so wiring it up is mostly just mapping that field through. Low priority, just hasn't been done yet.

### Frontend state management

- `useToast()` and `useMovies()` (TBD) follow a shared module-scope `ref` pattern. Composables are initialized once at module import, and all callers share the same reactive instance. This avoids Pinia boilerplate for small apps.

### Client routing & dialogs

- `MovieCard` RouterLink must include leading slash (`/movie/:id`, not `movie/:id`).

### Database migration

- When starting work on the DB migration, read `server/src/movie-type.ts` first — it has the full TypeScript type for a movie record and is the source of truth for the schema
- **`repositories/movies.ts` is the only file that needs to change for the DB migration** — all JSON reads/writes are consolidated there. Routes and services don't touch storage directly.
- `server/src/index.ts` registers `@fastify/static` to serve `server/public/` using `process.cwd()` — server must be started from the `server/` directory (the dev script handles this).
- `utils.ts` now only contains `toFilename` (slug utility).
- Response schemas for movie routes should be added after the DB migration, not before — the shape may change.
- The `/api/decades`, `/api/languages`, and `/api/genres` endpoints each iterate over all movies separately. A combined `/api/filters` endpoint was considered to avoid redundant reads, but decided against it — these become trivial SQL queries post-migration (`SELECT DISTINCT`, `EXTRACT(DECADE FROM ...)`) so optimizing the JSON version isn't worth it.

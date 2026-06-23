# Project Handoff

A movie tracking/display app. Frontend is Vue, backend is Fastify (Node.js/TypeScript).

---

## Frozen Decisions

These are settled — don't relitigate them. (Not all are implemented yet.)

- **Database:** Migrate from JSON files to PostgreSQL.
- **Driver:** Use `postgres.js` — no ORM.
- **Poster images:** Store only the filename in the DB (e.g. `anora.webp`). Images live locally at `server/public/images/` (gitignored), served by Fastify via `@fastify/static`. In dev, Vite proxies `/images` → `http://localhost:3000`. In prod, will move to object storage (R2 or similar) — when that happens, set `VITE_POSTER_BASE_URL` in the client env to the CDN base URL.

---

## Open — In Progress

### Frontend redesign

The redesign is underway. Current state:

- **Routing:** Vue Router is set up (`main.ts`) with `createMemoryHistory`. Routes: `/` → `MoviesIndex.vue`, `/movie/:id` → `MovieSingle.vue`. Pages live in `client/src/pages/`.
- **Main page (`MoviesIndex.vue`):** Fetches movies, genres, decades, and languages in parallel on mount. Has genre, decade, and language filters. Shows movie count, 2-column grid on `lg+`. Includes `AddMovie` component (passes movies array as prop for duplicate checking).
- **MovieCard (`components/MovieCard.vue`):** The entire card is a `<RouterLink>` to `/movie/:id`. Shows poster, title, original title, tagline, year, language, overview, genre pills.
- **MovieSingle (`pages/MovieSingle.vue`):** Uses `AppDialog` component with `pageSide` prop for a right-slide panel. Fetches single movie from `/api/movies/:id` and re-fetches on route param change. Includes inline delete confirmation (button changes to "Really remove? [Cancel] [Remove]") with loading state. Calls `DELETE /api/movies/:id` and navigates back on success. Shows toast notification on delete.
- **AddMovie (`components/AddMovie.vue`):** Modal dialog with search box. Uses AppDialog. Search input with icon button on right. Displays TMDB results with duplicate checking (computed `existingTmdbIds` set). Disables "Add" button and shows "Already added" text for duplicates. Emits `added` event and shows toast with movie name on success.
- **AppDialog (`components/AppDialog.vue`):** Reusable dialog wrapper. Props: `pageSide` (for side panels like MovieSingle, or centered modal). Exposes `open()`/`close()` via `defineExpose`. Emits `close` event.
- **FilterItems component:** Generic Vue component (`generic="TValue extends string | number"`). Accepts `options` as `TValue[]` (plain values) or `Array<{ value: TValue, label: string }>` (object options). Model is `TValue[]`. Used for genres (strings), decades (numbers via object options), and languages (strings).
- **Decade options:** Fetched from `/api/decades` (returns `number[]`), mapped client-side to `{ value: number, label: '${d}s' }[]`.
- **Toast notifications:** `useToast()` composable in `composables/useToast.ts` with module-scope `ref` for shared state. `add(message | { html }, type, duration?)` API. `ToastNotifications.vue` renders fixed stack (bottom-right). Supports HTML messages for inline formatting (e.g. `{ html: 'added <strong>movie</strong>' }`). Auto-dismisses after 3s by default.

### Frontend — todo

- **useMovies() composable:** Extract movies array, loading state, and `fetchMovies` logic into `composables/useMovies.ts` with module-scope `ref` (shared pattern like `useToast`). This allows any component to call `useMovies()` and get the same shared instance. Update `MoviesIndex` to use it, drop the `@added` emit from `AddMovie` and call `refresh()` internally instead. `MovieSingle` can call `refresh()` after successful delete.
- **Toast transition fix:** ToastNotifications currently has jittery leave animation. Consider: (1) separate enter/leave translations (e.g. enter from left, leave to right), (2) ensure `max-height` doesn't cause snapping, (3) test with multiple toasts in sequence.
- **Poster images on newly added movies:** After `POST /api/movies`, the new movie object is returned but the poster may not be available immediately (TMDB fetch is async on server). Either: (1) poll until poster is available, (2) show a placeholder and lazy-load, or (3) wait for the full fetch to complete server-side before returning. Current UX likely shows empty poster thumbnail.
- Sort by (field TBD)
- Possibly bring back display options (previously existed, currently removed)
- **Loading state on MoviesIndex:** currently shows plain "LOADING" text — replace with spinner or skeleton

### Database setup

- Set up Docker Compose for local Postgres
- Decide on migration strategy (numbered SQL files + a runner script, or a lightweight tool like `node-pg-migrate`)
- Set up environment variables / `.env` for DB connection string
- Hosting: where/how to deploy Postgres in production — not urgent, figure out later

### Shared types: client importing from server

The client (`client/src/`) currently imports types directly from the server package. This works for now but is not a clean boundary. Current cross-package imports:

- `MovieTypeFull` from `server/src/movie-type.ts` — used in `MoviesIndex.vue`, `MovieCard.vue`, `MovieSingle.vue`, `MovieMetaDl.vue`
- `TMDBSearchReturn` from `server/src/external/tmdb.ts` — used in `AddMovie.vue`

Options to resolve later:

- **Duplicate the types on the client** — simplest, fine for a small number of interfaces
- **Extract a `shared/` workspace package** — worth it if more types/validation are shared; adds a third pnpm workspace package with its own tsconfig

Don't move to `shared/` until there's more than one type being shared across the boundary.

### Director field — missing from MovieTypeFull

`director` is not currently retrieved from TMDB. Add it back to `MovieTypeFull` once the TMDB fetch logic is updated to populate it (likely from the crew array — filter for job === 'Director').

---

## Current State

- **Structure:** pnpm workspace monorepo with `client/` and `server/` packages; root `package.json` has `dev` and `build` scripts.
- **Server:** Fastify (`server/src/index.ts`), organized into `routes/`, `services/`, `repositories/`, `external/`.
- **Routes:** `GET/POST /api/movies`, `DELETE /api/movies/:id`, `GET /api/movies/:id`, `GET /api/tmdb/search`, `GET /api/genres`, `GET /api/decades`, `GET /api/languages` — registered with `/api` prefix in `index.ts`.
- **Decades / Languages / Genres:** `repositories/` + `routes/` pairs returning derived/distinct lists from movie data. Genres response schema via TypeBox.
- **Schema validation:** TypeBox for request schemas + genres response. Movie response schemas deferred until DB schema settles.
- **Data:** `server/data/movies.json` (flat JSON — being replaced by Postgres).
- **Client:** Vue 3 + Vite + Tailwind in `client/src/`. Pages in `pages/`, components in `components/`, composables in `composables/`.
- **Routing:** Vue Router (`createMemoryHistory`): `/` → `MoviesIndex.vue`, `/movie/:id` → `MovieSingle.vue`.
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

### Frontend state management

- `useToast()` and `useMovies()` (TBD) follow a shared module-scope `ref` pattern. Composables are initialized once at module import, and all callers share the same reactive instance. This avoids Pinia boilerplate for small apps.

### Client routing & dialogs

- `MovieCard` RouterLink must include leading slash (`/movie/:id`, not `movie/:id`).

### Database migration

- When starting work on the DB migration, read `server/src/movie-type.ts` first — it has the full TypeScript type for a movie record and is the source of truth for the schema
- **`repositories/movies.ts` is the only file that needs to change for the DB migration** — all JSON reads/writes are consolidated there. Routes and services don't touch storage directly.
- `server/src/index.ts` registers `@fastify/static` to serve `server/public/` using `process.cwd()` — server must be started from the `server/` directory (the dev script handles this).
- `utils.ts` now only contains `toFilename` (slug utility) and `getDir` (unused, can be deleted).
- Response schemas for movie routes should be added after the DB migration, not before — the shape may change.
- The `/api/decades`, `/api/languages`, and `/api/genres` endpoints each iterate over all movies separately. A combined `/api/filters` endpoint was considered to avoid redundant reads, but decided against it — these become trivial SQL queries post-migration (`SELECT DISTINCT`, `EXTRACT(DECADE FROM ...)`) so optimizing the JSON version isn't worth it.

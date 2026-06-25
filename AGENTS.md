**Always read `.agents/handoff.md` at the start of a new session.**

## Movie Tracking Project

A movie tracking/display app.

pnpm workspace monorepo:

- `client/` (Vue 3 + Vite + Tailwind)
- `server/` (Fastify + TypeScript)
- `api/` (FastAPI + Python, uv-managed — in-progress rewrite of `server/`)
    - A database migration from the current JSON file storage to PostgreSQL is planned — see `.agents/handoff.md` for current state, decisions, and in-progress work.

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

---

## User instructions

Do not make edits unless the user explicitly directs you to. For example:

- "Configure tests for the DELETE handler" -> go for it, start writing & wiring up the tests.
- "How should I configure tests for the DELETE handler?" -> do not make edits, just respond in chat with examples and explanation.

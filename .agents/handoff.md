# Project Handoff

Movie tracking/display app — Vue client + FastAPI/Postgres api. Everything is on `main`.

**Status:** the app is **deployed and running on Railway** (client + api + Postgres, all one project). The JSON-file → Postgres migration is done — movies, genres, languages, and people/credits are all normalized in Postgres and the frontend talks to it. Prod data + posters are migrated. What's left is cleanup and new features (see Next steps).

**Where things live:**
- repo/backend/frontend structure → `AGENTS.md` (read every session).
- deployment / Railway / Caddy / volume / security → `.agents/reference/deployment.md`.
- auth implementation (login, session, gating) → `.agents/reference/auth.md`.
- dense data-layer detail (pool/cursor, migrations, `add_movie`, per-table normalization incl. people/credits) → `.agents/reference/backend.md`.

Read the reference docs only when working in that area.

---

## Frozen Decisions

Settled — don't relitigate. Keeps the _why_ so rejected alternatives don't get re-proposed.

- **Backend = FastAPI + Pydantic, tooling = uv** (replaced Fastify/TypeBox). Rationale: Python practice + do the DB migration once, in Python.
- **Database = PostgreSQL**, driver **psycopg3**, raw SQL, **no ORM** (deliberate).
- **Migrations = manual numbered SQL + runner** (decided; _not_ yoyo/dbmate). Run in prod via the api's `preDeployCommand`.
- **Hosting = all Railway** (client behind Caddy + api + Postgres). The earlier **Netlify** plan for the client was dropped.
- **Posters:** DB stores only the filename. Files live on a **Railway volume** at `/data/images`, served by the api's `/images` static mount and proxied through Caddy. (The earlier **R2 / object-storage / `VITE_POSTER_BASE_URL`** plan was abandoned.)
- **People/credits = one unified `movie_people` table** (not split cast/crew), coarse **`role`** not TMDB's raw `job`, source-material authors as their own `source` role, and crew selected by an explicit **`job` allowlist, never `department`** (the Writing department is polluted with storyboard crafts). Full rationale + mechanics in `.agents/reference/backend.md`.
- **Frontend API layer = flat `client/src/api.ts`** — `apiFetch<T>(path, opts)` + `ApiError` + domain one-liners (`getMovie`, `patchMovie`, `createMovie`, `searchTmdb`, …). Deliberately **not** a directory (one file) and **not** a `use*` composable (owns no reactive state).
- **`useMovies` state is split**: `movies` (ref) vs `filterOptions` (reactive: genres/decades/languages/directors). Most facets come from the server (`/genres|/decades|/languages`, each `DISTINCT` over current movies); deriving *those* client-side was considered and **deferred** (only valid while the client fetches the full set). **`directors` is the one exception** — a `computed` nested in the reactive object (`useMovies.ts:14`), unique names across `movies`, sorted. No server endpoint for it. Being a computed, it auto-unwraps to `string[]` on access and self-syncs after add/delete.
- **List mutations patch the shared list in place** — `patchMovieInList`/`removeMovieFromList` (watched-toggle, delete), not a full refetch. `useMovies` exposes `refresh()` (movies + facets, initial mount) and `refreshMovies()` (movies only, used after add).

---

## Next steps (roughly priority order)

- **Frontend updates** — finish rendering credits: `directors` are done (MovieCard + a director filter), but `writers`/`sourceAuthors`/`castMembers` still render nowhere. `MovieSingle` shows no credits at all — it's the natural home for the full set. Plus the standing frontend todos + feature ideas below.
- **Tests (none exist yet)** — set up unit + integration tests. Likely `pytest` + `pytest-asyncio` for the api against an ephemeral Postgres; good first targets are the transform/allowlist logic (`tmdb_people_transform`) and the `insert_movie_people` upsert. Frontend: TBD (Vitest).
- **Poster slug rule is inconsistent** — DB `poster_path` (from the old TS server, ASCII-only `\w`) and on-disk files (from `backfill_posters.py`, Python Unicode `\w`) disagree on non-ASCII titles. Only Tár was actually broken and it's manually fixed. Remaining work is preventative: unify on one canonical slug in `app/utils.py:to_filename` (lean ASCII-only via `unicodedata.normalize("NFKD",…).encode("ascii","ignore")`).

Minor deferred prod tweak: mkdir `images_dir` in the api `lifespan` with `exist_ok=True` (currently the dir must already exist — fine in prod since the volume provides it, and in dev since `public/images` is committed). `PORT` in the Dockerfile CMD is already done.

- **Local-dev onboarding for public repo** — the README intentionally omits "run locally" instructions because the current setup is deployment-specific (Railway/Caddy/volume). To make the repo runnable by others: add a `.env.example` (TMDB key at minimum), confirm `docker compose up` works from a clean clone, and document migration + any seed steps. Could also note a generic Docker deploy path as an alternative to the Railway-specific setup. Deferred — some work to generalize.

---

## Frontend — todo + feature ideas

Standing todos:

- **Render the remaining credits** — the "Frontend updates" next step. `writers`/`sourceAuthors`/`castMembers` are still unrendered; `MovieSingle` has no credits section. Decide labels ("Written by" / "Based on work by"). Crew arrays are `[]` when empty (check length); `castMembers` may be absent.
- **Toast leave animation** is jittery — try separate enter/leave translations; check `max-height` snapping; test multiple in sequence.
- **Error UI:** `useMovies()` exposes an `error` ref nothing consumes yet — wire it into MoviesIndex (MovieSingle already handles its own).
- **Re-check add UX** against the backend (poster returned ready; surface `issues[]` on failed poster).
- **FilterBar needs better responsive styling** (the bar + expanded panel don't adapt well at smaller widths).
- **Revisit refresh/filter-sync behavior** — add uses `refreshMovies()` (movies only), so a movie introducing a **brand-new** genre/decade/language won't appear as a *filter option* until the next full load (the movie itself renders fine). Accepted for now. Options if it bites: full `refresh()` on add again, or derive facets client-side from `movies` (self-syncing — see Frozen Decisions).
- **Sort** by (field TBD).
- **Extract shared style utilities** — duplicated Tailwind class strings are drifting (e.g. light borders, the input styling repeated in AddMovie search + AuthFooter login form). Extract simple generic classes/components and do a small audit of components to catch subtle differences.

New feature ideas (owner, being considered — not yet scoped):

- **Pull trailers from TMDB** — `videos` endpoint via `append_to_response`; returns an array of video objects, `key` being the YouTube id (`youtube.com/watch?v=KEY`).
- **Richer discovery** via TMDB [`/discover/movie`](https://developer.themoviedb.org/reference/discover-movie) with keyword AND/OR logic.

## Done recently (context for current code)

- **`runtime` added to movies** (commit `d3f5b41`) — integer minutes from TMDB's base `/movie/{id}` payload (no `append_to_response` change needed). Column added by `008_add_runtime.sql` (nullable — TMDB returns `null` for some titles); `runtime` on `MovieBase` + `TMDBMovieDetails`, selected in both movie reads, inserted in `add_movie`, mapped in `tmdb_movie_transform`. Client renders it in `MovieMetaDl.vue` as `` `${movie.runtime}m` `` behind a `v-if`, so it shows on both MovieCard and MovieSingle. Deliberately **not** PATCHable and **not** a filter/sort field. Storybook fixtures were not updated (no `runtime` in `movies.fixtures.ts`).
  - **Prod is done** — migration applied (via the api's `preDeployCommand`) and `008_backfill_runtime.py` run in the container. For the next backfill script: `railway ssh --service watchlist-api`, then `python migrations/NNN_*.py`, *after* the deploy and inside the container (prod Postgres has no public networking, so `railway run` can't reach it).
- **Director filter + display** — `movie.directors` renders on MovieCard, and there's a single-select director filter (`filters.director: string | null` on `MovieView`) in FilterBar, backed by the client-derived `filterOptions.directors` computed (see Frozen Decisions).
- **API layer extracted + `useMovies` reworked** (see Frozen Decisions): all raw `fetch` calls in `useMovies`/`MovieSingle`/`AddMovie` now go through `client/src/api.ts`. State split into `movies`/`filterOptions`. Watched-toggle and delete patch the list in place; add calls `refreshMovies()`. `useAuth` still has its own inline fetches (optional follow-up — its `login` returns `false` instead of throwing, so it needs a slightly different shape).
- **MoviesIndex loading UI redone**: initial mount shows a centered `LoadingSpinner` + label, gated on a new `initialized` ref from `useMovies` (flips true after the first load settles — distinct from `loading`). Background refresh (add) dims the list (`opacity-40`) with an overlaid spinner instead of blanking it; FilterBar stays live. `display-options.ts` was deleted.
- **Watched / added-by UI is complete** (compact view toggle too): watched badge on MovieCard, `addedBy` in MovieMetaDl, watched toggle row on MovieSingle (optimistic PATCH `{ watched }` + revert-on-error, whole row clickable when authed, read-only when not), and a tri-state watched filter (`filters.watched: boolean | null` on `MovieView`) shown as an All/Watched/Unwatched pill group in FilterBar. `gen:types` already re-run. To make more fields PATCHable, extend the backend `MovieUpdate` model (`exclude_unset` partial updates, field names are the allowlist).
- **PillItem refactor:** now purely presentational — `interactive` + `active` props (was `selectable` + `peer-checked:*` classes). It no longer depends on a sibling `input.peer`; FilterItems passes `:active="selectedOptions.includes(...)"` and keeps the `peer-focus-visible` focus-ring classes in its own template. Known stale usage: `MovieDebgCard.vue` passes a nonexistent `:content` prop → renders empty pills.

# Project Handoff

Movie tracking/display app — Vue client + FastAPI/Postgres api. Everything is on `main` and working.

**Status:** the JSON-file → Postgres migration (the big in-flight effort) is **essentially done** — movies, genres, languages, and people/credits are all normalized in Postgres and the frontend talks to it. What's left is cleanup + new features (see Next steps).

**Where things live:** repo/backend/frontend structure → `AGENTS.md` (read every session). Dense data-layer detail (pool/cursor, migrations, `add_movie`, error handling, per-table normalization incl. people/credits) → `.agents/reference/backend.md` (read only when working in that area).

---

## Frozen Decisions

Settled — don't relitigate. This keeps the _why_ so rejected alternatives don't get re-proposed.

- **Backend = FastAPI + Pydantic, tooling = uv** (replaced Fastify/TypeBox). Rationale: Python practice + do the DB migration once, in Python.
- **Database = PostgreSQL**, driver **psycopg3**, raw SQL, **no ORM** (deliberate).
- **Migrations = manual numbered SQL + runner** (decided; _not_ yoyo/dbmate).
- **Posters:** store only the filename in the DB; files local at `/images` in dev, object storage (R2) in prod via `VITE_POSTER_BASE_URL`.
- **People/credits = one unified `movie_people` table** (not split cast/crew), coarse **`role`** not TMDB's raw `job`, source-material authors as their own `source` role, and crew selected by an explicit **`job` allowlist, never `department`** (the Writing department is polluted with storyboard crafts). Full rationale + mechanics in `.agents/reference/backend.md`.

---

## Next steps (priority order, as of 2026-07-01)

1. **Backend cleanup** — drop the two safety-net columns now that reads use the join tables: `movies.genres TEXT[]` and `movies.cast_members JSONB`, each with its dual-write in `add_movie`. Do them together (new migration `006_*`). Optionally fold in the connection-boilerplate refactor (the repeated `pool.connection()/cursor()` pair) while in there.
2. **Frontend updates** — render the new credits on the movie detail (`directors`/`writers`/`sourceAuthors` + `castMembers` now come from `GET /movies/{id}`; `MovieMetaDl.vue` is the natural home), plus the standing frontend todos below.
3. **Tests (none exist yet)** — set up unit + integration tests. Likely `pytest` + `pytest-asyncio` for the api against an ephemeral Postgres; good first targets are the transform/allowlist logic (`tmdb_people_transform`) and the `insert_movie_people` upsert. Frontend: TBD (Vitest).
4. **Hosting + auth** — host online. Model: **owner + partner authenticate to add/delete; the rest of the world gets read-only view access.** Implies auth on the write routes (`POST`/`DELETE /movies`) only, public `GET`s. Open questions: hosting target (Postgres host, R2 for posters), auth mechanism (shared/allowlisted accounts vs. a provider), how the client gates the add/delete UI. Not started — research phase.

---

## Frontend — todo

- **Render credits on the movie detail** — see Next step 2. Decide labels ("Directed by" / "Written by" / "Based on work by"). Crew arrays are `[]` when empty (check length); `castMembers` may be absent.
- **Toast leave animation** is jittery — try separate enter/leave translations; check `max-height` snapping; test multiple in sequence.
- **Loading state on MoviesIndex** is plain "LOADING" text — want spinner/skeleton. Open question: on `refresh()` (every add/delete) the whole list blanks to loading — decide whether to dim/overlay existing content instead and reserve full-blank for initial mount.
- **Error UI:** `useMovies()` exposes an `error` ref nothing consumes yet — wire it into MoviesIndex (MovieSingle already handles its own).
- **Re-check add UX** against the backend (poster returned ready; surface `issues[]` on failed poster).
- **Sort** by (field TBD); maybe revive display options (`client/src/display-options.ts`, retained but unimported).

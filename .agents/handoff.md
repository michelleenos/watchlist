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

## Auth (new — implemented as of 2026-07-10)

Model: **owner + partner authenticate to write; everyone else read-only.** Full plan + rationale in `auth_live_plan.md` (repo root). Phase 1 (backend) and most of Phase 2 (frontend) are done; **nothing is provisioned for production yet** — hosting (Railway/Netlify per the plan) is still open/todo.

- **Backend:** password login (two argon2 hashes via **pwdlib** in the `AUTH_USERS` env var, `username:hash;username:hash` — `;`-separated, commas appear inside argon2 hashes), stateless signed session cookie via Starlette `SessionMiddleware` (`session_secret`, `cookie_secure` settings; `COOKIE_SECURE=false` needed in dev over plain http).
- **`api/app/auth.py`:** `parse_auth_users`, `authenticate_user` (dummy-hash verify on unknown username to resist enumeration timing), `get_authenticated_user` dependency (401s; also rejects cookies naming removed users). Gates `POST /movies`, `DELETE /movies/{id}`, and both `/tmdb/*` routes (TMDB key protection) via decorator `dependencies=[...]`.
- **`api/app/routes/auth.py`:** `POST /auth/login` (401 on bad creds, same message for unknown user vs wrong password), `POST /auth/logout`, `GET /auth/me` — **`/me` always 200s**, returning the `AuthStatus` discriminated union (`Authenticated`/`Unauthenticated` in `models.py`, `Literal[True/False]` discriminant) so client TS narrows and logged-out isn't an error path.
- **Frontend:** `useAuth()` composable (same module-scope pattern as `useMovies`; `authState`, `login()` → bool, `logout()`, `refresh()`); `AuthFooter.vue` (slim footer: "log in" button → AppDialog login form, or "logged in as X · log out"), mounted in `App.vue`. AddMovie trigger (MoviesIndex) and delete section (MovieSingle) are `v-if="authState.authenticated"` — UX-gating only, API is the real enforcement.

---

## Next steps (priority order, as of 2026-07-10)

1. **Hosting** — provision + deploy per `auth_live_plan.md` Phases 3–4 (Railway api/Postgres/volume, Netlify client + `_redirects` proxy, data + poster migration). Also the deferred prod tweaks from plan 1.6 (images-dir mkdir in lifespan, `PORT` in Dockerfile CMD). All still up in the air — nothing provisioned.
2. **Backend cleanup** — drop the two safety-net columns now that reads use the join tables: `movies.genres TEXT[]` and `movies.cast_members JSONB`, each with its dual-write in `add_movie`. Do them together (new migration `006_*`). Optionally fold in the connection-boilerplate refactor (the repeated `pool.connection()/cursor()` pair) while in there.
3. **Frontend updates** — render the new credits on the movie detail (`directors`/`writers`/`sourceAuthors` + `castMembers` now come from `GET /movies/{id}`; `MovieMetaDl.vue` is the natural home), plus the standing frontend todos below.
4. **Tests (none exist yet)** — set up unit + integration tests. Likely `pytest` + `pytest-asyncio` for the api against an ephemeral Postgres; good first targets are the transform/allowlist logic (`tmdb_people_transform`) and the `insert_movie_people` upsert. Frontend: TBD (Vitest).

---

## Frontend — todo

- **Render credits on the movie detail** — see Next step 2. Decide labels ("Directed by" / "Written by" / "Based on work by"). Crew arrays are `[]` when empty (check length); `castMembers` may be absent.
- **Toast leave animation** is jittery — try separate enter/leave translations; check `max-height` snapping; test multiple in sequence.
- **Loading state on MoviesIndex** is plain "LOADING" text — want spinner/skeleton. Open question: on `refresh()` (every add/delete) the whole list blanks to loading — decide whether to dim/overlay existing content instead and reserve full-blank for initial mount.
- **Error UI:** `useMovies()` exposes an `error` ref nothing consumes yet — wire it into MoviesIndex (MovieSingle already handles its own).
- **Re-check add UX** against the backend (poster returned ready; surface `issues[]` on failed poster).
- **Sort** by (field TBD); maybe revive display options (`client/src/display-options.ts`, retained but unimported).
- **Extract shared style utilities** — duplicated Tailwind class strings are drifting (e.g. light borders, the input styling repeated in AddMovie search + AuthFooter login form). Extract simple generic classes/components and do a small audit of components to catch subtle differences.

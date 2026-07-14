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

---

## Next steps (priority order)

1. **Backend cleanup** — drop the two safety-net columns now that reads use the join tables: `movies.genres TEXT[]` and `movies.cast_members JSONB`, each with its dual-write in `add_movie`. Do them together (new migration `006_*`). Optionally fold in the connection-boilerplate refactor (the repeated `pool.connection()/cursor()` pair) while in there.
2. **Frontend updates** — render the new credits on the movie detail (`directors`/`writers`/`sourceAuthors` + `castMembers` now come from `GET /movies/{id}`; `MovieMetaDl.vue` is the natural home), plus the standing frontend todos + feature ideas below.
3. **Tests (none exist yet)** — set up unit + integration tests. Likely `pytest` + `pytest-asyncio` for the api against an ephemeral Postgres; good first targets are the transform/allowlist logic (`tmdb_people_transform`) and the `insert_movie_people` upsert. Frontend: TBD (Vitest).

Minor deferred prod tweak: mkdir `images_dir` in the api `lifespan` with `exist_ok=True` (currently the dir must already exist — fine in prod since the volume provides it, and in dev since `public/images` is committed). `PORT` in the Dockerfile CMD is already done.

---

## Frontend — todo + feature ideas

Standing todos:

- **Render credits on the movie detail** — see Next step 3. Decide labels ("Directed by" / "Written by" / "Based on work by"). Crew arrays are `[]` when empty (check length); `castMembers` may be absent.
- **Toast leave animation** is jittery — try separate enter/leave translations; check `max-height` snapping; test multiple in sequence.
- **Loading state on MoviesIndex** is plain "LOADING" text — want spinner/skeleton. Open question: on `refresh()` (every add/delete) the whole list blanks to loading — decide whether to dim/overlay existing content instead and reserve full-blank for initial mount.
- **Error UI:** `useMovies()` exposes an `error` ref nothing consumes yet — wire it into MoviesIndex (MovieSingle already handles its own).
- **Re-check add UX** against the backend (poster returned ready; surface `issues[]` on failed poster).
- **Sort** by (field TBD); maybe revive display options (`client/src/display-options.ts`, retained but unimported).
- **Extract shared style utilities** — duplicated Tailwind class strings are drifting (e.g. light borders, the input styling repeated in AddMovie search + AuthFooter login form). Extract simple generic classes/components and do a small audit of components to catch subtle differences.

New feature ideas (owner, being considered — not yet scoped):

- **Condensed view option** — a toggle to switch the movie index into a compact list (no posters, tighter rows) as an alternative to the current card grid.
- **"Added by" and "watched" columns** per movie — surface who added a movie and whether it's been watched. (Likely needs backend/schema support — new columns + response fields — decide the data model first.)
- **Director info on the frontend** — part of the credits-rendering work (Next step 3); make sure director is prominent.

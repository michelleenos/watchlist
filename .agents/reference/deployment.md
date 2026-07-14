# Deployment (Railway)

Stable reference for how the app is hosted in production. Read when doing infra/deploy/env work; not needed every session.

## Where it runs

The **entire app is on Railway**, one project (`watchlist`), one `production` environment, three services:

| Service              | What it is                                                                                  | Source                                     |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `watchlist-api`      | FastAPI/uv api, Dockerfile build (`/api/Dockerfile`)                                        | repo `michelleenos/watchlist`, root `/api` |
| `fortunate-presence` | Vue client built to `dist`, served by **Caddy** (`/client/Dockerfile` + `client/Caddyfile`) | repo, root `/client`                       |
| `Postgres`           | managed Postgres 18 (`ghcr.io/railwayapp-templates/postgres-ssl:18`)                        | template image                             |

> **We did NOT go with the earlier Netlify plan for the client.** The client is a Railway service behind Caddy. R2/object storage for posters was also abandoned — posters live on a Railway volume (below).

## Request flow

The client (Caddy) is the only public entry point. Its `Caddyfile`:

- `handle_path /api/*` → strips `/api`, reverse-proxies to `watchlist.railway.internal:8080` (the api, over Railway's **private** network).
- `handle /images/*` → reverse-proxies to the same api (no strip); api serves them from its `StaticFiles` mount.
- everything else → serves the Vite `dist` SPA with `try_files … /index.html` for client-side routing.
- Global options: `admin off`, `auto_https off` (Railway terminates TLS at the edge), `persist_config off`, trusts Railway's proxy ranges.

So the browser only ever sees the client's origin; `/api` and `/images` are same-origin and proxied. This is why the api needs **no** CORS middleware.

## Posters / volume

- Volume `watchlist-volume` (5 GB) is mounted on **`watchlist-api`** at **`/data/images`**.
- The api's `IMAGES_DIR=/data/images`, so `download_poster()` writes straight to the volume; `app.mount("/images", StaticFiles(directory=settings.images_dir))` serves them. Caddy proxies `/images/*` here.
- **Backfill script:** `api/migrations/backfill_posters.py` re-downloads every poster from TMDB (each movie row stores `tmdb_poster_path`) into `IMAGES_DIR`. Idempotent (skips existing unless `replace=True`). But shouldn't need to be re-run.

## Running scripts / one-offs in the container

The volume and prod env vars only exist **inside** the running api container, so one-offs must run there, not via `railway run` (which runs locally with prod vars and would write to the wrong filesystem).

```bash
railway ssh --service watchlist-api
# inside (WORKDIR /app, venv is first on PATH so bare `python` works):
python -m migrations.backfill_posters   # module path uses dots, not slashes
python -m migrations.migrate            # migrations are NOT auto-run on deploy start…
```

Note: the api's deploy config has a **preDeployCommand `python -m migrations.migrate`**, so pending migrations DO run on each deploy (before the new version goes live).

## Environment variables (production)

- `watchlist-api`: `DATABASE_URL` (points at `postgres.railway.internal` — **private**), `IMAGES_DIR=/data/images`, `SESSION_SECRET`, `AUTH_USERS`, `TMDB_API_KEY`. `COOKIE_HTTPS_ONLY` is unset → defaults `True` (correct for prod).
- `Postgres`: standard template vars. `DATABASE_PUBLIC_URL` exists as a template var but public networking is **off** (see below).

## Security posture (hardened 2026-07-13)

Done this session:

- **Postgres public networking removed** (TCP proxy deleted). api reaches DB privately, so nothing broke.
- **`watchlist-api` public domain removed** — the API is now only reachable through Caddy over the private network. Removes a Caddy-bypassing door to `/auth/login`, `POST /movies`, and `/tmdb/*`.
- **Postgres password rotated** (cascades to `DATABASE_URL` via references; api picks it up on redeploy).
- `SESSION_SECRET` confirmed strong/random. 2FA enabled on the Railway account.

Auth is enforced server-side regardless (see `.agents/reference/auth.md`); the above is defense-in-depth + attack-surface reduction.

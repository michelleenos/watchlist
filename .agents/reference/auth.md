# Auth

Stable reference for the auth implementation. Read when working on auth/login/session code; not needed every session.

**Model:** owner + partner authenticate to write; everyone else is read-only. Implemented and live in production (see `.agents/reference/deployment.md`).

## Backend

- Password login
- Stateless signed **session cookie** via Starlette `SessionMiddleware` in `main.py`: `same_site="lax"`, `https_only=settings.cookie_https_only` (`COOKIE_HTTPS_ONLY` defaults `True`; set `false` in dev over plain http). Secret from `settings.session_secret`.
- **`api/app/auth.py`:**
    - `parse_auth_users` — parses `AUTH_USERS`.
    - `authenticate_user` — dummy-hash verify on unknown username to resist enumeration timing.
    - `get_authenticated_user` — FastAPI dependency; 401s when unauthenticated, and also rejects cookies naming a user who's since been removed from `AUTH_USERS`.
    - Gates `POST /movies`, `DELETE /movies/{id}`, and **both `/tmdb/*` routes** (protects the TMDB key from being used as a free proxy) via `dependencies=[...]`.
- **`api/app/routes/auth.py`:**
    - `POST /auth/login` — 401 on bad creds; **same message** for unknown user vs wrong password. **Rate-limited** (`app/rate_limit.py`): in-memory sliding-window log keyed by client IP, 5 failed attempts / 5 min → `429` + `Retry-After`; only *failed* logins count, success doesn't clear the record. Client IP comes from Caddy's `X-Real-IP` header (`get_client_ip`), set via `header_up X-Real-IP {client_ip}` in `client/Caddyfile`. State is per-process/in-memory (wiped on restart/redeploy), fine for the single api instance.
    - `POST /auth/logout`.
    - `GET /auth/me` — **always 200s**, returning the `AuthStatus` discriminated union (`Authenticated`/`Unauthenticated` in `models.py`, `Literal[True/False]` discriminant) so client TS narrows and logged-out is not an error path.

## Frontend

- `useAuth()` composable — same module-scope shared-instance pattern as `useMovies`; exposes `authState`, `login()` → bool, `logout()`, `refresh()`.
- `AuthFooter.vue` — slim footer: "log in" button → `AppDialog` login form, or "logged in as X · log out". Mounted in `App.vue`.
- AddMovie trigger (MoviesIndex) and the delete section (MovieSingle) are `v-if="authState.authenticated"` — **UX-gating only; the API is the real enforcement.**

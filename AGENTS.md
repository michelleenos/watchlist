**Always read `.agents/handoff.md` at the start of a new session.**

## Movie Tracking Project

A movie tracking/display app.

pnpm workspace monorepo:

- `client/` (Vue 3 + Vite + Tailwind)
- `server/` (Fastify + TypeScript)
    - A database migration from the current JSON file storage to PostgreSQL is planned — see `.agents/handoff.md` for current state, decisions, and in-progress work.

---

## User instructions

Do not make edits unless the user explicitly directs you to. For example:

- "Configure tests for the DELETE handler" -> go for it, start writing & wiring up the tests.
- "How should I configure tests for the DELETE handler?" -> do not make edits, just respond in chat with examples and explanation.

# voluntail

Discovery platform for animal shelters (Netherlands-first). Monorepo:

| Directory | Stack |
|-----------|--------|
| [`backend/`](backend/) | Kotlin, Ktor, Supabase Postgres (optional), GitHub Actions tests |
| [`frontend/`](frontend/) | React, TypeScript, Vite, TanStack Query, Mapbox |
| [`docs/`](docs/) | [Product/engineering prompt](docs/prompts/VOLUNTAIL_PROMPT.md), [ADRs](docs/adr/README.md) |

## Branches and production deploys

- **`main`** — Default branch for day-to-day work. Merge small PRs here after you are happy locally; CI runs on every push/PR to `main` (see [CI](#ci)).
- **`production`** — **Release** branch for **hosted** environments. Point **Railway** (Ktor API) and, if you use a gated frontend deploy, **Vercel** (or your host) at `production`, not `main`, so a merge to `main` does not automatically roll out to users. **When a batch of changes is ready to ship,** merge (or fast-forward) `main` into `production` to trigger a production deploy on those hosts. That bundles releases and keeps integration on `main` from needing to be “always deployable to prod” the same day.

If you open **pull requests against `production`**, CI is configured to run for that branch as well. Feature development still typically targets `main` first, then you promote to `production` for a release.

## At a glance: hosting (no secrets in git)

| Piece | Where it runs | Config |
|--------|----------------|--------|
| **API (Ktor)** | e.g. [Railway](https://railway.app) using [`backend/Dockerfile`](backend/Dockerfile) | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `CORS_ORIGINS`, `CMS_API_KEY`, etc. — see [`backend/.env.example`](backend/.env.example) |
| **DB** | e.g. Supabase (Postgres) | Migrations in [`backend/supabase/migrations/`](backend/supabase/migrations/) (run in name order) |
| **Web (SPA)** | e.g. Vercel, `frontend/` build | `VITE_MAPBOX_ACCESS_TOKEN` required; do **not** put `VITE_CMS_API_KEY` in a public end-user build — see [`frontend/.env.example`](frontend/.env.example). In production the app calls same-origin [`/api/...`](frontend/src/api/animals.ts); the static host must **proxy or rewrite** `/api` to your Ktor public URL, or the client must use a configured API base. |

## Local dev

1. **Backend:** from `backend/`, set env per [`backend/.env.example`](backend/.env.example), then `./gradlew run` (JDK 21).
2. **Frontend:** from `frontend/`, `npm install` and `npm run dev`. Vite proxies `/api` to `http://localhost:8080`.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs backend tests and frontend lint + production build on **push/PR to `main`, `master`, or `production`.**

## RELEASES
- test versions for now
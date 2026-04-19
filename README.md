# voluntail

Discovery platform for animal shelters (Netherlands-first). Monorepo:

| Directory | Stack |
|-----------|--------|
| [`backend/`](backend/) | Kotlin, Ktor, Supabase Postgres (optional), GitHub Actions tests |
| [`frontend/`](frontend/) | React, TypeScript, Vite, TanStack Query, Mapbox |

## Local dev

1. **Backend:** from `backend/`, set env per [`backend/.env.example`](backend/.env.example), then `./gradlew run` (JDK 21).
2. **Frontend:** from `frontend/`, `npm install` and `npm run dev`. Vite proxies `/api` to `http://localhost:8080`.

## CI

[`/.github/workflows/ci.yml`](.github/workflows/ci.yml) runs backend tests and frontend lint + production build on push/PR to `main` or `master`.

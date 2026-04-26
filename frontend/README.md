# Voluntail frontend

React, TypeScript, and Vite SPA for the Voluntail [monorepo](../README.md). The dev server proxies [`/api` to the Ktor backend](vite.config.ts) on `http://localhost:8080`. In production, the same path must be served (e.g. reverse proxy or rewrite to the public API) or the client must use a configured `VITE_*` API base — see [At a glance: hosting in the root README](../README.md#at-a-glance-hosting-no-secrets-in-git).

- **Map:** [Mapbox](https://mapbox.com) — `VITE_MAPBOX_ACCESS_TOKEN` in [`.env.example`](.env.example)
- **Styling:** Tailwind CSS and shadcn-style primitives under `src/components/ui/`
- **Data:** [TanStack Query](https://tanstack.com/query), fetch in `src/api/`

`npm run dev` — Vite. `npm run test` and `npm run build` match [CI on `main` and `production`](../.github/workflows/ci.yml).

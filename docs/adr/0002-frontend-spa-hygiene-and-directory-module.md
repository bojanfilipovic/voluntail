# 0002 — Frontend hygiene (strict TS, CI tests, `directory/`, form patterns)

**Status:** Accepted  
**Date:** 2026-04-22

## Context

The SPA is a Vite + React 19 + TanStack Query + Mapbox + shadcn client. Goals: same rigor as backend (types + CI gates + clear module seams), no extra ops, and no reliance on in-file `eslint-disable` in **application** forms for the React 19 `react-hooks/set-state-in-effect` rule.

## Decision

1. **TypeScript** [`frontend/tsconfig.app.json`](../../frontend/tsconfig.app.json) enables **`strict: true`** (industry default for new TS; catches null/flow issues at compile time).
2. **CI** [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs **`npm run test`** in the frontend job in addition to lint and build, so unit tests cannot silently rot.
3. **Directory / URL** — public URL behavior for the map/directory vs Explore lives under [`frontend/src/directory/`](../../frontend/src/directory/):
   - [`urlState.ts`](../../frontend/src/directory/urlState.ts) for `?view=explore` and `replaceState` (single place for the contract).
   - [`DirectoryLayout.tsx`](../../frontend/src/directory/DirectoryLayout.tsx) for the two-column **map + list** shell; [`App.tsx`](../../frontend/src/App.tsx) remains the app shell, queries, and shared modals (Explore and directory must share the same animal-selection behavior).
4. **CMS / map dialogs** — no `setState` inside `useEffect` to “hydrate” or sync map draft position:
   - **Add shelter:** position fields use **keyed** remount when the draft pin changes + **FormData** for lat/lon; other fields stay controlled.
   - **Edit shelter / animal:** inner form mounts only when `open && entity` with a **`key` on `entity.id`** so initial state is derived in `useState(…)` on each open.
5. **ESLint** — [`eslint.config.js`](../../frontend/eslint.config.js) keeps a **scoped** `react-refresh/only-export-components: off` only for [`src/components/ui/`](../../frontend/src/components/ui) (shadcn-style primitives). Documented in-file; not applied to app feature code.
6. **Unit tests** — new [`urlState.test.ts`](../../frontend/src/directory/urlState.test.ts) for the public URL switch; existing Vitest pure-function tests unchanged.

## Consequences

- Refactors in **forms** and **`DirectoryLayout`** need manual check of: map placement, add shelter flow, edit dialogs, deep link `?view=explore`, and animal open from **Explore** vs directory list.
- Slightly more files under `src/directory/`; **no** new runtime dependencies for this ADR.

**Deferred:** component tests (Testing Library) beyond pure logic; Prettier/Storybook/E2E.

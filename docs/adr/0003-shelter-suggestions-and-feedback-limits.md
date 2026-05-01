# 0003 — Shelter suggestions table, public POST, peer-feedback inbox scale

**Status:** Accepted  
**Date:** 2026-05-01

## Context

Voluntail needs a **public** way to nominate shelters for the map (“Suggest Shelter”) without coupling that flow to the generic peer-feedback inbox. Pilot constraints: **near-zero DevOps**, **no RBAC** for review (triage via Supabase for now), and **rate limiting** via row caps like existing `peer_feedback`.

Separately, the previous peer-feedback cap (50 rows, hard ceiling) felt **too tight** for an optimistic pilot narrative once feedback picks up.

## Decision

1. **New table** `public.shelter_suggestions` (migration `backend/supabase/migrations/20260501120000_create_shelter_suggestions.sql`):
   - **Required data model alignment:** `name`, `latitude`, `longitude` are the minimum viable submission (maps pin + label).
   - Optional goodwill fields: `description`, `city`, `species_note` (plain text, **no** allowlist CHECK — users may name species not yet in the product enum), optional URLs, optional `contact`.
   - **`status`** stored as PostgreSQL **`shelter_suggestion_status`** ENUM (`pending`, `reviewed`, `rejected`, `imported`) with default `pending` — flip in SQL / Supabase when reviewing.
   - **RLS enabled**, no policies (same posture as `shelters` / `peer_feedback`).

2. **Public API:** `POST /api/shelter-suggestions` — **201** body matches **`SuggestionCreatedResponse`** (`id`, `createdAt`) used by `POST /api/suggestions`. Returns **503** if `DB_URL` is unset (same wiring pattern as peer feedback). Returns **429** when the shelter-suggestion row cap is reached.

3. **Environment limits:**
   - **`SHELTER_SUGGESTIONS_MAX_ROWS`** — default **75**, env clamped to **50..100** (see `io.shelters.shelterSuggestionsMaxRows`).
   - **`PEER_FEEDBACK_MAX_ROWS`** — default **1000**, clamped **1..1000** (see `io.feedback.peerFeedbackMaxRows`). Supersedes the earlier **50 / ceiling 50** behavior.

4. **Deferred:** authenticated listing or CMS-key **GET** for shelter suggestions; curator UI. Review via Supabase table editor until then.

## Consequences

- Apply the new migration on dev, then prod, with the usual workflow (`backend/supabase/migrations/` only).
- Public shelter nominations **do not** create `shelters` rows — promotion stays a manual CMS step (`POST /api/shelters`) respecting existing uniqueness (`name` + `city`).
- Higher feedback inbox volume is possible without redeploy; tune via `PEER_FEEDBACK_MAX_ROWS` if needed.

**Code:** `io.shelters.ShelterSuggestionRoutes`, `io.shelters.persistence.ExposedShelterSuggestionRepository`, `io.shelters.ShelterSuggestionsMaxRows`, `io.feedback.PeerFeedbackMaxRows`, `io.voluntail.ApplicationRepositories`, `io.voluntail.Routing`.

<!--
  Archived baseline — the prompt used when starting the MVP/roadmap planning thread.
  For current work, prefer VOLUNTAIL_PROMPT.md
-->

# Voluntail — original baseline prompt (archived)

Act as a Staff Software Engineer and architecture peer. I am building Voluntail: a centralized discovery platform connecting humans with animal shelters (dog/cat/reptile/etc.) in the Netherlands. Pilot shelters: DOA (dog/cat/rabbit) and ROZ (reptiles). I am an experienced backend engineer (Kotlin/Spring background) but shipping this as an indie project: optimize for shipping speed, maintainability, near-zero DevOps, and strict domain boundaries (directory vs CMS vs future auth/matching).

Do not recommend changing the locked stack below unless I explicitly ask. When you propose options, weigh trade-offs (complexity, migration cost, operational burden) like a staff engineer would; skip beginner tutorials. Prefer concise, expert-level guidance, concrete file-level pointers, small code snippets, and architectural review where useful.

# Vision guardrails (read first)

- V1 goal: trustworthy **map + directory + shelter detail** with outbound links (volunteer signup, donation, later: website/social).
- Icebox (do **not** build unless the task explicitly says so): swipe matching, AI personas, in-app payments/gamification, shelter RBAC, scraping, email product.

# Locked-in stack & infrastructure

- Backend: Kotlin + Ktor (REST). Public reads; CMS writes use a shared secret header.
- Frontend: React + TypeScript + Vite (SPA). TanStack Query for server state.
- Map/UI: Mapbox via react-map-gl. **Planned styling stack:** Tailwind CSS + shadcn/ui for new UI work and refactors (not all present in repo yet—follow existing patterns until a deliberate UI migration).
- Database: Supabase (PostgreSQL). Schema/migrations live under backend/supabase/migrations/.
- Deployment intent: Vercel (frontend) + Railway/Render (backend, Docker).

# Repository layout (monorepo)

```
voluntail/
├── backend/          # Ktor (build.gradle.kts), env: see backend/.env.example
└── frontend/         # Vite React (package.json); dev proxy /api → backend (vite.config.ts)
```

# Runtime facts (do not hallucinate endpoints)

- GET /api/shelters — public, no auth.
- POST /api/shelters, DELETE /api/shelters/{id} — require X-CMS-Key matching CMS_API_KEY on server; if CMS_API_KEY unset, mutations are disabled (403).
- Persistence: if DB_URL is unset/empty → InMemoryShelterRepository seeded from ShelterSamples.kt (local dev convenience). If DB_URL set → Postgres via Exposed (SheltersTable + ExposedShelterRepository).
- Frontend sends CMS key via VITE_CMS_API_KEY when present (frontend/src/api/shelters.ts).

# Engineering constraints

- Prefer minimal diffs; match existing naming, layering (routes → repository → persistence), and serialization style.
- Schema changes: add SQL migration + update Kotlin models/repos + frontend types; keep samples/migrations loosely aligned for offline dev.
- Never weaken CMS protection on mutations; keep reads public for V1.
- Single source of truth for production content: DB migrations/seeds; Kotlin samples only mirror dev/offline parity when useful.

# Roadmap framing (for design decisions only)

**V1 (ship now):** split map + list; shelter detail modal; manual/curation workflows (Supabase dashboard + optional API CMS); static outbound links.  
**V2+ (icebox):** swipe matching, AI, in-app donations, shelter admin/RBAC, events on map.

# Current Task

For the task below: (1) plan the work, (2) outline steps/risks, (3) estimate blast radius (rough file count and whether touch points are localized or cross-cutting), (4) then specify diffs or ask for strict confirmation before building anything.

I am currently working on: evaluating the current state of the project, and trying to figure out the next immediate (bigger) feature-set. I want to tackle v1 of animal matching (via react cards) since it sounds like a nice thing to add after animal set data, but I want your overview and plan on these things:

- is this prompt still valid or does it warrant an update?
- how far along the MVP are we and what should be the next steps?
- what are some quick wins we can achieve for MVP?
- does the icebox or other feature-set need updating?
- any other concerns or missing features that require adding at this stage, that will make our lives easier later on? think as staff and architect but also from product perspective, its my passion project and I want to get it out live asap so I can start getting feedback

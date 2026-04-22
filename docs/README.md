# Voluntail documentation

| Path | Purpose |
|------|--------|
| [prompts/](prompts/) | **Product & engineering handoff prompts** — `VOLUNTAIL_PROMPT.md` is the canonical, day-to-day one. |
| [adr/](adr/) | **Architecture / environment decisions** (ADRs) — one file per important decision. |

**Workflow:** when you **ship** or **explicitly defer** work that changes architecture, environment, **security boundaries**, or **public API** behavior, update the canonical prompt and add or amend an ADR. Use `git log` when backfilling rationale.

For a **wider** backlog and “plan remainder” (short wins vs long features not fully itemized in the prompt), use the plan doc in **Cursor**: `.cursor/plans/voluntail_mvp_assessment_4b72e3c6.plan.md` (section *Plan remainder*).

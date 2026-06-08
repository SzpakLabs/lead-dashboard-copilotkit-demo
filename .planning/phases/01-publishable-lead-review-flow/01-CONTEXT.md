# Phase 1: Publishable Lead Review Flow - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the existing main lead dashboard demonstrable as a publishable portfolio flow. It should prove that the documented demo route opens cleanly, seeded data is safe and representative, a lead can be reviewed or moved through a visible status action, and the first viewport is strong enough for outreach.

This phase does not add new ingestion channels, production auth, broad analytics, assistant expansion, or a redesign. Those belong to later phases or deferred specs.

</domain>

<decisions>
## Implementation Decisions

### Demo Route And Readiness

- **D-01:** Treat `/` as the primary publishable route for Phase 1. It should open into the existing Service Ops Console with the global shell, metrics strip, filter rail, lead ledger, dense mode control, search, theme, assistant entry state, and new intake action intact.
- **D-02:** The documented demo environment for Phase 1 is local or deployed with the existing PostgreSQL-backed demo workspace. If private credentials are absent, the non-assistant dashboard must still open cleanly and the assistant should remain optional rather than blocking the route.
- **D-03:** Phase 1 should fix crashes, broken data assumptions, empty or embarrassing first-screen states, and missing fallback behavior before any polish work.

### Seed Data Shape

- **D-04:** Expand `src/lib/db/seed.ts` around a deterministic seed anchor rather than current fixed sparse examples. The seed should cover roughly two months before and two months after the anchor, enough to populate the lead ledger and support later calendar/report verification.
- **D-05:** Every person name in seed data, examples, browser checks, form input, chat prompts, and documentation examples must include `Test`. This is a hard safety requirement.
- **D-06:** Seed data should stay idempotent for the `software-services-demo` workspace and should use configured workspace source definitions rather than hard-coded UI-only source options.
- **D-07:** Representative Phase 1 leads must show budget, urgency or timeline, service type, source, status, next step, and follow-up timing where available. Include varied statuses, budgets, review states, source artifacts, custom fields, follow-ups, scheduled work, completed work, overdue work, and activity so the first viewport reads as a real operating queue.

### Review And Status Proof

- **D-08:** The Phase 1 proof point should use the already-built lead preview/review/status surfaces instead of introducing a new workflow. Console lead rows should open the reusable preview, and one visible review or status action should update UI or persisted demo state.
- **D-09:** Lead review should remain human-controlled. Missing or uncertain extracted fields should stay explicit rather than being invented to make the demo look complete.
- **D-10:** If there is a tradeoff between intake and review during Phase 1, prioritize the review/status loop because the phase goal is a publishable lead review flow. Intake remains available through the existing action, but new intake scope belongs only where needed to demonstrate the loop.

### First Viewport Quality

- **D-11:** The first viewport should communicate "lead operations console" immediately: meaningful metrics, a populated ledger, clear queue pressure, readable status/source/next-step data, and no permanent side inspector stealing attention.
- **D-12:** Fix visual issues that would weaken GitHub, LinkedIn, Upwork, or direct outreach screenshots: clipped dialogs, unreadable dark-mode surfaces, overlapping text, sparse demo data, awkward empty states, and broken navigation.
- **D-13:** Do not redesign the product direction. Preserve the dense operational console baseline from the active Kiro spec and only tune what blocks a professional first impression.

### Verification Scope

- **D-14:** Run `npm run check` when feasible and treat it as the main automated gate for Phase 1.
- **D-15:** Use targeted browser verification for the Phase 1 story: dashboard opens, lead preview opens/closes, preview opens full page if needed, one review/status action updates, first viewport is professional, and mobile does not clip controls.
- **D-16:** If database credentials or external environment setup block full browser verification, document the blocker in verification evidence rather than hiding it. Do not use realistic names while testing.

### the agent's Discretion

- The agent may choose the exact seed anchor and distribution strategy as long as it is deterministic, idempotent, and covers the required four-month window.
- The agent may choose the specific representative leads and statuses, but names must be test-safe and the resulting dashboard must support the lead review story.
- The agent may choose whether Phase 1 uses a seeded existing lead review or a newly ingested draft, with preference for the lower-risk path that best proves the publishable workflow.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### GSD Project Scope

- `.planning/PROJECT.md` — Project value, current state, constraints, and active publication goal.
- `.planning/REQUIREMENTS.md` — Phase 1 requirement IDs and safety/packaging requirements.
- `.planning/ROADMAP.md` — Phase 1 boundary, success criteria, and phase sequencing.
- `.planning/STATE.md` — Current focus and next workflow state.

### Active Product Spec

- `.kiro/specs/README.md` — Active spec selection and deferred spec boundaries.
- `.kiro/specs/lead-workflow-ux-upgrade/requirements.md` — Active UX requirements and verification criteria.
- `.kiro/specs/lead-workflow-ux-upgrade/design.md` — Console, preview, seed, assistant, dark mode, and verification design direction.
- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md` — Completed work and remaining demo data plus verification tasks.

### Durable Steering

- `.kiro/steering/product.md` — Product positioning, demo core scope, and product rules.
- `.kiro/steering/tech.md` — Stack, architecture, AI/ingestion, and safety constraints.
- `.kiro/steering/structure.md` — Repository boundaries, documentation rules, and future structure.

### Codebase Maps

- `.planning/codebase/STRUCTURE.md` — Route/component/domain layout and integration points.
- `.planning/codebase/STACK.md` — Next.js, Drizzle, CopilotKit, Tailwind, and script details.
- `.planning/codebase/TESTING.md` — Existing test strategy, gaps, and data safety patterns.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `app/page.tsx`: Primary console route already loads source definitions, filters, metrics, lead rows, and selected-lead preview data.
- `src/components/dashboard/app-shell.tsx`: Existing global shell owns navigation, search, theme, assistant state, and intake actions.
- `src/components/dashboard/lead-workspace.tsx`: Existing console UI includes metrics, filter rail, lead ledger, preview content, dense mode, status/source display, next steps, and review state primitives.
- `src/components/dashboard/lead-preview-dialog.tsx`: Reusable preview dialog already closes by removing `leadId` from the URL.
- `src/lib/db/seed.ts`: Current seed is the main Phase 1 data expansion target; it already creates workspace, user, source definitions, contacts, ingestion events, leads, custom fields, follow-ups, and activity.
- `src/lib/domain/leads/`, `src/lib/domain/followups/`, `src/lib/domain/sources/`, and `src/lib/domain/calendar/`: Domain modules should remain the mutation and data behavior boundary.

### Established Patterns

- Next.js App Router pages and route handlers live under `app/`; shared components and domain logic live under `src/`.
- TypeScript strict mode and Zod-backed schemas are expected.
- Writes should flow through domain functions or thin API route handlers, not direct component-level mutation logic.
- Styling uses Tailwind with local shadcn-style primitives and lucide icons.
- Dark mode is class-based and initialized globally.
- Tests are Vitest-focused, mostly around deterministic domain and ingestion logic. Browser verification is not currently represented by committed Playwright tests.

### Integration Points

- `package.json` exposes `npm run check` and seed/reset scripts: `npm run db:seed` and `npm run db:reset-demo`.
- `app/api/leads/[leadId]/status/route.ts`, `app/api/leads/[leadId]/route.ts`, and related follow-up/custom-field routes support the review/status proof.
- `src/lib/domain/sources/manage-sources.ts` and `app/api/sources/**` support source definitions that seed data and filters should use.
- `src/lib/domain/reports/` and `src/lib/domain/calendar/` are later-phase consumers of the denser seed data, so Phase 1 seed design should not make those surfaces meaningless.

</code_context>

<specifics>
## Specific Ideas

- Use the software-services demo workspace as the first portfolio story because it matches dogfooding and client outreach.
- Keep deterministic extraction and seeded data as the reliable public-demo path.
- Make the lead ledger populated enough that the first screenshot does not look like a toy fixture.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 1-Publishable Lead Review Flow_
_Context gathered: 2026-06-08_

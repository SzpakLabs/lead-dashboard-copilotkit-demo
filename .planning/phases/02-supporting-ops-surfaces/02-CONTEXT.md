# Phase 2: Supporting Ops Surfaces - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the supporting lead operations surfaces credible for the portfolio demo. It should prove that lead preview and full detail preserve workflow context, calendar/report/forecast views explain workload and pipeline value, and the assistant is either safely available or cleanly disabled when credentials are absent.

This phase does not add new integrations, production auth, a custom assistant framework, a redesign, broad analytics expansion, or deployment packaging. Phase 3 handles documentation, setup, verification evidence, and shareable deployment or local demo packaging.

</domain>

<decisions>
## Implementation Decisions

### Carry Forward From Phase 1

- **D-01:** Treat `/` as the primary demo entry point and keep the existing Service Ops Console direction. Phase 2 should strengthen supporting routes and flows around that story, not replace the console.
- **D-02:** Preserve deterministic extraction, seeded demo data, and the `software-services-demo` workspace as the reliable public-demo path.
- **D-03:** All test, seed, documentation, browser, form, chat, and assistant example person names must include `Test`.
- **D-04:** If credentials are missing, the non-assistant demo must still work. Assistant behavior should be optional and clearly disabled rather than blocking pages.

### Preview And Lead Detail Inspection

- **D-05:** Use the existing reusable lead preview surface as the shared quick-inspection interaction for console rows, calendar events, and search results. Do not reintroduce a permanent side inspector on the console.
- **D-06:** The preview should stay concise: summary, status, source, next step, due follow-up, recent context, and actions to close, edit, add follow-up, change status where available, or open the full lead page.
- **D-07:** Full lead detail remains the focused workspace for deeper work. Its tabbed structure should preserve existing review, edit, follow-up, source, activity, custom field, and full-view behavior rather than adding a new detail model.
- **D-08:** Browser verification should check that preview open/close and `Open full page` preserve context on desktop and mobile, with no clipped controls or route confusion.

### Calendar, Reports, And Forecast Story

- **D-09:** Calendar should explain internal lead-related workload from existing lead/follow-up dates. It should not imply external calendar sync or availability beyond dashboard data.
- **D-10:** Reports should be compact, visual, and read-only by default. They should summarize lead volume, status mix, source mix, review workload, overdue/upcoming follow-ups, scheduled/completed work, outcomes, and bottlenecks where data exists.
- **D-11:** Forecasts should be deterministic estimates, not accounting truth. They must distinguish confirmed won value from weighted and optimistic pipeline estimates.
- **D-12:** Missing budgets, low confidence, unresolved review fields, and timing assumptions should remain visible in report/forecast output. Unknown values should stay unknown rather than being coerced into fake certainty.
- **D-13:** Use seeded data density from Phase 1 as the main source of report/calendar confidence. Do not expand into a separate analytics product in this phase.

### Assistant Safety And Availability

- **D-14:** Keep CopilotKit as the only assistant framework. Do not add a parallel chat state machine or custom assistant runtime.
- **D-15:** Assistant tools must remain typed with Zod contracts and routed through domain/read-model functions. Mutative tools must keep preview/apply or explicit confirmation behavior and write assistant action logs.
- **D-16:** Assistant entry points should exist on primary pages, but missing `LEAD_ASSISTANT_ENABLED` or provider API keys should render a clean disabled state with actionable setup text.
- **D-17:** Assistant report and forecast output should use the existing CopilotKit-compatible visual renderers. If configured credentials are not available during verification, document the disabled state instead of blocking phase completion.
- **D-18:** Availability answers must stay framed as "Based on this dashboard" until external calendar sync exists.

### Verification Priority

- **D-19:** Treat this phase as verification and hardening around already-built active-spec work. The active spec task list shows implementation mostly complete; remaining value is proving the flows and fixing blockers found during checks.
- **D-20:** Run `npm run check` when feasible. Then use targeted browser checks for calendar preview, lead tabs, settings sources/custom fields, global search, dense mode, dark mode, assistant availability, report/forecast behavior or disabled state, and desktop/mobile clipping.
- **D-21:** If a database, assistant credential, or deployment prerequisite blocks a check, record the blocker plainly for Phase 3 packaging instead of creating fake success evidence.
- **D-22:** Verification should use test-safe lead names such as `Maria Test`, `Carlos Test`, `Alex Test`, or `Test User`.

### the agent's Discretion

- The agent may choose the exact browser-check order and whether to fix small blockers inline during Phase 2 planning/execution.
- The agent may decide whether report and forecast verification uses assistant prompts with configured credentials or direct domain/report surfaces when credentials are unavailable.
- The agent may choose the specific seeded records used in checks, as long as all person names include `Test` and the selected records exercise preview, detail, calendar, report, and forecast paths.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### GSD Project Scope

- `.planning/PROJECT.md` - Project value, current state, constraints, and active publication goal.
- `.planning/REQUIREMENTS.md` - Phase 2 requirement IDs: LEAD-04, LEAD-05, SAFE-02, SAFE-03, SAFE-04.
- `.planning/ROADMAP.md` - Phase 2 boundary, success criteria, and phase sequencing.
- `.planning/STATE.md` - Current focus and workflow state.
- `.planning/phases/01-publishable-lead-review-flow/01-CONTEXT.md` - Prior decisions on demo route, seed safety, review-first proof, and verification standards.

### Active Product Spec

- `.kiro/specs/README.md` - Active spec selection and deferred spec boundaries.
- `.kiro/specs/lead-workflow-ux-upgrade/requirements.md` - Active UX requirements, assistant/report/forecast scope, and verification acceptance criteria.
- `.kiro/specs/lead-workflow-ux-upgrade/design.md` - Lead preview, detail tabs, settings, search, dense mode, dark mode, assistant, reports, forecasts, seed data, and verification direction.
- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md` - Completed implementation work and remaining verification tasks.

### Durable Steering

- `.kiro/steering/product.md` - Product positioning, demo core scope, and product rules.
- `.kiro/steering/tech.md` - Stack, architecture, AI/ingestion, data, assistant, and safety constraints.
- `.kiro/steering/structure.md` - Repository boundaries, documentation rules, and future structure.

### Codebase Maps

- `.planning/codebase/STACK.md` - Next.js, Drizzle, CopilotKit, Tailwind, scripts, and existing domain/test coverage.
- `.planning/codebase/ARCHITECTURE.md` - Route, domain, assistant, report, calendar, and data-flow map.
- `.planning/codebase/CONVENTIONS.md` - Strict TypeScript, Zod validation, domain mutation boundaries, UI conventions, and test data rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/components/dashboard/lead-preview-dialog.tsx` - Shared lead preview surface for console, calendar, and search result inspection.
- `src/components/dashboard/lead-workspace.tsx` - Console composition, lead ledger, preview content, dense mode behavior, and status/source display.
- `src/components/leads/lead-detail-tabs.tsx` - Full lead workspace tabs for overview, review, follow-ups, source, activity, custom fields, and full view.
- `app/calendar/page.tsx` and `src/lib/domain/calendar/get-calendar-items.ts` - Calendar view and derived lead/follow-up event source.
- `app/settings/page.tsx`, `app/settings/fields/page.tsx`, `app/settings/sources/page.tsx`, and source/custom-field panels - Settings surfaces that need verification.
- `src/components/dashboard/global-lead-search.tsx` and `src/components/dashboard/lead-search-overlay.tsx` - Existing command-style search and result-to-preview flow.
- `src/components/dashboard/dense-mode-toggle.tsx` and `src/components/dashboard/theme-toggle.tsx` - Existing persisted density and theme controls.
- `src/lib/assistant/config.ts` - Assistant enablement gate for missing `LEAD_ASSISTANT_ENABLED` or provider API key.
- `src/components/assistant/assistant-panel.tsx` - CopilotKit popup, tool renderers, report/forecast visual cards, and human-in-the-loop mutation confirmation.
- `src/lib/assistant/tools/leads.ts` and `src/lib/assistant/lead-tool-schemas.ts` - Typed assistant tool contracts and domain-backed implementations.
- `src/lib/domain/reports/get-lead-report.ts` and `src/lib/domain/reports/get-revenue-forecast.ts` - Deterministic report and forecast query logic.

### Established Patterns

- Next.js App Router pages load data and compose feature components; route handlers validate input and call domain functions.
- Domain writes create audit records and should remain under `src/lib/domain/**`.
- Assistant mutations use preview/apply flows and `assistant_action_logs`, not direct freeform database writes.
- Tailwind, local shadcn-style primitives, and lucide icons are the UI baseline.
- Dark mode is class-based and initialized globally before hydration.
- Tests are Vitest-focused around deterministic domain logic; browser verification is currently a targeted manual or tool-driven layer rather than committed E2E coverage.

### Integration Points

- `npm run check` is the main automated gate and runs typecheck, lint, tests, format check, and build through Bun.
- `npm run db:seed` and `npm run db:reset-demo` both reset seeded demo data through `src/lib/db/seed.ts --reset`.
- `app/layout.tsx` conditionally wraps pages in `CopilotProvider` when assistant runtime readiness is true.
- `src/components/assistant/assistant-route-context.tsx` supplies page-aware assistant context.
- `app/api/copilotkit/route.ts` hosts the CopilotKit runtime endpoint and registers typed tools.
- Lead, status, follow-up, custom-field, and source API routes should remain thin wrappers over existing domain modules.

</code_context>

<specifics>
## Specific Ideas

- Phase 2 should feel like "supporting ops proof" for the same software-services demo story, not a new product direction.
- Calendar, reports, and forecasts should make the seeded workload feel real enough to explain in a short demo.
- Assistant verification can pass by showing a clean disabled state when credentials are absent, as long as typed tool and confirmation contracts remain intact in code.
- Forecast wording should keep the phrase "Based on this dashboard" or equivalent limitation framing where the app lacks external truth sources.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

_Phase: 2-Supporting Ops Surfaces_
_Context gathered: 2026-06-08_

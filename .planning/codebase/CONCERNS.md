---
title: Codebase Concerns
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
scope: technical debt, known issues, security, performance, fragile areas, active spec gaps
---

# Codebase Concerns

## Overview

This repository is now an implemented Next.js demo for a lead operations dashboard, but several areas still behave like a local seeded demo rather than a production-ready multi-workspace app. The largest risks are demo-scoped data access, unauthenticated mutation routes, dependency advisories, incomplete active-spec seed data, and browser/assistant verification gaps.

Current verification during this mapping:

- `bun run typecheck` passed.
- `bun run test` passed: 12 files, 25 tests.
- `npm audit --audit-level=moderate` failed with 20 vulnerabilities: 5 low, 14 moderate, 1 high.

## Key File Paths

- `.kiro/specs/lead-workflow-ux-upgrade/requirements.md`
- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md`
- `app/page.tsx`
- `app/calendar/page.tsx`
- `app/leads/[leadId]/page.tsx`
- `app/api/ingest/route.ts`
- `app/api/copilotkit/route.ts`
- `app/api/leads/[leadId]/route.ts`
- `app/api/sources/route.ts`
- `app/api/sources/[sourceId]/route.ts`
- `src/lib/db/schema.ts`
- `src/lib/db/seed.ts`
- `src/lib/domain/leads/ingest-lead.ts`
- `src/lib/domain/leads/update-lead.ts`
- `src/lib/domain/sources/manage-sources.ts`
- `src/lib/assistant/tools/leads.ts`
- `src/components/assistant/assistant-panel.tsx`

## Findings

### 1. Production auth and workspace isolation are not implemented

Severity: high.

The app still uses the seeded `software-services-demo` workspace in domain and assistant paths, while several page read helpers do not filter by workspace at all. Mutation routes accept requests without authentication, CSRF protection, or per-user permission checks.

Evidence:

- `src/lib/domain/leads/ingest-lead.ts` and `src/lib/domain/leads/update-lead.ts` load `workspaces.slug = "software-services-demo"`.
- `src/lib/domain/sources/manage-sources.ts` uses a demo context.
- `app/api/ingest/route.ts`, `app/api/leads/[leadId]/route.ts`, `app/api/sources/route.ts`, and `app/api/sources/[sourceId]/route.ts` expose mutations without auth.
- `app/page.tsx`, `app/calendar/page.tsx`, and `app/leads/[leadId]/page.tsx` contain read helpers keyed by lead id or global tables rather than a verified workspace/user context.

Impact:

- Safe enough for a local portfolio demo, but unsafe for public pilot usage.
- Any future multi-workspace data would be at risk of cross-workspace reads or writes.

Recommended action:

- Add a server-side `getCurrentWorkspaceContext()` boundary before pilot deployment.
- Require auth on all API routes and assistant tool execution.
- Add workspace filters to every page query and domain read helper.

### 2. Dependency audit has unresolved advisories

Severity: high.

`npm audit --audit-level=moderate` reports 20 vulnerabilities. The highest-risk item is `drizzle-orm <0.45.2` with a high-severity SQL injection advisory for improperly escaped SQL identifiers.

Other reported vulnerable chains include:

- `@ai-sdk/provider-utils` through AI provider packages.
- `postcss` through `next`.
- `prismjs` through `@copilotkit/react-ui`.
- `uuid` through `@copilotkit/runtime` and LangGraph packages.
- `esbuild` through `drizzle-kit`.

Impact:

- Some fixes are breaking or depend on upstream releases.
- The Drizzle advisory deserves priority because the app uses Drizzle heavily.

Recommended action:

- Plan a dependency update slice rather than running `npm audit fix --force` blindly.
- Prioritize Drizzle and Next/CopilotKit security release compatibility.

### 3. Active spec seed-data requirements are still incomplete

Severity: medium.

The active `lead-workflow-ux-upgrade` spec requires dense demo data across two months back and two months forward, varied states, multiple stacked calendar days, and meaningful report/forecast data. The task checklist still leaves all demo-data and verification items unchecked.

Evidence:

- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md` still has the full `Demo Data` and `Verification` sections unchecked.
- `src/lib/db/seed.ts` creates only two leads and uses fixed May 2026 dates.
- There is no `DEMO_SEED_ANCHOR` support in `src/lib/db/seed.ts`.

Impact:

- Calendar and report features can look empty or misleading on 2026-06-08.
- Assistant reports and forecasts are difficult to validate with realistic density.

Recommended action:

- Expand `src/lib/db/seed.ts` before marking the active spec complete.
- Keep all seeded person names test-safe with `Test`.

### 4. Assistant mutation confirmation is fragile

Severity: medium.

Assistant mutation tools implement preview/apply modes and log previews, but the server-side apply path only requires a valid preview id with `status = "previewed"`. The human approval happens through `useHumanInTheLoop` in `src/components/assistant/assistant-panel.tsx`, but approval is not persisted as a separate server-side state before apply.

Evidence:

- `app/api/copilotkit/route.ts` instructs the assistant to call `confirm_assistant_mutation`.
- `src/components/assistant/assistant-panel.tsx` registers `confirm_assistant_mutation` client-side with `useHumanInTheLoop`.
- `src/lib/assistant/tools/leads.ts` apply paths call `getAssistantActionPreview(...)` and then mutate; no stored approval token or approved state is checked.

Impact:

- The model prompt and UI encourage confirmation, but enforcement depends on tool-call behavior.
- A future direct runtime/tool invocation path could apply a preview without independently proving user approval.

Recommended action:

- Add an `approved` or `confirmed` state to `assistant_action_logs`.
- Require server-side confirmation before apply.
- Add tests for denied, stale, mismatched, and already-applied previews.

### 5. Source configuration is transitional and can drift

Severity: medium.

The code added `source_definitions`, but lead/contact source fields remain free text and update schemas accept arbitrary strings. This supports archived labels, but it also allows leads to reference sources not defined for the workspace.

Evidence:

- `src/lib/db/schema.ts` has `leads.source` and `contacts.source` as `text`.
- `src/lib/domain/leads/update-lead.ts` accepts `source: z.string().trim().min(1).max(80)`.
- `src/lib/assistant/lead-tool-schemas.ts` uses a freeform source schema.
- `src/lib/domain/sources/manage-sources.ts` manages source definitions separately.

Impact:

- Filters and settings can diverge from stored lead source values.
- Assistant or API updates can introduce source labels that are invisible in active settings.

Recommended action:

- Validate new lead source values against active workspace sources.
- Decide whether to keep free-text historical source values or add a nullable `sourceDefinitionId`.

### 6. Server page data loading will not scale

Severity: medium.

Several server pages fetch broad datasets and filter in application code. This is acceptable for the seeded demo but will become slow as leads and events grow.

Evidence:

- `app/calendar/page.tsx` calls `getCalendarItems()` without a date range, then filters to the visible range.
- `src/lib/domain/calendar/get-calendar-items.ts` loads all matching lead and follow-up calendar rows.
- `app/page.tsx` loads all matching leads with no pagination or limit.
- `src/components/dashboard/lead-search-overlay.tsx` searches only the passed client-side lead rows.
- `app/page.tsx` dashboard metrics load all leads and follow-ups before counting.

Impact:

- Calendar, console, metrics, and global search may become slow with real data.
- Client payload size will grow with the number of visible lead rows.

Recommended action:

- Add date-range parameters to calendar queries.
- Add pagination or cursor limits to the console ledger.
- Move global search to a server-backed endpoint when data exceeds demo size.
- Replace in-memory metrics with aggregate SQL queries.

### 7. Source artifacts contain raw lead text without retention or redaction controls

Severity: medium.

The product intentionally keeps source artifacts traceable, but raw pasted text is stored and exposed in read paths without retention policy, redaction, or field-level access control.

Evidence:

- `src/lib/domain/leads/ingest-lead.ts` stores `rawText` and `normalizedText`.
- `app/page.tsx`, `app/calendar/page.tsx`, `app/leads/[leadId]/page.tsx`, and `src/lib/assistant/tools/leads.ts` can return raw source text for lead detail or assistant context.

Impact:

- Real call/chat transcripts may include personal data or sensitive business context.
- Public demo or pilot usage needs clear controls before ingesting real customer records.

Recommended action:

- Add a retention/redaction policy before real pilot data.
- Keep raw artifact access behind authenticated workspace permissions.
- Consider masking emails/phones in assistant contexts unless explicitly requested.

### 8. API error handling is uneven

Severity: low.

Some routes catch domain errors and return controlled JSON, while others allow domain errors to bubble to framework-level 500 responses.

Evidence:

- `app/api/sources/route.ts` and `app/api/sources/[sourceId]/route.ts` catch known domain errors.
- `app/api/ingest/route.ts` and `app/api/leads/[leadId]/route.ts` do not catch missing workspace or not-found errors from domain functions.

Impact:

- Demo UX may show abrupt failures when the database is unseeded or a lead id is stale.
- Error behavior is inconsistent for client forms.

Recommended action:

- Standardize API error responses for validation, not found, conflict, and unexpected failures.

### 9. Test coverage is domain-heavy and UI-light

Severity: low.

The current unit suite covers domain logic well, but the active spec requires browser verification for console preview, calendar preview, lead tabs, settings, search, dense mode, dark mode, assistant availability, and responsive clipping.

Evidence:

- Existing tests are under `src/lib/**`.
- No `*.test.tsx`, Playwright, or route/browser tests are present.
- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md` leaves all verification tasks unchecked.

Impact:

- Regressions in the active UX upgrade can pass unit tests and typecheck.
- Dark mode, dialogs, calendar stacking, and assistant rendering remain fragile.

Recommended action:

- Add a small browser smoke suite for the active spec flows.
- Include desktop and mobile viewport checks.
- Use only test-safe names containing `Test` in any form/chat/browser input.

## Notes

- TypeScript strict mode is enabled in `tsconfig.json`.
- The codebase follows the intended Next.js App Router and TypeScript direction from `.kiro/steering/tech.md`.
- No secrets or environment values were included in this document.
- Do not mark `lead-workflow-ux-upgrade` complete until seed density and verification tasks are finished or explicitly deferred.

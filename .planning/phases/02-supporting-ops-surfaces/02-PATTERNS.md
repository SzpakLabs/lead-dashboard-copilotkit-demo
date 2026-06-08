# Phase 2: Supporting Ops Surfaces - Pattern Map

## Closest Analogs

| Role            | Existing File                                      | Pattern To Preserve                                                                                                          |
| --------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Global shell    | `src/components/dashboard/app-shell.tsx`           | Server pages pass context into a shared shell; shell owns nav, search, theme, intake, and assistant presence.                |
| Shared preview  | `src/components/dashboard/lead-preview-dialog.tsx` | Preview state is URL-driven through `leadId`; closing removes the query value with `router.replace(..., { scroll: false })`. |
| Preview content | `src/components/dashboard/lead-workspace.tsx`      | Dense lead summary/actions should be reused instead of creating a second detail UI.                                          |
| Full detail     | `src/components/leads/lead-detail-tabs.tsx`        | Tabs are client state with hash sync, keyboard navigation, and scoped panels.                                                |
| Assistant gate  | `src/lib/assistant/config.ts`                      | Assistant enablement is explicit and credential-aware; pages should not assume provider keys exist.                          |
| Assistant tools | `src/lib/assistant/tools/leads.ts`                 | Read tools call read models; mutation tools preview first and apply only with a preview ID.                                  |
| Reports         | `src/lib/domain/reports/get-lead-report.ts`        | Report output is structured and deterministic with dashboard-only limitation text.                                           |
| Forecasts       | `src/lib/domain/reports/get-revenue-forecast.ts`   | Forecast separates confirmed, weighted, optimistic, assumptions, and missing-data notes.                                     |

## Data Flow

1. App Router pages read workspace data and pass props into route-level components.
2. UI interactions use existing route state, forms, or route handlers.
3. Mutations call domain modules and create audit or assistant action log records.
4. Assistant tools are typed with Zod and registered through CopilotKit runtime.
5. Reports, forecasts, and calendar are derived read models over leads and follow-ups.

## Implementation Constraints

- Do not bypass `src/lib/domain/**` for writes.
- Do not add a new assistant framework.
- Do not add schema changes in this phase unless a verified blocker makes it unavoidable.
- Do not add realistic person names in tests, docs, examples, browser input, or assistant prompts.
- Preserve the dense operational visual language and existing CSS variables.

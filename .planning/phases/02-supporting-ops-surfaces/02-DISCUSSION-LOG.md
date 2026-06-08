# Phase 2: Supporting Ops Surfaces - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 2-Supporting Ops Surfaces
**Areas discussed:** Preview and detail inspection, calendar/report/forecast story, assistant safety and availability, verification priority

---

## Preview And Detail Inspection

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse shared preview | Keep the existing reusable preview as the quick-inspection surface for console, calendar, and search. | yes |
| Add a new detail surface | Build another detail/inspection model for supporting routes. | |
| Return to permanent inspector | Reintroduce an always-open side inspector on the console. | |

**User's choice:** Auto-selected recommended default.
**Notes:** Phase 1 already rejected console overload and locked the publishable console story. Phase 2 should verify and harden the existing preview/detail flows.

---

## Calendar, Reports, And Forecast Story

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic dashboard story | Explain internal follow-up workload and pipeline value from seeded dashboard data. | yes |
| Analytics expansion | Add broader analytics or accounting-style reporting. | |
| External truth source | Imply external calendar, CRM, or revenue sync. | |

**User's choice:** Auto-selected recommended default.
**Notes:** Reports and forecasts should stay compact, visual, read-only by default, and explicit about assumptions, missing data, and estimated pipeline value.

---

## Assistant Safety And Availability

| Option | Description | Selected |
|--------|-------------|----------|
| Keep CopilotKit gated and typed | Preserve existing CopilotKit provider, typed tools, visual renderers, and preview/apply mutations. | yes |
| Custom assistant framework | Add a parallel chat/runtime system outside CopilotKit. | |
| Hard assistant dependency | Require credentials before the non-assistant demo can run. | |

**User's choice:** Auto-selected recommended default.
**Notes:** Missing credentials should produce a clean disabled state. Mutative tools remain typed, scoped to domain functions, confirmed before apply, and logged.

---

## Verification Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Verify and fix blockers | Treat the active spec as mostly implemented and focus on proving flows plus fixing blockers found. | yes |
| New feature pass | Add more surfaces before checking the existing ones. | |
| Documentation-only pass | Defer behavior verification to packaging. | |

**User's choice:** Auto-selected recommended default.
**Notes:** Run `npm run check` when feasible and targeted browser checks for calendar preview, lead tabs, settings, search, dense mode, dark mode, assistant state, reports/forecasts, and desktop/mobile clipping. Use only test-safe names.

## the agent's Discretion

- The agent may choose exact browser-check order and specific seeded records.
- The agent may verify assistant report/forecast output with configured credentials or document clean disabled behavior when credentials are absent.
- The agent may fix small blockers discovered during Phase 2 execution if they are inside the phase boundary.

## Deferred Ideas

None.

# Phase 1: Publishable Lead Review Flow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 1-Publishable Lead Review Flow
**Areas discussed:** Demo route and readiness, Seed data shape, Review and status proof, First viewport quality, Verification scope

---

## Demo Route And Readiness

| Option | Description | Selected |
|--------|-------------|----------|
| Primary console route | Use `/` as the publishable path and harden it around existing shell, metrics, filters, ledger, and preview behavior. | ✓ |
| Intake-first route | Start the demo at intake and navigate into the console after submission. | |
| New demo route | Add a separate public-facing demo page. | |

**User's choice:** `[auto] Selected: Primary console route (recommended default)`
**Notes:** Phase 1 requirements emphasize the main dashboard route opening cleanly and proving lead review. A new route would add scope.

---

## Seed Data Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Dense deterministic seed | Expand `src/lib/db/seed.ts` across a four-month deterministic window with varied safe leads and idempotent reset behavior. | ✓ |
| Minimal fixture seed | Keep only a few hand-authored records and fix visible empty states. | |
| Live/generated seed | Generate seed records dynamically from an LLM or external source. | |

**User's choice:** `[auto] Selected: Dense deterministic seed (recommended default)`
**Notes:** This matches the active Kiro spec's remaining unchecked demo data tasks and avoids brittle private setup.

---

## Review And Status Proof

| Option | Description | Selected |
|--------|-------------|----------|
| Existing preview/status loop | Use console lead rows, reusable preview, and existing review/status actions to show human-controlled lead operations. | ✓ |
| New intake-only proof | Make a new ingested lead the only proof of value. | |
| Assistant mutation proof | Use assistant actions as the primary Phase 1 proof point. | |

**User's choice:** `[auto] Selected: Existing preview/status loop (recommended default)`
**Notes:** This keeps Phase 1 independent from optional assistant credentials and focuses on the roadmap's lead review flow.

---

## First Viewport Quality

| Option | Description | Selected |
|--------|-------------|----------|
| Tune the existing console | Preserve the dense console direction and fix populated-state, readability, clipping, and screenshot issues. | ✓ |
| Redesign the first screen | Rework the visual direction or information architecture. | |
| Defer visual polish | Only verify functionality and leave screenshot quality for packaging. | |

**User's choice:** `[auto] Selected: Tune the existing console (recommended default)`
**Notes:** The active spec already completed the redesign baseline. Phase 1 should polish blockers, not restart design.

---

## Verification Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Check plus targeted browser proof | Run `npm run check` when feasible and verify the core dashboard, preview, status/review, first viewport, and mobile clipping path. | ✓ |
| Automated checks only | Rely on unit/build checks without browser inspection. | |
| Broad full-app audit | Verify every active spec workflow in depth before Phase 1 planning. | |

**User's choice:** `[auto] Selected: Check plus targeted browser proof (recommended default)`
**Notes:** This matches Phase 1 while leaving broader calendar, reports, assistant, and packaging proof to later phases unless they block the main route.

---

## the agent's Discretion

- Exact seed anchor and distribution strategy.
- Specific safe demo contacts and lead scenarios.
- Whether the review proof starts from an existing seeded lead or an intake-created draft.

## Deferred Ideas

None.

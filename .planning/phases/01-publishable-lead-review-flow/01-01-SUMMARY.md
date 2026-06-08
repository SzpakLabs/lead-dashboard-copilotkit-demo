---
phase: 01-publishable-lead-review-flow
plan: 01
subsystem: database
tags: [drizzle, seed-data, postgres, demo-data]
requires: []
provides:
  - Deterministic four-month demo seed data
  - Test-safe representative lead fixtures
  - Idempotent software-services demo workspace reset
affects: [phase-1, demo-data, dashboard, calendar, reports]
tech-stack:
  added: []
  patterns:
    - Deterministic seed anchor via DEMO_SEED_ANCHOR
    - Fixture-driven Drizzle seed inserts
key-files:
  created: []
  modified:
    - src/lib/db/seed.ts
key-decisions:
  - "Use 2026-06-15T12:00:00.000Z as the default seed anchor, overridable through DEMO_SEED_ANCHOR."
  - "Keep all seeded person names Test-safe and expand source definitions without schema changes."
patterns-established:
  - "Seed fixtures are declared once and inserted through a helper that creates contact, ingestion, lead, custom field, follow-up, and activity records."
requirements-completed:
  - SAFE-01
  - LEAD-01
  - LEAD-02
duration: 12 min
completed: 2026-06-08
---

# Phase 1 Plan 01: Expand Safe Demo Data Summary

**Deterministic Test-safe demo seed data with 25 representative leads across a four-month operating window**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-08T13:55:00Z
- **Completed:** 2026-06-08T14:07:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Replaced the sparse two-lead seed with 25 Test-safe software-services lead fixtures.
- Added deterministic date generation through `DEMO_SEED_ANCHOR` with a fixed fallback.
- Seeded varied statuses, sources, budgets, timelines, next steps, follow-ups, scheduled work, completed work, custom fields, source artifacts, and activity events.

## Task Commits

1. **Expand deterministic safe seed data** - `6ea3c18` (feat)

**Plan metadata:** pending current commit

## Files Created/Modified

- `src/lib/db/seed.ts` - Fixture-driven demo workspace seed with source definitions, contacts, ingestion events, leads, custom fields, follow-ups, and lead events.

## Decisions Made

- Used `DEMO_SEED_ANCHOR` with a default of `2026-06-15T12:00:00.000Z` so browser verification can be stable but configurable.
- Kept source values as existing text slugs and avoided schema work.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run db:reset-demo` was blocked by sandbox IPC permissions for `tsx`; rerunning the same command outside the sandbox passed.

## User Setup Required

None - no external service configuration required beyond existing `DATABASE_URL`.

## Next Phase Readiness

The dashboard now has enough seeded data for route, preview, status, calendar, and reporting verification. Ready for Plan 02.

---

_Phase: 01-publishable-lead-review-flow_
_Completed: 2026-06-08_

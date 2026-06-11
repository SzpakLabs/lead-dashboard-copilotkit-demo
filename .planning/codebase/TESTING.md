---
title: Testing Patterns
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
---

# Testing Patterns

## Overview

Testing is currently domain-heavy and UI-light. The committed suite uses Vitest with colocated unit tests around ingestion, DB bootstrap detection, calendar logic, follow-ups, lead mutations, custom fields, and reporting helpers.

## Current Test Files

- `src/lib/ingestion/software-services-extractor.test.ts`
- `src/lib/db/bootstrap-state.test.ts`
- `src/lib/domain/calendar/check-availability.test.ts`
- `src/lib/domain/calendar/get-calendar-items.test.ts`
- `src/lib/domain/followups/manage-followups.test.ts`
- `src/lib/domain/leads/ingest-lead.test.ts`
- `src/lib/domain/leads/change-lead-status.test.ts`
- `src/lib/domain/leads/update-lead.test.ts`
- `src/lib/domain/custom-fields/manage-custom-fields.test.ts`
- `src/lib/domain/custom-fields/update-lead-custom-field-values.test.ts`
- `src/lib/domain/reports/budget.test.ts`
- `src/lib/domain/reports/get-lead-report.test.ts`
- `src/lib/domain/reports/get-revenue-forecast.test.ts`

## Patterns

- Tests live next to the implementation
- Vitest runs in `node` environment
- DB-facing domain tests mock `@/lib/db` rather than using a real database
- Date-sensitive tests pin time explicitly
- Audit side effects are asserted alongside primary mutations

## What Is Covered Well

- Deterministic extraction behavior
- Empty-database detection
- Lead ingest/update/status domain flows
- Follow-up mutation rules
- Custom field validation/value updates
- Calendar derivation and availability
- Budget parsing, reporting, and forecasting logic

## Gaps

- No direct tests for App Router pages
- No direct tests for API route handlers
- No component tests for dialogs, tabs, settings panels, search, theme toggle, or dense mode
- No committed browser/E2E suite

## Practical Reading

- `npm run test` covers core business logic well enough for safe domain refactors
- It does not prove the active UX spec flows end-to-end
- Browser-level verification still matters for demo claims

## Safety Note

- Keep all person-name fixtures and interactive test inputs `Test`-safe

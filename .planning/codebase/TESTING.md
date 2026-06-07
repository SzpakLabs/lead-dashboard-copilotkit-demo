---
title: Testing Patterns
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
---

# Testing Patterns

## Overview

Testing is centered on Vitest unit tests colocated with domain and ingestion modules under `src/lib/**`. The suite favors deterministic pure-function tests and focused mocked-database tests for domain mutations. There is no committed Playwright or browser E2E suite visible in the repo, although the active spec requires browser verification for workflow and responsive behavior.

## Key File Paths

- `vitest.config.ts` - Vitest config with `node` environment, globals enabled, and `@/*` alias.
- `package.json` - `test`, `test:watch`, `typecheck`, `lint`, `format:check`, `build`, and aggregate `check` scripts.
- `src/lib/ingestion/software-services-extractor.test.ts` - deterministic extraction and text normalization tests.
- `src/lib/domain/leads/ingest-lead.test.ts` - mocked Drizzle transaction test for ingestion.
- `src/lib/domain/leads/update-lead.test.ts` - mocked update and audit-event test.
- `src/lib/domain/leads/change-lead-status.test.ts` - lead status domain behavior.
- `src/lib/domain/followups/manage-followups.test.ts` - follow-up domain behavior.
- `src/lib/domain/custom-fields/manage-custom-fields.test.ts` - custom field validation and normalization.
- `src/lib/domain/custom-fields/update-lead-custom-field-values.test.ts` - custom field value update behavior.
- `src/lib/domain/calendar/check-availability.test.ts` - deterministic availability rules.
- `src/lib/domain/calendar/get-calendar-items.test.ts` - calendar item derivation.
- `src/lib/domain/reports/budget.test.ts` - budget parsing.
- `src/lib/domain/reports/get-lead-report.test.ts` - report aggregation.
- `src/lib/domain/reports/get-revenue-forecast.test.ts` - forecast aggregation.

## Findings

### Test Runner

- Vitest is the only committed test runner.
- Tests run in Node, not jsdom.
- Global Vitest APIs are enabled, but tests commonly import from `vitest` explicitly.
- The main command is `npm run test`; full verification is intended through `npm run check`.

### Test Organization

- Tests are colocated beside implementation files with `.test.ts` suffix.
- Coverage is concentrated in `src/lib/domain/**` and `src/lib/ingestion/**`.
- UI components, App Router pages, and API routes do not currently have direct tests.
- No committed `playwright.config.*` or browser test directory was found.

### Unit Test Style

- Pure helpers are tested with direct inputs and `toMatchObject`, `toEqual`, `toBe`, and `toBeNull`.
- Date-sensitive logic uses fixed ISO dates.
- `vi.setSystemTime()` and `vi.useRealTimers()` are used for deterministic relative-date extraction.
- Tests use descriptive `describe()` names matching exported functions, for example `parseBudgetRange`, `buildLeadReport`, and `checkCalendarAvailability`.

### Database Mocking Pattern

- Domain mutation tests mock `@/lib/db` with `vi.mock()` and `vi.mocked(getDb).mockReturnValue(...)`.
- Drizzle chains are represented by small local helper factories such as `createSelectResult()` and `createUpdateResult()`.
- Mocked calls capture inserted or updated values into arrays, then assert the domain mutation and audit payloads.
- Tests focus on domain outcomes and audit side effects, not SQL generation.

### Data Safety

- Test person names include `Test`, for example `Juan Test`, `Maria Test`, `Alex Test`, and `Owner Test`.
- Continue using `Test` in any person name for unit tests, seed data, browser verification, form input, assistant prompts, and examples.
- Do not introduce realistic non-test names in fixtures or browser tests.

### Current Gaps

- There are no direct tests for `app/api/**/route.ts` request/response behavior.
- There are no component tests for forms, dialogs, search overlay, dense mode, theme toggle, assistant panel, or lead tabs.
- There is no committed E2E coverage for the active spec workflows: console preview, calendar preview, global search, settings sources, dense mode, dark mode persistence, assistant availability, and responsive clipping.
- Seed density remains incomplete in `.kiro/specs/lead-workflow-ux-upgrade/tasks.md`, so report/calendar verification depends on sparse demo data unless tests construct their own fixtures.

## Notes

- Prefer adding domain tests before UI tests when business rules change.
- Use browser verification for workflow claims in the active UX spec, but keep all entered person names test-safe.
- For new database-backed domain tests, follow the existing mocked Drizzle-chain style unless a real test database is intentionally introduced.
- For new date logic, pin dates explicitly and avoid relying on the current system clock.

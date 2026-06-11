---
title: Repository Structure
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
focus: arch
---

# Repository Structure

## Top Level

- `app/` App Router pages and route handlers
- `src/` components, domain logic, assistant logic, DB code, ingestion, settings helpers
- `drizzle/` SQL migrations and snapshots
- `docs/` concise product/demo/domain notes
- `.kiro/` steering and spec files
- `.planning/` GSD state, phases, and codebase maps
- `public/` static assets including CopilotKit CSS

## App Router

- `app/layout.tsx`
- `app/page.tsx`
- `app/calendar/page.tsx`
- `app/intake/page.tsx`
- `app/settings/page.tsx`
- `app/settings/sources/page.tsx`
- `app/settings/fields/page.tsx`
- `app/leads/[leadId]/page.tsx`
- `app/api/**/route.ts`

## Source Layout

### `src/components`

- `assistant/` Copilot provider, route context, popup rendering
- `dashboard/` shell, ledger, dialogs, search, theme/density toggles, empty DB states
- `leads/` lead forms, tabs, follow-ups, source/custom field panels, intake UI
- `settings/` workspace/help/about/settings nav panels
- `ui/` local primitives

### `src/lib`

- `assistant/` runtime config, schemas, tools
- `db/` schema, connection, seed, bootstrap-state
- `domain/` feature business logic
- `ingestion/` extraction contracts and deterministic extractor
- `settings/` browser-local workspace preferences
- utility files: `date-format.ts`, `utils.ts`

### `src/lib/domain`

- `calendar/`
- `custom-fields/`
- `followups/`
- `leads/`
- `reports/`
- `sources/`

## Tests

- Test files are colocated under `src/lib/**`
- No separate `tests/e2e` or component-test tree is present

## Documentation Layout

- `docs/00-meta/` project overview, demo runbook, portfolio note, release checklist
- `docs/10-product/`
- `docs/20-domain/`
- `docs/40-ai/`

## Structure Notes

- The codebase largely follows the intended feature/domain split from steering.
- The main structural mismatch is the stale steering note that still describes the repo as planning-only.

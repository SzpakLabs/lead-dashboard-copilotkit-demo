---
title: Directory Structure Map
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
focus: arch
---

# Directory Structure Map

## Overview

The repository is organized as a single Next.js App Router application with feature-oriented source folders. Runtime routes live under `app/`, reusable UI lives under `src/components/`, business logic lives under `src/lib/domain/`, database infrastructure lives under `src/lib/db/`, and planning/product context lives under `.kiro/` and `docs/`.

The practical ownership model is:

- `app/`: route entry points, API handlers, page-level server composition.
- `src/components/`: React UI components split by product area.
- `src/lib/`: backend-adjacent logic, domain services, data access setup, assistant tooling, ingestion, shared utilities.
- `drizzle/`: generated SQL migrations and Drizzle metadata.
- `docs/`: durable product/domain/AI/demo docs.
- `.kiro/`: steering and spec workflow state.
- `.planning/codebase/`: generated codebase maps.

## Key File Paths

- `package.json` defines scripts for dev, build, lint, format, tests, typecheck, Drizzle generation/migration, and demo seeding.
- `tsconfig.json` configures TypeScript.
- `next.config.ts` configures Next.js.
- `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, and `public/copilotkit-react-core-v2.css` define styling.
- `drizzle.config.ts`, `drizzle/*.sql`, and `drizzle/meta/*.json` define migration configuration and history.
- `.kiro/steering/product.md`, `.kiro/steering/tech.md`, and `.kiro/steering/structure.md` define durable product, technical, and structure rules.
- `.kiro/specs/README.md` identifies the active spec.
- `.kiro/specs/lead-workflow-ux-upgrade/design.md` describes the current active UX architecture direction.

## Directory Map

### `app/`

Next.js App Router root.

- `app/layout.tsx`: root HTML, metadata, theme initialization, global Copilot provider gate.
- `app/globals.css`: global application styles and design tokens.
- `app/page.tsx`: console route with server-side lead queries, filters, metrics, preview state, and assistant context.
- `app/calendar/page.tsx`: calendar/schedule route.
- `app/intake/page.tsx`: dedicated intake route.
- `app/leads/[leadId]/page.tsx`: full lead detail workspace.
- `app/settings/page.tsx`: settings landing route.
- `app/settings/fields/page.tsx`: custom fields settings deep link.
- `app/settings/sources/page.tsx`: source settings deep link.
- `app/favicon.ico/route.ts`: favicon route.

### `app/api/`

Route handlers for server-side mutations and assistant runtime.

- `app/api/ingest/route.ts`: validates text ingestion and calls `ingestLeadFromText`.
- `app/api/copilotkit/route.ts`: CopilotKit runtime endpoint and built-in assistant agent.
- `app/api/leads/[leadId]/route.ts`: lead update endpoint.
- `app/api/leads/[leadId]/status/route.ts`: lead status endpoint.
- `app/api/leads/[leadId]/custom-fields/route.ts`: lead custom field values endpoint.
- `app/api/leads/[leadId]/followups/route.ts`: lead follow-up creation endpoint.
- `app/api/followups/[followUpId]/route.ts`: follow-up update/delete endpoint.
- `app/api/followups/[followUpId]/complete/route.ts`: follow-up completion endpoint.
- `app/api/custom-fields/route.ts`: custom field definition creation/list endpoint.
- `app/api/custom-fields/[fieldId]/route.ts`: custom field definition update/archive endpoint.
- `app/api/sources/route.ts`: source definition creation/list endpoint.
- `app/api/sources/[sourceId]/route.ts`: source definition update/archive endpoint.

### `src/components/assistant/`

CopilotKit UI integration components.

- `src/components/assistant/copilot-provider.tsx`: client provider with runtime URL.
- `src/components/assistant/assistant-panel.tsx`: assistant panel UI.
- `src/components/assistant/assistant-route-context.tsx`: route/page context bridge for assistant behavior.

### `src/components/dashboard/`

Global shell and console-focused UI.

- `src/components/dashboard/app-shell.tsx`: global app shell, nav, assistant panel, search, theme, and intake actions.
- `src/components/dashboard/lead-workspace.tsx`: console panels, filters, metrics, lead list, preview content.
- `src/components/dashboard/lead-preview-dialog.tsx`: reusable selected-lead preview dialog.
- `src/components/dashboard/global-lead-search.tsx`: global search trigger/control.
- `src/components/dashboard/lead-search-overlay.tsx`: command-style lead search overlay.
- `src/components/dashboard/theme-toggle.tsx`: dark/light preference control.
- `src/components/dashboard/dense-mode-toggle.tsx`: density preference control.
- `src/components/dashboard/history-back-button.tsx`: reusable history-aware back control.
- `src/components/dashboard/lead-ui.tsx`: shared lead display primitives.

### `src/components/leads/`

Lead, intake, follow-up, custom field, and source UI.

- `src/components/leads/ingestion-form.tsx`: lead text ingestion form.
- `src/components/leads/intake-drawer.tsx`: shell-level intake drawer.
- `src/components/leads/lead-detail-tabs.tsx`: full lead detail tab layout.
- `src/components/leads/lead-detail-form.tsx`: editable lead detail fields.
- `src/components/leads/lead-status-form.tsx`: status mutation UI.
- `src/components/leads/follow-ups-panel.tsx`: follow-up list and management UI.
- `src/components/leads/custom-field-definitions-panel.tsx`: custom field settings UI.
- `src/components/leads/custom-field-values-form.tsx`: lead custom field values UI.
- `src/components/leads/source-definitions-panel.tsx`: workspace source settings UI.

### `src/components/ui/`

Small shadcn-style primitives.

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`

### `src/lib/assistant/`

Assistant configuration and tool layer.

- `src/lib/assistant/config.ts`: assistant readiness and local environment loading.
- `src/lib/assistant/lead-tool-schemas.ts`: Zod schemas and TypeScript types for assistant tool contracts.
- `src/lib/assistant/tools/leads.ts`: CopilotKit tool definitions and implementations for lead search, opening, calendar, reporting, forecast, availability, and previewed mutations.

### `src/lib/db/`

Database layer.

- `src/lib/db/index.ts`: lazy Drizzle/Postgres connection factory.
- `src/lib/db/schema.ts`: Drizzle table and enum definitions.
- `src/lib/db/seed.ts`: demo workspace/data seeding.

### `src/lib/domain/`

Business logic grouped by feature.

- `src/lib/domain/leads/`: ingestion, lead updates, status changes, and status labels/schemas.
- `src/lib/domain/followups/`: follow-up creation, update, completion, cancellation, and tests.
- `src/lib/domain/custom-fields/`: custom field definition and lead value management.
- `src/lib/domain/sources/`: workspace source definition management.
- `src/lib/domain/calendar/`: internal calendar item derivation and availability checks.
- `src/lib/domain/reports/`: lead reports, budget parsing, revenue forecast, shared report types.

### `src/lib/ingestion/`

Input normalization and extraction.

- `src/lib/ingestion/extraction.ts`: extraction contracts and source channel schema.
- `src/lib/ingestion/software-services-extractor.ts`: deterministic software-services extractor.
- `src/lib/ingestion/software-services-extractor.test.ts`: extractor test coverage.

### `src/lib/`

Shared helpers.

- `src/lib/date-format.ts`: date formatting helpers.
- `src/lib/utils.ts`: shared UI utility helpers.

### `docs/`

Durable project documentation.

- `docs/00-meta/00-project-overview.md`
- `docs/00-meta/01-demo-runbook.md`
- `docs/10-product/13-mvp-scope.md`
- `docs/20-domain/20-domain-model.md`
- `docs/40-ai/41-tool-catalog.md`

### `.kiro/`

Planning and steering.

- `.kiro/steering/product.md`: product direction and rules.
- `.kiro/steering/tech.md`: technical stack and architecture constraints.
- `.kiro/steering/structure.md`: intended structure and boundary rules.
- `.kiro/specs/README.md`: active, paused, completed, and deferred specs.
- `.kiro/specs/lead-workflow-ux-upgrade/`: current active spec.
- `.kiro/specs/demo-readiness-fixes/`: paused spec.
- `.kiro/specs/dashboard-redesign/`: completed spec.
- `.kiro/specs/mvp-lead-ops-demo/`: completed spec.

### `drizzle/`

Database migration history.

- `drizzle/0000_exotic_violations.sql`
- `drizzle/0001_gifted_lady_deathstrike.sql`
- `drizzle/0002_assistant_action_logs.sql`
- `drizzle/0003_source_definitions.sql`
- `drizzle/meta/`: Drizzle migration snapshots and journal.

## Findings

- The active runtime structure largely matches the future structure in `.kiro/steering/structure.md`, but the steering current-state note is stale.
- `app/page.tsx` is the largest architectural concentration point: it combines route parsing, query construction, metrics, preview loading, and rendering composition.
- Domain folders are cohesive and test-backed; this is the strongest long-term boundary in the repo.
- API route handlers are thin enough to remain readable and mostly delegate to domain modules.
- Assistant logic is centralized in `src/lib/assistant/`, but `src/lib/assistant/tools/leads.ts` is broad because it contains many tool implementations in one file.
- UI is split by product surface rather than pure component type, which fits the current app size.
- `src/components/ui/` is intentionally small and local; there is no large generated component library in the tree.
- Tests are concentrated in `src/lib/domain/**` and `src/lib/ingestion/**`; page and component behavior appears less directly covered by automated tests.

## Notes

- Keep new business writes in `src/lib/domain/` and call them from `app/api/**` or assistant tools.
- Keep CopilotKit-specific logic in `src/lib/assistant/` and `src/components/assistant/`.
- Keep DB table changes in `src/lib/db/schema.ts` plus generated `drizzle/` migrations.
- Avoid adding broad docs trees unless a development slice needs them.
- Preserve the test data safety rule: person names in tests, forms, chat, assistant flows, browser interactions, and examples must include `Test`.

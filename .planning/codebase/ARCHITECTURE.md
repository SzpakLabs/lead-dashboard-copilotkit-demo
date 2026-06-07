---
title: Architecture Map
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
focus: arch
---

# Architecture Map

## Overview

This repository is a full-stack TypeScript lead operations demo built with Next.js App Router, React, Drizzle ORM, PostgreSQL, Tailwind CSS, and CopilotKit. The app centers on a seeded software-services workspace where unstructured lead text is ingested, normalized, extracted into draft leads, reviewed in a dense dashboard, and managed through statuses, follow-ups, custom fields, source configuration, calendar views, reports, and an assistant.

The implementation follows the intended steering boundary in broad strokes:

- `app/` owns routes, route handlers, page-level data loading, and shell composition.
- `src/components/` owns UI components and client interactions.
- `src/lib/domain/` owns business operations and deterministic report/calendar logic.
- `src/lib/db/` owns Drizzle schema, connection setup, and seed data.
- `src/lib/ingestion/` owns text normalization and extraction.
- `src/lib/assistant/` owns CopilotKit runtime configuration, tool schemas, and tool implementations.

## Key File Paths

- `app/layout.tsx` conditionally wraps the app with `CopilotProvider` when assistant runtime configuration is present.
- `app/page.tsx` renders the main console, loads lead rows, filters, metrics, preview data, source labels, and assistant page context.
- `app/calendar/page.tsx` renders internal lead-related schedule views.
- `app/intake/page.tsx` renders focused intake.
- `app/leads/[leadId]/page.tsx` renders full lead workspace/detail.
- `app/settings/page.tsx`, `app/settings/fields/page.tsx`, and `app/settings/sources/page.tsx` render workspace settings surfaces.
- `app/api/ingest/route.ts` exposes lead ingestion.
- `app/api/copilotkit/route.ts` exposes the CopilotKit runtime endpoint.
- `app/api/leads/[leadId]/route.ts`, `app/api/leads/[leadId]/status/route.ts`, `app/api/leads/[leadId]/custom-fields/route.ts`, `app/api/leads/[leadId]/followups/route.ts` expose lead mutations and related writes.
- `app/api/custom-fields/route.ts`, `app/api/custom-fields/[fieldId]/route.ts`, `app/api/sources/route.ts`, and `app/api/sources/[sourceId]/route.ts` expose workspace configuration writes.
- `src/lib/db/schema.ts` defines workspaces, users, contacts, ingestion events, leads, source definitions, follow-ups, custom fields, lead events, and assistant action logs.
- `src/lib/db/index.ts` creates a lazy Drizzle/Postgres connection from environment configuration.
- `src/lib/db/seed.ts` seeds the demo workspace and data.
- `src/lib/domain/leads/ingest-lead.ts` implements the ingestion transaction.
- `src/lib/domain/leads/update-lead.ts` and `src/lib/domain/leads/change-lead-status.ts` implement lead mutations.
- `src/lib/domain/followups/manage-followups.ts` implements follow-up mutations.
- `src/lib/domain/custom-fields/manage-custom-fields.ts` and `src/lib/domain/custom-fields/update-lead-custom-field-values.ts` implement workspace custom field behavior.
- `src/lib/domain/sources/manage-sources.ts` implements workspace source configuration.
- `src/lib/domain/calendar/get-calendar-items.ts` and `src/lib/domain/calendar/check-availability.ts` derive calendar behavior from lead and follow-up data.
- `src/lib/domain/reports/get-lead-report.ts`, `src/lib/domain/reports/get-revenue-forecast.ts`, and `src/lib/domain/reports/budget.ts` implement deterministic reports and forecast logic.
- `src/lib/ingestion/extraction.ts` and `src/lib/ingestion/software-services-extractor.ts` define the extraction interface and deterministic software-services extractor.
- `src/lib/assistant/config.ts` gates assistant runtime enablement and provider/model selection without exposing secret values.
- `src/lib/assistant/lead-tool-schemas.ts` defines Zod contracts for assistant tools.
- `src/lib/assistant/tools/leads.ts` exposes typed CopilotKit tools over domain and read-model functions.
- `src/components/dashboard/app-shell.tsx` provides the global shell, navigation, search, assistant panel, theme toggle, and intake drawer.
- `src/components/dashboard/lead-workspace.tsx` contains console workspace panels and preview content composition.
- `src/components/dashboard/lead-preview-dialog.tsx` provides reusable lead preview behavior.
- `src/components/dashboard/global-lead-search.tsx` and `src/components/dashboard/lead-search-overlay.tsx` provide command-style search.
- `src/components/leads/lead-detail-tabs.tsx` organizes full lead detail tabs.
- `src/components/assistant/copilot-provider.tsx`, `src/components/assistant/assistant-panel.tsx`, and `src/components/assistant/assistant-route-context.tsx` integrate CopilotKit into the UI.

## Request And Data Flow

### Dashboard Read Flow

1. User opens `/`.
2. `app/page.tsx` reads `searchParams`, loads custom field definitions and source definitions, parses filters, queries lead rows from Drizzle, computes metrics, and optionally loads selected lead preview data.
3. `AppShell` receives assistant context, nav state, source options, and global actions.
4. `LeadFilterRail`, `LeadLedgerPanel`, and `LeadPreviewDialog` render the console and selected lead preview.

### Ingestion Flow

1. User posts text to `app/api/ingest/route.ts`.
2. The route validates input with `ingestLeadInputSchema`.
3. `ingestLeadFromText` finds the seeded `software-services-demo` workspace and actor user.
4. `normalizeText` and `SoftwareServicesExtractor` produce deterministic extracted fields.
5. A database transaction inserts `ingestion_events`, `contacts`, `leads`, and a `lead_events` audit row.
6. The API returns IDs, status, missing fields, and confidence.

### Mutation Flow

1. UI or assistant route/tool validates an input with Zod.
2. Domain modules perform the write through Drizzle.
3. Mutations create audit records in `lead_events` or assistant preview/application records in `assistant_action_logs`.
4. The app refreshes or navigates using route state rather than a separate client-side store.

### Assistant Flow

1. `app/layout.tsx` calls `isAssistantRuntimeConfigured`.
2. If enabled, `CopilotProvider` points CopilotKit to `/api/copilotkit`.
3. `AppShell` publishes page context through `AssistantRouteContext` and renders `AssistantPanel`.
4. `app/api/copilotkit/route.ts` creates a CopilotKit `BuiltInAgent` with typed tools from `src/lib/assistant/tools/leads.ts`.
5. Read-only tools search leads, open lead context, list calendar items, check availability, and generate reports/forecasts.
6. Mutative tools use preview/apply modes and require explicit confirmation through the assistant contract before applying changes.

## Data Model

The database model is workspace-scoped and lead-centered.

- `workspaces` and `users` provide demo tenancy and a fake actor.
- `contacts` represent people or companies.
- `leads` represent specific requests, jobs, projects, deals, or service opportunities.
- `ingestion_events` preserve raw and normalized source text.
- `lead_events` provide audit/activity records across leads and related target types.
- `follow_ups` represent actionable reminders tied to leads.
- `custom_field_definitions` and `custom_field_values` add workspace-scoped lead fields without changing the core lead table.
- `source_definitions` moves source labels/options out of hard-coded UI lists.
- `assistant_action_logs` stores assistant mutation previews, outcomes, and failures.

Calendar behavior is a derived read model from `leads.scheduledAt`, `leads.completedAt`, `leads.followUpDueAt`, and `follow_ups.followUpDueAt`; there is no standalone `calendar_items` table.

## Findings

- The app has moved beyond `.kiro/steering/structure.md`, which still says the repository is planning-only. Current implementation matches the future structure described there more than the current-state note.
- Page-level server components currently perform substantial read-model queries directly, especially `app/page.tsx`. This is acceptable for the demo but may become harder to reuse than extracting query functions under `src/lib/domain/` or `src/lib/db/queries/`.
- The write boundary is mostly sound: route handlers and assistant tools call domain functions rather than mutating from UI components.
- The demo tenancy is hard-coded around `software-services-demo` in ingestion and assistant paths. That keeps the MVP simple but is the main blocker to multi-workspace behavior.
- Assistant tool contracts are typed with Zod and routed through explicit tools, which aligns with steering. The runtime prompt also encodes confirmation rules for mutative tools.
- Source configuration is now modeled with `source_definitions`, while existing lead source values remain strings. This preserves old labels but requires display-label mapping wherever sources are shown.
- Tests are colocated beside domain modules and cover ingestion, lead updates, status changes, follow-ups, custom fields, calendar, reports, budget parsing, revenue forecast, and extraction.
- Environment-backed configuration exists in `src/lib/db/index.ts` and `src/lib/assistant/config.ts`; this map intentionally omits secret names' values.

## Notes

- Active spec at mapping time: `.kiro/specs/lead-workflow-ux-upgrade`.
- Completed spec context: `.kiro/specs/mvp-lead-ops-demo`, `.kiro/specs/dashboard-redesign`.
- Paused spec context: `.kiro/specs/demo-readiness-fixes`.
- Deferred integration work includes Telegram ingestion, website lead capture widget, telephony recording ingestion, and analytics/reporting expansion.
- Test data and examples must keep `Test` in person names when simulating users, forms, chat, assistant flows, or browser interactions.

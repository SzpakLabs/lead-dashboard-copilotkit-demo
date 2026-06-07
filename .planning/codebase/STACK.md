---
title: Technology Stack
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
focus: tech
---

# Technology Stack

## Overview

`lead-dashboard` is a full-stack TypeScript lead operations demo built with Next.js App Router. The app renders dashboard, calendar, settings, intake, lead detail, and API routes from one repository. PostgreSQL is the source of truth through Drizzle ORM, and CopilotKit provides the optional assistant runtime and React UI.

## Key File Paths

- `package.json` - scripts and dependency manifest.
- `tsconfig.json` - strict TypeScript configuration and `@/*` path alias to `src/*`.
- `next.config.ts` - minimal Next.js configuration.
- `tailwind.config.ts` - Tailwind CSS content paths, theme tokens, and forms plugin.
- `eslint.config.mjs` - Next.js core web vitals and TypeScript lint config.
- `vitest.config.ts` - node test environment and `@/*` alias.
- `drizzle.config.ts` - Drizzle Kit PostgreSQL migration config.
- `src/lib/db/schema.ts` - Drizzle schema and database enums.
- `src/lib/db/index.ts` - PostgreSQL client and Drizzle initialization.
- `drizzle/` - generated SQL migrations and Drizzle metadata.
- `app/layout.tsx` - global metadata, theme boot script, optional Copilot provider.
- `app/page.tsx` - console route.
- `app/calendar/page.tsx` - calendar route.
- `app/settings/page.tsx` - settings route.
- `app/intake/page.tsx` - intake route.
- `app/leads/[leadId]/page.tsx` - lead workspace route.
- `app/api/` - Next.js route handlers for domain mutations and assistant runtime.
- `src/lib/domain/` - domain functions for leads, follow-ups, custom fields, sources, calendar, and reports.
- `src/lib/ingestion/` - deterministic lead extraction interface and software-services extractor.
- `src/components/` - dashboard, lead, assistant, and UI components.
- `public/copilotkit-react-core-v2.css` - CopilotKit stylesheet served statically.

## Findings

### Runtime And Framework

- Uses Next.js App Router with `next` `^16.0.7`, React `^19.2.1`, and `react-dom` `^19.2.1`.
- Server routes and pages live under `app/`; shared application code lives under `src/`.
- Several primary pages export `dynamic = "force-dynamic"` because they read current database state.
- `app/layout.tsx` wraps the app in `CopilotProvider` only when assistant runtime readiness is true.

### Language And Type Safety

- TypeScript is strict: `tsconfig.json` sets `strict: true`, `allowJs: false`, `isolatedModules: true`, and `noEmit: true`.
- The repo uses the `@/*` import alias for `src/*`.
- Zod validates API input, domain input, ingestion input, and assistant tool contracts.

### UI Stack

- Styling uses Tailwind CSS `^3.4.17` with CSS variables defined in `app/globals.css`.
- Form normalization uses `@tailwindcss/forms`.
- Utility class merging uses `clsx` and `tailwind-merge`, surfaced through `src/lib/utils.ts`.
- Component primitives are local shadcn-style components under `src/components/ui/`.
- Icons use `lucide-react`.
- Dark mode is class-based and initialized before hydration in `app/layout.tsx`.

### Data Layer

- PostgreSQL is the application database.
- Drizzle ORM `^0.44.7` is used with the `postgres` driver.
- Drizzle Kit `^0.31.7` manages migrations from `src/lib/db/schema.ts` into `drizzle/`.
- `src/lib/db/index.ts` lazily initializes one Drizzle client from `DATABASE_URL`.
- Main tables include `workspaces`, `users`, `contacts`, `ingestion_events`, `leads`, `source_definitions`, `follow_ups`, `custom_field_definitions`, `custom_field_values`, `lead_events`, and `assistant_action_logs`.
- Migrations currently include initial schema, follow-up/custom-field/source changes, and assistant action logs.

### Domain Layer

- Writes are mostly routed through explicit domain modules in `src/lib/domain/`.
- Lead ingestion is handled by `src/lib/domain/leads/ingest-lead.ts`.
- Lead mutation is handled by `src/lib/domain/leads/update-lead.ts` and `src/lib/domain/leads/change-lead-status.ts`.
- Follow-up mutation is handled by `src/lib/domain/followups/manage-followups.ts`.
- Source configuration is handled by `src/lib/domain/sources/manage-sources.ts`.
- Reports and forecasts are deterministic domain queries in `src/lib/domain/reports/`.
- Calendar data is derived from lead and follow-up fields in `src/lib/domain/calendar/`.

### Assistant Stack

- CopilotKit packages are installed at `^1.57.4`: `@copilotkit/react-core`, `@copilotkit/react-ui`, and `@copilotkit/runtime`.
- The runtime route is `app/api/copilotkit/route.ts`.
- The React provider is `src/components/assistant/copilot-provider.tsx`.
- Assistant UI and tool rendering live in `src/components/assistant/assistant-panel.tsx`.
- Page-aware context is supplied by `src/components/assistant/assistant-route-context.tsx`.
- Assistant tools are typed with Zod in `src/lib/assistant/lead-tool-schemas.ts` and registered in `src/lib/assistant/tools/leads.ts`.
- Mutations use preview/apply flows and assistant action logs instead of direct freeform database writes.

### Ingestion Stack

- Intake currently supports pasted text and pasted transcript input.
- `src/lib/ingestion/extraction.ts` defines a `LeadExtractor` interface.
- `src/lib/ingestion/software-services-extractor.ts` provides deterministic software-services extraction.
- No live STT, telephony, Telegram, website widget, or external inbox ingestion is implemented in this repo state.

### Tooling And Verification

- Scripts in `package.json` include `dev`, `build`, `start`, `lint`, `format`, `format:check`, `test`, `typecheck`, and `check`.
- `npm run check` delegates to Bun commands for typecheck, lint, tests, format check, and build.
- Tests use Vitest in a node environment.
- Existing tests cover domain logic for reports, forecasts, budget parsing, calendar availability/items, ingestion, lead updates/status changes, follow-ups, and custom fields.

## Notes

- Supabase is part of steering direction, but this repo currently uses direct PostgreSQL connection code and does not include Supabase SDK usage.
- Vercel is the intended deployment target in steering, but there is no Vercel-specific project config in the inspected files.
- The active spec is `lead-workflow-ux-upgrade`; deferred integrations include Telegram, website lead capture widget, telephony recording ingestion, and broader analytics.

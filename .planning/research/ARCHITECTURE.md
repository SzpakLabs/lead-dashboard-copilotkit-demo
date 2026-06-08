# Architecture Research: AI Lead Dashboard

## Current Architecture

The app is a single-repository full-stack Next.js system.

- `app/` owns routes, server components, route handlers, and app layout.
- `src/components/` owns dashboard, lead, assistant, and UI components.
- `src/lib/domain/` owns business operations for leads, follow-ups, sources, custom fields, calendar, reports, and forecasts.
- `src/lib/db/` owns Drizzle schema, connection setup, migrations, and seed data.
- `src/lib/ingestion/` owns text normalization and deterministic extraction.
- `src/lib/assistant/` owns CopilotKit configuration, tool schemas, and tool implementations.

## Data Flow

1. User enters or reviews unstructured lead text.
2. API routes validate input with Zod.
3. Ingestion normalizes text and runs deterministic extraction.
4. Domain functions write contacts, leads, ingestion events, follow-ups, and audit events through Drizzle.
5. Dashboard, lead detail, calendar, reports, and assistant tools read from PostgreSQL-backed domain/read models.
6. Mutative assistant tools use typed preview/apply flows and action logs.

## Publication Build Order

1. Verify or fix the main dashboard and lead review path.
2. Verify demo data density and test-safe names.
3. Verify supporting routes: lead detail, calendar, settings, reports, forecast, assistant disabled/configured state.
4. Add README/demo packaging.
5. Run focused checks and browser smoke.
6. Deploy or document the local demo path.

## Architecture Constraints

- UI components should render state and call typed routes/actions.
- Domain modules should own validation and business rules.
- Assistant tools should call domain modules only.
- Ingestion should create drafts or proposals through the same pipeline.
- Calendar should remain a derived read model until standalone editable events are needed.


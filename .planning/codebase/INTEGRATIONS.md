---
title: External Integrations
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
focus: tech
---

# External Integrations

## Overview

The implemented external integration surface is intentionally small. The app depends on PostgreSQL for persistence and optionally connects CopilotKit to an OpenAI-compatible model provider for the assistant. Other integration areas in steering or deferred specs are not implemented yet.

## Key File Paths

- `.env.example` - environment variable names for database and assistant configuration; values should not be copied into docs.
- `src/lib/db/index.ts` - database connection initialization.
- `drizzle.config.ts` - migration-time database connection configuration.
- `src/lib/db/schema.ts` - persisted integration-related entities such as ingestion events, source definitions, lead events, and assistant action logs.
- `app/api/copilotkit/route.ts` - CopilotKit runtime endpoint.
- `src/lib/assistant/config.ts` - assistant enablement and provider key resolution.
- `src/lib/assistant/tools/leads.ts` - assistant read and mutation tools.
- `src/lib/assistant/lead-tool-schemas.ts` - assistant tool schemas.
- `src/components/assistant/copilot-provider.tsx` - client-side CopilotKit provider wiring.
- `src/components/assistant/assistant-panel.tsx` - CopilotKit popup, tool cards, report cards, forecast cards, and human-in-the-loop confirmation UI.
- `app/api/ingest/route.ts` - internal ingestion endpoint.
- `src/lib/domain/leads/ingest-lead.ts` - ingestion pipeline into database records.
- `src/lib/ingestion/software-services-extractor.ts` - deterministic extraction implementation.
- `app/api/sources/route.ts` and `app/api/sources/[sourceId]/route.ts` - source configuration endpoints.
- `src/lib/domain/sources/manage-sources.ts` - workspace source preset/custom source logic.
- `docs/00-meta/01-demo-runbook.md` - local demo reset and assistant enablement notes.

## Findings

### PostgreSQL

- Status: implemented.
- Purpose: source of truth for workspaces, users, contacts, leads, ingestion events, source definitions, follow-ups, custom fields, audit events, and assistant action logs.
- Runtime connection: `src/lib/db/index.ts` reads `DATABASE_URL` and creates a Drizzle client with the `postgres` driver.
- Migration connection: `drizzle.config.ts` loads local env files and points Drizzle Kit at `src/lib/db/schema.ts`.
- Migrations live in `drizzle/`.
- No database credentials or concrete connection strings are documented here.

### CopilotKit

- Status: implemented but optional.
- Purpose: global assistant runtime, popup UI, route context, typed tools, tool rendering, and human-in-the-loop confirmations.
- Runtime endpoint: `app/api/copilotkit/route.ts` exposes a single-route CopilotKit handler at `/api/copilotkit`.
- Client provider: `src/components/assistant/copilot-provider.tsx` uses `runtimeUrl="/api/copilotkit"` and `useSingleEndpoint`.
- Assistant UI: `src/components/assistant/assistant-panel.tsx` uses CopilotKit v2 hooks for default rendering, custom tool rendering, and human-in-the-loop confirmation.
- Page context: `src/components/assistant/assistant-route-context.tsx` sends route, search params, hash, and page-specific context to the assistant.
- Runtime is hidden/disabled unless assistant readiness passes in `src/lib/assistant/config.ts`.

### OpenAI-Compatible Model Providers

- Status: optional through CopilotKit runtime.
- Purpose: model-backed assistant responses and tool orchestration.
- Config surface: `src/lib/assistant/config.ts` resolves `COPILOTKIT_MODEL`, provider-specific API key names, and `COPILOTKIT_PROVIDER_API_KEY`.
- Recognized provider key families include OpenAI, Anthropic, Google Gemini/Google, Vertex, and a generic CopilotKit provider key.
- Default model identifier is defined in code, but no secret values are stored in docs.
- The assistant endpoint returns a clean disabled response when enablement or provider credentials are missing.

### Assistant Domain Tools

- Status: implemented.
- Registered tools in `src/lib/assistant/tools/leads.ts`:
  - `find_leads`
  - `open_lead`
  - `list_calendar_items`
  - `check_availability`
  - `get_lead_report`
  - `get_revenue_forecast`
  - `update_lead_fields`
  - `change_lead_status`
  - `create_followup`
  - `reject_assistant_mutation`
- Tool inputs and outputs are validated with schemas from `src/lib/assistant/lead-tool-schemas.ts`.
- Mutating tools use preview/apply mode and write to `assistant_action_logs`.
- The assistant prompt explicitly limits calendar, report, forecast, and availability answers to dashboard data.

### Internal API Routes

- Status: implemented as same-app HTTP endpoints, not external services.
- `app/api/ingest/route.ts` accepts pasted text/transcript ingestion.
- `app/api/leads/[leadId]/route.ts` updates lead/contact fields.
- `app/api/leads/[leadId]/status/route.ts` changes lead status.
- `app/api/leads/[leadId]/followups/route.ts` creates lead follow-ups.
- `app/api/followups/[followUpId]/route.ts` updates follow-ups.
- `app/api/followups/[followUpId]/complete/route.ts` completes follow-ups.
- `app/api/custom-fields/route.ts` and `app/api/custom-fields/[fieldId]/route.ts` manage custom field definitions.
- `app/api/leads/[leadId]/custom-fields/route.ts` updates custom field values.
- `app/api/sources/route.ts` and `app/api/sources/[sourceId]/route.ts` manage workspace source definitions.
- `app/api/copilotkit/route.ts` is the assistant runtime integration endpoint.

### Ingestion Sources

- Status: local deterministic ingestion implemented; external source ingestion deferred.
- Current source types are `pasted_text` and `pasted_transcript` in `src/lib/db/schema.ts`.
- `src/lib/domain/leads/ingest-lead.ts` stores an `ingestion_events` row, runs deterministic extraction, creates contact/lead records, and writes an audit event.
- `src/lib/ingestion/software-services-extractor.ts` uses regex-style deterministic extraction and test-safe name matching.
- Source labels are workspace configurable through `source_definitions`; they do not imply live external channel connections.

### Workspace Source Configuration

- Status: implemented as internal configuration.
- `src/lib/domain/sources/manage-sources.ts` defines presets for LinkedIn, Upwork, Referral, Website, Phone, WhatsApp, Instagram, Facebook, Google, Walk-in, and Other.
- Users can create, update, enable/disable, sort, and archive custom source definitions through API routes and settings UI.
- Lead and contact source fields are stored as text, allowing configurable source slugs beyond the old enum presets.
- This is metadata configuration, not a connection to those external platforms.

### Deployment And Hosting

- Status: planned by steering, not concretely configured.
- Next.js can be hosted on Vercel, and steering names Vercel as the demo host.
- No `vercel.json`, Vercel project metadata, or deployment workflow file was found in the inspected repo files.

### Not Implemented Or Deferred

- Supabase SDK/auth/storage integration is not present, despite being the preferred future platform in steering.
- Production auth is not implemented; the app uses a seeded demo workspace/user pattern.
- External calendar sync is not implemented; calendar and availability use internal lead/follow-up data only.
- Telegram ingestion is deferred.
- Website lead capture widget ingestion is deferred.
- Telephony recording/transcription ingestion is deferred.
- Live STT provider integration is not implemented.
- CRM export/sync is not implemented.
- Billing and payments are not implemented.
- Analytics warehouse or external product analytics are not implemented.

## Notes

- Environment variable names are safe to document, but secret values and connection strings should stay out of docs.
- Test data and examples involving person names must include `Test`.
- Assistant mutations must remain typed, previewed, and explicitly confirmed before apply.

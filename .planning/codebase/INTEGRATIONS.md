---
title: External Integrations
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
focus: tech
---

# External Integrations

## Overview

The real integration surface is intentionally narrow. The app persists to PostgreSQL and can optionally connect CopilotKit to an OpenAI-compatible provider. Source labels for LinkedIn, Upwork, WhatsApp, phone, and similar channels are workflow metadata, not live integrations.

## Implemented

### PostgreSQL

- Runtime DB connection via `DATABASE_URL`
- Drizzle schema and queries in `src/lib/db/**`
- Seed/reset flow in `src/lib/db/seed.ts`
- Demo workspace slug: `software-services-demo`

### CopilotKit Assistant

- Route: `app/api/copilotkit/route.ts`
- Client provider: `src/components/assistant/copilot-provider.tsx`
- Popup UI and human approval UI: `src/components/assistant/assistant-panel.tsx`
- Assistant readiness gate: `src/lib/assistant/config.ts`
- Env surface:
  - `LEAD_ASSISTANT_ENABLED`
  - `COPILOTKIT_MODEL`
  - `OPENAI_API_KEY`
  - `COPILOTKIT_PROVIDER_API_KEY`
  - `COPILOTKIT_TELEMETRY_DISABLED`

### Internal HTTP API

- `POST /api/ingest`
- `PATCH /api/leads/[leadId]`
- `PATCH /api/followups/[followUpId]`
- `POST /api/sources`
- `PATCH /api/sources/[sourceId]`
- `DELETE /api/sources/[sourceId]`
- `POST /api/custom-fields`
- `PATCH /api/custom-fields/[fieldId]`
- `DELETE /api/custom-fields/[fieldId]`

These are same-app endpoints used by the UI. They are not public product integrations.

### Deterministic Ingestion

- Input types: `pasted_text`, `pasted_transcript`
- Extractor interface in `src/lib/ingestion/extraction.ts`
- Software-services extractor in `src/lib/ingestion/software-services-extractor.ts`
- Ingestion stores raw and normalized source text in `ingestion_events`

## Configurable But Not Integrated

- Workspace source definitions in `src/lib/domain/sources/manage-sources.ts`
- Presets include LinkedIn, Upwork, Referral, Website, Phone, WhatsApp, Instagram, Facebook, Google, Walk-in, Other
- These labels drive intake and reporting copy only

## Not Implemented

- Supabase auth/storage/runtime usage
- Telegram ingestion
- Website widget capture
- Telephony recording ingestion
- External calendar sync
- CRM sync/export
- Billing/payments
- Analytics warehouse

## Notes

- Assistant answers about scheduling, reports, and forecasts are explicitly bounded to dashboard data.
- Secret values are intentionally omitted from docs; only env variable names are documented here.

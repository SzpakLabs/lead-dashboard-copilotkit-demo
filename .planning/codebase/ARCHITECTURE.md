---
title: Architecture Map
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
focus: arch
---

# Architecture Map

## Overview

The app is a server-rendered Next.js lead-ops console. Pages load seeded workspace data from PostgreSQL, render operational UI, and call internal route handlers that delegate to domain modules. The assistant is optional and sits beside the same domain layer rather than bypassing it.

## Flow

```txt
UI pages and client forms
  -> App Router pages / route handlers
  -> domain modules in src/lib/domain
  -> Drizzle queries against PostgreSQL

Assistant popup
  -> /api/copilotkit
  -> typed tools in src/lib/assistant/tools
  -> same domain/read-model functions
  -> PostgreSQL
```

## Main Layers

### Routes And Shell

- `app/layout.tsx` sets global layout and conditional Copilot provider
- `src/components/dashboard/app-shell.tsx` owns top nav, search, theme toggle, intake drawer, and assistant mount
- Main routes:
  - `/`
  - `/calendar`
  - `/settings`
  - `/intake`
  - `/leads/[leadId]`

### Read Models In Pages

- `app/page.tsx` loads dashboard metrics, lead ledger rows, active detail, follow-ups, activity, and source labels
- `app/calendar/page.tsx` loads all calendar items, scopes them in-memory to day/week/month
- `app/settings/page.tsx` loads source definitions, custom field definitions, and assistant readiness
- `app/leads/[leadId]/page.tsx` loads the full lead workspace view

### Domain Layer

- `src/lib/domain/leads/*` handles ingestion, status changes, and lead updates
- `src/lib/domain/followups/*` handles follow-up updates
- `src/lib/domain/custom-fields/*` handles custom field definition/value logic
- `src/lib/domain/sources/*` handles workspace source definitions
- `src/lib/domain/calendar/*` derives schedule items and availability
- `src/lib/domain/reports/*` builds deterministic reports and forecasts

### Ingestion

- `app/api/ingest/route.ts` validates request bodies with Zod
- `src/lib/domain/leads/ingest-lead.ts` stores ingestion event, runs extractor, creates contact and lead, and writes audit data
- `src/lib/ingestion/software-services-extractor.ts` is regex-based and intentionally favors partial/null extraction over invented data

### Assistant

- `app/api/copilotkit/route.ts` builds a single CopilotKit agent
- `src/lib/assistant/tools/leads.ts` defines search, open, calendar, report, forecast, availability, and preview/apply mutation tools
- `src/components/assistant/assistant-panel.tsx` renders tool results and the approval UI

### Persistence

- `src/lib/db/schema.ts` defines enums, tables, and indexes
- Seed data lives in `src/lib/db/seed.ts`
- `src/lib/db/bootstrap-state.ts` classifies missing-schema/missing-seed cases for empty-database UI states

## Architectural Characteristics

- Server pages do most data loading
- UI mutations flow through HTTP routes rather than direct client DB access
- Assistant writes are typed and preview-first
- Audit/event history is a first-class part of domain mutations
- Browser-local settings are isolated in `src/lib/settings/workspace-preferences.ts`

## Drift From Steering

- Steering says the repo is planning-only; code shows a full implemented app
- Steering points to a future `src/lib/assistant/tools/` boundary, which the current code follows
- Supabase is still absent despite being named in steering

---
title: Technology Stack
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
focus: tech
---

# Technology Stack

## Overview

`lead-dashboard` is a brownfield full-stack TypeScript app built on Next.js App Router. It delivers a lead-ops demo with a seeded PostgreSQL database, deterministic ingestion, dashboard/calendar/settings surfaces, and an optional CopilotKit assistant.

## Core Runtime

- Next.js `^16.0.7`
- React `^19.2.1`
- TypeScript `^5.7.2` with `strict: true`
- Tailwind CSS `^3.4.17`
- Local shadcn-style UI primitives under `src/components/ui`
- Lucide icons

## Data And Backend

- PostgreSQL via `postgres`
- Drizzle ORM `^0.45.2`
- Drizzle Kit `^0.31.7`
- Schema in `src/lib/db/schema.ts`
- Lazy DB bootstrap in `src/lib/db/index.ts`
- SQL migrations in `drizzle/`

## Assistant Stack

- `@copilotkit/react-core` `^1.57.4`
- `@copilotkit/react-ui` `^1.57.4`
- `@copilotkit/runtime` `^1.57.4`
- Runtime endpoint at `app/api/copilotkit/route.ts`
- Tool schemas in `src/lib/assistant/lead-tool-schemas.ts`
- Tool implementations in `src/lib/assistant/tools/leads.ts`

## Validation And Utilities

- Zod for domain, API, and tool validation
- `clsx` and `tailwind-merge` for class composition
- `dotenv` for local env loading

## Tooling

- ESLint 9 with Next config
- Prettier 3
- Vitest 4 in node environment
- `npm run check` aggregates typecheck, lint, test, format check, and build through Bun

## Key Files

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `drizzle.config.ts`
- `vitest.config.ts`
- `.env.example`
- `app/layout.tsx`
- `app/page.tsx`
- `src/lib/db/schema.ts`
- `src/lib/domain/**`
- `src/lib/assistant/**`

## Notes

- Steering still mentions Supabase as a preferred platform, but the implemented repo uses direct PostgreSQL access and contains no Supabase SDK integration.
- The current app is no longer planning-only; the stack summary should be read from code, not from the outdated structure steering note.

---
title: Coding Conventions
last_updated: 2026-06-08
last_mapped_commit: 9d62fbc025801c5a25aa16a8e80bef6e555625f8
---

# Coding Conventions

## Overview

This repository is a strict TypeScript Next.js App Router application for the lead operations demo. Business logic is concentrated in `src/lib/domain/**`, database schema and seed logic in `src/lib/db/**`, assistant contracts in `src/lib/assistant/**`, and route/page UI in `app/**` plus `src/components/**`.

Steering rules from `.kiro/steering/tech.md` and `.kiro/steering/structure.md` still apply: UI calls typed actions, domain modules own validation and business rules, assistant tools call domain modules, DB access stays under `src/lib/db`, and shared schemas stay under `src/lib/schemas` or feature-adjacent schema modules.

## Key File Paths

- `tsconfig.json` - strict TypeScript, no JS, `@/*` alias to `src/*`.
- `eslint.config.mjs` - Next core web vitals and TypeScript ESLint config.
- `package.json` - scripts for `typecheck`, `lint`, `test`, `format:check`, `build`, and `check`.
- `src/lib/db/schema.ts` - Drizzle table, enum, JSON, timestamp, and index definitions.
- `src/lib/db/index.ts` - database access entry point.
- `src/lib/db/seed.ts` - demo workspace seed/reset script.
- `src/lib/domain/**` - domain actions, deterministic business rules, and colocated tests.
- `src/lib/assistant/lead-tool-schemas.ts` - Zod assistant tool input/output contracts.
- `src/lib/assistant/tools/leads.ts` - CopilotKit tool definitions and execution wrappers.
- `app/api/**/route.ts` - Next route handlers that parse input and call domain functions.
- `app/page.tsx`, `app/calendar/page.tsx`, `app/leads/[leadId]/page.tsx` - server-rendered page composition and data loading.
- `src/components/dashboard/**`, `src/components/leads/**`, `src/components/assistant/**` - client and presentation components.
- `.kiro/specs/lead-workflow-ux-upgrade/**` - active spec guiding current implementation.

## Findings

### TypeScript and Modules

- TypeScript strict mode is enabled in `tsconfig.json`; new code should preserve explicit types at module boundaries.
- Imports use the `@/` alias for `src/**` and relative imports for nearby files, for example `@/lib/db` and `./update-lead`.
- Type-only imports are used where appropriate, especially in component and assistant modules.
- Files are small to medium by feature, but some route/page modules include both rendering and query helpers, such as `app/page.tsx`.

### Validation and Contracts

- Zod schemas are the normal boundary validation tool.
- Domain input schemas are exported next to domain actions, for example `ingestLeadInputSchema` in `src/lib/domain/leads/ingest-lead.ts`.
- Assistant tool contracts are centralized in `src/lib/assistant/lead-tool-schemas.ts`.
- API route handlers generally parse request bodies with `.safeParse()` and return `400` JSON errors on invalid input, as in `app/api/ingest/route.ts`.

### Domain Layer

- Domain modules call `getDb()` and operate against the demo workspace slug `software-services-demo`.
- Mutations create audit rows in `leadEvents`; this pattern appears in lead, follow-up, custom field, source, and assistant mutation flows.
- Domain functions throw plain `Error` objects for missing entities or invalid business operations.
- Missing or clearable optional values are normalized to `null`, not empty strings, in update flows.
- Deterministic helpers are kept close to the feature, for example `parseBudgetRange` in `src/lib/domain/reports/budget.ts` and custom field normalization in `src/lib/domain/custom-fields/manage-custom-fields.ts`.

### Data Layer

- Drizzle schema uses `pgTable`, `pgEnum`, UUID primary keys, workspace foreign keys, timestamp columns with timezone, and explicit indexes.
- Core tables include `workspaces`, `users`, `contacts`, `leads`, `followUps`, `ingestionEvents`, `leadEvents`, `customFieldDefinitions`, `customFieldValues`, `sourceDefinitions`, and `assistantActionLogs`.
- Lead source storage has moved to text fields plus `sourceDefinitions`; the older `leadSourceEnum` remains present in `src/lib/db/schema.ts`.
- JSON columns use typed `$type<...>()` for structured metadata, audit snapshots, missing fields, and assistant logs.

### App Router and UI

- Pages in `app/**/page.tsx` are mostly server components that load data and compose feature components.
- Client-only components use `"use client"`, for example `src/components/assistant/copilot-provider.tsx`.
- Global shell concerns are centralized in `src/components/dashboard/app-shell.tsx`.
- The dashboard uses dense operational UI classes from `app/globals.css` rather than only utility classes.
- Components prefer explicit prop types declared in the same file, as seen in `src/components/dashboard/lead-workspace.tsx`.
- `lucide-react` icons are used for dashboard controls and status affordances.

### Assistant Integration

- CopilotKit is the assistant framework; `src/components/assistant/copilot-provider.tsx` points to `/api/copilotkit`.
- Tools are defined with `defineTool` in `src/lib/assistant/tools/leads.ts`.
- Mutative assistant tools use preview/apply modes and assistant action logs rather than direct freeform mutation.
- Calendar availability responses encode the product limitation with the phrase `Based on this dashboard`.

### Formatting and Style

- Prettier is configured through `.prettierrc.json` and enforced by `format:check`.
- Code currently uses double quotes, semicolons, named exports, and descriptive domain names.
- Comments are rare; continue avoiding comments unless logic is non-obvious.
- Test and seed names must include `Test`, and current examples follow that pattern.

## Notes

- `src/lib/db/seed.ts` currently seeds only two leads and fixed May 2026 dates; the active spec still marks dense demo data as incomplete.
- `.kiro/steering/structure.md` says the repo is planning-only, but the actual repository now contains an implemented Next.js app. Treat the app code and active spec as current evidence.
- Avoid broad refactors in mapping or quality work; convention changes should be made only when they support the active implementation slice.

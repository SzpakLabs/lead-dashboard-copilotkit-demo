---
title: Code Conventions
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
---

# Code Conventions

## Language And Modules

- TypeScript strict mode is enabled
- `@/*` aliases point to `src/*`
- Named exports are the default pattern
- Explicit domain names are preferred over generic helpers

## Validation

- Zod is the standard input boundary for routes, domain commands, settings, and assistant tools
- Route handlers usually parse with `safeParse` and return `400` JSON on validation failure

## Domain Rules

- Domain logic lives in `src/lib/domain/**`
- Writes are expected to create audit history in `lead_events` or `assistant_action_logs`
- Optional cleared values are normalized to `null`
- Assistant writes are preview-first

## UI Patterns

- Server pages load data and compose feature components
- Client components opt in with `"use client"`
- Shared app chrome lives in `AppShell`
- Tailwind utilities and app-specific `ops-*` classes are used together

## Styling And Formatting

- Double quotes and semicolons are standard
- Prettier and ESLint are part of the normal check path
- Comments are rare; keep them out unless logic is genuinely non-obvious

## Data Safety

- Test person names must include `Test`
- Current seeds and extraction tests follow this rule
- Continue applying it to forms, browser checks, docs examples, and assistant scenarios

## Repo-Specific Drift

- Some code still relies on the hard-coded demo workspace slug
- Some read paths query broadly and scope in code rather than through a full workspace/auth boundary

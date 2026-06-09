# Stack Research: AI Lead Dashboard

## Scope

This research is based on the local codebase map, steering files, active Kiro spec, and `.planning/idea.md`. No live web research provider was configured in the GSD init probe, so this file records repo-grounded findings for the brownfield publication milestone.

## Current Stack

- Next.js App Router hosts pages, route handlers, and the CopilotKit runtime endpoint.
- React and strict TypeScript are the primary application layer.
- Tailwind CSS and local shadcn-style UI primitives provide the interface system.
- PostgreSQL is the source of truth through Drizzle ORM.
- Zod validates API inputs, domain inputs, ingestion inputs, and assistant tool contracts.
- Vitest covers domain logic in a node environment.
- CopilotKit is optional and gated by runtime configuration.
- The app is intended for Vercel deployment with database credentials configured externally.

## Fit For Goal

The stack is appropriate for a portfolio demo because it keeps UI, routes, domain logic, database access, and assistant runtime in one TypeScript repository. It is also credible for client work because the code already separates UI rendering from domain writes and keeps assistant actions typed.

## Keep

- Keep the existing Next.js, Drizzle, PostgreSQL, Zod, and CopilotKit boundaries.
- Keep deterministic extraction for demo reliability.
- Keep `npm run check` as the strongest single local verification command when dependencies and environment are available.
- Keep publication work focused on broken flows, setup notes, demo script, screenshots, deployment, and safe seed data.

## Avoid

- Do not replace the data layer before publication.
- Do not add a parallel custom assistant framework.
- Do not introduce production auth or billing into the publication milestone.
- Do not let optional assistant credentials block the non-assistant demo path.

# Phase 1: Publishable Lead Review Flow - Research

## RESEARCH COMPLETE

## Objective

Research what is needed to plan Phase 1 well: harden the existing dashboard route, expand safe demo data, prove a lead review/status loop, and verify the first viewport.

## Findings

### Current Implementation

- The app is already a Next.js App Router dashboard with `/`, `/calendar`, `/settings`, `/intake`, and `/leads/[leadId]` routes.
- `app/page.tsx` is the primary console route and already composes `AppShell`, `OperationalHealthStrip`, `LeadFilterRail`, `LeadLedgerPanel`, and `LeadPreviewDialog`.
- `src/components/dashboard/lead-preview-dialog.tsx` uses native `dialog` and URL query state. Closing removes `leadId` from the current URL.
- `src/components/dashboard/lead-workspace.tsx` already exposes the key display model for phase 1: status, source, timeline, next step, follow-up timing, confidence, missing fields, and preview content.
- `src/lib/db/seed.ts` is currently sparse: it creates one workspace, source definitions, one fake owner, two test-safe contacts, two ingestion events, two leads, two custom fields, two follow-ups, and four lead events.

### Phase 1 Planning Implications

- The lowest-risk path is not a new feature. It is a publication hardening pass over existing surfaces plus denser deterministic seed data.
- Seed work is the largest implementation task because it supports multiple requirements at once: safe data, representative lead attributes, first-viewport credibility, and later calendar/report usefulness.
- The review/status proof should reuse existing API/domain routes. Adding a new mutation path would increase risk and conflict with steering.
- Verification must include browser inspection because Vitest does not cover UI surfaces, dialogs, dense mode, dark mode, or responsive clipping.

### Constraints

- Person names used in seed data, tests, browser input, chat prompts, and documentation examples must include `Test`.
- Assistant behavior is optional and should not block Phase 1 route readiness.
- Do not start deferred integrations: Telegram, telephony, website widget, production auth, billing, or CRM sync.
- Preserve TypeScript strict mode, Drizzle/PostgreSQL, domain-layer mutation boundaries, Tailwind CSS, local UI primitives, and CopilotKit boundaries.

## Validation Architecture

Phase 1 validation should sample the user-visible workflow rather than only unit logic.

- Automated gate: `npm run check`.
- Seed gate: `npm run db:reset-demo` succeeds when `DATABASE_URL` is configured and leaves a populated `software-services-demo` workspace.
- Browser gate: desktop `/` opens without crash; first viewport shows populated metrics and ledger; a lead preview opens and closes; a status/review action updates UI or persisted state.
- Mobile gate: `/` and preview controls are reachable without clipped controls or incoherent overlap.
- Safety gate: seed names and browser-entered names contain `Test`.

## Risks

- `npm run check` depends on Bun and build/database assumptions; document any missing local prerequisite instead of hiding the failure.
- Browser checks may require a running database and seeded data.
- The first viewport can still look sparse if seed data is expanded but the default sort does not put representative leads near the top.
- Native dialog behavior should be checked on mobile sizes for close button visibility and scroll containment.

## Recommended Plan Shape

1. Expand deterministic safe seed data.
2. Harden the main route, preview/status path, and first viewport fallbacks.
3. Verify the route with automated and targeted browser checks, fixing blockers found during verification.

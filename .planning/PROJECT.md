# AI Lead Dashboard

## What This Is

AI Lead Dashboard is a portfolio demo of an AI-assisted lead operations workspace for service businesses. It turns messy inbound lead text into structured opportunities, follow-ups, calendar work, reports, and controlled assistant actions.

## Core Value

Show a realistic lead qualification workflow where messy inquiries become actionable sales operations data under human control.

## Requirements

### Validated

- Existing Next.js App Router app implements dashboard, intake, calendar, settings, lead detail, and API routes.
- Existing Drizzle/PostgreSQL data model supports workspaces, contacts, leads, ingestion events, follow-ups, custom fields, sources, lead events, and assistant action logs.
- Existing deterministic ingestion pipeline extracts software-services lead details from text.
- Existing domain tests cover ingestion, reports, forecasts, budget parsing, calendar behavior, lead updates, follow-ups, and custom fields.
- Existing optional CopilotKit assistant tools use typed schemas and preview/apply behavior.

### Active

- [ ] Publish a credible lead operations demo for client outreach.
- [ ] Ensure demo-safe data and examples use `Test` in person names.
- [ ] Make lead intake or lead review demonstrable without fragile private setup.
- [ ] Document business value, stack, local setup, deployment notes, and 60-second demo flow.
- [ ] Keep assistant and database-dependent behavior clear, safe, and bounded.

### Out of Scope

- Real Telegram, telephony, website widget, email inbox, or CRM integrations - deferred until after first publication.
- Production auth, billing, permissions, and multi-tenant hardening - not required for portfolio proof.
- Replacing Drizzle/PostgreSQL - existing architecture already matches the demo.
- Broad analytics expansion - current reports and forecasts are enough for v1.
- Full redesign - fix publish blockers first.

## Context

This is one of three demos in a fast portfolio sprint. The current mission is public links and outreach, not a perfect CRM.

The mapped codebase is a strict TypeScript Next.js project with React, Tailwind, Drizzle ORM, PostgreSQL, Zod, Vitest, domain modules, route handlers, and optional CopilotKit assistant runtime.

## Constraints

- **Test data safety**: Person names used in testing, forms, chat, examples, or simulations must include `Test`.
- **Architecture**: Preserve the existing Next.js, Drizzle, PostgreSQL, domain-layer, and CopilotKit boundaries.
- **Timeline**: Ship a useful portfolio link before adding integrations.
- **Verification**: Prefer the existing check pipeline and tests over new infrastructure.
- **Scope**: Fix blockers and demo clarity before polish.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep software-services lead operations as the demo domain | It is clear for agencies and service businesses | Pending |
| Preserve deterministic extraction for v1 | It avoids brittle AI dependencies in the public demo | Pending |
| Keep assistant mutations behind preview/apply behavior | Human control is central to the portfolio positioning | Pending |
| Defer real ingestion channels | Public demo value comes from workflow clarity, not integrations | Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

After each phase transition:

1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. What This Is still accurate? Update if drifted.

After each milestone:

1. Full review of all sections.
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-06-08 after initialization*

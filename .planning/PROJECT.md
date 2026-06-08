# AI Lead Dashboard

## What This Is

AI Lead Dashboard is a portfolio-ready lead operations demo for small service businesses and software-services sales workflows. It turns messy inbound lead text into structured opportunities, follow-ups, calendar work, reports, forecasts, configurable sources, and controlled assistant actions.

The current repository is no longer planning-only. It is an implemented full-stack Next.js App Router app that needs publication-focused hardening, documentation, demo data verification, and deployment readiness.

## Core Value

Show a realistic lead qualification workflow where messy inquiries become actionable sales operations data under human control.

## Requirements

### Validated

- Existing Next.js App Router app implements the console, intake, calendar, settings, lead detail, and API routes.
- Existing Drizzle/PostgreSQL model supports workspaces, contacts, leads, ingestion events, follow-ups, custom fields, source definitions, lead events, and assistant action logs.
- Existing deterministic software-services extraction turns pasted inbound text into structured lead drafts without requiring a live LLM.
- Existing lead operations workflow supports lead review, statuses, follow-ups, custom fields, source configuration, calendar views, reports, and forecasts.
- Existing optional CopilotKit runtime uses typed assistant tools and preview/apply behavior for mutative actions.
- Existing domain tests cover ingestion, reports, forecasts, budget parsing, calendar behavior, lead updates, status changes, follow-ups, and custom fields.
- Existing `.kiro/specs/lead-workflow-ux-upgrade` spec has completed most UX workflow upgrades; remaining tracked work is demo data expansion and verification.

### Active

- [ ] Publish a credible AI-assisted lead operations demo for client outreach.
- [ ] Ensure demo-safe data and examples use `Test` in person names.
- [ ] Make lead intake or lead review demonstrable without fragile private setup.
- [ ] Verify the active Kiro spec's remaining demo data and verification tasks.
- [ ] Document business value, stack, local setup, deployment notes, and a 60-second demo flow.
- [ ] Keep assistant and database-dependent behavior clear, safe, optional, and bounded.
- [ ] Ship a public link or documented local demo path suitable for Upwork, LinkedIn, GitHub, and direct outreach.

### Out of Scope

- Real Telegram, telephony, website widget, email inbox, or CRM integrations - deferred until after the first public demo.
- Production auth, billing, permissions, and multi-tenant hardening - not required for portfolio proof.
- Replacing Drizzle/PostgreSQL - existing architecture already matches the demo.
- Broad analytics expansion - current reports and forecasts are enough for this publication milestone.
- Full redesign - the active goal is publishable demo confidence, not a new product direction.
- Custom assistant framework outside CopilotKit - steering and active spec require the existing CopilotKit architecture.

## Context

This is one of three public portfolio demos for client outreach. The demo should prove the creator can build AI-assisted sales operations tools that ingest messy lead input, extract structured fields, score and organize opportunities, schedule follow-ups, and keep human approval around important actions.

The product is positioned as AI-assisted lead operations for service businesses that live on calls and chats, not as a universal CRM. The first vertical template is software services because it can be dogfooded immediately with LinkedIn and Upwork leads.

The mapped codebase is a strict TypeScript Next.js project with React, Tailwind CSS, Drizzle ORM, PostgreSQL, Zod, Vitest, local shadcn-style primitives, lucide icons, and optional CopilotKit assistant runtime. Main application code lives under `app/` and `src/`, with domain writes routed through explicit modules rather than component-level database mutations.

The active implementation spec is `.kiro/specs/lead-workflow-ux-upgrade`. Its remaining unchecked tasks are dense demo data expansion and verification of the already-built UX, settings, search, dense mode, dark mode, assistant, report, and forecast behavior.

## Constraints

- **Test data safety**: Person names used in testing, forms, chats, examples, browser simulations, assistant flows, or documentation examples must include `Test`.
- **Architecture**: Preserve the existing Next.js App Router, Drizzle, PostgreSQL, domain-layer, Zod, and CopilotKit boundaries.
- **Workflow**: Check the active Kiro spec before implementation; do not start deferred specs without explicit user confirmation.
- **Timeline**: Ship a useful portfolio link before adding real ingestion integrations or production hardening.
- **Verification**: Prefer the existing `npm run check` pipeline and targeted browser checks over broad cleanup.
- **Scope**: Fix blockers, demo clarity, README/script, data safety, and deployment readiness before polish.
- **Credentials**: Assistant and database-dependent behavior must fail cleanly or be documented when private credentials are absent.

## Key Decisions

| Decision                                                               | Rationale                                                           | Outcome |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ------- |
| Keep software-services lead operations as the demo domain              | It is clear for agencies, freelancers, and small service businesses | Pending |
| Preserve deterministic extraction for v1 publication                   | It avoids brittle AI dependencies in the public demo                | Pending |
| Keep assistant mutations behind typed tools and preview/apply behavior | Human control is central to the portfolio positioning               | Pending |
| Defer real ingestion channels                                          | Public demo value comes from workflow clarity before integrations   | Pending |
| Treat the active Kiro spec as the implementation source of truth       | It already tracks completed and remaining work in this repo         | Pending |
| Use GSD for publication-phase planning around the existing app         | The repo is brownfield and should not be re-scaffolded              | Pending |

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

_Last updated: 2026-06-08 after initialization_

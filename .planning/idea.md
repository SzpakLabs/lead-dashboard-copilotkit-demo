# AI Lead Dashboard Idea

## Goal

Ship AI Lead Dashboard as one of three public portfolio demos for client outreach. The demo should prove that I can build AI-assisted sales operations tools: ingest messy inbound lead text, extract structured fields, score and organize opportunities, schedule follow-ups, and keep human approval around important actions.

This is a portfolio demo, not a production CRM. The priority is a credible live link, clear lead-review workflow, and client-facing documentation that supports Upwork proposals and direct outreach.

## Current Product

The existing app is a full-stack Next.js App Router project with React, strict TypeScript, Tailwind CSS, PostgreSQL, Drizzle ORM, Vitest tests, Zod validation, and optional CopilotKit assistant runtime.

It includes a software-services lead operations workspace with lead ingestion, lead review, statuses, follow-ups, custom fields, source configuration, calendar views, reports, forecasts, and assistant action logs. The codebase already has domain-layer tests around ingestion, reports, forecasts, lead updates, follow-ups, calendar behavior, and custom fields.

## Demo Story

A service business receives unstructured inquiry text from a form, call note, or message. The dashboard extracts lead details, highlights budget and urgency, shows fit and missing fields, schedules follow-up work, and lets the operator review or change the next action.

Primary demo moments:

- Paste or review inbound lead text and see structured lead data.
- Review budget, urgency, service type, source, status, and follow-up timing.
- Move a lead through the sales workflow.
- Show calendar and reporting views that make follow-up workload visible.
- Use assistant tooling only as a controlled helper, not as an unchecked autonomous actor.

## v1 Scope

- Publishable lead operations dashboard using the existing Next.js and Drizzle architecture.
- Seeded or demo-safe software-services workspace.
- Lead intake/review workflow with deterministic extraction.
- Lead detail and status management.
- Follow-ups, calendar, source configuration, and custom fields where already implemented.
- Short README or portfolio notes with business problem, solution, stack, local setup, deployment notes, and 60-second demo script.
- Safe public demo path, with private credentials optional or clearly documented.

## Out Of Scope

- Real Telegram, telephony, website widget, email inbox, or CRM integrations.
- Production auth, billing, multi-tenant hardening, or complex permissions.
- Broad redesign of the existing product concept.
- Replacing the Drizzle/PostgreSQL architecture during the sprint.
- Large analytics expansion before the first public demo is shipped.

## Shipping Constraints

- Use demo-safe test data. Any person names used in forms, chat, examples, or tests must include `Test`.
- Prefer Bun for project commands when practical, but respect existing scripts and lockfile realities.
- Fix publish blockers first: build failure, crash, broken navigation, missing fallback, or embarrassing first-screen issue.
- Do not run broad cleanup or Fallow autofixes before publication.
- Every change should help publish the live link, demo flow, README, screenshots, or proposal value.

## Acceptance Criteria

- Live URL opens or documented local demo opens cleanly.
- Main lead dashboard route does not crash.
- User can demonstrate lead intake or lead review with safe demo data.
- At least one visible lead workflow action changes UI or persisted demo state.
- Assistant or database-dependent parts have a clear fallback or setup note.
- README or portfolio notes explain the problem, solution, stack, and 60-second demo flow.

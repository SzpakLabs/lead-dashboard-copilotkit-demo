# AI Lead Dashboard

AI-assisted lead operations demo for turning messy inbound requests into structured, follow-up-ready work.

## Live Demo

https://lead-dashboard-rosy.vercel.app/

## Problem

Small service teams often receive leads as scattered messages, vague requests, and incomplete notes. That makes it hard to review urgency, confirm scope, schedule follow-ups, and explain pipeline health without moving data into a cleaner operational flow.

## Solution

This demo shows a single operator workspace where inbound lead data becomes structured review, searchable lead records, follow-up timing, calendar visibility, and assistant-ready reporting. The main story starts on `/`, where the lead console presents source-labeled intake, review queues, preview and detail surfaces, and next-step context.

## What The Demo Proves

- Unstructured lead intake can become structured lead review under human control.
- Operators can inspect the same lead through console preview, calendar preview, and full detail pages.
- Workspace settings can manage custom fields and source definitions without leaving the app shell.
- Search, dense mode, dark mode, and optional assistant tools make the demo feel like a real operating console rather than a static mockup.
- Assistant reports and revenue forecasts are available when runtime credentials are configured, but the core demo still works with the assistant disabled.

## Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Drizzle ORM
- Tailwind CSS
- CopilotKit for the optional assistant surface

## Main Routes

- `/` — lead operations console and primary demo entry
- `/calendar` — schedule board for lead work and follow-ups
- `/settings` — workspace settings for custom fields and sources
- `/leads/[leadId]` — full lead workspace

## Local Development Setup

1. Install dependencies.
2. Create a local `.env` file with the safe variable names from `.env.example`.
3. Start PostgreSQL and point `DATABASE_URL` at the local database you want to use for the demo.
4. Run:

```sh
npm run db:migrate
npm run db:reset-demo
npm run dev
```

5. Open `http://localhost:3000/`.

## Demo Reset Flow

Use the seeded `software-services-demo` workspace for the local development path.

```sh
npm run db:migrate
npm run db:reset-demo
npm run dev
```

If you want a full pre-share check before presenting, also run:

```sh
npm run check
npm run build
```

## Optional Assistant Setup

Assistant behavior is optional.

- Default safe path: keep `LEAD_ASSISTANT_ENABLED="false"`. The app runs without assistant entry points.
- Assistant-on path: set `LEAD_ASSISTANT_ENABLED="true"` and provide either `OPENAI_API_KEY` for the default model or `COPILOTKIT_PROVIDER_API_KEY` for another compatible provider.
- `COPILOTKIT_MODEL` controls the configured model string.

When credentials are missing, the demo should be presented as assistant-off rather than broken.

## Deployment Notes

The primary share artifact is the live public demo:

https://lead-dashboard-rosy.vercel.app/

- Public demo: controlled hosted portfolio deployment, not a production SaaS app
- Local development path: developer setup for running and reseeding the app locally
- Optional assistant env surface: `LEAD_ASSISTANT_ENABLED`, `COPILOTKIT_MODEL`, `OPENAI_API_KEY`, `COPILOTKIT_PROVIDER_API_KEY`, `COPILOTKIT_TELEMETRY_DISABLED`
- Secrets are intentionally not exposed in this repo or in the public demo docs

Public smoke checks for `/`, `/calendar`, and `/settings` are recorded in `.planning/phases/03-portfolio-packaging-and-deployment/03-VERIFICATION.md`.

## Demo Walkthrough

Use this order for a fast product story:

1. Open the live demo on `/`.
2. Click `New intake` and explain that it opens a manual, source-labeled intake flow.
3. Paste a Test-safe inbound request, select a source and input type, and create a draft lead.
4. Return to the console and show how that inbound request becomes reviewable operational work.
5. Open lead preview or full detail to show source, budget, urgency, next step, status, and follow-up context.
6. Open `/calendar` or mention reports and forecasts as supporting proof points.

## Limitations

- This is a portfolio demo, not a production-authenticated multi-tenant system.
- The source dropdown in `New intake` represents source-labeled intake, not completed live integrations for LinkedIn, WhatsApp, or phone systems.
- Public demo hosting exists for portfolio review, but production SaaS hardening is out of scope.
- Assistant behavior depends on optional provider credentials and should be treated as an enhancement, not the core requirement.
- External ingestion channels such as Telegram, website capture, and telephony are deferred.

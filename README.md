# AI Lead Dashboard

AI-assisted lead operations demo for turning messy inbound requests into structured, follow-up-ready work.

## Problem

Small service teams often receive leads as scattered messages, vague requests, and incomplete notes. That makes it hard to review urgency, confirm scope, schedule follow-ups, and explain pipeline health without moving data into a cleaner operational flow.

## Solution

This demo shows a single operator workspace where inbound lead data becomes structured review, searchable lead records, follow-up timing, calendar visibility, and assistant-ready reporting. The main story starts on `/`, where the seeded `software-services-demo` workspace presents lead queues, filters, preview dialogs, and next-step context.

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

## Local Setup

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

Use the seeded `software-services-demo` workspace for the local demo path.

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

Phase 3 prepares the public-share path but does not assume external deployment approval has already been granted.

- Required env surface for a safe share path: `DATABASE_URL`
- Optional assistant env surface: `LEAD_ASSISTANT_ENABLED`, `COPILOTKIT_MODEL`, `OPENAI_API_KEY`, `COPILOTKIT_PROVIDER_API_KEY`, `COPILOTKIT_TELEMETRY_DISABLED`
- Preferred public-hosting direction: deploy the existing Next.js app to Vercel or another Node-compatible host only after explicit approval to use external services.
- Exact next deployment action once approved: configure the required environment variables in the hosting target, run the production deployment command for that target, then smoke-check `/`, `/calendar`, and `/favicon.ico`.

Until that approval exists, the documented local demo path is the release fallback.

## Demo Walkthrough

Use this order for a fast product story:

1. Open `/` and show how messy inbound work becomes a structured lead queue.
2. Open a lead preview to show summary, source, next step, and follow-up context.
3. Open the full lead page or `/calendar` to show operational depth.
4. Mention reports, forecasts, and assistant behavior as supporting proof points rather than the main story.

## Limitations

- This is a portfolio demo, not a production-authenticated multi-tenant system.
- Public deployment is approval-gated and may remain blocked even when the local demo is ready.
- Assistant behavior depends on optional provider credentials and should be treated as an enhancement, not the core requirement.
- External ingestion channels such as Telegram, website capture, and telephony are deferred.

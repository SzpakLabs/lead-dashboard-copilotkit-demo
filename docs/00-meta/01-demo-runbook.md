# Demo Runbook

Use this runbook for the live public demo first. Keep the local development path for developer setup and reseeding only.

## Public Demo

Primary share URL:

https://lead-dashboard-rosy.vercel.app/

Settings hub highlights:

- `/settings?section=workspace` keeps demo-safe workspace defaults in browser-local storage only.
- `/settings?section=sources` keeps source labels editable but frames them as workflow metadata, not proof of live integrations.
- `/settings?section=help` and `/settings?section=about` are read-only portfolio context, not editable admin content.

Terminology:

- Public demo / live demo: the hosted portfolio deployment above
- Local development path: developer-only setup on `localhost`
- Self-hosted demo / standalone hosted demo: controlled hosted deployment, not production SaaS
- Production SaaS: out of scope for this portfolio demo

## Local Development Reset

These commands target the `software-services-demo` workspace only for local development.

```sh
npm run db:migrate
npm run db:reset-demo
npm run dev
```

`npm run db:seed` is also scoped to the same demo workspace and recreates the curated seed data.

## Required Environment

Required for the base local development path:

```sh
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/lead_dashboard"
```

Optional assistant configuration:

```sh
LEAD_ASSISTANT_ENABLED="false"
COPILOTKIT_MODEL="openai/gpt-5.4-mini"
OPENAI_API_KEY=""
COPILOTKIT_PROVIDER_API_KEY=""
COPILOTKIT_TELEMETRY_DISABLED="true"
```

Assistant-off behavior is the default safe path. Assistant entry points stay hidden unless `LEAD_ASSISTANT_ENABLED=true` and a provider key is available. For the default OpenAI model, set `OPENAI_API_KEY`. For another provider, use `COPILOTKIT_PROVIDER_API_KEY`.

## Assistant States

- Disabled: `LEAD_ASSISTANT_ENABLED=false` or no provider key. The app should still run cleanly on `/`, `/calendar`, and `/settings` without assistant entry points.
- Configured: `LEAD_ASSISTANT_ENABLED=true` plus a valid provider key. Assistant surfaces should appear and support read-only reports or forecasts along with preview-first mutations.

## Public Smoke Check

Use the live public demo for share-readiness checks:

```sh
curl -I https://lead-dashboard-rosy.vercel.app/
curl -I https://lead-dashboard-rosy.vercel.app/calendar
curl -I https://lead-dashboard-rosy.vercel.app/settings
```

Expected public smoke result: each route returns an HTTP success response and no secrets or private env values are exposed in the UI or docs.

## Local Development Smoke Check

```sh
npm run check
npm run build
curl -I http://localhost:3000/
curl -I http://localhost:3000/calendar
curl -I http://localhost:3000/favicon.ico
```

Expected local development smoke result: each route returns an HTTP success response and the console opens on `/`.

## Intake Story

For the demo, `New intake` opens a manual, source-labeled intake flow titled `Create draft lead`.

- The user pastes a call note, chat, or transcript.
- The user labels the source and input type.
- The app creates a draft lead for human review.
- Do not present the source dropdown as proof of real LinkedIn, WhatsApp, or phone integrations.

## Presenter Checklist

- Open `https://lead-dashboard-rosy.vercel.app/`.
- Confirm `/calendar` and `/settings` load from the live demo.
- Open `/settings` and show that Workspace, Sources, Help, and About live in one shared shell.
- Click `New intake`.
- Confirm the `Create draft lead` flow opens with source and input type controls.
- Paste a Test-safe inbound request and create a draft lead.
- Confirm the app shows a clear enough non-broken post-submit result.
- Decide whether the demo is assistant-off or assistant-configured before presenting.
- If assistant-off, state that reports and forecasts are optional surfaces and the core workflow does not depend on them.
- Use the local development reset commands only when you need to reproduce or reseed the app locally.

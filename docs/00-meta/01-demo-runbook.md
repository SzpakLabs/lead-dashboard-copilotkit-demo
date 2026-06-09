# Demo Runbook

Use this runbook for the seeded local demo path first. Public deployment stays a separate approval-gated branch.

## Local Demo Reset

These commands target the `software-services-demo` workspace only.

```sh
npm run db:migrate
npm run db:reset-demo
npm run dev
```

`npm run db:seed` is also scoped to the same demo workspace and recreates the curated seed data.

## Required Environment

Required for the base demo:

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

## Smoke Check

```sh
npm run check
npm run build
curl -I http://localhost:3000/
curl -I http://localhost:3000/calendar
curl -I http://localhost:3000/favicon.ico
```

Expected local smoke result: each route returns an HTTP success response and the console opens on `/`.

## Deployment Preparation

Use this only after explicit approval to use external services.

- Configure the same safe variable names in the hosting target.
- Keep assistant disabled by default unless provider credentials are intentionally supplied.
- After the production deployment command runs, smoke-check `/`, `/calendar`, and `/favicon.ico`.
- If approval is missing, stop at documentation readiness and use the local demo path instead.

## Presenter Checklist

- Run `npm run db:migrate`.
- Run `npm run db:reset-demo`.
- Run `npm run dev`.
- Confirm `/` opens the seeded console flow.
- Confirm `/calendar` renders seeded schedule data.
- Decide whether the demo is assistant-off or assistant-configured before presenting.
- If assistant-off, state that reports and forecasts are optional surfaces and the core workflow does not depend on them.

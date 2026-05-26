# Demo Runbook

## Local Demo Reset

These commands target the `software-services-demo` workspace only.

```sh
npm run db:migrate
npm run db:reset-demo
npm run dev
```

`npm run db:seed` is also scoped to the same demo workspace and recreates the curated seed data.

## Required Environment

```sh
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/lead_dashboard"
LEAD_ASSISTANT_ENABLED="false"
COPILOTKIT_MODEL="openai/gpt-5.4-mini"
OPENAI_API_KEY=""
COPILOTKIT_PROVIDER_API_KEY=""
COPILOTKIT_TELEMETRY_DISABLED="true"
```

Assistant entry points stay hidden unless `LEAD_ASSISTANT_ENABLED=true` and a provider key is available. For the default OpenAI model, set `OPENAI_API_KEY`. For another provider, either set that provider's key or `COPILOTKIT_PROVIDER_API_KEY`.

## Smoke Check

```sh
npm run check
npm run build
curl -I http://localhost:3000/
curl -I http://localhost:3000/calendar
curl -I http://localhost:3000/favicon.ico
```

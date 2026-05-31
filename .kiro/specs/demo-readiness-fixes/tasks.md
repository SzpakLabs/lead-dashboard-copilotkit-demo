# Tasks: Demo Readiness Fixes

## Demo Data

- [x] Decide whether reset should be local-only or safe for deployed demo DB.
- [x] Add an idempotent seed or dedicated `db:reset-demo` script.
- [x] Ensure reset removes previous verification records from the demo workspace.
- [x] Ensure curated seed records are test-safe and presentation-ready.
- [x] Document reset/seed commands.

## Assistant Runtime

- [x] Reproduce or check for the `/api/copilotkit/threads?agentId=default` 404.
- [x] Check current CopilotKit v2 routing requirements.
- [x] Fix route/config so normal page load has no avoidable assistant 404.
- [x] Document required assistant environment variables.
- [x] Add missing-credentials behavior: clean disable or clear failure.
- [ ] Verify assistant search and mutation preview with a real configured LLM session.

## Browser Polish

- [x] Add favicon.
- [x] Verify `/favicon.ico` returns 200.
- [x] Check first page-load console for avoidable 404s.

## Demo Interaction Logging

- [ ] Decide whether logs should be cleared by `db:reset-demo` or preserved behind a separate cleanup command.
- [ ] Add persistence for demo visits grouped by IP grouping key.
- [ ] Add page-visit capture for primary demo routes.
- [ ] Add client interaction logging helper for meaningful clicks and interactions.
- [ ] Track lead row clicks, preview open/close, tab changes, filter/search usage, calendar event clicks, settings changes, and primary action buttons.
- [ ] Add assistant conversation logging for user messages, assistant responses, tool/action names, page context, and confirmation outcomes.
- [ ] Add server-side Telegram event forwarding helper.
- [ ] Add `.env`/example documentation for `TELEGRAM_DEMO_EVENTS_BOT_TOKEN`, `TELEGRAM_DEMO_EVENTS_CHAT_ID`, and optional `TELEGRAM_DEMO_EVENTS_ENABLED`.
- [ ] Send concise Telegram summaries for visits, clicks/interactions, and assistant events when configured.
- [ ] Disable Telegram forwarding cleanly when env vars are missing.
- [ ] Ensure logging excludes secrets, cookies, auth tokens, provider keys, and raw request headers.
- [ ] Ensure logging failures do not block dashboard, calendar, lead workflows, or assistant usage.
- [ ] Ensure Telegram delivery failures do not block event persistence or user flows.
- [ ] Document log inspection and reset/retention commands.

## Verification

- [x] Run `npm run check`.
- [x] Run `npm run build`.
- [x] Reset and seed local demo DB.
- [x] Verify `/` renders curated seeded dashboard data.
- [x] Verify `/calendar` renders curated seeded calendar data.
- [x] Verify assistant is working or intentionally disabled without broken UI.
- [x] Capture local demo URL and command checklist.
- [ ] Verify visits are captured and grouped by IP grouping key.
- [ ] Verify clicks and interactions are captured with route and action names.
- [ ] Verify assistant conversations and confirmation outcomes are captured.
- [ ] Verify Telegram event summaries arrive in the configured inbox chat when env vars are present.
- [ ] Verify Telegram forwarding is cleanly disabled when env vars are missing.
- [ ] Verify normal visitors cannot access demo logs.
- [ ] Run public deployment smoke after deployment is explicitly approved.

# Tasks: Demo Readiness Fixes

## Demo Data

- [ ] Decide whether reset should be local-only or safe for deployed demo DB.
- [ ] Add an idempotent seed or dedicated `db:reset-demo` script.
- [ ] Ensure reset removes previous verification records from the demo workspace.
- [ ] Ensure curated seed records are test-safe and presentation-ready.
- [ ] Document reset/seed commands.

## Assistant Runtime

- [ ] Reproduce the `/api/copilotkit/threads?agentId=default` 404.
- [ ] Check current CopilotKit v2 routing requirements.
- [ ] Fix route/config so normal page load has no avoidable assistant 404.
- [ ] Document required assistant environment variables.
- [ ] Add missing-credentials behavior: clean disable or clear failure.
- [ ] Verify assistant search and mutation preview still work when configured.

## Browser Polish

- [ ] Add favicon.
- [ ] Verify `/favicon.ico` returns 200.
- [ ] Check first page-load console for avoidable 404s.

## Verification

- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Reset and seed local demo DB.
- [ ] Verify `/` renders curated seeded dashboard data.
- [ ] Verify `/calendar` renders curated seeded calendar data.
- [ ] Verify assistant is working or intentionally disabled without broken UI.
- [ ] Capture final demo URL and command checklist.

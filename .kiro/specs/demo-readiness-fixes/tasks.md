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

## Verification

- [x] Run `npm run check`.
- [x] Run `npm run build`.
- [x] Reset and seed local demo DB.
- [x] Verify `/` renders curated seeded dashboard data.
- [x] Verify `/calendar` renders curated seeded calendar data.
- [x] Verify assistant is working or intentionally disabled without broken UI.
- [x] Capture local demo URL and command checklist.
- [ ] Run public deployment smoke after deployment is explicitly approved.

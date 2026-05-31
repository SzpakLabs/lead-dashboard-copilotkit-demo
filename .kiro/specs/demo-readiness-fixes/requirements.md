# Requirements: Demo Readiness Fixes

## Goal

Make the completed lead dashboard safe and clean to present as a local or public portfolio demo.

## Scope

This spec only covers final demo-readiness fixes found after the MVP implementation:

- Clean reset/seed workflow for curated demo data.
- Assistant runtime readiness and environment documentation.
- Small browser polish for missing favicon.
- Demo interaction logging for visits, clicks/interactions, and assistant conversations.
- Optional Telegram forwarding for demo events into a private inbox chat.
- Final local and deployed smoke verification.

This spec does not add product-facing analytics features.

## Requirements

### 1. Clean Demo Data

THE SYSTEM SHALL provide a repeatable way to reset a demo database to curated seed data.

Acceptance criteria:

- Running the reset workflow removes old verification/test records.
- Running the seed workflow creates only curated software-services demo records.
- Seeded person names must include `Test`.
- The dashboard should show a predictable small set of demo leads after reset.
- The workflow must be documented in a concise command list.

### 2. Assistant Runtime Readiness

THE SYSTEM SHALL make the assistant usable or clearly disabled for demo environments.

Acceptance criteria:

- Required assistant environment variables are documented.
- The local and deployed app do not show avoidable CopilotKit endpoint 404 errors during normal page load.
- If assistant provider credentials are missing, the app should fail clearly or hide/disable assistant entry points.
- Assistant mutation previews must still require explicit user confirmation.

### 3. Browser Polish

THE SYSTEM SHALL avoid obvious browser-console polish issues.

Acceptance criteria:

- `/favicon.ico` returns a valid icon response.
- The app has a sensible browser title and metadata.
- No avoidable 404s appear on first page load.

### 4. Deployment Smoke

THE SYSTEM SHALL have a short verification path for public demo deployment.

Acceptance criteria:

- Production build passes.
- Typecheck, lint, tests, and format check pass.
- `/` returns 200 and renders seeded dashboard data.
- `/calendar` returns 200 and renders seeded calendar data.
- Assistant is either verified working or intentionally disabled with no broken UI.

### 5. Demo Interaction Logging

THE SYSTEM SHALL record lightweight demo usage events so portfolio-demo behavior can be reviewed after local or public sessions.

Acceptance criteria:

- Page visits are recorded with timestamp, route, referrer where available, user agent where available, and an IP grouping key.
- Visits can be grouped by IP grouping key without requiring a signed-in user.
- Clicks and meaningful interactions are recorded with timestamp, route, event type, target/action name, and relevant entity identifiers such as lead id when available.
- Assistant conversations are recorded with timestamp, route/page context, conversation/session id, user messages, assistant responses where available, tool/action names, and confirmation outcomes.
- When Telegram forwarding is configured, demo events are sent to the configured Telegram inbox chat as concise summaries.
- Telegram forwarding configuration is read from environment variables, including bot credentials and the group/user chat id.
- Logging must not record secrets, provider API keys, cookies, auth tokens, or raw request headers.
- Telegram bot credentials must never be exposed to the client.
- Public demo logging must avoid exposing logs to normal visitors.
- Reset/seed documentation explains whether demo logs are preserved or cleared.
- Logging or Telegram delivery failures must not break the dashboard, calendar, lead workflows, or assistant.

## Out of Scope

- Redesigning the dashboard.
- Adding Telegram, website widget, telephony, or analytics.
- Building a full analytics dashboard or warehouse.
- Replacing deterministic extraction with live LLM extraction.
- Adding real authentication.
- Expanding to non-software-services verticals.

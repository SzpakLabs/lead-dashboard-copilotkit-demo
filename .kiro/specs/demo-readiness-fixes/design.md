# Design: Demo Readiness Fixes

## Current State

The MVP spec is complete and local checks pass. A quick readiness pass found practical demo issues:

- Local database contains old verification records mixed with curated seed records.
- CopilotKit requests `/api/copilotkit/threads?agentId=default` and receives 404 in dev.
- `/favicon.ico` is missing.
- Deployment readiness depends on database migration/seed and assistant environment setup.

## Approach

Keep this as an operational hardening slice, not a feature slice.

## Demo Data Reset

Add a dedicated script for demo reset, either:

- `db:reset-demo`: clears demo tables in dependency order, then runs the seed script.
- Or update `db:seed` to be idempotent and safe to rerun for `software-services-demo`.

Preferred behavior:

- Scope deletes to the seeded `software-services-demo` workspace when possible.
- Keep all seed names test-safe.
- Avoid generic destructive reset commands unless clearly named and documented.

## Assistant Runtime

Investigate the CopilotKit v2 runtime route shape before changing behavior.

Possible fixes:

- Configure the provider/runtime so thread endpoints are served correctly.
- Add any missing route handler required by CopilotKit.
- If credentials are missing, disable the visible assistant panel in that environment and show no broken console behavior.

Environment documentation should include:

- `DATABASE_URL`
- CopilotKit/model/provider variables required by the selected runtime
- Optional telemetry opt-out variable if desired

## Favicon

Add a small static `app/favicon.ico` or `public/favicon.ico`.

Use a simple branded mark that is acceptable for a portfolio demo. Do not spend time on logo design in this spec.

## Demo Interaction Logging

Add demo-only observability for reviewing how visitors use the portfolio demo. This is not a full analytics product surface.

Recommended event model:

- `demo_visits`: route, referrer, user agent, IP grouping key, first seen timestamp, last seen timestamp, visit count, optional session id.
- `demo_interaction_events`: timestamp, route, event type, target/action name, optional lead id, optional metadata JSON.
- `demo_assistant_events`: timestamp, route/page context, conversation/session id, role, message text or safe summary, tool/action name when applicable, confirmation outcome when applicable.

IP grouping:

- Prefer a stable demo grouping key derived from the request IP, such as a salted hash, so visits can be grouped without exposing raw IPs in normal admin views.
- If raw IP storage is used for local debugging, keep it internal and do not expose it to public visitors.
- Respect proxy headers only through a small server helper so local, Vercel, and future hosting behavior stay consistent.

Capture points:

- Server-side middleware or route-level helper records page visits for primary demo routes.
- Client-side interaction helper records meaningful product interactions such as lead row clicks, preview open/close, tab changes, filter changes, search opens/results, calendar event clicks, settings changes, and primary action buttons.
- Assistant runtime/tool layer records conversation messages, tool calls, action previews, confirmation approvals/rejections, and disabled/missing-credential states.

Safety:

- Do not log cookies, auth headers, provider API keys, environment variables, or raw request headers.
- Keep logging best-effort; event write failures should be swallowed or reported to server logs without breaking user flows.
- Add retention/reset behavior explicitly. For a clean public demo reset, clearing logs with demo data is acceptable; for local review, preserving logs behind a separate command is acceptable if documented.

### Telegram Event Inbox

Optionally forward demo events to a private Telegram inbox chat so the demo owner can watch activity without opening the database.

Environment variables:

- `TELEGRAM_DEMO_EVENTS_BOT_TOKEN`: Telegram bot token used server-side for `sendMessage`.
- `TELEGRAM_DEMO_EVENTS_CHAT_ID`: target private chat, group, or channel id.
- `TELEGRAM_DEMO_EVENTS_ENABLED`: optional explicit toggle; missing credentials should disable forwarding cleanly.

Notes:

- Telegram sending must happen only on the server.
- A plain bot id is not enough to call the Telegram Bot API; the app needs the bot token. If a separate display id is useful, derive it from the token or add a non-secret `TELEGRAM_DEMO_EVENTS_BOT_ID`, but do not use it as the credential.
- Send concise summaries, not full raw payloads. Include event type, route, IP grouping key, lead id when relevant, and assistant tool/confirmation outcome when relevant.
- Avoid forwarding secrets, cookies, auth tokens, provider keys, raw headers, or large assistant transcripts.
- Delivery failures should be logged server-side and must not block event persistence or user flows.
- Consider simple throttling or batching for high-frequency events such as repeated filter changes.

## Verification

Local verification:

- `npm run check`
- `npm run build`
- Reset and seed demo DB
- Open `/` and `/calendar`
- Browser console smoke check
- Generate visit, interaction, and assistant events using only test-safe input names when names are needed.
- Confirm events are grouped by IP grouping key and are not visible to normal visitors.
- With Telegram env vars configured, confirm concise event summaries arrive in the configured inbox chat.
- With Telegram env vars missing, confirm forwarding is disabled without UI or server errors.

Deployment verification:

- Configure env vars in Vercel
- Run migrations against deployed DB
- Run seed/reset against deployed demo DB
- Smoke check `/`, `/calendar`, and assistant behavior
- Smoke check that visits, clicks/interactions, and assistant conversations are captured without exposing secrets or breaking the UI.
- Smoke check Telegram forwarding only after the demo bot token and inbox chat id are configured in deployment env.

## Risks

- A reset script can be destructive if pointed at the wrong database. Naming and documentation must make that clear.
- CopilotKit endpoint behavior may depend on installed package version. Verify against the local package/docs before patching.
- Assistant provider credentials may not be available in all demo contexts, so disabled-but-clean is acceptable.
- Demo logs can accidentally collect sensitive visitor input. Keep the schema narrow, avoid secrets, and document retention/reset behavior.
- Telegram forwarding can leak data to the wrong chat if `TELEGRAM_DEMO_EVENTS_CHAT_ID` is wrong. Keep messages concise and verify the target chat in local or staging before public demo use.

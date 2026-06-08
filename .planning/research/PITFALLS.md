# Pitfalls Research: AI Lead Dashboard

## Pitfall: Public Demo Depends On Private Setup

Warning signs:

- Main route crashes without `DATABASE_URL` or assistant credentials.
- README does not explain setup or fallback behavior.
- Public deployment shows an error page instead of a useful demo state.

Prevention:

- Verify clean disabled states.
- Document required environment variables without exposing values.
- Keep a non-assistant path demonstrable.

## Pitfall: Unsafe Test Data Looks Real

Warning signs:

- Seeded people or examples use realistic names without `Test`.
- Browser tests or assistant prompts simulate real customer names.

Prevention:

- Audit seed data, docs, and examples before publication.
- Use names like `Maria Test`, `Carlos Test`, `Test User`, and `Juan Test`.

## Pitfall: Assistant Feels Uncontrolled

Warning signs:

- Assistant can mutate records without preview.
- Tool schemas are bypassed.
- UI presents generated output as accounting truth.

Prevention:

- Keep typed CopilotKit tools.
- Preserve preview/apply behavior.
- Label forecasts as estimates and show assumptions.

## Pitfall: Scope Expands Past Publication

Warning signs:

- Work starts on Telegram, telephony, website widgets, auth, billing, or analytics expansion.
- A redesign starts before first public demo confidence is achieved.

Prevention:

- Keep the active milestone focused on route stability, seed/demo data, README, screenshots, and deployment readiness.
- Use deferred Kiro specs only after explicit user confirmation.

## Pitfall: Existing Steering Is Stale

Warning signs:

- `.kiro/steering/structure.md` still says the repo is planning-only.
- Agents infer greenfield work despite the implemented app.

Prevention:

- Treat `.planning/codebase/` and active Kiro specs as current repo evidence.
- Update steering only when a product or architecture decision changes.


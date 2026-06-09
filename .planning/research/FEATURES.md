# Feature Research: AI Lead Dashboard

## Table Stakes For This Demo

- Main dashboard route opens reliably.
- Demo-safe seeded workspace is available.
- Lead intake or lead review can be shown quickly.
- Lead records show contact, company, source, status, service type, budget, urgency, next step, and follow-up timing where available.
- At least one lead action visibly changes UI or persisted demo state.
- Calendar, detail, reports, and forecasts support the lead operations story.
- Settings make custom fields and sources understandable.
- Assistant is either available through CopilotKit or cleanly disabled with setup notes.
- README or portfolio notes explain the problem, solution, stack, local setup, deployment notes, and a 60-second demo script.
- Test data and examples use names containing `Test`.

## Differentiators

- Messy text becomes structured lead operations data.
- Human approval remains visible around important assistant actions.
- Reports and forecasts are generated from deterministic domain queries rather than freeform database access.
- Configurable sources and custom fields make the demo feel workspace-aware without becoming a generic CRM.
- The product can be positioned for real service businesses, not only as an AI chat demo.

## Anti-Features

- Full omnichannel inbox.
- Production telephony or Telegram ingestion.
- Production auth, billing, and enterprise permissions.
- CRM replacement workflows unrelated to lead intake, review, follow-up, and reporting.
- Large analytics expansion before the first public demo.
- New visual redesign that distracts from publication readiness.

## Dependencies

- Database availability or a clearly documented local seed path.
- Seed data density and safety.
- Clean first-screen behavior.
- README/demo script quality.
- Optional assistant configuration that does not break the core app when absent.

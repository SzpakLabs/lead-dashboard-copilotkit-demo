# MVP Scope

## Goal

Create a portfolio-ready demo that proves the operational loop from unstructured customer input to reviewed lead, dashboard management, follow-up, and audit trail.

## Demo Core In Scope

- Seeded workspace and fake user
- Software services template for LinkedIn/Upwork-style leads
- Pasted text/transcript input
- Ingestion event storage
- Mock/deterministic extraction behind an interface
- Draft lead creation with missing-field markers
- Human review/edit/confirm flow
- Lead list and lead detail
- Contact linked to lead
- Status lifecycle
- Follow-ups with due/overdue state
- Basic audit/activity events
- Simple metrics: total leads, needs review, scheduled, won/lost, overdue follow-ups

## Later MVP

- Manual lead creation
- Workspace custom fields
- Calendar view for lead-related scheduled/completed work
- Assistant search and display
- Assistant calendar awareness
- Assistant mutation previews with confirmation
- Live LLM extraction
- Telegram text/voice intake
- Audio upload/transcription
- Laptop repair and beauty services templates
- Saved filters

## Out of Scope

- Full CRM replacement
- Production telephony integration
- Native iPhone SMS/iMessage ingestion
- Full Google/Apple calendar integration
- External calendar sync
- Billing
- Enterprise permissions
- Full analytics/reporting suite
- Dedicated backend repository

## Fixed Decisions

- First template: software services.
- Auth strategy: seeded workspace and fake user.
- Extractor strategy: mock/deterministic extractor behind an interface.
- Repo strategy: one full-stack Next.js repository.
- Calendar strategy: internal lead-related calendar only; no external sync in MVP.

## Open Questions

- Later assistant preview placement.
- Later default working hours, duration, and timezone handling for availability checks.

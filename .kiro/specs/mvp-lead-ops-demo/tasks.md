# Tasks: MVP Lead Ops Demo

Status: draft only. Do not implement these tasks until the next implementation session.

## Planning

- [x] Set first demo input source to pasted text/transcript
- [x] Set first demo auth strategy to seeded workspace and fake user
- [x] Set first vertical template to software services
- [x] Split Demo Core from Later MVP
- [x] Finalize initial lead status labels, colors, and allowed transitions
- [x] Finalize software services seed examples and fields
- [x] Set public demo deployment baseline to Vercel app plus Supabase managed Postgres/auth/storage

## Foundation

- [x] Scaffold Next.js App Router project with TypeScript strict mode
- [x] Add Tailwind and UI primitives
- [x] Configure database provider and Drizzle
- [x] Define base schema for workspaces, fake users, contacts, leads, follow-ups, ingestion events, and audit/activity events
- [x] Add explicit lead/follow-up date fields needed for later calendar derivation: `scheduledAt`, `completedAt`, `followUpDueAt`
- [x] Add seed data using test-safe person names

## Slice 1: Lead From Ingestion

- [x] Create ingestion endpoint for pasted text/transcript
- [x] Store ingestion event
- [x] Add extraction service interface
- [x] Add mock/deterministic software-services extractor
- [x] Create draft lead from extracted fields
- [x] Show draft/needs-review leads in dashboard

## Slice 2: Lead Review and Detail

- [x] Build lead list/table
- [x] Build lead detail view
- [x] Add editable standard fields
- [x] Add transcript/source context panel
- [x] Save edits through domain action
- [x] Write audit events for edits

## Slice 3: Status and Follow-Up

- [ ] Add lead status model
- [ ] Add status change UI
- [ ] Add follow-up model
- [ ] Add create/update/complete follow-up flow
- [ ] Show due and overdue follow-ups

## Slice 4: Basic Metrics and Activity

- [ ] Show simple counts: total leads, needs review, scheduled, won/lost, overdue follow-ups
- [ ] Show lead activity history in lead detail
- [ ] Verify all lead edits, status changes, and follow-up changes write audit/activity events

## Later MVP: Custom Fields

- [ ] Add custom field definition CRUD
- [ ] Render custom fields in lead detail
- [ ] Save custom field values
- [ ] Validate field type changes and archived fields

## Later MVP: Calendar View

- [ ] Build calendar item query/read model from lead/follow-up date fields
- [ ] Add calendar screen with month/week/day scope as appropriate for MVP
- [ ] Color-code calendar items by lead status
- [ ] Link calendar items back to lead detail

## Later MVP: Assistant Search

- [ ] Add CopilotKit runtime route
- [ ] Add assistant panel
- [ ] Implement `find_leads`
- [ ] Implement `open_lead`
- [ ] Render assistant result cards

## Later MVP: Assistant Calendar Awareness

- [ ] Implement `list_calendar_items`
- [ ] Implement `check_availability`
- [ ] Teach assistant to answer availability questions from internal calendar data with "Based on this dashboard..." wording
- [ ] Ask for clarification when date, time, duration, timezone, or working-hours context is missing

## Later MVP: Assistant Mutations

- [ ] Implement mutation preview contract
- [ ] Implement `update_lead_fields`
- [ ] Implement `change_lead_status`
- [ ] Implement `create_followup`
- [ ] Require user confirmation before applying assistant mutations
- [ ] Log assistant action lifecycle

## Verification

- [ ] Verify dashboard core flow manually with test-safe names
- [ ] Verify pasted text creates a draft lead through the mock extractor
- [ ] Verify user can review/edit/confirm the draft lead
- [ ] Verify status and follow-up changes write audit/activity events
- [ ] Verify simple metrics match seeded/demo data
- [ ] Later: verify assistant search returns correct lead cards
- [ ] Later: verify rejected assistant preview does not mutate data
- [ ] Later: verify confirmed assistant mutation writes audit event
- [ ] Later: verify custom fields survive lead edits and filtering
- [ ] Later: verify calendar color matches lead status
- [ ] Later: verify assistant availability answers use scheduled lead/follow-up data

## Optional Content Milestones

- [ ] Article 1: Why small service businesses need lead ops, not a full CRM
  - Trigger: after Wave 1 docs and MVP scope are stable
  - Angle: product framing, narrowing scope, avoiding CRM bloat
- [ ] Article 2: Designing the domain model before adding an AI assistant
  - Trigger: after domain model, entities, and event model are drafted
  - Angle: Lead as primary entity, ingestion events, audit trail
- [ ] Article 3: Turning messy conversations into structured leads
  - Trigger: after Slice 1 works end-to-end
  - Angle: normalized ingestion pipeline, draft lead, review flow
- [ ] Article 4: Building an AI assistant that asks before it changes data
  - Trigger: after assistant preview/confirmation flow works
  - Angle: tool-based actions, HITL, auditability, trust
- [ ] Article 5: Custom fields without building a bloated CRM
  - Trigger: after custom fields are usable in lead detail
  - Angle: workspace-specific schemas for different service businesses
- [ ] Article 6: Calendar-aware lead ops without building a full booking system
  - Trigger: after calendar view and assistant availability checks work
  - Angle: completed/upcoming lead work, status colors, internal availability
- [ ] Article 7: From portfolio demo to real pilot
  - Trigger: after demo deployment and first pilot integration plan
  - Angle: what changed when moving from demo to real business workflow

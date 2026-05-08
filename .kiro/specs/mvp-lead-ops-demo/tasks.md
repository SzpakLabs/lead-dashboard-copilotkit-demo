# Tasks: MVP Lead Ops Demo

Status: draft only. Do not implement these tasks until the next implementation session.

## Planning

- [ ] Confirm first demo input source: pasted transcript, audio upload, or Telegram text
- [ ] Confirm whether first demo includes auth or a seeded demo workspace
- [ ] Choose first vertical template: laptop repair, beauty services, or software services
- [ ] Finalize initial lead statuses
- [ ] Finalize default working hours and appointment duration for calendar availability
- [ ] Finalize first custom field examples for laptop repair, beauty services, and software services

## Foundation

- [ ] Scaffold Next.js App Router project with TypeScript strict mode
- [ ] Add Tailwind and UI primitives
- [ ] Configure database provider and Drizzle
- [ ] Define base schema for workspaces, leads, contacts, custom fields, follow-ups, ingestion events, and audit logs
- [ ] Decide whether MVP calendar items are derived or stored explicitly
- [ ] Add seed data using test-safe person names

## Slice 1: Lead From Ingestion

- [ ] Create ingestion endpoint for pasted text/transcript
- [ ] Store ingestion event
- [ ] Add extraction service interface
- [ ] Create draft lead from extracted fields
- [ ] Show draft/needs-review leads in dashboard

## Slice 2: Lead Review and Detail

- [ ] Build lead list/table
- [ ] Build lead detail view
- [ ] Add editable standard fields
- [ ] Add transcript/source context panel
- [ ] Save edits through domain action
- [ ] Write audit events for edits

## Slice 3: Status and Follow-Up

- [ ] Add lead status model
- [ ] Add status change UI
- [ ] Add follow-up model
- [ ] Add create/update/complete follow-up flow
- [ ] Show due and overdue follow-ups

## Slice 4: Custom Fields

- [ ] Add custom field definition CRUD
- [ ] Render custom fields in lead detail
- [ ] Save custom field values
- [ ] Validate field type changes and archived fields

## Slice 5: Calendar View

- [ ] Add scheduled/completed date fields needed for calendar display
- [ ] Build calendar item query/read model
- [ ] Add calendar screen with month/week/day scope as appropriate for MVP
- [ ] Color-code calendar items by lead status
- [ ] Link calendar items back to lead detail

## Slice 6: Assistant Search

- [ ] Add CopilotKit runtime route
- [ ] Add assistant panel
- [ ] Implement `find_leads`
- [ ] Implement `open_lead`
- [ ] Render assistant result cards

## Slice 7: Assistant Calendar Awareness

- [ ] Implement `list_calendar_items`
- [ ] Implement `check_availability`
- [ ] Teach assistant to answer availability questions from internal calendar data
- [ ] Ask for clarification when date, time, duration, timezone, or working-hours context is missing

## Slice 8: Assistant Mutations

- [ ] Implement mutation preview contract
- [ ] Implement `update_lead_fields`
- [ ] Implement `change_lead_status`
- [ ] Implement `create_followup`
- [ ] Require user confirmation before applying assistant mutations
- [ ] Log assistant action lifecycle

## Verification

- [ ] Verify dashboard core flow manually with test-safe names
- [ ] Verify assistant search returns correct lead cards
- [ ] Verify rejected assistant preview does not mutate data
- [ ] Verify confirmed assistant mutation writes audit event
- [ ] Verify custom fields survive lead edits and filtering
- [ ] Verify calendar color matches lead status
- [ ] Verify assistant availability answers use scheduled lead/follow-up data

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

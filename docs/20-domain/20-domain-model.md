# Domain Model

## Core Entities

### Contact

Person or company interacting with the business.

Examples:

- `Alex Test` from LinkedIn
- `Maria Test` from Upwork
- `Test Company`

### Lead

A specific request, job, project, deal, or service opportunity.

Examples:

- Website redesign request from `Alex Test`
- CRM automation request from `Maria Test`
- Later: laptop repair request from `Carlos Test`

### CalendarItem

A scheduled or historical time-bound event related to a contact and usually a lead. Calendar items are not leads.

Examples:

- Discovery call
- Follow-up due time
- Project kickoff
- Completed service date

For Demo Core, calendar items do not need a dedicated table. Prefer a derived read model from explicit lead/follow-up fields such as `scheduledAt`, `completedAt`, and `followUpDueAt`.

## Relationships

```txt
Contact
  -> has many Leads
  -> has many CalendarItems

Lead
  -> belongs to Contact
  -> has many CalendarItems
  -> has many FollowUps
  -> has many Activities
  -> has many CustomFieldValues

CustomFieldDefinition
  -> belongs to Workspace
  -> has many CustomFieldValues
```

## Lead Identity Rules

- Same person, same ongoing request = one Contact, one Lead, many CalendarItems or Activities.
- Same person, new request later = one Contact, new Lead.
- First contact should create or link a Contact, create a Lead, and create a CalendarItem if there was a call, meeting, appointment, or scheduled slot.
- Repeated contact should create a new CalendarItem or Activity; it creates a new Lead only if the request is distinct.

## Status Lifecycle Draft

Initial statuses:

- `new` / New / gray
- `needs_review` / Needs review / amber
- `contacted` / Contacted / blue
- `scheduled` / Scheduled / violet
- `in_progress` / In progress / cyan
- `won` / Won / green
- `lost` / Lost / red

Allowed transitions:

- `new` -> `needs_review`, `contacted`, `scheduled`, `lost`
- `needs_review` -> `contacted`, `scheduled`, `lost`
- `contacted` -> `scheduled`, `in_progress`, `won`, `lost`
- `scheduled` -> `contacted`, `in_progress`, `won`, `lost`
- `in_progress` -> `scheduled`, `won`, `lost`
- `won` -> `contacted`
- `lost` -> `contacted`

Later calendar visibility:

- `scheduled` and `in_progress` appear for upcoming scheduled work.
- `won` and `lost` appear only for completed or historical work.
- Follow-up due items can appear for any non-terminal active lead.

## Software Services Template

Demo Core extractor target fields:

- contact name
- company or client organization
- source channel: LinkedIn, Upwork, referral, website, other
- project type: website, dashboard, automation, integration, consulting, other
- problem summary
- requested outcome
- budget range
- timeline
- next step
- scheduled time, if mentioned
- follow-up due time, if mentioned

Seed examples must use test-safe names, such as `Alex Test`, `Maria Test`, and `Test Company`.

## Custom Fields

Custom fields are workspace-scoped and stored outside the base lead schema.

- `CustomFieldDefinition` stores the label, stable key, type, archive state, and workspace.
- `CustomFieldValue` stores one lead value for one definition.
- Supported field types are `text`, `number`, `boolean`, and `date`.
- Archived definitions are hidden from lead detail and cannot accept new value updates.
- Field type changes are allowed only when existing values can be validated against the new type.

## Calendar Availability Rule

Assistant availability answers must be scoped to known dashboard data.

Required wording pattern:

> Based on this dashboard, that time looks free.

If working hours, duration, timezone, or external calendar context is missing, the assistant must ask for clarification instead of guessing.

## Demo Core Data Model

- Workspace
- User or fake user
- Contact
- Lead
- FollowUp
- IngestionEvent
- LeadEvent / Activity
- CustomFieldDefinition
- CustomFieldValue

## Later MVP Data Model

- CalendarItem, if standalone editable calendar events are needed
- AssistantActionLog
- Conversation
- Call
- Transcript
- Recording

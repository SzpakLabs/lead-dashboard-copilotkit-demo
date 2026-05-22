# Assistant Tool Catalog

## Current Slice: Assistant Search, Calendar Awareness, and Mutations

The dashboard assistant exposes typed tools for the seeded software services demo workspace.

### `find_leads`

Searches leads by title, contact, company, source, status, project type, summary, timeline, or next step.

Input:

- `query` optional text, max 160 characters
- `status` optional lead lifecycle status
- `limit` optional result limit, 1 to 8, default 5

Output:

- count
- lead cards with title, status, contact, company, timeline, next step, follow-up date, and dashboard URL

### `open_lead`

Reads one lead by ID and returns the dashboard URL plus detail context.

Input:

- `leadId` UUID

Output:

- lead card fields
- contact fields
- problem summary, requested outcome, budget range, scheduled date
- read-only source context when available

### `list_calendar_items`

Lists internal lead-related calendar items for an explicit date-time range.

Input:

- `startsAt` ISO date-time with timezone
- `endsAt` ISO date-time with timezone
- `limit` optional result limit, 1 to 20, default 10

Output:

- count
- calendar item cards with lead URL, contact, company, status, item kind, start time, and note
- `answerPrefix: "Based on this dashboard"`

### `check_availability`

Checks one explicit slot against internal lead-related calendar data only.

Input:

- `startsAt` ISO date-time with timezone
- `durationMinutes` required, 1 to 480
- `timezone` required IANA timezone
- `workingHoursStart` required local `HH:mm`
- `workingHoursEnd` required local `HH:mm`

Output:

- available boolean
- checked start and end time
- conflicts from internal calendar items
- outside working hours flag
- `answerPrefix: "Based on this dashboard"`
- limitation note that external calendars are not checked

The assistant must ask for clarification before calling this tool when date, time, duration, timezone, or working-hours context is missing.

### Mutation Preview Contract

Mutating tools use the same two-step contract:

1. Call the tool with `mode: "preview"` to persist an assistant action preview.
2. Show the preview to the user through `confirm_assistant_mutation`.
3. Call the same tool with `mode: "apply"` and the returned `previewId` only when the user approves.
4. Call `reject_assistant_mutation` with the `previewId` when the user rejects.

Preview output:

- `previewId`
- tool name
- target lead ID
- summary
- field-level changes
- `requiresConfirmation: true`

Apply output:

- `previewId`
- tool name
- target lead ID
- applied flag
- summary

The apply path reuses the stored preview payload, not a new assistant-generated payload.

### `update_lead_fields`

Previews or applies standard lead/contact field updates.

Preview input:

- `mode: "preview"`
- `leadId` UUID
- `fields` object with at least one standard editable field

Apply input:

- `mode: "apply"`
- `previewId` UUID

### `change_lead_status`

Previews or applies a lead lifecycle status change.

Preview input:

- `mode: "preview"`
- `leadId` UUID
- `status` target lead lifecycle status

Apply input:

- `mode: "apply"`
- `previewId` UUID

### `create_followup`

Previews or applies a new follow-up for a lead.

Preview input:

- `mode: "preview"`
- `leadId` UUID
- `note` follow-up note
- `followUpDueAt` ISO date-time with timezone

Apply input:

- `mode: "apply"`
- `previewId` UUID

### `reject_assistant_mutation`

Marks a preview as rejected after the user denies confirmation. It does not change lead data.

Input:

- `previewId` UUID

## Safety

- Read tools scope reads to the seeded `software-services-demo` workspace.
- Mutating tools scope writes to the same seeded workspace.
- Calendar and availability answers must be framed as "Based on this dashboard..." because the app does not sync external calendars.
- Mutating assistant tools must use preview plus confirmation before persistence.
- Assistant action previews, applied actions, rejected previews, and failed apply attempts are logged in `assistant_action_logs`.

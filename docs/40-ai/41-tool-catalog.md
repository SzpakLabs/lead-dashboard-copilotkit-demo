# Assistant Tool Catalog

## Current Slice: Assistant Search and Calendar Awareness

The dashboard assistant exposes read-only tools for the seeded software services demo workspace.

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

## Safety

- These tools are read-only.
- They scope reads to the seeded `software-services-demo` workspace.
- Calendar and availability answers must be framed as "Based on this dashboard..." because the app does not sync external calendars.
- Mutating assistant tools remain deferred and must use preview plus confirmation before persistence.

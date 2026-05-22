# Assistant Tool Catalog

## Current Slice: Assistant Search

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

## Safety

- These tools are read-only.
- They scope reads to the seeded `software-services-demo` workspace.
- Mutating assistant tools remain deferred and must use preview plus confirmation before persistence.

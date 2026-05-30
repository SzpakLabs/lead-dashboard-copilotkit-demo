# Design: Lead Workflow UX Upgrade

## Current State

The Service Ops Console redesign is implemented, but user review found workflow issues:

- The main console is overloaded by a permanent selected-lead panel.
- Lead clicks behave differently in the console and calendar.
- Full lead detail is a long mixed page of text, fields, status controls, source, activity, and custom fields.
- `Fields` is really a settings area, not a primary workspace.
- Sources are hard-coded for software services and do not fit other service verticals.
- The assistant UI is visually weak and only feels available from the console.
- Calendar and settings headers are inconsistent with the console.
- Search and dense mode look like controls but do not behave like useful controls.
- Demo data is too sparse to validate the calendar, reports, or forecast experience.

## Product Direction

Keep the product as a dense lead-ops console for small service businesses, not a generic CRM.

The next slice should make the experience feel operational:

- Console is for scanning and triage.
- Preview dialog is for quick lead inspection and next action.
- Full lead page is for focused work.
- Settings are for workspace configuration.
- Assistant is a global contextual coworker, not a page-specific novelty.
- Calendar is a schedule board with enough density to test real states.

## Information Architecture

Primary routes:

- `/` - Console.
- `/calendar` - Schedule board.
- `/settings` - Workspace settings with internal sections.
- `/settings/fields` - Preserve as a compatible route or redirect into the `Custom fields` settings section.
- `/settings/sources` - Optional deep link into the `Sources` settings section.
- `/leads/[leadId]` - Full lead workspace.
- `/intake` - Existing focused intake route, if already present.

Global header:

- Left: workspace/product identity.
- Center: primary nav (`Console`, `Calendar`, `Settings`).
- Right: search, assistant, dark mode, new intake.

Back behavior:

- Do not use `Back to console` in global settings surfaces.
- Lead detail gets a `Back` button because it can be opened from console, calendar, search, or direct link.
- The fallback for direct lead links is the console.

## Lead Preview

Use one reusable lead preview component for console rows, calendar items, and search results.

Desktop:

- Centered modal or right-side sheet is acceptable, but it must be closeable and not permanently occupy the console.
- It should be wide enough for concise tabs without becoming another full page.

Mobile:

- Full-screen sheet or route-safe dialog.
- Primary actions pinned near the top or bottom.

Recommended preview tabs:

- `Summary` - title, contact/company, source, status, review state, budget, timeline, next step.
- `Follow-ups` - upcoming/overdue/latest follow-ups plus add action.
- `Source` - read-only source artifact summary.
- `Activity` - recent audit events.

Primary actions:

- `Open full page`
- `Edit`
- `Add follow-up`
- `Change status` when space permits

## Lead Detail Tabs

The full lead page should stop acting like one giant form.

Tabs:

- `Overview`: core lead fields and summary.
- `Review`: extraction review, confidence, confirm/reject behavior.
- `Follow-ups`: status and follow-up management.
- `Source`: read-only original/source artifact and source metadata.
- `Activity`: audit trail.
- `Custom fields`: lead-specific values for workspace custom field definitions.
- `Full view`: read-only complete lead snapshot.

Only the active tab should show editable fields. The `Full view` tab should prioritize reading, not form controls.

## Settings

Settings starts with two sections:

- `Custom fields`
- `Sources`

Use tabs or a left settings subnav depending on what best fits the existing component structure. Avoid a new page shell that has a different width from the rest of the app.

## Source Configuration

Sources should be workspace-scoped. Existing leads must not lose source labels when a source is disabled or archived.

Suggested model options:

- Add a `source_definitions` table keyed by workspace, with label, slug, active, archived, preset/custom, and sort order.
- Or, if the current data model makes a schema change too large for this slice, add a minimal workspace settings representation first and keep lead source values as strings while preserving display labels.

Preset examples:

- LinkedIn
- Upwork
- Referral
- Website
- Phone
- WhatsApp
- Instagram
- Facebook
- Google
- Walk-in
- Other

The UI should let a laptop repair, beauty, or software-services workspace choose different active source lists without code changes.

## Search

Global search should be a command-style overlay.

Search sources:

- lead title
- contact name
- company
- source
- status
- next step
- timeline
- custom field values where practical

Result actions:

- open preview
- open full lead page
- optionally jump to calendar date for scheduled items

The console's table filters can remain separate, but global search should not pretend to be a text input if it only navigates or scrolls.

## Dense Mode

Dense mode should change actual layout density:

- table row height
- cell padding
- amount of secondary text shown
- metric/card vertical spacing where appropriate

Persist the setting locally at minimum. Workspace/user persistence can be added if the existing app already has an easy preference storage path.

## Dark Mode

Use class-based dark mode if that matches the existing Tailwind setup.

Requirements:

- Store explicit user preference.
- Use system preference only before an explicit preference exists.
- Audit all custom CSS variables and CopilotKit CSS overrides.
- Do not let status colors rely on color alone.
- Make calendar borders, selected days, overdue events, and modal overlays readable.

## Assistant Architecture

The assistant must stay inside the CopilotKit architecture already used by the app.

Implementation constraints:

- Check official CopilotKit docs before touching assistant components.
- Use the existing `CopilotKitProvider`/runtime path unless docs or installed package behavior require an update.
- Use typed assistant/domain tools.
- Use CopilotKit human-in-the-loop patterns for confirmations.
- Use CopilotKit tool rendering or generative UI primitives for report cards and forecast cards.
- Do not create a custom chat state machine outside CopilotKit.

Relevant official docs:

- CopilotKit v2 API reference: https://docs.copilotkit.ai/reference/v2
- CopilotKit provider: https://docs.copilotkit.ai/reference/components/CopilotKit
- Human-in-the-loop: https://docs.copilotkit.ai/reference/hooks/useHumanInTheLoop
- Generative UI: https://docs.copilotkit.ai/concepts/generative-ui-overview
- Tool rendering/default renderers: https://docs.copilotkit.ai/reference/v2/hooks/useDefaultRenderTool

Page context examples:

- Console: active filters, selected queue, visible lead ids.
- Calendar: current scope, visible date range, selected event date.
- Settings: active settings section and available source/custom field definitions.
- Lead detail: current lead id and active tab.

## Assistant Reports and Forecasts

Reports should be generated from structured domain queries, not from freeform database access.

Suggested tool contracts:

- `getLeadReport({ periodStart, periodEnd, comparisonPeriodStart?, comparisonPeriodEnd? })`
- `getRevenueForecast({ periodStart, periodEnd })`

Report result shape should be structured enough for stable UI:

- totals
- status buckets
- source buckets
- review workload
- overdue and upcoming follow-ups
- scheduled/completed work
- won/lost outcomes
- notable leads

Forecast result shape:

- confirmed value
- weighted pipeline value
- optimistic pipeline value
- lead assumptions
- missing-data notes

Forecast rules:

- Treat missing budgets as unknown, not zero, unless the domain already defines a default.
- Weight by status/review/follow-up timing only through explicit deterministic rules.
- Show assumptions in the UI.
- Label the result as an estimate, not accounting truth.

Visual output:

- compact cards
- simple bars or grouped rows
- clear period label
- no chart-heavy dashboard page for this slice

## Demo Data

Seed around a deterministic anchor date so browser verification is stable.

Recommended:

- Support a `DEMO_SEED_ANCHOR` variable or a constant in the seed script.
- Populate roughly 40-80 leads across the four-month window.
- Create enough follow-ups and activities to make reports useful.
- Include days with 2-5 events to stress calendar stacking.
- Keep all person names test-safe, for example `Maria Test`, `Alex Test`, `Nora Test`, `Carlos Test`.

Data should include:

- multiple source types
- needs review / contacted / scheduled / won / lost states
- overdue follow-ups
- upcoming follow-ups
- completed follow-ups
- scheduled work
- completed work
- varied budgets
- custom field values
- source artifacts
- audit/activity events

## Verification Strategy

Run:

- `npm run check`
- Browser verification on desktop and mobile.

Manual workflow checks:

- Console lead opens preview and closes cleanly.
- Calendar event opens the same preview.
- Preview opens full lead page.
- Lead page tabs preserve edit/review/follow-up/source/activity/custom field behavior.
- Settings source changes affect filters and selects.
- Search finds seeded leads and opens preview.
- Dense mode persists and visibly changes table density.
- Dark mode persists and all major surfaces are readable.
- Assistant is available on all primary pages.
- Assistant report prompt renders a visual report when provider credentials are configured.
- Assistant forecast prompt renders a visual forecast when provider credentials are configured.

Use only test-safe names during browser testing.

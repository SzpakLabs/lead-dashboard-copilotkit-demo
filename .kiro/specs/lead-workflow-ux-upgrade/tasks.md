# Tasks: Lead Workflow UX Upgrade

Status: active. `dashboard-redesign` is complete and this spec is the next implementation slice.

## Planning

- [x] Create this spec from user review feedback.
- [x] Mark this spec active in `.kiro/specs/README.md`.
- [x] Move `dashboard-redesign` to completed specs.
- [x] Record that assistant work must follow official CopilotKit docs and existing CopilotKit architecture.

## Discovery

- [ ] Inspect current routes, shared shell, lead ledger, calendar, lead detail, settings, assistant, seed scripts, and schema.
- [ ] Confirm whether source configuration needs a DB schema change or can start as workspace settings.
- [ ] Check installed CopilotKit package behavior against official docs before assistant UI/report work.
- [ ] Identify the current seed anchor strategy and reset/seed command path.

## App Shell and Navigation

- [ ] Consolidate header width, spacing, primary nav, and page actions across Console, Calendar, Settings, and lead detail.
- [ ] Replace `Fields` nav label with `Settings`.
- [ ] Remove redundant Calendar `Dashboard` action.
- [ ] Replace settings `Back to console` behavior with normal primary nav.
- [ ] Add lead detail `Back` behavior with history-first and console fallback.
- [ ] Add global dark mode toggle placement.
- [ ] Ensure `New intake` remains available from Console and Calendar.

## Console and Lead Preview

- [ ] Remove the permanent selected-lead inspector from the main console.
- [ ] Add reusable lead preview modal/sheet.
- [ ] Open preview from console lead rows.
- [ ] Open preview from calendar lead/follow-up events.
- [ ] Open preview from search results.
- [ ] Add preview actions for close, open full page, edit, add follow-up, and status where appropriate.
- [ ] Verify desktop and mobile preview layouts.

## Lead Detail Tabs

- [ ] Reorganize `/leads/[leadId]` into tabs: Overview, Review, Follow-ups, Source, Activity, Custom fields, Full view.
- [ ] Keep editing scoped to the relevant tab.
- [ ] Add read-only `Full view` that hides empty fields where practical.
- [ ] Preserve existing lead edit behavior.
- [ ] Preserve existing review confirmation behavior.
- [ ] Preserve existing status and follow-up behavior.
- [ ] Preserve existing custom field value behavior.
- [ ] Preserve existing source and activity visibility.

## Settings and Sources

- [ ] Create or adjust Settings IA with `Custom fields` and `Sources` sections.
- [ ] Preserve existing custom field definition behavior.
- [ ] Add source presets with enable/disable behavior.
- [ ] Add custom source create/rename/archive/order behavior.
- [ ] Update lead source selects to use active workspace sources.
- [ ] Update source filters to use active workspace sources.
- [ ] Ensure existing leads with inactive/archived sources still display correctly.
- [ ] Update seed data to use configured sources.

## Search and Dense Mode

- [ ] Replace search scroll behavior with a global search or command overlay.
- [ ] Search lead title, contact, company, source, status, next step, and practical custom field values.
- [ ] Add keyboard close/selection behavior.
- [ ] Open lead preview from search result selection.
- [ ] Make dense mode change row height, padding, and secondary text density.
- [ ] Persist dense mode preference.

## Dark Mode

- [ ] Add theme state and persistence.
- [ ] Respect system theme before explicit preference exists.
- [ ] Add dark theme tokens for app shell, tables, filters, dialogs, forms, calendar, settings, and lead detail.
- [ ] Adjust status, urgency, and focus styles for dark mode.
- [ ] Align CopilotKit surfaces with the active theme.
- [ ] Verify no unreadable text or low-contrast controls in both themes.

## Assistant

- [ ] Check official CopilotKit docs for the installed API surface before implementation.
- [ ] Make assistant entry available on all primary pages.
- [ ] Provide route/page context to the assistant.
- [ ] Keep assistant tools typed and routed through domain functions.
- [ ] Keep mutation previews and confirmations through CopilotKit-supported human-in-the-loop patterns.
- [ ] Improve assistant UI using CopilotKit-supported customization rather than a custom chat system.
- [ ] Add report tool/query for requested periods.
- [ ] Add forecast tool/query for near-period earning estimates.
- [ ] Render reports and forecasts as CopilotKit-compatible visual outputs.
- [ ] Verify missing credentials produce clean disabled behavior.

## Demo Data

- [ ] Expand reset/seed data across two months before and two months after the seed anchor.
- [ ] Keep all seeded person names test-safe with `Test`.
- [ ] Add varied sources, statuses, budgets, review states, custom fields, source artifacts, and activity.
- [ ] Add enough follow-ups and scheduled/completed work for report and forecast output.
- [ ] Add days with multiple events to stress calendar display.
- [ ] Ensure seed workflow remains idempotent for the demo workspace.

## Verification

- [ ] Run `npm run check`.
- [ ] Verify console lead preview flow.
- [ ] Verify calendar event preview flow.
- [ ] Verify full lead page tab workflows.
- [ ] Verify settings custom fields and sources.
- [ ] Verify global search.
- [ ] Verify dense mode.
- [ ] Verify dark mode persistence and readability.
- [ ] Verify assistant availability on Console, Calendar, Settings, and lead detail.
- [ ] Verify assistant report and forecast output with configured credentials, or document clean disabled behavior.
- [ ] Verify desktop and mobile layouts for clipping, overlap, calendar stacking, and dialog/sheet usability.

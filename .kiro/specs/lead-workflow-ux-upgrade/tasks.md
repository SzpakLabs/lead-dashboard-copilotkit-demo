# Tasks: Lead Workflow UX Upgrade

Status: active. `dashboard-redesign` is complete and this spec is the next implementation slice.

## Planning

- [x] Create this spec from user review feedback.
- [x] Mark this spec active in `.kiro/specs/README.md`.
- [x] Move `dashboard-redesign` to completed specs.
- [x] Record that assistant work must follow official CopilotKit docs and existing CopilotKit architecture.

## Discovery

- [x] Inspect current routes, shared shell, lead ledger, calendar, lead detail, settings, assistant, seed scripts, and schema.
- [x] Confirm whether source configuration needs a DB schema change or can start as workspace settings.
- [x] Check installed CopilotKit package behavior against official docs before assistant UI/report work.
- [x] Identify the current seed anchor strategy and reset/seed command path.

Discovery notes:

- Routes exist for `/`, `/calendar`, `/intake`, `/settings/fields`, `/leads/[leadId]`, API lead/follow-up/custom-field routes, `/api/ingest`, and `/api/copilotkit`.
- The current shell is `AppShell`; primary nav still uses `Fields`, calendar/settings/intake/lead pages still use page-local back actions, and assistant UI is only mounted on console.
- The console still uses URL-selected leads and a permanent `LeadInspectorPanel`; calendar items navigate directly to lead detail.
- Lead detail is still a multi-section page, not tabbed.
- Source values are hard-coded through the Postgres `lead_source` enum, UI option arrays, Zod schemas, ingestion, assistant tools, and seed data. Real configurable/custom sources need a schema change, preferably source definitions plus loosening source fields away from the enum.
- CopilotKit packages are installed at `1.57.4`. Installed v2 exports support the current `CopilotKitProvider`, `CopilotPopup`, `useRenderTool`, `useHumanInTheLoop`, `BuiltInAgent`, `defineTool`, and single-route runtime handler usage. Official docs confirm v2 provider/runtime, server tools, tool rendering, human-in-the-loop, agent context, and generative UI patterns; no custom chat framework is needed.
- Seed data currently has no `DEMO_SEED_ANCHOR`; it uses fixed May 2026 dates and two test-safe leads. Reset paths are `npm run db:seed` and `npm run db:reset-demo`, both running `tsx src/lib/db/seed.ts --reset`.

## App Shell and Navigation

- [x] Consolidate header width, spacing, primary nav, and page actions across Console, Calendar, Settings, and lead detail.
- [x] Replace `Fields` nav label with `Settings`.
- [x] Remove redundant Calendar `Dashboard` action.
- [x] Replace settings `Back to console` behavior with normal primary nav.
- [x] Add lead detail `Back` behavior with history-first and console fallback.
- [x] Add global dark mode toggle placement.
- [x] Ensure `New intake` remains available from Console and Calendar.

## Console and Lead Preview

- [x] Remove the permanent selected-lead inspector from the main console.
- [x] Add reusable lead preview modal/sheet.
- [x] Open preview from console lead rows.
- [x] Open preview from calendar lead/follow-up events.
- [x] Open preview from search results.
- [x] Add preview actions for close, open full page, edit, add follow-up, and status where appropriate.
- [x] Verify desktop and mobile preview layouts.

## Lead Detail Tabs

- [x] Reorganize `/leads/[leadId]` into tabs: Overview, Review, Follow-ups, Source, Activity, Custom fields, Full view.
- [x] Keep editing scoped to the relevant tab.
- [x] Add read-only `Full view` that hides empty fields where practical.
- [x] Preserve existing lead edit behavior.
- [x] Preserve existing review confirmation behavior.
- [x] Preserve existing status and follow-up behavior.
- [x] Preserve existing custom field value behavior.
- [x] Preserve existing source and activity visibility.

## Settings and Sources

- [x] Create or adjust Settings IA with `Custom fields` and `Sources` sections.
- [x] Preserve existing custom field definition behavior.
- [x] Add source presets with enable/disable behavior.
- [x] Add custom source create/rename/archive/order behavior.
- [x] Update lead source selects to use active workspace sources.
- [x] Update source filters to use active workspace sources.
- [x] Ensure existing leads with inactive/archived sources still display correctly.
- [x] Update seed data to use configured sources.

## Search and Dense Mode

- [x] Replace search scroll behavior with a global search or command overlay.
- [x] Search lead title, contact, company, source, status, next step, and practical custom field values.
- [x] Add keyboard close/selection behavior.
- [x] Open lead preview from search result selection.
- [x] Make dense mode change row height, padding, and secondary text density.
- [x] Persist dense mode preference.

## Dark Mode

- [x] Add theme state and persistence.
- [x] Respect system theme before explicit preference exists.
- [x] Add dark theme tokens for app shell, tables, filters, dialogs, forms, calendar, settings, and lead detail.
- [x] Adjust status, urgency, and focus styles for dark mode.
- [x] Align CopilotKit surfaces with the active theme.
- [x] Verify no unreadable text or low-contrast controls in both themes.

## Assistant

- [x] Check official CopilotKit docs for the installed API surface before implementation.
- [x] Make assistant entry available on all primary pages.
- [x] Provide route/page context to the assistant.
- [x] Keep assistant tools typed and routed through domain functions.
- [x] Keep mutation previews and confirmations through CopilotKit-supported human-in-the-loop patterns.
- [x] Improve assistant UI using CopilotKit-supported customization rather than a custom chat system.
- [x] Add report tool/query for requested periods.
- [x] Add forecast tool/query for near-period earning estimates.
- [x] Render reports and forecasts as CopilotKit-compatible visual outputs.
- [x] Verify missing credentials produce clean disabled behavior.

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

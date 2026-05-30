# Requirements: Lead Workflow UX Upgrade

## Goal

Turn the completed Service Ops Console redesign into a cleaner operational workflow:

- Remove the always-open lead inspector from the main console.
- Open leads from the console and calendar in a closeable preview dialog.
- Make the full lead page tabbed instead of one long edit surface.
- Promote `Fields` into broader workspace `Settings`.
- Add configurable sources.
- Make search, dense mode, assistant access, and dark mode real product controls.
- Add assistant-generated visual reports and near-period earning forecasts.
- Expand demo data across two months back and two months forward so calendar and reporting views feel populated.

This spec is active as of 2026-05-31. `dashboard-redesign` is completed and should be treated as the baseline.

## Scope

In scope:

- App shell, header, navigation, and page-level action cleanup.
- Console lead preview modal or sheet.
- Calendar event click behavior using the same lead preview surface.
- Full lead page tab structure and read-only full view.
- Settings IA with `Custom fields` and `Sources` sections.
- Workspace-scoped source configuration with popular presets and custom sources.
- Working global search.
- Working dense mode.
- Dark mode toggle.
- Global CopilotKit assistant availability and context.
- Assistant visual reports and earning forecast tools.
- Denser seeded demo data over a four-month window.

Out of scope:

- Replacing CopilotKit.
- Building a custom assistant framework parallel to CopilotKit.
- External calendar sync.
- Real payment/revenue accounting.
- Full analytics warehouse.
- Telegram, telephony, or website-widget ingestion.
- Production auth or billing.

## Requirements

### 1. Unified App Shell

THE SYSTEM SHALL use one consistent header and navigation model across Console, Calendar, Settings, and lead detail pages.

Acceptance criteria:

- Header width, spacing, and nav placement are consistent across primary pages.
- Primary nav contains `Console`, `Calendar`, and `Settings`.
- The old `Fields` nav label is replaced by `Settings`.
- Header actions include available controls for assistant, dark mode, and new intake where relevant.
- Calendar no longer shows a redundant `Dashboard` button.
- Settings does not use `Back to console` as primary navigation.
- Lead detail has a `Back` control that returns to browser history when possible and falls back to the console.

### 2. Console Declutter and Lead Preview

THE SYSTEM SHALL remove the permanent right-side lead inspector from the main console.

Acceptance criteria:

- The console first viewport focuses on queues, filters, metrics, and the lead ledger.
- Clicking a lead in the console opens a closeable lead preview dialog or sheet.
- Clicking a lead-related calendar item opens the same lead preview dialog or sheet instead of immediately navigating away.
- The lead preview includes summary, current status, source, next step, due follow-up, and concise tabs for additional context.
- The preview has an `Open full page` action for users who want the dedicated lead workspace.
- Mobile uses a full-screen sheet or route-safe modal with no clipped controls.

### 3. Tabbed Lead Detail

THE SYSTEM SHALL reorganize the full lead page into focused tabs.

Acceptance criteria:

- Full lead page includes tabs for `Overview`, `Review`, `Follow-ups`, `Source`, `Activity`, `Custom fields`, and `Full view`.
- Each tab shows only the fields and actions relevant to that section.
- `Full view` is read-only, hides empty fields where practical, and stacks all populated lead data for quick inspection.
- Editing remains explicit and scoped to the relevant tab.
- Existing review, edit, status, follow-up, source, custom field, and audit behavior is preserved.

### 4. Settings and Sources

THE SYSTEM SHALL make workspace settings the home for configurable lead metadata.

Acceptance criteria:

- `Settings` has at least two sections: `Custom fields` and `Sources`.
- Custom field definition behavior remains available under Settings.
- Sources are workspace-scoped and configurable.
- Popular source presets can be enabled or disabled.
- Users can add, rename, archive, and order custom sources.
- Lead source selects and filters use active workspace sources.
- Existing leads with inactive or archived sources still display their source without data loss.
- Seed data uses the configured sources instead of hard-coded UI options.

### 5. Search and Dense Mode

THE SYSTEM SHALL make existing visible controls functional.

Acceptance criteria:

- Global search opens a usable search or command overlay rather than only scrolling the page.
- Search matches lead title, contact name, company, source, status, next step, and relevant custom field values where available.
- Search results can open the lead preview.
- Console filters and global search do not fight each other; behavior is predictable.
- Dense mode changes ledger density, secondary text visibility, and row spacing.
- Dense mode preference persists per browser or workspace.

### 6. Dark Mode

THE SYSTEM SHALL add a dark mode toggle as a first-class app control.

Acceptance criteria:

- The toggle is available from the global header.
- Theme preference persists across reloads.
- The app respects system preference on first visit unless a user preference exists.
- Console, calendar, settings, lead preview, lead detail, forms, dialogs, and assistant surfaces are readable in both themes.
- Focus states and status/urgency colors remain accessible in both themes.
- CopilotKit UI uses theme-compatible styling instead of visually clashing with the app.

### 7. Global CopilotKit Assistant

THE SYSTEM SHALL make the assistant available throughout the app and keep all assistant work aligned with official CopilotKit documentation.

Acceptance criteria:

- Assistant entry point is available from Console, Calendar, Settings, and lead detail pages.
- Assistant receives page-aware context, such as selected lead, active date range, active settings section, filters, and current route.
- Assistant tools remain typed and scoped to domain functions.
- Mutations still require preview and explicit confirmation.
- Assistant implementation uses CopilotKit v2 primitives and official docs, including provider, tool rendering, generative UI, and human-in-the-loop patterns where appropriate.
- No custom parallel chat framework is introduced.
- Assistant disabled or missing-credential states remain clean and non-broken.

Relevant official docs to check during implementation:

- CopilotKit v2 API reference: https://docs.copilotkit.ai/reference/v2
- CopilotKit provider: https://docs.copilotkit.ai/reference/components/CopilotKit
- Human-in-the-loop: https://docs.copilotkit.ai/reference/hooks/useHumanInTheLoop
- Generative UI overview: https://docs.copilotkit.ai/concepts/generative-ui-overview
- Tool rendering: https://docs.copilotkit.ai/reference/v2/hooks/useDefaultRenderTool

### 8. Assistant Reports and Forecasts

THE SYSTEM SHALL let the assistant generate quick, visual, easy-to-read reports for a requested period.

Acceptance criteria:

- User can ask for a report over a period such as this week, this month, last month, custom dates, or the next period.
- Assistant can render structured visual reports in chat using CopilotKit-compatible UI rendering.
- Reports include lead volume, status mix, source mix, scheduled work, overdue follow-ups, completed work, won/lost outcomes, and notable bottlenecks where data exists.
- Assistant can generate a near-period earning forecast based on lead budgets, statuses, scheduled work, confidence/review state, and follow-up timing.
- Forecast output clearly shows assumptions and distinguishes confirmed revenue from estimated pipeline value.
- Reports are read-only unless the user explicitly asks for a follow-up mutation, which must still use preview/confirmation.

### 9. Dense Demo Data

THE SYSTEM SHALL make demo data dense enough to test real calendar and reporting states.

Acceptance criteria:

- Seed/reset workflow creates leads and lead-related events across two months before and two months after the seed anchor date.
- Seed names remain test-safe and include `Test` in person names.
- Seed data includes varied statuses, sources, budgets, review states, custom fields, follow-ups, scheduled work, completed work, overdue work, and activity.
- Some calendar days contain multiple events to test stacked calendar presentation.
- Seed workflow is idempotent for the demo workspace.
- Reports and forecasts have enough data to produce meaningful visual output.

### 10. Verification

THE SYSTEM SHALL verify workflow behavior and responsive layout after implementation.

Acceptance criteria:

- `npm run check` passes when available.
- Console lead click opens preview; preview closes; preview opens full page.
- Calendar event click opens the same preview.
- Lead tabs preserve existing edit/review/follow-up/custom field behavior.
- Settings sources affect source selects and filters.
- Global search opens and finds seeded records.
- Dense mode visibly changes the ledger.
- Dark mode works after reload and does not cause unreadable surfaces.
- Assistant works or is cleanly disabled; if configured, report and forecast prompts render visual outputs.
- Browser verification covers desktop and mobile for dialog/sheet clipping, calendar stacking, and assistant layout.


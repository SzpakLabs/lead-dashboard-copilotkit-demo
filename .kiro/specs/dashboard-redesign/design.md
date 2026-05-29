# Design: Dashboard Redesign

## Workflow Decision

Use a manual redesign workflow for the current implementation session.

`design-variants` is intentionally not part of this spec's active workflow. It is not ready enough to generate, compare, or apply this redesign reliably. The successful manual result from this session should later inform improvements to that tool.

The implementation direction is fixed: use `Service Ops Console`. Do not generate alternate variants for this spec. The user will review the running app directly in the browser; if the direction misses, the next step is discussion plus targeted rollback or iteration.

## Existing Inputs

The repo contains previous redesign artifacts under `.design-variants`, including:

- config and prompts
- Lazyweb research
- variant plans
- desktop and mobile screenshots
- archived research

These are reference material only. Do not run the workflow as part of this spec. Do not delete or rewrite these artifacts unless the user explicitly asks.

Older plans and artifacts have lower priority than:

- The `Service Ops Console` direction in this design.
- Modern Web Guidance notes in this design.
- Current product steering and safety rules.
- Preserving the working behavior of the implemented MVP.

## Target Experience

The redesigned app should feel like a lead operations console, not a demo landing page.

Primary surfaces:

- Dashboard overview with operational metrics, review queue health, overdue follow-ups, scheduled work, and recent activity
- Leads workspace with dense list/table, filters, status visibility, and selected lead context
- Lead detail/review workflow with source transcript context, extracted fields, custom fields, follow-ups, and activity
- Calendar view for scheduled lead and follow-up work
- Assistant panel that can search, explain availability, and preview mutations
- Settings or configuration surfaces only where needed for custom fields

## Information Architecture

Preferred page split:

- `/` or `/leads`: primary lead operations workspace.
- `/intake`: focused ingestion surface, also available as a drawer/sheet from the lead workspace.
- `/leads/[leadId]`: full lead review and edit workspace, or a dedicated fallback for mobile/deep links if desktop uses an inspector.
- `/calendar`: schedule board for lead-related scheduled work and follow-ups.
- `/settings/fields`: workspace custom field definitions.

Primary lead workspace layout:

- Header/command bar with workspace identity, search, new intake, calendar, and assistant access when configured.
- Left rail or filter sheet with queues, statuses, sources, and custom-field filters.
- Dense lead ledger with status, review state, source, timeline, next step, follow-up urgency, and selected row.
- Lead inspector with pinned summary and tabs for review, action, source, and activity.

Mobile layout:

- Queue-first default view.
- Filters as a sheet.
- Lead detail as a full-screen sheet or route.
- Intake as a full-screen compose surface.
- Calendar defaults to agenda-first views.

## Design Principles

- Preserve behavior first, redesign layout second.
- Keep lead data scannable.
- Make review uncertainty and follow-up urgency obvious.
- Keep add/edit/review flows focused in dialogs, drawers, or dedicated panels.
- Keep assistant actions visibly previewable and auditable.
- Avoid nested cards and decorative dashboard chrome.
- Use compact typography and stable responsive constraints.
- Use icons for common actions where the existing stack supports them.
- Use semantic landmarks, proper heading hierarchy, visible focus states, and accessible form labels.
- Use real tables for the lead ledger when presenting tabular data.
- Avoid squeezing the desktop ledger onto mobile.

## Visual Direction

Direction: Service Ops Console.

The UI should feel like a compact operations desk for a small service-business owner, not a broad analytics product.

Visual rules:

- Dense but readable rows and controls.
- 8px or smaller radii unless an existing primitive requires otherwise.
- Thin separators, stable table row heights, and clear selected states.
- Status and urgency use text/icon/shape in addition to color.
- Restrained palette with enough contrast for long work sessions.
- No oversized hero sections, floating marketing cards, decorative gradients, or chart-first layout.
- Lucide icons for repeated actions and navigation.
- Text must wrap, truncate, or clamp intentionally without overlapping adjacent UI.

## Modern Web Guidance Notes

Apply these during implementation:

- Use `header`, `nav`, `main`, and `aside` landmarks.
- Keep heading levels sequential.
- Use `<caption>`, `<th scope="col">`, and semantic rows for data tables.
- Use persistent labels for all form fields.
- Use `aria-describedby` for field hints and error text where needed.
- Add explicit `:focus-visible` states with sufficient contrast.
- Use native buttons, links, inputs, selects, and textareas before ARIA.
- Use `content-visibility: auto` only for below-fold heavy sections, paired with `contain-intrinsic-size`.
- Use `contain: layout style paint` for isolated drawers, sheets, and complex widgets where it helps avoid layout recalculation.
- Keep hover, pending, and selected states from changing row/control dimensions.

## Technical Boundaries

Allowed:

- Add or reorganize App Router routes.
- Split large dashboard sections into components.
- Add focused dialogs, drawers, tabs, filters, and navigation.
- Refine Tailwind styles and UI primitives.
- Add small presentation helpers when they reduce duplication.

Avoid unless required:

- DB schema changes
- Domain logic rewrites
- API contract changes
- New external services
- New heavy UI libraries

## Manual Implementation Direction

Use this one coherent direction:

- Lead operations workbench as the first viewport.
- Queue pressure and follow-up urgency above broad metrics.
- Dense ledger in the center of the workflow.
- Selected lead inspector for immediate review/action.
- Intake moved out of the always-visible page stack into a drawer/sheet plus optional route.
- Custom field definitions moved out of per-lead detail into settings.
- Calendar redesigned as a compact schedule board.

This direction can reuse strong ideas from previous research, especially operations-first table dashboards, detail drawers, activity/audit feeds, and review-centric workflows. It should not preserve older ideas when they conflict with Modern Web Guidance, the queue/ledger/inspector IA, mobile usability, or the user's browser-first review process.

## Verification Strategy

For the adopted redesign:

- Run `npm run check`.
- Manually verify ingestion, lead editing, status changes, follow-up create/complete, custom fields, calendar links, and assistant preview behavior.
- Use test-safe names only, such as `Juan Test` or `Maria Test`.
- Verify `/` or `/leads` renders seeded lead data and preserves filters.
- Verify lead selection preserves `leadId` and filter query params.
- Verify `/calendar?scope=month`, `/calendar?scope=week`, and `/calendar?scope=day`.
- Verify mobile layout has no clipped button text, overlapping controls, unreadable rows, or inaccessible sheets.
- Start the local app for direct browser review after implementation.
- Do not use screenshot generation as a required approval gate.

# Design: Dashboard Redesign

## Workflow Decision

Use `/Users/macos/Documents/prjk/design-variants/README.md` as the source workflow for redesign variant generation.

The current package-shaped workflow is:

- `design-variants init`
- `design-variants research`
- `design-variants generate`
- `design-variants screenshots`
- `design-variants stats`
- `design-variants restore`

For this repo, the implementation should prefer local package usage from `/Users/macos/Documents/prjk/design-variants` during development and add scripts that make the workflow repeatable from the lead-dashboard repo.

## Existing Inputs

The repo already contains legacy design-variant artifacts under `.design-variants/legacy`, including:

- legacy config
- legacy agent prompt
- Lazyweb research
- archived variant diffs
- desktop and mobile screenshots

These should be treated as prior design research, not as active source code. The first redesign session should inspect them, migrate useful direction into the current `.design-variants/config.json`, and keep old artifacts available for comparison.

## Target Experience

The redesigned app should feel like a lead operations console, not a demo landing page.

Primary surfaces:

- Dashboard overview with operational metrics, review queue health, overdue follow-ups, scheduled work, and recent activity
- Leads workspace with dense list/table, filters, status visibility, and selected lead context
- Lead detail/review workflow with source transcript context, extracted fields, custom fields, follow-ups, and activity
- Calendar view for scheduled lead and follow-up work
- Assistant panel that can search, explain availability, and preview mutations
- Settings or configuration surfaces only where needed for custom fields

## Design Principles

- Preserve behavior first, redesign layout second.
- Keep lead data scannable.
- Make review uncertainty and follow-up urgency obvious.
- Keep add/edit/review flows focused in dialogs, drawers, or dedicated panels.
- Keep assistant actions visibly previewable and auditable.
- Avoid nested cards and decorative dashboard chrome.
- Use compact typography and stable responsive constraints.
- Use icons for common actions where the existing stack supports them.

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

## Suggested Variant Directions

Initial variant directions can reuse the legacy research themes:

- Command Center: summary-first operations dashboard with queue pressure and next actions
- Review Desk: review/intake workload as the primary workflow
- Pipeline Radar: status movement, stuck leads, overdue follow-ups, and activity signals

The generated variants should be visibly different enough that screenshot review can make a meaningful choice.

## Verification Strategy

For generated variants:

- Run the variant build or the configured verification command.
- Capture desktop and mobile screenshots.
- Use `design-variants stats` to summarize file and variant changes.
- Review changed files for behavioral risk before choosing a winner.

For the adopted redesign:

- Run `npm run check`.
- Manually verify ingestion, lead editing, status changes, follow-up create/complete, custom fields, calendar links, and assistant preview behavior.
- Use test-safe names only, such as `Juan Test` or `Maria Test`.

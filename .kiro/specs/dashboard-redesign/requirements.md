# Requirements: Dashboard Redesign

## Overview

Redesign the lead dashboard into a more polished, dense, professional lead-ops product experience.

This spec now uses a manual redesign workflow. The old `design-variants` workflow is intentionally out of scope because the tool is not ready enough to drive this implementation session. Existing redesign artifacts may be used as reference material, but the accepted direction should be implemented directly in the main app after the spec is explicitly promoted.

The chosen direction is the manual `Service Ops Console` plan. Do not generate competing variants for this spec. Older redesign notes have lower priority than this plan and Modern Web Guidance.

This spec is not active until explicitly promoted in `.kiro/specs/README.md`.

## Requirement 1: Manual Redesign Workflow

WHEN the redesign work begins
THE SYSTEM SHALL use the existing `dashboard-redesign` requirements as product constraints, not as an automated variant-generation process.

WHEN old design-variant artifacts exist
THE SYSTEM SHALL treat `.design-variants` artifacts, screenshots, research, prompts, and diffs as optional reference material only.

WHEN the redesign is planned
THE SYSTEM SHALL use the `Service Ops Console` direction as the single implementation direction.

WHEN the redesign is implemented
THE SYSTEM SHALL implement the chosen direction directly in the app while keeping changes scoped to dashboard IA, layout, components, and styling.

WHEN the user reviews the redesign
THE SYSTEM SHALL support direct browser review and iterative follow-up fixes instead of a variant comparison or screenshot approval workflow.

## Requirement 2: Redesign Scope

WHEN the dashboard is redesigned
THE SYSTEM SHALL improve information architecture, navigation, page layout, and workflow ergonomics, not only colors and typography.

WHEN the user opens the app
THE SYSTEM SHALL present an operational lead-ops workspace focused on scanning leads, review workload, follow-ups, activity, calendar context, and assistant access.

WHEN specialized workflows are needed
THE SYSTEM SHALL use focused pages, dialogs, drawers, or panels for lead review, lead editing, follow-up management, calendar inspection, custom fields, and assistant actions.

WHEN the redesign is implemented
THE SYSTEM SHALL preserve existing lead ingestion, review, editing, status, follow-up, custom field, calendar, assistant, and audit behavior.

## Requirement 3: Product Fit

WHEN visual direction is chosen
THE SYSTEM SHALL keep the app professional, dense, and operational for small service-business lead management.

WHEN designing dashboard surfaces
THE SYSTEM SHALL avoid marketing-page structure, oversized hero sections, decorative-only visuals, low-density cards, generic AI aesthetics, and chart-first analytics.

WHEN displaying lead data
THE SYSTEM SHALL keep status, review state, next follow-up, source context, scheduled/completed dates, and recent activity easy to scan.

WHEN displaying AI-assisted features
THE SYSTEM SHALL keep the dashboard as the system of record and keep assistant actions previewable, confirmable, and auditable.

## Requirement 4: Responsive and Accessibility Baseline

WHEN the dashboard is viewed on desktop
THE SYSTEM SHALL optimize for repeated operational use with compact layout, stable navigation, and efficient scan paths.

WHEN the dashboard is viewed on mobile
THE SYSTEM SHALL keep primary workflows usable without overlapping text, clipped controls, or inaccessible dialogs.

WHEN controls are added
THE SYSTEM SHALL use appropriate UI controls such as icon buttons, tabs, filters, segmented controls, dialogs, drawers, and forms.

## Requirement 5: Verification

WHEN the redesign is applied to the main app
THE SYSTEM SHALL run the project verification gate using `npm run check` when available.

WHEN browser verification is practical
THE SYSTEM SHALL manually verify desktop and mobile layouts for clipping, overlap, broken dialogs/drawers, and unreadable lead rows.

WHEN final visual review is needed
THE SYSTEM SHALL prioritize running the app for direct browser inspection over generating screenshot sets.

WHEN forms, chat, assistant, or browser tests use person names
THE SYSTEM SHALL include `Test` in every person name.

## Non-Goals

- Changing the lead domain model
- Replacing the database provider
- Rewriting working API routes without product reason
- Adding production auth
- Starting Telegram, telephony, or website-widget ingestion
- Publishing article/content milestones

## Open Questions

- Should this spec be promoted immediately after `demo-readiness-fixes` is closed, or should the remaining public deployment smoke happen first?
- Should `/` remain the lead workspace route, or should the redesign introduce `/leads` and redirect `/`?
- Should lead detail become a dedicated route, a desktop inspector, or both?

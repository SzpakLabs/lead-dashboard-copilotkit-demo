# Requirements: Dashboard Redesign

## Overview

Redesign the lead dashboard into a more polished, dense, professional lead-ops product experience. Use the `design-variants` workflow documented in `/Users/macos/Documents/prjk/design-variants/README.md` to generate parallel redesign variants, capture screenshots, compare results, and apply one selected direction back to the main app.

This spec is not active until explicitly promoted in `.kiro/specs/README.md`.

## Requirement 1: Design Variants Workflow

WHEN the redesign work begins
THE SYSTEM SHALL use the current package-shaped `design-variants` CLI workflow from `/Users/macos/Documents/prjk/design-variants/README.md`.

WHEN the repo is prepared for variant generation
THE SYSTEM SHALL initialize or migrate `.design-variants/config.json`, prompt templates, and package scripts so future runs use the current CLI instead of only legacy scripts.

WHEN old variant artifacts exist
THE SYSTEM SHALL preserve or archive `.design-variants/legacy` artifacts and avoid deleting useful prior screenshots, research, prompts, or diffs unless explicitly requested.

WHEN variants are generated
THE SYSTEM SHALL create multiple distinct dashboard redesign worktrees or variant branches rather than editing the main branch directly first.

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

WHEN a variant is generated
THE SYSTEM SHALL capture desktop and mobile screenshots using the `design-variants screenshots` workflow where possible.

WHEN a variant is considered for adoption
THE SYSTEM SHALL compare screenshots, changed files, and implementation risk before choosing one direction.

WHEN the selected redesign is applied to the main app
THE SYSTEM SHALL run the project verification gate using `npm run check` when available.

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

- How many redesign variants should be generated in the first run?
- Should Lazyweb research run before generation, or should existing legacy research be reused first?
- Should the final direction be selected by screenshot review only, or by trying each variant locally?

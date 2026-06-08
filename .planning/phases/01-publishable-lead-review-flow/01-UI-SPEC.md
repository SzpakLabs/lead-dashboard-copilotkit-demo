---
phase: 1
slug: publishable-lead-review-flow
status: approved
shadcn_initialized: false
preset: local-shadcn-style
created: 2026-06-08
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the publishable lead review flow.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | local shadcn-style primitives |
| Preset | local ops console |
| Component library | none beyond local primitives |
| Icon library | lucide-react |
| Font | system font stack inherited from the app |

---

## Spacing Scale

Declared values must stay aligned with existing CSS variables and Tailwind spacing.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, segmented nav padding |
| sm | 8px | Button gaps, compact controls |
| md | 16px | Panel gaps, default page gutter |
| lg | 24px | Section padding, preview content groups |
| xl | 32px | Major workbench gaps on wide screens |
| 2xl | 48px | Reserved for page-level separation only |
| 3xl | 64px | Avoid in Phase 1 console surfaces |

Exceptions: existing CSS variables `--ops-compact-block: 0.75rem`, `--ops-compact-inline: 0.875rem`, and `--ops-control-height: 2.25rem` are approved because they are already used by the console.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px-16px | 400-500 | 1.45 |
| Label | 11px-13px | 650-750 | 1.2 |
| Heading | 18px-22px | 700-750 | 1.15 |
| Display | 22px max | 720 | 1.1 |

Do not introduce hero-scale type in Phase 1. The first viewport is a work console, not a landing page.

---

## Color

Use the existing HSL CSS variables in `app/globals.css`.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `hsl(var(--background))` | Page background |
| Secondary (30%) | `hsl(var(--ops-surface))`, `hsl(var(--ops-surface-strong))` | Panels, command bar, dialogs |
| Accent (10%) | `hsl(var(--ops-accent))` | Focus rings, selected nav, primary actions |
| Destructive | `hsl(var(--ops-danger))` | Destructive or overdue-only states |

Accent reserved for: selected navigation, primary CTA, focus-visible outlines, active filters, and meaningful status accents. Do not recolor all interactive elements with the accent.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `New intake` |
| Empty state heading | `No matching leads` |
| Empty state body | `Adjust filters or add a Test lead through New intake.` |
| Error state | `Demo data is unavailable. Check DATABASE_URL and run npm run db:reset-demo.` |
| Destructive confirmation | `Archive source: existing leads keep their source label.` |

All example person names in UI-visible fixtures, docs, browser checks, or prompts must include `Test`.

---

## Phase 1 Interaction Contract

- The first viewport must show the command bar, operational metrics, queue/filter rail, and populated lead ledger on desktop.
- Console lead rows must open a closeable preview dialog through the existing `leadId` URL state.
- Preview close must remove `leadId` without navigating away from current filters.
- The review/status proof must use existing forms and domain-backed routes; do not add a parallel workflow.
- Mobile must keep the command bar actions reachable and the preview close/open-full-page controls visible without clipping.
- Dark mode must remain readable for shell, metrics, filters, ledger rows, preview dialog, forms, status badges, and focus states.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party | none | do not add third-party blocks in Phase 1 |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-08

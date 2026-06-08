---
phase: 2
slug: supporting-ops-surfaces
status: approved
shadcn_initialized: false
preset: local-shadcn-style-primitives
created: 2026-06-08
---

# Phase 2 - UI Design Contract

> Visual and interaction contract for supporting lead operations surfaces.

---

## Design System

| Property          | Value                                      |
| ----------------- | ------------------------------------------ |
| Tool              | local shadcn-style primitives              |
| Preset            | existing ops console tokens                |
| Component library | local primitives under `src/components/ui` |
| Icon library      | `lucide-react`                             |
| Font              | inherited system font from app shell       |

---

## Phase Surfaces

Phase 2 covers verification and hardening of these existing surfaces:

- Lead preview dialog from console rows, calendar items, and search results.
- Full lead detail tabs: Overview, Review, Follow-ups, Source, Activity, Custom fields, Full view.
- Calendar, settings, search, dense mode, dark mode, and assistant/report/forecast surfaces.

Do not introduce a new page shell, new visual theme, landing page, marketing layout, or nested-card composition.

---

## Layout Contract

| Surface                    | Contract                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| App shell                  | Keep `ops-command-bar` sticky, max width `--ops-shell-max`, and primary nav labels `Console`, `Calendar`, `Settings`.                    |
| Preview dialog             | Keep close control visible, no clipped actions, no permanent console inspector, and full-screen or route-safe behavior on mobile.        |
| Lead detail                | Keep tabs horizontally scannable on desktop and usable on mobile without overlapping text. Active tab content is the only editable area. |
| Calendar                   | Preserve dense schedule-board behavior. Multiple events on one day must remain legible and clickable.                                    |
| Reports and forecast cards | Use compact cards or grouped rows with visible assumptions, period labels, and confirmed vs estimated values.                            |
| Assistant                  | Use CopilotKit popup/tool-render surfaces. Disabled state must not leave broken controls or empty assistant chrome.                      |

---

## Spacing Scale

Declared values must remain multiples of 4 where practical.

| Token | Value | Usage                                      |
| ----- | ----- | ------------------------------------------ |
| xs    | 4px   | Icon gaps, status badge interiors          |
| sm    | 8px   | Compact button gaps, tab padding           |
| md    | 16px  | Default panel spacing, dialog content gaps |
| lg    | 24px  | Section padding and route-level grouping   |
| xl    | 32px  | Major viewport bands                       |
| 2xl   | 48px  | Rare route-level separation only           |

Exceptions: existing CSS custom properties `--ops-control-radius: 7px`, `--ops-control-height: 2.25rem`, and `--ops-compact-inline: 0.875rem` remain valid because they are established app tokens.

---

## Typography

| Role            | Size                                | Weight  | Line Height |
| --------------- | ----------------------------------- | ------- | ----------- |
| Body            | 14px-16px                           | 400-500 | 1.45        |
| Label           | 11px-13px                           | 700     | 1.2         |
| Compact control | 13px                                | 700     | 1.2         |
| Panel heading   | 18px-22px                           | 700-800 | 1.15        |
| Page title      | existing `ops-command-bar h1` scale | 720     | 1.1         |

Text must not scale with viewport width. Letter spacing remains `0`, including uppercase labels.

---

## Color

Use existing CSS variables from `app/globals.css`.

| Role            | Value                                                  | Usage                                                               |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Dominant (60%)  | `hsl(var(--background))` / `hsl(var(--ops-surface))`   | Page background and route surfaces                                  |
| Secondary (30%) | `hsl(var(--ops-surface-strong))` / `hsl(var(--muted))` | Header, panels, dialogs, controls                                   |
| Accent (10%)    | `hsl(var(--primary))` / `hsl(var(--ops-accent))`       | Focus rings, active nav, primary actions, assistant available state |
| Destructive     | `hsl(var(--ops-danger))`                               | Destructive or rejection states only                                |
| Status colors   | `--ops-status-*` tokens                                | Status badges and event state labels                                |

Accent reserved for: active navigation, focus-visible rings, primary actions, selected controls, and assistant enabled state.

Dark mode must use the existing `[data-theme="dark"]` tokens. Do not add a one-off dark palette inside individual components.

---

## Copywriting Contract

| Element                  | Copy                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Primary CTA              | `New intake`                                                                                                                  |
| Preview full-page action | `Open full page`                                                                                                              |
| Preview close label      | `Close lead preview`                                                                                                          |
| Assistant disabled state | `Set LEAD_ASSISTANT_ENABLED=true to enable the demo assistant.` or provider-key setup copy from `src/lib/assistant/config.ts` |
| Forecast limitation      | `Based on this dashboard` and deterministic estimate language                                                                 |
| Unknown values           | Use `Unknown`, `Not set`, or existing empty-state copy; do not invent values                                                  |
| Destructive confirmation | Use explicit action labels such as `Archive source` or `Reject`                                                               |

No visible explanatory copy should describe internal implementation, keyboard shortcuts, or styling decisions.

---

## Interaction Contract

- Lead preview opens from console, calendar, and search with one shared interaction model.
- Closing preview removes `leadId` from the URL without page scroll jumps.
- Full lead page tabs support click, hash sync, ArrowLeft, ArrowRight, Home, and End behavior.
- Dense mode visibly changes ledger density and persists.
- Dark mode persists across reloads and respects system preference before explicit choice.
- Reports and forecasts are read-only unless the user explicitly asks for a mutation.
- Assistant mutations must show confirmation with `Apply` and `Reject`.
- Assistant report and forecast cards must show loading, complete, and empty or missing-data states.

---

## Verification Targets

- Desktop and mobile preview: no clipped controls, close button visible, full-page action visible.
- Calendar stacking: days with multiple events remain readable and event clicks open preview.
- Lead detail tabs: no overlapping tab labels, active tab content matches tab name, edit surfaces remain scoped.
- Settings sources/custom fields: controls fit containers in light and dark themes.
- Global search: overlay fits viewport and results can open preview.
- Dense mode: row height, padding, and secondary text density visibly change.
- Dark mode: console, calendar, settings, lead preview, lead detail, forms, dialogs, and assistant surfaces remain readable.
- Assistant disabled: primary pages remain clean when credentials are absent.
- Assistant configured: report and forecast visual cards distinguish confirmed values, estimates, and assumptions.

---

## Registry Safety

| Registry             | Blocks Used           | Safety Gate                                  |
| -------------------- | --------------------- | -------------------------------------------- |
| shadcn official      | none newly introduced | not required                                 |
| third-party registry | none                  | do not add registry components in this phase |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-08

# Phase 4: Workspace Settings, Help, And Release Metadata - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-10
**Phase:** 04-workspace-settings-help-and-release-metadata
**Areas discussed:** Settings structure, Editable settings vs static metadata, Help structure, Help tone, About presentation, Calendar and assistant defaults, Assistant phase boundary

---

## Settings structure

| Option                        | Description                                         | Selected |
| ----------------------------- | --------------------------------------------------- | -------- |
| Hub with 4 top-level sections | `Workspace`, `Sources`, `Help`, `About`             | ✓        |
| Hub with 5 top-level sections | `Workspace`, `Calendar`, `Sources`, `Help`, `About` |          |
| Split by type                 | Separate `Settings` and `Demo info` groups          |          |
| Other                         | User-defined structure                              |          |

**User's choice:** Lightweight hub with 4 top-level sections: `Workspace`, `Sources`, `Help`, `About`.
**Notes:** Keep `/settings` useful and demo-friendly without making it feel like a production admin console. `Workspace` should hold small configurable/demo settings, `Sources` should keep source definitions and clarify they are not integrations, `Help` should carry the business explanation, and `About` should carry release and developer metadata. Do not add another navigation layer unless implementation naturally requires it.

---

## Editable settings vs static metadata

| Option                     | Description                                                      | Selected |
| -------------------------- | ---------------------------------------------------------------- | -------- |
| Minimal real edits         | `Workspace` and `Sources` editable; `Help` and `About` read-only | ✓        |
| Mixed, but constrained     | `Workspace` and `Sources` editable; some `About` fields editable |          |
| Mostly static demo surface | Only `Sources` truly editable                                    |          |
| Other                      | User-defined split                                               |          |

**User's choice:** Minimal real edits.
**Notes:** `Workspace` should contain demo-safe configurable fields such as workspace name, business type, timezone, currency, demo mode label, calendar defaults, and simple assistant status/defaults where safe. `Help` and `About` remain read-only. Do not build editable CMS-style portfolio copy or fake admin controls. Persist new `Workspace` settings in namespaced `localStorage`, clear that key on reset, do not add DB tables or migrations, and do not store secrets. Verification should cover persistence, reload, reset, read-only surfaces, and no impact on the main demo flow. Also add a manual follow-up to close external Supabase write access and verify anonymous/public clients cannot mutate shared demo data.

---

## Help structure

| Option                    | Description                               | Selected |
| ------------------------- | ----------------------------------------- | -------- |
| One guided narrative page | Stacked explanation sections on one page  |          |
| FAQ-style help            | Scannable Q/A cards                       |          |
| Hybrid                    | Narrative summary at top, FAQ cards below | ✓        |
| Other                     | User-defined structure                    |          |

**User's choice:** Hybrid.
**Notes:** Keep business value upfront, then make what is real vs mocked/deferred and how the demo works easy to scan.

---

## Help tone

| Option                  | Description                                           | Selected |
| ----------------------- | ----------------------------------------------------- | -------- |
| Business-outcomes first | Lead with business outcomes                           |          |
| Workflow-demo first     | Lead with step-by-step demo behavior                  |          |
| Balanced                | Start with business value, then explain the demo flow | ✓        |
| Other                   | User-defined tone                                     |          |

**User's choice:** Balanced.
**Notes:** Open with business value, then quickly tie it to the concrete demo flow. Avoid generic AI/product hype.

---

## About presentation

| Option                     | Description                                                         | Selected |
| -------------------------- | ------------------------------------------------------------------- | -------- |
| Simple read-only cards     | Separate cards for release, links, and developer info               |          |
| One compact overview panel | Dense summary plus changelog                                        |          |
| Hybrid                     | Compact overview at top, then changelog and developer/contact cards | ✓        |
| Other                      | User-defined layout                                                 |          |

**User's choice:** Hybrid.
**Notes:** Keep the important metadata visible immediately without turning the section into a long wall of release notes.

---

## Calendar and assistant defaults

| Option                           | Description                                                            | Selected |
| -------------------------------- | ---------------------------------------------------------------------- | -------- |
| Minimal and mostly informational | Basic editable workspace fields and mostly read-only assistant status  |          |
| Small but actionable             | Modest calendar defaults plus safe local assistant UI/default behavior | ✓        |
| More complete demo controls      | Richer assistant/demo controls                                         |          |
| Other                            | User-defined boundary                                                  |          |

**User's choice:** Small but actionable.
**Notes:** Keep calendar defaults modestly editable and keep assistant settings limited to safe local UI/default behavior only. Do not pretend the browser is controlling deployment or runtime configuration.

---

## Assistant phase boundary

| Option | Description                                                                                       | Selected |
| ------ | ------------------------------------------------------------------------------------------------- | -------- |
| A      | Phase 4 includes only very small assistant settings/copy notes; assistant UI work becomes Phase 5 |          |
| B      | Tiny assistant controls can fit in Phase 4; assistant response components become Phase 5          | ✓        |
| C      | All assistant work deferred to Phase 5                                                            |          |
| Other  | User-defined split                                                                                |          |

**User's preference:** Keep Phase 4 focused and shippable. If assistant controls/components require meaningful UI work beyond settings copy, split them into Phase 5.
**Resolved boundary:** Phase 4 may include only tiny browser-local assistant settings or read-only status/copy inside `Workspace`. Assistant demo controls, guardrails, and response components should move to a follow-on Phase 5 if they require meaningful UI work.
**Deferred scope candidate for Phase 5:** preset command chips, optional free-text toggle, preset-only demo mode, per-browser usage limits, predefined fallback responses, and compact assistant response components such as `AssistantLeadCard`, `AssistantCalendarCard`, and `AssistantSummaryCard`.

---

## the agent's Discretion

- Exact `localStorage` key name and reset implementation.
- Exact grouping and wording of Help FAQ cards and About metadata cards.
- Exact split between editable versus informational assistant defaults inside `Workspace`, as long as browser-local scope stays honest.

## Deferred Ideas

None.

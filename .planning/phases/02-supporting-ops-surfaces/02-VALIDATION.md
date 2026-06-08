---
phase: 2
slug: supporting-ops-surfaces
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-08
---

# Phase 2 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| **Framework**          | Vitest plus Next.js build/type/lint gates                |
| **Config file**        | `vitest.config.ts`, `eslint.config.mjs`, `tsconfig.json` |
| **Quick run command**  | `npm run typecheck`                                      |
| **Full suite command** | `npm run check`                                          |
| **Estimated runtime**  | project-dependent                                        |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck` when the task changes TypeScript.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** Full suite must be green or blockers documented.
- **Max feedback latency:** one plan wave.

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                                          | Test Type      | Automated Command   | File Exists | Status  |
| -------- | ---- | ---- | ----------- | ---------- | -------------------------------------------------------- | -------------- | ------------------- | ----------- | ------- |
| 02-01-T1 | 01   | 1    | LEAD-04     | T-02-01    | Preview does not expose unrelated workspace data         | browser/source | `npm run typecheck` | yes         | pending |
| 02-01-T2 | 01   | 1    | LEAD-04     | T-02-02    | Tab edits remain scoped to existing domain/API paths     | browser/source | `npm run typecheck` | yes         | pending |
| 02-01-T3 | 01   | 1    | LEAD-05     | T-02-03    | Calendar uses dashboard-only lead/follow-up data         | browser/source | `npm run typecheck` | yes         | pending |
| 02-02-T1 | 02   | 2    | SAFE-02     | T-02-04    | Missing assistant credentials do not break primary pages | source/build   | `npm run typecheck` | yes         | pending |
| 02-02-T2 | 02   | 2    | SAFE-03     | T-02-05    | Mutations require preview/apply confirmation             | source/test    | `npm run test`      | yes         | pending |
| 02-02-T3 | 02   | 2    | SAFE-04     | T-02-06    | Reports/forecasts label estimates and assumptions        | source/test    | `npm run test`      | yes         | pending |
| 02-03-T1 | 03   | 3    | LEAD-04     | T-02-07    | Browser inputs use Test-safe names only                  | browser        | `npm run check`     | yes         | pending |
| 02-03-T2 | 03   | 3    | LEAD-05     | T-02-08    | Responsive surfaces do not clip controls                 | browser        | `npm run check`     | yes         | pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior                             | Requirement               | Why Manual                      | Test Instructions                                                                                            |
| ------------------------------------ | ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Calendar event opens shared preview  | LEAD-04, LEAD-05          | No committed E2E harness exists | Seed data, open `/calendar`, click a lead/follow-up event, confirm preview opens and closes.                 |
| Dense mode visual density            | LEAD-05                   | Visual state comparison         | Toggle dense mode on `/` and confirm row height, padding, and secondary text density change.                 |
| Dark mode readability                | LEAD-04, LEAD-05          | Visual contrast/readability     | Toggle dark mode, reload, inspect console, calendar, settings, preview, lead detail, and assistant surfaces. |
| Assistant configured report/forecast | SAFE-02, SAFE-03, SAFE-04 | Requires private credentials    | If credentials exist, ask for a period report and forecast; otherwise document clean disabled state.         |

---

## Validation Sign-Off

- [x] All tasks have automated verify or manual browser instructions.
- [x] Sampling continuity: no 3 consecutive tasks without verification.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency bounded by plan wave.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-06-08

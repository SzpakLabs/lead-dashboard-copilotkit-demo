---
phase: 1
slug: publishable-lead-review-flow
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-08
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest plus Next.js build/type/lint checks |
| **Config file** | `vitest.config.ts`, `eslint.config.mjs`, `tsconfig.json` |
| **Quick run command** | `npm run typecheck` |
| **Full suite command** | `npm run check` |
| **Estimated runtime** | unknown until local run |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck` when code changed.
- **After every plan wave:** Run the strongest feasible subset, preferably `npm run check`.
- **Before `$gsd-verify-work`:** Full suite should be green or blockers documented.
- **Max feedback latency:** one plan wave.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | SAFE-01, LEAD-01, LEAD-02 | — | Seed reset only affects demo workspace slug | typecheck/manual DB seed | `npm run typecheck`; `npm run db:reset-demo` if configured | yes | pending |
| 01-01-T2 | 01 | 1 | LEAD-01, LEAD-02 | — | Demo data remains fake and source-traceable | typecheck/manual source audit | `npm run typecheck` | yes | pending |
| 01-01-T3 | 01 | 1 | SAFE-01 | — | No realistic person names in test/demo input | source audit | `npm run typecheck` | yes | pending |
| 01-02-T1 | 02 | 2 | ACCESS-01 | — | Missing optional assistant config does not crash route | typecheck/browser | `npm run typecheck` | yes | pending |
| 01-02-T2 | 02 | 2 | PACK-03 | — | UI remains readable and controls are reachable | browser | manual browser verification | yes | pending |
| 01-02-T3 | 02 | 2 | LEAD-03 | — | Status/review mutation uses existing domain/API path | typecheck/browser | `npm run typecheck` | yes | pending |
| 01-03-T1 | 03 | 3 | ACCESS-01 | — | Verification result is reported honestly | command | `npm run check` | yes | pending |
| 01-03-T2 | 03 | 3 | LEAD-01, LEAD-03, PACK-03 | — | Browser-entered names include `Test` | browser | manual browser verification | yes | pending |
| 01-03-T3 | 03 | 3 | SAFE-01 | — | Spec task status reflects completed work only | source audit | `npm run typecheck` | yes | pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| First viewport quality | PACK-03 | No committed visual test suite exists | Open `/` on desktop and verify metrics, filters, and populated ledger are visible without overlap |
| Preview dialog clipping | PACK-03, LEAD-03 | Native dialog and responsive layout require browser inspection | Open and close a seeded lead preview on desktop and mobile |
| Status/review interaction | LEAD-03 | Existing UI flow requires app plus database | Trigger one review/status action using a Test-safe seeded lead |
| Assistant disabled state | ACCESS-01 | Depends on local credential config | Load `/` without assistant credentials and confirm the route still works |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verify coverage.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target set to one plan wave.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-06-08

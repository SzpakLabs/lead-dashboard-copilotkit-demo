# Requirements: AI Lead Dashboard

**Defined:** 2026-06-08
**Core Value:** Show a realistic lead qualification workflow where messy inquiries become actionable sales operations data under human control.

## v1 Requirements

### Demo Access

- [ ] **ACCESS-01**: User can open the main lead dashboard without crashes.
- [ ] **ACCESS-02**: Required environment setup is documented clearly.
- [ ] **ACCESS-03**: Public demo path avoids exposing private credentials.

### Lead Workflow

- [ ] **LEAD-01**: User can demonstrate lead intake or lead review with safe demo data.
- [ ] **LEAD-02**: User can see budget, urgency, service type, source, status, and follow-up timing.
- [ ] **LEAD-03**: User can change or review lead status through an existing workflow.
- [ ] **LEAD-04**: User can inspect lead detail, follow-ups, calendar, or report context.

### Safety And Assistant

- [ ] **SAFE-01**: Test names in examples, browser tests, forms, and assistant simulations include `Test`.
- [ ] **SAFE-02**: Assistant behavior remains optional and controlled through typed tools.
- [ ] **SAFE-03**: Mutative assistant actions use preview/apply or explicit confirmation behavior.

### Portfolio Packaging

- [ ] **PACK-01**: README or portfolio notes explain the business problem, solution, stack, setup, and deployment notes.
- [ ] **PACK-02**: A 60-second demo script exists.
- [ ] **PACK-03**: First screenshot is professional enough for GitHub, LinkedIn, and Upwork.

## v2 Requirements

### Integrations

- **INT-01**: Add Telegram or website lead capture.
- **INT-02**: Add telephony recording ingestion.
- **INT-03**: Add external CRM sync.
- **INT-04**: Expand analytics beyond the current demo reports.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real ingestion integrations | Defer until the demo is public |
| Production auth and roles | Not required for portfolio proof |
| Billing | Unrelated to lead operations demo value |
| Database architecture replacement | Existing Drizzle/PostgreSQL stack is sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACCESS-01 | Phase 1 | Pending |
| ACCESS-02 | Phase 3 | Pending |
| ACCESS-03 | Phase 3 | Pending |
| LEAD-01 | Phase 1 | Pending |
| LEAD-02 | Phase 1 | Pending |
| LEAD-03 | Phase 1 | Pending |
| LEAD-04 | Phase 2 | Pending |
| SAFE-01 | Phase 1 | Pending |
| SAFE-02 | Phase 2 | Pending |
| SAFE-03 | Phase 2 | Pending |
| PACK-01 | Phase 3 | Pending |
| PACK-02 | Phase 3 | Pending |
| PACK-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-06-08*
*Last updated: 2026-06-08 after initial definition*

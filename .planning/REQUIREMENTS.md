# Requirements: AI Lead Dashboard

**Defined:** 2026-06-08
**Core Value:** Show a realistic lead qualification workflow where messy inquiries become actionable sales operations data under human control.

## v1 Requirements

### Demo Access

- [ ] **ACCESS-01**: User can open the main lead dashboard route without crashes in the documented demo environment.
- [ ] **ACCESS-02**: User can follow documented local setup steps for database, seed data, and optional assistant configuration.
- [ ] **ACCESS-03**: Public demo path avoids exposing private credentials and documents any unavailable private capabilities.

### Lead Workflow

- [ ] **LEAD-01**: User can demonstrate lead intake or lead review with demo-safe data.
- [ ] **LEAD-02**: User can see budget, urgency, service type, source, status, next step, and follow-up timing for representative leads.
- [ ] **LEAD-03**: User can change or review lead status through an existing workflow and see the UI or persisted state update.
- [ ] **LEAD-04**: User can inspect a lead through preview and full detail surfaces without losing context.
- [ ] **LEAD-05**: User can use calendar, reports, or forecast views to explain follow-up workload and pipeline value.

### Safety And Assistant

- [ ] **SAFE-01**: Seed data, docs examples, browser checks, forms, chats, and assistant simulations use person names containing `Test`.
- [ ] **SAFE-02**: Assistant behavior remains optional and cleanly disabled when required credentials are absent.
- [ ] **SAFE-03**: Assistant actions remain typed, scoped to domain tools, and controlled through preview/apply or explicit confirmation behavior.
- [ ] **SAFE-04**: Forecasts and reports distinguish confirmed values from estimates and show assumptions where applicable.

### Portfolio Packaging

- [ ] **PACK-01**: README or portfolio notes explain the business problem, solution, stack, local setup, deployment notes, and limitations.
- [ ] **PACK-02**: A 60-second demo script exists and follows the lead intake or lead review story.
- [ ] **PACK-03**: The first screenshot or first viewport is professional enough for GitHub, LinkedIn, Upwork, and direct outreach.
- [ ] **PACK-04**: Verification evidence records the strongest practical checks run before sharing the demo.

## v2 Requirements

### Integrations

- **INT-01**: User can ingest leads from Telegram text or voice-note intake.
- **INT-02**: User can capture leads from an external website widget.
- **INT-03**: User can ingest real call recordings or transcripts.
- **INT-04**: User can sync or export leads to an external CRM.

### Production Hardening

- **PROD-01**: Workspace users authenticate through a production auth provider.
- **PROD-02**: Permissions prevent cross-workspace data access.
- **PROD-03**: Production storage handles uploaded source artifacts.
- **PROD-04**: Deployment monitoring catches route, database, and assistant runtime failures.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real ingestion integrations | Defer until the demo is public and the core story is validated |
| Production auth and roles | Not required for portfolio proof |
| Billing | Unrelated to lead operations demo value |
| Database architecture replacement | Existing Drizzle/PostgreSQL stack is sufficient |
| Parallel custom assistant framework | Existing CopilotKit architecture is the approved direction |
| Broad redesign | Active work is publication readiness, not a new product concept |

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
| LEAD-05 | Phase 2 | Pending |
| SAFE-01 | Phase 1 | Pending |
| SAFE-02 | Phase 2 | Pending |
| SAFE-03 | Phase 2 | Pending |
| SAFE-04 | Phase 2 | Pending |
| PACK-01 | Phase 3 | Pending |
| PACK-02 | Phase 3 | Pending |
| PACK-03 | Phase 1 | Pending |
| PACK-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-06-08*
*Last updated: 2026-06-08 after initial definition*

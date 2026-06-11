# Roadmap: AI Lead Dashboard

**Created:** 2026-06-08
**Granularity:** Coarse
**Project mode:** MVP

## Phase Summary

| Phase | Name                                               | Requirements                                    | Goal                                            |
| ----- | -------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| 1     | 3/3                                                | Complete                                        | 2026-06-08                                      |
| 2     | 3/3                                                | Complete                                        | 2026-06-08                                      |
| 3     | Portfolio Packaging And Deployment                 | ACCESS-02, ACCESS-03, PACK-01, PACK-02, PACK-04 | Demo is documented, checked, and ready to share |
| 4     | Workspace Settings, Help, And Release Metadata     | SET-01, SET-02, SET-03, SET-04, SET-05          | 2026-06-10                                      |
| 5     | Assistant Demo Controls And Response Components    | TBD                                             | Keep assistant follow-on work out of Phase 4    |
| 6     | Portfolio Surface Polish And Business Storytelling | TBD                                             | Preserve non-blocking Phase 4 polish follow-ups |

## Phases

### Phase 1: Publishable Lead Review Flow

**Goal:** Ensure the main lead demo opens cleanly and shows a safe, understandable lead qualification workflow.

**Mode:** mvp

**Requirements:** ACCESS-01, LEAD-01, LEAD-02, LEAD-03, SAFE-01, PACK-03

**Success Criteria:**

1. Main dashboard route opens in the documented demo environment without a crash.
2. Lead intake or lead review can be demonstrated with person names containing `Test`.
3. Representative leads show budget, urgency, service type, source, status, next step, and follow-up timing where available.
4. A visible lead status or review action updates UI or persisted demo state.
5. First viewport and primary screenshot are professional enough for outreach.

**Notes:**

- This phase should align with the remaining demo data and verification tasks in `.kiro/specs/lead-workflow-ux-upgrade/tasks.md`.
- Fix build failures, crashes, broken navigation, missing fallback states, and embarrassing first-screen issues before polish.

### Phase 2: Supporting Ops Surfaces

**Goal:** Make supporting lead operations surfaces credible without expanding scope.

**Mode:** mvp

**Requirements:** LEAD-04, LEAD-05, SAFE-02, SAFE-03, SAFE-04

**Success Criteria:**

1. Lead preview and full lead detail let the user inspect a lead without losing workflow context.
2. Calendar, reports, and forecast views support a clear explanation of follow-up workload and pipeline value.
3. Assistant entry points are available or cleanly disabled on primary pages depending on runtime configuration.
4. Assistant mutations remain typed, scoped, and controlled through preview/apply or explicit confirmation behavior.
5. Reports and forecasts distinguish confirmed values from estimates and show assumptions where applicable.

**Notes:**

- Do not replace CopilotKit or introduce a custom assistant framework.
- If credentials are absent, document the disabled state rather than blocking the non-assistant demo.

### Phase 3: Portfolio Packaging And Deployment

**Goal:** As a prospective client or recruiter, I want to review and share the demo confidently, so that the portfolio proves the product story and implementation quality.

**Mode:** mvp

**Requirements:** ACCESS-02, ACCESS-03, PACK-01, PACK-02, PACK-04

**Success Criteria:**

1. README or portfolio notes explain the problem, solution, stack, setup, deployment notes, and limitations.
2. A 60-second demo script exists and follows the lead intake or review story.
3. Public deployment or documented local demo path avoids exposing private credentials.
4. Verification evidence records the strongest practical checks run before sharing.
5. The demo is ready to use in GitHub, LinkedIn, Upwork, and direct outreach.

**Notes:**

- Deployment work requires explicit approval before using external services.
- Keep content/article milestones optional unless the active task is publication copy.

## Coverage

- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

### Phase 4: Workspace Settings, Help, And Release Metadata

**Goal:** Make `/settings` a truthful, demo-safe workspace hub that supports light local customization, explains the product clearly, and surfaces release metadata without pretending to be production admin.
**Requirements**: SET-01, SET-02, SET-03, SET-04, SET-05
**Depends on:** Phase 3
**Plans:** 3 plans

**Success Criteria:**

1. `/settings` exposes `Workspace`, `Sources`, `Help`, and `About` inside the shared app shell without adding a separate admin experience.
2. Workspace preferences such as name, business type, timezone, currency, demo label, and modest calendar defaults persist through browser-local storage and can reset to seeded defaults.
3. `Sources` remains editable while clearly stating that source labels support manual/demo workflow context rather than real integrations.
4. `Help` explains business value, the main demo flow, human-in-the-loop control, and what is real versus mocked or deferred in business-readable language.
5. `About` shows the live demo URL, repo metadata, version or release date context, changelog summary, and developer/contact details without exposing secrets.

**Notes:**

- Keep `Workspace` and `Sources` editable, but keep `Help` and `About` read-only.
- Do not add database tables or migrations for Phase 4 workspace preferences; use browser-local persistence only.
- If assistant settings need meaningful custom UI or response components, split that work into Phase 5 rather than expanding Phase 4.
- Non-blocking UAT follow-ups should not reopen Phase 4. Route Help/About portfolio polish and any safe cross-surface use of browser-local workspace preferences into a later follow-on phase.

Plans:

- [x] 04-01 - Build the settings hub, local workspace preferences, and source-context framing
- [x] 04-02 - Add read-only help and about sections with honest demo and release metadata
- [x] 04-03 - Verify persistence, copy honesty, and release tracking updates

### Phase 5: Assistant Demo Controls And Response Components

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 0 plans

**Notes:**

- Keep this phase primarily focused on assistant demo controls, response components, and any assistant-specific context/rendering work.
- Do not absorb general Help/About portfolio polish into this phase unless a tiny slice is required for assistant context.

Plans:

- [ ] TBD (candidate follow-on if assistant demo controls or response UI exceed Phase 4 scope)

### Phase 6: Portfolio Surface Polish And Business Storytelling

**Goal:** Make the Phase 4 Help/About/settings-adjacent portfolio surfaces feel more polished, scannable, and business-readable without pretending to be production admin.
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 0 plans

**Candidate Scope:**

1. Make `Help` and `About` more visually polished and business-readable.
2. Improve hierarchy, spacing, badges, icons, and scanability.
3. Add stronger business-value cards.
4. Add a visual `How to demo this` strip.
5. Add a `Real vs mocked/deferred` comparison.
6. Make `About` feel like a polished release or portfolio panel.
7. Add a stronger CTA/contact card.
8. Optionally allow safe browser-local workspace preferences such as workspace name, demo label, timezone, or follow-up defaults to visibly influence selected UI surfaces.

**Constraints:**

- Keep the copy honest and portfolio-safe.
- Keep browser-local behavior browser-local where relevant.
- Do not turn `/settings` into production admin or CMS-style management.
- Do not use this phase as a back door to expand assistant scope that belongs in Phase 5.

Plans:

- [ ] TBD (candidate follow-on for portfolio storytelling and settings-surface polish)

---

_Roadmap created: 2026-06-08_

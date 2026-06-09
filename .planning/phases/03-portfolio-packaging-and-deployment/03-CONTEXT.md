# Phase 3: Portfolio Packaging And Deployment - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase packages the already-built lead operations demo into a shareable outreach artifact. It should produce a public deployment as the primary done target, keep a documented local fallback path, add portfolio-ready documentation, define a short demo story, and capture practical verification evidence before sharing.

This phase does not add new product capabilities, redesign the app, replace the current architecture, or start deferred integrations. It is about shipping and presenting the existing demo credibly.

</domain>

<decisions>
## Implementation Decisions

### Share Path And Release Target

- **D-01:** Treat a public deployment as the primary Phase 3 done target. The main artifact should be a shareable public URL suitable for GitHub, LinkedIn, Upwork, and direct outreach.
- **D-02:** Keep the documented local demo path as a fallback, not the primary artifact. Local setup instructions should remain usable if deployment or external service approval blocks the public path.
- **D-03:** Deployment work should stay within the current app boundaries and avoid exposing private credentials. If some optional capabilities cannot be enabled publicly, document that clearly rather than blocking the release.

### Documentation Packaging

- **D-04:** Create both a top-level `README.md` and a separate portfolio/demo note under `docs/`.
- **D-05:** The `README.md` should explain what the project is, how to run it locally, how to deploy it, what the demo proves, and the main limitations or optional private setup requirements.
- **D-06:** The docs note under `docs/` should be optimized for outreach and portfolio usage rather than repository setup alone. It should help a reviewer quickly understand the business story, the product value, and what to look at in the demo.

### Demo Narrative

- **D-07:** Center the 60-second demo script on the intake-to-review flow. The main story is that scattered lead input becomes structured review, status handling, and operational follow-up.
- **D-08:** Treat console, calendar, and reports/forecasts as supporting proof points rather than the main narrative. They should reinforce operational depth after the core intake-to-review story is shown.
- **D-09:** The script should emphasize business clarity and workflow credibility over feature count.

### Verification Evidence

- **D-10:** Use a formal but lightweight verification artifact for Phase 3.
- **D-11:** The verification artifact should include environment notes, commands run, a smoke checklist, screenshots, known limitations, and blockers if any.
- **D-12:** Do not expand verification into a full QA handoff process. The goal is credible share-readiness evidence, not a heavyweight testing package.

### Carry Forward From Earlier Phases

- **D-13:** Treat `/` as the main demo entry route and keep the `software-services-demo` workspace as the canonical story.
- **D-14:** Assistant behavior remains optional and must fail cleanly or be documented when credentials are absent.
- **D-15:** All example, seed, browser, form, chat, and documentation person names must include `Test`.

### the agent's Discretion

- The agent may choose the exact document names, verification file name, and screenshot set as long as they support the public deployment target and portfolio story.
- The agent may choose the deployment configuration details that best fit the existing Next.js and PostgreSQL app, subject to explicit approval before using external services.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### GSD Project Scope

- `.planning/PROJECT.md` — Active publication goal, constraints, and requirement priorities for the outreach-ready demo.
- `.planning/REQUIREMENTS.md` — Phase 3 requirement IDs: ACCESS-02, ACCESS-03, PACK-01, PACK-02, PACK-04.
- `.planning/ROADMAP.md` — Phase 3 boundary, success criteria, and explicit deployment-approval note.
- `.planning/STATE.md` — Current workflow state and current focus on Phase 3.
- `.planning/phases/01-publishable-lead-review-flow/01-CONTEXT.md` — Prior decisions on demo route, demo-safe data, and verification expectations.
- `.planning/phases/02-supporting-ops-surfaces/02-CONTEXT.md` — Prior decisions on assistant optionality, supporting proof surfaces, and blocker documentation.

### Active Product Spec

- `.kiro/specs/README.md` — Active and paused spec boundaries.
- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md` — Remaining verification-oriented work and completed UX/demo upgrades.
- `.kiro/specs/demo-readiness-fixes/tasks.md` — Paused/demo-readiness context relevant to packaging and public-share blockers.

### Durable Steering

- `.kiro/steering/product.md` — Product positioning, demo-core intent, and product rules.
- `.kiro/steering/tech.md` — Stack and architecture constraints to preserve while packaging and deploying.
- `.kiro/steering/structure.md` — Repository/documentation rules and boundary guidance.

### Existing Demo And Runtime Docs

- `docs/00-meta/01-demo-runbook.md` — Current local demo reset flow, env expectations, and smoke-check commands.
- `.env.example` — Safe environment variable surface for local setup and deployment documentation.
- `package.json` — Available scripts for build, check, seed/reset, and runtime commands.
- `next.config.ts` — Existing Next.js app configuration baseline for deployment planning.

### Codebase Maps

- `.planning/codebase/STACK.md` — Tech stack, build/test scripts, and deployment-related observations.
- `.planning/codebase/ARCHITECTURE.md` — App/data/runtime structure and integration boundaries.
- `.planning/codebase/INTEGRATIONS.md` — Database and assistant configuration boundaries plus current lack of concrete deployment config.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `docs/00-meta/01-demo-runbook.md` — Existing local reset, env, and smoke-check notes can be expanded rather than rewritten from scratch.
- `package.json` — Already defines the main verification and runtime commands: `check`, `build`, `db:migrate`, `db:seed`, and `db:reset-demo`.
- `app/page.tsx` — Existing main console route remains the public demo entry point described in docs and the demo script.
- `src/lib/assistant/config.ts` and `app/layout.tsx` — Existing assistant gating supports the documented optional-assistant story for public deployment.
- `.env.example` — Existing env variable list can anchor setup and deployment documentation without leaking secrets.

### Established Patterns

- The app is a single Next.js App Router project with PostgreSQL and Drizzle, so packaging should document one deployable app rather than split services.
- Verification should favor `npm run check`, targeted smoke checks, and documented blockers over broad audits.
- Optional assistant behavior is already handled through runtime config gates instead of alternative code paths.
- Documentation in this repo is lightweight and task-oriented, so Phase 3 artifacts should stay concise and operational.

### Integration Points

- Public deployment planning connects to the current Next.js runtime and database env setup, not a separate infra repo.
- README and portfolio docs should point reviewers to `/`, the seeded workspace story, local reset commands, and any public deployment URL.
- Verification artifacts should capture build/check commands, deployment smoke checks, and screenshots from the same packaged demo flow.

</code_context>

<specifics>
## Specific Ideas

- Make the public URL the primary artifact and keep the local demo flow as backup.
- Split documentation into a practical `README.md` and an outreach-oriented portfolio note under `docs/`.
- Anchor the 60-second story on intake-to-review instead of trying to show every surface equally.
- Keep verification formal enough to be credible, but lightweight enough to stay portfolio-focused.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 3-Portfolio Packaging And Deployment_
_Context gathered: 2026-06-10_

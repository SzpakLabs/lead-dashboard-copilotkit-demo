---
status: partial
phase: 03-portfolio-packaging-and-deployment
source:
  - .planning/phases/03-portfolio-packaging-and-deployment/03-01-SUMMARY.md
  - .planning/phases/03-portfolio-packaging-and-deployment/03-02-SUMMARY.md
  - .planning/phases/03-portfolio-packaging-and-deployment/03-03-SUMMARY.md
started: 2026-06-10T09:40:14Z
updated: 2026-06-10T11:15:00Z
---

## Current Test

number: [testing paused - 3 items outstanding]
name: Share path packaging follow-up
expected: |
  Phase 3 docs and repo packaging should now describe the live public demo truthfully, while remaining manual GitHub metadata and polish follow-ups stay explicit.
awaiting: user response

## Tests

### 1. Demo Package Documentation
expected: Opening the main package docs gives a clear portfolio story: what the product is, who it is for, how to run the local demo safely, what the main routes are, and what the deployment limitations are.
result: issue
reported: "README content is good, but repo-level packaging is incomplete because GitHub short description and website URL are missing. Add topics: nextjs, typescript, postgresql, drizzle, tailwindcss, ai-dashboard, crm, lead-management, copilotkit, portfolio-demo. README: public URL too necessary at the top. For demo better right after first paragraph: ## Live Demo https://lead-dashboard-rosy.vercel.app/ and only then Problem / Solution."
severity: major

### 2. Short Demo Script
expected: The portfolio note provides a concise walkthrough that can be used as a roughly 60-second demo narrative without inventing unsupported product behavior.
result: issue
reported: "The short demo script direction is mostly right, but it should be updated to match the actual public demo more precisely. The app does have an intake modal: \"Create draft lead\" with source selection, input type, pasted text/transcript, and a draft lead creation action. However, this intake moment is currently too weak to be the whole hero of the demo by itself. The script should still center on intake-to-review, but phrase it as: \"Paste an inbound request into the intake modal -> create a draft lead -> review the structured lead in the console -> inspect next step, source, budget, urgency, follow-up context -> use calendar/reports as supporting proof.\" Do not describe unsupported external live ingestion from LinkedIn/WhatsApp/phone as already integrated. The source dropdown can be presented as simulated/source-labeled intake, not as real channel integration. Suggested script direction: 1. Open the live demo: https://lead-dashboard-rosy.vercel.app/ 2. Click New Intake. 3. Paste a Test-safe inbound request, for example: \"Carlos Test from Test Studio asked about a client dashboard for tracking inbound leads. Budget around $5k. Wants a discovery call next Tuesday and follow-up tomorrow.\" 4. Select a source such as LinkedIn and input type Pasted text. 5. Create the draft lead. 6. Return to the console and show how the request becomes reviewable operational work. 7. Open the lead preview/full detail to show source, budget, urgency, next step, status, and follow-up context. 8. Open Calendar or reports/forecast as secondary proof that the workflow connects to operations. Also note for follow-up improvement: The intake modal works, but its demo value could be stronger with a clearer post-submit transition, stronger extracted-field preview, or a more obvious \"draft created / review now\" moment."
severity: major

### 3. Share Path And Release Readiness
expected: The release docs and verification evidence make it clear what is ready now for local sharing, what remains blocked for public deployment, and which checks were actually run.
result: issue
reported: "The release readiness docs are no longer accurate because the public demo is already live at https://lead-dashboard-rosy.vercel.app/. The current docs and verification still talk too much about local demo and public deployment blocked. Use these terms consistently: Public demo / live demo, Local development path, Self-hosted demo / standalone hosted demo, Production SaaS. Public demo is live and should be treated as the primary share artifact. Local development setup remains documented for developers, not as the main portfolio artifact. Public deployment is no longer blocked by missing hosted database configuration. ACCESS-03 can be marked satisfied only after public smoke results are recorded. Run and record production smoke checks for /, /calendar, /settings, the New Intake flow, the Create draft lead form, source and input type controls, Test-safe draft creation, post-submit behavior, lead preview or detail, and confirm no secrets are exposed. Clarify that New Intake opens a manual or source-labeled intake flow, not real channel integrations. Keep GitHub short description, website URL, and topics as packaging follow-ups. Update README.md, docs/00-meta/01-demo-runbook.md, docs/00-meta/02-portfolio-demo-note.md, docs/00-meta/03-release-checklist.md, .planning/phases/03-portfolio-packaging-and-deployment/03-VERIFICATION.md, .planning/phases/03-portfolio-packaging-and-deployment/03-UAT.md, .planning/STATE.md, and .planning/REQUIREMENTS.md without making unrelated product changes."
severity: major

## Summary

total: 3
passed: 0
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Opening the main package docs gives a clear portfolio story: what the product is, who it is for, how to run the local demo safely, what the main routes are, and what the deployment limitations are."
  status: failed
  reason: "User reported: README content is good, but repo-level packaging is incomplete because GitHub short description and website URL are missing. Add topics: nextjs, typescript, postgresql, drizzle, tailwindcss, ai-dashboard, crm, lead-management, copilotkit, portfolio-demo. README: public URL too necessary at the top. For demo better right after first paragraph: ## Live Demo https://lead-dashboard-rosy.vercel.app/ and only then Problem / Solution."
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "The portfolio note provides a concise walkthrough that can be used as a roughly 60-second demo narrative without inventing unsupported product behavior."
  status: failed
  reason: "User reported: The short demo script direction is mostly right, but it should be updated to match the actual public demo more precisely. The app does have an intake modal: \"Create draft lead\" with source selection, input type, pasted text/transcript, and a draft lead creation action. However, this intake moment is currently too weak to be the whole hero of the demo by itself. The script should still center on intake-to-review, but phrase it as: \"Paste an inbound request into the intake modal -> create a draft lead -> review the structured lead in the console -> inspect next step, source, budget, urgency, follow-up context -> use calendar/reports as supporting proof.\" Do not describe unsupported external live ingestion from LinkedIn/WhatsApp/phone as already integrated. The source dropdown can be presented as simulated/source-labeled intake, not as real channel integration. Suggested script direction: 1. Open the live demo: https://lead-dashboard-rosy.vercel.app/ 2. Click New Intake. 3. Paste a Test-safe inbound request, for example: \"Carlos Test from Test Studio asked about a client dashboard for tracking inbound leads. Budget around $5k. Wants a discovery call next Tuesday and follow-up tomorrow.\" 4. Select a source such as LinkedIn and input type Pasted text. 5. Create the draft lead. 6. Return to the console and show how the request becomes reviewable operational work. 7. Open the lead preview/full detail to show source, budget, urgency, next step, status, and follow-up context. 8. Open Calendar or reports/forecast as secondary proof that the workflow connects to operations. Also note for follow-up improvement: The intake modal works, but its demo value could be stronger with a clearer post-submit transition, stronger extracted-field preview, or a more obvious \"draft created / review now\" moment."
  severity: major
  test: 2
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "The release docs and verification evidence make it clear what is ready now for local sharing, what remains blocked for public deployment, and which checks were actually run."
  status: failed
  reason: "User reported: The release readiness docs are no longer accurate because the public demo is already live at https://lead-dashboard-rosy.vercel.app/. The current docs and verification still talk too much about local demo and public deployment blocked. Use these terms consistently: Public demo / live demo, Local development path, Self-hosted demo / standalone hosted demo, Production SaaS. Public demo is live and should be treated as the primary share artifact. Local development setup remains documented for developers, not as the main portfolio artifact. Public deployment is no longer blocked by missing hosted database configuration. ACCESS-03 can be marked satisfied only after public smoke results are recorded. Run and record production smoke checks for /, /calendar, /settings, the New Intake flow, the Create draft lead form, source and input type controls, Test-safe draft creation, post-submit behavior, lead preview or detail, and confirm no secrets are exposed. Clarify that New Intake opens a manual or source-labeled intake flow, not real channel integrations. Keep GitHub short description, website URL, and topics as packaging follow-ups. Update README.md, docs/00-meta/01-demo-runbook.md, docs/00-meta/02-portfolio-demo-note.md, docs/00-meta/03-release-checklist.md, .planning/phases/03-portfolio-packaging-and-deployment/03-VERIFICATION.md, .planning/phases/03-portfolio-packaging-and-deployment/03-UAT.md, .planning/STATE.md, and .planning/REQUIREMENTS.md without making unrelated product changes."
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

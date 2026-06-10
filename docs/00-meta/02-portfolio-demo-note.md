# Portfolio Demo Note

Live demo:

https://lead-dashboard-rosy.vercel.app/

## Audience

- GitHub reviewers
- LinkedIn or Upwork prospects
- Direct outreach contacts evaluating product and implementation quality

## Value Proposition

This demo shows how an AI-assisted lead operations workspace can turn messy inbound demand into structured, reviewable, follow-up-ready work for a small service business.

## What To Notice

- Console: the `/` route is the main story, with queue health, filtering, lead previews, and next-step context in one workspace.
- Calendar: `/calendar` proves the workflow extends into scheduled work and follow-up timing.
- Reports and forecasts: the optional assistant can generate read-only summaries and near-period pipeline views when configured.
- Settings and sources: the demo supports workspace-level custom fields and source management instead of hard-coded lead metadata.
- Settings hub: `/settings` now combines browser-local workspace defaults, editable sources, and read-only help/about context without pretending to be a production admin console.

## Product Walkthrough

1. Open the live demo on `/`.
2. Click `New intake` and explain that it opens a manual, source-labeled intake flow.
3. Paste a Test-safe inbound request into `Create draft lead`, select a source such as `LinkedIn`, keep `Pasted text`, and create the draft lead.
4. Return to the console and show that the request becomes reviewable operational work with source, budget, urgency, next step, status, and follow-up context.
5. Open lead preview or full detail when available in the current environment to show the same lead as a focused workspace.
6. Open `/calendar` or mention reports and forecasts as supporting proof that the workflow connects to operations.
7. Open `/settings` if you want to show the lightweight workspace hub, honest source framing, or release metadata.

## 60-Second Script

“This live demo starts with a messy inbound request. I click New intake, paste a Test-safe request into the Create draft lead flow, label the source, and create a draft lead for review. Back on the console, that inbound request becomes reviewable operational work where I can inspect source, budget, urgency, next step, status, and follow-up context. If the environment exposes lead preview or full detail cleanly, I open that as the focused workspace. Then I use the calendar, and optionally reports or forecasts, as supporting proof that the workflow connects to real operations. The important point is not fake channel integrations, it is that messy inbound demand becomes structured, human-reviewed lead work.”

## Demo Notes

- Keep the story anchored to intake-to-review, not feature count.
- Describe `New intake` as manual or source-labeled intake, not as completed external channel integration.
- Treat calendar, reports, and assistant behavior as supporting proof points.
- If the assistant is disabled, say so directly and keep the demo focused on the core workflow.
- Use demo-safe names such as `Sofia Test` or `Carlos Test` in any added examples.
- Follow-up improvement: make the post-submit transition more obvious with a clearer `Draft created`, `Review now`, or direct-open moment.

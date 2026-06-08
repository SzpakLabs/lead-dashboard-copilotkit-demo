# Phase 2: Supporting Ops Surfaces - Research

## RESEARCH COMPLETE

## Planning-Relevant Findings

Phase 2 is mostly a verification and hardening phase over implementation that already exists in the active Kiro spec. Planning should avoid inventing new product surfaces and instead prove or fix the current preview, lead detail, calendar, settings, search, density, dark mode, assistant, report, and forecast behavior.

## Existing Implementation To Reuse

- `src/components/dashboard/lead-preview-dialog.tsx` owns shared preview routing through the `leadId` query parameter and `HTMLDialogElement`.
- `src/components/dashboard/lead-workspace.tsx` composes console ledger and preview content.
- `app/calendar/page.tsx` should use the same `leadId` preview contract for lead-related events.
- `src/components/leads/lead-detail-tabs.tsx` already implements tab selection, hash sync, keyboard navigation, and scoped tab panels.
- `app/settings/page.tsx`, `app/settings/fields/page.tsx`, `app/settings/sources/page.tsx`, and source/custom-field panels are the settings surfaces to verify.
- `src/components/dashboard/global-lead-search.tsx` and `src/components/dashboard/lead-search-overlay.tsx` are the command-style search path.
- `src/components/dashboard/dense-mode-toggle.tsx` and `src/components/dashboard/theme-toggle.tsx` are the persisted control paths.
- `src/lib/assistant/config.ts` cleanly gates assistant readiness through `LEAD_ASSISTANT_ENABLED` and provider API keys.
- `src/components/assistant/assistant-panel.tsx` registers CopilotKit visual renderers and human-in-the-loop mutation confirmation.
- `src/lib/assistant/tools/leads.ts` exposes typed domain-backed assistant tools.
- `src/lib/domain/reports/get-lead-report.ts` and `src/lib/domain/reports/get-revenue-forecast.ts` implement deterministic reports and forecasts with `answerPrefix: "Based on this dashboard"`.

## Risks To Plan Around

- Browser checks may require a configured `DATABASE_URL` and seeded data. If unavailable, the plan should document the blocker rather than fake success.
- Assistant configured-output checks require `LEAD_ASSISTANT_ENABLED=true` and a provider key. Missing credentials are acceptable if the disabled state is clean.
- `HTMLDialogElement` styling and mobile viewport behavior are high-risk for clipped controls.
- Dark mode has many custom CSS variables; fixes should reuse existing tokens rather than adding one-off component palettes.
- Search, calendar, and preview route state can conflict if query parameters are not preserved carefully.
- Reports and forecasts are useful only if seeded data remains dense enough from Phase 1.

## Recommended Plan Shape

1. Inspect and harden supporting inspection surfaces: lead preview, calendar event preview, full lead detail tabs, settings, search, dense mode, and dark mode.
2. Inspect and harden assistant/report/forecast safety: optional assistant readiness, typed tool contracts, confirmation behavior, visual report/forecast renderers, and deterministic limitation wording.
3. Run targeted verification and fix blockers found: `npm run check`, browser checks on desktop/mobile, assistant disabled or configured evidence, and active-spec task updates.

## Validation Architecture

Use existing Vitest/domain tests for deterministic report and forecast logic, plus targeted browser verification for UI interaction paths. There is no committed E2E harness in the repo, so browser checks may be manual or tool-driven during execution.

Automated gates:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run format:check`
- `npm run build`
- `npm run check`

Manual or browser gates:

- Console/search/calendar lead preview opens and closes.
- Preview opens full lead page.
- Lead detail tabs preserve scoped edit/review/follow-up/source/activity/custom-field behavior.
- Settings sources and custom fields remain usable.
- Dense mode visibly changes ledger density.
- Dark mode persists and surfaces remain readable.
- Assistant is cleanly disabled without credentials or renders report/forecast cards with configured credentials.


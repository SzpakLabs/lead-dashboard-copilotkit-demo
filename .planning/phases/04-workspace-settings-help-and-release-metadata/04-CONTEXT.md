# Phase 4: Workspace Settings, Help, And Release Metadata - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes `/settings` useful in the live portfolio demo without turning it into a production admin surface. It should reshape the settings route into a lightweight hub that supports the live demo story, explains business value clearly, and stays honest about what is real, mocked, optional, or deferred.

This phase does not add auth, billing, production permissions, real external integrations, editable CMS-style portfolio copy, secrets storage, or backend-heavy admin infrastructure. It should prefer small demo-safe UI and data additions over schema or platform expansion.

</domain>

<decisions>
## Implementation Decisions

### Settings Hub Structure

- **D-01:** `/settings` should become a lightweight hub with four top-level sections: `Workspace`, `Sources`, `Help`, and `About`.
- **D-02:** Do not add another navigation layer unless implementation naturally requires it. The default shape should stay as one settings page shell with section switching inside it.
- **D-03:** The hub should feel useful and demo-friendly, not like a production admin console.

### Editable Surface Boundary

- **D-04:** Only `Workspace` and `Sources` are editable in Phase 4.
- **D-05:** `Help` and `About` must remain read-only. Do not build editable CMS-style portfolio copy.
- **D-06:** `Workspace` should contain small demo-safe configurable fields only: workspace name, business type, timezone, currency, demo mode label, calendar defaults, and at most minimal assistant status/defaults only where the behavior is simple, safe, and clearly browser-local.
- **D-07:** `Sources` should keep the existing editable source-definition behavior, but the UI must clearly explain that these are source labels for intake/manual workflow context, not proof of real external integrations.
- **D-08:** Do not add fake admin controls or controls that imply runtime/provider/deployment configuration the browser does not really own.

### Workspace Storage Model

- **D-09:** Phase 4 `Workspace` settings should use browser-local persistence only.
- **D-10:** Persist new workspace settings in `localStorage` under a namespaced key.
- **D-11:** `Reset to demo defaults` should clear that `localStorage` key and restore the seeded defaults.
- **D-12:** Do not add new database tables or migrations for these settings in Phase 4.
- **D-13:** Do not store secrets, credentials, provider keys, or integration tokens in these settings.

### Help Content And Tone

- **D-14:** `Help` should use a hybrid structure: a short narrative summary at the top, followed by FAQ-style cards underneath.
- **D-15:** The narrative summary should use a balanced tone: open with business value, then quickly tie that value to the concrete demo flow.
- **D-16:** `Help` content should explain what problem the dashboard helps solve, what the main demo flow shows, what is real vs mocked/deferred, why human-in-the-loop matters, and why the workflow is useful for small service businesses.
- **D-17:** Technology mentions should remain secondary implementation notes, not the main selling point.

### About Presentation

- **D-18:** `About` should use a hybrid layout: one compact overview block at the top, followed by separate cards for changelog and developer/contact details.
- **D-19:** `About` should contain the live demo URL, GitHub repo link or placeholder, version, release date, changelog summary, and developer/contact info.

### Calendar Defaults And Assistant Boundary

- **D-20:** Calendar defaults may stay small but actionable inside `Workspace`, but assistant-related work in Phase 4 should stay limited to tiny browser-local settings or read-only status/copy only.
- **D-21:** Editable calendar behavior can include modest local defaults such as working hours and default follow-up window where those settings remain honest and browser-scoped.
- **D-22:** Assistant settings in Phase 4 must not expand into meaningful assistant UI work. They should be limited to safe local UI/default behavior or read-only status labels, and must not imply that browser settings control deployment/runtime secrets or provider configuration.
- **D-23:** Assistant demo controls and assistant response components should be treated as a likely follow-on phase if they require meaningful UI work beyond settings copy or trivial browser-local defaults.

### Verification And Security Follow-Up

- **D-24:** Verification should confirm that editing `Workspace` settings updates `localStorage`, reloading `/settings` restores the local browser settings, `Reset to demo defaults` clears the namespaced key and restores defaults, `Help` and `About` remain read-only, and the main demo flow is unaffected.
- **D-25:** Add a manual owner follow-up to close external write access in Supabase and verify that anonymous/public clients cannot insert, update, or delete shared demo data unless an intentionally safe server-side write path is required.

### the agent's Discretion

- The agent may choose the exact `localStorage` key name, reset mechanics, and UI control types as long as the settings stay browser-local, namespaced, and easy to reset.
- The agent may choose the exact grouping and wording of `Help` FAQ cards and `About` metadata cards as long as business readers understand the story first and technical notes remain secondary.
- The agent may decide whether minimal assistant status/defaults are partly editable or partly informational, provided the browser never pretends to control secrets or deployment/runtime configuration and Phase 4 does not absorb assistant UI/component work.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### GSD Project Scope

- `.planning/PROJECT.md` — Current portfolio-demo goal, constraints, and existing app state.
- `.planning/REQUIREMENTS.md` — Existing validated requirements and demo-safety constraints that Phase 4 must preserve.
- `.planning/ROADMAP.md` — Phase 4 boundary and dependency on Phase 3.
- `.planning/STATE.md` — Current focus and next-command state.
- `.planning/phases/01-publishable-lead-review-flow/01-CONTEXT.md` — Prior decisions on demo-safe data, primary route, and verification expectations.
- `.planning/phases/02-supporting-ops-surfaces/02-CONTEXT.md` — Prior decisions on optional assistant behavior, supporting surfaces, and honesty about limitations.
- `.planning/phases/03-portfolio-packaging-and-deployment/03-CONTEXT.md` — Prior decisions on public-demo clarity, documentation tone, and share-ready metadata context.

### Steering And Active Spec

- `.kiro/steering/product.md` — Product positioning, business value, and human-in-the-loop rules.
- `.kiro/steering/tech.md` — Architecture, assistant constraints, and safety rules.
- `.kiro/steering/structure.md` — Repository boundaries and documentation rules.
- `.kiro/specs/README.md` — Active spec selection and deferred-spec boundaries.
- `.kiro/specs/lead-workflow-ux-upgrade/requirements.md` — Existing settings, source, assistant, and verification requirements already implemented or carried forward.
- `.kiro/specs/lead-workflow-ux-upgrade/design.md` — Existing settings IA, assistant context, and product-direction guidance.
- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md` — Current repo state and completed settings/source work that Phase 4 should extend, not replace.

### Phase 4 Brief And Demo Docs

- `docs/phase-4-browser-notes.md` — Phase 4 brief defining workspace settings, help, release metadata, and honesty constraints.
- `docs/00-meta/01-demo-runbook.md` — Live-demo wording, assistant optionality, and guidance not to overclaim integrations.
- `docs/00-meta/02-portfolio-demo-note.md` — Portfolio/demo narrative and audience framing.
- `docs/00-meta/03-release-checklist.md` — Existing public-link and GitHub packaging context relevant to `About`.
- `docs/20-domain/20-domain-model.md` — Domain terminology, working-hours/timezone constraints, and source terminology.
- `docs/40-ai/41-tool-catalog.md` — Assistant constraints, working-hours/timezone semantics, and human-in-the-loop expectations.

### Codebase Maps

- `.planning/codebase/CONVENTIONS.md` — Strict TypeScript, domain boundaries, and current settings/assistant conventions.
- `.planning/codebase/STRUCTURE.md` — Existing route/component locations for settings, assistant, and shell surfaces.
- `.planning/codebase/STACK.md` — Runtime stack, persistence constraints, and verification scripts.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `app/settings/page.tsx` — Current settings route already composes the shell, section switching, assistant context, and existing custom-field/source panels.
- `src/components/dashboard/app-shell.tsx` — Shared shell with consistent nav, theme control, and optional assistant state that should remain the outer frame for Phase 4 settings work.
- `src/components/leads/source-definitions-panel.tsx` — Existing editable source-definition UI that should be preserved and reframed as intake/source labeling, not integrations.
- `src/components/leads/custom-field-definitions-panel.tsx` — Existing settings-style editor patterns that can inform small editable workspace controls.
- `app/globals.css` — Existing `ops-settings-*` layout classes and settings editor styling that can be extended instead of replaced.
- `src/lib/assistant/config.ts` — Existing assistant runtime readiness and disabled-state reasoning that can feed read-only/status messaging.

### Established Patterns

- The repo favors strict TypeScript, explicit prop types, named exports, and minimal comments.
- Settings-like UI already lives under the shared `AppShell` and should keep the same page width, navigation, and visual language.
- Mutable business data normally persists through domain modules and the database, but this phase explicitly avoids DB schema expansion for new workspace preferences.
- Assistant behavior must remain optional, typed, and honest about missing credentials or absent capabilities.
- Browser-facing controls should not imply runtime/provider control that actually belongs to deployment or server configuration.

### Integration Points

- `app/settings/page.tsx` is the main integration point for new section routing and read-only/editable section composition.
- The current `searchParams`-driven section switcher can be extended to `Workspace`, `Sources`, `Help`, and `About` without creating a separate route tree unless necessary.
- `localStorage`-backed browser preferences will likely need a client component boundary under the server-rendered settings page.
- Existing live-demo and portfolio docs provide the copy source for `Help` and `About`, reducing the need to invent new product claims.
- `npm run check` remains the main automated verification gate; Phase 4 also needs targeted browser checks for persistence/reset behavior and read-only surfaces.

</code_context>

<specifics>
## Specific Ideas

- Treat `/settings` as a lightweight hub that supports the live demo story rather than a fake enterprise admin area.
- `Workspace` should hold small configurable demo-safe settings, while `Help` and `About` explain the product and the release honestly.
- `Help` should lead with business outcomes like fewer lost leads, clearer follow-up ownership, faster review, and better visibility, then tie those outcomes to the actual demo flow.
- `About` should expose the public demo and portfolio metadata without turning into editable content management.
- `Sources` must explicitly communicate that source labels support manual/demo intake workflows and do not prove real LinkedIn, WhatsApp, or phone integrations.

</specifics>

<deferred>
## Deferred Ideas

- Assistant demo controls such as preset command chips, optional free-text toggle, preset-only demo mode, per-browser assistant usage limits, and predefined fallback responses.
- Assistant response components such as compact lead, calendar, and summary cards rendered in chat instead of generic long-form text.
- Any assistant interaction that requires non-trivial custom CopilotKit UI rendering, additional response component design, or demo guardrail logic beyond simple browser-local settings.

</deferred>

---

_Phase: 4-Workspace Settings, Help, And Release Metadata_
_Context gathered: 2026-06-10_

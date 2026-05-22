Use $frontend-design to redesign one visual variant of the Lead Dashboard.

Variant:

- name: {{variantName}}
- branch: {{branch}}
- port: {{port}}
- direction: {{direction}}

Context:

- App path: `{{appPath}}`
- Main page: `app/page.tsx`
- Global styles: `app/globals.css`
- UI primitives: `src/components/ui`
- Lead components: `src/components/leads`
- Lazyweb research: `{{researchPath}}`

Product:

- AI-assisted lead operations for service businesses that live on calls and chats.
- Demo Core proves pasted text/transcript ingestion, draft lead review, dashboard lead management, follow-ups, metrics, and audit/activity.
- The first vertical is software services leads from LinkedIn and Upwork.

Design target:

- Redesign the app's information architecture and workflows, not just the visual surface.
- Keep the main screen as a dense executive/operator summary, not a place where every workflow competes for full space.
- Move specialized work into focused pages and dialogs so the app feels like a real lead-ops product.
- Make adding and editing happen in dialogs or drawers instead of expanding everything inline on the main view.
- Use the Lazyweb research as pattern input, but do not copy one app directly.
- Commit to the variant direction so variants are visibly different from each other.
- Preserve all existing product behavior and data loading.

Redesign goal:

{{redesignGoal}}

Expected app structure:

{{appStructure}}

Workflow expectations:

{{workflowExpectations}}

Constraints:

- You may add routes, split components, add dialogs/drawers, and reorganize UI state when needed.
- Keep data contracts and API behavior compatible with the current app.
- Preserve TypeScript correctness and strict mode.
- Do not use realistic person names in any examples or test data. Names must include `Test`.
- Do not add comments unless logic is complex.
- Avoid generic AI aesthetics, purple gradients, oversized hero sections, nested cards, decorative orbs, and low-density landing-page layouts.
- Ensure text does not clip or overlap on desktop or mobile.

Implementation expectations:

- Inspect existing code before editing.
- Create a navigable product shell if the current app is single-screen.
- Extract repeated or complex page sections into components under `src/components`.
- Add routes under `app` for specialized workflows when appropriate.
- Keep the first viewport focused on summary: metrics, alerts, queue health, and the next few urgent actions.
- Do not bury core actions; use dialogs/drawers for add/edit/review flows.
- Run `npm run build` inside `{{appPath}}`.
- If dependencies are missing, run `npm install` inside `{{appPath}}` and retry build.
- Final response should include the concept name, new pages/dialogs created, files changed, build result, and any known risks.

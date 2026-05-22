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

- Build a dense operational dashboard, not a marketing page.
- Make the first screen useful: ingestion, lead list, selected lead state, review/status/follow-up context should feel connected.
- Use the Lazyweb research as pattern input, but do not copy one app directly.
- Commit to the variant direction so variants are visibly different from each other.
- Preserve all existing product behavior and data loading.

Constraints:

- Keep edits scoped to dashboard presentation unless a tiny shared UI primitive/style change is necessary.
- Preserve TypeScript correctness and strict mode.
- Do not use realistic person names in any examples or test data. Names must include `Test`.
- Do not add comments unless logic is complex.
- Avoid generic AI aesthetics, purple gradients, oversized hero sections, nested cards, decorative orbs, and low-density landing-page layouts.
- Ensure text does not clip or overlap on desktop or mobile.

Implementation expectations:

- Inspect existing code before editing.
- Run `npm run build` inside `{{appPath}}`.
- If dependencies are missing, run `npm install` inside `{{appPath}}` and retry build.
- Final response should include the concept name, files changed, build result, and any known risks.

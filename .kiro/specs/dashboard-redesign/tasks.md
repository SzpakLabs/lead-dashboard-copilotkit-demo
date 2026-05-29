# Tasks: Dashboard Redesign

Status: draft only. Do not implement until this spec is promoted to Active Spec.

## Planning

- [ ] Confirm this spec is active in `.kiro/specs/README.md`
- [ ] Treat `.design-variants` artifacts as deprecated; do not use the CLI workflow for this session.
- [ ] Use `Service Ops Console` as the only redesign direction; do not generate alternate variants.
- [ ] Use `frontend-design` during implementation.
- [ ] Use comparable product references only for patterns that support the Service Ops Console direction.
- [ ] Confirm whether `/` remains the lead workspace or redirects to `/leads`.
- [ ] Confirm whether lead detail gets a dedicated route, inspector, or both.
- [ ] Confirm whether custom field definitions move to `/settings/fields`.

## Manual Redesign

- [ ] Apply the Service Ops Console direction to the main app.
- [ ] Add or update shared app shell, navigation, command bar, and responsive layout tokens.
- [ ] Rework the lead workspace into queue/filter rail, dense lead ledger, and selected-lead inspector.
- [ ] Move ingestion into a drawer/sheet and optional focused route.
- [ ] Reorganize lead detail into review, action, source, activity, and custom-field surfaces.
- [ ] Move workspace custom field definitions out of selected-lead detail if confirmed.
- [ ] Redesign calendar as a compact schedule board while preserving scope/date params.
- [ ] Preserve ingestion, lead review, lead editing, statuses, follow-ups, custom fields, calendar, assistant, and audit behavior
- [ ] Keep domain logic and API contracts stable unless a specific redesign task requires a small change
- [ ] Split repeated or complex dashboard UI into components
- [ ] Ensure desktop and mobile layouts do not clip or overlap text
- [ ] Apply Modern Web Guidance accessibility, form, table, focus, and containment guidance.

## Verification

- [ ] Run `npm run check`
- [ ] Manually verify pasted text creates a draft lead using a test-safe name
- [ ] Manually verify lead edit and status change flows
- [ ] Manually verify follow-up create, update, and complete flows
- [ ] Manually verify custom fields remain usable
- [ ] Manually verify calendar items link back to lead detail
- [ ] Manually verify assistant search and mutation preview still work
- [ ] Start the local app for direct browser review
- [ ] Handle visual issues through discussion plus targeted iteration or rollback

# Tasks: Dashboard Redesign

Status: active. Planning is complete; implementation should use the Service Ops Console direction only.

## Planning

- [x] Confirm this spec is active in `.kiro/specs/README.md`
- [x] Treat `.design-variants` artifacts as deprecated; do not use the CLI workflow for this session.
- [x] Use `Service Ops Console` as the only redesign direction; do not generate alternate variants.
- [x] Use `frontend-design` during implementation.
- [x] Use comparable product references only for patterns that support the Service Ops Console direction.
- [x] Confirm whether `/` remains the lead workspace or redirects to `/leads`.
- [x] Confirm whether lead detail gets a dedicated route, inspector, or both.
- [x] Confirm whether custom field definitions move to `/settings/fields`.

Planning decisions:

- `/` remains the primary lead workspace for this redesign. Do not redirect it to `/leads` in the first implementation slice.
- Lead detail should use both a desktop inspector for queue work and a dedicated `/leads/[leadId]` route for mobile, deep links, and focused review/editing.
- Custom field definitions move to `/settings/fields`; selected-lead detail keeps custom field values only.

## Manual Redesign

- [x] Apply the Service Ops Console direction to the main app.
- [x] Add or update shared app shell, navigation, command bar, and responsive layout tokens.
- [x] Rework the lead workspace into queue/filter rail, dense lead ledger, and selected-lead inspector.
- [x] Move ingestion into a drawer/sheet and optional focused route.
- [x] Reorganize lead detail into review, action, source, activity, and custom-field surfaces.
- [x] Move workspace custom field definitions out of selected-lead detail if confirmed.
- [x] Redesign calendar as a compact schedule board while preserving scope/date params.
- [x] Preserve ingestion, lead review, lead editing, statuses, follow-ups, custom fields, calendar, assistant, and audit behavior
- [x] Keep domain logic and API contracts stable unless a specific redesign task requires a small change
- [x] Split repeated or complex dashboard UI into components
- [x] Ensure desktop and mobile layouts do not clip or overlap text
- [x] Apply Modern Web Guidance accessibility, form, table, focus, and containment guidance.

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

# Phase 1: Publishable Lead Review Flow - Pattern Map

## PATTERN MAPPING COMPLETE

## Files And Roles

| File | Role | Closest Existing Pattern |
|------|------|--------------------------|
| `src/lib/db/seed.ts` | Demo data creation and reset | Existing workspace/contact/lead/follow-up/event insert sequence |
| `app/page.tsx` | Primary dashboard route and selected lead data loader | Existing server component query composition |
| `src/components/dashboard/lead-workspace.tsx` | Console ledger, filters, metrics, preview content | Existing ops panel and table patterns |
| `src/components/dashboard/lead-preview-dialog.tsx` | Closeable preview surface | Existing URL-backed native dialog |
| `app/globals.css` | Responsive/dark-mode/preview styling | Existing `ops-*` utility classes and CSS variables |

## Concrete Patterns

### Seed Data

- The seed reset deletes the workspace by slug: `software-services-demo`.
- Source definitions are created before contacts/leads and use slug/label/preset/sort fields.
- Contacts, ingestion events, leads, custom field definitions, custom field values, follow-ups, and lead events are inserted through Drizzle and linked by returned IDs.
- Existing dates are explicit UTC `Date` instances. Phase 1 should preserve deterministic dates through a shared anchor helper.

### Dashboard Route

- `app/page.tsx` derives active source options from `getWorkspaceSourceDefinitions()`.
- `leadId` in search params controls preview loading.
- Invalid or absent `leadId` should not break rendering; current logic already guards with `isUuid()`.
- `AppShell` receives `assistantEnabled`, `assistantContext`, source options, and `showNewIntake`.

### UI Surface

- The console uses `ops-*` CSS classes from `app/globals.css`.
- Status badges and lead display primitives live in `src/components/dashboard/lead-ui.tsx`.
- Existing controls use lucide icons and small local UI primitives.
- Dense mode and theme persistence already exist; Phase 1 should verify them rather than replace them.

## Planning Notes

- Plans should read the relevant current files before edits because `app/page.tsx` and `lead-workspace.tsx` are broad composition points.
- Avoid schema changes unless seed data uncovers a proven blocker; source definitions already exist.
- Avoid adding committed Playwright infrastructure unless manual browser verification proves repeatable checks are worth codifying in this phase.

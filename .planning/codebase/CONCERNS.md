---
title: Codebase Concerns
last_updated: 2026-06-11
last_mapped_commit: d765866c077abdc06993b4c601ac1106e0f87bbf
scope: technical debt, security, fragility, active-spec gaps
---

# Codebase Concerns

## 1. Demo-scoped workspace handling is still hard-coded

Severity: high

- Domain and assistant logic still center on `software-services-demo`
- The app is safe as a portfolio demo, but not ready for real multi-workspace usage
- Any future auth/workspace rollout needs a shared server-side workspace context boundary

Key files:

- `src/lib/domain/leads/ingest-lead.ts`
- `src/lib/domain/sources/manage-sources.ts`
- `src/lib/assistant/tools/leads.ts`
- `src/lib/db/seed.ts`

## 2. Mutation routes are unauthenticated

Severity: high

- `app/api/ingest/route.ts`
- `app/api/leads/[leadId]/route.ts`
- `app/api/followups/[followUpId]/route.ts`
- `app/api/sources/**`
- `app/api/custom-fields/**`

There is no auth, permission, or CSRF boundary. That is acceptable for a controlled demo, not for pilot traffic.

## 3. Assistant approval is UI-mediated more than server-enforced

Severity: medium

- The prompt and popup require preview then approval
- `useHumanInTheLoop` provides the approval UX
- Server-side apply still hinges on preview state rather than a stronger persisted approval token/state

Key files:

- `app/api/copilotkit/route.ts`
- `src/components/assistant/assistant-panel.tsx`
- `src/lib/assistant/tools/leads.ts`

## 4. Read paths are convenient for demo scale, not for larger datasets

Severity: medium

- Dashboard and calendar pages load broad datasets
- Calendar loads all items, then filters to range in memory
- Global search works on already-loaded client data

Key files:

- `app/page.tsx`
- `app/calendar/page.tsx`
- `src/lib/domain/calendar/get-calendar-items.ts`
- `src/components/dashboard/global-lead-search.tsx`

## 5. Raw source text is stored and exposed without retention/redaction policy

Severity: medium

- Ingestion keeps raw and normalized text
- Lead detail surfaces and assistant tools can expose that source text
- Fine for demo content, risky for real customer data

Key files:

- `src/lib/domain/leads/ingest-lead.ts`
- `app/leads/[leadId]/page.tsx`
- `src/lib/assistant/tools/leads.ts`

## 6. Source labels are flexible enough to drift from managed definitions

Severity: medium

- Lead and contact source fields are text
- Source definitions are managed separately
- This supports demo flexibility, but lets stored values drift from active settings metadata

Key files:

- `src/lib/db/schema.ts`
- `src/lib/domain/leads/update-lead.ts`
- `src/lib/domain/sources/manage-sources.ts`

## 7. Verification coverage is behind the active UX surface

Severity: low

- Domain tests exist
- End-to-end UX verification is still mostly documented/manual
- No committed Playwright suite covers preview dialogs, settings persistence, search overlay, dense mode, or dark mode

Key files:

- `.kiro/specs/lead-workflow-ux-upgrade/tasks.md`
- `src/components/dashboard/**`
- `src/components/settings/**`

## 8. Steering docs lag behind the real repo

Severity: low

- `.kiro/steering/structure.md` still says the repo is planning-only
- Current codebase is a fully implemented app
- Mapping and future planning should trust code plus active spec over that stale statement

# Pre-Implementation Cleanup

Status: resolved in planning docs before app scaffold. Keep this file as cleanup history and review reference.

This checklist must be resolved before scaffolding the app or starting Slice 1.

## 1. Remove Hardcoded Active Spec References

Problem:

- `AGENTS.md` points directly to `mvp-lead-ops-demo`.
- This conflicts with active spec rotation.

Fix:

- Make `AGENTS.md` tell agents to read `.kiro/specs/README.md` first.
- Agents should then read whichever spec is marked active there.
- Do not hardcode active spec paths in long-lived agent instructions.

## 2. Clarify Contact vs Lead vs Calendar Item

Problem:

- Repeated interactions with the same person are ambiguous.
- Calendar items can be confused with leads.

Decision to encode:

- `Contact` / `Client` = person or company.
- `Lead` = specific request, job, project, deal, or service opportunity.
- `CalendarItem` = scheduled or historical event related to a lead/contact.

Relationship:

```txt
Contact
  -> has many Leads
  -> has many CalendarItems

Lead
  -> belongs to Contact
  -> has many CalendarItems
  -> has many FollowUps
  -> has many Activities
```

Rules:

- Same person, same ongoing request = one `Contact`, one `Lead`, many `CalendarItems` / `Activities`.
- Same person, new request later = one `Contact`, new `Lead`.
- First contact should create or link a `Contact`, create a `Lead`, and create a `CalendarItem` if there was a call, meeting, appointment, or scheduled slot.
- Repeated contact should create a new `CalendarItem` / `Activity`; it creates a new `Lead` only if the request is distinct.

Examples:

- Laptop repair client calls about one laptop, then has a follow-up call: one `Contact`, one `Lead`, multiple `CalendarItems`.
- Same laptop repair client returns months later with a different device: one `Contact`, two `Leads`.
- Upwork client has discovery call, proposal follow-up, and project kickoff: one `Contact`, one `Lead`, multiple `CalendarItems`.
- Same Upwork client returns with a new project later: same `Contact`, new `Lead`.

## 3. Calendar Event for First and Repeated Interactions

Question:

- Should first and repeated client interactions be fixed in the calendar as separate events?

Decision:

- Yes.
- Any meaningful time-bound interaction should be represented as a separate calendar event or derived calendar item.

MVP rule:

- A call, appointment, scheduled meeting, follow-up due time, completed service date, or project call can produce a `CalendarItem`.
- Calendar items should link back to the related `Lead` and, when available, `Contact`.
- Calendar items are not leads.

Initial implementation preference:

- Use a derived read model for calendar display where possible.
- Store explicit calendar-like fields first: `scheduledAt`, `completedAt`, `followUpDueAt`, plus event metadata if needed.
- Add a dedicated `calendar_items` table only if the UI needs directly editable standalone events.

## 4. Fix Availability Wording

Problem:

- The assistant may overclaim availability.
- Without external Google/Apple Calendar sync, the system does not know the user's full real calendar.

Fix:

- Assistant answers must say: "Based on this dashboard..." or equivalent.
- Example: "Based on your lead dashboard, that time looks free."
- If working hours, duration, timezone, or external calendar context is missing, the assistant must ask for clarification.

## 5. Remove External Calendar Sync from MVP Optional Scope

Problem:

- External calendar sync is currently listed as optional, but full Google/Apple integration is out of scope.
- This can cause scope creep into OAuth and external provider edge cases.

Fix:

- Move external calendar sync to post-MVP / deferred specs.
- Keep MVP calendar internal only.

## 6. Split Demo Core from Later MVP

Problem:

- Current MVP scope includes too much for the first build.

Recommended split:

Demo Core:

- pasted text/transcript input
- seeded workspace
- one vertical template
- mock/deterministic extraction
- draft lead creation
- lead list
- lead detail
- review/edit
- status
- follow-up
- basic audit/activity

Later MVP:

- custom fields
- calendar view
- assistant search
- assistant calendar awareness
- assistant mutations with preview
- live LLM extraction
- Telegram intake
- audio upload/transcription

## 7. Choose One First Template

Problem:

- Three templates are useful, but risky for the first slice.

Fix:

- Pick one first template for implementation.
- Recommended first template: `software services`, because the creator can dogfood it immediately with LinkedIn and Upwork leads.
- Add laptop repair and beauty services as demo templates after the core loop works.

## 8. Decide Auth Strategy

Problem:

- Workspace-scoped leads are in scope, but auth is still undecided.

Recommended decision:

- First demo uses seeded workspace and fake user.
- Real auth is deferred until after the core flow is stable.

## 9. Decide Extractor Strategy

Problem:

- Live LLM extraction is not required to prove the workflow and can destabilize the first slice.

Recommended decision:

- Slice 1 uses a mock/deterministic extractor behind an interface.
- Live LLM extraction is added later without changing the review flow.

## 10. Define Initial Status Lifecycle

Problem:

- Calendar colors, filters, assistant answers, and lead lifecycle all depend on statuses.

Recommended initial statuses:

- `new`
- `needs_review`
- `contacted`
- `scheduled`
- `in_progress`
- `won`
- `lost`

Cleanup needed:

- Define status labels, colors, allowed transitions, and which statuses appear on the calendar.

## 11. Resolve Basic Metrics Scope

Problem:

- Basic dashboard metrics are in scope, but no implementation tasks exist.

Fix options:

- Add a small metrics task after Slice 3.
- Or remove metrics from MVP scope and defer them.

Recommended:

- Keep only simple counts for demo: total leads, needs review, scheduled, won/lost, overdue follow-ups.

## 12. Create Wave 1 Docs Before Scaffold

Before app scaffold, create:

- `docs/00-meta/00-project-overview.md`
- `docs/10-product/13-mvp-scope.md`
- `docs/20-domain/20-domain-model.md`

These docs should include:

- Demo Core vs Later MVP split
- Contact / Lead / CalendarItem distinction
- first template decision
- auth decision
- extractor decision
- status lifecycle draft
- calendar availability wording

## 13. Update Active Spec Tasks After Cleanup

After the above decisions:

- Update `.kiro/specs/mvp-lead-ops-demo/requirements.md`.
- Update `.kiro/specs/mvp-lead-ops-demo/design.md`.
- Update `.kiro/specs/mvp-lead-ops-demo/tasks.md`.
- Keep tasks aligned with the reduced Demo Core.

Do not scaffold until this cleanup is complete.

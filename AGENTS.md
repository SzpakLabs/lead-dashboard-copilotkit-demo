# Agent Instructions

## Read Order

Before planning or implementation, read these files in order:

1. `.kiro/steering/product.md`
2. `.kiro/steering/tech.md`
3. `.kiro/steering/structure.md`
4. `.kiro/specs/README.md`
5. The spec files for whichever spec is marked active in `.kiro/specs/README.md`

## Steering

Steering files are the source of durable project rules:

- Product direction: `.kiro/steering/product.md`
- Technical direction: `.kiro/steering/tech.md`
- Repository and documentation structure: `.kiro/steering/structure.md`

Follow steering unless the user explicitly changes direction.

## Specs

Use `.kiro/specs/README.md` to identify the active spec.

Only the active spec should drive the first implementation session. Deferred specs are context only unless the user explicitly activates them.

## Active Spec Rotation

When the active spec is completed:

- Update `.kiro/specs/README.md`.
- Move the completed spec out of `Active Spec` into a completed/history section.
- Promote the next user-approved spec to `Active Spec`, or mark that there is no active spec.
- Do not leave `mvp-lead-ops-demo` marked as active after it is done.
- Do not start work on a deferred spec until the user explicitly confirms it as active.

## Workflow

- Keep changes scoped to one task/session.
- Ask clarifying questions before large changes.
- Do not implement before checking the active spec.
- Update relevant steering/spec/docs when a product or architecture decision changes.
- Keep `/docs` minimal and add files only when needed for the next implementation slice.
- Treat content/article milestones as optional delivery artifacts, not blockers.

## Test Data

When testing forms, chats, assistant flows, browser interactions, or documentation examples, person names must include `Test`.

Allowed examples:

- `Juan Test`
- `Carlos Test`
- `Test User`
- `Maria Test`

## GSD Project Context

- Project context lives in `.planning/PROJECT.md`.
- Requirements live in `.planning/REQUIREMENTS.md`.
- Phase structure lives in `.planning/ROADMAP.md`.
- Current state lives in `.planning/STATE.md`.
- Codebase maps live in `.planning/codebase/`.

For GSD work, read the Kiro steering/spec files first, then read `.planning/STATE.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md`.

Current GSD focus: Phase 1 - Publishable Lead Review Flow.

Next command: `$gsd-plan-phase 1`.

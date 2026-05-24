# Tasks: Dashboard Redesign

Status: draft only. Do not implement until this spec is promoted to Active Spec.

## Planning

- [ ] Confirm this spec is active in `.kiro/specs/README.md`
- [ ] Read `/Users/macos/Documents/prjk/design-variants/README.md`
- [ ] Inspect existing `.design-variants/legacy` config, prompts, research, screenshots, and archived diffs
- [ ] Decide whether to reuse legacy Lazyweb research or run fresh research
- [ ] Decide initial variant count and variant directions

## Design Variants Setup

- [ ] Add or update local `design-variants` dev dependency from `/Users/macos/Documents/prjk/design-variants`
- [ ] Add current CLI scripts for init, research, generate, screenshots, stats, and restore
- [ ] Run `design-variants init` or migrate equivalent current `.design-variants/config.json`
- [ ] Preserve legacy artifacts under `.design-variants/legacy`
- [ ] Run a dry-run generation command to verify config paths, worktree directory, app path, and ports

## Variant Generation

- [ ] Run optional Lazyweb research, or record that existing research is reused
- [ ] Generate agreed dashboard redesign variants
- [ ] Build or verify each generated variant
- [ ] Capture desktop and mobile screenshots for each generated variant
- [ ] Run variant stats

## Selection

- [ ] Compare screenshots, workflow fit, changed files, and implementation risk
- [ ] Select one direction to apply to the main app
- [ ] Record rejected variant reasons briefly in the spec or a small docs note

## Adopted Redesign

- [ ] Apply selected redesign direction to the main app
- [ ] Preserve ingestion, lead review, lead editing, statuses, follow-ups, custom fields, calendar, assistant, and audit behavior
- [ ] Keep domain logic and API contracts stable unless a specific redesign task requires a small change
- [ ] Split repeated or complex dashboard UI into components
- [ ] Ensure desktop and mobile layouts do not clip or overlap text

## Verification

- [ ] Run `npm run check`
- [ ] Manually verify pasted text creates a draft lead using a test-safe name
- [ ] Manually verify lead edit and status change flows
- [ ] Manually verify follow-up create, update, and complete flows
- [ ] Manually verify custom fields remain usable
- [ ] Manually verify calendar items link back to lead detail
- [ ] Manually verify assistant search and mutation preview still work
- [ ] Capture final desktop and mobile screenshots

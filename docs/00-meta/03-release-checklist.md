# Release Checklist

## Local Fallback Release

- [ ] Run `npm run db:migrate`.
- [ ] Run `npm run db:reset-demo`.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Start the app with `npm run dev`.
- [ ] Smoke-check `/`, `/calendar`, and `/favicon.ico`.
- [ ] Confirm the presenter path starts on `/` and uses the seeded `software-services-demo` workspace.
- [ ] Confirm any screenshots or recording targets reflect current UI states.

## Public Deployment Release

- [ ] Explicit approval exists before any external deployment command is run.
- [ ] Hosting target is chosen for the current Next.js app.
- [ ] Required env var `DATABASE_URL` is configured.
- [ ] Optional assistant env vars are configured only if intentionally enabled.
- [ ] Assistant-off behavior is acceptable if credentials are absent.
- [ ] Production deployment command is prepared but not run without approval.
- [ ] Post-deploy smoke targets are `/`, `/calendar`, and `/favicon.ico`.

## Environment Safety

- [ ] Docs list env variable names only, never secret values.
- [ ] No screenshots expose connection strings, API keys, or local machine details that should stay private.
- [ ] Demo data remains test-safe and does not use realistic person names without `Test`.

## Portfolio Assets

- [ ] Root `README.md` explains the problem, solution, stack, setup, deployment notes, and limitations.
- [ ] `docs/00-meta/02-portfolio-demo-note.md` includes the outreach narrative and 60-second script.
- [ ] Screenshot inventory or capture targets are identified before sharing.

## Assistant Branches

- [ ] Assistant-disabled branch is documented and presentable.
- [ ] Assistant-configured branch is documented only as optional.
- [ ] Reports and forecasts are described as read-only proof surfaces, not guaranteed always-on behavior.

## Next Deployment Action

Once external deployment approval is granted, configure the approved hosting target with the safe environment variables, run the production deployment command for that target, then smoke-check `/`, `/calendar`, and `/favicon.ico` before sharing the public URL.

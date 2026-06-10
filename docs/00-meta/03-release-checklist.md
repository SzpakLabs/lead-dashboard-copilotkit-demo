# Release Checklist

## Public Demo Release

- [x] Public demo URL is live: `https://lead-dashboard-rosy.vercel.app/`
- [x] Smoke-check `/`, `/calendar`, and `/settings`.
- [x] Confirm the presenter path starts on `/`.
- [x] Confirm `New Intake` opens the `Create draft lead` flow.
- [x] Confirm source and input type controls work.
- [x] Confirm a Test-safe pasted request can create a draft lead without breaking the app.
- [x] Record the live post-submit state for draft creation.
- [x] Confirm no secret values appear in the live UI or repo docs checked in this phase.
- [x] Record whether lead preview or full detail was conclusively exercised in the live pass.
- [ ] Confirm any screenshots or recording targets reflect current UI states.
- [ ] Confirm `/settings` shows Workspace, Sources, Help, and About with honest non-admin framing.

## Local Development Path

- [ ] Run `npm run db:migrate`.
- [ ] Run `npm run db:reset-demo`.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Start the app with `npm run dev`.
- [ ] Smoke-check `/`, `/calendar`, and `/favicon.ico`.
- [ ] Confirm the seeded `software-services-demo` workspace is ready locally.

## Environment Safety

- [ ] Docs list env variable names only, never secret values.
- [ ] No screenshots expose connection strings, API keys, or local machine details that should stay private.
- [ ] Demo data remains test-safe and does not use realistic person names without `Test`.

## Portfolio Assets

- [ ] Root `README.md` explains the problem, solution, stack, setup, deployment notes, and limitations.
- [ ] `docs/00-meta/02-portfolio-demo-note.md` includes the outreach narrative and 60-second script.
- [ ] Root `README.md` shows the live public demo near the top.
- [ ] Screenshot inventory or capture targets are identified before sharing.
- [x] GitHub repo short description is set manually.
- [x] GitHub website URL is set to `https://lead-dashboard-rosy.vercel.app/`.
- [x] GitHub topics are set manually: `nextjs`, `typescript`, `postgresql`, `drizzle`, `tailwindcss`, `ai-dashboard`, `crm`, `lead-management`, `copilotkit`, `portfolio-demo`.

## Assistant Branches

- [ ] Assistant-disabled branch is documented and presentable.
- [ ] Assistant-configured branch is documented only as optional.
- [ ] Reports and forecasts are described as read-only proof surfaces, not guaranteed always-on behavior.
- [ ] Settings copy does not imply real LinkedIn, WhatsApp, phone, or other channel integrations.

## Manual GitHub Packaging

- [x] Set the GitHub repo short description manually.
- [x] Set the GitHub repo website URL to `https://lead-dashboard-rosy.vercel.app/`.
- [x] Set GitHub topics manually: `nextjs`, `typescript`, `postgresql`, `drizzle`, `tailwindcss`, `ai-dashboard`, `crm`, `lead-management`, `copilotkit`, `portfolio-demo`.

## Terminology

- Public demo / live demo: the hosted portfolio deployment
- Local development path: developer-only setup
- Self-hosted demo / standalone hosted demo: controlled hosted demo deployment
- Production SaaS: out of scope for this portfolio demo

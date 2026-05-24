# Design: Demo Readiness Fixes

## Current State

The MVP spec is complete and local checks pass. A quick readiness pass found practical demo issues:

- Local database contains old verification records mixed with curated seed records.
- CopilotKit requests `/api/copilotkit/threads?agentId=default` and receives 404 in dev.
- `/favicon.ico` is missing.
- Deployment readiness depends on database migration/seed and assistant environment setup.

## Approach

Keep this as an operational hardening slice, not a feature slice.

## Demo Data Reset

Add a dedicated script for demo reset, either:

- `db:reset-demo`: clears demo tables in dependency order, then runs the seed script.
- Or update `db:seed` to be idempotent and safe to rerun for `software-services-demo`.

Preferred behavior:

- Scope deletes to the seeded `software-services-demo` workspace when possible.
- Keep all seed names test-safe.
- Avoid generic destructive reset commands unless clearly named and documented.

## Assistant Runtime

Investigate the CopilotKit v2 runtime route shape before changing behavior.

Possible fixes:

- Configure the provider/runtime so thread endpoints are served correctly.
- Add any missing route handler required by CopilotKit.
- If credentials are missing, disable the visible assistant panel in that environment and show no broken console behavior.

Environment documentation should include:

- `DATABASE_URL`
- CopilotKit/model/provider variables required by the selected runtime
- Optional telemetry opt-out variable if desired

## Favicon

Add a small static `app/favicon.ico` or `public/favicon.ico`.

Use a simple branded mark that is acceptable for a portfolio demo. Do not spend time on logo design in this spec.

## Verification

Local verification:

- `npm run check`
- `npm run build`
- Reset and seed demo DB
- Open `/` and `/calendar`
- Browser console smoke check

Deployment verification:

- Configure env vars in Vercel
- Run migrations against deployed DB
- Run seed/reset against deployed demo DB
- Smoke check `/`, `/calendar`, and assistant behavior

## Risks

- A reset script can be destructive if pointed at the wrong database. Naming and documentation must make that clear.
- CopilotKit endpoint behavior may depend on installed package version. Verify against the local package/docs before patching.
- Assistant provider credentials may not be available in all demo contexts, so disabled-but-clean is acceptable.

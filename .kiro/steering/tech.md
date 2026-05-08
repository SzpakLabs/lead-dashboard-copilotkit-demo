---
inclusion: always
---

# Technology Steering

## Recommended Stack

Use one full-stack TypeScript repository for the MVP demo.

Recommended baseline:

- Next.js App Router
- React
- TypeScript strict mode
- CopilotKit for dashboard assistant UI and AG-UI integration
- Tailwind CSS
- shadcn/ui-style component primitives
- PostgreSQL
- Drizzle ORM
- Supabase for Postgres, auth, and storage, unless a later deployment choice favors Neon plus separate storage
- Zod for validation and assistant tool schemas
- OpenAI-compatible LLM and STT providers behind internal service wrappers
- Vercel hosting for the demo

## Rationale

CopilotKit's current developer path is React and Next.js oriented. A Next.js App Router app can host the dashboard, API routes, CopilotKit runtime endpoint, ingestion endpoints, and simple background-like operations without introducing a separate backend service at the start.

The MVP does not need a standalone backend repository. Route handlers, server actions, and domain services are enough until ingestion volume, queueing, or external integrations justify extraction.

## Deployment Model

- Vercel hosts the Next.js dashboard, API routes, and CopilotKit runtime route.
- Supabase hosts PostgreSQL, auth, and object storage.
- The app connects to Supabase through environment variables configured locally and in Vercel.
- Do not self-host PostgreSQL for the MVP unless Supabase becomes a blocker.
- If Supabase is not used, the fallback is Neon for PostgreSQL plus separate auth and storage choices.

## CopilotKit Integration Direction

Use CopilotKit inside the dashboard, not as the starting point of the whole architecture.

Expected app integration:

- `app/api/copilotkit/route.ts` hosts the CopilotKit runtime endpoint.
- The dashboard layout wraps relevant routes in the CopilotKit provider.
- The assistant uses a side panel or inline chat panel in the dashboard.
- Mutative assistant capabilities call typed domain actions.
- Approval/preview interactions use CopilotKit human-in-the-loop or a custom preview component.

For the Nuxt laptop-repair website, do not assume CopilotKit can be embedded natively. Prefer a simpler React widget iframe, a dedicated lead-capture endpoint, or a minimal custom chat component that sends structured events into this system.

## Data Layer

Use PostgreSQL as the source of truth.

Core tables should start around:

- workspaces
- users
- leads
- contacts
- conversations
- calls
- transcripts
- recordings
- custom_field_definitions
- custom_field_values
- followups
- lead_events
- assistant_action_logs
- ingestion_events

All writes should go through domain functions, not direct component-level DB calls.

## AI and Ingestion

All sources should normalize through a single pipeline:

1. input received
2. ingestion event stored
3. text/transcript normalized
4. structured extraction runs
5. draft lead or lead update proposal is created
6. user reviews if needed
7. mutation is applied through domain action
8. audit event is stored

AI extraction must prefer missing/null values over invented values.

## Safety Constraints

- Do not let an LLM mutate the database directly.
- Every assistant tool must have a typed input schema and explicit permission check.
- Every mutation must produce an audit event.
- Assistant changes must be previewed before apply in the MVP.
- Transcripts and recordings are source artifacts and should not be edited as normal lead fields.
- Test data entered into forms, chats, or browser tests must include `Test` in person names.

## Deferred Technical Choices

- Queue provider for production ingestion
- Telephony provider
- iPhone call recording workflow
- Analytics warehouse
- CRM export/sync
- Dedicated backend service

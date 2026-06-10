Phase 4 brief: Workspace Settings, Help, And Release Metadata

Goal

Make `/settings` feel useful in the live portfolio demo without turning it into a production admin surface.

Context

- Live demo: `https://lead-dashboard-rosy.vercel.app/`
- Keep Settings and expand it minimally.
- Prioritize demo clarity, business value, and honest release metadata.

In scope

1. Workspace profile

- Workspace name
- Business type
- Timezone
- Currency
- Demo mode label

2. Sources

- Keep existing source definitions
- Clarify these are source-labeled intake surfaces, not real external integrations

3. Calendar settings

- Working hours
- Default follow-up window
- Reminder and follow-up defaults

4. Assistant settings

- Enabled/disabled status
- Safe model/provider label if available
- No secrets
- Explain assistant is optional

5. Help / FAQ

- What the demo shows
- What is real
- What is mocked or deferred
- How to run the main demo flow
- Business-friendly wording first

6. Business value / positioning

- Explain value for small service businesses, operators, founders, and managers
- Lead with workflow outcomes, not stack details
- Good themes:
  - messy inbound requests become structured leads
  - fewer lost leads
  - clearer follow-up ownership
  - faster review of new opportunities
  - easier prioritization by budget, urgency, source, and next step
  - better visibility into pipeline and calendar workload
  - human-in-the-loop review instead of blind automation
  - optional assistant/reporting support
- Tech should be secondary, only as implementation context

Example positioning

“This demo shows how a small service business could turn scattered inbound messages, call notes, and client requests into a structured lead workflow. Instead of losing context across chats, spreadsheets, and memory, the team gets a reviewable pipeline with source, budget, urgency, next step, follow-up context, and calendar visibility. The assistant is optional and supports the operator, but the human stays in control.”

Secondary technology wording:

“Built with Next.js, TypeScript, PostgreSQL/Drizzle, Tailwind, and CopilotKit-style assistant UI patterns to demonstrate how modern AI-assisted dashboards can support real business operations.”

7. About / Release

- Live demo URL
- GitHub repo URL placeholder or configurable text
- Demo version
- Release date
- Changelog summary

8. Developer / contact

- Developer name
- GitHub / LinkedIn / website / email placeholders or safe fields

9. Data section

- Mention possible future export/import
- Do not implement real import/export unless trivial
- Optional disabled future-state actions are acceptable

Constraints

- No auth, billing, production permissions, or real multi-tenant admin
- No real external integrations
- No secrets
- No fake claims
- Keep it portfolio-demo honest
- All example person names must include `Test`
- Prefer small UI/data additions over backend-heavy work
- Copy should work for business readers first, technical readers second

Avoid

- Leading with raw tech lists
- Overclaiming production readiness
- Claiming integrations that do not exist
- Vague AI hype without concrete workflow value

Planning split

- Now: minimal demo-safe Settings improvements
- Later: optional future settings/features

Verification

- `/settings` loads
- New sections render
- Help/business-value copy is understandable to non-technical readers
- Tech mentions stay secondary
- No secrets exposed
- Demo wording stays honest
- Source-labeled intake is not presented as real integration
- Main demo flow remains unchanged

---

Additional scope clarification for the current Phase 4 discussion.

I want GSD to decide whether the assistant-related work should stay as a small part of Phase 4 or be split into a separate Phase 5.

Important:
Do not automatically pack everything into Phase 4 if it makes the phase too large or mixes concerns.

Preferred split:

Phase 4 should focus on:

- /settings as a lightweight settings hub;
- Workspace, Sources, Help, About sections;
- Workspace settings stored in localStorage;
- Reset demo defaults by clearing the local settings namespace;
- Help/business-value copy for non-technical business readers;
- About/release/developer metadata;
- clear wording about what is real, mocked, optional, or deferred;
- no fake production admin, no auth, no billing, no real integrations.

Manual Phase 4 follow-up:

- Add a manual Supabase hardening task:
  - verify RLS is enabled for exposed public/demo tables;
  - verify anonymous/public clients cannot insert, update, or delete shared demo data;
  - keep the public demo DB effectively read-only from the browser unless a specific safe server-side write path is intentionally required.

Potential Phase 5:
Assistant Demo Controls And Response Components

This may deserve a separate phase because it is more than simple Settings polish.

Potential Phase 5 scope:

1. Assistant demo controls

- preset command chips;
- optional free-text input toggle;
- preset-only demo mode if useful;
- per-browser assistant usage limit via localStorage;
- after the limit is reached, do not call the real assistant/AI runtime;
- rotate predefined fallback responses;
- one fallback response should suggest contacting Artem Litvinko via GitHub/LinkedIn for a tailored version;
- clearly label this as demo guardrail, not production-grade rate limiting.

2. Assistant response components / Generative UI
   The assistant should avoid walls of text when referring to dashboard entities.

Desired behavior:

- lead-related answer -> compact lead row/card similar to the dashboard table;
- calendar-related answer -> compact calendar event card/block;
- reports/forecast/risk answer -> readable summary component, metric card, risk list, or small table;
- business-value answer -> readable value card;
- preset commands should intentionally demonstrate these visual response components.

Possible minimal component set:

- AssistantLeadCard
- AssistantCalendarCard
- AssistantSummaryCard

Interaction rules:

- interactive actions are allowed only if safe and trivial:
  - navigate to /
  - navigate to /calendar
  - open/select existing lead only if the current app already has a reliable route/state pattern

- no destructive actions;
- no real external sends;
- no fake “email sent” or “meeting booked” claims;
- no hidden mutations.

CopilotKit note:
Use the existing CopilotKit/prebuilt chat setup if possible. Prefer slots, labels, suggestion UI, or custom tool/UI rendering patterns if the current project already supports them. Do not rewrite the whole assistant system.

Decision request:
Please evaluate whether:
A. Phase 4 can include a very small assistant settings/copy note only, and assistant UI work should become Phase 5;
or
B. a tiny subset of assistant controls can fit into Phase 4 without expanding scope, while response components become Phase 5;
or
C. all assistant work should be deferred to Phase 5.

My preference:
Keep Phase 4 focused and shippable. If assistant controls/components require meaningful UI work beyond settings copy, split them into Phase 5.

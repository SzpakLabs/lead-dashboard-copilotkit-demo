---
inclusion: always
---

# Product Steering

## Product

The product is a lead operations layer for small service businesses that currently track leads in memory, spreadsheets, chats, or underused CRM tools.

It captures unstructured lead information from calls, pasted conversations, voice notes, bot messages, manual entry, and later scheduled external sources. The system turns that input into structured lead records, asks the user to review uncertain data, and keeps leads actionable through statuses, custom fields, follow-ups, and an AI assistant.

## Primary Users

- Solo service business owner
- Owner-operator who handles calls and delivery
- Lightweight assistant or manager in a small team

Initial pilot contexts:

- Laptop and electronics repair business
- Makeup / beauty service business

## Positioning

This is not a universal CRM. The MVP positioning is:

**AI-assisted lead operations for service businesses that live on calls and chats.**

The core promise is:

**Every customer interaction can become a structured, searchable, follow-up-ready lead with minimal manual entry.**

## MVP Goal

Build a portfolio-ready demo that can later become a pilot for two real businesses.

The demo must prove the core loop:

1. unstructured input is received
2. structured lead draft is created
3. user reviews or confirms extracted data
4. lead is visible in a dashboard
5. status and follow-up can be managed
6. assistant can search and propose safe edits

## MVP Scope

In scope:

- Workspace-scoped leads
- Manual lead creation
- Text/transcript ingestion into draft leads
- Review and confirmation flow
- Lead list and lead detail
- Statuses and follow-ups
- Calendar view for completed and upcoming lead-related work
- Workspace custom fields
- Basic dashboard metrics
- CopilotKit assistant in the dashboard
- Assistant action previews before mutation
- Audit log for important changes

Optional if easy:

- Telegram text or voice-note intake
- Recording upload for demo transcription
- Saved filters
- External calendar sync

Out of scope for MVP:

- Full omnichannel inbox
- Full CRM replacement
- Kanban-first workflow
- Production telephony API integration
- Native SMS/iMessage ingestion
- Full Google/Apple calendar integration
- Complex analytics/reporting
- Billing
- Enterprise permissions
- Multi-product marketplace

## Product Rules

- Lead is the primary operational entity.
- Every input path must normalize into the same ingestion pipeline.
- Assistant actions must use explicit typed tools, not freeform database access.
- Mutations proposed by the assistant must show a preview and wait for confirmation unless explicitly classified as safe and reversible.
- Source artifacts such as transcripts and recordings should remain traceable.
- Custom fields are workspace-scoped and must not break existing leads.
- Calendar availability should be computed from lead-related scheduled work before adding external calendar sync.
- Avoid starting with AG-UI visuals before domain model, workflows, action contracts, and audit rules are stable.

## Open Product Questions

- Which initial demo input should be first: pasted transcript, uploaded recording, or Telegram message?
- Which pilot should drive the first vertical template: laptop repair or beauty services?
- What is the minimal acceptable confirmation UX for assistant edits?
- Does the demo require auth, or can it start with a seeded demo workspace?
- Which iPhone call recording path is legally and technically viable for pilots?

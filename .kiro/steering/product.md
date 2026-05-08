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
- Software development / freelance services pipeline for the product creator

## Positioning

This is not a universal CRM. The MVP positioning is:

**AI-assisted lead operations for service businesses that live on calls and chats.**

The core promise is:

**Every customer interaction can become a structured, searchable, follow-up-ready lead with minimal manual entry.**

## MVP Goal

Build a portfolio-ready demo that can later become a pilot for real service businesses and be used by the creator to manage software development leads from LinkedIn and Upwork.

The first implementation target is Demo Core, not the full MVP. Demo Core must prove the core loop:

1. unstructured input is received
2. structured lead draft is created
3. user reviews or confirms extracted data
4. lead is visible in a dashboard
5. status and follow-up can be managed
6. basic audit/activity is visible

The first vertical template is software services, because the creator can dogfood it immediately with LinkedIn and Upwork leads.

## Demo Core Scope

In scope:

- Workspace-scoped leads
- Seeded workspace and fake user
- Software services vertical template
- Pasted text/transcript ingestion into draft leads
- Mock/deterministic extraction behind an interface
- Review and confirmation flow
- Lead list and lead detail
- Statuses and follow-ups
- Basic audit/activity
- Simple metrics

Later MVP:

- Manual lead creation
- Workspace custom fields
- Calendar view for completed and upcoming lead-related work
- Internal calendar availability checks
- CopilotKit assistant in the dashboard
- Assistant search and display
- Assistant action previews before mutation
- Live LLM extraction
- Laptop repair and beauty services templates
- Telegram text or voice-note intake
- Recording upload for demo transcription
- Saved filters

Out of scope for MVP:

- Full omnichannel inbox
- Full CRM replacement
- Kanban-first workflow
- Production telephony API integration
- Native SMS/iMessage ingestion
- Full Google/Apple calendar integration
- External calendar sync
- Complex analytics/reporting
- Billing
- Enterprise permissions
- Multi-product marketplace

## Product Rules

- Lead is the primary operational entity.
- Contact/client is the person or company. A contact can have many leads.
- Lead is one specific request, job, project, deal, or service opportunity.
- Calendar items are scheduled or historical events related to contacts and leads; they are not leads.
- Same person with the same ongoing request means one contact, one lead, and many calendar items or activities.
- Same person with a new request later means one contact and a new lead.
- Every input path must normalize into the same ingestion pipeline.
- Assistant actions must use explicit typed tools, not freeform database access.
- Mutations proposed by the assistant must show a preview and wait for confirmation unless explicitly classified as safe and reversible.
- Source artifacts such as transcripts and recordings should remain traceable.
- Custom fields are workspace-scoped and must not break existing leads.
- Calendar availability should be computed from internal lead-related scheduled work. Assistant answers must be framed as "Based on this dashboard..." until external calendar sync exists.
- Avoid starting with AG-UI visuals before domain model, workflows, action contracts, and audit rules are stable.

## Open Product Questions

- What is the minimal acceptable confirmation UX for assistant edits?
- Which iPhone call recording path is legally and technically viable for pilots?

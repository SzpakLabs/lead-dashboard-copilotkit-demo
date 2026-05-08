# Requirements: MVP Lead Ops Demo

## Overview

Build a portfolio-ready lead operations demo for small service businesses. The first implementation target is Demo Core: pasted text/transcript input, deterministic extraction, draft lead review, lead operations, follow-ups, and basic audit/activity.

The first vertical template is the creator's software development / freelance services pipeline sourced from LinkedIn and Upwork. Laptop repair and beauty services remain later demo templates.

## Requirement 1: Contact, Lead, and Calendar Item Model

WHEN a lead is created manually or from ingestion
THE SYSTEM SHALL create a workspace-scoped lead with status, source, timestamps, and optional contact details.

WHEN the same person has multiple distinct requests
THE SYSTEM SHALL model them as one contact with multiple leads.

WHEN the same person has repeated interactions for the same request
THE SYSTEM SHALL model them as one contact, one lead, and multiple activities or calendar-like events.

WHEN a time-bound interaction exists
THE SYSTEM SHALL represent it as a calendar item or derived calendar item linked to the related lead and contact when available.

WHEN a lead is displayed
THE SYSTEM SHALL show standard fields, follow-ups, activity history, and linked source artifacts when present.

## Requirement 2: Normalized Ingestion

WHEN the system receives pasted text, pasted conversation, or pasted transcript
THE SYSTEM SHALL store an ingestion event and normalize the input into a common processing format.

WHEN extraction runs on normalized input
THE SYSTEM SHALL use a mock or deterministic extractor behind an extraction interface and produce a draft lead with confidence and missing-field markers.

## Requirement 3: Human Review

WHEN extracted data is incomplete, ambiguous, or low confidence
THE SYSTEM SHALL mark the lead or proposal as needing review.

WHEN the user reviews a draft
THE SYSTEM SHALL allow the user to confirm, edit, or reject the extracted data before it becomes operational lead data.

## Requirement 4: Dashboard Operations

WHEN a user opens the dashboard
THE SYSTEM SHALL provide a lead list with search, filtering, sorting, and status visibility.

WHEN a user opens one lead
THE SYSTEM SHALL provide a detail view for editing lead fields, viewing source context, changing status, and managing follow-ups.

## Requirement 5: Status Lifecycle

WHEN a lead status is shown or changed
THE SYSTEM SHALL use the initial lifecycle: `new`, `needs_review`, `contacted`, `scheduled`, `in_progress`, `won`, `lost`.

WHEN statuses are displayed
THE SYSTEM SHALL use stable labels and colors: New gray, Needs review amber, Contacted blue, Scheduled violet, In progress cyan, Won green, Lost red.

WHEN a user changes status
THE SYSTEM SHALL apply an allowed transition or show a validation error.

WHEN allowed transitions are checked
THE SYSTEM SHALL use the lifecycle rules documented in `docs/20-domain/20-domain-model.md`.

## Requirement 6: Follow-Ups

WHEN a user creates a follow-up
THE SYSTEM SHALL store due time, note, completion state, lead link, and audit/activity event.

WHEN follow-ups are displayed
THE SYSTEM SHALL show due and overdue follow-ups for the selected lead and in the dashboard summary.

## Requirement 7: Basic Metrics

WHEN the dashboard loads
THE SYSTEM SHALL show simple counts for total leads, needs review, scheduled, won/lost, and overdue follow-ups.

## Requirement 8: Internal Calendar Rules for Later MVP

WHEN a lead has a scheduled time, follow-up due time, appointment time, or completed time
THE SYSTEM SHALL make it visible in a later calendar view.

WHEN calendar items are displayed
THE SYSTEM SHALL color-code them by lead status.

WHEN a user asks whether a date/time is free
THE SYSTEM SHALL allow the later assistant to check internal lead-related calendar items and answer with wording equivalent to "Based on this dashboard..."

WHEN availability cannot be determined because working hours, duration, timezone, or external calendar context is missing
THE SYSTEM SHALL ask for clarification instead of guessing.

## Requirement 9: Later Assistant and Custom Fields

WHEN assistant features are added
THE SYSTEM SHALL use typed tools, preview mutating actions, and log assistant action lifecycle.

WHEN custom fields are added
THE SYSTEM SHALL store workspace-scoped custom field definitions and lead values without changing the base lead schema.

## Requirement 10: Auditability

WHEN lead data, status, or follow-up data changes
THE SYSTEM SHALL write an audit/activity event with actor, action type, target, timestamp, and before/after data where applicable.

## Requirement 11: Demo Constraints

WHEN implementation starts
THE SYSTEM SHALL use a single repository and avoid a separate backend service unless a spec explicitly changes that decision.

WHEN implementation starts
THE SYSTEM SHALL use a seeded workspace and fake user instead of real auth.

WHEN test data is entered into any form, chat, or browser test
THE SYSTEM SHALL include `Test` in person names.

## Non-Goals

- Production telephony integration
- Full CRM replacement
- Kanban-first workflow
- Autonomous irreversible assistant actions
- CopilotKit assistant in Demo Core
- Live LLM extraction in Demo Core
- Custom fields in Demo Core
- Calendar UI in Demo Core
- Billing
- Enterprise multi-tenant administration
- Native iPhone SMS/iMessage ingestion
- Full external Google/Apple calendar sync
- External calendar sync
- Full reporting suite

## Open Questions

- What recording source is realistic for iPhone calls?
- Should the assistant preview be global in chat or embedded near the affected lead form?
- What are default working hours and appointment duration for later availability checks?

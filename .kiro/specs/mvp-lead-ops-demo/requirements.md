# Requirements: MVP Lead Ops Demo

## Overview

Build a portfolio-ready lead operations demo for small service businesses. The demo must show the core loop from unstructured input to structured lead management, with safe assistant-assisted search and edits.

The demo should support three realistic starting contexts: laptop repair, beauty services, and the creator's own software development / freelance services pipeline sourced from LinkedIn and Upwork.

## Requirement 1: Lead as Primary Entity

WHEN a lead is created manually or from ingestion
THE SYSTEM SHALL create a workspace-scoped lead with status, source, timestamps, and optional contact details.

WHEN a lead is displayed
THE SYSTEM SHALL show standard fields, custom fields, follow-ups, activity history, and linked source artifacts when present.

## Requirement 2: Normalized Ingestion

WHEN the system receives unstructured text, pasted conversation, transcript, or later bot input
THE SYSTEM SHALL store an ingestion event and normalize the input into a common processing format.

WHEN extraction runs on normalized input
THE SYSTEM SHALL produce a draft lead or lead update proposal with confidence and missing-field markers.

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

## Requirement 5: Custom Fields

WHEN a workspace needs business-specific fields
THE SYSTEM SHALL allow creating custom field definitions scoped to that workspace.

WHEN a lead has custom fields
THE SYSTEM SHALL store values without changing the base lead schema.

## Requirement 6: Calendar View and Availability

WHEN a lead has a scheduled time, follow-up due time, appointment time, or completed time
THE SYSTEM SHALL make it visible in a calendar view.

WHEN calendar items are displayed
THE SYSTEM SHALL color-code them by lead status.

WHEN a user asks whether a date/time is free
THE SYSTEM SHALL allow the assistant to check internal lead-related calendar items and answer using known scheduled work.

WHEN availability cannot be determined because working hours, duration, or timezone is missing
THE SYSTEM SHALL ask for clarification instead of guessing.

## Requirement 7: Assistant Search and Display

WHEN the user asks the assistant to find leads
THE SYSTEM SHALL translate the request into typed search/filter actions and return structured result cards in the dashboard assistant.

WHEN a search result references a lead
THE SYSTEM SHALL allow the user to open that lead from the assistant result.

## Requirement 8: Assistant Mutations Require Preview

WHEN the assistant proposes a lead mutation
THE SYSTEM SHALL show a preview of the intended change before applying it.

WHEN the user confirms the preview
THE SYSTEM SHALL apply the mutation through the same domain action used by the dashboard UI.

WHEN the user rejects the preview
THE SYSTEM SHALL leave persisted lead data unchanged.

## Requirement 9: Auditability

WHEN lead data, status, follow-up, custom field definition, or custom field value changes
THE SYSTEM SHALL write an audit/activity event with actor, action type, target, timestamp, and before/after data where applicable.

WHEN an assistant action is requested
THE SYSTEM SHALL log the requested tool, parsed arguments, confirmation result, and final status.

## Requirement 10: Demo Constraints

WHEN implementation starts
THE SYSTEM SHALL use a single repository and avoid a separate backend service unless a spec explicitly changes that decision.

WHEN test data is entered into any form, chat, or browser test
THE SYSTEM SHALL include `Test` in person names.

## Non-Goals

- Production telephony integration
- Full CRM replacement
- Kanban-first workflow
- Autonomous irreversible assistant actions
- Billing
- Enterprise multi-tenant administration
- Native iPhone SMS/iMessage ingestion
- Full external Google/Apple calendar sync
- Full reporting suite

## Open Questions

- What is the first demo ingestion input: pasted transcript, uploaded audio, or Telegram message?
- Should auth be included in the first demo or deferred behind a seeded demo workspace?
- Which exact custom fields should the laptop repair, beauty services, and software services templates include?
- What recording source is realistic for iPhone calls?
- Should the assistant preview be global in chat or embedded near the affected lead form?
- What are default working hours and appointment duration for availability checks?

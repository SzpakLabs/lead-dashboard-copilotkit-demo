# Project Overview

## Project Name

Lead Dashboard

## One-Sentence Summary

AI-assisted lead operations dashboard for small service businesses that currently track leads in memory, spreadsheets, chats, or underused CRMs.

## Product Summary

The product turns messy customer interactions into structured, searchable, follow-up-ready leads. It starts with a focused portfolio demo and can later expand into real pilots for laptop repair, beauty services, and software services.

## Current Priority

Build Demo Core before adding CopilotKit assistant, Telegram, audio transcription, custom fields, or full calendar UI.

## Demo Core

- Pasted text/transcript input
- Seeded workspace and fake user
- Software services vertical template
- Mock/deterministic extraction behind an interface
- Draft lead creation
- Lead list and detail
- Review/edit/confirm flow
- Status changes
- Follow-ups
- Basic audit/activity
- Simple metrics

## Later MVP

- Custom fields
- Calendar view and internal availability checks
- CopilotKit assistant search and mutation previews
- Live LLM extraction
- Telegram intake
- Audio upload/transcription
- Laptop repair and beauty services templates

## Product Modules

- Ingestion
- Lead management
- Contact management
- Follow-ups
- Audit/activity
- Metrics
- Later: calendar
- Later: assistant
- Later: custom fields

## Primary Users

- Solo service business owner
- Owner-operator
- Lightweight assistant or manager
- Product creator dogfooding a software services pipeline

## Docs Map

- `docs/10-product/13-mvp-scope.md` defines Demo Core vs Later MVP.
- `docs/20-domain/20-domain-model.md` defines Contact, Lead, CalendarItem, statuses, and calendar availability rules.
- `.kiro/specs/README.md` marks the active implementation spec.

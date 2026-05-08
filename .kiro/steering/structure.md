---
inclusion: always
---

# Structure Steering

## Current State

The repository is currently planning-only. `seed.md` is the source seed document. No application runtime has been scaffolded yet.

## Planning Structure

Use Kiro-style planning files:

```txt
.kiro/
  steering/
    product.md
    tech.md
    structure.md
  specs/
    mvp-lead-ops-demo/
      requirements.md
      design.md
      tasks.md
```

Use `/docs` as durable architecture and product documentation. Do not create the full documentation tree up front. Add files only when they are needed by the next implementation slice.

Minimum `/docs` order:

```txt
Wave 1: before app scaffold / first slice
  docs/00-meta/00-project-overview.md
  docs/10-product/13-mvp-scope.md
  docs/20-domain/20-domain-model.md

Wave 2: before DB/API work
  docs/20-domain/21-entities-and-relations.md
  docs/70-technical/72-event-model.md
  docs/70-technical/73-db-schema-draft.md

Wave 3: before assistant work
  docs/40-ai/41-tool-catalog.md
  docs/40-ai/44-confidence-and-review-policy.md

Wave 4: before dashboard screens
  docs/50-dashboard/50-information-architecture.md
  docs/50-dashboard/51-screen-list.md

Wave 5: before external integrations
  docs/30-workflows/31-ingestion-flows.md
  docs/60-integrations/60-integrations-overview.md
```

Documentation rule: each development slice should update only the docs it changes. Avoid broad PRD-style documents unless repeated ambiguity appears.

Content rule: writing milestones are optional delivery artifacts. Track them in spec tasks, but do not let them block implementation unless the current goal is specifically portfolio/content publication. Good article moments are after decisions, working vertical slices, integration lessons, and measurable demos.

## Future Application Structure

When implementation starts, prefer this shape:

```txt
app/
  api/
    copilotkit/
      route.ts
    ingest/
      route.ts
  (dashboard)/
    leads/
    followups/
    calls/
    settings/

src/
  components/
    assistant/
    dashboard/
    leads/
    ui/
  lib/
    assistant/
      tools/
      preview/
    db/
    domain/
      leads/
      followups/
      custom-fields/
      audit/
    ingestion/
    schemas/
    services/
  server/
    auth/
    storage/
```

## Boundary Rules

- UI components render state and call typed actions.
- Domain modules own validation and business rules.
- Assistant tools call domain modules only.
- Ingestion modules create draft records or proposals; they do not bypass review rules.
- DB schema and query helpers stay under `src/lib/db`.
- Shared schemas stay under `src/lib/schemas`.
- CopilotKit-specific code stays under `src/lib/assistant` and the API route.

## Naming Rules

- Use explicit domain names: `Lead`, `FollowUp`, `CustomFieldDefinition`, `AssistantActionLog`.
- Avoid generic names like `Item`, `Record`, `Data`, or `Entry` for core entities.
- Prefer feature folders for domain logic over generic utility folders.

## Documentation Rules

- Keep specs short enough to be operational.
- Update steering when product or architecture decisions change.
- Add a decision log later if decisions start repeating.

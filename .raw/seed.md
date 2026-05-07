Суть: тебе сейчас нужен не “идеальный стек”, а **правильный порядок принятия решений**.
Для такого проекта главная ошибка — рано лезть в AG-UI, copilot и красивые дашборды, не зацементировав **domain model, ingestion flow и операционные сценарии**.

У тебя уже есть релевантный опыт для такого класса продукта — voice AI CRM dashboard, real-time transcription pipeline и AG-UI conversational interface . Поэтому тебе разумно действовать как **product-oriented full-stack lead**, а не как чистый архитектор.

---

# 1. Правильный порядок фаз

Я бы делил проект на 8 блоков.

## Phase 0. Product framing

Это маст-хэв и блокирует почти всё остальное.

Что надо сделать:

* зафиксировать **одну основную категорию продукта**
* определить **primary user**
* определить **core promise**
* выбрать **MVP boundary**
* описать **2–3 главных user flows**

### Что здесь решить

Не “что ещё можно добавить”, а:

* это **voice-enabled lead ops system**
* или **AI telephony platform**
* или **CRM with conversational interface**

Для вас правильнее:
**lead operations layer over existing calls and chats**

Это важно, потому что от этого зависят:

* сущности в БД
* UI
* pricing
* интеграции
* GTM

### Выход артефакта

Документ на 1–2 страницы:

* problem
* ICP
* use cases
* non-goals
* MVP scope
* success metrics

### Без этого нельзя:

* нормально проектировать data model
* проектировать assistant actions
* делать dashboard IA
* делать ingestion pipeline

---

## Phase 1. Domain model

Это самый критичный технический маст-хэв.

Нужно определить:

* какие сущности существуют
* что является источником истины
* как связаны звонки, лиды, контакты, поля, статусы, события

### Минимум сущностей

* Workspace
* User
* Lead
* Contact
* Conversation
* Call
* Transcript
* Recording
* CustomFieldDefinition
* CustomFieldValue
* LeadActivity / Event
* Status / PipelineStage
* FollowUp / Task
* AssistantAction / AuditLog

### Ключевой вопрос

Что является центром системы?

Я бы выбрал:
**Lead = primary operational entity**
а всё остальное привязывается к нему:

* lead has many calls
* lead has many activities
* lead has custom fields
* lead has follow-ups

### Почему это блокирует всё

Пока нет domain model:

* нельзя стабильно делать API
* нельзя делать AG-UI tools
* нельзя делать parser
* нельзя строить таблицы/карточки/фильтры

---

## Phase 2. Event & ingestion architecture

Это вторая критическая опора после domain model.

Нужно описать, как данные попадают в систему.

### Источники для MVP

* manual create
* post-call ingest
* transcript ingest
* voice note / text note from bot
* dashboard assistant action

### Главный принцип

**Все входы должны приводиться к одному нормализованному pipeline.**

То есть не:

* один код для звонка
* другой для бота
* третий для ассистента

А:

* input received
* source normalized
* parsing/extraction
* draft entity created
* human review or auto-apply
* audit event stored

### Минимальные события

* call.recording_received
* transcript.created
* lead.draft_created
* lead.created
* lead.updated
* followup.created
* assistant.action_requested
* assistant.action_applied
* custom_field.created

### Что это блокирует

Без ingestion architecture:

* AG-UI не на чем работать
* дашборд будет UI без живой модели
* бот и call pipeline будут разъезжаться

---

## Phase 3. Operational workflows

Это продуктовый маст-хэв. Тут проект становится не набором фич, а системой.

Нужно описать 4–6 ключевых сценариев.

### Обязательные

1. **Post-call auto lead capture**
2. **Manual lead create**
3. **Lead review and correction**
4. **Status change + follow-up**
5. **Search/filter/open lead**
6. **Assistant edits lead in background**

### Для каждого сценария нужно зафиксировать

* actor
* trigger
* steps
* system response
* edge cases
* final state

### Пример

**После звонка**

* запись получена
* транскрипт создан
* extractor выделил данные
* draft lead появился
* оператор подтверждает/исправляет
* lead попадает в pipeline
* follow-up назначен

### Это блокирует

* экранную структуру
* permissions
* action model для ассистента
* acceptance criteria для MVP

---

## Phase 4. Data governance and permissions

Это часто забывают, а потом всё ломается.

Нужно рано определить:

* кто что видит
* кто что редактирует
* может ли assistant менять всё
* нужен ли confirm
* что логируется

### Маст-хэв для MVP

* Owner
* Operator
* Assistant as system actor
* Audit log for every mutation

### Минимальные правила

* assistant не пишет напрямую без trace
* важные изменения — либо confirm, либо reversible
* custom field creation логируется
* transcript/recording immutable
* extracted fields editable, but with history

### Это блокирует

* assistant design
* trust model
* compliance
* rollback capability

---

## Phase 5. Assistant action model

Вот тут уже можно проектировать AG-UI слой.

Но не раньше.

Нужно определить не “чат”, а **какие действия чат умеет делать**.

### Маст-хэв action set

* find_leads
* open_lead
* filter_leads
* update_lead_fields
* change_lead_status
* create_followup
* add_note
* create_custom_field
* summarize_lead
* summarize_day
* list_unanswered_leads

### Очень важно

AG-UI должен работать как **tool-based action system**, а не как свободный LLM над базой.

То есть:

* LLM интерпретирует запрос
* вызывает строго определённые actions
* actions валидируются
* response отображается как UI result

### Что блокирует

* chatbot panel UX
* backend tools
* agent permissions
* prompt architecture

---

## Phase 6. Information architecture of dashboard

Только теперь правильно проектировать сам дашборд.

### MVP-структура

1. Leads list
2. Lead detail view
3. Conversation / calls tab
4. Transcript + recording panel
5. Custom fields panel
6. Follow-ups
7. Assistant side panel
8. Filters / saved views

### Лучший layout для MVP

**split view**

* слева список
* справа карточка
* ассистент отдельной боковой колонкой или drawer

Почему не kanban-first:

* для call-heavy продукта сначала важнее review/search/detail
* kanban — secondary operational view

### Блокирующие зависимости

IA зависит от:

* domain model
* workflows
* assistant actions
* roles

---

## Phase 7. Integration layer

Теперь уже можно нормально решать интеграции.

### Маст-хэв для MVP

* telephony recording/transcript source
* bot interface
* object storage
* auth
* LLM provider
* STT provider
* dashboard backend

### Нельзя делать слишком рано

* календари
* n8n
* десятки CRM
* billing
* marketplace ecosystem
* enterprise SSO

### Почему

Это nice-to-have до тех пор, пока не доказан основной workflow:
**conversation → structured lead → next action**

---

## Phase 8. Analytics and product instrumentation

Это маст-хэв, но не на первом месте.

Нужно мерить:

* time from call end to lead created
* extraction confidence
* correction rate
* lead completeness
* follow-up latency
* assistant acceptance rate
* manual vs auto entry ratio

Без этого потом не поймёшь, где реальная ценность.

---

# 2. Что является настоящими маст-хэв блоками

Вот в порядке важности.

## Tier A — блокируют весь проект

Это надо делать обязательно и сначала.

1. Product framing
2. Domain model
3. Ingestion architecture
4. Core workflows
5. Permissions + audit model

Если эти 5 блоков не собраны, всё остальное будет шатким.

---

## Tier B — обязательны для рабочего MVP

6. Assistant action model
7. Dashboard IA
8. Core API contracts
9. Extraction/review flow
10. Status/follow-up system

Без них не будет продукта, будет только демо.

---

## Tier C — нужны, но можно позже

11. Vertical templates
12. Saved filters/views
13. Notifications/reminders
14. Multi-language support
15. Team analytics

---

## Tier D — nice-to-have

16. Real-time transcript view
17. Voice agent live handoff
18. Calendar integration
19. CRM export/sync
20. No-code automation builder
21. Advanced reporting
22. Billing/subscription engine
23. Marketplace / plugin system

---

# 3. Что что блокирует

Вот короткая dependency chain.

## Базовая цепочка

**Product framing**
→ **Domain model**
→ **Ingestion architecture**
→ **Core workflows**
→ **Permissions / audit**
→ **Assistant action model**
→ **Dashboard IA**
→ **API / implementation**

---

## Конкретнее

### Product framing блокирует:

* data model
* pricing logic
* dashboard structure
* pilot scope

### Domain model блокирует:

* DB schema
* APIs
* assistant tools
* custom fields model
* filters/search

### Ingestion architecture блокирует:

* bot flow
* call transcription pipeline
* lead draft creation
* event log

### Workflows блокируют:

* UI screens
* acceptance criteria
* task breakdown
* role behavior

### Permissions / audit блокируют:

* assistant mutations
* background edits
* compliance posture
* undo/history model

### Assistant action model блокирует:

* AG-UI implementation
* prompt/tool design
* side panel UX
* natural language editing

### Dashboard IA блокирует:

* component tree
* routing
* list/detail logic
* MVP frontend scope

---

# 4. Что нельзя делать слишком рано

Это важно.

## 1. Не начинать с AG-UI

Потому что без action model это будет просто chat box theatre.

## 2. Не начинать с канбана

Kanban красиво выглядит, но для call ingestion продукта это не ядро.

## 3. Не делать сразу “универсальную CRM”

Слишком широко. Нужно “lead ops over calls”.

## 4. Не распыляться на интеграции

Одна telephony source + один bot flow + один dashboard достаточно для MVP.

## 5. Не проектировать идеальную multi-tenant enterprise system

Сначала нужен рабочий pilot architecture.

---

# 5. Рекомендуемая последовательность действий

Вот как бы я шёл буквально по шагам.

## Step 1 — Product brief

Собрать короткий продуктовый документ:

* кто пользователь
* какая боль
* что обещаем
* что не делаем
* что входит в MVP

## Step 2 — Domain map

Нарисовать схему сущностей и связей.

## Step 3 — Core user flows

Описать 5–6 ключевых сценариев.

## Step 4 — Event map

Описать входящие события и переходы состояний.

## Step 5 — Permissions & audit

Определить, кто что может менять.

## Step 6 — Assistant tool catalog

Список действий ассистента и ограничения.

## Step 7 — Dashboard IA

Список экранов и структура интерфейса.

## Step 8 — API contracts

Черновые endpoints / actions / payloads.

## Step 9 — MVP task breakdown

Разбить на вертикальные delivery slices.

---

# 6. Лучший способ декомпозиции для разработки

Не по слоям типа:

* backend
* frontend
* bot
* AI

А по **vertical slices**.

### Правильнее так:

#### Slice 1

Post-call ingest → draft lead → dashboard list

#### Slice 2

Open lead → transcript/recording → edit fields → save

#### Slice 3

Change status → create follow-up → view pending items

#### Slice 4

Assistant finds and updates leads

#### Slice 5

Custom fields creation and usage

Так ты быстрее получишь живой продукт, а не 40% каждого слоя.

С учётом твоего профиля тебе как раз полезнее идти outcome-oriented, с чёткой структурой целей и без перегруза лишними ветками решений  

---

# 7. Мой жёсткий приоритет

Если совсем коротко, то вот порядок:

## Маст-хэв, строго сначала

* Product framing
* Domain model
* Ingestion/event architecture
* Core workflows
* Permissions/audit

## Потом

* Assistant action model
* Dashboard IA
* API contracts
* MVP slices

## Потом уже

* красивый AG-UI
* интеграции
* расширенная аналитика
* enterprise complexity

---

# 8. Если формулировать как правило

**Сначала опиши, что существует в системе.**
Потом — **как это появляется и меняется.**
Потом — **кто это видит и редактирует.**
И только потом — **как это красиво показывать и как об этом разговаривать через AI.**

Это и есть правильный путь для full-stack product manager, а не архитектора.

Если хочешь, следующим сообщением я могу разложить это уже в виде **конкретной структуры папки `/docs` для проекта**: какие md-файлы создать первыми и что в каждом должно лежать.

---

Ниже — структура `/docs`, с которой удобно стартовать и работать через Claude Code / Codex без лишнего хаоса.

# Базовый принцип

Не делай один огромный PRD-файл.
Сделай **1 главный индекс + набор коротких специализированных документов**.

Так:

* проще держать контекст;
* проще обновлять;
* меньше шанс, что агент начнёт путаться;
* легче делить работу на вертикальные срезы.

---

# Рекомендуемая структура

```txt
/docs
  /00-meta
    00-project-overview.md
    01-glossary.md
    02-decisions-log.md

  /10-product
    10-product-brief.md
    11-icp-and-personas.md
    12-problem-and-jobs-to-be-done.md
    13-mvp-scope.md
    14-success-metrics.md
    15-non-goals.md

  /20-domain
    20-domain-model.md
    21-entities-and-relations.md
    22-statuses-and-lifecycle.md
    23-custom-fields-model.md
    24-permissions-and-roles.md
    25-audit-and-history.md

  /30-workflows
    30-core-user-flows.md
    31-ingestion-flows.md
    32-assistant-flows.md
    33-followup-flows.md
    34-edge-cases.md

  /40-ai
    40-ai-assistant-scope.md
    41-tool-catalog.md
    42-extraction-and-parsing.md
    43-prompts-and-guardrails.md
    44-confidence-and-review-policy.md

  /50-dashboard
    50-information-architecture.md
    51-screen-list.md
    52-leads-list-view.md
    53-lead-detail-view.md
    54-assistant-panel.md
    55-search-filter-saved-views.md

  /60-integrations
    60-integrations-overview.md
    61-telephony-ingestion.md
    62-telegram-bot.md
    63-storage-and-recordings.md
    64-auth-and-workspaces.md
    65-notifications.md

  /70-technical
    70-system-architecture.md
    71-api-contracts.md
    72-event-model.md
    73-db-schema-draft.md
    74-state-management.md
    75-observability.md

  /80-delivery
    80-mvp-slices.md
    81-priorities-and-dependencies.md
    82-backlog.md
    83-acceptance-criteria.md
    84-risks-and-open-questions.md
```

---

# Что в каждом файле должно быть

## `/00-meta`

## `00-project-overview.md`

Главный входной файл.

Что внутри:

* название проекта
* 3–5 предложений, что это за продукт
* для кого
* какую проблему решает
* из каких модулей состоит
* ссылки на остальные docs

Это файл, который первым читают Claude/Codex.

### Шаблон

```md
# Project Overview

## Summary
[1–2 абзаца]

## Product Modules
- Telephony ingestion
- Lead dashboard
- AI assistant
- Custom fields
- Follow-up management

## Primary Users
- SMB service business owner
- Operator / manager

## Current Scope
[MVP scope summary]

## Docs Map
- Product brief: ...
- Domain model: ...
- Core workflows: ...
```

---

## `01-glossary.md`

Очень полезный файл.

Что внутри:

* Lead
* Contact
* Call
* Conversation
* Transcript
* Recording
* Draft Lead
* Custom Field
* Follow-up
* Assistant Action
* Workspace

Чтобы везде были одинаковые термины.

---

## `02-decisions-log.md`

Журнал решений.

Формат:

* дата
* решение
* почему
* последствия

Например:

* “Lead is the primary operational entity”
* “Assistant edits require audit trail”
* “MVP is post-call ingestion, not real-time live copilot”

Это спасает от бесконечных переобсуждений.

---

# `/10-product`

## `10-product-brief.md`

Главный продуктовый документ.

Что внутри:

* проблема
* ICP
* value proposition
* current workflow user
* improved workflow with product
* why now
* product promise

### Ключевой вопрос

Что именно мы продаём:

* контроль лидов без ручного ввода
* AI layer over calls
* conversational lead ops

---

## `11-icp-and-personas.md`

Не огромные персоны, а реальные роли.

### Минимум:

* solo owner/operator
* small team manager
* admin/operator

Для каждой:

* goals
* pains
* current tools
* resistance to adoption

---

## `12-problem-and-jobs-to-be-done.md`

Очень полезный файл для нерасползания.

Формат:

* When...
* I want to...
* So I can...

Пример:

* Когда я поговорил с клиентом по телефону, я хочу чтобы лид появился в системе автоматически, чтобы мне не пришлось восстанавливать детали по памяти.

---

## `13-mvp-scope.md`

Один из самых важных файлов.

Содержит 3 блока:

* in scope
* out of scope
* phase 2

### Пример

**In scope**

* post-call transcription ingestion
* draft lead creation
* manual review
* lead dashboard
* status updates
* follow-ups
* assistant search/edit

**Out of scope**

* enterprise CRM sync
* billing
* advanced analytics
* omnichannel inbox
* full live call center suite

---

## `14-success-metrics.md`

Нужно сразу.

Минимум:

* % calls converted into structured leads
* average time from call to visible lead
* % leads corrected manually
* % leads with next step assigned
* time to find lead
* assistant task success rate

---

## `15-non-goals.md`

Прямо отдельный файл.

Очень помогает агентам не расширять scope.

Примеры:

* we are not building a full CRM
* we are not replacing every telephony stack
* we are not doing fully autonomous AI operations
* we are not solving all channels in MVP

---

# `/20-domain`

## `20-domain-model.md`

Высокоуровневая доменная схема.

Лучше с диаграммой Mermaid.

### Пример

````md
# Domain Model

```mermaid
erDiagram
  WORKSPACE ||--o{ LEAD : contains
  LEAD ||--o{ CALL : has
  LEAD ||--o{ LEAD_ACTIVITY : has
  LEAD ||--o{ CUSTOM_FIELD_VALUE : has
  WORKSPACE ||--o{ CUSTOM_FIELD_DEFINITION : defines
  CALL ||--|| TRANSCRIPT : produces
  CALL ||--|| RECORDING : stores
  LEAD ||--o{ FOLLOW_UP : requires
````

````

---

## `21-entities-and-relations.md`
Подробно по каждой сущности.

Для каждой:
- purpose
- required fields
- optional fields
- relations
- invariants

### Пример
```md
## Lead
Purpose: primary operational record representing a potential customer request.

Required:
- id
- workspaceId
- status
- source
- createdAt

Optional:
- primaryContactId
- summary
- tags
- nextActionAt

Relations:
- has many calls
- has many activities
- has many custom field values
````

---

## `22-statuses-and-lifecycle.md`

Как лид двигается.

Например:

* new
* needs_review
* qualified
* quoted
* scheduled
* won
* lost

И:

* кто переводит
* когда автоматически
* когда вручную

---

## `23-custom-fields-model.md`

Очень важный файл для вашего продукта.

Что описать:

* где живут field definitions
* какие типы полей есть
* кто может создавать
* как assistant создаёт новые
* как поля маппятся из extraction
* как поля меняются со временем

### Типы полей

* text
* textarea
* number
* boolean
* enum
* multi-select
* date
* datetime
* currency
* phone
* url

---

## `24-permissions-and-roles.md`

Минимум ролей.

Пример:

* owner
* manager
* operator
* system_assistant

Для каждой:

* view
* edit
* delete
* create custom field
* run assistant actions
* approve suggested actions

---

## `25-audit-and-history.md`

Что логировать всегда:

* field changes
* status changes
* assistant edits
* follow-up creation
* call linkage
* merge/split actions

---

# `/30-workflows`

## `30-core-user-flows.md`

5–8 сценариев с шагами.

### Пример списка

* Create lead manually
* Post-call auto capture
* Review extracted lead
* Edit lead
* Change status
* Schedule follow-up
* Search through assistant
* Update data through assistant

---

## `31-ingestion-flows.md`

Все потоки входа данных.

### Для каждого источника

* trigger
* input
* normalization
* parsing
* entity creation
* review
* final persistence

---

## `32-assistant-flows.md`

Сценарии ассистента.

Примеры:

* “Покажи лиды за сегодня без ответа”
* “Найди клиентку на 14 июня по имени Анна”
* “Смени статус на quoted”
* “Добавь поле event_date”
* “Поставь напоминание на завтра”

---

## `33-followup-flows.md`

Как создаются и закрываются follow-up задачи.

---

## `34-edge-cases.md`

Очень полезный файл.

Сюда:

* transcript empty
* call has low audio quality
* extraction confidence low
* duplicate lead suspected
* no phone number
* caller already exists
* assistant action ambiguous
* custom field type conflict

---

# `/40-ai`

## `40-ai-assistant-scope.md`

Что ассистент умеет и чего не умеет.

Это анти-галлюцинаторный файл.

### Секции:

* goals
* allowed actions
* forbidden actions
* human confirmation rules
* response style
* trust boundaries

---

## `41-tool-catalog.md`

Самый важный AI-файл.

Каждый tool/action описать как API contract.

### Пример

```md
## Tool: find_leads
Description: search leads using filters, text, statuses, tags, and custom fields.

Inputs:
- query?: string
- statuses?: string[]
- assignedTo?: string
- customFieldFilters?: array

Output:
- list of lead summaries
```

Такие же для:

* open_lead
* update_lead_fields
* change_status
* create_followup
* create_custom_field
* summarize_lead

---

## `42-extraction-and-parsing.md`

Как работает extraction.

Что описать:

* transcript → structured draft
* target schema
* confidence
* missing fields
* ambiguity handling
* normalization rules

---

## `43-prompts-and-guardrails.md`

Не сами секретные промпты, а правила.

Например:

* never invent missing field values
* prefer null over guess
* always mark low confidence fields
* never update immutable call data
* custom fields require explicit workspace context

---

## `44-confidence-and-review-policy.md`

Какие изменения авто-применяются, а какие идут на review.

Пример:

* lead summary: auto
* urgency: auto if confidence > threshold
* status change: review
* custom field creation: review
* contact merge: manual only

---

# `/50-dashboard`

## `50-information-architecture.md`

Карта дашборда.

### Минимум

* leads
* lead detail
* calls/transcripts
* follow-ups
* assistant panel
* settings
* custom fields
* activity log

---

## `51-screen-list.md`

Список экранов и цель каждого.

### Пример

* LeadsListPage — browse and filter leads
* LeadDetailPage — inspect and update one lead
* CallsInboxPage — review newly ingested calls
* FollowUpsPage — manage pending next actions
* SettingsCustomFieldsPage — manage schema

---

## `52-leads-list-view.md`

Как устроен список лидов:

* columns
* default sort
* filters
* bulk actions
* saved views

---

## `53-lead-detail-view.md`

Карточка лида:

* header
* summary
* custom fields
* call history
* transcript
* recording
* notes
* activity
* follow-ups

---

## `54-assistant-panel.md`

Как выглядит и работает AG-UI панель:

* input
* result cards
* action previews
* confirm/reject UI
* history

---

## `55-search-filter-saved-views.md`

Как работает поиск:

* plain text
* status filter
* custom field filters
* saved segments
* assistant-driven filtering

---

# `/60-integrations`

## `60-integrations-overview.md`

Обзор внешних зависимостей.

---

## `61-telephony-ingestion.md`

Опиши:

* источники звонков
* как приходят записи
* как связываются с workspace
* что делаем при missing metadata
* как выглядит minimal payload

---

## `62-telegram-bot.md`

Если бот остаётся в продукте — отдельный файл.

Нужно описать:

* команды
* кнопки
* draft flow
* voice note path
* save/confirm logic

---

## `63-storage-and-recordings.md`

Где хранятся:

* recordings
* transcript artifacts
* attachments

Плюс:

* retention
* deletion
* signed URLs
* access control

---

## `64-auth-and-workspaces.md`

Workspace model, membership, invitations.

---

## `65-notifications.md`

Напоминания:

* follow-up overdue
* new draft lead needs review
* missed-call / no-response queues

---

# `/70-technical`

## `70-system-architecture.md`

Один high-level technical diagram.

### Слои:

* dashboard app
* bot / telephony ingestion
* API layer
* jobs / workers
* LLM / STT services
* DB
* storage

---

## `71-api-contracts.md`

Черновые endpoint’ы или action contracts.

### Пример разделов

* leads
* calls
* transcripts
* custom fields
* follow-ups
* assistant actions

---

## `72-event-model.md`

Какие системные события существуют.

Очень полезно, если строишь ingestion и assistant actions.

---

## `73-db-schema-draft.md`

Черновые таблицы.

Без фанатизма, но достаточно, чтобы начать.

---

## `74-state-management.md`

Какой state где живёт:

* server state
* client state
* optimistic updates
* assistant pending actions

---

## `75-observability.md`

Что логируешь:

* ingest errors
* extraction failures
* assistant action failures
* missing transcripts
* queue latency

---

# `/80-delivery`

## `80-mvp-slices.md`

Один из самых практичных файлов.

### Разбивка по вертикальным кускам

#### Slice 1

Post-call ingest → draft lead visible in dashboard

#### Slice 2

Lead detail → transcript + recording + edit/save

#### Slice 3

Status + follow-up

#### Slice 4

Assistant search and filter

#### Slice 5

Assistant update actions

#### Slice 6

Custom fields definitions + values

---

## `81-priorities-and-dependencies.md`

Тут прямо таблица:

* item
* priority
* blocks
* blocked by
* notes

Очень полезно для тебя именно как product manager.

---

## `82-backlog.md`

Не giant backlog.
Только эпики и крупные задачи.

---

## `83-acceptance-criteria.md`

Для каждого slice:

* Given / When / Then
  или просто:
* done means...

---

## `84-risks-and-open-questions.md`

Отдельно собрать:

* unresolved product questions
* technical risks
* integration risks
* UX ambiguity

---

# Какие файлы создать первыми

Если не хочешь утонуть, не создавай всё сразу.

## Первая волна — обязательно

```txt
/docs/00-meta/00-project-overview.md
/docs/10-product/10-product-brief.md
/docs/10-product/13-mvp-scope.md
/docs/20-domain/20-domain-model.md
/docs/20-domain/21-entities-and-relations.md
/docs/30-workflows/30-core-user-flows.md
/docs/40-ai/41-tool-catalog.md
/docs/50-dashboard/50-information-architecture.md
/docs/70-technical/70-system-architecture.md
/docs/80-delivery/80-mvp-slices.md
/docs/80-delivery/81-priorities-and-dependencies.md
```

Это уже даст тебе нормальный скелет проекта.

---

# В какой последовательности заполнять

## Порядок заполнения

1. `00-project-overview.md`
2. `10-product-brief.md`
3. `13-mvp-scope.md`
4. `20-domain-model.md`
5. `21-entities-and-relations.md`
6. `30-core-user-flows.md`
7. `41-tool-catalog.md`
8. `50-information-architecture.md`
9. `70-system-architecture.md`
10. `80-mvp-slices.md`
11. `81-priorities-and-dependencies.md`

Это правильный порядок, потому что:

* продукт → сущности → сценарии → действия → интерфейс → архитектура → delivery

---

# Что маст-хэв, а что найс-ту-хэв среди docs

## Маст-хэв

* overview
* brief
* mvp scope
* domain model
* entities
* workflows
* tool catalog
* IA
* system architecture
* mvp slices
* priorities/dependencies

## Нужны скоро после старта

* statuses lifecycle
* custom fields model
* audit/history
* api contracts
* db schema draft
* acceptance criteria
* risks/open questions

## Nice-to-have

* personas
* glossary
* decisions log
* observability
* saved views
* prompt guardrails
* notifications
* state management

---

# Какой документ реально читает Claude/Codex первым

Сделай так, чтобы `00-project-overview.md` был:

* короткий,
* ясный,
* с ссылками на остальные docs,
* без воды,
* с секцией “Current implementation priority”.

Тогда агенту проще не расползаться.

---

# Практический совет

Для тебя сейчас лучший режим — **не писать PRD-роман**, а собрать **10 чётких документов по 30–100 строк**.
Это лучше совпадает и с твоим стилем работы: структурно, модульно, без информационной перегрузки, с фокусом на outcome  

Если хочешь, следующим сообщением я могу сразу дать тебе **готовые markdown-шаблоны для первых 10 файлов**, чтобы ты просто вставил их в `/docs`.

---

Ниже — **готовые markdown-шаблоны для первых 10 файлов**. Их можно просто положить в `/docs` и начать заполнять.

---

# 1) `/docs/00-meta/00-project-overview.md`

```md
# Project Overview

## Project Name
[Working name, e.g. LeadDock / LeadRelay / NRG Voice CRM]

## One-Sentence Summary
A lead operations system that captures leads from calls and messages, structures them automatically, and lets teams manage them through a dashboard and AI assistant.

## Product Summary
This product helps service businesses keep their existing way of working — calls, voice notes, manual communication — while automatically capturing lead data into a structured system.

The system combines:
- post-call transcription and lead extraction
- dashboard-based lead management
- customizable lead fields
- follow-up tracking
- AI assistant actions for search, filtering, and data updates

## Primary Value Proposition
Users do not need to manually re-enter lead data after calls. The system captures and structures incoming lead information with minimal workflow disruption.

## Primary Users
- Small business owner
- Operator / assistant
- Manager / admin

## Product Modules
- Lead dashboard
- Call ingestion
- Transcript processing
- Lead extraction
- Custom fields
- Follow-ups
- AI assistant panel
- Manual lead creation
- Telegram/bot input (optional in MVP)

## Current MVP Focus
[Example]
The current MVP focuses on:
1. post-call lead ingestion
2. structured lead creation
3. dashboard review/edit flow
4. status and follow-up management
5. AI assistant for search and editing

## Out of Scope for MVP
- Full CRM replacement
- Omnichannel inbox
- Deep analytics/reporting
- Advanced enterprise permissions
- Full live call center platform
- Complex billing/subscriptions

## Pilot Users
- [Katya — beauty services]
- [Yura — laptop / electronics repair]
- [Other pilot if needed]

## Docs Map
- Product brief: `../10-product/10-product-brief.md`
- MVP scope: `../10-product/13-mvp-scope.md`
- Domain model: `../20-domain/20-domain-model.md`
- Entities: `../20-domain/21-entities-and-relations.md`
- Core flows: `../30-workflows/30-core-user-flows.md`
- Assistant tools: `../40-ai/41-tool-catalog.md`
- Dashboard IA: `../50-dashboard/50-information-architecture.md`
- System architecture: `../70-technical/70-system-architecture.md`
- MVP slices: `../80-delivery/80-mvp-slices.md`
- Priorities and dependencies: `../80-delivery/81-priorities-and-dependencies.md`

## Current Priority
[Describe the current implementation priority in 3–5 lines]
```

---

# 2) `/docs/10-product/10-product-brief.md`

```md
# Product Brief

## Product
[Working name]

## Problem
Service businesses often lose or under-document leads because customer communication happens through calls, voice notes, chats, and memory. After the interaction, data is either entered manually, entered partially, or not entered at all.

This leads to:
- lost leads
- incomplete lead records
- missed follow-ups
- poor visibility over pipeline
- operational chaos

## Who It Is For
### Primary ICP
[Example]
Small service businesses that rely on calls and manual communication:
- beauty services
- repair services
- local service providers
- appointment-based businesses

### Secondary ICP
[Example]
Small sales or call-heavy teams that want lead capture automation without changing their existing workflow.

## Core Promise
The system automatically captures lead data from calls and turns it into structured, actionable records — without forcing the user to change how they work.

## Current Workflow
[Describe the current user workflow]
Example:
1. Customer calls
2. Owner/operator speaks with customer
3. Important details stay in memory, chats, or notes
4. Some data gets lost
5. Follow-up may be forgotten
6. No clean lead history exists

## Improved Workflow
1. Customer calls
2. Call is recorded / transcribed
3. System extracts lead information
4. Draft or final lead appears in dashboard
5. User reviews / edits if needed
6. Status and follow-up are managed in one place
7. AI assistant helps search and edit data

## Why This Matters
This product reduces operational friction and ensures that every customer interaction becomes a usable lead record.

## Main Jobs To Be Done
- Capture every lead with minimal manual work
- Turn unstructured conversations into structured data
- Keep track of lead statuses and next steps
- Reduce forgotten follow-ups
- Make lead search and editing fast

## Product Principles
- Minimal disruption to existing workflow
- Structured data over messy notes
- Human review where confidence is low
- AI assists operations, not replaces system design
- Auditability for all important changes

## Product Positioning
[Example]
A lead operations layer for service businesses that turns calls into structured leads and makes them manageable through a focused dashboard and AI assistant.

## Business Value
- More leads captured
- Faster follow-ups
- Better visibility
- Less mental load
- Higher operational consistency

## Main Risks
- Overcomplicating MVP
- Weak extraction quality
- Ambiguous domain model
- Too much scope around assistant behavior
- Integration instability with telephony source
```

---

# 3) `/docs/10-product/13-mvp-scope.md`

```md
# MVP Scope

## Goal of MVP
Build a working lead operations system that captures call-based lead data, stores it as structured lead records, and lets users manage those leads through a dashboard and AI assistant.

## In Scope
- Workspace-based lead dashboard
- Manual lead creation
- Post-call transcription ingestion
- Lead draft creation from transcript
- Review/edit flow for extracted leads
- Lead detail page
- Call transcript display
- Call recording display/playback
- Lead statuses
- Follow-up creation and tracking
- Custom field definitions
- Custom field values on leads
- AI assistant search and filtering
- AI assistant field updates
- Audit/history for key changes

## In Scope (Optional if already easy)
- Telegram bot lead intake
- Voice note transcription into draft leads
- Saved views / filters
- Duplicate lead hinting

## Out of Scope
- Full omnichannel inbox
- Full CRM replacement
- Live real-time coaching during calls
- Advanced analytics and BI
- Billing/subscriptions
- Marketplace/app ecosystem
- Enterprise SSO
- Complex team hierarchies
- Deep calendar automation
- Full autonomous AI workflows without review

## Future Scope / Phase 2
- Live call center mode / voice agent mode
- Outbound campaign support
- Calendar integration
- CRM sync
- Missed call flows
- Bulk editing
- Team performance reporting
- Multi-pipeline support
- More communication channels

## MVP Success Criteria
- A call can become a visible structured lead
- Lead details can be edited manually
- Status and follow-up can be managed
- Assistant can search and update leads
- Custom fields can be created and used
- Core workflow is stable enough for pilot users

## MVP Constraints
- Build fast
- Keep architecture extensible but not overengineered
- Optimize for pilot utility over feature breadth
```

---

# 4) `/docs/20-domain/20-domain-model.md`

````md
# Domain Model

## Overview
The system is centered around the Lead as the main operational entity.

Calls, transcripts, recordings, custom fields, follow-ups, and assistant actions are associated with leads. A workspace defines its own users, custom field schema, and operational context.

## Primary Entity
**Lead** is the primary operational entity.

Why:
- users manage work through leads
- calls and transcripts are supporting data
- follow-ups and statuses are lead-driven
- assistant actions mostly operate on leads

## High-Level Entities
- Workspace
- User
- Lead
- Contact
- Call
- Transcript
- Recording
- CustomFieldDefinition
- CustomFieldValue
- FollowUp
- LeadActivity
- AssistantActionLog

## Relationship Summary
- A workspace has many users
- A workspace has many leads
- A workspace defines many custom fields
- A lead may have one primary contact
- A lead may have many calls
- A call may have one transcript
- A call may have one recording
- A lead may have many custom field values
- A lead may have many follow-ups
- A lead may have many activities
- Assistant actions may affect leads and are logged

## Mermaid Diagram
```mermaid
erDiagram
  WORKSPACE ||--o{ USER : has
  WORKSPACE ||--o{ LEAD : contains
  WORKSPACE ||--o{ CUSTOM_FIELD_DEFINITION : defines

  LEAD ||--o| CONTACT : primary_contact
  LEAD ||--o{ CALL : has
  LEAD ||--o{ CUSTOM_FIELD_VALUE : has
  LEAD ||--o{ FOLLOW_UP : has
  LEAD ||--o{ LEAD_ACTIVITY : has

  CALL ||--o| TRANSCRIPT : produces
  CALL ||--o| RECORDING : stores

  CUSTOM_FIELD_DEFINITION ||--o{ CUSTOM_FIELD_VALUE : structures
````

## Key Domain Rules

* Every lead belongs to exactly one workspace
* Every custom field value must reference a valid field definition
* Calls and transcripts are immutable source records unless explicitly reprocessed
* Important edits must be logged
* Assistant actions must be auditable

## Open Questions

* Can one lead have multiple contacts in MVP?
* Should a lead merge flow exist in MVP?
* Is there one global pipeline or workspace-defined statuses?

````

---

# 5) `/docs/20-domain/21-entities-and-relations.md`

```md
# Entities and Relations

## Workspace
### Purpose
Represents one business account / tenant.

### Required Fields
- id
- name
- createdAt
- updatedAt

### Relations
- has many users
- has many leads
- has many custom field definitions

---

## User
### Purpose
Represents a member of a workspace.

### Required Fields
- id
- workspaceId
- role
- name
- email

### Relations
- belongs to one workspace

---

## Lead
### Purpose
Primary operational record representing a potential customer request or opportunity.

### Required Fields
- id
- workspaceId
- status
- source
- createdAt
- updatedAt

### Optional Fields
- primaryContactId
- title
- summary
- notes
- assignedToUserId
- nextActionAt
- tags

### Relations
- belongs to one workspace
- may have one primary contact
- has many calls
- has many custom field values
- has many follow-ups
- has many activities

---

## Contact
### Purpose
Represents person/customer details.

### Required Fields
- id
- workspaceId

### Optional Fields
- name
- phone
- email
- company
- notes

### Relations
- may be linked to one or more leads in future
- in MVP may be primarily attached to one lead

---

## Call
### Purpose
Represents one phone interaction or ingested call record.

### Required Fields
- id
- workspaceId
- leadId
- direction
- startedAt
- endedAt

### Optional Fields
- externalCallId
- provider
- fromPhone
- toPhone
- durationSec
- sourceMetadata

### Relations
- belongs to one lead
- may have one transcript
- may have one recording

---

## Transcript
### Purpose
Stores call transcript text and metadata.

### Required Fields
- id
- callId
- text
- createdAt

### Optional Fields
- language
- confidence
- diarizationData
- rawProviderPayload

### Relations
- belongs to one call

---

## Recording
### Purpose
Stores pointer/metadata for call recording.

### Required Fields
- id
- callId
- storageUrl
- createdAt

### Optional Fields
- durationSec
- mimeType
- sizeBytes

### Relations
- belongs to one call

---

## CustomFieldDefinition
### Purpose
Defines schema for workspace-specific lead fields.

### Required Fields
- id
- workspaceId
- key
- label
- type
- createdAt

### Optional Fields
- description
- options
- required
- isArchived
- createdBy

### Relations
- belongs to one workspace
- has many custom field values

---

## CustomFieldValue
### Purpose
Stores a lead’s value for a custom field.

### Required Fields
- id
- leadId
- fieldDefinitionId
- value

### Relations
- belongs to one lead
- references one field definition

---

## FollowUp
### Purpose
Represents a next action or reminder related to a lead.

### Required Fields
- id
- leadId
- status
- dueAt
- createdAt

### Optional Fields
- assignedToUserId
- title
- description
- completedAt

### Relations
- belongs to one lead

---

## LeadActivity
### Purpose
Immutable event/history record describing changes and activity.

### Required Fields
- id
- leadId
- type
- createdAt

### Optional Fields
- actorType
- actorId
- payload

### Relations
- belongs to one lead

---

## AssistantActionLog
### Purpose
Tracks assistant-originated actions.

### Required Fields
- id
- workspaceId
- actionType
- createdAt
- status

### Optional Fields
- targetLeadId
- requestText
- parsedIntent
- beforeState
- afterState
- requiresConfirmation

### Relations
- may reference a lead
````

---

# 6) `/docs/30-workflows/30-core-user-flows.md`

```md
# Core User Flows

## Flow 1 — Post-Call Auto Lead Capture
### Goal
Turn a completed call into a structured lead record.

### Steps
1. Call recording metadata is received
2. Call recording or transcript is ingested
3. Transcript is processed
4. Structured fields are extracted
5. Lead draft is created or linked
6. User reviews and confirms if needed
7. Lead becomes active in dashboard

### Outcome
A structured lead exists in the system and is visible in dashboard.

---

## Flow 2 — Manual Lead Creation
### Goal
Allow users to create a lead manually without waiting for call ingestion.

### Steps
1. User clicks “New Lead”
2. User fills basic fields
3. User saves lead
4. Lead appears in dashboard
5. Follow-up may be added

### Outcome
A manually created lead is stored and manageable.

---

## Flow 3 — Review Extracted Lead
### Goal
Allow users to validate extracted information before finalizing.

### Steps
1. User opens a new or needs-review lead
2. User sees summary, transcript, extracted fields
3. User edits/corrects fields
4. User confirms save
5. Lead is updated
6. Review event is logged

### Outcome
Lead data is accurate enough for operational use.

---

## Flow 4 — Update Lead Status
### Goal
Move a lead through the workflow.

### Steps
1. User opens lead
2. User changes status
3. System validates transition
4. Status change is saved
5. Activity is logged

### Outcome
Lead lifecycle is reflected accurately.

---

## Flow 5 — Create Follow-Up
### Goal
Ensure next step is not forgotten.

### Steps
1. User or assistant creates follow-up
2. Follow-up is linked to lead
3. Due date/time is set
4. Follow-up is visible in dashboard
5. Reminder/notification may be triggered

### Outcome
A clear next action exists.

---

## Flow 6 — Search Leads via Assistant
### Goal
Find leads quickly through natural language.

### Steps
1. User writes request in assistant panel
2. Assistant resolves intent
3. Assistant calls search/filter tools
4. Assistant returns result list
5. User opens target lead if needed

### Outcome
Lead search is faster than manual filtering alone.

---

## Flow 7 — Update Lead via Assistant
### Goal
Allow background edits without manual form navigation.

### Steps
1. User requests a change in assistant panel
2. Assistant resolves target lead and intended mutation
3. Assistant validates permission and required inputs
4. System applies or previews change
5. Change is logged
6. UI updates

### Outcome
Lead is updated with minimal friction.

---

## Flow 8 — Create Custom Field
### Goal
Allow each workspace to adapt lead schema.

### Steps
1. User requests a new field in settings or via assistant
2. Field definition is created
3. Field becomes available in lead detail view
4. Existing/new leads can store values for it

### Outcome
Workspace-specific lead schema is supported.

## Open Questions
- Which flows require explicit confirmation?
- Which flows can be auto-applied?
- Should duplicate detection run during Flow 1?
```

---

# 7) `/docs/40-ai/41-tool-catalog.md`

```md
# Assistant Tool Catalog

## Overview
The assistant must operate through explicit tools/actions, not direct freeform database access.

All tool calls must be validated, permission-aware, and auditable.

---

## Tool: find_leads
### Purpose
Search and filter leads.

### Inputs
- query?: string
- statuses?: string[]
- assignedTo?: string
- tags?: string[]
- customFieldFilters?: array
- createdFrom?: string
- createdTo?: string
- limit?: number

### Output
- list of lead summaries

---

## Tool: open_lead
### Purpose
Fetch detailed data for one lead.

### Inputs
- leadId: string

### Output
- lead detail object
- custom fields
- calls
- transcript summaries
- follow-ups
- recent activities

---

## Tool: update_lead_fields
### Purpose
Update one or multiple lead fields.

### Inputs
- leadId: string
- updates: object

### Output
- updated lead snapshot
- change summary

### Rules
- immutable source call data cannot be edited here
- changes must be logged

---

## Tool: change_lead_status
### Purpose
Change lead status.

### Inputs
- leadId: string
- newStatus: string
- reason?: string

### Output
- updated lead status
- activity log entry

---

## Tool: create_followup
### Purpose
Create a next action for a lead.

### Inputs
- leadId: string
- title: string
- dueAt: string
- description?: string
- assignedToUserId?: string

### Output
- created follow-up record

---

## Tool: add_note
### Purpose
Attach a note to a lead.

### Inputs
- leadId: string
- note: string

### Output
- note activity record

---

## Tool: summarize_lead
### Purpose
Return a concise operational summary of a lead.

### Inputs
- leadId: string

### Output
- summary text
- important fields
- recent activity
- next step

---

## Tool: list_followups
### Purpose
List pending or overdue follow-ups.

### Inputs
- status?: string
- dueBefore?: string
- assignedToUserId?: string

### Output
- follow-up list

---

## Tool: create_custom_field
### Purpose
Create a custom field definition in a workspace.

### Inputs
- label: string
- key: string
- type: string
- description?: string
- options?: array
- required?: boolean

### Output
- created field definition

### Rules
- available only to allowed roles
- field creation must be logged

---

## Tool: update_custom_field_value
### Purpose
Set or update one lead’s value for a custom field.

### Inputs
- leadId: string
- fieldKey: string
- value: any

### Output
- saved field value

---

## Tool: get_unanswered_or_stale_leads
### Purpose
Return leads that require attention.

### Inputs
- dueBefore?: string
- statuses?: string[]

### Output
- list of stale / follow-up-needed leads

---

## Global Assistant Rules
- Do not invent missing values
- Prefer null / missing over guessing
- Ask for clarification if target lead is ambiguous
- Log all mutations
- Respect role permissions
- Use explicit tools only
```

---

# 8) `/docs/50-dashboard/50-information-architecture.md`

```md
# Information Architecture

## IA Goal
Provide a focused dashboard for reviewing, managing, and acting on leads captured from calls and manual inputs.

## Core Navigation
- Leads
- Follow-ups
- Calls / Inbox
- Assistant
- Settings

## Primary Screens
1. Leads List
2. Lead Detail
3. Follow-Ups View
4. Calls / New Ingested Items
5. Custom Fields Settings
6. Workspace Settings

## Primary Layout Pattern
Preferred MVP layout:
- left: list / table
- center/right: selected detail
- assistant: side panel or drawer

## Main Objects in UI
- Lead
- Contact summary
- Call
- Transcript
- Recording
- Custom fields
- Status
- Follow-up
- Activity history

## Leads Section
### Purpose
Main operational workspace.

### Includes
- lead table/list
- filters
- search
- status indicators
- assignment indicator
- next action indicator

## Lead Detail Section
### Purpose
Inspect and manage a single lead.

### Includes
- lead header
- summary
- standard fields
- custom fields
- call history
- transcript
- recording
- notes
- activity log
- follow-ups

## Calls / Inbox Section
### Purpose
Review newly ingested calls and unresolved extracted drafts.

### Includes
- recent ingested items
- review-needed items
- extraction confidence flags
- link/create lead actions

## Follow-Ups Section
### Purpose
Ensure next steps are visible and actionable.

### Includes
- due today
- overdue
- upcoming
- completed

## Assistant Panel
### Purpose
Natural-language access to lead operations.

### Includes
- chat input
- result cards
- previewed actions
- confirmation states
- mutation feedback

## Settings
### Includes
- custom field definitions
- workspace preferences
- team/users (basic MVP if needed)

## Open Questions
- Do we need a standalone transcript review queue?
- Should assistant be global or lead-scoped by default?
- Should calls appear primarily in lead detail or separate inbox first?
```

---

# 9) `/docs/70-technical/70-system-architecture.md`

````md
# System Architecture

## Overview
The system consists of a dashboard application, ingestion pipelines, AI processing, storage, and workspace-based data management.

## Main Components
- Frontend dashboard
- Backend API
- Ingestion layer
- AI extraction layer
- Database
- File/object storage
- Assistant action layer

## High-Level Architecture
```mermaid
flowchart LR
  A[Telephony / Bot / Manual Input] --> B[Ingestion Layer]
  B --> C[Transcript / Parsing / Extraction]
  C --> D[Lead Draft / Lead Update Logic]
  D --> E[(PostgreSQL)]
  B --> F[(Object Storage)]
  E --> G[Dashboard App]
  G --> H[Assistant Action Layer]
  H --> E
````

## Frontend

### Responsibilities

* render dashboard
* show lead list and lead details
* show transcript and recording
* support manual editing
* support custom fields
* host assistant panel

### Candidate Stack

* Nuxt 3
* Vue 3
* TypeScript
* Tailwind / shadcn-style UI layer if desired

## Backend

### Responsibilities

* workspace/user auth
* lead CRUD
* follow-up CRUD
* custom fields CRUD
* call/transcript ingestion
* audit logging
* assistant tool endpoints

### Candidate Stack

* Nuxt server routes or Fastify
* TypeScript

## AI / Processing Layer

### Responsibilities

* transcription intake
* structured extraction
* summarization
* assistant intent/tool routing

### Candidate Services

* STT provider
* LLM provider

## Database

### Responsibilities

Store:

* workspaces
* users
* leads
* contacts
* calls
* transcripts
* field definitions
* field values
* follow-ups
* activities
* assistant action logs

### Candidate DB

* PostgreSQL

## Object Storage

### Responsibilities

Store:

* call recordings
* optional attachments
* transcript artifacts if needed

## Key Architectural Principles

* one normalized ingestion path
* lead as central operational entity
* assistant operates through explicit tools
* all important mutations are logged
* custom fields are workspace-scoped
* source artifacts remain traceable

## Open Questions

* Nuxt server routes vs separate Fastify service?
* Background jobs queue needed from day 1?
* Webhooks vs polling for telephony ingestion?

````

---

# 10) `/docs/80-delivery/80-mvp-slices.md`

```md
# MVP Slices

## Delivery Principle
Build the product in vertical slices that produce usable end-to-end value.

Do not split work purely by frontend/backend/AI layers.

---

## Slice 1 — Lead Appears After Ingestion
### Goal
A call/transcript can create a visible lead record.

### Includes
- ingestion endpoint
- transcript storage
- extraction into draft fields
- lead creation logic
- lead visible in dashboard list

### Done When
- a new ingested call can produce a lead
- lead is visible in dashboard
- source transcript is linked

---

## Slice 2 — Lead Detail Review
### Goal
User can inspect and correct extracted lead data.

### Includes
- lead detail page
- transcript display
- recording display/link
- editable fields
- save/update flow
- activity logging

### Done When
- user can open a lead and correct fields
- changes are saved and logged

---

## Slice 3 — Status and Follow-Up
### Goal
User can move lead through workflow and set next actions.

### Includes
- statuses
- status update UI
- follow-up creation
- follow-up list
- overdue view

### Done When
- lead status can be changed
- follow-up can be created and tracked

---

## Slice 4 — Custom Fields
### Goal
Each workspace can adapt schema to its business process.

### Includes
- custom field definition UI
- supported field types
- values in lead detail
- storage and display logic

### Done When
- user can create field definitions
- lead can store and display values for them

---

## Slice 5 — Assistant Search and Filtering
### Goal
Assistant can help users find relevant leads quickly.

### Includes
- assistant panel
- find_leads tool
- open_lead tool
- list stale leads tool
- result rendering

### Done When
- assistant can return filtered lead lists
- user can open result leads from assistant output

---

## Slice 6 — Assistant Lead Updates
### Goal
Assistant can apply or preview operational updates.

### Includes
- update_lead_fields tool
- change_status tool
- create_followup tool
- create_custom_field tool (if allowed in MVP)
- action logging

### Done When
- assistant can perform safe lead mutations
- all actions are logged

---

## Slice 7 — Manual Lead Creation
### Goal
System supports direct lead entry even without ingestion.

### Includes
- new lead flow
- basic field entry
- status initialization
- optional follow-up creation

### Done When
- user can create a lead manually from dashboard

---

## Slice 8 — Review Queue / Needs Review
### Goal
Users can identify uncertain or incomplete extracted items.

### Includes
- extraction confidence handling
- needs review status/flag
- review queue UI

### Done When
- low-confidence items are visible and reviewable

## Recommended Build Order
1. Slice 1
2. Slice 2
3. Slice 3
4. Slice 7
5. Slice 4
6. Slice 5
7. Slice 6
8. Slice 8

## Notes
- Slice order may change if existing telephony work is already available
- Assistant should come after stable domain and editing flows
````

---

# 11) `/docs/80-delivery/81-priorities-and-dependencies.md`

Раз ты просил первые 10, я добавлю ещё этот одиннадцатый, потому что он практически обязателен.

```md
# Priorities and Dependencies

## Priority Levels
- P0 — blocks product foundation
- P1 — required for usable MVP
- P2 — useful after core MVP
- P3 — nice to have

## Dependency Table

| Item | Priority | Blocks | Blocked By | Notes |
|------|----------|--------|------------|-------|
| Product brief | P0 | All product decisions | - | Must be stable early |
| MVP scope | P0 | Delivery planning | Product brief | Prevents scope creep |
| Domain model | P0 | API, DB, UI, assistant | Product brief | Core system foundation |
| Entities & relations | P0 | Schema and contracts | Domain model | Required before implementation |
| Core workflows | P0 | UI and backend flows | Product brief, domain model | Defines real product behavior |
| Lead statuses | P1 | Lead operations | Domain model | Can be simple in MVP |
| Custom fields model | P1 | Workspace flexibility | Domain model | Important differentiator |
| Lead detail screen | P1 | Review/edit workflows | Entities, workflows | Core operator view |
| Ingestion flow | P1 | Auto-capture value | Domain model, workflows | Core automation value |
| Follow-up system | P1 | Operational usefulness | Domain model, workflows | Prevents lost next steps |
| Assistant tool catalog | P1 | Assistant implementation | Domain model, workflows | Must exist before AG-UI |
| Assistant panel | P1 | AI interaction UX | Tool catalog | Build after core data flows |
| Audit/history | P1 | Trust, traceability | Domain model | Important for assistant actions |
| Calls/Inbox review | P2 | Better review flow | Ingestion flow | Can be simple initially |
| Saved filters/views | P2 | Faster daily work | Leads list | Useful after base search |
| Telegram bot | P2 | Alternate input path | Domain model, ingestion | Only if needed early |
| Advanced analytics | P3 | Reporting | Stable operations | Not MVP |
| CRM sync | P3 | Expansion | Stable domain model | Post-MVP |
| Billing | P3 | Monetization | Product validation | Post-MVP |

## Critical Path
1. Product brief
2. MVP scope
3. Domain model
4. Entities and relations
5. Core workflows
6. Ingestion flow
7. Lead detail + edit flow
8. Status + follow-up
9. Assistant tool catalog
10. Assistant panel

## Sequencing Rules
- Do not build assistant before tool catalog exists
- Do not design final UI before workflows are written
- Do not overbuild integrations before core lead loop works
- Do not expand channels before post-call flow is stable
```

---

# Как это использовать без перегруза

Мой совет по порядку:

### День 1

* `00-project-overview.md`
* `10-product-brief.md`
* `13-mvp-scope.md`

### День 2

* `20-domain-model.md`
* `21-entities-and-relations.md`
* `30-core-user-flows.md`

### День 3

* `41-tool-catalog.md`
* `50-information-architecture.md`
* `70-system-architecture.md`

### День 4

* `80-mvp-slices.md`
* `81-priorities-and-dependencies.md`

Этого уже хватит, чтобы дальше идти в Claude Code / Codex осмысленно, а не “строить на ощущениях”.

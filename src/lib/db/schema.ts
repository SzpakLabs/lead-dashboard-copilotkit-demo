import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "needs_review",
  "contacted",
  "scheduled",
  "in_progress",
  "won",
  "lost"
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "linkedin",
  "upwork",
  "referral",
  "website",
  "other"
]);

export const followUpStatusEnum = pgEnum("follow_up_status", [
  "open",
  "completed",
  "canceled"
]);

export const ingestionSourceTypeEnum = pgEnum("ingestion_source_type", [
  "pasted_text",
  "pasted_transcript"
]);

export const eventTargetTypeEnum = pgEnum("event_target_type", [
  "lead",
  "contact",
  "follow_up",
  "ingestion_event",
  "custom_field_definition",
  "custom_field_value",
  "source_definition"
]);

export const customFieldTypeEnum = pgEnum("custom_field_type", [
  "text",
  "number",
  "boolean",
  "date"
]);

export const assistantActionStatusEnum = pgEnum("assistant_action_status", [
  "previewed",
  "applied",
  "rejected",
  "failed"
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("owner"),
    isFake: boolean("is_fake").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("users_workspace_id_idx").on(table.workspaceId)
  })
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    source: text("source").notNull().default("other"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("contacts_workspace_id_idx").on(table.workspaceId)
  })
);

export const ingestionEvents = pgTable(
  "ingestion_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    sourceType: ingestionSourceTypeEnum("source_type").notNull(),
    sourceChannel: text("source_channel").notNull().default("other"),
    rawText: text("raw_text").notNull(),
    normalizedText: text("normalized_text").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("ingestion_events_workspace_id_idx").on(
      table.workspaceId
    )
  })
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    ingestionEventId: uuid("ingestion_event_id").references(
      () => ingestionEvents.id,
      { onDelete: "set null" }
    ),
    title: text("title").notNull(),
    status: leadStatusEnum("status").notNull().default("new"),
    source: text("source").notNull().default("other"),
    projectType: text("project_type"),
    problemSummary: text("problem_summary"),
    requestedOutcome: text("requested_outcome"),
    budgetRange: text("budget_range"),
    timeline: text("timeline"),
    nextStep: text("next_step"),
    missingFields: jsonb("missing_fields")
      .$type<string[]>()
      .notNull()
      .default([]),
    confidence: text("confidence").notNull().default("medium"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    followUpDueAt: timestamp("follow_up_due_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("leads_workspace_id_idx").on(table.workspaceId),
    contactIdx: index("leads_contact_id_idx").on(table.contactId),
    statusIdx: index("leads_status_idx").on(table.status)
  })
);

export const sourceDefinitions = pgTable(
  "source_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    presetKey: text("preset_key"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("source_definitions_workspace_id_idx").on(
      table.workspaceId
    ),
    workspaceSlugIdx: uniqueIndex("source_definitions_workspace_slug_idx").on(
      table.workspaceId,
      table.slug
    )
  })
);

export const followUps = pgTable(
  "follow_ups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    status: followUpStatusEnum("status").notNull().default("open"),
    note: text("note").notNull(),
    followUpDueAt: timestamp("follow_up_due_at", {
      withTimezone: true
    }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("follow_ups_workspace_id_idx").on(table.workspaceId),
    leadIdx: index("follow_ups_lead_id_idx").on(table.leadId),
    dueIdx: index("follow_ups_due_at_idx").on(table.followUpDueAt)
  })
);

export const customFieldDefinitions = pgTable(
  "custom_field_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    fieldType: customFieldTypeEnum("field_type").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("custom_field_definitions_workspace_id_idx").on(
      table.workspaceId
    ),
    workspaceKeyIdx: uniqueIndex(
      "custom_field_definitions_workspace_key_idx"
    ).on(table.workspaceId, table.key)
  })
);

export const customFieldValues = pgTable(
  "custom_field_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    definitionId: uuid("definition_id")
      .notNull()
      .references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
    value: text("value"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("custom_field_values_workspace_id_idx").on(
      table.workspaceId
    ),
    leadIdx: index("custom_field_values_lead_id_idx").on(table.leadId),
    definitionIdx: index("custom_field_values_definition_id_idx").on(
      table.definitionId
    ),
    leadDefinitionIdx: uniqueIndex(
      "custom_field_values_lead_definition_idx"
    ).on(table.leadId, table.definitionId)
  })
);

export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    targetType: eventTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    before: jsonb("before").$type<Record<string, unknown> | null>(),
    after: jsonb("after").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("lead_events_workspace_id_idx").on(table.workspaceId),
    leadIdx: index("lead_events_lead_id_idx").on(table.leadId)
  })
);

export const assistantActionLogs = pgTable(
  "assistant_action_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "cascade"
    }),
    toolName: text("tool_name").notNull(),
    status: assistantActionStatusEnum("status").notNull(),
    summary: text("summary").notNull(),
    preview: jsonb("preview").$type<Record<string, unknown>>().notNull(),
    result: jsonb("result").$type<Record<string, unknown> | null>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    workspaceIdx: index("assistant_action_logs_workspace_id_idx").on(
      table.workspaceId
    ),
    leadIdx: index("assistant_action_logs_lead_id_idx").on(table.leadId),
    statusIdx: index("assistant_action_logs_status_idx").on(table.status)
  })
);

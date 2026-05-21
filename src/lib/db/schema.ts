import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
  "ingestion_event"
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
    source: leadSourceEnum("source").notNull().default("other"),
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
    sourceChannel: leadSourceEnum("source_channel").notNull().default("other"),
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
    source: leadSourceEnum("source").notNull().default("other"),
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

import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  assistantActionLogs,
  contacts,
  ingestionEvents,
  leads,
  users,
  workspaces
} from "@/lib/db/schema";
import {
  changeLeadStatusToolInputSchema,
  checkAvailabilityInputSchema,
  createFollowUpToolInputSchema,
  findLeadsInputSchema,
  listCalendarItemsInputSchema,
  type AssistantMutationChange,
  type AssistantMutationResult,
  type AssistantCalendarItem,
  type AssistantLeadCard,
  type CheckAvailabilityResult,
  type FindLeadsResult,
  type ListCalendarItemsResult,
  openLeadInputSchema,
  type OpenLeadResult,
  rejectAssistantMutationInputSchema,
  updateLeadFieldsInputSchema
} from "@/lib/assistant/lead-tool-schemas";
import { checkCalendarAvailability } from "@/lib/domain/calendar/check-availability";
import {
  getCalendarItems,
  type CalendarItem
} from "@/lib/domain/calendar/get-calendar-items";
import { createFollowUp } from "@/lib/domain/followups/manage-followups";
import { changeLeadStatus } from "@/lib/domain/leads/change-lead-status";
import { getLeadStatusLabel, type LeadStatus } from "@/lib/domain/leads/status";
import { updateLead } from "@/lib/domain/leads/update-lead";

const demoWorkspaceSlug = "software-services-demo";

const updateLeadFieldsPreviewPayloadSchema = z.object({
  leadId: z.string().uuid(),
  after: z.object({
    leadId: z.string().uuid(),
    title: z.string(),
    source: z.enum(["linkedin", "upwork", "referral", "website", "other"]),
    contactName: z.string(),
    company: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    projectType: z.string().nullable(),
    problemSummary: z.string().nullable(),
    requestedOutcome: z.string().nullable(),
    budgetRange: z.string().nullable(),
    timeline: z.string().nullable(),
    nextStep: z.string().nullable()
  }),
  changes: z.array(
    z.object({
      field: z.string(),
      before: z.string().nullable(),
      after: z.string().nullable()
    })
  )
});

const changeLeadStatusPreviewPayloadSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum([
    "new",
    "needs_review",
    "contacted",
    "scheduled",
    "in_progress",
    "won",
    "lost"
  ])
});

const createFollowUpPreviewPayloadSchema = z.object({
  leadId: z.string().uuid(),
  note: z.string(),
  followUpDueAt: z.string()
});

export const findLeadsTool = defineTool({
  name: "find_leads",
  description:
    "Search the current demo workspace leads by title, contact, company, project type, summary, timeline, next step, source, or status. Use this before opening a lead when the target is ambiguous.",
  parameters: findLeadsInputSchema,
  execute: findLeads
});

export const openLeadTool = defineTool({
  name: "open_lead",
  description:
    "Fetch one lead by ID and return the dashboard URL plus lead context. This is read-only and does not mutate lead data.",
  parameters: openLeadInputSchema,
  execute: openLead
});

export const listCalendarItemsTool = defineTool({
  name: "list_calendar_items",
  description:
    "List internal lead-related calendar items in the current demo workspace for an explicit ISO date-time range. Use this for calendar questions that ask what is scheduled. Answers must start with 'Based on this dashboard...'.",
  parameters: listCalendarItemsInputSchema,
  execute: listCalendarItems
});

export const checkAvailabilityTool = defineTool({
  name: "check_availability",
  description:
    "Check whether one explicit slot is free using internal lead-related calendar data only. Call this only after the user provides date, time, duration, timezone, and working-hours context. If any of those are missing, ask a clarifying question instead. Answers must start with 'Based on this dashboard...'.",
  parameters: checkAvailabilityInputSchema,
  execute: checkAvailability
});

export const updateLeadFieldsTool = defineTool({
  name: "update_lead_fields",
  description:
    "Preview or apply standard lead/contact field updates. Always call in preview mode first, ask the user to confirm the preview, then apply only with the returned previewId.",
  parameters: updateLeadFieldsInputSchema,
  execute: updateLeadFields
});

export const changeLeadStatusTool = defineTool({
  name: "change_lead_status",
  description:
    "Preview or apply a lead status change. Always call in preview mode first, ask the user to confirm the preview, then apply only with the returned previewId.",
  parameters: changeLeadStatusToolInputSchema,
  execute: changeLeadStatusFromAssistant
});

export const createFollowUpTool = defineTool({
  name: "create_followup",
  description:
    "Preview or apply a new follow-up. Always call in preview mode first, ask the user to confirm the preview, then apply only with the returned previewId.",
  parameters: createFollowUpToolInputSchema,
  execute: createFollowUpFromAssistant
});

export const rejectAssistantMutationTool = defineTool({
  name: "reject_assistant_mutation",
  description:
    "Mark an assistant mutation preview as rejected after the user denies confirmation. This does not change lead data.",
  parameters: rejectAssistantMutationInputSchema,
  execute: rejectAssistantMutation
});

export const assistantTools = [
  findLeadsTool,
  openLeadTool,
  listCalendarItemsTool,
  checkAvailabilityTool,
  updateLeadFieldsTool,
  changeLeadStatusTool,
  createFollowUpTool,
  rejectAssistantMutationTool
];

export async function findLeads(input: unknown): Promise<FindLeadsResult> {
  const parsed = findLeadsInputSchema.parse(input);
  const query = parsed.query?.trim() || null;
  const db = getDb();
  const workspaceId = await getDemoWorkspaceId();
  const searchCondition = query
    ? or(
        ilike(leads.title, `%${query}%`),
        ilike(leads.source, `%${query}%`),
        ilike(leads.projectType, `%${query}%`),
        ilike(leads.problemSummary, `%${query}%`),
        ilike(leads.timeline, `%${query}%`),
        ilike(leads.nextStep, `%${query}%`),
        ilike(contacts.name, `%${query}%`),
        ilike(contacts.company, `%${query}%`)
      )
    : undefined;
  const conditions = [
    eq(leads.workspaceId, workspaceId),
    parsed.status ? eq(leads.status, parsed.status) : undefined,
    searchCondition
  ].filter((condition): condition is SQL => Boolean(condition));
  const rows = await db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      source: leads.source,
      projectType: leads.projectType,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      followUpDueAt: leads.followUpDueAt,
      updatedAt: leads.updatedAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(and(...conditions))
    .orderBy(desc(leads.updatedAt))
    .limit(parsed.limit);

  return {
    query,
    count: rows.length,
    leads: rows.map(toAssistantLeadCard)
  };
}

export async function openLead(input: unknown): Promise<OpenLeadResult> {
  const parsed = openLeadInputSchema.parse(input);
  const db = getDb();
  const workspaceId = await getDemoWorkspaceId();
  const [lead] = await db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      source: leads.source,
      projectType: leads.projectType,
      problemSummary: leads.problemSummary,
      requestedOutcome: leads.requestedOutcome,
      budgetRange: leads.budgetRange,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      followUpDueAt: leads.followUpDueAt,
      scheduledAt: leads.scheduledAt,
      updatedAt: leads.updatedAt,
      contactName: contacts.name,
      company: contacts.company,
      email: contacts.email,
      phone: contacts.phone,
      sourceType: ingestionEvents.sourceType,
      sourceChannel: ingestionEvents.sourceChannel,
      rawText: ingestionEvents.rawText,
      ingestedAt: ingestionEvents.createdAt
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .leftJoin(ingestionEvents, eq(leads.ingestionEventId, ingestionEvents.id))
    .where(and(eq(leads.id, parsed.leadId), eq(leads.workspaceId, workspaceId)))
    .limit(1);

  if (!lead) {
    throw new Error("Lead was not found in the demo workspace");
  }

  return {
    lead: {
      ...toAssistantLeadCard(lead),
      email: lead.email,
      phone: lead.phone,
      problemSummary: lead.problemSummary,
      requestedOutcome: lead.requestedOutcome,
      budgetRange: lead.budgetRange,
      scheduledAt: lead.scheduledAt?.toISOString() ?? null,
      sourceContext: {
        sourceType: lead.sourceType,
        sourceChannel: lead.sourceChannel,
        rawText: lead.rawText,
        ingestedAt: lead.ingestedAt?.toISOString() ?? null
      }
    }
  };
}

export async function listCalendarItems(
  input: unknown
): Promise<ListCalendarItemsResult> {
  const parsed = listCalendarItemsInputSchema.parse(input);
  const startsAt = new Date(parsed.startsAt);
  const endsAt = new Date(parsed.endsAt);

  if (endsAt <= startsAt) {
    throw new Error("Calendar range end must be after start");
  }

  const workspaceId = await getDemoWorkspaceId();
  const items = (await getCalendarItems({ workspaceId }))
    .filter((item) => item.startsAt >= startsAt && item.startsAt < endsAt)
    .slice(0, parsed.limit);

  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    count: items.length,
    items: items.map(toAssistantCalendarItem),
    answerPrefix: "Based on this dashboard"
  };
}

export async function checkAvailability(
  input: unknown
): Promise<CheckAvailabilityResult> {
  const parsed = checkAvailabilityInputSchema.parse(input);
  const startsAt = new Date(parsed.startsAt);
  const workspaceId = await getDemoWorkspaceId();
  const result = checkCalendarAvailability({
    startsAt,
    durationMinutes: parsed.durationMinutes,
    timezone: parsed.timezone,
    workingHoursStart: parsed.workingHoursStart,
    workingHoursEnd: parsed.workingHoursEnd,
    items: await getCalendarItems({ workspaceId })
  });

  return {
    available: result.available,
    startsAt: result.startsAt.toISOString(),
    endsAt: result.endsAt.toISOString(),
    timezone: result.timezone,
    outsideWorkingHours: result.outsideWorkingHours,
    conflicts: result.conflicts.map(toAssistantCalendarItem),
    answerPrefix: result.answerPrefix,
    limitation: result.limitation
  };
}

export async function updateLeadFields(
  input: unknown
): Promise<AssistantMutationResult> {
  const parsed = updateLeadFieldsInputSchema.parse(input);

  if (parsed.mode === "apply") {
    const preview = await getAssistantActionPreview(
      parsed.previewId,
      "update_lead_fields"
    );
    const payload = updateLeadFieldsPreviewPayloadSchema.parse(preview.preview);

    try {
      await updateLead(toUpdateLeadInput(payload.after));
      await markAssistantActionApplied(parsed.previewId, {
        leadId: payload.leadId,
        appliedFields: payload.changes.map((change) => change.field)
      });

      return {
        status: "applied",
        result: {
          previewId: parsed.previewId,
          toolName: "update_lead_fields",
          leadId: payload.leadId,
          applied: true,
          summary: preview.summary
        }
      };
    } catch (error) {
      await markAssistantActionFailed(parsed.previewId, error);
      throw error;
    }
  }

  const current = await getLeadEditableSnapshot(parsed.leadId);
  const after = {
    leadId: current.leadId,
    title: parsed.fields.title ?? current.title,
    source: parsed.fields.source ?? current.source,
    contactName: parsed.fields.contactName ?? current.contactName,
    company: normalizeNullableInput(parsed.fields.company, current.company),
    email: normalizeNullableInput(parsed.fields.email, current.email),
    phone: normalizeNullableInput(parsed.fields.phone, current.phone),
    projectType: normalizeNullableInput(
      parsed.fields.projectType,
      current.projectType
    ),
    problemSummary: normalizeNullableInput(
      parsed.fields.problemSummary,
      current.problemSummary
    ),
    requestedOutcome: normalizeNullableInput(
      parsed.fields.requestedOutcome,
      current.requestedOutcome
    ),
    budgetRange: normalizeNullableInput(
      parsed.fields.budgetRange,
      current.budgetRange
    ),
    timeline: normalizeNullableInput(parsed.fields.timeline, current.timeline),
    nextStep: normalizeNullableInput(parsed.fields.nextStep, current.nextStep)
  };
  const changes = buildChanges(current, after);

  if (changes.length === 0) {
    throw new Error("No lead fields would change");
  }

  const summary = `Update ${changes.length} field${changes.length === 1 ? "" : "s"} for ${current.title}.`;
  const previewId = await createAssistantActionPreview({
    leadId: current.leadId,
    toolName: "update_lead_fields",
    summary,
    preview: {
      leadId: current.leadId,
      before: current,
      after,
      changes
    }
  });

  return {
    status: "preview",
    preview: {
      previewId,
      toolName: "update_lead_fields",
      leadId: current.leadId,
      summary,
      changes,
      requiresConfirmation: true
    }
  };
}

export async function changeLeadStatusFromAssistant(
  input: unknown
): Promise<AssistantMutationResult> {
  const parsed = changeLeadStatusToolInputSchema.parse(input);

  if (parsed.mode === "apply") {
    const preview = await getAssistantActionPreview(
      parsed.previewId,
      "change_lead_status"
    );
    const payload = changeLeadStatusPreviewPayloadSchema.parse(preview.preview);

    try {
      await changeLeadStatus({
        leadId: payload.leadId,
        status: payload.status
      });
      await markAssistantActionApplied(parsed.previewId, {
        leadId: payload.leadId,
        status: payload.status
      });

      return {
        status: "applied",
        result: {
          previewId: parsed.previewId,
          toolName: "change_lead_status",
          leadId: payload.leadId,
          applied: true,
          summary: preview.summary
        }
      };
    } catch (error) {
      await markAssistantActionFailed(parsed.previewId, error);
      throw error;
    }
  }

  const current = await getLeadEditableSnapshot(parsed.leadId);
  const beforeLabel = getLeadStatusLabel(current.status) ?? current.status;
  const afterLabel = getLeadStatusLabel(parsed.status) ?? parsed.status;
  const changes = [
    {
      field: "status",
      before: beforeLabel,
      after: afterLabel
    }
  ];
  const summary = `Change ${current.title} status from ${beforeLabel} to ${afterLabel}.`;
  const previewId = await createAssistantActionPreview({
    leadId: current.leadId,
    toolName: "change_lead_status",
    summary,
    preview: {
      leadId: current.leadId,
      status: parsed.status,
      changes
    }
  });

  return {
    status: "preview",
    preview: {
      previewId,
      toolName: "change_lead_status",
      leadId: current.leadId,
      summary,
      changes,
      requiresConfirmation: true
    }
  };
}

export async function createFollowUpFromAssistant(
  input: unknown
): Promise<AssistantMutationResult> {
  const parsed = createFollowUpToolInputSchema.parse(input);

  if (parsed.mode === "apply") {
    const preview = await getAssistantActionPreview(
      parsed.previewId,
      "create_followup"
    );
    const payload = createFollowUpPreviewPayloadSchema.parse(preview.preview);

    try {
      const followUp = await createFollowUp({
        leadId: payload.leadId,
        note: payload.note,
        followUpDueAt: payload.followUpDueAt
      });
      await markAssistantActionApplied(parsed.previewId, {
        leadId: payload.leadId,
        followUpId: followUp.id
      });

      return {
        status: "applied",
        result: {
          previewId: parsed.previewId,
          toolName: "create_followup",
          leadId: payload.leadId,
          applied: true,
          summary: preview.summary
        }
      };
    } catch (error) {
      await markAssistantActionFailed(parsed.previewId, error);
      throw error;
    }
  }

  const current = await getLeadEditableSnapshot(parsed.leadId);
  const followUpDueAt = new Date(parsed.followUpDueAt).toISOString();
  const changes = [
    {
      field: "followUp",
      before: null,
      after: `${parsed.note} (${followUpDueAt})`
    }
  ];
  const summary = `Create follow-up for ${current.title}.`;
  const previewId = await createAssistantActionPreview({
    leadId: current.leadId,
    toolName: "create_followup",
    summary,
    preview: {
      leadId: current.leadId,
      note: parsed.note,
      followUpDueAt,
      changes
    }
  });

  return {
    status: "preview",
    preview: {
      previewId,
      toolName: "create_followup",
      leadId: current.leadId,
      summary,
      changes,
      requiresConfirmation: true
    }
  };
}

export async function rejectAssistantMutation(input: unknown) {
  const parsed = rejectAssistantMutationInputSchema.parse(input);
  const preview = await getAssistantActionPreview(parsed.previewId);

  await getDb()
    .update(assistantActionLogs)
    .set({
      status: "rejected",
      updatedAt: new Date()
    })
    .where(eq(assistantActionLogs.id, parsed.previewId));

  return {
    previewId: parsed.previewId,
    rejected: true,
    summary: preview.summary
  };
}

async function getDemoWorkspaceId() {
  const db = getDb();
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, demoWorkspaceSlug))
    .limit(1);

  if (!workspace) {
    throw new Error("Seeded workspace software-services-demo was not found");
  }

  return workspace.id;
}

async function getDemoContext() {
  const db = getDb();
  const workspaceId = await getDemoWorkspaceId();
  const [actor] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.workspaceId, workspaceId))
    .limit(1);

  return { workspaceId, actorUserId: actor?.id };
}

async function getLeadEditableSnapshot(leadId: string) {
  const db = getDb();
  const workspaceId = await getDemoWorkspaceId();
  const [lead] = await db
    .select({
      leadId: leads.id,
      title: leads.title,
      status: leads.status,
      source: leads.source,
      projectType: leads.projectType,
      problemSummary: leads.problemSummary,
      requestedOutcome: leads.requestedOutcome,
      budgetRange: leads.budgetRange,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      contactName: contacts.name,
      company: contacts.company,
      email: contacts.email,
      phone: contacts.phone
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(and(eq(leads.id, leadId), eq(leads.workspaceId, workspaceId)))
    .limit(1);

  if (!lead) {
    throw new Error("Lead was not found in the demo workspace");
  }

  return lead;
}

async function createAssistantActionPreview(input: {
  leadId: string;
  toolName: string;
  summary: string;
  preview: Record<string, unknown>;
}) {
  const db = getDb();
  const context = await getDemoContext();
  const [log] = await db
    .insert(assistantActionLogs)
    .values({
      workspaceId: context.workspaceId,
      actorUserId: context.actorUserId,
      leadId: input.leadId,
      toolName: input.toolName,
      status: "previewed",
      summary: input.summary,
      preview: input.preview
    })
    .returning({ id: assistantActionLogs.id });

  if (!log) {
    throw new Error("Assistant action preview could not be logged");
  }

  return log.id;
}

async function getAssistantActionPreview(previewId: string, toolName?: string) {
  const db = getDb();
  const workspaceId = await getDemoWorkspaceId();
  const conditions = [
    eq(assistantActionLogs.id, previewId),
    eq(assistantActionLogs.workspaceId, workspaceId),
    toolName ? eq(assistantActionLogs.toolName, toolName) : undefined,
    eq(assistantActionLogs.status, "previewed")
  ].filter((condition): condition is SQL => Boolean(condition));
  const [preview] = await db
    .select({
      id: assistantActionLogs.id,
      summary: assistantActionLogs.summary,
      preview: assistantActionLogs.preview
    })
    .from(assistantActionLogs)
    .where(and(...conditions))
    .limit(1);

  if (!preview) {
    throw new Error(
      "Assistant action preview was not found or already applied"
    );
  }

  return preview;
}

async function markAssistantActionApplied(
  previewId: string,
  result: Record<string, unknown>
) {
  await getDb()
    .update(assistantActionLogs)
    .set({
      status: "applied",
      result,
      updatedAt: new Date()
    })
    .where(eq(assistantActionLogs.id, previewId));
}

async function markAssistantActionFailed(previewId: string, error: unknown) {
  await getDb()
    .update(assistantActionLogs)
    .set({
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      updatedAt: new Date()
    })
    .where(eq(assistantActionLogs.id, previewId));
}

function normalizeNullableInput(
  value: string | null | undefined,
  fallback: string | null
) {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function toUpdateLeadInput(input: {
  leadId: string;
  title: string;
  source: "linkedin" | "upwork" | "referral" | "website" | "other";
  contactName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  projectType: string | null;
  problemSummary: string | null;
  requestedOutcome: string | null;
  budgetRange: string | null;
  timeline: string | null;
  nextStep: string | null;
}) {
  return {
    leadId: input.leadId,
    title: input.title,
    source: input.source,
    contactName: input.contactName,
    company: input.company ?? undefined,
    email: input.email ?? undefined,
    phone: input.phone ?? undefined,
    projectType: input.projectType ?? undefined,
    problemSummary: input.problemSummary ?? undefined,
    requestedOutcome: input.requestedOutcome ?? undefined,
    budgetRange: input.budgetRange ?? undefined,
    timeline: input.timeline ?? undefined,
    nextStep: input.nextStep ?? undefined
  };
}

function buildChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): AssistantMutationChange[] {
  return Object.entries(after)
    .filter(([field]) => field !== "leadId")
    .filter(([field, value]) => before[field] !== value)
    .map(([field, value]) => ({
      field,
      before: toPreviewValue(before[field]),
      after: toPreviewValue(value)
    }));
}

function toPreviewValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function toAssistantCalendarItem(item: CalendarItem): AssistantCalendarItem {
  return {
    id: item.id,
    leadId: item.leadId,
    url: `/?leadId=${item.leadId}`,
    title: item.title,
    contactName: item.contactName,
    company: item.company,
    status: item.status,
    statusLabel: getLeadStatusLabel(item.status) ?? item.status,
    kind: item.kind,
    startsAt: item.startsAt.toISOString(),
    note: item.note
  };
}

function toAssistantLeadCard(row: {
  id: string;
  title: string;
  status: LeadStatus;
  source: string;
  projectType: string | null;
  timeline: string | null;
  nextStep: string | null;
  followUpDueAt: Date | null;
  updatedAt: Date;
  contactName: string;
  company: string | null;
}): AssistantLeadCard {
  return {
    id: row.id,
    url: `/?leadId=${row.id}`,
    title: row.title,
    status: row.status,
    statusLabel: getLeadStatusLabel(row.status) ?? row.status,
    source: row.source,
    contactName: row.contactName,
    company: row.company,
    projectType: row.projectType,
    timeline: row.timeline,
    nextStep: row.nextStep,
    followUpDueAt: row.followUpDueAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString()
  };
}

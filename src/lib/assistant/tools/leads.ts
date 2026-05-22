import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { defineTool } from "@copilotkit/runtime/v2";
import { getDb } from "@/lib/db";
import { contacts, ingestionEvents, leads, workspaces } from "@/lib/db/schema";
import {
  checkAvailabilityInputSchema,
  findLeadsInputSchema,
  listCalendarItemsInputSchema,
  type AssistantCalendarItem,
  type AssistantLeadCard,
  type CheckAvailabilityResult,
  type FindLeadsResult,
  type ListCalendarItemsResult,
  openLeadInputSchema,
  type OpenLeadResult
} from "@/lib/assistant/lead-tool-schemas";
import { checkCalendarAvailability } from "@/lib/domain/calendar/check-availability";
import {
  getCalendarItems,
  type CalendarItem
} from "@/lib/domain/calendar/get-calendar-items";
import { getLeadStatusLabel, type LeadStatus } from "@/lib/domain/leads/status";

const demoWorkspaceSlug = "software-services-demo";

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

export const assistantTools = [
  findLeadsTool,
  openLeadTool,
  listCalendarItemsTool,
  checkAvailabilityTool
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

import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { defineTool } from "@copilotkit/runtime/v2";
import { getDb } from "@/lib/db";
import { contacts, ingestionEvents, leads, workspaces } from "@/lib/db/schema";
import {
  findLeadsInputSchema,
  type AssistantLeadCard,
  type FindLeadsResult,
  openLeadInputSchema,
  type OpenLeadResult
} from "@/lib/assistant/lead-tool-schemas";
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

export const assistantTools = [findLeadsTool, openLeadTool];

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

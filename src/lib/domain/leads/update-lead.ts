import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  contacts,
  leadEvents,
  leads,
  users,
  workspaces
} from "@/lib/db/schema";

export const updateLeadInputSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().trim().min(1).max(180),
  source: z.string().trim().min(1).max(80).default("other"),
  contactName: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  phone: z.string().trim().max(80).optional(),
  projectType: z.string().trim().max(120).optional(),
  problemSummary: z.string().trim().max(1_000).optional(),
  requestedOutcome: z.string().trim().max(1_000).optional(),
  budgetRange: z.string().trim().max(120).optional(),
  timeline: z.string().trim().max(180).optional(),
  nextStep: z.string().trim().max(240).optional()
});

export type UpdateLeadInput = z.infer<typeof updateLeadInputSchema>;

export async function updateLead(input: UpdateLeadInput) {
  const parsed = updateLeadInputSchema.parse(input);
  const db = getDb();
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, "software-services-demo"))
    .limit(1);

  if (!workspace) {
    throw new Error("Seeded workspace software-services-demo was not found");
  }

  const [actor] = await db
    .select()
    .from(users)
    .where(eq(users.workspaceId, workspace.id))
    .limit(1);

  const [current] = await db
    .select({
      leadId: leads.id,
      contactId: leads.contactId,
      title: leads.title,
      source: leads.source,
      projectType: leads.projectType,
      problemSummary: leads.problemSummary,
      requestedOutcome: leads.requestedOutcome,
      budgetRange: leads.budgetRange,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      missingFields: leads.missingFields,
      contactName: contacts.name,
      company: contacts.company,
      email: contacts.email,
      phone: contacts.phone
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(
      and(eq(leads.id, parsed.leadId), eq(leads.workspaceId, workspace.id))
    )
    .limit(1);

  if (!current) {
    throw new Error("Lead was not found");
  }

  const nextLead = {
    title: parsed.title,
    source: parsed.source,
    projectType: toNullable(parsed.projectType),
    problemSummary: toNullable(parsed.problemSummary),
    requestedOutcome: toNullable(parsed.requestedOutcome),
    budgetRange: toNullable(parsed.budgetRange),
    timeline: toNullable(parsed.timeline),
    nextStep: toNullable(parsed.nextStep),
    missingFields: getMissingFields(parsed),
    updatedAt: new Date()
  };
  const nextContact = {
    name: parsed.contactName,
    company: toNullable(parsed.company),
    email: toNullable(parsed.email),
    phone: toNullable(parsed.phone),
    source: parsed.source,
    updatedAt: new Date()
  };
  const before = {
    title: current.title,
    source: current.source,
    contactName: current.contactName,
    company: current.company,
    email: current.email,
    phone: current.phone,
    projectType: current.projectType,
    problemSummary: current.problemSummary,
    requestedOutcome: current.requestedOutcome,
    budgetRange: current.budgetRange,
    timeline: current.timeline,
    nextStep: current.nextStep,
    missingFields: current.missingFields
  };
  const after = {
    title: nextLead.title,
    source: nextLead.source,
    contactName: nextContact.name,
    company: nextContact.company,
    email: nextContact.email,
    phone: nextContact.phone,
    projectType: nextLead.projectType,
    problemSummary: nextLead.problemSummary,
    requestedOutcome: nextLead.requestedOutcome,
    budgetRange: nextLead.budgetRange,
    timeline: nextLead.timeline,
    nextStep: nextLead.nextStep,
    missingFields: nextLead.missingFields
  };

  return db.transaction(async (tx) => {
    const [updatedContact] = await tx
      .update(contacts)
      .set(nextContact)
      .where(eq(contacts.id, current.contactId))
      .returning();

    const [updatedLead] = await tx
      .update(leads)
      .set(nextLead)
      .where(eq(leads.id, current.leadId))
      .returning();

    await tx.insert(leadEvents).values({
      workspaceId: workspace.id,
      actorUserId: actor?.id,
      leadId: current.leadId,
      targetType: "lead",
      targetId: current.leadId,
      action: "lead.updated",
      summary: `Updated lead details for ${parsed.contactName}.`,
      before,
      after
    });

    return {
      lead: updatedLead,
      contact: updatedContact,
      before,
      after
    };
  });
}

function toNullable(value: string | undefined | null) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function getMissingFields(input: UpdateLeadInput) {
  const fields: Array<[string, string | undefined]> = [
    ["projectType", input.projectType],
    ["problemSummary", input.problemSummary],
    ["requestedOutcome", input.requestedOutcome],
    ["nextStep", input.nextStep]
  ];

  return fields.filter(([, value]) => !value?.trim()).map(([field]) => field);
}

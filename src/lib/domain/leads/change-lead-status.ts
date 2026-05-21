import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { leadEvents, leads, users, workspaces } from "@/lib/db/schema";
import {
  canChangeLeadStatus,
  getLeadStatusLabel,
  leadStatusSchema
} from "./status";

export const changeLeadStatusInputSchema = z.object({
  leadId: z.string().uuid(),
  status: leadStatusSchema
});

export type ChangeLeadStatusInput = z.infer<typeof changeLeadStatusInputSchema>;

export async function changeLeadStatus(input: ChangeLeadStatusInput) {
  const parsed = changeLeadStatusInputSchema.parse(input);
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
      id: leads.id,
      title: leads.title,
      status: leads.status
    })
    .from(leads)
    .where(
      and(eq(leads.id, parsed.leadId), eq(leads.workspaceId, workspace.id))
    )
    .limit(1);

  if (!current) {
    throw new Error("Lead was not found");
  }

  if (!canChangeLeadStatus(current.status, parsed.status)) {
    throw new Error(
      `Cannot change lead status from ${current.status} to ${parsed.status}`
    );
  }

  return db.transaction(async (tx) => {
    const [updatedLead] = await tx
      .update(leads)
      .set({ status: parsed.status, updatedAt: new Date() })
      .where(eq(leads.id, current.id))
      .returning();

    await tx.insert(leadEvents).values({
      workspaceId: workspace.id,
      actorUserId: actor?.id,
      leadId: current.id,
      targetType: "lead",
      targetId: current.id,
      action: "lead.status_changed",
      summary: `Changed status for ${current.title} to ${getLeadStatusLabel(parsed.status)}.`,
      before: { status: current.status },
      after: { status: parsed.status }
    });

    return {
      lead: updatedLead,
      before: { status: current.status },
      after: { status: parsed.status }
    };
  });
}

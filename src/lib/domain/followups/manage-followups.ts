import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  followUps,
  leadEvents,
  leads,
  users,
  workspaces
} from "@/lib/db/schema";

const followUpDueAtSchema = z.union([
  z.date(),
  z.string().trim().min(1).transform(toDate)
]);

export const createFollowUpInputSchema = z.object({
  leadId: z.string().uuid(),
  note: z.string().trim().min(1).max(1_000),
  followUpDueAt: followUpDueAtSchema
});

export const updateFollowUpInputSchema = z.object({
  followUpId: z.string().uuid(),
  note: z.string().trim().min(1).max(1_000),
  followUpDueAt: followUpDueAtSchema
});

export const completeFollowUpInputSchema = z.object({
  followUpId: z.string().uuid()
});

export type CreateFollowUpInput = z.input<typeof createFollowUpInputSchema>;
export type UpdateFollowUpInput = z.input<typeof updateFollowUpInputSchema>;
export type CompleteFollowUpInput = z.input<typeof completeFollowUpInputSchema>;

export async function createFollowUp(input: CreateFollowUpInput) {
  const parsed = createFollowUpInputSchema.parse(input);
  const db = getDb();
  const context = await getDemoContext();
  const lead = await getLeadForWorkspace(parsed.leadId, context.workspace.id);

  return db.transaction(async (tx) => {
    const [followUp] = await tx
      .insert(followUps)
      .values({
        workspaceId: context.workspace.id,
        actorUserId: context.actor?.id,
        leadId: lead.id,
        note: parsed.note,
        followUpDueAt: parsed.followUpDueAt
      })
      .returning();

    await updateLeadNextFollowUp(tx, lead.id);

    await tx.insert(leadEvents).values({
      workspaceId: context.workspace.id,
      actorUserId: context.actor?.id,
      leadId: lead.id,
      targetType: "follow_up",
      targetId: followUp.id,
      action: "follow_up.created",
      summary: `Created follow-up for ${lead.title}.`,
      after: {
        note: followUp.note,
        followUpDueAt: followUp.followUpDueAt.toISOString(),
        status: followUp.status
      }
    });

    return followUp;
  });
}

export async function updateFollowUp(input: UpdateFollowUpInput) {
  const parsed = updateFollowUpInputSchema.parse(input);
  const db = getDb();
  const context = await getDemoContext();
  const current = await getFollowUpForWorkspace(
    parsed.followUpId,
    context.workspace.id
  );

  return db.transaction(async (tx) => {
    const [followUp] = await tx
      .update(followUps)
      .set({
        note: parsed.note,
        followUpDueAt: parsed.followUpDueAt,
        updatedAt: new Date()
      })
      .where(eq(followUps.id, current.id))
      .returning();

    await updateLeadNextFollowUp(tx, current.leadId);

    await tx.insert(leadEvents).values({
      workspaceId: context.workspace.id,
      actorUserId: context.actor?.id,
      leadId: current.leadId,
      targetType: "follow_up",
      targetId: current.id,
      action: "follow_up.updated",
      summary: "Updated follow-up.",
      before: {
        note: current.note,
        followUpDueAt: current.followUpDueAt.toISOString()
      },
      after: {
        note: followUp.note,
        followUpDueAt: followUp.followUpDueAt.toISOString()
      }
    });

    return followUp;
  });
}

export async function completeFollowUp(input: CompleteFollowUpInput) {
  const parsed = completeFollowUpInputSchema.parse(input);
  const db = getDb();
  const context = await getDemoContext();
  const current = await getFollowUpForWorkspace(
    parsed.followUpId,
    context.workspace.id
  );

  return db.transaction(async (tx) => {
    const completedAt = new Date();
    const [followUp] = await tx
      .update(followUps)
      .set({
        status: "completed",
        completedAt,
        updatedAt: completedAt
      })
      .where(eq(followUps.id, current.id))
      .returning();

    await updateLeadNextFollowUp(tx, current.leadId);

    await tx.insert(leadEvents).values({
      workspaceId: context.workspace.id,
      actorUserId: context.actor?.id,
      leadId: current.leadId,
      targetType: "follow_up",
      targetId: current.id,
      action: "follow_up.completed",
      summary: "Completed follow-up.",
      before: { status: current.status, completedAt: current.completedAt },
      after: {
        status: followUp.status,
        completedAt: followUp.completedAt?.toISOString()
      }
    });

    return followUp;
  });
}

async function getDemoContext() {
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

  return { workspace, actor };
}

async function getLeadForWorkspace(leadId: string, workspaceId: string) {
  const db = getDb();
  const [lead] = await db
    .select({
      id: leads.id,
      title: leads.title
    })
    .from(leads)
    .where(and(eq(leads.id, leadId), eq(leads.workspaceId, workspaceId)))
    .limit(1);

  if (!lead) {
    throw new Error("Lead was not found");
  }

  return lead;
}

async function getFollowUpForWorkspace(
  followUpId: string,
  workspaceId: string
) {
  const db = getDb();
  const [followUp] = await db
    .select()
    .from(followUps)
    .where(
      and(eq(followUps.id, followUpId), eq(followUps.workspaceId, workspaceId))
    )
    .limit(1);

  if (!followUp) {
    throw new Error("Follow-up was not found");
  }

  return followUp;
}

async function updateLeadNextFollowUp(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  leadId: string
) {
  const [nextFollowUp] = await tx
    .select({ followUpDueAt: followUps.followUpDueAt })
    .from(followUps)
    .where(and(eq(followUps.leadId, leadId), eq(followUps.status, "open")))
    .orderBy(asc(followUps.followUpDueAt))
    .limit(1);

  await tx
    .update(leads)
    .set({
      followUpDueAt: nextFollowUp?.followUpDueAt ?? null,
      updatedAt: new Date()
    })
    .where(eq(leads.id, leadId));
}

function toDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid follow-up due date");
  }

  return date;
}

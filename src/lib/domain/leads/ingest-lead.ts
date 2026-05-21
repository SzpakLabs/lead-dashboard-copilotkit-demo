import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  contacts,
  ingestionEvents,
  leadEvents,
  leads,
  users,
  workspaces
} from "@/lib/db/schema";
import { extractionSourceChannelSchema } from "@/lib/ingestion/extraction";
import {
  normalizeText,
  SoftwareServicesExtractor
} from "@/lib/ingestion/software-services-extractor";

export const ingestLeadInputSchema = z.object({
  text: z.string().trim().min(10).max(20_000),
  sourceType: z
    .enum(["pasted_text", "pasted_transcript"])
    .default("pasted_text"),
  sourceChannel: extractionSourceChannelSchema.default("other")
});

export type IngestLeadInput = z.infer<typeof ingestLeadInputSchema>;

const extractor = new SoftwareServicesExtractor();

export async function ingestLeadFromText(input: IngestLeadInput) {
  const parsed = ingestLeadInputSchema.parse(input);
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

  const normalizedText = normalizeText(parsed.text);
  const extracted = extractor.extract({
    sourceChannel: parsed.sourceChannel,
    sourceType: parsed.sourceType,
    text: normalizedText
  });

  return db.transaction(async (tx) => {
    const [ingestionEvent] = await tx
      .insert(ingestionEvents)
      .values({
        workspaceId: workspace.id,
        actorUserId: actor?.id,
        sourceType: parsed.sourceType,
        sourceChannel: parsed.sourceChannel,
        rawText: parsed.text,
        normalizedText,
        metadata: { template: "software_services" }
      })
      .returning();

    const [contact] = await tx
      .insert(contacts)
      .values({
        workspaceId: workspace.id,
        name: extracted.contactName ?? "Needs Review Test Contact",
        company: extracted.company,
        source: extracted.sourceChannel
      })
      .returning();

    const title = buildLeadTitle(
      extracted.projectType,
      extracted.problemSummary
    );

    const [lead] = await tx
      .insert(leads)
      .values({
        workspaceId: workspace.id,
        contactId: contact.id,
        ingestionEventId: ingestionEvent.id,
        title,
        status: "needs_review",
        source: extracted.sourceChannel,
        projectType: extracted.projectType,
        problemSummary: extracted.problemSummary,
        requestedOutcome: extracted.requestedOutcome,
        budgetRange: extracted.budgetRange,
        timeline: extracted.timeline,
        nextStep: extracted.nextStep,
        missingFields: extracted.missingFields,
        confidence: extracted.confidence,
        scheduledAt: extracted.scheduledAt,
        followUpDueAt: extracted.followUpDueAt
      })
      .returning();

    await tx.insert(leadEvents).values({
      workspaceId: workspace.id,
      actorUserId: actor?.id,
      leadId: lead.id,
      targetType: "ingestion_event",
      targetId: ingestionEvent.id,
      action: "ingestion.created",
      summary: `Created draft lead from ${parsed.sourceType.replace("_", " ")}.`,
      after: {
        ingestionEventId: ingestionEvent.id,
        leadId: lead.id,
        missingFields: extracted.missingFields,
        confidence: extracted.confidence
      }
    });

    return {
      ingestionEvent,
      lead,
      contact,
      extracted
    };
  });
}

function buildLeadTitle(
  projectType: string | null,
  problemSummary: string | null
) {
  if (projectType) {
    return `${capitalize(projectType)} lead`;
  }

  if (problemSummary) {
    return problemSummary.slice(0, 80);
  }

  return "Needs review lead";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

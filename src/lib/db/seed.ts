import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  contacts,
  customFieldDefinitions,
  customFieldValues,
  followUps,
  ingestionEvents,
  leadEvents,
  leads,
  users,
  workspaces
} from "./schema";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);
const demoWorkspaceSlug = "software-services-demo";

async function seed({ reset }: { reset: boolean }) {
  if (reset) {
    await db.delete(workspaces).where(eq(workspaces.slug, demoWorkspaceSlug));
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: "Software Services Demo",
      slug: demoWorkspaceSlug
    })
    .returning();

  const [user] = await db
    .insert(users)
    .values({
      workspaceId: workspace.id,
      name: "Owner Test",
      email: "owner-test@example.com",
      role: "owner",
      isFake: true
    })
    .returning();

  const [alexContact] = await db
    .insert(contacts)
    .values({
      workspaceId: workspace.id,
      name: "Alex Test",
      company: "Test Company",
      email: "alex.test@example.com",
      source: "linkedin"
    })
    .returning();

  const [mariaContact] = await db
    .insert(contacts)
    .values({
      workspaceId: workspace.id,
      name: "Maria Test",
      company: "Upwork Test Studio",
      email: "maria.test@example.com",
      source: "upwork"
    })
    .returning();

  const [alexIngestion] = await db
    .insert(ingestionEvents)
    .values({
      workspaceId: workspace.id,
      actorUserId: user.id,
      sourceType: "pasted_text",
      sourceChannel: "linkedin",
      rawText:
        "Alex Test from Test Company asked about rebuilding their service website and booking flow. They want a discovery call next Tuesday and a follow-up tomorrow.",
      normalizedText:
        "Alex Test from Test Company needs a website rebuild and booking flow. Discovery call next Tuesday. Follow-up tomorrow.",
      metadata: { template: "software_services" }
    })
    .returning();

  const [mariaIngestion] = await db
    .insert(ingestionEvents)
    .values({
      workspaceId: workspace.id,
      actorUserId: user.id,
      sourceType: "pasted_transcript",
      sourceChannel: "upwork",
      rawText:
        "Maria Test needs a dashboard for tracking client onboarding. Budget is around $4k and she wants a prototype this month.",
      normalizedText:
        "Maria Test needs a client onboarding dashboard. Budget around $4k. Prototype this month.",
      metadata: { template: "software_services" }
    })
    .returning();

  const [alexLead] = await db
    .insert(leads)
    .values({
      workspaceId: workspace.id,
      contactId: alexContact.id,
      ingestionEventId: alexIngestion.id,
      title: "Website rebuild and booking flow",
      status: "scheduled",
      source: "linkedin",
      projectType: "website",
      problemSummary:
        "Current website does not convert service inquiries reliably.",
      requestedOutcome: "Rebuild the site and add a cleaner booking path.",
      budgetRange: "$3k-$6k",
      timeline: "Discovery call next Tuesday",
      nextStep: "Prepare discovery call agenda",
      confidence: "high",
      scheduledAt: new Date("2026-05-12T14:00:00.000Z"),
      followUpDueAt: new Date("2026-05-09T10:00:00.000Z")
    })
    .returning();

  const [mariaLead] = await db
    .insert(leads)
    .values({
      workspaceId: workspace.id,
      contactId: mariaContact.id,
      ingestionEventId: mariaIngestion.id,
      title: "Client onboarding dashboard",
      status: "needs_review",
      source: "upwork",
      projectType: "dashboard",
      problemSummary:
        "Client onboarding status is spread across chats and sheets.",
      requestedOutcome: "Prototype dashboard for client onboarding visibility.",
      budgetRange: "Around $4k",
      timeline: "Prototype this month",
      nextStep: "Clarify data sources and user roles",
      missingFields: ["scheduledAt"],
      confidence: "medium",
      followUpDueAt: new Date("2026-05-10T09:00:00.000Z")
    })
    .returning();

  const [priorityField] = await db
    .insert(customFieldDefinitions)
    .values({
      workspaceId: workspace.id,
      key: "priority",
      label: "Priority",
      fieldType: "text"
    })
    .returning();

  const [requiresNdaField] = await db
    .insert(customFieldDefinitions)
    .values({
      workspaceId: workspace.id,
      key: "requires_nda",
      label: "Requires NDA",
      fieldType: "boolean"
    })
    .returning();

  await db.insert(customFieldValues).values([
    {
      workspaceId: workspace.id,
      leadId: alexLead.id,
      definitionId: priorityField.id,
      value: "High"
    },
    {
      workspaceId: workspace.id,
      leadId: alexLead.id,
      definitionId: requiresNdaField.id,
      value: "false"
    },
    {
      workspaceId: workspace.id,
      leadId: mariaLead.id,
      definitionId: priorityField.id,
      value: "Medium"
    }
  ]);

  const [alexFollowUp] = await db
    .insert(followUps)
    .values({
      workspaceId: workspace.id,
      leadId: alexLead.id,
      actorUserId: user.id,
      note: "Send discovery call agenda to Alex Test.",
      followUpDueAt: new Date("2026-05-09T10:00:00.000Z")
    })
    .returning();

  const [mariaFollowUp] = await db
    .insert(followUps)
    .values({
      workspaceId: workspace.id,
      leadId: mariaLead.id,
      actorUserId: user.id,
      note: "Ask Maria Test which tools currently hold onboarding data.",
      followUpDueAt: new Date("2026-05-10T09:00:00.000Z")
    })
    .returning();

  await db.insert(leadEvents).values([
    {
      workspaceId: workspace.id,
      actorUserId: user.id,
      leadId: alexLead.id,
      targetType: "ingestion_event",
      targetId: alexIngestion.id,
      action: "ingestion.created",
      summary: "Stored pasted LinkedIn text for Alex Test.",
      after: { sourceChannel: "linkedin" }
    },
    {
      workspaceId: workspace.id,
      actorUserId: user.id,
      leadId: alexLead.id,
      targetType: "follow_up",
      targetId: alexFollowUp.id,
      action: "follow_up.created",
      summary: "Created follow-up for Alex Test.",
      after: { followUpDueAt: alexFollowUp.followUpDueAt.toISOString() }
    },
    {
      workspaceId: workspace.id,
      actorUserId: user.id,
      leadId: mariaLead.id,
      targetType: "ingestion_event",
      targetId: mariaIngestion.id,
      action: "ingestion.created",
      summary: "Stored pasted Upwork transcript for Maria Test.",
      after: { sourceChannel: "upwork" }
    },
    {
      workspaceId: workspace.id,
      actorUserId: user.id,
      leadId: mariaLead.id,
      targetType: "follow_up",
      targetId: mariaFollowUp.id,
      action: "follow_up.created",
      summary: "Created follow-up for Maria Test.",
      after: { followUpDueAt: mariaFollowUp.followUpDueAt.toISOString() }
    }
  ]);
}

seed({ reset: process.argv.includes("--reset") })
  .then(async () => {
    await client.end();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await client.end();
    process.exit(1);
  });

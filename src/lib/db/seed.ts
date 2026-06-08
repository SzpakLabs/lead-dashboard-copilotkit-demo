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
  sourceDefinitions,
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
const defaultSeedAnchor = "2026-06-15T12:00:00.000Z";
const seedAnchor = new Date(process.env.DEMO_SEED_ANCHOR ?? defaultSeedAnchor);

const sourceSeeds = [
  { slug: "linkedin", label: "LinkedIn", active: true },
  { slug: "upwork", label: "Upwork", active: true },
  { slug: "referral", label: "Referral", active: true },
  { slug: "website", label: "Website", active: true },
  { slug: "phone", label: "Phone", active: true },
  { slug: "whatsapp", label: "WhatsApp", active: true },
  { slug: "instagram", label: "Instagram", active: false },
  { slug: "facebook", label: "Facebook", active: false },
  { slug: "google", label: "Google", active: true },
  { slug: "walk-in", label: "Walk-in", active: false },
  { slug: "other", label: "Other", active: true }
] as const;

const leadFixtures = [
  {
    name: "Alex Test",
    company: "Test Company",
    source: "linkedin",
    title: "Website rebuild and booking flow",
    status: "scheduled",
    projectType: "website",
    problemSummary: "Current website does not convert service inquiries reliably.",
    requestedOutcome: "Rebuild the site and add a cleaner booking path.",
    budgetRange: "$3k-$6k",
    timeline: "Discovery call this week",
    nextStep: "Prepare discovery call agenda",
    confidence: "high",
    scheduledDay: -34,
    followUpDay: -37,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Maria Test",
    company: "Upwork Test Studio",
    source: "upwork",
    title: "Client onboarding dashboard",
    status: "needs_review",
    projectType: "dashboard",
    problemSummary: "Client onboarding status is spread across chats and sheets.",
    requestedOutcome: "Prototype dashboard for onboarding visibility.",
    budgetRange: "Around $4k",
    timeline: "Prototype this month",
    nextStep: "Clarify data sources and user roles",
    confidence: "medium",
    scheduledDay: null,
    followUpDay: -36,
    completedDay: null,
    missingFields: ["scheduledAt"],
    priority: "Medium",
    requiresNda: "true"
  },
  {
    name: "Carlos Test",
    company: "Repair Ops Test",
    source: "referral",
    title: "Repair intake CRM cleanup",
    status: "contacted",
    projectType: "operations",
    problemSummary: "Repair inquiries are split between calls, forms, and chats.",
    requestedOutcome: "Create a lightweight intake and follow-up workflow.",
    budgetRange: "$5k-$8k",
    timeline: "Decision by end of month",
    nextStep: "Send scoped proposal",
    confidence: "high",
    scheduledDay: -22,
    followUpDay: -25,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Nora Test",
    company: "Beauty Studio Test",
    source: "website",
    title: "Booking calendar workflow",
    status: "in_progress",
    projectType: "calendar",
    problemSummary: "Bookings and deposits are tracked manually.",
    requestedOutcome: "Build a booking workflow with lead follow-ups.",
    budgetRange: "$6k-$9k",
    timeline: "Launch before summer campaign",
    nextStep: "Review first workflow build",
    confidence: "high",
    scheduledDay: -17,
    followUpDay: -18,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Priya Test",
    company: "Test Analytics Co",
    source: "google",
    title: "Lead attribution report",
    status: "won",
    projectType: "reports",
    problemSummary: "Source reporting is too manual for weekly decisions.",
    requestedOutcome: "Add a simple source and revenue report.",
    budgetRange: "$2k-$4k",
    timeline: "Completed last month",
    nextStep: "Schedule post-launch check-in",
    confidence: "high",
    scheduledDay: -48,
    followUpDay: -43,
    completedDay: -40,
    missingFields: [],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Ben Test",
    company: "Test Vendor Group",
    source: "phone",
    title: "Quote follow-up automation",
    status: "lost",
    projectType: "automation",
    problemSummary: "Prospects forget open quotes after phone calls.",
    requestedOutcome: "Send timed follow-up reminders after quotes.",
    budgetRange: "$1k-$2k",
    timeline: "Paused after budget review",
    nextStep: "Archive and revisit next quarter",
    confidence: "low",
    scheduledDay: -44,
    followUpDay: -41,
    completedDay: -38,
    missingFields: [],
    priority: "Low",
    requiresNda: "false"
  },
  {
    name: "Sara Test",
    company: "Launch Test Lab",
    source: "linkedin",
    title: "MVP lead pipeline",
    status: "scheduled",
    projectType: "pipeline",
    problemSummary: "New product leads are tracked in direct messages.",
    requestedOutcome: "Turn inquiry text into qualified lead records.",
    budgetRange: "$8k-$12k",
    timeline: "Workshop next week",
    nextStep: "Confirm workshop agenda",
    confidence: "medium",
    scheduledDay: -8,
    followUpDay: -10,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "true"
  },
  {
    name: "Omar Test",
    company: "Test Service Desk",
    source: "whatsapp",
    title: "WhatsApp inquiry tracker",
    status: "needs_review",
    projectType: "intake",
    problemSummary: "Customer requests arrive as short mobile messages.",
    requestedOutcome: "Capture message context and next steps.",
    budgetRange: "Unknown",
    timeline: "Asked for estimate",
    nextStep: "Ask for budget range and desired launch date",
    confidence: "medium",
    scheduledDay: null,
    followUpDay: -7,
    completedDay: null,
    missingFields: ["budgetRange", "scheduledAt"],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Julia Test",
    company: "Test Growth Shop",
    source: "upwork",
    title: "Sales dashboard rescue",
    status: "contacted",
    projectType: "dashboard",
    problemSummary: "Existing dashboard is slow and misses follow-up dates.",
    requestedOutcome: "Rebuild the reporting and follow-up view.",
    budgetRange: "$4k-$7k",
    timeline: "Needs decision this week",
    nextStep: "Share technical audit notes",
    confidence: "high",
    scheduledDay: 0,
    followUpDay: -1,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "true"
  },
  {
    name: "Mateo Test",
    company: "Test Training Co",
    source: "referral",
    title: "Course lead workflow",
    status: "new",
    projectType: "workflow",
    problemSummary: "Course inquiries need qualification before calls.",
    requestedOutcome: "Add a review queue and follow-up reminders.",
    budgetRange: "$3k-$5k",
    timeline: "Planning for next cohort",
    nextStep: "Review source transcript",
    confidence: "medium",
    scheduledDay: null,
    followUpDay: 1,
    completedDay: null,
    missingFields: ["scheduledAt"],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Elena Test",
    company: "Studio Test Works",
    source: "website",
    title: "Portfolio inquiry manager",
    status: "scheduled",
    projectType: "crm",
    problemSummary: "Portfolio leads are handled from email memory.",
    requestedOutcome: "Create a lead ledger and status workflow.",
    budgetRange: "$5k-$10k",
    timeline: "Call tomorrow",
    nextStep: "Prepare lead workflow walkthrough",
    confidence: "high",
    scheduledDay: 2,
    followUpDay: 1,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Victor Test",
    company: "Ops Test Partners",
    source: "google",
    title: "Field service follow-ups",
    status: "in_progress",
    projectType: "operations",
    problemSummary: "Follow-ups after field visits are inconsistent.",
    requestedOutcome: "Track scheduled and completed follow-up work.",
    budgetRange: "$7k-$11k",
    timeline: "Pilot this month",
    nextStep: "Review pilot checklist",
    confidence: "high",
    scheduledDay: 4,
    followUpDay: 3,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Diana Test",
    company: "Clinic Test Desk",
    source: "phone",
    title: "Callback queue",
    status: "needs_review",
    projectType: "queue",
    problemSummary: "Callbacks are written in notes without ownership.",
    requestedOutcome: "Build a callback review and assignment flow.",
    budgetRange: "$2k-$3k",
    timeline: "Needs owner approval",
    nextStep: "Confirm service categories",
    confidence: "low",
    scheduledDay: null,
    followUpDay: 5,
    completedDay: null,
    missingFields: ["projectType", "scheduledAt"],
    priority: "Low",
    requiresNda: "false"
  },
  {
    name: "Iris Test",
    company: "Test SaaS Studio",
    source: "linkedin",
    title: "Founder sales console",
    status: "contacted",
    projectType: "sales",
    problemSummary: "Founder tracks sales replies across social channels.",
    requestedOutcome: "Centralize lead status and next action.",
    budgetRange: "$10k-$15k",
    timeline: "Decision after demo",
    nextStep: "Send demo recording",
    confidence: "medium",
    scheduledDay: 9,
    followUpDay: 7,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "true"
  },
  {
    name: "Jon Test",
    company: "Agency Test Pool",
    source: "upwork",
    title: "Client portal intake",
    status: "scheduled",
    projectType: "portal",
    problemSummary: "Portal requests lack consistent scope notes.",
    requestedOutcome: "Create structured intake and review states.",
    budgetRange: "$6k-$10k",
    timeline: "Sprint starts next month",
    nextStep: "Confirm data model",
    confidence: "high",
    scheduledDay: 13,
    followUpDay: 12,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "true"
  },
  {
    name: "Lena Test",
    company: "Test Local Services",
    source: "referral",
    title: "Service estimate workflow",
    status: "new",
    projectType: "estimates",
    problemSummary: "Estimates are sent without follow-up ownership.",
    requestedOutcome: "Track estimate source, status, and next reminder.",
    budgetRange: "$1.5k-$3k",
    timeline: "Flexible",
    nextStep: "Review request details",
    confidence: "medium",
    scheduledDay: null,
    followUpDay: 16,
    completedDay: null,
    missingFields: ["scheduledAt"],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Maya Test",
    company: "Test Commerce Co",
    source: "website",
    title: "Order support dashboard",
    status: "in_progress",
    projectType: "support",
    problemSummary: "Order support questions create missed sales follow-ups.",
    requestedOutcome: "Link support context with lead next steps.",
    budgetRange: "$9k-$13k",
    timeline: "Pilot in six weeks",
    nextStep: "Review support categories",
    confidence: "high",
    scheduledDay: 20,
    followUpDay: 18,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Noah Test",
    company: "Test Install Crew",
    source: "phone",
    title: "Installation lead planner",
    status: "scheduled",
    projectType: "planner",
    problemSummary: "Install jobs need date-based lead follow-up.",
    requestedOutcome: "Show upcoming work and overdue lead reminders.",
    budgetRange: "$3k-$6k",
    timeline: "Installation calendar next month",
    nextStep: "Confirm schedule examples",
    confidence: "medium",
    scheduledDay: 24,
    followUpDay: 22,
    completedDay: null,
    missingFields: [],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Paula Test",
    company: "Creative Test House",
    source: "instagram",
    title: "Campaign lead tracker",
    status: "contacted",
    projectType: "campaign",
    problemSummary: "Campaign replies are qualified manually.",
    requestedOutcome: "Turn campaign messages into follow-up-ready leads.",
    budgetRange: "$2k-$5k",
    timeline: "Campaign ends next month",
    nextStep: "Ask for priority channels",
    confidence: "medium",
    scheduledDay: 28,
    followUpDay: 27,
    completedDay: null,
    missingFields: [],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Rafael Test",
    company: "Test Studio Ops",
    source: "other",
    title: "Custom quote review",
    status: "needs_review",
    projectType: "quote",
    problemSummary: "Custom quotes miss budget confidence.",
    requestedOutcome: "Review uncertain fields before sales follow-up.",
    budgetRange: "Unknown",
    timeline: "Asked for options",
    nextStep: "Request budget and decision date",
    confidence: "low",
    scheduledDay: null,
    followUpDay: 30,
    completedDay: null,
    missingFields: ["budgetRange", "timeline", "scheduledAt"],
    priority: "Low",
    requiresNda: "false"
  },
  {
    name: "Sofia Test",
    company: "Test Delivery Co",
    source: "whatsapp",
    title: "Delivery booking pipeline",
    status: "scheduled",
    projectType: "booking",
    problemSummary: "Booking requests from messages are hard to prioritize.",
    requestedOutcome: "Add lead scores and scheduled work visibility.",
    budgetRange: "$4k-$8k",
    timeline: "Demo next month",
    nextStep: "Send booking examples",
    confidence: "high",
    scheduledDay: 35,
    followUpDay: 33,
    completedDay: null,
    missingFields: [],
    priority: "High",
    requiresNda: "false"
  },
  {
    name: "Tomas Test",
    company: "Test Maintenance",
    source: "google",
    title: "Maintenance request triage",
    status: "new",
    projectType: "triage",
    problemSummary: "Maintenance requests lack clear urgency and owner.",
    requestedOutcome: "Create urgency and next-step fields from inquiry text.",
    budgetRange: "$2k-$4k",
    timeline: "Can start next quarter",
    nextStep: "Clarify urgency levels",
    confidence: "medium",
    scheduledDay: null,
    followUpDay: 40,
    completedDay: null,
    missingFields: ["scheduledAt"],
    priority: "Medium",
    requiresNda: "false"
  },
  {
    name: "Uma Test",
    company: "Test Automation Lab",
    source: "linkedin",
    title: "Proposal automation",
    status: "won",
    projectType: "automation",
    problemSummary: "Proposal follow-ups need consistent next actions.",
    requestedOutcome: "Automate proposal review and post-win scheduling.",
    budgetRange: "$12k-$18k",
    timeline: "Completed this week",
    nextStep: "Plan kickoff",
    confidence: "high",
    scheduledDay: 42,
    followUpDay: 41,
    completedDay: 45,
    missingFields: [],
    priority: "High",
    requiresNda: "true"
  },
  {
    name: "Wiktor Test",
    company: "Test Build Shop",
    source: "referral",
    title: "Build request backlog",
    status: "lost",
    projectType: "backlog",
    problemSummary: "Backlog requests are not prioritized against budget.",
    requestedOutcome: "Add budget and decision fields for backlog triage.",
    budgetRange: "$3k-$4k",
    timeline: "Deferred by client",
    nextStep: "Mark lost and keep source artifact",
    confidence: "low",
    scheduledDay: 49,
    followUpDay: 47,
    completedDay: 50,
    missingFields: [],
    priority: "Low",
    requiresNda: "false"
  },
  {
    name: "Yara Test",
    company: "Test Advisory",
    source: "upwork",
    title: "Advisor lead review",
    status: "scheduled",
    projectType: "review",
    problemSummary: "Advisor requests need faster review before calls.",
    requestedOutcome: "Summarize lead source and recommended next step.",
    budgetRange: "$5k-$7k",
    timeline: "Call in two months",
    nextStep: "Confirm stakeholders",
    confidence: "medium",
    scheduledDay: 57,
    followUpDay: 55,
    completedDay: null,
    missingFields: [],
    priority: "Medium",
    requiresNda: "true"
  }
] as const;

type LeadFixture = (typeof leadFixtures)[number];

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

  await db.insert(sourceDefinitions).values(
    sourceSeeds.map((source, index) => ({
      workspaceId: workspace.id,
      slug: source.slug,
      label: source.label,
      presetKey: source.slug,
      isActive: source.active,
      sortOrder: index * 10
    }))
  );

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

  for (const [index, fixture] of leadFixtures.entries()) {
    await seedLeadFixture({
      fixture,
      index,
      priorityFieldId: priorityField.id,
      requiresNdaFieldId: requiresNdaField.id,
      userId: user.id,
      workspaceId: workspace.id
    });
  }
}

async function seedLeadFixture({
  fixture,
  index,
  priorityFieldId,
  requiresNdaFieldId,
  userId,
  workspaceId
}: {
  fixture: LeadFixture;
  index: number;
  priorityFieldId: string;
  requiresNdaFieldId: string;
  userId: string;
  workspaceId: string;
}) {
  const [contact] = await db
    .insert(contacts)
    .values({
      workspaceId,
      name: fixture.name,
      company: fixture.company,
      email: toEmail(fixture.name),
      source: fixture.source
    })
    .returning();

  const sourceType = index % 3 === 0 ? "pasted_transcript" : "pasted_text";
  const [ingestion] = await db
    .insert(ingestionEvents)
    .values({
      workspaceId,
      actorUserId: userId,
      sourceType,
      sourceChannel: fixture.source,
      rawText: `${fixture.name} from ${fixture.company} asked about ${fixture.title}. Budget: ${fixture.budgetRange}. Timeline: ${fixture.timeline}. Next step: ${fixture.nextStep}.`,
      normalizedText: `${fixture.name} needs ${fixture.title}. ${fixture.problemSummary} ${fixture.requestedOutcome}`,
      metadata: {
        template: "software_services",
        seedAnchor: seedAnchor.toISOString(),
        fixtureIndex: index
      }
    })
    .returning();

  const [lead] = await db
    .insert(leads)
    .values({
      workspaceId,
      contactId: contact.id,
      ingestionEventId: ingestion.id,
      title: fixture.title,
      status: fixture.status,
      source: fixture.source,
      projectType: fixture.projectType,
      problemSummary: fixture.problemSummary,
      requestedOutcome: fixture.requestedOutcome,
      budgetRange: fixture.budgetRange,
      timeline: fixture.timeline,
      nextStep: fixture.nextStep,
      missingFields: [...fixture.missingFields],
      confidence: fixture.confidence,
      scheduledAt:
        fixture.scheduledDay === null
          ? null
          : dateFromAnchor(fixture.scheduledDay, 14 + (index % 4)),
      completedAt:
        fixture.completedDay === null
          ? null
          : dateFromAnchor(fixture.completedDay, 16 + (index % 3)),
      followUpDueAt: dateFromAnchor(fixture.followUpDay, 9 + (index % 5)),
      createdAt: dateFromAnchor(fixture.followUpDay - 2, 10),
      updatedAt: dateFromAnchor(Math.min(fixture.followUpDay + 1, 58), 11)
    })
    .returning();

  await db.insert(customFieldValues).values([
    {
      workspaceId,
      leadId: lead.id,
      definitionId: priorityFieldId,
      value: fixture.priority
    },
    {
      workspaceId,
      leadId: lead.id,
      definitionId: requiresNdaFieldId,
      value: fixture.requiresNda
    }
  ]);

  const [followUp] = await db
    .insert(followUps)
    .values({
      workspaceId,
      leadId: lead.id,
      actorUserId: userId,
      status: fixture.completedDay === null ? "open" : "completed",
      note: `${fixture.nextStep} for ${fixture.name}.`,
      followUpDueAt: dateFromAnchor(fixture.followUpDay, 9 + (index % 5)),
      completedAt:
        fixture.completedDay === null
          ? null
          : dateFromAnchor(fixture.completedDay, 17 + (index % 2))
    })
    .returning();

  await db.insert(leadEvents).values([
    {
      workspaceId,
      actorUserId: userId,
      leadId: lead.id,
      targetType: "ingestion_event",
      targetId: ingestion.id,
      action: "ingestion.created",
      summary: `Stored ${sourceType.replace("_", " ")} for ${fixture.name}.`,
      after: { sourceChannel: fixture.source }
    },
    {
      workspaceId,
      actorUserId: userId,
      leadId: lead.id,
      targetType: "lead",
      targetId: lead.id,
      action: "lead.status_seeded",
      summary: `Seeded ${fixture.name} as ${fixture.status}.`,
      after: {
        status: fixture.status,
        confidence: fixture.confidence,
        missingFields: fixture.missingFields
      }
    },
    {
      workspaceId,
      actorUserId: userId,
      leadId: lead.id,
      targetType: "follow_up",
      targetId: followUp.id,
      action: "follow_up.created",
      summary: `Created follow-up for ${fixture.name}.`,
      after: {
        status: followUp.status,
        followUpDueAt: followUp.followUpDueAt.toISOString()
      }
    }
  ]);
}

function dateFromAnchor(dayOffset: number, hour: number) {
  const date = new Date(seedAnchor);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

function toEmail(name: string) {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
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

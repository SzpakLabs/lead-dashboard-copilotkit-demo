import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { HistoryBackButton } from "@/components/dashboard/history-back-button";
import {
  AssistantPreviewNote,
  Field,
  StatusBadge
} from "@/components/dashboard/lead-ui";
import type { CustomFieldDefinitionItem } from "@/components/leads/custom-field-definitions-panel";
import { type CustomFieldValueItem } from "@/components/leads/custom-field-values-form";
import { type FollowUpListItem } from "@/components/leads/follow-ups-panel";
import { LeadDetailTabs } from "@/components/leads/lead-detail-tabs";
import { getDb } from "@/lib/db";
import {
  contacts,
  customFieldDefinitions,
  customFieldValues,
  followUps,
  ingestionEvents,
  leadEvents,
  leads,
  users
} from "@/lib/db/schema";
import { formatDateTime } from "@/lib/date-format";
import { type LeadStatus } from "@/lib/domain/leads/status";
import { getWorkspaceSourceDefinitions } from "@/lib/domain/sources/manage-sources";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ leadId: string }>;
};

export default async function LeadDetailPage({ params }: PageProps) {
  const { leadId } = await params;
  const detail = await getLeadDetail(leadId);

  if (!detail) {
    notFound();
  }

  const [
    customFieldDefinitions,
    customFieldValues,
    leadFollowUps,
    activity,
    sourceDefinitions
  ] = await Promise.all([
    getCustomFieldDefinitions(),
    getLeadCustomFieldValues(leadId),
    getLeadFollowUps(leadId),
    getLeadActivity(leadId),
    getWorkspaceSourceDefinitions()
  ]);
  const sourceOptions = sourceDefinitions
    .filter((source) => source.isActive && !source.archivedAt)
    .map((source) => ({ value: source.slug, label: source.label }));
  const sourceLabels = Object.fromEntries(
    sourceDefinitions.map((source) => [source.slug, source.label])
  );

  return (
    <AppShell
      actions={<HistoryBackButton />}
      activeSection="console"
      eyebrow="Lead workspace"
      eyebrowIcon={<ClipboardCheck className="size-4" />}
      title={detail.title}
    >
      <div className="ops-page-stack">
        <section className="ops-lead-detail-page" aria-label="Lead detail">
          <div className="ops-panel ops-lead-detail-summary">
            <div className="ops-inspector-header">
              <div className="min-w-0">
                <p className="ops-eyebrow">Lead workspace</p>
                <h2>{detail.title}</h2>
                <p>
                  {detail.contactName}
                  {detail.company ? `, ${detail.company}` : ""}
                </p>
              </div>
              <StatusBadge status={detail.status as LeadStatus} />
            </div>

            <div className="ops-inspector-facts">
              <Field
                label="Source"
                value={sourceLabels[detail.source] ?? detail.source}
              />
              <Field label="Created" value={formatDateTime(detail.createdAt)} />
              <Field label="Timeline" value={detail.timeline} />
              <Field label="Next step" value={detail.nextStep} />
            </div>

            <AssistantPreviewNote />
          </div>

          <LeadDetailTabs
            activity={activity}
            customFieldDefinitions={customFieldDefinitions}
            customFieldValues={customFieldValues}
            detail={{
              ...detail,
              status: detail.status as LeadStatus,
              missingFields: normalizeMissingFields(detail.missingFields)
            }}
            followUps={leadFollowUps}
            sourceLabels={sourceLabels}
            sourceOptions={sourceOptions}
          />
        </section>
      </div>
    </AppShell>
  );
}

async function getLeadDetail(leadId: string) {
  const db = getDb();
  const [detail] = await db
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
      missingFields: leads.missingFields,
      confidence: leads.confidence,
      createdAt: leads.createdAt,
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
    .where(eq(leads.id, leadId))
    .limit(1);

  return detail ?? null;
}

async function getCustomFieldDefinitions(): Promise<
  CustomFieldDefinitionItem[]
> {
  const db = getDb();
  const rows = await db
    .select({
      id: customFieldDefinitions.id,
      label: customFieldDefinitions.label,
      fieldType: customFieldDefinitions.fieldType
    })
    .from(customFieldDefinitions)
    .where(isNull(customFieldDefinitions.archivedAt))
    .orderBy(asc(customFieldDefinitions.createdAt));

  return rows;
}

async function getLeadCustomFieldValues(
  leadId: string
): Promise<CustomFieldValueItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      definitionId: customFieldValues.definitionId,
      value: customFieldValues.value
    })
    .from(customFieldValues)
    .innerJoin(
      customFieldDefinitions,
      eq(customFieldValues.definitionId, customFieldDefinitions.id)
    )
    .where(
      and(
        eq(customFieldValues.leadId, leadId),
        isNull(customFieldDefinitions.archivedAt)
      )
    );

  return rows.map((row) => ({
    definitionId: row.definitionId,
    value: row.value ?? ""
  }));
}

async function getLeadFollowUps(leadId: string): Promise<FollowUpListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: followUps.id,
      note: followUps.note,
      status: followUps.status,
      followUpDueAt: followUps.followUpDueAt,
      completedAt: followUps.completedAt
    })
    .from(followUps)
    .where(eq(followUps.leadId, leadId))
    .orderBy(asc(followUps.followUpDueAt));

  return rows.map((followUp) => ({
    id: followUp.id,
    note: followUp.note,
    status: followUp.status,
    followUpDueAt: followUp.followUpDueAt.toISOString(),
    completedAt: followUp.completedAt?.toISOString() ?? null
  }));
}

async function getLeadActivity(leadId: string) {
  const db = getDb();

  return db
    .select({
      id: leadEvents.id,
      action: leadEvents.action,
      summary: leadEvents.summary,
      createdAt: leadEvents.createdAt,
      actorName: users.name
    })
    .from(leadEvents)
    .leftJoin(users, eq(leadEvents.actorUserId, users.id))
    .where(eq(leadEvents.leadId, leadId))
    .orderBy(desc(leadEvents.createdAt));
}

function normalizeMissingFields(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

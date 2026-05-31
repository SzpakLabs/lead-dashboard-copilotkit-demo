import {
  and,
  asc,
  desc,
  eq,
  ilike,
  isNull,
  or,
  sql,
  type SQL
} from "drizzle-orm";
import { DatabaseZap } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { LeadPreviewDialog } from "@/components/dashboard/lead-preview-dialog";
import { LeadSearchOverlay } from "@/components/dashboard/lead-search-overlay";
import {
  getCustomFieldFilterParamName,
  LeadFilterRail,
  LeadPreviewContent,
  LeadLedgerPanel,
  leadSourceOptions,
  OperationalHealthStrip,
  type DashboardFilters,
  type LeadSource
} from "@/components/dashboard/lead-workspace";
import type { CustomFieldDefinitionItem } from "@/components/leads/custom-field-definitions-panel";
import { type CustomFieldValueItem } from "@/components/leads/custom-field-values-form";
import { type FollowUpListItem } from "@/components/leads/follow-ups-panel";
import { isAssistantRuntimeConfigured } from "@/lib/assistant/config";
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
import { leadStatusSchema, type LeadStatus } from "@/lib/domain/leads/status";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return <Dashboard searchParams={resolvedSearchParams} />;
}

async function Dashboard({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const assistantEnabled = isAssistantRuntimeConfigured();
  const selectedLeadId = getSingleSearchParam(searchParams.leadId);
  const customFieldDefinitionRows = await getCustomFieldDefinitions();
  const filters = parseDashboardFilters(
    searchParams,
    customFieldDefinitionRows
  );
  const leadRows = await getLeadRows(filters);
  const currentTime = await getCurrentTime();
  const metrics = await getDashboardMetrics(currentTime);

  const activeLeadId =
    leadRows.some((lead) => lead.id === selectedLeadId) && selectedLeadId
      ? selectedLeadId
      : undefined;
  const detail = activeLeadId ? await getLeadDetail(activeLeadId) : null;
  const detailFollowUps = activeLeadId
    ? await getLeadFollowUps(activeLeadId)
    : [];
  const detailActivity = activeLeadId
    ? await getLeadActivity(activeLeadId)
    : [];
  const detailCustomFieldValues = activeLeadId
    ? await getLeadCustomFieldValues(activeLeadId)
    : [];
  const activeLeadRow = leadRows.find((lead) => lead.id === activeLeadId);
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <AppShell
      actions={<LeadSearchOverlay leads={leadRows} />}
      activeSection="console"
      assistantEnabled={assistantEnabled}
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      showNewIntake
      title="Lead operations"
    >
      <OperationalHealthStrip metrics={metrics} />

      <div className="ops-workbench">
        <LeadFilterRail
          activeFilterCount={activeFilterCount}
          definitions={customFieldDefinitionRows}
          filters={filters}
          metrics={metrics}
        />
        <LeadLedgerPanel
          activeLeadId={activeLeadId}
          currentTime={currentTime}
          filters={filters}
          leads={leadRows}
        />
      </div>
      {detail ? (
        <LeadPreviewDialog title={detail.title}>
          <LeadPreviewContent
            activity={detailActivity}
            customFieldDefinitions={customFieldDefinitionRows}
            customFieldValues={detailCustomFieldValues}
            detail={detail}
            followUps={detailFollowUps}
            leadRow={activeLeadRow}
          />
        </LeadPreviewDialog>
      ) : null}
    </AppShell>
  );
}

async function getLeadRows(filters: DashboardFilters) {
  const db = getDb();
  const conditions: SQL[] = [];

  if (filters.query) {
    const likeQuery = `%${filters.query}%`;
    const queryCondition = or(
      ilike(leads.title, likeQuery),
      ilike(contacts.name, likeQuery),
      ilike(contacts.company, likeQuery),
      sql`${leads.source}::text ilike ${likeQuery}`,
      sql`${leads.status}::text ilike ${likeQuery}`,
      ilike(leads.projectType, likeQuery),
      ilike(leads.problemSummary, likeQuery),
      ilike(leads.requestedOutcome, likeQuery),
      ilike(leads.timeline, likeQuery),
      ilike(leads.nextStep, likeQuery)
    );

    if (queryCondition) {
      conditions.push(queryCondition);
    }
  }

  if (filters.status !== "all") {
    conditions.push(eq(leads.status, filters.status));
  }

  if (filters.source !== "all") {
    conditions.push(eq(leads.source, filters.source));
  }

  for (const [definitionId, value] of Object.entries(filters.customFields)) {
    if (!value) {
      continue;
    }

    conditions.push(
      sql`exists (
        select 1 from ${customFieldValues}
        where ${customFieldValues.leadId} = ${leads.id}
          and ${customFieldValues.definitionId} = ${definitionId}
          and ${customFieldValues.value} ilike ${`%${value}%`}
      )`
    );
  }

  return db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      source: leads.source,
      projectType: leads.projectType,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      followUpDueAt: leads.followUpDueAt,
      missingFields: leads.missingFields,
      confidence: leads.confidence,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.updatedAt));
}

function parseDashboardFilters(
  searchParams: Record<string, string | string[] | undefined>,
  definitions: CustomFieldDefinitionItem[]
): DashboardFilters {
  const statusParam = getSingleSearchParam(searchParams.status);
  const sourceParam = getSingleSearchParam(searchParams.source);
  const status = leadStatusSchema.safeParse(statusParam).success
    ? (statusParam as LeadStatus)
    : "all";
  const source = isLeadSource(sourceParam) ? sourceParam : "all";
  const customFields = Object.fromEntries(
    definitions.map((definition) => [
      definition.id,
      getSingleSearchParam(
        searchParams[getCustomFieldFilterParamName(definition.id)]
      ).trim()
    ])
  );

  return {
    query: getSingleSearchParam(searchParams.q).trim(),
    status,
    source,
    customFields
  };
}

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function isLeadSource(value: string): value is LeadSource {
  return leadSourceOptions.some((option) => option.value === value);
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
    .innerJoin(ingestionEvents, eq(leads.ingestionEventId, ingestionEvents.id))
    .where(eq(leads.id, leadId))
    .limit(1);

  if (detail) {
    return detail;
  }

  return null;
}

async function getCurrentTime() {
  return Date.now();
}

async function getDashboardMetrics(currentTime: number) {
  const db = getDb();
  const leadRows = await db
    .select({
      status: leads.status
    })
    .from(leads);
  const followUpRows = await db
    .select({
      status: followUps.status,
      followUpDueAt: followUps.followUpDueAt
    })
    .from(followUps);

  const won = leadRows.filter((lead) => lead.status === "won").length;
  const lost = leadRows.filter((lead) => lead.status === "lost").length;

  return {
    totalLeads: leadRows.length,
    needsReview: leadRows.filter((lead) => lead.status === "needs_review")
      .length,
    scheduled: leadRows.filter((lead) => lead.status === "scheduled").length,
    wonLost: `${won} / ${lost}`,
    overdueFollowUps: followUpRows.filter(
      (followUp) =>
        followUp.status === "open" &&
        followUp.followUpDueAt.getTime() < currentTime
    ).length
  };
}

function getActiveFilterCount(filters: DashboardFilters) {
  return [
    filters.query,
    filters.status !== "all" ? filters.status : "",
    filters.source !== "all" ? filters.source : "",
    ...Object.values(filters.customFields)
  ].filter(Boolean).length;
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
      targetType: leadEvents.targetType,
      createdAt: leadEvents.createdAt,
      actorName: users.name
    })
    .from(leadEvents)
    .leftJoin(users, eq(leadEvents.actorUserId, users.id))
    .where(eq(leadEvents.leadId, leadId))
    .orderBy(desc(leadEvents.createdAt));
}

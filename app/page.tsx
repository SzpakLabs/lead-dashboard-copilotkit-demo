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
import { AlertTriangle, DatabaseZap } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadPreviewDialog } from "@/components/dashboard/lead-preview-dialog";
import {
  getCustomFieldFilterParamName,
  LeadFilterRail,
  LeadPreviewContent,
  LeadLedgerPanel,
  OperationalHealthStrip,
  type DashboardFilters
} from "@/components/dashboard/lead-workspace";
import type { CustomFieldDefinitionItem } from "@/components/leads/custom-field-definitions-panel";
import { type CustomFieldValueItem } from "@/components/leads/custom-field-values-form";
import { type FollowUpListItem } from "@/components/leads/follow-ups-panel";
import { isAssistantRuntimeConfigured } from "@/lib/assistant/config";
import { getDb } from "@/lib/db";
import { isEmptyDatabaseError } from "@/lib/db/bootstrap-state";
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
import { getWorkspaceSourceDefinitions } from "@/lib/domain/sources/manage-sources";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type DashboardData = {
  assistantEnabled: boolean;
  customFieldDefinitionRows: CustomFieldDefinitionItem[];
  activeSourceOptions: { value: string; label: string }[];
  sourceLabels: Record<string, string>;
  filters: DashboardFilters;
  leadRows: Awaited<ReturnType<typeof getLeadRows>>;
  currentTime: number;
  metrics: Awaited<ReturnType<typeof getDashboardMetrics>>;
  activeLeadId: string | undefined;
  detail: Awaited<ReturnType<typeof getLeadDetail>>;
  detailFollowUps: FollowUpListItem[];
  detailActivity: Awaited<ReturnType<typeof getLeadActivity>>;
  detailCustomFieldValues: CustomFieldValueItem[];
  activeLeadRow: Awaited<ReturnType<typeof getLeadRows>>[number] | undefined;
  activeFilterCount: number;
};

type DashboardLoadResult =
  | { ok: true; data: DashboardData }
  | { ok: false; kind: "empty"; reason: string }
  | { ok: false; kind: "error"; error: unknown };

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const result = await loadDashboardResult(resolvedSearchParams);

  if (!result.ok) {
    return result.kind === "empty" ? (
      <EmptyDatabasePage reason={result.reason} />
    ) : (
      <DatabaseUnavailablePage error={result.error} />
    );
  }

  return <Dashboard data={result.data} />;
}

function DatabaseUnavailablePage({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? error.message
      : "The demo database could not be reached.";

  return (
    <AppShell
      activeSection="console"
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      title="Lead operations"
    >
      <section className="ops-page-stack">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="size-4" />
              Database unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The dashboard cannot load because the production database is not
              reachable right now.
            </p>
            <p className="rounded-md border border-border bg-background/70 p-3 font-mono text-xs text-foreground">
              {message}
            </p>
            <p>
              Fix the Vercel `DATABASE_URL` and redeploy, or point the app at a
              live Postgres instance with the seeded demo data.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function EmptyDatabasePage({ reason }: { reason: string }) {
  return (
    <AppShell
      activeSection="console"
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      title="Lead operations"
    >
      <section className="ops-page-stack">
        <Card className="border-border/80 bg-background/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseZap className="size-4 text-muted-foreground" />
              Empty database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The production database is connected, but it does not have the
              demo workspace or seed data yet.
            </p>
            <p className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-foreground">
              {reason}
            </p>
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                What this demo needs:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>A `software-services-demo` workspace</li>
                <li>
                  Seeded users, leads, contacts, follow-ups, and source data
                </li>
                <li>Applied migrations for the current schema</li>
              </ul>
            </div>
            <p>
              Once the database is seeded, this page will show the console
              normally.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

async function loadDashboardResult(
  searchParams: Record<string, string | string[] | undefined>
): Promise<DashboardLoadResult> {
  try {
    const assistantEnabled = isAssistantRuntimeConfigured();
    const selectedLeadId = getSingleSearchParam(searchParams.leadId);
    const [customFieldDefinitionRows, sourceDefinitions] = await Promise.all([
      getCustomFieldDefinitions(),
      getWorkspaceSourceDefinitions()
    ]);
    const activeSourceOptions = sourceDefinitions
      .filter((source) => source.isActive && !source.archivedAt)
      .map((source) => ({ value: source.slug, label: source.label }));
    const sourceLabels = Object.fromEntries(
      sourceDefinitions.map((source) => [source.slug, source.label])
    );
    const filters = parseDashboardFilters(
      searchParams,
      customFieldDefinitionRows,
      activeSourceOptions.map((source) => source.value)
    );
    const leadRows = await getLeadRows(filters);
    const currentTime = await getCurrentTime();
    const metrics = await getDashboardMetrics(currentTime);

    const activeLeadId = isUuid(selectedLeadId) ? selectedLeadId : undefined;
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

    return {
      ok: true as const,
      data: {
        assistantEnabled,
        customFieldDefinitionRows,
        activeSourceOptions,
        sourceLabels,
        filters,
        leadRows,
        currentTime,
        metrics,
        activeLeadId,
        detail,
        detailFollowUps,
        detailActivity,
        detailCustomFieldValues,
        activeLeadRow,
        activeFilterCount
      }
    };
  } catch (error) {
    if (isEmptyDatabaseError(error)) {
      return {
        ok: false as const,
        kind: "empty",
        reason:
          error instanceof Error
            ? error.message
            : "The demo workspace and seed records are missing."
      };
    }

    return { ok: false as const, kind: "error", error };
  }
}

async function Dashboard({ data }: { data: DashboardData }) {
  const {
    assistantEnabled,
    customFieldDefinitionRows,
    activeSourceOptions,
    sourceLabels,
    filters,
    leadRows,
    currentTime,
    metrics,
    activeLeadId,
    detail,
    detailFollowUps,
    detailActivity,
    detailCustomFieldValues,
    activeLeadRow,
    activeFilterCount
  } = data;

  return (
    <AppShell
      activeSection="console"
      assistantContext={{
        page: "console",
        filters,
        activeFilterCount,
        selectedLeadId: activeLeadId ?? null,
        visibleLeadIds: leadRows.map((lead) => lead.id),
        visibleLeadCount: leadRows.length,
        metrics
      }}
      assistantEnabled={assistantEnabled}
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      intakeSourceOptions={activeSourceOptions}
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
          sourceOptions={activeSourceOptions}
        />
        <LeadLedgerPanel
          activeLeadId={activeLeadId}
          currentTime={currentTime}
          filters={filters}
          leads={leadRows}
          sourceLabels={sourceLabels}
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
            sourceLabels={sourceLabels}
            sourceOptions={activeSourceOptions}
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
  definitions: CustomFieldDefinitionItem[],
  activeSources: string[]
): DashboardFilters {
  const statusParam = getSingleSearchParam(searchParams.status);
  const sourceParam = getSingleSearchParam(searchParams.source);
  const status = leadStatusSchema.safeParse(statusParam).success
    ? (statusParam as LeadStatus)
    : "all";
  const source = activeSources.includes(sourceParam) ? sourceParam : "all";
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
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

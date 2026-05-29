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
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Filter,
  ListChecks,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import type { CustomFieldDefinitionItem } from "@/components/leads/custom-field-definitions-panel";
import {
  CustomFieldValuesForm,
  type CustomFieldValueItem
} from "@/components/leads/custom-field-values-form";
import {
  FollowUpsPanel,
  type FollowUpListItem
} from "@/components/leads/follow-ups-panel";
import { IngestionForm } from "@/components/leads/ingestion-form";
import { LeadDetailForm } from "@/components/leads/lead-detail-form";
import { LeadStatusForm } from "@/components/leads/lead-status-form";
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
import { formatDate, formatDateTime } from "@/lib/date-format";
import {
  getLeadStatusColorClassName,
  getLeadStatusLabel,
  leadStatusOptions,
  leadStatusSchema,
  type LeadStatus
} from "@/lib/domain/leads/status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type LeadSource = "linkedin" | "upwork" | "referral" | "website" | "other";

type DashboardFilters = {
  query: string;
  status: LeadStatus | "all";
  source: LeadSource | "all";
  customFields: Record<string, string>;
};

const leadSourceOptions: Array<{ value: LeadSource; label: string }> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "upwork", label: "Upwork" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" }
];

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

  const activeLeadId =
    leadRows.some((lead) => lead.id === selectedLeadId) && selectedLeadId
      ? selectedLeadId
      : leadRows[0]?.id;
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
  const currentTime = await getCurrentTime();
  const metrics = await getDashboardMetrics(leadRows, currentTime);
  const activeLeadRow = leadRows.find((lead) => lead.id === activeLeadId);

  return (
    <AppShell
      actions={
        <>
          <a className="ops-search" href="#lead-filters">
            <Search className="size-4" />
            <span>Search leads</span>
          </a>
          <a className="ops-button ops-button-primary" href="#intake">
            <Plus className="size-4" />
            <span>New intake</span>
          </a>
          <Link className="ops-button" href="/calendar">
            <CalendarDays className="size-4" />
            <span>Calendar</span>
          </Link>
        </>
      }
      activeSection="console"
      assistantEnabled={assistantEnabled}
      eyebrow="Service Ops Console"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      title="Lead operations"
    >
      <section className="ops-strip" aria-label="Operational health">
        <MetricCard
          icon={<DatabaseZap className="size-4" />}
          label="Total leads"
          value={metrics.totalLeads}
        />
        <MetricCard
          icon={<AlertTriangle className="size-4" />}
          label="Needs review"
          value={metrics.needsReview}
          tone={metrics.needsReview > 0 ? "warning" : "neutral"}
        />
        <MetricCard
          icon={<CalendarDays className="size-4" />}
          label="Scheduled"
          value={metrics.scheduled}
        />
        <MetricCard
          icon={<CheckCircle2 className="size-4" />}
          label="Won / lost"
          value={metrics.wonLost}
        />
        <MetricCard
          icon={<Clock3 className="size-4" />}
          label="Overdue follow-ups"
          value={metrics.overdueFollowUps}
          tone={metrics.overdueFollowUps > 0 ? "danger" : "neutral"}
        />
      </section>

      <div className="ops-workbench">
        <aside className="ops-rail" aria-label="Lead queues and filters">
          <section className="ops-panel">
            <div className="ops-panel-heading">
              <div>
                <h2>Queues</h2>
                <p>Pressure points</p>
              </div>
              <ListChecks className="size-4 text-muted-foreground" />
            </div>
            <nav className="ops-queue-list" aria-label="Lead queues">
              <QueueLink
                href="/?status=needs_review"
                label="Needs review"
                value={metrics.needsReview}
                active={filters.status === "needs_review"}
              />
              <QueueLink
                href="/?status=scheduled"
                label="Scheduled work"
                value={metrics.scheduled}
                active={filters.status === "scheduled"}
              />
              <QueueLink
                href="/"
                label="All active leads"
                value={metrics.totalLeads}
                active={
                  filters.status === "all" &&
                  filters.source === "all" &&
                  !filters.query
                }
              />
            </nav>
          </section>

          <section id="lead-filters" className="ops-panel">
            <div className="ops-panel-heading">
              <div>
                <h2>Filters</h2>
                <p>Ledger scope</p>
              </div>
              <Filter className="size-4 text-muted-foreground" />
            </div>
            <LeadFiltersForm
              definitions={customFieldDefinitionRows}
              filters={filters}
            />
          </section>

          <section id="intake" className="ops-panel ops-intake-panel">
            <div className="ops-panel-heading">
              <div>
                <h2>Intake</h2>
                <p>Paste transcript</p>
              </div>
              <Plus className="size-4 text-muted-foreground" />
            </div>
            <IngestionForm />
          </section>
        </aside>

        <section className="ops-ledger" aria-labelledby="lead-ledger-title">
          <div className="ops-ledger-header">
            <div>
              <h2 id="lead-ledger-title">Lead ledger</h2>
              <p>
                {leadRows.length} matching lead
                {leadRows.length === 1 ? "" : "s"} in the demo workspace
              </p>
            </div>
            <div className="ops-ledger-tools">
              <span>
                <SlidersHorizontal className="size-4" />
                Dense
              </span>
              <Link href="/settings/fields">
                <Settings2 className="size-4" />
                Fields
              </Link>
            </div>
          </div>
          <LeadLedger
            activeLeadId={activeLeadId}
            currentTime={currentTime}
            filters={filters}
            leads={leadRows}
          />
        </section>

        <aside className="ops-inspector" aria-label="Selected lead inspector">
          {detail ? (
            <LeadInspector
              activity={detailActivity}
              customFieldDefinitions={customFieldDefinitionRows}
              customFieldValues={detailCustomFieldValues}
              detail={detail}
              followUps={detailFollowUps}
              leadRow={activeLeadRow}
            />
          ) : (
            <section className="ops-panel">
              <p className="text-sm text-muted-foreground">
                Select a lead to review details.
              </p>
            </section>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function LeadLedger({
  activeLeadId,
  currentTime,
  filters,
  leads
}: {
  activeLeadId: string | undefined;
  currentTime: number;
  filters: DashboardFilters;
  leads: Awaited<ReturnType<typeof getLeadRows>>;
}) {
  return (
    <div className="ops-table-wrap">
      <table className="ops-table">
        <caption>
          Lead status, source, timeline, next action, and review state
        </caption>
        <thead>
          <tr>
            <th scope="col">Lead</th>
            <th scope="col">Status</th>
            <th scope="col">Source</th>
            <th scope="col">Timeline</th>
            <th scope="col">Next step</th>
            <th scope="col">Follow-up</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className={cn(lead.id === activeLeadId ? "is-selected" : "")}
            >
              <td>
                <Link
                  className="ops-lead-link"
                  href={getLeadHref(lead.id, filters)}
                >
                  {lead.title}
                </Link>
                <p>
                  {lead.contactName}
                  {lead.company ? `, ${lead.company}` : ""}
                </p>
              </td>
              <td>
                <StatusBadge status={lead.status} />
              </td>
              <td className="capitalize text-muted-foreground">
                {lead.source}
              </td>
              <td className="ops-muted-cell">{lead.timeline ?? "Missing"}</td>
              <td className="ops-muted-cell">{lead.nextStep ?? "Missing"}</td>
              <td>
                <FollowUpDueBadge
                  followUpDueAt={lead.followUpDueAt}
                  currentTime={currentTime}
                />
              </td>
              <td>
                <ReviewBadge
                  confidence={lead.confidence}
                  missingFields={lead.missingFields}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          No leads match this queue. Create a draft from pasted text.
        </div>
      ) : null}
    </div>
  );
}

function LeadInspector({
  activity,
  customFieldDefinitions,
  customFieldValues,
  detail,
  followUps,
  leadRow
}: {
  activity: Awaited<ReturnType<typeof getLeadActivity>>;
  customFieldDefinitions: CustomFieldDefinitionItem[];
  customFieldValues: CustomFieldValueItem[];
  detail: NonNullable<Awaited<ReturnType<typeof getLeadDetail>>>;
  followUps: FollowUpListItem[];
  leadRow: Awaited<ReturnType<typeof getLeadRows>>[number] | undefined;
}) {
  return (
    <section className="ops-panel ops-inspector-panel">
      <div className="ops-inspector-header">
        <div className="min-w-0">
          <p className="ops-eyebrow">Selected lead</p>
          <h2>{detail.title}</h2>
          <p>
            {detail.contactName}
            {detail.company ? `, ${detail.company}` : ""}
          </p>
        </div>
        <StatusBadge status={detail.status as LeadStatus} />
      </div>

      <div className="ops-inspector-facts" aria-label="Lead review state">
        <Field
          label="Source"
          value={formatSource(detail.sourceType, detail.sourceChannel)}
        />
        <Field label="Created" value={formatDateTime(detail.ingestedAt)} />
        <Field label="Timeline" value={detail.timeline} />
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Review
          </p>
          <div className="mt-1">
            <ReviewBadge
              confidence={leadRow?.confidence ?? 0}
              missingFields={leadRow?.missingFields ?? []}
            />
          </div>
        </div>
      </div>

      <InspectorSection
        id="review"
        title="Review"
        description="Edit extracted lead and contact fields."
      >
        <LeadDetailForm
          key={`detail-${detail.id}`}
          lead={{
            id: detail.id,
            title: detail.title,
            source: detail.source,
            contactName: detail.contactName,
            company: detail.company ?? "",
            email: detail.email ?? "",
            phone: detail.phone ?? "",
            projectType: detail.projectType ?? "",
            problemSummary: detail.problemSummary ?? "",
            requestedOutcome: detail.requestedOutcome ?? "",
            budgetRange: detail.budgetRange ?? "",
            timeline: detail.timeline ?? "",
            nextStep: detail.nextStep ?? ""
          }}
        />
      </InspectorSection>

      <InspectorSection
        id="actions"
        title="Actions"
        description="Update lifecycle and follow-up commitments."
      >
        <div className="space-y-5">
          <LeadStatusForm
            key={`status-${detail.id}`}
            leadId={detail.id}
            status={detail.status as LeadStatus}
          />
          <FollowUpsPanel
            key={`followups-${detail.id}`}
            leadId={detail.id}
            followUps={followUps}
          />
        </div>
      </InspectorSection>

      <InspectorSection
        id="custom-fields"
        title="Custom fields"
        description="Lead-specific values. Definitions live in settings."
        action={
          <Link href="/settings/fields">
            <Settings2 className="size-4" />
            Manage
          </Link>
        }
      >
        <CustomFieldValuesForm
          key={`custom-fields-${detail.id}`}
          leadId={detail.id}
          definitions={customFieldDefinitions}
          values={customFieldValues}
        />
      </InspectorSection>

      <InspectorSection
        id="source"
        title="Source"
        description="Original transcript remains read-only."
      >
        <div className="ops-source-copy">{detail.rawText}</div>
      </InspectorSection>

      <InspectorSection
        id="activity"
        title="Activity"
        description="Audited lead, status, and follow-up changes."
      >
        <ActivityList activity={activity} />
      </InspectorSection>

      <div className="ops-assistant-note">
        <Bot className="size-4" />
        <span>Assistant changes still require preview and confirmation.</span>
      </div>
    </section>
  );
}

function InspectorSection({
  action,
  children,
  description,
  id,
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section className="ops-inspector-section" aria-labelledby={`${id}-title`}>
      <div className="ops-section-heading">
        <div>
          <h3 id={`${id}-title`}>{title}</h3>
          <p>{description}</p>
        </div>
        {action ? <div className="ops-section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function QueueLink({
  active,
  href,
  label,
  value
}: {
  active: boolean;
  href: string;
  label: string;
  value: number | string;
}) {
  return (
    <Link
      className={cn("ops-queue-link", active ? "is-active" : "")}
      href={href}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </Link>
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

function LeadFiltersForm({
  definitions,
  filters
}: {
  definitions: CustomFieldDefinitionItem[];
  filters: DashboardFilters;
}) {
  return (
    <form action="/" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label className="space-y-1 text-sm font-medium">
        Search
        <input
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          name="q"
          placeholder="Lead, contact, status..."
          defaultValue={filters.query}
        />
      </label>
      <label className="space-y-1 text-sm font-medium">
        Status
        <select
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          name="status"
          defaultValue={filters.status}
        >
          <option value="all">All statuses</option>
          {leadStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium">
        Source
        <select
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          name="source"
          defaultValue={filters.source}
        >
          <option value="all">All sources</option>
          {leadSourceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {definitions.map((definition) => (
        <CustomFieldFilter
          key={definition.id}
          definition={definition}
          value={filters.customFields[definition.id] ?? ""}
        />
      ))}
      <div className="flex items-end gap-2">
        <button
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          type="submit"
        >
          Apply
        </button>
        <Link
          className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          href="/"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}

function CustomFieldFilter({
  definition,
  value
}: {
  definition: CustomFieldDefinitionItem;
  value: string;
}) {
  const name = getCustomFieldFilterParamName(definition.id);

  if (definition.fieldType === "boolean") {
    return (
      <label className="space-y-1 text-sm font-medium">
        {definition.label}
        <select
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          name={name}
          defaultValue={value}
        >
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
    );
  }

  return (
    <label className="space-y-1 text-sm font-medium">
      {definition.label}
      <input
        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        name={name}
        type={definition.fieldType === "date" ? "date" : "text"}
        defaultValue={value}
      />
    </label>
  );
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

function getLeadHref(leadId: string, filters: DashboardFilters) {
  const params = new URLSearchParams();

  params.set("leadId", leadId);

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.source !== "all") {
    params.set("source", filters.source);
  }

  for (const [definitionId, value] of Object.entries(filters.customFields)) {
    if (value) {
      params.set(getCustomFieldFilterParamName(definitionId), value);
    }
  }

  return `/?${params.toString()}`;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getCustomFieldFilterParamName(definitionId: string) {
  return `custom_${definitionId}`;
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

async function getDashboardMetrics(
  leadRows: Array<{ status: LeadStatus }>,
  currentTime: number
) {
  const db = getDb();
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

function MetricCard({
  icon,
  label,
  tone = "neutral",
  value
}: {
  icon: ReactNode;
  label: string;
  tone?: "neutral" | "warning" | "danger";
  value: number | string;
}) {
  return (
    <div className={cn("ops-metric", `ops-metric-${tone}`)}>
      <div className="ops-metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ActivityList({
  activity
}: {
  activity: Awaited<ReturnType<typeof getLeadActivity>>;
}) {
  if (activity.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activity has been recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {activity.map((event) => (
        <li
          key={event.id}
          className="rounded-md border border-border bg-muted/30 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{event.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatActivityAction(event.action)} by{" "}
                {event.actorName ?? "System"}
              </p>
            </div>
            <time className="shrink-0 text-right text-xs text-muted-foreground">
              {formatDateTime(event.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
        getLeadStatusColorClassName(status) ?? "bg-gray-100 text-gray-700"
      )}
    >
      {getLeadStatusLabel(status)}
    </span>
  );
}

function ReviewBadge({
  confidence,
  missingFields
}: {
  confidence: number | string;
  missingFields: string[];
}) {
  if (missingFields.length > 0) {
    return (
      <span className="ops-review-badge ops-review-warning">
        {missingFields.length} missing
      </span>
    );
  }

  return <span className="ops-review-badge">{confidence} confidence</span>;
}

function FollowUpDueBadge({
  followUpDueAt,
  currentTime
}: {
  followUpDueAt: Date | null;
  currentTime: number;
}) {
  if (!followUpDueAt) {
    return (
      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
        None
      </span>
    );
  }

  const isOverdue = followUpDueAt.getTime() < currentTime;

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
        isOverdue ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      )}
    >
      {isOverdue ? "Overdue" : "Due"} {formatDate(followUpDueAt)}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6">{value ?? "Missing"}</p>
    </div>
  );
}

function formatSource(sourceType: string, sourceChannel: string) {
  return `${sourceChannel} / ${sourceType.replace("_", " ")}`;
}

function formatActivityAction(action: string) {
  return action
    .split(".")
    .map((part) => part.replace("_", " "))
    .join(" ");
}

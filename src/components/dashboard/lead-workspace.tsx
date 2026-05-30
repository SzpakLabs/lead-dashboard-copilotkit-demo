import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DatabaseZap,
  Filter,
  History,
  ListChecks,
  Settings2,
  SlidersHorizontal,
  Tags,
  UserRound
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CustomFieldDefinitionItem } from "@/components/leads/custom-field-definitions-panel";
import {
  CustomFieldValuesForm,
  type CustomFieldValueItem
} from "@/components/leads/custom-field-values-form";
import {
  FollowUpsPanel,
  type FollowUpListItem
} from "@/components/leads/follow-ups-panel";
import { LeadDetailForm } from "@/components/leads/lead-detail-form";
import { LeadStatusForm } from "@/components/leads/lead-status-form";
import { formatDate, formatDateTime } from "@/lib/date-format";
import { leadStatusOptions, type LeadStatus } from "@/lib/domain/leads/status";
import { cn } from "@/lib/utils";
import {
  ActivityList,
  AssistantPreviewNote,
  Field,
  StatusBadge,
  type ActivityListItem
} from "./lead-ui";

export type LeadSource =
  | "linkedin"
  | "upwork"
  | "referral"
  | "website"
  | "other";

export type DashboardFilters = {
  query: string;
  status: LeadStatus | "all";
  source: LeadSource | "all";
  customFields: Record<string, string>;
};

export type DashboardMetrics = {
  totalLeads: number;
  needsReview: number;
  scheduled: number;
  wonLost: string;
  overdueFollowUps: number;
};

export type LeadLedgerRow = {
  id: string;
  title: string;
  status: LeadStatus;
  source: LeadSource;
  projectType: string | null;
  timeline: string | null;
  nextStep: string | null;
  followUpDueAt: Date | null;
  missingFields: string[];
  confidence: string;
  createdAt: Date;
  updatedAt: Date;
  contactName: string;
  company: string | null;
};

export type LeadDetail = {
  id: string;
  title: string;
  status: LeadStatus;
  source: LeadSource;
  projectType: string | null;
  problemSummary: string | null;
  requestedOutcome: string | null;
  budgetRange: string | null;
  timeline: string | null;
  nextStep: string | null;
  contactName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  sourceType: string;
  sourceChannel: string;
  rawText: string;
  ingestedAt: Date;
};

export const leadSourceOptions: Array<{ value: LeadSource; label: string }> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "upwork", label: "Upwork" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" }
];

export function OperationalHealthStrip({
  metrics
}: {
  metrics: DashboardMetrics;
}) {
  return (
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
  );
}

export function LeadFilterRail({
  activeFilterCount,
  definitions,
  filters,
  metrics
}: {
  activeFilterCount: number;
  definitions: CustomFieldDefinitionItem[];
  filters: DashboardFilters;
  metrics: DashboardMetrics;
}) {
  return (
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
          activeFilterCount={activeFilterCount}
          definitions={definitions}
          filters={filters}
        />
      </section>
    </aside>
  );
}

export function LeadLedgerPanel({
  activeLeadId,
  currentTime,
  filters,
  leads
}: {
  activeLeadId: string | undefined;
  currentTime: number;
  filters: DashboardFilters;
  leads: LeadLedgerRow[];
}) {
  return (
    <section className="ops-ledger" aria-labelledby="lead-ledger-title">
      <div className="ops-ledger-header">
        <div>
          <h2 id="lead-ledger-title">Lead ledger</h2>
          <p>
            {leads.length} matching lead{leads.length === 1 ? "" : "s"} in the
            demo workspace
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
        leads={leads}
      />
    </section>
  );
}

export function LeadInspectorPanel({
  activity,
  customFieldDefinitions,
  customFieldValues,
  detail,
  followUps,
  leadRow
}: {
  activity: ActivityListItem[];
  customFieldDefinitions: CustomFieldDefinitionItem[];
  customFieldValues: CustomFieldValueItem[];
  detail: LeadDetail | null;
  followUps: FollowUpListItem[];
  leadRow: LeadLedgerRow | undefined;
}) {
  return (
    <aside className="ops-inspector" aria-label="Selected lead inspector">
      {detail ? (
        <LeadInspector
          activity={activity}
          customFieldDefinitions={customFieldDefinitions}
          customFieldValues={customFieldValues}
          detail={detail}
          followUps={followUps}
          leadRow={leadRow}
        />
      ) : (
        <section className="ops-panel">
          <p className="text-sm text-muted-foreground">
            Select a lead to review details.
          </p>
        </section>
      )}
    </aside>
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
  leads: LeadLedgerRow[];
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
                <p className="ops-lead-contact">
                  <UserRound className="size-3.5" />
                  <span>
                    {lead.contactName}
                    {lead.company ? `, ${lead.company}` : ""}
                  </span>
                </p>
                {lead.projectType ? (
                  <p className="ops-lead-project">{lead.projectType}</p>
                ) : null}
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
  activity: ActivityListItem[];
  customFieldDefinitions: CustomFieldDefinitionItem[];
  customFieldValues: CustomFieldValueItem[];
  detail: LeadDetail;
  followUps: FollowUpListItem[];
  leadRow: LeadLedgerRow | undefined;
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
        <StatusBadge status={detail.status} />
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

      <nav className="ops-inspector-tabs" aria-label="Selected lead sections">
        <SurfaceLink
          href="#review"
          icon={<ClipboardCheck className="size-4" />}
        >
          Review
        </SurfaceLink>
        <SurfaceLink href="#actions" icon={<Clock3 className="size-4" />}>
          Action
        </SurfaceLink>
        <SurfaceLink href="#source" icon={<DatabaseZap className="size-4" />}>
          Source
        </SurfaceLink>
        <SurfaceLink href="#activity" icon={<History className="size-4" />}>
          Activity
        </SurfaceLink>
        <SurfaceLink href="#custom-fields" icon={<Tags className="size-4" />}>
          Fields
        </SurfaceLink>
      </nav>

      <InspectorSection
        id="review"
        title="Review"
        description="Confirm extracted contact, scope, and qualification fields."
      >
        <LeadReviewSurface detail={detail} leadRow={leadRow} />
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
        title="Action"
        description="Set lifecycle state and keep follow-up commitments current."
      >
        <div className="space-y-5">
          <ActionSummary detail={detail} followUps={followUps} />
          <LeadStatusForm
            key={`status-${detail.id}`}
            leadId={detail.id}
            status={detail.status}
          />
          <FollowUpsPanel
            key={`followups-${detail.id}`}
            leadId={detail.id}
            followUps={followUps}
          />
        </div>
      </InspectorSection>

      <InspectorSection
        id="source"
        title="Source"
        description="Trace the read-only artifact behind this lead."
      >
        <SourceSurface detail={detail} />
      </InspectorSection>

      <InspectorSection
        id="activity"
        title="Activity"
        description="Audited lead, status, and follow-up changes."
      >
        <ActivityList activity={activity} />
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

      <AssistantPreviewNote />
    </section>
  );
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

function LeadFiltersForm({
  activeFilterCount,
  definitions,
  filters
}: {
  activeFilterCount: number;
  definitions: CustomFieldDefinitionItem[];
  filters: DashboardFilters;
}) {
  return (
    <form action="/" className="ops-filter-form">
      <div className="ops-filter-summary">
        <span>{activeFilterCount} active</span>
        <Link href="/">Reset</Link>
      </div>
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
        <button className="ops-form-submit" type="submit">
          Apply
        </button>
        <Link className="ops-form-secondary" href="/">
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

function SurfaceLink({
  children,
  href,
  icon
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
}) {
  return (
    <a href={href}>
      {icon}
      <span>{children}</span>
    </a>
  );
}

function LeadReviewSurface({
  detail,
  leadRow
}: {
  detail: LeadDetail;
  leadRow: LeadLedgerRow | undefined;
}) {
  const missingFields = leadRow?.missingFields ?? [];

  return (
    <div className="ops-review-surface" aria-label="Review summary">
      <div className="ops-review-status">
        <div>
          <p className="ops-eyebrow">Extraction review</p>
          <h4>{missingFields.length > 0 ? "Needs confirmation" : "Ready"}</h4>
        </div>
        <ReviewBadge
          confidence={leadRow?.confidence ?? 0}
          missingFields={missingFields}
        />
      </div>
      {missingFields.length > 0 ? (
        <div className="ops-missing-fields">
          {missingFields.map((field) => (
            <span key={field}>{formatMissingField(field)}</span>
          ))}
        </div>
      ) : (
        <p className="ops-review-copy">
          Core extracted fields are present. Verify the details before moving
          the lead out of review.
        </p>
      )}
      <div className="ops-review-grid">
        <Field label="Contact" value={detail.contactName} />
        <Field label="Company" value={detail.company} />
        <Field label="Project type" value={detail.projectType} />
        <Field label="Budget" value={detail.budgetRange} />
      </div>
    </div>
  );
}

function ActionSummary({
  detail,
  followUps
}: {
  detail: LeadDetail;
  followUps: FollowUpListItem[];
}) {
  const openFollowUps = followUps.filter(
    (followUp) => followUp.status === "open"
  );

  return (
    <div className="ops-action-summary">
      <Field label="Current next step" value={detail.nextStep} />
      <Field
        label="Open follow-ups"
        value={openFollowUps.length > 0 ? String(openFollowUps.length) : "None"}
      />
    </div>
  );
}

function SourceSurface({ detail }: { detail: LeadDetail }) {
  return (
    <div className="space-y-3">
      <div className="ops-review-grid">
        <Field label="Channel" value={detail.sourceChannel} />
        <Field
          label="Source type"
          value={detail.sourceType.replace("_", " ")}
        />
        <Field label="Captured" value={formatDateTime(detail.ingestedAt)} />
        <Field label="Lead source" value={detail.source} />
      </div>
      <div className="ops-source-copy">{detail.rawText}</div>
    </div>
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

export function getCustomFieldFilterParamName(definitionId: string) {
  return `custom_${definitionId}`;
}

function formatMissingField(field: string) {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase();
}

function formatSource(sourceType: string, sourceChannel: string) {
  return `${sourceChannel} / ${sourceType.replace("_", " ")}`;
}

"use client";

import {
  CopilotPopup,
  useHumanInTheLoop,
  useDefaultRenderTool,
  useRenderTool
} from "@copilotkit/react-core/v2";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Pencil,
  Search,
  TrendingUp,
  X
} from "lucide-react";
import { z } from "zod";
import {
  changeLeadStatusToolInputSchema,
  checkAvailabilityInputSchema,
  confirmAssistantMutationInputSchema,
  createFollowUpToolInputSchema,
  findLeadsInputSchema,
  getLeadReportInputSchema,
  getRevenueForecastInputSchema,
  listCalendarItemsInputSchema,
  type AssistantCalendarItem,
  type AssistantLeadCard,
  type AssistantMutationResult,
  type CheckAvailabilityResult,
  type FindLeadsResult,
  type LeadReport,
  type ListCalendarItemsResult,
  openLeadInputSchema,
  type OpenLeadResult,
  type RevenueForecast,
  updateLeadFieldsInputSchema
} from "@/lib/assistant/lead-tool-schemas";
import { getLeadStatusColorClassName } from "@/lib/domain/leads/status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolStatus = "inProgress" | "executing" | "complete";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency"
});

export function AssistantPanel() {
  useDefaultRenderTool();

  useRenderTool(
    {
      name: "find_leads",
      parameters: findLeadsInputSchema,
      render: ({ status, result }) => (
        <FindLeadsCard status={status} result={parseToolResult(result)} />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "open_lead",
      parameters: openLeadInputSchema,
      render: ({ status, result }) => (
        <OpenLeadCard status={status} result={parseToolResult(result)} />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "list_calendar_items",
      parameters: listCalendarItemsInputSchema,
      render: ({ status, result }) => (
        <CalendarItemsCard status={status} result={parseToolResult(result)} />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "check_availability",
      parameters: checkAvailabilityInputSchema,
      render: ({ status, result }) => (
        <AvailabilityCard status={status} result={parseToolResult(result)} />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "get_lead_report",
      parameters: getLeadReportInputSchema,
      render: ({ status, result }) => (
        <LeadReportCard status={status} result={parseToolResult(result)} />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "get_revenue_forecast",
      parameters: getRevenueForecastInputSchema,
      render: ({ status, result }) => (
        <RevenueForecastCard status={status} result={parseToolResult(result)} />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "update_lead_fields",
      parameters: updateLeadFieldsInputSchema,
      render: ({ status, result }) => (
        <MutationCard
          status={status}
          result={parseToolResult(result)}
          title="Lead update"
        />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "change_lead_status",
      parameters: changeLeadStatusToolInputSchema,
      render: ({ status, result }) => (
        <MutationCard
          status={status}
          result={parseToolResult(result)}
          title="Status change"
        />
      )
    },
    []
  );

  useRenderTool(
    {
      name: "create_followup",
      parameters: createFollowUpToolInputSchema,
      render: ({ status, result }) => (
        <MutationCard
          status={status}
          result={parseToolResult(result)}
          title="Follow-up"
        />
      )
    },
    []
  );

  useHumanInTheLoop({
    name: "confirm_assistant_mutation",
    description:
      "Ask the user to approve or reject an assistant mutation preview before it is applied.",
    parameters: confirmAssistantMutationInputSchema,
    render: ({ status, args, respond }) => (
      <ToolShell icon={<Pencil className="size-4" />} title="Confirm change">
        <p className="text-sm font-medium">{args.summary}</p>
        <ChangeList
          changes={(args.changes ?? []).map((change) => ({
            field: change.field,
            before: change.before ?? null,
            after: change.after ?? null
          }))}
        />
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="ops-copilot-action-primary"
            disabled={status !== "executing"}
            onClick={() =>
              respond?.({ approved: true, previewId: args.previewId })
            }
          >
            <Check className="mr-2 size-4" />
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="ops-copilot-action-secondary"
            disabled={status !== "executing"}
            onClick={() =>
              respond?.({ approved: false, previewId: args.previewId })
            }
          >
            <X className="mr-2 size-4" />
            Reject
          </Button>
        </div>
      </ToolShell>
    )
  });

  return (
    <CopilotPopup
      agentId="default"
      attachments={{ enabled: false }}
      defaultOpen={false}
      labels={{
        modalHeaderTitle: "Lead assistant",
        chatToggleOpenLabel: "Open lead assistant",
        chatToggleCloseLabel: "Close lead assistant",
        chatInputPlaceholder: "Ask about leads, reports, or follow-ups...",
        welcomeMessageText:
          "Ask for lead search, reports, forecasts, calendar checks, or previewed edits.",
        chatDisclaimerText: "Assistant edits require your confirmation."
      }}
    />
  );
}

function FindLeadsCard({
  status,
  result
}: {
  status: ToolStatus;
  result: FindLeadsResult | null;
}) {
  if (status !== "complete" || !result) {
    return <ToolShell icon={<Search className="size-4" />} title="Searching" />;
  }

  return (
    <ToolShell
      icon={<Search className="size-4" />}
      title={`Found ${result.count} lead${result.count === 1 ? "" : "s"}`}
    >
      <div className="space-y-2">
        {result.leads.length > 0 ? (
          result.leads.map((lead) => (
            <LeadResultItem key={lead.id} lead={lead} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No matching leads.</p>
        )}
      </div>
    </ToolShell>
  );
}

function OpenLeadCard({
  status,
  result
}: {
  status: ToolStatus;
  result: OpenLeadResult | null;
}) {
  if (status !== "complete" || !result) {
    return (
      <ToolShell
        icon={<ExternalLink className="size-4" />}
        title="Opening lead"
      />
    );
  }

  return (
    <ToolShell icon={<ExternalLink className="size-4" />} title="Lead ready">
      <LeadResultItem lead={result.lead} />
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        {result.lead.problemSummary ? (
          <p>{result.lead.problemSummary}</p>
        ) : null}
        {result.lead.nextStep ? <p>Next: {result.lead.nextStep}</p> : null}
      </div>
    </ToolShell>
  );
}

function CalendarItemsCard({
  status,
  result
}: {
  status: ToolStatus;
  result: ListCalendarItemsResult | null;
}) {
  if (status !== "complete" || !result) {
    return (
      <ToolShell
        icon={<CalendarDays className="size-4" />}
        title="Checking calendar"
      />
    );
  }

  return (
    <ToolShell
      icon={<CalendarDays className="size-4" />}
      title={`${result.count} calendar item${result.count === 1 ? "" : "s"}`}
    >
      <div className="space-y-2">
        {result.items.length > 0 ? (
          result.items.map((item) => (
            <CalendarResultItem key={item.id} item={item} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No lead-related calendar items in this range.
          </p>
        )}
      </div>
    </ToolShell>
  );
}

function AvailabilityCard({
  status,
  result
}: {
  status: ToolStatus;
  result: CheckAvailabilityResult | null;
}) {
  if (status !== "complete" || !result) {
    return (
      <ToolShell
        icon={<Clock className="size-4" />}
        title="Checking availability"
      />
    );
  }

  return (
    <ToolShell
      icon={<Clock className="size-4" />}
      title={result.available ? "Slot looks free" : "Slot is not free"}
    >
      <p className="text-sm text-muted-foreground">
        {new Date(result.startsAt).toLocaleString()} -{" "}
        {new Date(result.endsAt).toLocaleTimeString()} ({result.timezone})
      </p>
      {result.outsideWorkingHours ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Outside provided working hours.
        </p>
      ) : null}
      {result.conflicts.length > 0 ? (
        <div className="mt-3 space-y-2">
          {result.conflicts.map((item) => (
            <CalendarResultItem key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </ToolShell>
  );
}

function LeadReportCard({
  status,
  result
}: {
  status: ToolStatus;
  result: LeadReport | null;
}) {
  if (status !== "complete" || !result) {
    return (
      <ToolShell
        icon={<BarChart3 className="size-4" />}
        title="Building report"
      />
    );
  }

  return (
    <ToolShell
      icon={<BarChart3 className="size-4" />}
      title={`Report: ${formatPeriod(result.period.startsAt, result.period.endsAt)}`}
    >
      <p className="mb-3 text-xs text-muted-foreground">
        {result.answerPrefix}. {result.limitation}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <MetricCell label="Lead volume" value={result.totals.leadVolume} />
        <MetricCell label="Scheduled" value={result.totals.scheduledWork} />
        <MetricCell label="Completed" value={result.totals.completedWork} />
        <MetricCell label="Overdue" value={result.totals.overdueFollowUps} />
      </div>
      <BucketBars title="Status mix" buckets={result.statusBuckets} />
      <BucketBars title="Source mix" buckets={result.sourceBuckets} />
      <ReportLeadList
        title="Notable leads"
        leads={result.notableLeads}
        emptyText="No notable leads in this period."
      />
      <BottleneckList bottlenecks={result.bottlenecks} />
    </ToolShell>
  );
}

function RevenueForecastCard({
  status,
  result
}: {
  status: ToolStatus;
  result: RevenueForecast | null;
}) {
  if (status !== "complete" || !result) {
    return (
      <ToolShell
        icon={<TrendingUp className="size-4" />}
        title="Building forecast"
      />
    );
  }

  return (
    <ToolShell
      icon={<TrendingUp className="size-4" />}
      title={`Forecast: ${formatPeriod(result.period.startsAt, result.period.endsAt)}`}
    >
      <p className="mb-3 text-xs text-muted-foreground">
        {result.answerPrefix}. {result.limitation}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MetricCell
          label="Confirmed"
          value={formatCurrency(result.confirmedValue)}
        />
        <MetricCell
          label="Weighted pipeline"
          value={formatCurrency(result.weightedPipelineValue)}
        />
        <MetricCell
          label="Optimistic"
          value={formatCurrency(result.optimisticPipelineValue)}
        />
      </div>
      <ForecastLeadList assumptions={result.leadAssumptions} />
      {result.missingDataNotes.length > 0 ? (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {result.missingDataNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      ) : null}
    </ToolShell>
  );
}

function MutationCard({
  status,
  result,
  title
}: {
  status: ToolStatus;
  result: AssistantMutationResult | null;
  title: string;
}) {
  if (status !== "complete" || !result) {
    return <ToolShell icon={<Pencil className="size-4" />} title={title} />;
  }

  if (result.status === "applied") {
    return (
      <ToolShell icon={<Check className="size-4" />} title="Change applied">
        <p className="text-sm text-muted-foreground">{result.result.summary}</p>
      </ToolShell>
    );
  }

  return (
    <ToolShell icon={<Pencil className="size-4" />} title="Preview ready">
      <p className="text-sm font-medium">{result.preview.summary}</p>
      <ChangeList changes={result.preview.changes} />
      <p className="mt-3 text-xs text-muted-foreground">
        Confirmation required before this changes dashboard data.
      </p>
    </ToolShell>
  );
}

function LeadResultItem({ lead }: { lead: AssistantLeadCard }) {
  return (
    <a className="ops-copilot-result-item block rounded-md p-3" href={lead.url}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lead.contactName}
            {lead.company ? `, ${lead.company}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
            getLeadStatusColorClassName(lead.status) ?? "ops-status-badge"
          )}
        >
          {lead.statusLabel}
        </span>
      </div>
      <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
        {lead.projectType ? <span>Project: {lead.projectType}</span> : null}
        {lead.timeline ? <span>Timeline: {lead.timeline}</span> : null}
      </div>
    </a>
  );
}

function ChangeList({
  changes
}: {
  changes: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }>;
}) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {changes.map((change) => (
        <div
          key={change.field}
          className="ops-copilot-result-item rounded-md p-2 text-xs"
        >
          <p className="font-medium">{formatFieldLabel(change.field)}</p>
          <p className="mt-1 text-muted-foreground">
            {change.before ?? "Empty"} → {change.after ?? "Empty"}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatFieldLabel(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function CalendarResultItem({ item }: { item: AssistantCalendarItem }) {
  return (
    <a className="ops-copilot-result-item block rounded-md p-3" href={item.url}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(item.startsAt).toLocaleString()} · {item.contactName}
            {item.company ? `, ${item.company}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
            getLeadStatusColorClassName(item.status) ?? "ops-status-badge"
          )}
        >
          {item.statusLabel}
        </span>
      </div>
      {item.note ? (
        <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
      ) : null}
    </a>
  );
}

function MetricCell({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="ops-copilot-result-item rounded-md p-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function BucketBars({
  buckets,
  title
}: {
  buckets: LeadReport["statusBuckets"];
  title: string;
}) {
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));

  if (buckets.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium">{title}</p>
      <div className="space-y-2">
        {buckets.slice(0, 5).map((bucket) => (
          <div key={bucket.key} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">{bucket.label}</span>
              <span className="text-muted-foreground">
                {bucket.count} · {bucket.percentage}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.max(8, (bucket.count / maxCount) * 100)}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportLeadList({
  emptyText,
  leads,
  title
}: {
  emptyText: string;
  leads: LeadReport["notableLeads"];
  title: string;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium">{title}</p>
      <div className="space-y-2">
        {leads.length > 0 ? (
          leads.slice(0, 4).map((lead) => (
            <a
              key={lead.id}
              className="ops-copilot-result-item block rounded-md p-2"
              href={lead.url}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lead.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lead.contactName}
                    {lead.company ? `, ${lead.company}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {lead.statusLabel}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {lead.reason}
              </p>
            </a>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function ForecastLeadList({
  assumptions
}: {
  assumptions: RevenueForecast["leadAssumptions"];
}) {
  if (assumptions.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No forecastable leads in this period.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {assumptions.slice(0, 5).map((lead) => (
        <a
          key={lead.id}
          className="ops-copilot-result-item block rounded-md p-2"
          href={lead.url}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{lead.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lead.statusLabel} · {lead.contactName}
              </p>
            </div>
            <div className="shrink-0 text-right text-xs">
              <p className="font-semibold">
                {formatCurrency(lead.estimatedValue)}
              </p>
              <p className="text-muted-foreground">
                {Math.round(lead.statusWeight * lead.confidenceWeight * 100)}%
              </p>
            </div>
          </div>
          {lead.notes.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {lead.notes.join(" · ")}
            </p>
          ) : null}
        </a>
      ))}
    </div>
  );
}

function BottleneckList({ bottlenecks }: { bottlenecks: string[] }) {
  return (
    <div className="mt-4 space-y-2">
      {bottlenecks.map((bottleneck) => (
        <div
          key={bottleneck}
          className="flex gap-2 text-xs text-muted-foreground"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>{bottleneck}</span>
        </div>
      ))}
    </div>
  );
}

function ToolShell({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ops-copilot-tool-card rounded-md p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function formatPeriod(startsAt: string, endsAt: string) {
  return `${new Date(startsAt).toLocaleDateString()} - ${new Date(
    endsAt
  ).toLocaleDateString()}`;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function parseToolResult<T>(result: unknown): T | null {
  if (!result) {
    return null;
  }

  if (typeof result === "object") {
    return result as T;
  }

  if (typeof result !== "string") {
    return null;
  }

  try {
    return z.unknown().parse(JSON.parse(result)) as T;
  } catch {
    return null;
  }
}

"use client";

import {
  CopilotPopup,
  useHumanInTheLoop,
  useRenderTool
} from "@copilotkit/react-core/v2";
import {
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Pencil,
  Search,
  X
} from "lucide-react";
import { z } from "zod";
import {
  changeLeadStatusToolInputSchema,
  checkAvailabilityInputSchema,
  confirmAssistantMutationInputSchema,
  createFollowUpToolInputSchema,
  findLeadsInputSchema,
  listCalendarItemsInputSchema,
  type AssistantCalendarItem,
  type AssistantLeadCard,
  type AssistantMutationResult,
  type CheckAvailabilityResult,
  type FindLeadsResult,
  type ListCalendarItemsResult,
  openLeadInputSchema,
  type OpenLeadResult,
  updateLeadFieldsInputSchema
} from "@/lib/assistant/lead-tool-schemas";
import { getLeadStatusColorClassName } from "@/lib/domain/leads/status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AssistantPanel() {
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
        <ChangeList changes={args.changes ?? []} />
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
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
      defaultOpen={false}
      labels={{
        modalHeaderTitle: "Lead assistant",
        chatToggleOpenLabel: "Open lead assistant",
        chatToggleCloseLabel: "Close lead assistant",
        chatInputPlaceholder:
          "Search leads, check availability, or draft edits...",
        welcomeMessageText:
          "Ask me to find leads, list scheduled work, check a fully specified time slot, or preview lead changes.",
        chatDisclaimerText: "Assistant edits require your confirmation."
      }}
    />
  );
}

function FindLeadsCard({
  status,
  result
}: {
  status: "inProgress" | "executing" | "complete";
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
  status: "inProgress" | "executing" | "complete";
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
  status: "inProgress" | "executing" | "complete";
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
  status: "inProgress" | "executing" | "complete";
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

function MutationCard({
  status,
  result,
  title
}: {
  status: "inProgress" | "executing" | "complete";
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
    <a
      className="block rounded-md border border-border bg-background p-3 hover:bg-muted/50"
      href={lead.url}
    >
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
            getLeadStatusColorClassName(lead.status) ??
              "bg-gray-100 text-gray-700"
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
          className="rounded-md border border-border bg-background p-2 text-xs"
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
    <a
      className="block rounded-md border border-border bg-background p-3 hover:bg-muted/50"
      href={item.url}
    >
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
            getLeadStatusColorClassName(item.status) ??
              "bg-gray-100 text-gray-700"
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
    <div className="rounded-md border border-border bg-white p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
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

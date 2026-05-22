"use client";

import { CopilotSidebar, useRenderTool } from "@copilotkit/react-core/v2";
import { ExternalLink, Search } from "lucide-react";
import { z } from "zod";
import {
  findLeadsInputSchema,
  type AssistantLeadCard,
  type FindLeadsResult,
  openLeadInputSchema,
  type OpenLeadResult
} from "@/lib/assistant/lead-tool-schemas";
import { getLeadStatusColorClassName } from "@/lib/domain/leads/status";
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

  return (
    <CopilotSidebar
      agentId="default"
      defaultOpen={false}
      width={420}
      labels={{
        modalHeaderTitle: "Lead assistant",
        chatToggleOpenLabel: "Open lead assistant",
        chatToggleCloseLabel: "Close lead assistant",
        chatInputPlaceholder: "Search leads or open a lead...",
        welcomeMessageText:
          "Ask me to find leads by contact, company, status, project type, or next step.",
        chatDisclaimerText: "Read-only dashboard assistant."
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

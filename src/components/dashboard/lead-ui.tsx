import { Bot, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatDateTime } from "@/lib/date-format";
import {
  getLeadStatusColorClassName,
  getLeadStatusLabel,
  type LeadStatus
} from "@/lib/domain/leads/status";
import { cn } from "@/lib/utils";

export type ActivityListItem = {
  id: string;
  action: string;
  summary: string;
  createdAt: Date;
  actorName: string | null;
};

export function StatusBadge({ status }: { status: LeadStatus }) {
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

export function Field({
  label,
  value
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="ops-fact">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6">{value ?? "Missing"}</p>
    </div>
  );
}

export function ActivityList({ activity }: { activity: ActivityListItem[] }) {
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

export function DetailSection({
  action,
  children,
  description,
  icon: Icon,
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  const titleId = title.toLowerCase().replace(/\W+/g, "-");

  return (
    <section
      className="ops-panel ops-lead-detail-section"
      aria-labelledby={titleId}
    >
      <div className="ops-section-heading">
        <div>
          <p className="ops-eyebrow">
            <Icon className="size-4" />
            Workspace
          </p>
          <h2 id={titleId}>{title}</h2>
          <p>{description}</p>
        </div>
        {action ? <div className="ops-section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AssistantPreviewNote() {
  return (
    <div className="ops-assistant-note">
      <Bot className="size-4" />
      <span>Assistant changes still require preview and confirmation.</span>
    </div>
  );
}

function formatActivityAction(action: string) {
  return action
    .split(".")
    .map((part) => part.replace("_", " "))
    .join(" ");
}

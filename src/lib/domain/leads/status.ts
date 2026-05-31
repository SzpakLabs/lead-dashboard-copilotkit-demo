import { z } from "zod";

export const leadStatusSchema = z.enum([
  "new",
  "needs_review",
  "contacted",
  "scheduled",
  "in_progress",
  "won",
  "lost"
]);

export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const leadStatusOptions: Array<{
  value: LeadStatus;
  label: string;
  colorClassName: string;
}> = [
  {
    value: "new",
    label: "New",
    colorClassName: "ops-status-badge ops-status-new"
  },
  {
    value: "needs_review",
    label: "Needs review",
    colorClassName: "ops-status-badge ops-status-needs-review"
  },
  {
    value: "contacted",
    label: "Contacted",
    colorClassName: "ops-status-badge ops-status-contacted"
  },
  {
    value: "scheduled",
    label: "Scheduled",
    colorClassName: "ops-status-badge ops-status-scheduled"
  },
  {
    value: "in_progress",
    label: "In progress",
    colorClassName: "ops-status-badge ops-status-in-progress"
  },
  {
    value: "won",
    label: "Won",
    colorClassName: "ops-status-badge ops-status-won"
  },
  {
    value: "lost",
    label: "Lost",
    colorClassName: "ops-status-badge ops-status-lost"
  }
];

export const allowedLeadStatusTransitions: Record<LeadStatus, LeadStatus[]> = {
  new: ["needs_review", "contacted", "scheduled", "lost"],
  needs_review: ["contacted", "scheduled", "lost"],
  contacted: ["scheduled", "in_progress", "won", "lost"],
  scheduled: ["contacted", "in_progress", "won", "lost"],
  in_progress: ["scheduled", "won", "lost"],
  won: ["contacted"],
  lost: ["contacted"]
};

export function canChangeLeadStatus(from: LeadStatus, to: LeadStatus) {
  return from === to || allowedLeadStatusTransitions[from].includes(to);
}

export function getLeadStatusLabel(status: LeadStatus) {
  return leadStatusOptions.find((option) => option.value === status)?.label;
}

export function getLeadStatusColorClassName(status: LeadStatus) {
  return leadStatusOptions.find((option) => option.value === status)
    ?.colorClassName;
}

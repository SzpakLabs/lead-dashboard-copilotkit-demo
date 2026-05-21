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
    colorClassName: "bg-gray-100 text-gray-700"
  },
  {
    value: "needs_review",
    label: "Needs review",
    colorClassName: "bg-amber-100 text-amber-800"
  },
  {
    value: "contacted",
    label: "Contacted",
    colorClassName: "bg-blue-100 text-blue-800"
  },
  {
    value: "scheduled",
    label: "Scheduled",
    colorClassName: "bg-violet-100 text-violet-800"
  },
  {
    value: "in_progress",
    label: "In progress",
    colorClassName: "bg-cyan-100 text-cyan-800"
  },
  {
    value: "won",
    label: "Won",
    colorClassName: "bg-green-100 text-green-800"
  },
  {
    value: "lost",
    label: "Lost",
    colorClassName: "bg-red-100 text-red-800"
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

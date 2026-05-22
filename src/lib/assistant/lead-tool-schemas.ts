import { z } from "zod";
import { leadStatusSchema, type LeadStatus } from "@/lib/domain/leads/status";

export const findLeadsInputSchema = z.object({
  query: z.string().trim().max(160).optional(),
  status: leadStatusSchema.optional(),
  limit: z.number().int().min(1).max(8).default(5)
});

export const openLeadInputSchema = z.object({
  leadId: z.string().uuid()
});

const isoDateTimeSchema = z
  .string()
  .datetime()
  .describe("ISO 8601 date-time with timezone offset or Z");

const workingHourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format");

export const listCalendarItemsInputSchema = z.object({
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema,
  limit: z.number().int().min(1).max(20).default(10)
});

export const checkAvailabilityInputSchema = z.object({
  startsAt: isoDateTimeSchema,
  durationMinutes: z.number().int().min(1).max(480),
  timezone: z
    .string()
    .min(1)
    .describe("IANA timezone, for example Europe/Warsaw"),
  workingHoursStart: workingHourSchema.describe("Local working day start"),
  workingHoursEnd: workingHourSchema.describe("Local working day end")
});

export type AssistantLeadCard = {
  id: string;
  url: string;
  title: string;
  status: LeadStatus;
  statusLabel: string;
  source: string;
  contactName: string;
  company: string | null;
  projectType: string | null;
  timeline: string | null;
  nextStep: string | null;
  followUpDueAt: string | null;
  updatedAt: string;
};

export type FindLeadsResult = {
  query: string | null;
  count: number;
  leads: AssistantLeadCard[];
};

export type OpenLeadResult = {
  lead: AssistantLeadCard & {
    email: string | null;
    phone: string | null;
    problemSummary: string | null;
    requestedOutcome: string | null;
    budgetRange: string | null;
    scheduledAt: string | null;
    sourceContext: {
      sourceType: string | null;
      sourceChannel: string | null;
      rawText: string | null;
      ingestedAt: string | null;
    };
  };
};

export type AssistantCalendarItem = {
  id: string;
  leadId: string;
  url: string;
  title: string;
  contactName: string;
  company: string | null;
  status: LeadStatus;
  statusLabel: string;
  kind:
    | "scheduled"
    | "completed"
    | "lead_follow_up_due"
    | "follow_up_due"
    | "follow_up_completed";
  startsAt: string;
  note: string | null;
};

export type ListCalendarItemsResult = {
  startsAt: string;
  endsAt: string;
  count: number;
  items: AssistantCalendarItem[];
  answerPrefix: "Based on this dashboard";
};

export type CheckAvailabilityResult = {
  available: boolean;
  startsAt: string;
  endsAt: string;
  timezone: string;
  outsideWorkingHours: boolean;
  conflicts: AssistantCalendarItem[];
  answerPrefix: "Based on this dashboard";
  limitation: string;
};

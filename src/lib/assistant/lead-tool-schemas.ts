import { z } from "zod";
import { leadStatusSchema, type LeadStatus } from "@/lib/domain/leads/status";

const leadSourceSchema = z.string().trim().min(1).max(80);
const clearableEmailSchema = z
  .string()
  .trim()
  .max(180)
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    {
      message: "Use a valid email address or an empty string to clear it"
    }
  );

const clearableStringSchema = (max: number) => z.string().trim().max(max);

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

export const getLeadReportInputSchema = z.object({
  periodStart: isoDateTimeSchema,
  periodEnd: isoDateTimeSchema,
  comparisonPeriodStart: isoDateTimeSchema.optional(),
  comparisonPeriodEnd: isoDateTimeSchema.optional(),
  limit: z.number().int().min(1).max(10).default(6)
});

export const getRevenueForecastInputSchema = z.object({
  periodStart: isoDateTimeSchema,
  periodEnd: isoDateTimeSchema,
  limit: z.number().int().min(1).max(10).default(8)
});

export const assistantMutationApplySchema = z.object({
  mode: z.literal("apply"),
  previewId: z.string().uuid()
});

const leadFieldPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(180).optional(),
    source: leadSourceSchema.optional(),
    contactName: z.string().trim().min(1).max(160).optional(),
    company: clearableStringSchema(160).optional(),
    email: clearableEmailSchema.optional(),
    phone: clearableStringSchema(80).optional(),
    projectType: clearableStringSchema(120).optional(),
    problemSummary: clearableStringSchema(1_000).optional(),
    requestedOutcome: clearableStringSchema(1_000).optional(),
    budgetRange: clearableStringSchema(120).optional(),
    timeline: clearableStringSchema(180).optional(),
    nextStep: clearableStringSchema(240).optional()
  })
  .refine((fields) => Object.keys(fields).length > 0, {
    message: "Provide at least one lead field to update"
  });

export const updateLeadFieldsPreviewInputSchema = z.object({
  mode: z.literal("preview").default("preview"),
  leadId: z.string().uuid(),
  fields: leadFieldPatchSchema
});

export const updateLeadFieldsInputSchema = z.object({
  mode: z.enum(["preview", "apply"]).default("preview"),
  leadId: z.string().uuid().optional().describe("Required in preview mode"),
  fields: leadFieldPatchSchema.optional().describe("Required in preview mode"),
  previewId: z.string().uuid().optional().describe("Required in apply mode")
});

export const changeLeadStatusPreviewInputSchema = z.object({
  mode: z.literal("preview").default("preview"),
  leadId: z.string().uuid(),
  status: leadStatusSchema
});

export const changeLeadStatusToolInputSchema = z.object({
  mode: z.enum(["preview", "apply"]).default("preview"),
  leadId: z.string().uuid().optional().describe("Required in preview mode"),
  status: leadStatusSchema.optional().describe("Required in preview mode"),
  previewId: z.string().uuid().optional().describe("Required in apply mode")
});

export const createFollowUpPreviewInputSchema = z.object({
  mode: z.literal("preview").default("preview"),
  leadId: z.string().uuid(),
  note: z.string().trim().min(1).max(1_000),
  followUpDueAt: isoDateTimeSchema
});

export const createFollowUpToolInputSchema = z.object({
  mode: z.enum(["preview", "apply"]).default("preview"),
  leadId: z.string().uuid().optional().describe("Required in preview mode"),
  note: z
    .string()
    .trim()
    .min(1)
    .max(1_000)
    .optional()
    .describe("Required in preview mode"),
  followUpDueAt: isoDateTimeSchema
    .optional()
    .describe("Required in preview mode"),
  previewId: z.string().uuid().optional().describe("Required in apply mode")
});

export const rejectAssistantMutationInputSchema = z.object({
  previewId: z.string().uuid()
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

export type AssistantMutationChange = {
  field: string;
  before: string | null;
  after: string | null;
};

export type AssistantMutationPreview = {
  previewId: string;
  toolName: string;
  leadId: string;
  summary: string;
  changes: AssistantMutationChange[];
  requiresConfirmation: true;
};

export type AssistantMutationApplied = {
  previewId: string;
  toolName: string;
  leadId: string;
  applied: true;
  summary: string;
};

export type AssistantMutationResult =
  | {
      status: "preview";
      preview: AssistantMutationPreview;
    }
  | {
      status: "applied";
      result: AssistantMutationApplied;
    };

export const confirmAssistantMutationInputSchema = z.object({
  previewId: z.string().uuid(),
  toolName: z.string(),
  summary: z.string(),
  changes: z.array(
    z.object({
      field: z.string(),
      before: z.string().optional(),
      after: z.string().optional()
    })
  )
});

export type { LeadReport, RevenueForecast } from "@/lib/domain/reports/types";

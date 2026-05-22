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

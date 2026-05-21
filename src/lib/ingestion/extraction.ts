import { z } from "zod";

export const extractionSourceChannelSchema = z.enum([
  "linkedin",
  "upwork",
  "referral",
  "website",
  "other"
]);

export const extractedLeadSchema = z.object({
  contactName: z.string().nullable(),
  company: z.string().nullable(),
  sourceChannel: extractionSourceChannelSchema,
  projectType: z.string().nullable(),
  problemSummary: z.string().nullable(),
  requestedOutcome: z.string().nullable(),
  budgetRange: z.string().nullable(),
  timeline: z.string().nullable(),
  nextStep: z.string().nullable(),
  scheduledAt: z.date().nullable(),
  followUpDueAt: z.date().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  missingFields: z.array(z.string())
});

export type ExtractedLead = z.infer<typeof extractedLeadSchema>;

export type ExtractionInput = {
  sourceChannel: z.infer<typeof extractionSourceChannelSchema>;
  sourceType: "pasted_text" | "pasted_transcript";
  text: string;
};

export type LeadExtractor = {
  extract(input: ExtractionInput): ExtractedLead;
};

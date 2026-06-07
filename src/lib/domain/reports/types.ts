import type { LeadStatus } from "@/lib/domain/leads/status";

export type ReportBucket = {
  key: string;
  label: string;
  count: number;
  percentage: number;
  value: number | null;
};

export type ReportLeadSummary = {
  id: string;
  url: string;
  title: string;
  contactName: string;
  company: string | null;
  status: LeadStatus;
  statusLabel: string;
  source: string;
  sourceLabel: string;
  budgetRange: string | null;
  nextStep: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  followUpDueAt: string | null;
  reason: string;
};

export type LeadReport = {
  answerPrefix: "Based on this dashboard";
  limitation: string;
  period: {
    startsAt: string;
    endsAt: string;
    comparisonStartsAt: string | null;
    comparisonEndsAt: string | null;
  };
  totals: {
    leadVolume: number;
    scheduledWork: number;
    completedWork: number;
    overdueFollowUps: number;
    openFollowUps: number;
    won: number;
    lost: number;
    needsReview: number;
  };
  comparison: {
    leadVolumeDelta: number | null;
    wonDelta: number | null;
    scheduledWorkDelta: number | null;
  };
  statusBuckets: ReportBucket[];
  sourceBuckets: ReportBucket[];
  reviewWorkload: {
    needsReview: number;
    missingFieldLeads: number;
    lowConfidence: number;
    mediumConfidence: number;
  };
  scheduledWork: ReportLeadSummary[];
  completedWork: ReportLeadSummary[];
  overdueFollowUps: ReportLeadSummary[];
  notableLeads: ReportLeadSummary[];
  bottlenecks: string[];
};

export type ForecastLeadAssumption = {
  id: string;
  url: string;
  title: string;
  contactName: string;
  company: string | null;
  status: LeadStatus;
  statusLabel: string;
  budgetRange: string | null;
  budgetMidpoint: number | null;
  budgetHigh: number | null;
  statusWeight: number;
  confidenceWeight: number;
  estimatedValue: number;
  optimisticValue: number;
  scheduledAt: string | null;
  followUpDueAt: string | null;
  notes: string[];
};

export type RevenueForecast = {
  answerPrefix: "Based on this dashboard";
  limitation: string;
  period: {
    startsAt: string;
    endsAt: string;
  };
  confirmedValue: number;
  weightedPipelineValue: number;
  optimisticPipelineValue: number;
  leadAssumptions: ForecastLeadAssumption[];
  assumptions: string[];
  missingDataNotes: string[];
};

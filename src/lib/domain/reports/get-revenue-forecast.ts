import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contacts, leads } from "@/lib/db/schema";
import { getLeadStatusLabel, type LeadStatus } from "@/lib/domain/leads/status";
import { parseBudgetRange } from "./budget";
import type { ForecastLeadAssumption, RevenueForecast } from "./types";

type RevenueForecastInput = {
  workspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
};

type BuildRevenueForecastInput = Omit<RevenueForecastInput, "workspaceId"> & {
  leadRows: ForecastLeadRow[];
};

type ForecastLeadRow = {
  id: string;
  title: string;
  status: LeadStatus;
  budgetRange: string | null;
  scheduledAt: Date | null;
  completedAt: Date | null;
  followUpDueAt: Date | null;
  missingFields: string[];
  confidence: string;
  createdAt: Date;
  contactName: string;
  company: string | null;
};

const statusWeights: Record<LeadStatus, number> = {
  new: 0.1,
  needs_review: 0.15,
  contacted: 0.35,
  scheduled: 0.6,
  in_progress: 0.7,
  won: 1,
  lost: 0
};

const optimisticStatusWeights: Record<LeadStatus, number> = {
  new: 0.25,
  needs_review: 0.35,
  contacted: 0.65,
  scheduled: 0.85,
  in_progress: 0.9,
  won: 1,
  lost: 0
};

export async function getRevenueForecast(
  input: RevenueForecastInput
): Promise<RevenueForecast> {
  assertValidPeriod(input.periodStart, input.periodEnd);

  const db = getDb();
  const leadRows = await db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      budgetRange: leads.budgetRange,
      scheduledAt: leads.scheduledAt,
      completedAt: leads.completedAt,
      followUpDueAt: leads.followUpDueAt,
      missingFields: leads.missingFields,
      confidence: leads.confidence,
      createdAt: leads.createdAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(leads.workspaceId, input.workspaceId));

  return buildRevenueForecast({ ...input, leadRows });
}

export function buildRevenueForecast(
  input: BuildRevenueForecastInput
): RevenueForecast {
  const limit = input.limit ?? 8;
  const confirmedAssumptions = input.leadRows
    .filter(
      (lead) =>
        lead.status === "won" &&
        isInPeriod(lead.completedAt, input.periodStart, input.periodEnd)
    )
    .map((lead) =>
      toForecastAssumption(lead, input.periodStart, input.periodEnd)
    );
  const pipelineAssumptions = input.leadRows
    .filter((lead) =>
      isForecastCandidate(lead, input.periodStart, input.periodEnd)
    )
    .filter((lead) => lead.status !== "won")
    .map((lead) =>
      toForecastAssumption(lead, input.periodStart, input.periodEnd)
    )
    .sort((first, second) => second.estimatedValue - first.estimatedValue);
  const confirmedValue = roundCurrency(
    confirmedAssumptions.reduce(
      (total, lead) => total + (lead.budgetMidpoint ?? 0),
      0
    )
  );
  const weightedPipelineValue = roundCurrency(
    pipelineAssumptions.reduce((total, lead) => total + lead.estimatedValue, 0)
  );
  const optimisticPipelineValue = roundCurrency(
    pipelineAssumptions.reduce((total, lead) => total + lead.optimisticValue, 0)
  );
  const leadAssumptions = [...confirmedAssumptions, ...pipelineAssumptions]
    .sort(
      (first, second) =>
        (second.budgetMidpoint ?? 0) - (first.budgetMidpoint ?? 0)
    )
    .slice(0, limit);

  return {
    answerPrefix: "Based on this dashboard",
    limitation:
      "Forecast is a deterministic estimate from dashboard budgets, statuses, review state, follow-up timing, and internal schedule dates.",
    period: {
      startsAt: input.periodStart.toISOString(),
      endsAt: input.periodEnd.toISOString()
    },
    confirmedValue,
    weightedPipelineValue,
    optimisticPipelineValue,
    leadAssumptions,
    assumptions: [
      "Won leads completed in the period count as confirmed value when a budget is parseable.",
      "Pipeline weights use status, confidence, review state, scheduled work, and follow-up timing.",
      "Missing or unparseable budgets stay unknown and are excluded from value totals."
    ],
    missingDataNotes: getMissingDataNotes(input.leadRows)
  };
}

function toForecastAssumption(
  lead: ForecastLeadRow,
  periodStart: Date,
  periodEnd: Date
): ForecastLeadAssumption {
  const budget = parseBudgetRange(lead.budgetRange);
  const confidenceWeight = getConfidenceWeight(lead);
  const statusWeight = getAdjustedStatusWeight(lead, periodStart, periodEnd);
  const optimisticWeight = getAdjustedOptimisticWeight(
    lead,
    periodStart,
    periodEnd
  );
  const budgetMidpoint = budget.midpoint;
  const budgetHigh = budget.max;

  return {
    id: lead.id,
    url: `/leads/${lead.id}`,
    title: lead.title,
    contactName: lead.contactName,
    company: lead.company,
    status: lead.status,
    statusLabel: getLeadStatusLabel(lead.status) ?? lead.status,
    budgetRange: lead.budgetRange,
    budgetMidpoint,
    budgetHigh,
    statusWeight,
    confidenceWeight,
    estimatedValue: budgetMidpoint
      ? roundCurrency(budgetMidpoint * statusWeight * confidenceWeight)
      : 0,
    optimisticValue: budgetHigh
      ? roundCurrency(budgetHigh * optimisticWeight * confidenceWeight)
      : 0,
    scheduledAt: lead.scheduledAt?.toISOString() ?? null,
    followUpDueAt: lead.followUpDueAt?.toISOString() ?? null,
    notes: getLeadAssumptionNotes(lead, budgetMidpoint, periodStart, periodEnd)
  };
}

function isForecastCandidate(
  lead: ForecastLeadRow,
  periodStart: Date,
  periodEnd: Date
) {
  if (lead.status === "lost") {
    return false;
  }

  return (
    isInPeriod(lead.scheduledAt, periodStart, periodEnd) ||
    isInPeriod(lead.followUpDueAt, periodStart, periodEnd) ||
    (lead.createdAt < periodEnd &&
      ["new", "needs_review", "contacted", "scheduled", "in_progress"].includes(
        lead.status
      ))
  );
}

function getAdjustedStatusWeight(
  lead: ForecastLeadRow,
  periodStart: Date,
  periodEnd: Date
) {
  const timingBonus =
    isInPeriod(lead.scheduledAt, periodStart, periodEnd) ||
    isInPeriod(lead.followUpDueAt, periodStart, periodEnd)
      ? 0.1
      : 0;
  const reviewPenalty =
    lead.status === "needs_review" || lead.missingFields.length > 0 ? 0.1 : 0;

  return clampWeight(statusWeights[lead.status] + timingBonus - reviewPenalty);
}

function getAdjustedOptimisticWeight(
  lead: ForecastLeadRow,
  periodStart: Date,
  periodEnd: Date
) {
  const timingBonus =
    isInPeriod(lead.scheduledAt, periodStart, periodEnd) ||
    isInPeriod(lead.followUpDueAt, periodStart, periodEnd)
      ? 0.1
      : 0;

  return clampWeight(optimisticStatusWeights[lead.status] + timingBonus);
}

function getConfidenceWeight(lead: ForecastLeadRow) {
  const baseWeight =
    lead.confidence === "high" ? 1 : lead.confidence === "medium" ? 0.85 : 0.65;
  const missingFieldPenalty = lead.missingFields.length > 0 ? 0.1 : 0;

  return clampWeight(baseWeight - missingFieldPenalty);
}

function getLeadAssumptionNotes(
  lead: ForecastLeadRow,
  budgetMidpoint: number | null,
  periodStart: Date,
  periodEnd: Date
) {
  const notes: string[] = [];

  if (!budgetMidpoint) {
    notes.push("Budget unknown");
  }

  if (lead.status === "won") {
    notes.push("Confirmed won lead");
  }

  if (isInPeriod(lead.scheduledAt, periodStart, periodEnd)) {
    notes.push("Scheduled in period");
  }

  if (isInPeriod(lead.followUpDueAt, periodStart, periodEnd)) {
    notes.push("Follow-up due in period");
  }

  if (lead.status === "needs_review" || lead.missingFields.length > 0) {
    notes.push("Review or missing fields reduce confidence");
  }

  return notes;
}

function getMissingDataNotes(leadRows: ForecastLeadRow[]) {
  const missingBudgetCount = leadRows.filter(
    (lead) => !parseBudgetRange(lead.budgetRange).midpoint
  ).length;
  const lowConfidenceCount = leadRows.filter(
    (lead) => lead.confidence === "low"
  ).length;
  const notes: string[] = [];

  if (missingBudgetCount > 0) {
    notes.push(`${missingBudgetCount} lead(s) have unknown budgets.`);
  }

  if (lowConfidenceCount > 0) {
    notes.push(`${lowConfidenceCount} lead(s) have low extraction confidence.`);
  }

  return notes;
}

function isInPeriod(value: Date | null, start: Date, end: Date) {
  return Boolean(value && value >= start && value < end);
}

function clampWeight(value: number) {
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}

function roundCurrency(value: number) {
  return Math.round(value);
}

function assertValidPeriod(start: Date, end: Date) {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Forecast period dates must be valid");
  }

  if (end <= start) {
    throw new Error("Forecast period end must be after start");
  }
}

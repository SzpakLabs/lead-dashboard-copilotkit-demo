import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contacts, followUps, leads, sourceDefinitions } from "@/lib/db/schema";
import { getLeadStatusLabel, type LeadStatus } from "@/lib/domain/leads/status";
import { humanizeSource } from "@/lib/domain/sources/manage-sources";
import { parseBudgetRange } from "./budget";
import type { LeadReport, ReportBucket, ReportLeadSummary } from "./types";

type LeadReportInput = {
  workspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  comparisonPeriodStart?: Date;
  comparisonPeriodEnd?: Date;
  now?: Date;
  limit?: number;
};

type BuildLeadReportInput = Omit<LeadReportInput, "workspaceId"> & {
  leadRows: ReportLeadRow[];
  followUpRows: ReportFollowUpRow[];
  sourceLabels: Record<string, string>;
};

type ReportLeadRow = {
  id: string;
  title: string;
  status: LeadStatus;
  source: string;
  budgetRange: string | null;
  nextStep: string | null;
  scheduledAt: Date | null;
  completedAt: Date | null;
  followUpDueAt: Date | null;
  missingFields: string[];
  confidence: string;
  createdAt: Date;
  updatedAt: Date;
  contactName: string;
  company: string | null;
};

type ReportFollowUpRow = {
  id: string;
  leadId: string;
  status: "open" | "completed" | "canceled";
  note: string;
  followUpDueAt: Date;
  completedAt: Date | null;
};

export async function getLeadReport(
  input: LeadReportInput
): Promise<LeadReport> {
  assertValidPeriod(input.periodStart, input.periodEnd);

  if (input.comparisonPeriodStart && input.comparisonPeriodEnd) {
    assertValidPeriod(input.comparisonPeriodStart, input.comparisonPeriodEnd);
  }

  const db = getDb();
  const [leadRows, followUpRows, sourceRows] = await Promise.all([
    db
      .select({
        id: leads.id,
        title: leads.title,
        status: leads.status,
        source: leads.source,
        budgetRange: leads.budgetRange,
        nextStep: leads.nextStep,
        scheduledAt: leads.scheduledAt,
        completedAt: leads.completedAt,
        followUpDueAt: leads.followUpDueAt,
        missingFields: leads.missingFields,
        confidence: leads.confidence,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        contactName: contacts.name,
        company: contacts.company
      })
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.id))
      .where(eq(leads.workspaceId, input.workspaceId)),
    db
      .select({
        id: followUps.id,
        leadId: followUps.leadId,
        status: followUps.status,
        note: followUps.note,
        followUpDueAt: followUps.followUpDueAt,
        completedAt: followUps.completedAt
      })
      .from(followUps)
      .where(eq(followUps.workspaceId, input.workspaceId)),
    db
      .select({
        slug: sourceDefinitions.slug,
        label: sourceDefinitions.label
      })
      .from(sourceDefinitions)
      .where(eq(sourceDefinitions.workspaceId, input.workspaceId))
  ]);

  return buildLeadReport({
    ...input,
    leadRows,
    followUpRows,
    sourceLabels: Object.fromEntries(
      sourceRows.map((source) => [source.slug, source.label])
    )
  });
}

export function buildLeadReport(input: BuildLeadReportInput): LeadReport {
  const now = input.now ?? new Date();
  const limit = input.limit ?? 6;
  const periodLeads = input.leadRows.filter((lead) =>
    isInPeriod(lead.createdAt, input.periodStart, input.periodEnd)
  );
  const scheduledWork = input.leadRows
    .filter((lead) =>
      isInPeriod(lead.scheduledAt, input.periodStart, input.periodEnd)
    )
    .sort(sortByDate((lead) => lead.scheduledAt))
    .slice(0, limit)
    .map((lead) => toLeadSummary(lead, input.sourceLabels, "Scheduled work"));
  const completedWork = input.leadRows
    .filter((lead) =>
      isInPeriod(lead.completedAt, input.periodStart, input.periodEnd)
    )
    .sort(sortByDate((lead) => lead.completedAt))
    .slice(0, limit)
    .map((lead) => toLeadSummary(lead, input.sourceLabels, "Completed work"));
  const allOverdueFollowUps = getOverdueFollowUps(
    input.leadRows,
    input.followUpRows,
    input.periodStart,
    input.periodEnd,
    now,
    input.sourceLabels
  );
  const overdueFollowUps = allOverdueFollowUps.slice(0, limit);
  const reviewWorkload = {
    needsReview: periodLeads.filter((lead) => lead.status === "needs_review")
      .length,
    missingFieldLeads: periodLeads.filter(
      (lead) => lead.missingFields.length > 0
    ).length,
    lowConfidence: periodLeads.filter((lead) => lead.confidence === "low")
      .length,
    mediumConfidence: periodLeads.filter((lead) => lead.confidence === "medium")
      .length
  };
  const comparison = buildComparison(input);
  const totals = {
    leadVolume: periodLeads.length,
    scheduledWork: input.leadRows.filter((lead) =>
      isInPeriod(lead.scheduledAt, input.periodStart, input.periodEnd)
    ).length,
    completedWork: input.leadRows.filter((lead) =>
      isInPeriod(lead.completedAt, input.periodStart, input.periodEnd)
    ).length,
    overdueFollowUps: allOverdueFollowUps.length,
    openFollowUps: input.followUpRows.filter(
      (followUp) =>
        followUp.status === "open" &&
        isInPeriod(followUp.followUpDueAt, input.periodStart, input.periodEnd)
    ).length,
    won: periodLeads.filter((lead) => lead.status === "won").length,
    lost: periodLeads.filter((lead) => lead.status === "lost").length,
    needsReview: reviewWorkload.needsReview
  };
  const notableLeads = getNotableLeads({
    periodLeads,
    overdueFollowUps,
    scheduledWork,
    sourceLabels: input.sourceLabels,
    limit
  });

  return {
    answerPrefix: "Based on this dashboard",
    limitation:
      "Report uses dashboard lead, follow-up, and internal schedule data only.",
    period: {
      startsAt: input.periodStart.toISOString(),
      endsAt: input.periodEnd.toISOString(),
      comparisonStartsAt: input.comparisonPeriodStart?.toISOString() ?? null,
      comparisonEndsAt: input.comparisonPeriodEnd?.toISOString() ?? null
    },
    totals,
    comparison,
    statusBuckets: buildBuckets(
      periodLeads,
      (lead) => lead.status,
      (status) => getLeadStatusLabel(status as LeadStatus) ?? status
    ),
    sourceBuckets: buildBuckets(
      periodLeads,
      (lead) => lead.source,
      (source) => input.sourceLabels[source] ?? humanizeSource(source)
    ),
    reviewWorkload,
    scheduledWork,
    completedWork,
    overdueFollowUps,
    notableLeads,
    bottlenecks: getBottlenecks(totals, reviewWorkload, periodLeads)
  };
}

function buildComparison(input: BuildLeadReportInput) {
  if (!input.comparisonPeriodStart || !input.comparisonPeriodEnd) {
    return {
      leadVolumeDelta: null,
      wonDelta: null,
      scheduledWorkDelta: null
    };
  }

  const comparisonLeads = input.leadRows.filter((lead) =>
    isInPeriod(
      lead.createdAt,
      input.comparisonPeriodStart!,
      input.comparisonPeriodEnd!
    )
  );
  const comparisonScheduled = input.leadRows.filter((lead) =>
    isInPeriod(
      lead.scheduledAt,
      input.comparisonPeriodStart!,
      input.comparisonPeriodEnd!
    )
  );
  const periodLeads = input.leadRows.filter((lead) =>
    isInPeriod(lead.createdAt, input.periodStart, input.periodEnd)
  );
  const periodScheduled = input.leadRows.filter((lead) =>
    isInPeriod(lead.scheduledAt, input.periodStart, input.periodEnd)
  );

  return {
    leadVolumeDelta: periodLeads.length - comparisonLeads.length,
    wonDelta:
      periodLeads.filter((lead) => lead.status === "won").length -
      comparisonLeads.filter((lead) => lead.status === "won").length,
    scheduledWorkDelta: periodScheduled.length - comparisonScheduled.length
  };
}

function buildBuckets(
  leadsToBucket: ReportLeadRow[],
  getKey: (lead: ReportLeadRow) => string,
  getLabel: (key: string) => string
): ReportBucket[] {
  const buckets = new Map<string, { count: number; value: number }>();

  for (const lead of leadsToBucket) {
    const key = getKey(lead);
    const current = buckets.get(key) ?? { count: 0, value: 0 };
    const budget = parseBudgetRange(lead.budgetRange);

    buckets.set(key, {
      count: current.count + 1,
      value: current.value + (budget.midpoint ?? 0)
    });
  }

  return Array.from(buckets.entries())
    .map(([key, bucket]) => ({
      key,
      label: getLabel(key),
      count: bucket.count,
      percentage:
        leadsToBucket.length === 0
          ? 0
          : Math.round((bucket.count / leadsToBucket.length) * 100),
      value: bucket.value > 0 ? bucket.value : null
    }))
    .sort((first, second) => second.count - first.count);
}

function getOverdueFollowUps(
  leadRows: ReportLeadRow[],
  followUpRows: ReportFollowUpRow[],
  periodStart: Date,
  periodEnd: Date,
  now: Date,
  sourceLabels: Record<string, string>
) {
  const leadsById = new Map(leadRows.map((lead) => [lead.id, lead]));

  return followUpRows
    .filter(
      (followUp) =>
        followUp.status === "open" &&
        followUp.followUpDueAt < now &&
        isInPeriod(followUp.followUpDueAt, periodStart, periodEnd)
    )
    .map((followUp) => {
      const lead = leadsById.get(followUp.leadId);

      return lead
        ? toLeadSummary(lead, sourceLabels, `Overdue: ${followUp.note}`)
        : null;
    })
    .filter((lead): lead is ReportLeadSummary => Boolean(lead));
}

function getNotableLeads(input: {
  periodLeads: ReportLeadRow[];
  overdueFollowUps: ReportLeadSummary[];
  scheduledWork: ReportLeadSummary[];
  sourceLabels: Record<string, string>;
  limit: number;
}) {
  const seen = new Set<string>();
  const notable: ReportLeadSummary[] = [];
  const highBudgetLeads = input.periodLeads
    .map((lead) => ({
      lead,
      budget: parseBudgetRange(lead.budgetRange).midpoint ?? 0
    }))
    .filter((item) => item.budget > 0)
    .sort((first, second) => second.budget - first.budget)
    .map((item) =>
      toLeadSummary(item.lead, input.sourceLabels, "Largest budget signal")
    );
  const reviewLeads = input.periodLeads
    .filter(
      (lead) => lead.status === "needs_review" || lead.missingFields.length > 0
    )
    .map((lead) =>
      toLeadSummary(lead, input.sourceLabels, "Needs review or missing fields")
    );

  for (const lead of [
    ...input.overdueFollowUps,
    ...reviewLeads,
    ...input.scheduledWork,
    ...highBudgetLeads
  ]) {
    if (seen.has(lead.id)) {
      continue;
    }

    seen.add(lead.id);
    notable.push(lead);

    if (notable.length >= input.limit) {
      break;
    }
  }

  return notable;
}

function getBottlenecks(
  totals: LeadReport["totals"],
  reviewWorkload: LeadReport["reviewWorkload"],
  periodLeads: ReportLeadRow[]
) {
  const bottlenecks: string[] = [];
  const missingBudgetCount = periodLeads.filter(
    (lead) => !parseBudgetRange(lead.budgetRange).midpoint
  ).length;

  if (totals.overdueFollowUps > 0) {
    bottlenecks.push(`${totals.overdueFollowUps} overdue follow-up item(s).`);
  }

  if (reviewWorkload.needsReview > 0 || reviewWorkload.missingFieldLeads > 0) {
    bottlenecks.push(
      `${reviewWorkload.needsReview + reviewWorkload.missingFieldLeads} review or missing-field signal(s).`
    );
  }

  if (missingBudgetCount > 0) {
    bottlenecks.push(`${missingBudgetCount} lead(s) lack a parseable budget.`);
  }

  if (totals.leadVolume > 0 && totals.scheduledWork === 0) {
    bottlenecks.push("No scheduled work appears in this period.");
  }

  return bottlenecks.length > 0
    ? bottlenecks
    : ["No obvious reporting bottleneck in this period."];
}

function toLeadSummary(
  lead: ReportLeadRow,
  sourceLabels: Record<string, string>,
  reason: string
): ReportLeadSummary {
  return {
    id: lead.id,
    url: `/leads/${lead.id}`,
    title: lead.title,
    contactName: lead.contactName,
    company: lead.company,
    status: lead.status,
    statusLabel: getLeadStatusLabel(lead.status) ?? lead.status,
    source: lead.source,
    sourceLabel: sourceLabels[lead.source] ?? humanizeSource(lead.source),
    budgetRange: lead.budgetRange,
    nextStep: lead.nextStep,
    scheduledAt: lead.scheduledAt?.toISOString() ?? null,
    completedAt: lead.completedAt?.toISOString() ?? null,
    followUpDueAt: lead.followUpDueAt?.toISOString() ?? null,
    reason
  };
}

function sortByDate<T>(getDate: (item: T) => Date | null) {
  return (first: T, second: T) =>
    (getDate(first)?.getTime() ?? 0) - (getDate(second)?.getTime() ?? 0);
}

function isInPeriod(value: Date | null, start: Date, end: Date) {
  return Boolean(value && value >= start && value < end);
}

function assertValidPeriod(start: Date, end: Date) {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Report period dates must be valid");
  }

  if (end <= start) {
    throw new Error("Report period end must be after start");
  }
}

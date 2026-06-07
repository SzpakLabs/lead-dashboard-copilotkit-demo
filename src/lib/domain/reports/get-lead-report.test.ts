import { describe, expect, it } from "vitest";
import { buildLeadReport } from "./get-lead-report";

const periodStart = new Date("2026-05-01T00:00:00.000Z");
const periodEnd = new Date("2026-06-01T00:00:00.000Z");

describe("buildLeadReport", () => {
  it("summarizes period volume, buckets, and bottlenecks", () => {
    const report = buildLeadReport({
      periodStart,
      periodEnd,
      now: new Date("2026-05-20T00:00:00.000Z"),
      sourceLabels: { linkedin: "LinkedIn", referral: "Referral" },
      leadRows: [
        {
          id: "lead-test-1",
          title: "Website rebuild",
          status: "scheduled",
          source: "linkedin",
          budgetRange: "$4,000 - $6,000",
          nextStep: "Discovery",
          scheduledAt: new Date("2026-05-21T10:00:00.000Z"),
          completedAt: null,
          followUpDueAt: null,
          missingFields: [],
          confidence: "high",
          createdAt: new Date("2026-05-02T10:00:00.000Z"),
          updatedAt: new Date("2026-05-02T10:00:00.000Z"),
          contactName: "Juan Test",
          company: "Test Company"
        },
        {
          id: "lead-test-2",
          title: "CRM cleanup",
          status: "needs_review",
          source: "referral",
          budgetRange: null,
          nextStep: null,
          scheduledAt: null,
          completedAt: null,
          followUpDueAt: new Date("2026-05-10T10:00:00.000Z"),
          missingFields: ["budgetRange"],
          confidence: "low",
          createdAt: new Date("2026-05-03T10:00:00.000Z"),
          updatedAt: new Date("2026-05-03T10:00:00.000Z"),
          contactName: "Maria Test",
          company: null
        }
      ],
      followUpRows: [
        {
          id: "follow-up-test-1",
          leadId: "lead-test-2",
          status: "open",
          note: "Call Maria Test",
          followUpDueAt: new Date("2026-05-10T10:00:00.000Z"),
          completedAt: null
        }
      ]
    });

    expect(report.totals).toMatchObject({
      leadVolume: 2,
      scheduledWork: 1,
      overdueFollowUps: 1,
      needsReview: 1
    });
    expect(report.statusBuckets.map((bucket) => bucket.key)).toEqual([
      "scheduled",
      "needs_review"
    ]);
    expect(report.sourceBuckets[0]).toMatchObject({
      key: "linkedin",
      value: 5000
    });
    expect(report.bottlenecks).toContain("1 overdue follow-up item(s).");
  });
});

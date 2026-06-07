import { describe, expect, it } from "vitest";
import { buildRevenueForecast } from "./get-revenue-forecast";

describe("buildRevenueForecast", () => {
  it("separates confirmed won value from weighted pipeline", () => {
    const forecast = buildRevenueForecast({
      periodStart: new Date("2026-05-01T00:00:00.000Z"),
      periodEnd: new Date("2026-06-01T00:00:00.000Z"),
      leadRows: [
        {
          id: "lead-test-1",
          title: "Won implementation",
          status: "won",
          budgetRange: "$4,000 - $6,000",
          scheduledAt: null,
          completedAt: new Date("2026-05-20T10:00:00.000Z"),
          followUpDueAt: null,
          missingFields: [],
          confidence: "high",
          createdAt: new Date("2026-04-15T10:00:00.000Z"),
          contactName: "Carlos Test",
          company: "Test Studio"
        },
        {
          id: "lead-test-2",
          title: "Scheduled app sprint",
          status: "scheduled",
          budgetRange: "10-12k",
          scheduledAt: new Date("2026-05-22T10:00:00.000Z"),
          completedAt: null,
          followUpDueAt: null,
          missingFields: [],
          confidence: "high",
          createdAt: new Date("2026-05-01T10:00:00.000Z"),
          contactName: "Maria Test",
          company: null
        }
      ]
    });

    expect(forecast.confirmedValue).toBe(5000);
    expect(forecast.weightedPipelineValue).toBe(7700);
    expect(forecast.optimisticPipelineValue).toBe(11400);
    expect(forecast.leadAssumptions).toHaveLength(2);
  });
});

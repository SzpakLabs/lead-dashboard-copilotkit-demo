import { describe, expect, it } from "vitest";
import { parseBudgetRange } from "./budget";

describe("parseBudgetRange", () => {
  it("parses comma-separated budget ranges", () => {
    expect(parseBudgetRange("$4,000 - $6,000")).toMatchObject({
      min: 4000,
      max: 6000,
      midpoint: 5000
    });
  });

  it("infers k suffix ranges", () => {
    expect(parseBudgetRange("10-15k")).toMatchObject({
      min: 10000,
      max: 15000,
      midpoint: 12500
    });
  });

  it("keeps missing budgets unknown", () => {
    expect(parseBudgetRange(null)).toMatchObject({
      min: null,
      max: null,
      midpoint: null,
      label: "Unknown budget"
    });
  });
});

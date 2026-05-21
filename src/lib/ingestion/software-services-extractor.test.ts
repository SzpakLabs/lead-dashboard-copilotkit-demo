import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeText,
  SoftwareServicesExtractor
} from "./software-services-extractor";

describe("SoftwareServicesExtractor", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("extracts a high-confidence software services lead", () => {
    vi.setSystemTime(new Date("2026-05-21T12:00:00.000Z"));

    const extractor = new SoftwareServicesExtractor();
    const extracted = extractor.extract({
      sourceType: "pasted_text",
      sourceChannel: "linkedin",
      text: "Juan Test from Test Agency asked about a dashboard for tracking software service leads. Budget around $6k. Wants a discovery call next Tuesday and follow-up tomorrow."
    });

    expect(extracted).toMatchObject({
      contactName: "Juan Test",
      company: "Test Agency",
      sourceChannel: "linkedin",
      projectType: "dashboard",
      problemSummary: "a dashboard for tracking software service leads",
      requestedOutcome: "Explore dashboard project scope and next steps",
      budgetRange: "6k",
      timeline: "next Tuesday",
      nextStep: "Prepare for scheduled discovery call",
      confidence: "high",
      missingFields: []
    });
    expect(extracted.scheduledAt?.toISOString()).toBe(
      "2026-05-26T14:00:00.000Z"
    );
    expect(extracted.followUpDueAt?.toISOString()).toBe(
      "2026-05-22T09:00:00.000Z"
    );
  });

  it("marks sparse input as low confidence with missing fields", () => {
    const extractor = new SoftwareServicesExtractor();
    const extracted = extractor.extract({
      sourceType: "pasted_transcript",
      sourceChannel: "other",
      text: "Alex Test mentioned general software help."
    });

    expect(extracted.confidence).toBe("low");
    expect(extracted.missingFields).toEqual([
      "problemSummary",
      "requestedOutcome",
      "nextStep"
    ]);
  });

  it("normalizes whitespace before extraction", () => {
    expect(normalizeText("  Maria Test\n\nneeds\tan app.  ")).toBe(
      "Maria Test needs an app."
    );
  });
});

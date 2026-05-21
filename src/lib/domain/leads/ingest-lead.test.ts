import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { ingestLeadFromText } from "./ingest-lead";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn()
}));

type InsertCall = {
  table: unknown;
  values: Record<string, unknown>;
};

function createSelectResult<T>(result: T[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result)
  };
}

function createInsertResult<T>(
  insertCalls: InsertCall[],
  table: unknown,
  result: T[]
) {
  return {
    values: vi.fn((values: Record<string, unknown>) => {
      insertCalls.push({ table, values });

      return {
        returning: vi.fn().mockResolvedValue(result)
      };
    })
  };
}

describe("ingestLeadFromText", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-05-21T12:00:00.000Z"));
    vi.mocked(getDb).mockReset();
  });

  it("stores an ingestion event and creates a needs-review draft lead", async () => {
    const insertCalls: InsertCall[] = [];
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const ingestionEvent = { id: "ingestion-test-id" };
    const contact = { id: "contact-test-id", name: "Juan Test" };
    const lead = {
      id: "lead-test-id",
      title: "Dashboard lead",
      status: "needs_review"
    };

    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(createSelectResult([workspace]))
        .mockReturnValueOnce(createSelectResult([actor])),
      transaction: vi.fn(async (callback) =>
        callback({
          insert: vi
            .fn()
            .mockImplementationOnce((table) =>
              createInsertResult(insertCalls, table, [ingestionEvent])
            )
            .mockImplementationOnce((table) =>
              createInsertResult(insertCalls, table, [contact])
            )
            .mockImplementationOnce((table) =>
              createInsertResult(insertCalls, table, [lead])
            )
            .mockImplementationOnce((table) => ({
              values: vi.fn((values: Record<string, unknown>) => {
                insertCalls.push({ table, values });
              })
            }))
        })
      )
    };

    vi.mocked(getDb).mockReturnValue(db as never);

    const result = await ingestLeadFromText({
      sourceType: "pasted_text",
      sourceChannel: "linkedin",
      text: " Juan Test from Test Agency asked about a dashboard for tracking software service leads. Budget around $6k. Wants a discovery call next Tuesday and follow-up tomorrow. "
    });

    expect(result.lead).toBe(lead);
    expect(result.contact).toBe(contact);
    expect(result.ingestionEvent).toBe(ingestionEvent);
    expect(result.extracted.confidence).toBe("high");

    expect(insertCalls[0]?.values).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      sourceType: "pasted_text",
      sourceChannel: "linkedin",
      rawText:
        "Juan Test from Test Agency asked about a dashboard for tracking software service leads. Budget around $6k. Wants a discovery call next Tuesday and follow-up tomorrow.",
      normalizedText:
        "Juan Test from Test Agency asked about a dashboard for tracking software service leads. Budget around $6k. Wants a discovery call next Tuesday and follow-up tomorrow.",
      metadata: { template: "software_services" }
    });
    expect(insertCalls[1]?.values).toMatchObject({
      workspaceId: workspace.id,
      name: "Juan Test",
      company: "Test Agency",
      source: "linkedin"
    });
    expect(insertCalls[2]?.values).toMatchObject({
      workspaceId: workspace.id,
      contactId: contact.id,
      ingestionEventId: ingestionEvent.id,
      title: "Dashboard lead",
      status: "needs_review",
      source: "linkedin",
      projectType: "dashboard",
      confidence: "high",
      missingFields: []
    });
    expect(insertCalls[3]?.values).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: lead.id,
      targetType: "ingestion_event",
      targetId: ingestionEvent.id,
      action: "ingestion.created"
    });
  });
});

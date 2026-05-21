import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { updateLead } from "./update-lead";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn()
}));

function createSelectResult<T>(result: T[]) {
  return {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result)
  };
}

function createUpdateResult<T>(
  updateCalls: Array<Record<string, unknown>>,
  result: T[]
) {
  return {
    set: vi.fn((values: Record<string, unknown>) => {
      updateCalls.push(values);

      return {
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(result)
        })
      };
    })
  };
}

describe("updateLead", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReset();
  });

  it("updates lead/contact fields and writes an audit event", async () => {
    const updateCalls: Array<Record<string, unknown>> = [];
    const insertCalls: Array<Record<string, unknown>> = [];
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const current = {
      leadId: "00000000-0000-4000-8000-000000000001",
      contactId: "00000000-0000-4000-8000-000000000002",
      title: "Old dashboard lead",
      source: "linkedin",
      projectType: "dashboard",
      problemSummary: "Old summary",
      requestedOutcome: null,
      budgetRange: null,
      timeline: "Soon",
      nextStep: null,
      missingFields: ["requestedOutcome", "nextStep"],
      contactName: "Juan Test",
      company: "Old Test Company",
      email: null,
      phone: null
    };
    const updatedContact = {
      id: current.contactId,
      name: "Juan Test",
      company: "New Test Company"
    };
    const updatedLead = {
      id: current.leadId,
      title: "Updated dashboard lead",
      missingFields: []
    };

    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(createSelectResult([workspace]))
        .mockReturnValueOnce(createSelectResult([actor]))
        .mockReturnValueOnce(createSelectResult([current])),
      transaction: vi.fn(async (callback) =>
        callback({
          update: vi
            .fn()
            .mockImplementationOnce(() =>
              createUpdateResult(updateCalls, [updatedContact])
            )
            .mockImplementationOnce(() =>
              createUpdateResult(updateCalls, [updatedLead])
            ),
          insert: vi.fn(() => ({
            values: vi.fn((values: Record<string, unknown>) => {
              insertCalls.push(values);
            })
          }))
        })
      )
    };

    vi.mocked(getDb).mockReturnValue(db as never);

    const result = await updateLead({
      leadId: current.leadId,
      title: "Updated dashboard lead",
      source: "upwork",
      contactName: "Juan Test",
      company: "New Test Company",
      email: "juan.test@example.com",
      phone: "",
      projectType: "dashboard",
      problemSummary: "Updated summary",
      requestedOutcome: "Cleaner lead review workflow",
      budgetRange: "$5k",
      timeline: "This month",
      nextStep: "Send proposal"
    });

    expect(result.lead).toBe(updatedLead);
    expect(result.contact).toBe(updatedContact);
    expect(updateCalls[0]).toMatchObject({
      name: "Juan Test",
      company: "New Test Company",
      email: "juan.test@example.com",
      phone: null,
      source: "upwork"
    });
    expect(updateCalls[1]).toMatchObject({
      title: "Updated dashboard lead",
      source: "upwork",
      projectType: "dashboard",
      problemSummary: "Updated summary",
      requestedOutcome: "Cleaner lead review workflow",
      budgetRange: "$5k",
      timeline: "This month",
      nextStep: "Send proposal",
      missingFields: []
    });
    expect(insertCalls[0]).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: current.leadId,
      targetType: "lead",
      targetId: current.leadId,
      action: "lead.updated",
      summary: "Updated lead details for Juan Test."
    });
    expect(insertCalls[0]?.before).toMatchObject({
      title: "Old dashboard lead",
      requestedOutcome: null,
      missingFields: ["requestedOutcome", "nextStep"]
    });
    expect(insertCalls[0]?.after).toMatchObject({
      title: "Updated dashboard lead",
      requestedOutcome: "Cleaner lead review workflow",
      missingFields: []
    });
  });
});

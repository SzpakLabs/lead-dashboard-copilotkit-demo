import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { changeLeadStatus } from "./change-lead-status";
import { canChangeLeadStatus } from "./status";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn()
}));

function createSelectResult<T>(result: T[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result)
  };
}

describe("lead status lifecycle", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReset();
  });

  it("allows only documented transitions", () => {
    expect(canChangeLeadStatus("needs_review", "scheduled")).toBe(true);
    expect(canChangeLeadStatus("needs_review", "won")).toBe(false);
    expect(canChangeLeadStatus("won", "contacted")).toBe(true);
  });

  it("changes status and writes an audit event", async () => {
    const insertCalls: Array<Record<string, unknown>> = [];
    const updateCalls: Array<Record<string, unknown>> = [];
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const current = {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Dashboard lead",
      status: "contacted"
    };
    const updatedLead = { ...current, status: "scheduled" };

    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(createSelectResult([workspace]))
        .mockReturnValueOnce(createSelectResult([actor]))
        .mockReturnValueOnce(createSelectResult([current])),
      transaction: vi.fn(async (callback) =>
        callback({
          update: vi.fn(() => ({
            set: vi.fn((values: Record<string, unknown>) => {
              updateCalls.push(values);

              return {
                where: vi.fn().mockReturnValue({
                  returning: vi.fn().mockResolvedValue([updatedLead])
                })
              };
            })
          })),
          insert: vi.fn(() => ({
            values: vi.fn((values: Record<string, unknown>) => {
              insertCalls.push(values);
            })
          }))
        })
      )
    };

    vi.mocked(getDb).mockReturnValue(db as never);

    const result = await changeLeadStatus({
      leadId: current.id,
      status: "scheduled"
    });

    expect(result.lead).toBe(updatedLead);
    expect(updateCalls[0]).toMatchObject({ status: "scheduled" });
    expect(insertCalls[0]).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: current.id,
      targetType: "lead",
      targetId: current.id,
      action: "lead.status_changed",
      summary: "Changed status for Dashboard lead to Scheduled.",
      before: { status: "contacted" },
      after: { status: "scheduled" }
    });
  });

  it("rejects invalid transitions", async () => {
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const current = {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Dashboard lead",
      status: "needs_review"
    };

    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(createSelectResult([workspace]))
        .mockReturnValueOnce(createSelectResult([actor]))
        .mockReturnValueOnce(createSelectResult([current]))
    };

    vi.mocked(getDb).mockReturnValue(db as never);

    await expect(
      changeLeadStatus({ leadId: current.id, status: "won" })
    ).rejects.toThrow("Cannot change lead status from needs_review to won");
  });
});

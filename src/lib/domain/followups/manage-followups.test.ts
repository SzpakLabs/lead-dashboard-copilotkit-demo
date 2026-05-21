import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { createFollowUp } from "./manage-followups";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn()
}));

function createSelectResult<T>(result: T[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result)
  };
}

describe("createFollowUp", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReset();
  });

  it("creates a follow-up, refreshes the lead next due date, and writes audit", async () => {
    const insertCalls: Array<Record<string, unknown>> = [];
    const updateCalls: Array<Record<string, unknown>> = [];
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const lead = {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Dashboard lead"
    };
    const dueAt = new Date("2026-05-22T10:00:00.000Z");
    const followUp = {
      id: "00000000-0000-4000-8000-000000000002",
      leadId: lead.id,
      note: "Call Juan Test.",
      status: "open",
      followUpDueAt: dueAt
    };

    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(createSelectResult([workspace]))
        .mockReturnValueOnce(createSelectResult([actor]))
        .mockReturnValueOnce(createSelectResult([lead])),
      transaction: vi.fn(async (callback) =>
        callback({
          insert: vi
            .fn()
            .mockReturnValueOnce({
              values: vi.fn((values: Record<string, unknown>) => {
                insertCalls.push(values);

                return {
                  returning: vi.fn().mockResolvedValue([followUp])
                };
              })
            })
            .mockReturnValueOnce({
              values: vi.fn((values: Record<string, unknown>) => {
                insertCalls.push(values);
              })
            }),
          select: vi.fn(() => createSelectResult([{ followUpDueAt: dueAt }])),
          update: vi.fn(() => ({
            set: vi.fn((values: Record<string, unknown>) => {
              updateCalls.push(values);

              return {
                where: vi.fn()
              };
            })
          }))
        })
      )
    };

    vi.mocked(getDb).mockReturnValue(db as never);

    const result = await createFollowUp({
      leadId: lead.id,
      note: "Call Juan Test.",
      followUpDueAt: "2026-05-22T10:00"
    });

    expect(result).toBe(followUp);
    expect(insertCalls[0]).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: lead.id,
      note: "Call Juan Test."
    });
    expect(updateCalls[0]).toMatchObject({ followUpDueAt: dueAt });
    expect(insertCalls[1]).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: lead.id,
      targetType: "follow_up",
      targetId: followUp.id,
      action: "follow_up.created",
      summary: "Created follow-up for Dashboard lead."
    });
  });
});

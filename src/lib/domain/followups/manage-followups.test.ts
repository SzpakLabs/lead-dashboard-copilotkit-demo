import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import {
  completeFollowUp,
  createFollowUp,
  updateFollowUp
} from "./manage-followups";

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

describe("updateFollowUp", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReset();
  });

  it("updates a follow-up, refreshes the lead next due date, and writes audit", async () => {
    const insertCalls: Array<Record<string, unknown>> = [];
    const updateCalls: Array<Record<string, unknown>> = [];
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const current = {
      id: "00000000-0000-4000-8000-000000000002",
      leadId: "00000000-0000-4000-8000-000000000001",
      note: "Call Juan Test.",
      status: "open",
      followUpDueAt: new Date("2026-05-22T10:00:00.000Z"),
      completedAt: null
    };
    const nextDueAt = new Date("2026-05-23T11:00:00.000Z");
    const updatedFollowUp = {
      ...current,
      note: "Send Juan Test the revised scope.",
      followUpDueAt: nextDueAt
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
            .mockReturnValueOnce({
              set: vi.fn((values: Record<string, unknown>) => {
                updateCalls.push(values);

                return {
                  where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([updatedFollowUp])
                  })
                };
              })
            })
            .mockReturnValueOnce({
              set: vi.fn((values: Record<string, unknown>) => {
                updateCalls.push(values);

                return {
                  where: vi.fn()
                };
              })
            }),
          select: vi.fn(() =>
            createSelectResult([{ followUpDueAt: nextDueAt }])
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

    const result = await updateFollowUp({
      followUpId: current.id,
      note: "Send Juan Test the revised scope.",
      followUpDueAt: "2026-05-23T11:00:00.000Z"
    });

    expect(result).toBe(updatedFollowUp);
    expect(updateCalls[0]).toMatchObject({
      note: "Send Juan Test the revised scope.",
      followUpDueAt: nextDueAt
    });
    expect(updateCalls[1]).toMatchObject({ followUpDueAt: nextDueAt });
    expect(insertCalls[0]).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: current.leadId,
      targetType: "follow_up",
      targetId: current.id,
      action: "follow_up.updated",
      summary: "Updated follow-up."
    });
    expect(insertCalls[0]?.before).toMatchObject({
      note: "Call Juan Test.",
      followUpDueAt: "2026-05-22T10:00:00.000Z"
    });
    expect(insertCalls[0]?.after).toMatchObject({
      note: "Send Juan Test the revised scope.",
      followUpDueAt: "2026-05-23T11:00:00.000Z"
    });
  });
});

describe("completeFollowUp", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReset();
  });

  it("completes a follow-up, refreshes the lead next due date, and writes audit", async () => {
    const insertCalls: Array<Record<string, unknown>> = [];
    const updateCalls: Array<Record<string, unknown>> = [];
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const current = {
      id: "00000000-0000-4000-8000-000000000002",
      leadId: "00000000-0000-4000-8000-000000000001",
      note: "Call Juan Test.",
      status: "open",
      followUpDueAt: new Date("2026-05-22T10:00:00.000Z"),
      completedAt: null
    };
    const nextDueAt = new Date("2026-05-24T12:00:00.000Z");
    const completedFollowUp = {
      ...current,
      status: "completed",
      completedAt: new Date("2026-05-21T09:00:00.000Z")
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
            .mockReturnValueOnce({
              set: vi.fn((values: Record<string, unknown>) => {
                updateCalls.push(values);

                return {
                  where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([completedFollowUp])
                  })
                };
              })
            })
            .mockReturnValueOnce({
              set: vi.fn((values: Record<string, unknown>) => {
                updateCalls.push(values);

                return {
                  where: vi.fn()
                };
              })
            }),
          select: vi.fn(() =>
            createSelectResult([{ followUpDueAt: nextDueAt }])
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

    const result = await completeFollowUp({ followUpId: current.id });

    expect(result).toBe(completedFollowUp);
    expect(updateCalls[0]).toMatchObject({
      status: "completed"
    });
    expect(updateCalls[1]).toMatchObject({ followUpDueAt: nextDueAt });
    expect(insertCalls[0]).toMatchObject({
      workspaceId: workspace.id,
      actorUserId: actor.id,
      leadId: current.leadId,
      targetType: "follow_up",
      targetId: current.id,
      action: "follow_up.completed",
      summary: "Completed follow-up.",
      before: { status: "open", completedAt: null },
      after: {
        status: "completed",
        completedAt: "2026-05-21T09:00:00.000Z"
      }
    });
  });
});

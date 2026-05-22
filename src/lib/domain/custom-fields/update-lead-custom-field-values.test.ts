import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { updateLeadCustomFieldValues } from "./update-lead-custom-field-values";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn()
}));

function createLimitedSelectResult<T>(result: T[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result)
  };
}

function createWhereSelectResult<T>(result: T[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(result)
  };
}

describe("updateLeadCustomFieldValues", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReset();
  });

  it("rejects updates for archived custom fields", async () => {
    const workspace = { id: "workspace-test-id" };
    const actor = { id: "user-test-id" };
    const lead = { id: "00000000-0000-4000-8000-000000000001" };
    const fieldId = "00000000-0000-4000-8000-000000000002";
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(createLimitedSelectResult([workspace]))
        .mockReturnValueOnce(createLimitedSelectResult([actor]))
        .mockReturnValueOnce(createLimitedSelectResult([lead]))
        .mockReturnValueOnce(
          createWhereSelectResult([
            {
              id: fieldId,
              label: "Priority",
              fieldType: "text",
              archivedAt: new Date("2026-05-22T10:00:00.000Z")
            }
          ])
        ),
      transaction: vi.fn()
    };

    vi.mocked(getDb).mockReturnValue(db as never);

    await expect(
      updateLeadCustomFieldValues({
        leadId: lead.id,
        values: { [fieldId]: "High" }
      })
    ).rejects.toThrow("Archived custom fields cannot be updated");
    expect(db.transaction).not.toHaveBeenCalled();
  });
});

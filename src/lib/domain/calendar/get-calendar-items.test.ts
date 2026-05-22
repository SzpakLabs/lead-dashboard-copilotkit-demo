import { describe, expect, it } from "vitest";
import { deriveCalendarItems } from "./get-calendar-items";

describe("deriveCalendarItems", () => {
  it("builds calendar items from lead and follow-up dates", () => {
    const leadRows = [
      {
        id: "lead-test-1",
        title: "Website rebuild",
        status: "scheduled" as const,
        scheduledAt: new Date("2026-05-22T10:00:00.000Z"),
        completedAt: null,
        followUpDueAt: new Date("2026-05-23T11:00:00.000Z"),
        contactName: "Juan Test",
        company: "Test Company"
      },
      {
        id: "lead-test-2",
        title: "Dashboard prototype",
        status: "won" as const,
        scheduledAt: null,
        completedAt: new Date("2026-05-21T09:00:00.000Z"),
        followUpDueAt: null,
        contactName: "Maria Test",
        company: null
      }
    ];
    const followUpRows = [
      {
        id: "follow-up-test-1",
        leadId: "lead-test-1",
        leadTitle: "Website rebuild",
        leadStatus: "scheduled" as const,
        note: "Send Juan Test the agenda.",
        followUpStatus: "open" as const,
        followUpDueAt: new Date("2026-05-23T11:00:00.000Z"),
        completedAt: null,
        contactName: "Juan Test",
        company: "Test Company"
      },
      {
        id: "follow-up-test-2",
        leadId: "lead-test-2",
        leadTitle: "Dashboard prototype",
        leadStatus: "won" as const,
        note: "Send Maria Test the recap.",
        followUpStatus: "completed" as const,
        followUpDueAt: new Date("2026-05-20T08:00:00.000Z"),
        completedAt: new Date("2026-05-21T08:00:00.000Z"),
        contactName: "Maria Test",
        company: null
      }
    ];

    const items = deriveCalendarItems(leadRows, followUpRows);

    expect(items.map((item) => item.kind)).toEqual([
      "follow_up_due",
      "follow_up_completed",
      "completed",
      "scheduled",
      "follow_up_due"
    ]);
    expect(
      items.filter((item) => item.kind === "lead_follow_up_due")
    ).toHaveLength(0);
    expect(items[4]).toMatchObject({
      leadId: "lead-test-1",
      title: "Website rebuild",
      contactName: "Juan Test",
      status: "scheduled",
      note: "Send Juan Test the agenda."
    });
  });

  it("uses the lead follow-up due date when no concrete follow-up exists", () => {
    const items = deriveCalendarItems(
      [
        {
          id: "lead-test-1",
          title: "CRM cleanup",
          status: "contacted",
          scheduledAt: null,
          completedAt: null,
          followUpDueAt: new Date("2026-05-24T12:00:00.000Z"),
          contactName: "Carlos Test",
          company: null
        }
      ],
      []
    );

    expect(items).toEqual([
      expect.objectContaining({
        id: "lead:lead-test-1:follow-up-due",
        kind: "lead_follow_up_due",
        contactName: "Carlos Test"
      })
    ]);
  });
});

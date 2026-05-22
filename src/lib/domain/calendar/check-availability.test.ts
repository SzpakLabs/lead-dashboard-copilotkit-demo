import { describe, expect, it } from "vitest";
import { checkCalendarAvailability } from "./check-availability";
import type { CalendarItem } from "./get-calendar-items";

const baseItem: CalendarItem = {
  id: "lead:lead-test-1:scheduled",
  leadId: "lead-test-1",
  title: "Discovery call",
  contactName: "Juan Test",
  company: "Test Company",
  status: "scheduled",
  kind: "scheduled",
  startsAt: new Date("2026-05-22T12:30:00.000Z"),
  note: "Scheduled lead work"
};

describe("checkCalendarAvailability", () => {
  it("marks a slot unavailable when a dashboard item starts inside it", () => {
    const result = checkCalendarAvailability({
      startsAt: new Date("2026-05-22T12:00:00.000Z"),
      durationMinutes: 60,
      timezone: "Europe/Warsaw",
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      items: [baseItem]
    });

    expect(result.available).toBe(false);
    expect(result.conflicts).toEqual([baseItem]);
    expect(result.answerPrefix).toBe("Based on this dashboard");
  });

  it("marks a slot available when it is inside working hours and has no conflicts", () => {
    const result = checkCalendarAvailability({
      startsAt: new Date("2026-05-22T13:00:00.000Z"),
      durationMinutes: 30,
      timezone: "Europe/Warsaw",
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      items: [baseItem]
    });

    expect(result.available).toBe(true);
    expect(result.conflicts).toHaveLength(0);
    expect(result.outsideWorkingHours).toBe(false);
  });

  it("marks a slot unavailable outside provided working hours", () => {
    const result = checkCalendarAvailability({
      startsAt: new Date("2026-05-22T16:30:00.000Z"),
      durationMinutes: 60,
      timezone: "Europe/Warsaw",
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      items: []
    });

    expect(result.available).toBe(false);
    expect(result.outsideWorkingHours).toBe(true);
  });
});

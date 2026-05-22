import type { CalendarItem } from "./get-calendar-items";

export type AvailabilityInput = {
  startsAt: Date;
  durationMinutes: number;
  timezone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  items: CalendarItem[];
};

export type AvailabilityResult = {
  available: boolean;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  conflicts: CalendarItem[];
  outsideWorkingHours: boolean;
  answerPrefix: "Based on this dashboard";
  limitation: string;
};

export function checkCalendarAvailability(
  input: AvailabilityInput
): AvailabilityResult {
  validateTimezone(input.timezone);

  const endsAt = new Date(
    input.startsAt.getTime() + input.durationMinutes * 60_000
  );
  const outsideWorkingHours = !isWithinWorkingHours({
    startsAt: input.startsAt,
    endsAt,
    timezone: input.timezone,
    workingHoursStart: input.workingHoursStart,
    workingHoursEnd: input.workingHoursEnd
  });
  const conflicts = input.items.filter(
    (item) => item.startsAt >= input.startsAt && item.startsAt < endsAt
  );

  return {
    available: conflicts.length === 0 && !outsideWorkingHours,
    startsAt: input.startsAt,
    endsAt,
    timezone: input.timezone,
    conflicts,
    outsideWorkingHours,
    answerPrefix: "Based on this dashboard",
    limitation:
      "This only checks internal lead-related calendar data, not external calendars."
  };
}

function isWithinWorkingHours(input: {
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}) {
  const startLocal = getLocalDayAndMinute(input.startsAt, input.timezone);
  const endLocal = getLocalDayAndMinute(input.endsAt, input.timezone);
  const workingStart = parseTimeOfDay(input.workingHoursStart);
  const workingEnd = parseTimeOfDay(input.workingHoursEnd);

  if (workingEnd <= workingStart) {
    throw new Error("Working-hours end must be after working-hours start");
  }

  return (
    startLocal.dayKey === endLocal.dayKey &&
    startLocal.minuteOfDay >= workingStart &&
    endLocal.minuteOfDay <= workingEnd
  );
}

function getLocalDayAndMinute(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(value);
  const partValue = (type: string) =>
    parts.find((part) => part.type === type)?.value;
  const year = partValue("year");
  const month = partValue("month");
  const day = partValue("day");
  const hour = partValue("hour");
  const minute = partValue("minute");

  if (!year || !month || !day || !hour || !minute) {
    throw new Error("Could not format local time");
  }

  return {
    dayKey: `${year}-${month}-${day}`,
    minuteOfDay: Number(hour) * 60 + Number(minute)
  };
}

function parseTimeOfDay(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    throw new Error("Working hours must use HH:mm format");
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function validateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error("Timezone must be a valid IANA timezone");
  }
}

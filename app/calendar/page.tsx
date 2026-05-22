import { CalendarDays, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/date-format";
import {
  type CalendarItem,
  getCalendarItems
} from "@/lib/domain/calendar/get-calendar-items";
import {
  getLeadStatusColorClassName,
  getLeadStatusLabel
} from "@/lib/domain/leads/status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CalendarScope = "month" | "week" | "day";

type PageProps = {
  searchParams: Promise<{ scope?: string; date?: string }>;
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const scope = parseScope(params.scope);
  const anchorDate = parseAnchorDate(params.date);
  const allItems = await getCalendarItems();
  const range = getCalendarRange(scope, anchorDate);
  const scopedItems = allItems.filter((item) =>
    isInRange(item.startsAt, range.start, range.end)
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="size-4" />
            Later MVP
          </p>
          <div>
            <h1 className="text-4xl font-semibold tracking-normal">Calendar</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Derived from scheduled lead work, completed work, and follow-up
              dates already stored on leads and follow-ups.
            </p>
          </div>
        </div>
        <Link
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
          href="/"
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">{range.label}</p>
          <p className="text-sm text-muted-foreground">
            {scopedItems.length} item{scopedItems.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["month", "week", "day"] satisfies CalendarScope[]).map(
            (option) => (
              <Link
                key={option}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium capitalize",
                  scope === option
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted"
                )}
                href={`/calendar?scope=${option}&date=${toDateParam(anchorDate)}`}
              >
                {option}
              </Link>
            )
          )}
        </div>
      </section>

      {scope === "month" ? (
        <MonthCalendar anchorDate={anchorDate} items={scopedItems} />
      ) : (
        <Agenda items={scopedItems} />
      )}
    </main>
  );
}

function MonthCalendar({
  anchorDate,
  items
}: {
  anchorDate: Date;
  items: CalendarItem[];
}) {
  const days = getMonthGridDays(anchorDate);

  return (
    <section className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-7">
      {weekDayLabels.map((label) => (
        <div
          key={label}
          className="hidden bg-muted px-3 py-2 text-xs font-medium uppercase text-muted-foreground md:block"
        >
          {label}
        </div>
      ))}
      {days.map((day) => {
        const dayItems = items.filter((item) =>
          isSameUtcDay(item.startsAt, day)
        );
        const isCurrentMonth = day.getUTCMonth() === anchorDate.getUTCMonth();

        return (
          <div
            key={day.toISOString()}
            className={cn(
              "min-h-36 bg-background p-3",
              !isCurrentMonth ? "text-muted-foreground" : ""
            )}
          >
            <p className="text-sm font-medium">{day.getUTCDate()}</p>
            <div className="mt-3 space-y-2">
              {dayItems.map((item) => (
                <CalendarItemLink key={item.id} item={item} compact />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Agenda({ items }: { items: CalendarItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          No lead-related work is visible for this scope.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <CalendarItemLink key={item.id} item={item} />
      ))}
    </section>
  );
}

function CalendarItemLink({
  item,
  compact = false
}: {
  item: CalendarItem;
  compact?: boolean;
}) {
  return (
    <Link
      className={cn(
        "block rounded-md border border-border bg-background hover:bg-muted/50",
        compact ? "p-2" : "p-4"
      )}
      href={`/?leadId=${item.leadId}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "font-medium leading-5",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {compact
              ? formatTime(item.startsAt)
              : formatDateTime(item.startsAt)}
          </p>
          <p
            className={cn(
              "mt-1 truncate leading-5",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {formatCalendarKind(item.kind)}: {item.title}
          </p>
          {!compact ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {item.contactName}
              {item.company ? `, ${item.company}` : ""}
              {item.note ? ` - ${item.note}` : ""}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
            getLeadStatusColorClassName(item.status) ??
              "bg-gray-100 text-gray-700"
          )}
        >
          {getLeadStatusLabel(item.status)}
        </span>
      </div>
    </Link>
  );
}

function parseScope(value: string | undefined): CalendarScope {
  if (value === "week" || value === "day") {
    return value;
  }

  return "month";
}

function parseAnchorDate(value: string | undefined) {
  if (!value) {
    return startOfUtcDay(new Date());
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsed.getTime()) ? startOfUtcDay(new Date()) : parsed;
}

function getCalendarRange(scope: CalendarScope, anchorDate: Date) {
  if (scope === "day") {
    const start = startOfUtcDay(anchorDate);
    const end = addUtcDays(start, 1);

    return {
      start,
      end,
      label: formatDate(start)
    };
  }

  if (scope === "week") {
    const start = startOfUtcWeek(anchorDate);
    const end = addUtcDays(start, 7);

    return {
      start,
      end,
      label: `${formatDate(start)} - ${formatDate(addUtcDays(end, -1))}`
    };
  }

  const start = new Date(
    Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth() + 1, 1)
  );

  return {
    start,
    end,
    label: monthFormatter.format(start)
  };
}

function getMonthGridDays(anchorDate: Date) {
  const startOfMonth = new Date(
    Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), 1)
  );
  const gridStart = addUtcDays(startOfMonth, -startOfMonth.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => addUtcDays(gridStart, index));
}

function startOfUtcWeek(value: Date) {
  return addUtcDays(startOfUtcDay(value), -value.getUTCDay());
}

function startOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
}

function addUtcDays(value: Date, days: number) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);

  return next;
}

function isInRange(value: Date, start: Date, end: Date) {
  return value.getTime() >= start.getTime() && value.getTime() < end.getTime();
}

function isSameUtcDay(first: Date, second: Date) {
  return toDateParam(first) === toDateParam(second);
}

function toDateParam(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatCalendarKind(kind: CalendarItem["kind"]) {
  const labels: Record<CalendarItem["kind"], string> = {
    scheduled: "Scheduled",
    completed: "Completed",
    lead_follow_up_due: "Follow-up",
    follow_up_due: "Follow-up",
    follow_up_completed: "Follow-up completed"
  };

  return labels[kind];
}

function formatTime(value: Date) {
  return timeFormatter.format(value);
}

const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC"
});

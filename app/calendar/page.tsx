import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
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
  const boardDays =
    scope === "month" ? getMonthGridDays(anchorDate) : getBoardDays(range);
  const boardStats = getBoardStats(scopedItems);

  return (
    <AppShell
      activeSection="calendar"
      eyebrow="Lead schedule"
      eyebrowIcon={<CalendarDays className="size-4" />}
      showNewIntake
      title="Calendar"
    >
      <div className="ops-page-stack ops-calendar-page">
        <section
          className="ops-calendar-board"
          aria-labelledby="calendar-title"
        >
          <div className="ops-calendar-header">
            <div className="min-w-0">
              <p className="ops-eyebrow">
                <CalendarClock className="size-4" />
                Schedule board
              </p>
              <h2 id="calendar-title">{range.label}</h2>
              <p>
                Lead work, completed work, and follow-up dates from the demo
                workspace.
              </p>
            </div>
            <div className="ops-calendar-controls" aria-label="Calendar range">
              <Link
                aria-label="Previous range"
                className="ops-icon-button"
                href={getCalendarHref(
                  scope,
                  getAdjacentAnchor(scope, anchorDate, -1)
                )}
              >
                <ArrowLeft className="size-4" />
              </Link>
              <Link
                className="ops-calendar-today"
                href={getCalendarHref(scope, new Date())}
              >
                <RotateCcw className="size-4" />
                <span>Today</span>
              </Link>
              <Link
                aria-label="Next range"
                className="ops-icon-button"
                href={getCalendarHref(
                  scope,
                  getAdjacentAnchor(scope, anchorDate, 1)
                )}
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="ops-calendar-toolbar">
            <nav className="ops-scope-tabs" aria-label="Calendar scope">
              {(["month", "week", "day"] satisfies CalendarScope[]).map(
                (option) => (
                  <Link
                    key={option}
                    aria-current={scope === option ? "page" : undefined}
                    className={cn(scope === option ? "is-active" : "")}
                    href={getCalendarHref(option, anchorDate)}
                  >
                    {option}
                  </Link>
                )
              )}
            </nav>
            <div className="ops-calendar-stats" aria-label="Calendar totals">
              <CalendarStat
                icon={<CalendarCheck2 className="size-4" />}
                label="Scheduled"
                value={boardStats.scheduled}
              />
              <CalendarStat
                icon={<Clock3 className="size-4" />}
                label="Follow-ups"
                value={boardStats.followUps}
              />
              <CalendarStat
                icon={<CheckCircle2 className="size-4" />}
                label="Completed"
                value={boardStats.completed}
              />
            </div>
          </div>

          {scope === "month" ? (
            <MonthBoard
              anchorDate={anchorDate}
              days={boardDays}
              items={scopedItems}
            />
          ) : (
            <AgendaBoard days={boardDays} items={scopedItems} scope={scope} />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function MonthBoard({
  anchorDate,
  days,
  items
}: {
  anchorDate: Date;
  days: Date[];
  items: CalendarItem[];
}) {
  return (
    <div className="ops-month-board" aria-label="Monthly schedule">
      {weekDayLabels.map((label) => (
        <div key={label} className="ops-month-weekday">
          {label}
        </div>
      ))}
      {days.map((day) => {
        const dayItems = items.filter((item) =>
          isSameUtcDay(item.startsAt, day)
        );
        const isCurrentMonth = day.getUTCMonth() === anchorDate.getUTCMonth();

        return (
          <section
            key={day.toISOString()}
            className={cn(
              "ops-month-cell",
              !isCurrentMonth ? "is-muted" : "",
              isSameUtcDay(day, new Date()) ? "is-today" : ""
            )}
            aria-label={formatDate(day)}
          >
            <div className="ops-month-date">
              <span>{day.getUTCDate()}</span>
              {dayItems.length > 0 ? <strong>{dayItems.length}</strong> : null}
            </div>
            <div className="ops-calendar-items">
              {dayItems.map((item) => (
                <CalendarItemLink key={item.id} item={item} compact />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function AgendaBoard({
  days,
  items,
  scope
}: {
  days: Date[];
  items: CalendarItem[];
  scope: CalendarScope;
}) {
  return (
    <div
      className={cn(
        "ops-agenda-board",
        scope === "day" ? "ops-agenda-board-day" : ""
      )}
      aria-label={`${scope} schedule`}
    >
      {days.map((day) => {
        const dayItems = items.filter((item) =>
          isSameUtcDay(item.startsAt, day)
        );

        return (
          <section className="ops-agenda-lane" key={day.toISOString()}>
            <div className="ops-agenda-lane-header">
              <div>
                <p>{dayNameFormatter.format(day)}</p>
                <h3>{formatDate(day)}</h3>
              </div>
              <strong>{dayItems.length}</strong>
            </div>
            <div className="ops-calendar-items">
              {dayItems.map((item) => (
                <CalendarItemLink key={item.id} item={item} />
              ))}
              {dayItems.length === 0 ? (
                <p className="ops-calendar-empty">No lead work scheduled.</p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CalendarStat({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="ops-calendar-stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
        "ops-calendar-item",
        `ops-calendar-item-${item.kind}`,
        compact ? "is-compact" : ""
      )}
      href={`/leads/${item.leadId}`}
    >
      <div className="ops-calendar-item-main">
        <div className="min-w-0">
          <p className="ops-calendar-item-time">
            {compact
              ? formatTime(item.startsAt)
              : formatDateTime(item.startsAt)}
          </p>
          <p className="ops-calendar-item-title">
            {formatCalendarKind(item.kind)}: {item.title}
          </p>
          {!compact ? (
            <p className="ops-calendar-item-meta">
              {item.contactName}
              {item.company ? `, ${item.company}` : ""}
              {item.note ? ` - ${item.note}` : ""}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "ops-calendar-status",
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

function getBoardDays(range: { start: Date; end: Date }) {
  const dayCount = Math.max(
    1,
    Math.round(
      (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000)
    )
  );

  return Array.from({ length: dayCount }, (_, index) =>
    addUtcDays(range.start, index)
  );
}

function getAdjacentAnchor(
  scope: CalendarScope,
  anchorDate: Date,
  direction: -1 | 1
) {
  if (scope === "month") {
    return new Date(
      Date.UTC(
        anchorDate.getUTCFullYear(),
        anchorDate.getUTCMonth() + direction,
        1
      )
    );
  }

  return addUtcDays(anchorDate, scope === "week" ? direction * 7 : direction);
}

function getCalendarHref(scope: CalendarScope, value: Date) {
  return `/calendar?scope=${scope}&date=${toDateParam(startOfUtcDay(value))}`;
}

function getBoardStats(items: CalendarItem[]) {
  return items.reduce(
    (stats, item) => {
      if (item.kind === "scheduled") {
        stats.scheduled += 1;
      } else if (
        item.kind === "completed" ||
        item.kind === "follow_up_completed"
      ) {
        stats.completed += 1;
      } else {
        stats.followUps += 1;
      }

      return stats;
    },
    { completed: 0, followUps: 0, scheduled: 0 }
  );
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

const dayNameFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC"
});

import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contacts, followUps, leads } from "@/lib/db/schema";
import type { LeadStatus } from "@/lib/domain/leads/status";

export type CalendarItemKind =
  | "scheduled"
  | "completed"
  | "lead_follow_up_due"
  | "follow_up_due"
  | "follow_up_completed";

export type CalendarItem = {
  id: string;
  leadId: string;
  title: string;
  contactName: string;
  company: string | null;
  status: LeadStatus;
  kind: CalendarItemKind;
  startsAt: Date;
  note: string | null;
};

type LeadCalendarRow = {
  id: string;
  title: string;
  status: LeadStatus;
  scheduledAt: Date | null;
  completedAt: Date | null;
  followUpDueAt: Date | null;
  contactName: string;
  company: string | null;
};

type FollowUpCalendarRow = {
  id: string;
  leadId: string;
  leadTitle: string;
  leadStatus: LeadStatus;
  note: string;
  followUpStatus: "open" | "completed" | "canceled";
  followUpDueAt: Date;
  completedAt: Date | null;
  contactName: string;
  company: string | null;
};

export async function getCalendarItems(): Promise<CalendarItem[]> {
  const db = getDb();
  const leadRows = await db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      scheduledAt: leads.scheduledAt,
      completedAt: leads.completedAt,
      followUpDueAt: leads.followUpDueAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .orderBy(asc(leads.scheduledAt), asc(leads.followUpDueAt));

  const followUpRows = await db
    .select({
      id: followUps.id,
      leadId: followUps.leadId,
      leadTitle: leads.title,
      leadStatus: leads.status,
      note: followUps.note,
      followUpStatus: followUps.status,
      followUpDueAt: followUps.followUpDueAt,
      completedAt: followUps.completedAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(followUps)
    .innerJoin(leads, eq(followUps.leadId, leads.id))
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .orderBy(asc(followUps.followUpDueAt));

  return deriveCalendarItems(leadRows, followUpRows);
}

export function deriveCalendarItems(
  leadRows: LeadCalendarRow[],
  followUpRows: FollowUpCalendarRow[]
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const followUpDueKeys = new Set(
    followUpRows
      .filter((followUp) => followUp.followUpStatus !== "canceled")
      .map((followUp) =>
        createLeadDateKey(followUp.leadId, followUp.followUpDueAt)
      )
  );

  for (const lead of leadRows) {
    if (lead.scheduledAt) {
      items.push({
        id: `lead:${lead.id}:scheduled`,
        leadId: lead.id,
        title: lead.title,
        contactName: lead.contactName,
        company: lead.company,
        status: lead.status,
        kind: "scheduled",
        startsAt: lead.scheduledAt,
        note: "Scheduled lead work"
      });
    }

    if (lead.completedAt) {
      items.push({
        id: `lead:${lead.id}:completed`,
        leadId: lead.id,
        title: lead.title,
        contactName: lead.contactName,
        company: lead.company,
        status: lead.status,
        kind: "completed",
        startsAt: lead.completedAt,
        note: "Completed lead work"
      });
    }

    if (
      lead.followUpDueAt &&
      !followUpDueKeys.has(createLeadDateKey(lead.id, lead.followUpDueAt))
    ) {
      items.push({
        id: `lead:${lead.id}:follow-up-due`,
        leadId: lead.id,
        title: lead.title,
        contactName: lead.contactName,
        company: lead.company,
        status: lead.status,
        kind: "lead_follow_up_due",
        startsAt: lead.followUpDueAt,
        note: "Next follow-up due"
      });
    }
  }

  for (const followUp of followUpRows) {
    if (followUp.followUpStatus === "canceled") {
      continue;
    }

    items.push({
      id: `follow-up:${followUp.id}:due`,
      leadId: followUp.leadId,
      title: followUp.leadTitle,
      contactName: followUp.contactName,
      company: followUp.company,
      status: followUp.leadStatus,
      kind: "follow_up_due",
      startsAt: followUp.followUpDueAt,
      note: followUp.note
    });

    if (followUp.completedAt) {
      items.push({
        id: `follow-up:${followUp.id}:completed`,
        leadId: followUp.leadId,
        title: followUp.leadTitle,
        contactName: followUp.contactName,
        company: followUp.company,
        status: followUp.leadStatus,
        kind: "follow_up_completed",
        startsAt: followUp.completedAt,
        note: followUp.note
      });
    }
  }

  return items.sort((first, second) => {
    const dateOrder = first.startsAt.getTime() - second.startsAt.getTime();

    return dateOrder === 0
      ? first.title.localeCompare(second.title)
      : dateOrder;
  });
}

function createLeadDateKey(leadId: string, value: Date) {
  return `${leadId}:${value.toISOString()}`;
}

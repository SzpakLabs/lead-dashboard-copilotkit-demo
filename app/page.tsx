import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import {
  CustomFieldDefinitionsPanel,
  type CustomFieldDefinitionItem
} from "@/components/leads/custom-field-definitions-panel";
import {
  CustomFieldValuesForm,
  type CustomFieldValueItem
} from "@/components/leads/custom-field-values-form";
import {
  FollowUpsPanel,
  type FollowUpListItem
} from "@/components/leads/follow-ups-panel";
import { IngestionForm } from "@/components/leads/ingestion-form";
import { LeadDetailForm } from "@/components/leads/lead-detail-form";
import { LeadStatusForm } from "@/components/leads/lead-status-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import {
  contacts,
  customFieldDefinitions,
  customFieldValues,
  followUps,
  ingestionEvents,
  leadEvents,
  leads,
  users
} from "@/lib/db/schema";
import { formatDate, formatDateTime } from "@/lib/date-format";
import {
  getLeadStatusColorClassName,
  getLeadStatusLabel,
  type LeadStatus
} from "@/lib/domain/leads/status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ leadId?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { leadId } = await searchParams;

  return <Dashboard selectedLeadId={leadId} />;
}

async function Dashboard({ selectedLeadId }: { selectedLeadId?: string }) {
  const db = getDb();
  const leadRows = await db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      source: leads.source,
      projectType: leads.projectType,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      followUpDueAt: leads.followUpDueAt,
      missingFields: leads.missingFields,
      confidence: leads.confidence,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .orderBy(desc(leads.updatedAt));

  const activeLeadId = selectedLeadId ?? leadRows[0]?.id;
  const detail = activeLeadId ? await getLeadDetail(activeLeadId) : null;
  const detailFollowUps = activeLeadId
    ? await getLeadFollowUps(activeLeadId)
    : [];
  const detailActivity = activeLeadId
    ? await getLeadActivity(activeLeadId)
    : [];
  const customFieldDefinitionRows = await getCustomFieldDefinitions();
  const detailCustomFieldValues = activeLeadId
    ? await getLeadCustomFieldValues(activeLeadId)
    : [];
  const currentTime = await getCurrentTime();
  const metrics = await getDashboardMetrics(leadRows, currentTime);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
      <AssistantPanel />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Demo Core</p>
          <h1 className="text-4xl font-semibold tracking-normal">
            Lead Dashboard
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Paste lead text or a transcript, review extracted records, and keep
            source context traceable while status and follow-up changes write
            audit activity.
          </p>
        </div>
        <Link
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
          href="/calendar"
        >
          <CalendarDays className="size-4" />
          Calendar
        </Link>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Lead ingestion</h2>
          <p className="text-sm text-muted-foreground">
            Drafts are stored with the source ingestion event and audit
            activity.
          </p>
        </div>
        <IngestionForm />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total leads" value={metrics.totalLeads} />
        <MetricCard label="Needs review" value={metrics.needsReview} />
        <MetricCard label="Scheduled" value={metrics.scheduled} />
        <MetricCard label="Won / lost" value={metrics.wonLost} />
        <MetricCard
          label="Overdue follow-ups"
          value={metrics.overdueFollowUps}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Leads</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {leadRows.length} lead{leadRows.length === 1 ? "" : "s"} in
                  the demo workspace
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b border-border bg-muted/60 text-xs font-medium uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Lead</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Timeline</th>
                    <th className="px-5 py-3">Next step</th>
                    <th className="px-5 py-3">Follow-up</th>
                    <th className="px-5 py-3">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {leadRows.map((lead) => (
                    <tr
                      key={lead.id}
                      className={cn(
                        "border-b border-border last:border-b-0",
                        lead.id === activeLeadId ? "bg-muted/40" : "bg-white"
                      )}
                    >
                      <td className="px-5 py-4 align-top">
                        <Link
                          className="font-medium hover:underline"
                          href={`/?leadId=${lead.id}`}
                        >
                          {lead.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {lead.contactName}
                          {lead.company ? `, ${lead.company}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-5 py-4 align-top capitalize text-muted-foreground">
                        {lead.source}
                      </td>
                      <td className="max-w-40 px-5 py-4 align-top text-muted-foreground">
                        {lead.timeline ?? "Missing"}
                      </td>
                      <td className="max-w-48 px-5 py-4 align-top text-muted-foreground">
                        {lead.nextStep ?? "Missing"}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <FollowUpDueBadge
                          followUpDueAt={lead.followUpDueAt}
                          currentTime={currentTime}
                        />
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          {lead.missingFields.length > 0
                            ? `${lead.missingFields.length} missing`
                            : `${lead.confidence} confidence`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leadRows.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">
                No leads yet. Create a draft from pasted text.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-5">
          {detail ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Lead detail</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Edit standard lead and contact fields.
                  </p>
                </CardHeader>
                <CardContent>
                  <LeadDetailForm
                    key={detail.id}
                    lead={{
                      id: detail.id,
                      title: detail.title,
                      source: detail.source,
                      contactName: detail.contactName,
                      company: detail.company ?? "",
                      email: detail.email ?? "",
                      phone: detail.phone ?? "",
                      projectType: detail.projectType ?? "",
                      problemSummary: detail.problemSummary ?? "",
                      requestedOutcome: detail.requestedOutcome ?? "",
                      budgetRange: detail.budgetRange ?? "",
                      timeline: detail.timeline ?? "",
                      nextStep: detail.nextStep ?? ""
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Status</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Move the lead through allowed lifecycle transitions.
                  </p>
                </CardHeader>
                <CardContent>
                  <LeadStatusForm
                    key={detail.id}
                    leadId={detail.id}
                    status={detail.status as LeadStatus}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Custom fields</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Workspace-specific values for this lead.
                  </p>
                </CardHeader>
                <CardContent>
                  <CustomFieldValuesForm
                    key={detail.id}
                    leadId={detail.id}
                    definitions={customFieldDefinitionRows}
                    values={detailCustomFieldValues}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Field definitions</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or archive workspace custom fields.
                  </p>
                </CardHeader>
                <CardContent>
                  <CustomFieldDefinitionsPanel
                    definitions={customFieldDefinitionRows}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Follow-ups</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track due and overdue next actions for this lead.
                  </p>
                </CardHeader>
                <CardContent>
                  <FollowUpsPanel
                    key={detail.id}
                    leadId={detail.id}
                    followUps={detailFollowUps}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Source context</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Original transcript or pasted text remains read-only.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                    <Field
                      label="Source"
                      value={formatSource(
                        detail.sourceType,
                        detail.sourceChannel
                      )}
                    />
                    <Field
                      label="Created"
                      value={formatDateTime(detail.ingestedAt)}
                    />
                  </div>
                  <div className="rounded-md border border-border bg-muted/40 p-3 text-sm leading-6">
                    {detail.rawText}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Lead edits, status changes, and follow-up changes.
                  </p>
                </CardHeader>
                <CardContent>
                  <ActivityList activity={detailActivity} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-5 text-sm text-muted-foreground">
                Select a lead to review details.
              </CardContent>
            </Card>
          )}
        </aside>
      </section>
    </main>
  );
}

async function getCustomFieldDefinitions(): Promise<
  CustomFieldDefinitionItem[]
> {
  const db = getDb();
  const rows = await db
    .select({
      id: customFieldDefinitions.id,
      label: customFieldDefinitions.label,
      fieldType: customFieldDefinitions.fieldType
    })
    .from(customFieldDefinitions)
    .where(isNull(customFieldDefinitions.archivedAt))
    .orderBy(asc(customFieldDefinitions.createdAt));

  return rows;
}

async function getLeadCustomFieldValues(
  leadId: string
): Promise<CustomFieldValueItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      definitionId: customFieldValues.definitionId,
      value: customFieldValues.value
    })
    .from(customFieldValues)
    .innerJoin(
      customFieldDefinitions,
      eq(customFieldValues.definitionId, customFieldDefinitions.id)
    )
    .where(
      and(
        eq(customFieldValues.leadId, leadId),
        isNull(customFieldDefinitions.archivedAt)
      )
    );

  return rows.map((row) => ({
    definitionId: row.definitionId,
    value: row.value ?? ""
  }));
}

async function getLeadDetail(leadId: string) {
  const db = getDb();
  const [detail] = await db
    .select({
      id: leads.id,
      title: leads.title,
      status: leads.status,
      source: leads.source,
      projectType: leads.projectType,
      problemSummary: leads.problemSummary,
      requestedOutcome: leads.requestedOutcome,
      budgetRange: leads.budgetRange,
      timeline: leads.timeline,
      nextStep: leads.nextStep,
      contactName: contacts.name,
      company: contacts.company,
      email: contacts.email,
      phone: contacts.phone,
      sourceType: ingestionEvents.sourceType,
      sourceChannel: ingestionEvents.sourceChannel,
      rawText: ingestionEvents.rawText,
      ingestedAt: ingestionEvents.createdAt
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .innerJoin(ingestionEvents, eq(leads.ingestionEventId, ingestionEvents.id))
    .where(eq(leads.id, leadId))
    .limit(1);

  if (detail) {
    return detail;
  }

  return null;
}

async function getCurrentTime() {
  return Date.now();
}

async function getDashboardMetrics(
  leadRows: Array<{ status: LeadStatus }>,
  currentTime: number
) {
  const db = getDb();
  const followUpRows = await db
    .select({
      status: followUps.status,
      followUpDueAt: followUps.followUpDueAt
    })
    .from(followUps);

  const won = leadRows.filter((lead) => lead.status === "won").length;
  const lost = leadRows.filter((lead) => lead.status === "lost").length;

  return {
    totalLeads: leadRows.length,
    needsReview: leadRows.filter((lead) => lead.status === "needs_review")
      .length,
    scheduled: leadRows.filter((lead) => lead.status === "scheduled").length,
    wonLost: `${won} / ${lost}`,
    overdueFollowUps: followUpRows.filter(
      (followUp) =>
        followUp.status === "open" &&
        followUp.followUpDueAt.getTime() < currentTime
    ).length
  };
}

async function getLeadFollowUps(leadId: string): Promise<FollowUpListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: followUps.id,
      note: followUps.note,
      status: followUps.status,
      followUpDueAt: followUps.followUpDueAt,
      completedAt: followUps.completedAt
    })
    .from(followUps)
    .where(eq(followUps.leadId, leadId))
    .orderBy(asc(followUps.followUpDueAt));

  return rows.map((followUp) => ({
    id: followUp.id,
    note: followUp.note,
    status: followUp.status,
    followUpDueAt: followUp.followUpDueAt.toISOString(),
    completedAt: followUp.completedAt?.toISOString() ?? null
  }));
}

async function getLeadActivity(leadId: string) {
  const db = getDb();

  return db
    .select({
      id: leadEvents.id,
      action: leadEvents.action,
      summary: leadEvents.summary,
      targetType: leadEvents.targetType,
      createdAt: leadEvents.createdAt,
      actorName: users.name
    })
    .from(leadEvents)
    .leftJoin(users, eq(leadEvents.actorUserId, users.id))
    .where(eq(leadEvents.leadId, leadId))
    .orderBy(desc(leadEvents.createdAt));
}

function MetricCard({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ActivityList({
  activity
}: {
  activity: Awaited<ReturnType<typeof getLeadActivity>>;
}) {
  if (activity.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activity has been recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {activity.map((event) => (
        <li
          key={event.id}
          className="rounded-md border border-border bg-muted/30 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{event.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatActivityAction(event.action)} by{" "}
                {event.actorName ?? "System"}
              </p>
            </div>
            <time className="shrink-0 text-right text-xs text-muted-foreground">
              {formatDateTime(event.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
        getLeadStatusColorClassName(status) ?? "bg-gray-100 text-gray-700"
      )}
    >
      {getLeadStatusLabel(status)}
    </span>
  );
}

function FollowUpDueBadge({
  followUpDueAt,
  currentTime
}: {
  followUpDueAt: Date | null;
  currentTime: number;
}) {
  if (!followUpDueAt) {
    return (
      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
        None
      </span>
    );
  }

  const isOverdue = followUpDueAt.getTime() < currentTime;

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
        isOverdue ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      )}
    >
      {isOverdue ? "Overdue" : "Due"} {formatDate(followUpDueAt)}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6">{value ?? "Missing"}</p>
    </div>
  );
}

function formatSource(sourceType: string, sourceChannel: string) {
  return `${sourceChannel} / ${sourceType.replace("_", " ")}`;
}

function formatActivityAction(action: string) {
  return action
    .split(".")
    .map((part) => part.replace("_", " "))
    .join(" ");
}

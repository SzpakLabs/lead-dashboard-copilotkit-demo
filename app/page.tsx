import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { IngestionForm } from "@/components/leads/ingestion-form";
import { LeadDetailForm } from "@/components/leads/lead-detail-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { contacts, ingestionEvents, leads } from "@/lib/db/schema";
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

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Demo Core</p>
        <h1 className="text-4xl font-semibold tracking-normal">
          Lead Dashboard
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Paste lead text or a transcript, review extracted records, and keep
          source context traceable while edits write audit activity.
        </p>
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
                      value={detail.ingestedAt.toLocaleString()}
                    />
                  </div>
                  <div className="rounded-md border border-border bg-muted/40 p-3 text-sm leading-6">
                    {detail.rawText}
                  </div>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-gray-100 text-gray-700",
    needs_review: "bg-amber-100 text-amber-800",
    contacted: "bg-blue-100 text-blue-800",
    scheduled: "bg-violet-100 text-violet-800",
    in_progress: "bg-cyan-100 text-cyan-800",
    won: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800"
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
        styles[status] ?? styles.new
      )}
    >
      {formatStatus(status)}
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

function formatStatus(status: string) {
  return status.replace("_", " ");
}

function formatSource(sourceType: string, sourceChannel: string) {
  return `${sourceChannel} / ${sourceType.replace("_", " ")}`;
}

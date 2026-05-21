import { desc, eq } from "drizzle-orm";
import { IngestionForm } from "@/components/leads/ingestion-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { contacts, leads } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Dashboard />;
}

async function Dashboard() {
  const db = getDb();
  const draftLeads = await db
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
      missingFields: leads.missingFields,
      confidence: leads.confidence,
      createdAt: leads.createdAt,
      contactName: contacts.name,
      company: contacts.company
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(leads.status, "needs_review"))
    .orderBy(desc(leads.createdAt));

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Demo Core</p>
        <h1 className="text-4xl font-semibold tracking-normal">
          Lead Dashboard
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Paste lead text or a transcript to create a structured draft for
          review through the deterministic software-services extractor.
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

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Needs review</h2>
            <p className="text-sm text-muted-foreground">
              {draftLeads.length} draft lead{draftLeads.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {draftLeads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{lead.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead.contactName}
                      {lead.company ? `, ${lead.company}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-800">
                      Needs review
                    </span>
                    <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground">
                      {lead.confidence} confidence
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Source" value={lead.source} />
                <Field label="Project type" value={lead.projectType} />
                <Field label="Problem" value={lead.problemSummary} />
                <Field
                  label="Requested outcome"
                  value={lead.requestedOutcome}
                />
                <Field label="Budget" value={lead.budgetRange} />
                <Field label="Timeline" value={lead.timeline} />
                <Field label="Next step" value={lead.nextStep} />
                <Field
                  label="Missing fields"
                  value={
                    lead.missingFields.length > 0
                      ? lead.missingFields.join(", ")
                      : "None"
                  }
                />
              </CardContent>
            </Card>
          ))}
          {draftLeads.length === 0 ? (
            <Card>
              <CardContent className="pt-5 text-sm text-muted-foreground">
                No draft leads need review.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
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

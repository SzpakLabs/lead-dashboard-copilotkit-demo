import { ArrowLeft, DatabaseZap } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { IngestionForm } from "@/components/leads/ingestion-form";
import { getActiveSourceOptions } from "@/lib/domain/sources/manage-sources";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  const sourceOptions = await getActiveSourceOptions();

  return (
    <AppShell
      actions={
        <Link className="ops-button" href="/">
          <ArrowLeft className="size-4" />
          <span>Back to console</span>
        </Link>
      }
      activeSection="intake"
      eyebrow="Focused Intake"
      eyebrowIcon={<DatabaseZap className="size-4" />}
      title="Lead intake"
    >
      <section className="ops-page-stack ops-narrow-page">
        <div className="ops-toolbar-panel">
          <div>
            <h2 className="text-base font-semibold">Create draft lead</h2>
            <p className="ops-page-intro">
              Paste a lead conversation, call note, or transcript. The same
              ingestion pipeline creates a draft for human review.
            </p>
          </div>
        </div>
        <IngestionForm sourceOptions={sourceOptions} />
      </section>
    </AppShell>
  );
}

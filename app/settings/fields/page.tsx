import { asc, isNull } from "drizzle-orm";
import { ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import {
  CustomFieldDefinitionsPanel,
  type CustomFieldDefinitionItem
} from "@/components/leads/custom-field-definitions-panel";
import { getDb } from "@/lib/db";
import { customFieldDefinitions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function FieldSettingsPage() {
  const definitions = await getCustomFieldDefinitions();

  return (
    <main className="ops-console min-h-screen">
      <header className="ops-command-bar">
        <div className="min-w-0">
          <p className="ops-eyebrow">
            <Settings2 className="size-4" />
            Workspace settings
          </p>
          <h1>Custom fields</h1>
        </div>
        <div className="ops-actions">
          <Link className="ops-button" href="/">
            <ArrowLeft className="size-4" />
            <span>Back to console</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-4 max-w-3xl">
        <div className="ops-panel">
          <div className="ops-panel-heading">
            <div>
              <h2>Field definitions</h2>
              <p>Configure reusable fields for lead-specific values.</p>
            </div>
          </div>
          <CustomFieldDefinitionsPanel definitions={definitions} />
        </div>
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

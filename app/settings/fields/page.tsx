import { asc, isNull } from "drizzle-orm";
import { Settings2 } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
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
    <AppShell
      activeSection="settings"
      eyebrow="Workspace settings"
      eyebrowIcon={<Settings2 className="size-4" />}
      title="Custom fields"
    >
      <section className="ops-page-stack ops-narrow-page">
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
    </AppShell>
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

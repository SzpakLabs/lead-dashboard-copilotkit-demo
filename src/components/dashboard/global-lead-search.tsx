import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  contacts,
  customFieldDefinitions,
  customFieldValues,
  leads
} from "@/lib/db/schema";
import { getWorkspaceSourceDefinitions } from "@/lib/domain/sources/manage-sources";
import { LeadSearchOverlay } from "./lead-search-overlay";

export async function GlobalLeadSearch() {
  const [leadRows, sourceDefinitions] = await Promise.all([
    getSearchLeadRows(),
    getWorkspaceSourceDefinitions()
  ]);
  const sourceLabels = Object.fromEntries(
    sourceDefinitions.map((source) => [source.slug, source.label])
  );

  return <LeadSearchOverlay leads={leadRows} sourceLabels={sourceLabels} />;
}

async function getSearchLeadRows() {
  const db = getDb();
  const rows = await db
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

  if (rows.length === 0) {
    return [];
  }

  const customValueRows = await db
    .select({
      leadId: customFieldValues.leadId,
      value: customFieldValues.value
    })
    .from(customFieldValues)
    .innerJoin(
      customFieldDefinitions,
      eq(customFieldValues.definitionId, customFieldDefinitions.id)
    )
    .where(
      inArray(
        customFieldValues.leadId,
        rows.map((row) => row.id)
      )
    );

  const customValuesByLead = new Map<string, string[]>();

  for (const row of customValueRows) {
    if (!row.value) {
      continue;
    }

    const values = customValuesByLead.get(row.leadId) ?? [];
    values.push(row.value);
    customValuesByLead.set(row.leadId, values);
  }

  return rows.map((row) => ({
    ...row,
    customFieldValues: customValuesByLead.get(row.id) ?? []
  }));
}

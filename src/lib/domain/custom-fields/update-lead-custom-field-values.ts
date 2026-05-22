import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  customFieldDefinitions,
  customFieldValues,
  leadEvents,
  leads,
  users,
  workspaces
} from "@/lib/db/schema";
import {
  normalizeCustomFieldValue,
  validateCustomFieldValue
} from "./manage-custom-fields";

export const updateLeadCustomFieldValuesInputSchema = z.object({
  leadId: z.string().uuid(),
  values: z.record(z.string().uuid(), z.string().max(1_000))
});

export type UpdateLeadCustomFieldValuesInput = z.infer<
  typeof updateLeadCustomFieldValuesInputSchema
>;

export async function updateLeadCustomFieldValues(
  input: UpdateLeadCustomFieldValuesInput
) {
  const parsed = updateLeadCustomFieldValuesInputSchema.parse(input);
  const db = getDb();
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, "software-services-demo"))
    .limit(1);

  if (!workspace) {
    throw new Error("Seeded workspace software-services-demo was not found");
  }

  const [actor] = await db
    .select()
    .from(users)
    .where(eq(users.workspaceId, workspace.id))
    .limit(1);

  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(
      and(eq(leads.id, parsed.leadId), eq(leads.workspaceId, workspace.id))
    )
    .limit(1);

  if (!lead) {
    throw new Error("Lead was not found");
  }

  const requestedDefinitionIds = Object.keys(parsed.values);

  if (requestedDefinitionIds.length === 0) {
    return { updatedCount: 0 };
  }

  const definitions = await db
    .select({
      id: customFieldDefinitions.id,
      label: customFieldDefinitions.label,
      fieldType: customFieldDefinitions.fieldType,
      archivedAt: customFieldDefinitions.archivedAt
    })
    .from(customFieldDefinitions)
    .where(eq(customFieldDefinitions.workspaceId, workspace.id));

  const definitionsById = new Map(
    definitions.map((definition) => [definition.id, definition])
  );

  const values = requestedDefinitionIds.map((definitionId) => {
    const definition = definitionsById.get(definitionId);

    if (!definition) {
      throw new Error("Custom field definition was not found");
    }

    if (definition.archivedAt) {
      throw new Error("Archived custom fields cannot be updated");
    }

    const rawValue = parsed.values[definitionId] ?? "";
    const error = validateCustomFieldValue(definition.fieldType, rawValue);

    if (error) {
      throw new Error(`${definition.label}: ${error}`);
    }

    return {
      definition,
      value: normalizeCustomFieldValue(definition.fieldType, rawValue)
    };
  });

  const existingValues = await db
    .select({
      definitionId: customFieldValues.definitionId,
      value: customFieldValues.value
    })
    .from(customFieldValues)
    .where(eq(customFieldValues.leadId, parsed.leadId));
  const existingByDefinitionId = new Map(
    existingValues.map((value) => [value.definitionId, value.value])
  );

  return db.transaction(async (tx) => {
    for (const { definition, value } of values) {
      await tx
        .insert(customFieldValues)
        .values({
          workspaceId: workspace.id,
          leadId: parsed.leadId,
          definitionId: definition.id,
          value
        })
        .onConflictDoUpdate({
          target: [customFieldValues.leadId, customFieldValues.definitionId],
          set: {
            value,
            updatedAt: new Date()
          }
        });
    }

    await tx.insert(leadEvents).values({
      workspaceId: workspace.id,
      actorUserId: actor?.id,
      leadId: parsed.leadId,
      targetType: "custom_field_value",
      targetId: parsed.leadId,
      action: "custom_field_values.updated",
      summary: "Updated custom field values.",
      before: Object.fromEntries(
        values.map(({ definition }) => [
          definition.label,
          existingByDefinitionId.get(definition.id) ?? null
        ])
      ),
      after: Object.fromEntries(
        values.map(({ definition, value }) => [definition.label, value])
      )
    });

    return { updatedCount: values.length };
  });
}

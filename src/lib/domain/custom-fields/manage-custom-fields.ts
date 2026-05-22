import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  customFieldDefinitions,
  customFieldValues,
  leadEvents,
  users,
  workspaces
} from "@/lib/db/schema";

export const customFieldTypeSchema = z.enum([
  "text",
  "number",
  "boolean",
  "date"
]);

export type CustomFieldType = z.infer<typeof customFieldTypeSchema>;

export const createCustomFieldDefinitionInputSchema = z.object({
  label: z.string().trim().min(1).max(80),
  fieldType: customFieldTypeSchema
});

export const updateCustomFieldDefinitionInputSchema = z.object({
  fieldId: z.string().uuid(),
  label: z.string().trim().min(1).max(80),
  fieldType: customFieldTypeSchema
});

export const archiveCustomFieldDefinitionInputSchema = z.object({
  fieldId: z.string().uuid()
});

export type CreateCustomFieldDefinitionInput = z.infer<
  typeof createCustomFieldDefinitionInputSchema
>;
export type UpdateCustomFieldDefinitionInput = z.infer<
  typeof updateCustomFieldDefinitionInputSchema
>;
export type ArchiveCustomFieldDefinitionInput = z.infer<
  typeof archiveCustomFieldDefinitionInputSchema
>;

export async function createCustomFieldDefinition(
  input: CreateCustomFieldDefinitionInput
) {
  const parsed = createCustomFieldDefinitionInputSchema.parse(input);
  const { db, workspace, actor } = await getDemoContext();
  const key = toCustomFieldKey(parsed.label);

  const [created] = await db
    .insert(customFieldDefinitions)
    .values({
      workspaceId: workspace.id,
      key,
      label: parsed.label,
      fieldType: parsed.fieldType
    })
    .returning();

  await db.insert(leadEvents).values({
    workspaceId: workspace.id,
    actorUserId: actor?.id,
    targetType: "custom_field_definition",
    targetId: created.id,
    action: "custom_field_definition.created",
    summary: `Created custom field ${parsed.label}.`,
    after: {
      key: created.key,
      label: created.label,
      fieldType: created.fieldType
    }
  });

  return created;
}

export async function updateCustomFieldDefinition(
  input: UpdateCustomFieldDefinitionInput
) {
  const parsed = updateCustomFieldDefinitionInputSchema.parse(input);
  const { db, workspace, actor } = await getDemoContext();
  const [current] = await db
    .select()
    .from(customFieldDefinitions)
    .where(
      and(
        eq(customFieldDefinitions.id, parsed.fieldId),
        eq(customFieldDefinitions.workspaceId, workspace.id),
        isNull(customFieldDefinitions.archivedAt)
      )
    )
    .limit(1);

  if (!current) {
    throw new Error("Custom field definition was not found");
  }

  if (current.fieldType !== parsed.fieldType) {
    const existingValues = await db
      .select({ value: customFieldValues.value })
      .from(customFieldValues)
      .where(eq(customFieldValues.definitionId, current.id));

    const invalidValue = existingValues.find(
      ({ value }) =>
        value !== null && validateCustomFieldValue(parsed.fieldType, value)
    );

    if (invalidValue) {
      throw new Error(
        "Custom field type cannot change because existing values do not match the new type"
      );
    }
  }

  const before = {
    label: current.label,
    fieldType: current.fieldType
  };
  const after = {
    label: parsed.label,
    fieldType: parsed.fieldType
  };

  const [updated] = await db
    .update(customFieldDefinitions)
    .set({
      label: parsed.label,
      fieldType: parsed.fieldType,
      updatedAt: new Date()
    })
    .where(eq(customFieldDefinitions.id, current.id))
    .returning();

  await db.insert(leadEvents).values({
    workspaceId: workspace.id,
    actorUserId: actor?.id,
    targetType: "custom_field_definition",
    targetId: current.id,
    action: "custom_field_definition.updated",
    summary: `Updated custom field ${parsed.label}.`,
    before,
    after
  });

  return updated;
}

export async function archiveCustomFieldDefinition(
  input: ArchiveCustomFieldDefinitionInput
) {
  const parsed = archiveCustomFieldDefinitionInputSchema.parse(input);
  const { db, workspace, actor } = await getDemoContext();
  const [current] = await db
    .select()
    .from(customFieldDefinitions)
    .where(
      and(
        eq(customFieldDefinitions.id, parsed.fieldId),
        eq(customFieldDefinitions.workspaceId, workspace.id),
        isNull(customFieldDefinitions.archivedAt)
      )
    )
    .limit(1);

  if (!current) {
    throw new Error("Custom field definition was not found");
  }

  const archivedAt = new Date();
  const [updated] = await db
    .update(customFieldDefinitions)
    .set({ archivedAt, updatedAt: archivedAt })
    .where(eq(customFieldDefinitions.id, current.id))
    .returning();

  await db.insert(leadEvents).values({
    workspaceId: workspace.id,
    actorUserId: actor?.id,
    targetType: "custom_field_definition",
    targetId: current.id,
    action: "custom_field_definition.archived",
    summary: `Archived custom field ${current.label}.`,
    before: { archivedAt: current.archivedAt },
    after: { archivedAt: archivedAt.toISOString() }
  });

  return updated;
}

export function validateCustomFieldValue(
  fieldType: CustomFieldType,
  value: string
) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (fieldType === "text") {
    return normalized.length <= 1_000 ? null : "Text value is too long";
  }

  if (fieldType === "number") {
    return Number.isFinite(Number(normalized))
      ? null
      : "Value must be a number";
  }

  if (fieldType === "boolean") {
    return normalized === "true" || normalized === "false"
      ? null
      : "Value must be true or false";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? null
    : "Value must use YYYY-MM-DD format";
}

export function normalizeCustomFieldValue(
  fieldType: CustomFieldType,
  value: string
) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (fieldType === "number") {
    return String(Number(normalized));
  }

  return normalized;
}

function toCustomFieldKey(label: string) {
  const key = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return key || "custom_field";
}

async function getDemoContext() {
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

  return { db, workspace, actor };
}

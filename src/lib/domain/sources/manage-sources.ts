import { and, asc, eq, isNull, max } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  leadEvents,
  sourceDefinitions,
  users,
  workspaces
} from "@/lib/db/schema";

export const sourcePresets = [
  { slug: "linkedin", label: "LinkedIn" },
  { slug: "upwork", label: "Upwork" },
  { slug: "referral", label: "Referral" },
  { slug: "website", label: "Website" },
  { slug: "phone", label: "Phone" },
  { slug: "whatsapp", label: "WhatsApp" },
  { slug: "instagram", label: "Instagram" },
  { slug: "facebook", label: "Facebook" },
  { slug: "google", label: "Google" },
  { slug: "walk-in", label: "Walk-in" },
  { slug: "other", label: "Other" }
] as const;

export type SourceDefinitionItem = {
  id: string;
  slug: string;
  label: string;
  presetKey: string | null;
  isActive: boolean;
  sortOrder: number;
  archivedAt: Date | null;
};

export type SourceOption = {
  value: string;
  label: string;
};

export const createSourceDefinitionInputSchema = z.object({
  label: z.string().trim().min(1).max(80)
});

export const updateSourceDefinitionInputSchema = z.object({
  sourceId: z.string().uuid(),
  label: z.string().trim().min(1).max(80).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional()
});

export const archiveSourceDefinitionInputSchema = z.object({
  sourceId: z.string().uuid()
});

export async function getWorkspaceSourceDefinitions(): Promise<
  SourceDefinitionItem[]
> {
  const { db, workspace } = await getDemoContext();
  await ensureDefaultSourceDefinitions(workspace.id);

  return db
    .select({
      id: sourceDefinitions.id,
      slug: sourceDefinitions.slug,
      label: sourceDefinitions.label,
      presetKey: sourceDefinitions.presetKey,
      isActive: sourceDefinitions.isActive,
      sortOrder: sourceDefinitions.sortOrder,
      archivedAt: sourceDefinitions.archivedAt
    })
    .from(sourceDefinitions)
    .where(eq(sourceDefinitions.workspaceId, workspace.id))
    .orderBy(asc(sourceDefinitions.sortOrder), asc(sourceDefinitions.label));
}

export async function getActiveSourceOptions(): Promise<SourceOption[]> {
  const definitions = await getWorkspaceSourceDefinitions();

  return definitions
    .filter((definition) => definition.isActive && !definition.archivedAt)
    .map((definition) => ({
      value: definition.slug,
      label: definition.label
    }));
}

export async function ensureDefaultSourceDefinitions(workspaceId: string) {
  const db = getDb();
  const existing = await db
    .select({ slug: sourceDefinitions.slug })
    .from(sourceDefinitions)
    .where(eq(sourceDefinitions.workspaceId, workspaceId));
  const existingSlugs = new Set(existing.map((source) => source.slug));
  const missing = sourcePresets.filter(
    (preset) => !existingSlugs.has(preset.slug)
  );

  if (missing.length === 0) {
    return;
  }

  await db.insert(sourceDefinitions).values(
    missing.map((preset, index) => ({
      workspaceId,
      slug: preset.slug,
      label: preset.label,
      presetKey: preset.slug,
      isActive: ["linkedin", "upwork", "referral", "website", "other"].includes(
        preset.slug
      ),
      sortOrder: index * 10
    }))
  );
}

export async function createSourceDefinition(
  input: z.infer<typeof createSourceDefinitionInputSchema>
) {
  const parsed = createSourceDefinitionInputSchema.parse(input);
  const { db, workspace, actor } = await getDemoContext();
  const nextOrder = await getNextActiveSortOrder(workspace.id);
  const baseSlug = toSourceSlug(parsed.label);
  const slug = await getAvailableSourceSlug(workspace.id, baseSlug);
  const [created] = await db
    .insert(sourceDefinitions)
    .values({
      workspaceId: workspace.id,
      slug,
      label: parsed.label,
      isActive: true,
      sortOrder: nextOrder
    })
    .returning();

  await db.insert(leadEvents).values({
    workspaceId: workspace.id,
    actorUserId: actor?.id,
    targetType: "source_definition",
    targetId: created.id,
    action: "source_definition.created",
    summary: `Created source ${created.label}.`,
    after: {
      slug: created.slug,
      label: created.label,
      isActive: created.isActive,
      sortOrder: created.sortOrder
    }
  });

  return created;
}

export async function updateSourceDefinition(
  input: z.infer<typeof updateSourceDefinitionInputSchema>
) {
  const parsed = updateSourceDefinitionInputSchema.parse(input);
  const { db, workspace, actor } = await getDemoContext();
  const [current] = await db
    .select()
    .from(sourceDefinitions)
    .where(
      and(
        eq(sourceDefinitions.id, parsed.sourceId),
        eq(sourceDefinitions.workspaceId, workspace.id),
        isNull(sourceDefinitions.archivedAt)
      )
    )
    .limit(1);

  if (!current) {
    throw new Error("Source was not found");
  }

  const next = {
    label: parsed.label ?? current.label,
    isActive: parsed.isActive ?? current.isActive,
    sortOrder: parsed.sortOrder ?? current.sortOrder,
    updatedAt: new Date()
  };
  const [updated] = await db
    .update(sourceDefinitions)
    .set(next)
    .where(eq(sourceDefinitions.id, current.id))
    .returning();

  await db.insert(leadEvents).values({
    workspaceId: workspace.id,
    actorUserId: actor?.id,
    targetType: "source_definition",
    targetId: current.id,
    action: "source_definition.updated",
    summary: `Updated source ${updated.label}.`,
    before: {
      label: current.label,
      isActive: current.isActive,
      sortOrder: current.sortOrder
    },
    after: {
      label: updated.label,
      isActive: updated.isActive,
      sortOrder: updated.sortOrder
    }
  });

  return updated;
}

export async function archiveSourceDefinition(
  input: z.infer<typeof archiveSourceDefinitionInputSchema>
) {
  const parsed = archiveSourceDefinitionInputSchema.parse(input);
  const { db, workspace, actor } = await getDemoContext();
  const [current] = await db
    .select()
    .from(sourceDefinitions)
    .where(
      and(
        eq(sourceDefinitions.id, parsed.sourceId),
        eq(sourceDefinitions.workspaceId, workspace.id),
        isNull(sourceDefinitions.archivedAt)
      )
    )
    .limit(1);

  if (!current) {
    throw new Error("Source was not found");
  }

  if (current.presetKey) {
    throw new Error("Preset sources can be disabled but not archived");
  }

  const archivedAt = new Date();
  const [updated] = await db
    .update(sourceDefinitions)
    .set({ archivedAt, isActive: false, updatedAt: archivedAt })
    .where(eq(sourceDefinitions.id, current.id))
    .returning();

  await db.insert(leadEvents).values({
    workspaceId: workspace.id,
    actorUserId: actor?.id,
    targetType: "source_definition",
    targetId: current.id,
    action: "source_definition.archived",
    summary: `Archived source ${current.label}.`,
    before: { archivedAt: current.archivedAt, isActive: current.isActive },
    after: { archivedAt: archivedAt.toISOString(), isActive: false }
  });

  return updated;
}

export function getSourceLabel(
  source: string,
  definitions: SourceDefinitionItem[] | SourceOption[]
) {
  return (
    definitions.find((definition) => getSourceValue(definition) === source)
      ?.label ?? humanizeSource(source)
  );
}

export function humanizeSource(source: string) {
  return source
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getNextActiveSortOrder(workspaceId: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: max(sourceDefinitions.sortOrder) })
    .from(sourceDefinitions)
    .where(
      and(
        eq(sourceDefinitions.workspaceId, workspaceId),
        eq(sourceDefinitions.isActive, true),
        isNull(sourceDefinitions.archivedAt)
      )
    );

  return (row?.value ?? 0) + 10;
}

async function getAvailableSourceSlug(workspaceId: string, baseSlug: string) {
  const db = getDb();
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: sourceDefinitions.id })
      .from(sourceDefinitions)
      .where(
        and(
          eq(sourceDefinitions.workspaceId, workspaceId),
          eq(sourceDefinitions.slug, slug)
        )
      )
      .limit(1);

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function getSourceValue(definition: SourceDefinitionItem | SourceOption) {
  return "value" in definition ? definition.value : definition.slug;
}

function toSourceSlug(label: string) {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "source";
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

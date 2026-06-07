import { asc, isNull } from "drizzle-orm";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import {
  CustomFieldDefinitionsPanel,
  type CustomFieldDefinitionItem
} from "@/components/leads/custom-field-definitions-panel";
import { SourceDefinitionsPanel } from "@/components/leads/source-definitions-panel";
import { isAssistantRuntimeConfigured } from "@/lib/assistant/config";
import { getDb } from "@/lib/db";
import { customFieldDefinitions } from "@/lib/db/schema";
import { getWorkspaceSourceDefinitions } from "@/lib/domain/sources/manage-sources";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ section?: string }>;
};

type SettingsSection = "custom-fields" | "sources";

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const assistantEnabled = isAssistantRuntimeConfigured();
  const activeSection = parseSettingsSection(params.section);
  const [definitions, sources] = await Promise.all([
    getCustomFieldDefinitions(),
    getWorkspaceSourceDefinitions()
  ]);

  return (
    <AppShell
      activeSection="settings"
      assistantContext={{
        page: "settings",
        activeSettingsSection: activeSection,
        customFieldCount: definitions.length,
        sourceCount: sources.length,
        activeSourceSlugs: sources
          .filter((source) => source.isActive && !source.archivedAt)
          .map((source) => source.slug),
        archivedSourceSlugs: sources
          .filter((source) => Boolean(source.archivedAt))
          .map((source) => source.slug)
      }}
      assistantEnabled={assistantEnabled}
      eyebrow="Workspace settings"
      eyebrowIcon={<Settings2 className="size-4" />}
      title="Settings"
    >
      <section className="ops-page-stack">
        <div className="ops-settings-layout">
          <nav className="ops-settings-nav" aria-label="Settings sections">
            <SettingsLink
              active={activeSection === "custom-fields"}
              href="/settings?section=custom-fields"
              label="Custom fields"
            />
            <SettingsLink
              active={activeSection === "sources"}
              href="/settings?section=sources"
              label="Sources"
            />
          </nav>

          {activeSection === "custom-fields" ? (
            <SettingsPanel
              title="Custom fields"
              description="Configure reusable fields for lead-specific values."
            >
              <CustomFieldDefinitionsPanel definitions={definitions} />
            </SettingsPanel>
          ) : (
            <SettingsPanel
              title="Sources"
              description="Choose active lead sources and manage custom source labels."
            >
              <SourceDefinitionsPanel sources={sources} />
            </SettingsPanel>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function SettingsLink({
  active,
  href,
  label
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(active ? "is-active" : "")}
      href={href}
    >
      {label}
    </Link>
  );
}

function SettingsPanel({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="ops-panel">
      <div className="ops-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function parseSettingsSection(value: string | undefined): SettingsSection {
  return value === "sources" ? "sources" : "custom-fields";
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

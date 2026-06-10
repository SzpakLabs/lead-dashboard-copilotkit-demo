import { asc, isNull } from "drizzle-orm";
import { Info, Settings2, ShieldCheck, Tags, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyDatabasePage } from "@/components/dashboard/database-states";
import {
  CustomFieldDefinitionsPanel,
  type CustomFieldDefinitionItem
} from "@/components/leads/custom-field-definitions-panel";
import { SourceDefinitionsPanel } from "@/components/leads/source-definitions-panel";
import { SettingsAboutPanel } from "@/components/settings/settings-about-panel";
import { SettingsHelpPanel } from "@/components/settings/settings-help-panel";
import {
  SettingsSectionNav,
  type SettingsSection
} from "@/components/settings/settings-section-nav";
import { WorkspaceSettingsPanel } from "@/components/settings/workspace-settings-panel";
import {
  getAssistantRuntimeReadiness,
  isAssistantRuntimeConfigured
} from "@/lib/assistant/config";
import { isEmptyDatabaseError } from "@/lib/db/bootstrap-state";
import { getDb } from "@/lib/db";
import { customFieldDefinitions } from "@/lib/db/schema";
import { getWorkspaceSourceDefinitions } from "@/lib/domain/sources/manage-sources";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ section?: string }>;
};

type AssistantReadinessView = {
  enabled: boolean;
  model: string;
  provider: string;
  providerKeyName: string;
  reason: string | null;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const result = await loadSettingsPage(searchParams);

  if (!result.ok) {
    return (
      <EmptyDatabasePage
        activeSection="settings"
        reason={result.reason}
        title="Settings"
      />
    );
  }

  return <SettingsPageView {...result.data} />;
}

async function loadSettingsPage(searchParams: PageProps["searchParams"]) {
  try {
    const params = await searchParams;
    const assistantEnabled = isAssistantRuntimeConfigured();
    const assistantReadiness = getAssistantRuntimeReadiness();
    const activeSection = parseSettingsSection(params.section);
    const [definitions, sources] = await Promise.all([
      getCustomFieldDefinitions(),
      getWorkspaceSourceDefinitions()
    ]);

    return {
      ok: true as const,
      data: {
        activeSection,
        assistantEnabled,
        assistantReadiness: {
          enabled: assistantReadiness.enabled,
          model: assistantReadiness.model,
          provider: assistantReadiness.provider,
          providerKeyName: assistantReadiness.providerKeyName,
          reason: assistantReadiness.enabled ? null : assistantReadiness.reason
        },
        definitions,
        sources
      }
    };
  } catch (error) {
    if (isEmptyDatabaseError(error)) {
      return {
        ok: false as const,
        reason:
          error instanceof Error
            ? error.message
            : "The demo workspace and seed records are missing."
      };
    }

    throw error;
  }
}

function SettingsPageView({
  activeSection,
  assistantEnabled,
  assistantReadiness,
  definitions,
  sources
}: {
  activeSection: SettingsSection;
  assistantEnabled: boolean;
  assistantReadiness: AssistantReadinessView;
  definitions: CustomFieldDefinitionItem[];
  sources: Awaited<ReturnType<typeof getWorkspaceSourceDefinitions>>;
}) {
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
          <SettingsSectionNav activeSection={activeSection} />
          <div className="settings-section-stack">
            {renderSettingsSection({
              activeSection,
              assistantEnabled,
              assistantReadiness,
              definitions,
              sources
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function renderSettingsSection({
  activeSection,
  assistantEnabled,
  assistantReadiness,
  definitions,
  sources
}: {
  activeSection: SettingsSection;
  assistantEnabled: boolean;
  assistantReadiness: AssistantReadinessView;
  definitions: CustomFieldDefinitionItem[];
  sources: Awaited<ReturnType<typeof getWorkspaceSourceDefinitions>>;
}) {
  if (activeSection === "workspace") {
    return (
      <>
        <SettingsPanel
          title="Workspace"
          description="Keep these demo-safe preferences in this browser only. They do not change shared database records or deployment settings."
          icon={<Wrench className="size-4" />}
        >
          <WorkspaceSettingsPanel assistantReadiness={assistantReadiness} />
        </SettingsPanel>
        <SettingsPanel
          title="Custom fields"
          description="Configure reusable lead metadata for this demo workspace without leaving the shared settings hub."
          icon={<Tags className="size-4" />}
        >
          <CustomFieldDefinitionsPanel definitions={definitions} />
        </SettingsPanel>
      </>
    );
  }

  if (activeSection === "sources") {
    return (
      <SettingsPanel
        title="Sources"
        description="These source labels support manual and demo intake context. They do not prove live LinkedIn, WhatsApp, phone, or other channel integrations."
        icon={<Tags className="size-4" />}
      >
        <div className="settings-callout">
          <p>
            Keep the source list honest: use it to label where a lead came from
            in the workflow, not to imply that this portfolio demo is already
            connected to every channel shown here.
          </p>
        </div>
        <SourceDefinitionsPanel sources={sources} />
      </SettingsPanel>
    );
  }

  if (activeSection === "help") {
    return (
      <SettingsPanel
        title="Help"
        description="Explain the workflow in business terms first, then point reviewers to what is real, optional, and deferred."
        icon={<Info className="size-4" />}
      >
        <SettingsHelpPanel assistantEnabled={assistantEnabled} />
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="About"
      description="Public release notes, portfolio links, and safe developer metadata for the live demo."
      icon={<ShieldCheck className="size-4" />}
    >
      <SettingsAboutPanel />
    </SettingsPanel>
  );
}

function SettingsPanel({
  children,
  description,
  icon,
  title
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="ops-panel">
      <div className="ops-panel-heading">
        <div>
          <h2 className="settings-panel-title">
            {icon}
            <span>{title}</span>
          </h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function parseSettingsSection(value: string | undefined): SettingsSection {
  switch (value) {
    case "sources":
    case "help":
    case "about":
      return value;
    default:
      return "workspace";
  }
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

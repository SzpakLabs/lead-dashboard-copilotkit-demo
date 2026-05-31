"use client";

import {
  ClipboardCheck,
  Clock3,
  DatabaseZap,
  Eye,
  History,
  Settings2,
  Tags
} from "lucide-react";
import Link from "next/link";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  ActivityList,
  AssistantPreviewNote,
  DetailSection,
  Field
} from "@/components/dashboard/lead-ui";
import type { ActivityListItem } from "@/components/dashboard/lead-ui";
import type { CustomFieldDefinitionItem } from "@/components/leads/custom-field-definitions-panel";
import {
  CustomFieldValuesForm,
  type CustomFieldValueItem
} from "@/components/leads/custom-field-values-form";
import {
  FollowUpsPanel,
  type FollowUpListItem
} from "@/components/leads/follow-ups-panel";
import { LeadDetailForm } from "@/components/leads/lead-detail-form";
import { LeadStatusForm } from "@/components/leads/lead-status-form";
import { formatDateTime } from "@/lib/date-format";
import type { LeadStatus } from "@/lib/domain/leads/status";
import { cn } from "@/lib/utils";

type LeadDetailTabsProps = {
  activity: ActivityListItem[];
  customFieldDefinitions: CustomFieldDefinitionItem[];
  customFieldValues: CustomFieldValueItem[];
  detail: LeadDetailTabsDetail;
  followUps: FollowUpListItem[];
};

type LeadDetailTabsDetail = {
  id: string;
  title: string;
  status: LeadStatus;
  source: string;
  projectType: string | null;
  problemSummary: string | null;
  requestedOutcome: string | null;
  budgetRange: string | null;
  timeline: string | null;
  nextStep: string | null;
  createdAt: Date;
  contactName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  sourceType: string | null;
  sourceChannel: string | null;
  rawText: string | null;
  ingestedAt: Date | null;
  missingFields: string[];
  confidence: string;
};

type LeadDetailTabId =
  | "overview"
  | "review"
  | "follow-ups"
  | "source"
  | "activity"
  | "custom-fields"
  | "full-view";

const tabs: Array<{
  id: LeadDetailTabId;
  label: string;
  icon: ReactNode;
}> = [
  { id: "overview", label: "Overview", icon: <ClipboardCheck /> },
  { id: "review", label: "Review", icon: <Eye /> },
  { id: "follow-ups", label: "Follow-ups", icon: <Clock3 /> },
  { id: "source", label: "Source", icon: <DatabaseZap /> },
  { id: "activity", label: "Activity", icon: <History /> },
  { id: "custom-fields", label: "Custom fields", icon: <Tags /> },
  { id: "full-view", label: "Full view", icon: <ClipboardCheck /> }
];

const tabAliases: Record<string, LeadDetailTabId> = {
  actions: "follow-ups",
  "custom-fields": "custom-fields",
  "follow-ups": "follow-ups",
  status: "follow-ups"
};

export function LeadDetailTabs({
  activity,
  customFieldDefinitions,
  customFieldValues,
  detail,
  followUps
}: LeadDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<LeadDetailTabId>("overview");
  const customFieldValueMap = useMemo(
    () =>
      new Map(
        customFieldValues.map((value) => [value.definitionId, value.value])
      ),
    [customFieldValues]
  );

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace("#", "");
      const nextTab = normalizeTabId(hash);

      if (nextTab) {
        setActiveTab(nextTab);
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function selectTab(tabId: LeadDetailTabId) {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    tabId: LeadDetailTabId
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    selectTab(nextTab.id);
    document.getElementById(getTabButtonId(nextTab.id))?.focus();
  }

  return (
    <section className="ops-lead-tabs" aria-label="Lead detail sections">
      <div className="ops-lead-tab-list" role="tablist" aria-label="Lead tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              aria-controls={getTabPanelId(tab.id)}
              aria-selected={isActive}
              className={cn(isActive ? "is-active" : "")}
              id={getTabButtonId(tab.id)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <TabPanel activeTab={activeTab} tabId="overview">
        <DetailSection
          icon={ClipboardCheck}
          title="Overview"
          description="Edit contact, scope, qualification, source, and next action fields."
        >
          <LeadDetailForm
            key={`detail-${detail.id}`}
            lead={{
              id: detail.id,
              title: detail.title,
              source: detail.source,
              contactName: detail.contactName,
              company: detail.company ?? "",
              email: detail.email ?? "",
              phone: detail.phone ?? "",
              projectType: detail.projectType ?? "",
              problemSummary: detail.problemSummary ?? "",
              requestedOutcome: detail.requestedOutcome ?? "",
              budgetRange: detail.budgetRange ?? "",
              timeline: detail.timeline ?? "",
              nextStep: detail.nextStep ?? ""
            }}
          />
        </DetailSection>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="review">
        <DetailSection
          icon={Eye}
          title="Review"
          description="Inspect extraction confidence and missing fields before moving the lead forward."
        >
          <LeadReviewSummary detail={detail} />
          <AssistantPreviewNote />
        </DetailSection>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="follow-ups">
        <DetailSection
          icon={Clock3}
          title="Follow-ups"
          description="Keep lifecycle state and follow-up commitments current."
        >
          <div className="space-y-5">
            <LeadStatusForm
              key={`status-${detail.id}`}
              leadId={detail.id}
              status={detail.status}
            />
            <FollowUpsPanel
              key={`followups-${detail.id}`}
              leadId={detail.id}
              followUps={followUps}
            />
          </div>
        </DetailSection>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="source">
        <DetailSection
          icon={DatabaseZap}
          title="Source"
          description="Read-only source artifact and source metadata behind this lead."
        >
          <SourceSnapshot detail={detail} />
        </DetailSection>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="activity">
        <DetailSection
          icon={History}
          title="Activity"
          description="Audited lead, status, follow-up, and assistant changes."
        >
          <ActivityList activity={activity} />
        </DetailSection>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="custom-fields">
        <DetailSection
          icon={Tags}
          title="Custom fields"
          description="Edit lead-specific workspace fields."
          action={
            <Link href="/settings/fields">
              <Settings2 className="size-4" />
              Manage
            </Link>
          }
        >
          <CustomFieldValuesForm
            key={`custom-fields-${detail.id}`}
            leadId={detail.id}
            definitions={customFieldDefinitions}
            values={customFieldValues}
          />
        </DetailSection>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="full-view">
        <DetailSection
          icon={ClipboardCheck}
          title="Full view"
          description="Read-only populated lead snapshot."
        >
          <FullView
            activity={activity}
            customFieldDefinitions={customFieldDefinitions}
            customFieldValueMap={customFieldValueMap}
            detail={detail}
            followUps={followUps}
          />
        </DetailSection>
      </TabPanel>
    </section>
  );
}

function TabPanel({
  activeTab,
  children,
  tabId
}: {
  activeTab: LeadDetailTabId;
  children: ReactNode;
  tabId: LeadDetailTabId;
}) {
  return (
    <div
      aria-labelledby={getTabButtonId(tabId)}
      className="ops-lead-tab-panel"
      hidden={activeTab !== tabId}
      id={getTabPanelId(tabId)}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

function LeadReviewSummary({ detail }: { detail: LeadDetailTabsDetail }) {
  const missingFields = detail.missingFields;

  return (
    <div className="ops-review-surface" aria-label="Review summary">
      <div className="ops-review-status">
        <div>
          <p className="ops-eyebrow">Extraction review</p>
          <h4>{missingFields.length > 0 ? "Needs confirmation" : "Ready"}</h4>
        </div>
        {missingFields.length > 0 ? (
          <span className="ops-review-badge ops-review-warning">
            {missingFields.length} missing
          </span>
        ) : (
          <span className="ops-review-badge">
            {detail.confidence} confidence
          </span>
        )}
      </div>
      {missingFields.length > 0 ? (
        <div className="ops-missing-fields">
          {missingFields.map((field) => (
            <span key={field}>{formatMissingField(field)}</span>
          ))}
        </div>
      ) : (
        <p className="ops-review-copy">
          Core extracted fields are present. Verify the details before moving
          the lead out of review.
        </p>
      )}
      <div className="ops-review-grid">
        <Field label="Contact" value={detail.contactName} />
        <Field label="Company" value={detail.company} />
        <Field label="Project type" value={detail.projectType} />
        <Field label="Budget" value={detail.budgetRange} />
        <Field label="Timeline" value={detail.timeline} />
        <Field label="Next step" value={detail.nextStep} />
      </div>
    </div>
  );
}

function SourceSnapshot({ detail }: { detail: LeadDetailTabsDetail }) {
  return (
    <div className="space-y-3">
      <div className="ops-review-grid">
        <Field label="Channel" value={detail.sourceChannel ?? detail.source} />
        <Field
          label="Source type"
          value={detail.sourceType?.replace("_", " ") ?? null}
        />
        <Field
          label="Captured"
          value={formatNullableDateTime(detail.ingestedAt)}
        />
        <Field label="Lead source" value={detail.source} />
      </div>
      <div className="ops-source-copy">
        {detail.rawText ?? "No source artifact is linked."}
      </div>
    </div>
  );
}

function FullView({
  activity,
  customFieldDefinitions,
  customFieldValueMap,
  detail,
  followUps
}: {
  activity: ActivityListItem[];
  customFieldDefinitions: CustomFieldDefinitionItem[];
  customFieldValueMap: Map<string, string>;
  detail: LeadDetailTabsDetail;
  followUps: FollowUpListItem[];
}) {
  const leadFields = [
    ["Title", detail.title],
    ["Status", detail.status],
    ["Source", detail.source],
    ["Created", formatDateTime(detail.createdAt)],
    ["Contact", detail.contactName],
    ["Company", detail.company],
    ["Email", detail.email],
    ["Phone", detail.phone],
    ["Project type", detail.projectType],
    ["Budget", detail.budgetRange],
    ["Timeline", detail.timeline],
    ["Next step", detail.nextStep],
    ["Problem summary", detail.problemSummary],
    ["Requested outcome", detail.requestedOutcome]
  ] as const;
  const sourceFields = [
    ["Channel", detail.sourceChannel ?? detail.source],
    ["Source type", detail.sourceType?.replace("_", " ")],
    ["Captured", detail.ingestedAt ? formatDateTime(detail.ingestedAt) : null]
  ] as const;
  const populatedCustomFields = customFieldDefinitions
    .map((definition) => ({
      label: definition.label,
      value: formatCustomFieldValue(
        definition.fieldType,
        customFieldValueMap.get(definition.id)
      )
    }))
    .filter((field) => hasValue(field.value));

  return (
    <div className="ops-full-view">
      <ReadOnlyGroup title="Lead" fields={leadFields} />
      <ReadOnlyGroup title="Source" fields={sourceFields} />

      {populatedCustomFields.length > 0 ? (
        <section aria-labelledby="full-view-custom-fields">
          <h3 id="full-view-custom-fields">Custom fields</h3>
          <div className="ops-full-view-grid">
            {populatedCustomFields.map((field) => (
              <ReadOnlyField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </div>
        </section>
      ) : null}

      {followUps.length > 0 ? (
        <section aria-labelledby="full-view-follow-ups">
          <h3 id="full-view-follow-ups">Follow-ups</h3>
          <ol className="ops-full-view-list">
            {followUps.map((followUp) => (
              <li key={followUp.id}>
                <strong>{formatDateTime(followUp.followUpDueAt)}</strong>
                <span>{followUp.status}</span>
                <p>{followUp.note}</p>
                {followUp.completedAt ? (
                  <p>Completed {formatDateTime(followUp.completedAt)}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {detail.rawText ? (
        <section aria-labelledby="full-view-artifact">
          <h3 id="full-view-artifact">Source artifact</h3>
          <div className="ops-source-copy">{detail.rawText}</div>
        </section>
      ) : null}

      {activity.length > 0 ? (
        <section aria-labelledby="full-view-activity">
          <h3 id="full-view-activity">Activity</h3>
          <ActivityList activity={activity} />
        </section>
      ) : null}
    </div>
  );
}

function ReadOnlyGroup({
  fields,
  title
}: {
  fields: ReadonlyArray<readonly [string, string | null | undefined]>;
  title: string;
}) {
  const populatedFields = fields.filter(([, value]) => hasValue(value));

  if (populatedFields.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={`full-view-${title.toLowerCase()}`}>
      <h3 id={`full-view-${title.toLowerCase()}`}>{title}</h3>
      <div className="ops-full-view-grid">
        {populatedFields.map(([label, value]) => (
          <ReadOnlyField key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function ReadOnlyField({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="ops-fact">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6">{value}</p>
    </div>
  );
}

function formatCustomFieldValue(
  fieldType: CustomFieldDefinitionItem["fieldType"],
  value: string | undefined
) {
  if (!hasValue(value)) {
    return null;
  }

  if (fieldType === "boolean") {
    return value === "true" ? "Yes" : value === "false" ? "No" : value;
  }

  return value;
}

function normalizeTabId(hash: string): LeadDetailTabId | null {
  if (!hash) {
    return null;
  }

  const knownTab = tabs.find((tab) => tab.id === hash);

  return knownTab?.id ?? tabAliases[hash] ?? null;
}

function getTabButtonId(tabId: LeadDetailTabId) {
  return `lead-tab-${tabId}`;
}

function getTabPanelId(tabId: LeadDetailTabId) {
  return `lead-tab-panel-${tabId}`;
}

function formatNullableDateTime(value: Date | null) {
  return value ? formatDateTime(value) : "Missing";
}

function formatMissingField(field: string) {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase();
}

function hasValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

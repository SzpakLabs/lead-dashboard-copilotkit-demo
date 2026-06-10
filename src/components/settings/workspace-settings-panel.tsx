"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  readWorkspacePreferences,
  serializeWorkspacePreferences,
  workspaceDefaults,
  workspacePreferencesStorageKey,
  type WorkspacePreferences
} from "@/lib/settings/workspace-preferences";

type AssistantReadiness = {
  enabled: boolean;
  model: string;
  provider: string;
  providerKeyName: string;
  reason: string | null;
};

const defaultSnapshot = JSON.stringify(workspaceDefaults);

export function WorkspaceSettingsPanel({
  assistantReadiness
}: {
  assistantReadiness: AssistantReadiness;
}) {
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const snapshot = useSyncExternalStore(
    subscribeToWorkspacePreferences,
    getWorkspacePreferencesSnapshot,
    getServerWorkspacePreferencesSnapshot
  );
  const preferences = readWorkspacePreferences(snapshot);

  function updatePreference<Key extends keyof WorkspacePreferences>(
    key: Key,
    value: WorkspacePreferences[Key]
  ) {
    setResetNotice(null);
    persistWorkspacePreferences({
      ...preferences,
      [key]: value
    });
  }

  function resetPreferences() {
    window.localStorage.removeItem(workspacePreferencesStorageKey);
    window.dispatchEvent(new Event("leadops-workspace-preferences-change"));
    setResetNotice("Reset to demo defaults for this browser.");
  }

  return (
    <div className="settings-editor-stack">
      <form className="settings-form-grid">
        <label className="settings-field">
          <span>Workspace name</span>
          <Input
            value={preferences.workspaceName}
            onChange={(event) =>
              updatePreference("workspaceName", event.target.value)
            }
          />
        </label>

        <label className="settings-field">
          <span>Business type</span>
          <select
            className="settings-select"
            value={preferences.businessType}
            onChange={(event) =>
              updatePreference(
                "businessType",
                event.target.value as WorkspacePreferences["businessType"]
              )
            }
          >
            <option value="software-services">Software services</option>
            <option value="laptop-repair">Laptop repair</option>
            <option value="beauty-studio">Beauty studio</option>
            <option value="general-service">General service</option>
          </select>
        </label>

        <label className="settings-field">
          <span>Timezone</span>
          <Input
            value={preferences.timezone}
            onChange={(event) =>
              updatePreference("timezone", event.target.value)
            }
          />
        </label>

        <label className="settings-field">
          <span>Currency</span>
          <select
            className="settings-select"
            value={preferences.currency}
            onChange={(event) =>
              updatePreference(
                "currency",
                event.target.value as WorkspacePreferences["currency"]
              )
            }
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="PLN">PLN</option>
          </select>
        </label>

        <label className="settings-field">
          <span>Demo label</span>
          <Input
            value={preferences.demoModeLabel}
            onChange={(event) =>
              updatePreference("demoModeLabel", event.target.value)
            }
          />
        </label>

        <label className="settings-field">
          <span>Calendar week starts</span>
          <select
            className="settings-select"
            value={preferences.calendarWeekStartsOn}
            onChange={(event) =>
              updatePreference(
                "calendarWeekStartsOn",
                event.target
                  .value as WorkspacePreferences["calendarWeekStartsOn"]
              )
            }
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </label>

        <label className="settings-field">
          <span>Working hours start</span>
          <Input
            type="time"
            value={preferences.workingHoursStart}
            onChange={(event) =>
              updatePreference("workingHoursStart", event.target.value)
            }
          />
        </label>

        <label className="settings-field">
          <span>Working hours end</span>
          <Input
            type="time"
            value={preferences.workingHoursEnd}
            onChange={(event) =>
              updatePreference("workingHoursEnd", event.target.value)
            }
          />
        </label>

        <label className="settings-field">
          <span>Default follow-up window</span>
          <Input
            type="number"
            min={1}
            max={30}
            value={preferences.defaultFollowUpDays}
            onChange={(event) =>
              updatePreference(
                "defaultFollowUpDays",
                clampNumber(event.target.value, 1, 30)
              )
            }
          />
        </label>

        <label className="settings-field">
          <span>Reminder lead time</span>
          <Input
            type="number"
            min={1}
            max={72}
            value={preferences.reminderLeadHours}
            onChange={(event) =>
              updatePreference(
                "reminderLeadHours",
                clampNumber(event.target.value, 1, 72)
              )
            }
          />
        </label>
      </form>

      <div className="settings-inline-actions">
        <p className="settings-note">
          Saved in browser-local storage only. These values help present the
          demo but do not edit shared seeded leads, sources, or deployment
          secrets.
        </p>
        <Button type="button" variant="outline" onClick={resetPreferences}>
          Reset to demo defaults
        </Button>
      </div>

      {resetNotice ? <p className="settings-feedback">{resetNotice}</p> : null}

      <div className="settings-status-grid">
        <div className="settings-faq-card">
          <strong>Assistant runtime</strong>
          <p>
            {assistantReadiness.enabled
              ? "Configured for this environment."
              : "Optional and currently off or missing provider credentials."}
          </p>
          <ul className="settings-detail-list">
            <li>
              <span>Provider</span>
              <strong>{assistantReadiness.provider}</strong>
            </li>
            <li>
              <span>Model</span>
              <strong>{assistantReadiness.model}</strong>
            </li>
            <li>
              <span>Expected key</span>
              <strong>{assistantReadiness.providerKeyName}</strong>
            </li>
          </ul>
          {assistantReadiness.reason ? (
            <p>{assistantReadiness.reason}</p>
          ) : (
            <p>
              Browser settings here do not control API keys or deployment-time
              provider configuration.
            </p>
          )}
        </div>

        <div className="settings-faq-card">
          <strong>Phase 4 boundary</strong>
          <p>
            This section stays intentionally light: browser-local workspace
            defaults, source labels, and honest demo framing. It does not add
            auth, billing, production admin, or real channel integrations.
          </p>
        </div>
      </div>
    </div>
  );
}

function persistWorkspacePreferences(preferences: WorkspacePreferences) {
  window.localStorage.setItem(
    workspacePreferencesStorageKey,
    serializeWorkspacePreferences(preferences)
  );
  window.dispatchEvent(new Event("leadops-workspace-preferences-change"));
}

function subscribeToWorkspacePreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("leadops-workspace-preferences-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(
      "leadops-workspace-preferences-change",
      callback
    );
  };
}

function getWorkspacePreferencesSnapshot() {
  return (
    window.localStorage.getItem(workspacePreferencesStorageKey) ??
    defaultSnapshot
  );
}

function getServerWorkspacePreferencesSnapshot() {
  return defaultSnapshot;
}

function clampNumber(value: string, min: number, max: number) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return min;
  }

  return Math.min(Math.max(parsed, min), max);
}

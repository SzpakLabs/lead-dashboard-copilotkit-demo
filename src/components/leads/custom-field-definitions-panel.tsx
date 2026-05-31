"use client";

import {
  Archive,
  Braces,
  Calendar,
  Check,
  ChevronDown,
  Hash,
  Loader2,
  ToggleLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CustomFieldDefinitionItem = {
  id: string;
  label: string;
  fieldType: "text" | "number" | "boolean" | "date";
};

type CustomFieldDefinitionsPanelProps = {
  definitions: CustomFieldDefinitionItem[];
};

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const fieldTypes = ["text", "number", "boolean", "date"] as const;
const AUTOSAVE_DELAY = 2000;

export function CustomFieldDefinitionsPanel({
  definitions
}: CustomFieldDefinitionsPanelProps) {
  const router = useRouter();
  const newLabelId = useId();
  const newTypeId = useId();
  const messageId = useId();
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] =
    useState<CustomFieldDefinitionItem["fieldType"]>("text");
  const [drafts, setDrafts] = useState<
    Record<string, Partial<CustomFieldDefinitionItem>>
  >({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const draftDefinitions = useMemo(
    () =>
      definitions.map((definition) => ({
        ...definition,
        ...drafts[definition.id]
      })),
    [definitions, drafts]
  );

  function updateDraft(
    id: string,
    field: keyof CustomFieldDefinitionItem,
    value: string
  ) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value
      }
    }));
    markDirty(id);
  }

  function markDirty(id: string) {
    setDirtyIds((current) => new Set(current).add(id));
    setSaveStates((current) => ({ ...current, [id]: "dirty" }));
  }

  function createField() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, fieldType: newType })
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setNewLabel("");
      setNewType("text");
      setMessage("Custom field created.");
      router.refresh();
    });
  }

  async function saveFieldDraft(draft: CustomFieldDefinitionItem) {
    if (!draft.label.trim()) {
      setSaveStates((current) => ({ ...current, [draft.id]: "error" }));
      setMessage("Custom field label is required.");
      return;
    }

    setSaveStates((current) => ({ ...current, [draft.id]: "saving" }));
    const response = await fetch(`/api/custom-fields/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: draft.label,
        fieldType: draft.fieldType
      })
    });

    if (!response.ok) {
      setSaveStates((current) => ({ ...current, [draft.id]: "error" }));
      setMessage(await readError(response));
      return;
    }

    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(draft.id);
      return next;
    });
    setSaveStates((current) => ({ ...current, [draft.id]: "saved" }));
    setMessage(null);
  }

  useEffect(() => {
    if (dirtyIds.size === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      dirtyIds.forEach((id) => {
        const draft = draftDefinitions.find(
          (definition) => definition.id === id
        );

        if (draft) {
          void saveFieldDraft(draft);
        }
      });
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeout);
  }, [dirtyIds, draftDefinitions]);

  function archiveField(id: string) {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/custom-fields/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setMessage("Custom field archived.");
      router.refresh();
    });
  }

  return (
    <div className="settings-editor-stack">
      <form
        className="settings-create-row settings-create-row-fields"
        aria-describedby={message ? messageId : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          createField();
        }}
      >
        <Input
          id={newLabelId}
          name="label"
          placeholder="Add custom field"
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
        />
        <FieldTypeSelect
          id={newTypeId}
          name="fieldType"
          value={newType}
          onChange={setNewType}
        />
        <Button type="submit" disabled={isPending || !newLabel.trim()}>
          Add
        </Button>
      </form>

      {draftDefinitions.length > 0 ? (
        <div className="settings-list">
          {draftDefinitions.map((definition) => (
            <div key={definition.id} className="settings-item-row">
              <FieldTypeIcon fieldType={definition.fieldType} />
              <div className="settings-item-main">
                <Input
                  aria-label={`${definition.label} label`}
                  placeholder="Field label"
                  value={definition.label}
                  onChange={(event) =>
                    updateDraft(definition.id, "label", event.target.value)
                  }
                />
                <div className="settings-item-meta">
                  <span>{definition.fieldType}</span>
                  <SaveStateText state={saveStates[definition.id] ?? "idle"} />
                </div>
              </div>
              <FieldTypeSelect
                id={`custom-field-type-${definition.id}`}
                name={`fieldType-${definition.id}`}
                value={definition.fieldType}
                onChange={(value) =>
                  updateDraft(definition.id, "fieldType", value)
                }
                compact
              />
              <button
                aria-label="Archive custom field"
                className="settings-icon-action"
                disabled={isPending}
                type="button"
                onClick={() => archiveField(definition.id)}
              >
                <Archive className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="settings-empty-state">Add custom field</div>
      )}

      {message ? (
        <p
          aria-live="polite"
          className="text-sm text-muted-foreground"
          id={messageId}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function FieldTypeSelect({
  compact = false,
  id,
  name,
  value,
  onChange
}: {
  compact?: boolean;
  id: string;
  name: string;
  value: CustomFieldDefinitionItem["fieldType"];
  onChange: (value: CustomFieldDefinitionItem["fieldType"]) => void;
}) {
  const [open, setOpen] = useState(false);

  function selectType(nextValue: CustomFieldDefinitionItem["fieldType"]) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    fieldType: CustomFieldDefinitionItem["fieldType"]
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectType(fieldType);
    }
  }

  return (
    <div
      className={cn("settings-type-picker", compact && "is-compact")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <input type="hidden" id={id} name={name} value={value} />
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="settings-type-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <FieldTypeGlyph fieldType={value} />
        <span>{value}</span>
        <ChevronDown className="size-4" />
      </button>
      {open ? (
        <div className="settings-type-menu" role="listbox">
          {fieldTypes.map((fieldType) => (
            <button
              aria-selected={fieldType === value}
              className="settings-type-option"
              key={fieldType}
              role="option"
              type="button"
              onClick={() => selectType(fieldType)}
              onKeyDown={(event) => handleKeyDown(event, fieldType)}
            >
              <FieldTypeGlyph fieldType={fieldType} />
              <span>{fieldType}</span>
              {fieldType === value ? <Check className="size-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldTypeIcon({
  fieldType
}: {
  fieldType: CustomFieldDefinitionItem["fieldType"];
}) {
  return (
    <div className="settings-field-icon" aria-hidden="true">
      <FieldTypeGlyph fieldType={fieldType} />
    </div>
  );
}

function FieldTypeGlyph({
  fieldType
}: {
  fieldType: CustomFieldDefinitionItem["fieldType"];
}) {
  const Icon =
    fieldType === "number"
      ? Hash
      : fieldType === "boolean"
        ? ToggleLeft
        : fieldType === "date"
          ? Calendar
          : Braces;

  return <Icon className="size-4" />;
}

function SaveStateText({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="settings-save-state">
        <Loader2 className="size-3 animate-spin" />
        Saving
      </span>
    );
  }

  if (state === "dirty") {
    return <span className="settings-save-state is-dirty">Unsaved</span>;
  }

  if (state === "saved") {
    return <span className="settings-save-state is-saved">Saved</span>;
  }

  if (state === "error") {
    return <span className="settings-save-state is-error">Needs label</span>;
  }

  return null;
}

async function readError(response: Response) {
  const body: unknown = await response.json().catch(() => null);

  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Custom field change failed.";
}

"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CustomFieldDefinitionItem = {
  id: string;
  label: string;
  fieldType: "text" | "number" | "boolean" | "date";
};

type CustomFieldDefinitionsPanelProps = {
  definitions: CustomFieldDefinitionItem[];
};

const fieldTypes = ["text", "number", "boolean", "date"] as const;

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
    Record<string, CustomFieldDefinitionItem>
  >(() =>
    Object.fromEntries(
      definitions.map((definition) => [definition.id, definition])
    )
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function saveField(id: string) {
    const draft = drafts[id];

    if (!draft) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/custom-fields/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: draft.label,
          fieldType: draft.fieldType
        })
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setMessage("Custom field updated.");
      router.refresh();
    });
  }

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
    <div className="space-y-4">
      <form
        className="grid gap-3"
        aria-describedby={message ? messageId : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          createField();
        }}
      >
        <div className="space-y-1 text-sm font-medium">
          <label htmlFor={newLabelId}>Label</label>
          <Input
            id={newLabelId}
            name="label"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
          />
        </div>
        <div className="space-y-1 text-sm font-medium">
          <label htmlFor={newTypeId}>Type</label>
          <FieldTypeSelect
            id={newTypeId}
            name="fieldType"
            value={newType}
            onChange={setNewType}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Add field
        </Button>
      </form>

      <div className="space-y-3">
        {definitions.map((definition) => {
          const draft = drafts[definition.id] ?? definition;

          return (
            <div
              key={definition.id}
              className="space-y-3 rounded-md border border-border bg-muted/30 p-3"
            >
              <label
                className="text-sm font-medium"
                htmlFor={`custom-field-label-${definition.id}`}
              >
                Label
              </label>
              <Input
                id={`custom-field-label-${definition.id}`}
                name={`label-${definition.id}`}
                value={draft.label}
                onChange={(event) =>
                  updateDraft(definition.id, "label", event.target.value)
                }
              />
              <label
                className="text-sm font-medium"
                htmlFor={`custom-field-type-${definition.id}`}
              >
                Type
              </label>
              <FieldTypeSelect
                id={`custom-field-type-${definition.id}`}
                name={`fieldType-${definition.id}`}
                value={draft.fieldType}
                onChange={(value) =>
                  updateDraft(definition.id, "fieldType", value)
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => saveField(definition.id)}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => archiveField(definition.id)}
                >
                  Archive
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {definitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom fields configured yet.
        </p>
      ) : null}

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
  id,
  name,
  value,
  onChange
}: {
  id: string;
  name: string;
  value: CustomFieldDefinitionItem["fieldType"];
  onChange: (value: CustomFieldDefinitionItem["fieldType"]) => void;
}) {
  return (
    <select
      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
      id={id}
      name={name}
      value={value}
      onChange={(event) =>
        onChange(event.target.value as CustomFieldDefinitionItem["fieldType"])
      }
    >
      {fieldTypes.map((fieldType) => (
        <option key={fieldType} value={fieldType}>
          {fieldType}
        </option>
      ))}
    </select>
  );
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

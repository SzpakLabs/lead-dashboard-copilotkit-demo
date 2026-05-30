"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomFieldDefinitionItem } from "./custom-field-definitions-panel";

export type CustomFieldValueItem = {
  definitionId: string;
  value: string;
};

type CustomFieldValuesFormProps = {
  leadId: string;
  definitions: CustomFieldDefinitionItem[];
  values: CustomFieldValueItem[];
};

export function CustomFieldValuesForm({
  leadId,
  definitions,
  values
}: CustomFieldValuesFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const valueMap = new Map(
      values.map((value) => [value.definitionId, value.value])
    );

    return Object.fromEntries(
      definitions.map((definition) => [
        definition.id,
        valueMap.get(definition.id) ?? ""
      ])
    );
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateValue(definitionId: string, value: string) {
    setForm((current) => ({ ...current, [definitionId]: value }));
  }

  function saveValues() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/leads/${leadId}/custom-fields`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: form })
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setMessage("Custom fields saved.");
      router.refresh();
    });
  }

  if (definitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add custom field definitions to capture workspace-specific lead data.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        saveValues();
      }}
    >
      {definitions.map((definition) => (
        <CustomFieldInput
          key={definition.id}
          definition={definition}
          value={form[definition.id] ?? ""}
          onChange={(value) => updateValue(definition.id, value)}
        />
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save custom fields"}
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </form>
  );
}

function CustomFieldInput({
  definition,
  value,
  onChange
}: {
  definition: CustomFieldDefinitionItem;
  value: string;
  onChange: (value: string) => void;
}) {
  if (definition.fieldType === "boolean") {
    return (
      <label className="space-y-1 text-sm font-medium">
        {definition.label}
        <select
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Not set</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
    );
  }

  return (
    <label className="space-y-1 text-sm font-medium">
      {definition.label}
      <Input
        type={definition.fieldType === "date" ? "date" : definition.fieldType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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

  return "Custom field save failed.";
}

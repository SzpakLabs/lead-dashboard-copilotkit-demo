"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SourceOption } from "@/lib/domain/sources/manage-sources";

export type LeadDetailFormValue = {
  id: string;
  title: string;
  source: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  problemSummary: string;
  requestedOutcome: string;
  budgetRange: string;
  timeline: string;
  nextStep: string;
};

type LeadDetailFormProps = {
  lead: LeadDetailFormValue;
  sourceOptions: SourceOption[];
};

export function LeadDetailForm({ lead, sourceOptions }: LeadDetailFormProps) {
  const router = useRouter();
  const sourceId = useId();
  const messageId = useId();
  const [form, setForm] = useState(lead);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof LeadDetailFormValue, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveLead() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        setMessage("Could not save lead changes.");
        return;
      }

      setMessage("Lead changes saved.");
      router.refresh();
    });
  }

  return (
    <form
      className="space-y-5"
      aria-describedby={message ? messageId : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        saveLead();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Lead title"
          name="title"
          value={form.title}
          onChange={(value) => updateField("title", value)}
        />
        <div className="space-y-1 text-sm font-medium">
          <label htmlFor={sourceId}>Source</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            id={sourceId}
            name="source"
            value={form.source}
            onChange={(event) => updateField("source", event.target.value)}
          >
            {getSelectOptions(sourceOptions, lead.source).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Contact name"
          autoComplete="name"
          name="contactName"
          value={form.contactName}
          onChange={(value) => updateField("contactName", value)}
        />
        <TextField
          label="Company"
          autoComplete="organization"
          name="company"
          value={form.company}
          onChange={(value) => updateField("company", value)}
        />
        <TextField
          label="Email"
          autoComplete="email"
          inputMode="email"
          name="email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
        />
        <TextField
          label="Phone"
          autoComplete="tel"
          inputMode="tel"
          name="phone"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
        />
        <TextField
          label="Project type"
          name="projectType"
          value={form.projectType}
          onChange={(value) => updateField("projectType", value)}
        />
        <TextField
          label="Budget"
          name="budgetRange"
          value={form.budgetRange}
          onChange={(value) => updateField("budgetRange", value)}
        />
      </div>
      <TextAreaField
        label="Problem summary"
        name="problemSummary"
        value={form.problemSummary}
        onChange={(value) => updateField("problemSummary", value)}
      />
      <TextAreaField
        label="Requested outcome"
        name="requestedOutcome"
        value={form.requestedOutcome}
        onChange={(value) => updateField("requestedOutcome", value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Timeline"
          name="timeline"
          value={form.timeline}
          onChange={(value) => updateField("timeline", value)}
        />
        <TextField
          label="Next step"
          name="nextStep"
          value={form.nextStep}
          onChange={(value) => updateField("nextStep", value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save edits"}
        </Button>
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
    </form>
  );
}

function getSelectOptions(options: SourceOption[], currentSource: string) {
  if (options.some((option) => option.value === currentSource)) {
    return options;
  }

  return [
    ...options,
    {
      value: currentSource,
      label: `${currentSource} (inactive)`
    }
  ];
}

function TextField({
  autoComplete,
  inputMode,
  label,
  name,
  type,
  value,
  onChange
}: {
  autoComplete?: string;
  inputMode?: "email" | "tel";
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="space-y-1 text-sm font-medium">
      <label htmlFor={id}>{label}</label>
      <Input
        autoComplete={autoComplete}
        id={id}
        inputMode={inputMode}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="space-y-1 text-sm font-medium">
      <label htmlFor={id}>{label}</label>
      <textarea
        className="min-h-24 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

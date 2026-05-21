"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
};

export function LeadDetailForm({ lead }: LeadDetailFormProps) {
  const router = useRouter();
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
      onSubmit={(event) => {
        event.preventDefault();
        saveLead();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Lead title"
          value={form.title}
          onChange={(value) => updateField("title", value)}
        />
        <label className="space-y-1 text-sm font-medium">
          Source
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.source}
            onChange={(event) => updateField("source", event.target.value)}
          >
            <option value="linkedin">LinkedIn</option>
            <option value="upwork">Upwork</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </label>
        <TextField
          label="Contact name"
          value={form.contactName}
          onChange={(value) => updateField("contactName", value)}
        />
        <TextField
          label="Company"
          value={form.company}
          onChange={(value) => updateField("company", value)}
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
        />
        <TextField
          label="Phone"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
        />
        <TextField
          label="Project type"
          value={form.projectType}
          onChange={(value) => updateField("projectType", value)}
        />
        <TextField
          label="Budget"
          value={form.budgetRange}
          onChange={(value) => updateField("budgetRange", value)}
        />
      </div>
      <TextAreaField
        label="Problem summary"
        value={form.problemSummary}
        onChange={(value) => updateField("problemSummary", value)}
      />
      <TextAreaField
        label="Requested outcome"
        value={form.requestedOutcome}
        onChange={(value) => updateField("requestedOutcome", value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Timeline"
          value={form.timeline}
          onChange={(value) => updateField("timeline", value)}
        />
        <TextField
          label="Next step"
          value={form.nextStep}
          onChange={(value) => updateField("nextStep", value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save edits"}
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </form>
  );
}

function TextField({
  label,
  type,
  value,
  onChange
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm font-medium">
      {label}
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm font-medium">
      {label}
      <textarea
        className="min-h-24 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

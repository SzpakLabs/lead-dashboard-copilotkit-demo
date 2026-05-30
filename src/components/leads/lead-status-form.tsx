"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  allowedLeadStatusTransitions,
  getLeadStatusLabel,
  leadStatusOptions,
  type LeadStatus
} from "@/lib/domain/leads/status";

type LeadStatusFormProps = {
  leadId: string;
  status: LeadStatus;
};

export function LeadStatusForm({ leadId, status }: LeadStatusFormProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const allowedStatuses = [status, ...allowedLeadStatusTransitions[status]];

  function saveStatus() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus })
      });

      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const error =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not update status.";

        setMessage(error);
        return;
      }

      setMessage("Status updated.");
      router.refresh();
    });
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        saveStatus();
      }}
    >
      <label className="space-y-1 text-sm font-medium">
        Status
        <select
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.target.value as LeadStatus)
          }
        >
          {leadStatusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={!allowedStatuses.includes(option.value)}
            >
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || selectedStatus === status}
          size="sm"
        >
          {isPending ? "Saving..." : "Change status"}
        </Button>
        <p className="text-sm text-muted-foreground">
          {message ?? `Current: ${getLeadStatusLabel(status)}`}
        </p>
      </div>
    </form>
  );
}

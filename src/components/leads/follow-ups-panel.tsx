"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FollowUpListItem = {
  id: string;
  note: string;
  status: "open" | "completed" | "canceled";
  followUpDueAt: string;
  completedAt: string | null;
};

type FollowUpsPanelProps = {
  leadId: string;
  followUps: FollowUpListItem[];
};

export function FollowUpsPanel({ leadId, followUps }: FollowUpsPanelProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [newDueAt, setNewDueAt] = useState("");
  const [editing, setEditing] = useState<Record<string, FollowUpDraft>>(
    Object.fromEntries(
      followUps.map((followUp) => [
        followUp.id,
        {
          note: followUp.note,
          followUpDueAt: toDateTimeLocalValue(followUp.followUpDueAt)
        }
      ])
    )
  );
  const [currentTime] = useState(() => Date.now());
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function createFollowUp() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/leads/${leadId}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: newNote,
          followUpDueAt: newDueAt
        })
      });

      if (!response.ok) {
        setMessage("Could not create follow-up.");
        return;
      }

      setNewNote("");
      setNewDueAt("");
      setMessage("Follow-up created.");
      router.refresh();
    });
  }

  function updateFollowUp(followUpId: string) {
    setMessage(null);
    const draft = editing[followUpId];

    startTransition(async () => {
      const response = await fetch(`/api/followups/${followUpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });

      if (!response.ok) {
        setMessage("Could not update follow-up.");
        return;
      }

      setMessage("Follow-up updated.");
      router.refresh();
    });
  }

  function completeFollowUp(followUpId: string) {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/followups/${followUpId}/complete`, {
        method: "PATCH"
      });

      if (!response.ok) {
        setMessage("Could not complete follow-up.");
        return;
      }

      setMessage("Follow-up completed.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          createFollowUp();
        }}
      >
        <label className="space-y-1 text-sm font-medium">
          New follow-up note
          <textarea
            className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Due
          <input
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            type="datetime-local"
            value={newDueAt}
            onChange={(event) => setNewDueAt(event.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving..." : "Add follow-up"}
          </Button>
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        {followUps.map((followUp) => {
          const draft = editing[followUp.id];
          const isComplete = followUp.status === "completed";

          return (
            <div
              key={followUp.id}
              className={cn(
                "space-y-3 rounded-md border border-border p-3",
                getDueState(followUp, currentTime) === "overdue"
                  ? "border-red-200"
                  : ""
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {formatDueDate(followUp.followUpDueAt)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      getDueState(followUp, currentTime) === "overdue"
                        ? "text-red-700"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDueState(followUp, currentTime)}
                  </p>
                </div>
                {!isComplete ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => completeFollowUp(followUp.id)}
                  >
                    Complete
                  </Button>
                ) : null}
              </div>
              <label className="space-y-1 text-sm font-medium">
                Note
                <textarea
                  className="min-h-16 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 disabled:opacity-60"
                  value={draft?.note ?? ""}
                  disabled={isComplete}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [followUp.id]: {
                        ...current[followUp.id],
                        note: event.target.value
                      }
                    }))
                  }
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Due
                <input
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60"
                  type="datetime-local"
                  value={draft?.followUpDueAt ?? ""}
                  disabled={isComplete}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [followUp.id]: {
                        ...current[followUp.id],
                        followUpDueAt: event.target.value
                      }
                    }))
                  }
                />
              </label>
              {!isComplete ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => updateFollowUp(followUp.id)}
                >
                  Save follow-up
                </Button>
              ) : null}
            </div>
          );
        })}
        {followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No follow-ups for this lead yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

type FollowUpDraft = {
  note: string;
  followUpDueAt: string;
};

function getDueState(followUp: FollowUpListItem, currentTime: number) {
  if (followUp.status === "completed") {
    return "completed";
  }

  return new Date(followUp.followUpDueAt).getTime() < currentTime
    ? "overdue"
    : "due";
}

function formatDueState(followUp: FollowUpListItem, currentTime: number) {
  const state = getDueState(followUp, currentTime);

  if (state === "completed") {
    return `Completed ${formatDueDate(followUp.completedAt)}`;
  }

  return state === "overdue" ? "Overdue" : "Due";
}

function formatDueDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Missing";
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

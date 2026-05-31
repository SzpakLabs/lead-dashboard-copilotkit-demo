"use client";

import { Archive, Check, CircleOff, GripVertical, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DragEventHandler } from "react";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SourceDefinitionItem } from "@/lib/domain/sources/manage-sources";
import { cn } from "@/lib/utils";

type SourceDefinitionsPanelProps = {
  sources: SourceDefinitionItem[];
};

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 2000;

export function SourceDefinitionsPanel({
  sources
}: SourceDefinitionsPanelProps) {
  const router = useRouter();
  const newLabelId = useId();
  const messageId = useId();
  const [newLabel, setNewLabel] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, Partial<SourceDefinitionItem>>
  >({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleSources = useMemo(
    () =>
      sources.map((source) => ({
        ...source,
        ...drafts[source.id]
      })),
    [drafts, sources]
  );
  const activeSources = sortSources(
    visibleSources.filter((source) => source.isActive && !source.archivedAt)
  );
  const disabledSources = sortSources(
    visibleSources.filter((source) => !source.isActive && !source.archivedAt)
  );
  const archivedSources = sortSources(
    visibleSources.filter((source) => source.archivedAt)
  );

  function updateDraft(id: string, label: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        label
      }
    }));
    markDirty(id);
  }

  function markDirty(id: string) {
    setDirtyIds((current) => new Set(current).add(id));
    setSaveStates((current) => ({ ...current, [id]: "dirty" }));
  }

  function createSource() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel })
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setNewLabel("");
      setMessage("Source created.");
      router.refresh();
    });
  }

  async function saveSourceDraft(draft: SourceDefinitionItem) {
    if (!draft.label.trim()) {
      setSaveStates((current) => ({ ...current, [draft.id]: "error" }));
      setMessage("Source label is required.");
      return;
    }

    setSaveStates((current) => ({ ...current, [draft.id]: "saving" }));
    const response = await fetch(`/api/sources/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: draft.label,
        sortOrder: draft.sortOrder
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
        const draft = visibleSources.find((source) => source.id === id);

        if (draft) {
          void saveSourceDraft(draft);
        }
      });
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeout);
  }, [dirtyIds, visibleSources]);

  function setSourceEnabled(source: SourceDefinitionItem, isActive: boolean) {
    const sortOrder = isActive
      ? getLastSortOrder(activeSources) + 10
      : getLastSortOrder([...activeSources, ...disabledSources]) + 10;

    setDrafts((current) => ({
      ...current,
      [source.id]: {
        ...source,
        isActive,
        sortOrder
      }
    }));
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/sources/${source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive, sortOrder })
      });

      if (!response.ok) {
        setMessage(await readError(response));
        router.refresh();
        return;
      }

      setMessage(isActive ? "Source enabled." : "Source disabled.");
      router.refresh();
    });
  }

  function archiveSource(id: string) {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/sources/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setMessage("Source archived.");
      router.refresh();
    });
  }

  function moveActiveSource(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      return;
    }

    const fromIndex = activeSources.findIndex(
      (source) => source.id === draggingId
    );
    const toIndex = activeSources.findIndex((source) => source.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const nextSources = [...activeSources];
    const [moved] = nextSources.splice(fromIndex, 1);
    nextSources.splice(toIndex, 0, moved);
    setDrafts((current) => {
      const next = { ...current };

      nextSources.forEach((source, index) => {
        next[source.id] = {
          ...source,
          sortOrder: index * 10
        };
      });

      return next;
    });
    setDirtyIds((current) => {
      const next = new Set(current);

      nextSources.forEach((source, index) => {
        if (source.sortOrder !== index * 10) {
          next.add(source.id);
        }
      });

      return next;
    });
    setSaveStates((current) => {
      const next = { ...current };

      nextSources.forEach((source, index) => {
        if (source.sortOrder !== index * 10) {
          next[source.id] = "dirty";
        }
      });

      return next;
    });
  }

  return (
    <div className="settings-editor-stack">
      <form
        className="settings-create-row"
        aria-describedby={message ? messageId : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          createSource();
        }}
      >
        <Input
          id={newLabelId}
          name="label"
          placeholder="Add custom source"
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
        />
        <Button type="submit" disabled={isPending || !newLabel.trim()}>
          Add
        </Button>
      </form>

      <div className="settings-list" aria-label="Active sources">
        {activeSources.map((source) => (
          <SourceRow
            key={source.id}
            source={source}
            disabled={isPending}
            draggable
            dragging={draggingId === source.id}
            saveState={saveStates[source.id] ?? "idle"}
            onArchive={() => archiveSource(source.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              setDraggingId(source.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              moveActiveSource(source.id);
              setDraggingId(null);
            }}
            onLabelChange={(label) => updateDraft(source.id, label)}
            onToggle={() => setSourceEnabled(source, false)}
          />
        ))}
      </div>

      {disabledSources.length > 0 ? (
        <div className="settings-list settings-list-disabled">
          {disabledSources.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              disabled={isPending}
              draggable={false}
              dragging={false}
              saveState={saveStates[source.id] ?? "idle"}
              onArchive={() => archiveSource(source.id)}
              onDragEnd={() => undefined}
              onDragOver={() => undefined}
              onDragStart={() => undefined}
              onDrop={() => undefined}
              onLabelChange={(label) => updateDraft(source.id, label)}
              onToggle={() => setSourceEnabled(source, true)}
            />
          ))}
        </div>
      ) : null}

      {archivedSources.length > 0 ? (
        <div className="settings-archived-list">
          {archivedSources.map((source) => (
            <span key={source.id}>{source.label}</span>
          ))}
        </div>
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

function SourceRow({
  disabled,
  draggable,
  dragging,
  onArchive,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onLabelChange,
  onToggle,
  saveState,
  source
}: {
  disabled: boolean;
  draggable: boolean;
  dragging: boolean;
  onArchive: () => void;
  onDragEnd: () => void;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDragStart: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
  onLabelChange: (label: string) => void;
  onToggle: () => void;
  saveState: SaveState;
  source: SourceDefinitionItem;
}) {
  return (
    <div
      className={cn(
        "settings-item-row",
        !source.isActive && "is-disabled",
        dragging && "is-dragging"
      )}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <div className="settings-drag-handle" aria-hidden="true">
        <GripVertical className="size-4" />
      </div>
      <div className="settings-item-main">
        <Input
          aria-label={`${source.label} label`}
          value={source.label}
          onChange={(event) => onLabelChange(event.target.value)}
        />
        <div className="settings-item-meta">
          <span>{source.presetKey ? "Preset" : "Custom"}</span>
          <span>{source.slug}</span>
          <SaveStateText state={saveState} />
        </div>
      </div>
      <button
        aria-label={source.isActive ? "Disable source" : "Enable source"}
        className={cn(
          "settings-state-toggle",
          source.isActive ? "is-enabled" : "is-disabled"
        )}
        disabled={disabled}
        type="button"
        onClick={onToggle}
      >
        {source.isActive ? (
          <Check className="size-4" />
        ) : (
          <CircleOff className="size-4" />
        )}
      </button>
      {!source.presetKey ? (
        <button
          aria-label="Archive source"
          className="settings-icon-action"
          disabled={disabled}
          type="button"
          onClick={onArchive}
        >
          <Archive className="size-4" />
        </button>
      ) : null}
    </div>
  );
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

function sortSources(sources: SourceDefinitionItem[]) {
  return [...sources].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.label.localeCompare(right.label)
  );
}

function getLastSortOrder(sources: SourceDefinitionItem[]) {
  return Math.max(0, ...sources.map((source) => source.sortOrder));
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

  return "Source update failed.";
}

"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sampleText =
  "Carlos Test from Test Studio asked about a client dashboard for tracking inbound leads. Budget around $5k. Wants a discovery call next Tuesday and follow-up tomorrow.";

export function IngestionForm({ className }: { className?: string }) {
  const router = useRouter();
  const sourceChannelId = useId();
  const sourceTypeId = useId();
  const textId = useId();
  const hintId = useId();
  const messageId = useId();
  const [text, setText] = useState(sampleText);
  const [sourceChannel, setSourceChannel] = useState("linkedin");
  const [sourceType, setSourceType] = useState("pasted_text");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitIngestion() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceChannel, sourceType })
      });

      if (!response.ok) {
        setMessage("Ingestion failed. Check the pasted text and try again.");
        return;
      }

      setMessage("Draft lead created for review.");
      router.refresh();
    });
  }

  return (
    <form
      className={cn(
        "space-y-4 rounded-lg border border-border bg-background p-5",
        className
      )}
      aria-describedby={`${hintId}${message ? ` ${messageId}` : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        submitIngestion();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 text-sm font-medium">
          <label htmlFor={sourceChannelId}>Source</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            id={sourceChannelId}
            name="sourceChannel"
            value={sourceChannel}
            onChange={(event) => setSourceChannel(event.target.value)}
          >
            <option value="linkedin">LinkedIn</option>
            <option value="upwork">Upwork</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1 text-sm font-medium">
          <label htmlFor={sourceTypeId}>Input type</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            id={sourceTypeId}
            name="sourceType"
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
          >
            <option value="pasted_text">Pasted text</option>
            <option value="pasted_transcript">Pasted transcript</option>
          </select>
        </div>
      </div>
      <div className="space-y-1 text-sm font-medium">
        <label htmlFor={textId}>Text or transcript</label>
        <p className="text-xs font-normal text-muted-foreground" id={hintId}>
          Paste the source artifact exactly as received for review.
        </p>
        <textarea
          className="min-h-36 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
          id={textId}
          name="text"
          required
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create draft lead"}
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

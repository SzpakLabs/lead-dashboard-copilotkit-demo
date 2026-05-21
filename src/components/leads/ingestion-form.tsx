"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

const sampleText =
  "Carlos Test from Test Studio asked about a client dashboard for tracking inbound leads. Budget around $5k. Wants a discovery call next Tuesday and follow-up tomorrow.";

export function IngestionForm() {
  const router = useRouter();
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
    <div className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Source
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={sourceChannel}
            onChange={(event) => setSourceChannel(event.target.value)}
          >
            <option value="linkedin">LinkedIn</option>
            <option value="upwork">Upwork</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Input type
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
          >
            <option value="pasted_text">Pasted text</option>
            <option value="pasted_transcript">Pasted transcript</option>
          </select>
        </label>
      </div>
      <label className="space-y-1 text-sm font-medium">
        Text or transcript
        <textarea
          className="min-h-36 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="button" disabled={isPending} onClick={submitIngestion}>
          {isPending ? "Creating..." : "Create draft lead"}
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </div>
  );
}

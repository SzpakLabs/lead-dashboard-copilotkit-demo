import { NextResponse } from "next/server";
import {
  ingestLeadFromText,
  ingestLeadInputSchema
} from "@/lib/domain/leads/ingest-lead";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = ingestLeadInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid ingestion input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await ingestLeadFromText(parsed.data);

  return NextResponse.json(
    {
      ingestionEventId: result.ingestionEvent.id,
      leadId: result.lead.id,
      status: result.lead.status,
      missingFields: result.lead.missingFields,
      confidence: result.lead.confidence
    },
    { status: 201 }
  );
}

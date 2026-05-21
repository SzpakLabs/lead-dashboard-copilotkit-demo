import { NextResponse } from "next/server";
import {
  updateLead,
  updateLeadInputSchema
} from "@/lib/domain/leads/update-lead";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const body: unknown = await request.json();
  const parsed = updateLeadInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    leadId
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lead update input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await updateLead(parsed.data);

  return NextResponse.json({
    leadId: result.lead.id,
    contactId: result.contact.id,
    missingFields: result.lead.missingFields
  });
}

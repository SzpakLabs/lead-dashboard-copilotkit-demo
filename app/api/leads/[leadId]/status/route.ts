import { NextResponse } from "next/server";
import {
  changeLeadStatus,
  changeLeadStatusInputSchema
} from "@/lib/domain/leads/change-lead-status";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const body: unknown = await request.json();
  const parsed = changeLeadStatusInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    leadId
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid status update input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await changeLeadStatus(parsed.data);

    return NextResponse.json({
      leadId: result.lead.id,
      status: result.lead.status
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Status update failed"
      },
      { status: 400 }
    );
  }
}

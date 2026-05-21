import { NextResponse } from "next/server";
import {
  createFollowUp,
  createFollowUpInputSchema
} from "@/lib/domain/followups/manage-followups";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const body: unknown = await request.json();
  const parsed = createFollowUpInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    leadId
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid follow-up input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const followUp = await createFollowUp(parsed.data);

  return NextResponse.json({
    followUpId: followUp.id,
    status: followUp.status
  });
}

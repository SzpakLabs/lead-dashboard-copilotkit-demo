import { NextResponse } from "next/server";
import {
  completeFollowUp,
  completeFollowUpInputSchema
} from "@/lib/domain/followups/manage-followups";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ followUpId: string }> }
) {
  const { followUpId } = await params;
  const parsed = completeFollowUpInputSchema.safeParse({ followUpId });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid follow-up completion input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const followUp = await completeFollowUp(parsed.data);

  return NextResponse.json({
    followUpId: followUp.id,
    status: followUp.status
  });
}

import { NextResponse } from "next/server";
import {
  updateFollowUp,
  updateFollowUpInputSchema
} from "@/lib/domain/followups/manage-followups";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ followUpId: string }> }
) {
  const { followUpId } = await params;
  const body: unknown = await request.json();
  const parsed = updateFollowUpInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    followUpId
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid follow-up update input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const followUp = await updateFollowUp(parsed.data);

  return NextResponse.json({
    followUpId: followUp.id,
    status: followUp.status
  });
}

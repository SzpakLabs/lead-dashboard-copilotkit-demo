import { NextResponse } from "next/server";
import {
  updateLeadCustomFieldValues,
  updateLeadCustomFieldValuesInputSchema
} from "@/lib/domain/custom-fields/update-lead-custom-field-values";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const body: unknown = await request.json();
  const parsed = updateLeadCustomFieldValuesInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    leadId
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid custom field values input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const result = await updateLeadCustomFieldValues(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Custom field update failed";
}

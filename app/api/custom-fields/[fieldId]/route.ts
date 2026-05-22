import { NextResponse } from "next/server";
import {
  archiveCustomFieldDefinition,
  archiveCustomFieldDefinitionInputSchema,
  updateCustomFieldDefinition,
  updateCustomFieldDefinitionInputSchema
} from "@/lib/domain/custom-fields/manage-custom-fields";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  const { fieldId } = await params;
  const body: unknown = await request.json();
  const parsed = updateCustomFieldDefinitionInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    fieldId
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid custom field update input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const definition = await updateCustomFieldDefinition(parsed.data);

    return NextResponse.json({ definition });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  const { fieldId } = await params;
  const parsed = archiveCustomFieldDefinitionInputSchema.safeParse({ fieldId });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid custom field archive input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const definition = await archiveCustomFieldDefinition(parsed.data);

    return NextResponse.json({ definition });
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

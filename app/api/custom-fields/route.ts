import { NextResponse } from "next/server";
import {
  createCustomFieldDefinition,
  createCustomFieldDefinitionInputSchema
} from "@/lib/domain/custom-fields/manage-custom-fields";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = createCustomFieldDefinitionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid custom field input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const definition = await createCustomFieldDefinition(parsed.data);

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

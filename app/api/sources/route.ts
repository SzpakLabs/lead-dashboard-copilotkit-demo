import { NextResponse } from "next/server";
import {
  createSourceDefinition,
  createSourceDefinitionInputSchema
} from "@/lib/domain/sources/manage-sources";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = createSourceDefinitionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid source input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const source = await createSourceDefinition(parsed.data);

    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Source update failed";
}

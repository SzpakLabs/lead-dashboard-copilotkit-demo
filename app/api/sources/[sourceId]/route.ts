import { NextResponse } from "next/server";
import {
  archiveSourceDefinition,
  archiveSourceDefinitionInputSchema,
  updateSourceDefinition,
  updateSourceDefinitionInputSchema
} from "@/lib/domain/sources/manage-sources";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params;
  const body: unknown = await request.json();
  const parsed = updateSourceDefinitionInputSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    sourceId
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid source update input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const source = await updateSourceDefinition(parsed.data);

    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params;
  const parsed = archiveSourceDefinitionInputSchema.safeParse({ sourceId });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid source archive input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const source = await archiveSourceDefinition(parsed.data);

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

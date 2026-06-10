export function isEmptyDatabaseError(error: unknown) {
  for (const current of walkErrorChain(error)) {
    const message = getErrorMessage(current);

    if (!message) {
      continue;
    }

    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('relation "leads" does not exist') ||
      normalizedMessage.includes('relation "workspaces" does not exist') ||
      normalizedMessage.includes('relation "contacts" does not exist') ||
      normalizedMessage.includes(
        'relation "custom_field_definitions" does not exist'
      ) ||
      normalizedMessage.includes(
        'relation "supabase_migrations.schema_migrations" does not exist'
      ) ||
      normalizedMessage.includes(
        "seeded workspace software-services-demo was not found"
      ) ||
      normalizedMessage.includes("42p01") ||
      normalizedMessage.includes("does not exist")
    ) {
      return true;
    }
  }

  return false;
}

function* walkErrorChain(error: unknown): Generator<unknown> {
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && !seen.has(current)) {
    seen.add(current);
    yield current;

    if (
      typeof current !== "object" ||
      current === null ||
      !("cause" in current)
    ) {
      break;
    }

    current = (current as { cause?: unknown }).cause;
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "";
}

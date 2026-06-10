export function isEmptyDatabaseError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('relation "leads" does not exist') ||
    message.includes('relation "workspaces" does not exist') ||
    message.includes('relation "contacts" does not exist') ||
    message.includes('relation "custom_field_definitions" does not exist') ||
    message.includes("seeded workspace software-services-demo was not found") ||
    message.includes("does not exist")
  );
}

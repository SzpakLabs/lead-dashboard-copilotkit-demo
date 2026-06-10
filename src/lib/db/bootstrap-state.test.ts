import { describe, expect, it } from "vitest";
import { isEmptyDatabaseError } from "./bootstrap-state";

describe("isEmptyDatabaseError", () => {
  it("detects top-level missing relation errors", () => {
    expect(
      isEmptyDatabaseError(new Error('relation "leads" does not exist'))
    ).toBe(true);
  });

  it("detects wrapped drizzle-style errors with the relation message in the cause", () => {
    const error = new Error("query failed");
    error.cause = new Error('relation "contacts" does not exist');

    expect(isEmptyDatabaseError(error)).toBe(true);
  });

  it("detects wrapped missing migration table errors", () => {
    const error = new Error("drizzle bootstrap failed");
    error.cause = {
      message: 'relation "supabase_migrations.schema_migrations" does not exist'
    };

    expect(isEmptyDatabaseError(error)).toBe(true);
  });

  it("keeps unrelated database errors classified as non-empty", () => {
    expect(
      isEmptyDatabaseError(new Error("permission denied for relation"))
    ).toBe(false);
  });
});

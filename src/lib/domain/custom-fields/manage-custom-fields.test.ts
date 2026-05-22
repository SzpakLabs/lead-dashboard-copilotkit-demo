import { describe, expect, it } from "vitest";
import {
  normalizeCustomFieldValue,
  validateCustomFieldValue
} from "./manage-custom-fields";

describe("custom field validation", () => {
  it("accepts valid values for each supported custom field type", () => {
    expect(validateCustomFieldValue("text", "Enterprise client")).toBeNull();
    expect(validateCustomFieldValue("number", "42")).toBeNull();
    expect(validateCustomFieldValue("boolean", "true")).toBeNull();
    expect(validateCustomFieldValue("boolean", "false")).toBeNull();
    expect(validateCustomFieldValue("date", "2026-05-22")).toBeNull();
  });

  it("rejects values that do not match the custom field type", () => {
    expect(validateCustomFieldValue("number", "soon")).toBe(
      "Value must be a number"
    );
    expect(validateCustomFieldValue("boolean", "yes")).toBe(
      "Value must be true or false"
    );
    expect(validateCustomFieldValue("date", "05/22/2026")).toBe(
      "Value must use YYYY-MM-DD format"
    );
  });

  it("normalizes empty values to null and numbers to stable strings", () => {
    expect(normalizeCustomFieldValue("text", "  ")).toBeNull();
    expect(normalizeCustomFieldValue("number", "042")).toBe("42");
  });
});

// @vitest-environment node
import { describe, expect, it } from "vitest";
import { validateField } from "./rules";
import { validateContact } from "./validate";

const valid = {
  name: "  Ada  ",
  email: " ada@example.com ",
  message: "Hello there, nice work.",
};

describe("validateContact", () => {
  it("trims and accepts valid input", () => {
    expect(validateContact(valid)).toEqual({
      ok: true,
      data: {
        name: "Ada",
        email: "ada@example.com",
        message: "Hello there, nice work.",
      },
    });
  });

  it("reports required for non-object, missing and blank fields", () => {
    for (const input of [
      null,
      "x",
      [],
      {},
      { name: " ", email: 1, message: null },
    ]) {
      expect(validateContact(input)).toEqual({
        ok: false,
        errors: { name: "required", email: "required", message: "required" },
      });
    }
  });

  it("requires at least 2 characters for name", () => {
    expect(validateContact({ ...valid, name: "A" })).toEqual({
      ok: false,
      errors: { name: "too_short" },
    });
  });

  it("checks lengths", () => {
    const r = validateContact({
      ...valid,
      name: "a".repeat(81),
      message: "short",
    });
    expect(r).toEqual({
      ok: false,
      errors: { name: "too_long", message: "too_short" },
    });
    expect(validateContact({ ...valid, message: "a".repeat(2001) })).toEqual({
      ok: false,
      errors: { message: "too_long" },
    });
  });

  it("checks email format and length", () => {
    for (const email of ["nope", "a@b", "a b@c.com", "a@@c.com", "a@c..com"]) {
      expect(validateContact({ ...valid, email })).toEqual({
        ok: false,
        errors: { email: "invalid_format" },
      });
    }
    expect(
      validateContact({ ...valid, email: `${"a".repeat(250)}@x.com` }),
    ).toEqual({
      ok: false,
      errors: { email: "too_long" },
    });
  });

  it("accepts the exact boundaries", () => {
    const cases = [
      { ...valid, name: "ab" },
      { ...valid, name: "a".repeat(80) },
      { ...valid, message: "a".repeat(10) },
      { ...valid, message: "a".repeat(2000) },
      { ...valid, email: `${"a".repeat(242)}@example.com` },
    ];
    for (const input of cases) expect(validateContact(input).ok).toBe(true);
  });

  it("exposes validateField for client reuse", () => {
    expect(validateField("email", "ana@dominio..com")).toBe("invalid_format");
    expect(validateField("email", "ana@dominio.com.")).toBe("invalid_format");
    expect(validateField("email", "ana@.dominio.com")).toBe("invalid_format");
    expect(validateField("name", "Ana")).toBeUndefined();
  });
});

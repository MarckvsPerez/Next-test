// @vitest-environment node
import { describe, expect, it } from "vitest";
import { POST } from "./route";

const post = (body: string, headers?: Record<string, string>) =>
  POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      body,
      headers,
    }),
  );

const valid = {
  name: "Ada",
  email: "ada@example.com",
  message: "Hello there, nice work.",
};

describe("POST /api/contact", () => {
  it("returns 200 { ok: true } for valid input", async () => {
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 400 with per-field errors", async () => {
    const res = await post(
      JSON.stringify({ ...valid, email: "bad", name: "" }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      ok: false,
      code: "validation_error",
      message: "Some fields are invalid.",
      errors: { name: "required", email: "invalid_format" },
    });
  });

  it("returns 400 invalid_body for non-JSON or empty body", async () => {
    for (const body of ["not json", ""]) {
      const res = await post(body);
      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe("invalid_body");
    }
  });

  it("treats JSON that is not an object as validation errors", async () => {
    const res = await post("[]");
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("validation_error");
  });

  it("returns 413 before parsing: oversized AND not valid JSON", async () => {
    const res = await post("x".repeat(32_769));
    expect(res.status).toBe(413);
    expect((await res.json()).code).toBe("payload_too_large");
  });

  it("returns 413 from Content-Length without reading the body", async () => {
    const res = await post("{}", { "content-length": "99999999" });
    expect(res.status).toBe(413);
  });

  it("counts bytes, not characters", async () => {
    // 20k two-byte chars = 40 KB > 32 KiB although only 20k characters.
    const res = await post("é".repeat(20_000));
    expect(res.status).toBe(413);
  });

  it("accepts a body exactly at the limit", async () => {
    const pad = " ".repeat(32_768 - JSON.stringify(valid).length);
    const res = await post(JSON.stringify(valid) + pad);
    expect(res.status).toBe(200);
  });

  it("answers 200 to honeypot submissions even if the rest is invalid", async () => {
    const res = await post(
      JSON.stringify({ name: "", website: "http://spam.example" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

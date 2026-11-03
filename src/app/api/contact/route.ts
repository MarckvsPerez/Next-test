import {
  CONTACT_LIMITS,
  type ContactFailure,
  type ContactSuccess,
} from "@/server/contact/types";
import { validateContact } from "@/server/contact/validate";

// POST handlers are never cached or prerendered, also with cacheComponents.
// Other methods get a bare 405 from Next (no Allow header); OPTIONS is auto-implemented.

function json(body: ContactSuccess | ContactFailure, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

class BodyTooLargeError extends Error {}

// Reads the body without buffering more than `limit` bytes (chunked requests
// have no Content-Length, so the stream itself is counted).
async function readBodyText(request: Request, limit: number): Promise<string> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit)
    throw new BodyTooLargeError();
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > limit) {
      await reader.cancel().catch(() => {});
      throw new BodyTooLargeError();
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function POST(request: Request) {
  let text: string;
  try {
    text = await readBodyText(request, CONTACT_LIMITS.bodyBytes);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return json(
        {
          ok: false,
          code: "payload_too_large",
          message: "Request body is too large.",
        },
        413,
      );
    }
    return json(
      {
        ok: false,
        code: "invalid_body",
        message: "Could not read the request body.",
      },
      400,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return json(
      {
        ok: false,
        code: "invalid_body",
        message: "Request body must be valid JSON.",
      },
      400,
    );
  }

  // Honeypot: bots fill the hidden `website` field. Answer 200 and do nothing.
  if (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { website?: unknown }).website === "string" &&
    (payload as { website: string }).website.trim() !== ""
  ) {
    return json({ ok: true }, 200);
  }

  const result = validateContact(payload);
  if (!result.ok) {
    return json(
      {
        ok: false,
        code: "validation_error",
        message: "Some fields are invalid.",
        errors: result.errors,
      },
      400,
    );
  }

  // Nothing is persisted or sent yet (no database/email). Stateless, so repeats are idempotent.
  return json({ ok: true }, 200);
}

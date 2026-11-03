// Contract for POST /api/contact. Safe to `import type` from client components:
// no server-only imports here.

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
  /** Max raw request body size in BYTES (UTF-8); larger -> 413. */
  bodyBytes: 32_768,
} as const;

export const CONTACT_FIELDS = ["name", "email", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactInput = Record<ContactField, string>;

/** Request body. `website` is a honeypot: keep it empty and hidden in the UI. */
export type ContactRequest = ContactInput & { website?: string };

/** Stable per-field error codes; front/designer map them to copy. */
export type ContactFieldError =
  | "required" // missing, not a string, or empty after trim
  | "too_short"
  | "too_long"
  | "invalid_format"; // email only

export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>;

/** 200 */
export type ContactSuccess = { ok: true };

/** 400 / 413 */
export type ContactFailure =
  | {
      ok: false;
      code: "validation_error";
      message: string;
      errors: ContactErrors;
    }
  | {
      ok: false;
      code: "invalid_body" | "payload_too_large";
      message: string;
    };

export type ContactResponse = ContactSuccess | ContactFailure;

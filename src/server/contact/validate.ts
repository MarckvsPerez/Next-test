// Server-side validation of the whole request body. Client code must import
// from ./rules and ./types only, never from this file.
import { validateField } from "./rules";
import { CONTACT_FIELDS, type ContactErrors, type ContactInput } from "./types";

export type ValidationResult =
  { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors };

export function validateContact(input: unknown): ValidationResult {
  const raw =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const code = validateField(field, raw[field]);
    if (code) errors[field] = code;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name: (raw.name as string).trim(),
      email: (raw.email as string).trim(),
      message: (raw.message as string).trim(),
    },
  };
}

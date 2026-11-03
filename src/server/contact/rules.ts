// Shared contract rules: pure, dependency-free (only ./types) and client-safe.
// MUST stay that way: no server-only imports, no I/O. Server logic goes in validate.ts.
import {
  CONTACT_LIMITS,
  type ContactField,
  type ContactFieldError,
} from "./types";

// Pragmatic check: one "@", no spaces, dotted domain without empty labels. Not RFC 5322.
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Validates one field (trims first). Returns an error code or undefined. */
export function validateField(
  field: ContactField,
  rawValue: unknown,
): ContactFieldError | undefined {
  if (typeof rawValue !== "string") return "required";
  const value = rawValue.trim();
  if (value.length === 0) return "required";
  switch (field) {
    case "name":
      if (value.length < CONTACT_LIMITS.name.min) return "too_short";
      if (value.length > CONTACT_LIMITS.name.max) return "too_long";
      return undefined;
    case "email":
      if (value.length > CONTACT_LIMITS.email.max) return "too_long";
      if (!EMAIL_RE.test(value)) return "invalid_format";
      return undefined;
    case "message":
      if (value.length < CONTACT_LIMITS.message.min) return "too_short";
      if (value.length > CONTACT_LIMITS.message.max) return "too_long";
      return undefined;
  }
}

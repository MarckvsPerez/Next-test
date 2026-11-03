import { validateField } from "@/server/contact/rules";
import {
  type ContactErrors,
  type ContactField,
  type ContactFieldError,
  type ContactInput,
} from "@/server/contact/types";

// Single source of truth: the same pure validator the server route uses.
export { validateField };

export function validateAll(values: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of ["name", "email", "message"] as const) {
    const code = validateField(field, values[field]);
    if (code) errors[field] = code;
  }
  return errors;
}

const FIELD_COPY: Record<ContactField, Partial<Record<ContactFieldError, string>>> = {
  name: {
    required: "Escribe tu nombre.",
    too_short: "El nombre debe tener al menos 2 caracteres.",
    too_long: "El nombre no puede superar los 80 caracteres.",
  },
  email: {
    required: "Escribe tu correo electrónico.",
    too_long: "El correo no puede superar los 254 caracteres.",
    invalid_format:
      "Escribe un correo válido, por ejemplo nombre@dominio.com.",
  },
  message: {
    required: "Escribe tu mensaje.",
    too_short: "El mensaje debe tener al menos 10 caracteres.",
    too_long: "El mensaje no puede superar los 2000 caracteres.",
  },
};

export function fieldErrorCopy(
  field: ContactField,
  code: ContactFieldError | string,
): string {
  return (
    FIELD_COPY[field][code as ContactFieldError] ?? "Revisa este campo."
  );
}

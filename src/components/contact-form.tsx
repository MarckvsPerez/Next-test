"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  fieldErrorCopy,
  validateAll,
  validateField,
} from "@/lib/contact-validation";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  type ContactErrors,
  type ContactField,
  type ContactInput,
  type ContactRequest,
  type ContactResponse,
} from "@/server/contact/types";

const TIMEOUT_MS = 15_000;

const COPY = {
  success: "Mensaje enviado. Gracias por escribir, te responderé lo antes posible.",
  network:
    "No se ha podido enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo.",
  tooLarge:
    "El mensaje es demasiado largo para enviarlo. Acórtalo e inténtalo de nuevo.",
  generic:
    "Algo ha fallado al enviar el mensaje. Inténtalo de nuevo en unos minutos.",
} as const;

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ContactInput = { name: "", email: "", message: "" };

const LABELS: Record<ContactField, string> = {
  name: "Nombre",
  email: "Correo electrónico",
  message: "Mensaje",
};

const controlClass =
  "mt-2 w-full min-h-11 rounded-lg border bg-background px-3 text-base text-foreground";

function Icon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ERROR_ICON = "M12 8v5m0 3h.01M12 3a9 9 0 100 18 9 9 0 000-18z";
const CHECK_ICON = "M5 13l4 4L19 7";

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [resultText, setResultText] = useState("");
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const refs = useRef<
    Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>
  >({ name: null, email: null, message: null });

  // Commit the errors to the DOM first, then focus: screen readers must find
  // aria-invalid / aria-describedby already in place when the field gets focus.
  function showErrorsAndFocus(found: ContactErrors) {
    flushSync(() => {
      setErrors(found);
      setStatus("idle");
    });
    const first = CONTACT_FIELDS.find((f) => found[f]);
    if (first) refs.current[first]?.focus();
  }

  function setFieldError(field: ContactField, value: string) {
    const code = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (code) next[field] = code;
      else delete next[field];
      return next;
    });
  }

  function handleChange(field: ContactField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setFieldError(field, value);
  }

  function handleBlur(field: ContactField) {
    if (values[field].trim().length > 0) setFieldError(field, values[field]);
  }

  function fail(text: string) {
    setResultText(text);
    setStatus("error");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const clientErrors = validateAll(values);
    if (Object.keys(clientErrors).length > 0) {
      setResultText("");
      showErrorsAndFocus(clientErrors);
      return;
    }

    setErrors({});
    setResultText("");
    setStatus("submitting");

    const body: ContactRequest = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      website: honeypotRef.current?.value ?? "",
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    let data: ContactResponse | null = null;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timer);
      fail(COPY.network);
      return;
    }

    // The timeout also covers reading the body, so a stalled body can't hang the form.
    try {
      data = (await response.json()) as ContactResponse;
    } catch {
      if (controller.signal.aborted) {
        clearTimeout(timer);
        fail(COPY.network);
        return;
      }
      data = null;
    }
    clearTimeout(timer);

    if (response.ok && data?.ok === true) {
      setValues(EMPTY);
      setResultText(COPY.success);
      setStatus("success");
      return;
    }

    if (data && !data.ok && data.code === "validation_error" && data.errors) {
      showErrorsAndFocus(data.errors);
      return;
    }

    if (response.status === 413 || (data && !data.ok && data.code === "payload_too_large")) {
      fail(COPY.tooLarge);
      return;
    }

    fail(COPY.generic);
  }

  const submitting = status === "submitting";

  function renderField(field: ContactField) {
    const error = errors[field];
    const errorId = `${field}-error`;
    const describedBy =
      [error ? errorId : null, field === "message" ? "message-count" : null]
        .filter(Boolean)
        .join(" ") || undefined;
    const common = {
      id: field,
      name: field,
      value: values[field],
      required: true,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => handleChange(field, e.target.value),
      onBlur: () => handleBlur(field),
      className: `${controlClass} ${error ? "border-danger" : "border-border-strong"}`,
    };

    return (
      <div key={field}>
        <label htmlFor={field} className="text-sm font-medium">
          {LABELS[field]}
        </label>
        {field === "message" ? (
          <textarea
            {...common}
            ref={(el) => {
              refs.current.message = el;
            }}
            rows={6}
            maxLength={CONTACT_LIMITS.message.max}
            className={`${common.className} min-h-36 resize-y py-2`}
          />
        ) : (
          <input
            {...common}
            ref={(el) => {
              refs.current[field] = el;
            }}
            type={field === "email" ? "email" : "text"}
            autoComplete={field === "email" ? "email" : "name"}
            inputMode={field === "email" ? "email" : undefined}
            maxLength={
              field === "email"
                ? CONTACT_LIMITS.email.max
                : CONTACT_LIMITS.name.max
            }
          />
        )}
        {field === "message" && (
          <p
            id="message-count"
            className="mt-1 text-right text-xs text-muted"
          >
            {values.message.length} / {CONTACT_LIMITS.message.max}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="mt-2 flex items-start gap-2 text-sm text-danger"
          >
            <Icon path={ERROR_ICON} />
            <span>{fieldErrorCopy(field, error)}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative mt-8 grid gap-6"
    >
      <p className="text-sm text-muted">Todos los campos son obligatorios.</p>

      {CONTACT_FIELDS.map(renderField)}

      {/* Honeypot: off-screen, out of tab order and the accessibility tree. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="hp_field">Deja este campo vacío</label>
        <input
          ref={honeypotRef}
          id="hp_field"
          name="hp_field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <button
        type="submit"
        aria-disabled={submitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover sm:w-auto sm:justify-self-start"
      >
        {submitting && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 animate-spin motion-reduce:animate-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M12 3a9 9 0 019 9" />
          </svg>
        )}
        {submitting ? "Enviando…" : "Enviar mensaje"}
      </button>

      {/* Sibling live regions, both present and empty from the first render. */}
      <div
        id="contact-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === "success" && (
          <p className="flex items-start gap-2 rounded-lg bg-success-surface p-4 text-sm text-success">
            <Icon path={CHECK_ICON} />
            <span>{resultText}</span>
          </p>
        )}
      </div>
      <div id="contact-alert" role="alert" aria-atomic="true">
        {status === "error" && (
          <p className="flex items-start gap-2 rounded-lg bg-danger-surface p-4 text-sm text-danger">
            <Icon path={ERROR_ICON} />
            <span>{resultText}</span>
          </p>
        )}
      </div>
    </form>
  );
}

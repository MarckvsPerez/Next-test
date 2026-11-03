import { afterEach, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContactForm } from "@/components/contact-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

function fill(name: string, email: string, message: string) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Mensaje"), {
    target: { value: message },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /enviar mensaje/i }));
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("client validation blocks submit, shows errors and focuses the first one", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  submit();

  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByText("Escribe tu nombre.")).toBeDefined();
  expect(screen.getByText("Escribe tu correo electrónico.")).toBeDefined();
  expect(screen.getByText("Escribe tu mensaje.")).toBeDefined();
  const name = screen.getByLabelText("Nombre");
  expect(name.getAttribute("aria-invalid")).toBe("true");
  expect(name.getAttribute("aria-describedby")).toBe("name-error");
  expect(document.activeElement).toBe(name);
});

test("success: sends the payload, resets the form and shows the status banner", async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, 200));
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");
  submit();

  expect(
    await screen.findByText(/Mensaje enviado\. Gracias por escribir/),
  ).toBeDefined();
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/contact");
  expect(JSON.parse(init.body)).toEqual({
    name: "Ana",
    email: "ana@example.com",
    message: "Hola, este es un mensaje largo.",
    website: "",
  });
  expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("");
  expect(screen.getByText("0 / 2000")).toBeDefined();
});

test("400 validation_error shows per-field errors, keeps data, no banner", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          code: "validation_error",
          message: "english debug text",
          errors: { email: "invalid_format" },
        },
        400,
      ),
    ),
  );
  render(<ContactForm />);
  // Server-side error even though the client check passed.
  fill("Ana", "a@b.c", "Hola, este es un mensaje largo.");
  submit();

  expect(
    await screen.findByText(/Escribe un correo válido/),
  ).toBeDefined();
  expect(screen.queryByText("english debug text")).toBeNull();
  expect(document.getElementById("contact-alert")!.textContent).toBe("");
  const email = screen.getByLabelText("Correo electrónico") as HTMLInputElement;
  expect(email.value).toBe("a@b.c");
  expect(email.getAttribute("aria-invalid")).toBe("true");
  await waitFor(() => expect(document.activeElement).toBe(email));
});

test("network error shows the alert banner and keeps the data", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
  render(<ContactForm />);
  fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");
  submit();

  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toMatch(/Comprueba tu conexión/);
  expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("Ana");
  expect(
    screen.getByRole("button", { name: "Enviar mensaje" }),
  ).toBeDefined();
});

test("413 and unexpected responses use their own copy", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      jsonResponse({ ok: false, code: "payload_too_large", message: "x" }, 413),
    )
    .mockResolvedValueOnce(new Response("<html>boom</html>", { status: 500 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");

  submit();
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /demasiado largo/,
  );

  submit();
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toMatch(/Algo ha fallado/),
  );
});

test("the honeypot is hidden from the accessibility tree and left empty", () => {
  render(<ContactForm />);
  const honeypot = document.getElementById("hp_field") as HTMLInputElement;
  expect(honeypot.tabIndex).toBe(-1);
  expect(honeypot.value).toBe("");
  expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
});

test("errors are already in the DOM when focus moves to the first invalid field", () => {
  vi.stubGlobal("fetch", vi.fn());
  render(<ContactForm />);
  const name = screen.getByLabelText("Nombre");
  let seen: { invalid: string | null; described: string | null; hasError: boolean } | null = null;
  name.addEventListener("focus", () => {
    seen = {
      invalid: name.getAttribute("aria-invalid"),
      described: name.getAttribute("aria-describedby"),
      hasError: document.getElementById("name-error") !== null,
    };
  });
  submit();
  expect(seen).toEqual({ invalid: "true", described: "name-error", hasError: true });
});

test("the honeypot value reaches the request", async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, 200));
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");
  fireEvent.change(document.getElementById("hp_field")!, {
    target: { value: "bot" },
  });
  submit();
  await screen.findByText(/Mensaje enviado/);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).website).toBe("bot");
});

test("a second submit while sending is ignored and the button is aria-disabled", async () => {
  let resolve!: (r: Response) => void;
  const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r)));
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");
  submit();
  const button = await screen.findByRole("button", { name: /enviando/i });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.hasAttribute("disabled")).toBe(false);
  fireEvent.click(button);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  resolve(jsonResponse({ ok: true }, 200));
  await screen.findByText(/Mensaje enviado/);
});

test("the 15 s timeout aborts the request and shows the network copy", async () => {
  vi.useFakeTimers();
  try {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) =>
        new Promise((_res, rej) => {
          init.signal!.addEventListener("abort", () =>
            rej(new DOMException("aborted", "AbortError")),
          );
        }),
      ),
    );
    render(<ContactForm />);
    fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");
    submit();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(screen.getByRole("alert").textContent).toMatch(/Comprueba tu conexión/);
  } finally {
    vi.useRealTimers();
  }
});

test("blur validates only fields with content; change revalidates only after an error", () => {
  render(<ContactForm />);
  const name = screen.getByLabelText("Nombre");
  fireEvent.blur(name);
  expect(screen.queryByText("Escribe tu nombre.")).toBeNull();

  fireEvent.change(name, { target: { value: "A" } });
  expect(screen.queryByText(/al menos 2 caracteres/)).toBeNull();
  fireEvent.blur(name);
  expect(screen.getByText(/al menos 2 caracteres/)).toBeDefined();

  fireEvent.change(name, { target: { value: "Ana" } });
  expect(screen.queryByText(/al menos 2 caracteres/)).toBeNull();
});

test("message describes itself with its error and the counter", () => {
  render(<ContactForm />);
  submit();
  expect(screen.getByLabelText("Mensaje").getAttribute("aria-describedby")).toBe(
    "message-error message-count",
  );
});

test("client rejects the emails the server rejects (shared validator)", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  fill("Ana", "ana@dominio..com", "Hola, este es un mensaje largo.");
  submit();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByText(/Escribe un correo válido/)).toBeDefined();
});

test("status and alert live regions are siblings, present and empty from the start", () => {
  render(<ContactForm />);
  const status = document.getElementById("contact-status")!;
  const alert = document.getElementById("contact-alert")!;
  expect(status.getAttribute("role")).toBe("status");
  expect(alert.getAttribute("role")).toBe("alert");
  expect(status.contains(alert)).toBe(false);
  expect(alert.contains(status)).toBe(false);
  expect(status.textContent).toBe("");
  expect(alert.textContent).toBe("");
});

test("success lands only in #contact-status and errors only in #contact-alert", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response("boom", { status: 500 }))
    .mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
  vi.stubGlobal("fetch", fetchMock);
  render(<ContactForm />);
  const status = document.getElementById("contact-status")!;
  const alert = document.getElementById("contact-alert")!;
  fill("Ana", "ana@example.com", "Hola, este es un mensaje largo.");

  submit();
  await waitFor(() => expect(alert.textContent).toMatch(/Algo ha fallado/));
  expect(status.textContent).toBe("");

  submit();
  await waitFor(() => expect(status.textContent).toMatch(/Mensaje enviado/));
  expect(alert.textContent).toBe("");
});

import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { SiteHeader } from "@/components/site-header";
import { navItems } from "@/lib/content";

// jsdom has no <dialog> modal support: emulate what the browser does.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    document.querySelector<HTMLDialogElement>("dialog[open]")?.close();
  };
  document.addEventListener("keydown", onKey);
  cleanupKey = () => document.removeEventListener("keydown", onKey);
});

let cleanupKey = () => {};
afterEach(() => {
  cleanupKey();
  document.documentElement.style.overflow = "";
});

const getButton = () => screen.getByRole("button", { name: "Menú" });
const getDialog = () =>
  document.getElementById("menu-movil") as HTMLDialogElement;

test("renders a link for every section in the sidebar", () => {
  render(<SiteHeader />);
  const nav = screen.getByRole("navigation", { name: "Principal" });
  for (const item of navItems) {
    const link = within(nav).getByRole("link", { name: item.label });
    expect(link.getAttribute("href")).toBe(`#${item.id}`);
  }
});

test("menu button toggles aria-expanded with the drawer", () => {
  render(<SiteHeader />);
  const button = getButton();
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(button.getAttribute("aria-controls")).toBe("menu-movil");

  fireEvent.click(button);
  expect(button.getAttribute("aria-expanded")).toBe("true");
  expect(getDialog().hasAttribute("open")).toBe(true);
  expect(document.documentElement.style.overflow).toBe("hidden");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Cerrar" }),
  );

  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(getDialog().hasAttribute("open")).toBe(false);
  expect(document.documentElement.style.overflow).toBe("");
  expect(document.activeElement).toBe(button);
});

test("Esc closes the drawer and returns focus to the button", () => {
  render(<SiteHeader />);
  fireEvent.click(getButton());
  fireEvent.keyDown(document, { key: "Escape" });
  expect(getButton().getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(getButton());
});

test("drawer lists every section and closes on link click", () => {
  render(<SiteHeader />);
  fireEvent.click(getButton());
  const dialog = getDialog();
  for (const item of navItems) {
    expect(
      within(dialog).getByRole("link", { name: item.label }),
    ).toBeDefined();
  }
  fireEvent.click(within(dialog).getByRole("link", { name: "Proyectos" }));
  expect(dialog.hasAttribute("open")).toBe(false);
  expect(getButton().getAttribute("aria-expanded")).toBe("false");
  expect(document.documentElement.style.overflow).toBe("");
});

test("link click moves focus to the target heading", () => {
  const h2 = document.createElement("h2");
  h2.id = "proyectos-title";
  h2.tabIndex = -1;
  document.body.append(h2);
  render(<SiteHeader />);
  fireEvent.click(getButton());
  fireEvent.click(
    within(getDialog()).getByRole("link", { name: "Proyectos" }),
  );
  expect(document.activeElement).toBe(h2);
  h2.remove();
});

test("marks the active section with aria-current", () => {
  let callback: IntersectionObserverCallback = () => {};
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  const section = document.createElement("section");
  section.id = "conocimientos";
  document.body.append(section);

  // jsdom reports a 0px page, which would count as "at the bottom".
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(5000);

  render(<SiteHeader />);
  const nav = screen.getByRole("navigation", { name: "Principal" });
  expect(nav.querySelector("[aria-current]")).toBeNull();

  act(() => {
    callback(
      [{ isIntersecting: true, target: section } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
  expect(
    within(nav).getByRole("link", { name: "Conocimientos" }).getAttribute("aria-current"),
  ).toBe("location");

  section.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

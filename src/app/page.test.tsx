import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("Home renders the name as the only h1", () => {
  render(<Home />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0].textContent).toBe("Marc Pérez");
});

test("Home shows the author's name", () => {
  render(<Home />);
  expect(screen.getAllByText("Marc Pérez").length).toBeGreaterThan(0);
});

test("Home has the three section headings and the landmarks", () => {
  render(<Home />);
  for (const name of ["Sobre mí", "Proyectos", "Contacto"]) {
    expect(screen.getByRole("heading", { level: 2, name })).toBeDefined();
  }
  expect(screen.getByRole("main")).toBeDefined();
  expect(screen.getByRole("banner")).toBeDefined();
});

test("Home renders the knowledge section with its three groups", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 2, name: "Mis conocimientos" }),
  ).toBeDefined();
  for (const name of ["Front", "Back", "Database"]) {
    expect(screen.getByRole("heading", { level: 3, name })).toBeDefined();
  }
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "..", "app", "globals.css"), "utf8");
const root = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? "";

function token(name: string): string {
  const m = root.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Missing token --${name}`);
  return m[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("dark palette contrast", () => {
  it("is dark-only", () => {
    expect(root).toContain("color-scheme: dark");
    expect(css).not.toContain("prefers-color-scheme");
  });

  it.each([
    ["foreground", "background", 4.5],
    ["foreground", "surface", 4.5],
    ["danger", "background", 4.5],
    ["muted", "background", 4.5],
    ["muted", "surface", 4.5],
    ["accent-foreground", "accent", 4.5],
    ["accent-foreground", "accent-hover", 4.5],
    ["danger", "danger-surface", 4.5],
    ["success", "success-surface", 4.5],
    ["border-strong", "background", 3],
    ["border-strong", "surface", 3],
    ["ring", "background", 3],
    ["ring", "surface", 3],
  ])("--%s on --%s >= %f", (fg, bg, min) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(min);
  });

  it("keeps the focus ring distinct from the accent", () => {
    expect(token("ring").toLowerCase()).not.toBe(token("accent").toLowerCase());
  });
});

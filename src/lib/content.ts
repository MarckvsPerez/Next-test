// EXAMPLE CONTENT: placeholder text to be replaced by Marc's real bio,
// tagline and projects. Nothing here is factual.

export type Project = {
  title: string; // ~40 characters max
  description: string; // ~160 characters max
  tags: string[]; // 0 to 5
  href?: string; // optional; without it the card is not interactive
};

export const tagline = "Frase breve que resume a qué te dedicas.";

export const about: string[] = [
  "Primer párrafo de ejemplo: quién eres y a qué te dedicas.",
  "Segundo párrafo de ejemplo: tu forma de trabajar y qué te interesa.",
];

export const projects: Project[] = [
  {
    title: "Proyecto de ejemplo 1",
    description:
      "Descripción breve del proyecto: qué problema resuelve y cuál fue tu papel.",
    tags: ["Etiqueta"],
    href: "https://example.com",
  },
  {
    title: "Proyecto de ejemplo 2",
    description:
      "Descripción breve del proyecto: qué problema resuelve y cuál fue tu papel.",
    tags: ["Etiqueta"],
  },
];

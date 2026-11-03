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

export type Skill = {
  name: string;
  level: string; // short level label
};

export type SkillGroup = {
  title: string;
  skills: Skill[]; // 4 to 6
};

// EXAMPLE CONTENT: invented placeholder data.
export const skillsTitle = "Mis conocimientos";

export const skillGroups: SkillGroup[] = [
  {
    title: "Front",
    skills: [
      { name: "Tecnología de ejemplo A", level: "Avanzado" },
      { name: "Tecnología de ejemplo B", level: "Avanzado" },
      { name: "Tecnología de ejemplo C", level: "Intermedio" },
      { name: "Tecnología de ejemplo D", level: "Intermedio" },
      { name: "Tecnología de ejemplo E", level: "Básico" },
    ],
  },
  {
    title: "Back",
    skills: [
      { name: "Tecnología de ejemplo F", level: "Avanzado" },
      { name: "Tecnología de ejemplo G", level: "Intermedio" },
      { name: "Tecnología de ejemplo H", level: "Intermedio" },
      { name: "Tecnología de ejemplo I", level: "Básico" },
    ],
  },
  {
    title: "Database",
    skills: [
      { name: "Tecnología de ejemplo J", level: "Avanzado" },
      { name: "Tecnología de ejemplo K", level: "Intermedio" },
      { name: "Tecnología de ejemplo L", level: "Intermedio" },
      { name: "Tecnología de ejemplo M", level: "Básico" },
    ],
  },
];

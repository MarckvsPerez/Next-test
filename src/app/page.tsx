import { ContactForm } from "@/components/contact-form";
import { about, projects, skillGroups, skillsTitle, tagline } from "@/lib/content";

const container = "mx-auto w-full max-w-3xl px-6 sm:px-8";
const section = `${container} border-t border-border py-16 sm:py-24`;
const linkClass =
  "inline-flex min-h-11 items-center transition-colors hover:text-foreground";
const primaryCta =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover sm:w-auto";
const secondaryCta =
  "inline-flex h-12 w-full items-center justify-center rounded-full border border-border-strong px-5 text-base font-medium transition-colors hover:bg-surface sm:w-auto";

export default function Home() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>

      <header className={`${container} flex flex-wrap items-center justify-between gap-x-4 py-4`}>
        <a href="#inicio" className="inline-flex min-h-11 items-center text-sm font-semibold">
          Marc Pérez
        </a>
        <nav aria-label="Principal">
          <ul className="flex gap-4 text-sm text-muted sm:gap-6">
            <li>
              <a href="#sobre-mi" className={linkClass}>Sobre mí</a>
            </li>
            <li>
              <a href="#conocimientos" className={linkClass}>Conocimientos</a>
            </li>
            <li>
              <a href="#proyectos" className={linkClass}>Proyectos</a>
            </li>
            <li>
              <a href="#contacto" className={linkClass}>Contacto</a>
            </li>
          </ul>
        </nav>
      </header>

      <main id="contenido" className="flex-1">
        <section
          id="inicio"
          aria-labelledby="hero-title"
          className={`${container} py-16`}
        >
          <h1
            id="hero-title"
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Marc Pérez
          </h1>
          <p className="mt-4 max-w-prose text-lg text-muted sm:text-xl">
            {tagline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contacto" className={primaryCta}>Escríbeme</a>
            <a href="#proyectos" className={secondaryCta}>Ver proyectos</a>
          </div>
        </section>

        <section
          id="sobre-mi"
          aria-labelledby="sobre-mi-title"
          className={section}
        >
          <h2
            id="sobre-mi-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Sobre mí
          </h2>
          <div className="mt-4 max-w-prose space-y-4 text-base leading-7 text-muted">
            {about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section
          id="conocimientos"
          aria-labelledby="conocimientos-title"
          className={section}
        >
          <h2
            id="conocimientos-title"
            className="text-2xl font-semibold tracking-tight"
          >
            {skillsTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {skillGroups.map((group) => (
              <article
                key={group.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="text-lg font-semibold">{group.title}</h3>
                <ul aria-label={group.title} className="space-y-2 text-sm leading-6">
                  {group.skills.map((skill) => (
                    <li key={skill.name}>
                      <span>{skill.name}</span>
                      <span className="block text-muted">{skill.level}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section
          id="proyectos"
          aria-labelledby="proyectos-title"
          className={section}
        >
          <h2
            id="proyectos-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Proyectos
          </h2>
          {projects.length === 0 ? (
            <p className="mt-8 text-muted">Pronto añadiré proyectos aquí.</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.title}
                  className={`relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 ${
                    project.href ? "hover:border-border-strong" : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold">
                    {project.href ? (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="after:absolute after:inset-0"
                      >
                        {project.title}
                        <span className="sr-only"> (se abre en una pestaña nueva)</span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  <p className="text-sm leading-6 text-muted">
                    {project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <ul aria-label="Tecnologías" className="mt-auto flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-border px-2.5 py-1 font-mono text-xs"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          id="contacto"
          aria-labelledby="contacto-title"
          className={section}
        >
          <h2
            id="contacto-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Contacto
          </h2>
          <p className="mt-4 max-w-prose text-muted">
            ¿Tienes una propuesta o una pregunta? Escríbeme y te responderé por
            correo.
          </p>
          <ContactForm />
        </section>
      </main>

      <footer className={`${container} flex justify-between border-t border-border py-8 text-sm text-muted`}>
        <span>Marc Pérez</span>
        <a href="#inicio" className={linkClass}>Volver arriba</a>
      </footer>
    </>
  );
}

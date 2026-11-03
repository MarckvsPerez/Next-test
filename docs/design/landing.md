# Landing: Marc Pérez

Design spec for the home (`src/app/page.tsx`). `designer` decides the what and the why; `front` decides the how. All visible copy is Spanish and is final unless marked as placeholder.

Visual direction: extend what's already there. Monochrome on top of `--background` / `--foreground`, Geist Sans, a lot of whitespace, no accent colour. The only colours are semantic: error, success and focus.

---

## 0. Prerequisites in the layout (front, `src/app/layout.tsx` and `globals.css`)

| What | Why |
|---|---|
| `<html lang="es">` (it's `en` right now) | Screen readers pronounce the Spanish copy with the wrong voice. WCAG 3.1.1. |
| `metadata.title = "Marc Pérez"`, `description` = the hero tagline | The tab and search results still say "Create Next App". |
| `body { font-family: var(--font-sans), system-ui, sans-serif; }` instead of `Arial` | Geist is loaded but `globals.css` overrides it with Arial on `body`. |
| `html { scroll-behavior: smooth }` only inside `@media (prefers-reduced-motion: no-preference)` | Smooth scrolling to anchors is vestibular motion. |

---

## 1. Structure and hierarchy

### Order

1. **Skip link** "Saltar al contenido" → `#contenido` (`<main id="contenido">`). Visually hidden until it gets focus.
2. **Header** (`<header>`): name as a text link to `#inicio` + `<nav aria-label="Principal">` with three anchors: Sobre mí, Proyectos, Contacto.
3. **Hero** (`<section id="inicio" aria-labelledby="hero-title">`): the h1, tagline, two CTAs.
4. **Sobre mí** (`<section id="sobre-mi" aria-labelledby="sobre-mi-title">`).
5. **Proyectos** (`<section id="proyectos" aria-labelledby="proyectos-title">`).
6. **Contacto** (`<section id="contacto" aria-labelledby="contacto-title">`): intro + form.
7. **Footer** (`<footer>`): "Marc Pérez" + "Volver arriba" link → `#inicio`.

### Single h1: the name

`<h1 id="hero-title">Marc Pérez</h1>`, with the tagline in a `<p>` below it.

Why the name and not the tagline:
- It's a personal page. The name is what identifies the document. It matches the `<title>` and it's what someone using a screen reader hears when jumping by headings.
- The tagline is placeholder and will change. The h1 shouldn't depend on copy that isn't written yet.
- This removes the current template's duplication (a small "Marc Pérez" `<p>` above an unrelated h1).

Heading tree: `h1` name → `h2` Sobre mí / Proyectos / Contacto → `h3` title of each project. Don't skip levels.

### Navigation: yes, simple and not sticky

The page has four blocks and the form is at the end. On mobile that's a lot of scroll, so the anchors help. It's **not sticky**: with three links it doesn't pay for the space it would take up on mobile, and it avoids translucency and blur (see `prefers-reduced-transparency`). Every section gets `scroll-margin-top: 1.5rem` so the h2 isn't stuck to the edge when you jump.

On mobile (< 640px) the three links fit in one row next to the name at `text-sm`. No hamburger menu.

---

## 2. Responsive layout (mobile first)

Common container: `mx-auto w-full max-w-3xl px-6` (`sm:px-8`). One column to read in. Text paragraphs `max-w-prose`.
Vertical spacing between sections: `py-16` → `sm:py-24`. Separator between sections: `border-t border-border`.
Minimum touch target: **44 × 44 px** (`min-h-11`) for nav links, CTAs, the button and inputs.

### Header
- Mobile: `flex justify-between items-center py-4`. Name `text-sm font-semibold`, nav `flex gap-4 text-sm text-muted`, hover and current page → `text-foreground`.
- `sm+`: same, `gap-6`.

### Hero
- Mobile: `pt-16 pb-16`, left-aligned (no centring, so it lines up with the sections below).
- h1: `text-4xl sm:text-5xl font-semibold tracking-tight`.
- Tagline: `mt-4 text-lg sm:text-xl text-muted max-w-prose`.
- CTAs: `mt-8 flex flex-col gap-3 sm:flex-row`. Full width on mobile, auto width on `sm+`.
  - Primary "Escríbeme" → `#contacto`: `bg-foreground text-background`, hover `bg-foreground-hover`, `rounded-full h-12 px-5`.
  - Secondary "Ver proyectos" → `#proyectos`: `border border-border-strong`, hover `bg-surface`, same size.

### Sobre mí
- h2 `text-2xl font-semibold tracking-tight`.
- 2 to 3 paragraphs `mt-4 space-y-4 text-base leading-7 text-muted max-w-prose`.

### Proyectos
- Grid: `grid gap-4 mt-8` → `sm:grid-cols-2`. With a 3xl container, two columns is the maximum before cards get too narrow.
- Card: `<article>` with `rounded-xl border border-border bg-surface p-6 flex flex-col gap-3`.
  - `h3` title `text-lg font-semibold`. **If there's a link**, the title is the link (`<a>` inside the h3, with `after:absolute after:inset-0` to make the whole card clickable while keeping a single interactive element; the card is `relative`). Card hover → `border-border-strong`.
  - Description `text-sm leading-6 text-muted`, at most ~160 characters.
  - Tags: `<ul aria-label="Tecnologías">` with `<li>` items `text-xs font-mono rounded-full border border-border px-2.5 py-1`. `mt-auto` so they line up at the bottom.
  - External link: same tab. If front uses `target="_blank"`, add the sr-only text "(se abre en una pestaña nueva)" and a visible ↗ icon with `aria-hidden`.
- **Empty state** (empty array in the data file): hide the grid and show `<p class="text-muted">Pronto añadiré proyectos aquí.</p>`. Keep the section so the "Proyectos" anchor still works.
- There's no loading or error state: the content is static and lives in the repo.

#### Data model (front puts it in `src/lib/`, for example `src/lib/content.ts`)

```ts
type Project = {
  title: string;        // required, ~40 characters max
  description: string;  // required, ~160 characters max
  tags: string[];       // 0 to 5; if empty, the <ul> isn't rendered
  href?: string;        // optional; without href the card isn't interactive
};
```

Placeholder content: **don't invent biographical data or real projects**. Use self-describing text such as `"Proyecto de ejemplo 1"`, `"Descripción breve del proyecto: qué problema resuelve y cuál fue tu papel."`, tags `["Etiqueta"]`. The tagline and "Sobre mí" also come from the same file, with placeholders like `"Frase breve que resume a qué te dedicas."`.

### Contacto
- h2 "Contacto" + intro `text-muted`: "¿Tienes una propuesta o una pregunta? Escríbeme y te responderé por correo."
- Form `mt-8 grid gap-6`, one column at every width (three fields don't justify two columns).
- Field: `<label>` above (`text-sm font-medium`), input below `mt-2 w-full min-h-11 rounded-lg border border-border-strong bg-background px-3 text-base`. Use `text-base` (16px) so iOS doesn't zoom on focus.
- Textarea: `rows={6}`, `resize-y`, `min-h-36`.
- Button: `justify-self-start` on `sm+`, `w-full` on mobile, same primary style as the hero CTA.
- Result region below the button (see §4).

### Footer
- `border-t border-border py-8 text-sm text-muted flex justify-between`. "Marc Pérez" + "Volver arriba".
- **No dynamic year** (`new Date()`): with `cacheComponents: true` it would make the render dynamic for no reason. If a year is wanted, use a literal.

---

## 3. Tokens

### Existing (in use)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` | page, inputs |
| `--foreground` | `#171717` | `#ededed` | main text, primary button |
| `--font-sans` / `--font-mono` | Geist | Geist | text / tags |

### New (front adds them in `:root`, in the dark media query and in `@theme inline` as `--color-*`)

| Token | Light | Dark | Use and justification | Contrast checked |
|---|---|---|---|---|
| `--muted` | `#52525b` | `#a1a1aa` | secondary text (tagline, paragraphs, hints). Replaces the template's loose `zinc-*` | 7.7:1 on bg (light) · 7.8:1 (dark) |
| `--surface` | `#fafafa` | `#171717` | project cards, secondary hover | muted on surface: 7.41:1 · 7.00:1 |
| `--border` | `#e4e4e7` | `#27272a` | decorative separators and card borders | decorative, no minimum |
| `--border-strong` | `#71717a` | `#71717a` | **input and secondary button borders** (WCAG 1.4.11 asks for ≥ 3:1 on control borders) | 4.8:1 · 4.10:1 on bg |
| `--foreground-hover` | `#383838` | `#cccccc` | primary button hover (those were the template's hard-coded hexes) | background on hover: 11.73:1 · 12.33:1 |
| `--ring` | `#2563eb` | `#60a5fa` | focus outline. The only "colour" that isn't monochrome, so focus always stands out | 5.2:1 · 7.79:1 on bg |
| `--danger` | `#b91c1c` | `#f87171` | field error text and borders, error banner text | 6.5:1 · 7.16:1 on bg |
| `--danger-surface` | `#fef2f2` | `#450a0a` | error banner background | danger on it: 5.91:1 · 5.84:1 |
| `--success` | `#15803d` | `#4ade80` | success banner text | 5.0:1 · 10:1 on bg |
| `--success-surface` | `#f0fdf4` | `#052e16` | success banner background | success on it: 4.8:1 · 8.55:1 |

Combinations that aren't in the table but appear in the UI (light · dark):

| Pair | Where | Contrast | Minimum |
|---|---|---|---|
| `border-strong` on `surface` | secondary CTA on hover | 4.63:1 · **3.71:1** | 3:1 |
| `ring` on `surface` | focus on a link inside a project card | 4.95:1 · 7.05:1 | 3:1 |

Values recalculated by `reviewer` with WCAG 2.x relative luminance. The lowest margin is `border-strong` on `surface` in dark (3.71:1): **if `--surface` or `--border-strong` change, recheck that pair first.**

Front replaces every loose `zinc-*`, `black/[.08]` and `#383838` with these tokens.

### Focus (global)
`focus-visible:outline-2 outline-offset-2 outline-ring` on every interactive element (links, CTAs, inputs, button, skip link). Inputs with an error keep the `ring` outline on focus; the red border stays underneath.

---

## 4. Contact form: states

API contract in §6. Form with `noValidate` (custom messages, not the browser's), but keep `required`, `type="email"`, `autoComplete` (`name`, `email`) and `maxLength` as native semantics.

| Field | Label | Type | Hint (visible, under the label) |
|---|---|---|---|
| `name` | Nombre | text, `autoComplete="name"` | none |
| `email` | Correo electrónico | email, `autoComplete="email"`, `inputMode="email"` | none |
| `message` | Mensaje | textarea | counter `0 / 2000` aligned right under the textarea, `text-xs text-muted` |
| `website` | Deja este campo vacío | text, honeypot | hidden off-screen (not `display:none`), `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden` on its wrapper |

Above the first field: `<p class="text-sm text-muted">Todos los campos son obligatorios.</p>` (instead of asterisks).

### 4.1 Idle
Empty fields, no errors, button "Enviar mensaje" active, result region empty but **already present in the DOM**.

### 4.2 Client-side validation (when)
"Late penalty, early reward" rule:
- **On submit**: validate everything. If there are errors, don't send. Show them and move focus to the first field with an error.
- **On blur**: validate the field only if the user has typed something in it (don't mark "required" just for tabbing through an empty field).
- **On input**: if the field **already shows an error**, revalidate on every change so the error disappears as soon as it's fixed. Don't show new errors while the user is typing.
- Client rules = server rules (§6). Trim before validating.

Field error display:
- Input: `aria-invalid="true"`, `border-danger`.
- Message under the input: `<p id="{field}-error" class="mt-2 text-sm text-danger">`, preceded by an error icon with `aria-hidden` (so it doesn't depend on colour alone).
- `aria-describedby="{field}-error"` (and on `message`: `"message-error message-count"`). Only point to the error id while the error exists.

**Acceptance criterion for focus (applies to §4.2 and §4.5):** at the moment focus lands on the field, that field must **already** have `aria-invalid="true"` and `aria-describedby` pointing to an `{field}-error` that's in the DOM with its text. If focus arrives first and React renders the error afterwards, the screen reader announces the label without the error and doesn't repeat it. Move focus after the commit that paints the errors, never in the same handler before it.

### 4.3 Submitting
- Button: text "Enviando…" + a 16px spinner icon on the left (`aria-hidden`). Use **`aria-disabled="true"`** and ignore clicks/submit while sending, **not `disabled`**: `disabled` takes the button out of the tab order and focus gets lost if it was on the button.
- Fields stay editable (don't `disabled` them either). Changes made while sending don't affect the request in flight.
- The result region is cleared when sending starts.
- Client timeout: 15 s (`AbortController`). If it fires, it counts as a network error (§4.6).
- Spinner under `prefers-reduced-motion: reduce`: no rotation (static icon); the "Enviando…" text is enough.

### 4.4 Success (200)
- **Reset the form** (fields empty, counter at 0, no errors). Focus stays on the button.
- Banner inside `#contact-status` (polite region, §7): `bg-success-surface text-success rounded-lg p-4 text-sm`, check icon `aria-hidden`.
- Copy: **"Mensaje enviado. Gracias por escribir, te responderé lo antes posible."**
- The banner stays until the next submit. It doesn't disappear on its own (a timer is a problem for anyone reading slowly).

### 4.5 Per-field errors from the server (400 `validation_error`)
- Same visual treatment as client-side errors (§4.2), using the copy from §5 mapped from `errors[field]`. Ignore the `message` property in the response: it's not UI copy.
- Keep what the user typed.
- Focus on the first field with an error, in DOM order (name → email → message).
- The result region **doesn't** show a banner (the focus and the `aria-describedby` already announce the error, and a banner would be a duplicate).

### 4.6 Generic error (network, timeout, 400 `invalid_body`, 413 `payload_too_large`, 5xx, any other non-2xx or non-JSON response)
- Keep the data. Button back to "Enviar mensaje".
- Banner inside `#contact-alert` (alert region, §7): `bg-danger-surface text-danger rounded-lg p-4 text-sm`, icon `aria-hidden`, copy from §5.
- Focus doesn't move (it stays on the button, ready to retry).

### 4.7 Retry
- No dedicated "Reintentar" button: the main button retries. That way there's a single action and a single place to look.
- On retry: clear the banner → submitting state → result.
- The button is never blocked after an error (there's no rate limiting).

---

## 5. Exact copy

### Field errors (`field` + `code` → text)

| Field | `required` | `too_short` | `too_long` | `invalid_format` |
|---|---|---|---|---|
| name | Escribe tu nombre. | El nombre debe tener al menos 2 caracteres. | El nombre no puede superar los 80 caracteres. | n/a |
| email | Escribe tu correo electrónico. | n/a | El correo no puede superar los 254 caracteres. | Escribe un correo válido, por ejemplo nombre@dominio.com. |
| message | Escribe tu mensaje. | El mensaje debe tener al menos 10 caracteres. | El mensaje no puede superar los 2000 caracteres. | n/a |
| unknown code (fallback) | Revisa este campo. | | | |

### Result

| Case | Text |
|---|---|
| Success | Mensaje enviado. Gracias por escribir, te responderé lo antes posible. |
| Network or timeout (`fetch` rejects / `AbortError`) | No se ha podido enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo. |
| 413 `payload_too_large` | El mensaje es demasiado largo para enviarlo. Acórtalo e inténtalo de nuevo. |
| 400 `invalid_body`, 5xx, non-JSON or any other unexpected response | Algo ha fallado al enviar el mensaje. Inténtalo de nuevo en unos minutos. |

Note on 413: with the real form it doesn't happen (each field is limited with `maxLength`); it only appears with a manipulated client. The visible copy **doesn't give any figure** of characters or bytes. The server limit is `CONTACT_LIMITS.bodyBytes` = 32,768 bytes UTF-8. A body at the maximum client limits (80 + 254 + 2000 characters, worst case 4 bytes per character, plus JSON escapes) stays well below that. It has its own copy because "inténtalo de nuevo" without changes would fail again.

### Rest of the copy

| Element | Text |
|---|---|
| Skip link | Saltar al contenido |
| Nav | Sobre mí · Proyectos · Contacto |
| Hero CTA primary / secondary | Escríbeme · Ver proyectos |
| Section h2s | Sobre mí · Proyectos · Contacto |
| Contact intro | ¿Tienes una propuesta o una pregunta? Escríbeme y te responderé por correo. |
| Required note | Todos los campos son obligatorios. |
| Button idle / submitting | Enviar mensaje · Enviando… |
| Counter | `{n} / 2000` |
| Projects empty state | Pronto añadiré proyectos aquí. |
| Footer | Marc Pérez · Volver arriba |

---

## 6. API contract `POST /api/contact` (agreed with `back`, confirmed by the lead)

Source of truth: `src/server/contact/types.ts`. If this table and that file ever disagree, the file wins and this document gets updated.

Request: `Content-Type: application/json`, body `ContactRequest`.

| Field | Type | Rule (after `trim`) | Possible codes |
|---|---|---|---|
| `name` | string | required, 2 to 80 characters | `required`, `too_short`, `too_long` |
| `email` | string | required, valid format, ≤ 254 characters | `required`, `too_long`, `invalid_format` |
| `message` | string | required, 10 to 2000 characters | `required`, `too_short`, `too_long` |
| `website` | string, optional | honeypot: if it has a value → 200 `{ ok: true }` without processing. Always send it empty | n/a |

Responses (`ContactResponse`):

| Status | Body | Front state |
|---|---|---|
| 200 | `{ "ok": true }` | §4.4 Success |
| 400 | `{ "ok": false, "code": "validation_error", "message": string, "errors": { "<field>": "<code>" } }` | §4.5, copy from `errors[field]` |
| 400 | `{ "ok": false, "code": "invalid_body", "message": string }` | §4.6 generic copy |
| 413 | `{ "ok": false, "code": "payload_too_large", "message": string }` (raw body > `CONTACT_LIMITS.bodyBytes` = 32,768 bytes UTF-8) | §4.6 413 copy |
| 5xx / non-JSON / any other | from Next, no guaranteed body | §4.6 generic copy |
| network failure / timeout 15 s | n/a | §4.6 network copy |

No 429 (there's no rate limiting) and no custom 500 body.

- The server returns **stable codes**. The `message` property is for debugging: **never show it in the UI**. The Spanish copy lives only in the front (§5).
- Client validation imports `CONTACT_LIMITS` (and the types with `import type`) from `@/server/contact/types`. The file has no server-only imports, so that's a single source and the limits can't drift apart. The `/ 2000` counter and the native `maxLength` come from there too.

---

## 7. Accessibility (checklist for front and the reviewer)

- [ ] `lang="es"`, single h1, heading levels without gaps, landmarks `header` / `nav` / `main` / `footer`.
- [ ] Working skip link, visible on focus.
- [ ] Visible `<label for>` on every field (no placeholders acting as labels; the form doesn't use placeholders).
- [ ] Errors linked with `aria-describedby` + `aria-invalid`, icon + text (not colour alone).
- [ ] Result region = **two sibling live regions, not nested**, both present and empty from the first render:
  - `<div id="contact-status" role="status" aria-live="polite" aria-atomic="true">`: only the success text goes here.
  - `<div id="contact-alert" role="alert" aria-atomic="true">`: only the generic error text goes here.
  - Only one has content at a time; at the start of every submit both are cleared. The banner's visual styling goes on the inner content, not on the empty container (no padding or background when empty).
  - Why: a `role="alert"` nested inside an `aria-live="polite"` creates two regions for the same text. NVDA + Firefox announce it twice or with the polite priority. Siblings behave the same in VoiceOver and remove the ambiguity.
- [ ] Focus on the first field with an error after a failed submit (client or server), **with `aria-invalid` and `aria-describedby` already applied when focus arrives** (criterion in §4.2).
- [ ] Button with `aria-disabled` while sending (not `disabled`).
- [ ] Honeypot out of the tab order and out of the accessibility tree.
- [ ] Visible focus with `--ring` on everything interactive. Logical tab order = DOM order (skip link → header → hero CTAs → project links → name → email → message → button → footer).
- [ ] Contrast: every pair in §3 ≥ 4.5:1 for text and ≥ 3:1 for control borders.
- [ ] Targets ≥ 44 × 44 px.
- [ ] `prefers-reduced-motion: reduce`: no smooth scroll, static spinner, colour transitions ≤ 150 ms allowed (they aren't displacement). No entrance or on-scroll animations.
- [ ] `prefers-reduced-transparency`: no translucency or blur anywhere on the page, so there's nothing to adapt. If a sticky header with blur is ever added, it needs a solid background under this query.
- [ ] Project link that opens a new tab → announced (sr-only text).

# Landing: Marc Pérez

Design spec for the home (`src/app/page.tsx`). `designer` decides the what and the why; `front` decides the how. All visible copy is Spanish and is final unless marked as placeholder.

Visual direction: **dark only**. Charcoal background (`#2A2A2A`), silver text (`#C0C0C0`), Geist Sans, a lot of whitespace, and **one signal accent, Signal Red (`#E10600`), used only as the fill of the two primary actions** (§3 "Accent: where yes, where no"). Everything else is greyscale; the only other colours are semantic (error, success). There is no light theme and the page does not follow `prefers-color-scheme`.

---

## 0. Prerequisites in the layout (front, `src/app/layout.tsx` and `globals.css`)

| What | Why |
|---|---|
| `<html lang="es">` (it's `en` right now) | Screen readers pronounce the Spanish copy with the wrong voice. WCAG 3.1.1. |
| `metadata.title = "Marc Pérez"`, `description` = the hero tagline | The tab and search results still say "Create Next App". |
| `body { font-family: var(--font-sans), system-ui, sans-serif; }` instead of `Arial` | Geist is loaded but `globals.css` overrides it with Arial on `body`. |
| `html { scroll-behavior: smooth }` only inside `@media (prefers-reduced-motion: no-preference)` | Smooth scrolling to anchors is vestibular motion. |
| `:root { color-scheme: dark; }` in `globals.css` **and** `export const viewport = { colorScheme: "dark", themeColor: "#2A2A2A" }` in `layout.tsx` | Native controls, autofill, scrollbar and the browser UI render dark. The meta tag applies before CSS loads, so there's no light flash. |
| Delete the `@media (prefers-color-scheme: dark)` block; the values in §3 go straight into `:root` | Dark only, by the user's decision. A light OS setting must not change the page. |

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
  - Primary "Escríbeme" → `#contacto`: `bg-accent text-accent-foreground`, hover `bg-accent-hover`, `rounded-full h-12 px-5`.
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
- Button: `justify-self-start` on `sm+`, `w-full` on mobile, same primary style as the hero CTA (`bg-accent text-accent-foreground`, hover `bg-accent-hover`). While submitting (`aria-disabled`) it keeps the same colours; "Enviando…" and the spinner carry the state.
- Result region below the button (see §4).

### Footer
- `border-t border-border py-8 text-sm text-muted flex justify-between`. "Marc Pérez" + "Volver arriba".
- **No dynamic year** (`new Date()`): with `cacheComponents: true` it would make the render dynamic for no reason. If a year is wanted, use a literal.

---

## 3. Tokens

**Rule: dark only. Every token has exactly one value; do not add light values or a `prefers-color-scheme` query.** (This supersedes any older note saying every token needs both values.) The single value is declared directly in `:root` (no `prefers-color-scheme` media query) and exposed in `@theme inline` as `--color-*`. `:root` also declares `color-scheme: dark` (§0).

### Palette

| Token | Value | Use and justification |
|---|---|---|
| `--background` | `#2A2A2A` | Charcoal Grey. Page, inputs, skip link background |
| `--foreground` | `#C0C0C0` | Moonlit Silver. Main text, headings, input text, secondary CTA text |
| `--muted` | `#A0A0A0` | secondary text (tagline, paragraphs, hints, counter, footer, nav at rest). Dimmer than silver so the hierarchy survives, still ≥ 4.5:1 on surface |
| `--surface` | `#333333` | project cards, secondary CTA hover. One step above the background |
| `--border` | `#444444` | decorative separators, card borders, tags. Decorative, no minimum |
| `--border-strong` | `#8A8A8A` | **input and secondary CTA borders**, card hover border (WCAG 1.4.11: ≥ 3:1) |
| `--ring` | `#FFFFFF` | focus outline. Brighter than any text, so focus is never confused with content. Red is **not** valid here (2.89:1) |
| `--accent` | `#E10600` | **new.** Signal Red. Fill of the two primary actions only |
| `--accent-foreground` | `#FFFFFF` | **new.** Text and icon on `--accent` / `--accent-hover`. Silver on red is 2.73:1, so it can't be silver |
| `--accent-hover` | `#C00500` | **new.** Primary action hover. Darker, not lighter: white text stays ≥ 4.5:1 only while the red's luminance is ≤ 0.183, and the base red is already at 0.161 |
| `--danger` | `#FF9A94` | field error text and borders, error banner text. Light coral: much lighter than the accent (2.44:1 between them) so an error never reads as "the brand red", and it's always paired with an icon |
| `--danger-surface` | `#4A2626` | error banner background |
| `--success` | `#6FCF8A` | success banner text |
| `--success-surface` | `#213A28` | success banner background |
| `--font-sans` / `--font-mono` | Geist | text / tags (unchanged) |
| ~~`--foreground-hover`~~ | **removed** | its only use was the hover of the silver primary button, which is now `--accent-hover`. Front deletes it from `:root` and `@theme`; no class may reference `bg-foreground-hover` |

### Contrast of every pair in use

Calculated with WCAG 2.x relative luminance (sRGB linearisation, `(L1 + 0.05) / (L2 + 0.05)`), not estimated. Luminances: background 0.0232, surface 0.0331, foreground 0.5271, muted 0.3515, border-strong 0.2542, accent 0.1614, accent-hover 0.1132, danger 0.4651, danger-surface 0.0298, success 0.4984, success-surface 0.0350.

| Pair (fg on bg) | Where | Contrast | Minimum | |
|---|---|---|---|---|
| foreground on background | body text, headings, inputs, secondary CTA, skip link | 7.89:1 | 4.5 | ✅ |
| foreground on surface | card titles, tags, secondary CTA on hover | 6.94:1 | 4.5 | ✅ |
| muted on background | tagline, paragraphs, nav, counter, footer, required note | 5.49:1 | 4.5 | ✅ |
| muted on surface | card descriptions | **4.83:1** | 4.5 | ✅ lowest text margin |
| border-strong on background | input borders, secondary CTA border | 4.16:1 | 3 | ✅ |
| border-strong on surface | secondary CTA on hover, card hover border | **3.66:1** | 3 | ✅ lowest non-text margin |
| ring on background | focus everywhere (offset 2 px, so it sits on the page) | 14.35:1 | 3 | ✅ |
| ring on surface | focus on a project link inside a card | 12.63:1 | 3 | ✅ |
| accent-foreground on accent | primary CTA and submit button at rest | **4.97:1** | 4.5 | ✅ |
| accent-foreground on accent-hover | primary CTA and submit button on hover | 6.44:1 | 4.5 | ✅ |
| danger on background | field error text, error border on inputs | 7.04:1 | 4.5 | ✅ |
| danger on surface | (reference, if an error ever appears inside a card) | 6.20:1 | 4.5 | ✅ |
| danger on danger-surface | error banner | 6.45:1 | 4.5 | ✅ |
| success on success-surface | success banner | 6.45:1 | 4.5 | ✅ |
| success on background | (reference, in case the banner surface is ever dropped) | 7.50:1 | 4.5 | ✅ |
| danger vs accent | distinguishability, not a text pair | 2.44:1 | n/a | clearly different lightness |

Pairs that are **invalid** and must not appear: accent on background as text, border or ring (2.89:1); accent on surface as text, border or ring, e.g. a red card border (2.54:1); accent on foreground (2.73:1); foreground on accent (2.73:1).

Note on the red button's edge: accent vs background is 2.89:1. That's acceptable because the button is identified by its white label, not by its outline (WCAG 1.4.11 doesn't require the fill boundary when the text identifies the control). Don't make any control that depends only on its red shape.

**If `--surface`, `--muted` or `--border-strong` change, recheck "muted on surface" and "border-strong on surface" first.** If `--accent` or `--accent-hover` change, white on them must stay ≥ 4.5:1 (red luminance ≤ 0.183).

Front replaces every loose `zinc-*`, `black/[.08]` and hard-coded hex with these tokens.

### Accent: where yes, where no

Signal Red is a signal: if it's everywhere, it signals nothing. It appears **exactly twice** on the page, and both are "write to me" actions.

| Uses the accent | Doesn't use the accent (and uses instead) |
|---|---|
| Hero primary CTA "Escríbeme" (`bg-accent`) | Secondary CTA "Ver proyectos" (`border-border-strong`, hover `bg-surface`) |
| Contact submit "Enviar mensaje" (`bg-accent`) | Nav links, header name, footer links (`text-muted` → `text-foreground`) |
| | Focus ring (`--ring`, white) |
| | Input borders, card borders, tags (`--border-strong` / `--border`) |
| | Headings, the h1, any text (`--foreground` / `--muted`) |
| | Field errors and the error banner (`--danger`, coral, never the accent) |
| | Project links and card hover (`border-border-strong`) |
| | Spinner, icons, selection, scrollbar, dividers |

No new accent usage without updating this table first.

### Focus (global)
`focus-visible:outline-2 outline-offset-2 outline-ring` on every interactive element (links, CTAs, inputs, button, skip link). Inputs with an error keep the `ring` outline on focus; the coral `danger` border stays underneath. On the red buttons the white ring is separated from the fill by the 2 px offset, so it's read against the background (14.35:1).

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
- [ ] Contrast: every pair in §3 ≥ 4.5:1 for text and ≥ 3:1 for control borders and focus. Red never used as text, border or ring.
- [ ] `color-scheme: dark` declared (CSS + viewport meta); no `prefers-color-scheme` query left. Native controls and scrollbar render dark.
- [ ] Accent only on the two elements listed in §3 "Accent: where yes, where no".
- [ ] Targets ≥ 44 × 44 px.
- [ ] `prefers-reduced-motion: reduce`: no smooth scroll, static spinner, colour transitions ≤ 150 ms allowed (they aren't displacement). No entrance or on-scroll animations.
- [ ] `prefers-reduced-transparency`: no translucency or blur anywhere on the page, so there's nothing to adapt. If a sticky header with blur is ever added, it needs a solid background under this query.
- [ ] Project link that opens a new tab → announced (sr-only text).

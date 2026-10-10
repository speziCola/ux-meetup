# CLAUDE.md

This repository is a lightweight static marketing site for the UX Meetup Freiburg community, built directly from a Figma homepage reference. The implementation is intentionally plain HTML/CSS/JS with no framework, bundler or build step. This document captures the project's conventions so future design-to-code and Figma MCP work stays aligned with the codebase.

Reference Figma: https://www.figma.com/design/RTa1NOZYSTbJbehzlxKncQ/UX-Freiburg-Meetup?node-id=2707-7938&m=dev

---

## 1) CSS architecture

All styles live in `css/styles.css`, organised in cascade layers. The layer order decides which rule wins, so selectors stay flat (mostly a single class) and `!important` is never needed:

```css
@layer reset, tokens, base, type, layout, components, utilities;
```

| Layer | Contains |
|---|---|
| `reset` | box-sizing, `button{all:unset}`, margin resets for `p, h1–h3, dl, dd, ul` |
| `tokens` | every custom property, theme switching, responsive token overrides |
| `base` | element defaults: `body`, `a`, `:focus-visible`, smooth scroll |
| `type` | one class per Figma text style (`.font-*`) |
| `layout` | `.section`, `.wrap`, `.stack` + gap modifiers |
| `components` | page components and the central responsive `@media` blocks |
| `utilities` | `.font-color-*`, `.measure` — always win over components |

New rules go into the matching layer. Never add unlayered rules: they would beat every layer.

---

## 2) Design tokens (`@layer tokens`)

Tokens are hand-authored CSS custom properties in `:root`. There is no token pipeline, JSON or build tool.

### 2.1 Colors

Two tiers:

1. **Palette primitives** (raw hex, named by hue + step): `--ink-900 … --ink-200`, `--sand-100 … --sand-900`, `--pink-500`, `--red-600`, `--white`.
2. **Semantic tokens** (what components use), each written once with `light-dark(light, dark)`:

```css
--page-bg:light-dark(var(--sand-100),var(--ink-900));
--fg-strong:light-dark(var(--ink-900),var(--white));
```

Semantic names: `--page-bg`, `--fg-strong`, `--fg-regular`, `--fg-light`, `--fg-inverse`, `--fg-brand`, `--surface100`, `--surface200`, `--bg-inverse`, `--chip-*`, `--btn-secondary`, `--btn-primary-bg`, `--btn-on-*`, `--fg-on-brand`, `--brand`, `--stroke`, `--shadow-rgb` (use as `rgb(var(--shadow-rgb) / .2)`).

Components must only use semantic tokens, never primitives or raw hex.

### 2.2 Theming (light / dark)

- `color-scheme` on `:root` selects which side of `light-dark()` applies: `light dark` by default (follows the system live), `[data-theme="light"]` / `[data-theme="dark"]` force one.
- `data-theme` is set from `localStorage` (`uxfr-theme`) by the inline script in `<head>` (before first paint) and by the toggle in `js/main.js`. The key is duplicated in both places — keep them in sync.
- Non-color theme differences (image crossfade, moon/sun icon, logo inversion) use switch tokens: `--light-opacity`, `--dark-opacity`, `--logo-filter`, `--moon-transform`, `--sun-transform`. Their dark values are set in the single dark-switch block in `@layer tokens`; components only read them.
- Browsers without `light-dark()` (before 2024) get the light theme via an `@supports not` fallback block. If you add a semantic color token, add its light value there too.

### 2.3 Typography

- Font: Supreme, self-hosted in `fonts/` as woff2 (ttf fallback), declared in `fonts/fonts.css` (only `@font-face` lives there). The Extrabold weight is preloaded in `index.html`.
- Families: `--font-title`, `--font-body`, `--font-info` (monospace). Weights: `--weight-regular/medium/heavy`.
- Scale: `--text-{xs,sm,md,lg,xl,heading-sm,heading-md,display-xl}` with matching `--leading-*`. **Font sizes and line-heights are in `rem`** so text scales with the visitor's browser font size; comments note the Figma px values (e.g. `/* 14/24 */`).
- Responsive type is done by redefining the size/leading tokens inside the `@media (max-width:720px)` block in `@layer tokens`, not by overriding classes.

### 2.4 Spacing, shape, motion

- Spacing is in `px` on a 4px grid: `--space-N` = N × 4px (`--space-1` 4px … `--space-32` 128px). Plus `--section-pad` (80px, 48px on mobile) and `--gutter` (16px).
- Radius: `--radius-sm` (4px), `--radius-md` (12px), `--radius-pill`.
- Motion: `--dur-theme` (.25s color transitions), `--dur-lift` (button hover), `--ease-spring`.
- Layering: `--z-header`, `--z-menu`.

One-off sizes (portrait 256px, menu 268×312, etc.) stay as raw values in their component.

---

## 3) Type classes (`@layer type`)

One class per Figma text style. Each sets family, weight, size, line-height (and tracking where needed) — never color or layout:

`.font-display-xl`, `.font-heading-md`, `.font-heading-sm`, `.font-stat-number`, `.font-text-xl`, `.font-text-lg`, `.font-text-sm`, `.font-text-xs`, `.font-label`, `.font-eyebrow` (the only one with a color, `--fg-brand`).

Color comes from utilities (`.font-color-regular`, `.font-color-light`) or is inherited. Combine type + component + utility classes in the markup:

```html
<h2 class="font-heading-md measure">…</h2>
<p class="font-text-lg font-color-regular measure">…</p>
<span class="stat-n font-stat-number">361</span>
```

---

## 4) Layout and components

### 4.1 Layout primitives (`@layer layout`)

- `.section` — full-width band with top border and `--section-pad`.
- `.wrap` — centered 1040px content column.
- `.stack` — vertical flex with a gap of 16px. Modifiers: `.stack-xs` (4), `.stack-sm` (8), `.stack-md` (20), `.stack-lg` (24), `.stack-xl` (32). Every `.stack` resets `--stack-gap`, so nested stacks never inherit their parent's gap. Use `.stack` instead of writing new flex-column rules.

### 4.2 Components (`@layer components`)

Components are page-specific classes in `index.html` + `css/styles.css` (no component library, no Storybook). Main ones:

- Buttons: `.btn` base (pill shape, border, centered) + one modifier: `.btn-outline`, `.btn-solid`, `.btn-primary`.
- Header/nav: `.header`, `.nav`, `.navlinks`, `.nav-actions`, `.logo`, `.theme-toggle`.
- Hero: `.hero`, `.hero-art`, `.display`, `.focus-*`, `.subtext`, `.stats`, `.stat`.
- Content: `.card`, `.chips`/`.chip`, `.about`, `.value`, `.rating`, `.bar`, `.domain`, `.team`/`.person`, `.talk`/`.talk-col`, `.email`.
- Mobile floating menu: `.fmenu`, `.fpill`, `.fmenu-links`.
- Legal dialog: `.legal-dialog*`.

**Class names used by `js/main.js` — don't rename without updating the JS:** `.display`, `.focus-text`, `.focus-graphic`, `.focus-shape`, `.focus-tag`, `.talk`, `.fpill`, `.fmenu-links`, state classes `.open` and `.over-talk`, IDs `#fmenu`, `#fmenu-btn`, `#legal-notice`, and the `[data-theme-toggle]` / `[data-open-legal]` attributes.

### 4.3 Responsive

Breakpoints mirror the Figma mobile design: `1100px`, `900px`, `720px` (`max-width`, in px). Component overrides live in the central `@media` blocks at the end of `@layer components`; token overrides (type sizes, `--section-pad`) in `@layer tokens`. Don't scatter media queries through the file.

---

### 4.4 Language (EN / DE)

- English is the source text in `index.html` (also what no-JS visitors and crawlers get). German strings live in `js/i18n.js` (`window.UXFR_I18N.de`), keyed by `data-i18n="key"` (text content) or `data-i18n-label="key"` (`aria-label`). Strings that only JS sets (theme toggle labels) have both `en` and `de` entries.
- Every new piece of visible text needs a `data-i18n` key and a German entry. Text with markup inside must be split into separate elements, each with its own key (see the hero headline: `titlePre` / `titleFocus` / `titlePost`).
- Initial language: saved choice in `localStorage` (`uxfr-lang`), otherwise the first `en`/`de` match in `navigator.languages`, otherwise English. The inline `<head>` script decides this before first paint and sets `<html lang>`; for German it hides the body (`data-i18n-pending`) until `main.js` has swapped the text in.
- The switcher (`.lang-switch`, buttons with `data-lang` + `aria-pressed`) and the theme toggle sit in `.foot-prefs`, the first item of the footer's `.footlinks`. Only a manual click stores a preference.
- At ≤720px (when the floating mobile menu is active) `.foot-prefs` is hidden: the language switcher appears inside the open menu panel (`.fmenu-lang`, bottom-left next to the pill) and the theme toggle is the one in the pill. Both switchers are kept in sync by `main.js` via `[data-lang]`.

## 5) Assets and icons

```text
assets/
  logos/   logo-mark.svg, wordmark.svg, logo-mark-favicon(-dark).svg, sponsor-smashing.svg
  icons/   moon.svg, sun.svg, menu.svg
  images/  hero-art-light.png, hero-art-dark.png, portrait-christopher.png
```

- Logos are `<img>` SVGs (dark artwork); dark mode inverts them via `--logo-filter`.
- UI icons (moon, sun, menu) are inline `<svg>` using `stroke: currentColor`.
- Light/dark image pairs use `.light-only` / `.dark-only` (opacity crossfade driven by the theme switch tokens).
- Images carry `width`/`height` attributes. No optimisation pipeline exists; optimise assets by hand.

---

## 6) Project structure

```text
.
├── index.html        page markup and section composition
├── css/styles.css    tokens, type, layout, components, responsive rules (layered)
├── fonts/fonts.css   @font-face for Supreme (woff2 + ttf)
├── js/i18n.js        German translations (English is in the markup)
├── js/main.js        language + theme switching, focus outline drawing, mobile menu, legal dialog
├── assets/           logos, icons, images
├── README.md
└── CLAUDE.md
```

No framework, no TypeScript, no preprocessor, no CSS-in-JS, no Tailwind. Open `index.html` directly or upload the folder to any static host.

---

## 7) Figma-to-code rules

1. Map Figma text styles to the existing `.font-*` classes; Figma color variables to the semantic tokens; spacing to `--space-*`.
2. Never introduce raw hex, px font sizes or ad hoc spacing in components — add a token if a value is genuinely new, and add new colors as palette primitive + semantic token (light and dark, plus the `@supports not` fallback).
3. Reuse `.section`, `.wrap`, `.stack`, `.card`, `.btn` before writing new layout rules. Add a component class only for a genuinely new pattern.
4. Keep selectors at one class where possible; put the rule in the right layer instead of raising specificity.
5. Maintain dark-mode parity through tokens only — components never contain theme selectors.
6. Keep responsive changes in the central `@media` blocks.
7. Prefer flexbox/grid + tokens over absolute positioning unless the design truly requires it.

The page follows the Figma "Homepage" structure: sticky header → hero (headline, lead, CTA, stats) → about (values + rating card) → community (domains + role chips) → organizers → sponsoring/contact CTA → footer + legal dialog.

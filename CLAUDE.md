# CLAUDE.md

This repository is a lightweight static marketing site for the UX Meetup Freiburg community, built directly from a Figma homepage reference. The implementation is intentionally plain HTML/CSS/JS with no framework or bundler. This document captures the project’s conventions so future design-to-code and Figma MCP work stays aligned with the existing codebase.

Reference Figma: https://www.figma.com/design/RTa1NOZYSTbJbehzlxKncQ/UX-Freiburg-Meetup?node-id=2707-7938&m=dev

---

## 1) Design System Structure

### 1.1 Token definitions

Design tokens are defined centrally in `css/styles.css` in a CSS custom property block (`:root`). The file comment explicitly says the styles were implemented from the Figma homepage and that tokens mirror the Figma variables.

```css
:root {
  --page-bg: #f4f1ef;
  --fg-strong: #151b22;
  --fg-regular: #394c61;
  --fg-light: #4f657e;
  --fg-inverse: #ffffff;
  --fg-brand: #eb0034;
  --brand: #f4466c;
  --stroke: #667d9540;
  --surface100: #ffffff;
  --surface200: #f4f1ef;
  --bg-inverse: #151b22;
  --chip-bg: #ebe7e3;
  --chip-stroke: #d9cfc7;
  --chip-fg-strong: #201914;
  --chip-fg: #755e4b;
  --btn-secondary-bg: #151b22;
  --btn-secondary-fg: #151b22;
  --btn-on-secondary: #ffffff;
  --btn-primary-bg: #f4466c;
  --btn-on-primary: #ffffff;
  --font-title: "Supreme", "Figtree", system-ui, sans-serif;
  --font-body: "Supreme", "Figtree", system-ui, sans-serif;
  --font-info: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
```

This is the source of truth for colors, typography, and major UI treatments. All later styles reference these variables instead of hardcoded values.

Dark mode is handled in two ways:

- automatic system preference via `@media (prefers-color-scheme: dark)`
- manual override through `[data-theme="dark"]` and a persisted `localStorage` theme setting

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --page-bg: #151b22;
    --fg-strong: #ffffff;
    --fg-regular: #c9d2dc;
    --fg-light: #7e91a6;
    --fg-inverse: #151b22;
    --fg-brand: #f4466c;
    --surface100: #283441;
    --surface200: #394c61;
    --bg-inverse: #151b22;
    --chip-bg: #151b22;
    --chip-stroke: #283441;
    --chip-fg-strong: #ffffff;
    --chip-fg: #a5b3c2;
    --btn-secondary-bg: #f4466c;
    --btn-secondary-fg: #f4466c;
    --btn-primary-bg: #151b22;
  }
}
```

#### Token structure used in this codebase

- Tokens are CSS custom properties rather than a separate JSON/TS token package.
- Grouping is semantic, not raw numeric: `--fg-*`, `--surface*`, `--chip-*`, `--btn-*`, `--font-*`.
- Theme variants use the same variable names and override their values per theme.
- No transformation pipeline exists; the site is a hand-maintained token layer, not generated from a design token build tool.

#### Token transformation system

There is no token transformation system, design-token package, or metadata pipeline in this repo.

- No `tokens.json`, `design-tokens.css`, `tailwind.config.*`, `stitches`, `vanilla-extract`, or theme-generator setup is present.
- The design system is effectively a manually curated CSS variable system directly authored in `css/styles.css`.
- Any future Figma-driven updates should preserve the same custom-property model.

### 1.2 Typography tokens and text styles

Typography defaults are also defined in CSS variables and then consumed through reusable classes.

```css
body {
  margin: 0;
  background: var(--page-bg);
  color: var(--fg-strong);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 24px;
  -webkit-font-smoothing: antialiased;
}

.h2 {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 48px;
  line-height: 57.6px;
  letter-spacing: -1px;
  margin: 0;
  text-wrap: balance;
}

.display {
  position: relative;
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 104px;
  line-height: 110%;
  letter-spacing: -2px;
  margin: 0;
  max-width: 850px;
}
```

The design uses a simple type system rather than a full `typography.ts` or component API. Typography is inferred from CSS class names rather than semantic tokens.

---

## 2) Component Library

### 2.1 Where UI components are defined

There is no dedicated component library or React/Vue component tree in this repo. UI patterns are defined in the static markup of `index.html` and the corresponding CSS utility/class names in `css/styles.css`.

Examples:

- header/nav: `.header`, `.nav`, `.navlinks`
- buttons: `.btn-outline`, `.btn-solid`, `.btn-primary`
- cards: `.card`
- chips: `.chip`, `.chips`
- section wrappers: `.section`, `.wrap`, `.head`
- rating blocks and stats: `.stat`, `.rating`, `.bar`

### 2.2 Component architecture

The architecture is page-based and class-driven, not atomic component-driven.

Examples from the HTML:

```html
<header class="header">
  <nav class="nav" aria-label="Main navigation">
    <a class="logo" href="#top" aria-label="UX Meetup Freiburg"> ... </a>
    <div class="navlinks"> ... </div>
    <div class="nav-actions">
      <button class="theme-toggle" type="button" data-theme-toggle ...></button>
      <a class="btn-outline" href="https://www.meetup.com/...">Join the group</a>
    </div>
  </nav>
</header>
```

The CSS layer then provides the shared behavior and visual styling:

```css
.nav {
  width: 100%;
  max-width: 1072px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 16px;
}

.btn-solid {
  display: inline-flex;
  align-items: center;
  background: var(--btn-secondary-bg);
  border: 1px solid var(--btn-secondary-bg);
  color: var(--btn-on-secondary);
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 16px;
  line-height: 32px;
  text-decoration: none;
  align-self: flex-start;
}
```

### 2.3 Documentation / Storybook

There are no Storybook, MDX stories, or component docs in this repo.

- No `*.stories.*` files found.
- No design-system documentation app present.
- The closest thing to a pattern reference is the one-page implementation plus classes in `css/styles.css`.

---

## 3) Frameworks & Libraries

### 3.1 UI frameworks

This is a static HTML/CSS/JS site with no UI framework.

- No React app
- No Vue app
- No Angular app
- No TypeScript build configuration

### 3.2 Styling libraries

The styling is plain CSS, not a CSS-in-JS or utility framework.

- No Tailwind
- No Bootstrap
- No styled-components
- No CSS Modules
- No SCSS toolchain

### 3.3 Build system and bundler

There is no bundler or build step.

This is confirmed by `README.md`:

```md
# UX Meetup Freiburg – One-Pager

Static site built from the Figma file "UX Freiburg Meetup" › Homepage. No build step: open `index.html` in a browser, or upload the whole folder to any web host.
```

The project uses:

- plain `index.html`
- `css/styles.css`
- `js/main.js`
- direct browser execution only

---

## 4) Asset Management

### 4.1 Asset storage and references

Assets are stored under `assets/` and referenced directly in the HTML and CSS.

Examples:

```html
<img class="light-only" src="assets/images/hero-art-light.png" alt="">
<img class="dark-only" src="assets/images/hero-art-dark.png" alt="">
```

```html
<img class="icon logo-mark" src="assets/logos/logo-mark.svg" alt="" width="40" height="40">
```

The repo organizes assets by type:

```text
assets/
  logos/
  icons/
  images/
```

### 4.2 Asset optimization techniques

There is no formal optimization pipeline. The implementation relies on:

- SVGs for logo and icons
- PNG assets for hero art and portraits
- CSS-based theme swaps for dark/light versions of the same visual asset

Examples from `index.html`:

```html
<img class="light-only" src="assets/images/hero-art-light.png" alt="">
<img class="dark-only" src="assets/images/hero-art-dark.png" alt="">
```

and in `css/styles.css`:

```css
.dark-only { opacity: 0 }
.light-only { opacity: 1 }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .dark-only { opacity: 1 }
  :root:not([data-theme="light"]) .light-only { opacity: 0 }
}
```

### 4.3 CDN configuration

There is a Google Fonts CDN used in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;800&family=JetBrains+Mono:wght@400&display=swap">
```

There are no other CDN or asset-hosting conventions in this project.

---

## 5) Icon System

### 5.1 Where icons are stored

Icons are stored under `assets/icons/` and `assets/logos/` as SVG files.

Examples:

- `assets/icons/moon.svg`
- `assets/icons/sun.svg`
- `assets/icons/menu.svg`
- `assets/logos/logo-mark.svg`
- `assets/logos/wordmark.svg`

### 5.2 How icons are imported and used

They are used directly as inline SVG or as regular image elements, depending on the component.

Example from `index.html` for theme toggle:

```html
<button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode">
  <svg class="icon ico-moon" aria-hidden="true" viewBox="0 0 20 20">
    <path d="..."/>
  </svg>
  <svg class="icon ico-sun" aria-hidden="true" viewBox="0 0 20 20">
    <path d="..."/>
  </svg>
</button>
```

And for logos:

```html
<span class="logo-svg" aria-hidden="true">
  <img class="icon logo-mark" src="assets/logos/logo-mark.svg" alt="" width="40" height="40">
  <img class="icon logo-word" src="assets/logos/wordmark.svg" alt="" width="127" height="14">
</span>
```

### 5.3 Naming conventions

There is a simple naming convention:

- `logo-mark.svg`, `wordmark.svg`
- `moon.svg`, `sun.svg`, `menu.svg`
- `logo-mark-favicon.svg`, `logo-mark-favicon-dark.svg`

The naming is purpose-driven and consistent with their role, not generated by a build tool or icon package.

---

## 6) Styling Approach

### 6.1 CSS methodology

This project uses a plain, global CSS approach with opinionated utility-like classes and section-specific styling. There is no CSS Modules, SCSS, CSS-in-JS, or utility framework.

Core patterns:

```css
.section {
  border-top: 1px solid var(--stroke);
  padding: 80px 16px;
  display: flex;
  justify-content: center;
  position: relative;
}

.wrap {
  width: 100%;
  max-width: 1040px;
  position: relative;
}
```

This “layout primitives + class composition” pattern is the dominant style approach.

### 6.2 Global styles

`css/styles.css` includes global reset and base rules:

```css
* { box-sizing: border-box; }
button { all: unset; box-sizing: border-box; cursor: pointer; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--page-bg);
  color: var(--fg-strong);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 24px;
}
```

These rules define the foundation and keep all page-level styling centralized in one stylesheet.

### 6.3 Responsive design implementation

Responsive logic is handled in `@media` breakpoints that map to the Figma mobile design, especially for widths around 900px and 720px.

```css
@media (max-width: 900px) {
  .about { flex-direction: column; }
  .rating { width: 100%; }
  .team { flex-direction: column; }
  .person { flex-direction: row; align-items: center; }
}

@media (max-width: 720px) {
  .navlinks { display: none; }
  .hero-art { right: 0; top: 32px; bottom: auto; width: 360px; height: 265px; }
  .display {
    font-size: clamp(46px, 14.5vw, 104px);
    line-height: 1;
    letter-spacing: -1px;
  }
}
```

The responsive implementation is not component-based or framework-driven; it is a central, breakpoints-based stylesheet pattern.

---

## 7) Project Structure

### 7.1 Overall organization

```text
.
├── index.html
├── README.md
├── css/
│   └── styles.css
├── fonts/
│   ├── fonts.css
│   └── *.woff2 / *.ttf fonts
├── js/
│   └── main.js
├── assets/
│   ├── icons/
│   ├── images/
│   └── logos/
└── CLAUDE.md
```

This is a single-page marketing site with a very flat structure. There is no app shell, no routing layer, and no component directory.

### 7.2 Feature organization patterns

The organization is intentionally simple:

- `index.html` contains page structure and sections
- `css/styles.css` contains all design tokens, layout primitives, and visual behavior
- `js/main.js` contains UI behavior (theme toggle, floating mobile menu, legal dialog)
- `assets/` stores static visual resources

This is a classic “static marketing site” pattern, not a framework-based feature architecture.

---

## 8) Figma-to-code integration rules for this project

The design system is highly compatible with Figma MCP workflows because it already mirrors the Figma-defined variables and section structure. The repo should be treated as a CSS variable + semantic utility system, not as a fully componentized design system.

### Preferred mapping strategy

1. Match Figma layers to existing semantic classes in `css/styles.css` before creating new styles.
2. Reuse tokens from the `:root` token block rather than introducing ad hoc raw colors.
3. Preserve the section-based architecture in `index.html` and only add new class names when a new pattern genuinely needs it.
4. Maintain dark mode parity using theme variables and the same `data-theme` pattern.
5. Keep responsive rules in the same `@media` style as the current file rather than introducing a separate mobile CSS system.
6. Use the Figma visual target as a guide, but express the implementation in project-native layout patterns (flexbox/grid + CSS variables), not as absolute-position-heavy structures unless absolutely required.

### Figma design match expectations

The implementation currently follows the Figma “Homepage” structure closely:

- sticky header with navigation
- hero section with large headline, lead copy, CTA, stats strip
- about section with two-column split and rating card
- community section with domain tags and role chips
- organizer section
- sponsorship/contact CTA
- footer and legal dialog

This means future Figma changes should reuse the same section composition and token language instead of inventing a new design system.

### Example of the project’s core pattern

```css
/* Token source of truth */
:root {
  --brand: #f4466c;
  --page-bg: #f4f1ef;
  --fg-strong: #151b22;
  --stroke: #667d9540;
}

/* Reusable layout utility */
.section {
  border-top: 1px solid var(--stroke);
  padding: 80px 16px;
}

/* Reusable component */
.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-on-primary);
  border-radius: 999px;
}
```

This is the canonical pattern to keep when integrating new Figma screens or components.

---

## 9) Key file references

- `index.html` — page markup and section composition
- `css/styles.css` — token definitions, global styles, reusable classes, responsive rules, dark mode rules
- `js/main.js` — theme toggling, floating menu behavior, interactions
- `fonts/fonts.css` — font-face declarations for Supreme
- `README.md` — project summary and usage notes
- `assets/` — static images, icons, and logo resources

---

## 10) Summary

This repo is best understood as a token-first, class-driven, static marketing site. The design system is centralized in CSS custom properties, with no framework or component library to abstract away the visual design. The main integration rule for future Figma work is: stay within the existing token system and the existing section/class conventions; do not introduce a different styling paradigm unless the target design requires a true new pattern.

For MCP/Figma implementations, the safest workflow is:

- read the Figma structure and screenshot
- map layers to existing semantic classes
- reuse the current CSS variables and layout utilities
- only add minimal new selectors when a design truly differs from the established pattern

# UX Meetup Freiburg – uxmf.de

Static site built from the Figma file "UX Freiburg Meetup" › Homepage. Hosted on GitHub Pages; every page is a plain committed HTML file.

## Editing

1. Edit `index.html` (English page, markup + inline CSS) and/or the files in `content/`.
2. Run `node tools/build.mjs` (Node 18+, no install needed). It regenerates the German page, the legal pages, `sitemap.xml` and the SEO/events regions in `index.html`.
3. Preview through a local server at the repo root (e.g. `npx http-server`), then commit everything.

## Structure

```
index.html              English home: markup + all styles and design tokens (inline <style>)
content/site.json       site facts, page URLs, titles + descriptions (EN/DE)
content/de.json         German strings (keys = data-i18n attributes in index.html)
content/events.json     meetups → events section + Event structured data (empty = hidden)
content/events.example.json   example entry with every field
content/legal/          texts of Impressum / Legal notice / Datenschutz / Privacy
tools/build.mjs         page generator
de/  impressum/  datenschutz/  en/legal-notice/  en/privacy/   generated pages (don't edit)
sitemap.xml  robots.txt  site.webmanifest
js/main.js              theme toggle, language preference, floating mobile menu
fonts/                  Supreme (.woff2 subset, .ttf fallback); @font-face rules are in index.html
assets/
  logos/
    logo-mark.svg  wordmark.svg               header/footer logo
    logo-mark-favicon(-dark).svg              favicons
    apple-touch-icon.png  icon-192/512.png    app icons, structured-data logo
    sponsor-smashing.svg                      sponsor logo
  icons/
    moon.svg  sun.svg  menu.svg
  images/
    hero-art-{light,dark}.webp / .png                        pixelated triangles behind the headline
    portrait-christopher-{160,256,306}.{avif,webp} / .png    organizer photo
    og-image-{en,de}.png                                     1200×630 social preview images
```

## Still to do

- Impressum / Legal notice: add the postal address required by § 5 DDG (`content/legal/legal.*.html`).
- Privacy policy: replace the placeholder text in `content/legal/privacy.*.html`, then set `"noindex": false` for `privacy` in `content/site.json`.

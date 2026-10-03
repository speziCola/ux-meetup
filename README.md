# UX Meetup Freiburg – One-Pager

Static site built from the Figma file "UX Freiburg Meetup" › Homepage. No build step: open `index.html` in a browser, or upload the whole folder to any web host.

## Structure

```
index.html              page markup
css/styles.css          all styles + design tokens (light/dark, from Figma variables)
js/main.js              theme toggle + floating mobile menu
fonts/fonts.css         @font-face for Supreme (put the .woff2 files next to it)
assets/
  logos/
    logo-mark.svg       header/footer logo symbol
    logo-mark-favicon.svg light-theme favicon
    logo-mark-favicon-dark.svg dark-theme favicon
    wordmark.svg        "UX Meetup Freiburg" lettering
    sponsor-smashing.svg  sponsor logo
  icons/
    moon.svg  sun.svg  menu.svg
  images/
    hero-art-light.png  hero-art-dark.png   pixelated triangles behind the headline
    portrait-christopher.png                organizer photo (306×306)
```

## Swapping assets

- **Icons & logo:** replace the SVG files, keep the file names. Keep them single-color and dark
  (like the originals) – in dark mode a CSS filter turns them white automatically.
  If a new SVG has a different size or aspect ratio, adjust `width/height` in the
  "icons & logo" block at the end of `css/styles.css`.
- **Images:** replace the PNG/JPG or point the `src` in `index.html` to the new file.
  Use 2× size for sharp results on retina screens (e.g. portrait 612×612).
- **Sponsor logo:** if you switch to SVG, change the `src` in `index.html` (search for "Smashing").

## Fonts

The design uses **Supreme** (Fontshare). Download it from https://www.fontshare.com/fonts/supreme
and save `Supreme-Regular.woff2`, `Supreme-Medium.woff2` and `Supreme-Extrabold.woff2` into `/fonts`.
Until then Figtree (Google Fonts) is used as fallback. JetBrains Mono (focus tag) also loads from Google Fonts.

## Still placeholder

- Contact email `contact@example.com`
- Organizer cards 2 and 3 (currently copies of Christopher)
- Legal notice / Privacy links (required for a public site in Germany)

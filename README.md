# UX Meetup Freiburg – One-Pager

Static site built from the Figma file "UX Freiburg Meetup" › Homepage.

## Structure

```
index.html              page markup + all styles and design tokens (inline <style>, light/dark, from Figma variables)
js/i18n.js              German translations
js/main.js              language + theme switching, floating mobile menu, legal dialog
fonts/                  Supreme (.woff2 subset, .ttf fallback); @font-face rules are in index.html
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
    hero-art-{light,dark}.webp / .png       pixelated triangles behind the headline (WebP lossless, PNG fallback)
    portrait-christopher-{160,256,306}.{avif,webp} / .png   organizer photo
```

## Still placeholder

- Contact email `contact@example.com`

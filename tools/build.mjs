#!/usr/bin/env node
/*
  Static page generator for uxmf.de – plain Node (≥18), no dependencies.
  Run after editing index.html or anything in content/:   node tools/build.mjs

  Sources (edit these):
    index.html                English home page. Hand-edited, except the two marked regions
                              <!-- build:head --> and <!-- build:events -->, which this script rewrites.
    content/site.json         site facts, page URLs, titles/descriptions, events strings
    content/de.json           German strings, keyed like the data-i18n / data-i18n-label attributes
    content/events.json       meetups (see content/events.example.json); empty → no events section
    content/legal/*.html      bodies of the legal pages ({legal,privacy}.{en,de}.html)

  Output (generated – don't edit by hand):
    index.html (regions), de/index.html, en/legal-notice/, impressum/, en/privacy/, datenschutz/, sitemap.xml
*/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { const f = path.join(ROOT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); console.log('  wrote', p); };
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex').slice(0, 8);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = obj => `<script type="application/ld+json">${JSON.stringify(obj, null, 2).replace(/</g, '\\u003c')}</script>`;
const warnings = [];
const warn = msg => warnings.push(msg);

const site = JSON.parse(read('content/site.json'));
const de = JSON.parse(read('content/de.json'));
const events = JSON.parse(read('content/events.json'));
const LANGS = ['en', 'de'];
const other = lang => (lang === 'en' ? 'de' : 'en');
const pagePath = (page, lang) => site.pages[page][lang].path;
const abs = p => site.origin + p;
const asset = p => `${abs(p)}?v=${hash(p.replace(/^\//, ''))}`;
const pick = (value, lang) => (value && typeof value === 'object' ? value[lang] ?? value.en : value);

// ── regions ───────────────────────────────────────────────────────────────
const replaceRegion = (html, name, content) => {
  const re = new RegExp(`(<!-- build:${name}\\b[^>]*-->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!re.test(html)) throw new Error(`region build:${name} not found in index.html`);
  return html.replace(re, (m, start, end) => `${start}\n${content}${content ? '\n' : ''}${end}`);
};

// ── <head> SEO block ──────────────────────────────────────────────────────
function headBlock(page, lang) {
  const seo = site.seo[lang];
  const meta = page === 'home' ? seo.home : seo[page];
  const self = abs(pagePath(page, lang));
  const noindex = site.pages[page][lang].noindex;
  if (meta.title.length > 60) warn(`${page}/${lang}: title is ${meta.title.length} chars (aim for ≤ 60)`);
  if (meta.description.length > 160) warn(`${page}/${lang}: description is ${meta.description.length} chars (aim for ≤ 160)`);
  const lines = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    noindex && `<meta name="robots" content="noindex, follow">`,
    `<link rel="canonical" href="${self}">`,
    ...(noindex ? [] : [
      `<link rel="alternate" hreflang="en" href="${abs(pagePath(page, 'en'))}">`,
      `<link rel="alternate" hreflang="de" href="${abs(pagePath(page, 'de'))}">`,
      `<link rel="alternate" hreflang="x-default" href="${abs(pagePath(page, 'en'))}">`,
    ]),
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${self}">`,
    `<meta property="og:locale" content="${seo.locale}">`,
    `<meta property="og:locale:alternate" content="${site.seo[other(lang)].locale}">`,
    `<meta property="og:image" content="${asset(seo.ogImage)}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${asset(seo.ogImage)}">`,
    `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}">`,
  ];
  if (page === 'home') lines.push(jsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.origin}/#organization`,
        name: site.name,
        url: `${site.origin}/`,
        logo: { '@type': 'ImageObject', url: abs(site.logo), width: 512, height: 512 },
        image: abs(seo.ogImage),
        description: seo.orgDescription,
        foundingDate: site.foundingDate,
        email: site.email,
        address: { '@type': 'PostalAddress', addressLocality: site.locality, addressRegion: site.region, addressCountry: site.country },
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: site.email, availableLanguage: ['English', 'German'] },
        sameAs: [site.meetupUrl],
      },
      {
        '@type': 'WebSite',
        '@id': `${self}#website`,
        url: self,
        name: site.name,
        inLanguage: lang,
        publisher: { '@id': `${site.origin}/#organization` },
      },
    ],
  }));
  return lines.filter(Boolean).join('\n');
}

// ── events section + Event JSON-LD ───────────────────────────────────────
const STATUS = { scheduled: 'EventScheduled', cancelled: 'EventCancelled', postponed: 'EventPostponed', rescheduled: 'EventRescheduled', moved_online: 'EventMovedOnline' };
function eventsBlock(lang) {
  if (!events.length) return '';
  const t = site.events[lang];
  const now = Date.now();
  const fmt = new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
  const byStart = (a, b) => new Date(a.start) - new Date(b.start);
  const upcoming = events.filter(e => new Date(e.end || e.start) >= now).sort(byStart);
  const past = events.filter(e => new Date(e.end || e.start) < now).sort(byStart).reverse();
  const card = e => `        <li class="card event">
          <time class="font-label" datetime="${esc(e.start)}">${esc(fmt.format(new Date(e.start)))}</time>
          <h4 class="font-heading-sm">${esc(pick(e.title, lang))}</h4>
          <p class="event-meta font-text-sm">${[e.speaker && `${t.speaker}: ${esc(e.speaker)}`, e.topic && esc(pick(e.topic, lang))].filter(Boolean).join(' · ')}</p>
          ${e.description ? `<p>${esc(pick(e.description, lang))}</p>` : ''}
          ${e.url ? `<a class="font-label" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${t.details}</a>` : ''}
        </li>`;
  const group = (label, list) => list.length ? `      <h3 class="font-label">${label}</h3>\n      <ul class="events">\n${list.map(card).join('\n')}\n      </ul>` : '';
  const ld = events.map(e => {
    if (!STATUS[e.status || 'scheduled']) warn(`event ${e.start}: unknown status "${e.status}"`);
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: pick(e.title, lang),
      description: pick(e.description, lang),
      startDate: e.start,
      endDate: e.end,
      eventStatus: `https://schema.org/${STATUS[e.status || 'scheduled']}`,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: e.venue?.name,
        address: { '@type': 'PostalAddress', streetAddress: e.venue?.street, postalCode: e.venue?.postalCode, addressLocality: site.locality, addressRegion: site.region, addressCountry: site.country },
      },
      image: [abs(e.image || site.seo[lang].ogImage)],
      organizer: { '@type': 'Organization', name: site.name, url: `${site.origin}/` },
      performer: e.speaker ? { '@type': 'Person', name: e.speaker } : undefined,
      isAccessibleForFree: e.free !== false,
      offers: e.free !== false ? { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: e.url } : undefined,
      url: e.url,
      inLanguage: lang,
    };
  });
  return `  <section class="section" id="events">
    <div class="wrap stack stack-lg">
      <div class="stack stack-sm">
        <p class="font-eyebrow">${t.eyebrow}</p>
        <h2 class="font-heading-md">${t.title}</h2>
      </div>
${[group(t.upcoming, upcoming), group(t.past, past)].filter(Boolean).join('\n')}
    </div>
  </section>
  ${jsonLd(ld.length === 1 ? ld[0] : ld)}`;
}

// ── translation + links ──────────────────────────────────────────────────
function translate(html) {
  const used = new Set();
  html = html.replace(/<(\w+)(\s(?:[^>]*?\s)?data-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/g, (m, tag, attrs, key, text) => {
    if (!(key in de)) { warn(`de.json: missing "${key}" (kept English "${text.trim()}")`); return m; }
    used.add(key);
    return `<${tag}${attrs}>${esc(de[key])}</${tag}>`;
  });
  html = html.replace(/<[^>]*\sdata-i18n-label="([^"]+)"[^>]*>/g, (tag, key) => {
    if (!(key in de)) { warn(`de.json: missing label "${key}"`); return tag; }
    used.add(key);
    return tag.replace(/aria-label="[^"]*"/, `aria-label="${esc(de[key])}"`);
  });
  const unused = Object.keys(de).filter(k => !used.has(k));
  if (unused.length) warn(`de.json: unused keys ${unused.join(', ')}`);
  return html.replace('<html lang="en"', '<html lang="de"');
}

function setLinks(html, page, lang) {
  html = html.replace(/<a ([^>]*\bdata-lang-link="(en|de)"[^>]*)>/g, (m, attrs, target) => {
    attrs = attrs.replace(/(^|\s)href="[^"]*"/g, '').replace(/\s?aria-current="page"/g, '').trim();
    return `<a href="${pagePath(page, target)}" ${attrs}${target === lang ? ' aria-current="page"' : ''}>`;
  });
  html = html.replace(/<a href="[^"]*"( data-page-link="(\w+)")/g, (m, rest, target) => `<a href="${pagePath(target, lang)}"${rest}`);
  html = html.replace(/<html lang="(\w+)" data-page="\w+"/, `<html lang="$1" data-page="${page}"`);
  if (page !== 'home') {
    // section anchors and the logo point back to the home page of the same language
    const home = pagePath('home', lang);
    html = html.replace(/href="#top"/g, `href="${home}"`).replace(/href="#([\w-]+)"/g, `href="${home}#$1"`);
  }
  return html;
}

const legalBody = (page, lang) => read(`content/legal/${page}.${lang}.html`).replace(/<!--[\s\S]*?-->\s*/g, '').trim();
const GENERATED = '<!-- Generated by tools/build.mjs from index.html + content/ – edit those, not this file. -->';

// ── build ────────────────────────────────────────────────────────────────
console.log('Building uxmf.de');
let source = read('index.html');
const pages = {};
for (const lang of LANGS) {
  let home = replaceRegion(source, 'events', eventsBlock(lang));
  home = replaceRegion(home, 'head', headBlock('home', lang));
  if (lang === 'de') home = translate(home);
  pages[`home.${lang}`] = setLinks(home, 'home', lang);
}
write('index.html', pages['home.en']);
write('de/index.html', pages['home.de'].replace('<!doctype html>', `<!doctype html>\n${GENERATED}`));

for (const page of ['legal', 'privacy']) {
  for (const lang of LANGS) {
    let html = pages[`home.${lang}`];
    html = replaceRegion(html, 'head', headBlock(page, lang));
    html = html.replace(/<main>[\s\S]*<\/main>/, `<main>\n  <section class="section legal-page">\n    <div class="wrap">\n      <div class="prose">\n${legalBody(page, lang).replace(/^/gm, '        ')}\n      </div>\n    </div>\n  </section>\n</main>`);
    html = setLinks(html, page, lang);
    write(pagePath(page, lang).replace(/^\//, '') + 'index.html', html.replace('<!doctype html>', `<!doctype html>\n${GENERATED}`));
  }
}

// sitemap: indexable pages with hreflang alternates
const urls = Object.keys(site.pages).flatMap(page => LANGS.filter(lang => !site.pages[page][lang].noindex).map(lang => `  <url>
    <loc>${abs(pagePath(page, lang))}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(pagePath(page, 'en'))}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${abs(pagePath(page, 'de'))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pagePath(page, 'en'))}"/>
  </url>`));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);

if (warnings.length) { console.log('\nWarnings:'); for (const w of warnings) console.log('  ⚠', w); }
console.log('Done.');

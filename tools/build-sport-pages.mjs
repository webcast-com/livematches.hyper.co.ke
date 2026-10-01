#!/usr/bin/env node
/* Generates one dashboard page per sport tab from index.html.

     worldwide.html  football.html  nfl.html  basketball.html  tennis.html
     baseball.html  ice-hockey.html  rugby.html  esports.html  cricket.html
     volleyball.html  handball.html  mma.html  formula-1.html

   Flat files in the site root, next to news.html and highlights.html. (They used
   to be folders — /tennis/ — and those addresses are kept as tiny redirect stubs,
   <slug>/index.html, so old links and bookmarks still land on the right page.)

   Every page is index.html with exactly these differences (so the dashboard —
   functionality, display, layout — is identical to the home page):
     - <title>, meta description/keywords/robots, canonical, Open Graph and
       Twitter tags for that sport
     - the visually-hidden sport heading + summary
     - that sport's tab pre-selected in the markup (app.js also derives the sport
       from the URL on boot, so this only avoids a flash before the script runs)
     - a WebPage JSON-LD node
   The sport → URL mapping, titles and descriptions live in sport-pages.js.

   index.html stays the single source of truth: edit it, re-run this script.

     node tools/build-sport-pages.mjs            write the pages
     node tools/build-sport-pages.mjs --check    exit 1 if any page is stale
                                                 (testdata/verify.mjs runs the same check)

   Zero dependencies — node >= 18. */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TOOLSDIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLSDIR, '..');
const require = createRequire(import.meta.url);
export const SportPages = require('../sport-pages.js');

const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Replace exactly one occurrence, or fail loudly: if index.html is restructured
   so a pattern stops matching, a silent no-op would publish a page with the
   home page's metadata. */
function replaceOnce(html, re, replacement, label) {
    const hits = html.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'));
    if (!hits || hits.length !== 1) {
        throw new Error(`build-sport-pages: expected exactly one "${label}" in index.html, found ${hits ? hits.length : 0}`);
    }
    return html.replace(re, () => replacement);
}

export function renderSportPage(indexHtml, page) {
    let h = indexHtml;
    const url = SportPages.urlFor(page.sport);
    const robots = page.covered ? 'index, follow, max-image-preview:large' : 'noindex, follow';

    h = replaceOnce(h, /<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`, 'title');
    h = replaceOnce(h, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(page.description)}">`, 'description');
    h = replaceOnce(h, /<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${esc(page.keywords)}">`, 'keywords');
    h = replaceOnce(h, /<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${robots}">`, 'robots');
    h = replaceOnce(h, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, 'canonical');
    h = replaceOnce(h, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(page.title)}">`, 'og:title');
    h = replaceOnce(h, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(page.description)}">`, 'og:description');
    h = replaceOnce(h, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`, 'og:url');
    h = replaceOnce(h, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(page.title)}">`, 'twitter:title');
    h = replaceOnce(h, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(page.description)}">`, 'twitter:description');

    h = replaceOnce(h, /<h2 id="sport-page-heading">[^<]*<\/h2>/, `<h2 id="sport-page-heading">${esc(page.heading)}</h2>`, 'sport heading');
    h = replaceOnce(h, /<p id="sport-page-blurb">[^<]*<\/p>/, `<p id="sport-page-blurb">${esc(page.blurb)}</p>`, 'sport blurb');

    // Pre-select this sport's tab in the markup.
    h = replaceOnce(h, /<button class="sport-tab active" data-sport="all">/, '<button class="sport-tab" data-sport="all">', 'active "all" tab');
    h = replaceOnce(h, new RegExp(`<button class="sport-tab" data-sport="${page.sport}">`),
        `<button class="sport-tab active" data-sport="${page.sport}">`, `${page.sport} tab`);

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        url,
        description: page.description,
        isPartOf: { '@type': 'WebSite', name: 'ScoreHub', url: `${SportPages.ORIGIN}/` },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ScoreHub', item: `${SportPages.ORIGIN}/` },
                { '@type': 'ListItem', position: 2, name: page.name, item: url },
            ],
        },
    };
    const websiteAnchor = '<script type="application/ld+json" id="website-jsonld">';
    h = replaceOnce(h, /<script type="application\/ld\+json" id="website-jsonld">/,
        `<script type="application/ld+json" id="sport-jsonld">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n    ${websiteAnchor}`, 'website-jsonld anchor');

    const banner = `<!-- GENERATED from index.html by tools/build-sport-pages.mjs — do not edit by hand; edit index.html and re-run the script. -->\n`;
    return h.replace(/^(<!DOCTYPE html>\s*)/i, `$1${banner}`);
}

/* /tennis/ → /tennis.html. Static hosts cannot be told to redirect from here, so the
   old folder keeps an index.html that forwards (meta refresh + script, keeping the
   query string and hash) and names the new address as canonical. */
export function renderLegacyStub(page) {
    const to = `../${page.slug}.html`;                // relative: works under any base path
    const url = SportPages.urlFor(page.sport);
    return `<!DOCTYPE html>
<!-- GENERATED by tools/build-sport-pages.mjs — this address moved to ${to} -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(page.name)} — ScoreHub</title>
    <link rel="canonical" href="${url}">
    <meta http-equiv="refresh" content="0; url=${to}">
    <script>location.replace(${JSON.stringify(to)} + location.search + location.hash);</script>
</head>
<body>
    <p>This page has moved: <a href="${to}">${esc(page.name)} on ScoreHub</a>.</p>
</body>
</html>
`;
}

export function buildAll({ check = false, root = ROOT } = {}) {
    const indexHtml = readFileSync(path.join(root, 'index.html'), 'utf8');
    const stale = [];
    const written = [];
    for (const page of SportPages.pages) {
        if (!page.slug) continue;                       // the home page is index.html itself
        const outputs = [
            [`${page.slug}.html`, renderSportPage(indexHtml, page)],
            [`${page.slug}/index.html`, renderLegacyStub(page)],
        ];
        for (const [rel, html] of outputs) {
            const file = path.join(root, rel);
            const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
            if (current === html) continue;
            if (check) { stale.push(rel); continue; }
            mkdirSync(path.dirname(file), { recursive: true });
            writeFileSync(file, html);
            written.push(rel);
        }
    }
    return { stale, written };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const check = process.argv.includes('--check');
    const { stale, written } = buildAll({ check });
    if (check) {
        if (stale.length) {
            console.error(`[sport-pages] stale or missing: ${stale.join(', ')} — run: node tools/build-sport-pages.mjs`);
            process.exit(1);
        }
        console.log('[sport-pages] all sport pages are up to date');
    } else {
        console.log(written.length ? `[sport-pages] wrote ${written.length} page(s): ${written.join(', ')}` : '[sport-pages] nothing to do — pages already up to date');
    }
}

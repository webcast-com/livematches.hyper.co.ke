# Search Visibility & Core Web Vitals Upgrade Roadmap

> Companion to `ROADMAP.md` (features) — this one covers **getting pages into
> Google** (only 3 of 16 pages are indexed today), **Core Web Vitals /
> Lighthouse scores**, and the new **Agentic Browsing** category.
>
> Scores as reported (2026-09-30, mobile PSI on the homepage):
> Performance **63** · Accessibility **93** · SEO **100** · Best Practices
> **77** · Agentic browser **1/2**. Desktop: Performance **74** · others
> **93/96/100** · Agentic browser **0/2**.

**How to read this:** every item is **additive and non-breaking** — it must be
shippable behind the existing patterns (static HTML, vanilla JS, graceful
fallback, `node testdata/verify.mjs` green) with no rewrite of the ESPN
transport, no build step in the core app, and no change to any URL a user
already has. Each phase is independently shippable and revertible.

---

## 1. Root-cause diagnosis (evidence, not guesses)

### 1.1 Why only `index.html`, `news.html`, `about.html` are indexed

Every page already has a unique `<title>`, description, self-canonical and
`index, follow` — the meta layer is **not** the problem. The measurable
differences are:

| Evidence | Detail |
|---|---|
| **Content pages are JS-only shells** | Static in-body text per page: `index` 3,585 chars · `about` 2,114 · `terms` 2,445 · `privacy` 1,893 · `shop` 1,498 · `predictions` 1,164 · `standings` 925 · `transfers` 703 · `news` 567 · `highlights` 595 · `previews` 592 · **`match`/`story`/`preview`/`report` 283–291**. The three indexed content pages are exactly the ones whose value doesn't depend entirely on client-side ESPN rendering. Google indexes the shell + whatever its renderer manages; pages whose *entire* content arrives late from a third-party API routinely sit in "Crawled – currently not indexed". |
| **Template URLs render soft-404s** | Bare `match.html`, `preview.html`, `report.html`, `story.html` (still listed in `sitemap.xml`) render "Match unavailable" with no `id=` — four crawlable URLs that return 200 + near-empty content burn crawl trust on a site Google is still evaluating. |
| **Zero `<noscript>` content** | No page has any crawler-safe fallback content; if the renderer's JS run fails or times out (ESPN fetches from Googlebot IPs are slow/blocked), the page is empty. |
| **Shallow internal link graph** | Hub pages link to each other only through the header nav; body-content links between pages are rare (2 per page). Google weights in-content links when deciding what is worth indexing. |
| **Site is ~3 weeks old** | First deploys 2026-09-12. A brand-new domain with no backlinks gets minimal crawl budget; Google indexes the highest-value pages first and defers the rest. Time + the fixes below are both required. |
| **One thing we could NOT verify from the repo** | Whether the live host sends `X-Robots-Tag: noindex` on any page type, and that all 16 URLs return clean 200s. One GSC "URL inspection" on an unindexed page settles this in 2 minutes — do it first (Phase V0). |

### 1.2 Why Performance is 63 (mobile) / 74 (desktop)

| Evidence | Detail |
|---|---|
| **Render-blocking webfont CSS** | `index.html` loads the full Outfit stylesheet (`wght@300..800`, 7 weights) from Google Fonts as a render-blocking stylesheet; `--font-sans` falls back to system fonts, so the download adds latency, not identity. |
| **Render-blocking 145 KB `style.css`** | 6,117 unminified lines parsed before first paint on every page. |
| **241 KB `app.js` + `i18n.js` + `seo.js` + `pwa.js` — synchronous `<script>` tags** | Four parser-blocking scripts at the end of `index.html` (no `defer`); ~290 KB of JS executes on the main thread before the page is interactive → TBT/INP. |
| **`amp-auto-ads` on a non-AMP page** | `index.html` loads `cdn.ampproject.org/v0/amp-auto-ads-0.1.js` + an `<amp-auto-ads>` element. That's AMP-page-only tech; without the AMP runtime it's ~100 KB+ of dead third-party JS that can still inject shifting ad slots. Legacy and removable. |
| **AdSense loader on 12 of 16 pages** | `pagead2.googlesyndication.com/…/adsbygoogle.js` is in the `<head>` of most content pages (async, but heavy main-thread + network cost, and the main source of layout shift when slots fill). `about.html` and the legal pages don't have it — notably the pages that already perform/index best. |
| **Images without intrinsic dimensions** | Generated `<img>` tags (team logos, headshots, flags) have `loading="lazy"` but **no `width`/`height`**, so the browser can't reserve space → CLS. |
| **Subpage heads are inconsistent** | `standings.html` (and several hubs) don't load the Google Fonts stylesheet or AdSense — so per-page Lighthouse results vary for reasons unrelated to layout. |

### 1.3 Why Agentic Browsing is 1/2 (mobile) and 0/2 (desktop)

Lighthouse 13.3+'s Agentic Browsing category has 6 audits, but only 3 carry
weight: **agent accessibility tree**, **CLS**, and **llms.txt** (only scored
*if the file exists*; the three WebMCP audits are weight-0 informational).

- This repo has **no `llms.txt`** → that check is "not applicable", leaving
  exactly **2 scored checks** — which matches the "x/2" display.
- Mobile **1/2**: one of a11y-tree / CLS passes, one fails (ads + images
  without dimensions are the classic CLS killers).
- Desktop **0/2**: both fail — the wide layout surfaces more interactive
  elements to the a11y tree (more chances for a missing name/label) and the
  hero/spotlight/ads shifts are larger on desktop.

So the agentic score is **the same work** as the CLS + accessibility items
below, plus one 30-minute file.

### 1.4 Why Best Practices is 77 (mobile) but 93+ (desktop)

Mobile-only gap is almost always: third-party **console errors / third-party
cookies from the ad + AMP scripts**, and image audits that only trip on the
mobile viewport. Removing `amp-auto-ads` (P1) and the checklist in Phase B
addresses it. **Action: read the exact failing audit list in the PSI report —
don't fix blind.**

---

## 2. Ground rules (how we avoid breaking the app)

1. **Additive HTML/attrs only** in Phases V1–A: new sections, attributes,
   meta tags, one new root file (`llms.txt`). No JS behaviour change.
2. **Script changes are order-preserving**: `defer` keeps execution order and
   runs after parsing (the scripts already sit at the end of `<body>`, so
   nothing may access them earlier — verified by the existing smoke flow).
3. **The ad stack**: only the AMP legacy loader is removed. The working
   `adsbygoogle.js` loader stays; revenue-critical changes (lazy ads) are
   opt-in and measured.
4. **URLs never change.** No page moves, no `?league=` migration, no removal
   of crawlable templates from `robots.txt` (only from `sitemap.xml`).
5. **Every PR**: `node --check` on touched JS, `node testdata/verify.mjs`
   green, manual smoke of every changed page (canned + offline), and one
   before/after PSI run. See §7.
6. One phase per PR, like the main roadmap.

### Explicitly OUT (would risk breaking the app)
- Replacing the ESPN transport, simulation mode, or the PWA/SW caching.
- Introducing a build step/bundler/minifier into the core deploy.
- Moving pages to directory-style URLs (`/standings/premier-league`) — 301s
  on a young domain would slow indexing down, not speed it up.
- Client-side "dynamic rendering" hacks (UA-sniffing cloaking) — against
  Google's guidance.
- Blocking `adsbygoogle.js` or removing monetization outright (Phase P only
  removes the dead AMP loader; the lazy-ads option is opt-in).

---

## Phase V0 — Diagnose on the live host (30 min, do first)

| # | Action | Tool | Why |
|---|--------|------|-----|
| V0.1 | **GSC URL inspection on 3 unindexed URLs** (`standings.html`, `predictions.html`, one `?league=` URL): confirm "URL is available to Google", note the exact "Page indexing" reason shown | Search Console | Tells us whether it's "Crawled – currently not indexed" (expected → content fixes below) or a host-level block (`noindex` header, 5xx, redirect loop) |
| V0.2 | **Check response headers** on one indexed + one unindexed page: `curl -I` for `X-Robots-Tag`, status, canonical host (www vs apex) | Terminal / GSC | Rules out a hosting-layer block in one shot (couldn't be verified from the repo) |
| V0.3 | **Submit `sitemap.xml` in GSC** (if not already) and **request indexing** for the 8 hub pages once Phase V1 ships | Search Console | Kick-starts re-crawl; sitemap submission alone doesn't index pages |
| V0.4 | Confirm GSC verification meta also on the **other** pages (harmless, useful when inspecting from those pages) | Repo | It currently exists only on `index.html` |

## Phase V1 — Indexing quick wins (pure additive HTML, ~1–2 days)

| # | Idea | Where | Effort | Risk | Fallback |
|---|------|-------|--------|------|----------|
| V1.1 ✅ **THE big one** | **Static-first intro block on every hub page**: below the existing H1, add a unique 60–120-word prose section (what the page offers, which leagues, what a user can do) + **3–6 in-body contextual links** to related pages (e.g. Standings → “Premier League table”, “Champions League table”, “Latest news”). This is what the indexed pages have and the rest don't. Zero JS involvement — it renders even if every ESPN fetch fails | All 10 hub pages | M | Very low | N/A (plain HTML) |
| V1.2 ✅ | **`<noscript>` block** on every page: 2–3 sentences + key links, so crawlers with JS rendering disabled/failed still see real content | All pages | S | Very low | N/A |
| V1.3 ✅ | **Sitemap hygiene**: remove the four bare template URLs (`match`, `preview`, `report`, `story` — they render soft-404s); add `<lastmod>` to real pages; keep `?league=` URLs (JS-rendered tables do get indexed, lower priority). Re-submit in GSC | `sitemap.xml` | S | Very low | N/A |
| V1.4 ✅ | **Static JSON-LD per hub page**: `BreadcrumbList` + `CollectionPage`/`WebPage` (and `SportsOrganization` on About). The dynamic `SportsEvent`/`NewsArticle` injection in `seo.js` stays untouched — crawlers that render JS still get the rich data | All pages | S | Very low | N/A |
| V1.5 ✅ | **`llms.txt` at the domain root** (H1 + one-paragraph site summary + markdown links to every hub page — must follow the spec: H1 heading, ≥1 markdown link, not too short, or the agentic audit scores it **worse** than absent). Draft in §6 | `llms.txt` (new) | S | Very low | Absent = not scored; malformed = −1. Get the format right |
| V1.6 | **Crawl-budget guard**: while per-match URLs aren't prerenderable yet, keep them crawlable (they're the future) — no robots change. Revisit after Phase S1 | — | — | — | — |
| V1.7 ✅ | **In-body cross-links in prose** on `about.html` (“see live scores”, “league tables”) — makes the strongest indexed page distribute authority | `about.html` | S | Very low | N/A |

Bonus (part of V1.1): the four template pages (`match/preview/report/story`)
now ship **static seed content inside the JS-render container** — an H1, a
description and on-site links that the page's own script replaces when it
renders. Crawlers that fail/finish before JS see a real page instead of a
283-char shell; JS users notice nothing.

**Shipped — PR-V "Crawlable" (2026-09-30):** V1.1 (intro blocks + links on all
7 hubs + template seeds), V1.2 (noscript on 11 pages), V1.3 (4 template URLs
removed from sitemap, `<lastmod>` added to all 42), V1.4 (static
CollectionPage/WebPage + BreadcrumbList JSON-LD on 12 pages), V1.5
(`llms.txt`), V1.7 (about.html explore-links). verify.mjs 80/80 green;
internal-link and JSON-LD validity checks pass. V0 (GSC actions) is on the
site owner, not in code.

**Expected effect:** this is the difference between "JS shell" and "a page
with content" for every URL. Combined with V0.3 re-submission, hub pages
typically move from *Crawled – currently not indexed* to *Indexed* over
1–4 weeks on a young domain. Set expectations accordingly; nothing in code
forces instant indexing.

## Phase P — Performance quick wins (63 → mid-80s+ mobile)

| # | Idea | Where | Effort | Risk | Fallback / verification |
|---|------|-------|--------|------|------------------------|
| P1 ✅ | **Remove `amp-auto-ads`**: the `<script src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">` + `<amp-auto-ads>` element in `index.html`. AMP-only tech on a non-AMP page; the real AdSense loader (`adsbygoogle.js`) stays and continues to serve auto ads | `index.html` | S | Very low | Verify ad slots still fill for 24 h after deploy; restore tag if revenue dips (it won't — it does nothing here) |
| P2 ✅ | **`defer` on `app.js`, `i18n.js`, `seo.js`, `pwa.js`** (and each page's own script). Order-preserving, runs after parse — removes ~290 KB of parser-blocking main-thread work. The inline theme bootstrap in `<head>` stays as-is | All pages | S | Low | Full smoke: theme persistence, i18n toggle, view restore, offline banner. `verify.mjs` renders pages canned + offline — extend it to assert boot completes |
| P3 ✅ | **Non-blocking webfont**: keep `&display=swap`; load the fonts CSS with `rel="preload" as="style"` + `media="print"` onload-swap + `<noscript>` fallback. Later (S3): self-host a 2-weight subset | All pages with fonts | S | Very low | Visual check that Outfit still applies; system-font fallback already exists in `--font-sans` |
| P4 ✅ | **`preconnect` hints** for the hosts the app actually hits: `site.api.espn.com`, `site.web.api.espn.com`, `cdn.espn.com` (core API), `a.espncdn.com` (logos/headshots), `flagcdn.com` — saves a full DNS+TLS round trip per host on the critical image/fetch path | All pages | S | Very low | N/A (pure hint) |
| P5 ✅ | **`width`/`height` on every generated `<img>`** (team logos, headshots, flags, story images) + `decoding="async"`; reserve space in CSS (`aspect-ratio` already partly in place for badges). Directly attacks CLS **and** the agentic CLS check | `app.js`, `match.js`, `story.js`, hub JS, static pages | M | Low | CLS ~0 in PSI field/lab; verify.mjs extended to assert every `<img>` has dimensions |
| P6 ✅ | **Above-fold static images dimensioned**: 16 `<img>` tags across static pages lack `loading="lazy"` — above-fold ones get explicit dimensions instead, below-fold get lazy | Static pages | S | Very low | N/A |
| P7 ✅ | **Slim `icon-512.png`** (55 KB for an OG image; recompress or export a 1200×630 share default under ~40 KB) | Assets | S | Very low | OG preview check |
| P8 | **Host-level**: confirm the host serves Brotli/gzip + long-lived cache for `*.css/js/png` (automatic on Vercel; check on the current host). If the host can't, this is an infra decision, not a code change | Hosting | S | — | PSI "serve static assets with efficient cache policy" audit |
| P9 *(opt-in, revenue trade-off)* | **Load AdSense on idle/first interaction** instead of in `<head>`. Cuts significant mobile main-thread time, but delays ad viewability — measure revenue for a week before keeping | 12 pages | M | Medium | Default = keep current head loader; the feature ships behind a flag-like constant |
| P10 *(only if P1–P6 insufficient)* | **Split `app.js`**: extract the league-sweep engine into `sweep.js` loaded `defer` after boot render — behind the same interfaces, no rewrite | `app.js` | L | Medium | verify.mjs sweep tests must stay green (210-slug Football tab, queued tab-switch) |

**Shipped — PR-P "Speed" (2026-09-30):** P1 (amp-auto-ads script + element
removed from index), P2 (all 55 local script tags across 16 pages now
`defer` — order-preserving; the one inline script on shop.html was audited
and is self-contained DOM code with no dependency on the deferred externals;
no `readyState`/`currentScript`/`document.write` anywhere), P3 (Outfit CSS
now preload + print/onload-swap + noscript fallback on index — the only page
that loaded it), P4 (preconnect to site.api.espn.com, site.web.api.espn.com,
a.espncdn.com + dns-prefetch flagcdn on the 12 feed pages), P5/P6 (width,
height and `decoding="async"` on every generated `<img>` in 11 JS files,
matched to their CSS boxes; the 14 header logo.svg imgs dimensioned — this
also fixes the story-hero image, the one image that genuinely shifted
layout), P7 (icon-512.png 55K → 39K lossless). P8/P9/P10 intentionally open
(host config / revenue trade-off / only if needed). verify.mjs grew 80 → 83
checks: no amp references, no non-deferred local scripts, every `<img>`
(static and generated) declares width/height.

## Phase A — Accessibility 93 → ~100 + the agentic a11y tree

| # | Idea | Where | Effort | Risk |
|---|------|-------|--------|------|
| A1 ✅ | **"More" dropdown semantics**: the toggle is `<a href="#">` — make it a `<button>` (styled identically) with `aria-expanded`, `aria-controls`, Escape-to-close, outside-click close. Reuse the pattern already shipped for `#nav-toggle-btn` | All pages' headers | S | Very low |
| A2 ✅ | **axe-core sweep per page** (Lighthouse → Accessibility, or `axe` CLI) to name the exact remaining failures — typically: muted-text contrast (`.tagline`, timestamps, capsule labels), heading order, icon-only links. Fix via CSS variable nudges + `aria-label`s only | All pages | M | Very low |
| A3 ✅ | **Skip-to-content link** as the first focusable element (helps keyboard users and agent navigation) | All pages | S | Very low |
| A4 | **Programmatic names for dynamic controls**: card action buttons (share/preview/report capsules), search listbox options (`aria-selected`, active-descendant), prediction result buttons | Generated HTML in JS | M | Low |
| A5 ✅ | **verify.mjs a11y check**: assert every rendered `<button>`/`<a>` has non-empty accessible name (text or aria-label) — makes regressions visible in CI | `testdata/verify.mjs` | S | Very low |

**Shipped — PR-A "Agent-clean" (2026-09-30):** A1 (the More toggle is now a
real `<button type="button">` with `aria-haspopup`/`aria-expanded`/`aria-controls`
pointing at the new `#more-menu`, with a CSS reset so it looks identical — the
JS side already had toggle/outside-click/Escape and now drives a semantic
control), A2 (axe-style sweeps found and fixed: light-theme `--primary`
#0284c7 → **#0273b0**, taking link/tag text from 3.74:1 to 4.70:1 on the page
background and 5.14:1 on cards — this was almost certainly the mobile a11y-93
deduction; the unnamed ×-close modals; the SVG-only filter/sort button, now
`aria-label`ed and kept in sync with its runtime title; and five SVG-only
`href="#"` social icons, now named — their placeholder hrefs want real profile
URLs when the accounts exist), A3 (skip-to-content link as the first focusable
element on all 15 content pages, targets verified), A5 (two new permanent
checks: skip-link presence + target existence, and an accessible-name scanner
over every static page and all 16 JS files — it caught three real failures
while being written). All `outline:none` uses audited — each already swaps in
a visible focus alternative. Heading order verified clean on all pages; both
themes' text tokens ≥4.5:1. verify.mjs 83 → **85 checks**.

## Phase B — Best Practices 77 → 95+ (checklist, not guesswork)

| # | Action | Notes |
|---|--------|-------|
| B1 | **Read the failing audits** in the PSI mobile run — BP is the category where the failing list is short and specific. Fix only what's listed | Likely candidates given the stack: console errors from `amp-auto-ads`, third-party cookies from ad scripts, image aspect-ratio |
| B2 | **Zero-console-error budget**: after P1, run each page offline + canned and clear anything remaining (e.g. the `esm.sh` analytics fetch failing gracefully) | Extends the existing offline-render test |
| B3 ✅ | **`document.execCommand("copy")` in `share.js`** — audited: `copyText()` already tries `navigator.clipboard.writeText` first and keeps execCommand only inside the unsupported-browser fallback. Already conforming; no change needed | S |
| B4 | Image aspect-ratio / resolution audit failures resolve via P5/P6 | — |

## Phase S — Structural upgrades (later, bigger levers)

| # | Idea | Why | Effort | Risk |
|---|------|-----|--------|------|
| S1 ✅✅ **Biggest indexing lever** | **Prerender popular pages as static HTML** — a small Node/GitHub-Action job writes server-side-rendered HTML for: the 8 hub pages, top-20 `standings.html?league=…`, and the week's finished-match `preview/report/story?id=…` pages into the repo before deploy. The JS boot then refreshes over the prerendered content — the exact hydration pattern already proven by the localStorage replay (`scorehub-live-v1`). If prerender data is missing, the page ships as today's shell — never broken | Turns JS-only content into crawlable content for the URLs Google actually values (per-match, per-league). Enables a real news sitemap later | L | Medium (falls back to current shell on any failure) |
| S2 | **News sitemap** (`news-sitemap.xml`) listing the prerendered story URLs | Only meaningful after S1 | S | Very low |
| S3 | **Self-host Outfit** (2 weights, woff2, preload) | Removes the Google Fonts round trip entirely | S | Very low |
| S4 | **Optional minification at deploy** (host-level or pre-minified copies) — only if the host doesn't already minify/Brotli | — | M | Low |
| S5 | **WebMCP declarative tool annotations** (search, standings lookup) | Weight-0 today, informational only — do it last, for future-proofing | M | Low |
| S6 | **Off-page basics** (out of repo scope, listed for completeness): 2–5 real backlinks (local sports communities/directories — it's a Kenyan audience: FKFPL fan forums, r/Kenya), consistent social profiles, Bing Webmaster Tools too (Bingbot is explicitly allowed in robots.txt but often forgotten) | Young domain + zero backlinks is half the indexing story | — | — |

---

## 3. Expected trajectory (honest ranges)

| Metric | Now (mobile) | After V1+P1–P7+A | After S1 |
|---|---|---|---|
| Performance | 63 | **80–90** | 90+ |
| Accessibility | 93 | **97–100** | 100 |
| Best Practices | 77 | **90–100** | 100 |
| SEO | 100 | 100 | 100 |
| Agentic browser | 1/2 | **3/3** (a11y tree + CLS + llms.txt) | 3/3 |
| Indexed pages | 3 of 16 | 8–12 over 1–4 weeks | all meaningful URLs |

Lighthouse scores fluctuate run-to-run (±3–5); the ad stack caps how high
Performance can go with ads in the head — P9 exists for that reason.

## 4. Suggested build order (first 3 PRs)

1. **PR-V "Crawlable"** — V1.1 static intro blocks + V1.2 noscript + V1.3
   sitemap hygiene + V1.4 JSON-LD + V1.5 llms.txt. One PR, pure HTML/one new
   file, zero JS. Then do V0.3 (GSC re-submit + request indexing).
2. **PR-P "Speed"** — P1 (drop amp-auto-ads) + P2 (defer) + P3 (font swap) +
   P4 (preconnects) + P5/P6 (dimensions + lazy). verify.mjs extended.
3. **PR-A "Agent-clean"** — A1 dropdown + A2 axe fixes + A3 skip link +
   A5 a11y-names check + B3 clipboard. Re-run PSI on mobile **and** desktop.

## 5. Verification plan (every PR)

```bash
node --check app.js            # and any touched JS
node testdata/verify.mjs       # full suite (80 checks today) must stay green
```

- Manual smoke: every changed page, canned + offline, zero console errors;
  theme + i18n + view-restore still work after any `defer` change.
- Lighthouse locally, before/after, same URL:
  `npx lighthouse@latest https://livematches.hyper.co.ke/ --preset=perf --form-factor=mobile`
  (plus `--only-categories=accessibility,best-practices,seo` and
  `--only-categories=agentic-browsing` runs).
- GSC: watch *Pages → Why pages aren't indexed* weekly for 4 weeks after
  PR-V; "Crawled – currently not indexed" counts should fall.

## 6. `llms.txt` draft (ships in PR-V)

> ⚠️ The agentic audit fails a malformed file — it **must** start with an
> `# H1`, contain at least one markdown link, and not be too short.

```markdown
# ScoreHub — Live Football Scores, Tables & News

ScoreHub (livematches.hyper.co.ke) is a free live-football site covering
150+ competitions worldwide — the Premier League, LaLiga, Serie A,
Bundesliga, UEFA Champions League, and the Kenyan and Ugandan Premier
Leagues — with real-time scores, fixtures, league tables, match previews,
full-time reports, transfer news, highlights and headlines.

## Pages
- [Live scores](https://livematches.hyper.co.ke/): every match live and today
- [News](https://livematches.hyper.co.ke/news.html): football headlines and stories
- [Standings](https://livematches.hyper.co.ke/standings.html): tables for 30+ leagues
- [Predictions](https://livematches.hyper.co.ke/predictions.html): free fan predictor
- [Previews & reports](https://livematches.hyper.co.ke/previews.html): every fixture covered
- [Transfers](https://livematches.hyper.co.ke/transfers.html): deals and rumours
- [Highlights](https://livematches.hyper.co.ke/highlights.html): video links
- [About](https://livematches.hyper.co.ke/about.html): what ScoreHub is

## Notes for AI agents
- Scores and tables change continuously — cite the page URL with a timestamp.
- All content is free to read; no account is required.
- Data is sourced from ESPN public feeds and credited on-page.
```

## 7. Open questions (answer whenever — roadmap stands regardless)
- Who controls the hosting layer (Vercel? cPanel?) — needed for P8 and S1
  prerender deployment.
- Is ad revenue measurable week-over-week (AdSense reports)? Gates P9.
- Any target deadline (e.g. a matchday event) for when indexing must improve?

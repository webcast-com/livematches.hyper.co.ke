#!/usr/bin/env node
/* Prerender static, crawlable pages from live ESPN data (Phase S1/S2 of
   SEO-PERF-ROADMAP.md). Zero dependencies — node >= 18.

   What it writes (idempotent, deterministic):
     table/<slug>/index.html     full league-table snapshot per league, reusing
                                 standings.js's own parsers/markup via node:vm
     report/<matchId>/index.html finished-match snapshot: scoreline, goal/red-card
                                 timeline, stats table (scoreboard payload only —
                                 no per-match requests)
     preview/<matchId>/index.html upcoming-match snapshot: kickoff, venue, form,
                                 odds where published
     sitemap.xml                 regenerated: static pages + tables + snapshot window
     news-sitemap.xml            story.html?id= URLs from the last 48h (Google news format)

   Hydration rule (non-breaking): these pages are STATIC content pages with
   zero app JS. The interactive pages (standings.html?league=, match.html?id=,
   report.html?id=) keep working exactly as before and stay linked from every
   snapshot. standings.js canonicalises ?league=<slug> to /table/<slug>/ so the
   two consolidate into one indexable URL per league.

   Modes:
     node tools/prerender.mjs                 live run (writes into the repo)
     node tools/prerender.mjs --offline       build from testdata/ samples only
     node tools/prerender.mjs --out /tmp/x    write somewhere else (default: repo root)

   The GitHub Action (.github/workflows/prerender.yml) runs this daily and on
   every push to main, committing the result. */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const argv = process.argv.slice(2);
const OFFLINE = argv.includes('--offline');
const outIdx = argv.indexOf('--out');
const TOOLSDIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = outIdx >= 0 ? path.resolve(argv[outIdx + 1]) : path.resolve(TOOLSDIR, '..');
const NOW = new Date();

/* ------------------------------------------------------------------ config */
const REPORT_DAYS = 7;        // finished matches: last N days
const PREVIEW_DAYS = 3;       // upcoming matches: next N days
const MAX_REPORTS = 40;       // keep the repo bounded; older snapshots pruned
const MAX_PREVIEWS = 40;
const NEWS_HOURS = 48;        // Google news sitemaps: last 2 days
const FETCH_DELAY_MS = 150;   // be polite to the ESPN endpoints
const FETCH_TIMEOUT_MS = 15000;

// Leagues swept for match snapshots (the 30 table leagues + the rest of the
// big-five-adjacent cups the site covers would balloon the sweep; tables are
// the always-fresh asset, matches rotate through this list).
const SWEEP_EXTRA = ['uefa.champions_qual', 'uefa.europa_qual', 'usa.open', 'conmebol.libertadores'];

const STATIC_PAGES = [
    ['', '1.0', 'always'], ['index.html', '1.0', 'always'],
    ['standings.html', '0.9', 'hourly'], ['previews.html', '0.8', 'daily'],
    ['news.html', '0.8', 'hourly'], ['highlights.html', '0.8', 'daily'],
    ['transfers.html', '0.7', 'daily'], ['predictions.html', '0.7', 'daily'],
    ['shop.html', '0.6', 'weekly'], ['about.html', '0.5', 'monthly'],
    ['privacy.html', '0.3', 'yearly'], ['terms.html', '0.3', 'yearly'],
];

const ORIGIN = 'https://livematches.hyper.co.ke';

/* ------------------------------------------------------------------ utils */
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function ymd(d) { return d.toISOString().slice(0, 10); }
function yymmdd(d) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }
function iso(d) { return d.toISOString(); }
function log(msg) { console.log(`[prerender] ${msg}`); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
    const r = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
}

/* ------------------------------------------------- load standings.js helpers
   The file is written to be testable: its parsers and table markup are
   top-level and side-effect free. With `document` lacking addEventListener
   the DOMContentLoaded boot never fires, so loading is side-effect free. */
function loadStandingsHelpers() {
    const code = readFileSync(path.join(TOOLSDIR, '..', 'standings.js'), 'utf8');
    const ctx = vm.createContext({
        console: { log() {}, warn() {}, error() {} },
        window: {},
        document: {},                       // no addEventListener -> no boot
        fetch: OFFLINE ? undefined : fetch, // fetchStandings() uses it live
        t(key) {                            // i18n hook used by tableHTML()
            return { 'table.team': 'Team', 'h1.standings': 'Standings', 'table.loading': 'Loading…' }[key] || key;
        },
    });
    vm.runInContext(code, ctx, { filename: 'standings.js' });
    // Top-level const/let stay in the script's lexical scope (not on the
    // context object), so pull the needed bindings out explicitly.
    const refs = vm.runInContext('({ STANDINGS_LEAGUES, parseStandingsGroups, parseStandings, payloadSeasonLabel, seasonLabelFromSlug, currentSeasonLabel, tableHTML, standingBadgeHTML, fetchStandings })', ctx, { filename: 'standings.js' });
    for (const k of Object.keys(refs)) ctx[k] = refs[k];
    return ctx;
}

/* ------------------------------------------------------------- page chrome */
function pageShell({ lang = 'en', title, description, canonicalPath, breadcrumbName, jsonld = '', bodyHTML, metaJSON }) {
    const canonical = `${ORIGIN}${canonicalPath}`;
    const nav = [
        ['/', 'Live Scores'], ['/news.html', 'News'], ['/standings.html', 'Standings'],
        ['/previews.html', 'Previews &amp; Reports'], ['/predictions.html', 'Predictions'],
        ['/transfers.html', 'Transfers'], ['/highlights.html', 'Highlights'],
        ['/shop.html', 'Shop'], ['/about.html', 'About'],
    ].map(([h, l]) => `<a class="legal-nav-link" href="${h}">${l}</a>`).join('\n                ');
    const stamp = iso(NOW);
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- prerender-meta: ${metaJSON} -->
    <title>${esc(title)}</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="icon" type="image/png" href="/icon-192.png">
    <link rel="manifest" href="/manifest.webmanifest">
    <script>(function(){try{var t=localStorage.getItem("scorehub-theme");if(t==="light"||t===""){document.documentElement.setAttribute("data-theme","light");}}catch(e){}})();</script>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="ScoreHub">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${ORIGIN}/icon-512.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${ORIGIN}/icon-512.png">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"${esc(title)}","url":"${canonical}","isPartOf":{"@type":"WebSite","name":"ScoreHub","url":"${ORIGIN}/"},"breadcrumb":{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${ORIGIN}/"},{"@type":"ListItem","position":2,"name":"${esc(breadcrumbName)}","item":"${canonical}"}]}}</script>${jsonld ? `\n    <script type="application/ld+json">${jsonld}</script>` : ''}
    <style>.snapshot-banner{margin:0 0 16px;padding:10px 14px;border-left:3px solid var(--warning);border-radius:8px;background:rgba(245,158,11,.08);font-size:12.5px;color:var(--text-secondary);}.snapshot-banner a{color:var(--primary);text-decoration:underline;}</style>
</head>
<body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="app-container legal-page">
        <header class="legal-header">
            <a class="legal-brand" href="/"><img src="/logo.svg" alt="ScoreHub logo" width="32" height="32"><span>ScoreHub</span></a>
            <nav class="legal-nav" aria-label="Page navigation">
                ${nav}
            </nav>
            <div class="legal-actions">
                <a class="btn btn-primary btn-sm" href="/">&larr; Live Scores</a>
            </div>
        </header>
        <noscript><div class="noscript-note">This is a static ScoreHub page — everything on it is already loaded. The interactive tools (live scores, pickers) live on the main site.</div></noscript>

        <main class="card legal-card" id="main-content">
            ${bodyHTML}
        </main>

        <footer class="legal-footer">
            <a href="/">Home</a>
            <a href="/news.html">News</a>
            <a href="/standings.html">Standings</a>
            <a href="/previews.html">Previews &amp; Reports</a>
            <a href="/predictions.html">Predictions</a>
            <a href="/about.html">About</a>
            <a href="/privacy.html">Privacy Policy</a>
            <a href="/terms.html">Terms of Use</a>
            <span>&copy; ${NOW.getUTCFullYear()} ScoreHub &middot; Sports data: ESPN. Page generated ${stamp}.</span>
        </footer>
    </div>
</body>
</html>
`;
}

function introLinks(href, label) {
    return `<p>More on ScoreHub: <a href="/">today's live scores</a>, the <a href="/news.html">News Centre</a>, the <a href="/previews.html">previews &amp; reports hub</a> and the free <a href="/predictions.html">predictions game</a>.</p>`;
}

/* ------------------------------------------------------------ table pages */
function tablePageHTML(L, groups, season, generatedNote, vmCtx) {
    const seasonLabel = season || `${NOW.getUTCFullYear()}/${String(NOW.getUTCFullYear() + 1).slice(2)}`;
    const title = `${L.name} Table & Standings — ${seasonLabel} Season | ScoreHub`;
    const description = `${L.name} table (${seasonLabel}): full standings with played, won, drawn, lost, goals for/against, goal difference and points — updated from ESPN data on ScoreHub.`;
    const TH = (rows) => vmCtx.tableHTML(rows);
    const tables = groups.length === 1
        ? TH(groups[0].rows)
        : groups.map((g) => `<h2 class="standings-group-title">${esc(g.name)}</h2>${TH(g.rows)}`).join('');
    const moreTables = [
        ['eng.1', 'Premier League'], ['esp.1', 'La Liga'], ['ita.1', 'Serie A'],
        ['ger.1', 'Bundesliga'], ['fra.1', 'Ligue 1'], ['ken.1', 'Kenyan Premier League'],
    ].filter(([s]) => s !== L.slug)
        .map(([s, n]) => `<a class="legal-nav-link" href="/table/${s}/">${n}</a>`).join('\n                ');
    const body = `
            <h1>${esc(L.name)} Table — ${esc(seasonLabel)} Standings</h1>
            <p class="legal-updated">${esc(L.name)} standings, updated from ESPN data. Data: ESPN.</p>
            <div class="snapshot-banner">Snapshot generated ${generatedNote} from ESPN. This page is static — for the live-updating table with every league chip, open the <a href="/standings.html?league=${esc(L.slug)}">${esc(L.name)} live table</a>.</div>
            <section class="page-intro" aria-label="About this page">
                <p>The complete ${esc(L.name)} table for the ${esc(seasonLabel)} season: position, played, won, drawn, lost, goals for and against, goal difference and points, exactly as published by ESPN. Looking for a different competition? ScoreHub carries live tables for 30+ leagues — <a href="/standings.html">browse them all here</a>.</p>
            </section>
            <div id="standings-table">
                ${tables}
            </div>
            <h2 class="hub-section-title" style="margin-top:18px;">More league tables</h2>
            <div class="chip-row" style="margin-top:8px;">
                ${moreTables}
            </div>
            <p class="legal-content" style="margin-top:14px;">${introLinks()}</p>`;
    const meta = JSON.stringify({ type: 'table', league: L.slug, updated: ymd(NOW) });
    return pageShell({
        title, description,
        canonicalPath: `/table/${L.slug}/`,
        breadcrumbName: `${L.name} Table`,
        bodyHTML: body, metaJSON: meta,
    });
}

/* ------------------------------------------------------------ match pages */
function statLabel(name) {
    return {
        possessionPct: 'Possession', totalShots: 'Shots', shotsOnTarget: 'Shots on target',
        wonCorners: 'Corners', foulsCommitted: 'Fouls', offsides: 'Offsides', saves: 'Saves',
        yellowCards: 'Yellow cards', redCards: 'Red cards', totalPasses: 'Passes',
        accuratePasses: 'Accurate passes',
    }[name] || null;
}

function pairStats(home, away) {
    const get = (c, name) => {
        const s = (c.statistics || []).find((x) => x && x.name === name);
        return s ? (s.displayValue ?? s.value ?? '') : null;
    };
    const names = [];
    for (const c of [home, away]) for (const s of c.statistics || []) {
        if (s && statLabel(s.name) && !names.includes(s.name)) names.push(s.name);
    }
    const order = ['possessionPct', 'totalShots', 'shotsOnTarget', 'wonCorners', 'foulsCommitted', 'offsides', 'saves', 'yellowCards', 'redCards'];
    names.sort((a, b) => (order.indexOf(a) + 99) - (order.indexOf(b) + 99));
    return names.map((n) => `<tr><td>${esc(get(home, n) ?? '—')}</td><td>${statLabel(n)}</td><td>${esc(get(away, n) ?? '—')}</td></tr>`).join('');
}

function eventText(d) {
    if (d.penaltyKick && d.scoringPlay) return '⚽ Penalty';
    if (d.ownGoal) return '⚽ Own goal';
    if (d.scoringPlay) return '⚽ Goal';
    if (d.redCard) return '🟥 Red card';
    if (d.yellowCard) return '🟨 Yellow card';
    return d.type && d.type.text ? d.type.text : 'Event';
}

function timelineHTML(details, home, away) {
    const rows = (details || [])
        .filter((d) => d && (d.scoringPlay || d.redCard || d.yellowCard))
        .map((d) => {
            const who = (d.athletesInvolved || []).map((a) => a.displayName).filter(Boolean).join(', ');
            const side = d.team && d.team.id === home.team.id ? home : away;
            const other = side === home ? away : home;
            return { min: (d.clock && d.clock.value) || 0, html: `<li><strong>${esc(d.clock && d.clock.displayValue || '')}</strong> ${esc(eventText(d))}${who ? ` — ${esc(who)}` : ''} <span class="league-tag">(${esc(side.team.abbreviation || side.team.shortDisplayName || side.team.displayName || '')} ${esc(String(side.score))}–${esc(String(other.score))})</span></li>` };
        })
        .sort((a, b) => a.min - b.min)
        .map((r) => r.html).join('');
    return rows ? `<ol style="padding-left:18px;display:flex;flex-direction:column;gap:6px;">${rows}</ol>` : '<p class="legal-updated">No key events recorded for this match.</p>';
}

function teamBlock(c) {
    const t = c.team || {};
    const logo = (Array.isArray(t.logos) && t.logos[0] && t.logos[0].href) || t.logo || '';
    const badge = logo
        ? `<img class="team-logo-img" src="${esc(logo)}" alt="" width="32" height="32" loading="lazy" decoding="async" onerror="this.remove()">`
        : '';
    const form = c.form ? `<div style="margin-top:6px;font-size:11px;color:var(--text-muted);letter-spacing:2px;">${esc(String(c.form).split('').join(' '))}</div>` : '';
    return `<div style="flex:1;min-width:0;text-align:center;">
        <span class="team-logo-wrap" style="width:48px;height:48px;margin:0 auto;"><span class="player-avatar-mini" style="width:100%;height:100%;">${esc(t.abbreviation || '?')}</span>${badge}</span>
        <div style="font-weight:700;margin-top:6px;">${esc(t.displayName || t.shortDisplayName || '?')}</div>
        ${form}
    </div>`;
}

function matchPageHTML(kind, ev, leagueName, generatedNote) {
    const comp = ev.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === 'home') || comp.competitors[0];
    const away = comp.competitors.find((c) => c.homeAway === 'away') || comp.competitors[1];
    const statusType = (ev.status && ev.status.type) || {};
    const isPost = statusType.state === 'post';
    const dateStr = new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    const venue = [comp.venue && comp.venue.fullName, comp.venue && comp.venue.address && (comp.venue.address.city || comp.venue.address.country)].filter(Boolean).join(', ');
    const attendance = comp.attendance ? ` &middot; Attendance ${Number(comp.attendance).toLocaleString('en-GB')}` : '';
    const scoreline = isPost
        ? `${esc(String(home.score))} – ${esc(String(away.score))}`
        : new Date(ev.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
    const kindNoun = kind === 'report' ? 'Match Report' : 'Match Preview';
    const verb = kind === 'report' ? (statusType.detail || 'Full Time') : 'Kick-off';
    const title = `${home.team.displayName} vs ${away.team.displayName} — ${esc(scoreline)} | ${leagueName} | ScoreHub`;
    const description = kind === 'report'
        ? `${leagueName}: ${home.team.displayName} ${home.score}–${away.score} ${away.team.displayName} on ${dateStr} at ${venue || 'the venue'}. Goals, cards, key moments and the full stat table from ESPN data.`
        : `${leagueName} fixture: ${home.team.displayName} vs ${away.team.displayName}, ${dateStr}${venue ? ` at ${venue}` : ''}. Form, kickoff time and where to follow the match live on ScoreHub.`;
    const interactive = kind === 'report' ? `/report.html?id=${esc(ev.id)}` : `/preview.html?id=${esc(ev.id)}`;
    const statsTable = isPost && (home.statistics || away.statistics)
        ? `<h2 class="hub-section-title" style="margin-top:18px;">Match stats</h2>
           <div class="full-table-wrap"><table class="full-table"><thead><tr><th>${esc(home.team.abbreviation || 'Home')}</th><th></th><th>${esc(away.team.abbreviation || 'Away')}</th></tr></thead><tbody>${pairStats(home, away)}</tbody></table></div>`
        : '';
    const timeline = isPost
        ? `<h2 class="hub-section-title" style="margin-top:18px;">Goals &amp; key events</h2>${timelineHTML(comp.details, home, away)}`
        : `<h2 class="hub-section-title" style="margin-top:18px;">Before kickoff</h2>
           <p>Follow this match live on ScoreHub: open the <a href="/match.html?id=${esc(ev.id)}">match centre</a> at kickoff for the live score, timeline and lineups, or read our <a href="${interactive}">data-driven preview</a> in the interactive hub. Tables for both clubs' competitions are in <a href="/standings.html">Standings</a>.</p>`;
    const odds = (comp.odds && comp.odds[0])
        ? `<p class="legal-updated">Odds (${esc(comp.odds[0].provider && comp.odds[0].provider.name || 'bookmaker')}): ${esc(String(comp.odds[0].details || ''))}${comp.odds[0].overUnder ? ` &middot; O/U ${esc(String(comp.odds[0].overUnder))}` : ''}</p>`
        : '';
    const winnerLine = isPost && home.winner !== undefined
        ? (home.winner || away.winner
            ? `<p><strong>${esc(home.winner ? home.team.displayName : away.team.displayName)}</strong> won (${esc(verb)}).</p>`
            : `<p>The match ended in a draw (${esc(verb)}).</p>`)
        : `<p>${esc(verb)}.</p>`;
    const body = `
            <h1>${esc(home.team.displayName)} vs ${esc(away.team.displayName)}</h1>
            <p class="legal-updated">${esc(leagueName)} &middot; ${dateStr}${venue ? ` &middot; ${esc(venue)}` : ''}${attendance}</p>
            <div class="snapshot-banner">Snapshot generated ${generatedNote} from ESPN. This page is static — the interactive version with ScoreHub's full written ${kindNoun.toLowerCase()} is <a href="${interactive}">here</a>.</div>
            <section class="page-intro" aria-label="About this page">
                <p>${esc(leagueName)} match snapshot: final score, goals and cards on the timeline, and the complete stat table — published from ESPN's data with original links into ScoreHub's live tools.</p>
            </section>
            <div style="display:flex;align-items:flex-start;gap:10px;margin:14px 0 6px;">
                ${teamBlock(home)}
                <div style="font-size:30px;font-weight:800;padding-top:16px;white-space:nowrap;">${scoreline}</div>
                ${teamBlock(away)}
            </div>
            ${winnerLine}
            ${odds}
            ${timeline}
            ${statsTable}
            <h2 class="hub-section-title" style="margin-top:18px;">Follow ScoreHub</h2>
            <p>${introLinks()}</p>`;
    const meta = JSON.stringify({ type: kind, id: ev.id, date: ymd(new Date(ev.date)), league: leagueName, updated: ymd(NOW) });
    const jsonld = isPost ? JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${home.team.displayName} vs ${away.team.displayName}`,
        sport: 'Football', startDate: ev.date,
        location: venue ? { '@type': 'Place', name: comp.venue.fullName || venue } : undefined,
        competitor: [home, away].map((c) => ({ '@type': 'SportsTeam', name: c.team.displayName })),
        url: `${ORIGIN}/${kind}/${ev.id}/`,
    }) : '';
    return pageShell({
        title, description,
        canonicalPath: `/${kind}/${ev.id}/`,
        breadcrumbName: `${home.team.displayName} vs ${away.team.displayName}`,
        bodyHTML: body, metaJSON: meta, jsonld,
    });
}

/* --------------------------------------------------------------- fetching */
async function fetchTable(vmCtx, L) {
    const path_ = `/apis/v2/sports/soccer/${L.slug}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = OFFLINE
        ? null
        : [`https://site.web.api.espn.com${path_}`, `https://site.api.espn.com${path_}`];
    if (OFFLINE) {
        const raw = readFileSync(path.join(TOOLSDIR, '..', 'testdata', 'espn-standings.sample.json'), 'utf8');
        const j = JSON.parse(raw);
        return { groups: vmCtx.parseStandingsGroups(j), season: vmCtx.payloadSeasonLabel(j), sample: true };
    }
    for (const u of urls) {
        try {
            const j = await fetchJSON(u);
            const groups = vmCtx.parseStandingsGroups(j);
            if (groups.length) return { groups, season: vmCtx.payloadSeasonLabel(j) };
        } catch (e) { log(`  standings mirror failed (${L.slug}): ${e.message}`); }
        await sleep(FETCH_DELAY_MS);
    }
    return { groups: [], season: null };
}

async function fetchScoreboard(slug, date) {
    if (OFFLINE) {
        const raw = readFileSync(path.join(TOOLSDIR, '..', 'testdata', 'espn-scoreboard.sample.json'), 'utf8');
        return JSON.parse(raw);
    }
    return fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${date}`);
}

async function fetchNews(slug) {
    if (OFFLINE) return [];
    try {
        const j = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/news?limit=10`);
        return j.articles || [];
    } catch (e) { return []; }
}

/* ------------------------------------------------------------------ writes */
function writePage(relDir, html) {
    const dir = path.join(ROOT, relDir);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), html);
}

function collectPages(kind) {
    const dir = path.join(ROOT, kind);
    if (!existsSync(dir)) return [];
    const out = [];
    for (const entry of readdirSync(dir)) {
        const f = path.join(dir, entry, 'index.html');
        if (!existsSync(f)) continue;
        const c = readFileSync(f, 'utf8');
        const m = /<!-- prerender-meta: (\{.*?\}) -->/.exec(c);
        let meta = {};
        try { meta = m ? JSON.parse(m[1]) : {}; } catch (e) {}
        out.push({ kind, id: entry, file: f, meta });
    }
    return out;
}

function prunePages(kind, max, byDateDesc) {
    const pages = collectPages(kind).sort((a, b) => byDateDesc(a.meta, b.meta));
    for (const p of pages.slice(max)) {
        rmSync(path.join(ROOT, kind, p.id), { recursive: true, force: true });
        log(`  pruned old ${kind}: ${p.id} (${p.meta.date || '?'})`);
    }
}

/* --------------------------------------------------------------- sitemaps */
function buildSitemaps(tableSlugs, newsItems) {
    const urls = [];
    for (const [p, pri, freq] of STATIC_PAGES) {
        urls.push(`  <url><loc>${ORIGIN}/${p}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority><lastmod>${ymd(NOW)}</lastmod></url>`);
    }
    urls.push('  <!-- League tables (prerendered static pages; the interactive standings.html?league= URLs canonicalise here) -->');
    for (const slug of tableSlugs) {
        urls.push(`  <url><loc>${ORIGIN}/table/${slug}/</loc><changefreq>hourly</changefreq><priority>0.8</priority><lastmod>${ymd(NOW)}</lastmod></url>`);
    }
    const snaps = [...collectPages('report'), ...collectPages('preview')]
        .filter((p) => p.meta.date)
        .sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''))
        .slice(0, 60);
    if (snaps.length) {
        urls.push('  <!-- Recent match snapshots (rotating window; older pages prune automatically) -->');
        for (const p of snaps) {
            urls.push(`  <url><loc>${ORIGIN}/${p.kind}/${p.id}/</loc><changefreq>weekly</changefreq><priority>0.6</priority><lastmod>${esc(p.meta.updated || p.meta.date)}</lastmod></url>`);
        }
    }
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<!-- Regenerated by tools/prerender.mjs on ${iso(NOW)}. match.html, preview.html,\n     report.html and story.html are interactive template pages (JS-rendered);\n     the crawlable per-league and per-match content lives under /table/, /report/\n     and /preview/ below. -->\n${urls.join('\n')}\n</urlset>\n`;
    writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

    const cutoff = new Date(NOW.getTime() - NEWS_HOURS * 3600 * 1000);
    const fresh = newsItems.filter((a) => a.published && new Date(a.published) >= cutoff).slice(0, 50);
    if (fresh.length) {
        const items = fresh.map((a) => `  <url>
    <loc>${ORIGIN}/story.html?id=${esc(a.id)}</loc>
    <news:news>
      <news:publication><news:name>ScoreHub</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${iso(new Date(a.published))}</news:publication_date>
      <news:title>${esc(a.headline || a.title || 'Football story')}</news:title>
    </news:news>
  </url>`).join('\n');
        const news = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n<!-- Regenerated by tools/prerender.mjs on ${iso(NOW)}; stories from the last ${NEWS_HOURS}h. -->\n${items}\n</urlset>\n`;
        writeFileSync(path.join(ROOT, 'news-sitemap.xml'), news);
        log(`news-sitemap.xml: ${fresh.length} story URL(s)`);
    } else {
        log('news-sitemap.xml: no stories in window, left untouched');
    }
}

/* -------------------------------------------------------------------- main */
async function main() {
    log(`mode=${OFFLINE ? 'OFFLINE (testdata samples)' : 'live'} root=${ROOT}`);
    const vmCtx = loadStandingsHelpers();
    const leagues = vmCtx.STANDINGS_LEAGUES;
    if (!leagues || !leagues.length) throw new Error('STANDINGS_LEAGUES not found in standings.js');

    // 1. Table pages — reuse the site's own fetch + parse + markup
    const okSlugs = [];
    for (const L of leagues) {
        const res = await fetchTable(vmCtx, L);
        if (!res.groups.length) { log(`  no standings for ${L.slug}, skipped`); continue; }
        writePage(path.join('table', L.slug), tablePageHTML(L, res.groups, res.season, res.sample ? 'DEMO (testdata sample)' : `${iso(NOW)} UTC`, vmCtx));
        okSlugs.push(L.slug);
        log(`  table ${L.slug} (${res.groups.reduce((n, g) => n + g.rows.length, 0)} rows${res.season ? `, ${res.season}` : ''})`);
        if (!OFFLINE) await sleep(FETCH_DELAY_MS);
    }

    // 2. Match snapshot pages from scoreboards
    const sweep = [...leagues.map((L) => L.slug), ...SWEEP_EXTRA.filter((s) => !OFFLINE)];
    const days = [];
    for (let d = -REPORT_DAYS; d <= PREVIEW_DAYS; d++) {
        days.push(new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()) + d * 86400000));
    }
    const seen = new Set();
    const events = [];
    for (const slug of sweep) {
        for (const day of days) {
            try {
                const sb = await fetchScoreboard(slug, yymmdd(day));
                for (const ev of sb.events || []) {
                    if (seen.has(ev.id)) continue;
                    seen.add(ev.id);
                    const state = ev.status && ev.status.type && ev.status.type.state;
                    if (state === 'post' || state === 'pre') events.push({ ev, state, slug });
                }
            } catch (e) { /* league may have no fixtures this day — normal */ }
            if (!OFFLINE) await sleep(FETCH_DELAY_MS);
        }
        log(`  scoreboard sweep: ${slug} done (running total ${events.length} matches)`);
    }
    const leagueNameOf = (ev) => {
        for (const L of leagues) if (L.slug === slugOf(ev)) return L.name;
        return ev.competitions[0].notes && ev.competitions[0].notes[0] && ev.competitions[0].notes[0].headline || 'Football';
    };
    function slugOf(ev) { return evSweeps.get(ev.id) || 'soccer'; }
    const evSweeps = new Map(events.map((e) => [e.ev.id, e.slug]));

    const reports = events.filter((e) => e.state === 'post')
        .sort((a, b) => new Date(b.ev.date) - new Date(a.ev.date)).slice(0, MAX_REPORTS);
    const previews = events.filter((e) => e.state === 'pre')
        .sort((a, b) => new Date(a.ev.date) - new Date(b.ev.date)).slice(0, MAX_PREVIEWS);
    for (const { ev } of reports) writePage(path.join('report', ev.id), matchPageHTML('report', ev, leagueNameOf(ev), OFFLINE ? 'DEMO (testdata sample)' : `${iso(NOW)} UTC`));
    for (const { ev } of previews) writePage(path.join('preview', ev.id), matchPageHTML('preview', ev, leagueNameOf(ev), OFFLINE ? 'DEMO (testdata sample)' : `${iso(NOW)} UTC`));
    log(`wrote ${reports.length} report + ${previews.length} preview snapshot pages`);

    // 3. Prune snapshots outside the rolling window
    prunePages('report', MAX_REPORTS, (a, b) => (a.date || '').localeCompare(b.date || ''));
    prunePages('preview', MAX_PREVIEWS, (a, b) => (a.date || '').localeCompare(b.date || ''));

    // 4. News items for the news sitemap (top leagues only keeps it fast)
    const newsItems = [];
    if (!OFFLINE) {
        for (const L of leagues.slice(0, 8)) {
            for (const a of await fetchNews(L.slug)) {
                if (a.id && !newsItems.some((x) => x.id === a.id)) {
                    newsItems.push({ id: String(a.id), published: a.published || a.lastModified, headline: a.headline || a.description });
                }
            }
            await sleep(FETCH_DELAY_MS);
        }
    }

    // 5. Sitemaps
    buildSitemaps(okSlugs, newsItems);
    log(`done: ${okSlugs.length} tables, ${reports.length} reports, ${previews.length} previews, sitemap.xml${OFFLINE ? ' (demo data — do not deploy)' : ''}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

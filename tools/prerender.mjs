#!/usr/bin/env node
/* Prerender static, crawlable pages from live ESPN data (Phase S1/S2 of
   SEO-PERF-ROADMAP.md). Zero dependencies — node >= 18.

   What it writes (idempotent, deterministic):
     table/<slug>/index.html     full league-table snapshot per league, reusing
                                 standings.js's own parsers/markup via node:vm for
                                 soccer, and a sport-aware table renderer for the
                                 leagues that have no interactive page (NFL, MLB,
                                 NBA, NHL, WNBA, NBL, college football)
     report/<matchId>/index.html finished-match snapshot: scoreline, scoring
                                 timeline, period/innings line score and the team
                                 stat table (scoreboard payload for soccer; the
                                 one-per-match summary endpoint for the sports
                                 whose box scores live there)
     preview/<matchId>/index.html upcoming-match snapshot: kickoff, venue, form,
                                 records, odds where published
     sitemap.xml                 regenerated: static pages + tables + snapshot window
     news-sitemap.xml            story.html?id= URLs from the last 48h (Google news format)

   Hydration rule (non-breaking): these pages are STATIC content pages with
   zero app JS. The interactive pages (standings.html?league=, match.html?id=,
   report.html?id=) keep working exactly as before and stay linked from every
   snapshot. standings.js canonicalises ?league=<slug> to /table/<slug>/ so the
   two consolidate into one indexable URL per league.

   Windows: soccer keeps the original rolling window (7 days back, 3 ahead);
   the leagues in tools/sports.mjs use a 7-day-ahead window because they play on
   weekly or near-weekly rhythms (NFL Sundays, college Saturdays, MLB series) —
   a 3-day window would publish a handful of pages and hide the rest.

   Modes:
     node tools/prerender.mjs                 live run (writes into the repo)
     node tools/prerender.mjs --offline       build from testdata/ samples and
                                              testdata/live/<date>/ fixtures
     node tools/prerender.mjs --out /tmp/x    write somewhere else (default: repo root)

   The GitHub Action (.github/workflows/prerender.yml) runs this daily and on
   every push to main, verifying with testdata/verify.mjs before it commits. */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import {
    SPORTS, PREVIEW_DAYS_BY_SPORT, SCHEMA_SPORT, TABLE_COLUMNS, PERIOD_NOUN, sportEntry,
} from './sports.mjs';

const argv = process.argv.slice(2);
const OFFLINE = argv.includes('--offline');
const outIdx = argv.indexOf('--out');
if (argv.includes('--offline') && outIdx < 0) {
    console.error('[prerender] --offline is a demo build (fixtures only). Pass --out DIR so it cannot overwrite the committed pages.');
    process.exit(2);
}
const TOOLSDIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = outIdx >= 0 ? path.resolve(argv[outIdx + 1]) : path.resolve(TOOLSDIR, '..');
const NOW = new Date();

/* ------------------------------------------------------------------ config */
const REPORT_DAYS = 7;        // finished matches: last N days (every sport)
const PREVIEW_DAYS = 3;       // upcoming matches: next N days (soccer)
const MAX_REPORTS = 40;       // soccer bucket only; other sports use per-league caps
const MAX_PREVIEWS = 40;
const MAX_SUMMARY_FETCHES = 320;  // one summary request per published report
const NEWS_HOURS = 48;        // Google news sitemaps: last 2 days
const FETCH_DELAY_MS = 150;   // be polite to the ESPN endpoints
const FETCH_TIMEOUT_MS = 15000;
const SITEMAP_SNAPSHOTS = 300;

// Soccer cups the site covers that have no table page of their own.
const SWEEP_EXTRA = ['uefa.champions_qual', 'uefa.europa_qual', 'usa.open', 'conmebol.libertadores'];

// Chip rows: which tables to cross-link from the bottom of every table page.
const CHIP_TABLES = [
    ['soccer', 'eng.1', 'Premier League'], ['soccer', 'esp.1', 'La Liga'],
    ['soccer', 'ita.1', 'Serie A'], ['soccer', 'ger.1', 'Bundesliga'],
    ['soccer', 'fra.1', 'Ligue 1'], ['soccer', 'uefa.champions', 'Champions League'],
    ['soccer', 'ken.1', 'Kenyan Premier League'],
    ['football', 'nfl', 'NFL'], ['baseball', 'mlb', 'MLB'], ['basketball', 'nba', 'NBA'],
    ['hockey', 'nhl', 'NHL'], ['basketball', 'wnba', 'WNBA'], ['football', 'college-football', 'College Football'],
];

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
const arr = (a) => (Array.isArray(a) ? a : []);

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

/* -------------------------------------------------------- offline fixtures
   testdata/live/<date>/ holds real ESPN payloads (tools/collect-samples.mjs).
   --offline builds from the newest set so a parser can be developed without
   network access. Nothing is pruned in offline mode: it is a demo build. */
function loadFixtures() {
    const base = path.join(TOOLSDIR, '..', 'testdata', 'live');
    const out = { dir: null, standings: new Map(), scoreboards: new Map(), summaries: new Map() };
    if (!existsSync(base)) return out;
    const days = readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    if (!days.length) return out;
    out.dir = days[days.length - 1];
    for (const f of readdirSync(path.join(base, out.dir))) {
        if (!f.endsWith('.json') || f === 'manifest.json') continue;
        const [kind, sport, league, rest] = f.replace(/\.json$/, '').split('.');
        const full = path.join(base, out.dir, f);
        try {
            if (kind === 'standings') out.standings.set(`${sport}/${league}`, JSON.parse(readFileSync(full, 'utf8')));
            else if (kind === 'scoreboard') out.scoreboards.set(`${sport}/${league}/${rest}`, JSON.parse(readFileSync(full, 'utf8')));
            else if (kind === 'summary') out.summaries.set(`${sport}/${league}/${rest}`, JSON.parse(readFileSync(full, 'utf8')));
        } catch (e) { log(`  fixture ${f} is not valid JSON — skipped`); }
    }
    log(`offline fixtures: ${out.dir} (${out.standings.size} tables, ${out.scoreboards.size} scoreboards, ${out.summaries.size} summaries)`);
    return out;
}
const FIXTURES = OFFLINE ? loadFixtures() : null;

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

function introLinks() {
    return `<p>More on ScoreHub: <a href="/">today's live scores</a>, the <a href="/news.html">News Centre</a>, the <a href="/previews.html">previews &amp; reports hub</a> and the free <a href="/predictions.html">predictions game</a>.</p>`;
}

function chipRowHTML(currentSlug, available) {
    // Only cross-link tables that were actually written this run: a chip to a
    // league whose ESPN standings failed that morning would be a 404.
    return CHIP_TABLES
        .filter(([, slug]) => slug !== currentSlug && available.has(slug))
        .map(([, slug, name]) => `<a class="legal-nav-link" href="/table/${slug}/">${name}</a>`)
        .join('\n                ');
}

/* ------------------------------------------------------------ table pages */
function tablePageHTML(L, groups, season, generatedNote, vmCtx, available = new Set()) {
    const seasonLabel = season || `${NOW.getUTCFullYear()}/${String(NOW.getUTCFullYear() + 1).slice(2)}`;
    const title = `${L.name} Table & Standings — ${seasonLabel} Season | ScoreHub`;
    const description = `${L.name} table (${seasonLabel}): full standings with played, won, drawn, lost, goals for/against, goal difference and points — updated from ESPN data on ScoreHub.`;
    const TH = (rows) => vmCtx.tableHTML(rows);
    const tables = groups.length === 1
        ? TH(groups[0].rows)
        : groups.map((g) => `<h2 class="standings-group-title">${esc(g.name)}</h2>${TH(g.rows)}`).join('');
    const body = `
            <h1>${esc(L.name)} Table — ${esc(seasonLabel)} Standings</h1>
            <p class="legal-updated">${esc(L.name)} standings, updated from ESPN data. Data: ESPN.</p>
            <div class="snapshot-banner">Snapshot generated ${generatedNote} from ESPN. This page is static — for the live-updating table with every league chip, open the <a href="/standings.html?league=${esc(L.slug)}">${esc(L.name)} live table</a>.</div>
            <section class="page-intro" aria-label="About this page">
                <p>The complete ${esc(L.name)} table for the ${esc(seasonLabel)} season: position, played, won, drawn, lost, goals for and against, goal difference and points, exactly as published by ESPN. Looking for a different competition? ScoreHub carries live tables for every league it covers — <a href="/standings.html">browse them all here</a>.</p>
            </section>
            <div id="standings-table">
                ${tables}
            </div>
            <h2 class="hub-section-title" style="margin-top:18px;">More league tables</h2>
            <div class="chip-row" style="margin-top:8px;">
                ${chipRowHTML(L.slug, available)}
            </div>
            <p class="legal-content" style="margin-top:14px;">${introLinks()}</p>`;
    const meta = JSON.stringify({ type: 'table', sport: 'soccer', league: L.slug, updated: ymd(NOW) });
    return pageShell({
        title, description,
        canonicalPath: `/table/${L.slug}/`,
        breadcrumbName: `${L.name} Table`,
        bodyHTML: body, metaJSON: meta,
    });
}

/* ------------------------------------------- non-soccer standings parsing
   ESPN's non-soccer standings put a sport's own stats on each entry
   (W-L-PCT-GB for baseball/basketball, W-L-T for football, W-L-OTL-PTS for
   hockey) and split conferences/divisions across `children`. This is
   deliberately separate from standings.js: that file's table markup is soccer's
   P/W/D/L/GF/GA/GD/Pts and changing it would change the interactive page. */

function overallRecord(entry) {
    const stats = arr(entry && entry.stats);
    const hit = stats.find((s) => s && (s.name === 'overall' || s.name === 'Overall'));
    const v = hit ? ((hit.displayValue !== undefined && hit.displayValue !== '') ? hit.displayValue : hit.value) : null;
    const m = /^(\d+)-(\d+)(?:-(\d+))?$/.exec(String(v || '').trim());
    if (!m) return null;
    return { wins: m[1], losses: m[2], ties: m[3] !== undefined ? m[3] : null };
}

function statValue(entry, names) {
    const stats = arr(entry.stats);
    for (const name of names) {
        const hit = stats.find((s) => s && s.name === name);
        if (hit) {
            const v = (hit.displayValue !== undefined && hit.displayValue !== '') ? hit.displayValue : hit.value;
            if (v !== undefined && v !== null && v !== '') return String(v);
        }
    }
    // College football's standings omit the W/L/T counters and publish only the
    // "3-1-1"-style record, so read the wins/losses/ties out of that — and the
    // winning percentage out of those numbers.
    const rec = overallRecord(entry);
    if (rec) {
        if (names.includes('wins')) return rec.wins;
        if (names.includes('losses')) return rec.losses;
        if (names.includes('ties') && rec.ties !== null) return rec.ties;
        if (names.some((n) => n === 'winPercent' || n === 'winningPercent')) {
            const w = Number(rec.wins), l = Number(rec.losses), t = Number(rec.ties || 0);
            const games = w + l + t;
            if (games) return `.${String(Math.round(((w + t / 2) / games) * 1000)).padStart(3, '0')}`;
        }
    }
    return null;
}

function sportLogo(team) {
    if (!team) return '';
    const logos = arr(team.logos);
    if (logos[0] && logos[0].href) return logos[0].href;
    return typeof team.logo === 'string' ? team.logo : '';
}

function mapSportRows(entries) {
    return entries.map((entry, i) => {
        const team = entry.team || {};
        const rank = parseInt(statValue(entry, ['rank']) || '', 10);
        return {
            rank: Number.isFinite(rank) ? rank : (i + 1),
            team: team.displayName || team.shortDisplayName || team.name || '?',
            abbrev: team.abbreviation || '',
            logo: sportLogo(team),
            // the first occurrence of a stat name wins: ESPN repeats names for
            // the home/away/division splits that follow the overall block
            entry,
        };
    }).sort((a, b) => a.rank - b.rank);
}

function collectSportGroups(node, out) {
    if (!node || typeof node !== 'object') return out;
    if (node.standings && Array.isArray(node.standings.entries)) {
        out.push({ name: node.name || node.abbreviation || '', entries: node.standings.entries });
        // some payloads (NFL) nest divisions under a conference node — keep walking
    }
    if (Array.isArray(node.children)) node.children.forEach((c) => collectSportGroups(c, out));
    return out;
}

export function parseSportStandings(data, sport) {
    const groups = collectSportGroups(data, [])
        .map((g) => ({ name: g.name, rows: mapSportRows(g.entries) }))
        .filter((g) => g.rows.length);
    // A column is published when the payload fills it for at least nine rows in
    // ten; below that it renders as a wall of dashes and gets dropped instead.
    const total = groups.reduce((n, g) => n + g.rows.length, 0) || 1;
    const columns = (TABLE_COLUMNS[sport] || []).filter((col) => {
        const filled = groups.reduce((n, g) => n + g.rows.filter((r) => statValue(r.entry, col.names) !== null).length, 0);
        return filled / total >= 0.9;
    });
    return { groups, columns };
}

function seasonYearOf(season) {
    const y = parseInt(season && season.year, 10);
    return Number.isFinite(y) && y > 1900 ? y : null;
}

/* Season label for the non-soccer tables. ESPN's season.year is the year the
   season ENDS for the split-season sports (NBA 2026-27 -> 2027) but the year it
   RUNS for the single-season ones (NFL 2026 -> 2026, WNBA 2026 -> 2026), and it
   rolls over early: on 2026-09-30 MLB standings still hold the finished 2026
   season while season.year already says 2027 with a 2027 startDate. So:
     - if the season has not started yet, the published table is the season that
       just ended (year - 1);
     - a season whose start and end dates fall in different calendar years gets
       the split label of its START year (NBA/NHL/NBL), except in the cumulative
       sports (football, baseball) where one year names the whole season. */
export function seasonLabelForSport(sport, season) {
    const year = seasonYearOf(season) || NOW.getUTCFullYear();
    const start = season && season.startDate ? new Date(season.startDate) : null;
    const end = season && season.endDate ? new Date(season.endDate) : null;
    if (start && start > NOW) return String(year - 1);
    const splitSport = sport === 'basketball' || sport === 'hockey';
    const spansYears = start && end && start.getUTCFullYear() !== end.getUTCFullYear();
    if (splitSport && spansYears) {
        const startYear = start.getUTCFullYear();
        return `${startYear}-${String(startYear + 1).slice(2)}`;
    }
    return String(year);
}

function sportTableHTML(columns, rows) {
    const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
    const body = rows.map((row) => {
        const cells = columns.map((c) => `<td>${esc(statValue(row.entry, c.names) ?? '—')}</td>`).join('');
        return `<tr><td>${row.rank}</td>`
            + `<td class="col-team"><div class="full-team-cell">${standingBadge(row.abbrev, row.logo)}<span class="full-team-name">${esc(row.team)}</span></div></td>`
            + `${cells}</tr>`;
    }).join('');
    return `<div class="full-table-wrap"><table class="full-table"><thead><tr>`
        + `<th>#</th><th class="col-team">Team</th>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function standingBadge(abbrev, logo) {
    return `<span class="team-logo-wrap" style="width:22px;height:22px;">`
        + `<span class="player-avatar-mini" style="font-size:7px;width:100%;height:100%;">${esc(abbrev)}</span>`
        + (logo ? `<img class="team-logo-img" src="${esc(logo)}" alt="" width="32" height="32" loading="lazy" decoding="async" onerror="this.remove()">` : '')
        + `</span>`;
}

function sportTablePageHTML(entry, parsed, seasonLabel, generatedNote, available = new Set()) {
    const { groups, columns } = parsed;
    const rows = groups.reduce((n, g) => n + g.rows.length, 0);
    const label = seasonLabel || String(NOW.getUTCFullYear());
    const title = `${entry.name} Standings ${label} — Full Table | ScoreHub`;
    const statWords = entry.sport === 'hockey'
        ? 'wins, losses, overtime losses, points, goals for and against'
        : 'wins, losses, win percentage and scoring';
    const description = `${entry.name} standings (${label}): every team with ${statWords}, exactly as published by ESPN. Updated from live ESPN data on ScoreHub.`;
    const tables = groups.length === 1
        ? `<h2 class="standings-group-title">${esc(groups[0].name || entry.name)}</h2>${sportTableHTML(columns, groups[0].rows)}`
        : groups.map((g) => `<h2 class="standings-group-title">${esc(g.name || entry.name)}</h2>${sportTableHTML(columns, g.rows)}`).join('');
    const body = `
            <h1>${esc(entry.name)} Standings — ${esc(label)}</h1>
            <p class="legal-updated">${esc(entry.name)} (${esc(entry.icon)} ${esc(sportTitle(entry.sport))}) standings, updated from ESPN data. Data: ESPN.</p>
            <div class="snapshot-banner">Snapshot generated ${generatedNote} from ESPN. This page is static — ${LIVE_TABS[entry.sport] ? `for the live-updating scores behind it, open <a href="/">ScoreHub's live scores</a> and pick the ${esc(LIVE_TABS[entry.sport])} tab` : `live scores for the sports ScoreHub carries are on <a href="/">ScoreHub's live scores page</a>`}.</div>
            <section class="page-intro" aria-label="About this page">
                <p>The complete ${esc(entry.name)} table for ${esc(label)}: ${rows} teams across ${groups.length} ${groups.length === 1 ? 'table' : 'tables'}, with ${esc(statWords)} — exactly as published by ESPN. Soccer tables (Premier League, La Liga, Serie A, the Kenyan and Ugandan Premier Leagues and 60 more) live in the <a href="/standings.html">Standings hub</a>.</p>
            </section>
            <div id="standings-table">
                ${tables}
            </div>
            <h2 class="hub-section-title" style="margin-top:18px;">More league tables</h2>
            <div class="chip-row" style="margin-top:8px;">
                ${chipRowHTML(entry.league, available)}
            </div>
            <p class="legal-content" style="margin-top:14px;">${introLinks()}</p>`;
    const meta = JSON.stringify({ type: 'table', sport: entry.sport, league: entry.league, updated: ymd(NOW) });
    return pageShell({
        title, description,
        canonicalPath: `/table/${entry.league}/`,
        breadcrumbName: `${entry.name} Standings`,
        bodyHTML: body, metaJSON: meta,
    });
}

function sportTitle(sport) {
    return { soccer: 'Football', football: 'American Football', baseball: 'Baseball', basketball: 'Basketball', hockey: 'Ice Hockey', rugby: 'Rugby' }[sport] || sport;
}

/* The sport tabs the live scores page really has (index.html data-sport).
   Snapshots may only send readers to a tab that exists: the college hockey and
   American football pages used to promise a tab the site does not have. */
const LIVE_TABS = { soccer: 'Football', baseball: 'Baseball', basketball: 'Basketball', hockey: 'Ice Hockey', rugby: 'Rugby' };


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
    for (const c of arr(home.statistics).concat(arr(away.statistics))) {
        if (c && statLabel(c.name) && !names.includes(c.name)) names.push(c.name);
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
    const rows = arr(details)
        .filter((d) => d && (d.scoringPlay || d.redCard || d.yellowCard))
        .map((d) => {
            const who = arr(d.athletesInvolved).map((a) => a.displayName).filter(Boolean).join(', ');
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

/* Non-soccer team block: ESPN publishes a win-loss record where soccer has a
   W/D/L form string. */
function recordOf(c) {
    const rec = arr(c.records).find((r) => r && (r.type === 'total' || r.name === 'overall')) || arr(c.records)[0];
    return rec && rec.summary ? rec.summary : '';
}

function sportTeamBlock(c) {
    const t = c.team || {};
    const logo = (Array.isArray(t.logos) && t.logos[0] && t.logos[0].href) || t.logo || '';
    const badge = logo
        ? `<img class="team-logo-img" src="${esc(logo)}" alt="" width="32" height="32" loading="lazy" decoding="async" onerror="this.remove()">`
        : '';
    const record = recordOf(c);
    return `<div style="flex:1;min-width:0;text-align:center;">
        <span class="team-logo-wrap" style="width:48px;height:48px;margin:0 auto;"><span class="player-avatar-mini" style="width:100%;height:100%;">${esc(t.abbreviation || '?')}</span>${badge}</span>
        <div style="font-weight:700;margin-top:6px;">${esc(t.displayName || t.shortDisplayName || '?')}</div>
        ${record ? `<div style="margin-top:6px;font-size:11px;color:var(--text-muted);">${esc(record)}</div>` : ''}
    </div>`;
}

/* Period/innings line score (baseball innings, football quarters, hockey
   periods, basketball quarters) — the running score by period, which is the
   equivalent of soccer's goal timeline for a game that is not a single score. */
function linescoreHTML(comp, home, away, sport) {
    const periods = Math.max(arr(home.linescores).length, arr(away.linescores).length);
    if (!periods) return '';
    const noun = PERIOD_NOUN[sport] || 'Period';
    const heading = noun === 'Inning' ? 'Innings' : `${noun}s`;
    const head = Array.from({ length: periods }, (_, i) => `<th>${i + 1}</th>`).join('');
    const row = (c) => {
        const cells = Array.from({ length: periods }, (_, i) => {
            const l = arr(c.linescores)[i];
            return `<td>${esc(l ? (l.displayValue ?? l.value ?? '') : '—')}</td>`;
        }).join('');
        return `<tr><td class="col-team"><div class="full-team-cell">${standingBadge(c.team.abbreviation || '', sportLogo(c.team))}<span class="full-team-name">${esc(c.team.displayName || '?')}</span></div></td>${cells}<td style="font-weight:700;">${esc(String(c.score ?? ''))}</td></tr>`;
    };
    return `<h2 class="hub-section-title" style="margin-top:18px;">${esc(heading)} — line score</h2>
           <div class="full-table-wrap"><table class="full-table"><thead><tr><th class="col-team">Team</th>${head}<th>T</th></tr></thead>
           <tbody>${row(home)}${row(away)}</tbody></table></div>`;
}

/* Scoring timeline for the non-soccer sports. ESPN puts a finished game's
   scoring events in `scoringPlays` (football) or flags them inside `plays`
   (basketball, hockey). Baseball publishes neither — its runs are only visible
   in the inning line score, so that is what gets shown instead. */
function scoringEvents(sport, ev, extra) {
    const summary = extra && extra.summary;
    const comp = (summary && summary.header && arr(summary.header.competitions)[0]) || (ev && arr(ev.competitions)[0]) || {};
    if (summary) {
        if (arr(summary.scoringPlays).length) return { kind: 'plays', list: summary.scoringPlays };
        const flagged = arr(summary.plays).filter((p) => p && p.scoringPlay);
        if (flagged.length) return { kind: 'plays', list: flagged };
    }
    const details = arr(comp.details).filter((d) => d && d.scoringPlay);
    if (details.length) return { kind: 'plays', list: details };
    return { kind: 'innings', list: [] };
}

function periodTag(sport, p) {
    if (!p) return '';
    const n = (p.period && p.period.number) || p.period;
    const noun = PERIOD_NOUN[sport] || 'Quarter';
    const label = noun === 'Inning' ? 'Inn' : noun.charAt(0).toUpperCase();
    if (!n) return '';
    return `${label}${n}`;
}

function scoringTimelineHTML(sport, ev, extra, home, away) {
    const { kind, list } = scoringEvents(sport, ev, extra);
    if (kind === 'innings') return inningsTimelineHTML(sport, ev, extra, home, away);
    const rows = list.map((p) => {
        const isHome = p.team && home.team && String(p.team.id) === String(home.team.id);
        const self = isHome ? home : away;
        const other = isHome ? away : home;
        const selfScore = isHome ? p.homeScore : p.awayScore;
        const otherScore = isHome ? p.awayScore : p.homeScore;
        const who = self.team && (self.team.abbreviation || self.team.shortDisplayName || self.team.displayName);
        const score = (selfScore !== undefined && selfScore !== null && otherScore !== undefined && otherScore !== null)
            ? ` <span class="league-tag">(${esc(who || '')} ${esc(String(selfScore))}–${esc(String(otherScore))})</span>` : '';
        const clock = p.clock && p.clock.displayValue ? `<strong>${esc(periodTag(sport, p))} ${esc(p.clock.displayValue)}</strong>` : `<strong>${esc(periodTag(sport, p))}</strong>`;
        const text = p.text || (p.type && p.type.text) || 'Score';
        return `<li>${clock} ${esc(text)}${score}</li>`;
    }).join('');
    return rows ? `<ol style="padding-left:18px;display:flex;flex-direction:column;gap:6px;">${rows}</ol>`
        : '<p class="legal-updated">No scoring plays were published for this game.</p>';
}

function ordinal(n) {
    const rest = n % 100;
    if (rest >= 11 && rest <= 13) return `${n}th`;
    return `${n}${['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;
}

/* Baseball fallback: turn the inning line score into a scoring summary — which
   side scored, in which inning, and the running score after that inning. */
function inningsTimelineHTML(sport, ev, extra, home, away) {
    const rows = [];
    const periods = Math.max(arr(home.linescores).length, arr(away.linescores).length);
    let h = 0, a = 0;
    for (let i = 0; i < periods; i++) {
        const awayRuns = parseInt(arr(away.linescores)[i] && (arr(away.linescores)[i].value ?? arr(away.linescores)[i].displayValue), 10) || 0;
        const homeRuns = parseInt(arr(home.linescores)[i] && (arr(home.linescores)[i].value ?? arr(home.linescores)[i].displayValue), 10) || 0;
        if (awayRuns) {
            a += awayRuns;
            rows.push(`<li><strong>Top ${ordinal(i + 1)}</strong> ${esc(away.team.displayName)} score ${awayRuns} <span class="league-tag">(${esc(away.team.abbreviation || '')} ${a}–${h})</span></li>`);
        }
        if (homeRuns) {
            h += homeRuns;
            rows.push(`<li><strong>Bottom ${ordinal(i + 1)}</strong> ${esc(home.team.displayName)} score ${homeRuns} <span class="league-tag">(${esc(home.team.abbreviation || '')} ${h}–${a})</span></li>`);
        }
    }
    return rows.length
        ? `<ol style="padding-left:18px;display:flex;flex-direction:column;gap:6px;">${rows.join('')}</ol>`
        : '<p class="legal-updated">No scoring plays were published for this game.</p>';
}

/* Team stats for the non-soccer reports. The numbers come from the match
   summary's box score, which nests some sports ({name:'batting', stats:[…]})
   and flattens others. Order and labels are chosen per sport so the table reads
   like the sport, not like the JSON. */
const MATCH_STAT_COLUMNS = {
    baseball: [
        ['runs', 'Runs'], ['hits', 'Hits'], ['doubles', 'Doubles'], ['homeRuns', 'Home runs'],
        ['rbi', 'RBI'], ['walks', 'Walks'], ['strikeOuts', 'Strikeouts'], ['leftOnBase', 'Left on base'],
        ['errors', 'Errors'], ['era', 'ERA'], ['fieldingPercentage', 'Fielding %'],
    ],
    football: [
        ['firstDowns', 'First downs'], ['totalYards', 'Total yards'], ['netPassingYards', 'Passing yards'],
        ['rushingYards', 'Rushing yards'], ['yardsPerPlay', 'Yards per play'], ['thirdDownEff', 'Third down'],
        ['fourthDownEff', 'Fourth down'], ['turnovers', 'Turnovers'], ['interceptions', 'Interceptions'],
        ['fumblesLost', 'Fumbles lost'], ['sacksYardsLost', 'Sacks allowed'], ['possessionTime', 'Possession'],
        ['totalPenaltiesYards', 'Penalty yards'], ['redZoneAttempts', 'Red-zone trips'],
    ],
    basketball: [
        ['fieldGoalPct', 'FG%'], ['threePointFieldGoalPct', '3PT%'], ['freeThrowPct', 'FT%'],
        ['totalRebounds', 'Rebounds'], ['offensiveRebounds', 'Off. rebounds'], ['assists', 'Assists'],
        ['steals', 'Steals'], ['blocks', 'Blocks'], ['turnovers', 'Turnovers'],
        ['pointsInPaint', 'Points in paint'], ['fastBreakPoints', 'Fast-break points'],
        ['largestLead', 'Largest lead'], ['leadChanges', 'Lead changes'],
    ],
    hockey: [
        ['shotsTotal', 'Shots'], ['powerPlayGoals', 'Power-play goals'], ['powerPlayPct', 'Power play'],
        ['faceoffPercent', 'Faceoffs won'], ['hits', 'Hits'], ['blockedShots', 'Blocked shots'],
        ['takeaways', 'Takeaways'], ['giveaways', 'Giveaways'], ['penaltyMinutes', 'Penalty minutes'],
        ['shortHandedGoals', 'Short-handed goals'],
    ],
};

function statIndex(team) {
    const index = new Map();
    const visit = (s, group) => {
        if (!s || !s.name) return;
        const v = (s.displayValue !== undefined && s.displayValue !== '') ? s.displayValue : s.value;
        if (v !== undefined && v !== null && v !== '') {
            const key = group ? `${group}:${s.name}` : s.name;
            if (!index.has(key)) index.set(key, String(v));
        }
        if (Array.isArray(s.stats)) s.stats.forEach((child) => visit(child, s.name));
    };
    arr(team && team.statistics).forEach((s) => visit(s, null));
    return index;
}

function lookupStat(index, name) {
    if (index.has(name)) return index.get(name);
    for (const [k, v] of index) if (k.endsWith(`:${name}`)) return v;
    return null;
}

function teamStatsHTML(sport, home, away, extra) {
    const summary = extra && extra.summary;
    const columns = MATCH_STAT_COLUMNS[sport] || [];
    if (!columns.length) return '';
    let homeStats = null, awayStats = null;
    if (summary && summary.boxscore && arr(summary.boxscore.teams).length >= 2) {
        const teams = summary.boxscore.teams;
        const bySide = (side) => {
            const byHomeAway = teams.find((t) => t.homeAway === side);
            if (byHomeAway) return byHomeAway;
            const byId = teams.find((t) => t.team && (String(t.team.id) === String((side === 'home' ? home : away).team.id)));
            return byId;
        };
        const homeTeam = bySide('home') || teams.find((t) => t.team && String(t.team.id) === String(home.team.id));
        const awayTeam = bySide('away') || teams.find((t) => t.team && String(t.team.id) === String(away.team.id));
        homeStats = homeTeam ? statIndex(homeTeam) : null;
        awayStats = awayTeam ? statIndex(awayTeam) : null;
    }
    // scoreboard payloads for baseball and WNBA already carry team stats
    if (!homeStats && arr(home.statistics).length) homeStats = statIndex(home);
    if (!awayStats && arr(away.statistics).length) awayStats = statIndex(away);
    if (!homeStats && !awayStats) return '';
    const rows = columns
        .map(([name, label]) => {
            const h = homeStats ? lookupStat(homeStats, name) : null;
            const a = awayStats ? lookupStat(awayStats, name) : null;
            if (h === null && a === null) return '';
            return `<tr><td>${esc(h ?? '—')}</td><td>${esc(label)}</td><td>${esc(a ?? '—')}</td></tr>`;
        })
        .filter(Boolean).join('');
    if (!rows) return '';
    return `<h2 class="hub-section-title" style="margin-top:18px;">Team stats</h2>
           <div class="full-table-wrap"><table class="full-table"><thead><tr><th>${esc(home.team.abbreviation || 'Away')}</th><th></th><th>${esc(away.team.abbreviation || 'Home')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function matchJSONLD(kind, ev, meta, home, away, venue) {
    return JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SportsEvent',
        name: `${home.team.displayName} vs ${away.team.displayName}`,
        sport: SCHEMA_SPORT[meta.sport] || 'Football',
        startDate: ev.date,
        location: venue ? { '@type': 'Place', name: venue } : undefined,
        competitor: [home, away].map((c) => ({ '@type': 'SportsTeam', name: c.team.displayName })),
        url: `${ORIGIN}/${kind}/${ev.id}/`,
    });
}

function matchPageHTML(kind, ev, meta, generatedNote, extra = {}, available = new Set()) {
    const comp = arr(ev.competitions)[0] || {};
    const home = arr(comp.competitors).find((c) => c.homeAway === 'home') || arr(comp.competitors)[0] || {};
    const away = arr(comp.competitors).find((c) => c.homeAway === 'away') || arr(comp.competitors)[1] || {};
    const statusType = (ev.status && ev.status.type) || {};
    const isPost = statusType.state === 'post';
    const dateStr = new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    const venue = [comp.venue && comp.venue.fullName, comp.venue && comp.venue.address && (comp.venue.address.city || comp.venue.address.country)].filter(Boolean).join(', ');
    const attendance = comp.attendance ? ` &middot; Attendance ${Number(comp.attendance).toLocaleString('en-GB')}` : '';
    const kindNoun = kind === 'report' ? 'Match Report' : 'Match Preview';
    const verb = kind === 'report' ? (statusType.detail || 'Full Time') : 'Kick-off';

    if (meta.sport !== 'soccer') {
        return sportMatchPageHTML(kind, ev, meta, generatedNote, extra, available);
    }

    const scoreline = isPost
        ? `${esc(String(home.score))} – ${esc(String(away.score))}`
        : new Date(ev.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
    const title = `${home.team.displayName} vs ${away.team.displayName} — ${esc(scoreline)} | ${meta.name} | ScoreHub`;
    const description = kind === 'report'
        ? `${meta.name}: ${home.team.displayName} ${home.score}–${away.score} ${away.team.displayName} on ${dateStr} at ${venue || 'the venue'}. Goals, cards, key moments and the full stat table from ESPN data.`
        : `${meta.name} fixture: ${home.team.displayName} vs ${away.team.displayName}, ${dateStr}${venue ? ` at ${venue}` : ''}. Form, kickoff time and where to follow the match live on ScoreHub.`;
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
            <p class="legal-updated">${esc(meta.name)} &middot; ${dateStr}${venue ? ` &middot; ${esc(venue)}` : ''}${attendance}</p>
            <div class="snapshot-banner">Snapshot generated ${generatedNote} from ESPN. This page is static — the interactive version with ScoreHub's full written ${kindNoun.toLowerCase()} is <a href="${interactive}">here</a>.</div>
            <section class="page-intro" aria-label="About this page">
                <p>${esc(meta.name)} match snapshot: final score, goals and cards on the timeline, and the complete stat table — published from ESPN's data with original links into ScoreHub's live tools.</p>
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
    const metaJSON = JSON.stringify({ type: kind, sport: 'soccer', league: meta.league, id: ev.id, date: ymd(new Date(ev.date)), leagueName: meta.name, updated: ymd(NOW) });
    const jsonld = isPost ? matchJSONLD(kind, ev, meta, home, away, comp.venue && comp.venue.fullName) : '';
    return pageShell({
        title, description,
        canonicalPath: `/${kind}/${ev.id}/`,
        breadcrumbName: `${home.team.displayName} vs ${away.team.displayName}`,
        bodyHTML: body, metaJSON, jsonld,
    });
}

function sportMatchPageHTML(kind, ev, meta, generatedNote, extra, available = new Set()) {
    const comp = arr(ev.competitions)[0] || {};
    const home = arr(comp.competitors).find((c) => c.homeAway === 'home') || arr(comp.competitors)[0] || {};
    const away = arr(comp.competitors).find((c) => c.homeAway === 'away') || arr(comp.competitors)[1] || {};
    const statusType = (ev.status && ev.status.type) || {};
    const isPost = statusType.state === 'post';
    const verb = isPost ? (statusType.detail || 'Final') : 'Scheduled';
    const kickoff = new Date(ev.date);
    const dateStr = kickoff.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    const venue = [comp.venue && comp.venue.fullName, comp.venue && comp.venue.address && (comp.venue.address.city || comp.venue.address.country)].filter(Boolean).join(', ');
    const attendance = comp.attendance ? ` &middot; Attendance ${Number(comp.attendance).toLocaleString('en-GB')}` : '';
    const sportName = sportTitle(meta.sport);

    // the summary's header is the authoritative copy of the line score once the
    // game is over (the scoreboard's own copy can lag the final innings)
    const summary = extra.summary || null;
    const headerComp = (summary && summary.header && arr(summary.header.competitions)[0]) || comp;
    const headerHome = arr(headerComp.competitors).find((c) => c.homeAway === 'home') || home;
    const headerAway = arr(headerComp.competitors).find((c) => c.homeAway === 'away') || away;
    // The summary's header is authoritative for the line score, but football
    // and hockey publish no team stats there — keep the scoreboard's copy of
    // whatever the header does not carry (logos, records, team statistics).
    const merge = (headerSide, boardSide) => ({
        ...boardSide, ...headerSide,
        team: headerSide.team || boardSide.team,
        records: arr(headerSide.records).length ? headerSide.records : boardSide.records,
        statistics: arr(headerSide.statistics).length ? headerSide.statistics : boardSide.statistics,
        linescores: arr(headerSide.linescores).length ? headerSide.linescores : boardSide.linescores,
        score: isPost ? (headerSide.score ?? boardSide.score) : boardSide.score,
    });
    const lineHome = merge(headerHome, home);
    const lineAway = merge(headerAway, away);

    const scoreline = isPost
        ? `${esc(String(lineHome.score))} – ${esc(String(lineAway.score))}`
        : `${esc(timeStr)} UTC`;
    const title = `${home.team.displayName} vs ${away.team.displayName} — ${scoreline} | ${meta.name} | ScoreHub`;
    const description = kind === 'report'
        ? `${meta.name} (${sportName}): ${home.team.displayName} ${lineHome.score}–${lineAway.score} ${away.team.displayName} on ${dateStr}${venue ? ` at ${venue}` : ''}. Scoring plays, the line score and the team stats from ESPN data.`
        : `${meta.name} (${sportName}) fixture: ${home.team.displayName} vs ${away.team.displayName}, ${dateStr} ${timeStr} UTC${venue ? ` at ${venue}` : ''}. Records, venue and where to follow it live on ScoreHub.`;

    const winnerLine = isPost
        ? (home.winner || away.winner
            ? `<p><strong>${esc(home.winner ? home.team.displayName : away.team.displayName)}</strong> won (${esc(verb)})${home.score !== undefined && away.score !== undefined ? `, ${esc(String(home.score))}–${esc(String(away.score))}` : ''}.</p>`
            : `<p>Final: level at ${esc(String(home.score))}–${esc(String(away.score))} (${esc(verb)}).</p>`)
        : `<p>First pitch/whistle/kick-off: ${esc(dateStr)} at ${esc(timeStr)} UTC.</p>`;

    const lineScore = isPost ? linescoreHTML(headerComp, lineHome, lineAway, meta.sport) : '';
    const scoring = isPost
        ? `<h2 class="hub-section-title" style="margin-top:18px;">${scoringHeading(meta.sport, ev, extra)}</h2>${scoringTimelineHTML(meta.sport, ev, extra, lineHome, lineAway)}`
        : '';
    const stats = isPost ? teamStatsHTML(meta.sport, lineHome, lineAway, extra) : '';
    const boardStatsRows = isPost && !stats ? sportScoreboardStats(meta.sport, lineHome, lineAway) : '';
    const teamStatsFromScoreboard = boardStatsRows
        ? `<h2 class="hub-section-title" style="margin-top:18px;">Team stats</h2>
           <div class="full-table-wrap"><table class="full-table"><thead><tr><th>${esc(lineHome.team.abbreviation || 'Home')}</th><th></th><th>${esc(lineAway.team.abbreviation || 'Away')}</th></tr></thead><tbody>${boardStatsRows}</tbody></table></div>`
        : '';
    const recap = isPost && extra.summary && extra.summary.article && (extra.summary.article.headline || extra.summary.article.description)
        ? `<h2 class="hub-section-title" style="margin-top:18px;">How the game was reported</h2><p>${esc(extra.summary.article.headline || '')}${extra.summary.article.description ? ` — ${esc(extra.summary.article.description)}` : ''}</p>`
        : '';
    const odds = (comp.odds && comp.odds[0])
        ? `<p class="legal-updated">Odds (${esc(comp.odds[0].provider && comp.odds[0].provider.name || 'bookmaker')}): ${esc(String(comp.odds[0].details || ''))}${comp.odds[0].overUnder ? ` &middot; O/U ${esc(String(comp.odds[0].overUnder))}` : ''}</p>`
        : '';
    const broadcasts = arr(comp.broadcasts).map((b) => arr(b.names).join(', ')).filter(Boolean).join(' &middot; ');
    const before = !isPost
        ? `<h2 class="hub-section-title" style="margin-top:18px;">Before the game</h2>
           <p>Follow this ${sportName.toLowerCase()} fixture live on ScoreHub: the live scores page carries the ${esc(meta.name)} scoreboard${LIVE_TABS[meta.sport] ? ` with the ${esc(LIVE_TABS[meta.sport])} tab selected` : ''}${broadcasts ? `, and it is broadcast by ${esc(broadcasts)}` : ''}.${available.has(meta.league) ? ` Form and standings for both teams are in the <a href="/table/${esc(meta.league)}/">${esc(meta.name)} table</a>.` : ''}</p>`
        : '';
    const body = `
            <h1>${esc(home.team.displayName)} vs ${esc(away.team.displayName)}</h1>
            <p class="legal-updated">${esc(meta.name)} &middot; ${dateStr}${isPost ? '' : ` &middot; ${esc(timeStr)} UTC`}${venue ? ` &middot; ${esc(venue)}` : ''}${attendance}</p>
            <div class="snapshot-banner">Snapshot generated ${generatedNote} from ESPN. This page is static — ${LIVE_TABS[meta.sport] ? `live ${esc(sportName.toLowerCase())} scores are on <a href="/">ScoreHub's live scores page</a> under the ${esc(LIVE_TABS[meta.sport])} tab` : `live scores for the sports ScoreHub carries are on <a href="/">ScoreHub's live scores page</a>`}.</div>
            <section class="page-intro" aria-label="About this page">
                <p>${esc(meta.name)} ${kind === 'report' ? 'match report' : 'preview'} snapshot (${esc(sportName)}): ${kind === 'report' ? 'final score, the line score by period, the scoring plays and the team stats' : 'kickoff time, venue, both teams’ records and the odds where ESPN publishes them'} — published from ESPN's data.</p>
            </section>
            <div style="display:flex;align-items:flex-start;gap:10px;margin:14px 0 6px;">
                ${sportTeamBlock(home)}
                <div style="font-size:30px;font-weight:800;padding-top:16px;white-space:nowrap;">${scoreline}</div>
                ${sportTeamBlock(away)}
            </div>
            ${winnerLine}
            ${odds}
            ${lineScore}
            ${scoring}
            ${teamStatsFromScoreboard}
            ${stats}
            ${recap}
            ${before}
            <h2 class="hub-section-title" style="margin-top:18px;">Follow ScoreHub</h2>
            <p>${introLinks()}</p>`;
    const metaJSON = JSON.stringify({ type: kind, sport: meta.sport, league: meta.league, id: ev.id, date: ymd(new Date(ev.date)), leagueName: meta.name, updated: ymd(NOW) });
    return pageShell({
        title, description,
        canonicalPath: `/${kind}/${ev.id}/`,
        breadcrumbName: `${home.team.displayName} vs ${away.team.displayName}`,
        bodyHTML: body, metaJSON,
        jsonld: matchJSONLD(kind, ev, meta, home, away, comp.venue && comp.venue.fullName),
    });
}

function scoringHeading(sport, ev, extra) {
    const { kind, list } = scoringEvents(sport, ev, extra);
    if (kind === 'innings') return 'Runs by inning';
    if (sport === 'football') return 'Scoring plays';
    if (sport === 'hockey') return 'Goals';
    if (sport === 'basketball') return 'Scoring plays';
    return 'Scoring plays';
}

/* Team stats straight off the scoreboard payload (baseball and WNBA publish
   them there; football and hockey keep them in the summary). */
function sportScoreboardStats(sport, home, away) {
    const columns = (MATCH_STAT_COLUMNS[sport] || []).slice(0, 8);
    const h = statIndex(home), a = statIndex(away);
    return columns.map(([name, label]) => {
        const hv = lookupStat(h, name), av = lookupStat(a, name);
        if (hv === null && av === null) return '';
        return `<tr><td>${esc(hv ?? '—')}</td><td>${esc(label)}</td><td>${esc(av ?? '—')}</td></tr>`;
    }).filter(Boolean).join('');
}

/* --------------------------------------------------------------- fetching */
async function fetchTable(vmCtx, L) {
    const path_ = `/apis/v2/sports/soccer/${L.slug}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = OFFLINE
        ? null
        : [`https://site.web.api.espn.com${path_}`, `https://site.api.espn.com${path_}`];
    if (OFFLINE) {
        const fixture = FIXTURES.standings.get(`soccer/${L.slug}`);
        if (fixture) return { groups: vmCtx.parseStandingsGroups(fixture), season: vmCtx.payloadSeasonLabel(fixture), sample: true };
        const j = JSON.parse(readFileSync(path.join(TOOLSDIR, '..', 'testdata', 'espn-standings.sample.json'), 'utf8'));
        // That sample is one league (MLS). Rendering it under every other
        // league's URL is how an offline build used to produce 70 wrong pages.
        if (j.slug !== L.slug) return { groups: [], season: null };
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

/* Standings for a sport that has no interactive page (NFL, MLB, NBA, NHL …). */
async function fetchSportTable(entry) {
    if (OFFLINE) {
        const j = FIXTURES.standings.get(`${entry.sport}/${entry.league}`);
        if (!j) return { parsed: null, season: null };
        return { parsed: parseSportStandings(j, entry.sport), season: seasonLabelForSport(entry.sport, j.season), sample: true };
    }
    const path_ = `/apis/v2/sports/${entry.sport}/${entry.league}/standings?region=us&lang=en&contentorigin=espn`;
    for (const base of ['https://site.web.api.espn.com', 'https://site.api.espn.com']) {
        try {
            const j = await fetchJSON(`${base}${path_}`);
            const parsed = parseSportStandings(j, entry.sport);
            if (parsed.groups.length && parsed.columns.length) return { parsed, season: seasonLabelForSport(entry.sport, j.season) };
        } catch (e) { log(`  ${entry.sport}/${entry.league} standings failed: ${e.message}`); }
        await sleep(FETCH_DELAY_MS);
    }
    return { parsed: null, season: null };
}

async function fetchScoreboard(sport, league, date) {
    if (OFFLINE) {
        if (sport === 'soccer') {
            const raw = readFileSync(path.join(TOOLSDIR, '..', 'testdata', 'espn-scoreboard.sample.json'), 'utf8');
            return JSON.parse(raw);
        }
        return FIXTURES.scoreboards.get(`${sport}/${league}/${yymmdd(date)}`) || null;
    }
    return fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${yymmdd(date)}`);
}

async function fetchSummary(sport, league, id) {
    if (OFFLINE) return FIXTURES.summaries.get(`${sport}/${league}/${id}`) || null;
    return fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${id}`);
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

function bucketOf(meta) {
    const sport = meta.sport || 'soccer';
    return sport === 'soccer' ? 'soccer' : `${sport}/${meta.league || '?'}`;
}

/* Snapshot pruning is per bucket: soccer keeps its global cap (the original
   behaviour), every league in tools/sports.mjs keeps its own. A bucket that is
   no longer configured (league dropped from sports.mjs) is pruned entirely so
   the sitemap can never advertise an orphan page. */
function pruneSnapshots(targets) {
    const caps = new Map(targets.map((t) => [t.bucket, { report: t.reportCap, preview: t.previewCap }]));
    for (const kind of ['report', 'preview']) {
        const buckets = new Map();
        for (const p of collectPages(kind)) {
            const key = bucketOf(p.meta);
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(p);
        }
        for (const [key, list] of buckets) {
            const cap = caps.get(key) ? caps.get(key)[kind] : 0;
            list.sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
            for (const p of list.slice(cap)) {
                rmSync(path.join(ROOT, kind, p.id), { recursive: true, force: true });
                log(`  pruned old ${kind}: ${p.id} (${p.meta.sport || 'soccer'}/${p.meta.league || '-'} ${p.meta.date || '?'})`);
            }
        }
    }
}

/* --------------------------------------------------------------- sitemaps */
function buildSitemaps(tablePages, newsItems) {
    const urls = [];
    for (const [p, pri, freq] of STATIC_PAGES) {
        urls.push(`  <url><loc>${ORIGIN}/${p}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority><lastmod>${ymd(NOW)}</lastmod></url>`);
    }
    urls.push('  <!-- League tables (prerendered static pages; the interactive standings.html?league= URLs canonicalise here) -->');
    for (const slug of tablePages) {
        urls.push(`  <url><loc>${ORIGIN}/table/${slug}/</loc><changefreq>hourly</changefreq><priority>0.8</priority><lastmod>${ymd(NOW)}</lastmod></url>`);
    }
    const snaps = [...collectPages('report'), ...collectPages('preview')]
        .filter((p) => p.meta.date)
        .sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''))
        .slice(0, SITEMAP_SNAPSHOTS);
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
function sweepTargets(vmCtx) {
    // STANDINGS_LEAGUES carries the other sports' leagues now too (the
    // interactive page renders them live). Their snapshots come from SPORTS
    // below, with per-league caps, so only the soccer entries belong here —
    // sweeping an NFL slug as soccer would ask ESPN for sports/soccer/nfl.
    const soccer = vmCtx.STANDINGS_LEAGUES.filter((L) => (L.sport || 'soccer') === 'soccer').map((L) => ({
        sport: 'soccer', league: L.slug, slug: L.slug, name: L.name,
        previewDays: PREVIEW_DAYS, reportCap: MAX_REPORTS, previewCap: MAX_PREVIEWS, bucket: 'soccer',
    }));
    for (const slug of SWEEP_EXTRA) {
        if (soccer.some((s) => s.slug === slug)) continue;
        soccer.push({
            sport: 'soccer', league: slug, slug, name: null,
            previewDays: PREVIEW_DAYS, reportCap: MAX_REPORTS, previewCap: MAX_PREVIEWS, bucket: 'soccer',
        });
    }
    const other = SPORTS.filter((s) => s.matches).map((s) => ({
        sport: s.sport, league: s.league, slug: s.league, name: s.name,
        previewDays: PREVIEW_DAYS_BY_SPORT[s.sport] || PREVIEW_DAYS,
        reportCap: s.reportCap, previewCap: s.previewCap, bucket: `${s.sport}/${s.league}`,
    }));
    return [...soccer, ...other];
}

async function main() {
    log(`mode=${OFFLINE ? 'OFFLINE (testdata samples + fixtures)' : 'live'} root=${ROOT}`);
    const vmCtx = loadStandingsHelpers();
    const all = vmCtx.STANDINGS_LEAGUES;
    if (!all || !all.length) throw new Error('STANDINGS_LEAGUES not found in standings.js');
    // Step 1 below builds the soccer table pages through standings.js's own
    // fetch/parse/markup; step 1b builds the other sports from SPORTS. Both
    // lists now live in standings.js, so split them here.
    const leagues = all.filter((L) => (L.sport || 'soccer') === 'soccer');

    const tablePages = [];
    const tableJobs = [];      // fetched first, written once every table is known

    // 1. Soccer table pages — reuse the site's own fetch + parse + markup
    for (const L of leagues) {
        const res = await fetchTable(vmCtx, L);
        if (!res.groups.length) { log(`  no standings for ${L.slug}, skipped`); continue; }
        tableJobs.push({ slug: L.slug, write: (available) => tablePageHTML(L, res.groups, res.season, res.sample ? 'DEMO (testdata sample)' : `${iso(NOW)} UTC`, vmCtx, available) });
        tablePages.push(L.slug);
        log(`  table ${L.slug} (${res.groups.reduce((n, g) => n + g.rows.length, 0)} rows${res.season ? `, ${res.season}` : ''})`);
        if (!OFFLINE) await sleep(FETCH_DELAY_MS);
    }

    // 1b. Table pages for the sports that have no interactive standings page
    for (const entry of SPORTS.filter((s) => s.table)) {
        const res = await fetchSportTable(entry);
        if (!res.parsed || !res.parsed.groups.length || !res.parsed.columns.length) {
            log(`  no usable ${entry.sport}/${entry.league} table, skipped`);
            if (!OFFLINE) await sleep(FETCH_DELAY_MS);
            continue;
        }
        tableJobs.push({ slug: entry.league, write: (available) => sportTablePageHTML(entry, res.parsed, res.season, res.sample ? 'DEMO (offline fixture)' : `${iso(NOW)} UTC`, available) });
        tablePages.push(entry.league);
        log(`  table ${entry.league} (${res.parsed.groups.reduce((n, g) => n + g.rows.length, 0)} rows across ${res.parsed.groups.length} table(s), ${res.parsed.columns.length} columns${res.season ? `, ${res.season}` : ''})`);
        if (!OFFLINE) await sleep(FETCH_DELAY_MS);
    }

    // Now that every table that will exist this run is known, render them: the
    // chip rows and the match pages may only link to what was really written.
    const availableTables = new Set(tablePages);
    for (const job of tableJobs) writePage(path.join('table', job.slug), job.write(availableTables));

    // 2. Match snapshots from scoreboards
    const targets = sweepTargets(vmCtx);
    const seen = new Set();
    const events = [];
    for (const t of targets) {
        const days = [];
        for (let d = -REPORT_DAYS; d <= t.previewDays; d++) {
            days.push(new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()) + d * 86400000));
        }
        for (const day of days) {
            try {
                const sb = await fetchScoreboard(t.sport, t.league, day);
                for (const ev of arr(sb && sb.events)) {
                    if (seen.has(ev.id)) continue;
                    seen.add(ev.id);
                    const state = ev.status && ev.status.type && ev.status.type.state;
                    if (state === 'post' || state === 'pre') events.push({ ev, state, target: t });
                }
            } catch (e) { /* league may have no fixtures this day — normal */ }
            if (!OFFLINE) await sleep(FETCH_DELAY_MS);
        }
        log(`  scoreboard sweep: ${t.sport}/${t.league} done (running total ${events.length} matches)`);
    }

    // Selection: soccer keeps one global window (its original behaviour), every
    // other league gets its own cap so one busy league cannot fill the sweep.
    const byDateAsc = (a, b) => new Date(a.ev.date) - new Date(b.ev.date);
    const byDateDesc = (a, b) => new Date(b.ev.date) - new Date(a.ev.date);
    const soccerReports = events.filter((e) => e.state === 'post' && e.target.bucket === 'soccer').sort(byDateDesc).slice(0, MAX_REPORTS);
    const soccerPreviews = events.filter((e) => e.state === 'pre' && e.target.bucket === 'soccer').sort(byDateAsc).slice(0, MAX_PREVIEWS);
    const reports = [...soccerReports];
    const previews = [...soccerPreviews];
    for (const t of targets.filter((x) => x.bucket !== 'soccer')) {
        reports.push(...events.filter((e) => e.state === 'post' && e.target === t).sort(byDateDesc).slice(0, t.reportCap));
        previews.push(...events.filter((e) => e.state === 'pre' && e.target === t).sort(byDateAsc).slice(0, t.previewCap));
    }

    // Summaries: one request per published report in the sports whose box score
    // and scoring plays live behind the summary endpoint.
    let summaryFetches = 0;
    const summaries = new Map();
    for (const { ev, target } of reports) {
        if (target.sport === 'soccer') continue;
        if (summaryFetches >= MAX_SUMMARY_FETCHES) break;
        summaryFetches++;
        try {
            const s = await fetchSummary(target.sport, target.league, ev.id);
            if (s) summaries.set(ev.id, s);
        } catch (e) { /* page still renders from the scoreboard payload */ }
        if (!OFFLINE) await sleep(FETCH_DELAY_MS);
    }
    log(`  fetched ${summaries.size} match summaries for non-soccer reports`);

    for (const { ev, target } of reports) {
        const meta = { sport: target.sport, league: target.league, name: target.name || leagueNameOf(ev, target) };
        writePage(path.join('report', ev.id), matchPageHTML('report', ev, meta, OFFLINE ? 'DEMO (offline fixture)' : `${iso(NOW)} UTC`, { summary: summaries.get(ev.id) || null }, availableTables));
    }
    for (const { ev, target } of previews) {
        const meta = { sport: target.sport, league: target.league, name: target.name || leagueNameOf(ev, target) };
        writePage(path.join('preview', ev.id), matchPageHTML('preview', ev, meta, OFFLINE ? 'DEMO (offline fixture)' : `${iso(NOW)} UTC`, {}, availableTables));
    }
    log(`wrote ${reports.length} report + ${previews.length} preview snapshot pages`);

    // 3. Prune snapshots outside the rolling window
    if (!OFFLINE) pruneSnapshots(targets);
    else log('  offline mode: pruning skipped (demo build)');

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
    buildSitemaps(tablePages.sort(), newsItems);
    log(`done: ${tablePages.length} tables, ${reports.length} reports, ${previews.length} previews, sitemap.xml${OFFLINE ? ' (offline fixtures — do not deploy)' : ''}`);
}

/* League names for the soccer cups that have no table page: ESPN sends the
   competition name on the event itself, so read it from there. */
function leagueNameOf(ev, target) {
    const notes = ev.competitions && ev.competitions[0] && ev.competitions[0].notes;
    const note = arr(notes).find((n) => n && n.headline);
    return (note && note.headline) || target.name || 'Football';
}

/* Only run when executed directly: testdata/verify.mjs imports the parsers
   from this file to check them against the recorded ESPN payloads. */
const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
    main().catch((e) => { console.error(e); process.exit(1); });
}

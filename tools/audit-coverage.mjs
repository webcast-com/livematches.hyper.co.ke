#!/usr/bin/env node
/* Coverage audit — for every competition the site claims to integrate, ask
   ESPN whether it is actually serving data, and write the answer down.

   Why this exists: COMPETITION-COVERAGE.md counts what the code *registers*
   (261 competitions across 9 sports). That is a different question from what
   ESPN *answers*. A slug can be registered everywhere the contract requires
   and still 400 forever, or return 200 with an empty event list because the
   competition is out of season. Both look identical from inside the repo, and
   both were previously invisible until someone opened the page.

   What it checks, per competition:
     scoreboard  <sport>/<league>/scoreboard?dates=<from>-<to>   (one request,
                 a +/- 7 day range, so a league that simply is not playing
                 today is not mistaken for a dead endpoint)
     standings   <sport>/<league>/standings                      (only for the
                 leagues that advertise a /table/<slug>/ page)

   Verdicts:
     live        ESPN answered and there is real content (fixtures in the
                 window, or a table with rows)
     idle        ESPN answered, but nothing is scheduled in the window and
                 there is no table — an out-of-season or dormant competition
     empty       ESPN answered with a payload that carries no league identity
                 at all (a slug it tolerates but does not populate)
     dead        HTTP error / timeout — a slug that should be dropped

   Output:
     COVERAGE-AUDIT.md          human-readable, grouped by sport and country
     testdata/coverage-audit.json  machine-readable, for the verifier

   Modes:
     node tools/audit-coverage.mjs              audit everything (needs network)
     node tools/audit-coverage.mjs --sport soccer   one sport only
     node tools/audit-coverage.mjs --limit 20   first N competitions (smoke test)
     node tools/audit-coverage.mjs --out DIR    write somewhere else

   Zero dependencies, node >= 18. */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

import { SPORTS } from './sports.mjs';

const argv = process.argv.slice(2);
const TOOLSDIR = path.dirname(fileURLToPath(import.meta.url));
const outIdx = argv.indexOf('--out');
const ROOT = outIdx >= 0 ? path.resolve(argv[outIdx + 1]) : path.resolve(TOOLSDIR, '..');
const sportIdx = argv.indexOf('--sport');
const ONLY_SPORT = sportIdx >= 0 ? argv[sportIdx + 1] : null;
const limitIdx = argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(argv[limitIdx + 1], 10) : Infinity;

const NOW = new Date();
const WINDOW_DAYS = 7;
const DELAY_MS = 110;
const TIMEOUT_MS = 15000;

const log = (m) => console.log(`[audit] ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const yyyymmdd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
const shift = (days) => new Date(NOW.getTime() + days * 86400000);

async function getJSON(url) {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}

/* ------------------------------------------------- what the site registers */

/* app.js is a browser script that boots on load. Run it with a Proxy standing
   in for the DOM so nothing throws, then lift the two tables out of it. */
function loadAppTables() {
    const stub = new Proxy(function () {}, {
        get: () => stub, set: () => true, apply: () => stub, has: () => true,
    });
    const ctx = vm.createContext({
        window: new Proxy({}, { get: () => stub, set: () => true }),
        document: new Proxy({}, { get: () => stub }),
        console: { log() {}, warn() {}, error() {} },
        localStorage: stub, navigator: stub, location: { search: '', href: '' },
        setInterval: () => 0, setTimeout: () => 0, clearInterval: () => {},
        fetch: () => Promise.reject(new Error('no network during load')),
    });
    vm.runInContext(
        readFileSync(path.join(TOOLSDIR, '..', 'app.js'), 'utf8')
        + ';globalThis.__tables = { ESPN_ENDPOINTS, LEAGUE_NAMES };',
        ctx, { filename: 'app.js' }
    );
    return ctx.__tables;
}

function loadStandingsLeagues() {
    const ctx = vm.createContext({ window: {}, document: {}, console: { log() {}, warn() {}, error() {} } });
    vm.runInContext(
        readFileSync(path.join(TOOLSDIR, '..', 'standings.js'), 'utf8')
        + ';globalThis.__L = STANDINGS_LEAGUES;',
        ctx, { filename: 'standings.js' }
    );
    return ctx.__L;
}

/* ---------------------------------------------------------------- geography
   ESPN league slugs are "<iso3-ish country>.<tier>" for domestic leagues and
   "<confederation>.<competition>" for everything else. Map the prefixes the
   site actually uses so the report can be read by country. */
const COUNTRIES = {
    afg: 'Afghanistan', alg: 'Algeria', and: 'Andorra', arg: 'Argentina', arm: 'Armenia',
    aus: 'Australia', aut: 'Austria', aze: 'Azerbaijan', bel: 'Belgium', bih: 'Bosnia & Herzegovina',
    blr: 'Belarus', bol: 'Bolivia', bra: 'Brazil', bul: 'Bulgaria', can: 'Canada',
    chi: 'Chile', chn: 'China', civ: "Côte d'Ivoire", col: 'Colombia', crc: 'Costa Rica',
    cro: 'Croatia', cyp: 'Cyprus', cze: 'Czechia', den: 'Denmark', ecu: 'Ecuador',
    egy: 'Egypt', eng: 'England', esp: 'Spain', est: 'Estonia', fin: 'Finland',
    fra: 'France', geo: 'Georgia', ger: 'Germany', gha: 'Ghana', gre: 'Greece',
    gua: 'Guatemala', hkg: 'Hong Kong', hon: 'Honduras', hun: 'Hungary', idn: 'Indonesia',
    ind: 'India', irl: 'Republic of Ireland', irn: 'Iran', isl: 'Iceland', isr: 'Israel',
    ita: 'Italy', jam: 'Jamaica', jpn: 'Japan', ken: 'Kenya', kor: 'South Korea',
    ksa: 'Saudi Arabia', kuw: 'Kuwait', lat: 'Latvia', ltu: 'Lithuania', lux: 'Luxembourg',
    mac: 'North Macedonia', mar: 'Morocco', mda: 'Moldova', mex: 'Mexico', mlt: 'Malta',
    mys: 'Malaysia', ned: 'Netherlands', ngr: 'Nigeria', nga: 'Nigeria', nir: 'Northern Ireland',
    nor: 'Norway', nzl: 'New Zealand', pan: 'Panama', par: 'Paraguay', per: 'Peru',
    phi: 'Philippines', pol: 'Poland', por: 'Portugal', qat: 'Qatar', rou: 'Romania',
    rsa: 'South Africa', rus: 'Russia', sco: 'Scotland', sen: 'Senegal', sgp: 'Singapore',
    slv: 'El Salvador', srb: 'Serbia', sui: 'Switzerland', svk: 'Slovakia', svn: 'Slovenia',
    swe: 'Sweden', tan: 'Tanzania', tha: 'Thailand', tun: 'Tunisia', tur: 'Turkey',
    uae: 'United Arab Emirates', uga: 'Uganda', ukr: 'Ukraine', uru: 'Uruguay',
    usa: 'United States', uzb: 'Uzbekistan', ven: 'Venezuela', vie: 'Vietnam',
    wal: 'Wales', zam: 'Zambia', zim: 'Zimbabwe',
};
const BODIES = {
    uefa: 'UEFA (Europe)', conmebol: 'CONMEBOL (South America)',
    concacaf: 'CONCACAF (North & Central America)', caf: 'CAF (Africa)',
    afc: 'AFC (Asia)', ofc: 'OFC (Oceania)', fifa: 'FIFA (world)',
    club: 'Club friendlies',
};
/* The North-American and other non-soccer leagues carry no country in the
   slug; name their home explicitly. */
const LEAGUE_HOME = {
    nfl: 'United States', 'college-football': 'United States', ufl: 'United States',
    xfl: 'United States', cfl: 'Canada',
    nba: 'United States', wnba: 'United States', 'nba-development': 'United States',
    'mens-college-basketball': 'United States', 'womens-college-basketball': 'United States',
    nbl: 'Australia', euroleague: 'Europe',
    mlb: 'United States', 'college-baseball': 'United States', 'college-softball': 'United States',
    'mexican-winter-league': 'Mexico', 'dominican-winter-league': 'Dominican Republic',
    'caribbean-series': 'Caribbean', 'world-baseball-classic': 'World',
    llb: 'World',
    nhl: 'United States & Canada', 'mens-college-hockey': 'United States',
    'womens-college-hockey': 'United States', 'olympics-mens-ice-hockey': 'World',
    ahl: 'United States & Canada', khl: 'Russia', shl: 'Sweden', liiga: 'Finland',
    atp: 'World', wta: 'World',
};

function regionOf(sport, league) {
    if (LEAGUE_HOME[league]) return LEAGUE_HOME[league];
    const prefix = String(league).split('.')[0];
    if (COUNTRIES[prefix]) return COUNTRIES[prefix];
    if (BODIES[prefix]) return BODIES[prefix];
    return 'Other / international';
}

/* ------------------------------------------------------------------ probing */

async function probeScoreboard(sport, league) {
    const from = yyyymmdd(shift(-WINDOW_DAYS));
    const to = yyyymmdd(shift(WINDOW_DAYS));
    const base = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
    // A date range is one request instead of fifteen. Not every league accepts
    // it, so fall back to the plain scoreboard (today) before calling it dead.
    for (const url of [`${base}?dates=${from}-${to}&limit=400`, `${base}?limit=400`]) {
        try {
            const j = await getJSON(url);
            const events = Array.isArray(j.events) ? j.events : [];
            const lg = (j.leagues && j.leagues[0]) || {};
            return {
                ok: true,
                espnName: lg.name || lg.abbreviation || '',
                season: (lg.season && (lg.season.displayName || lg.season.year)) || (j.season && j.season.year) || '',
                events: events.length,
                finished: events.filter((e) => e.status && e.status.type && e.status.type.state === 'post').length,
                upcoming: events.filter((e) => e.status && e.status.type && e.status.type.state === 'pre').length,
                ranged: url.includes('dates='),
            };
        } catch (e) {
            var lastError = e.message; // eslint-disable-line no-var
        }
        await sleep(DELAY_MS);
    }
    return { ok: false, error: lastError || 'unknown error' };
}

async function probeStandings(sport, league) {
    const p = `/apis/v2/sports/${sport}/${league}/standings?region=us&lang=en&contentorigin=espn`;
    for (const host of ['https://site.web.api.espn.com', 'https://site.api.espn.com']) {
        try {
            const j = await getJSON(host + p);
            const groups = [];
            (function walk(node, depth) {
                if (!node || typeof node !== 'object' || depth > 5) return;
                if (node.standings && Array.isArray(node.standings.entries)) groups.push(node.standings.entries.length);
                if (Array.isArray(node.children)) node.children.forEach((c) => walk(c, depth + 1));
            })(j, 0);
            const rows = groups.reduce((n, x) => n + x, 0);
            return { ok: true, tables: groups.length, rows };
        } catch (e) {
            var lastError = e.message; // eslint-disable-line no-var
        }
        await sleep(DELAY_MS);
    }
    return { ok: false, error: lastError || 'unknown error' };
}

function verdict(sb, st) {
    if (!sb.ok) return 'dead';
    if (sb.events > 0) return 'live';
    if (st && st.ok && st.rows > 0) return 'live';
    if (!sb.espnName) return 'empty';
    return 'idle';
}

/* ------------------------------------------------------------------ report */

const BADGE = { live: '🟢 live', idle: '🟡 idle', empty: '⚪ empty', dead: '🔴 dead' };

function buildMarkdown(rows, meta) {
    const bySport = new Map();
    for (const r of rows) {
        if (!bySport.has(r.sport)) bySport.set(r.sport, []);
        bySport.get(r.sport).push(r);
    }
    const count = (list, v) => list.filter((r) => r.verdict === v).length;
    const out = [];
    out.push('# Coverage audit — what ESPN actually answers');
    out.push('');
    out.push(`Generated by \`node tools/audit-coverage.mjs\` on ${meta.at}.`);
    out.push('');
    out.push('COMPETITION-COVERAGE.md counts what the code registers. This file');
    out.push('counts what ESPN *returns*, competition by competition, so a slug that');
    out.push('is wired up everywhere but answers nothing can no longer hide.');
    out.push('');
    out.push(`Window: fixtures within ±${WINDOW_DAYS} days of the run.`);
    out.push('');
    out.push('| Verdict | Meaning |');
    out.push('|---|---|');
    out.push('| 🟢 live | ESPN answered with fixtures in the window, or a table with rows |');
    out.push('| 🟡 idle | ESPN answered, but nothing scheduled in the window and no table — out of season |');
    out.push('| ⚪ empty | ESPN answered with a payload carrying no league identity |');
    out.push('| 🔴 dead | HTTP error or timeout — the slug should be dropped |');
    out.push('');
    out.push('## Totals');
    out.push('');
    out.push('| Sport | Registered | 🟢 live | 🟡 idle | ⚪ empty | 🔴 dead | Tables with rows |');
    out.push('|---|---:|---:|---:|---:|---:|---:|');
    for (const [sport, list] of [...bySport].sort((a, b) => b[1].length - a[1].length)) {
        out.push(`| ${sport} | ${list.length} | ${count(list, 'live')} | ${count(list, 'idle')} | ${count(list, 'empty')} | ${count(list, 'dead')} | ${list.filter((r) => r.tableRows > 0).length} |`);
    }
    out.push(`| **all** | **${rows.length}** | **${count(rows, 'live')}** | **${count(rows, 'idle')}** | **${count(rows, 'empty')}** | **${count(rows, 'dead')}** | **${rows.filter((r) => r.tableRows > 0).length}** |`);
    out.push('');

    const dead = rows.filter((r) => r.verdict === 'dead');
    if (dead.length) {
        out.push('## Dead slugs — registered but ESPN refuses them');
        out.push('');
        out.push('| Sport | Slug | Site calls it | Error |');
        out.push('|---|---|---|---|');
        for (const r of dead.sort((a, b) => a.path.localeCompare(b.path))) {
            out.push(`| ${r.sport} | \`${r.league}\` | ${r.siteName || '—'} | ${r.error || '—'} |`);
        }
        out.push('');
    }

    const empty = rows.filter((r) => r.verdict === 'empty');
    if (empty.length) {
        out.push('## Empty slugs — answered, but with no league behind the payload');
        out.push('');
        out.push('| Sport | Slug | Site calls it |');
        out.push('|---|---|---|');
        for (const r of empty.sort((a, b) => a.path.localeCompare(b.path))) {
            out.push(`| ${r.sport} | \`${r.league}\` | ${r.siteName || '—'} |`);
        }
        out.push('');
    }

    out.push('## By sport and country');
    out.push('');
    for (const [sport, list] of [...bySport].sort((a, b) => b[1].length - a[1].length)) {
        out.push(`### ${sport} — ${list.length} competitions (${count(list, 'live')} live)`);
        out.push('');
        const byRegion = new Map();
        for (const r of list) {
            if (!byRegion.has(r.region)) byRegion.set(r.region, []);
            byRegion.get(r.region).push(r);
        }
        const regions = [...byRegion].sort((a, b) => a[0].localeCompare(b[0]));
        for (const [region, items] of regions) {
            out.push(`#### ${region}`);
            out.push('');
            out.push('| Status | Slug | Site name | ESPN name | Season | Fixtures ±7d (done / to come) | Table |');
            out.push('|---|---|---|---|---|---|---|');
            for (const r of items.sort((a, b) => a.league.localeCompare(b.league))) {
                const fixtures = r.verdict === 'dead' ? '—' : `${r.events} (${r.finished} / ${r.upcoming})`;
                const table = r.tableChecked
                    ? (r.tableRows > 0 ? `${r.tableRows} rows in ${r.tableGroups} ${r.tableGroups === 1 ? 'table' : 'tables'}` : 'none')
                    : '—';
                out.push(`| ${BADGE[r.verdict]} | \`${r.league}\` | ${r.siteName || '—'} | ${r.espnName || '—'} | ${r.season || '—'} | ${fixtures} | ${table} |`);
            }
            out.push('');
        }
    }
    out.push('---');
    out.push('');
    out.push(`Machine-readable copy: \`testdata/coverage-audit.json\`. Re-run with \`node tools/audit-coverage.mjs\`.`);
    out.push('');
    return out.join('\n');
}

/* -------------------------------------------------------------------- main */

async function main() {
    const { ESPN_ENDPOINTS, LEAGUE_NAMES } = loadAppTables();
    const standingsLeagues = loadStandingsLeagues();

    // Everything the site registers anywhere: the app.js sweeps, the standings
    // page's league list, and the non-soccer config in tools/sports.mjs.
    const registered = new Map();   // "sport/league" -> { sport, league, siteName, wantsTable }
    const add = (sport, league, siteName, wantsTable) => {
        const key = `${sport}/${league}`;
        const prev = registered.get(key);
        registered.set(key, {
            sport, league,
            siteName: siteName || (prev && prev.siteName) || '',
            wantsTable: Boolean(wantsTable) || Boolean(prev && prev.wantsTable),
        });
    };

    for (const list of Object.values(ESPN_ENDPOINTS)) {
        if (!Array.isArray(list)) continue;
        for (const p of list) {
            const i = p.indexOf('/');
            if (i < 0) continue;
            const sport = p.slice(0, i);
            const league = p.slice(i + 1);
            const named = LEAGUE_NAMES[p];
            add(sport, league, named && named.name, false);
        }
    }
    for (const L of standingsLeagues) add(L.sport || 'soccer', L.slug, L.name, true);
    for (const s of SPORTS) add(s.sport, s.league, s.name, Boolean(s.table));

    let list = [...registered.values()].sort((a, b) => a.sport.localeCompare(b.sport) || a.league.localeCompare(b.league));
    log(`registered across app.js sweeps + standings.js + tools/sports.mjs: ${list.length} competitions`);
    if (ONLY_SPORT) list = list.filter((x) => x.sport === ONLY_SPORT);
    list = list.slice(0, LIMIT);

    log(`auditing ${list.length} competitions (window ±${WINDOW_DAYS} days)`);
    const rows = [];
    let n = 0;
    for (const entry of list) {
        n++;
        const sb = await probeScoreboard(entry.sport, entry.league);
        await sleep(DELAY_MS);
        let st = null;
        if (entry.wantsTable && sb.ok) {
            st = await probeStandings(entry.sport, entry.league);
            await sleep(DELAY_MS);
        }
        const row = {
            path: `${entry.sport}/${entry.league}`,
            sport: entry.sport,
            league: entry.league,
            siteName: entry.siteName,
            region: regionOf(entry.sport, entry.league),
            espnName: sb.espnName || '',
            season: sb.season || '',
            events: sb.events || 0,
            finished: sb.finished || 0,
            upcoming: sb.upcoming || 0,
            error: sb.error || '',
            tableChecked: Boolean(st),
            tableRows: (st && st.rows) || 0,
            tableGroups: (st && st.tables) || 0,
            verdict: verdict(sb, st),
        };
        rows.push(row);
        if (n % 20 === 0 || row.verdict === 'dead') {
            log(`  ${String(n).padStart(3)}/${list.length} ${row.path} -> ${row.verdict}${row.error ? ` (${row.error})` : ''}`);
        }
    }

    const meta = { at: new Date().toISOString(), windowDays: WINDOW_DAYS, total: rows.length };
    mkdirSync(path.join(ROOT, 'testdata'), { recursive: true });
    writeFileSync(path.join(ROOT, 'testdata', 'coverage-audit.json'), JSON.stringify({ meta, rows }, null, 1) + '\n');
    writeFileSync(path.join(ROOT, 'COVERAGE-AUDIT.md'), buildMarkdown(rows, meta));

    const tally = (v) => rows.filter((r) => r.verdict === v).length;
    log(`done: ${tally('live')} live, ${tally('idle')} idle, ${tally('empty')} empty, ${tally('dead')} dead`);
    if (tally('dead')) {
        log('dead slugs: ' + rows.filter((r) => r.verdict === 'dead').map((r) => r.path).join(', '));
    }
}

main().catch((e) => { console.error(e); process.exit(1); });

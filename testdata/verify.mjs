/* Checks the endpoint samples in this folder are still usable, and that the
   live code still agrees with what sitemap.xml and standings.html advertise.

       node testdata/verify.mjs

   It parses both samples, asserts every field path the site reads is present
   and of the right type (the old espn_test.json had them flattened into
   PowerShell strings like "team=; statistics=System.Object[]"), then runs the
   real parseStandingsGroups() out of ../standings.js against the MLS sample to
   prove both conferences survive.

   No dependencies, no network. Exits non-zero on the first failed check. */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SPORTS, TABLE_COLUMNS } from '../tools/sports.mjs';
import { parseSportStandings, seasonLabelForSport } from '../tools/prerender.mjs';
import { buildAll as buildSportPages } from '../tools/build-sport-pages.mjs';

const SportPages = createRequire(import.meta.url)('../sport-pages.js');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

const results = [];
let failures = 0;
const check = (name, fn) => {
    try { fn(); results.push(`  ok    ${name}`); }
    catch (e) { failures++; results.push(`  FAIL  ${name}\n          ${e.message}`); }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

function readText(file) {
    const buf = fs.readFileSync(path.join(HERE, file));
    assert(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), 'file starts with a UTF-8 BOM');
    return buf.toString('utf8');
}

function readJSON(file) {
    const text = readText(file);
    try { return JSON.parse(text); }
    catch (e) { throw new Error(`does not parse as JSON: ${e.message}`); }
}

/* Table slugs published for the sports that have no interactive page. */
const sportTableSlugs = () => SPORTS.filter((s) => s.table).map((s) => s.league);

const ROOT_PAGES = ['index.html', 'news.html', 'about.html', 'predictions.html',
    'standings.html', 'highlights.html', 'transfers.html', 'shop.html', 'previews.html',
    'privacy.html', 'terms.html', 'match.html', 'story.html', 'preview.html',
    'report.html', 'offline.html'];

const FLATTENED = /^@\{|System\.Object\[\]|(^|;)\s*[A-Za-z_][A-Za-z0-9_]*=/;

function walkStrings(value, visit, trail = '') {
    if (typeof value === 'string') { visit(value, trail); return; }
    if (Array.isArray(value)) { value.forEach((v, i) => walkStrings(v, visit, `${trail}[${i}]`)); return; }
    if (value && typeof value === 'object') {
        Object.keys(value).forEach((k) => walkStrings(value[k], visit, trail ? `${trail}.${k}` : k));
    }
}

/* Resolve a path like ["events", "*", "competitions", "*", "competitors", "*",
   "team", "displayName"] to every value it matches ("*" = every array item). */
function values(data, segments) {
    let current = [data];
    for (const seg of segments) {
        const next = [];
        for (const node of current) {
            if (seg === '*') {
                if (Array.isArray(node)) next.push(...node);
            } else if (node && typeof node === 'object' && seg in node) {
                next.push(node[seg]);
            }
        }
        current = next;
    }
    return current;
}

function requirePath(data, segments, kind, { allowEmpty = false } = {}) {
    const found = values(data, segments);
    const label = segments.join('.');
    assert(found.length, `missing: ${label}`);
    for (const v of found) {
        if (kind === 'string') {
            assert(typeof v === 'string', `${label} is ${JSON.stringify(v)}, expected a string`);
            assert(allowEmpty || v !== '', `${label} is empty`);
        } else if (kind === 'number') {
            assert(typeof v === 'number' && isFinite(v), `${label} is ${JSON.stringify(v)}, expected a number`);
        } else if (kind === 'boolean') {
            assert(typeof v === 'boolean', `${label} is ${JSON.stringify(v)}, expected a boolean`);
        } else if (kind === 'array') {
            assert(Array.isArray(v), `${label} is ${JSON.stringify(v)}, expected an array`);
        } else if (kind === 'object') {
            assert(v && typeof v === 'object' && !Array.isArray(v), `${label} is ${JSON.stringify(v)}, expected an object`);
        }
    }
    return found;
}

/* ---------------------------------------------------------------- fixtures */

let scoreboard, standings;
check('espn-scoreboard.sample.json loads as BOM-free JSON', () => { scoreboard = readJSON('espn-scoreboard.sample.json'); });
check('espn-standings.sample.json loads as BOM-free JSON', () => { standings = readJSON('espn-standings.sample.json'); });
if (failures) { report(); }

check('no value in either sample was flattened by ConvertTo-Json', () => {
    for (const [file, data] of [['espn-scoreboard.sample.json', scoreboard], ['espn-standings.sample.json', standings]]) {
        walkStrings(data, (s, trail) => {
            assert(!FLATTENED.test(s), `${file} ${trail} looks like a flattened PowerShell value: ${JSON.stringify(s.slice(0, 60))}`);
        });
    }
});

const S = (p, kind = 'string', opts) => check(`scoreboard: ${p.join('.')}`, () => requirePath(scoreboard, p, kind, opts));

S(['leagues', '*', 'slug']);
S(['leagues', '*', 'name']);
S(['season', 'year'], 'number');
S(['day', 'date']);
S(['events', '*', 'id']);
S(['events', '*', 'date']);
S(['events', '*', 'name']);
S(['events', '*', 'status', 'type', 'state']);
S(['events', '*', 'competitions', '*', 'status', 'type', 'shortDetail']);
S(['events', '*', 'competitions', '*', 'venue', 'fullName']);
S(['events', '*', 'competitions', '*', 'format', 'regulation', 'periods'], 'number');
S(['events', '*', 'competitions', '*', 'attendance'], 'number');
S(['events', '*', 'competitions', '*', 'competitors', '*', 'homeAway']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'score']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'form']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'team', 'displayName']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'team', 'abbreviation']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'team', 'logos', 0, 'href']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'statistics'], 'array');
S(['events', '*', 'competitions', '*', 'competitors', '*', 'statistics', '*', 'name']);
S(['events', '*', 'competitions', '*', 'competitors', '*', 'statistics', '*', 'displayValue']);
S(['events', '*', 'competitions', '*', 'details'], 'array');
S(['events', '*', 'competitions', '*', 'details', '*', 'scoringPlay'], 'boolean');
S(['events', '*', 'competitions', '*', 'details', '*', 'clock', 'displayValue']);
S(['events', '*', 'competitions', '*', 'details', '*', 'athletesInvolved', 0, 'displayName']);
S(['events', '*', 'competitions', '*', 'details', '*', 'team', 'id']);
S(['events', '*', 'competitions', '*', 'odds', 0, 'provider', 'name']);
S(['events', '*', 'competitions', '*', 'odds', 0, 'homeTeamOdds', 'moneyLine'], 'number');
S(['events', '*', 'competitions', '*', 'odds', 0, 'drawOdds', 'moneyLine'], 'number');
S(['events', '*', 'competitions', '*', 'broadcasts', 0, 'names', 0]);
S(['events', '*', 'competitions', '*', 'geoBroadcasts', 0, 'media', 'shortName']);

check('scoreboard: both competitors are real teams (not the old empty team=)', () => {
    const names = values(scoreboard, ['events', '*', 'competitions', '*', 'competitors', '*', 'team', 'displayName']);
    assert(names.length === 2, `expected 2 competitors, found ${names.length}`);
    assert(new Set(names).size === 2, `both competitors are named ${names[0]}`);
});

const T = (p, kind = 'string', opts) => check(`standings: ${p.join('.')}`, () => requirePath(standings, p, kind, opts));

T(['season', 'year'], 'number');
T(['children'], 'array');
T(['children', '*', 'name']);
T(['children', '*', 'standings', 'entries'], 'array');
T(['children', '*', 'standings', 'entries', '*', 'team', 'displayName']);
T(['children', '*', 'standings', 'entries', '*', 'team', 'abbreviation']);
T(['children', '*', 'standings', 'entries', '*', 'team', 'logos', 0, 'href']);
T(['children', '*', 'standings', 'entries', '*', 'stats'], 'array');
T(['children', '*', 'standings', 'entries', '*', 'stats', '*', 'name']);
T(['children', '*', 'standings', 'entries', '*', 'stats', '*', 'displayValue']);

check('standings: sample exercises the conference split (MLS has two tables)', () => {
    const names = values(standings, ['children', '*', 'name']);
    assert(names.length >= 2, `only ${names.length} table in the sample — a single-table league cannot test the split`);
    assert(names.includes('Eastern Conference') && names.includes('Western Conference'), `unexpected table names: ${names.join(', ')}`);
});

check('standings: every row carries rank, points and a goals-for stat', () => {
    const entries = values(standings, ['children', '*', 'standings', 'entries', '*']);
    for (const entry of entries) {
        const statNames = (entry.stats || []).map((s) => s.name);
        for (const key of ['rank', 'gamesPlayed', 'wins', 'ties', 'losses', 'pointsFor', 'pointsAgainst', 'pointDifferential', 'points']) {
            assert(statNames.includes(key), `${entry.team.displayName} is missing the "${key}" stat`);
        }
    }
});

/* -------------------------------------------------- live parser vs samples */

// tableHTML() localises its "Team" header through i18n.js's t(); the shim
// returns the key, which is all the header assertions need.
const context = vm.createContext({ window: {}, console, t: (key) => key });
// `const` declarations stay in the script's own scope, so the file is run with
// a trailing export of the helpers this file checks.
vm.runInContext(
    readText('../standings.js') + '\n;globalThis.__exports = { STANDINGS_LEAGUES, parseStandings, parseStandingsGroups, payloadSeasonLabel, seasonLabelFromSlug, currentSeasonLabel, tableHTML, TABLE_COLUMNS: TABLE_COLUMNS };\n',
    context,
    { filename: 'standings.js' }
);
const { parseStandings, parseStandingsGroups, payloadSeasonLabel, seasonLabelFromSlug, currentSeasonLabel, STANDINGS_LEAGUES, tableHTML, TABLE_COLUMNS: LIVE_TABLE_COLUMNS } = context.__exports;
/* STANDINGS_LEAGUES stopped being soccer-only when the interactive page learned
   to render the other sports; the checks below that mean "a soccer table page"
   have to say so explicitly. */
const SOCCER_LEAGUES = STANDINGS_LEAGUES.filter((l) => (l.sport || 'soccer') === 'soccer');

check('parseStandingsGroups() keeps both MLS conferences', () => {
    const groups = parseStandingsGroups(standings);
    assert(groups.length === 2, `expected 2 tables, got ${groups.length} — the old code read children[0] only`);
    assert(groups[0].name === 'Eastern Conference' && groups[1].name === 'Western Conference', `names: ${groups.map((g) => g.name).join(', ')}`);
    assert(groups[0].rows.length === 3 && groups[1].rows.length === 2, `row counts: ${groups.map((g) => g.rows.length).join(', ')}`);
});

check('parseStandingsGroups() sorts each table by rank and keeps the stats', () => {
    for (const group of parseStandingsGroups(standings)) {
        const ranks = group.rows.map((r) => r.rank);
        assert(ranks.join() === [...ranks].sort((a, b) => a - b).join(), `${group.name} is not ordered by rank: ${ranks.join()}`);
        for (const row of group.rows) {
            assert(row.team && row.team !== '?', `${group.name} has a row with no team name`);
            assert(row.played > 0 && row.pts > 0, `${row.team} parsed as P=${row.played} Pts=${row.pts}`);
            assert(row.logo.startsWith('https://'), `${row.team} has no crest`);
            assert(row.gd === row.gf - row.ga, `${row.team} GD (${row.gd}) is not GF-GA (${row.gf - row.ga})`);
        }
    }
});

check('parseStandings() stays a flat array (homepage-widget shape)', () => {
    const rows = parseStandings(standings);
    assert(Array.isArray(rows) && rows.length === 5, `expected 5 rows, got ${rows && rows.length}`);
});

check('match.js parseTable() keeps both MLS conferences', () => {
    const matchCtx = vm.createContext({ window: {}, console, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../match.js') + '; globalThis.__parseTable = parseTable;', matchCtx);
    const rows = matchCtx.__parseTable(standings);
    assert(Array.isArray(rows) && rows.length === 5, `expected 5 rows across conferences, got ${rows.length}`);
});

check('preview.js parsePreviewTable() keeps both MLS conferences', () => {
    const prevCtx = vm.createContext({ window: {}, console, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../preview.js') + '; globalThis.__parsePreviewTable = parsePreviewTable;', prevCtx);
    const rows = prevCtx.__parsePreviewTable(standings);
    assert(Array.isArray(rows) && rows.length === 5, `expected 5 rows across conferences, got ${rows.length}`);
});

check('report.js parseReportTable() keeps both MLS conferences', () => {
    const repCtx = vm.createContext({ window: {}, console, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../report.js') + '; globalThis.__parseReportTable = parseReportTable;', repCtx);
    const rows = repCtx.__parseReportTable(standings);
    assert(Array.isArray(rows) && rows.length === 5, `expected 5 rows across conferences, got ${rows.length}`);
});

check('previews.js parseHubTable() keeps both MLS conferences', () => {
    const hubCtx = vm.createContext({ window: {}, console, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../previews.js') + '; globalThis.__parseHubTable = parseHubTable;', hubCtx);
    const rows = hubCtx.__parseHubTable(standings);
    assert(Array.isArray(rows) && rows.length === 5, `expected 5 rows across conferences, got ${rows.length}`);
});

check('single-table and nested payloads still yield one table', () => {
    const one = { children: [{ name: 'English Premier League', standings: { entries: [{ stats: [{ name: 'rank', displayValue: '1' }, { name: 'points', displayValue: '89' }], team: { displayName: 'Arsenal' } }] } }] };
    assert(parseStandingsGroups(one).length === 1, 'the common one-table payload produced ' + parseStandingsGroups(one).length + ' tables');
    const nested = { children: [{ name: 'Outer', children: [{ name: 'Inner', standings: { entries: [{ stats: [{ name: 'rank', displayValue: '1' }], team: { displayName: 'Arsenal' } }] } }] }] };
    const nestedGroups = parseStandingsGroups(nested);
    assert(nestedGroups.length === 1 && nestedGroups[0].rows.length === 1, 'a second level of children was not followed');
});

check('season labels come off the payload, not a hard-coded string', () => {
    assert(payloadSeasonLabel(scoreboard) === '2025/26', `scoreboard sample gave ${payloadSeasonLabel(scoreboard)}`);
    assert(payloadSeasonLabel(standings) === '2026/27', `standings sample gave ${payloadSeasonLabel(standings)}`);
    assert(payloadSeasonLabel({ season: { slug: '2026-27' } }) === '2026/27', 'season.slug was not understood');
    assert(currentSeasonLabel(new Date('2026-09-15T12:00:00Z')) === '2026/27', 'September should be the new season');
    assert(currentSeasonLabel(new Date('2026-03-01T12:00:00Z')) === '2025/26', 'March should still be the old season');
    assert(seasonLabelFromSlug('nonsense') === null, 'a junk slug should fall through to the date');
});

/* --------------------------------------------------- site-wide consistency */

check('every standings link in sitemap.xml is a league this page can render', () => {
    const sitemap = readText('../sitemap.xml');
    const qSlugs = [...sitemap.matchAll(/standings\.html\?league=([^"'&<\s]+)/g)].map((m) => m[1]);
    const tSlugs = [...sitemap.matchAll(/\/table\/([a-z0-9.]+)\//g)].map((m) => m[1]);
    const slugs = [...qSlugs, ...tSlugs];
    assert(slugs.length, 'no league-table links found in sitemap.xml (neither ?league= nor /table/)');
    const known = new Set([...STANDINGS_LEAGUES.map((l) => l.slug), ...sportTableSlugs()]);
    const unknown = slugs.filter((s) => !known.has(s));
    assert(!unknown.length, `sitemap.xml advertises leagues with no table: ${unknown.join(', ')}`);
    if (qSlugs.length) {
        const missing = STANDINGS_LEAGUES.filter((l) => !slugs.includes(l.slug)).map((l) => l.slug);
        assert(!missing.length, `these leagues have no sitemap entry: ${missing.join(', ')}`);
    } else {
        // generated regime (tools/prerender.mjs): the sitemap must mirror the
        // prerendered table pages exactly — no URL for a page that does not exist
        const dir = path.join(HERE, '..', 'table');
        const pageDirs = fs.existsSync(dir) ? fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'index.html'))) : [];
        const onlyInSitemap = tSlugs.filter((s) => !pageDirs.includes(s));
        assert(!onlyInSitemap.length, `sitemap lists table pages that do not exist: ${onlyInSitemap.join(', ')}`);
    }
});

check('prerendered table pages (when present) are for known leagues and self-canonical', () => {
    const dir = path.join(HERE, '..', 'table');
    if (!fs.existsSync(dir)) return; // generator has not run yet — nothing to check
    const known = new Set([...STANDINGS_LEAGUES.map((l) => l.slug), ...sportTableSlugs()]);
    const dirs = fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'index.html')));
    assert(dirs.length, 'table/ exists but holds no pages');
    const unknown = dirs.filter((d) => !known.has(d));
    assert(!unknown.length, `table/ has pages for unknown leagues: ${unknown.join(', ')}`);
    for (const d of dirs) {
        const c = readText(`../table/${d}/index.html`);
        assert(c.includes(`<link rel="canonical" href="https://livematches.hyper.co.ke/table/${d}/">`),
            `table/${d}: canonical is not its own /table/${d}/ URL`);
        assert(!/loading-note/i.test(c), `table/${d}: static page contains a loading placeholder`);
        assert(c.includes('prerender-meta'), `table/${d}: missing prerender-meta (sitemap generator depends on it)`);
    }
});

/* ------------------------------------------------- multi-sport snapshots */

check('multi-sport table pages are for configured leagues and self-canonical', () => {
    const dir = path.join(ROOT, 'table');
    if (!fs.existsSync(dir)) return;   // generator has not run yet
    const soccer = new Set(SOCCER_LEAGUES.map((l) => l.slug));
    const config = new Map(SPORTS.filter((s) => s.table).map((s) => [s.league, s]));
    const dirs = fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'index.html')));
    for (const d of dirs.filter((x) => !soccer.has(x))) {
        assert(config.has(d), `table/${d} is not a configured multi-sport league — a dropped league left a page behind`);
        const entry = config.get(d);
        const c = readText(`../table/${d}/index.html`);
        assert(c.includes(`<link rel="canonical" href="https://livematches.hyper.co.ke/table/${d}/">`),
            `table/${d}: canonical is not its own /table/${d}/ URL`);
        const meta = /<!-- prerender-meta: (\{.*?\}) -->/.exec(c);
        assert(meta, `table/${d}: missing prerender-meta`);
        const parsed = JSON.parse(meta[1]);
        assert(parsed.sport === entry.sport, `table/${d}: meta.sport is ${parsed.sport}, expected ${entry.sport}`);
        assert(c.includes('<table class="full-table">'), `table/${d}: no standings table in the page`);
        assert(!/loading-note/i.test(c), `table/${d}: static page contains a loading placeholder`);
        // the page must not advertise a table that is empty: at least a header
        // row plus one club per configured column
        const columns = TABLE_COLUMNS[entry.sport] || [];
        assert(columns.length, `no TABLE_COLUMNS configured for ${entry.sport}`);
        assert(c.includes('class="full-team-name"'), `table/${d}: the table has no table rows`);
        // at least a third of the configured columns must appear as headers,
        // otherwise the page is a table of names with no numbers behind them
        const headers = [...c.matchAll(/<th>([^<]*)<\/th>/g)].map((m) => m[1]);
        const present = columns.filter((col) => headers.includes(col.label)).length;
        assert(present >= Math.ceil(columns.length / 3),
            `table/${d}: only ${present} of ${columns.length} ${entry.sport} columns rendered (${headers.join(',')})`);
    }
});

check('every /table/ link on the hand-written pages points at a configured league', () => {
    // standings.html points readers at the other sports' tables; a typo there
    // would be a 404 on a page humans edit by hand.
    const config = new Set([...STANDINGS_LEAGUES.map((l) => l.slug), ...sportTableSlugs()]);
    for (const file of ROOT_PAGES) {
        const full = path.join(ROOT, file);
        if (!fs.existsSync(full)) continue;
        const html = readText(`../${file}`);
        for (const m of html.matchAll(/href="\/table\/([^"/]+)\//g)) {
            assert(config.has(m[1]), `${file} links to /table/${m[1]}/, which no league config defines`);
        }
    }
});

check('every multi-sport table page that exists is linked from the sitemap', () => {
    const dir = path.join(ROOT, 'table');
    if (!fs.existsSync(dir)) return;
    const soccer = new Set(SOCCER_LEAGUES.map((l) => l.slug));
    const sitemap = readText('../sitemap.xml');
    for (const d of fs.readdirSync(dir).filter((x) => fs.existsSync(path.join(dir, x, 'index.html')) && !soccer.has(x))) {
        assert(sitemap.includes(`/table/${d}/`), `sitemap.xml is missing /table/${d}/`);
    }
});

check('snapshot pages declare a sport and never hand off to a soccer-only tool', () => {
    const kinds = ['report', 'preview'];
    const soccerOnly = /(?:report|preview)\.html\?/;
    for (const kind of kinds) {
        const dir = path.join(ROOT, kind);
        if (!fs.existsSync(dir)) continue;
        for (const d of fs.readdirSync(dir).filter((x) => fs.existsSync(path.join(dir, x, 'index.html')))) {
            const c = readText(`../${kind}/${d}/index.html`);
            const meta = /<!-- prerender-meta: (\{.*?\}) -->/.exec(c);
            assert(meta, `${kind}/${d}: missing prerender-meta`);
            const parsed = JSON.parse(meta[1]);
            const sport = parsed.sport || 'soccer';
            assert(['soccer', ...new Set(SPORTS.map((s) => s.sport))].includes(sport), `${kind}/${d}: unknown sport ${sport}`);
            if (sport !== 'soccer') {
                assert(!soccerOnly.test(c), `${kind}/${d}: a ${sport} snapshot links to the soccer-only report/preview tool`);
                assert(parsed.league, `${kind}/${d}: non-soccer snapshot has no league in its meta`);
                assert(SPORTS.some((s) => s.sport === sport && s.league === parsed.league),
                    `${kind}/${d}: ${sport}/${parsed.league} is not in tools/sports.mjs`);
            } else {
                // the original soccer pages keep their link into the interactive hub
                assert(c.includes(`/${kind}.html?id=${d}`), `${kind}/${d}: soccer snapshot lost its interactive ${kind} link`);
            }
        }
    }
});

check('the multi-sport parsers survive the recorded ESPN payloads', () => {
    const base = path.join(ROOT, 'testdata', 'live');
    if (!fs.existsSync(base)) return;   // no fixtures recorded yet
    const days = fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    const latest = days[days.length - 1];
    const dir = path.join(base, latest);
    load: {
        const nfl = JSON.parse(fs.readFileSync(path.join(dir, 'standings.football.nfl.json'), 'utf8'));
        const parsed = parseSportStandings(nfl, 'football');
        const rows = parsed.groups.reduce((n, g) => n + g.rows.length, 0);
        assert(rows >= 32, `NFL fixture produced ${rows} rows`);
        assert(parsed.groups.length >= 2, `NFL fixture produced ${parsed.groups.length} table(s), expected conferences`);
        const labels = parsed.columns.map((c) => c.label);
        for (const col of ['W', 'L', 'PCT']) assert(labels.includes(col), `NFL columns lost ${col} (${labels.join(',')})`);
        assert(parsed.groups[0].rows[0].team && parsed.groups[0].rows[0].team.length > 1, 'NFL rows lost their team name');
    }
    load: {
        const nhl = JSON.parse(fs.readFileSync(path.join(dir, 'standings.hockey.nhl.json'), 'utf8'));
        const parsed = parseSportStandings(nhl, 'hockey');
        const labels = parsed.columns.map((c) => c.label);
        for (const col of ['GP', 'W', 'L', 'OTL', 'PTS']) assert(labels.includes(col), `NHL columns lost ${col} (${labels.join(',')})`);
    }
    load: {
        const mlb = JSON.parse(fs.readFileSync(path.join(dir, 'standings.baseball.mlb.json'), 'utf8'));
        const parsed = parseSportStandings(mlb, 'baseball');
        const labels = parsed.columns.map((c) => c.label);
        for (const col of ['W', 'L', 'PCT', 'GB']) assert(labels.includes(col), `MLB columns lost ${col} (${labels.join(',')})`);
    }
    // ESPN rolls season.year over before the new season starts (MLB on
    // 2026-09-30 still shows the finished 2026 table while the payload says
    // 2027 with a 2027 startDate) — the label must follow the data on the page.
    assert(seasonLabelForSport('baseball', { year: 2027, startDate: '2027-02-18T08:00Z', endDate: '2027-12-11T07:59Z' }) === '2026',
        'a not-yet-started baseball season was labelled with the wrong year');
    assert(seasonLabelForSport('basketball', { year: 2027, startDate: '2026-09-30T07:00Z', endDate: '2027-06-26T06:59Z' }) === '2026-27',
        'a split basketball season lost its two-year label');
    assert(seasonLabelForSport('basketball', { year: 2026, startDate: '2026-04-03T07:00Z', endDate: '2026-11-01T06:59Z' }) === '2026',
        'a single-year basketball season (WNBA) was labelled as a split season');
    assert(seasonLabelForSport('football', { year: 2026, startDate: '2026-08-06T07:00Z', endDate: '2027-02-16T07:59Z' }) === '2026',
        'the NFL season label should be the season year, not a split label');
});

check('news-sitemap.xml (when present) is well-formed news XML for story pages', () => {
    const f2 = path.join(HERE, 'news-sitemap.xml');
    if (!fs.existsSync(f2)) return; // generator writes it only when fresh stories exist
    const c = readText('../news-sitemap.xml');
    assert(c.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'), 'news namespace missing');
    const locs = [...c.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert(locs.length, 'news sitemap has no URLs');
    for (const loc of locs) {
        assert(/^https:\/\/livematches\.hyper\.co\.ke\/story\.html\?id=[^&\s]+$/.test(loc),
            `news sitemap lists a non-story URL: ${loc}`);
    }
    const titles = [...c.matchAll(/<news:title>([^<]+)<\/news:title>/g)];
    assert(titles.length === locs.length, 'every news URL needs a news:title');
});

check('the interactive standings page lists exactly the multi-sport leagues that have tables', () => {
    /* Two lists describe the same leagues: SPORTS (what the prerenderer
       publishes under /table/) and STANDINGS_LEAGUES (what standings.html can
       render live). Letting them drift means either a chip that fetches a
       league ESPN has no table for, or a snapshot with no live page behind it.
       The soccer entries are standings.js's own business — only the leagues
       that appear in both files are compared. */
    const fromSports = SPORTS.filter((x) => x.table).map((x) => `${x.sport}/${x.league}`).sort();
    const fromPage = STANDINGS_LEAGUES.filter((l) => (l.sport || 'soccer') !== 'soccer')
        .map((l) => `${l.sport}/${l.slug}`).sort();
    const missing = fromSports.filter((k) => !fromPage.includes(k));
    const extra = fromPage.filter((k) => !fromSports.includes(k));
    assert(!missing.length, `tools/sports.mjs publishes a table for ${missing.join(', ')} but standings.js has no chip for it`);
    assert(!extra.length, `standings.js offers a live table for ${extra.join(', ')}, which tools/sports.mjs does not configure`);
});

check('every league in standings.js has a sport and a column set for it', () => {
    for (const L of STANDINGS_LEAGUES) {
        assert(L.sport, `${L.code}: no sport on the league entry`);
        const cols = LIVE_TABLE_COLUMNS[L.sport];
        assert(cols && cols.length, `${L.code}: no column set for sport "${L.sport}"`);
    }
});

check('the live and prerendered tables agree on the columns for each sport', () => {
    // A reader who follows /table/nhl/ through to the live page should not see
    // the header change underneath them.
    for (const sport of Object.keys(LIVE_TABLE_COLUMNS)) {
        if (sport === 'soccer') continue;   // soccer has no entry in tools/sports.mjs
        const theirs = (TABLE_COLUMNS[sport] || []).map((c) => c.label);
        const mine = LIVE_TABLE_COLUMNS[sport].map((c) => c.label);
        assert(theirs.length, `tools/sports.mjs has no TABLE_COLUMNS for ${sport}`);
        assert(mine.join(',') === theirs.join(','),
            `${sport} columns differ: standings.js has ${mine.join(',')}, tools/sports.mjs has ${theirs.join(',')}`);
    }
});

check('a non-soccer standings payload renders with its own columns', () => {
    /* The bug this guards: fetchStandings() used to hard-code
       sports/soccer/<slug>, and tableHTML() a P/W/D/L/GF/GA/GD/Pts header, so
       an NHL table came out claiming draws and goal difference. */
    const dir = path.join(HERE, 'live');
    if (!fs.existsSync(dir)) return;
    const day = fs.readdirSync(dir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop();
    if (!day) return;
    let checked = 0;
    for (const L of STANDINGS_LEAGUES.filter((l) => l.sport !== 'soccer')) {
        const file = path.join(dir, day, `standings.${L.sport}.${L.slug}.json`);
        if (!fs.existsSync(file)) continue;
        const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
        const groups = parseStandingsGroups(payload, L.sport);
        assert(groups.length, `${L.code}: recorded payload parsed to no tables`);
        const rows = groups.reduce((all, g) => all.concat(g.rows), []);
        assert(rows.length, `${L.code}: recorded payload parsed to no rows`);
        const html = tableHTML(groups[0].rows, L.sport);
        const headers = [...html.matchAll(/<th>([^<]*)<\/th>/g)].map((m) => m[1]);
        for (const col of LIVE_TABLE_COLUMNS[L.sport]) {
            assert(headers.includes(col.label), `${L.code}: header is missing the ${col.label} column (${headers.join(',')})`);
        }
        assert(!headers.includes('GD'), `${L.code}: a non-soccer table is still rendering the soccer goal-difference header`);
        // html is the first group only (college football splits into twelve
        // conferences), so measure it against that group, not every row.
        const cells = (html.match(/<td>/g) || []).length;
        assert(cells > groups[0].rows.length, `${L.code}: the table has headers but no numbers behind them`);
        checked += 1;
    }
    assert(checked >= 4, `only ${checked} non-soccer standings payloads were available to check`);
});

check('standings.html has one chip per league and no orphan chips', () => {
    const html = readText('../standings.html');
    const codes = [...html.matchAll(/data-league="([^"]+)"/g)].map((m) => m[1]);
    const known = STANDINGS_LEAGUES.map((l) => l.code);
    const unknown = codes.filter((c) => !known.includes(c));
    assert(!unknown.length, `chips with no league behind them: ${unknown.join(', ')}`);
    const missing = known.filter((c) => !codes.includes(c));
    assert(!missing.length, `leagues with no chip: ${missing.join(', ')}`);
    assert(codes.filter((c) => c === 'EPL').length === 1 && html.includes('standings-tab active" data-league="EPL"'), 'the default EPL chip lost its active state');
});

check('sitemap.xml has no duplicate URLs', () => {
    const sitemap = readText('../sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const seen = new Set();
    const dups = [];
    for (const loc of locs) {
        if (seen.has(loc)) dups.push(loc);
        seen.add(loc);
    }
    assert(!dups.length, `duplicate URLs found in sitemap: ${dups.join(', ')}`);
});

check('every file in sw.js PRECACHE exists on disk', () => {
    const sw = readText('../sw.js');
    const match = sw.match(/const PRECACHE = \[([\s\S]*?)\];/);
    assert(match, 'could not find PRECACHE in sw.js');
    const items = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const item of items) {
        if (item === './') continue;
        const filePath = path.join(ROOT, item);
        assert(fs.existsSync(filePath), `file in sw.js PRECACHE does not exist: ${item}`);
    }
});

check('highlights i18n keys are present in en and sw', () => {
    const i18nCtx = vm.createContext({ window: {} });
    vm.runInContext(readText('../i18n.js') + '; globalThis.__STR = STR;', i18nCtx);
    const STR = i18nCtx.__STR;
    const requiredKeys = ['highlights.title', 'highlights.sub', 'highlights.watch', 'card.highlights', 'action.centre'];
    for (const k of requiredKeys) {
        assert(STR.en[k], `missing ${k} in STR.en`);
        assert(STR.sw[k], `missing ${k} in STR.sw`);
    }
});

check('MOCK_HIGHLIGHTS is defined and valid in app.js', () => {
    const appText = readText('../app.js');
    assert(appText.includes('const MOCK_HIGHLIGHTS = ['), 'MOCK_HIGHLIGHTS array missing');
    assert(appText.includes('Arsenal vs Chelsea'), 'MOCK_HIGHLIGHTS content missing');
});

check('matchHighlightUrl builds valid YouTube search links across files', () => {
    const files = ['../match.js', '../report.js', '../previews.js'];
    for (const f of files) {
        const ctx = vm.createContext({ window: {}, console, document: { addEventListener: () => {} } });
        vm.runInContext(readText(f) + '; globalThis.__matchHighlightUrl = matchHighlightUrl;', ctx);
        const url = ctx.__matchHighlightUrl('Arsenal', 'Chelsea', 'Premier League');
        assert(url.startsWith('https://www.youtube.com/results?search_query='), `unexpected url from ${f}: ${url}`);
        assert(url.includes('Arsenal') && url.includes('Chelsea'), `url does not encode teams from ${f}: ${url}`);
    }
});

check('highlightLinkHTML generates YouTube links exclusively for finished fixtures', () => {
    const mockEl = {
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
        style: {},
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
        querySelectorAll: () => []
    };
    const ctx = vm.createContext({
        window: {},
        document: {
            getElementById: () => mockEl,
            querySelector: () => mockEl,
            querySelectorAll: () => [],
            addEventListener: () => {},
            documentElement: mockEl,
            createElement: () => mockEl
        },
        console,
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        setInterval: () => {},
        setTimeout: () => {},
        LANG: 'en',
        t: (k) => k === 'card.highlights' ? 'Highlights' : k
    });
    vm.runInContext(readText('../app.js') + '; globalThis.__highlightLinkHTML = highlightLinkHTML;', ctx);
    const ftMatch = { status: 'finished', time: 'FT', homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'Premier League' };
    const liveMatch = { status: 'live', time: "65'", homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'Premier League' };
    const schedMatch = { status: 'scheduled', time: '20:00', homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'Premier League' };

    const ftLink = ctx.__highlightLinkHTML(ftMatch);
    assert(ftLink.includes('https://www.youtube.com/results?search_query=Arsenal%20vs%20Chelsea%20highlights%20Premier%20League'), 'FT match highlight link missing or incorrect');
    assert(ftLink.includes('target="_blank"'), 'FT match highlight link must open in new tab');
    assert(ctx.__highlightLinkHTML(liveMatch) === '', 'live match must not show highlight link');
    assert(ctx.__highlightLinkHTML(schedMatch) === '', 'scheduled match must not show highlight link');
});

check('every league the site names is one it actually fetches, and vice versa', () => {
    const mockEl = { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] };
    const ctx = vm.createContext({
        window: {},
        document: { getElementById: () => mockEl, querySelector: () => mockEl, querySelectorAll: () => [], addEventListener: () => {}, documentElement: mockEl, createElement: () => mockEl },
        console,
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        setInterval: () => {}, setTimeout: () => {},
        LANG: 'en', t: (k) => k
    });
    vm.runInContext(
        readText('../app.js') + '; globalThis.__LEAGUE_NAMES = LEAGUE_NAMES; globalThis.__ESPN_ENDPOINTS = ESPN_ENDPOINTS;',
        ctx);

    const named = Object.keys(ctx.__LEAGUE_NAMES);
    const swept = [...new Set(Object.values(ctx.__ESPN_ENDPOINTS).flat())];

    // A league with a name but no endpoint is advertised and then never fetched
    // (uefa.champions_qual and uefa.europa_qual sat stranded like that).
    const stranded = named.filter((k) => !swept.includes(k));
    assert(!stranded.length, `named but never fetched: ${stranded.join(', ')}`);

    // A league with an endpoint but no name renders its raw slug in the UI.
    const anonymous = swept.filter((k) => !named.includes(k));
    assert(!anonymous.length, `fetched but never named: ${anonymous.join(', ')}`);
});

check('every football league in app.js is mapped in PREVIEW_LEAGUES, REPORT_LEAGUES, and MATCH_LEAGUES', () => {
    const mockEl = { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] };
    const appCtx = vm.createContext({
        window: {},
        document: { getElementById: () => mockEl, querySelector: () => mockEl, querySelectorAll: () => [], addEventListener: () => {}, documentElement: mockEl, createElement: () => mockEl },
        console,
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        setInterval: () => {}, setTimeout: () => {},
        LANG: 'en', t: (k) => k
    });
    vm.runInContext(readText('../app.js') + '; globalThis.__LEAGUE_NAMES = LEAGUE_NAMES;', appCtx);
    const footballSlugs = Object.entries(appCtx.__LEAGUE_NAMES)
        .filter(([k, v]) => v.sport === 'football')
        .map(([k]) => k.replace(/^soccer\//, ''));

    const prevCtx = vm.createContext({ window: {}, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../preview.js') + '; globalThis.__PREVIEW_LEAGUES = PREVIEW_LEAGUES;', prevCtx);

    const repCtx = vm.createContext({ window: {}, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../report.js') + '; globalThis.__REPORT_LEAGUES = REPORT_LEAGUES;', repCtx);

    const matchCtx = vm.createContext({ window: {}, document: { addEventListener: () => {} } });
    vm.runInContext(readText('../match.js') + '; globalThis.__MATCH_LEAGUES = MATCH_LEAGUES;', matchCtx);

    assert(footballSlugs.length > 40, `expected at least 40 football leagues, got ${footballSlugs.length}`);
    for (const slug of footballSlugs) {
        assert(prevCtx.__PREVIEW_LEAGUES[slug], `PREVIEW_LEAGUES missing ${slug}`);
        assert(repCtx.__REPORT_LEAGUES[slug], `REPORT_LEAGUES missing ${slug}`);
        assert(matchCtx.__MATCH_LEAGUES[slug], `MATCH_LEAGUES missing ${slug}`);
    }
});

check('canPreviewMatch accepts scheduled football fixtures across leagues and rejects live/finished/non-football', () => {
    const mockEl = { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] };
    const ctx = vm.createContext({
        window: {},
        document: { getElementById: () => mockEl, querySelector: () => mockEl, querySelectorAll: () => [], addEventListener: () => {}, documentElement: mockEl, createElement: () => mockEl },
        console,
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        setInterval: () => {}, setTimeout: () => {},
        LANG: 'en', t: (k) => k
    });
    vm.runInContext(readText('../app.js') + '; globalThis.__exports = { canPreviewMatch, canReportMatch, previewLinkHTML, reportLinkHTML };', ctx);
    const { canPreviewMatch, canReportMatch, previewLinkHTML, reportLinkHTML } = ctx.__exports;

    const schedEPL = { espnEventId: '1001', leagueSlug: 'soccer/eng.1', date: '2026-09-18T19:00:00Z', sport: 'football', status: 'scheduled' };
    const schedUCL = { espnEventId: '1002', leagueSlug: 'soccer/uefa.champions', date: '2026-09-19T20:00:00Z', sport: 'football', status: 'scheduled' };
    const liveEPL = { espnEventId: '1003', leagueSlug: 'soccer/eng.1', date: '2026-09-15T15:00:00Z', sport: 'football', status: 'live', time: "55'" };
    const ftEPL = { espnEventId: '1004', leagueSlug: 'soccer/eng.1', date: '2026-09-15T12:00:00Z', sport: 'football', status: 'finished', time: 'FT' };
    const schedNBA = { espnEventId: '2001', leagueSlug: 'basketball/nba', date: '2026-09-18T19:00:00Z', sport: 'basketball', status: 'scheduled' };

    assert(canPreviewMatch(schedEPL), 'schedEPL should be previewable');
    assert(canPreviewMatch(schedUCL), 'schedUCL should be previewable');
    assert(!canPreviewMatch(liveEPL), 'live fixture should not be previewable');
    assert(!canPreviewMatch(ftEPL), 'finished fixture should not be previewable');
    assert(!canPreviewMatch(schedNBA), 'basketball fixture should not be previewable');

    assert(canReportMatch(ftEPL), 'ftEPL should be reportable');
    assert(!canReportMatch(liveEPL), 'live fixture should not be reportable');
    assert(!canReportMatch(schedEPL), 'scheduled fixture should not be reportable');
    assert(!canReportMatch(schedNBA), 'basketball fixture should not be reportable');

    const prevHtml = ctx.__exports.previewLinkHTML(schedEPL);
    assert(prevHtml.includes('preview.html?league=eng.1&id=1001&date=20260918'), `preview URL malformed: ${prevHtml}`);

    const repHtml = ctx.__exports.reportLinkHTML(ftEPL);
    assert(repHtml.includes('report.html?league=eng.1&id=1004&date=20260915'), `report URL malformed: ${repHtml}`);
});

/* ------------------------------------------------- odds + sim-stat regressions */

/* Loads one page script into its own sandbox and hands back the named helpers.
   app.js needs the fuller mock document the checks above already use. */
function oddsSandbox(file, exports) {
    const ctx = vm.createContext({
        window: {},
        document: {
            getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
            addEventListener: () => {}, documentElement: {}, createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} })
        },
        console,
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        setInterval: () => {}, setTimeout: () => {}, clearTimeout: () => {}, clearInterval: () => {},
        LANG: 'en', t: (k) => k, tf: (k) => k, navigator: {}, location: { search: '', hash: '' },
        fetch: async () => ({ ok: false, status: 500, json: async () => ({}) })
    });
    vm.runInContext(readText(file) + `; globalThis.__x = { ${exports.join(', ')} };`, ctx);
    return ctx.__x;
}

const appOdds = oddsSandbox('../app.js', ['parseESPNEvent', 'espnPriceToDecimal', 'americanToDecimal']);
const matchOdds = oddsSandbox('../match.js', ['oddsFromCompetition', 'espnPriceToDecimal']);
const prevOdds = oddsSandbox('../preview.js', ['previewOdds', 'espnPriceToDecimal']);

check('espnPriceToDecimal is one implementation across app.js, match.js and preview.js', () => {
    const inputs = [null, undefined, '', 0, 1, 1.5, 1.91, 2.5, 12, 25, 26, 45.31, 54.69, 100, -110, -115, 105, 250, '1.91', '-110', 'nonsense'];
    const expected = { '-110': 1.91, '-115': 1.87, 105: 2.05, 100: 2, 250: 3.5 };
    // 1 is not a price (no return), 25+ and the 45/54 pair are provider
    // probabilities rather than odds, so all of them must come back null.
    const dropped = [null, undefined, '', 0, 1, 'nonsense', 25, 26, 45.31, 54.69];
    for (const fn of [appOdds, matchOdds, prevOdds]) {
        for (const v of inputs) {
            const got = fn.espnPriceToDecimal(v);
            const label = `${JSON.stringify(v)} → ${got}`;
            if (dropped.includes(v)) {
                assert(got === null, `a value that is not a price should be dropped, got ${label}`);
                continue;
            }
            if (expected[v] != null) {
                assert(Math.abs(got - expected[v]) < 0.005, `expected ${expected[v]} for ${label}`);
            } else {
                assert(typeof got === 'number' && got > 1, `expected a decimal price, got ${label}`);
            }
        }
    }
});

/* Every shape ESPN has been seen to publish for the totals and BTTS markets. */
const ODDS_CASES = [
    {
        name: 'moneyline entry that merely carries the total line',
        odds: [{ provider: { name: 'Draft Kings' }, details: 'ARS -145', overUnder: 2.5, spread: -0.5,
                 homeTeamOdds: { moneyLine: -145 }, drawOdds: { moneyLine: 260 }, awayTeamOdds: { moneyLine: 380 } }],
        expect: { overUnder: 2.5, overOdds: null, underOdds: null, bttsYes: null, bttsNo: null, home: -145, away: 380 }
    },
    {
        name: 'entry-level Over/Under prices (the documented ESPN shape)',
        odds: [{ provider: { name: 'Draft Kings' }, details: 'ARS -145', overUnder: 2.5, overOdds: -115, underOdds: 105,
                 homeTeamOdds: { moneyLine: -145 }, drawOdds: { moneyLine: 260 }, awayTeamOdds: { moneyLine: 380 } }],
        expect: { overUnder: 2.5, overOdds: 1.87, underOdds: 2.05, home: -145 }
    },
    {
        name: 'separate entry whose details name the totals market',
        odds: [
            { provider: { name: 'Draft Kings' }, details: 'ARS -145', overUnder: 2.5, homeTeamOdds: { moneyLine: -145 }, drawOdds: { moneyLine: 260 }, awayTeamOdds: { moneyLine: 380 } },
            { provider: { name: 'Draft Kings' }, details: 'O/U 2.5', homeTeamOdds: { moneyLine: -110 }, awayTeamOdds: { moneyLine: -110 } }
        ],
        expect: { overOdds: 1.91, underOdds: 1.91 }
    },
    {
        name: 'BTTS entry',
        odds: [{ provider: { name: 'Draft Kings' }, details: 'Both teams to score', homeTeamOdds: { moneyLine: -125 }, awayTeamOdds: { moneyLine: 105 } }],
        expect: { bttsYes: 1.8, bttsNo: 2.05 }
    }
];

check('parseESPNEvent reads the totals/BTTS markets the way ESPN publishes them', () => {
    for (const c of ODDS_CASES) {
        const ev = JSON.parse(JSON.stringify(scoreboard.events[0]));
        ev.competitions[0].odds = c.odds;
        const m = appOdds.parseESPNEvent(ev, { name: 'Premier League', code: 'EPL', sport: 'football' }, 'soccer/eng.1');
        for (const [k, v] of Object.entries(c.expect)) {
            const got = m.odds[k];
            if (v === null) assert(got === null, `${c.name}: ${k} should stay empty, got ${JSON.stringify(got)}`);
            else if (typeof v === 'number' && !Number.isInteger(v)) assert(Math.abs(got - v) < 0.005, `${c.name}: ${k} expected ${v}, got ${got}`);
            else assert(got === v, `${c.name}: ${k} expected ${v}, got ${JSON.stringify(got)}`);
        }
    }
});

check('a moneyline entry never has its 1X2 prices relabelled as Over/Under payouts', () => {
    const ev = JSON.parse(JSON.stringify(scoreboard.events[0]));
    ev.competitions[0].odds = [ODDS_CASES[0].odds[0]];
    const m = appOdds.parseESPNEvent(ev, { name: 'Premier League', code: 'EPL', sport: 'football' }, 'soccer/eng.1');
    assert(m.odds.overOdds === null && m.odds.underOdds === null,
        `Over/Under payouts were invented from the moneyline: ${m.odds.overOdds} / ${m.odds.underOdds}`);
});

check('app.js and match.js agree on every odds market for the same competition', () => {
    for (const c of ODDS_CASES) {
        const comp = { odds: c.odds };
        const a = appOdds.parseESPNEvent({ id: '1', date: '2026-05-24T15:00Z', status: { type: { state: 'post', completed: true } }, competitions: [{ ...comp, competitors: scoreboard.events[0].competitions[0].competitors }] },
            { name: 'Premier League', code: 'EPL', sport: 'football' }, 'soccer/eng.1').odds;
        const b = matchOdds.oddsFromCompetition(comp);
        for (const k of ['home', 'draw', 'away', 'overUnder', 'overOdds', 'underOdds', 'bttsYes', 'bttsNo']) {
            const same = (a[k] == null && b[k] == null) || (typeof a[k] === 'number' && Math.abs(a[k] - b[k]) < 1e-9) || a[k] === b[k];
            assert(same, `${c.name}: ${k} differs — app.js ${JSON.stringify(a[k])} vs match.js ${JSON.stringify(b[k])}`);
        }
    }
});

check('preview.js renders totals prices as decimals, not raw American moneylines', () => {
    const out = prevOdds.previewOdds({ odds: ODDS_CASES[1].odds });
    assert(Math.abs(out.overOdds - 1.87) < 0.005 && Math.abs(out.underOdds - 2.05) < 0.005,
        `preview.js totals prices are ${out.overOdds} / ${out.underOdds}`);
    const html = readText('../preview.js');
    assert(!/↑\$\{.*overOdds/.test(html) || html.includes('Number(odds.overOdds).toFixed(2)'),
        'preview.js oddsCapsulesHTML must format odds.overOdds as a number');
});

check('a simulated match report keeps every stat the mock match carries', () => {
    const ctx = oddsSandbox('../report.js', ['simMatchToReportEvent', 'parseSideStats']);
    const sim = {
        id: 'fb-1', league: 'UEFA Champions League', leagueSlug: 'uefa.champions', homeTeam: 'Arsenal', homeCode: 'ARS',
        awayTeam: 'Chelsea', awayCode: 'CHE', homeScore: 2, awayScore: 1, time: 'FT', venue: 'Emirates Stadium',
        stats: { possession: 55, shots: 8, shotsOnTarget: 4, corners: 4, fouls: 7, yellowCards: 2, redCards: 0 }
    };
    const ev = ctx.simMatchToReportEvent(sim);
    const cs = ev.competitions[0].competitors;
    const home = cs.find((c) => c.homeAway === 'home');
    const parsed = ctx.parseSideStats(home);
    assert(parsed.poss === 55, `possession lost from the simulated report (got ${parsed.poss})`);
    assert(parsed.shots === 8, `shots lost from the simulated report (got ${parsed.shots})`);
    assert(parsed.corners === 4, `corners lost from the simulated report (got ${parsed.corners})`);
    assert(parsed.fouls === 7, `fouls lost from the simulated report (got ${parsed.fouls})`);
});

/* ------------------------------------------- reload / persistence regressions */

/* app.js sandbox with a working in-memory localStorage and a document that can
   pretend to own (or not own) the controls a saved view refers to. */
function persistSandbox({ stored = {}, controls = [], pathname = '/' } = {}) {
    const mem = new Map(Object.entries(stored));
    const ctx = vm.createContext({
        window: { SportPages, location: { pathname, search: '', hash: '' } },
        document: {
            getElementById: () => null,
            querySelector: (sel) => (controls.some((c) => String(sel).includes(c)) ? { setAttribute() {}, classList: { toggle() {}, add() {}, remove() {} } } : null),
            querySelectorAll: () => [],
            addEventListener: () => {}, documentElement: {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} })
        },
        console,
        localStorage: {
            getItem: (k) => (mem.has(k) ? mem.get(k) : null),
            setItem: (k, v) => { mem.set(k, String(v)); },
            removeItem: (k) => { mem.delete(k); }
        },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        setInterval: () => {}, setTimeout: () => {}, clearTimeout: () => {}, clearInterval: () => {},
        LANG: 'en', t: (k) => k, tf: (k) => k, navigator: {}, location: { pathname, search: '', hash: '' },
        fetch: async () => ({ ok: false, status: 500, json: async () => ({}) })
    });
    vm.runInContext(readText('../app.js') + `
        globalThis.__x = { restoreLiveCache, restoreViewState, saveSessionSnapshot, viewState, syncViewControls };
        globalThis.__state = {
            set(s) { Object.assign(this, s); },
            apply() { currentSport = this.sport; currentFilter = this.filter; currentLeague = this.league; selectedDate = this.date; leadersCategory = this.leaders; currentStandingLeague = this.standings; this.sortByLeague && (sortByLeague = true); },
            get() { return { sport: currentSport, filter: currentFilter, league: currentLeague, date: selectedDate, leaders: leadersCategory, standings: currentStandingLeague, sortByLeague }; },
            setLive(list) { apiMatches = list; isApiMode = true; },
            noLive() { apiMatches = []; isApiMode = false; }
        };`, ctx);
    return { x: ctx.__x, state: ctx.__state, mem };
}

const LIVE_KEY = 'scorehub-live-v1', VIEW_KEY = 'scorehub-view-v1';
const liveMatch = (over) => Object.assign({
    id: 'api-1', espnEventId: '1', leagueSlug: 'soccer/eng.1', sport: 'football', league: 'Premier League',
    homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 1, awayScore: 0, status: 'live', time: "65'",
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString()
}, over);

check('a reload replays the last sweep (the "live data disappears" fix)', () => {
    const sb = persistSandbox({ stored: { [LIVE_KEY]: JSON.stringify({ at: Date.now(), sport: 'all', date: null, matches: [liveMatch(), liveMatch({ id: 'api-2', status: 'finished', time: 'FT' })] }) } });
    sb.state.set({ sport: 'all', filter: 'all', league: 'all', date: null, leaders: 'goals', standings: 'EPL' });
    sb.state.apply();
    const restored = sb.x.restoreLiveCache();
    assert(restored && restored.matches.length === 2, 'a fresh snapshot should replay both matches');
    assert(restored.matches[0].homeTeam === 'Arsenal', 'the saved match data should survive the round-trip');
});

check('a match cached as live hours ago is closed out, not left on 65\'', () => {
    const stale = liveMatch({ date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() });
    const sb = persistSandbox({ stored: { [LIVE_KEY]: JSON.stringify({ at: Date.now(), sport: 'all', date: null, matches: [stale] }) } });
    sb.state.set({ sport: 'all', date: null }); sb.state.apply();
    const restored = sb.x.restoreLiveCache();
    assert(restored.matches[0].status === 'finished' && restored.matches[0].time === 'FT',
        `a 4-hour-old live match should be finished, got ${restored.matches[0].status}/${restored.matches[0].time}`);
});

check('nothing dishonest is replayed: expired, wrong view, wrong day or corrupt snapshots', () => {
    const cases = [
        ['expired (older than the TTL)', { at: Date.now() - 4 * 60 * 60 * 1000, sport: 'all', date: null, matches: [liveMatch()] }],
        ['saved for another tab', { at: Date.now(), sport: 'basketball', date: null, matches: [liveMatch()] }],
        ['saved for another day', { at: Date.now(), sport: 'all', date: '20200101', matches: [liveMatch()] }],
        ['empty match list', { at: Date.now(), sport: 'all', date: null, matches: [] }],
        ['matches without an id or teams', { at: Date.now(), sport: 'all', date: null, matches: [{ nope: 1 }, null] }],
        ['unparsable JSON', '{not json'],
        ['missing timestamp', { sport: 'all', date: null, matches: [liveMatch()] }]
    ];
    for (const [label, payload] of cases) {
        const sb = persistSandbox({ stored: { [LIVE_KEY]: typeof payload === 'string' ? payload : JSON.stringify(payload) } });
        sb.state.set({ sport: 'all', date: null }); sb.state.apply();
        assert(sb.x.restoreLiveCache() === null, `should refuse to replay a snapshot: ${label}`);
    }
});

check('the live snapshot is only written while live data is on screen', () => {
    const withLive = persistSandbox();
    withLive.state.set({ sport: 'all', filter: 'all', league: 'all', date: null, leaders: 'goals', standings: 'EPL' });
    withLive.state.apply();
    withLive.state.setLive([liveMatch()]);
    withLive.x.saveSessionSnapshot();
    assert(withLive.mem.get(LIVE_KEY), 'live mode should save the sweep');
    assert(withLive.mem.get(VIEW_KEY), 'the view should always be saved');

    const simOnly = persistSandbox();
    simOnly.state.set({ sport: 'all', date: null }); simOnly.state.apply();
    simOnly.state.noLive();
    simOnly.x.saveSessionSnapshot();
    assert(!simOnly.mem.get(LIVE_KEY), 'simulation mode must not overwrite the live snapshot with mock matches');
    assert(simOnly.mem.get(VIEW_KEY), 'the view should still be saved in simulation mode');
});

check('the saved view round-trips, and unknown values are ignored rather than restored', () => {
    // The sport comes from the address (/football/ is the Football tab), the rest
    // from storage — so the round trip is exercised on the football page.
    const controls = ['data-sport="football"', 'data-filter="live"', 'data-league-id="EPL"', 'data-standing-league="LaLiga"'];
    const sb = persistSandbox({ controls, pathname: '/football/' });
    sb.state.set({ sport: 'football', filter: 'live', league: 'EPL', date: '20260101', leaders: 'assists', standings: 'LaLiga', sortByLeague: true });
    sb.state.apply();
    sb.x.saveSessionSnapshot();

    sb.state.set({ sport: 'all', filter: 'all', league: 'all', date: null, leaders: 'goals', standings: 'EPL', sortByLeague: false });
    sb.state.apply();
    sb.x.restoreViewState();
    const back = sb.state.get();
    assert(back.sport === 'football' && back.filter === 'live' && back.league === 'EPL', `view did not round-trip: ${JSON.stringify(back)}`);
    assert(back.date === '20260101' && back.leaders === 'assists' && back.standings === 'LaLiga', `view did not round-trip: ${JSON.stringify(back)}`);

    // A snapshot referring to controls this page does not have must not be applied,
    // or the UI would sit in a state with nothing selected.
    const bare = persistSandbox({ stored: { [VIEW_KEY]: JSON.stringify({ at: Date.now(), sport: 'f1', filter: 'ht', league: 'ZZZ', date: '20260101', leaders: 'assists', standings: 'ZZZ' }) } });
    bare.state.set({ sport: 'all', filter: 'all', league: 'all', date: null, leaders: 'goals', standings: 'EPL' });
    bare.state.apply();
    bare.x.restoreViewState();
    const kept = bare.state.get();
    assert(kept.sport === 'all' && kept.filter === 'all' && kept.league === 'all', `unknown controls were applied: ${JSON.stringify(kept)}`);
    assert(kept.date === '20260101' && kept.leaders === 'assists', `control-independent values should still restore: ${JSON.stringify(kept)}`);
});

check('the address decides the sport: sport pages open their tab, a saved league never leaks across sports', () => {
    const controls = ['data-sport="all"', 'data-sport="football"', 'data-sport="basketball"', 'data-sport="icehockey"', 'data-sport="f1"',
        'data-filter="live"', 'data-league-id="EPL"'];
    const saved = { at: Date.now(), sport: 'football', filter: 'live', league: 'EPL', date: '20260101', leaders: 'goals', standings: 'EPL' };
    const boot = (pathname, view) => {
        const sb = persistSandbox({ controls, pathname, stored: { [VIEW_KEY]: JSON.stringify(view) } });
        sb.state.set({ sport: 'all', filter: 'all', league: 'all', date: null, leaders: 'goals', standings: 'EPL' });
        sb.state.apply();
        sb.x.restoreViewState();
        return sb.state.get();
    };
    const cases = [
        ['/basketball/', 'basketball'], ['/ice-hockey/', 'icehockey'], ['/formula-1/', 'f1'],
        ['/football', 'football'], ['/football/index.html', 'football'],
        ['/', 'all'], ['/index.html', 'all'], ['/news.html', 'all'], ['/nope/', 'all']
    ];
    for (const [pathname, want] of cases) {
        const got = boot(pathname, saved);
        assert(got.sport === want, `${pathname} should open the "${want}" tab, got "${got.sport}"`);
        if (want !== 'football') assert(got.league === 'all', `${pathname}: a league saved on the football view must not filter the ${want} view`);
        else assert(got.league === 'EPL', `${pathname}: the league saved for this same sport should come back`);
        assert(got.filter === 'live' && got.date === '20260101', `${pathname}: sport-independent view settings should still restore`);
    }
});

check('a hand-edited or hostile snapshot cannot break boot', () => {
    // localStorage is user-editable: a value that is not a valid CSS selector used
    // to make querySelector throw out of init(), leaving a blank page.
    for (const payload of [
        { at: Date.now(), sport: 'a"]', filter: 'b"]', league: 'c"]', standings: 'd"]' },
        { at: Date.now(), sport: { nested: true }, filter: ['x'], league: 42, leaders: 'nope', date: 'yesterday' },
        { at: Date.now(), sport: 'all', spotlight: 'x'.repeat(5000) },
        'not an object', 42, null
    ]) {
        const sb = persistSandbox({ stored: { [VIEW_KEY]: typeof payload === 'string' ? payload : JSON.stringify(payload) } });
        sb.state.set({ sport: 'all', filter: 'all', league: 'all', date: null, leaders: 'goals', standings: 'EPL' });
        sb.state.apply();
        sb.x.restoreViewState();
        sb.x.syncViewControls();
        const kept = sb.state.get();
        assert(kept.sport === 'all' && kept.filter === 'all' && kept.league === 'all' && kept.date === null,
            `hostile snapshot changed the view: ${JSON.stringify(kept)}`);
    }
});

check('the snapshot keys are the ones the page documents', () => {
    const app = readText('../app.js');
    assert(app.includes('"scorehub-live-v1"') && app.includes('"scorehub-view-v1"'),
        'snapshot storage keys changed — update the docs/tests with them');
});

check('no page loads the legacy amp-auto-ads scripts', () => {
    for (const f of ROOT_PAGES) {
        const c = readText('../' + f);
        assert(!c.includes('amp-auto-ads') && !c.includes('cdn.ampproject.org'),
            `${f} still loads the AMP runtime (dead ~100KB of third-party JS on a non-AMP page)`);
    }
});

check('every local <script src> is deferred (no parser-blocking JS at the end of body)', () => {
    for (const f of ROOT_PAGES) {
        const c = readText('../' + f);
        for (const m of c.matchAll(/<script src="([a-z0-9.\-]+\.js)"><\/script>/g)) {
            assert(false, `${f}: <script src="${m[1]}"> is missing defer`);
        }
    }
});

check('every <img> declares width and height (layout stability, CLS and the agentic audits)', () => {
    const jsFiles = fs.readdirSync(HERE).filter((x) => x.endsWith('.js') && x !== 'sw.js');
    for (const f of jsFiles) {
        const c = readText('../' + f);
        for (const m of c.matchAll(/<img\b[^>]*>/g)) {
            assert(/\swidth="/.test(m[0]) && /\sheight="/.test(m[0]),
                `${f}: <img> without width/height: ${m[0].replace(/\s+/g, ' ').slice(0, 90)}`);
        }
    }
    for (const f of ROOT_PAGES) {
        const c = readText('../' + f);
        for (const m of c.matchAll(/<img\b[^>]*>/g)) {
            if (m[0].includes('data:image')) continue; // inline SVG carries its own intrinsic size
            assert(/\swidth="/.test(m[0]) && /\sheight="/.test(m[0]),
                `${f}: <img> without width/height: ${m[0].replace(/\s+/g, ' ').slice(0, 90)}`);
        }
    }
});

check('every page has a skip-to-content link whose target exists', () => {
    for (const f of ROOT_PAGES) {
        if (f === 'offline.html') continue; // noindex utility page, not part of navigation
        const c = readText('../' + f);
        const m = c.match(/<a class="skip-link" href="#([^"]+)"/);
        assert(m, `${f}: no skip link`);
        assert(c.includes(`id="${m[1]}"`), `${f}: skip link points at missing #${m[1]}`);
    }
});

check('every <a href> and <button> has a programmatic name (agent accessibility tree)', () => {
    function scan(text, label) {
        const tagRe = /<(a|button)\b([^>]*)>/g;
        let m;
        while ((m = tagRe.exec(text)) !== null) {
            const tag = m[1], attrs = m[2];
            if (tag === 'a' && !/\shref\s*=/.test(attrs)) continue; // anchors without href are not controls
            if (/aria-label\s*=/.test(attrs) || /aria-labelledby\s*=/.test(attrs) || /\stitle\s*=/.test(attrs)) continue;
            let depth = 1, inner = '';
            const closeRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
            closeRe.lastIndex = tagRe.lastIndex;
            let cm;
            while (depth > 0 && (cm = closeRe.exec(text)) !== null) {
                depth += cm[1] === '/' ? -1 : 1;
                if (depth === 0) { inner = text.slice(tagRe.lastIndex, cm.index); break; }
            }
            const name = inner.replace(/<[^>]*>/g, ' ')
                .replace(/\$\{[^}]*\}/g, 'x')
                .replace(/&[a-z]+;/gi, 'x')
                .replace(/[\s\-\u2013\u2014\u00b7.,;:!?"'(\[\]{}|/&\\*+#%@$^_=~<>'`]/g, '');
            assert(name.length > 0,
                `${label}: <${tag}${attrs.replace(/\s+/g, ' ').slice(0, 70)}> has no programmatic name`);
        }
    }
    for (const f of ROOT_PAGES) scan(readText('../' + f).replace(/<script[\s\S]*?<\/script>/g, ''), f);
    for (const j of ['app.js', 'match.js', 'preview.js', 'previews.js', 'predictions.js',
                     'report.js', 'standings.js', 'story.js', 'transfers.js', 'news.js',
                     'highlights.js', 'share.js', 'shop.js', 'pwa.js', 'seo.js', 'i18n.js']) {
        scan(readText('../' + j), j);
    }
});

/* ------------------------------------------------------------ sport pages */

const coveredByApp = () => {
    // Sports with a non-empty ESPN_ENDPOINTS list in app.js, plus the F1 tab (Jolpica).
    const app = readText('../app.js');
    const block = app.slice(app.indexOf('const ESPN_ENDPOINTS = {'));
    const keys = new Set(['f1']);
    for (const m of block.slice(0, block.indexOf('\n};')).matchAll(/^    ([a-z0-9]+): \[\s*(?:\/\/[^\n]*\n\s*)*"/gm)) keys.add(m[1]);
    return keys;
};

check('every sport tab has exactly one sport page entry (and vice versa)', () => {
    const html = readText('../index.html');
    const tabs = [...html.matchAll(/class="sport-tab(?: active)?" data-sport="([a-z0-9]+)"/g)].map((m) => m[1]);
    const pages = SportPages.pages.map((p) => p.sport);
    assert(tabs.length > 5, 'could not find the sport tabs in index.html');
    assert(JSON.stringify([...tabs].sort()) === JSON.stringify([...pages].sort()),
        `sport tabs [${tabs}] and sport-pages.js [${pages}] disagree`);
    const slugs = SportPages.pages.map((p) => p.slug);
    assert(new Set(slugs).size === slugs.length, 'duplicate sport page slugs');
    for (const p of SportPages.pages) {
        assert(p.slug === '' ? p.sport === 'all' : /^[a-z0-9-]+$/.test(p.slug), `bad slug for ${p.sport}: "${p.slug}"`);
        assert(p.title && p.description && p.heading && p.blurb && p.keywords, `${p.sport}: title/description/keywords/heading/blurb are all required`);
        assert(p.description.length <= 200, `${p.sport}: description is ${p.description.length} chars — keep search snippets readable`);
    }
});

check('sport-pages.js path helpers round-trip every sport', () => {
    for (const p of SportPages.pages) {
        assert(SportPages.sportForPath(SportPages.pathFor(p.sport)) === p.sport, `${p.sport} does not round-trip through ${SportPages.pathFor(p.sport)}`);
    }
    assert(SportPages.sportForPath('/index.html') === 'all' && SportPages.sportForPath('/standings.html') === 'all', 'non-sport pages must resolve to the home tab');
    assert(SportPages.sportForPath('/table/eng.1/') === 'all' && SportPages.sportForPath('/report/123/') === 'all', 'nested pages must not be mistaken for sport pages');
});

check('a slug never shadows a folder that already holds something else', () => {
    for (const p of SportPages.pages.filter((x) => x.slug)) {
        assert(!['table', 'report', 'preview', 'testdata', 'tools', '.github'].includes(p.slug), `slug "${p.slug}" collides with an existing folder`);
        assert(!fs.existsSync(path.join(ROOT, p.slug + '.html')), `${p.slug}.html exists next to /${p.slug}/`);
    }
});

check('every sport page is generated, current, and identical to index.html apart from its head + hidden heading + active tab', () => {
    const index = readText('../index.html');
    for (const p of SportPages.pages.filter((x) => x.slug)) {
        const file = path.join(ROOT, p.slug, 'index.html');
        assert(fs.existsSync(file), `/${p.slug}/index.html is missing — run: node tools/build-sport-pages.mjs`);
        const html = fs.readFileSync(file, 'utf8');
        assert(html.includes(`<link rel="canonical" href="${SportPages.urlFor(p.sport)}">`), `${p.slug}: canonical is wrong`);
        assert(html.includes(`<button class="sport-tab active" data-sport="${p.sport}">`), `${p.slug}: its tab is not pre-selected`);
        assert((html.match(/class="sport-tab active"/g) || []).length === 1, `${p.slug}: exactly one sport tab must be active`);
        assert(html.includes('<base href="/">'), `${p.slug}: <base href="/"> is required so relative links work one folder down`);
        assert(p.covered ? !html.includes('noindex') : html.includes('content="noindex, follow"'), `${p.slug}: robots meta does not match the covered flag`);
        // Body equality: everything from the app container down, minus the three intended edits.
        const body = (h) => h.slice(h.indexOf('<body>'))
            .replace(/<h2 id="sport-page-heading">[^<]*<\/h2>/, '').replace(/<p id="sport-page-blurb">[^<]*<\/p>/, '')
            .replace(/class="sport-tab active"/, 'class="sport-tab"');
        assert(body(html) === body(index), `${p.slug}: body differs from index.html beyond the hidden heading and the active tab`);
    }
});

check('no sport page is stale relative to index.html (node tools/build-sport-pages.mjs --check)', () => {
    const { stale } = buildSportPages({ check: true });
    assert(!stale.length, `stale: ${stale.join(', ')} — run: node tools/build-sport-pages.mjs`);
});

check('the covered flag matches what app.js can actually fetch', () => {
    const live = coveredByApp();
    for (const p of SportPages.pages.filter((x) => x.slug)) {
        assert(p.covered === live.has(p.sport),
            `${p.sport}: sport-pages.js says covered=${p.covered} but ESPN_ENDPOINTS ${live.has(p.sport) ? 'has' : 'has no'} data for it — update the flag (and rebuild)`);
    }
});

check('sitemap.xml lists exactly the covered sport pages (uncovered ones stay out)', () => {
    const sitemap = readText('../sitemap.xml');
    for (const p of SportPages.pages.filter((x) => x.slug)) {
        const listed = sitemap.includes(`<loc>${SportPages.urlFor(p.sport)}</loc>`);
        assert(listed === p.covered, `${p.slug}: ${p.covered ? 'covered but missing from' : 'uncovered but listed in'} sitemap.xml`);
    }
});

check('service worker precaches sport-pages.js and every page that loads it', () => {
    assert(readText('../sw.js').includes("'sport-pages.js'"), 'sw.js PRECACHE is missing sport-pages.js');
    const html = readText('../index.html');
    assert(/<script src="sport-pages\.js" defer><\/script>/.test(html), 'index.html must load sport-pages.js (deferred) before app.js');
    assert(html.indexOf('sport-pages.js') < html.indexOf('src="app.js"'), 'sport-pages.js must load before app.js');
});

/* ------------------------------------------------------------------ report */

function report() {
    console.log(results.join('\n'));
    console.log(failures ? `\n${failures} check(s) failed` : `\nall ${results.length} checks passed`);
    process.exit(failures ? 1 : 0);
}
report();

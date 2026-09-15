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

const context = vm.createContext({ window: {}, console });
// `const` declarations stay in the script's own scope, so the file is run with
// a trailing export of the helpers this file checks.
vm.runInContext(
    readText('../standings.js') + '\n;globalThis.__exports = { STANDINGS_LEAGUES, parseStandings, parseStandingsGroups, payloadSeasonLabel, seasonLabelFromSlug, currentSeasonLabel };\n',
    context,
    { filename: 'standings.js' }
);
const { parseStandings, parseStandingsGroups, payloadSeasonLabel, seasonLabelFromSlug, currentSeasonLabel, STANDINGS_LEAGUES } = context.__exports;

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
    const slugs = [...sitemap.matchAll(/standings\.html\?league=([^"'&<\s]+)/g)].map((m) => m[1]);
    assert(slugs.length, 'no ?league= links found in sitemap.xml');
    const known = new Set(STANDINGS_LEAGUES.map((l) => l.slug));
    const unknown = slugs.filter((s) => !known.has(s));
    assert(!unknown.length, `sitemap.xml advertises leagues with no table: ${unknown.join(', ')}`);
    const missing = STANDINGS_LEAGUES.filter((l) => !slugs.includes(l.slug)).map((l) => l.slug);
    assert(!missing.length, `these leagues have no sitemap entry: ${missing.join(', ')}`);
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

/* ------------------------------------------------------------------ report */

function report() {
    console.log(results.join('\n'));
    console.log(failures ? `\n${failures} check(s) failed` : `\nall ${results.length} checks passed`);
    process.exit(failures ? 1 : 0);
}
report();

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

/* ------------------------------------------------------------------ report */

function report() {
    console.log(results.join('\n'));
    console.log(failures ? `\n${failures} check(s) failed` : `\nall ${results.length} checks passed`);
    process.exit(failures ? 1 : 0);
}
report();

#!/usr/bin/env node
/* Snapshot real ESPN payloads into testdata/live/ so that
   `node tools/prerender.mjs --offline` can build every page a live run builds,
   for every sport — without touching the network.

   Why this exists: the hand-written samples in testdata/ (one MLS scoreboard,
   one MLS standings payload) cover soccer only. The prerenderer now also
   publishes baseball, American football, basketball and hockey tables and match
   snapshots, and their payload shapes differ from soccer's (innings, quarters,
   periods, W-L-PCT-GB columns). A parser can only be developed against the real
   shape, so this tool records it.

   What it writes (byte-bounded, no personal data):
     testdata/live/<date>/scoreboard.<sport>.<league>.<yyyymmdd>.json
     testdata/live/<date>/summary.<sport>.<league>.<eventId>.json
     testdata/live/<date>/standings.<sport>.<league>.json
     testdata/live/<date>/manifest.json     what was fetched, what came back

   Modes:
     node tools/collect-samples.mjs            full collection (needs network)
     node tools/collect-samples.mjs --probe    liveness check of every candidate
                                               slug only (no fixtures written)
     node tools/collect-samples.mjs --out DIR  write somewhere else

   The GitHub workflow runs it by hand (workflow_dispatch) when the fixtures
   need refreshing — not on the daily schedule, because a fixture must stay
   stable for an --offline build to be reproducible. */

import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SPORTS } from './sports.mjs';

const argv = process.argv.slice(2);
const PROBE_ONLY = argv.includes('--probe');
const outIdx = argv.indexOf('--out');
const TOOLSDIR = path.dirname(fileURLToPath(import.meta.url));
const NOW = new Date();
const STAMP = NOW.toISOString().slice(0, 10);
const LIVE_DIR = outIdx >= 0 ? path.resolve(argv[outIdx + 1]) : path.join(TOOLSDIR, '..', 'testdata', 'live');

const DELAY_MS = 120;
const TIMEOUT_MS = 20000;
const DAYS_BACK = 7;      // finished matches for /report/ snapshots
const DAYS_FORWARD = 8;   // upcoming matches for /preview/ snapshots
const MAX_SUMMARIES_PER_LEAGUE = 6;
const CAP_BYTES = 24 * 1024 * 1024;   // hard stop so a run cannot balloon the repo

/* ---------------------------------------------------------------- what to get
   The multi-sport half comes straight from tools/sports.mjs: every league the
   prerenderer publishes, and only those, so a fixture can never drift from a
   page the tool would generate. `table` decides whether a standings payload is
   fetched, `matches` whether the scoreboard window is swept and summaries are
   kept.

   Soccer is different: its tables are read by standings.js's own parser, which
   the hand-written testdata/espn-standings.sample.json already exercises, so
   soccer fixtures are not recorded here. The candidate list below is a
   liveness survey only (--probe), used when deciding whether a league can get a
   /table/<slug>/ page. */

const LEAGUES = SPORTS.map((s) => ({
    sport: s.sport,
    league: s.league,
    table: !!s.table,
    matches: !!s.matches,
}));

/* Soccer leagues that probed live but had no table, plus a few worth re-checking
   when ESPN adds coverage. `--probe` only — no fixtures are written for them. */
const SOCCER_CANDIDATES = [
    'soccer/eng.3', 'soccer/eng.4', 'soccer/eng.5', 'soccer/eng.w.2', 'soccer/sco.2',
    'soccer/sui.1', 'soccer/cze.1', 'soccer/irl.1', 'soccer/rou.1', 'soccer/fin.1',
    'soccer/isl.1', 'soccer/cyp.1', 'soccer/ukr.1', 'soccer/por.2', 'soccer/tur.2',
    'soccer/den.2', 'soccer/swe.2', 'soccer/nor.2', 'soccer/usa.usl.l1',
    'soccer/concacaf.leagues.cup', 'soccer/caf.confed', 'soccer/afc.cup',
];

/* Slugs worth a liveness check even when we do not keep payloads. */
const PROBE_EXTRA = [
    ...SOCCER_CANDIDATES,
    'basketball/nba-development', 'basketball/euroleague', 'basketball/nba-summer-league',
    'baseball/college-softball', 'baseball/world-baseball-classic', 'baseball/caribbean-series',
    'baseball/llb', 'baseball/college-baseball',
    'hockey/olympics-mens-ice-hockey', 'hockey/ahl', 'hockey/echl', 'hockey/khl', 'hockey/shl',
    'football/xfl', 'football/ufl', 'football/cfl', 'football/canadian-football',
    'basketball/mens-college-basketball', 'basketball/womens-college-basketball',
];

/* ------------------------------------------------------------------- utils */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function yymmdd(d) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }
function log(msg) { console.log(`[collect] ${msg}`); }
const pick = (o, keys) => { const r = {}; if (!o) return r; for (const k of keys) if (o[k] !== undefined) r[k] = o[k]; return r; };
const arr = (a) => (Array.isArray(a) ? a : []);
const str = (v) => (typeof v === 'string' ? v : (v == null ? '' : String(v)));

async function fetchJSON(url) {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'accept': 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}

/* --------------------------------------------------------------- trimming */
function trimTeam(t) {
    if (!t || typeof t !== 'object') return { displayName: '?' };
    const logo = arr(t.logos)[0] && arr(t.logos)[0].href;
    return pick({
        id: t.id, abbreviation: t.abbreviation, displayName: t.displayName,
        shortDisplayName: t.shortDisplayName, name: t.name, location: t.location,
        nickname: t.nickname, color: t.color, alternateColor: t.alternateColor,
        logo: logo || t.logo, logos: logo ? [{ href: logo }] : undefined,
    }, ['id', 'abbreviation', 'displayName', 'shortDisplayName', 'name', 'location', 'nickname', 'color', 'alternateColor', 'logo', 'logos']);
}

function trimStat(s) {
    const out = pick(s, ['name', 'displayName', 'shortDisplayName', 'value', 'displayValue', 'description', 'abbreviation', 'label', 'category']);
    // baseball and basketball boxscores nest their numbers one level down:
    // {name:'batting', displayName:'Batting', stats:[{name:'runs', displayValue:'4'}]}
    if (Array.isArray(s.stats)) out.stats = s.stats.map(trimStat);
    if (Array.isArray(s.leaders)) out.leaderCount = s.leaders.length;
    return out;
}

function trimCompetitor(c) {
    const out = pick(c, ['id', 'uid', 'type', 'order', 'homeAway', 'winner', 'score', 'form', 'possession', 'curatedRank', 'advance']);
    if (Array.isArray(c.linescores)) out.linescores = c.linescores.map((l) => pick(l, ['value', 'displayValue']));
    if (Array.isArray(c.records)) out.records = c.records.map((r) => pick(r, ['type', 'summary', 'name', 'abbreviation']));
    if (Array.isArray(c.statistics)) out.statistics = c.statistics.map(trimStat);
    out.team = trimTeam(c.team);
    return out;
}

function trimDetail(d) {
    const out = pick(d, ['id', 'scoringPlay', 'scoreValue', 'ownGoal', 'penaltyKick', 'redCard', 'yellowCard',
        'awayScore', 'homeScore', 'text', 'isPenalty', 'shortText']);
    if (d.type) out.type = pick(d.type, ['id', 'text', 'abbreviation']);
    if (d.clock) out.clock = pick(d.clock, ['value', 'displayValue']);
    if (d.period) out.period = pick(d.period, ['number', 'displayValue']);
    if (d.team) out.team = pick(d.team, ['id', 'abbreviation', 'displayName']);
    if (Array.isArray(d.athletesInvolved)) out.athletesInvolved = d.athletesInvolved.map((a) => pick(a, ['id', 'displayName', 'shortName', 'jersey']));
    return out;
}

function trimCompetition(comp) {
    const out = pick(comp, ['id', 'uid', 'date', 'attendance', 'neutralSite', 'startDate', 'timeValid', 'playByPlayAvailable']);
    if (comp.status) out.status = pick(comp.status, ['period', 'displayClock', 'clock', 'type']);
    if (comp.venue) out.venue = pick(comp.venue, ['id', 'fullName', 'indoor', 'address']);
    out.competitors = arr(comp.competitors).map(trimCompetitor);
    if (Array.isArray(comp.details)) out.details = comp.details.map(trimDetail);
    if (Array.isArray(comp.odds)) {
        out.odds = comp.odds.slice(0, 2).map((o) => {
            const x = pick(o, ['provider', 'details', 'overUnder', 'spread', 'moneylineWinner', 'awayTeamOdds', 'homeTeamOdds', 'drawOdds', 'overOdds', 'underOdds']);
            if (o.provider) x.provider = pick(o.provider, ['id', 'name', 'displayName']);
            for (const k of ['awayTeamOdds', 'homeTeamOdds', 'drawOdds']) {
                if (o[k]) x[k] = pick(o[k], ['moneyLine', 'spreadOdds', 'teamId', 'favorite', 'underdog']);
            }
            return x;
        });
    }
    if (Array.isArray(comp.broadcasts)) out.broadcasts = comp.broadcasts.map((b) => pick(b, ['names', 'market']));
    if (Array.isArray(comp.notes)) out.notes = comp.notes.map((n) => pick(n, ['headline', 'type']));
    if (Array.isArray(comp.headlines)) out.headlines = comp.headlines.map((h) => pick(h, ['description', 'type', 'shortLinkText']));
    if (comp.format) out.format = pick(comp.format, ['regulation']);
    return out;
}

function trimScoreboard(j) {
    const events = arr(j.events).map((ev) => {
        const out = pick(ev, ['id', 'uid', 'date', 'name', 'shortName', 'seasonType']);
        if (ev.season) out.season = pick(ev.season, ['year', 'slug', 'type']);
        if (ev.status) out.status = pick(ev.status, ['period', 'displayClock', 'clock', 'type']);
        out.competitions = arr(ev.competitions).slice(0, 1).map(trimCompetition);
        out.links = [];
        return out;
    });
    return {
        leagues: arr(j.leagues).map((l) => pick(l, ['id', 'uid', 'name', 'abbreviation', 'slug', 'logos'])).slice(0, 1),
        season: pick(j.season || {}, ['year', 'slug', 'type', 'startDate', 'endDate']),
        day: pick(j.day || {}, ['date']),
        events,
    };
}

function trimSummary(j) {
    const out = {};
    if (j.header) {
        out.header = {
            id: j.header.id,
            league: j.header.league ? pick(j.header.league, ['id', 'name', 'abbreviation', 'slug', 'logos']) : undefined,
            season: j.header.season ? pick(j.header.season, ['year', 'slug', 'type']) : undefined,
            competitions: arr(j.header.competitions).slice(0, 1).map(trimCompetition),
        };
    }
    if (j.boxscore) {
        out.boxscore = {
            teams: arr(j.boxscore.teams).slice(0, 2).map((t) => ({
                ...pick(t, ['homeAway', 'displayOrder']),
                team: trimTeam(t.team),
                statistics: arr(t.statistics).map(trimStat),
            })),
        };
    }
    out.rawKeys = Object.keys(j).sort();
    for (const key of ['scoringPlays', 'plays', 'winprobability', 'keyPlays', 'drives']) {
        // `plays` is the only source of scoring events for baseball and hockey,
        // but the full pitch-by-pitch list is megabytes of noise for a fixture:
        // keep every scoring play plus the opening twelve for context.
        let list = j[key];
        if (key === 'plays' && Array.isArray(list)) {
            list = list.filter((p) => p && p.scoringPlay).concat(list.slice(0, 12));
        }
        if (Array.isArray(list)) out[key] = list.slice(0, key === 'plays' ? 220 : 80).map((p) => {
            if (key === 'winprobability') return pick(p, ['homeWinPercentage', 'playId', 'tiePercentage']);
            const x = trimDetail(p);
            if (p.participants) x.participants = arr(p.participants).slice(0, 4).map((pt) => ({ athlete: pt.athlete ? pick(pt.athlete, ['id', 'displayName', 'shortName']) : undefined, type: pt.type }));
            if (p.text !== undefined) x.text = p.text;
            return x;
        });
    }
    if (j.gameInfo) out.gameInfo = pick(j.gameInfo, ['venue', 'attendance', 'playByPlayAvailable', 'officials']);
    if (j.article) out.article = pick(j.article, ['headline', 'description', 'story', 'published']);
    if (j.rosters) out.rosterCount = arr(j.rosters).length;
    return out;
}

function trimStandings(j) {
    const out = { season: pick(j.season || {}, ['year', 'slug', 'name', 'type', 'startDate', 'endDate']) };
    if (j.name) out.name = j.name;
    if (j.abbreviation) out.abbreviation = j.abbreviation;
    const trimEntries = (s) => ({
        ...pick(s, ['season', 'name', 'abbreviation', 'type', 'id', 'displayName']),
        entries: arr(s.entries).map((e) => ({
            ...pick(e, ['rank', 'note']),
            team: trimTeam(e.team),
            stats: arr(e.stats).map(trimStat),
        })),
    });
    const walk = (node) => {
        const o = pick(node, ['id', 'name', 'abbreviation', 'shortName', 'type', 'displayName']);
        if (node.standings) o.standings = trimEntries(node.standings);
        if (Array.isArray(node.children)) o.children = node.children.map(walk);
        return o;
    };
    if (Array.isArray(j.children)) out.children = j.children.map(walk);
    if (j.standings) out.standings = trimEntries(j.standings);
    return out;
}

/* ------------------------------------------------------------------- main */
const manifest = { collectedAt: NOW.toISOString(), leagues: [], probes: [], totals: { bytes: 0, files: 0 } };
let writtenBytes = 0;

function writeFixture(rel, data) {
    const text = JSON.stringify(data);
    const bytes = Buffer.byteLength(text);
    if (writtenBytes + bytes > CAP_BYTES) { log(`  budget reached, skipping ${rel}`); return false; }
    mkdirSync(path.dirname(path.join(LIVE_DIR, rel)), { recursive: true });
    writeFileSync(path.join(LIVE_DIR, rel), text);
    writtenBytes += bytes;
    manifest.totals.bytes = writtenBytes;
    manifest.totals.files += 1;
    return true;
}

const days = [];
for (let d = -DAYS_BACK; d <= DAYS_FORWARD; d++) {
    days.push(new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()) + d * 86400000));
}

async function probe(sport, league) {
    const url = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}`;
    try {
        const j = await fetchJSON(url);
        manifest.probes.push({ sport, league, ok: true, name: j.name || j.displayName || '', season: j.season ? j.season.slug || j.season.year : '' });
        return true;
    } catch (e) {
        // the catalogue is known to under-report; a scoreboard probe is the
        // stronger liveness signal, so fall back to it before calling it dead.
        try {
            const j = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`);
            manifest.probes.push({ sport, league, ok: true, name: j.leagues && j.leagues[0] ? j.leagues[0].name : '', via: 'scoreboard' });
            return true;
        } catch (e2) {
            manifest.probes.push({ sport, league, ok: false, error: e2.message });
            return false;
        }
    }
}

async function main() {
    log(`mode=${PROBE_ONLY ? 'probe only' : 'full'} out=${LIVE_DIR} ${STAMP}`);
    if (!PROBE_ONLY) {
        // a fresh dated folder each run, so the fixtures for one run stay together
        mkdirSync(LIVE_DIR, { recursive: true });
        const dir = path.join(LIVE_DIR, STAMP);
        if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
        // keep the two most recent previous runs; older ones are the repo's
        // problem, not ours (they are pruned by hand when the fixtures rotate)
        const previous = readdirSync(LIVE_DIR, { withFileTypes: true })
            .filter((e) => e.isDirectory() && e.name !== STAMP)
            .map((e) => e.name).sort();
        for (const old of previous.slice(0, Math.max(0, previous.length - 2))) {
            rmSync(path.join(LIVE_DIR, old), { recursive: true, force: true });
            log(`pruned old fixture run ${old}`);
        }
    }

    for (const L of LEAGUES) {
        const entry = { sport: L.sport, league: L.league, standings: false, scoreboards: 0, summaries: 0 };
        // 1. standings
        if (L.table) {
            for (const base of ['https://site.web.api.espn.com', 'https://site.api.espn.com']) {
                try {
                    const j = await fetchJSON(`${base}/apis/v2/sports/${L.sport}/${L.league}/standings?region=us&lang=en&contentorigin=espn`);
                    const t = trimStandings(j);
                    const groups = arr(t.children).length ? t.children : (t.standings ? [t] : []);
                    const rows = groups.reduce((n, g) => n + (g.standings ? g.standings.entries.length : 0), 0);
                    if (!rows) throw new Error('no entries');
                    writeFixture(path.join(STAMP, `standings.${L.sport}.${L.league}.json`), t);
                    entry.standings = true;
                    entry.tableRows = rows;
                    entry.tableGroups = groups.length;
                    entry.season = t.season && (t.season.slug || t.season.year);
                    break;
                } catch (e) { entry.standingsError = e.message; }
                await sleep(DELAY_MS);
            }
        }
        // 2. scoreboards across the report + preview window
        if (L.matches === true) {
            for (const day of days) {
                try {
                    const j = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/${L.sport}/${L.league}/scoreboard?dates=${yymmdd(day)}`);
                    const t = trimScoreboard(j);
                    if (t.events.length) {
                        writeFixture(path.join(STAMP, `scoreboard.${L.sport}.${L.league}.${yymmdd(day)}.json`), t);
                        entry.scoreboards += 1;
                    }
                    for (const ev of t.events) {
                        const st = (ev.status && ev.status.type && ev.status.type.state) || '';
                        if (st === 'post' && entry.summaries < MAX_SUMMARIES_PER_LEAGUE) {
                            try {
                                const s = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/${L.sport}/${L.league}/summary?event=${ev.id}`);
                                writeFixture(path.join(STAMP, `summary.${L.sport}.${L.league}.${ev.id}.json`), trimSummary(s));
                                entry.summaries += 1;
                            } catch (e) { /* summary is optional */ }
                            await sleep(DELAY_MS);
                        }
                    }
                } catch (e) { /* no fixtures that day is normal */ }
                await sleep(DELAY_MS);
            }
        }
        manifest.leagues.push(entry);
        const note = entry.standingsError ? ` [standings: ${entry.standingsError}]` : '';
        log(`${L.sport}/${L.league}: standings=${entry.standings}${entry.tableRows ? `(${entry.tableRows} rows)` : ''} scoreboards=${entry.scoreboards} summaries=${entry.summaries}${note}`);
    }

    // 3. liveness probes for the wider candidate list
    for (const slug of PROBE_EXTRA) {
        const [sport, ...rest] = slug.split('/');
        await probe(sport, rest.join('/'));
        await sleep(DELAY_MS);
    }
    for (const L of LEAGUES) {
        const p = manifest.probes.find((x) => x.sport === L.sport && x.league === L.league);
        if (!p) { await probe(L.sport, L.league); await sleep(DELAY_MS); }
    }

    if (!PROBE_ONLY) {
        mkdirSync(path.join(LIVE_DIR, STAMP), { recursive: true });
        writeFileSync(path.join(LIVE_DIR, STAMP, 'manifest.json'), JSON.stringify(manifest, null, 1));
        log(`wrote ${manifest.totals.files} fixtures (${(writtenBytes / 1024).toFixed(0)} KiB) + manifest.json`);
    }
    log(`leagues with tables: ${manifest.leagues.filter((l) => l.standings).length}/${manifest.leagues.length}`);
    log(`live probes: ${manifest.probes.filter((p) => p.ok).length}/${manifest.probes.length}`);
    const dead = manifest.probes.filter((p) => !p.ok).map((p) => `${p.sport}/${p.league}`);
    if (dead.length) log(`dead slugs: ${dead.join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

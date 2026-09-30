/* Which leagues the prerenderer publishes, per sport — one source of truth for
   tools/prerender.mjs and testdata/verify.mjs.

   Soccer (the site's "football") is deliberately NOT listed here: those leagues
   come from standings.js's STANDINGS_LEAGUES, because the interactive
   standings.html?league=<code> page has to be able to render every one of them.
   This file covers the sports that have no interactive page — the snapshot
   pages under /table/, /report/ and /preview/ are their only ScoreHub surface.

   Every league below was checked against ESPN before it was added
   (tools/collect-samples.mjs --probe writes testdata/live/<date>/manifest.json):
   slugs that answer 400 (hockey/khl, hockey/shl, hockey/liiga, european
   basketball leagues, football/canadian-football) are absent on purpose, as are
   the ones whose payload is too broken to publish (men's college hockey returns
   one row per conference, NCAA basketball returns 365 rows across 31
   conferences — see COMPETITION-COVERAGE.md).

   Shape of an entry:
     sport    ESPN sport path segment (…/apis/site/v2/sports/<sport>/<league>/…)
     league   ESPN league slug; also the last segment of the /table/<slug>/ URL
     name     display name used in titles, breadcrumbs and sitemap copy
     icon     glyph for the chip rows (emoji, matching the site's sport tabs)
     table    true when ESPN serves a standings payload worth publishing
     matches  true when the league is swept for /report/ + /preview/ snapshots
     order    where it sits inside its sport's chip row
     reportCap / previewCap
              how many snapshots that league may keep in the repo. Soccer's caps
              live in prerender.mjs (MAX_REPORTS / MAX_PREVIEWS). Caps are small
              per league on purpose: spreading the rolling window across sports
              keeps any one league from holding every slot. */

export const SPORTS = [
    /* ------------------------------------------------------------ baseball */
    { sport: 'baseball', league: 'mlb', name: 'MLB', icon: '⚾', table: true, matches: true, order: 1, reportCap: 24, previewCap: 14 },
    { sport: 'baseball', league: 'mexican-winter-league', name: 'Liga Mexicana del Pacífico', icon: '⚾', table: false, matches: true, order: 2, reportCap: 8, previewCap: 8 },
    { sport: 'baseball', league: 'dominican-winter-league', name: 'Liga de Béisbol Profesional Dominicana', icon: '⚾', table: false, matches: true, order: 3, reportCap: 8, previewCap: 8 },

    /* --------------------------------------------------- american football */
    { sport: 'football', league: 'nfl', name: 'NFL', icon: '🏈', table: true, matches: true, order: 1, reportCap: 20, previewCap: 18 },
    { sport: 'football', league: 'college-football', name: 'NCAA College Football', icon: '🏈', table: true, matches: true, order: 2, reportCap: 18, previewCap: 14 },

    /* ------------------------------------------------------------ basketball */
    { sport: 'basketball', league: 'nba', name: 'NBA', icon: '🏀', table: true, matches: true, order: 1, reportCap: 18, previewCap: 14 },
    { sport: 'basketball', league: 'wnba', name: 'WNBA', icon: '🏀', table: true, matches: true, order: 2, reportCap: 12, previewCap: 10 },
    { sport: 'basketball', league: 'nbl', name: 'NBL (Australia)', icon: '🏀', table: true, matches: true, order: 3, reportCap: 10, previewCap: 8 },

    /* --------------------------------------------------------------- hockey */
    { sport: 'hockey', league: 'nhl', name: 'NHL', icon: '🏒', table: true, matches: true, order: 1, reportCap: 18, previewCap: 14 },
    { sport: 'hockey', league: 'mens-college-hockey', name: 'NCAA Men’s Ice Hockey', icon: '🏒', table: false, matches: true, order: 2, reportCap: 6, previewCap: 6 },
];

/* Days ahead swept for previews, per sport. Soccer's window (3 days) is set in
   prerender.mjs; the North-American leagues play on weekly or near-weekly
   rhythms (NFL Sundays, college Saturdays, MLB series), so a 3-day window would
   publish a handful of pages and hide the rest of the schedule. 7 days ahead
   covers one full round in every one of them. */
export const PREVIEW_DAYS_BY_SPORT = {
    baseball: 7,
    football: 7,
    basketball: 7,
    hockey: 7,
};

/* Schema.org sport names for the SportsEvent JSON-LD. */
export const SCHEMA_SPORT = {
    soccer: 'Football',
    baseball: 'Baseball',
    football: 'American Football',
    basketball: 'Basketball',
    hockey: 'Ice Hockey',
};

/* Columns for the standings tables of non-soccer sports. Each column lists the
   ESPN stat names it accepts, in order of preference; a column with no data in
   a payload is dropped rather than rendered as a wall of dashes.

   Stat names come from the payloads themselves — e.g. NFL publishes
   wins/losses/ties/winPercent/pointsFor/pointsAgainst/pointDifferential/streak,
   NHL publishes otLosses/gamesPlayed/points alongside wins/losses, and MLB
   publishes winPercent/gamesBehind/pointDifferential (its runs are the
   points* pair). */
export const TABLE_COLUMNS = {
    baseball: [
        { key: 'wins', label: 'W', names: ['wins'] },
        { key: 'losses', label: 'L', names: ['losses'] },
        { key: 'pct', label: 'PCT', names: ['winPercent', 'winningPercent', 'percentage'] },
        { key: 'gb', label: 'GB', names: ['gamesBehind', 'gamesBack'] },
        { key: 'rf', label: 'RS', names: ['runsFor', 'pointsFor'] },
        { key: 'ra', label: 'RA', names: ['runsAgainst', 'pointsAgainst'] },
        { key: 'diff', label: 'DIFF', names: ['runDifferential', 'pointDifferential', 'differential'] },
        { key: 'streak', label: 'STRK', names: ['streak'] },
    ],
    football: [
        { key: 'wins', label: 'W', names: ['wins'] },
        { key: 'losses', label: 'L', names: ['losses'] },
        { key: 'ties', label: 'T', names: ['ties'] },
        { key: 'pct', label: 'PCT', names: ['winPercent', 'winningPercent'] },
        { key: 'pf', label: 'PF', names: ['pointsFor'] },
        { key: 'pa', label: 'PA', names: ['pointsAgainst'] },
        { key: 'diff', label: 'DIFF', names: ['pointDifferential', 'differential'] },
        { key: 'streak', label: 'STRK', names: ['streak'] },
    ],
    basketball: [
        { key: 'wins', label: 'W', names: ['wins'] },
        { key: 'losses', label: 'L', names: ['losses'] },
        { key: 'pct', label: 'PCT', names: ['winPercent', 'winningPercent', 'percentage'] },
        { key: 'gb', label: 'GB', names: ['gamesBehind', 'gamesBack'] },
        { key: 'pf', label: 'PF', names: ['pointsFor', 'avgPointsFor'] },
        { key: 'pa', label: 'PA', names: ['pointsAgainst', 'avgPointsAgainst'] },
        { key: 'diff', label: 'DIFF', names: ['pointDifferential', 'differential', 'avgPointDifferential'] },
        { key: 'streak', label: 'STRK', names: ['streak'] },
    ],
    hockey: [
        { key: 'gamesPlayed', label: 'GP', names: ['gamesPlayed'] },
        { key: 'wins', label: 'W', names: ['wins'] },
        { key: 'losses', label: 'L', names: ['losses'] },
        { key: 'otLosses', label: 'OTL', names: ['otLosses', 'overtimeLosses'] },
        { key: 'points', label: 'PTS', names: ['points'] },
        { key: 'gf', label: 'GF', names: ['goalsFor', 'pointsFor'] },
        { key: 'ga', label: 'GA', names: ['goalsAgainst', 'pointsAgainst'] },
        { key: 'diff', label: 'DIFF', names: ['goalDifferential', 'pointDifferential', 'differential'] },
        { key: 'streak', label: 'STRK', names: ['streak'] },
    ],
};

/* Line-score/period labels per sport, for the match snapshot tables. Baseball
   innings are numbered; the others count quarters/periods/innings and stop at
   the last one played. */
export const PERIOD_NOUN = {
    baseball: 'Inning',
    football: 'Quarter',
    basketball: 'Quarter',
    hockey: 'Period',
    soccer: 'Half',
};

export const SPORTS_BY_KEY = Object.fromEntries(SPORTS.map((s) => [`${s.sport}/${s.league}`, s]));

export function sportEntry(sport, league) {
    return SPORTS_BY_KEY[`${sport}/${league}`] || null;
}

/* Table slugs a /table/<slug>/ page may exist for, per sport — used by the
   verifier to tell a legitimate page from an orphan. */
export function tableSlugsForSport(sport) {
    return SPORTS.filter((s) => s.sport === sport && s.table).map((s) => s.league);
}

/* Every sport the site publishes snapshots for, in the order the chip rows and
   the verifier walk them. */
export const SPORT_ORDER = ['soccer', 'football', 'baseball', 'basketball', 'hockey'];

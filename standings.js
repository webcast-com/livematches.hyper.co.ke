/* On-site full standings — complete league tables via the ESPN standings
   endpoint (same source as the homepage widget).
   Covers every league sitemap.xml advertises (testdata/verify.mjs keeps the
   two lists in step) and renders one table per conference where ESPN splits
   the league (MLS, and every US league that splits by conference).

   Multi-sport: every entry in STANDINGS_LEAGUES carries a `sport`, which is
   the ESPN sport path segment. It defaults to "soccer" (the bulk of the list)
   and the fetch URL, the row mapper and the table header all key off it, so an
   NFL or NHL table renders with its own columns instead of being forced
   through a P/W/D/L/GF/GA/GD/Pts header that means nothing for those sports.
   Pure helpers (standingStat, mapStandingRows, parseStandingsGroups,
   parseStandings, standingBadgeHTML, payloadSeasonLabel) are top-level and
   side-effect free for testability. */

const STANDINGS_LEAGUES = [
    { code: "EPL", slug: "eng.1", name: "Premier League" },
    { code: "LaLiga", slug: "esp.1", name: "La Liga" },
    { code: "SerieA", slug: "ita.1", name: "Serie A" },
    { code: "Bundesliga", slug: "ger.1", name: "Bundesliga" },
    { code: "Ligue1", slug: "fra.1", name: "Ligue 1" },
    { code: "UCL", slug: "uefa.champions", name: "Champions League" },
    // The rest are the leagues sitemap.xml promises a table for. Without them
    // those ?league= deep links fell back to the Premier League table.
    { code: "MLS", slug: "usa.1", name: "Major League Soccer" },
    { code: "LigaMX", slug: "mex.1", name: "Liga MX" },
    { code: "Brasileirao", slug: "bra.1", name: "Brasileir\u00e3o S\u00e9rie A" },
    { code: "Eredivisie", slug: "ned.1", name: "Eredivisie" },
    { code: "PrimeiraLiga", slug: "por.1", name: "Primeira Liga" },
    { code: "SuperLig", slug: "tur.1", name: "S\u00fcper Lig" },
    { code: "SaudiPro", slug: "ksa.1", name: "Saudi Pro League" },
    { code: "BEL", slug: "bel.1", name: "Belgian Pro League" },
    { code: "ARG", slug: "arg.1", name: "Liga Profesional" },
    { code: "J1", slug: "jpn.1", name: "J1 League" },
    { code: "SCO", slug: "sco.1", name: "Scottish Premiership" },
    { code: "URU", slug: "uru.1", name: "Liga AUF Uruguaya" },
    { code: "CHN", slug: "chn.1", name: "Chinese Super League" },
    { code: "RSA", slug: "rsa.1", name: "South African Premiership" },
    { code: "NGA", slug: "nga.1", name: "Nigeria Professional League" },
    { code: "GHA", slug: "gha.1", name: "Ghana Premier League" },
    { code: "KEN", slug: "ken.1", name: "Kenyan Premier League" },
    { code: "UGA", slug: "uga.1", name: "Ugandan Premier League" },
    { code: "IRL", slug: "irl.1", name: "League of Ireland Premier Division" },
    { code: "ISR", slug: "isr.1", name: "Israeli Premier League" },
    { code: "ROU", slug: "rou.1", name: "Liga I Romania" },
    { code: "PER", slug: "per.1", name: "Liga 1 de Per\xfa" },
    { code: "DEN", slug: "den.1", name: "Danish Superliga" },
    { code: "SWE", slug: "swe.1", name: "Allsvenskan" },
    { code: "NOR", slug: "nor.1", name: "Eliteserien" },
    // Second tiers of the big five and their neighbours. ESPN serves a live
    // table for every one of these; they used to be swept for scores but had no
    // table, so their /table/<slug>/ page could not exist.
    { code: "ENG2", slug: "eng.2", name: "Championship" },
    { code: "ESP2", slug: "esp.2", name: "LaLiga 2" },
    { code: "GER2", slug: "ger.2", name: "2. Bundesliga" },
    { code: "ITA2", slug: "ita.2", name: "Serie B" },
    { code: "FRA2", slug: "fra.2", name: "Ligue 2" },
    { code: "NED2", slug: "ned.2", name: "Eerste Divisie" },
    { code: "SCO2", slug: "sco.2", name: "Scottish Championship" },
    { code: "ENG3", slug: "eng.3", name: "League One" },
    { code: "ENG4", slug: "eng.4", name: "League Two" },
    { code: "ENG5", slug: "eng.5", name: "National League" },
    // Top flights the site already swept for scores, now with their tables.
    { code: "AUS", slug: "aus.1", name: "A-League Men" },
    { code: "GRE", slug: "gre.1", name: "Super League Greece" },
    { code: "AUT", slug: "aut.1", name: "Austrian Bundesliga" },
    { code: "RUS", slug: "rus.1", name: "Russian Premier League" },
    { code: "COL", slug: "col.1", name: "Primera A Colombia" },
    { code: "CHI", slug: "chi.1", name: "Chilean Primera Divisi\xf3n" },
    { code: "IND", slug: "ind.1", name: "Indian Super League" },
    { code: "PAR", slug: "par.1", name: "Paraguayan Primera Divisi\xf3n" },
    { code: "BOL", slug: "bol.1", name: "Bolivian Liga Profesional" },
    { code: "VEN", slug: "ven.1", name: "Venezuelan Primera Divisi\xf3n" },
    { code: "BRA2", slug: "bra.2", name: "Brasileir\xe3o S\xe9rie B" },
    { code: "USL", slug: "usa.usl.1", name: "USL Championship" },
    { code: "USL1", slug: "usa.usl.l1", name: "USL League One" },
    { code: "THA", slug: "tha.1", name: "Thai League 1" },
    { code: "MYS", slug: "mys.1", name: "Malaysia Super League" },
    { code: "IDN", slug: "idn.1", name: "Indonesian Super League" },
    // Women's football
    { code: "WSL", slug: "eng.w.1", name: "Women\u2019s Super League" },
    { code: "ESPW", slug: "esp.w.1", name: "Liga F" },
    { code: "FRAW", slug: "fra.w.1", name: "Premi\xe8re Ligue" },
    { code: "NEDW", slug: "ned.w.1", name: "Vrouwen Eredivisie" },
    { code: "AUSW", slug: "aus.w.1", name: "A-League Women" },
    { code: "NSL", slug: "can.w.nsl", name: "Northern Super League" },
    // Continental club competitions (league phase / group tables)
    { code: "UEL", slug: "uefa.europa", name: "UEFA Europa League" },
    { code: "UECL", slug: "uefa.europa.conf", name: "UEFA Conference League" },
    { code: "UWCL", slug: "uefa.wchampions", name: "UEFA Women\u2019s Champions League" },
    { code: "LIB", slug: "conmebol.libertadores", name: "CONMEBOL Libertadores" },
    { code: "SUD", slug: "conmebol.sudamericana", name: "CONMEBOL Sudamericana" },
    { code: "AFCE", slug: "afc.champions", name: "AFC Champions League Elite" },
    { code: "CAFC", slug: "caf.champions", name: "CAF Champions League" },
    { code: "CAFCF", slug: "caf.confed", name: "CAF Confederation Cup" },
    { code: "LCUP", slug: "concacaf.leagues.cup", name: "Leagues Cup" },

    /* Sports other than soccer. These used to be static snapshots only: the
       page linked out to /table/nfl/ and friends, which are regenerated once a
       day, because fetchStandings() could only build a soccer URL. They are
       chips like any other league now, and testdata/verify.mjs holds this list
       to exactly the leagues tools/sports.mjs marks `table: true`, so the live
       page and the prerendered snapshots can never drift apart. */
    { code: "NFL", slug: "nfl", name: "NFL", sport: "football" },
    { code: "CFB", slug: "college-football", name: "NCAA College Football", sport: "football" },
    { code: "NBA", slug: "nba", name: "NBA", sport: "basketball" },
    { code: "WNBA", slug: "wnba", name: "WNBA", sport: "basketball" },
    { code: "NBL", slug: "nbl", name: "NBL (Australia)", sport: "basketball" },
    { code: "MLB", slug: "mlb", name: "MLB", sport: "baseball" },
    { code: "NHL", slug: "nhl", name: "NHL", sport: "hockey" },
    /* Soccer is the default, so the 70 entries above say nothing; everything
       downstream can still rely on L.sport being present. */
].map(function (L) { return L.sport ? L : Object.assign({ sport: "soccer" }, L); });

/* One column set per sport. `names` are the ESPN stat keys to try in order —
   the same payload calls the same idea different things depending on the sport
   (pointsFor is goals in hockey, runs in baseball, points in basketball).
   `type` decides the formatting: int for counts, signed for differentials
   (which read as +7 / -3), text for the values ESPN sends pre-formatted such
   as .625, 1.5 games behind or a W3 streak.
   The labels match tools/sports.mjs TABLE_COLUMNS exactly so the live table
   and the prerendered snapshot of the same league have the same header. */
const TABLE_COLUMNS = {
    soccer: [
        { key: "played", label: "P", names: ["gamesPlayed", "played"], type: "int" },
        { key: "won", label: "W", names: ["wins", "won"], type: "int" },
        { key: "drawn", label: "D", names: ["ties", "draws", "drawn"], type: "int" },
        { key: "lost", label: "L", names: ["losses", "lost"], type: "int" },
        { key: "gf", label: "GF", names: ["pointsFor", "goalsFor", "goals"], type: "int" },
        { key: "ga", label: "GA", names: ["pointsAgainst", "goalsAgainst"], type: "int" },
        { key: "gd", label: "GD", names: ["pointDifferential", "goalDifferential", "differential"], type: "signed" },
        { key: "pts", label: "Pts", names: ["points", "pts"], type: "int", strong: true },
    ],
    football: [
        { key: "won", label: "W", names: ["wins"], type: "int" },
        { key: "lost", label: "L", names: ["losses"], type: "int" },
        { key: "drawn", label: "T", names: ["ties"], type: "int" },
        { key: "pct", label: "PCT", names: ["winPercent", "winningPercent"], type: "text", strong: true },
        { key: "gf", label: "PF", names: ["pointsFor"], type: "int" },
        { key: "ga", label: "PA", names: ["pointsAgainst"], type: "int" },
        { key: "gd", label: "DIFF", names: ["pointDifferential", "differential"], type: "signed" },
        { key: "streak", label: "STRK", names: ["streak"], type: "text" },
    ],
    basketball: [
        { key: "won", label: "W", names: ["wins"], type: "int" },
        { key: "lost", label: "L", names: ["losses"], type: "int" },
        { key: "pct", label: "PCT", names: ["winPercent", "winningPercent", "percentage"], type: "text", strong: true },
        { key: "gb", label: "GB", names: ["gamesBehind", "gamesBack"], type: "text" },
        { key: "gf", label: "PF", names: ["pointsFor", "avgPointsFor"], type: "text" },
        { key: "ga", label: "PA", names: ["pointsAgainst", "avgPointsAgainst"], type: "text" },
        { key: "gd", label: "DIFF", names: ["pointDifferential", "differential", "avgPointDifferential"], type: "signed" },
        { key: "streak", label: "STRK", names: ["streak"], type: "text" },
    ],
    baseball: [
        { key: "won", label: "W", names: ["wins"], type: "int" },
        { key: "lost", label: "L", names: ["losses"], type: "int" },
        { key: "pct", label: "PCT", names: ["winPercent", "winningPercent", "percentage"], type: "text", strong: true },
        { key: "gb", label: "GB", names: ["gamesBehind", "gamesBack"], type: "text" },
        { key: "gf", label: "RS", names: ["runsFor", "pointsFor"], type: "int" },
        { key: "ga", label: "RA", names: ["runsAgainst", "pointsAgainst"], type: "int" },
        { key: "gd", label: "DIFF", names: ["runDifferential", "pointDifferential", "differential"], type: "signed" },
        { key: "streak", label: "STRK", names: ["streak"], type: "text" },
    ],
    hockey: [
        { key: "played", label: "GP", names: ["gamesPlayed"], type: "int" },
        { key: "won", label: "W", names: ["wins"], type: "int" },
        { key: "lost", label: "L", names: ["losses"], type: "int" },
        { key: "otl", label: "OTL", names: ["otLosses", "overtimeLosses"], type: "int" },
        { key: "pts", label: "PTS", names: ["points"], type: "int", strong: true },
        { key: "gf", label: "GF", names: ["goalsFor", "pointsFor"], type: "int" },
        { key: "ga", label: "GA", names: ["goalsAgainst", "pointsAgainst"], type: "int" },
        { key: "gd", label: "DIFF", names: ["goalDifferential", "pointDifferential", "differential"], type: "signed" },
        { key: "streak", label: "STRK", names: ["streak"], type: "text" },
    ],
};

function columnsFor(sport) {
    return TABLE_COLUMNS[sport || "soccer"] || TABLE_COLUMNS.soccer;
}

function leagueByCode(code) {
    return STANDINGS_LEAGUES.find(function (x) { return x.code === code; }) || STANDINGS_LEAGUES[0];
}

function standingStat(entry, names) {
    const stats = (entry && entry.stats) || [];
    for (const name of names) {
        const s = stats.find((x) => x && x.name === name);
        if (s) {
            const v = (s.displayValue !== undefined && s.displayValue !== "") ? s.displayValue : s.value;
            const n = parseInt(v, 10);
            return isNaN(n) ? 0 : n;
        }
    }
    return 0;
}

/* The pre-formatted values: ".625", "1.5", "W3". Parsing those as integers
   (which standingStat does, deliberately, for the counting stats) turns a
   win percentage into 0 and a streak into a blank. */
function standingText(entry, names) {
    const stats = (entry && entry.stats) || [];
    for (const name of names) {
        const st = stats.find((x) => x && x.name === name);
        if (st) {
            const v = (st.displayValue !== undefined && st.displayValue !== "") ? st.displayValue : st.value;
            if (v !== undefined && v !== null && v !== "") return String(v);
        }
    }
    return "";
}

function standingLogo(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function columnValue(entry, col) {
    if (col.type === "text") return standingText(entry, col.names);
    const n = standingStat(entry, col.names);
    if (col.type === "signed") return n > 0 ? "+" + n : String(n);
    return String(n);
}

function mapStandingRows(entries, sport) {
    const columns = columnsFor(sport);
    const rows = entries.map((entry, i) => {
        const team = entry.team || {};
        const row = {
            rank: standingStat(entry, ["rank"]) || (i + 1),
            team: team.displayName || team.shortDisplayName || team.name || "?",
            abbrev: team.abbreviation || "",
            logo: standingLogo(team),
            // The soccer-named fields stay on every row whatever the sport:
            // the homepage widget, the prerenderer and the parser regressions
            // in testdata/verify.mjs all read them by name.
            played: standingStat(entry, ["gamesPlayed", "played"]),
            won: standingStat(entry, ["wins", "won"]),
            drawn: standingStat(entry, ["ties", "draws", "drawn"]),
            lost: standingStat(entry, ["losses", "lost"]),
            gf: standingStat(entry, ["pointsFor", "goalsFor", "goals"]),
            ga: standingStat(entry, ["pointsAgainst", "goalsAgainst"]),
            gd: standingStat(entry, ["pointDifferential", "goalDifferential", "differential"]),
            pts: standingStat(entry, ["points", "pts"]),
            zone: entry.note ? { color: entry.note.color || "#81D6AC", desc: entry.note.description || "" } : null
        };
        // …and the sport's own column set is resolved once, here, so the
        // renderer is a dumb loop over cells rather than a per-sport branch.
        row.cells = columns.map((col) => columnValue(entry, col));
        return row;
    });
    rows.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    return rows;
}

/* ESPN returns its tables under `children`. Most leagues have exactly one
   ("English Premier League"), but MLS splits into "Eastern Conference" and
   "Western Conference" with the rank restarting at 1 in each, and some
   payloads nest a second level underneath. Reading children[0] only — which is
   what this page used to do — showed one conference as if it were the whole
   league. Collect every node that actually carries entries. */
function collectStandingGroups(node, out, sport) {
    if (!node || typeof node !== "object") return out;
    if (node.standings && Array.isArray(node.standings.entries)) {
        out.push({ name: node.name || node.abbreviation || "", rows: mapStandingRows(node.standings.entries, sport) });
        return out;
    }
    if (Array.isArray(node.children)) node.children.forEach((child) => collectStandingGroups(child, out, sport));
    return out;
}

/* [{ name, rows }] — one entry per table in the payload (a single unnamed-ish
   group for the leagues that have one table). */
function parseStandingsGroups(data, sport) {
    if (!data || typeof data !== "object") return [];
    return collectStandingGroups(data, [], sport || "soccer").filter((g) => g.rows.length);
}

/* Flat, table-by-table list of rows, for callers that expect a single array. */
function parseStandings(data, sport) {
    return parseStandingsGroups(data, sport).reduce((all, g) => all.concat(g.rows), []);
}

/* Season labels used to be hard-coded to "2025/26", so every table advertised
   the wrong season once 2026/27 kicked off. Prefer what ESPN sends
   (season.slug "2026-27", else season.year, which is the season's start year),
   and fall back to the current date — European seasons run Aug–May. */
function seasonLabelFromSlug(slug) {
    const m = /^(\d{4})-(\d{2}|\d{4})$/.exec(String(slug || ""));
    if (!m) return null;
    return `${m[1]}/${m[2].length === 4 ? m[2].slice(2) : m[2]}`;
}

function payloadSeasonLabel(data, sport) {
    const s = (data && data.season) || {};
    const fromSlug = seasonLabelFromSlug(s.slug);
    if (fromSlug) return fromSlug;
    /* Soccer's season.year is the season's START year, so 2026 means 2026/27.
       The US leagues send the END year (the NHL's 2026-27 season reports
       2027), and the single-year sports — MLB, the NFL, the WNBA — do not
       straddle a new year at all. Deriving "year/year+1" from those produces a
       season that has not happened yet, so take what ESPN already formatted. */
    if (sport && sport !== "soccer") {
        const display = s.displayName || (data && data.seasonDisplayName) || "";
        if (display) return String(display);
        if (!(typeof s.year === "number" && s.year > 1900)) return null;
        /* Same rule as seasonLabelForSport() in tools/sports.mjs, so the live
           table and the prerendered snapshot of the same league never disagree
           about which season they are showing (verify.mjs asserts they match).
           Basketball and hockey seasons straddle the new year and are named
           for the start year — 2026-27 — while the NFL, MLB and the WNBA are
           named for a single year even when the playoffs run into January. */
        const start = s.startDate ? new Date(s.startDate) : null;
        const end = s.endDate ? new Date(s.endDate) : null;
        if (start && start.getTime() > Date.now()) return String(s.year - 1);
        const splits = sport === "basketball" || sport === "hockey";
        if (splits && start && end && start.getUTCFullYear() !== end.getUTCFullYear()) {
            const y0 = start.getUTCFullYear();
            return `${y0}-${String(y0 + 1).slice(2)}`;
        }
        return String(s.year);
    }
    if (typeof s.year === "number" && s.year > 1900) return `${s.year}/${String(s.year + 1).slice(2)}`;
    return null;
}

function currentSeasonLabel(now, sport) {
    const d = now || new Date();
    const y = d.getFullYear();
    // "Seasons run August to May" is a football assumption. MLB, the NFL and
    // the WNBA play inside one calendar year, so labelling them 2026/27 would
    // be wrong; the leagues that do straddle (NBA, NHL) get the split label
    // from ESPN itself as soon as the payload lands.
    if (sport && sport !== "soccer") return String(y);
    return d.getMonth() >= 6 ? `${y}/${String(y + 1).slice(2)}` : `${y - 1}/${String(y).slice(2)}`;
}

function standingBadgeHTML(abbrev, logo) {
    return `<span class="team-logo-wrap" style="width:22px;height:22px;">`
        + `<span class="player-avatar-mini" style="font-size:7px;width:100%;height:100%;">${esc(abbrev)}</span>`
        + (logo ? `<img class="team-logo-img" src="${esc(logo)}" alt="" width="32" height="32" loading="lazy" decoding="async" onerror="this.remove()">` : "")
        + `</span>`;
}

async function fetchStandings(slug, sport) {
    const s = sport || "soccer";
    const path = `/apis/v2/sports/${s}/${slug}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = [
        `https://site.web.api.espn.com${path}`,
        `https://site.api.espn.com${path}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent("https://site.api.espn.com" + path)}`
    ];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const j = await r.json();
            const groups = parseStandingsGroups(j, s);
            if (groups.length) return { groups, season: payloadSeasonLabel(j, s) };
        } catch (e) { /* try next mirror */ }
    }
    return { groups: [], season: null };
}

let standingsCode = "EPL";

function tableHTML(rows, sport) {
    const columns = columnsFor(sport);
    const body = rows.map((row) => {
        const zone = row.zone
            ? `<span class="zone-dot" style="background:${esc(row.zone.color)}" title="${esc(row.zone.desc)}"></span>`
            : "";
        /* Rows parsed before this function knew about sports (and the ones the
           prerenderer hands back) have no `cells`; rebuild them from the named
           fields so an old caller still renders a full table. */
        const cells = row.cells || columns.map((col) => {
            const v = row[col.key];
            if (v === undefined) return "";
            return col.type === "signed" && v > 0 ? "+" + v : String(v);
        });
        return `<tr><td>${row.rank}</td>`
            + `<td class="col-team"><div class="full-team-cell">${standingBadgeHTML(row.abbrev, row.logo)}<span class="full-team-name">${esc(row.team)}</span>${zone}</div></td>`
            + columns.map((col, i) => `<td${col.strong ? ' style="font-weight:700;"' : ""}>${esc(cells[i])}</td>`).join("")
            + `</tr>`;
    }).join("");
    return `<div class="full-table-wrap"><table class="full-table"><thead><tr>`
        + `<th>#</th><th class="col-team">${t("table.team")}</th>`
        + columns.map((col) => `<th>${esc(col.label)}</th>`).join("")
        + `</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderTable(rows, sport) {
    const box = document.getElementById("standings-table");
    box.innerHTML = rows.length ? tableHTML(rows, sport) : "";
}

/* Conference splits (MLS) get a heading per table so the two half-tables —
   each ranked from 1 — are not read as one broken list. */
function renderGroups(groups, sport) {
    const box = document.getElementById("standings-table");
    if (!groups.length) { box.innerHTML = ""; return; }
    if (groups.length === 1) { box.innerHTML = tableHTML(groups[0].rows, sport); return; }
    box.innerHTML = groups.map((g) => `<h2 class="standings-group-title">${esc(g.name || t("h1.standings"))}</h2>${tableHTML(g.rows, sport)}`).join("");
}

function applySEO(L, season) {
    if (!window.SEO) return;
    try {
        // The column labels are the honest description of what the table
        // holds, and they differ per sport — an NFL table has no GF or GD.
        const cols = columnsFor(L.sport).map((c) => c.label).join(", ");
        SEO.setTitle(`${L.name} Standings ${season} - Table, Points & Stats | ScoreHub`);
        SEO.setDescription(`Live ${L.name} standings: full table with ${cols}. Updated hourly from ESPN on ScoreHub.`);
        // The prerendered static page (tools/prerender.mjs -> /table/<slug>/) is
        // the crawlable home of this table; consolidating the interactive page
        // into it gives each league one indexable URL. The GitHub Action
        // (.github/workflows/prerender.yml) keeps those pages fresh.
        SEO.setCanonical(`https://livematches.hyper.co.ke/table/${L.slug}/`);
        SEO.setKeywords([L.name, `${L.name} standings`, 'standings', 'league table', 'table', 'ScoreHub']);
        SEO.breadcrumb([
            { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
            { name: 'Standings', url: 'https://livematches.hyper.co.ke/standings.html' },
            { name: L.name, url: `https://livematches.hyper.co.ke/table/${L.slug}/` }
        ]);
    } catch (e) {}
}

function setHeading(L) {
    const h1 = document.querySelector(".legal-card h1");
    if (h1) h1.textContent = `${L.name} ${t("h1.standings")}`;
}

async function loadStandings() {
    const box = document.getElementById("standings-table");
    const err = document.getElementById("standings-error");
    err.hidden = true;
    box.innerHTML = `<p class="loading-note">${t("table.loading")}</p>`;
    const L = leagueByCode(standingsCode);
    setHeading(L);
    applySEO(L, currentSeasonLabel(null, L.sport));
    const res = await fetchStandings(L.slug, L.sport);
    if (!res.groups.length) {
        box.innerHTML = "";
        err.hidden = false;
        return;
    }
    if (res.season) applySEO(L, res.season);
    window.__standingsGroups = res.groups;
    window.__standingsSport = L.sport;
    window.__standingsRows = res.groups.reduce((all, g) => all.concat(g.rows), []);
    renderGroups(res.groups, L.sport);
}

// Two spellings reach this page: the tab chips / homepage league rows use the
// short code (`EPL`, `LaLiga`) while sitemap.xml plus the match and story
// deep links use the ESPN slug (`eng.1`, `uefa.champions`). Accept both so
// those links show the league they asked for instead of silently falling back
// to the Premier League table.
function resolveLeagueKey(q) {
    if (!q) return null;
    const key = String(q).trim();
    if (!key) return null;
    const byCode = STANDINGS_LEAGUES.find((x) => x.code.toLowerCase() === key.toLowerCase());
    if (byCode) return byCode.code;
    const bySlug = STANDINGS_LEAGUES.find((x) => x.slug.toLowerCase() === key.toLowerCase());
    if (bySlug) return bySlug.code;
    return null;
}

function bootStandings() {
    try {
        const key = resolveLeagueKey(new URLSearchParams(window.location.search).get("league"));
        if (key) standingsCode = key;
    } catch (e) {}
    document.querySelectorAll("#standings-chips .standings-tab").forEach((btn) => {
        btn.classList.toggle("active", (btn.dataset.league || "EPL") === standingsCode);
        btn.addEventListener("click", () => {
            document.querySelectorAll("#standings-chips .standings-tab").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            standingsCode = btn.dataset.league || "EPL";
            loadStandings();
        });
    });
    const retry = document.getElementById("standings-retry");
    if (retry) retry.addEventListener("click", loadStandings);
    loadStandings();
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootStandings);
}

window.__rerenderLang = function () {
    try {
        const L = leagueByCode(standingsCode);
        setHeading(L);
        if (window.__standingsGroups && window.__standingsGroups.length) renderGroups(window.__standingsGroups, L.sport);
        else loadStandings();
    } catch (e) {}
};

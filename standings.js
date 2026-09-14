/* On-site full standings — complete league tables via the ESPN standings
   endpoint (same source as the homepage widget), with W/D/L and goals.
   Covers every league sitemap.xml advertises (testdata/verify.mjs keeps the
   two lists in step) and renders one table per conference where ESPN splits
   the league (MLS).
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
    { code: "SaudiPro", slug: "sau.1", name: "Saudi Pro League" }
];

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

function mapStandingRows(entries) {
    const rows = entries.map((entry, i) => {
        const team = entry.team || {};
        return {
            rank: standingStat(entry, ["rank"]) || (i + 1),
            team: team.displayName || team.shortDisplayName || team.name || "?",
            abbrev: team.abbreviation || "",
            logo: standingLogo(team),
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
function collectStandingGroups(node, out) {
    if (!node || typeof node !== "object") return out;
    if (node.standings && Array.isArray(node.standings.entries)) {
        out.push({ name: node.name || node.abbreviation || "", rows: mapStandingRows(node.standings.entries) });
        return out;
    }
    if (Array.isArray(node.children)) node.children.forEach((child) => collectStandingGroups(child, out));
    return out;
}

/* [{ name, rows }] — one entry per table in the payload (a single unnamed-ish
   group for the leagues that have one table). */
function parseStandingsGroups(data) {
    if (!data || typeof data !== "object") return [];
    return collectStandingGroups(data, []).filter((g) => g.rows.length);
}

/* Flat, table-by-table list of rows, for callers that expect a single array. */
function parseStandings(data) {
    return parseStandingsGroups(data).reduce((all, g) => all.concat(g.rows), []);
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

function payloadSeasonLabel(data) {
    const s = (data && data.season) || {};
    const fromSlug = seasonLabelFromSlug(s.slug);
    if (fromSlug) return fromSlug;
    if (typeof s.year === "number" && s.year > 1900) return `${s.year}/${String(s.year + 1).slice(2)}`;
    return null;
}

function currentSeasonLabel(now) {
    const d = now || new Date();
    const y = d.getFullYear();
    return d.getMonth() >= 6 ? `${y}/${String(y + 1).slice(2)}` : `${y - 1}/${String(y).slice(2)}`;
}

function standingBadgeHTML(abbrev, logo) {
    return `<span class="team-logo-wrap" style="width:22px;height:22px;">`
        + `<span class="player-avatar-mini" style="font-size:7px;width:100%;height:100%;">${esc(abbrev)}</span>`
        + (logo ? `<img class="team-logo-img" src="${esc(logo)}" alt="" loading="lazy" onerror="this.remove()">` : "")
        + `</span>`;
}

async function fetchStandings(slug) {
    const path = `/apis/v2/sports/soccer/${slug}/standings?region=us&lang=en&contentorigin=espn`;
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
            const groups = parseStandingsGroups(j);
            if (groups.length) return { groups, season: payloadSeasonLabel(j) };
        } catch (e) { /* try next mirror */ }
    }
    return { groups: [], season: null };
}

let standingsCode = "EPL";

function tableHTML(rows) {
    const body = rows.map((row) => {
        const zone = row.zone
            ? `<span class="zone-dot" style="background:${esc(row.zone.color)}" title="${esc(row.zone.desc)}"></span>`
            : "";
        return `<tr><td>${row.rank}</td>`
            + `<td class="col-team"><div class="full-team-cell">${standingBadgeHTML(row.abbrev, row.logo)}<span class="full-team-name">${esc(row.team)}</span>${zone}</div></td>`
            + `<td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td>`
            + `<td>${row.gf}</td><td>${row.ga}</td><td>${row.gd > 0 ? "+" + row.gd : row.gd}</td>`
            + `<td style="font-weight:700;">${row.pts}</td></tr>`;
    }).join("");
    return `<div class="full-table-wrap"><table class="full-table"><thead><tr>`
        + `<th>#</th><th class="col-team">${t("table.team")}</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>`
        + `</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderTable(rows) {
    const box = document.getElementById("standings-table");
    box.innerHTML = rows.length ? tableHTML(rows) : "";
}

/* Conference splits (MLS) get a heading per table so the two half-tables —
   each ranked from 1 — are not read as one broken list. */
function renderGroups(groups) {
    const box = document.getElementById("standings-table");
    if (!groups.length) { box.innerHTML = ""; return; }
    if (groups.length === 1) { box.innerHTML = tableHTML(groups[0].rows); return; }
    box.innerHTML = groups.map((g) => `<h2 class="standings-group-title">${esc(g.name || t("h1.standings"))}</h2>${tableHTML(g.rows)}`).join("");
}

function applySEO(L, season) {
    if (!window.SEO) return;
    try {
        SEO.setTitle(`${L.name} Standings ${season} - Table, Points & Stats | ScoreHub`);
        SEO.setDescription(`Live ${L.name} standings: full table with P, W, D, L, GF, GA, GD, points. Updated hourly from ESPN on ScoreHub.`);
        SEO.setCanonical(`https://livematches.hyper.co.ke/standings.html?league=${L.slug}`);
        SEO.setKeywords([L.name, `${L.name} standings`, 'standings', 'league table', 'table', 'ScoreHub']);
        SEO.breadcrumb([
            { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
            { name: 'Standings', url: 'https://livematches.hyper.co.ke/standings.html' },
            { name: L.name, url: `https://livematches.hyper.co.ke/standings.html?league=${L.slug}` }
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
    const L = STANDINGS_LEAGUES.find((x) => x.code === standingsCode) || STANDINGS_LEAGUES[0];
    setHeading(L);
    applySEO(L, currentSeasonLabel());
    const res = await fetchStandings(L.slug);
    if (!res.groups.length) {
        box.innerHTML = "";
        err.hidden = false;
        return;
    }
    if (res.season) applySEO(L, res.season);
    window.__standingsGroups = res.groups;
    window.__standingsRows = res.groups.reduce((all, g) => all.concat(g.rows), []);
    renderGroups(res.groups);
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
        const L = STANDINGS_LEAGUES.find((x) => x.code === standingsCode) || STANDINGS_LEAGUES[0];
        setHeading(L);
        if (window.__standingsGroups && window.__standingsGroups.length) renderGroups(window.__standingsGroups);
        else loadStandings();
    } catch (e) {}
};

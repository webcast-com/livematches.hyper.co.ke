/* On-site full standings — complete league tables via the ESPN standings
   endpoint (same source as the homepage widget), with W/D/L and goals.
   Pure helpers (standingStat, parseStandings, standingBadgeHTML) are
   top-level and side-effect free for testability. */

const STANDINGS_LEAGUES = [
    { code: "EPL", slug: "eng.1", name: "Premier League" },
    { code: "LaLiga", slug: "esp.1", name: "La Liga" },
    { code: "SerieA", slug: "ita.1", name: "Serie A" },
    { code: "Bundesliga", slug: "ger.1", name: "Bundesliga" },
    { code: "Ligue1", slug: "fra.1", name: "Ligue 1" },
    { code: "UCL", slug: "uefa.champions", name: "Champions League" }
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

function parseStandings(data) {
    if (!data || !Array.isArray(data.children) || !data.children.length) return [];
    const child = data.children[0] || {};
    const node = child.standings || (child.children && child.children[0] && child.children[0].standings) || null;
    if (!node || !Array.isArray(node.entries)) return [];
    const rows = node.entries.map((entry, i) => {
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
            const rows = parseStandings(j);
            if (rows.length) return rows;
        } catch (e) { /* try next mirror */ }
    }
    return [];
}

let standingsCode = "EPL";

function renderTable(rows) {
    const box = document.getElementById("standings-table");
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
    box.innerHTML = `<div class="full-table-wrap"><table class="full-table"><thead><tr>`
        + `<th>#</th><th class="col-team">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>`
        + `</tr></thead><tbody>${body}</tbody></table></div>`;
}

async function loadStandings() {
    const box = document.getElementById("standings-table");
    const err = document.getElementById("standings-error");
    err.hidden = true;
    box.innerHTML = `<p class="loading-note">Loading table&hellip;</p>`;
    const L = STANDINGS_LEAGUES.find((x) => x.code === standingsCode) || STANDINGS_LEAGUES[0];
    const rows = await fetchStandings(L.slug);
    if (!rows.length) {
        box.innerHTML = "";
        err.hidden = false;
        return;
    }
    renderTable(rows);
}

function bootStandings() {
    try {
        const q = new URLSearchParams(window.location.search).get("league");
        if (q && STANDINGS_LEAGUES.some((x) => x.code === q)) standingsCode = q;
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

/* Previews & Reports hub — the week's biggest upcoming ties plus the
   latest finished matches, ranked by combined league position. Pure
   helpers (hubNorm, hubMatchRow, parseHubTable, hubScore, collectHub,
   rankUpcoming, rankFinished, pickBigHub, hubYmd) are top-level and
   side-effect free for testability. */

const HUB_LEAGUES = [
    { code: "EPL", slug: "eng.1", name: "Premier League" },
    { code: "LaLiga", slug: "esp.1", name: "La Liga" },
    { code: "SerieA", slug: "ita.1", name: "Serie A" },
    { code: "Bundesliga", slug: "ger.1", name: "Bundesliga" },
    { code: "Ligue1", slug: "fra.1", name: "Ligue 1" },
    { code: "UCL", slug: "uefa.champions", name: "Champions League" },
    { code: "UEL", slug: "uefa.europa", name: "Europa League" },
    { code: "UECL", slug: "uefa.europa.conf", name: "Europa Conference League" },
    { code: "FAC", slug: "eng.fa", name: "FA Cup" },
    { code: "EFLC", slug: "eng.league_cup", name: "Carabao Cup" },
    { code: "CDR", slug: "esp.copa_del_rey", name: "Copa del Rey" },
    { code: "DFB", slug: "ger.dfb_pokal", name: "DFB-Pokal" },
    { code: "COPPA", slug: "ita.coppa_italia", name: "Coppa Italia" },
    { code: "ENG2", slug: "eng.2", name: "Championship" },
    { code: "MLS", slug: "usa.1", name: "Major League Soccer" },
    { code: "LigaMX", slug: "mex.1", name: "Liga MX" },
    { code: "Brasileirao", slug: "bra.1", name: "Brasileirão Série A" },
    { code: "ARG", slug: "arg.1", name: "Liga Profesional" },
    { code: "LIB", slug: "conmebol.libertadores", name: "Copa Libertadores" },
    { code: "Eredivisie", slug: "ned.1", name: "Eredivisie" },
    { code: "PrimeiraLiga", slug: "por.1", name: "Primeira Liga" },
    { code: "BEL", slug: "bel.1", name: "Belgian Pro League" },
    { code: "SuperLig", slug: "tur.1", name: "Süper Lig" },
    { code: "SCO", slug: "sco.1", name: "Scottish Premiership" },
    { code: "SaudiPro", slug: "sau.1", name: "Saudi Pro League" },
    { code: "J1", slug: "jpn.1", name: "J1 League" },
    { code: "AUS", slug: "aus.1", name: "A-League" }
];

function cleanLeagueSlug(slug) {
    if (!slug) return "eng.1";
    let s = String(slug).trim();
    if (s.startsWith("soccer/")) s = s.slice(7);
    const codeMap = {
        EPL: "eng.1", LaLiga: "esp.1", SerieA: "ita.1", UCL: "uefa.champions",
        Bundesliga: "ger.1", Ligue1: "fra.1", MLS: "usa.1"
    };
    return codeMap[s] || s;
}

const SIM_HUB_MATCHES = [
    { id: "fb-5", slug: "fra.1", code: "Ligue1", leagueName: "Ligue 1", date: new Date(Date.now() + 3600000).toISOString(), home: { name: "Paris Saint-Germain", code: "PSG", logo: "" }, away: { name: "Lille", code: "LIL", logo: "" }, hPos: 1, aPos: 4, score: 5, venue: "Parc des Princes", hs: null, as: null, big: true },
    { id: "fb-6", slug: "ger.1", code: "Bundesliga", leagueName: "Bundesliga", date: new Date(Date.now() + 7200000).toISOString(), home: { name: "Bayern Munich", code: "FCB", logo: "" }, away: { name: "Bayer Leverkusen", code: "LEV", logo: "" }, hPos: 2, aPos: 1, score: 3, venue: "Allianz Arena", hs: null, as: null, big: true },
    { id: "fb-1", slug: "uefa.champions", code: "UCL", leagueName: "UEFA Champions League", date: new Date(Date.now() - 3600000).toISOString(), home: { name: "Arsenal", code: "ARS", logo: "" }, away: { name: "Chelsea", code: "CHE", logo: "" }, hPos: 2, aPos: 5, score: 7, venue: "Emirates Stadium", hs: 2, as: 1 },
    { id: "fb-2", slug: "eng.1", code: "EPL", leagueName: "Premier League", date: new Date(Date.now() - 7200000).toISOString(), home: { name: "Manchester City", code: "MCI", logo: "" }, away: { name: "Newcastle United", code: "NEW", logo: "" }, hPos: 1, aPos: 6, score: 7, venue: "Etihad Stadium", hs: 1, as: 0 },
    { id: "fb-3", slug: "esp.1", code: "LaLiga", leagueName: "La Liga", date: new Date(Date.now() - 10800000).toISOString(), home: { name: "Real Madrid", code: "RMA", logo: "" }, away: { name: "Barcelona", code: "BAR", logo: "" }, hPos: 1, aPos: 2, score: 3, venue: "Santiago Bernabéu", hs: 3, as: 2 },
    { id: "fb-4", slug: "ita.1", code: "SerieA", leagueName: "Serie A", date: new Date(Date.now() - 14400000).toISOString(), home: { name: "Inter Milan", code: "INT", logo: "" }, away: { name: "Juventus", code: "JUV", logo: "" }, hPos: 1, aPos: 3, score: 4, venue: "San Siro", hs: 2, as: 0 }
];

function hubNorm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hubMatchRow(t, rows) {
    const n = hubNorm(t.name), c = hubNorm(t.code);
    for (const r of (rows || [])) {
        if (n && n === hubNorm(r.team)) return r;
        if (c && c === hubNorm(r.abbrev)) return r;
    }
    for (const r of (rows || [])) {
        const rn = hubNorm(r.team);
        if (n && rn && n.length > 4 && rn.length > 4 && (rn.indexOf(n) !== -1 || n.indexOf(rn) !== -1)) return r;
    }
    return null;
}

function extractStandingsEntries(node, out) {
    if (!node || typeof node !== "object") return out;
    if (node.standings && Array.isArray(node.standings.entries)) {
        out.push(...node.standings.entries);
        return out;
    }
    if (Array.isArray(node.children)) node.children.forEach((c) => extractStandingsEntries(c, out));
    return out;
}

function parseHubTable(data) {
    if (!data || typeof data !== "object") return [];
    const entries = extractStandingsEntries(data, []);
    return entries.map((entry, i) => {
        const team = entry.team || {};
        const rankStat = (entry.stats || []).find((x) => x && x.name === "rank");
        const rankVal = rankStat ? (rankStat.value != null ? rankStat.value : rankStat.displayValue) : null;
        return {
            rank: parseInt(rankVal, 10) || (i + 1),
            team: team.displayName || team.shortDisplayName || team.name || "?",
            abbrev: team.abbreviation || ""
        };
    });
}

function hubTeamLogo(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}

function hubScore(hPos, aPos) {
    return (hPos || 30) + (aPos || 30);
}

function hubYmd(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}

function safeLocale() {
    try { return typeof appLocale === "function" ? appLocale() : undefined; } catch (e) { return undefined; }
}

function hubKickoff(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(safeLocale(), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ord(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function collectHub(events, L, tableRows) {
    const upcoming = [], finished = [];
    for (const ev of (events || [])) {
        const comp = (ev.competitions && ev.competitions[0]) || {};
        const cs = comp.competitors || [];
        const hc = cs.find((c) => c.homeAway === "home") || {};
        const ac = cs.find((c) => c.homeAway === "away") || {};
        const st = (ev.status && ev.status.type) || {};
        if (st.state !== "pre" && !st.completed) continue;
        const H = {
            name: (hc.team && (hc.team.displayName || hc.team.shortDisplayName)) || "Home",
            code: (hc.team && (hc.team.abbreviation || hc.team.shortDisplayName)) || "HOM",
            logo: hubTeamLogo(hc.team)
        };
        const A = {
            name: (ac.team && (ac.team.displayName || ac.team.shortDisplayName)) || "Away",
            code: (ac.team && (ac.team.abbreviation || ac.team.shortDisplayName)) || "AWY",
            logo: hubTeamLogo(ac.team)
        };
        const hr = hubMatchRow(H, tableRows), ar = hubMatchRow(A, tableRows);
        const item = {
            id: String(ev.id), slug: L.slug, code: L.code, leagueName: L.name,
            date: ev.date || "", t: new Date(ev.date).getTime() || 0,
            home: H, away: A,
            hPos: hr ? hr.rank : null, aPos: ar ? ar.rank : null,
            score: hubScore(hr ? hr.rank : null, ar ? ar.rank : null),
            venue: (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "",
            hs: hc.score != null ? hc.score : null, as: ac.score != null ? ac.score : null
        };
        if (st.state === "pre") upcoming.push(item);
        else finished.push(item);
    }
    return { upcoming, finished };
}

function rankUpcoming(list) {
    return (list || []).slice().sort((a, b) => (a.score - b.score) || (a.t - b.t));
}

function rankFinished(list) {
    return (list || []).slice().sort((a, b) => (a.score - b.score) || (b.t - a.t));
}

function pickBigHub(ranked, maxN) {
    return (ranked || []).filter((m) => m.score < 60 && m.score <= 12).slice(0, maxN || 6);
}

function hubLogoImg(logo) {
    return logo ? `<img class="pred-logo" src="${esc(logo)}" alt="" loading="lazy" onerror="this.remove()">` : "";
}

function matchHighlightUrl(homeTeam, awayTeam, leagueName) {
    const q = `${homeTeam || ""} vs ${awayTeam || ""} highlights ${leagueName || ""}`.trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

function hubCardHTML(m, kind) {
    const isReport = kind === "report";
    const href = isReport
        ? `report.html?league=${esc(m.slug)}&id=${esc(m.id)}&date=${hubYmd(m.date)}`
        : `preview.html?league=${esc(m.slug)}&id=${esc(m.id)}&date=${hubYmd(m.date)}`;
    const link = isReport ? t("hub.readreport") : t("hub.readpreview");
    const posLine = (m.hPos && m.aPos) ? `${ord(m.hPos)} vs ${ord(m.aPos)}` : "";
    const sub = isReport
        ? `<span class="hub-score">FT ${esc(m.hs)}–${esc(m.as)}</span>`
        : `${posLine}${posLine && m.venue ? " · " : ""}${esc(m.venue)}`;
    const hlBtn = isReport
        ? `<a class="hub-link hub-highlight-link" href="${matchHighlightUrl(m.home.name, m.away.name, m.code)}" target="_blank" rel="noopener" style="color:#ff4b4b;">🎥 Highlights</a>`
        : "";
    return `<div class="hub-card"><div class="hub-main">`
        + `<div class="pred-meta"><span class="league-tag">${esc(m.code)}</span><span>${esc(hubKickoff(m.date))}</span>`
        + (!isReport && m.big ? ` <span class="big-tag">${t("hub.bigmatch")}</span>` : "") + `</div>`
        + `<div class="hub-teams">${hubLogoImg(m.home.logo)}<span>${esc(m.home.name)}</span>`
        + `<span class="hub-vs">vs</span><span>${esc(m.away.name)}</span>${hubLogoImg(m.away.logo)}</div>`
        + `<div class="hub-sub">${sub}</div>`
        + `</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;"><a class="hub-link" href="${href}">${link}</a>${hlBtn}</div></div>`;
}

async function fetchHubBoard(slug) {
    try {
        const clean = cleanLeagueSlug(slug);
        const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${clean}/scoreboard?limit=100`);
        if (!r.ok) return [];
        const j = await r.json();
        return (j && Array.isArray(j.events)) ? j.events : [];
    } catch (e) { return []; }
}

async function fetchHubTable(slug) {
    const clean = cleanLeagueSlug(slug);
    const path = `/apis/v2/sports/soccer/${clean}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = [`https://site.web.api.espn.com${path}`, `https://site.api.espn.com${path}`];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const rows = parseHubTable(await r.json());
            if (rows.length) return rows;
        } catch (e) { /* next mirror */ }
    }
    return [];
}

async function bootHub() {
    try {
        if (window.SEO) {
            SEO.setTitle('Match Previews & Reports - Premier League, LaLiga, UCL | ScoreHub');
            SEO.setDescription('All match previews and reports: big matches, form, predictions and full-time results across Premier League, LaLiga, Serie A, Bundesliga, Champions League.');
            SEO.setCanonical('https://livematches.hyper.co.ke/previews.html');
            SEO.breadcrumb([
                { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
                { name: 'Previews & Reports', url: 'https://livematches.hyper.co.ke/previews.html' }
            ]);
            SEO.itemList([
                { name: 'Premier League Previews', url: 'https://livematches.hyper.co.ke/preview.html?league=eng.1' },
                { name: 'LaLiga Previews', url: 'https://livematches.hyper.co.ke/preview.html?league=esp.1' },
                { name: 'Champions League Previews', url: 'https://livematches.hyper.co.ke/preview.html?league=uefa.champions' }
            ], 'Football Previews');
        }
    } catch(e){}

    const bigBox = document.getElementById("hub-big");
    const repBox = document.getElementById("hub-reports");
    const allBox = document.getElementById("hub-all");
    const err = document.getElementById("hub-error");
    err.hidden = true;
    const boards = await Promise.all(HUB_LEAGUES.map((L) => fetchHubBoard(L.slug)));
    if (!boards.some((b) => b.length)) {
        const simBig = SIM_HUB_MATCHES.filter((m) => m.big && !m.hs);
        const simReps = SIM_HUB_MATCHES.filter((m) => m.hs != null);
        const simAll = SIM_HUB_MATCHES.filter((m) => !m.big && !m.hs);
        if (simBig.length || simReps.length) {
            bigBox.innerHTML = simBig.map((m) => hubCardHTML(m, "preview")).join("");
            repBox.innerHTML = simReps.map((m) => hubCardHTML(m, "report")).join("");
            allBox.innerHTML = simAll.length ? simAll.map((m) => hubCardHTML(m, "preview")).join("") : `<p class="loading-note">${t("hub.nomore")}</p>`;
            return;
        }
        bigBox.innerHTML = ""; repBox.innerHTML = ""; allBox.innerHTML = "";
        err.hidden = false;
        return;
    }
    const tables = await Promise.all(HUB_LEAGUES.map((L) => fetchHubTable(L.slug)));
    let upcoming = [], finished = [];
    boards.forEach((events, i) => {
        const got = collectHub(events, HUB_LEAGUES[i], tables[i]);
        upcoming = upcoming.concat(got.upcoming);
        finished = finished.concat(got.finished);
    });
    const rankedUp = rankUpcoming(upcoming);
    const big = pickBigHub(rankedUp, 6);
    big.forEach((m) => { m.big = true; });
    const bigIds = new Set(big.map((m) => m.slug + ":" + m.id));
    const rest = rankedUp.filter((m) => !bigIds.has(m.slug + ":" + m.id)).slice(0, 24);
    const reps = rankFinished(finished).slice(0, 6);
    bigBox.innerHTML = big.length
        ? big.map((m) => hubCardHTML(m, "preview")).join("")
        : `<p class="loading-note">${t("hub.nobig")}</p>`;
    repBox.innerHTML = reps.length
        ? reps.map((m) => hubCardHTML(m, "report")).join("")
        : `<p class="loading-note">${t("hub.nofin")}</p>`;
    allBox.innerHTML = rest.length
        ? rest.map((m) => hubCardHTML(m, "preview")).join("")
        : `<p class="loading-note">${t("hub.nomore")}</p>`;
    const retry = document.getElementById("hub-retry");
    if (retry && !retry.dataset.wired) { retry.dataset.wired = "1"; retry.addEventListener("click", bootHub); }
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootHub);
}

window.__rerenderLang = function () { try { bootHub(); } catch (e) {} };

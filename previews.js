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
    { code: "UCL", slug: "uefa.champions", name: "Champions League" }
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

function parseHubTable(data) {
    if (!data || !Array.isArray(data.children) || !data.children.length) return [];
    const child = data.children[0] || {};
    const node = child.standings || (child.children && child.children[0] && child.children[0].standings) || null;
    if (!node || !Array.isArray(node.entries)) return [];
    return node.entries.map((entry, i) => {
        const team = entry.team || {};
        const rankStat = (entry.stats || []).find((x) => x && x.name === "rank");
        return {
            rank: (rankStat && parseInt(rankStat.value, 10)) || (i + 1),
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

function hubKickoff(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(appLocale(), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
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
    return `<div class="hub-card"><div class="hub-main">`
        + `<div class="pred-meta"><span class="league-tag">${esc(m.code)}</span><span>${esc(hubKickoff(m.date))}</span>`
        + (!isReport && m.big ? ` <span class="big-tag">${t("hub.bigmatch")}</span>` : "") + `</div>`
        + `<div class="hub-teams">${hubLogoImg(m.home.logo)}<span>${esc(m.home.name)}</span>`
        + `<span class="hub-vs">vs</span><span>${esc(m.away.name)}</span>${hubLogoImg(m.away.logo)}</div>`
        + `<div class="hub-sub">${sub}</div>`
        + `</div><a class="hub-link" href="${href}">${link}</a></div>`;
}

async function fetchHubBoard(slug) {
    try {
        const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?limit=100`);
        if (!r.ok) return [];
        const j = await r.json();
        return (j && Array.isArray(j.events)) ? j.events : [];
    } catch (e) { return []; }
}

async function fetchHubTable(slug) {
    const path = `/apis/v2/sports/soccer/${slug}/standings?region=us&lang=en&contentorigin=espn`;
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
    const bigBox = document.getElementById("hub-big");
    const repBox = document.getElementById("hub-reports");
    const allBox = document.getElementById("hub-all");
    const err = document.getElementById("hub-error");
    err.hidden = true;
    const boards = await Promise.all(HUB_LEAGUES.map((L) => fetchHubBoard(L.slug)));
    if (!boards.some((b) => b.length)) {
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

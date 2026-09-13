/* ScoreHub Match Centre — own page for any match.
   Opened when user clicks a match card/ticker/spotlight.
   Supports:
   - ESPN live matches via ?league=slug&id=eventId&date=YYYYMMDD (fetches scoreboard + summary)
   - Simulation / fallback matches via sessionStorage "scorehub-match"
   Pure helpers are top-level and side-effect free for testability.
*/

const MATCH_LEAGUES = {
    "eng.1": "Premier League",
    "esp.1": "La Liga",
    "ita.1": "Serie A",
    "ger.1": "Bundesliga",
    "fra.1": "Ligue 1",
    "uefa.champions": "Champions League"
};

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ord(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function hashStr(s) {
    let h = 0; const str = String(s || "");
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
}
function ymdFromISO(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}
function formatKickoffLong(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    try { return d.toLocaleString(appLocale(), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return d.toLocaleString(); }
}
function formatDateShort(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    try { return d.toLocaleString(appLocale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return d.toLocaleDateString(); }
}
function teamLogoURL(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}
function normName(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function matchRowForTeam(T, rows) {
    const n = normName(T.name), c = normName(T.code);
    for (const r of (rows || [])) {
        if (n && n === normName(r.team)) return r;
        if (c && c === normName(r.abbrev)) return r;
    }
    return null;
}
function parseTable(data) {
    if (!data || !Array.isArray(data.children) || !data.children.length) return [];
    const child = data.children[0] || {};
    const node = child.standings || (child.children && child.children[0] && child.children[0].standings) || null;
    if (!node || !Array.isArray(node.entries)) return [];
    return node.entries.map((entry, i) => {
        const team = entry.team || {};
        const get = (names) => {
            for (const name of names) {
                const s = (entry.stats || []).find((x) => x && x.name === name);
                if (s) {
                    const v = (s.displayValue !== undefined && s.displayValue !== "") ? s.displayValue : s.value;
                    const n = parseInt(v, 10);
                    if (!isNaN(n)) return n;
                }
            }
            return 0;
        };
        return {
            rank: get(["rank"]) || (i + 1),
            team: team.displayName || team.shortDisplayName || team.name || "?",
            abbrev: team.abbreviation || "",
            pts: get(["points", "pts"])
        };
    });
}
function parseSideStats(competitor) {
    const out = { poss: null, shots: null, onTarget: null, corners: null, fouls: null, yellows: null, reds: null };
    const stats = (competitor && competitor.statistics) || [];
    const get = (name) => {
        const s = stats.find((x) => x && x.name === name);
        if (!s) return null;
        const v = parseFloat(s.displayValue != null && s.displayValue !== "" ? s.displayValue : s.value);
        return isNaN(v) ? null : v;
    };
    out.poss = get("possessionPct");
    out.shots = get("totalShots");
    out.onTarget = get("shotsOnTarget");
    out.corners = get("wonCorners");
    out.fouls = get("foulsCommitted");
    out.yellows = get("yellowCards");
    out.reds = get("redCards");
    return out;
}
function minuteValue(display) {
    const s = String(display || "");
    const base = parseInt(s, 10);
    const ex = s.match(/\+(\d+)/);
    const b = isNaN(base) ? 0 : base, e = ex ? parseInt(ex[1], 10) : 0;
    return b + e / 100;
}
function classifyEvent(c) {
    const typeObj = c.play && c.play.type ? c.play.type : null;
    const typeStr = ((typeObj && typeof typeObj === "object" ? (typeObj.type || typeObj.text || "") : (typeObj || "")) + "").toLowerCase();
    const text = ((c.text || "") + " " + (c.play && c.play.text ? c.play.text : "")).toLowerCase();
    const hay = typeStr + " " + text;
    if (c.scoringPlay || /(\bgoal\b|penalty scored|scores|own goal)/.test(hay)) return { cls: "ev-goal", icon: "⚽" };
    if (/(red card|sent off|second yellow)/.test(hay)) return { cls: "ev-card-r", icon: "🟥" };
    if (/(yellow card|booked|caution)/.test(hay)) return { cls: "ev-card-y", icon: "🟨" };
    if (/(substitut|replaces|replaced by|comes on for)/.test(hay)) return { cls: "ev-sub", icon: "🔄" };
    return null;
}
function americanToDecimal(ml) {
    const v = parseFloat(ml);
    if (isNaN(v) || v === 0) return null;
    return v > 0 ? 1 + v / 100 : 1 + 100 / Math.abs(v);
}
function oddsSummary(odds) {
    if (!odds) return "";
    const h = americanToDecimal(odds.home), d = americanToDecimal(odds.draw), a = americanToDecimal(odds.away);
    if (h && d && a) return `${h.toFixed(2)} · ${d.toFixed(2)} · ${a.toFixed(2)}`;
    if (odds.details) return odds.details;
    if (odds.overUnder) return `O/U ${odds.overUnder}`;
    return "";
}
function icsDateUTC(d) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// --- Fetch helpers (direct ESPN, same pattern as preview/report) ---

async function fetchEvent(slug, id, dateYmd) {
    const base = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
    const urls = dateYmd ? [`${base}?dates=${dateYmd}&limit=100`, `${base}?limit=100`] : [`${base}?limit=100`];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const j = await r.json();
            const ev = j && Array.isArray(j.events) && j.events.find((x) => String(x.id) === String(id));
            if (ev) return ev;
        } catch (e) { /* next */ }
    }
    return null;
}
async function fetchSummary(slug, id) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/summary?event=${id}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
}
async function fetchTable(slug) {
    const path = `/apis/v2/sports/soccer/${slug}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = [`https://site.web.api.espn.com${path}`, `https://site.api.espn.com${path}`];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const rows = parseTable(await r.json());
            if (rows.length) return rows;
        } catch (e) { /* next */ }
    }
    return [];
}

// --- Render helpers ---

function logoImg(url, cls) {
    return url ? `<img class="${cls || "pred-logo"}" src="${esc(url)}" alt="" loading="lazy" onerror="this.remove()">` : "";
}
function statusPill(ev) {
    const st = (ev && ev.status && ev.status.type) || {};
    const state = st.state || "pre";
    const detail = st.shortDetail || st.detail || "";
    if (state === "in") return `<span class="league-tag" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.3);">● LIVE · ${esc(detail || ev.status.displayClock || "")}</span>`;
    if (state === "post" || st.completed) return `<span class="league-tag">FT · ${esc(detail)}</span>`;
    return `<span class="league-tag">${esc(detail || "Upcoming")}</span>`;
}
function scoreboardHTML(H, A, hs, as, ev) {
    const comp = (ev && ev.competitions && ev.competitions[0]) || {};
    const venue = (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "";
    const st = (ev && ev.status && ev.status.type) || {};
    const isLive = st.state === "in";
    const score = isLive || st.completed || st.state === "post" ? `${hs != null ? hs : "–"} – ${as != null ? as : "–"}` : "vs";
    return `<div class="match-hero">
        <div class="match-hero-top">${logoImg(H.logo, "match-hero-logo")}<span class="match-hero-name">${esc(H.name)}</span>
        <span class="match-hero-score">${esc(score)}</span>
        <span class="match-hero-name">${esc(A.name)}</span>${logoImg(A.logo, "match-hero-logo")}</div>
        <div class="match-hero-sub">${venue ? esc(venue) + " · " : ""}${esc(formatKickoffLong(ev.date))}</div>
    </div>`;
}
function statsBarsHTML(H, A, sh, sa) {
    const cfg = [
        ["Possession %", sh.poss, sa.poss, "%"],
        ["Shots", sh.shots, sa.shots, ""],
        ["On target", sh.onTarget, sa.onTarget, ""],
        ["Corners", sh.corners, sa.corners, ""],
        ["Fouls", sh.fouls, sa.fouls, ""],
        ["Yellow cards", sh.yellows, sa.yellows, ""],
        ["Red cards", sh.reds, sa.reds, ""]
    ].filter((r) => r[1] != null || r[2] != null);
    if (!cfg.length) return `<p class="loading-note">Stats will appear at kickoff.</p>`;
    return cfg.map(([label, hv, av, suf]) => {
        const h = hv != null ? hv : 0, a = av != null ? av : 0;
        const tot = h + a || 1;
        const hp = (h / tot) * 100, ap = (a / tot) * 100;
        return `<div class="stat-item-row"><div class="stat-row-meta"><span class="stat-val-home">${hv != null ? hv + suf : "–"}</span><span class="stat-label-name">${label}</span><span class="stat-val-away">${av != null ? av + suf : "–"}</span></div><div class="stat-track-bar"><div class="stat-fill-home" style="width:${hp}%;"></div><div class="stat-fill-away" style="width:${ap}%;"></div></div></div>`;
    }).join("");
}
function timelineFromDetails(details, reds, hCode, aCode) {
    // details = ESPN commentary array, reds optional
    const items = [];
    (details || []).forEach((c) => {
        const kind = classifyEvent(c);
        if (!kind) return;
        const min = (c.time && c.time.displayValue) || (c.clock && c.clock.displayValue) || "";
        const text = c.text || (c.play && c.play.text) || "";
        if (!text) return;
        items.push({ key: minuteValue(min), min, cls: kind.cls, icon: kind.icon, text });
    });
    if (!items.length && reds && reds.length) {
        reds.forEach((r) => items.push({ key: minuteValue(r.display), min: r.display, cls: "ev-card-r", icon: "🟥", text: `${r.player} sent off` }));
    }
    if (!items.length) return `<div class="timeline-empty">No key events yet — goals, cards and substitutions will appear here.</div>`;
    items.sort((a, b) => b.key - a.key);
    return items.map((e) => `<div class="timeline-item ${e.cls}"><span class="timeline-min">${esc(e.min)}</span><span class="timeline-text">${e.icon} ${esc(e.text)}</span></div>`).join("");
}
function lineupsFromSummary(data) {
    const out = { home: [], away: [] };
    if (!data) return out;
    const box = data.boxscore && Array.isArray(data.boxscore.players) ? data.boxscore.players : [];
    const getSide = (side) => {
        const node = box.find((t) => (t.homeAway || "").toLowerCase() === side) || box[side === "home" ? 0 : 1];
        const groups = (node && Array.isArray(node.statistics)) ? node.statistics : [];
        const athletes = [];
        groups.forEach((g) => (g.athletes || []).forEach((a) => {
            athletes.push({
                name: (a.athlete && (a.athlete.displayName || a.athlete.shortName)) || "?",
                pos: (a.athlete && a.athlete.position && a.athlete.position.abbreviation) || ""
            });
        }));
        const seen = new Set();
        return athletes.filter((p) => {
            if (p.name === "?" || seen.has(p.name)) return false;
            seen.add(p.name); return true;
        }).slice(0, 18);
    };
    // also try data.lineups if present
    const lu = Array.isArray(data.lineups) ? data.lineups : [];
    if (lu.length) {
        ["home", "away"].forEach((side) => {
            const node = lu.find((t) => (t.homeAway || t.homeaway || "").toLowerCase() === side);
            const ath = node && (node.athletes || node.players || node.roster);
            if (Array.isArray(ath) && ath.length) {
                out[side] = ath.slice(0, 18).map((a) => ({
                    name: a.displayName || a.name || a.shortName || "?",
                    pos: (a.position && (a.position.abbreviation || a.position.name)) || ""
                }));
            }
        });
        if (out.home.length || out.away.length) return out;
    }
    out.home = getSide("home");
    out.away = getSide("away");
    return out;
}
function commentaryHTML(comm) {
    if (!comm || !comm.length) return `<p><strong>[Live]</strong> Live commentary will appear here once the feed updates…</p>`;
    const latest = comm.slice(-8).reverse();
    return latest.map((c) => {
        const min = c.time && c.time.displayValue ? c.time.displayValue : (c.clock && c.clock.displayValue) || "";
        const text = c.text || (c.play && c.play.text) || "";
        return `<p><strong>[${esc(min)}]</strong> ${esc(text)}</p>`;
    }).join("");
}

let liveRefreshTimer = null;
let currentMatchRef = null;

function wireTabs() {
    const tabs = document.querySelectorAll(".mc-tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
            tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
            const name = tab.getAttribute("data-mc-tab");
            ["commentary", "timeline", "lineups", "stats"].forEach((n) => {
                const pane = document.getElementById(`mc-pane-${n}`);
                if (pane) pane.hidden = n !== name;
            });
        });
    });
}
function wireShare(H, A, ev, hs, as) {
    const leagueName = MATCH_LEAGUES[ev.leagueSlug || ""] || ev.league || "Football";
    const when = formatKickoffLong(ev.date);
    const score = (ev.status && ev.status.type && ev.status.type.state !== "pre") ? `${hs}–${as}` : when;
    const canvas = document.getElementById("share-canvas");
    if (canvas) {
        drawShareCard(canvas, {
            kicker: `${leagueName} · ${ev.status && ev.status.type && ev.status.type.state === "in" ? "LIVE" : (ev.status && ev.status.type.completed ? "FULL TIME" : "UPCOMING")}`.toUpperCase(),
            home: H.name, away: A.name,
            middle: score,
            sub: (ev.venue || when || "").slice(0, 80),
            tag: ev.status && ev.status.type && ev.status.type.state === "in" ? "LIVE" : "MATCH"
        });
    }
    const root = document.getElementById("share-row");
    if (root) {
        wireShareButtons(root, {
            title: `${H.name} ${hs != null ? hs + "–" + as : "vs"} ${A.name}`,
            text: `${H.name} vs ${A.name} — ${leagueName}`,
            url: window.location.href,
            filename: shareFileName(`match-${H.code}-${A.code}`)
        });
    }
}
function downloadICS(H, A, ev, leagueName) {
    if (!ev.date) return;
    const start = new Date(ev.date);
    if (isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ScoreHub//Match//EN", "BEGIN:VEVENT",
        `UID:${ev.id || H.code + A.code}@scorehub`, `DTSTAMP:${icsDateUTC(new Date())}`,
        `DTSTART:${icsDateUTC(start)}`, `DTEND:${icsDateUTC(end)}`,
        `SUMMARY:${H.name} vs ${A.name} (${leagueName})`,
        `DESCRIPTION:Follow live on ScoreHub - ${window.location.href}`,
        "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${H.code}-vs-${A.code}.ics`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function renderSimMatch(m) {
    const box = document.getElementById("match-body");
    const H = { name: m.homeTeam || "Home", code: m.homeCode || "HOM", logo: m.homeLogo || "" };
    const A = { name: m.awayTeam || "Away", code: m.awayCode || "AWY", logo: m.awayLogo || "" };
    const hs = m.homeScore, as = m.awayScore;
    const isLive = m.status === "live";
    const scorersH = (m.scorers && m.scorers.home) || [];
    const scorersA = (m.scorers && m.scorers.away) || [];
    const sh = m.stats || {};
    const sa = m.awayStats || { possession: 100 - (sh.possession || 50), shots: Math.round((sh.shots || 0) * 0.8), shotsOnTarget: Math.round((sh.shotsOnTarget || 0) * 0.8), corners: Math.round((sh.corners || 0) * 0.8), fouls: Math.round((sh.fouls || 0) * 0.8) };
    box.innerHTML = `<span class="league-tag">${esc(m.league || "Football")}</span> ${isLive ? `<span class="league-tag" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.3);">● LIVE · ${esc(m.time || "")}</span>` : `<span class="league-tag">${esc(m.time || "")}</span>`}
        <h1 style="margin-top:10px;">${esc(H.name)} vs ${esc(A.name)}</h1>
        <div class="match-hero"><div class="match-hero-top">${logoImg(H.logo, "match-hero-logo")}<span class="match-hero-name">${esc(H.name)}</span><span class="match-hero-score">${esc(hs)} – ${esc(as)}</span><span class="match-hero-name">${esc(A.name)}</span>${logoImg(A.logo, "match-hero-logo")}</div><div class="match-hero-sub">${esc(m.league || "")} · ${esc(m.time || "")}</div></div>
        <div class="pred-subrow"><h2 class="pred-sub">Scorers</h2></div>
        <div class="form-cols"><div class="form-col"><h3>${logoImg(H.logo, "pred-logo")} ${esc(H.name)}</h3>${scorersH.length ? scorersH.map((s) => `<div class="form-game">⚽ ${esc(s)}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div><div class="form-col"><h3>${logoImg(A.logo, "pred-logo")} ${esc(A.name)}</h3>${scorersA.length ? scorersA.map((s) => `<div class="form-game">⚽ ${esc(s)}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div></div>
        <div class="pred-subrow"><h2 class="pred-sub">Match Statistics</h2></div>
        <div class="stats-bars-container">${statsBarsHTML(H, A, { poss: sh.possession, shots: sh.shots, onTarget: sh.shotsOnTarget, corners: sh.corners, fouls: sh.fouls, yellows: sh.yellowCards, reds: sh.redCards }, { poss: sa.possession, shots: sa.shots, onTarget: sa.shotsOnTarget, corners: sa.corners, fouls: sa.fouls, yellows: sa.yellowCards, reds: sa.redCards })}</div>
        <p class="preview-note">This is a simulated match from Simulation Mode. Switch to Live API Mode on the homepage for real ESPN data.</p>
        <p class="preview-note"><a href="index.html" style="color:var(--primary);">&larr; Back to Scores</a></p>
        ${shareSectionHTML()}`;
    wireTabs();
    wireShare(H, A, { date: new Date().toISOString(), league: m.league, id: m.id, status: { type: { state: isLive ? "in" : "post" } }, venue: "" }, hs, as);
}

async function bootMatch() {
    const box = document.getElementById("match-body");
    let league = "", id = "", date = "";
    try {
        const q = new URLSearchParams(window.location.search);
        league = q.get("league") || ""; id = q.get("id") || ""; date = q.get("date") || "";
    } catch (e) {}
    // Fallback: simulation match stored from homepage click
    if (!league || !id) {
        try {
            const raw = sessionStorage.getItem("scorehub-match");
            if (raw) {
                const m = JSON.parse(raw);
                if (m && (m.homeTeam || m.homeCode)) {
                    document.title = `${m.homeTeam} vs ${m.awayTeam} — ScoreHub`;
                    renderSimMatch(m);
                    return;
                }
            }
        } catch (e) {}
        box.innerHTML = `<h1>Match not found</h1><div class="window-strip">Open a match from <a href="index.html">Scores</a> — click any match card or ticker item to view its own page.</div>`;
        return;
    }

    const leagueName = MATCH_LEAGUES[league] || league;
    box.innerHTML = `<p class="loading-note">Loading ${esc(leagueName)} match…</p>`;
    const ev = await fetchEvent(league, id, date);
    if (!ev) {
        box.innerHTML = `<h1>Match unavailable</h1><div class="window-strip">Couldn't find this fixture — it may have been rescheduled. Try <a href="index.html">Scores</a>.</div>`;
        return;
    }
    const comp = (ev.competitions && ev.competitions[0]) || {};
    const cs = comp.competitors || [];
    const hc = cs.find((c) => c.homeAway === "home") || {};
    const ac = cs.find((c) => c.homeAway === "away") || {};
    const H = {
        name: (hc.team && (hc.team.displayName || hc.team.shortDisplayName)) || "Home",
        code: (hc.team && (hc.team.abbreviation || hc.team.shortDisplayName)) || "HOM",
        logo: teamLogoURL(hc.team)
    };
    const A = {
        name: (ac.team && (ac.team.displayName || ac.team.shortDisplayName)) || "Away",
        code: (ac.team && (ac.team.abbreviation || ac.team.shortDisplayName)) || "AWY",
        logo: teamLogoURL(ac.team)
    };
    const hs = hc.score != null ? parseInt(hc.score, 10) : null;
    const as = ac.score != null ? parseInt(ac.score, 10) : null;
    const st = (ev.status && ev.status.type) || {};
    try { document.title = `${H.name} ${hs != null ? hs + "–" + as + " " : "vs "}${A.name} — ScoreHub`; } catch (e) {}

    // Parallel fetches: summary + table
    let summary = null, table = [];
    try {
        const results = await Promise.allSettled([fetchSummary(league, id), fetchTable(league)]);
        if (results[0].status === "fulfilled") summary = results[0].value;
        if (results[1].status === "fulfilled") table = results[1].value;
    } catch (e) {}

    const venueFull = (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "";
    const venueCity = (comp.venue && comp.venue.address && comp.venue.address.city) || "";
    const venue = [venueFull, venueCity].filter(Boolean).join(", ");

    // Scorers from details
    const details = comp.details || [];
    const homeId = hc.team && hc.team.id, awayId = ac.team && ac.team.id;
    const goals = [];
    let yellows = 0; const reds = [];
    (details || []).forEach((d) => {
        const tid = String(d.team && d.team.id != null ? d.team.id : "");
        const side = tid && String(homeId) === tid ? "H" : tid && String(awayId) === tid ? "A" : "";
        const p = d.athletesInvolved && d.athletesInvolved[0];
        const name = p ? (p.displayName || p.shortName || "") : "";
        const display = (d.clock && d.clock.displayValue) || "";
        if (d.scoringPlay) goals.push({ display, key: minuteValue(display), scorer: name || "Unknown", team: side || "H", pen: !!d.penaltyKick, og: !!d.ownGoal });
        if (d.redCard) reds.push({ display, player: name || "Unknown", team: side || "H" });
        if (d.yellowCard) yellows++;
    });
    goals.sort((a, b) => a.key - b.key);
    const scorersH = goals.filter((g) => g.team === "H");
    const scorersA = goals.filter((g) => g.team === "A");

    // Stats
    const sh = parseSideStats(hc), sa = parseSideStats(ac);
    // If summary has boxscore, prefer it
    if (summary && summary.boxscore && Array.isArray(summary.boxscore.teams)) {
        const teams = summary.boxscore.teams;
        const homeT = teams.find((t) => t.homeAway === "home") || teams[0];
        const awayT = teams.find((t) => t.homeAway === "away") || teams[1];
        if (homeT && awayT) {
            const pick = (t, name) => {
                const s = (t.statistics || []).find((x) => x.name === name);
                const v = s ? parseFloat(s.displayValue) : NaN;
                return isNaN(v) ? null : Math.round(v);
            };
            const keys = ["possessionPct", "totalShots", "shotsOnTarget", "wonCorners", "foulsCommitted", "yellowCards", "redCards"];
            const map = { possessionPct: "poss", totalShots: "shots", shotsOnTarget: "onTarget", wonCorners: "corners", foulsCommitted: "fouls", yellowCards: "yellows", redCards: "reds" };
            keys.forEach((k) => {
                const hv = pick(homeT, k), av = pick(awayT, k);
                if (hv != null) sh[map[k]] = hv;
                if (av != null) sa[map[k]] = av;
            });
        }
    }

    const hr = matchRowForTeam(H, table), ar = matchRowForTeam(A, table);
    const posLine = (hr && ar) ? `${ord(hr.rank)} vs ${ord(ar.rank)} · ${hr.pts}pts vs ${ar.pts}pts` : "";

    // Broadcast + odds
    let broadcast = "";
    if (Array.isArray(comp.broadcasts) && comp.broadcasts[0] && Array.isArray(comp.broadcasts[0].names)) broadcast = comp.broadcasts[0].names.join(", ");
    let odds = null;
    const oddsInfo = Array.isArray(comp.odds) ? comp.odds.find((o) => o && (o.details || o.homeTeamOdds)) : null;
    if (oddsInfo) odds = { details: oddsInfo.details || "", overUnder: oddsInfo.overUnder, home: oddsInfo.homeTeamOdds ? oddsInfo.homeTeamOdds.moneyLine : null, draw: oddsInfo.drawOdds ? oddsInfo.drawOdds.moneyLine : null, away: oddsInfo.awayTeamOdds ? oddsInfo.awayTeamOdds.moneyLine : null };

    const isPre = st.state === "pre";
    const isLive = st.state === "in";
    const isPost = st.completed || st.state === "post";

    // Preview/report links
    const ymd = ymdFromISO(ev.date);
    const previewHref = isPre ? `preview.html?league=${esc(league)}&id=${esc(id)}&date=${ymd}` : "";
    const reportHref = isPost ? `report.html?league=${esc(league)}&id=${esc(id)}&date=${ymd}` : "";

    // Commentary source
    const comm = summary ? (Array.isArray(summary.commentary) ? summary.commentary : (Array.isArray(summary.plays) ? summary.plays : [])) : [];
    const lineups = lineupsFromSummary(summary);

    box.innerHTML = `<div class="pred-meta"><span class="league-tag">${esc(leagueName)}</span>${statusPill(ev)}${broadcast ? `<span>📺 ${esc(broadcast)}</span>` : ""}${odds ? `<span class="stat-capsule">🎲 ${esc(oddsSummary(odds))}</span>` : ""}</div>
        <h1 style="margin-top:10px;">${esc(H.name)} vs ${esc(A.name)}</h1>
        <p class="legal-updated">${esc(formatKickoffLong(ev.date))}${venue ? ` · ${esc(venue)}` : ""}${posLine ? ` · ${esc(posLine)}` : ""}</p>
        <div class="match-hero"><div class="match-hero-top">${logoImg(H.logo, "match-hero-logo")}<span class="match-hero-name">${esc(H.name)}</span><span class="match-hero-score">${isPre ? "vs" : `${hs != null ? hs : "–"} – ${as != null ? as : "–"}`}</span><span class="match-hero-name">${esc(A.name)}</span>${logoImg(A.logo, "match-hero-logo")}</div></div>
        <div class="form-cols"><div class="form-col"><h3>${logoImg(H.logo, "pred-logo")} ${esc(H.name)}</h3>${scorersH.length ? scorersH.map((g) => `<div class="form-game">⚽ ${esc(g.display)} ${esc(g.scorer)}${g.pen ? " (P)" : g.og ? " (OG)" : ""}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div><div class="form-col"><h3>${logoImg(A.logo, "pred-logo")} ${esc(A.name)}</h3>${scorersA.length ? scorersA.map((g) => `<div class="form-game">⚽ ${esc(g.display)} ${esc(g.scorer)}${g.pen ? " (P)" : g.og ? " (OG)" : ""}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">
            ${previewHref ? `<a class="btn btn-login btn-sm" href="${previewHref}">📰 Preview</a>` : ""}
            ${reportHref ? `<a class="btn btn-login btn-sm" href="${reportHref}">📝 Report</a>` : ""}
            <button class="btn btn-login btn-sm" id="match-share-btn">Share</button>
            <button class="btn btn-login btn-sm" id="match-ics-btn">Add to calendar</button>
            <a class="btn btn-login btn-sm" href="standings.html?league=${esc(league === "eng.1" ? "EPL" : league === "esp.1" ? "LaLiga" : league === "ita.1" ? "SerieA" : league === "ger.1" ? "Bundesliga" : league === "fra.1" ? "Ligue1" : "UCL")}">Table</a>
        </div>

        <div class="match-centre-tabs" style="margin-top:18px;" role="tablist">
            <button class="mc-tab active" data-mc-tab="commentary" role="tab" aria-selected="true">Commentary</button>
            <button class="mc-tab" data-mc-tab="timeline" role="tab" aria-selected="false">Timeline</button>
            <button class="mc-tab" data-mc-tab="lineups" role="tab" aria-selected="false">Lineups</button>
            <button class="mc-tab" data-mc-tab="stats" role="tab" aria-selected="false">Stats</button>
        </div>
        <div class="chat-ticker-container mc-pane" id="mc-pane-commentary"><div class="commentary-list" id="commentary-list">${commentaryHTML(comm)}</div></div>
        <div class="chat-ticker-container mc-pane" id="mc-pane-timeline" hidden><div class="timeline-list" id="timeline-list">${timelineFromDetails(comm.length ? comm : details, reds, H.code, A.code)}</div></div>
        <div class="chat-ticker-container mc-pane" id="mc-pane-lineups" hidden><div class="lineups-grid" id="lineups-grid">${(lineups.home.length || lineups.away.length) ? `<div class="lineup-col"><h5>${esc(H.name)}</h5>${lineups.home.map((p) => `<div class="lineup-player"><span>${esc(p.name)}</span><span class="lineup-pos">${esc(p.pos)}</span></div>`).join("") || `<div class="timeline-empty">Unavailable</div>`}</div><div class="lineup-col"><h5>${esc(A.name)}</h5>${lineups.away.map((p) => `<div class="lineup-player"><span>${esc(p.name)}</span><span class="lineup-pos">${esc(p.pos)}</span></div>`).join("") || `<div class="timeline-empty">Unavailable</div>`}</div>` : `<div class="timeline-empty" style="grid-column:1/-1;">Lineups aren't published for this match yet — check back closer to kickoff.</div>`}</div></div>
        <div class="chat-ticker-container mc-pane" id="mc-pane-stats" hidden><div class="stats-bars-container">${statsBarsHTML(H, A, sh, sa)}</div></div>

        <p class="preview-note">Data: ESPN. ${isLive ? "This page auto-refreshes every 60 seconds while live." : ""} ${previewHref ? `<a href="${previewHref}" style="color:var(--primary);">Read preview →</a>` : ""} ${reportHref ? `<a href="${reportHref}" style="color:var(--primary);">Read report →</a>` : ""}</p>
        ${shareSectionHTML()}
        <p class="preview-note"><a href="index.html" style="color:var(--primary);">&larr; Back to Scores</a> · <a href="previews.html" style="color:var(--primary);">All previews & reports</a></p>`;

    // Wire tabs + actions
    wireTabs();
    const shareBtn = document.getElementById("match-share-btn");
    if (shareBtn) shareBtn.addEventListener("click", async () => {
        const data = { title: `${H.name} vs ${A.name}`, text: `${H.name} vs ${A.name} — ${leagueName}`, url: window.location.href };
        if (navigator.share) { try { await navigator.share(data); } catch (e) {} }
        else { try { await navigator.clipboard.writeText(data.url); } catch (e) {} }
    });
    const icsBtn = document.getElementById("match-ics-btn");
    if (icsBtn) icsBtn.addEventListener("click", () => downloadICS(H, A, { ...ev, leagueSlug: league, id }, leagueName));

    wireShare(H, A, { ...ev, leagueSlug: league, id, date: ev.date, venue }, hs, as);

    // Live auto-refresh
    currentMatchRef = { league, id, H, A };
    if (isLive) {
        clearInterval(liveRefreshTimer);
        liveRefreshTimer = setInterval(async () => {
            try {
                const freshSum = await fetchSummary(league, id);
                const freshComm = Array.isArray(freshSum.commentary) ? freshSum.commentary : (Array.isArray(freshSum.plays) ? freshSum.plays : []);
                const cl = document.getElementById("commentary-list");
                if (cl) cl.innerHTML = commentaryHTML(freshComm);
                const tl = document.getElementById("timeline-list");
                if (tl) tl.innerHTML = timelineFromDetails(freshComm.length ? freshComm : [], [], H.code, A.code);
                // stats refresh
                if (freshSum.boxscore && Array.isArray(freshSum.boxscore.teams)) {
                    const teams = freshSum.boxscore.teams;
                    const homeT = teams.find((t) => t.homeAway === "home") || teams[0];
                    const awayT = teams.find((t) => t.homeAway === "away") || teams[1];
                    const pick = (t, name) => {
                        const s = (t.statistics || []).find((x) => x.name === name);
                        const v = s ? parseFloat(s.displayValue) : NaN;
                        return isNaN(v) ? null : Math.round(v);
                    };
                    const sh2 = { ...sh }, sa2 = { ...sa };
                    [["possessionPct", "poss"], ["totalShots", "shots"], ["shotsOnTarget", "onTarget"], ["wonCorners", "corners"], ["foulsCommitted", "fouls"], ["yellowCards", "yellows"], ["redCards", "reds"]].forEach(([k, out]) => {
                        const hv = pick(homeT, k), av = pick(awayT, k);
                        if (hv != null) sh2[out] = hv;
                        if (av != null) sa2[out] = av;
                    });
                    const statsPane = document.querySelector("#mc-pane-stats .stats-bars-container");
                    if (statsPane) statsPane.innerHTML = statsBarsHTML(H, A, sh2, sa2);
                }
            } catch (e) { /* keep old */ }
        }, 60000);
    }
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootMatch);
}
window.__rerenderLang = function () { try { bootMatch(); } catch (e) {} };

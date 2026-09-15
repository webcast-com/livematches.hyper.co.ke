/* ScoreHub Match Centre — own page for any match.
   Opened when user clicks a match card/ticker/spotlight.
   Supports:
   - ESPN live matches via ?league=slug&id=eventId&date=YYYYMMDD (fetches scoreboard + summary)
   - Simulation / fallback matches via sessionStorage "scorehub-match"
   Pure helpers are top-level and side-effect free for testability.
*/

const MOCK_MATCHES = [
    {
        id: "fb-1",
        sport: "football",
        league: "UEFA Champions League",
        leagueId: "UCL",
        homeTeam: "Arsenal",
        homeCode: "ARS",
        homeColor: "#dd1d25",
        awayTeam: "Chelsea",
        awayCode: "CHE",
        awayColor: "#034694",
        homeScore: 2,
        awayScore: 1,
        halftimeScore: "HT 1-0",
        time: "72'",
        status: "live",
        stats: { possession: 55, shots: 8, shotsOnTarget: 4, corners: 4, fouls: 7, yellowCards: 2, redCards: 0 },
        scorers: { home: ["12' Martin Ødegaard", "45'+2 Bukayo Saka"], away: ["45' N. Jackson"] }
    },
    {
        id: "fb-2",
        sport: "football",
        league: "Premier League",
        leagueId: "EPL",
        homeTeam: "Manchester City",
        homeCode: "MCI",
        homeColor: "#6cabdd",
        awayTeam: "Newcastle United",
        awayCode: "NEW",
        awayColor: "#241f20",
        homeScore: 1,
        awayScore: 0,
        halftimeScore: "HT 0-0",
        time: "68'",
        status: "live",
        stats: { possession: 62, shots: 11, shotsOnTarget: 5, corners: 7, fouls: 5, yellowCards: 1, redCards: 0 },
        scorers: { home: ["58' Erling Haaland"], away: [] }
    },
    {
        id: "fb-3",
        sport: "football",
        league: "La Liga",
        leagueId: "LaLiga",
        homeTeam: "Barcelona",
        homeCode: "BAR",
        homeColor: "#004d98",
        awayTeam: "Real Madrid",
        awayCode: "RMA",
        awayColor: "#ffffff",
        homeScore: 0,
        awayScore: 0,
        halftimeScore: "HT 0-0",
        time: "71'",
        status: "live",
        stats: { possession: 42, shots: 6, shotsOnTarget: 2, corners: 3, fouls: 9, yellowCards: 2, redCards: 0 },
        scorers: { home: [], away: [] }
    },
    {
        id: "fb-4",
        sport: "football",
        league: "Serie A",
        leagueId: "SerieA",
        homeTeam: "AC Milan",
        homeCode: "MIL",
        homeColor: "#fb090b",
        awayTeam: "Inter Milan",
        awayCode: "INT",
        awayColor: "#0066b2",
        homeScore: 1,
        awayScore: 1,
        halftimeScore: "HT 1-0",
        time: "65'",
        status: "live",
        stats: { possession: 47, shots: 7, shotsOnTarget: 3, corners: 4, fouls: 11, yellowCards: 3, redCards: 0 },
        scorers: { home: ["34' Rafael Leão"], away: ["55' Lautaro Martínez"] }
    },
    {
        id: "fb-5",
        sport: "football",
        league: "Ligue 1",
        leagueId: "Ligue1",
        homeTeam: "Paris Saint-Germain",
        homeCode: "PSG",
        homeColor: "#002c59",
        awayTeam: "Lille",
        awayCode: "LIL",
        awayColor: "#e01e22",
        homeScore: 2,
        awayScore: 0,
        halftimeScore: "HT 2-0",
        time: "70'",
        status: "live",
        stats: { possession: 58, shots: 9, shotsOnTarget: 4, corners: 5, fouls: 6, yellowCards: 0, redCards: 0 },
        scorers: { home: ["18' Kylian Mbappé", "29' O. Dembélé"], away: [] }
    },
    {
        id: "fb-6",
        sport: "football",
        league: "Bundesliga",
        leagueId: "Bundesliga",
        homeTeam: "Bayern Munich",
        homeCode: "FCB",
        homeColor: "#dc052d",
        awayTeam: "Leverkusen",
        awayCode: "LEV",
        awayColor: "#e32219",
        homeScore: 1,
        awayScore: 0,
        halftimeScore: "HT 1-0",
        time: "71'",
        status: "live",
        stats: { possession: 51, shots: 8, shotsOnTarget: 3, corners: 3, fouls: 8, yellowCards: 2, redCards: 0 },
        scorers: { home: ["41' Harry Kane"], away: [] }
    }
];

const MATCH_LEAGUES = {
    // England
    "eng.1": "Premier League",
    "eng.2": "Championship",
    "eng.3": "League One",
    "eng.fa": "FA Cup",
    "eng.league_cup": "Carabao Cup",
    // Spain
    "esp.1": "La Liga",
    "esp.2": "LaLiga 2",
    "esp.copa_del_rey": "Copa del Rey",
    // Germany
    "ger.1": "Bundesliga",
    "ger.2": "2. Bundesliga",
    "ger.dfb_pokal": "DFB-Pokal",
    // Italy
    "ita.1": "Serie A",
    "ita.2": "Serie B",
    "ita.coppa_italia": "Coppa Italia",
    // France
    "fra.1": "Ligue 1",
    "fra.2": "Ligue 2",
    "fra.coupe_de_france": "Coupe de France",
    // Other Europe
    "ned.1": "Eredivisie",
    "ned.2": "Eerste Divisie",
    "por.1": "Primeira Liga",
    "bel.1": "Belgian Pro League",
    "tur.1": "Süper Lig",
    "sco.1": "Scottish Premiership",
    "sui.1": "Swiss Super League",
    "aut.1": "Austrian Bundesliga",
    "den.1": "Danish Superliga",
    "swe.1": "Allsvenskan",
    "nor.1": "Eliteserien",
    "gre.1": "Super League Greece",
    "rus.1": "Russian Premier League",
    "ukr.1": "Ukrainian Premier League",
    // Americas
    "usa.1": "Major League Soccer",
    "usa.nwsl": "NWSL",
    "mex.1": "Liga MX",
    "bra.1": "Brasileirão Série A",
    "arg.1": "Liga Profesional",
    "col.1": "Primera A Colombia",
    "chi.1": "Chile Primera",
    // Asia / Middle East / Oceania
    "jpn.1": "J1 League",
    "aus.1": "A-League",
    "ind.1": "Indian Super League",
    "sau.1": "Saudi Pro League",
    // UEFA / FIFA / Continental
    "uefa.champions": "UEFA Champions League",
    "uefa.europa": "UEFA Europa League",
    "uefa.europa.conf": "Europa Conference League",
    "uefa.champions_qual": "UCL Qualifiers",
    "uefa.europa_qual": "UEL Qualifiers",
    "uefa.euro": "UEFA Euro",
    "uefa.euroq": "Euro Qualifiers",
    "uefa.nations": "UEFA Nations League",
    "uefa.wchampions": "Women's Champions League",
    "fifa.world": "FIFA World Cup",
    "fifa.worldq": "World Cup Qualifiers",
    "fifa.wworld": "Women's World Cup",
    "fifa.club_world": "Club World Cup",
    "conmebol.libertadores": "Copa Libertadores",
    "conmebol.sudamericana": "Copa Sudamericana",
    "concacaf.champions": "CONCACAF Champions Cup",
    "afc.champions": "AFC Champions League"
};

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

function getLeagueName(slug) {
    if (!slug) return "Football";
    const clean = cleanLeagueSlug(slug);
    return MATCH_LEAGUES[clean] || MATCH_LEAGUES[slug] || "Football";
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
function extractStandingsEntries(node, out) {
    if (!node || typeof node !== "object") return out;
    if (node.standings && Array.isArray(node.standings.entries)) {
        out.push(...node.standings.entries);
        return out;
    }
    if (Array.isArray(node.children)) node.children.forEach((c) => extractStandingsEntries(c, out));
    return out;
}

function parseTable(data) {
    if (!data || typeof data !== "object") return [];
    const entries = extractStandingsEntries(data, []);
    return entries.map((entry, i) => {
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

// Render 1X2, Over/Under and BTTS capsules — same helper as app.js, kept inline so
// match.js remains self-contained (it's loaded standalone on match.html).
function oddsCapsulesHTML(odds, homeCode, awayCode) {
    if (!odds) return "";
    const h = americanToDecimal(odds.home), d = americanToDecimal(odds.draw), a = americanToDecimal(odds.away);
    const parts = [];
    if (h && d && a) {
        parts.push(`<span class="stat-capsule odds-caps odds-1x2" title="1X2 (${homeCode||"Home"} · Draw · ${awayCode||"Away"}) via ${odds.provider||"odds"}">🎲 ${h.toFixed(2)} · ${d.toFixed(2)} · ${a.toFixed(2)}</span>`);
    } else if (odds.details) {
        parts.push(`<span class="stat-capsule odds-caps">🎲 ${esc(odds.details)}</span>`);
    }
    if (odds.overUnder != null && odds.overUnder !== "") {
        const over = odds.overOdds ? odds.overOdds.toFixed(2) : null;
        const under = odds.underOdds ? odds.underOdds.toFixed(2) : null;
        const label = over && under ? `O/U ${odds.overUnder}  ↑${over} ↓${under}` : `O/U ${odds.overUnder}`;
        parts.push(`<span class="stat-capsule odds-caps odds-ou" title="Total goals Over/Under">📈 ${label}</span>`);
    }
    if (odds.bttsYes && odds.bttsNo) {
        parts.push(`<span class="stat-capsule odds-caps odds-btts" title="Both Teams To Score — Yes/No">⚔️ BTTS ${odds.bttsYes.toFixed(2)} / ${odds.bttsNo.toFixed(2)}</span>`);
    }
    return parts.join("");
}
function icsDateUTC(d) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// --- Fetch helpers (direct ESPN, same pattern as preview/report) ---

async function fetchSummary(slug, id) {
    const clean = cleanLeagueSlug(slug);
    const path = `/apis/site/v2/sports/soccer/${clean}/summary?event=${id}`;
    const urls = [
        `https://site.web.api.espn.com${path}`,
        `https://site.api.espn.com${path}`
    ];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            return await r.json();
        } catch (e) { /* next */ }
    }
    return null;
}

async function fetchEvent(slug, id, dateYmd) {
    const clean = cleanLeagueSlug(slug);
    const path = `/apis/site/v2/sports/soccer/${clean}/scoreboard`;
    const hosts = [
        "https://site.web.api.espn.com",
        "https://site.api.espn.com"
    ];
    const queryVariants = [];
    if (dateYmd) {
        queryVariants.push(`?dates=${dateYmd}&limit=100`);
        try {
            const y = parseInt(dateYmd.slice(0, 4), 10);
            const m = parseInt(dateYmd.slice(4, 6), 10) - 1;
            const d = parseInt(dateYmd.slice(6, 8), 10);
            const prev = new Date(Date.UTC(y, m, d - 1));
            const next = new Date(Date.UTC(y, m, d + 1));
            const p2 = (n) => String(n).padStart(2, "0");
            queryVariants.push(`?dates=${prev.getUTCFullYear()}${p2(prev.getUTCMonth() + 1)}${p2(prev.getUTCDate())}&limit=100`);
            queryVariants.push(`?dates=${next.getUTCFullYear()}${p2(next.getUTCMonth() + 1)}${p2(next.getUTCDate())}&limit=100`);
        } catch (e) {}
    }
    queryVariants.push("?limit=100");

    for (const host of hosts) {
        for (const q of queryVariants) {
            try {
                const r = await fetch(`${host}${path}${q}`);
                if (!r.ok) continue;
                const j = await r.json();
                const ev = j && Array.isArray(j.events) && j.events.find((x) => String(x.id) === String(id));
                if (ev) return ev;
            } catch (e) { /* next */ }
        }
    }

    // Direct event summary fallback if scoreboard query missed it
    for (const host of hosts) {
        try {
            const r = await fetch(`${host}/apis/site/v2/sports/soccer/${clean}/summary?event=${id}`);
            if (!r.ok) continue;
            const s = await r.json();
            if (s && s.header && Array.isArray(s.header.competitions) && s.header.competitions[0]) {
                const comp = s.header.competitions[0];
                return {
                    id: String(id),
                    date: comp.date || s.header.date || new Date().toISOString(),
                    name: s.header.season && s.header.season.name ? `${comp.competitors?.[0]?.team?.displayName} vs ${comp.competitors?.[1]?.team?.displayName}` : "Match",
                    competitions: [comp],
                    status: comp.status || { type: { state: "post", completed: true } }
                };
            }
        } catch (e) {}
    }

    return null;
}
async function fetchTable(slug) {
    const clean = cleanLeagueSlug(slug);
    const path = `/apis/v2/sports/soccer/${clean}/standings?region=us&lang=en&contentorigin=espn`;
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
    if (canvas && typeof drawShareCard === "function") {
        drawShareCard(canvas, {
            kicker: `${leagueName} · ${ev.status && ev.status.type && ev.status.type.state === "in" ? "LIVE" : (ev.status && ev.status.type.completed ? "FULL TIME" : "UPCOMING")}`.toUpperCase(),
            home: H.name, away: A.name,
            middle: score,
            sub: (ev.venue || when || "").slice(0, 80),
            tag: ev.status && ev.status.type && ev.status.type.state === "in" ? "LIVE" : "MATCH"
        });
    }
    const root = document.getElementById("share-row");
    if (root && typeof wireShareButtons === "function") {
        wireShareButtons(root, {
            title: `${H.name} ${hs != null ? hs + "–" + as : "vs"} ${A.name}`,
            text: `${H.name} vs ${A.name} — ${leagueName}`,
            url: window.location.href,
            filename: (typeof shareFileName === "function") ? shareFileName(`match-${H.code}-${A.code}`) : `match-${H.code}-${A.code}.png`
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

function matchHighlightUrl(homeTeam, awayTeam, leagueName) {
    const q = `${homeTeam || ""} vs ${awayTeam || ""} highlights ${leagueName || ""}`.trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
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
    const simSlug = cleanLeagueSlug(m.leagueSlug || m.leagueId || "eng.1");
    const simId = m.espnEventId || m.id || "";
    const isSimPre = (!isLive && hs == null && as == null) || m.status === "scheduled";
    const isSimPost = (!isLive && m.status === "finished") || (m.time === "FT" || String(m.time).includes("FT"));
    const simPreviewBtn = isSimPre
        ? `<a class="btn btn-login btn-sm" href="preview.html?league=${esc(simSlug)}&id=${esc(simId)}">📰 Preview</a>`
        : "";
    const simReportBtn = isSimPost
        ? `<a class="btn btn-login btn-sm" href="report.html?league=${esc(simSlug)}&id=${esc(simId)}">📝 Report</a>`
        : "";
    box.innerHTML = `<span class="league-tag">${esc(m.league || "Football")}</span> ${isLive ? `<span class="league-tag" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.3);">● LIVE · ${esc(m.time || "")}</span>` : `<span class="league-tag">${esc(m.time || "")}</span>`}
        <h1 style="margin-top:10px;">${esc(H.name)} vs ${esc(A.name)}</h1>
        <div class="match-hero"><div class="match-hero-top">${logoImg(H.logo, "match-hero-logo")}<span class="match-hero-name">${esc(H.name)}</span><span class="match-hero-score">${esc(hs)} – ${esc(as)}</span><span class="match-hero-name">${esc(A.name)}</span>${logoImg(A.logo, "match-hero-logo")}</div><div class="match-hero-sub">${esc(m.league || "")} · ${esc(m.time || "")}</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">
            <a class="btn btn-login btn-sm highlight-btn" href="${matchHighlightUrl(H.name, A.name, m.league)}" target="_blank" rel="noopener">🎥 Highlights</a>
            ${simPreviewBtn}
            ${simReportBtn}
            <button class="btn btn-login btn-sm" id="match-share-btn">Share</button>
            <button class="btn btn-login btn-sm" id="match-ics-btn">Add to calendar</button>
            <a class="btn btn-login btn-sm" href="standings.html">Table</a>
        </div>
        <div class="pred-subrow"><h2 class="pred-sub">Scorers</h2></div>
        <div class="form-cols"><div class="form-col"><h3>${logoImg(H.logo, "pred-logo")} ${esc(H.name)}</h3>${scorersH.length ? scorersH.map((s) => `<div class="form-game">⚽ ${esc(s)}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div><div class="form-col"><h3>${logoImg(A.logo, "pred-logo")} ${esc(A.name)}</h3>${scorersA.length ? scorersA.map((s) => `<div class="form-game">⚽ ${esc(s)}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div></div>
        <div class="pred-subrow"><h2 class="pred-sub">Match Statistics</h2></div>
        <div class="stats-bars-container">${statsBarsHTML(H, A, { poss: sh.possession, shots: sh.shots, onTarget: sh.shotsOnTarget, corners: sh.corners, fouls: sh.fouls, yellows: sh.yellowCards, reds: sh.redCards }, { poss: sa.possession, shots: sa.shots, onTarget: sa.shotsOnTarget, corners: sa.corners, fouls: sa.fouls, yellows: sa.yellowCards, reds: sa.redCards })}</div>
        <p class="preview-note">This is a simulated match from Simulation Mode. Switch to Live API Mode on the homepage for real ESPN data.</p>
        <p class="preview-note"><a href="index.html" style="color:var(--primary);">&larr; Back to Scores</a></p>
        ${typeof shareSectionHTML === "function" ? shareSectionHTML() : ""}`;
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

    // Check if this is a known simulation match by ID
    if (id && (id.startsWith("fb-") || id.startsWith("bb-") || id.startsWith("tn-"))) {
        const mock = MOCK_MATCHES.find(m => m.id === id);
        if (mock) {
            document.title = `${mock.homeTeam} vs ${mock.awayTeam} — ScoreHub`;
            renderSimMatch(mock);
            return;
        }
    }

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
        if (MOCK_MATCHES && MOCK_MATCHES[0]) {
            document.title = `${MOCK_MATCHES[0].homeTeam} vs ${MOCK_MATCHES[0].awayTeam} — ScoreHub`;
            renderSimMatch(MOCK_MATCHES[0]);
            return;
        }
        box.innerHTML = `<h1>Match not found</h1><div class="window-strip">Open a match from <a href="index.html">Scores</a> — click any match card or ticker item to view its own page.</div>`;
        return;
    }

    const cleanSlug = cleanLeagueSlug(league);
    const leagueName = getLeagueName(cleanSlug);
    box.innerHTML = `<p class="loading-note">Loading ${esc(leagueName)} match…</p>`;
    const ev = await fetchEvent(cleanSlug, id, date);
    if (!ev) {
        // Fallback 1: check sessionStorage for the match that was clicked on homepage
        try {
            const raw = sessionStorage.getItem("scorehub-match");
            if (raw) {
                const m = JSON.parse(raw);
                if (m && (String(m.id) === String(id) || String(m.espnEventId) === String(id) || (m.homeTeam && m.awayTeam))) {
                    document.title = `${m.homeTeam} vs ${m.awayTeam} — ScoreHub`;
                    renderSimMatch(m);
                    return;
                }
            }
        } catch (e) {}

        // Fallback 2: check MOCK_MATCHES
        const mock = MOCK_MATCHES.find(m => m.id === id);
        if (mock) {
            document.title = `${mock.homeTeam} vs ${mock.awayTeam} — ScoreHub`;
            renderSimMatch(mock);
            return;
        }

        box.innerHTML = `<h1>Match unavailable</h1><div class="window-strip">Couldn't connect to the live match feed right now. <button class="btn btn-login btn-sm" id="match-retry-btn" style="margin-left:8px;">Retry</button> or return to <a href="index.html">Scores</a>.</div>`;
        const retryBtn = document.getElementById("match-retry-btn");
        if (retryBtn) retryBtn.addEventListener("click", bootMatch);
        return;
    }
    const comp = (ev.competitions && ev.competitions[0]) || {};
    const cs = comp.competitors || [];
    const hc = cs.find((c) => c.homeAway === "home") || {};
    const ac = cs.find((c) => c.homeAway === "away") || {};
    const H = {
        name: (hc.team && (hc.team.displayName || hc.team.shortDisplayName)) || "Home",
        code: (hc.team && (hc.team.abbreviation || hc.team.shortDisplayName)) || "HOM",
        abbreviation: (hc.team && (hc.team.abbreviation || hc.team.shortDisplayName)) || "HOM",
        logo: teamLogoURL(hc.team)
    };
    const A = {
        name: (ac.team && (ac.team.displayName || ac.team.shortDisplayName)) || "Away",
        code: (ac.team && (ac.team.abbreviation || ac.team.shortDisplayName)) || "AWY",
        abbreviation: (ac.team && (ac.team.abbreviation || ac.team.shortDisplayName)) || "AWY",
        logo: teamLogoURL(ac.team)
    };
    const hs = hc.score != null ? parseInt(hc.score, 10) : null;
    const as = ac.score != null ? parseInt(ac.score, 10) : null;
    const st = (ev.status && ev.status.type) || {};
    // Resolved before the SEO block — a later `const` reference would throw (TDZ)
    // and the catch below would silently drop every SEO tag on this page.
    const venueFull = (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "";
    const venueCity = (comp.venue && comp.venue.address && comp.venue.address.city) || "";
    const venue = [venueFull, venueCity].filter(Boolean).join(", ");
    try { 
        const seoTitle = `${H.name} ${hs != null ? hs + "–" + as + " " : "vs "}${A.name} Live Score - ${leagueName} | ScoreHub`;
        document.title = seoTitle;
        if (window.SEO) {
            const isLive = st.state === "in";
            SEO.setTitle(seoTitle);
            SEO.setDescription(`${H.name} vs ${A.name} live score ${hs != null ? hs + '-' + as : ''} in ${leagueName}. Kickoff ${formatKickoffLong(ev.date)}${venue ? ' at ' + venue : ''}. Stats, commentary, timeline, lineups.`);
            SEO.setCanonical(window.location.href.split('#')[0]);
            SEO.setImage(H.logo || A.logo || '');
            SEO.setKeywords([H.name, A.name, leagueName, 'live score', 'stats', 'lineups', 'ScoreHub']);
            SEO.breadcrumb([
                { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
                { name: leagueName, url: `https://livematches.hyper.co.ke/standings.html?league=${league}` },
                { name: `${H.name} vs ${A.name}`, url: window.location.href.split('#')[0] }
            ]);
            SEO.sportsEvent({
                name: `${H.name} vs ${A.name}`,
                description: `${H.name} vs ${A.name} in ${leagueName}`,
                startDate: ev.date,
                venue: venue,
                league: leagueName,
                homeTeam: H.name,
                awayTeam: A.name,
                homeLogo: H.logo,
                awayLogo: A.logo,
                sport: 'Soccer',
                eventStatus: isLive ? 'https://schema.org/EventLive' : st.completed ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled'
            });
        }
    } catch (e) {}

    // Parallel fetches: summary + table
    let summary = null, table = [];
    try {
        const results = await Promise.allSettled([fetchSummary(league, id), fetchTable(league)]);
        if (results[0].status === "fulfilled") summary = results[0].value;
        if (results[1].status === "fulfilled") table = results[1].value;
    } catch (e) {}

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
    const rawOdds = Array.isArray(comp.odds) ? comp.odds.filter((o) => o) : [];
    if (rawOdds.length) {
        const primary = rawOdds.find((o) => o.homeTeamOdds || o.drawOdds || o.awayTeamOdds) || rawOdds[0];
        const pickML = (src, side) => {
            if (!src || !src[side]) return null;
            return src[side].moneyLine != null ? src[side].moneyLine
                 : src[side].odds != null ? src[side].odds : null;
        };
        odds = {
            provider: (primary.provider && primary.provider.name) || "ESPN BET",
            details: primary.details || "",
            spread: primary.spread != null ? primary.spread : null,
            overUnder: primary.overUnder != null ? primary.overUnder : null,
            overOdds: null, underOdds: null, bttsYes: null, bttsNo: null,
            home: pickML(primary, "homeTeamOdds"),
            draw: pickML(primary, "drawOdds"),
            away: pickML(primary, "awayTeamOdds"),
        };
        for (const o of rawOdds) {
            const det = (o.details || "").toLowerCase();
            const homeML = pickML(o, "homeTeamOdds");
            const awayML = pickML(o, "awayTeamOdds");
            if (o.overUnder != null && odds.overUnder == null) odds.overUnder = o.overUnder;
            if (/over[/ ]?under|total goals|o\/u/.test(det) || o.overUnder != null) {
                const h2 = americanToDecimal(homeML), a2 = americanToDecimal(awayML);
                if (/over/.test(det) || !odds.overOdds) odds.overOdds = odds.overOdds || h2 || a2;
                if (/under/.test(det)) odds.underOdds = odds.underOdds || a2 || h2;
                if (!odds.overOdds && h2) odds.overOdds = h2;
                if (!odds.underOdds && a2) odds.underOdds = a2;
            }
            if (/both teams? to score|btts|yes\s*\/\s*no/.test(det)) {
                odds.bttsYes = odds.bttsYes || americanToDecimal(homeML);
                odds.bttsNo = odds.bttsNo || americanToDecimal(awayML);
            }
            if (!odds.home && homeML) odds.home = homeML;
            if (!odds.draw) odds.draw = pickML(o, "drawOdds");
            if (!odds.away && awayML) odds.away = awayML;
        }
    }

    const isPre = st.state === "pre";
    const isLive = st.state === "in";
    const isPost = st.completed || st.state === "post";

    // Preview/report links
    const ymd = ymdFromISO(ev.date);
    const previewHref = isPre ? `preview.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${ymd}` : "";
    const reportHref = isPost ? `report.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${ymd}` : "";

    // Commentary source
    const comm = summary ? (Array.isArray(summary.commentary) ? summary.commentary : (Array.isArray(summary.plays) ? summary.plays : [])) : [];
    const lineups = lineupsFromSummary(summary);

    box.innerHTML = `<div class="pred-meta"><span class="league-tag">${esc(leagueName)}</span>${statusPill(ev)}${broadcast ? `<span>📺 ${esc(broadcast)}</span>` : ""}${oddsCapsulesHTML(odds, H.code, A.code)}</div>
        <h1 style="margin-top:10px;">${esc(H.name)} vs ${esc(A.name)}</h1>
        <p class="legal-updated">${esc(formatKickoffLong(ev.date))}${venue ? ` · ${esc(venue)}` : ""}${posLine ? ` · ${esc(posLine)}` : ""}</p>
        <div class="match-hero"><div class="match-hero-top">${logoImg(H.logo, "match-hero-logo")}<span class="match-hero-name">${esc(H.name)}</span><span class="match-hero-score">${isPre ? "vs" : `${hs != null ? hs : "–"} – ${as != null ? as : "–"}`}</span><span class="match-hero-name">${esc(A.name)}</span>${logoImg(A.logo, "match-hero-logo")}</div></div>
        <div class="form-cols"><div class="form-col"><h3>${logoImg(H.logo, "pred-logo")} ${esc(H.name)}</h3>${scorersH.length ? scorersH.map((g) => `<div class="form-game">⚽ ${esc(g.display)} ${esc(g.scorer)}${g.pen ? " (P)" : g.og ? " (OG)" : ""}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div><div class="form-col"><h3>${logoImg(A.logo, "pred-logo")} ${esc(A.name)}</h3>${scorersA.length ? scorersA.map((g) => `<div class="form-game">⚽ ${esc(g.display)} ${esc(g.scorer)}${g.pen ? " (P)" : g.og ? " (OG)" : ""}</div>`).join("") : `<p class="loading-note" style="padding:4px 0;">No goals yet.</p>`}</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">
            ${previewHref ? `<a class="btn btn-login btn-sm" href="${previewHref}">📰 Preview</a>` : ""}
            ${reportHref ? `<a class="btn btn-login btn-sm" href="${reportHref}">📝 Report</a>` : ""}
            ${(isPost || st.completed) ? `<a class="btn btn-login btn-sm highlight-btn" href="${matchHighlightUrl(H.name, A.name, leagueName)}" target="_blank" rel="noopener">🎥 Highlights</a>` : ""}
            <button class="btn btn-login btn-sm" id="match-share-btn">Share</button>
            <button class="btn btn-login btn-sm" id="match-ics-btn">Add to calendar</button>
            <a class="btn btn-login btn-sm" href="standings.html?league=${esc(cleanSlug)}">Table</a>
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

        <p class="preview-note">Data: ESPN. ${isLive ? "This page auto-refreshes every 60 seconds while live." : ""} ${previewHref ? `<a href="${previewHref}" style="color:var(--primary);">Read preview →</a>` : ""} ${reportHref ? `<a href="${reportHref}" style="color:var(--primary);">Read report →</a>` : ""} ${(isPost || st.completed) ? `<a href="${matchHighlightUrl(H.name, A.name, leagueName)}" target="_blank" rel="noopener" style="color:#ff4b4b;">Watch highlights ↗</a>` : ""}</p>
        ${typeof shareSectionHTML === "function" ? shareSectionHTML() : ""}
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

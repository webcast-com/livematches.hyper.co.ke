/* ScoreHub Match Preview — original auto-generated previews built from
   fixtures, league tables and recent form. No borrowed prose, all numbers.
   Pure helpers (ord, hashStr, pickSeeded, normTeamName, teamMatchesRow,
   matchTeamRow, sameClub, lastFormDates, summarizeForm, formPoints,
   oddsFavourite, countdownText, buildPreview) are top-level and
   side-effect free for testability. */

const PREVIEW_LEAGUES = {
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
    "ksa.1": "Saudi Pro League",
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
    "fifa.wwc": "Women's World Cup",
    "fifa.cwc": "Club World Cup",
    "conmebol.libertadores": "Copa Libertadores",
    "conmebol.sudamericana": "Copa Sudamericana",
    "concacaf.champions": "CONCACAF Champions Cup",
    "afc.champions": "AFC Champions League",
    "eng.4": "League Two",
    "eng.5": "National League",
    "eng.w.1": "Women's Super League",
    "esp.w.1": "Liga F",
    "fra.w.1": "Première Ligue",
    "ned.w.1": "Vrouwen Eredivisie",
    "aus.w.1": "A-League Women",
    "irl.1": "League of Ireland Premier Division",
    "cyp.1": "Cypriot First Division",
    "rou.1": "Liga I Romania",
    "per.1": "Liga 1 de Perú",
    "uru.1": "Liga AUF Uruguaya",
    "par.1": "Paraguayan Primera División",
    "ecu.1": "LigaPro Ecuador",
    "bol.1": "Bolivian Liga Profesional",
    "ven.1": "Venezuelan Primera División",
    "bra.2": "Brasileirão Série B",
    "usa.usl.1": "USL Championship",
    "rsa.1": "South African Premiership",
    "nga.1": "Nigeria Professional League",
    "gha.1": "Ghana Premier League",
    "chn.1": "Chinese Super League",
    "tha.1": "Thai League 1",
    "mys.1": "Malaysia Super League",
    "idn.1": "Indonesia Super League",
    "fifa.friendly": "International Friendlies",
    "fifa.intercontinental_cup": "FIFA Intercontinental Cup",
    "fifa.world.u20": "FIFA U-20 World Cup",
    "fifa.world.u17": "FIFA U-17 World Cup",
    "fifa.olympics": "Men's Olympic Soccer",
    "fifa.w.olympics": "Women's Olympic Soccer",
    "fifa.worldq.uefa": "World Cup Qualifiers (UEFA)",
    "fifa.worldq.caf": "World Cup Qualifiers (CAF)",
    "fifa.worldq.afc": "World Cup Qualifiers (AFC)",
    "fifa.worldq.concacaf": "World Cup Qualifiers (Concacaf)",
    "fifa.worldq.conmebol": "World Cup Qualifiers (CONMEBOL)",
    "uefa.europa.conf_qual": "Conference League Qualifying",
    "uefa.super_cup": "UEFA Super Cup",
    "uefa.weuro": "Women's Euro",
    "uefa.euro_u21": "UEFA U-21 Championship",
    "uefa.w.nations": "Women's Nations League",
    "caf.nations": "Africa Cup of Nations",
    "caf.nations_qual": "AFCON Qualifiers",
    "caf.champions": "CAF Champions League",
    "caf.confed": "CAF Confederation Cup",
    "conmebol.america": "Copa América",
    "conmebol.recopa": "Recopa Sudamericana",
    "concacaf.gold": "CONCACAF Gold Cup",
    "concacaf.nations.league": "CONCACAF Nations League",
    "concacaf.leagues.cup": "Leagues Cup",
    "campeones.cup": "Campeones Cup",
    "afc.asian.cup": "AFC Asian Cup",
    "afc.cup": "AFC Champions League Two",
    "eng.charity": "Community Shield",
    "esp.super_cup": "Supercopa de España",
    "ger.super_cup": "DFL-Supercup",
    "ita.super_cup": "Supercoppa Italiana",
    "fra.super_cup": "Trophée des Champions",
    "ned.cup": "KNVB Beker",
    "por.taca.portugal": "Taça de Portugal",
    "sco.tennents": "Scottish Cup",
    "sco.cis": "Scottish League Cup",
    "bra.copa_do_brazil": "Copa do Brasil",
    "arg.copa": "Copa Argentina",
    "usa.open": "U.S. Open Cup",
    "ksa.kings.cup": "Saudi King's Cup",
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
    return PREVIEW_LEAGUES[clean] || PREVIEW_LEAGUES[slug] || "Football";
}

function simMatchToPreviewEvent(m) {
    if (!m) return null;
    const homeTeam = m.homeTeam || "Home";
    const awayTeam = m.awayTeam || "Away";
    const homeCode = m.homeCode || (homeTeam.length > 3 ? homeTeam.slice(0, 3).toUpperCase() : homeTeam);
    const awayCode = m.awayCode || (awayTeam.length > 3 ? awayTeam.slice(0, 3).toUpperCase() : awayTeam);
    const isLive = m.status === "live";
    const isPost = m.status === "finished";
    return {
        id: String(m.espnEventId || m.id || "sim"),
        date: m.date || new Date().toISOString(),
        name: `${homeTeam} vs ${awayTeam}`,
        competitions: [{
            id: String(m.espnEventId || m.id || "sim"),
            date: m.date || new Date().toISOString(),
            venue: { fullName: m.venue || "Stadium" },
            attendance: m.attendance || 45000,
            odds: m.odds ? [m.odds] : [],
            status: {
                type: {
                    state: isLive ? "in" : (isPost ? "post" : "pre"),
                    completed: isPost,
                    shortDetail: m.time || (isPost ? "FT" : "Upcoming")
                }
            },
            competitors: [
                {
                    homeAway: "home",
                    score: m.homeScore != null ? String(m.homeScore) : "",
                    team: {
                        displayName: homeTeam,
                        shortDisplayName: homeTeam,
                        abbreviation: homeCode,
                        logos: m.homeLogo ? [{ href: m.homeLogo }] : []
                    },
                    leaders: m.topScorers && m.topScorers.home ? [{
                        name: "goals",
                        leaders: [{
                            athlete: { displayName: m.topScorers.home.name || m.topScorers.home },
                            displayValue: String(m.topScorers.home.goals || 12)
                        }]
                    }] : []
                },
                {
                    homeAway: "away",
                    score: m.awayScore != null ? String(m.awayScore) : "",
                    team: {
                        displayName: awayTeam,
                        shortDisplayName: awayTeam,
                        abbreviation: awayCode,
                        logos: m.awayLogo ? [{ href: m.awayLogo }] : []
                    },
                    leaders: m.topScorers && m.topScorers.away ? [{
                        name: "goals",
                        leaders: [{
                            athlete: { displayName: m.topScorers.away.name || m.topScorers.away },
                            displayValue: String(m.topScorers.away.goals || 10)
                        }]
                    }] : []
                }
            ]
        }],
        status: {
            type: {
                state: isLive ? "in" : (isPost ? "post" : "pre"),
                completed: isPost,
                shortDetail: m.time || (isPost ? "FT" : "Upcoming")
            }
        }
    };
}

function ymdFromISO(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`;
}

function ord(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function hashStr(s) {
    let h = 0;
    const str = String(s == null ? "" : s);
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
}

function pickSeeded(arr, seed) {
    if (!arr || !arr.length) return "";
    return arr[hashStr(seed) % arr.length];
}

function normTeamName(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function teamMatchesRow(t, row) {
    const n = normTeamName(t.name), rn = normTeamName(row.team);
    if (n && n === rn) return true;
    const c = normTeamName(t.code), rc = normTeamName(row.abbrev);
    if (c && c === rc) return true;
    if (n && rn && n.length > 4 && rn.length > 4 && (rn.indexOf(n) !== -1 || n.indexOf(rn) !== -1)) return true;
    return false;
}

function matchTeamRow(t, rows) {
    for (const r of (rows || [])) {
        if (teamMatchesRow(t, r)) return r;
    }
    return null;
}

function sameClub(a, b) {
    const an = normTeamName(a.name), bn = normTeamName(b.name);
    if (an && an === bn) return true;
    const ac = normTeamName(a.code), bc = normTeamName(b.code);
    if (ac && ac === bc) return true;
    return false;
}

function ymdLocal(d) {
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}

function lastFormDates(fromDate, sats, weds) {
    const out = [];
    const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    d.setDate(d.getDate() - 1);
    let s = 0, w = 0, guard = 0;
    while ((s < sats || w < weds) && guard++ < 150) {
        const day = d.getDay();
        if (day === 6 && s < sats) { out.push(ymdLocal(d)); s++; }
        else if (day === 3 && w < weds) { out.push(ymdLocal(d)); w++; }
        d.setDate(d.getDate() - 1);
    }
    return out;
}

function summarizeForm(form) {
    if (!form || !form.length) return "no recent results on record";
    const last5 = form.slice(0, 5);
    const w = last5.filter((g) => g.res === "W").length;
    const dd = last5.filter((g) => g.res === "D").length;
    const l = last5.filter((g) => g.res === "L").length;
    const n = last5.length;
    const tally = `(W${w} D${dd} L${l})`;
    if (l === 0) return n >= 5 ? `unbeaten in five ${tally}` : `unbeaten in ${n} ${tally}`;
    if (w === 0) return `winless in ${n} ${tally}`;
    return `${tally.replace("(", "").replace(")", "")} in their last ${n}`;
}

function formPoints(form, n) {
    return (form || []).slice(0, n || 5).reduce((s, g) => s + (g.res === "W" ? 3 : g.res === "D" ? 1 : 0), 0);
}

function oddsFavourite(odds) {
    if (!odds) return null;
    const lines = { H: odds.home, D: odds.draw, A: odds.away };
    let best = null, bestVal = 0;
    for (const k of ["H", "D", "A"]) {
        const v = parseFloat(lines[k]);
        if (isNaN(v)) continue;
        if (best === null || v < bestVal) { best = k; bestVal = v; }
    }
    return best;
}

function countdownText(iso, nowMs) {
    const ms = new Date(iso).getTime() - nowMs;
    if (isNaN(ms) || ms <= 0) return "kicking off soon";
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `in ${mins} minute${mins === 1 ? "" : "s"}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.floor(hours / 24);
    return `in ${days} day${days === 1 ? "" : "s"}`;
}

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function previewStat(entry, names) {
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

function previewTeamLogo(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
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

function parsePreviewTable(data) {
    if (!data || typeof data !== "object") return [];
    const entries = extractStandingsEntries(data, []);
    const rows = entries.map((entry, i) => {
        const team = entry.team || {};
        return {
            rank: previewStat(entry, ["rank"]) || (i + 1),
            team: team.displayName || team.shortDisplayName || team.name || "?",
            abbrev: team.abbreviation || "",
            played: previewStat(entry, ["gamesPlayed", "played"]),
            won: previewStat(entry, ["wins", "won"]),
            drawn: previewStat(entry, ["ties", "draws", "drawn"]),
            lost: previewStat(entry, ["losses", "lost"]),
            gf: previewStat(entry, ["pointsFor", "goalsFor", "goals"]),
            ga: previewStat(entry, ["pointsAgainst", "goalsAgainst"]),
            gd: previewStat(entry, ["pointDifferential", "goalDifferential", "differential"]),
            pts: previewStat(entry, ["points", "pts"])
        };
    });
    rows.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    return rows;
}

// --- Narrative (deterministic: same match always reads the same) ---

function sideParagraph(side, venueWord, seed) {
    // side: {name, code, pos, pts, played, w, d, l, gf, ga, form[], ha}
    const bits = [];
    const fsum = summarizeForm(side.form);
    bits.push(pickSeeded([
        `${side.name} come into this ${fsum}.`,
        `${side.name} arrive ${fsum}.`,
        tf("preview.formreads", { f: fsum, n: side.name })
    ], seed + side.code + "form"));
    if (side.played > 0) {
        const gpg = (side.gf / side.played).toFixed(1);
        const cpg = (side.ga / side.played).toFixed(1);
        bits.push(pickSeeded([
            `They have scored ${side.gf} in ${side.played} league games (${gpg} per game) and conceded ${side.ga} (${cpg} per game).`,
            `Across ${side.played} league games they average ${gpg} scored and ${cpg} conceded.`
        ], seed + side.code + "goals"));
    } else if (side.form.length >= 3) {
        const g = side.form.slice(0, 5);
        const gf = g.reduce((s, x) => s + x.gf, 0), ga = g.reduce((s, x) => s + x.ga, 0);
        bits.push(`Their last ${g.length} have produced ${gf} goals scored and ${ga} conceded.`);
    }
    const split = side.form.filter((g) => g.ha === side.ha);
    if (split.length >= 2) {
        const wins = split.filter((g) => g.res === "W").length;
        const where = side.ha === "H" ? `at ${venueWord}` : "on the road";
        bits.push(pickSeeded([
            `They have won ${wins} of their last ${split.length} ${where}.`,
            `${where[0].toUpperCase() + where.slice(1)} form: ${wins} wins from the last ${split.length}.`
        ], seed + side.code + "split"));
    }
    const cs = side.form.slice(0, 5).filter((g) => g.ga === 0).length;
    if (cs >= 2 && side.form.length >= 3) {
        bits.push(`${t("preview.def1")}${cs}${t("preview.def2")}`);
    }
    return bits.join(" ");
}

function buildVerdict(h, a) {
    const hf = formPoints(h.form), af = formPoints(a.form);
    const haveForm = h.form.length >= 2 && a.form.length >= 2;
    const haveTable = !!(h.pos && a.pos);
    if (!haveForm && !haveTable) {
        return { pick: t("preview.close"), confidence: t("preview.nodataword"), reason: t("preview.nodatareason") };
    }
    const posEdge = haveTable ? (a.pos - h.pos) * 0.6 : 0;
    const homeScore = (haveForm ? hf : 7) + 1.5 + posEdge;
    const awayScore = (haveForm ? af : 7);
    const diff = homeScore - awayScore;
    let pick, conf;
    if (diff >= 4) { pick = `${h.name}${t("preview.win")}`; conf = t("preview.strong"); }
    else if (diff >= 1.5) { pick = `${h.name}${t("preview.win")}`; conf = t("preview.moderate"); }
    else if (diff <= -3) { pick = `${a.name}${t("preview.win")}`; conf = diff <= -5 ? t("preview.strong") : t("preview.moderate"); }
    else { pick = t("preview.draw"); conf = t("preview.lean"); }
    const reasons = [];
    if (haveForm) reasons.push(tf("preview.reason", { h: h.code, p: hf, a: a.code, q: af }));
    if (haveTable) {
        reasons.push(h.pos === a.pos
            ? `they sit level in the table`
            : `${tf("preview.higher", { c: h.pos < a.pos ? h.code : a.code, a: ord(h.pos), b: ord(a.pos) })}`);
    }
    if (pick.indexOf(h.name) === 0) reasons.push("home advantage tips it");
    return { pick, confidence: conf, reason: reasons.length ? reasons.join(", ") + "." : "On the balance of the numbers." };
}

function buildPreview(input) {
    // input: {seed, leagueName, venue, home:{...}, away:{...}, oddsFav}
    const h = input.home, a = input.away;
    const seed = input.seed || (h.code + a.code);
    const headline = pickSeeded([
        `${h.name} vs ${a.name}: ${input.leagueName} preview`,
        `${h.name} host ${a.name} in the ${input.leagueName}`,
        `${a.name} travel to ${h.name} — ${input.leagueName} preview`
    ], seed + "h");
    let standfirst;
    if (h.pos && a.pos) {
        const gap = Math.abs(h.pts - a.pts);
        const gapTxt = gap === 0 ? `level on ${h.pts} points` : `${gap} point${gap === 1 ? "" : "s"} between them`;
        standfirst = pickSeeded([
            `${ord(h.pos)} hosts ${ord(a.pos)} — ${gapTxt}.`,
            `${h.name} (${ord(h.pos)}) welcome ${a.name} (${ord(a.pos)}), with ${gapTxt}.`
        ], seed + "s");
    } else if (h.pos || a.pos) {
        const t = h.pos ? h : a;
        standfirst = `${t.name} sit ${ord(t.pos)} on ${t.pts} points.`;
    } else {
        standfirst = `Two sides meet${input.venue ? ` at ${input.venue}` : ""} — table data is unavailable, so this one is all about form.`;
    }
    const venueWord = input.venueShort || "home";
    const paragraphs = [
        sideParagraph({ ...h, ha: "H" }, venueWord, seed + "h"),
        sideParagraph({ ...a, ha: "A" }, venueWord, seed + "a")
    ];
    const watch = [];
    if (h.scorer) watch.push(`${h.scorer.name} (${h.scorer.goals} goal${h.scorer.goals === 1 ? "" : "s"}) leads the line for ${h.name}`);
    if (a.scorer) watch.push(`${a.scorer.name} (${a.scorer.goals} goal${a.scorer.goals === 1 ? "" : "s"}) for ${a.name}`);
    if (input.oddsFav === "H") watch.push(`bookmakers make ${h.name} favourites`);
    else if (input.oddsFav === "A") watch.push(`bookmakers make ${a.name} favourites`);
    else if (input.oddsFav === "D") watch.push("bookmakers can barely split them");
    if (watch.length) paragraphs.push("Players to watch: " + watch.join("; ") + ".");
    return { headline, standfirst, paragraphs, verdict: buildVerdict(h, a) };
}

// --- Data loading ---

async function fetchPreviewEvent(slug, id, dateYmd) {
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
                    status: comp.status || { type: { state: "pre" } }
                };
            }
        } catch (e) {}
    }

    return null;
}

async function fetchPreviewTable(slug) {
    const clean = cleanLeagueSlug(slug);
    const path = `/apis/v2/sports/soccer/${clean}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = [
        `https://site.web.api.espn.com${path}`,
        `https://site.api.espn.com${path}`
    ];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const rows = parsePreviewTable(await r.json());
            if (rows.length) return rows;
        } catch (e) { /* next mirror */ }
    }
    return [];
}

async function fetchFormEvents(slug, dates) {
    const clean = cleanLeagueSlug(slug);
    const seen = new Set();
    const out = [];
    const results = await Promise.allSettled(dates.map((d) =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${clean}/scoreboard?dates=${d}&limit=100`).then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        })
    ));
    for (const r of results) {
        if (r.status !== "fulfilled" || !r.value || !Array.isArray(r.value.events)) continue;
        for (const ev of r.value.events) {
            if (!ev || seen.has(String(ev.id))) continue;
            seen.add(String(ev.id));
            out.push(ev);
        }
    }
    return out;
}

function collectForm(events, team, maxN) {
    const games = [];
    for (const ev of (events || [])) {
        const st = (ev.status && ev.status.type) || {};
        if (!st.completed) continue;
        const comp = (ev.competitions && ev.competitions[0]) || {};
        const cs = comp.competitors || [];
        const mine = cs.find((c) => sameClub(
            { name: team.name, code: team.code },
            { name: c.team && (c.team.displayName || c.team.shortDisplayName), code: c.team && (c.team.abbreviation || "") }
        ));
        if (!mine) continue;
        const other = cs.find((c) => c !== mine) || {};
        const gf = parseInt(mine.score, 10), ga = parseInt(other.score, 10);
        if (isNaN(gf) || isNaN(ga)) continue;
        games.push({
            res: gf > ga ? "W" : gf === ga ? "D" : "L",
            gf, ga,
            opp: (other.team && (other.team.abbreviation || other.team.shortDisplayName)) || "OPP",
            oppName: (other.team && (other.team.displayName || other.team.shortDisplayName)) || "Opponents",
            ha: mine.homeAway === "away" ? "A" : "H",
            date: ev.date || "",
            t: new Date(ev.date).getTime() || 0
        });
    }
    games.sort((a, b) => b.t - a.t);
    return games.slice(0, maxN || 8);
}

function previewTopScorer(competitor) {
    if (!competitor || !Array.isArray(competitor.leaders)) return null;
    const cat = competitor.leaders.find((l) => l && (l.name === "goals" || l.name === "goalsLeaders"));
    const lead = cat && Array.isArray(cat.leaders) && cat.leaders[0];
    const name = lead && lead.athlete && (lead.athlete.displayName || lead.athlete.shortName);
    if (!name) return null;
    const g = (lead.displayValue != null && lead.displayValue !== "") ? parseInt(lead.displayValue, 10) : Math.round(lead.value || 0);
    return { name, goals: isNaN(g) ? 0 : g };
}

function americanToDecimal(val) {
    if (val == null || val === "" || isNaN(Number(val))) return null;
    const n = Number(val);
    if (n === 0) return null;
    if (n > 0 && n < 10) return n; // already decimal
    if (n > 0) return 1 + (n / 100);
    return 1 + (100 / Math.abs(n));
}

function oddsCapsulesHTML(odds, homeCode, awayCode) {
    if (!odds) return "";
    const h = odds.home != null ? Number(odds.home) : null;
    const d = odds.draw != null ? Number(odds.draw) : null;
    const a = odds.away != null ? Number(odds.away) : null;
    const parts = [];
    if (h && d && a) {
        parts.push(`<span class="stat-capsule odds-caps odds-1x2" title="1X2 (${esc(homeCode || "Home")} · Draw · ${esc(awayCode || "Away")}) via ${esc(odds.provider || "odds")}">🎲 ${h.toFixed(2)} · ${d.toFixed(2)} · ${a.toFixed(2)}</span>`);
    } else if (odds.details) {
        parts.push(`<span class="stat-capsule odds-caps">🎲 ${esc(odds.details)}</span>`);
    }
    if (odds.overUnder != null && odds.overUnder !== "") {
        const over = odds.overOdds ? Number(odds.overOdds).toFixed(2) : null;
        const under = odds.underOdds ? Number(odds.underOdds).toFixed(2) : null;
        const label = over && under ? `O/U ${odds.overUnder}  ↑${over} ↓${under}` : `O/U ${odds.overUnder}`;
        parts.push(`<span class="stat-capsule odds-caps odds-ou" title="Total goals Over/Under">📈 ${label}</span>`);
    }
    if (odds.bttsYes && odds.bttsNo) {
        parts.push(`<span class="stat-capsule odds-caps odds-btts" title="Both Teams To Score — Yes/No">⚔️ BTTS ${Number(odds.bttsYes).toFixed(2)} / ${Number(odds.bttsNo).toFixed(2)}</span>`);
    }
    return parts.join("");
}

function previewOdds(comp) {
    if (!comp) return null;
    if (comp.odds && !Array.isArray(comp.odds) && (comp.odds.home != null || comp.odds.details || comp.odds.homeTeamOdds != null)) {
        const o = comp.odds;
        const h = americanToDecimal(o.home != null ? o.home : (o.homeTeamOdds && (o.homeTeamOdds.moneyLine != null ? o.homeTeamOdds.moneyLine : o.homeTeamOdds.summary)));
        const d = americanToDecimal(o.draw != null ? o.draw : (o.drawOdds && (o.drawOdds.moneyLine != null ? o.drawOdds.moneyLine : o.drawOdds.summary)));
        const a = americanToDecimal(o.away != null ? o.away : (o.awayTeamOdds && (o.awayTeamOdds.moneyLine != null ? o.awayTeamOdds.moneyLine : o.awayTeamOdds.summary)));
        return {
            provider: o.provider || "Odds",
            details: o.details || "",
            home: h, draw: d, away: a,
            overUnder: o.overUnder,
            overOdds: o.overOdds,
            underOdds: o.underOdds,
            bttsYes: o.bttsYes,
            bttsNo: o.bttsNo
        };
    }
    const rawOdds = Array.isArray(comp && comp.odds) ? comp.odds.filter(Boolean) : [];
    if (!rawOdds.length) return null;
    const o = rawOdds.find((x) => x.homeTeamOdds || x.awayTeamOdds || x.drawOdds || x.home != null) || rawOdds[0];
    const ml = (x) => x && (x.moneyLine != null ? x.moneyLine : x.summary);
    const rawH = o.home != null ? o.home : ml(o.homeTeamOdds);
    const rawD = o.draw != null ? o.draw : ml(o.drawOdds);
    const rawA = o.away != null ? o.away : ml(o.awayTeamOdds);
    const h = americanToDecimal(rawH);
    const d = americanToDecimal(rawD);
    const a = americanToDecimal(rawA);
    const prov = (o.provider && (o.provider.name || o.provider)) || "Odds";
    const out = {
        provider: prov,
        details: o.details || "",
        home: h, draw: d, away: a,
        overUnder: o.overUnder,
        overOdds: o.overOdds,
        underOdds: o.underOdds,
        bttsYes: o.bttsYes,
        bttsNo: o.bttsNo
    };
    return (out.home == null && out.draw == null && out.away == null && !out.details) ? null : out;
}

function safeLocale() {
    try { return typeof appLocale === "function" ? appLocale() : undefined; } catch (e) { return undefined; }
}

function formatKickoffLong(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(safeLocale(), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

function formatGameDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(safeLocale(), { day: "numeric", month: "short" });
}

// --- Render ---

function formColHTML(name, code, logo, form) {
    const last5 = form.slice(0, 5);
    const chips = last5.length
        ? `<div class="form-chips">` + last5.map((g) =>
            `<span class="form-chip ${g.res}" title="${esc(formatGameDate(g.date))} · ${g.ha === "H" ? t("preview.home") : t("preview.away")} vs ${esc(g.oppName)} ${g.gf}–${g.ga}">${g.res}</span>`
        ).join("") + `</div>`
        : `<p class="loading-note" style="padding:4px 0;">${t("preview.norecent")}</p>`;
    const games = last5.map((g) =>
        `<div class="form-game">${esc(formatGameDate(g.date))} · ${g.ha} · <b>${g.gf}–${g.ga}</b> vs ${esc(g.opp)}</div>`
    ).join("");
    return `<div class="form-col"><h3>`
        + (logo ? `<img class="pred-logo" src="${esc(logo)}" alt="" loading="lazy" onerror="this.remove()">` : "")
        + `${esc(name)} <span style="color:var(--text-muted);font-weight:400;">${t("preview.lastfive")}</span></h3>`
        + chips + games + `</div>`;
}

function compareTableHTML(h, a) {
    const dash = "–";
    const row = (label, hv, av) => `<tr><td>${label}</td><td>${hv}</td><td>${av}</td></tr>`;
    const wdl = (s) => (s.played ? `${s.w}–${s.d}–${s.l}` : dash);
    return `<div class="full-table-wrap compare-wrap"><table class="full-table"><thead><tr>`
        + `<th class="col-team" style="text-align:left;">${esc(h.code)}</th><th></th><th>${esc(a.code)}</th>`
        + `</tr></thead><tbody>`
        + row(t("preview.cPos"), h.pos ? ord(h.pos) : dash, a.pos ? ord(a.pos) : dash)
        + row(t("preview.cPlayed"), h.played || dash, a.played || dash)
        + row("W–D–L", wdl(h), wdl(a))
        + row(t("preview.cGF"), h.played ? h.gf : dash, a.played ? a.gf : dash)
        + row(t("preview.cGA"), h.played ? h.ga : dash, a.played ? a.ga : dash)
        + row(t("preview.cForm"), formPoints(h.form), formPoints(a.form))
        + `</tbody></table></div>`;
}

function wirePreviewShare(H, A, ev, leagueName, pv) {
    const canvas = document.getElementById("share-canvas");
    if (canvas && typeof drawShareCard === "function") {
        drawShareCard(canvas, {
            kicker: `${leagueName} · ${t("preview.tag")}`.toUpperCase(),
            home: H.name, away: A.name,
            middle: formatKickoffLong(ev.date),
            sub: `${t("preview.says")}: ${pv.verdict.pick}`,
            tag: "PREVIEW"
        });
    }
    const root = document.getElementById("share-row");
    if (root && typeof wireShareButtons === "function") {
        wireShareButtons(root, {
            title: `${H.name} vs ${A.name} preview`,
            text: `${pv.headline} — ${t("preview.says")} ${pv.verdict.pick}.`,
            url: window.location.href,
            filename: (typeof shareFileName === "function") ? shareFileName(`preview-${H.code}-vs-${A.code}`) : `preview-${H.code}-vs-${A.code}.png`
        });
    }
}

async function bootPreview() {
    const box = document.getElementById("preview-body");
    let league = "", id = "", date = "";
    try {
        const q = new URLSearchParams(window.location.search);
        league = q.get("league") || ""; id = q.get("id") || ""; date = q.get("date") || "";
    } catch (e) {}

    let sessionMatch = null;
    try {
        const raw = sessionStorage.getItem("scorehub-match");
        if (raw) sessionMatch = JSON.parse(raw);
    } catch (e) {}

    if (!league || !id) {
        if (sessionMatch) {
            league = sessionMatch.leagueSlug || sessionMatch.leagueId || "eng.1";
            id = sessionMatch.espnEventId || sessionMatch.id || "";
            date = sessionMatch.date || "";
        }
    }

    if (!league || !id) {
        box.innerHTML = `<h1>${t("preview.nfh1")}</h1><div class="window-strip">${t("preview.notfound")}</div>`;
        return;
    }

    const cleanSlug = cleanLeagueSlug(league);
    const leagueName = getLeagueName(cleanSlug);

    let ev = null;
    if (!String(id).startsWith("fb-") && !String(id).startsWith("demo-")) {
        ev = await fetchPreviewEvent(cleanSlug, id, date);
    }
    if (!ev) {
        if (sessionMatch && (String(sessionMatch.id) === String(id) || String(sessionMatch.espnEventId) === String(id) || (sessionMatch.homeTeam && sessionMatch.awayTeam))) {
            ev = simMatchToPreviewEvent(sessionMatch);
        }
    }

    if (!ev) {
        box.innerHTML = `<h1>${t("preview.unh1")}</h1><div class="window-strip">${t("preview.unavail")} <button class="btn btn-login btn-sm" id="preview-retry-btn" style="margin-left:8px;">Retry</button> or return to <a href="index.html">Scores</a>.</div>`;
        const retry = document.getElementById("preview-retry-btn");
        if (retry) retry.addEventListener("click", bootPreview);
        return;
    }
    const comp = (ev.competitions && ev.competitions[0]) || {};
    const cs = comp.competitors || [];
    const hc = cs.find((c) => c.homeAway === "home") || {};
    const ac = cs.find((c) => c.homeAway === "away") || {};
    const st = (ev.status && ev.status.type) || {};
    const H = {
        name: (hc.team && (hc.team.displayName || hc.team.shortDisplayName)) || "Home",
        code: (hc.team && (hc.team.abbreviation || hc.team.shortDisplayName)) || "HOM",
        logo: previewTeamLogo(hc.team)
    };
    const A = {
        name: (ac.team && (ac.team.displayName || ac.team.shortDisplayName)) || "Away",
        code: (ac.team && (ac.team.abbreviation || ac.team.shortDisplayName)) || "AWY",
        logo: previewTeamLogo(ac.team)
    };
    if (st.state !== "pre") {
        const isLive = st.state === "in";
        const score = isLive
            ? `${hc.score != null ? hc.score : "–"} – ${ac.score != null ? ac.score : "–"}`
            : `${hc.score != null ? hc.score : "–"} – ${ac.score != null ? ac.score : "–"} FT`;
        const ymd = ymdFromISO(ev.date) || date;
        box.innerHTML = `<span class="league-tag">${esc(leagueName)}</span>`
            + `<h1 style="margin-top:10px;">${esc(H.name)} ${esc(score)} ${esc(A.name)}</h1>`
            + `<div class="window-strip">${t("preview.played1")}${isLive ? t("preview.underway") : t("preview.finished")}${t("preview.played2")}</div>`
            + `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">`
            + (!isLive ? `<a class="btn btn-primary btn-sm" href="report.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(ymd)}">📝 Read Match Report</a>` : "")
            + `<a class="btn btn-login btn-sm" href="match.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(ymd)}">⚡ Match Centre</a>`
            + `<a class="btn btn-login btn-sm" href="index.html">&larr; Back to Scores</a>`
            + `</div>`;
        return;
    }
    box.innerHTML = `<p class="loading-note">${t("preview.loading")}</p>`;
    const venueFull = (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "";
    const venueCity = (comp.venue && comp.venue.address && comp.venue.address.city) || "";
    const venue = [venueFull, venueCity].filter(Boolean).join(", ");
    const [rows, formEvents] = await Promise.all([
        fetchPreviewTable(cleanSlug),
        fetchFormEvents(cleanSlug, lastFormDates(new Date(), 5, 3))
    ]);
    const hr = matchTeamRow(H, rows), ar = matchTeamRow(A, rows);
    const mkSide = (T, row) => ({
        name: T.name, code: T.code, logo: T.logo,
        pos: row ? row.rank : null, pts: row ? row.pts : 0,
        played: row ? row.played : 0, w: row ? row.won : 0, d: row ? row.drawn : 0, l: row ? row.lost : 0,
        gf: row ? row.gf : 0, ga: row ? row.ga : 0,
        form: collectForm(formEvents, T, 8),
        scorer: null
    });
    const h = mkSide(H, hr), a = mkSide(A, ar);
    h.scorer = previewTopScorer(hc);
    a.scorer = previewTopScorer(ac);
    const oddsObj = previewOdds(comp);
    const oddsFav = oddsFavourite(oddsObj);
    const oddsHtml = oddsCapsulesHTML(oddsObj, H.code, A.code);
    const pv = buildPreview({
        seed: `${cleanSlug}:${id}`, leagueName,
        venue, venueShort: venueFull || "home",
        home: h, away: a, oddsFav
    });
    try { 
        const seoTitle = `${H.name} vs ${A.name} Preview - ${leagueName} Prediction & Form | ScoreHub`;
        document.title = seoTitle;
        if (window.SEO) {
            SEO.setTitle(seoTitle);
            SEO.setDescription(`${pv.standfirst} ${pv.paragraphs[0] ? pv.paragraphs[0].slice(0,120) : ''} Kickoff ${formatKickoffLong(ev.date)} at ${venue || 'TBD'}. Form, stats and prediction.`);
            SEO.setCanonical(window.location.href.split('#')[0]);
            SEO.setImage(H.logo || A.logo || '');
            SEO.setKeywords([H.name, A.name, leagueName, 'preview', 'prediction', 'form', 'ScoreHub']);
            SEO.breadcrumb([
                { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
                { name: 'Previews', url: 'https://livematches.hyper.co.ke/previews.html' },
                { name: `${H.name} vs ${A.name}`, url: window.location.href.split('#')[0] }
            ]);
            SEO.sportsEvent({
                name: `${H.name} vs ${A.name}`,
                description: pv.standfirst,
                startDate: ev.date,
                venue: venue,
                league: leagueName,
                homeTeam: H.name,
                awayTeam: A.name,
                homeLogo: H.logo,
                awayLogo: A.logo,
                sport: 'Soccer',
                eventStatus: 'https://schema.org/EventScheduled'
            });
            SEO.newsArticle({
                type: 'NewsArticle',
                headline: pv.headline,
                description: pv.standfirst,
                image: H.logo || A.logo,
                datePublished: new Date().toISOString(),
                author: 'ScoreHub',
                url: window.location.href.split('#')[0]
            });
        }
    } catch (e) {}
    box.innerHTML = `<div class="pred-meta"><span class="league-tag">${esc(leagueName)}</span> <span class="league-tag">${t("preview.tag")}</span>${oddsHtml}</div>`
        + `<h1 style="margin-top:10px;">${esc(pv.headline)}</h1>`
        + `<p class="legal-updated">${esc(formatKickoffLong(ev.date))} · ${esc(countdownText(ev.date, Date.now()))}${venue ? ` · ${esc(venue)}` : ""}</p>`
        + `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px 0;">`
        + `<a class="btn btn-login btn-sm" href="match.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(date || ymdFromISO(ev.date))}">⚡ Match Centre</a>`
        + `<a class="btn btn-login btn-sm" href="standings.html?league=${esc(cleanSlug)}">📊 Table</a>`
        + `<a class="btn btn-login btn-sm" href="previews.html">📰 All Previews</a>`
        + `</div>`
        + `<p class="preview-standfirst">${esc(pv.standfirst)}</p>`
        + pv.paragraphs.map((p) => `<p class="preview-p">${esc(p)}</p>`).join("")
        + `<div class="form-cols">${formColHTML(h.name, h.code, h.logo, h.form)}${formColHTML(a.name, a.code, a.logo, a.form)}</div>`
        + compareTableHTML(h, a)
        + `<div class="preview-verdict"><h3>${t("preview.says")} <span style="color:var(--text-muted);font-weight:400;">· ${esc(pv.verdict.confidence)} ${esc(pv.verdict.confidence === t("preview.nodataword") ? "" : t("preview.confword"))}</span></h3>`
        + `<div class="pick">${esc(pv.verdict.pick)}</div><p>${esc(pv.verdict.reason)}</p>${oddsHtml ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">${oddsHtml}</div>` : ""}</div>`
        + `<p class="preview-note">Auto-generated by ScoreHub from fixtures, league tables and recent results — original content, written by our template engine, not a journalist. The verdict is a stats-based lean for fun, not betting advice. Data: ESPN.</p>`
        + `<p class="preview-note">Fancy a go yourself? <a href="predictions.html" style="color:var(--primary);">Make your prediction →</a></p>`
        + (typeof shareSectionHTML === "function" ? shareSectionHTML() : "");
    wirePreviewShare(H, A, ev, leagueName, pv);
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootPreview);
}

window.__rerenderLang = function () { try { bootPreview(); } catch (e) {} };

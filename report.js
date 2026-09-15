/* ScoreHub Match Reports — original auto-generated write-ups built from
   goals, cards, match stats and league tables. Pure helpers (repMinute,
   parseReportEvents, scorerTallies, detectDrama, parseSideStats,
   buildReport, halfParagraph) are top-level and side-effect free for
   testability. */

const REPORT_LEAGUES = {
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
    return REPORT_LEAGUES[clean] || REPORT_LEAGUES[slug] || "Football";
}

function simMatchToReportEvent(m) {
    if (!m) return null;
    const homeTeam = m.homeTeam || "Home";
    const awayTeam = m.awayTeam || "Away";
    const homeCode = m.homeCode || (homeTeam.length > 3 ? homeTeam.slice(0, 3).toUpperCase() : homeTeam);
    const awayCode = m.awayCode || (awayTeam.length > 3 ? awayTeam.slice(0, 3).toUpperCase() : awayTeam);
    const hs = m.homeScore != null ? Number(m.homeScore) : 0;
    const as = m.awayScore != null ? Number(m.awayScore) : 0;
    const sh = m.stats || {};
    const sa = m.awayStats || {
        possession: 100 - (sh.possession || 50),
        shots: Math.round((sh.shots || 0) * 0.8),
        shotsOnTarget: Math.round((sh.shotsOnTarget || 0) * 0.8),
        corners: Math.round((sh.corners || 0) * 0.8),
        fouls: Math.round((sh.fouls || 0) * 0.8)
    };

    const details = [];
    if (m.scorers && Array.isArray(m.scorers.home)) {
        m.scorers.home.forEach(s => {
            const minMatch = String(s).match(/(\d+)/);
            const minStr = minMatch ? `${minMatch[1]}'` : "30'";
            const name = String(s).replace(/^[^a-zA-Z]+/, "").replace(/\s*\(\d+.*$/, "").trim() || "Scorer";
            details.push({
                scoringPlay: true,
                clock: { displayValue: minStr },
                team: { id: "home" },
                athletesInvolved: [{ displayName: name }]
            });
        });
    }
    if (m.scorers && Array.isArray(m.scorers.away)) {
        m.scorers.away.forEach(s => {
            const minMatch = String(s).match(/(\d+)/);
            const minStr = minMatch ? `${minMatch[1]}'` : "65'";
            const name = String(s).replace(/^[^a-zA-Z]+/, "").replace(/\s*\(\d+.*$/, "").trim() || "Scorer";
            details.push({
                scoringPlay: true,
                clock: { displayValue: minStr },
                team: { id: "away" },
                athletesInvolved: [{ displayName: name }]
            });
        });
    }

    return {
        id: String(m.espnEventId || m.id || "sim"),
        date: m.date || new Date().toISOString(),
        name: `${homeTeam} vs ${awayTeam}`,
        competitions: [{
            id: String(m.espnEventId || m.id || "sim"),
            date: m.date || new Date().toISOString(),
            venue: { fullName: m.venue || "Stadium" },
            attendance: m.attendance || 42000,
            status: {
                type: {
                    state: "post",
                    completed: true,
                    shortDetail: m.time || "FT"
                }
            },
            competitors: [
                {
                    homeAway: "home",
                    score: String(hs),
                    team: {
                        id: "home",
                        displayName: homeTeam,
                        shortDisplayName: homeTeam,
                        abbreviation: homeCode,
                        logos: m.homeLogo ? [{ href: m.homeLogo }] : []
                    },
                    statistics: [
                        { name: "possession", displayValue: `${sh.possession || 50}%` },
                        { name: "shots", displayValue: String(sh.shots || 10) },
                        { name: "shotsOnTarget", displayValue: String(sh.shotsOnTarget || 4) },
                        { name: "corners", displayValue: String(sh.corners || 4) },
                        { name: "fouls", displayValue: String(sh.fouls || 8) },
                        { name: "yellowCards", displayValue: String(sh.yellowCards || 1) },
                        { name: "redCards", displayValue: String(sh.redCards || 0) }
                    ]
                },
                {
                    homeAway: "away",
                    score: String(as),
                    team: {
                        id: "away",
                        displayName: awayTeam,
                        shortDisplayName: awayTeam,
                        abbreviation: awayCode,
                        logos: m.awayLogo ? [{ href: m.awayLogo }] : []
                    },
                    statistics: [
                        { name: "possession", displayValue: `${sa.possession || 50}%` },
                        { name: "shots", displayValue: String(sa.shots || 8) },
                        { name: "shotsOnTarget", displayValue: String(sa.shotsOnTarget || 3) },
                        { name: "corners", displayValue: String(sa.corners || 3) },
                        { name: "fouls", displayValue: String(sa.fouls || 9) },
                        { name: "yellowCards", displayValue: String(sa.yellowCards || 1) },
                        { name: "redCards", displayValue: String(sa.redCards || 0) }
                    ]
                }
            ],
            details
        }],
        status: {
            type: {
                state: "post",
                completed: true,
                shortDetail: m.time || "FT"
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
    let h = 0;
    const str = String(s == null ? "" : s);
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
}

function pickSeeded(arr, seed) {
    if (!arr || !arr.length) return "";
    return arr[hashStr(seed) % arr.length];
}

function repMinute(display) {
    const s = String(display || "");
    const base = parseInt(s, 10);
    const ex = s.match(/\+(\d+)/);
    const b = isNaN(base) ? 0 : base, e = ex ? parseInt(ex[1], 10) : 0;
    return { base: b, extra: e, key: b + e / 100 };
}

function parseReportEvents(details, homeId, awayId) {
    const goals = [], reds = [];
    let yellows = 0;
    for (const d of (details || [])) {
        if (!d) continue;
        const tid = String(d.team && d.team.id != null ? d.team.id : "");
        const side = tid && tid === String(homeId) ? "H" : tid && tid === String(awayId) ? "A" : "";
        const p = d.athletesInvolved && d.athletesInvolved[0];
        const name = p ? (p.displayName || p.shortName || "") : "";
        const display = (d.clock && d.clock.displayValue) || "";
        if (d.scoringPlay) {
            goals.push({
                display, key: repMinute(display).key,
                scorer: name || "Unknown", team: side || "H",
                pen: !!d.penaltyKick, og: !!d.ownGoal
            });
        }
        if (d.redCard) reds.push({ display, key: repMinute(display).key, player: name || "Unknown", team: side || "H" });
        if (d.yellowCard) yellows++;
    }
    goals.sort((a, b) => a.key - b.key);
    reds.sort((a, b) => a.key - b.key);
    let hs = 0, as = 0;
    goals.forEach((g) => { if (g.team === "A") as++; else hs++; g.hs = hs; g.as = as; });
    return { goals, reds, yellows };
}

function scorerTallies(goals) {
    const m = {};
    (goals || []).forEach((g) => { m[g.scorer] = (m[g.scorer] || 0) + 1; });
    return Object.keys(m).map((k) => ({ name: k, n: m[k] })).sort((a, b) => b.n - a.n);
}

function detectDrama(goals, hs, as) {
    const winner = hs > as ? "H" : as > hs ? "A" : null;
    let decisive = null, trailed = false, quickPair = null;
    let ph = 0, pa = 0;
    (goals || []).forEach((g, i) => {
        if (winner) {
            const leadBefore = ph > pa ? "H" : pa > ph ? "A" : null;
            const leadAfter = g.hs > g.as ? "H" : g.as > g.hs ? "A" : null;
            if (leadBefore && leadBefore !== winner) trailed = true;
            if (leadAfter === winner && leadBefore !== winner) decisive = g;
        }
        if (i > 0 && !quickPair) {
            const gap = g.key - goals[i - 1].key;
            if (gap >= 0 && gap <= 5.05) quickPair = [goals[i - 1], g];
        }
        ph = g.hs; pa = g.as;
    });
    const tallies = scorerTallies(goals);
    return {
        winner, decisive, trailed,
        comeback: trailed && !!winner,
        lateWinner: decisive && decisive.key >= 75 ? decisive : null,
        quickPair,
        brace: tallies.length && tallies[0].n >= 2 ? tallies[0] : null,
        total: (goals || []).length
    };
}

function parseSideStats(competitor) {
    const out = { poss: null, shots: null, onTarget: null, corners: null, fouls: null };
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
    return out;
}

function goalSuffix(g) {
    return g.pen ? " from the penalty spot" : g.og ? " (own goal)" : "";
}

function halfParagraph(halfGoals, hName, aName, firstHalf) {
    if (!halfGoals.length) {
        return firstHalf ? "The sides went in goalless at the break." : "No further goals arrived after the restart.";
    }
    return halfGoals.map((g) => {
        const T = g.team === "H" ? hName : aName;
        const when = g.display ? ` (${g.display})` : "";
        const suf = goalSuffix(g);
        const bh = g.hs - (g.team === "H" ? 1 : 0), ba = g.as - (g.team === "A" ? 1 : 0);
        if (bh === 0 && ba === 0) return `${g.scorer} opened the scoring${when}${suf}.`;
        if (g.hs === g.as) return `${g.scorer} levelled for ${T}${when}${suf}.`;
        const ahead = g.hs > g.as ? hName : aName;
        const forAhead = (g.team === "H") === (g.hs > g.as);
        if (forAhead && bh === ba) return `${g.scorer} put ${ahead} ahead${when}${suf}.`;
        if (forAhead) return `${g.scorer} extended ${ahead}'s lead${when}${suf}.`;
        return `${g.scorer} pulled one back for ${T}${when}${suf}.`;
    }).join(" ");
}

function buildReport(input) {
    // input: {seed, leagueName, venue, attendance, h:{name,code,pos,pts},
    //         a:{...}, hs, as, goals, reds, yellows, stats:{h,a}}
    const { seed, leagueName, venue, attendance, h, a, hs, as, goals, reds, yellows, stats } = input;
    const drama = detectDrama(goals, hs, as);
    const W = drama.winner === "H" ? h : drama.winner === "A" ? a : null;
    const L = drama.winner === "H" ? a : drama.winner === "A" ? h : null;
    const atVenue = venue ? ` at ${venue}` : "";

    let headline;
    if (hs === 0 && as === 0) {
        headline = pickSeeded([
            `${h.name} 0–0 ${a.name}: stalemate${atVenue}`,
            `No way through: ${h.name} and ${a.name} play out goalless draw`
        ], seed + "h");
    } else if (!W) {
        headline = pickSeeded([
            `${h.name} ${hs}–${as} ${a.name}: honours even${atVenue}`,
            `Points shared after ${hs + as}-goal thriller${atVenue}`
        ], seed + "h");
    } else if (drama.brace && drama.brace.n >= 3) {
        headline = `${drama.brace.name} hat-trick ${pickSeeded(["stuns", "sinks", "destroys"], seed + "v")} ${L.name}`;
    } else if (drama.brace) {
        headline = `${drama.brace.name} brace fires ${W.name} past ${L.name}`;
    } else if (drama.lateWinner) {
        headline = `${drama.lateWinner.scorer}'s late strike seals it as ${W.name} beat ${L.name}`;
    } else {
        const wLast = goals.slice().reverse().find((g) => (g.team === "H") === (drama.winner === "H"));
        headline = pickSeeded([
            `How ${W.name} beat ${L.name}`,
            wLast ? `${W.name} ${hs}–${as} ${L.name}: ${wLast.scorer} the hero` : `How ${W.name} beat ${L.name}`
        ], seed + "h");
    }

    const byScorer = {};
    goals.forEach((g) => { (byScorer[g.scorer] = byScorer[g.scorer] || []).push(g.display); });
    const scorerList = Object.keys(byScorer).map((k) => `${k} (${byScorer[k].join(", ")})`).join(", ");
    let standfirst;
    if (W) {
        const winSide = W === h ? "H" : "A";
        const winGoals = goals.filter((g) => g.team === winSide);
        const loseGoals = goals.filter((g) => g.team !== winSide);
        const byWinScorer = {};
        winGoals.forEach((g) => { (byWinScorer[g.scorer] = byWinScorer[g.scorer] || []).push(g.display); });
        const winList = Object.keys(byWinScorer).map((k) => `${k} (${byWinScorer[k].join(", ")})`).join(", ");
        const byLoseScorer = {};
        loseGoals.forEach((g) => { (byLoseScorer[g.scorer] = byLoseScorer[g.scorer] || []).push(g.display); });
        const loseList = Object.keys(byLoseScorer).map((k) => `${k} (${byLoseScorer[k].join(", ")})`).join(", ");

        standfirst = `${W.name} beat ${L.name} ${hs}–${as}${atVenue}`
            + (winList ? ` thanks to goals from ${winList}` : "")
            + (loseList ? `, with ${loseList} replying for ${L.name}.` : ".");
    } else if (hs === 0) {
        standfirst = `${h.name} and ${a.name} played out a goalless draw${atVenue}.`;
    } else {
        standfirst = `${h.name} and ${a.name} shared the points in a ${hs}–${as} draw${atVenue} (${scorerList}).`;
    }

    const attBit = attendance > 0 ? ` in front of ${Number(attendance).toLocaleString()} supporters` : "";
    let p1 = `It finished ${h.name} ${hs}–${as} ${a.name}${atVenue}${attBit}.`;
    if (h.pos && a.pos) p1 += ` ${h.name} sit ${ord(h.pos)} on ${h.pts} points; ${a.name} are ${ord(a.pos)} on ${a.pts}.`;
    else if (h.pos || a.pos) { const t = h.pos ? h : a; p1 += ` ${t.name} sit ${ord(t.pos)} on ${t.pts} points.`; }

    const paragraphs = [p1];
    if (hs + as > 0 && !goals.length) {
        paragraphs.push("Detailed goal data was unavailable for this match, but the scoreline tells its own story.");
    } else {
        const first = goals.filter((g) => g.key < 45.5), second = goals.filter((g) => g.key >= 45.5);
        paragraphs.push(halfParagraph(first, h.name, a.name, true));
        const p3bits = [];
        if (second.length || (!drama.lateWinner && !drama.comeback && !drama.quickPair && !reds.length)) {
            p3bits.push(halfParagraph(second, h.name, a.name, false));
        } else if (!second.length) {
            p3bits.push("No further goals arrived after the restart.");
        }
        if (drama.comeback) p3bits.push(`${W.name} had trailed but completed the turnaround.`);
        if (drama.lateWinner) p3bits.push(`${drama.lateWinner.scorer}'s ${drama.lateWinner.display} strike proved the difference.`);
        if (drama.quickPair) {
            const gap = Math.max(1, Math.round(drama.quickPair[1].key - drama.quickPair[0].key));
            p3bits.push(gap <= 1 ? "Two goals in the space of a minute turned the contest on its head."
                : `Two goals in ${gap} minutes turned the contest on its head.`);
        }
        reds.forEach((r) => {
            p3bits.push(`${r.player} was sent off for ${r.team === "H" ? h.name : a.name}${r.display ? ` (${r.display})` : ""}, leaving them to finish with ten men.`);
        });
        if (!reds.length && yellows >= 6) p3bits.push(`A feisty affair produced ${yellows} bookings.`);
        paragraphs.push(p3bits.join(" "));
    }

    const sh = stats && stats.h, sa = stats && stats.a;
    if (sh && sa && (sh.poss != null || sh.shots != null)) {
        const bits = [];
        if (sh.poss != null && sa.poss != null) {
            const gap = Math.abs(sh.poss - sa.poss);
            const leader = sh.poss >= sa.poss ? h.name : a.name;
            bits.push(gap >= 10
                ? `${leader} dominated the ball (${Math.max(sh.poss, sa.poss)}% possession).`
                : `Possession was shared (${sh.poss}%–${sa.poss}%).`);
        }
        if (sh.shots != null && sa.shots != null) {
            let line;
            if (sh.shots === sa.shots) {
                line = `Shots were even at ${sh.shots} apiece`;
                if (sh.onTarget != null && sa.onTarget != null) {
                    line += ` (${sh.onTarget}–${sa.onTarget} on target)`;
                }
            } else {
                const homeOutshot = sh.shots > sa.shots;
                const lt = homeOutshot ? h.name : a.name;
                const maxShots = Math.max(sh.shots, sa.shots);
                const minShots = Math.min(sh.shots, sa.shots);
                line = `${lt} outshot their opponents ${maxShots}–${minShots}`;
                if (sh.onTarget != null && sa.onTarget != null) {
                    const ltTarget = homeOutshot ? sh.onTarget : sa.onTarget;
                    const oppTarget = homeOutshot ? sa.onTarget : sh.onTarget;
                    line += ` (${ltTarget}–${oppTarget} on target)`;
                }
            }
            bits.push(line + ".");
        }
        if (bits.length) paragraphs.push(bits.join(" "));
    }

    return { headline, standfirst, paragraphs };
}

// --- Data loading ---

function reportTeamLogo(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}

function reportNorm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function reportMatchRow(t, rows) {
    const n = reportNorm(t.name), c = reportNorm(t.code);
    for (const r of (rows || [])) {
        if (n && n === reportNorm(r.team)) return r;
        if (c && c === reportNorm(r.abbrev)) return r;
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

function parseReportTable(data) {
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

async function fetchReportEvent(slug, id, dateYmd) {
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

async function fetchReportTable(slug) {
    const clean = cleanLeagueSlug(slug);
    const path = `/apis/v2/sports/soccer/${clean}/standings?region=us&lang=en&contentorigin=espn`;
    const urls = [`https://site.web.api.espn.com${path}`, `https://site.api.espn.com${path}`];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const rows = parseReportTable(await r.json());
            if (rows.length) return rows;
        } catch (e) { /* next mirror */ }
    }
    return [];
}

async function fetchNextFixtures(slug, H, A) {
    const clean = cleanLeagueSlug(slug);
    const out = { H: null, A: null };
    try {
        const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${clean}/scoreboard?limit=100`);
        if (!r.ok) return out;
        const j = await r.json();
        const pre = (j.events || []).filter((ev) => ev.status && ev.status.type && ev.status.type.state === "pre");
        const involves = (ev, T) => {
            const cs = ((ev.competitions && ev.competitions[0] && ev.competitions[0].competitors) || []);
            return cs.some((c) => {
                const nm = reportNorm(c.team && (c.team.displayName || c.team.shortDisplayName));
                const ab = reportNorm(c.team && c.team.abbreviation);
                return (nm && nm === reportNorm(T.name)) || (ab && ab === reportNorm(T.code));
            });
        };
        const oppOf = (ev, T) => {
            const cs = ((ev.competitions && ev.competitions[0] && ev.competitions[0].competitors) || []);
            const o = cs.find((c) => {
                const nm = reportNorm(c.team && (c.team.displayName || c.team.shortDisplayName));
                const ab = reportNorm(c.team && c.team.abbreviation);
                return !((nm && nm === reportNorm(T.name)) || (ab && ab === reportNorm(T.code)));
            });
            return (o && o.team && (o.team.displayName || o.team.shortDisplayName)) || "TBD";
        };
        [["H", H], ["A", A]].forEach(([key, T]) => {
            const nx = pre.filter((ev) => involves(ev, T)).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
            if (nx) out[key] = { opp: oppOf(nx, T), date: nx.date || "" };
        });
    } catch (e) { /* omit what-next */ }
    return out;
}

function safeLocale() {
    try { return typeof appLocale === "function" ? appLocale() : undefined; } catch (e) { return undefined; }
}

function formatReportDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(safeLocale(), { weekday: "long", day: "numeric", month: "long" });
}

function formatNextDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(safeLocale(), { weekday: "short", day: "numeric", month: "short" });
}

// --- Render ---

function timelineHTML(goals, reds, hCode, aCode) {
    const items = goals.map((g) => ({ key: g.key, min: g.display, kind: "goal", g }))
        .concat(reds.map((r) => ({ key: r.key, min: r.display, kind: "red", r })));
    items.sort((a, b) => a.key - b.key);
    if (!items.length) return "";
    return `<div class="report-timeline">` + items.map((it) => {
        if (it.kind === "goal") {
            const g = it.g;
            const badges = (g.pen ? `<span class="report-badge">PEN</span>` : "")
                + (g.og ? `<span class="report-badge">OG</span>` : "");
            return `<div class="report-event"><span class="report-min">${esc(g.display || "")}</span>`
                + `<span>⚽ <strong>${esc(g.scorer)}</strong> (${g.team === "H" ? esc(hCode) : esc(aCode)}) ${badges}</span>`
                + `<span style="margin-left:auto;font-weight:700;">${g.hs}–${g.as}</span></div>`;
        }
        const r = it.r;
        return `<div class="report-event"><span class="report-min">${esc(r.display || "")}</span>`
            + `<span>🟥 <strong>${esc(r.player)}</strong> (${r.team === "H" ? esc(hCode) : esc(aCode)})</span>`
            + `<span class="report-badge red" style="margin-left:auto;">SENT OFF</span></div>`;
    }).join("") + `</div>`;
}

function reportStatsTableHTML(hCode, aCode, sh, sa) {
    const rows = [
        ["Possession %", sh.poss, sa.poss],
        ["Shots", sh.shots, sa.shots],
        ["On target", sh.onTarget, sa.onTarget],
        ["Corners", sh.corners, sa.corners],
        ["Fouls", sh.fouls, sa.fouls]
    ].filter((r) => r[1] != null || r[2] != null);
    if (!rows.length) return "";
    const fmt = (v) => (v == null ? "–" : v);
    return `<div class="full-table-wrap compare-wrap"><table class="full-table"><thead><tr>`
        + `<th class="col-team" style="text-align:left;">${esc(hCode)}</th><th></th><th>${esc(aCode)}</th>`
        + `</tr></thead><tbody>`
        + rows.map((r) => `<tr><td>${fmt(r[1])}</td><td>${r[0]}</td><td>${fmt(r[2])}</td></tr>`).join("")
        + `</tbody></table></div>`;
}

function wireReportShare(H, A, hs, as, venue, leagueName, rp) {
    const canvas = document.getElementById("share-canvas");
    if (canvas && typeof drawShareCard === "function") {
        drawShareCard(canvas, {
            kicker: `${leagueName} · Full Time`.toUpperCase(),
            home: H.name, away: A.name,
            middle: `FT ${hs}–${as}`,
            sub: venue || rp.standfirst.slice(0, 60),
            tag: "REPORT"
        });
    }
    const root = document.getElementById("share-row");
    if (root && typeof wireShareButtons === "function") {
        wireShareButtons(root, {
            title: `${H.name} ${hs}–${as} ${A.name} report`,
            text: `${rp.headline}.`,
            url: window.location.href,
            filename: (typeof shareFileName === "function") ? shareFileName(`report-${H.code}-${hs}-${as}-${A.code}`) : `report-${H.code}-${hs}-${as}-${A.code}.png`
        });
    }
}

function matchHighlightUrl(homeTeam, awayTeam, leagueName) {
    const q = `${homeTeam || ""} vs ${awayTeam || ""} highlights ${leagueName || ""}`.trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

async function bootReport() {
    const box = document.getElementById("report-body");
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
        box.innerHTML = `<h1>${t("report.nfh1")}</h1><div class="window-strip">${t("report.notfound")}</div>`;
        return;
    }

    const cleanSlug = cleanLeagueSlug(league);
    const leagueName = getLeagueName(cleanSlug);

    let ev = null;
    if (!String(id).startsWith("fb-") && !String(id).startsWith("demo-")) {
        ev = await fetchReportEvent(cleanSlug, id, date);
    }
    if (!ev) {
        if (sessionMatch && (String(sessionMatch.id) === String(id) || String(sessionMatch.espnEventId) === String(id) || (sessionMatch.homeTeam && sessionMatch.awayTeam))) {
            ev = simMatchToReportEvent(sessionMatch);
        }
    }

    if (!ev) {
        box.innerHTML = `<h1>${t("report.unh1")}</h1><div class="window-strip">${t("report.unavail")} <button class="btn btn-login btn-sm" id="report-retry-btn" style="margin-left:8px;">Retry</button> or return to <a href="index.html">Scores</a>.</div>`;
        const retry = document.getElementById("report-retry-btn");
        if (retry) retry.addEventListener("click", bootReport);
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
        id: String((hc.team && hc.team.id) || ""),
        logo: reportTeamLogo(hc.team)
    };
    const A = {
        name: (ac.team && (ac.team.displayName || ac.team.shortDisplayName)) || "Away",
        code: (ac.team && (ac.team.abbreviation || ac.team.shortDisplayName)) || "AWY",
        id: String((ac.team && ac.team.id) || ""),
        logo: reportTeamLogo(ac.team)
    };
    if (st.state !== "post" && !st.completed) {
        const isLive = st.state === "in";
        const ymd = ymdFromISO(ev.date) || date;
        box.innerHTML = `<span class="league-tag">${esc(leagueName)}</span>`
            + `<h1 style="margin-top:10px;">${esc(H.name)} vs ${esc(A.name)}</h1>`
            + `<div class="window-strip">${isLive ? t("report.underway") : t("report.notplayed")} `
            + (isLive ? `<a href="match.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(ymd)}">${t("report.scoreslink")}</a>.` : `<a href="preview.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(ymd)}">${t("hub.readpreview")}</a>`)
            + `</div>`
            + `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">`
            + (isLive ? `<a class="btn btn-primary btn-sm" href="match.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(ymd)}">⚡ Live Match Centre</a>` : `<a class="btn btn-primary btn-sm" href="preview.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(ymd)}">📰 Match Preview</a>`)
            + `<a class="btn btn-login btn-sm" href="index.html">&larr; Back to Scores</a>`
            + `</div>`;
        return;
    }
    box.innerHTML = `<p class="loading-note">${t("report.loading")}</p>`;
    const hs = parseInt(hc.score, 10), as = parseInt(ac.score, 10);
    const venue = (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "";
    const attendance = parseInt(comp.attendance, 10) || 0;
    const parsed = parseReportEvents(comp.details, H.id, A.id);
    const [rows, next] = await Promise.all([fetchReportTable(cleanSlug), fetchNextFixtures(cleanSlug, H, A)]);
    const hr = reportMatchRow(H, rows), ar = reportMatchRow(A, rows);
    const rp = buildReport({
        seed: `${cleanSlug}:${id}`, leagueName, venue, attendance,
        h: { name: H.name, code: H.code, pos: hr ? hr.rank : null, pts: hr ? hr.pts : 0 },
        a: { name: A.name, code: A.code, pos: ar ? ar.rank : null, pts: ar ? ar.pts : 0 },
        hs: isNaN(hs) ? 0 : hs, as: isNaN(as) ? 0 : as,
        goals: parsed.goals, reds: parsed.reds, yellows: parsed.yellows,
        stats: { h: parseSideStats(hc), a: parseSideStats(ac) }
    });
    try { 
        const seoTitle = `${H.name} ${hs}–${as} ${A.name} Report - ${leagueName} Result, Goals & Stats | ScoreHub`;
        document.title = seoTitle;
        if (window.SEO) {
            SEO.setTitle(seoTitle);
            SEO.setDescription(`${rp.standfirst} ${rp.paragraphs[0] ? rp.paragraphs[0].slice(0,120) : ''} Final score ${hs}-${as}.`);
            SEO.setCanonical(window.location.href.split('#')[0]);
            SEO.setImage(H.logo || A.logo || '');
            SEO.setKeywords([H.name, A.name, leagueName, 'report', 'result', `${hs}-${as}`, 'goals', 'ScoreHub']);
            SEO.breadcrumb([
                { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
                { name: 'Reports', url: 'https://livematches.hyper.co.ke/previews.html' },
                { name: `${H.name} ${hs}-${as} ${A.name}`, url: window.location.href.split('#')[0] }
            ]);
            SEO.sportsEvent({
                name: `${H.name} vs ${A.name}`,
                description: rp.standfirst,
                startDate: ev.date,
                venue: venue,
                league: leagueName,
                homeTeam: H.name,
                awayTeam: A.name,
                homeLogo: H.logo,
                awayLogo: A.logo,
                sport: 'Soccer',
                eventStatus: 'https://schema.org/EventCompleted'
            });
            SEO.newsArticle({
                type: 'NewsArticle',
                headline: rp.headline,
                description: rp.standfirst,
                image: H.logo,
                datePublished: ev.date,
                author: 'ScoreHub',
                url: window.location.href.split('#')[0]
            });
        }
    } catch (e) {}
    const logoImg = (u) => u ? `<img class="pred-logo" style="width:26px;height:26px;" src="${esc(u)}" alt="" loading="lazy" onerror="this.remove()">` : "";
    const nextBox = (next.H || next.A)
        ? `<div class="report-next"><h3>${t("report.next")}</h3>`
        + (next.H ? `<span>🔜 ${esc(H.name)} face ${esc(next.H.opp)} (${esc(formatNextDate(next.H.date))}).</span>` : "")
        + (next.A ? `<span>🔜 ${esc(A.name)} face ${esc(next.A.opp)} (${esc(formatNextDate(next.A.date))}).</span>` : "")
        + `</div>` : "";
    box.innerHTML = `<span class="league-tag">${esc(leagueName)}</span> <span class="league-tag">${t("report.tag")}</span>`
        + `<h1 style="margin-top:10px;">${esc(rp.headline)}</h1>`
        + `<p class="legal-updated">${esc(formatReportDate(ev.date))}${venue ? ` · ${esc(venue)}` : ""}</p>`
        + `<div class="report-scoreline">${logoImg(H.logo)}<span>${esc(H.name)} ${isNaN(hs) ? "–" : hs}–${isNaN(as) ? "–" : as} ${esc(A.name)}</span>${logoImg(A.logo)}</div>`
        + `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px 0;">`
        + `<a class="btn btn-login btn-sm highlight-btn" href="${matchHighlightUrl(H.name, A.name, leagueName)}" target="_blank" rel="noopener">🎥 Watch Match Highlights</a>`
        + `<a class="btn btn-login btn-sm" href="match.html?league=${esc(cleanSlug)}&id=${esc(id)}&date=${esc(date || ymdFromISO(ev.date))}">⚡ Match Centre</a>`
        + `<a class="btn btn-login btn-sm" href="standings.html?league=${esc(cleanSlug)}">📊 Table</a>`
        + `</div>`
        + `<p class="preview-standfirst">${esc(rp.standfirst)}</p>`
        + rp.paragraphs.map((p) => `<p class="preview-p">${esc(p)}</p>`).join("")
        + timelineHTML(parsed.goals, parsed.reds, H.code, A.code)
        + reportStatsTableHTML(H.code, A.code, parseSideStats(hc), parseSideStats(ac))
        + nextBox
        + `<p class="preview-note">Auto-generated by ScoreHub from goals, cards, match stats and league tables — original content, written by our template engine, not a journalist. Data: ESPN. <a href="${matchHighlightUrl(H.name, A.name, leagueName)}" target="_blank" rel="noopener" style="color:#ff4b4b;">Watch highlights on YouTube ↗</a></p>`
        + `<p class="preview-note"><a href="previews.html" style="color:var(--primary);">&larr; All previews &amp; reports</a></p>`
        + (typeof shareSectionHTML === "function" ? shareSectionHTML() : "");
    wireReportShare(H, A, isNaN(hs) ? 0 : hs, isNaN(as) ? 0 : as, venue, leagueName, rp);
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootReport);
}

window.__rerenderLang = function () { try { bootReport(); } catch (e) {} };

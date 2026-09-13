/* ScoreHub Match Preview — original auto-generated previews built from
   fixtures, league tables and recent form. No borrowed prose, all numbers.
   Pure helpers (ord, hashStr, pickSeeded, normTeamName, teamMatchesRow,
   matchTeamRow, sameClub, lastFormDates, summarizeForm, formPoints,
   oddsFavourite, countdownText, buildPreview) are top-level and
   side-effect free for testability. */

const PREVIEW_LEAGUES = {
    "eng.1": "Premier League",
    "esp.1": "La Liga",
    "ita.1": "Serie A",
    "ger.1": "Bundesliga",
    "fra.1": "Ligue 1",
    "uefa.champions": "Champions League"
};

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

function parsePreviewTable(data) {
    if (!data || !Array.isArray(data.children) || !data.children.length) return [];
    const child = data.children[0] || {};
    const node = child.standings || (child.children && child.children[0] && child.children[0].standings) || null;
    if (!node || !Array.isArray(node.entries)) return [];
    const rows = node.entries.map((entry, i) => {
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
        `Form reads ${fsum} for ${side.name}.`
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
        bits.push(`Defensively solid of late, with ${cs} clean sheets in their last five.`);
    }
    return bits.join(" ");
}

function buildVerdict(h, a) {
    const hf = formPoints(h.form), af = formPoints(a.form);
    const haveForm = h.form.length >= 2 && a.form.length >= 2;
    const haveTable = !!(h.pos && a.pos);
    if (!haveForm && !haveTable) {
        return { pick: "Too close to call", confidence: "No data", reason: "There isn't enough recent form or table data to split these sides — check back closer to kickoff." };
    }
    const posEdge = haveTable ? (a.pos - h.pos) * 0.6 : 0;
    const homeScore = (haveForm ? hf : 7) + 1.5 + posEdge;
    const awayScore = (haveForm ? af : 7);
    const diff = homeScore - awayScore;
    let pick, conf;
    if (diff >= 4) { pick = `${h.name} win`; conf = "Strong"; }
    else if (diff >= 1.5) { pick = `${h.name} win`; conf = "Moderate"; }
    else if (diff <= -3) { pick = `${a.name} win`; conf = diff <= -5 ? "Strong" : "Moderate"; }
    else { pick = "Draw"; conf = "Lean"; }
    const reasons = [];
    if (haveForm) reasons.push(`${h.code} have taken ${hf} points from their last five to ${a.code}'s ${af}`);
    if (haveTable) {
        reasons.push(h.pos === a.pos
            ? `they sit level in the table`
            : `${h.pos < a.pos ? h.code + " sit higher in the table" : a.code + " sit higher in the table"} (${ord(h.pos)} vs ${ord(a.pos)})`);
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
    const base = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
    const urls = [`${base}?dates=${dateYmd}&limit=100`, `${base}?limit=100`];
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

async function fetchPreviewTable(slug) {
    const path = `/apis/v2/sports/soccer/${slug}/standings?region=us&lang=en&contentorigin=espn`;
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
    const seen = new Set();
    const out = [];
    const results = await Promise.allSettled(dates.map((d) =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${d}&limit=100`).then((r) => {
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

function previewOdds(comp) {
    const o = comp && Array.isArray(comp.odds) && comp.odds[0];
    if (!o) return null;
    const ml = (x) => x && (x.moneyLine != null ? x.moneyLine : x.summary);
    const out = { home: ml(o.homeTeamOdds), draw: ml(o.drawOdds), away: ml(o.awayTeamOdds) };
    return (out.home == null && out.draw == null && out.away == null) ? null : out;
}

function formatKickoffLong(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

function formatGameDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { day: "numeric", month: "short" });
}

// --- Render ---

function formColHTML(name, code, logo, form) {
    const last5 = form.slice(0, 5);
    const chips = last5.length
        ? `<div class="form-chips">` + last5.map((g) =>
            `<span class="form-chip ${g.res}" title="${esc(formatGameDate(g.date))} · ${g.ha === "H" ? "Home" : "Away"} vs ${esc(g.oppName)} ${g.gf}–${g.ga}">${g.res}</span>`
        ).join("") + `</div>`
        : `<p class="loading-note" style="padding:4px 0;">No recent results found.</p>`;
    const games = last5.map((g) =>
        `<div class="form-game">${esc(formatGameDate(g.date))} · ${g.ha} · <b>${g.gf}–${g.ga}</b> vs ${esc(g.opp)}</div>`
    ).join("");
    return `<div class="form-col"><h3>`
        + (logo ? `<img class="pred-logo" src="${esc(logo)}" alt="" loading="lazy" onerror="this.remove()">` : "")
        + `${esc(name)} <span style="color:var(--text-muted);font-weight:400;">· last five</span></h3>`
        + chips + games + `</div>`;
}

function compareTableHTML(h, a) {
    const dash = "–";
    const row = (label, hv, av) => `<tr><td>${label}</td><td>${hv}</td><td>${av}</td></tr>`;
    const wdl = (s) => (s.played ? `${s.w}–${s.d}–${s.l}` : dash);
    return `<div class="full-table-wrap compare-wrap"><table class="full-table"><thead><tr>`
        + `<th class="col-team" style="text-align:left;">${esc(h.code)}</th><th></th><th>${esc(a.code)}</th>`
        + `</tr></thead><tbody>`
        + row("Position", h.pos ? ord(h.pos) : dash, a.pos ? ord(a.pos) : dash)
        + row("Played", h.played || dash, a.played || dash)
        + row("W–D–L", wdl(h), wdl(a))
        + row("Goals for", h.played ? h.gf : dash, a.played ? a.gf : dash)
        + row("Goals against", h.played ? h.ga : dash, a.played ? a.ga : dash)
        + row("Form points (last 5)", formPoints(h.form), formPoints(a.form))
        + `</tbody></table></div>`;
}

async function bootPreview() {
    const box = document.getElementById("preview-body");
    let league = "", id = "", date = "";
    try {
        const q = new URLSearchParams(window.location.search);
        league = q.get("league") || ""; id = q.get("id") || ""; date = q.get("date") || "";
    } catch (e) {}
    if (!league || !id) {
        box.innerHTML = `<h1>Preview not found</h1><div class="window-strip">Pick a fixture from <a href="index.html">Scores</a> or <a href="predictions.html">Predictions</a> to read its preview.</div>`;
        return;
    }
    const leagueName = PREVIEW_LEAGUES[league] || "Football";
    const ev = await fetchPreviewEvent(league, id, date);
    if (!ev) {
        box.innerHTML = `<h1>Preview unavailable</h1><div class="window-strip">Couldn't find this fixture — it may have been rescheduled. Try <a href="index.html">Scores</a> for the latest fixtures.</div>`;
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
        const score = (st.state === "in")
            ? `${hc.score != null ? hc.score : "–"} – ${ac.score != null ? ac.score : "–"}`
            : `${hc.score != null ? hc.score : "–"} – ${ac.score != null ? ac.score : "–"} FT`;
        box.innerHTML = `<span class="league-tag">${esc(leagueName)}</span>`
            + `<h1 style="margin-top:10px;">${esc(H.name)} ${esc(score)} ${esc(A.name)}</h1>`
            + `<div class="window-strip">This match is ${st.state === "in" ? "underway" : "finished"} — previews cover upcoming fixtures only. Follow it on <a href="index.html">Scores</a>.</div>`;
        return;
    }
    box.innerHTML = `<p class="loading-note">Crunching form and table data&hellip;</p>`;
    const venueFull = (comp.venue && (comp.venue.fullName || comp.venue.shortName)) || "";
    const venueCity = (comp.venue && comp.venue.address && comp.venue.address.city) || "";
    const venue = [venueFull, venueCity].filter(Boolean).join(", ");
    const [rows, formEvents] = await Promise.all([
        fetchPreviewTable(league),
        fetchFormEvents(league, lastFormDates(new Date(), 5, 3))
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
    const oddsFav = oddsFavourite(previewOdds(comp));
    const pv = buildPreview({
        seed: `${league}:${id}`, leagueName,
        venue, venueShort: venueFull || "home",
        home: h, away: a, oddsFav
    });
    try { document.title = `${H.name} vs ${A.name} preview — ScoreHub`; } catch (e) {}
    box.innerHTML = `<span class="league-tag">${esc(leagueName)}</span> <span class="league-tag">Match Preview</span>`
        + `<h1 style="margin-top:10px;">${esc(pv.headline)}</h1>`
        + `<p class="legal-updated">${esc(formatKickoffLong(ev.date))} · ${esc(countdownText(ev.date, Date.now()))}${venue ? ` · ${esc(venue)}` : ""}</p>`
        + `<p class="preview-standfirst">${esc(pv.standfirst)}</p>`
        + pv.paragraphs.map((p) => `<p class="preview-p">${esc(p)}</p>`).join("")
        + `<div class="form-cols">${formColHTML(h.name, h.code, h.logo, h.form)}${formColHTML(a.name, a.code, a.logo, a.form)}</div>`
        + compareTableHTML(h, a)
        + `<div class="preview-verdict"><h3>ScoreHub says <span style="color:var(--text-muted);font-weight:400;">· ${esc(pv.verdict.confidence)} ${esc(pv.verdict.confidence === "No data" ? "" : "confidence")}</span></h3>`
        + `<div class="pick">${esc(pv.verdict.pick)}</div><p>${esc(pv.verdict.reason)}</p></div>`
        + `<p class="preview-note">Auto-generated by ScoreHub from fixtures, league tables and recent results — original content, written by our template engine, not a journalist. The verdict is a stats-based lean for fun, not betting advice. Data: ESPN.</p>`
        + `<p class="preview-note">Fancy a go yourself? <a href="predictions.html" style="color:var(--primary);">Make your prediction →</a></p>`;
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootPreview);
}

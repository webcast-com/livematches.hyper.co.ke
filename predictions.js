/* Predictions game — pick scores on upcoming ESPN fixtures, earn points when
   matches finish. Picks persist in localStorage and settle automatically via
   the scoreboard ?dates= endpoint. Pure helpers (outcomeOf, scorePrediction,
   ymdOf, shiftYmd, parseFixture, formatKickoff) are top-level and
   side-effect free so they can be unit-tested outside a browser. */

const PRED_LEAGUES = [
    { slug: "eng.1", code: "EPL", name: "Premier League" },
    { slug: "esp.1", code: "LaLiga", name: "La Liga" },
    { slug: "ita.1", code: "SerieA", name: "Serie A" },
    { slug: "ger.1", code: "Bundesliga", name: "Bundesliga" },
    { slug: "fra.1", code: "Ligue1", name: "Ligue 1" },
    { slug: "uefa.champions", code: "UCL", name: "Champions League" }
];
const PRED_STORE_KEY = "scorehub-predictions-v1";

function outcomeOf(h, a) { return h > a ? "H" : h < a ? "A" : "D"; }

function scorePrediction(ph, pa, rh, ra) {
    if (ph === rh && pa === ra) return 3;
    return outcomeOf(ph, pa) === outcomeOf(rh, ra) ? 1 : 0;
}

function ymdOf(d) {
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}

function shiftYmd(ymd, delta) {
    const d = new Date(parseInt(ymd.slice(0, 4), 10), parseInt(ymd.slice(4, 6), 10) - 1, parseInt(ymd.slice(6, 8), 10));
    d.setDate(d.getDate() + delta);
    return ymdOf(d);
}

function predTeamLogo(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}

function parseFixture(ev, L) {
    const comp = (ev.competitions && ev.competitions[0]) || {};
    const cs = comp.competitors || [];
    const h = cs.find((c) => c.homeAway === "home") || {};
    const a = cs.find((c) => c.homeAway === "away") || {};
    const st = (ev.status && ev.status.type) || {};
    const num = (v) => { const n = parseInt(v, 10); return isNaN(n) ? null : n; };
    const nm = (c, fb) => (c.team && (c.team.displayName || c.team.shortDisplayName)) || fb;
    const cd = (c, fb) => (c.team && (c.team.abbreviation || c.team.shortDisplayName)) || fb;
    return {
        id: String(ev.id),
        league: L.slug, code: L.code, leagueName: L.name,
        date: ev.date || "",
        state: st.state || "",
        completed: !!st.completed,
        home: nm(h, "Home"), hc: cd(h, "HOM"),
        away: nm(a, "Away"), ac: cd(a, "AWY"),
        hl: predTeamLogo(h.team), al: predTeamLogo(a.team),
        hs: num(h.score), as: num(a.score)
    };
}

function formatKickoff(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function loadStoreData() {
    try {
        const raw = (typeof localStorage !== "undefined") && localStorage.getItem(PRED_STORE_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === "object" ? o : {};
    } catch (e) { return {}; }
}

function saveStoreData(store) {
    try {
        if (typeof localStorage !== "undefined") localStorage.setItem(PRED_STORE_KEY, JSON.stringify(store));
    } catch (e) {}
}

const DEMO_TEAMS = [
    ["Arsenal", "ARS"], ["Chelsea", "CHE"], ["Liverpool", "LIV"], ["Man City", "MCI"],
    ["Barcelona", "BAR"], ["Real Madrid", "RMA"], ["Bayern", "BAY"], ["Dortmund", "BVB"],
    ["Inter", "INT"], ["PSG", "PSG"], ["Napoli", "NAP"], ["Atlético", "ATM"]
];

function demoFixtures() {
    const now = Date.now();
    const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11]];
    return pairs.map((p, i) => ({
        id: "demo-" + (i + 1),
        league: "demo", code: "Demo", leagueName: "Demo fixtures",
        date: new Date(now + (i + 1) * 3 * 3600 * 1000).toISOString(),
        state: "pre", completed: false,
        home: DEMO_TEAMS[p[0]][0], hc: DEMO_TEAMS[p[0]][1],
        away: DEMO_TEAMS[p[1]][0], ac: DEMO_TEAMS[p[1]][1],
        hl: "", al: "",
        hs: null, as: null
    }));
}

function randomScore() {
    const r = Math.random();
    return r < 0.28 ? 0 : r < 0.62 ? 1 : r < 0.85 ? 2 : 3;
}

let predFixtures = [];
let predFilter = "All";
let predStore = {};
let predDemo = false;

function isLocked(f) {
    return f.state !== "pre" || new Date(f.date).getTime() <= Date.now();
}

function fixtureCardHTML(f) {
    const saved = predStore[f.id] || {};
    const locked = isLocked(f);
    const ph = saved.ph != null ? saved.ph : "";
    const pa = saved.pa != null ? saved.pa : "";
    const status = locked
        ? (saved.ph != null && saved.pa != null ? "Locked — settling after full time" : "Locked — kicked off")
        : (saved.ph != null && saved.pa != null ? `<span class="saved">✓ Saved</span>` : "Tap a score to predict");
    return `<div class="pred-card" data-id="${esc(f.id)}">`
        + `<div class="pred-meta"><span class="league-tag">${esc(f.code)}</span><span>${esc(formatKickoff(f.date))}</span></div>`
        + `<div class="pred-teams"><span class="pred-team">${f.hl ? `<img class="pred-logo" src="${esc(f.hl)}" alt="" loading="lazy" onerror="this.remove()">` : ""}${esc(f.home)}</span>`
        + `<span class="pred-inputs">`
        + `<input class="pred-score" type="number" min="0" max="20" inputmode="numeric" data-id="${esc(f.id)}" data-side="ph" value="${ph}" ${locked ? "disabled" : ""} aria-label="${esc(f.home)} score">`
        + `<em>–</em>`
        + `<input class="pred-score" type="number" min="0" max="20" inputmode="numeric" data-id="${esc(f.id)}" data-side="pa" value="${pa}" ${locked ? "disabled" : ""} aria-label="${esc(f.away)} score">`
        + `</span><span class="pred-team right">${esc(f.away)}${f.al ? `<img class="pred-logo" src="${esc(f.al)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span></div>`
        + `<div class="pred-status">${status}</div></div>`;
}

function renderFixtures() {
    const list = document.getElementById("pred-list");
    const items = predFixtures.filter((f) => predFilter === "All" || f.code === predFilter);
    if (!items.length) {
        list.innerHTML = `<p class="loading-note">No upcoming ${predFilter === "All" ? "" : predFilter + " "}fixtures right now.</p>`;
        return;
    }
    list.innerHTML = items.map(fixtureCardHTML).join("");
}

function onPredChange(e) {
    const input = e.target;
    if (!input || !input.classList || !input.classList.contains("pred-score")) return;
    const f = predFixtures.find((x) => String(x.id) === String(input.dataset.id));
    if (!f) return;
    if (isLocked(f)) { renderFixtures(); return; }
    const card = input.closest(".pred-card");
    const get = (side) => {
        const el = card.querySelector(`input[data-side="${side}"]`);
        const n = parseInt(el.value, 10);
        return isNaN(n) ? null : Math.max(0, Math.min(20, n));
    };
    const ph = get("ph"), pa = get("pa");
    if (ph == null || pa == null) return;
    predStore[f.id] = {
        league: f.league, code: f.code, leagueName: f.leagueName, date: f.date,
        home: f.home, hc: f.hc, away: f.away, ac: f.ac,
        hl: f.hl || "", al: f.al || "",
        ph, pa, settled: false, rh: null, ra: null, points: 0
    };
    saveStoreData(predStore);
    const status = card.querySelector(".pred-status");
    if (status) status.innerHTML = `<span class="saved">✓ Saved</span>`;
}

async function fetchScoreboardDay(league, ymd) {
    const tries = [ymd, shiftYmd(ymd, -1), shiftYmd(ymd, 1)];
    for (const t of tries) {
        try {
            const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${t}&limit=100`);
            if (!r.ok) continue;
            const j = await r.json();
            if (j && Array.isArray(j.events) && j.events.length) return j.events;
        } catch (e) { /* try next day bucket */ }
    }
    return [];
}

async function settlePredictions() {
    const now = Date.now();
    const pending = Object.keys(predStore).filter((id) => {
        const p = predStore[id];
        return p && !p.settled && p.ph != null && p.pa != null
            && p.league !== "demo" && new Date(p.date).getTime() <= now;
    });
    if (!pending.length) return;
    const groups = {};
    pending.forEach((id) => {
        const p = predStore[id];
        const key = p.league + "|" + ymdOf(new Date(p.date));
        if (!groups[key]) groups[key] = { league: p.league, ymd: ymdOf(new Date(p.date)), ids: [] };
        groups[key].ids.push(id);
    });
    for (const key of Object.keys(groups)) {
        const g = groups[key];
        const events = await fetchScoreboardDay(g.league, g.ymd);
        for (const id of g.ids) {
            const ev = events.find((x) => String(x.id) === String(id));
            if (!ev) continue;
            const f = parseFixture(ev, { slug: g.league, code: predStore[id].code, name: predStore[id].leagueName });
            if (!f.completed || f.hs == null || f.as == null) continue;
            predStore[id].settled = true;
            predStore[id].rh = f.hs;
            predStore[id].ra = f.as;
            predStore[id].points = scorePrediction(predStore[id].ph, predStore[id].pa, f.hs, f.as);
        }
    }
    saveStoreData(predStore);
}

function renderResults() {
    const box = document.getElementById("pred-results");
    const bar = document.getElementById("pred-scorebar");
    const settled = Object.keys(predStore)
        .map((id) => predStore[id])
        .filter((p) => p && p.settled)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!settled.length) {
        bar.hidden = true;
        box.innerHTML = `<p class="loading-note">No settled predictions yet — come back after kickoff.</p>`;
        return;
    }
    const total = settled.reduce((s, p) => s + (p.points || 0), 0);
    const exact = settled.filter((p) => p.points === 3).length;
    const outcome = settled.filter((p) => p.points === 1).length;
    bar.hidden = false;
    bar.innerHTML = `<span>⭐ ${total} pts</span><span>🎯 ${exact} exact</span><span>✓ ${outcome} correct outcome</span><span>· ${settled.length} settled</span>`;
    box.innerHTML = settled.map((p) => {
        const label = p.points === 3 ? "★ Exact!" : p.points === 1 ? "✓ Outcome" : `<span class="miss">✗ Miss</span>`;
        return `<div class="pred-result"><span class="league-tag">${esc(p.code)}</span>`
            + `<span>${p.hl ? `<img class="pred-logo-mini" src="${esc(p.hl)}" alt="" loading="lazy" onerror="this.remove()">` : ""}<strong>${esc(p.hc)} ${p.rh}–${p.ra} ${esc(p.ac)}</strong>${p.al ? `<img class="pred-logo-mini" src="${esc(p.al)}" alt="" loading="lazy" onerror="this.remove()">` : ""} · you said ${p.ph}–${p.pa} · ${label}</span>`
            + `<span class="pts">+${p.points}</span></div>`;
    }).join("");
}

function simulateDemo() {
    let n = 0;
    predFixtures.forEach((f) => {
        const p = predStore[f.id];
        if (!p || p.settled || p.ph == null || p.pa == null) return;
        p.rh = randomScore();
        p.ra = randomScore();
        p.points = scorePrediction(p.ph, p.pa, p.rh, p.ra);
        p.settled = true;
        n++;
    });
    saveStoreData(predStore);
    renderResults();
    const btn = document.getElementById("pred-simulate");
    if (btn) {
        btn.disabled = true;
        btn.textContent = n ? "Simulated ✓" : "Predict first, then simulate";
        if (!n) btn.disabled = false;
    }
}

async function loadFixtures() {
    const list = document.getElementById("pred-list");
    list.innerHTML = `<p class="loading-note">Loading upcoming fixtures&hellip;</p>`;
    const results = await Promise.allSettled(PRED_LEAGUES.map((L) =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${L.slug}/scoreboard?limit=50`).then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        })
    ));
    const out = [];
    results.forEach((r, i) => {
        if (r.status !== "fulfilled" || !r.value || !Array.isArray(r.value.events)) return;
        r.value.events.forEach((ev) => {
            const f = parseFixture(ev, PRED_LEAGUES[i]);
            if (f.state === "pre" && f.date) out.push(f);
        });
    });
    out.sort((a, b) => new Date(a.date) - new Date(b.date));
    const demoBox = document.getElementById("pred-demo");
    if (!out.length) {
        predFixtures = demoFixtures();
        predDemo = true;
        demoBox.hidden = false;
    } else {
        predFixtures = out.slice(0, 12);
        predDemo = false;
        demoBox.hidden = true;
    }
    renderFixtures();
}

async function bootPredictions() {
    predStore = loadStoreData();
    document.querySelectorAll("#pred-chips .standings-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#pred-chips .standings-tab").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            predFilter = btn.dataset.league || "All";
            renderFixtures();
        });
    });
    document.getElementById("pred-list").addEventListener("change", onPredChange);
    const sim = document.getElementById("pred-simulate");
    if (sim) sim.addEventListener("click", simulateDemo);
    const clear = document.getElementById("pred-clear");
    if (clear) clear.addEventListener("click", () => {
        if (!confirm("Reset all predictions and points?")) return;
        predStore = {};
        saveStoreData(predStore);
        renderFixtures();
        renderResults();
    });
    renderResults();
    await loadFixtures();
    await settlePredictions();
    renderFixtures();
    renderResults();
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootPredictions);
}

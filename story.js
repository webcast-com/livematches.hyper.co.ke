/* On-site story view — renders a news-feed article (passed via
   sessionStorage) with hero art, club crests, a live event scorecard and
   related stories, all without leaving ScoreHub. Pure helpers (storyTeams,
   storyEvent, storyLeagueCode, storyLeagueSlug, storyURL, storyImage,
   relatedPick, esc, formatStoryDate) are top-level and side-effect free
   for testability. */

const STORY_SLUGS = {
    EPL: "eng.1", LaLiga: "esp.1", SerieA: "ita.1",
    Bundesliga: "ger.1", Ligue1: "fra.1", UCL: "uefa.champions"
};

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function storyTeams(a) {
    return ((a && a.categories) || [])
        .filter((c) => c.type === "team" && c.team && c.team.id)
        .map((c) => ({
            abbr: c.team.abbreviation || c.description || "",
            id: c.team.id
        }))
        .slice(0, 4);
}

function storyTeamLogoURL(id) {
    return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
}

function storyEvent(a) {
    const cats = (a && a.categories) || [];
    for (const c of cats) {
        if (c.type === "event" && c.eventId) {
            return { id: String(c.eventId), league: (c.event && c.event.league) || "" };
        }
    }
    return null;
}

function storyLeagueCode(a) {
    const cats = (a && a.categories) || [];
    for (const c of cats) {
        if (c.type === "league" && c.leagueId !== 600) {
            const d = (c.description || "").toLowerCase();
            if (d.indexOf("champions league") !== -1) return "UCL";
            if (d.indexOf("premier league") !== -1) return "EPL";
            if (d.indexOf("liga") !== -1 || d.indexOf("spanish") !== -1) return "LaLiga";
            if (d.indexOf("serie a") !== -1 || d.indexOf("italian") !== -1) return "SerieA";
            if (d.indexOf("bundesliga") !== -1 || d.indexOf("german") !== -1) return "Bundesliga";
            if (d.indexOf("ligue") !== -1 || d.indexOf("french") !== -1) return "Ligue1";
            return "General";
        }
    }
    return "General";
}

function storyLeagueSlug(a) {
    return STORY_SLUGS[storyLeagueCode(a)] || "eng.1";
}

function storyURL(a) {
    return (a && a.links && a.links.web && a.links.web.href) || "https://www.espn.com/football/";
}

function storyImage(a) {
    return (a && a.images && a.images[0] && a.images[0].url) || "";
}

function formatStoryDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(appLocale(), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function relatedPick(articles, currentId, teamIds, n) {
    const scored = [];
    for (const a of (articles || [])) {
        if (!a || String(a.id) === String(currentId)) continue;
        const ids = storyTeams(a).map((t) => String(t.id));
        const shared = ids.filter((id) => teamIds.indexOf(id) !== -1).length;
        scored.push({ a, shared, t: new Date(a.published).getTime() || 0 });
    }
    scored.sort((x, y) => (y.shared - x.shared) || (y.t - x.t));
    return scored.slice(0, n || 4).map((s) => s.a);
}

function storyYmd(d) {
    const valid = d && !isNaN(d.getTime()) ? d : new Date();
    const p = (n) => String(n).padStart(2, "0");
    return valid.getFullYear() + p(valid.getMonth() + 1) + p(valid.getDate());
}

function storyShiftYmd(ymd, delta) {
    if (!ymd || ymd.length < 8) return storyYmd(new Date());
    const y = parseInt(ymd.slice(0, 4), 10);
    const m = parseInt(ymd.slice(4, 6), 10) - 1;
    const dNum = parseInt(ymd.slice(6, 8), 10);
    if (isNaN(y) || isNaN(m) || isNaN(dNum)) return storyYmd(new Date());
    const d = new Date(y, m, dNum);
    d.setDate(d.getDate() + delta);
    return storyYmd(d);
}

function storyTeamLogo(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}

async function fetchStoryEvent(league, eventId, published) {
    if (!league || !eventId) return null;
    const pubDate = published && !isNaN(new Date(published).getTime()) ? new Date(published) : new Date();
    const base = storyYmd(pubDate);
    const days = [base, storyShiftYmd(base, -1), storyShiftYmd(base, 1)];
    for (const day of days) {
        try {
            const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${day}&limit=100`);
            if (!r.ok) continue;
            const j = await r.json();
            const ev = j && Array.isArray(j.events) && j.events.find((x) => String(x.id) === String(eventId));
            if (ev) return ev;
        } catch (e) { /* try next day bucket */ }
    }
    return null;
}

function eventCardHTML(ev) {
    const comp = (ev.competitions && ev.competitions[0]) || {};
    const cs = comp.competitors || [];
    const h = cs.find((c) => c.homeAway === "home") || {};
    const a = cs.find((c) => c.homeAway === "away") || {};
    const st = (ev.status && ev.status.type) || {};
    const nm = (c, fb) => esc((c.team && (c.team.displayName || c.team.shortDisplayName)) || fb);
    const logo = (c) => {
        const u = storyTeamLogo(c.team);
        return u ? `<img class="pred-logo" src="${esc(u)}" alt="" loading="lazy" onerror="this.remove()">` : "";
    };
    const isPre = st.state === "pre";
    const when = isPre ? formatStoryDate(ev.date) : esc(st.shortDetail || "");
    const score = isPre ? "vs" : `${h.score != null ? h.score : "–"} – ${a.score != null ? a.score : "–"}`;
    return `<div class="story-event"><div class="pred-meta"><span class="league-tag">${t("story.mc")}</span><span>${when}</span></div>`
        + `<div class="story-event-teams">${logo(h)}<span>${nm(h, "Home")}</span>`
        + `<span class="story-event-score">${esc(score)}</span>`
        + `<span>${nm(a, "Away")}</span>${logo(a)}</div></div>`;
}

function relatedCardHTML(a) {
    const img = storyImage(a);
    return `<a class="story-rel-card" href="story.html" data-story="${a.id}">`
        + (img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : "")
        + `<div style="min-width:0;"><h4>${esc(a.headline || "Untitled")}</h4><span>${esc(formatStoryDate(a.published))}</span></div></a>`;
}

let storyRelatedById = {};

async function loadStoryEvent() {
    const slot = document.getElementById("story-event");
    if (!slot || !slot.dataset.eventId || !slot.dataset.league) return;
    const ev = await fetchStoryEvent(slot.dataset.league, slot.dataset.eventId, slot.dataset.published || "");
    if (ev) slot.innerHTML = eventCardHTML(ev);
}

async function loadStoryRelated() {
    const box = document.getElementById("story-related");
    if (!box || !box.dataset.slug) return;
    try {
        const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${box.dataset.slug}/news?limit=20`);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();
        const mine = (box.dataset.teams || "").split(",").filter(Boolean);
        const picks = relatedPick(j.articles, box.dataset.current, mine, 4);
        if (!picks.length) {
            box.innerHTML = `<p class="loading-note">${t("story.norel")}</p>`;
            return;
        }
        storyRelatedById = {};
        picks.forEach((a) => { storyRelatedById[String(a.id)] = a; });
        box.innerHTML = picks.map(relatedCardHTML).join("");
    } catch (e) {
        box.innerHTML = `<p class="loading-note">${t("story.relerr")}</p>`;
    }
}

function bootStory() {
    const box = document.getElementById("story-body");
    let art = null;
    try { art = JSON.parse(sessionStorage.getItem("scorehub-story") || "null"); } catch (e) {}
    if (!art || !art.headline) {
        box.innerHTML = `<h1>${t("story.notfound")}</h1>`
            + `<p class="legal-updated">${t("story.expired")}</p>`
            + `<div class="window-strip">${t("story.gohome")}</div>`;
        return;
    }
    // Declared before the SEO block below — referencing a later `const` from the
    // same scope throws (TDZ) and the catch would silently drop every SEO tag.
    const code = storyLeagueCode(art);
    try { 
        const seoTitle = `${art.headline} | ${code} News | ScoreHub`;
        document.title = seoTitle;
        if (window.SEO) {
            const img = storyImage(art);
            SEO.setTitle(seoTitle);
            SEO.setDescription((art.description || art.headline || '').slice(0,155));
            SEO.setCanonical(window.location.href.split('?')[0] + '?id=' + encodeURIComponent(art.id || ''));
            SEO.setImage(img || '');
            SEO.setType('article');
            SEO.setKeywords([code, 'football news', art.headline, 'ScoreHub'].concat(storyTeams(art).map(t=>t.abbr)));
            SEO.breadcrumb([
                { name: 'Home', url: 'https://livematches.hyper.co.ke/' },
                { name: code, url: `https://livematches.hyper.co.ke/standings.html?league=${storyLeagueSlug(art)}` },
                { name: art.headline.slice(0,50), url: window.location.href.split('#')[0] }
            ]);
            SEO.newsArticle({
                headline: art.headline,
                description: art.description || art.headline,
                image: img,
                datePublished: art.published,
                author: art.byline || 'ESPN',
                url: window.location.href.split('#')[0],
                type: 'NewsArticle'
            });
        }
    } catch (e) {}
    const img = storyImage(art);
    const teams = storyTeams(art);
    const clubs = teams.length
        ? `<span class="transfer-clubs">` + teams.map((t) =>
            `<img src="${storyTeamLogoURL(t.id)}" alt="${esc(t.abbr)}" title="${esc(t.abbr)}" loading="lazy" onerror="this.remove()">`
        ).join("") + `</span><span>${esc(teams.map((t) => t.abbr).join(" · "))}</span>`
        : "";
    const evt = storyEvent(art);
    const lede = (art.description && art.description !== art.headline)
        ? `<p class="story-lede">${esc(art.description)}</p>` : "";
    box.innerHTML = `<span class="league-tag">${esc(code)}</span>`
        + (art.type ? ` <span class="league-tag">${esc(art.type)}</span>` : "")
        + `<h1 style="margin-top:10px;">${esc(art.headline)}</h1>`
        + `<p class="legal-updated">${esc(art.byline || "ESPN")} · ${esc(formatStoryDate(art.published))}</p>`
        + (img ? `<img class="story-hero" src="${esc(img)}" alt="" onerror="this.remove()">` : "")
        + lede
        + `<div class="story-meta">${clubs}</div>`
        + (evt ? `<div id="story-event" data-event-id="${esc(evt.id)}" data-league="${esc(evt.league)}" data-published="${esc(art.published || "")}"></div>` : "")
        + `<div class="pred-subrow"><h2 class="pred-sub">${t("story.related")}</h2></div>`
        + `<div class="story-related" id="story-related" data-slug="${esc(storyLeagueSlug(art))}" data-current="${esc(String(art.id))}" data-teams="${esc(teams.map((t) => t.id).join(","))}"><p class="loading-note">${t("story.loadingrel")}</p></div>`
        + `<p class="story-source">${t("story.src")} <a href="${esc(storyURL(art))}" target="_blank" rel="noopener">${t("story.full")}</a></p>`;
    document.getElementById("story-related").addEventListener("click", (e) => {
        const link = e.target.closest("a[data-story]");
        if (!link) return;
        const next = storyRelatedById[link.dataset.story];
        if (!next) return;
        try { sessionStorage.setItem("scorehub-story", JSON.stringify(next)); } catch (err) {}
    });
    loadStoryEvent();
    loadStoryRelated();
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootStory);
}

window.__rerenderLang = function () { try { bootStory(); } catch (e) {} };

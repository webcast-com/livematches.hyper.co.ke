/* Transfer Centre — live transfer headlines via ESPN league news feeds.
   Pure helpers (isTransferNews, articleLeague, articleTeams, articleURL,
   articleImage, escapeHtml, formatPublished) are top-level and side-effect
   free so they can be unit-tested outside a browser. */

const TRANSFER_LEAGUES = [
    { slug: "eng.1", code: "EPL" },
    { slug: "esp.1", code: "LaLiga" },
    { slug: "ita.1", code: "SerieA" },
    { slug: "ger.1", code: "Bundesliga" },
    { slug: "fra.1", code: "Ligue1" },
    { slug: "uefa.champions", code: "UCL" }
];

const TRANSFER_RE = /transfer|\bsign(ing|s|ed)?\b|personal terms|here we go|medical|release clause|buy-?out|\bloan\b|\bbid\b|\boffer\b|swap|swoop|hijack|free agent|done deal|out of contract|contract rebel/i;

function isTransferNews(a) {
    if (!a) return false;
    return TRANSFER_RE.test((a.headline || "") + " " + (a.description || ""));
}

function articleLeague(a) {
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

function articleTeams(a) {
    return ((a && a.categories) || [])
        .filter((c) => c.type === "team")
        .map((c) => (c.team && c.team.abbreviation) || c.description || "")
        .filter(Boolean)
        .slice(0, 3);
}

function articleTeamLogos(a) {
    return ((a && a.categories) || [])
        .filter((c) => c.type === "team" && c.team && c.team.id)
        .map((c) => ({
            abbr: c.team.abbreviation || c.description || "",
            id: c.team.id
        }))
        .slice(0, 3);
}

function teamLogoURL(id) {
    return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
}

function articleURL(a) {
    return (a && a.links && a.links.web && a.links.web.href) || "https://www.espn.com/football/";
}

function articleImage(a) {
    return (a && a.images && a.images[0] && a.images[0].url) || "";
}

function escapeHtml(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatPublished(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(appLocale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

let transferArticles = [];
let transferFilter = "All";

function transferLogosHTML(a) {
    const clubs = articleTeamLogos(a);
    if (!clubs.length) return "";
    return `<span class="transfer-clubs">` + clubs.map((c) =>
        `<img src="${teamLogoURL(c.id)}" alt="${escapeHtml(c.abbr)}" title="${escapeHtml(c.abbr)}" loading="lazy" onerror="this.remove()">`
    ).join("") + `</span>`;
}

function transferCardHTML(a) {
    const img = articleImage(a);
    const teams = articleTeams(a).join(" · ");
    const url = escapeHtml(articleURL(a));
    return `<article class="transfer-card">`
        + (img ? `<a class="transfer-thumb-link" href="story.html" data-story="${a.id}"><img class="transfer-thumb" src="${escapeHtml(img)}" alt="" loading="lazy" onerror="this.remove()"></a>` : "")
        + `<div class="transfer-body">`
        + `<div class="transfer-meta"><span class="league-tag">${articleLeague(a)}</span>${transferLogosHTML(a)}`
        + (teams ? `<span>${escapeHtml(teams)}</span>` : "")
        + `<span>${escapeHtml(formatPublished(a.published))}</span></div>`
        + `<h3><a href="story.html" data-story="${a.id}">${escapeHtml(a.headline || t("transfers.untitled"))}</a></h3>`
        + ((a.description && a.description !== a.headline) ? `<p class="transfer-desc">${escapeHtml(a.description)}</p>` : "")
        + `<span class="transfer-readrow"><a class="transfer-read" href="story.html" data-story="${a.id}">${t("common.readmore")}</a><span class="transfer-src-inline">${t("transfers.source")} <a href="${url}" target="_blank" rel="noopener">ESPN</a></span></span>`
        + `</div></article>`;
}

function renderTransfers() {
    const list = document.getElementById("transfer-list");
    const items = transferArticles.filter((a) => transferFilter === "All" || articleLeague(a) === transferFilter);
    if (!items.length) {
        list.innerHTML = `<p class="loading-note">${tf("transfers.empty", { f: transferFilter === "All" ? "" : ((typeof LANG !== "undefined" && LANG === "sw") ? " za " + transferFilter : transferFilter + " ") })}</p>`;
        return;
    }
    list.innerHTML = items.map(transferCardHTML).join("");
}

async function loadTransfers() {
    const list = document.getElementById("transfer-list");
    const err = document.getElementById("transfer-error");
    err.hidden = true;
    list.innerHTML = `<p class="loading-note">${t("transfers.loading")}</p>`;
    const results = await Promise.allSettled(TRANSFER_LEAGUES.map((L) =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${L.slug}/news?limit=20`).then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        })
    ));
    if (results.every((r) => r.status !== "fulfilled" && (!r.value || !Array.isArray(r.value.articles)))) {
        const anyData = results.some((r) => r.status === "fulfilled" && r.value && Array.isArray(r.value.articles));
        if (!anyData) {
            list.innerHTML = "";
            err.hidden = false;
            return;
        }
    }
    const seen = new Set();
    const merged = [];
    for (const r of results) {
        if (r.status !== "fulfilled" || !r.value || !Array.isArray(r.value.articles)) continue;
        for (const a of r.value.articles) {
            if (!a || seen.has(a.id)) continue;
            seen.add(a.id);
            if (isTransferNews(a)) merged.push(a);
        }
    }
    merged.sort((a, b) => new Date(b.published) - new Date(a.published));
    transferArticles = merged.slice(0, 60);
    renderTransfers();
}

function bootTransfers() {
    document.querySelectorAll("#transfer-chips .standings-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#transfer-chips .standings-tab").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            transferFilter = btn.dataset.league || "All";
            renderTransfers();
        });
    });
    document.getElementById("transfer-list").addEventListener("click", (e) => {
        const link = e.target.closest("a[data-story]");
        if (!link) return;
        const art = transferArticles.find((x) => String(x.id) === link.dataset.story);
        if (!art) return;
        try { sessionStorage.setItem("scorehub-story", JSON.stringify(art)); } catch (err) {}
    });
    const retry = document.getElementById("transfer-retry");
    if (retry) retry.addEventListener("click", loadTransfers);
    loadTransfers();
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootTransfers);
}

window.__rerenderLang = function () { try { renderTransfers(); } catch (e) {} };

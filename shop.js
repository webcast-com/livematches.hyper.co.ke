/* Shop kit finder — injects real club crests into the code badges.
   Fetches ESPN league team lists at runtime and matches each card's
   data-alias list against normalized team names. Badges keep their code
   text underneath the crest, so a missing or failed logo degrades
   silently. Pure helpers (normClubName, extractTeams, matchClubLogo) are
   top-level and side-effect free for testability. */

const SHOP_LEAGUES = [
    { code: "EPL", slug: "eng.1" },
    { code: "LaLiga", slug: "esp.1" },
    { code: "SerieA", slug: "ita.1" },
    { code: "Bundesliga", slug: "ger.1" },
    { code: "Ligue1", slug: "fra.1" }
];

function normClubName(s) {
    return String(s || "").toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function shopTeamLogo(t) {
    if (!t) return "";
    if (Array.isArray(t.logos) && t.logos[0] && t.logos[0].href) return t.logos[0].href;
    if (typeof t.logo === "string" && t.logo) return t.logo;
    return "";
}

// Tolerant walk: site.api team-list shapes vary
// ({teams:[{team}]}, {sports:[{leagues:[{teams:[{team}]}]}]}, …)
function extractTeams(json) {
    const out = [];
    const visit = (node) => {
        if (!node) return;
        if (Array.isArray(node)) { node.forEach(visit); return; }
        if (typeof node !== "object") return;
        if (node.displayName && (node.logos || node.logo)) { out.push(node); return; }
        if (node.team && typeof node.team === "object") { visit(node.team); return; }
        Object.keys(node).forEach((k) => { if (k !== "team") visit(node[k]); });
    };
    visit(json);
    return out;
}

function matchClubLogo(aliases, teamsByName) {
    const list = String(aliases || "").split("|");
    for (const a of list) {
        const hit = teamsByName[normClubName(a)];
        if (hit) return hit;
    }
    return "";
}

async function loadShopLogos() {
    const results = await Promise.allSettled(SHOP_LEAGUES.map((L) =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${L.slug}/teams?limit=30`).then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        })
    ));
    const byName = {};
    for (const r of results) {
        if (r.status !== "fulfilled" || !r.value) continue;
        extractTeams(r.value).forEach((t) => {
            const logo = shopTeamLogo(t);
            if (!logo) return;
            const nameKey = normClubName(t.displayName);
            if (nameKey && !byName[nameKey]) byName[nameKey] = logo;
            const abbrKey = normClubName(t.abbreviation);
            if (abbrKey && abbrKey.length >= 3 && !byName[abbrKey]) byName[abbrKey] = logo;
        });
    }
    if (!Object.keys(byName).length) return;
    document.querySelectorAll(".shop-card[data-alias]").forEach((card) => {
        const logo = matchClubLogo(card.dataset.alias, byName);
        if (!logo) return;
        const badge = card.querySelector(".shop-badge");
        if (!badge || badge.querySelector("img")) return;
        const img = document.createElement("img");
        img.className = "shop-logo";
        img.src = logo;
        img.alt = "";
        img.loading = "lazy";
        img.onerror = () => img.remove();
        badge.appendChild(img);
    });
}

function bootShop() {
    loadShopLogos();
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", bootShop);
}

/* ScoreHub News Centre — live football stories, tactical reports & analysis
   Powered by ESPN news feeds with offline curated fallback. */

const NEWS_LEAGUES = [
    { slug: "eng.1", code: "EPL", name: "Premier League" },
    { slug: "esp.1", code: "LaLiga", name: "La Liga" },
    { slug: "ita.1", code: "SerieA", name: "Serie A" },
    { slug: "ger.1", code: "Bundesliga", name: "Bundesliga" },
    { slug: "fra.1", code: "Ligue1", name: "Ligue 1" },
    { slug: "uefa.champions", code: "UCL", name: "Champions League" }
];

const FALLBACK_NEWS = [
    {
        id: "fb-news-1",
        headline: "Champions League Power Rankings: Elite contenders battle for supremacy",
        description: "As European nights return, we analyze which clubs have the squad depth, form and tactical edge to conquer Europe this season.",
        published: new Date(Date.now() - 3600000 * 2).toISOString(),
        league: "UCL",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        byline: "ScoreHub European Desk"
    },
    {
        id: "fb-news-2",
        headline: "Haaland hits milestone brace as Man City keep title pressure boiling",
        description: "The Norwegian striker delivered another ruthless masterclass to punish defensive lapses and secure three vital points at the top.",
        published: new Date(Date.now() - 3600000 * 4).toISOString(),
        league: "EPL",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
        byline: "ScoreHub Premier League Desk"
    },
    {
        id: "fb-news-3",
        headline: "El Clasico Preview: Midfield battle set to decide summit showdown",
        description: "Both giants enter in formidable form, but tactical battles in central transition zones will dictate who claims top spot in Spain.",
        published: new Date(Date.now() - 3600000 * 6).toISOString(),
        league: "LaLiga",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
        byline: "ScoreHub LaLiga Desk"
    },
    {
        id: "fb-news-4",
        headline: "Harry Kane keeps shattering records as Bayern Munich surge clear",
        description: "The England captain's extraordinary goal ratio continues to dominate Bundesliga scoreboards, powering Bayern toward another title triumph.",
        published: new Date(Date.now() - 3600000 * 9).toISOString(),
        league: "Bundesliga",
        image: "https://images.unsplash.com/photo-1489944445391-11dd35574549?auto=format&fit=crop&w=800&q=80",
        byline: "ScoreHub Bundesliga Desk"
    },
    {
        id: "fb-news-5",
        headline: "Lautaro Martínez leads Inter Milan's resilient charge across Italy",
        description: "Inter's talismanic captain delivers once again as defensive solidity and clinical finishing keep the Nerazzurri at the summit.",
        published: new Date(Date.now() - 3600000 * 14).toISOString(),
        league: "SerieA",
        image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80",
        byline: "ScoreHub Serie A Desk"
    },
    {
        id: "fb-news-6",
        headline: "Dembélé inspires PSG in dominant Classique victory over Marseille",
        description: "Pacy wing play and sharp link-up proved too much to handle as the Parisian side swept past their traditional rivals with flair.",
        published: new Date(Date.now() - 3600000 * 20).toISOString(),
        league: "Ligue1",
        image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80",
        byline: "ScoreHub Ligue 1 Desk"
    }
];

let allNews = [];
let activeNewsLeague = "All";
let newsSearchQuery = "";

function escapeHtml(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    const ms = Date.now() - new Date(dateStr).getTime();
    if (isNaN(ms) || ms < 0) return "Just now";
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function parseArticleLeague(a) {
    const cats = (a && a.categories) || [];
    for (const c of cats) {
        if (c.type === "league" && c.leagueId !== 600) {
            const d = (c.description || "").toLowerCase();
            if (d.includes("champions league")) return "UCL";
            if (d.includes("premier league")) return "EPL";
            if (d.includes("liga") || d.includes("spanish")) return "LaLiga";
            if (d.includes("serie a") || d.includes("italian")) return "SerieA";
            if (d.includes("bundesliga") || d.includes("german")) return "Bundesliga";
            if (d.includes("ligue") || d.includes("french")) return "Ligue1";
        }
    }
    return a.league || "Soccer";
}

function articleImageURL(a) {
    if (a.images && a.images.length) {
        return a.images[0].url;
    }
    return a.image || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80";
}

function renderNewsList() {
    const listEl = document.getElementById("news-list");
    if (!listEl) return;

    let items = allNews;
    if (activeNewsLeague !== "All") {
        items = items.filter(a => (a.leagueCode || a.league) === activeNewsLeague);
    }
    if (newsSearchQuery.trim()) {
        const q = newsSearchQuery.toLowerCase();
        items = items.filter(a => {
            const h = (a.headline || a.title || "").toLowerCase();
            const d = (a.description || "").toLowerCase();
            return h.includes(q) || d.includes(q);
        });
    }

    if (!items.length) {
        listEl.innerHTML = `<p class="loading-note">No stories found matching your filter.</p>`;
        return;
    }

    listEl.innerHTML = items.map((item, index) => {
        const title = escapeHtml(item.headline || item.title);
        const desc = escapeHtml(item.description || "");
        const league = escapeHtml(item.leagueCode || item.league || "Soccer");
        const time = formatRelativeTime(item.published);
        const img = escapeHtml(articleImageURL(item));
        const byline = escapeHtml(item.byline || "ESPN / ScoreHub");

        return `
            <div class="news-hub-card" data-idx="${index}" style="cursor:pointer;">
                <div class="news-hub-thumb-wrap">
                    <img class="news-hub-thumb" src="${img}" alt="${title}" loading="lazy" onerror="this.src='icon-512.png';" />
                </div>
                <div class="news-hub-body">
                    <div class="news-hub-meta">
                        <span class="news-badge">${league}</span>
                        <span>${time}</span>
                        <span>&middot;</span>
                        <span>${byline}</span>
                    </div>
                    <h3>${title}</h3>
                    <p class="news-hub-desc">${desc}</p>
                </div>
            </div>
        `;
    }).join("");

    listEl.querySelectorAll(".news-hub-card").forEach((card, i) => {
        card.addEventListener("click", () => {
            const item = items[i];
            if (item) {
                try {
                    sessionStorage.setItem("scorehub-story", JSON.stringify(item.raw || item));
                } catch (e) {}
                window.location.href = "story.html";
            }
        });
    });
}

async function fetchLiveNews() {
    const listEl = document.getElementById("news-list");
    const errorEl = document.getElementById("news-error");
    if (listEl) listEl.innerHTML = `<p class="loading-note">Loading latest news…</p>`;
    if (errorEl) errorEl.hidden = true;

    try {
        const fetchPromises = NEWS_LEAGUES.map(l =>
            fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.slug}/news?limit=10`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    const articles = (data && data.articles) || [];
                    return articles.map(a => ({
                        ...a,
                        leagueCode: l.code,
                        league: l.code,
                        raw: a
                    }));
                })
                .catch(() => [])
        );

        const results = await Promise.all(fetchPromises);
        const flattened = results.flat();
        const seen = new Set();
        const unique = [];

        for (const item of flattened) {
            const id = item.id || item.headline;
            if (id && !seen.has(id)) {
                seen.add(id);
                unique.push(item);
            }
        }

        if (unique.length > 0) {
            unique.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
            allNews = unique;
        } else {
            allNews = FALLBACK_NEWS;
        }
        renderNewsList();
    } catch (err) {
        allNews = FALLBACK_NEWS;
        renderNewsList();
    }
}

function initNewsHub() {
    const searchInput = document.getElementById("news-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            newsSearchQuery = e.target.value;
            renderNewsList();
        });
    }

    const chips = document.querySelectorAll("#news-chips button");
    chips.forEach(btn => {
        btn.addEventListener("click", () => {
            chips.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeNewsLeague = btn.getAttribute("data-league") || "All";
            renderNewsList();
        });
    });

    const retryBtn = document.getElementById("news-retry");
    if (retryBtn) {
        retryBtn.addEventListener("click", fetchLiveNews);
    }

    fetchLiveNews();
}

document.addEventListener("DOMContentLoaded", initNewsHub);

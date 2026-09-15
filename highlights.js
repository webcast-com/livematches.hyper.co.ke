/* ScoreHub Highlights Hub — video highlights, match recaps & goal roundups
   Pulls live finished match data from ESPN scoreboards and builds instant YouTube links. */

function matchHighlightUrl(homeTeam, awayTeam, leagueName) {
    const q = `${homeTeam || ""} vs ${awayTeam || ""} highlights ${leagueName || ""}`.trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

const HIGHLIGHTS_LEAGUES = [
    { slug: "eng.1", code: "EPL", name: "Premier League" },
    { slug: "esp.1", code: "LaLiga", name: "La Liga" },
    { slug: "ita.1", code: "SerieA", name: "Serie A" },
    { slug: "ger.1", code: "Bundesliga", name: "Bundesliga" },
    { slug: "fra.1", code: "Ligue1", name: "Ligue 1" },
    { slug: "uefa.champions", code: "UCL", name: "Champions League" }
];

const CURATED_HIGHLIGHTS = [
    {
        id: "hl-1",
        title: "Arsenal vs Chelsea 2-1: Late Saka winner seals London derby",
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        score: "2 - 1",
        leagueCode: "EPL",
        leagueName: "Premier League",
        time: "Yesterday",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
        youtubeQuery: "Arsenal vs Chelsea highlights Premier League"
    },
    {
        id: "hl-2",
        title: "Real Madrid vs Barcelona 3-2: Bellingham stoppage-time decider",
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        score: "3 - 2",
        leagueCode: "LaLiga",
        leagueName: "La Liga",
        time: "Yesterday",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80",
        youtubeQuery: "Real Madrid vs Barcelona highlights La Liga"
    },
    {
        id: "hl-3",
        title: "Bayern Munich vs Dortmund 4-1: Kane hat-trick in Der Klassiker",
        homeTeam: "Bayern Munich",
        awayTeam: "Borussia Dortmund",
        score: "4 - 1",
        leagueCode: "Bundesliga",
        leagueName: "Bundesliga",
        time: "2d ago",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
        youtubeQuery: "Bayern Munich vs Dortmund highlights Bundesliga"
    },
    {
        id: "hl-4",
        title: "PSG vs Marseille 2-0: Dembélé masterclass dominates Le Classique",
        homeTeam: "Paris Saint-Germain",
        awayTeam: "Marseille",
        score: "2 - 0",
        leagueCode: "Ligue1",
        leagueName: "Ligue 1",
        time: "2d ago",
        image: "https://images.unsplash.com/photo-1489944445391-11dd35574549?auto=format&fit=crop&w=600&q=80",
        youtubeQuery: "PSG vs Marseille highlights Ligue 1"
    },
    {
        id: "hl-5",
        title: "Inter Milan vs AC Milan 1-0: Martínez derby strike sends San Siro wild",
        homeTeam: "Inter Milan",
        awayTeam: "AC Milan",
        score: "1 - 0",
        leagueCode: "SerieA",
        leagueName: "Serie A",
        time: "3d ago",
        image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80",
        youtubeQuery: "Inter Milan vs AC Milan highlights Serie A"
    },
    {
        id: "hl-6",
        title: "Man City vs Liverpool 2-2: Haaland and Salah trade goals in epic clash",
        homeTeam: "Manchester City",
        awayTeam: "Liverpool",
        score: "2 - 2",
        leagueCode: "EPL",
        leagueName: "Premier League",
        time: "3d ago",
        image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80",
        youtubeQuery: "Manchester City vs Liverpool highlights Premier League"
    }
];

let allHighlights = [];
let activeHighlightsLeague = "All";
let highlightsSearchQuery = "";

function escapeHtml(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderHighlightsGrid() {
    const gridEl = document.getElementById("highlights-grid");
    if (!gridEl) return;

    let items = allHighlights;
    if (activeHighlightsLeague !== "All") {
        items = items.filter(h => h.leagueCode === activeHighlightsLeague);
    }
    if (highlightsSearchQuery.trim()) {
        const q = highlightsSearchQuery.toLowerCase();
        items = items.filter(h => {
            const t = (h.title || "").toLowerCase();
            const home = (h.homeTeam || "").toLowerCase();
            const away = (h.awayTeam || "").toLowerCase();
            return t.includes(q) || home.includes(q) || away.includes(q);
        });
    }

    if (!items.length) {
        gridEl.innerHTML = `<p class="loading-note" style="grid-column:1/-1;">No match highlights found matching your filter.</p>`;
        return;
    }

    gridEl.innerHTML = items.map(item => {
        const title = escapeHtml(item.title);
        const league = escapeHtml(item.leagueName || item.leagueCode);
        const time = escapeHtml(item.time || "Recent");
        const img = escapeHtml(item.image || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80");
        const hlUrl = matchHighlightUrl(item.homeTeam, item.awayTeam, item.leagueName || item.leagueCode);

        return `
            <div class="highlight-hub-card">
                <a href="${hlUrl}" target="_blank" rel="noopener" class="highlight-hub-thumb" aria-label="Watch ${title}">
                    <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='icon-512.png';" />
                    <span class="highlight-hub-play">&#9658;</span>
                </a>
                <div class="highlight-hub-info">
                    <h3 class="highlight-hub-title">${title}</h3>
                    <div class="highlight-hub-meta">
                        <span class="news-badge">${league}</span>
                        <span>${time}</span>
                    </div>
                    <a href="${hlUrl}" target="_blank" rel="noopener" class="highlight-btn-watch">
                        <span>🎥 Watch Highlights ↗</span>
                    </a>
                </div>
            </div>
        `;
    }).join("");
}

async function fetchLiveHighlights() {
    const gridEl = document.getElementById("highlights-grid");
    const errorEl = document.getElementById("highlights-error");
    if (gridEl) gridEl.innerHTML = `<p class="loading-note" style="grid-column:1/-1;">Loading latest match highlights…</p>`;
    if (errorEl) errorEl.hidden = true;

    try {
        const scoreboardPromises = HIGHLIGHTS_LEAGUES.map(l =>
            fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.slug}/scoreboard`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    const events = (data && data.events) || [];
                    const finishedEvents = events.filter(e => {
                        const status = e.status && e.status.type && e.status.type.state;
                        return status === "post";
                    });

                    return finishedEvents.map(e => {
                        const comp = (e.competitions && e.competitions[0]) || {};
                        const comps = comp.competitors || [];
                        const home = comps.find(c => c.homeAway === "home") || comps[0] || {};
                        const away = comps.find(c => c.homeAway === "away") || comps[1] || {};
                        const homeName = (home.team && home.team.displayName) || "Home";
                        const awayName = (away.team && away.team.displayName) || "Away";
                        const homeScore = home.score || "0";
                        const awayScore = away.score || "0";
                        const dateStr = e.date ? new Date(e.date).toLocaleDateString() : "Recent";

                        return {
                            id: e.id,
                            title: `${homeName} ${homeScore} - ${awayScore} ${awayName}: Match Highlights`,
                            homeTeam: homeName,
                            awayTeam: awayName,
                            score: `${homeScore} - ${awayScore}`,
                            leagueCode: l.code,
                            leagueName: l.name,
                            time: dateStr,
                            image: (home.team && home.team.logo) || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
                            link: matchHighlightUrl(homeName, awayName, l.name)
                        };
                    });
                })
                .catch(() => [])
        );

        const results = await Promise.all(scoreboardPromises);
        const liveItems = results.flat();

        if (liveItems.length > 0) {
            allHighlights = [...liveItems, ...CURATED_HIGHLIGHTS];
        } else {
            allHighlights = CURATED_HIGHLIGHTS;
        }
        renderHighlightsGrid();
    } catch (err) {
        allHighlights = CURATED_HIGHLIGHTS;
        renderHighlightsGrid();
    }
}

function initHighlightsHub() {
    const searchInput = document.getElementById("highlights-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            highlightsSearchQuery = e.target.value;
            renderHighlightsGrid();
        });
    }

    const chips = document.querySelectorAll("#highlights-chips button");
    chips.forEach(btn => {
        btn.addEventListener("click", () => {
            chips.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeHighlightsLeague = btn.getAttribute("data-league") || "All";
            renderHighlightsGrid();
        });
    });

    const retryBtn = document.getElementById("highlights-retry");
    if (retryBtn) {
        retryBtn.addEventListener("click", fetchLiveHighlights);
    }

    fetchLiveHighlights();
}

document.addEventListener("DOMContentLoaded", initHighlightsHub);

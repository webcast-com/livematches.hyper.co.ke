/* ==========================================
   SCOREHUB INTERACTIVE DASHBOARD CONTROLLER
   ========================================== */

// --- MOCK DATABASE ---
const MOCK_MATCHES = [
    // FOOTBALL MATCHES
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
        favorites: false,
        stats: {
            possession: 55, // Home team %
            shots: 8,
            shotsOnTarget: 4,
            corners: 4,
            fouls: 7,
            yellowCards: 2,
            redCards: 0
        },
        scorers: {
            home: ["12' Martin Ødegaard", "45'+2 Bukayo Saka"],
            away: ["45' N. Jackson"]
        }
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
        favorites: false,
        stats: {
            possession: 62,
            shots: 11,
            shotsOnTarget: 5,
            corners: 7,
            fouls: 5,
            yellowCards: 1,
            redCards: 0
        },
        scorers: {
            home: ["58' Erling Haaland"],
            away: []
        }
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
        favorites: false,
        stats: {
            possession: 42,
            shots: 6,
            shotsOnTarget: 2,
            corners: 3,
            fouls: 9,
            yellowCards: 2,
            redCards: 0
        },
        scorers: {
            home: [],
            away: []
        }
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
        favorites: false,
        stats: {
            possession: 47,
            shots: 7,
            shotsOnTarget: 3,
            corners: 4,
            fouls: 11,
            yellowCards: 3,
            redCards: 0
        },
        scorers: {
            home: ["34' Rafael Leão"],
            away: ["55' Lautaro Martínez"]
        }
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
        favorites: false,
        stats: {
            possession: 58,
            shots: 9,
            shotsOnTarget: 4,
            corners: 5,
            fouls: 6,
            yellowCards: 0,
            redCards: 0
        },
        scorers: {
            home: ["18' Kylian Mbappé", "29' O. Dembélé"],
            away: []
        }
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
        favorites: false,
        stats: {
            possession: 51,
            shots: 8,
            shotsOnTarget: 3,
            corners: 3,
            fouls: 8,
            yellowCards: 2,
            redCards: 0
        },
        scorers: {
            home: ["41' Harry Kane"],
            away: []
        }
    },
    
    // BASKETBALL MATCHES
    {
        id: "bb-1",
        sport: "basketball",
        league: "NBA Playoffs",
        leagueId: "NBA",
        homeTeam: "LA Lakers",
        homeCode: "LAL",
        homeColor: "#552583",
        awayTeam: "Boston Celtics",
        awayCode: "BOS",
        awayColor: "#007A33",
        homeScore: 94,
        awayScore: 92,
        halftimeScore: "Q3 12'",
        time: "Q4 3'",
        status: "live",
        favorites: false,
        stats: {
            possession: 50,
            shots: 72,
            shotsOnTarget: 38,
            corners: 42,
            fouls: 14,
            yellowCards: 0,
            redCards: 0
        },
        scorers: {
            home: ["Davis 28 pts", "James 24 pts"],
            away: ["Tatum 32 pts", "Brown 22 pts"]
        }
    },
    {
        id: "bb-2",
        sport: "basketball",
        league: "NBA Playoffs",
        leagueId: "NBA",
        homeTeam: "Golden State Warriors",
        homeCode: "GSW",
        homeColor: "#1D428A",
        awayTeam: "Miami Heat",
        awayCode: "MIA",
        awayColor: "#98002E",
        homeScore: 104,
        awayScore: 108,
        halftimeScore: "Ended",
        time: "FT",
        status: "today",
        favorites: false,
        stats: {
            possession: 49,
            shots: 85,
            shotsOnTarget: 41,
            corners: 38,
            fouls: 18,
            yellowCards: 0,
            redCards: 0
        },
        scorers: {
            home: ["Curry 36 pts"],
            away: ["Butler 29 pts", "Adebayo 20 pts"]
        }
    },
    
    // TENNIS MATCHES
    {
        id: "tn-1",
        sport: "tennis",
        league: "Wimbledon - Men's Singles",
        leagueId: "Wimb",
        homeTeam: "Carlos Alcaraz",
        homeCode: "ALC",
        homeColor: "#1d4ed8",
        awayTeam: "Novak Djokovic",
        awayCode: "DJO",
        awayColor: "#15803d",
        homeScore: 2,
        awayScore: 1,
        halftimeScore: "Set 4",
        time: "Live",
        status: "live",
        favorites: false,
        stats: {
            possession: 50,
            shots: 84, // Aces
            shotsOnTarget: 8, // Double faults
            corners: 32, // Unforced errors
            fouls: 0,
            yellowCards: 0,
            redCards: 0
        },
        scorers: {
            home: ["Set 1: 6-4", "Set 3: 7-5"],
            away: ["Set 2: 3-6", "Set 4: 4-3*"]
        }
    }
];

const MOCK_STANDINGS = {
    EPL: [
        { rank: 1, team: "Arsenal", logo: "ARS", played: 37, gd: 61, pts: 89 },
        { rank: 2, team: "Man City", logo: "MCI", played: 37, gd: 45, pts: 85 },
        { rank: 3, team: "Liverpool", logo: "LIV", played: 37, gd: 41, pts: 79 },
        { rank: 4, team: "Aston Villa", logo: "AVL", played: 37, gd: 20, pts: 68 },
        { rank: 5, team: "Tottenham", logo: "TOT", played: 37, gd: 13, pts: 63 }
    ],
    LaLiga: [
        { rank: 1, team: "Real Madrid", logo: "RMA", played: 37, gd: 58, pts: 93 },
        { rank: 2, team: "Barcelona", logo: "BAR", played: 37, gd: 34, pts: 82 },
        { rank: 3, team: "Girona", logo: "GIR", played: 37, gd: 30, pts: 78 },
        { rank: 4, team: "Atletico Madrid", logo: "ATM", played: 37, gd: 24, pts: 73 },
        { rank: 5, team: "Athletic Club", logo: "ATH", played: 37, gd: 19, pts: 62 }
    ],
    SerieA: [
        { rank: 1, team: "Inter Milan", logo: "INT", played: 37, gd: 65, pts: 93 },
        { rank: 2, team: "AC Milan", logo: "MIL", played: 37, gd: 27, pts: 74 },
        { rank: 3, team: "Bologna", logo: "BOL", played: 37, gd: 22, pts: 68 },
        { rank: 4, team: "Juventus", logo: "JUV", played: 37, gd: 21, pts: 68 },
        { rank: 5, team: "Atalanta", logo: "ATA", played: 37, gd: 28, pts: 66 }
    ]
};

const MOCK_NEWS = [
    {
        id: "news-1",
        category: "Transfer News",
        title: "Official: Mbappé signs new blockbuster deal with Real Madrid",
        time: "15m ago",
        grad: "linear-gradient(135deg, #243b55, #141e30)"
    },
    {
        id: "news-2",
        category: "Premier League",
        title: "Arsenal extend lead at the top after impressive win against Chelsea",
        time: "1h ago",
        grad: "linear-gradient(135deg, #8a2387, #e94057, #f27121)"
    },
    {
        id: "news-3",
        category: "UCL",
        title: "Champions League final bracket confirmed: road to Munich final",
        time: "2h ago",
        grad: "linear-gradient(135deg, #11998e, #38ef7d)"
    },
    {
        id: "news-4",
        category: "Injury News",
        title: "Salah returns to full team training ahead of weekend clash",
        time: "3h ago",
        grad: "linear-gradient(135deg, #ff007f, #7f00ff)"
    }
];

// --- APP STATE ---
let currentSport = "all";
let currentFilter = "all";
let currentStandingLeague = "EPL";
let spotlightMatchId = "fb-1";
let searchOpen = false;
let isApiMode = false;
let apiMatches = [];
let apiLoading = false;

// --- DOM ELEMENTS ---
const matchesContainer = document.getElementById("matches-container");
const standingsBody = document.getElementById("standings-table-body");
const statsBarsList = document.getElementById("stats-bars-list");
const newsContainer = document.getElementById("news-container");
const tickerSlider = document.getElementById("ticker-slider");

// Spotlight elements
const spotlightHomeName = document.getElementById("spotlight-home-name");
const spotlightAwayName = document.getElementById("spotlight-away-name");
const spotlightHomeScore = document.getElementById("spotlight-home-score");
const spotlightAwayScore = document.getElementById("spotlight-away-score");
const spotlightHalftimeScore = document.getElementById("spotlight-halftime-score");
const spotlightTime = document.getElementById("spotlight-time");
const spotlightLeague = document.getElementById("spotlight-league");
const spotlightHomeScorers = document.getElementById("spotlight-home-scorers");
const spotlightAwayScorers = document.getElementById("spotlight-away-scorers");
const spotlightHomeLogoContainer = document.getElementById("spotlight-home-logo-container");
const spotlightAwayLogoContainer = document.getElementById("spotlight-away-logo-container");

// Stats compare elements
const statsHomeName = document.getElementById("stats-home-name");
const statsAwayName = document.getElementById("stats-away-name");
const statsHomeScore = document.getElementById("stats-home-score");
const statsAwayScore = document.getElementById("stats-away-score");

// Navigation, Filters, Modals
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const loginBtn = document.getElementById("login-btn");
const loginModal = document.getElementById("login-modal");
const closeLoginModal = document.getElementById("close-login-modal");
const loginForm = document.getElementById("login-form");
const watchLiveBtn = document.getElementById("watch-live-btn");
const watchLiveModal = document.getElementById("watch-live-modal");
const closeWatchModal = document.getElementById("close-watch-modal");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const notificationBtn = document.getElementById("notification-btn");
const notificationDropdown = document.getElementById("notification-dropdown");
const navHome = document.getElementById("nav-home");
const navLive = document.getElementById("nav-live");
const heroBtnLive = document.getElementById("hero-btn-live");

// API controls
const apiModeBtn = document.getElementById("api-mode-btn");
const apiModeText = document.getElementById("api-mode-text");
const apiModeIndicator = document.getElementById("api-mode-indicator");

// --- UTILITY FUNCTIONS ---
function generateTeamSVG(code, color) {
    return `
        <svg class="shield-logo" viewBox="0 0 50 50" width="50" height="50">
            <path d="M25 5 L40 10 L40 30 C40 40 25 45 25 45 C25 45 10 40 10 30 L10 10 Z" fill="${color}" />
            <circle cx="25" cy="23" r="10" fill="#fff" />
            <text x="25" y="27" font-size="10.5" font-weight="bold" fill="${color}" text-anchor="middle">${code}</text>
        </svg>
    `;
}

/* ==========================================
   LIVE ESPN API INTEGRATION
   ========================================== */

// Map sport-tab values to ESPN API sport/league slugs
const ESPN_ENDPOINTS = {
    football:    ["soccer/eng.1", "soccer/uefa.champions", "soccer/esp.1", "soccer/ita.1", "soccer/ger.1", "soccer/fra.1"],
    basketball:  ["basketball/nba"],
    tennis:      ["tennis/wta", "tennis/atp"],
    baseball:    ["baseball/mlb"],
    icehockey:   ["hockey/nhl"],
    rugby:       ["rugby/premiership"],
    all:         ["soccer/eng.1", "soccer/uefa.champions", "soccer/esp.1", "soccer/ita.1", "soccer/ger.1", "basketball/nba"]
};

const LEAGUE_NAMES = {
    "soccer/eng.1":         { name: "Premier League",         code: "EPL",         sport: "football" },
    "soccer/uefa.champions":{ name: "UEFA Champions League",  code: "UCL",         sport: "football" },
    "soccer/esp.1":         { name: "La Liga",                code: "LaLiga",      sport: "football" },
    "soccer/ita.1":         { name: "Serie A",                code: "SerieA",      sport: "football" },
    "soccer/ger.1":         { name: "Bundesliga",             code: "Bundesliga",  sport: "football" },
    "soccer/fra.1":         { name: "Ligue 1",                code: "Ligue1",      sport: "football" },
    "basketball/nba":       { name: "NBA",                    code: "NBA",         sport: "basketball" },
    "tennis/atp":           { name: "ATP Tour",               code: "ATP",         sport: "tennis" },
    "tennis/wta":           { name: "WTA Tour",               code: "WTA",         sport: "tennis" },
    "baseball/mlb":         { name: "MLB",                    code: "MLB",         sport: "baseball" },
    "hockey/nhl":           { name: "NHL",                    code: "NHL",         sport: "icehockey" },
    "rugby/premiership":    { name: "Rugby Premiership",      code: "RUG",         sport: "rugby" }
};

// Team color palette for well-known clubs
const TEAM_COLORS = {
    "Arsenal":               "#dd1d25",
    "Chelsea":               "#034694",
    "Manchester City":       "#6cabdd",
    "Manchester United":     "#da291c",
    "Liverpool":             "#c8102e",
    "Tottenham Hotspur":     "#132257",
    "Newcastle United":      "#241f20",
    "Brighton & Hove Albion":"#0057B8",
    "Aston Villa":           "#670E36",
    "West Ham United":       "#7A263A",
    "Wolverhampton Wanderers":"#FDB913",
    "Everton":               "#003399",
    "Leicester City":        "#003090",
    "Crystal Palace":        "#1B458F",
    "Burnley":               "#6C1D45",
    "Fulham":                "#CC0000",
    "Brentford":             "#e30613",
    "Nottingham Forest":     "#DD0000",
    "Bournemouth":           "#DA291C",
    "Luton Town":            "#f78f1e",
    "Real Madrid":           "#00529F",
    "Barcelona":             "#004d98",
    "Atletico Madrid":       "#c73030",
    "Sevilla":               "#d91a21",
    "Villarreal":            "#FFD700",
    "Real Sociedad":         "#00529F",
    "Inter Milan":           "#0066b2",
    "AC Milan":              "#fb090b",
    "Juventus":              "#000000",
    "Napoli":                "#12A0D7",
    "Atalanta":              "#1c3d7d",
    "Bayern Munich":         "#dc052d",
    "Borussia Dortmund":     "#FDE100",
    "RB Leipzig":            "#DD0741",
    "Bayer Leverkusen":      "#e32219",
    "Paris Saint-Germain":   "#002c59",
    "Marseille":             "#72b0e9",
    "Monaco":                "#bf0000",
    "Lille":                 "#e01e22"
};

// Fetch ESPN scoreboard for a specific endpoint slug
async function fetchESPNLeague(slug) {
    const CORS_PROXY = "https://api.allorigins.win/raw?url=";
    const BASE = "https://site.api.espn.com/apis/site/v2/sports/";
    const url = `${CORS_PROXY}${encodeURIComponent(BASE + slug + "/scoreboard")}`;
    const resp = await fetch(url, { cache: "no-cache" });
    if (!resp.ok) throw new Error(`ESPN fetch failed for ${slug}: ${resp.status}`);
    return resp.json();
}

// Convert ESPN event JSON → internal match object
function parseESPNEvent(event, leagueInfo) {
    const comp = event.competitions[0];
    if (!comp) return null;

    const competitors = comp.competitors;
    if (!competitors || competitors.length < 2) return null;

    const home = competitors.find(c => c.homeAway === "home") || competitors[0];
    const away = competitors.find(c => c.homeAway === "away") || competitors[1];

    const homeTeam = home.team ? (home.team.displayName || home.team.name || home.team.shortDisplayName || "Home") : "Home";
    const awayTeam = away.team ? (away.team.displayName || away.team.name || away.team.shortDisplayName || "Away") : "Away";
    const homeCode = home.team ? (home.team.abbreviation || homeTeam.slice(0, 3).toUpperCase()) : "HME";
    const awayCode = away.team ? (away.team.abbreviation || awayTeam.slice(0, 3).toUpperCase()) : "AWY";
    const homeScore = parseInt(home.score || "0", 10) || 0;
    const awayScore = parseInt(away.score || "0", 10) || 0;

    // Team colors — use ESPN color, then our lookup table, then fallback
    const homeColor = (home.team && home.team.color ? "#" + home.team.color : null)
        || TEAM_COLORS[homeTeam]
        || "#4facfe";
    const awayColor = (away.team && away.team.color ? "#" + away.team.color : null)
        || TEAM_COLORS[awayTeam]
        || "#ef4444";

    // Match status
    const statusType = event.status && event.status.type ? event.status.type : {};
    const state = statusType.state || "pre";
    const statusName = statusType.name || "";
    const detail = statusType.detail || statusType.shortDetail || "";
    const displayClock = (event.status && event.status.displayClock) ? event.status.displayClock : "";

    let matchStatus = "today";
    let matchTime = "--";
    let halftimeScore = "";

    if (state === "in") {
        matchStatus = "live";
        matchTime = displayClock || "Live";
        halftimeScore = "";
    } else if (state === "post") {
        matchStatus = "today";
        matchTime = detail || "FT";
        halftimeScore = detail || "FT";
    } else {
        // pre / scheduled
        matchStatus = "today";
        const d = new Date(event.date);
        matchTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        halftimeScore = "";
    }

    // Extract goal scorers from competition details
    const homeScorers = [];
    const awayScorers = [];
    if (comp.details && Array.isArray(comp.details)) {
        comp.details.forEach(detail => {
            if (!detail.scoringPlay) return;
            const playerName = (detail.athletesInvolved && detail.athletesInvolved[0])
                ? (detail.athletesInvolved[0].displayName || detail.athletesInvolved[0].shortName || "")
                : "";
            const clock = (detail.clock && detail.clock.displayValue) ? detail.clock.displayValue : "";
            const label = `${clock}${clock ? " " : ""}${playerName}`;

            if (detail.team && home.team && detail.team.id === home.team.id) {
                homeScorers.push(label);
            } else {
                awayScorers.push(label);
            }
        });
    }

    // Extract possession stat from competitors' statistics
    let possession = 50;
    const homeStats = home.statistics || [];
    const possessionStat = homeStats.find(s => s.name === "possessionPct" || s.name === "possession");
    if (possessionStat) {
        possession = parseInt(possessionStat.displayValue, 10) || 50;
    }

    return {
        id: `api-${event.id}`,
        sport: leagueInfo.sport,
        league: leagueInfo.name,
        leagueId: leagueInfo.code,
        homeTeam,
        homeCode,
        homeColor,
        awayTeam,
        awayCode,
        awayColor,
        homeScore,
        awayScore,
        halftimeScore: halftimeScore || `${homeScore}-${awayScore}`,
        time: matchTime,
        status: matchStatus,
        favorites: false,
        stats: {
            possession,
            shots: 0,
            shotsOnTarget: 0,
            corners: 0,
            fouls: 0,
            yellowCards: 0,
            redCards: 0
        },
        scorers: { home: homeScorers, away: awayScorers }
    };
}

// Show loading skeleton cards in the matches list
function showSkeletons(count = 4) {
    matchesContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
        matchesContainer.innerHTML += `
            <div class="skeleton-card">
                <div class="skeleton-line skeleton-header"></div>
                <div class="skeleton-team-row">
                    <div class="skeleton-line skeleton-team"></div>
                    <div class="skeleton-line skeleton-score"></div>
                    <div class="skeleton-line skeleton-team"></div>
                </div>
                <div class="skeleton-line skeleton-footer"></div>
            </div>`;
    }
}

// Fetch and load all matches for the selected sport from the ESPN API
async function loadAPIMatches() {
    if (apiLoading) return;
    apiLoading = true;
    showSkeletons(5);

    const endpoints = ESPN_ENDPOINTS[currentSport] || ESPN_ENDPOINTS["all"];
    const fetched = [];

    await Promise.allSettled(
        endpoints.map(async slug => {
            try {
                const data = await fetchESPNLeague(slug);
                const leagueInfo = LEAGUE_NAMES[slug] || { name: slug, code: slug.split("/")[1].toUpperCase(), sport: "football" };
                const events = data.events || [];
                events.forEach(evt => {
                    const match = parseESPNEvent(evt, leagueInfo);
                    if (match) fetched.push(match);
                });
            } catch (err) {
                console.warn("ESPN fetch error for", slug, err.message);
            }
        })
    );

    apiMatches = fetched;
    apiLoading = false;

    if (apiMatches.length === 0) {
        // API returned no events — fall back gracefully
        console.info("No ESPN events found. Falling back to simulation.");
        setApiMode(false);
        showNotification("No live matches found in API. Switched to Simulation Mode.");
        return;
    }

    // Update live match counter badge
    const liveCount = apiMatches.filter(m => m.status === "live").length;
    const badge = document.getElementById("live-match-count-badge");
    const statNum = document.getElementById("stat-live-matches");
    if (badge) badge.textContent = `${liveCount || apiMatches.length} Matches (API)`;
    if (statNum) statNum.textContent = liveCount || apiMatches.length;

    // Update status bar timestamp
    const lastUpdatedEl = document.getElementById("api-last-updated");
    if (lastUpdatedEl) {
        const now = new Date();
        lastUpdatedEl.textContent = `Updated ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · ${apiMatches.length} events`;
    }

    renderMatches();
    renderTicker();

    // Auto-spotlight the first live match, or first match overall
    const firstLive = apiMatches.find(m => m.status === "live");
    const firstMatch = firstLive || apiMatches[0];
    if (firstMatch) setSpotlightMatch(firstMatch.id);
}

// Toggle between Simulation and Live API modes
function setApiMode(enable) {
    isApiMode = enable;
    const statusBar = document.getElementById("api-status-bar");
    const lastUpdatedEl = document.getElementById("api-last-updated");

    if (enable) {
        apiModeText.textContent = "Live API Mode";
        apiModeIndicator.className = "api-indicator-dot pulsing-green";
        apiModeBtn.style.borderColor = "rgba(16,185,129,0.4)";
        apiModeBtn.style.color = "var(--accent)";
        if (statusBar) {
            statusBar.classList.add("visible");
            if (lastUpdatedEl) lastUpdatedEl.textContent = "Fetching...";
        }
        loadAPIMatches();
    } else {
        isApiMode = false;
        apiMatches = [];
        apiModeText.textContent = "Simulation Mode";
        apiModeIndicator.className = "api-indicator-dot pulsing-orange";
        apiModeBtn.style.borderColor = "";
        apiModeBtn.style.color = "";
        if (statusBar) statusBar.classList.remove("visible");

        // Restore simulation counters
        const badge = document.getElementById("live-match-count-badge");
        const statNum = document.getElementById("stat-live-matches");
        if (badge) badge.textContent = "54 Matches Live Now";
        if (statNum) statNum.textContent = "54";

        renderMatches();
        renderTicker();
        setSpotlightMatch("fb-1");
    }
}

// Render Live Ticker
function renderTicker() {
    tickerSlider.innerHTML = "";
    
    const activeMatches = isApiMode ? apiMatches : MOCK_MATCHES;
    if (activeMatches.length === 0) {
        tickerSlider.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); padding: 0 20px;">No live ticker events</span>`;
        return;
    }
    
    // In simulation mode show only football; in API mode show everything
    const tickerSource = isApiMode
        ? activeMatches
        : activeMatches.filter(m => m.sport === "football");

    if (tickerSource.length === 0) {
        tickerSlider.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); padding: 0 20px;">No matches in ticker</span>`;
        return;
    }

    // We double the matches list so it loops infinitely smoothly
    const tickerMatches = [...tickerSource, ...tickerSource];
    
    tickerMatches.forEach((match) => {
        const card = document.createElement("div");
        card.className = "ticker-card";
        card.setAttribute("data-match-id", match.id);

        const isLive = match.status === "live";
        const liveBadge = isLive ? `<span class="ticker-live-dot"></span>` : "";

        card.innerHTML = `
            <span class="ticker-league">${match.leagueId}</span>
            <div class="ticker-match">
                <span class="ticker-team">${match.homeCode}</span>
                <span class="ticker-score">${liveBadge}${match.homeScore} - ${match.awayScore}</span>
                <span class="ticker-team">${match.awayCode}</span>
            </div>
            <span class="ticker-time">${match.time}</span>
        `;
        
        card.addEventListener("click", () => {
            setSpotlightMatch(match.id);
        });
        
        tickerSlider.appendChild(card);
    });
}

// Render Standings
function renderStandings() {
    standingsBody.innerHTML = "";
    const list = MOCK_STANDINGS[currentStandingLeague];
    
    list.forEach((row) => {
        const tr = document.createElement("tr");
        // Highlight active teams in mock live matches
        const isLiveTeam = row.team === "Arsenal" || row.team === "Chelsea" || row.team === "Man City";
        if (isLiveTeam) {
            tr.className = "highlight-row";
        }
        
        tr.innerHTML = `
            <td class="col-rank">${row.rank}</td>
            <td class="col-team">
                <div class="table-team-cell">
                    <div class="player-avatar-mini" style="font-size: 8px; width: 18px; height: 18px;">${row.logo}</div>
                    <span>${row.team}</span>
                </div>
            </td>
            <td class="col-stat">${row.played}</td>
            <td class="col-stat">${row.gd > 0 ? '+' + row.gd : row.gd}</td>
            <td class="col-stat" style="font-weight:700;">${row.pts}</td>
        `;
        standingsBody.appendChild(tr);
    });
}

// Render News
function renderNews() {
    newsContainer.innerHTML = "";
    MOCK_NEWS.forEach((news) => {
        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <div class="news-thumb" style="background: ${news.grad}"></div>
            <div class="news-meta">
                <span class="news-category-badge">${news.category}</span>
                <h4 class="news-title">${news.title}</h4>
                <span class="news-time">${news.time}</span>
            </div>
        `;
        newsContainer.appendChild(card);
    });
}

// Render Matches List
function renderMatches() {
    matchesContainer.innerHTML = "";
    
    const activeMatches = isApiMode ? apiMatches : MOCK_MATCHES;
    
    // Filter matches
    let filtered = activeMatches.filter((m) => {
        // Sport selector
        if (currentSport !== "all" && m.sport !== currentSport) return false;
        
        // Tab filters
        if (currentFilter === "live" && m.status !== "live") return false;
        if (currentFilter === "ht" && m.time !== "HT" && m.halftimeScore !== "Ended" && !m.time.includes("HT")) return false;
        if (currentFilter === "today" && m.status !== "today" && m.status !== "live") return false;
        if (currentFilter === "favorites" && !m.favorites) return false;
        
        return true;
    });
    
    if (filtered.length === 0) {
        matchesContainer.innerHTML = `
            <div class="no-matches" style="text-align: center; color: var(--text-secondary); padding: 40px 0; font-size: 13px;">
                No matches found matching the criteria.
            </div>
        `;
        return;
    }
    
    filtered.forEach((match) => {
        const card = document.createElement("div");
        card.className = `match-card ${match.id === spotlightMatchId ? 'active-spotlight' : ''}`;
        card.setAttribute("data-match-id", match.id);
        
        const isLive = match.status === "live";
        const homeScorersString = match.scorers.home.join(", ");
        const awayScorersString = match.scorers.away.join(", ");
        
        card.innerHTML = `
            <div class="match-card-header">
                <span class="match-card-league">${match.league}</span>
                <span class="match-card-time ${isLive ? 'live' : ''}">
                    ${isLive ? '<span class="live-indicator-dot"></span>' : ''}
                    ${match.time}
                </span>
            </div>
            
            <div class="match-card-scoreboard">
                <div class="match-card-team-info">
                    <span class="match-team-name">${match.homeTeam}</span>
                    <div class="player-avatar-mini" style="font-size: 8px; width: 20px; height: 20px;">${match.homeCode}</div>
                </div>
                
                <div class="match-card-scores">
                    <span>${match.homeScore}</span>
                    <span class="score-dash">-</span>
                    <span>${match.awayScore}</span>
                </div>
                
                <div class="match-card-team-info away">
                    <div class="player-avatar-mini" style="font-size: 8px; width: 20px; height: 20px; margin-right: 10px;">${match.awayCode}</div>
                    <span class="match-team-name">${match.awayTeam}</span>
                </div>
            </div>
            
            <div class="match-card-footer">
                <div class="match-stat-capsules">
                    <span class="stat-capsule">⚽ ${match.homeScore + match.awayScore} Goals</span>
                    <span class="stat-capsule">📊 ${match.stats.possession}% Poss</span>
                </div>
                
                <button class="btn-star-fav ${match.favorites ? 'favorited' : ''}" data-match-id="${match.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${match.favorites ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        
        // Click to spotlight card (excluding favoriting star click)
        card.addEventListener("click", (e) => {
            if (e.target.closest(".btn-star-fav")) return;
            setSpotlightMatch(match.id);
        });
        
        // Favorite toggle click handler
        const favBtn = card.querySelector(".btn-star-fav");
        favBtn.addEventListener("click", () => {
            match.favorites = !match.favorites;
            favBtn.classList.toggle("favorited");
            renderMatches();
            // Show alert/notify if favorited
            if (match.favorites) {
                showNotification(`Added ${match.homeTeam} vs ${match.awayTeam} to Favorites`);
            }
        });
        
        matchesContainer.appendChild(card);
    });
}

// Spotlight Match Setup
function setSpotlightMatch(id) {
    spotlightMatchId = id;
    const activeMatches = isApiMode ? apiMatches : MOCK_MATCHES;
    const match = activeMatches.find((m) => m.id === id) || MOCK_MATCHES.find((m) => m.id === id);
    if (!match) return;
    
    // Update active highlight classes on cards
    document.querySelectorAll(".match-card").forEach((c) => {
        if (c.getAttribute("data-match-id") === id) {
            c.classList.add("active-spotlight");
        } else {
            c.classList.remove("active-spotlight");
        }
    });
    
    // Set spotlight header
    spotlightLeague.innerText = match.league;
    spotlightTime.innerText = match.time;
    
    // Set scoreboard
    spotlightHomeName.innerText = match.homeTeam;
    spotlightAwayName.innerText = match.awayTeam;
    spotlightHomeScore.innerText = match.homeScore;
    spotlightAwayScore.innerText = match.awayScore;
    spotlightHalftimeScore.innerText = match.halftimeScore;
    
    // SVG Logos
    spotlightHomeLogoContainer.innerHTML = generateTeamSVG(match.homeCode, match.homeColor);
    spotlightAwayLogoContainer.innerHTML = generateTeamSVG(match.awayCode, match.awayColor);
    
    // Set scorers list
    spotlightHomeScorers.innerHTML = "";
    match.scorers.home.forEach((scorer) => {
        const div = document.createElement("div");
        div.className = "scorer-item";
        div.innerText = `⚽ ${scorer}`;
        spotlightHomeScorers.appendChild(div);
    });
    
    spotlightAwayScorers.innerHTML = "";
    match.scorers.away.forEach((scorer) => {
        const div = document.createElement("div");
        div.className = "scorer-item";
        div.innerText = `⚽ ${scorer}`;
        spotlightAwayScorers.appendChild(div);
    });
    
    // Update comparison stats header
    statsHomeName.innerText = match.homeCode;
    statsAwayName.innerText = match.awayCode;
    statsHomeScore.innerText = match.homeScore;
    statsAwayScore.innerText = match.awayScore;
    
    // Render Stats Progress Bars
    renderStatsBars(match);
}

// Render Stats Bars
function renderStatsBars(match) {
    statsBarsList.innerHTML = "";
    
    const statsConfig = [
        { key: "possession", label: "Possession", suffix: "%" },
        { key: "shots", label: "Shots", suffix: "" },
        { key: "shotsOnTarget", label: "Shots on Target", suffix: "" },
        { key: "corners", label: "Corners", suffix: "" },
        { key: "fouls", label: "Fouls", suffix: "" },
        { key: "yellowCards", label: "Yellow Cards", suffix: "" }
    ];
    
    statsConfig.forEach((stat) => {
        const row = document.createElement("div");
        row.className = "stat-item-row";
        
        let homeVal = match.stats[stat.key];
        let awayVal;
        
        // Possession is home%, away% is 100-home%
        if (stat.key === "possession") {
            awayVal = 100 - homeVal;
        } else {
            // For other statistics, we mock a reasonable away number or fetch it
            // Chelsea/Newcastle have actual stats or we simulate
            // Let's calculate percentage values for bars
            awayVal = Math.round(homeVal * 0.8) || 1; 
            if (match.id === "fb-1") {
                // Exact matching image
                const referenceMap = {
                    possession: [55, 45],
                    shots: [8, 6],
                    shotsOnTarget: [4, 2],
                    corners: [4, 2],
                    fouls: [7, 8],
                    yellowCards: [2, 1]
                };
                homeVal = referenceMap[stat.key][0];
                awayVal = referenceMap[stat.key][1];
            }
        }
        
        const total = homeVal + awayVal || 1;
        const homePct = (homeVal / total) * 100;
        const awayPct = (awayVal / total) * 100;
        
        row.innerHTML = `
            <div class="stat-row-meta">
                <span class="stat-val-home">${homeVal}${stat.suffix}</span>
                <span class="stat-label-name">${stat.label}</span>
                <span class="stat-val-away">${awayVal}${stat.suffix}</span>
            </div>
            <div class="stat-track-bar">
                <div class="stat-fill-home" style="width: ${homePct}%; background: ${match.homeColor};"></div>
                <div class="stat-fill-away" style="width: ${awayPct}%; background: ${match.awayColor};"></div>
            </div>
        `;
        statsBarsList.appendChild(row);
    });
}

// Show live notification — adds to dropdown list AND shows a toast overlay
function showNotification(message, isToast = false) {
    const badge = document.querySelector(".notification-badge");
    if (badge) badge.classList.add("active");
    
    // Add to dropdown list
    const list = document.getElementById("notification-list");
    if (list) {
        const item = document.createElement("div");
        item.className = "notification-item unread";
        item.innerHTML = `
            <div class="item-title">${message}</div>
            <div class="item-time">Just Now</div>
        `;
        list.prepend(item);
    }

    // Show a dismissing toast for important API / goal events
    if (isToast || message.startsWith("GOAL") || message.includes("API") || message.includes("Mode")) {
        const existing = document.querySelector(".notification-toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }
}

// --- EVENT SIMULATION LOOP ---
// Every 4 seconds, increment time on matches. Every 16 seconds, trigger an event (goals, shots, cards)
let gameSeconds = 72;

function simulationLoop() {
    // Only run in simulation mode
    if (isApiMode) return;

    // 1. Increment Time
    MOCK_MATCHES.forEach((match) => {
        if (match.status !== "live") return;
        
        if (match.sport === "football") {
            let min = parseInt(match.time);
            if (min < 90) {
                min += 1;
                match.time = min + "'";
            } else {
                match.time = "90'+3";
            }
        }
    });
    
    // Update live ticker/spotlight time labels
    renderTicker();
    renderMatches();
    
    const spotlightMatch = MOCK_MATCHES.find((m) => m.id === spotlightMatchId);
    if (spotlightMatch) {
        spotlightTime.innerText = spotlightMatch.time;
    }
}

function eventSimulation() {
    // Only run in simulation mode
    if (isApiMode) return;

    // Pick a random live match
    const liveMatches = MOCK_MATCHES.filter((m) => m.status === "live");
    if (liveMatches.length === 0) return;
    
    const match = liveMatches[Math.floor(Math.random() * liveMatches.length)];
    const isHomeEvent = Math.random() > 0.45; // slightly favor home
    
    // Event types: Goal (10%), Shot (40%), Yellow Card (20%), Corner (30%)
    const roll = Math.random();
    
    if (roll < 0.12) {
        // GOAL!
        const scorerNames = {
            Arsenal: ["Bukayo Saka", "Gabriel Martinelli", "Martin Ødegaard", "Kai Havertz", "Declan Rice"],
            Chelsea: ["Cole Palmer", "N. Jackson", "Enzo Fernández", "Sterling", "Mudryk"],
            "Manchester City": ["Erling Haaland", "Kevin De Bruyne", "Phil Foden", "Bernardo Silva"],
            "Newcastle United": ["Alexander Isak", "Anthony Gordon", "Bruno Guimarães"],
            Barcelona: ["Robert Lewandowski", "Raphinha", "Gavi", "Pedri"],
            "Real Madrid": ["Vinicius Jr", "Jude Bellingham", "Rodrygo", "Mbappé"],
            "AC Milan": ["Rafael Leão", "Olivier Giroud", "Christian Pulisic"],
            "Inter Milan": ["Lautaro Martínez", "Marcus Thuram", "Hakan Çalhanoğlu"],
            "Paris Saint-Germain": ["Kylian Mbappé", "Ousmane Dembélé", "Kolo Muani"],
            Lille: ["Jonathan David", "Zhegrova"]
        };
        
        const scorerTeam = isHomeEvent ? match.homeTeam : match.awayTeam;
        const pool = scorerNames[scorerTeam] || ["Player"];
        const player = pool[Math.floor(Math.random() * pool.length)];
        const minStr = match.time.replace("'", "");
        
        if (isHomeEvent) {
            match.homeScore += 1;
            match.scorers.home.push(`${minStr}' ${player}`);
            match.stats.shots += 1;
            match.stats.shotsOnTarget += 1;
        } else {
            match.awayScore += 1;
            match.scorers.away.push(`${minStr}' ${player}`);
            match.stats.shots += 1;
            match.stats.shotsOnTarget += 1;
        }
        
        showNotification(`GOAL! ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam} (${player} ${match.time})`);
        
        // Highlight score flash animation
        if (match.id === spotlightMatchId) {
            const scoreDisp = document.querySelector(".score-display");
            scoreDisp.style.color = "var(--accent)";
            scoreDisp.style.transform = "scale(1.15)";
            setTimeout(() => {
                scoreDisp.style.color = "";
                scoreDisp.style.transform = "";
            }, 1500);
        }
        
    } else if (roll < 0.5) {
        // Shot
        match.stats.shots += 1;
        if (Math.random() > 0.6) {
            match.stats.shotsOnTarget += 1;
        }
        // Update stats bar if active
    } else if (roll < 0.7) {
        // Yellow Card
        match.stats.yellowCards += 1;
    } else {
        // Corner
        match.stats.corners += 1;
    }
    
    // Sync UI elements
    renderMatches();
    if (match.id === spotlightMatchId) {
        setSpotlightMatch(match.id);
    }
}

// --- PITCH BROADCAST TRACKER ANIMATION ---
let playState = true;
let pitchTimer;
const pitchBall = document.getElementById("pitch-ball");

function runPitchTrackerAnimation() {
    if (!playState) return;
    
    // Generate random coordinates inside the pitch dimensions
    // Pitch is roughly width: 100%, height: 100%
    const ballX = Math.floor(Math.random() * 80) + 10;
    const ballY = Math.floor(Math.random() * 80) + 10;
    
    // Move the ball
    pitchBall.style.left = `${ballX}%`;
    pitchBall.style.top = `${ballY}%`;
    
    // Move players slightly towards the ball
    const players = document.querySelectorAll(".pitch-player");
    players.forEach((p) => {
        const playerSpeed = 8; // Max offset from ball
        const currentX = parseFloat(p.style.left);
        const currentY = parseFloat(p.style.top);
        
        // Chase ball with error factor
        const targetX = ballX + (Math.random() * 20 - 10);
        const targetY = ballY + (Math.random() * 20 - 10);
        
        // Interpolate
        const newX = currentX + (targetX - currentX) * 0.15;
        const newY = currentY + (targetY - currentY) * 0.15;
        
        p.style.left = `${Math.max(5, Math.min(95, newX))}%`;
        p.style.top = `${Math.max(5, Math.min(95, newY))}%`;
    });
    
    // Add dummy chat commentary logs
    const commentary = [
        "Saka receives a pass on the right flank.",
        "Arsenal pushes forward into the attacking third.",
        "Jackson makes a runs behind Saliba.",
        "Gallagher intercepts in the center circle.",
        "Ødegaard coordinates the play from midfield.",
        "Slick combination passing from Chelsea.",
        "Shot blocked by the Arsenal defender!",
        "Ref signals to continue after a slide tackle."
    ];
    
    if (Math.random() > 0.6) {
        const commList = document.getElementById("commentary-list");
        const log = document.createElement("p");
        const match = MOCK_MATCHES.find((m) => m.id === spotlightMatchId) || MOCK_MATCHES[0];
        log.innerHTML = `<strong>[${match.time}]</strong> ${commentary[Math.floor(Math.random() * commentary.length)]}`;
        commList.prepend(log);
        if (commList.children.length > 5) {
            commList.removeChild(commList.lastChild);
        }
    }
}

// --- LISTENERS AND HANDLERS ---

function initEventHandlers() {
    // Theme Toggle
    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        
        // Swap icons
        const moon = document.querySelector(".moon-icon");
        const sun = document.querySelector(".sun-icon");
        moon.classList.toggle("hidden");
        sun.classList.toggle("hidden");
    });

    // API Mode toggle button
    apiModeBtn.addEventListener("click", () => {
        setApiMode(!isApiMode);
    });
    
    // Modals toggle
    loginBtn.addEventListener("click", () => {
        loginModal.classList.add("active");
    });
    closeLoginModal.addEventListener("click", () => {
        loginModal.classList.remove("active");
    });
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        loginBtn.innerText = "Logged In";
        loginModal.classList.remove("active");
        showNotification("Successfully logged in as administrator!");
    });
    
    watchLiveBtn.addEventListener("click", () => {
        watchLiveModal.classList.add("active");
        // Run commentary list clean reset
        const commList = document.getElementById("commentary-list");
        commList.innerHTML = `<p><strong>[Live]</strong> Connected to stream. Fetching tactical match feed...</p>`;
    });
    closeWatchModal.addEventListener("click", () => {
        watchLiveModal.classList.remove("active");
    });
    
    // Play/Pause stream simulation
    const playPauseBtn = document.getElementById("play-pause-btn");
    playPauseBtn.addEventListener("click", () => {
        playState = !playState;
        playPauseBtn.innerText = playState ? "Pause Stream" : "Resume Stream";
    });
    
    // Sports navigation filtering
    const sportTabs = document.querySelectorAll(".sport-tab");
    sportTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            sportTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentSport = tab.getAttribute("data-sport");
            if (isApiMode) {
                // Re-fetch API data for the newly selected sport
                loadAPIMatches();
            } else {
                renderMatches();
            }
        });
    });
    
    // Live Scores lists filtering tabs
    const filterTabs = document.querySelectorAll(".filter-tab");
    filterTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            filterTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.getAttribute("data-filter");
            renderMatches();
        });
    });
    
    // Standings tabs switcher
    const standingTabs = document.querySelectorAll(".standings-tab");
    standingTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            standingTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentStandingLeague = tab.getAttribute("data-standing-league");
            renderStandings();
        });
    });
    
    // Search filter input logic
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = "none";
            return;
        }
        
        const matches = MOCK_MATCHES.filter((m) => {
            return m.homeTeam.toLowerCase().includes(query) || 
                   m.awayTeam.toLowerCase().includes(query) || 
                   m.league.toLowerCase().includes(query);
        });
        
        searchResults.innerHTML = "";
        
        if (matches.length === 0) {
            searchResults.innerHTML = `<div style="padding: 10px 16px; font-size: 12px; color: var(--text-muted);">No results found</div>`;
        } else {
            matches.forEach((m) => {
                const item = document.createElement("div");
                item.className = "search-item";
                item.innerHTML = `
                    <div>
                        <div class="item-title">${m.homeTeam} vs ${m.awayTeam}</div>
                        <div class="item-desc">${m.league}</div>
                    </div>
                    <div class="item-desc">${m.time}</div>
                `;
                item.addEventListener("click", () => {
                    setSpotlightMatch(m.id);
                    searchInput.value = "";
                    searchResults.style.display = "none";
                });
                searchResults.appendChild(item);
            });
        }
        
        searchResults.style.display = "block";
    });
    
    // Click outside to close notifications & search results
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            searchResults.style.display = "none";
        }
        if (!e.target.closest(".notification-btn")) {
            notificationDropdown.classList.remove("active");
        }
    });
    
    // Notifications button click
    notificationBtn.addEventListener("click", () => {
        notificationDropdown.classList.toggle("active");
        document.querySelector(".notification-badge").classList.remove("active");
    });
    
    // Quick link binds
    navHome.addEventListener("click", (e) => {
        e.preventDefault();
        currentSport = "all";
        currentFilter = "all";
        sportTabs.forEach((t) => t.classList.remove("active"));
        sportTabs[0].classList.add("active");
        filterTabs.forEach((t) => t.classList.remove("active"));
        filterTabs[0].classList.add("active");
        renderMatches();
    });
    
    navLive.addEventListener("click", (e) => {
        e.preventDefault();
        currentFilter = "live";
        filterTabs.forEach((t) => t.classList.remove("active"));
        document.querySelector("[data-filter='live']").classList.add("active");
        renderMatches();
    });
    
    heroBtnLive.addEventListener("click", () => {
        currentFilter = "live";
        filterTabs.forEach((t) => t.classList.remove("active"));
        document.querySelector("[data-filter='live']").classList.add("active");
        renderMatches();
    });
}

// --- INITIALIZATION ---
function init() {
    initEventHandlers();
    
    // Initial Render
    renderTicker();
    renderStandings();
    renderNews();
    renderMatches();
    setSpotlightMatch("fb-1");
    
    // Start Live Match Simulation (guarded — skips when isApiMode === true)
    setInterval(simulationLoop, 6000);   // clock ticks every 6 s
    setInterval(eventSimulation, 18000); // match events every 18 s
    
    // Auto-refresh ESPN API data every 60 seconds when in API mode
    setInterval(() => {
        if (isApiMode && !apiLoading) {
            loadAPIMatches();
        }
    }, 60000);
    
    // Start tactical pitch broadcast animations
    setInterval(runPitchTrackerAnimation, 1200);
}

// Start everything when DOM is ready
document.addEventListener("DOMContentLoaded", init);

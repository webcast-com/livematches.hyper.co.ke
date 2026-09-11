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

const MOCK_SCORERS = [
    { rank: 1, name: "Erling Haaland", club: "Man City", goals: 21 },
    { rank: 2, name: "Kylian Mbappé", club: "PSG", goals: 18 },
    { rank: 3, name: "Harry Kane", club: "Bayern Munich", goals: 17 },
    { rank: 4, name: "Lautaro Martínez", club: "Inter Milan", goals: 16 },
    { rank: 5, name: "Mohamed Salah", club: "Liverpool", goals: 15 }
];

// --- APP STATE ---
let currentSport = "all";
let currentFilter = "all";
let currentLeague = "all";
let sortByLeague = false;
let currentStandingLeague = "EPL";
let spotlightMatchId = "fb-1";
let searchOpen = false;
let isApiMode = false;
let apiMatches = [];
let apiLoading = false;

// Live API extras (populated when Live API mode is active)
let liveStandings = {};        // leagueKey → parsed standings rows
let liveStandingsAt = {};      // leagueKey → fetch timestamp (TTL cache)
let liveNews = null;           // parsed news articles
let liveNewsAt = 0;
let liveScorers = null;        // parsed golden-boot rows for current tab league
let liveScorersAt = 0;
let liveScorersLeague = null;  // which league liveScorers belongs to
let espnSeasonYear = null;     // current season year captured from scoreboard responses
let usingLiveCommentary = false; // real commentary feed active in Watch Live modal
const summaryCache = new Map();   // espnEventId → { data, ts }
let summaryFetchTimer = null;

// Standings tab → ESPN league slug (also drives the Top Scorers league)
const STANDINGS_TAB_SLUGS = {
    EPL: "eng.1",
    LaLiga: "esp.1",
    SerieA: "ita.1"
};

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
const navFixtures = document.getElementById("nav-fixtures");
const navLeagues = document.getElementById("nav-leagues");
const navNews = document.getElementById("nav-news");
const navTeams = document.getElementById("nav-teams");
const navStats = document.getElementById("nav-stats");
const navToggleBtn = document.getElementById("nav-toggle-btn");
const mainNav = document.querySelector(".main-nav");
const heroBtnLive = document.getElementById("hero-btn-live");
const heroBtnFixtures = document.getElementById("hero-btn-fixtures");
const favsToggleTopBtn = document.getElementById("favs-toggle-top-btn");
const viewAllMatchesBtn = document.getElementById("view-all-matches-btn");
const filterOptionsBtn = document.getElementById("filter-options-toggle");
const goToSignup = document.getElementById("go-to-signup");

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

// --- ESPN transport (multi-strategy with automatic fallback) ---
// NOTE: ESPN's Akamai CDN blocks most public CORS proxies (allorigins, corsproxy.io,
// codetabs…) with "Access Denied" 403 pages, so proxying every request breaks live
// data. ESPN's own web app calls these API hosts directly from the browser, so we
// try DIRECT requests first and only fall back to public proxies when a network
// (e.g. a corporate firewall) blocks direct cross-origin calls.
// The first strategy that returns valid ESPN JSON is remembered and reused.

const ESPN_FETCH_TIMEOUT_MS = 10000;

// Each strategy: build(path, host) → fetchable URL, parse(resp) → ESPN JSON.
// "host" is the ESPN origin serving the requested path (defaults to site.api.espn.com);
// the direct·web mirror only applies to the site.api host.
const ESPN_STRATEGIES = [
    {
        name: "direct·web",
        build: (p, host) => `https://site.web.api.espn.com${p}`,
        applies: host => host === "site.api.espn.com",
        parse: r => r.json()
    },
    {
        name: "direct",
        build: (p, host) => `https://${host}${p}`,
        parse: r => r.json()
    },
    {
        name: "proxy·allorigins",
        build: (p, host) => `https://api.allorigins.win/raw?url=${encodeURIComponent("https://" + host + p)}`,
        parse: r => r.json()
    },
    {
        name: "proxy·codetabs",
        build: (p, host) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent("https://" + host + p)}`,
        parse: r => r.json()
    },
    {
        name: "proxy·allorigins·wrapped",
        build: (p, host) => `https://api.allorigins.win/get?url=${encodeURIComponent("https://" + host + p)}`,
        parse: async r => {
            const wrapper = await r.json();
            if (wrapper && wrapper.status && wrapper.status.http_code && wrapper.status.http_code !== 200) {
                throw new Error(`upstream HTTP ${wrapper.status.http_code}`);
            }
            return typeof wrapper.contents === "string" ? JSON.parse(wrapper.contents) : wrapper;
        }
    }
];

let espnWorkingStrategy = null; // memoized index of the strategy that last worked

// Guard against CDN "Access Denied" HTML pages masquerading as successful responses
function isValidESPNData(data) {
    return !!(data && typeof data === "object" &&
        (Array.isArray(data.leagues) || Array.isArray(data.events) || data.season || data.day));
}

async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { cache: "no-cache", signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

function espnTransportName() {
    return espnWorkingStrategy !== null ? ESPN_STRATEGIES[espnWorkingStrategy].name : "auto";
}

// Fetch any ESPN JSON resource, trying each transport strategy (memoized first)
// until one returns data that passes the endpoint-specific validator.
async function fetchESPNPath(path, opts = {}) {
    const host = opts.host || "site.api.espn.com";
    const validate = opts.validate || isValidESPNData;

    // Try the memoized strategy first, then the rest in order
    const order = [];
    if (espnWorkingStrategy !== null) order.push(espnWorkingStrategy);
    for (let i = 0; i < ESPN_STRATEGIES.length; i++) {
        if (i !== espnWorkingStrategy) order.push(i);
    }

    let lastError = null;
    for (const idx of order) {
        const strategy = ESPN_STRATEGIES[idx];
        if (strategy.applies && !strategy.applies(host)) continue;
        try {
            const resp = await fetchWithTimeout(strategy.build(path, host), ESPN_FETCH_TIMEOUT_MS);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await strategy.parse(resp);
            if (!validate(data)) throw new Error("response failed validation (likely a CDN block page)");
            espnWorkingStrategy = idx; // remember what works
            return data;
        } catch (err) {
            if (err && err.name === "AbortError") {
                lastError = new Error("timeout");
            } else {
                lastError = err;
            }
            console.warn(`ESPN fetch via ${strategy.name} (${host}) failed:`, lastError.message);
        }
    }
    throw new Error(`All transports failed for ${host}${path} (${lastError ? lastError.message : "unknown error"})`);
}

// Fetch ESPN scoreboard for a specific endpoint slug
async function fetchESPNLeague(slug) {
    return fetchESPNPath(`/apis/site/v2/sports/${slug}/scoreboard`);
}

// Convert ESPN event JSON → internal match object
function parseESPNEvent(event, leagueInfo, leagueSlug) {
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

    // TV / streaming broadcast channel (e.g. "Peacock") when ESPN provides one
    let broadcast = "";
    if (Array.isArray(comp.broadcasts) && comp.broadcasts[0] && Array.isArray(comp.broadcasts[0].names)) {
        broadcast = comp.broadcasts[0].names.join(", ");
    } else if (Array.isArray(comp.geoBroadcasts) && comp.geoBroadcasts[0] && comp.geoBroadcasts[0].media) {
        broadcast = comp.geoBroadcasts[0].media.shortName || comp.geoBroadcasts[0].media.displayName || "";
    }

    // Betting odds (ESPN BET) — converted to decimal odds at render time
    let odds = null;
    const oddsInfo = Array.isArray(comp.odds) ? comp.odds.find(o => o && (o.details || o.overUnder || o.homeTeamOdds)) : null;
    if (oddsInfo) {
        odds = {
            details: oddsInfo.details || "",
            overUnder: oddsInfo.overUnder != null ? oddsInfo.overUnder : "",
            provider: (oddsInfo.provider && oddsInfo.provider.name) || "ESPN BET",
            home: oddsInfo.homeTeamOdds ? oddsInfo.homeTeamOdds.moneyLine : null,
            draw: oddsInfo.drawOdds ? oddsInfo.drawOdds.moneyLine : null,
            away: oddsInfo.awayTeamOdds ? oddsInfo.awayTeamOdds.moneyLine : null
        };
    }

    // Each team's leading scorer this season (embedded in scoreboard data)
    const extractTopScorer = (competitor) => {
        if (!competitor || !Array.isArray(competitor.leaders)) return null;
        const goalsCat = competitor.leaders.find(l => l.name === "goals" || l.name === "goalsLeaders");
        if (!goalsCat || !Array.isArray(goalsCat.leaders) || !goalsCat.leaders[0]) return null;
        const leader = goalsCat.leaders[0];
        const name = leader.athlete ? (leader.athlete.displayName || leader.athlete.shortName) : "";
        if (!name) return null;
        return { name, goals: parseInt(leader.displayValue, 10) || Math.round(leader.value || 0) };
    };

    return {
        id: `api-${event.id}`,
        espnEventId: event.id,
        leagueSlug,
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
        broadcast,
        odds,
        topScorers: {
            home: extractTopScorer(home),
            away: extractTopScorer(away)
        },
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
                // Remember the current season year (used for the leaders endpoint)
                if (data.season && data.season.year) espnSeasonYear = data.season.year;
                const leagueInfo = LEAGUE_NAMES[slug] || { name: slug, code: slug.split("/")[1].toUpperCase(), sport: "football" };
                const events = data.events || [];
                events.forEach(evt => {
                    const match = parseESPNEvent(evt, leagueInfo, slug);
                    if (match) fetched.push(match);
                });
            } catch (err) {
                console.warn("ESPN fetch error for", slug, err.message);
            }
        })
    );

    if (apiMatches.length === 0 && fetched.length === 0) {
        // No data at all — API unreachable or blocked. Fall back gracefully.
        apiLoading = false;
        console.info("ESPN fetch failed on all transports. Falling back to simulation.");
        setApiMode(false);
        showNotification("Live data unreachable (network/CDN block). Switched to Simulation Mode.");
        return;
    }

    if (fetched.length === 0) {
        // Refresh failed but we still have the previous data — keep showing it
        apiLoading = false;
        const keepUpdatedEl = document.getElementById("api-last-updated");
        if (keepUpdatedEl) keepUpdatedEl.textContent = "Update failed — showing last data, retrying…";
        console.warn("ESPN refresh failed; keeping previous match data.");
        return;
    }

    // Score-change detection (smooth roll animation + goal alerts)
    const prevById = new Map(apiMatches.map(m => [m.id, m]));
    scoreDeltas.clear();
    fetched.forEach(m => {
        const prev = prevById.get(m.id);
        if (prev && (prev.homeScore !== m.homeScore || prev.awayScore !== m.awayScore)) {
            scoreDeltas.set(m.id, {
                home: prev.homeScore !== m.homeScore,
                away: prev.awayScore !== m.awayScore,
                prevHome: prev.homeScore,
                prevAway: prev.awayScore
            });
        }
    });

    apiMatches = fetched;
    apiLoading = false;

    // Update live match counter badge
    const liveCount = apiMatches.filter(m => m.status === "live").length;
    const badge = document.getElementById("live-match-count-badge");
    const statNum = document.getElementById("stat-live-matches");
    if (badge) badge.textContent = `${liveCount || apiMatches.length} Matches (API)`;
    if (statNum) statNum.textContent = liveCount || apiMatches.length;

    // Update status bar timestamp (includes active transport for transparency)
    const lastUpdatedEl = document.getElementById("api-last-updated");
    if (lastUpdatedEl) {
        const now = new Date();
        lastUpdatedEl.textContent = `Updated ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · ${apiMatches.length} events · via ${espnTransportName()}`;
    }

    renderMatches();
    renderTicker();

    // Auto-spotlight the first live match, or first match overall
    const firstLive = apiMatches.find(m => m.status === "live");
    const firstMatch = firstLive || apiMatches[0];
    if (firstMatch) setSpotlightMatch(firstMatch.id);

    // Goal alerts for live score changes picked up by this refresh
    scoreDeltas.forEach((delta, id) => {
        const m = apiMatches.find(x => x.id === id);
        if (m && m.status !== "pre") {
            const scoringTeam = delta.home ? m.homeTeam : m.awayTeam;
            showNotification(`GOAL! ${scoringTeam} — ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`);
        }
    });
    scoreDeltas.clear(); // one animation per change — don't replay on unrelated re-renders

    // Load standings / news / top scorers from the API (TTL-cached, fire & forget)
    loadLiveExtras();
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

        // Restore the simulated extras (standings / news / scorers)
        usingLiveCommentary = false;
        scoreDeltas.clear();
        renderStandings();
        renderNews();
        renderScorers();
        updateFullTableLink(null);

        renderMatches();
        renderTicker();
        setSpotlightMatch("fb-1");
    }
}

// --- LIVE API EXTRAS: standings, top scorers, news, match summary ---

const LIVE_EXTRAS_TTL_MS = 5 * 60 * 1000;   // standings / news / scorers refresh window
const SUMMARY_TTL_MS = 90 * 1000;           // per-match summary cache window

function initials(name) {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || "?";
}

function timeAgoString(iso) {
    const t = Date.parse(iso);
    if (isNaN(t)) return "";
    const mins = Math.max(1, Math.round((Date.now() - t) / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

// American moneyline (e.g. -135 / +150) → decimal odds (1.74 / 2.50)
function americanToDecimal(moneyLine) {
    const v = parseFloat(moneyLine);
    if (isNaN(v) || v === 0) return null;
    return v > 0 ? 1 + v / 100 : 1 + 100 / Math.abs(v);
}

function oddsSummary(odds) {
    if (!odds) return "";
    const h = americanToDecimal(odds.home);
    const d = americanToDecimal(odds.draw);
    const a = americanToDecimal(odds.away);
    if (h && d && a) return `${h.toFixed(2)} · ${d.toFixed(2)} · ${a.toFixed(2)}`;
    if (odds.details) return odds.details;
    if (odds.overUnder) return `O/U ${odds.overUnder}`;
    return "";
}

function pickNewsCategory(article) {
    const cats = Array.isArray(article.categories) ? article.categories : [];
    const league = cats.find(c => c.type === "league" && c.description);
    if (league) return league.description;
    const topic = cats.find(c => c.type === "topic" && c.description);
    if (topic) return topic.description;
    return "Soccer";
}

// Resolve a core-API $ref link (athlete / team) to a display name
async function resolveCoreRefDisplayName(ref, field = "displayName") {
    if (!ref || !ref.$ref) return null;
    try {
        const url = new URL(ref.$ref.replace(/^http:/, "https:"));
        const data = await fetchESPNPath(url.pathname + url.search, {
            host: url.hostname,
            validate: d => !!(d && typeof d === "object" && (d.id || d.displayName || d.name))
        });
        return data[field] || data.displayName || data.shortDisplayName || data.name || null;
    } catch (err) {
        return null;
    }
}

// Standings via the site.web apis/v2 endpoint (the old site/v2 path returns an empty object)
async function loadLiveStandings(leagueKey) {
    const slug = STANDINGS_TAB_SLUGS[leagueKey];
    if (!slug) return null;
    const path = `/apis/v2/sports/soccer/${slug}/standings?region=us&lang=en&contentorigin=espn`;
    const data = await fetchESPNPath(path, {
        validate: d => !!(d && typeof d === "object" && Array.isArray(d.children) && d.children.length)
    });
    const child = data.children[0] || {};
    const node = child.standings || (child.children && child.children[0] && child.children[0].standings) || null;
    if (!node || !Array.isArray(node.entries)) return null;

    const statOf = (entry, name) => {
        const s = (entry.stats || []).find(x => x.name === name);
        return s ? (s.displayValue !== undefined && s.displayValue !== "" ? s.displayValue : s.value) : "0";
    };
    const rows = node.entries.map(entry => ({
        rank: parseInt(statOf(entry, "rank"), 10) || 0,
        team: entry.team ? (entry.team.displayName || entry.team.shortDisplayName || entry.team.name || "?") : "?",
        abbrev: entry.team ? (entry.team.abbreviation || "") : "",
        logo: (entry.team && Array.isArray(entry.team.logos) && entry.team.logos[0]) ? entry.team.logos[0].href : "",
        played: parseInt(statOf(entry, "gamesPlayed"), 10) || 0,
        gd: parseInt(statOf(entry, "pointDifferential"), 10) || 0,
        pts: parseInt(statOf(entry, "points"), 10) || 0,
        zone: entry.note ? { color: entry.note.color || "#81D6AC", desc: entry.note.description || "" } : null
    }));
    rows.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    return rows;
}

// Latest headlines from the ESPN news endpoint
async function loadLiveNews() {
    const data = await fetchESPNPath(`/apis/site/v2/sports/soccer/eng.1/news?limit=6`, {
        validate: d => !!(d && Array.isArray(d.articles))
    });
    return data.articles.slice(0, 5).map(a => ({
        id: a.id,
        title: a.headline || a.description || "Untitled",
        category: pickNewsCategory(a),
        time: timeAgoString(a.published),
        image: (Array.isArray(a.images) && a.images[0]) ? a.images[0].url : "",
        link: (a.links && a.links.web && a.links.web.href) || "https://www.espn.com/soccer/"
    }));
}

// Golden boot via the core API leaders endpoint (player/team names come as $refs)
async function loadLiveScorers(leagueKey) {
    const slug = STANDINGS_TAB_SLUGS[leagueKey];
    if (!slug) return null;
    const year = espnSeasonYear || new Date().getFullYear();
    const path = `/v2/sports/soccer/leagues/${slug}/seasons/${year}/types/1/leaders`;
    const data = await fetchESPNPath(path, {
        host: "sports.core.api.espn.com",
        validate: d => !!(d && Array.isArray(d.categories))
    });
    const goalsCat = data.categories.find(c => c.name === "goalsLeaders" || c.displayName === "Goals");
    if (!goalsCat || !Array.isArray(goalsCat.leaders) || !goalsCat.leaders.length) return null;

    const top = goalsCat.leaders.slice(0, 5);
    const rows = await Promise.all(top.map(async (leader, i) => {
        const [name, club] = await Promise.all([
            resolveCoreRefDisplayName(leader.athlete),
            resolveCoreRefDisplayName(leader.team)
        ]);
        return {
            rank: i + 1,
            name: name || `Player ${i + 1}`,
            club: club || "",
            goals: Math.round(leader.value || 0) || parseInt(leader.displayValue, 10) || 0
        };
    }));
    return rows;
}

// Fallback: derive a scorers list from each team's leading scorer in today's scoreboard
function scorersFromMatches() {
    const pool = [];
    apiMatches.forEach(m => {
        if (m.topScorers && m.topScorers.home) pool.push({ name: m.topScorers.home.name, club: m.homeTeam, goals: m.topScorers.home.goals });
        if (m.topScorers && m.topScorers.away) pool.push({ name: m.topScorers.away.name, club: m.awayTeam, goals: m.topScorers.away.goals });
    });
    const seen = new Set();
    const unique = pool.filter(p => {
        if (!p.name || seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
    });
    unique.sort((a, b) => b.goals - a.goals);
    return unique.slice(0, 5).map((p, i) => ({ rank: i + 1, ...p }));
}

// Load / refresh the auxiliary widgets (TTL-cached, fire & forget)
function loadLiveExtras(force = false) {
    if (!isApiMode) return;

    const leagueKey = currentStandingLeague;
    const slug = STANDINGS_TAB_SLUGS[leagueKey];

    if (slug && (force || !liveStandings[leagueKey] || Date.now() - (liveStandingsAt[leagueKey] || 0) > LIVE_EXTRAS_TTL_MS)) {
        loadLiveStandings(leagueKey).then(rows => {
            if (rows && rows.length) {
                liveStandings[leagueKey] = rows;
                liveStandingsAt[leagueKey] = Date.now();
                if (isApiMode) renderStandings();
            }
        }).catch(err => console.warn("Standings fetch failed:", err.message));
    }

    if (slug && (force || liveScorersLeague !== leagueKey || !liveScorers || Date.now() - liveScorersAt > LIVE_EXTRAS_TTL_MS)) {
        loadLiveScorers(leagueKey).then(rows => {
            if (rows && rows.length) {
                liveScorers = rows;
                liveScorersAt = Date.now();
                liveScorersLeague = leagueKey;
                if (isApiMode) renderScorers();
            }
        }).catch(err => console.warn("Scorers fetch failed (using fallback):", err.message));
    }

    if (force || !liveNews || Date.now() - liveNewsAt > LIVE_EXTRAS_TTL_MS) {
        loadLiveNews().then(rows => {
            if (rows && rows.length) {
                liveNews = rows;
                liveNewsAt = Date.now();
                if (isApiMode) renderNews();
            }
        }).catch(err => console.warn("News fetch failed:", err.message));
    }
}

// Point the "View Full Table" link at ESPN when live standings are shown
function updateFullTableLink(slug) {
    const link = document.querySelector(".view-full-table-row .view-all-link");
    if (!link) return;
    if (slug) {
        link.href = `https://www.espn.com/soccer/table/_/league/${slug}`;
        link.target = "_blank";
        link.rel = "noopener";
    } else {
        link.href = "#";
        link.removeAttribute("target");
        link.removeAttribute("rel");
    }
}

// Fetch the full match summary (boxscore, lineups, commentary) for one event
async function ensureMatchSummary(match, force = false) {
    if (!match || !match.espnEventId || !match.leagueSlug) return null;
    const cached = summaryCache.get(match.espnEventId);
    if (!force && cached && Date.now() - cached.ts < SUMMARY_TTL_MS) return cached.data;

    const path = `/apis/site/v2/sports/${match.leagueSlug}/summary?event=${match.espnEventId}`;
    const data = await fetchESPNPath(path, {
        validate: d => !!(d && typeof d === "object" && (d.boxscore || d.header))
    });
    summaryCache.set(match.espnEventId, { data, ts: Date.now() });
    return data;
}

// Merge real boxscore stats into a match object (soccer stat sets only)
function applySummaryStats(match, data) {
    const teams = data && data.boxscore && Array.isArray(data.boxscore.teams) ? data.boxscore.teams : null;
    if (!teams || teams.length < 2) return false;

    const homeT = teams.find(t => t.homeAway === "home") || teams[0];
    const awayT = teams.find(t => t.homeAway === "away") || teams[1];
    const names = new Set([...(homeT.statistics || []), ...(awayT.statistics || [])].map(s => s.name));
    if (!names.has("possessionPct") && !names.has("totalShots")) return false; // non-soccer stat set

    const pick = (t, name) => {
        const s = (t.statistics || []).find(x => x.name === name);
        const v = s ? parseFloat(s.displayValue) : NaN;
        return isNaN(v) ? 0 : Math.round(v);
    };

    match.stats = {
        possession: pick(homeT, "possessionPct") || match.stats.possession,
        shots: pick(homeT, "totalShots"),
        shotsOnTarget: pick(homeT, "shotsOnTarget"),
        corners: pick(homeT, "wonCorners"),
        fouls: pick(homeT, "foulsCommitted"),
        yellowCards: pick(homeT, "yellowCards"),
        redCards: pick(homeT, "redCards")
    };
    match.awayStats = {
        possession: pick(awayT, "possessionPct"),
        shots: pick(awayT, "totalShots"),
        shotsOnTarget: pick(awayT, "shotsOnTarget"),
        corners: pick(awayT, "wonCorners"),
        fouls: pick(awayT, "foulsCommitted"),
        yellowCards: pick(awayT, "yellowCards"),
        redCards: pick(awayT, "redCards")
    };
    return true;
}

// Render the real play-by-play commentary feed inside the Watch Live modal
function renderLiveCommentary(match, data) {
    const commList = document.getElementById("commentary-list");
    if (!commList) return;
    const comm = (data && (Array.isArray(data.commentary) ? data.commentary : (Array.isArray(data.plays) ? data.plays : []))) || [];

    if (!comm.length) {
        commList.innerHTML = `<p><strong>[${match.time}]</strong> ${match.status === "live"
            ? "Live commentary will appear here once the feed updates…"
            : "Play-by-play commentary is available for this fixture on ESPN."}</p>`;
        return;
    }

    const latest = comm.slice(-6).reverse();
    commList.innerHTML = latest.map(c => {
        const min = c.time && c.time.displayValue ? c.time.displayValue : "";
        const text = c.text || (c.play && c.play.text) || "";
        return `<p><strong>[${min}]</strong> ${text}</p>`;
    }).join("");
}

// Plot real shot positions (from commentary play data) on the tactical pitch
function renderPitchShots(match, data) {
    const pitch = document.getElementById("live-pitch-animation");
    if (!pitch) return;
    pitch.querySelectorAll(".pitch-shot-marker").forEach(el => el.remove());

    const comm = (data && (Array.isArray(data.commentary) ? data.commentary : (Array.isArray(data.plays) ? data.plays : []))) || [];
    const shotTypes = ["shot-on-target", "shot-off-target", "shot-blocked"];
    // play.type is an object in ESPN data ({ id, text, type: "shot-…" }) — normalize it
    const shots = comm.filter(c => {
        if (!c.play || !(c.play.fieldPositionX > 0)) return false;
        const playType = c.play.type && typeof c.play.type === "object" ? c.play.type.type : c.play.type;
        return shotTypes.includes(playType);
    });

    shots.slice(-8).forEach(c => {
        const isHome = !!(c.play.team && c.play.team.displayName === match.homeTeam);
        const dot = document.createElement("div");
        dot.className = `pitch-shot-marker ${isHome ? "home-shot" : "away-shot"}`;
        dot.style.left = `${(c.play.fieldPositionX * 100).toFixed(1)}%`;
        dot.style.top = `${(c.play.fieldPositionY * 100).toFixed(1)}%`;
        dot.title = c.text || (c.play && c.play.text) || "";
        pitch.appendChild(dot);
    });
}

// Debounced summary fetch for the spotlighted match (fills the stats card with real numbers)
function scheduleSummaryFetch(match) {
    clearTimeout(summaryFetchTimer);
    if (!match || !match.espnEventId || !match.leagueSlug) return;
    const targetId = match.id;
    summaryFetchTimer = setTimeout(async () => {
        try {
            const data = await ensureMatchSummary(match);
            if (data && applySummaryStats(match, data) && spotlightMatchId === targetId) {
                renderStatsBars(match);
            }
        } catch (err) {
            console.warn("Summary fetch failed:", err.message);
        }
    }, 500);
}

// Refresh the open Watch Live modal with fresh commentary / stats (called on the 60s cycle)
async function refreshLiveMatchCentre() {
    if (!isApiMode || !watchLiveModal.classList.contains("active")) return;
    const match = apiMatches.find(m => m.id === spotlightMatchId);
    if (!match || !match.espnEventId) return;
    try {
        const data = await ensureMatchSummary(match, true);
        usingLiveCommentary = true;
        renderLiveCommentary(match, data);
        renderPitchShots(match, data);
        if (applySummaryStats(match, data)) renderStatsBars(match);
    } catch (err) {
        // keep last known state
    }
}

// --- SMOOTH SCORE TRANSITIONS ---
// When a score changes (goal in live API data or in simulation), the new value
// rolls into place with a glow instead of silently jumping between renders.

const scoreDeltas = new Map();      // matchId → { home, away, prevHome, prevAway }
const elLastScore = new WeakMap();  // persistent score element → last shown value
const scoreRollTokens = new WeakMap();

// Markup for re-rendered lists (match cards / ticker): the roll plays on insertion
function scoreCell(value, prev) {
    if (prev === null || prev === undefined) return `${value}`;
    return `<span class="score-roll score-glow"><span class="score-roll-old">${prev}</span><span class="score-roll-new">${value}</span></span>`;
}

// Value setter for persistent score elements (spotlight scoreboard + stats header)
function setScoreSmooth(el, value) {
    if (!el) return;
    const num = parseInt(value, 10);
    if (isNaN(num)) {
        el.textContent = value;
        elLastScore.delete(el);
        return;
    }
    const prev = elLastScore.get(el);
    elLastScore.set(el, num);
    if (prev === undefined || prev === num) {
        el.textContent = num;
        return;
    }
    el.classList.remove("score-roll", "score-glow");
    void el.offsetWidth; // force reflow so the animations restart
    el.innerHTML = `<span class="score-roll-old">${prev}</span><span class="score-roll-new">${num}</span>`;
    el.classList.add("score-roll", "score-glow");
    const token = {};
    scoreRollTokens.set(el, token);
    setTimeout(() => {
        if (scoreRollTokens.get(el) !== token) return; // superseded by a newer change
        el.textContent = num;
        el.classList.remove("score-roll", "score-glow");
    }, 1000);
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
        const delta = scoreDeltas.get(match.id);
        const homeScoreHTML = scoreCell(match.homeScore, delta && delta.home ? delta.prevHome : null);
        const awayScoreHTML = scoreCell(match.awayScore, delta && delta.away ? delta.prevAway : null);

        card.innerHTML = `
            <span class="ticker-league">${match.leagueId}</span>
            <div class="ticker-match">
                <span class="ticker-team">${match.homeCode}</span>
                <span class="ticker-score">${liveBadge}${homeScoreHTML} - ${awayScoreHTML}</span>
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
    const live = isApiMode ? liveStandings[currentStandingLeague] : null;
    const list = (live && live.length) ? live : MOCK_STANDINGS[currentStandingLeague];
    if (!list) return;

    updateFullTableLink((live && live.length) ? STANDINGS_TAB_SLUGS[currentStandingLeague] : null);

    list.slice(0, 6).forEach((row) => {
        const tr = document.createElement("tr");
        // Highlight active teams in mock live matches (simulation mode only)
        const isLiveTeam = !live && (row.team === "Arsenal" || row.team === "Chelsea" || row.team === "Man City");
        if (isLiveTeam) {
            tr.className = "highlight-row";
        }

        const zoneDot = (live && row.zone)
            ? `<i class="zone-dot" style="background:${row.zone.color}" title="${row.zone.desc}"></i>`
            : "";
        const teamVisual = (live && row.logo)
            ? `<img class="table-team-logo" src="${row.logo}" alt="" loading="lazy" onerror="this.style.display='none'">`
            : `<div class="player-avatar-mini" style="font-size: 8px; width: 18px; height: 18px;">${row.logo || row.abbrev || ""}</div>`;

        tr.innerHTML = `
            <td class="col-rank">${row.rank}</td>
            <td class="col-team">
                <div class="table-team-cell">
                    ${teamVisual}
                    <span>${row.team}${zoneDot}</span>
                </div>
            </td>
            <td class="col-stat">${row.played}</td>
            <td class="col-stat">${row.gd > 0 ? '+' + row.gd : row.gd}</td>
            <td class="col-stat" style="font-weight:700;">${row.pts}</td>
        `;
        standingsBody.appendChild(tr);
    });
}

// Render Top Scorers (ESPN golden boot in Live API mode, mock data otherwise)
function renderScorers() {
    const listEl = document.getElementById("scorers-list");
    if (!listEl) return;

    let rows = null;
    if (isApiMode) {
        rows = (liveScorers && liveScorers.length) ? liveScorers : scorersFromMatches();
    }
    if (!rows || !rows.length) rows = MOCK_SCORERS;

    listEl.innerHTML = rows.map(r => `
        <div class="scorer-row">
            <div class="scorer-rank-info">
                <span class="rank-num">${r.rank}</span>
                <div class="player-avatar-mini">${initials(r.name)}</div>
                <div class="player-meta">
                    <span class="player-name">${r.name}</span>
                    <span class="player-club">${r.club}</span>
                </div>
            </div>
            <span class="goals-count">${r.goals}</span>
        </div>
    `).join("");
}

// Render News
function renderNews() {
    newsContainer.innerHTML = "";
    const useLive = isApiMode && liveNews && liveNews.length;
    const list = useLive ? liveNews : MOCK_NEWS;

    list.forEach((news) => {
        const card = document.createElement(useLive ? "a" : "div");
        card.className = "news-card";
        if (useLive) {
            card.href = news.link || "#";
            card.target = "_blank";
            card.rel = "noopener";
        }
        const thumbStyle = news.image
            ? `background-image: url('${news.image}');`
            : `background: ${news.grad}`;
        card.innerHTML = `
            <div class="news-thumb" style="${thumbStyle}"></div>
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

        // League sidebar selector
        if (currentLeague !== "all" && m.leagueId !== currentLeague) return false;
        
        // Tab filters
        if (currentFilter === "live" && m.status !== "live") return false;
        if (currentFilter === "ht" && m.time !== "HT" && m.halftimeScore !== "Ended" && !m.time.includes("HT")) return false;
        if (currentFilter === "today" && m.status !== "today" && m.status !== "live") return false;
        if (currentFilter === "favorites" && !m.favorites) return false;
        
        return true;
    });

    // Optional league ordering (toggled by the sliders button)
    if (sortByLeague) {
        filtered.sort((a, b) => (a.league || "").localeCompare(b.league || ""));
    }

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
        const scoreDelta = scoreDeltas.get(match.id);
        card.className = `match-card ${match.id === spotlightMatchId ? 'active-spotlight' : ''}${scoreDelta ? ' scored' : ''}`;
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
                    <span>${scoreCell(match.homeScore, scoreDelta && scoreDelta.home ? scoreDelta.prevHome : null)}</span>
                    <span class="score-dash">-</span>
                    <span>${scoreCell(match.awayScore, scoreDelta && scoreDelta.away ? scoreDelta.prevAway : null)}</span>
                </div>
                
                <div class="match-card-team-info away">
                    <div class="player-avatar-mini" style="font-size: 8px; width: 20px; height: 20px;">${match.awayCode}</div>
                    <span class="match-team-name">${match.awayTeam}</span>
                </div>
            </div>
            
            <div class="match-card-footer">
                <div class="match-stat-capsules">
                    ${match.odds ? `<span class="stat-capsule" title="Odds ${match.homeCode}/${match.awayCode}/Draw via ${match.odds.provider}">🎲 ${oddsSummary(match.odds)}</span>` : ""}
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
    
    // Set scoreboard (smooth score roll when the value changes)
    spotlightHomeName.innerText = match.homeTeam;
    spotlightAwayName.innerText = match.awayTeam;
    setScoreSmooth(spotlightHomeScore, match.homeScore);
    setScoreSmooth(spotlightAwayScore, match.awayScore);
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
    setScoreSmooth(statsHomeScore, match.homeScore);
    setScoreSmooth(statsAwayScore, match.awayScore);
    
    // Render Stats Progress Bars
    renderStatsBars(match);

    // Fill the stats card with real boxscore numbers when in API mode (debounced + cached)
    if (isApiMode) scheduleSummaryFetch(match);
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

        if (stat.key === "possession") {
            // Possession: away% is 100-home% unless real numbers are available
            awayVal = (match.awayStats && typeof match.awayStats.possession === "number" && match.awayStats.possession > 0)
                ? match.awayStats.possession
                : 100 - homeVal;
        } else if (match.awayStats && typeof match.awayStats[stat.key] === "number" && match.awayStats[stat.key] > 0) {
            // Real away-team value from the ESPN match summary
            awayVal = match.awayStats[stat.key];
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
    // Don't rebuild lists mid-interaction (drawer / modal open)
    if (document.body.classList.contains("nav-open") || document.querySelector(".modal-overlay.active")) return;

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
            scoreDeltas.set(match.id, { home: true, away: false, prevHome: match.homeScore, prevAway: match.awayScore });
            match.homeScore += 1;
            match.scorers.home.push(`${minStr}' ${player}`);
            match.stats.shots += 1;
            match.stats.shotsOnTarget += 1;
        } else {
            scoreDeltas.set(match.id, { home: false, away: true, prevHome: match.homeScore, prevAway: match.awayScore });
            match.awayScore += 1;
            match.scorers.away.push(`${minStr}' ${player}`);
            match.stats.shots += 1;
            match.stats.shotsOnTarget += 1;
        }
        
        showNotification(`GOAL! ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam} (${player} ${match.time})`);
        
        // Score flash/pop is applied by the smooth score roll in setSpotlightMatch()
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
    renderTicker();
    if (match.id === spotlightMatchId) {
        setSpotlightMatch(match.id);
    }
    scoreDeltas.clear(); // one animation per change — don't replay on unrelated re-renders
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
    
    // Dummy commentary is only injected when the real ESPN feed isn't active
    if (Math.random() > 0.6 && !usingLiveCommentary) {
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
    // --- Shared helpers (nav / modals / scrolling) ---
    const openModal = (modal) => {
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    };
    const closeModal = (modal) => {
        modal.classList.remove("active");
        if (!document.querySelector(".modal-overlay.active")) {
            document.body.classList.remove("modal-open");
        }
    };
    const scrollToEl = (selector) => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const setActiveNav = (link) => {
        document.querySelectorAll(".main-nav .nav-link").forEach(a => a.classList.remove("active"));
        if (link) link.classList.add("active");
    };

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
        openModal(loginModal);
    });
    closeLoginModal.addEventListener("click", () => {
        closeModal(loginModal);
    });
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        loginBtn.innerText = "Logged In";
        closeModal(loginModal);
        showNotification("Successfully logged in as administrator!");
    });

    // Close modals by tapping the backdrop or pressing Escape (expected mobile UX)
    [loginModal, watchLiveModal].forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal(modal);
                if (modal === watchLiveModal) usingLiveCommentary = false;
            }
        });
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            [loginModal, watchLiveModal].forEach(modal => {
                if (modal.classList.contains("active")) {
                    closeModal(modal);
                    if (modal === watchLiveModal) usingLiveCommentary = false;
                }
            });
        }
    });
    
    watchLiveBtn.addEventListener("click", async () => {
        openModal(watchLiveModal);
        const commList = document.getElementById("commentary-list");
        commList.innerHTML = `<p><strong>[Live]</strong> Connecting to match feed...</p>`;

        const match = (isApiMode ? apiMatches : MOCK_MATCHES).find(m => m.id === spotlightMatchId);
        const titleEl = document.getElementById("watch-modal-title");
        const broadcastEl = document.getElementById("watch-broadcast-info");

        if (titleEl) {
            titleEl.textContent = match
                ? `Live Match Centre — ${match.homeTeam} vs ${match.awayTeam}`
                : "Live Match Broadcast";
        }
        if (broadcastEl) {
            broadcastEl.textContent = (match && match.broadcast) ? `📺 ${match.broadcast}` : "📺 No broadcast info";
        }

        if (match && isApiMode && match.espnEventId) {
            try {
                const data = await ensureMatchSummary(match, true);
                usingLiveCommentary = true;
                renderLiveCommentary(match, data);
                renderPitchShots(match, data);
                if (applySummaryStats(match, data)) renderStatsBars(match);
            } catch (err) {
                usingLiveCommentary = false;
                commList.innerHTML = `<p><strong>[${match.time}]</strong> Live commentary feed unavailable — showing simulated broadcast.</p>`;
            }
        } else {
            usingLiveCommentary = false;
            commList.innerHTML = `<p><strong>[Live]</strong> Connected to stream. Fetching tactical match feed...</p>`;
        }
    });
    closeWatchModal.addEventListener("click", () => {
        closeModal(watchLiveModal);
        usingLiveCommentary = false;
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
    
    // Standings tabs switcher (also drives the Top Scorers league in API mode)
    const standingTabs = document.querySelectorAll(".standings-tab");
    standingTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            standingTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentStandingLeague = tab.getAttribute("data-standing-league");
            renderStandings();
            renderScorers();
            if (isApiMode) loadLiveExtras();
        });
    });
    
    // Search filter input logic
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = "none";
            return;
        }
        
        const searchable = (isApiMode && apiMatches.length) ? apiMatches : MOCK_MATCHES;
        const matches = searchable.filter((m) => {
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
                        <div class="item-desc">${m.league} \u00b7 ${m.time}</div>
                    </div>
                    <span class="search-sport-badge">${m.sport}</span>
                `;
                item.addEventListener("click", () => {
                    setSpotlightMatch(m.id);
                    searchInput.value = "";
                    searchResults.style.display = "none";
                    searchInput.blur();
                    scrollToEl("#match-spotlight");
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

    // Mobile navigation drawer (hamburger)
    const closeMobileNav = () => {
        document.body.classList.remove("nav-open");
        navToggleBtn.setAttribute("aria-expanded", "false");
        navToggleBtn.setAttribute("aria-label", "Open menu");
    };

    navToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = document.body.classList.toggle("nav-open");
        navToggleBtn.setAttribute("aria-expanded", String(isOpen));
        navToggleBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close the drawer after choosing a destination
    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileNav);
    });

    // Close when tapping the backdrop / anywhere outside
    document.addEventListener("click", (e) => {
        if (
            document.body.classList.contains("nav-open") &&
            !e.target.closest(".main-nav") &&
            !e.target.closest("#nav-toggle-btn")
        ) {
            closeMobileNav();
        }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMobileNav();
    });

    // Reset drawer state when resizing up to desktop + keep search hint in sync
    const syncSearchPlaceholder = () => {
        searchInput.placeholder = window.innerWidth <= 480
            ? "Search teams, matches..."
            : "Search teams, matches, leagues...";
    };
    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) closeMobileNav();
        syncSearchPlaceholder();
    });

    // Compact search placeholder on very small screens
    syncSearchPlaceholder();

    // Shared match-filter setter (keeps the filter pills in sync)
    const setFilter = (name) => {
        currentFilter = name;
        filterTabs.forEach((t) => t.classList.toggle("active", t.getAttribute("data-filter") === name));
        renderMatches();
    };

    // Popular Leagues → filter the match list by league (tap again to clear)
    const leagueRows = document.querySelectorAll(".league-row");
    leagueRows.forEach((row) => {
        row.addEventListener("click", () => {
            const id = row.getAttribute("data-league-id");
            const wasActive = row.classList.contains("active");
            leagueRows.forEach((r) => r.classList.remove("active"));
            currentLeague = wasActive ? "all" : id;
            if (!wasActive) row.classList.add("active");
            renderMatches();
            if (window.innerWidth <= 992) scrollToEl(".live-scores-section");
        });
    });

    // Quick link binds (these also power the mobile drawer destinations)
    navHome.addEventListener("click", (e) => {
        e.preventDefault();
        currentSport = "all";
        currentLeague = "all";
        sportTabs.forEach((t) => t.classList.remove("active"));
        sportTabs[0].classList.add("active");
        leagueRows.forEach((r) => r.classList.remove("active"));
        setFilter("all");
        setActiveNav(navHome);
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    navLive.addEventListener("click", (e) => {
        e.preventDefault();
        setFilter("live");
        setActiveNav(navLive);
        scrollToEl(".live-scores-section");
    });

    heroBtnLive.addEventListener("click", () => {
        setFilter("live");
        setActiveNav(navLive);
        scrollToEl(".live-scores-section");
    });

    heroBtnFixtures.addEventListener("click", () => {
        setFilter("today");
        setActiveNav(navFixtures);
        scrollToEl(".live-scores-section");
    });

    if (navFixtures) navFixtures.addEventListener("click", (e) => {
        e.preventDefault();
        setFilter("today");
        setActiveNav(navFixtures);
        scrollToEl(".live-scores-section");
    });

    if (navLeagues) navLeagues.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveNav(navLeagues);
        scrollToEl(".sidebar-leagues");
    });

    if (navNews) navNews.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveNav(navNews);
        scrollToEl(".sidebar-news");
    });

    if (navTeams) navTeams.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveNav(navTeams);
        scrollToEl(".standings-card");
    });

    if (navStats) navStats.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveNav(navStats);
        scrollToEl(".stats-comparison-card");
    });

    // Header star → jump to favorited matches
    if (favsToggleTopBtn) favsToggleTopBtn.addEventListener("click", () => {
        setFilter("favorites");
        scrollToEl(".live-scores-section");
    });

    // "View All" resets the match filters instead of being a dead link
    if (viewAllMatchesBtn) viewAllMatchesBtn.addEventListener("click", () => {
        setFilter("all");
    });

    // Sliders button toggles league-sorted vs default ordering
    if (filterOptionsBtn) filterOptionsBtn.addEventListener("click", () => {
        sortByLeague = !sortByLeague;
        filterOptionsBtn.classList.toggle("active-sort", sortByLeague);
        filterOptionsBtn.title = sortByLeague ? "Sorted by league (tap to restore)" : "Sort matches";
        renderMatches();
        showNotification(sortByLeague ? "Matches sorted by league" : "Matches back to default order", true);
    });

    // "More" drawer links + signup placeholder give feedback instead of dead-ending
    document.querySelectorAll(".dropdown-menu a").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showNotification(`${link.textContent.trim()} hub coming soon in this demo`, true);
        });
    });

    if (goToSignup) goToSignup.addEventListener("click", (e) => {
        e.preventDefault();
        showNotification("Sign-up is disabled in this demo — log in with any email", true);
    });
}

// --- INITIALIZATION --- 
function init() {
    initEventHandlers();
    
    // Initial Render
    renderTicker();
    renderStandings();
    renderScorers();
    renderNews();
    renderMatches();
    setSpotlightMatch("fb-1");
    
    // Start in Live API mode — automatically falls back to Simulation Mode
    // if ESPN is unreachable (loadAPIMatches handles the fallback)
    setApiMode(true);
    
    // Start Live Match Simulation (guarded — skips when isApiMode === true)
    setInterval(simulationLoop, 6000);   // clock ticks every 6 s
    setInterval(eventSimulation, 18000); // match events every 18 s
    
    // Auto-refresh ESPN API data every 60 seconds when in API mode
    setInterval(() => {
        if (isApiMode && !apiLoading) {
            loadAPIMatches();
            loadLiveExtras(); // TTL-cached internally, refreshes every ~5 min
            refreshLiveMatchCentre(); // updates the open Watch Live modal
        }
    }, 60000);
    
    // Start tactical pitch broadcast animations
    setInterval(runPitchTrackerAnimation, 1200);
}

// Start everything when DOM is ready
document.addEventListener("DOMContentLoaded", init);

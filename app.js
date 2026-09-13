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
    ],
    UCL: [
        { rank: 1, team: "Liverpool", logo: "LIV", played: 8, gd: 12, pts: 21 },
        { rank: 2, team: "Barcelona", logo: "BAR", played: 8, gd: 15, pts: 19 },
        { rank: 3, team: "Arsenal", logo: "ARS", played: 8, gd: 13, pts: 19 },
        { rank: 4, team: "Inter Milan", logo: "INT", played: 8, gd: 11, pts: 19 },
        { rank: 5, team: "Atletico Madrid", logo: "ATM", played: 8, gd: 8, pts: 18 }
    ],
    Bundesliga: [
        { rank: 1, team: "Bayern Munich", logo: "FCB", played: 34, gd: 67, pts: 82 },
        { rank: 2, team: "Leverkusen", logo: "LEV", played: 34, gd: 38, pts: 69 },
        { rank: 3, team: "Frankfurt", logo: "SGE", played: 34, gd: 22, pts: 60 },
        { rank: 4, team: "Dortmund", logo: "BVB", played: 34, gd: 18, pts: 57 },
        { rank: 5, team: "Freiburg", logo: "SCF", played: 34, gd: -4, pts: 55 }
    ],
    Ligue1: [
        { rank: 1, team: "Paris Saint-Germain", logo: "PSG", played: 34, gd: 57, pts: 84 },
        { rank: 2, team: "Marseille", logo: "OM", played: 34, gd: 27, pts: 65 },
        { rank: 3, team: "Monaco", logo: "ASM", played: 34, gd: 25, pts: 61 },
        { rank: 4, team: "Nice", logo: "NICE", played: 34, gd: 20, pts: 60 },
        { rank: 5, team: "Lille", logo: "LIL", played: 34, gd: 19, pts: 60 }
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

// Same row shape (`goals` holds the assist count) so the renderer is shared
const MOCK_ASSISTS = [
    { rank: 1, name: "Lamine Yamal", club: "Barcelona", goals: 13 },
    { rank: 2, name: "Mohamed Salah", club: "Liverpool", goals: 12 },
    { rank: 3, name: "Ousmane Dembélé", club: "PSG", goals: 11 },
    { rank: 4, name: "Florian Wirtz", club: "Leverkusen", goals: 10 },
    { rank: 5, name: "Bukayo Saka", club: "Arsenal", goals: 10 }
];

// --- APP STATE ---
// --- Persistent preferences (theme + favorites), guarded for private mode ---
const store = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch { /* storage unavailable — stay in-memory */ }
    }
};
const FAVS_KEY = "scorehub-favs-v1";
const THEME_KEY = "scorehub-theme";
const favoriteIds = new Set(store.get(FAVS_KEY, []));
function persistFavorites() { store.set(FAVS_KEY, [...favoriteIds]); }
// Re-apply saved stars to the simulation dataset (API matches: after each fetch)
MOCK_MATCHES.forEach(m => { m.favorites = favoriteIds.has(m.id); });

let currentSport = "all";
let currentFilter = "all";
let currentLeague = "all";
let sortByLeague = false;
let leadersCategory = "goals";
let selectedDate = null;   // YYYYMMDD string, or null for the default (today) feed
// --- Formula 1 (Jolpica Ergast API) ---
let f1Data = null;           // { season, drivers, last }
let f1DataAt = 0;
let f1Loading = false;
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
let liveScorersCat = "goals";    // which category ("goals" | "assists")
let espnSeasonYear = null;     // current season year captured from scoreboard responses
let usingLiveCommentary = false; // real commentary feed active in Watch Live modal
const summaryCache = new Map();   // espnEventId → { data, ts }
let summaryFetchTimer = null;
let mcSummaryData = null;    // last match-summary payload for the open Match Centre
let mcSummaryMatchId = null;

// Standings tab → ESPN league slug (also drives the Top Scorers league)
const STANDINGS_TAB_SLUGS = {
    EPL: "eng.1",
    LaLiga: "esp.1",
    SerieA: "ita.1",
    UCL: "uefa.champions",
    Bundesliga: "ger.1",
    Ligue1: "fra.1"
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
const shareMatchBtn = document.getElementById("share-match-btn");
const addCalendarBtn = document.getElementById("add-calendar-btn");
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
    football: [
        // Top European leagues
        "soccer/eng.1", "soccer/eng.2", "soccer/eng.fa", "soccer/eng.league_cup",
        "soccer/esp.1", "soccer/esp.2", "soccer/esp.copa_del_rey",
        "soccer/ger.1", "soccer/ger.2", "soccer/ger.dfb_pokal",
        "soccer/ita.1", "soccer/ita.2", "soccer/ita.coppa_italia",
        "soccer/fra.1", "soccer/fra.2",
        "soccer/ned.1", "soccer/por.1", "soccer/bel.1", "soccer/tur.1", "soccer/sco.1",
        // Americas
        "soccer/usa.1", "soccer/mex.1", "soccer/bra.1", "soccer/arg.1",
        // Asia / Middle East / Oceania
        "soccer/jpn.1", "soccer/aus.1", "soccer/sau.1",
        // Continental tournaments
        "soccer/uefa.champions", "soccer/uefa.europa", "soccer/uefa.europa.conf",
        "soccer/uefa.euro", "soccer/uefa.nations", "soccer/fifa.world",
        "soccer/conmebol.libertadores", "soccer/conmebol.sudamericana",
        "soccer/fifa.club_world"
    ],
    basketball: [
        "basketball/nba", "basketball/wnba", "basketball/euroleague",
        "basketball/mens-college-basketball", "basketball/womens-college-basketball"
    ],
    tennis: [
        "tennis/atp", "tennis/wta"
    ],
    baseball: [
        "baseball/mlb", "baseball/college-baseball"
    ],
    icehockey: [
        "hockey/nhl"
    ],
    rugby: [
        "rugby/premiership", "rugby/6-nations", "rugby/rugby-world-cup"
    ],
    cricket: [
        "cricket/ipl", "cricket/pak-psl", "cricket/eng-vitality-blast"
    ],
    all: [
        // Football top + continental + US
        "soccer/eng.1", "soccer/esp.1", "soccer/ger.1", "soccer/ita.1", "soccer/fra.1",
        "soccer/ned.1", "soccer/por.1", "soccer/usa.1", "soccer/mex.1", "soccer/bra.1", "soccer/sau.1",
        "soccer/uefa.champions", "soccer/uefa.europa", "soccer/fifa.world", "soccer/conmebol.libertadores",
        // Other sports
        "basketball/nba", "tennis/atp", "tennis/wta", "baseball/mlb", "hockey/nhl",
        "rugby/premiership", "cricket/ipl"
    ],
    worldwide: [
        // 50+ soccer leagues for full worldwide coverage
        "soccer/eng.1", "soccer/eng.2", "soccer/eng.3", "soccer/eng.fa", "soccer/eng.league_cup",
        "soccer/esp.1", "soccer/esp.2", "soccer/esp.copa_del_rey",
        "soccer/ger.1", "soccer/ger.2", "soccer/ger.dfb_pokal",
        "soccer/ita.1", "soccer/ita.2", "soccer/ita.coppa_italia",
        "soccer/fra.1", "soccer/fra.2", "soccer/fra.coupe_de_france",
        "soccer/ned.1", "soccer/ned.2", "soccer/por.1", "soccer/bel.1", "soccer/tur.1",
        "soccer/sco.1", "soccer/sui.1", "soccer/aut.1", "soccer/den.1", "soccer/swe.1", "soccer/nor.1",
        "soccer/gre.1", "soccer/rus.1", "soccer/ukr.1",
        "soccer/usa.1", "soccer/usa.nwsl", "soccer/mex.1", "soccer/bra.1", "soccer/arg.1", "soccer/col.1", "soccer/chi.1",
        "soccer/jpn.1", "soccer/aus.1", "soccer/ind.1", "soccer/sau.1",
        "soccer/uefa.champions", "soccer/uefa.europa", "soccer/uefa.europa.conf",
        "soccer/uefa.euro", "soccer/uefa.euroq", "soccer/uefa.nations", "soccer/uefa.wchampions",
        "soccer/fifa.world", "soccer/fifa.worldq", "soccer/fifa.wworld", "soccer/fifa.club_world",
        "soccer/conmebol.libertadores", "soccer/conmebol.sudamericana", "soccer/concacaf.champions", "soccer/afc.champions"
    ]
};

const LEAGUE_NAMES = {
    // England
    "soccer/eng.1":           { name: "Premier League",            code: "EPL",      sport: "football" },
    "soccer/eng.2":           { name: "Championship",              code: "ENG2",     sport: "football" },
    "soccer/eng.3":           { name: "League One",                code: "ENG3",     sport: "football" },
    "soccer/eng.fa":          { name: "FA Cup",                    code: "FAC",      sport: "football" },
    "soccer/eng.league_cup":  { name: "Carabao Cup",               code: "EFLC",     sport: "football" },
    // Spain
    "soccer/esp.1":           { name: "La Liga",                   code: "LaLiga",   sport: "football" },
    "soccer/esp.2":           { name: "LaLiga 2",                  code: "LaL2",     sport: "football" },
    "soccer/esp.copa_del_rey":{ name: "Copa del Rey",              code: "CDR",      sport: "football" },
    // Germany
    "soccer/ger.1":           { name: "Bundesliga",                code: "Bundes",   sport: "football" },
    "soccer/ger.2":           { name: "2. Bundesliga",             code: "GER2",     sport: "football" },
    "soccer/ger.dfb_pokal":   { name: "DFB-Pokal",                 code: "DFB",      sport: "football" },
    // Italy
    "soccer/ita.1":           { name: "Serie A",                   code: "SerieA",   sport: "football" },
    "soccer/ita.2":           { name: "Serie B",                   code: "ITA2",     sport: "football" },
    "soccer/ita.coppa_italia":{ name: "Coppa Italia",              code: "COPPA",    sport: "football" },
    // France
    "soccer/fra.1":           { name: "Ligue 1",                   code: "Ligue1",   sport: "football" },
    "soccer/fra.2":           { name: "Ligue 2",                   code: "FRA2",     sport: "football" },
    "soccer/fra.coupe_de_france": { name: "Coupe de France",       code: "CDF",      sport: "football" },
    // Other Europe
    "soccer/ned.1":           { name: "Eredivisie",                code: "ERE",      sport: "football" },
    "soccer/ned.2":           { name: "Eerste Divisie",            code: "NED2",     sport: "football" },
    "soccer/por.1":           { name: "Primeira Liga",             code: "POR",      sport: "football" },
    "soccer/bel.1":           { name: "Belgian Pro League",        code: "BEL",      sport: "football" },
    "soccer/tur.1":           { name: "Turkish Super Lig",         code: "TUR",      sport: "football" },
    "soccer/sco.1":           { name: "Scottish Premiership",      code: "SCO",      sport: "football" },
    "soccer/sui.1":           { name: "Swiss Super League",        code: "SUI",      sport: "football" },
    "soccer/aut.1":           { name: "Austrian Bundesliga",       code: "AUT",      sport: "football" },
    "soccer/den.1":           { name: "Danish Superliga",          code: "DEN",      sport: "football" },
    "soccer/swe.1":           { name: "Allsvenskan",               code: "SWE",      sport: "football" },
    "soccer/nor.1":           { name: "Eliteserien",               code: "NOR",      sport: "football" },
    "soccer/gre.1":           { name: "Super League Greece",       code: "GRE",      sport: "football" },
    "soccer/rus.1":           { name: "Russian Premier League",    code: "RUS",      sport: "football" },
    "soccer/ukr.1":           { name: "Ukrainian Premier League",  code: "UKR",      sport: "football" },
    // Americas
    "soccer/usa.1":           { name: "Major League Soccer",       code: "MLS",      sport: "football" },
    "soccer/usa.nwsl":        { name: "NWSL",                      code: "NWSL",     sport: "football" },
    "soccer/mex.1":           { name: "Liga MX",                   code: "LIGAMX",   sport: "football" },
    "soccer/bra.1":           { name: "Brasileiro Serie A",        code: "BRA",      sport: "football" },
    "soccer/arg.1":           { name: "Liga Profesional",          code: "ARG",      sport: "football" },
    "soccer/col.1":           { name: "Primera A Colombia",        code: "COL",      sport: "football" },
    "soccer/chi.1":           { name: "Chile Primera",             code: "CHI",      sport: "football" },
    // Asia / Middle East / Oceania
    "soccer/jpn.1":           { name: "J1 League",                 code: "J1",       sport: "football" },
    "soccer/aus.1":           { name: "A-League",                  code: "AUS",      sport: "football" },
    "soccer/ind.1":           { name: "Indian Super League",       code: "ISL",      sport: "football" },
    "soccer/sau.1":           { name: "Saudi Pro League",          code: "SAU",      sport: "football" },
    // UEFA / FIFA / Continental
    "soccer/uefa.champions":        { name: "UEFA Champions League",   code: "UCL",      sport: "football" },
    "soccer/uefa.europa":           { name: "UEFA Europa League",      code: "UEL",      sport: "football" },
    "soccer/uefa.europa.conf":      { name: "Europa Conference League",code: "UECL",     sport: "football" },
    "soccer/uefa.champions_qual":   { name: "UCL Qualifiers",          code: "UCLQ",     sport: "football" },
    "soccer/uefa.europa_qual":      { name: "UEL Qualifiers",          code: "UELQ",     sport: "football" },
    "soccer/uefa.euro":             { name: "UEFA Euro",               code: "EURO",     sport: "football" },
    "soccer/uefa.euroq":            { name: "Euro Qualifiers",         code: "EUROQ",    sport: "football" },
    "soccer/uefa.nations":          { name: "UEFA Nations League",     code: "UNL",      sport: "football" },
    "soccer/uefa.wchampions":       { name: "Women's Champions League",code: "UWCL",     sport: "football" },
    "soccer/fifa.world":            { name: "FIFA World Cup",          code: "WC",       sport: "football" },
    "soccer/fifa.worldq":           { name: "World Cup Qualifiers",    code: "WCQ",      sport: "football" },
    "soccer/fifa.wworld":           { name: "Women's World Cup",       code: "WWC",      sport: "football" },
    "soccer/fifa.club_world":       { name: "Club World Cup",          code: "CWC",      sport: "football" },
    "soccer/conmebol.libertadores": { name: "Copa Libertadores",       code: "LIB",      sport: "football" },
    "soccer/conmebol.sudamericana": { name: "Copa Sudamericana",       code: "SUD",      sport: "football" },
    "soccer/concacaf.champions":    { name: "CONCACAF Champions Cup",  code: "CCC",      sport: "football" },
    "soccer/afc.champions":         { name: "AFC Champions League",    code: "ACL",      sport: "football" },
    // Other sports - expanded
    "basketball/nba":               { name: "NBA",                     code: "NBA",      sport: "basketball" },
    "basketball/wnba":              { name: "WNBA",                    code: "WNBA",     sport: "basketball" },
    "basketball/euroleague":        { name: "EuroLeague",              code: "EUROL",    sport: "basketball" },
    "basketball/mens-college-basketball": { name: "NCAA Men",          code: "NCAAM",    sport: "basketball" },
    "basketball/womens-college-basketball": { name: "NCAA Women",      code: "NCAAW",    sport: "basketball" },
    "tennis/atp":                   { name: "ATP Tour",                code: "ATP",      sport: "tennis" },
    "tennis/wta":                   { name: "WTA Tour",                code: "WTA",      sport: "tennis" },
    "baseball/mlb":                 { name: "MLB",                     code: "MLB",      sport: "baseball" },
    "baseball/college-baseball":    { name: "College Baseball",        code: "NCAA-B",   sport: "baseball" },
    "hockey/nhl":                   { name: "NHL",                     code: "NHL",      sport: "icehockey" },
    "rugby/premiership":            { name: "Rugby Premiership",       code: "RUG",      sport: "rugby" },
    "rugby/6-nations":              { name: "Six Nations",             code: "6NAT",     sport: "rugby" },
    "rugby/rugby-world-cup":        { name: "Rugby World Cup",         code: "RWC",      sport: "rugby" },
    "cricket/ipl":                  { name: "Indian Premier League",   code: "IPL",      sport: "cricket" },
    "cricket/pak-psl":              { name: "Pakistan Super League",   code: "PSL",      sport: "cricket" },
    "cricket/eng-vitality-blast":   { name: "Vitality Blast",          code: "BLAST",    sport: "cricket" }
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
    const qs = selectedDate ? `?dates=${selectedDate}` : "";
    return fetchESPNPath(`/apis/site/v2/sports/${slug}/scoreboard${qs}`);
}

// Best-effort club logo URL from an ESPN team object (scoreboard shapes vary)
function teamLogoOf(team) {
    if (!team) return "";
    if (Array.isArray(team.logos) && team.logos[0] && team.logos[0].href) return team.logos[0].href;
    if (typeof team.logo === "string" && team.logo) return team.logo;
    return "";
}

// Generated badge with the real logo overlaid (img removes itself on failure)
function teamBadgeHTML(code, logo, px) {
    const size = px || 20;
    return `<span class="team-logo-wrap" style="width:${size}px;height:${size}px;">`
        + `<span class="player-avatar-mini" style="font-size:8px;width:100%;height:100%;">${code}</span>`
        + (logo ? `<img class="team-logo-img" src="${logo}" alt="" loading="lazy" onerror="this.remove()">` : "")
        + `</span>`;
}

function spotlightLogoHTML(code, color, logo) {
    return generateTeamSVG(code, color)
        + (logo ? `<img class="team-logo-img" src="${logo}" alt="" loading="lazy" onerror="this.remove()">` : "");
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
    const homeLogo = teamLogoOf(home.team);
    const awayLogo = teamLogoOf(away.team);

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
        matchTime = d.toLocaleTimeString(appLocale(), { hour: "2-digit", minute: "2-digit" });
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
        date: event.date || null,
        sport: leagueInfo.sport,
        league: leagueInfo.name,
        leagueId: leagueInfo.code,
        homeTeam,
        homeCode,
        homeColor,
        homeLogo,
        awayTeam,
        awayCode,
        awayColor,
        awayLogo,
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

// Fetch and load all matches for the selected sport from the ESPN API - now worldwide with chunked fetching
async function loadAPIMatches() {
    if (currentSport === "f1") { loadF1Data(); return; }
    if (apiLoading) return;
    apiLoading = true;
    showSkeletons(5);

    const endpoints = ESPN_ENDPOINTS[currentSport] || ESPN_ENDPOINTS["all"];
    const fetched = [];

    // Chunked parallel fetching to support 50+ worldwide leagues without hammering the browser/ESPN
    const CHUNK_SIZE = 6;
    for (let i = 0; i < endpoints.length; i += CHUNK_SIZE) {
        const chunk = endpoints.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(
            chunk.map(async slug => {
                try {
                    const data = await fetchESPNLeague(slug);
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
        // Small delay between chunks to be nice to ESPN CDN
        if (i + CHUNK_SIZE < endpoints.length) {
            await new Promise(r => setTimeout(r, 150));
        }
    }

    if (apiMatches.length === 0 && fetched.length === 0) {
        // No data at all — API unreachable or blocked. Fall back gracefully.
        apiLoading = false;
        console.info("ESPN fetch failed on all transports. Falling back to simulation.");
        setApiMode(false);
        showNotification(t("notif.apifail"));
        return;
    }

    if (fetched.length === 0) {
        // Refresh failed but we still have the previous data — keep showing it
        apiLoading = false;
        const keepUpdatedEl = document.getElementById("api-last-updated");
        if (keepUpdatedEl) keepUpdatedEl.textContent = "Update failed — showing last data, retrying…";
        console.warn("ESPN refresh failed; keeping previous match data.");
        showNetBanner(t("net.failed"), true);
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
    apiMatches.forEach(m => { m.favorites = favoriteIds.has(m.id); });
    apiLoading = false;

    // Update live match counter badge
    const liveCount = apiMatches.filter(m => m.status === "live").length;
    const badge = document.getElementById("live-match-count-badge");
    const statNum = document.getElementById("stat-live-matches");
    if (badge) badge.textContent = `${liveCount || apiMatches.length} Matches (API)`;
    if (statNum) statNum.textContent = liveCount || apiMatches.length;

    // Update status bar timestamp (includes active transport for transparency)
    hideNetBanner(); // fresh data — clear any stale warning
    const lastUpdatedEl = document.getElementById("api-last-updated");
    if (lastUpdatedEl) {
        const now = new Date();
                const dayLabel = selectedDate ? ` · ${selectedDate.slice(6, 8)}/${selectedDate.slice(4, 6)}` : "";
        lastUpdatedEl.textContent = tf("upd.line", { time: now.toLocaleTimeString(appLocale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" }), n: apiMatches.length, day: dayLabel, tp: espnTransportName() });
    }

    renderMatches();
    renderTicker();

    storyPick = null;
    storyLocked = false;

    // Deep link wins; otherwise auto-spotlight the first live match (or first overall)
    let deepLinked = false;
    try {
        const deepId = new URLSearchParams(window.location.search).get("match");
        if (deepId && apiMatches.some(m => m.id === deepId)) {
            setSpotlightMatch(deepId);
            deepLinked = true;
            storyLocked = true;
        }
    } catch (e) {}
    if (!deepLinked) {
        const firstLive = apiMatches.find(m => m.status === "live");
        const firstMatch = firstLive || apiMatches[0];
        if (firstMatch) setSpotlightMatch(firstMatch.id);
    }

    // Story of the week: a genuine thriller jumps the queue immediately,
    // otherwise the table-backed pick lands async (see applyStoryOfWeek)
    if (!deepLinked) {
        const syncPick = pickStoryOfWeek(apiMatches, {});
        if (syncPick && syncPick.kind === "report" && syncPick.score >= 8) {
            storyPick = syncPick;
            setSpotlightMatch(syncPick.id);
        }
    }

    // Goal alerts for live score changes picked up by this refresh
    scoreDeltas.forEach((delta, id) => {
        const m = apiMatches.find(x => x.id === id);
        if (m && m.status !== "pre") {
            const scoringTeam = delta.home ? m.homeTeam : m.awayTeam;
            showNotification(`GOAL! ${scoringTeam} — ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`);
        }
    });
    scoreDeltas.clear(); // one animation per change — don't replay on unrelated re-renders
    applyStoryOfWeek();

    // Load standings / news / top scorers from the API (TTL-cached, fire & forget)
    loadLiveExtras();
}

// Toggle between Simulation and Live API modes
function setApiMode(enable) {
    isApiMode = enable;
    const statusBar = document.getElementById("api-status-bar");
    const lastUpdatedEl = document.getElementById("api-last-updated");

    if (enable) {
        refreshApiModeText();
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
        refreshApiModeText();
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
        liveHighlights = null;
        const hs = document.getElementById("highlights-strip");
        if (hs) hs.hidden = true;
        renderStandings();
        renderNews();
        renderScorers();
        updateFullTableLink(currentStandingLeague);

        renderMatches();
        renderTicker();
        storyPick = null;
        setSpotlightMatch("fb-1");
        handleDeepLinkMatch();
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
    const ts = Date.parse(iso);
    if (isNaN(ts)) return "";
    const sw = (typeof LANG !== "undefined" && LANG === "sw");
    const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
    if (mins < 60) return sw ? `${mins} dak zilizopita` : `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return sw ? `${hours} saa zilizopita` : `${hours}h ago`;
    return sw ? `${Math.round(hours / 24)} siku zilizopita` : `${Math.round(hours / 24)}d ago`;
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

// Latest headlines from the ESPN news endpoint - now worldwide (aggregates multiple leagues for variety)
async function loadLiveNews() {
    // Try a few top leagues for richer news coverage, fallback to EPL
    const newsLeagues = ["eng.1", "esp.1", "uefa.champions", "usa.1", "mex.1"];
    const all = [];
    await Promise.allSettled(newsLeagues.map(async slug => {
        try {
            const data = await fetchESPNPath(`/apis/site/v2/sports/soccer/${slug}/news?limit=6`, {
                validate: d => !!(d && Array.isArray(d.articles))
            });
            (data.articles || []).forEach(a => {
                all.push({
                    id: `${slug}-${a.id}`,
                    raw: a,
                    leagueSlug: slug,
                    title: a.headline || a.description || "Untitled",
                    category: pickNewsCategory(a),
                    time: timeAgoString(a.published),
                    image: (Array.isArray(a.images) && a.images[0]) ? a.images[0].url : "",
                    link: (a.links && a.links.web && a.links.web.href) || "https://www.espn.com/soccer/",
                    hasVideo: !!(a.links && a.links.api && a.links.api.videos) || (Array.isArray(a.videos) && a.videos.length) || (a.type === "Video")
                });
            });
        } catch (e) { /* ignore per-league failure */ }
    }));
    if (!all.length) {
        const data = await fetchESPNPath(`/apis/site/v2/sports/soccer/eng.1/news?limit=6`, {
            validate: d => !!(d && Array.isArray(d.articles))
        });
        return data.articles.slice(0, 5).map(a => ({
            id: a.id,
            raw: a,
            leagueSlug: "eng.1",
            title: a.headline || a.description || "Untitled",
            category: pickNewsCategory(a),
            time: timeAgoString(a.published),
            image: (Array.isArray(a.images) && a.images[0]) ? a.images[0].url : "",
            link: (a.links && a.links.web && a.links.web.href) || "https://www.espn.com/soccer/",
            hasVideo: false
        }));
    }
    // De-duplicate by title and sort newest first, keep 8
    const seen = new Set();
    const uniq = [];
    for (const item of all) {
        if (!seen.has(item.title)) {
            seen.add(item.title);
            uniq.push(item);
        }
        if (uniq.length >= 8) break;
    }
    return uniq;
}

// Highlights: fetch real video highlights from ESPN (news videos + summary videos)
let liveHighlights = null;
let liveHighlightsAt = 0;
const HIGHLIGHTS_TTL_MS = 5 * 60 * 1000;

async function loadLiveHighlights(force = false) {
    if (!isApiMode) return null;
    if (!force && liveHighlights && Date.now() - liveHighlightsAt < HIGHLIGHTS_TTL_MS) return liveHighlights;
    try {
        // Pull video news from top leagues
        const videoLeagues = ["eng.1", "esp.1", "uefa.champions", "ger.1", "ita.1"];
        const vids = [];
        await Promise.allSettled(videoLeagues.map(async slug => {
            try {
                const data = await fetchESPNPath(`/apis/site/v2/sports/soccer/${slug}/news?limit=20`, {
                    validate: d => !!(d && Array.isArray(d.articles))
                });
                (data.articles || []).forEach(a => {
                    const hasVid = (a.links && a.links.api && a.links.api.videos) || (Array.isArray(a.videos) && a.videos.length) || a.type === "Video";
                    if (!hasVid) return;
                    const thumb = (Array.isArray(a.images) && a.images[0]) ? a.images[0].url : "";
                    const videoHref = (a.links && a.links.web && a.links.web.href) || "";
                    vids.push({
                        id: `${slug}-${a.id}`,
                        title: a.headline || a.description || "Highlight",
                        league: slug,
                        category: pickNewsCategory(a),
                        time: timeAgoString(a.published),
                        image: thumb,
                        link: videoHref,
                        raw: a
                    });
                });
            } catch (e) {}
        }));
        liveHighlights = vids.slice(0, 6);
        liveHighlightsAt = Date.now();
        return liveHighlights;
    } catch (e) {
        return null;
    }
}

// Golden boot (or assist leaders) via the core API leaders endpoint
// (player/team names come as $refs)
async function loadLiveScorers(leagueKey, category = "goals") {
    const slug = STANDINGS_TAB_SLUGS[leagueKey];
    if (!slug) return null;
    const year = espnSeasonYear || new Date().getFullYear();
    const path = `/v2/sports/soccer/leagues/${slug}/seasons/${year}/types/1/leaders`;
    const data = await fetchESPNPath(path, {
        host: "sports.core.api.espn.com",
        validate: d => !!(d && Array.isArray(d.categories))
    });
    const wantAssists = category === "assists";
    const goalsCat = data.categories.find(c => wantAssists
        ? (c.name === "assistsLeaders" || c.displayName === "Assists")
        : (c.name === "goalsLeaders" || c.displayName === "Goals"));
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

    if (slug && (force || liveScorersLeague !== leagueKey || liveScorersCat !== leadersCategory || !liveScorers || Date.now() - liveScorersAt > LIVE_EXTRAS_TTL_MS)) {
        loadLiveScorers(leagueKey, leadersCategory).then(rows => {
            if (rows && rows.length) {
                liveScorers = rows;
                liveScorersAt = Date.now();
                liveScorersLeague = leagueKey;
                liveScorersCat = leadersCategory;
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

    if (force || !liveHighlights || Date.now() - liveHighlightsAt > HIGHLIGHTS_TTL_MS) {
        loadLiveHighlights().then(rows => {
            if (rows && rows.length) {
                if (isApiMode) {
                    // Merge highlights into news feed with priority (video first)
                    const existing = liveNews || [];
                    const merged = [...rows.map(h => ({...h, hasVideo:true})), ...existing];
                    const seen = new Set();
                    const uniq = [];
                    for (const item of merged) {
                        if (!seen.has(item.title)) { seen.add(item.title); uniq.push(item); }
                        if (uniq.length >= 8) break;
                    }
                    liveNews = uniq;
                    liveNewsAt = Date.now();
                    renderNews();
                    renderHighlights();
                }
            }
        }).catch(err => console.warn("Highlights fetch failed:", err.message));
    }
}

// Point the "View Full Table" link at our on-site standings page
function updateFullTableLink(leagueKey) {
    const link = document.querySelector(".view-full-table-row .view-all-link");
    if (!link) return;
    link.href = `standings.html?league=${leagueKey || "EPL"}`;
    link.removeAttribute("target");
    link.removeAttribute("rel");
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
            ? t("mc.livefeed")
            : t("mc.espn")}</p>`;
        return;
    }

    const latest = comm.slice(-6).reverse();
    commList.innerHTML = latest.map(c => {
        const min = c.time && c.time.displayValue ? c.time.displayValue : "";
        const text = c.text || (c.play && c.play.text) || "";
        return `<p><strong>[${min}]</strong> ${text}</p>`;
    }).join("");
}

// Render the key-events timeline (goals / cards / subs) for the Match Centre
function classifyTimelineEvent(c) {
    const typeObj = c.play && c.play.type ? c.play.type : null;
    const typeStr = ((typeObj && typeof typeObj === "object" ? (typeObj.type || typeObj.text || "") : (typeObj || "")) + "").toLowerCase();
    const text = ((c.text || "") + " " + (c.play && c.play.text ? c.play.text : "")).toLowerCase();
    const hay = typeStr + " " + text;
    if (c.scoringPlay || /(\bgoal\b|penalty scored|scores|own goal)/.test(hay)) return { cls: "ev-goal", icon: "\u26BD" };
    if (/(red card|sent off|second yellow)/.test(hay)) return { cls: "ev-card-r", icon: "\u{1F7E5}" };
    if (/(yellow card|booked|caution)/.test(hay)) return { cls: "ev-card-y", icon: "\u{1F7E8}" };
    if (/(substitut|replaces|replaced by|comes on for)/.test(hay)) return { cls: "ev-sub", icon: "\u{1F504}" };
    return null;
}

function timelineMinuteValue(min) {
    const m = String(min || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : -1;
}

function escHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function renderTimeline(match, data) {
    const list = document.getElementById("timeline-list");
    if (!list) return;
    const items = [];

    const comm = (data && (Array.isArray(data.commentary) ? data.commentary : (Array.isArray(data.plays) ? data.plays : []))) || [];
    comm.forEach(c => {
        const kind = classifyTimelineEvent(c);
        if (!kind) return;
        const min = (c.time && c.time.displayValue) ? c.time.displayValue : "";
        const text = c.text || (c.play && c.play.text) || "";
        if (!text) return;
        items.push({ min, order: timelineMinuteValue(min), cls: kind.cls, icon: kind.icon, text });
    });

    // Simulation fallback: build goal events from the scorer lists
    if (!items.length && match && match.scorers) {
        ["home", "away"].forEach(side => {
            (match.scorers[side] || []).forEach(s => {
                const m = String(s).match(/(\d+)'?/);
                items.push({
                    min: m ? m[1] + "'" : "",
                    order: m ? parseInt(m[1], 10) : -1,
                    cls: "ev-goal", icon: "\u26BD",
                    text: `${String(s).replace(/^\d+'?(\+\d+)?\s*/, "")} (${side === "home" ? match.homeTeam : match.awayTeam})`
                });
            });
        });
    }

    if (!items.length) {
        list.innerHTML = `<div class="timeline-empty">${t("mc.noevents")}</div>`;
        return;
    }
    items.sort((a, b) => b.order - a.order); // latest first, like commentary
    list.innerHTML = items.map(e => `
        <div class="timeline-item ${e.cls}">
            <span class="timeline-min">${escHtml(e.min)}</span>
            <span class="timeline-text">${e.icon} ${escHtml(e.text)}</span>
        </div>`).join("");
}

// Render probable lineups / used players for the Match Centre (defensive: shapes vary)
function extractLineupPlayers(data, side) {
    if (!data) return [];
    // Path 1: dedicated lineups block (present for some soccer summaries)
    const lu = Array.isArray(data.lineups) ? data.lineups.find(t => (t.homeAway || t.homeaway || "").toLowerCase() === side) : null;
    const luAthletes = lu && (lu.athletes || lu.players || lu.roster);
    if (Array.isArray(luAthletes) && luAthletes.length) {
        return luAthletes.slice(0, 18).map(a => ({
            name: a.displayName || a.name || a.shortName || "?",
            pos: (a.position && (a.position.abbreviation || a.position.name)) || ""
        }));
    }
    // Path 2: boxscore player stats (used players with stats)
    const teams = data.boxscore && Array.isArray(data.boxscore.players) ? data.boxscore.players : [];
    const node = teams.find(t => (t.homeAway || "").toLowerCase() === side) || teams[side === "home" ? 0 : 1];
    const stats = node && Array.isArray(node.statistics) ? node.statistics : [];
    const athletes = [];
    stats.forEach(group => {
        (group.athletes || []).forEach(a => {
            athletes.push({
                name: (a.athlete && (a.athlete.displayName || a.athlete.shortName)) || "?",
                pos: (a.athlete && a.athlete.position && a.athlete.position.abbreviation) || ""
            });
        });
    });
    const seen = new Set();
    return athletes.filter(p => {
        if (p.name === "?" || seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
    }).slice(0, 18);
}

function renderLineups(match, data) {
    const grid = document.getElementById("lineups-grid");
    if (!grid || !match) return;
    const home = extractLineupPlayers(data, "home");
    const away = extractLineupPlayers(data, "away");
    if (!home.length && !away.length) {
        grid.innerHTML = `<div class="timeline-empty" style="grid-column: 1 / -1;">${t("mc.nolineups")}</div>`;
        return;
    }
    const col = (title, players) => `
        <div class="lineup-col">
            <h5>${escHtml(title)}</h5>
            ${players.map(p => `<div class="lineup-player"><span>${escHtml(p.name)}</span><span class="lineup-pos">${escHtml(p.pos)}</span></div>`).join("") || `<div class="timeline-empty">${t("mc.unavail")}</div>`}
        </div>`;
    grid.innerHTML = col(match.homeTeam, home) + col(match.awayTeam, away);
}

function resetMatchCentreTabs() {
    document.querySelectorAll(".mc-tab").forEach(t => {
        const active = t.getAttribute("data-mc-tab") === "commentary";
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
    });
    ["commentary", "timeline", "lineups"].forEach(n => {
        const pane = document.getElementById(`mc-pane-${n}`);
        if (pane) pane.hidden = n !== "commentary";
    });
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
        mcSummaryData = data;
        mcSummaryMatchId = match.id;
        usingLiveCommentary = true;
        renderLiveCommentary(match, data);
        renderTimeline(match, data);
        renderLineups(match, data);
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

// Render Live Ticker — robust for desktop marquee + mobile swipe
let tickerDragInitialized = false;
let tickerIsDragging = false;
let tickerDragStartX = 0;
let tickerDragScrollLeft = 0;
let tickerDragMoved = 0;
let tickerPauseTimer = null;

function initTickerDrag() {
    if (tickerDragInitialized) return;
    const strip = document.querySelector(".ticker-strip");
    if (!strip) return;
    tickerDragInitialized = true;

    const startDrag = (clientX) => {
        tickerIsDragging = true;
        tickerDragMoved = 0;
        tickerDragStartX = clientX;
        tickerDragScrollLeft = strip.scrollLeft;
        strip.classList.add("is-dragging", "is-paused");
    };
    const moveDrag = (clientX) => {
        if (!tickerIsDragging) return;
        const dx = clientX - tickerDragStartX;
        tickerDragMoved = Math.max(tickerDragMoved, Math.abs(dx));
        if (window.innerWidth <= 768) {
            strip.scrollLeft = tickerDragScrollLeft - dx;
        }
    };
    const endDrag = () => {
        if (!tickerIsDragging) return;
        tickerIsDragging = false;
        strip.classList.remove("is-dragging");
        clearTimeout(tickerPauseTimer);
        tickerPauseTimer = setTimeout(() => strip.classList.remove("is-paused"), 1500);
        if (tickerDragMoved > 8) {
            strip.dataset.suppressClick = "1";
            setTimeout(() => { delete strip.dataset.suppressClick; }, 300);
        }
    };

    strip.addEventListener("mousedown", (e) => startDrag(e.clientX));
    window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
    window.addEventListener("mouseup", endDrag);
    strip.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientX), { passive: true });
    strip.addEventListener("touchmove", (e) => moveDrag(e.touches[0].clientX), { passive: true });
    strip.addEventListener("touchend", endDrag, { passive: true });
    strip.addEventListener("touchcancel", endDrag, { passive: true });

    strip.addEventListener("scroll", () => {
        if (!tickerIsDragging) {
            strip.classList.add("is-paused");
            clearTimeout(tickerPauseTimer);
            tickerPauseTimer = setTimeout(() => strip.classList.remove("is-paused"), 2500);
        }
    }, { passive: true });
    strip.addEventListener("mouseenter", () => strip.classList.add("is-paused"));
    strip.addEventListener("mouseleave", () => {
        if (!tickerIsDragging) {
            clearTimeout(tickerPauseTimer);
            tickerPauseTimer = setTimeout(() => strip.classList.remove("is-paused"), 800);
        }
    });
}

function renderTicker() {
    const strip = document.querySelector(".ticker-strip");
    const prevScroll = strip ? strip.scrollLeft : 0;
    const wasDragging = strip ? strip.classList.contains("is-dragging") : false;

    tickerSlider.innerHTML = "";

    const activeMatches = isApiMode ? apiMatches : MOCK_MATCHES;
    if (activeMatches.length === 0) {
        tickerSlider.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); padding: 0 20px;">No live ticker events</span>`;
        return;
    }

    const tickerSource = isApiMode
        ? activeMatches
        : activeMatches.filter(m => m.sport === "football");

    if (tickerSource.length === 0) {
        tickerSlider.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); padding: 0 20px;">No matches in ticker</span>`;
        return;
    }

    // Always double for seamless infinite marquee — desktop and mobile both auto-scroll
    const tickerMatches = [...tickerSource, ...tickerSource];

    tickerMatches.forEach((match) => {
        const card = document.createElement("div");
        card.className = "ticker-card";
        card.setAttribute("data-match-id", match.id);
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}, ${match.leagueId} ${match.time}`);

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

        const handleOpen = (e) => {
            if (e) e.preventDefault();
            if (strip && strip.dataset.suppressClick === "1") return;
            if (tickerDragMoved > 8) return;
            openMatchPage(match);
        };

        card.addEventListener("click", handleOpen);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                handleOpen(e);
            }
        });

        tickerSlider.appendChild(card);
    });

    // Preserve manual swipe position across re-renders (mobile) - if user has scrolled, keep it
    if (strip && !wasDragging && window.innerWidth <= 768) {
        requestAnimationFrame(() => {
            strip.scrollLeft = prevScroll;
        });
    }

    initTickerDrag();
}

// Render Standings
function renderStandings() {
    standingsBody.innerHTML = "";
    const live = isApiMode ? liveStandings[currentStandingLeague] : null;
    const list = (live && live.length) ? live : MOCK_STANDINGS[currentStandingLeague];
    if (!list) return;

    updateFullTableLink(currentStandingLeague);

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

// Render Top Scorers / Top Assists (ESPN leaders in Live API mode, mock data otherwise)
function renderScorers() {
    const listEl = document.getElementById("scorers-list");
    if (!listEl) return;

    const titleEl = document.querySelector(".scorers-card .card-header-row h3");
    if (titleEl) titleEl.textContent = leadersCategory === "assists" ? "Top Assists" : "Top Scorers";

    const mockRows = leadersCategory === "assists" ? MOCK_ASSISTS : MOCK_SCORERS;
    let rows = null;
    if (isApiMode) {
        const liveOk = liveScorers && liveScorers.length && liveScorersCat === leadersCategory;
        rows = liveOk ? liveScorers : (leadersCategory === "goals" ? scorersFromMatches() : mockRows);
    }
    if (!rows || !rows.length) rows = mockRows;

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
        const isVideo = !!(news.hasVideo || (news.raw && (news.raw.type === "Video" || (Array.isArray(news.raw.videos) && news.raw.videos.length))));
        const card = document.createElement(useLive ? "a" : "div");
        card.className = "news-card" + (isVideo ? " has-video" : "");
        if (useLive) {
            // If it's a video highlight, open directly on ESPN, otherwise use story page
            if (isVideo && news.link && news.link.includes("espn.com")) {
                card.href = news.link;
                card.target = "_blank";
                card.rel = "noopener";
            } else {
                card.href = "story.html";
                card.addEventListener("click", () => {
                    try { sessionStorage.setItem("scorehub-story", JSON.stringify(news.raw || news)); } catch (e) {}
                });
            }
        }
        const thumbStyle = news.image
            ? `background-image: url('${news.image}');`
            : `background: ${news.grad}`;
        card.innerHTML = `
            <div class="news-thumb" style="${thumbStyle}">${isVideo ? '<span class="news-video-badge">▶</span>' : ''}</div>
            <div class="news-meta">
                <span class="news-category-badge">${news.category}${isVideo ? ' · 🎥 Highlight' : ''}</span>
                <h4 class="news-title">${news.title}</h4>
                <span class="news-time">${news.time}${news.leagueSlug ? ' · ' + (LEAGUE_NAMES['soccer/'+news.leagueSlug] ? LEAGUE_NAMES['soccer/'+news.leagueSlug].code : news.leagueSlug) : ''}</span>
            </div>
        `;
        newsContainer.appendChild(card);
    });
}

function renderHighlights() {
    const strip = document.getElementById("highlights-strip");
    const track = document.getElementById("highlights-track");
    if (!strip || !track) return;
    if (!isApiMode || !liveHighlights || !liveHighlights.length) {
        strip.hidden = true;
        return;
    }
    strip.hidden = false;
    track.innerHTML = "";
    liveHighlights.forEach(item => {
        const a = document.createElement("a");
        a.className = "highlight-card";
        a.href = item.link || "https://www.espn.com/soccer/";
        a.target = "_blank";
        a.rel = "noopener";
        const thumbStyle = item.image ? `background-image: url('${item.image}');` : `background: var(--bg-card-solid);`;
        const leagueLabel = item.league ? (LEAGUE_NAMES['soccer/'+item.league] ? LEAGUE_NAMES['soccer/'+item.league].name : item.league) : item.category;
        a.innerHTML = `
            <div class="highlight-thumb" style="${thumbStyle}">
                <div class="highlight-play"><span>▶</span></div>
            </div>
            <div class="highlight-meta">
                <span class="highlight-league">${leagueLabel}</span>
                <span class="highlight-title">${item.title}</span>
                <span class="news-time">${item.time}</span>
            </div>
        `;
        track.appendChild(a);
    });
}

// Render Matches List
// --- FIXTURES CALENDAR (ESPN scoreboard ?dates= support) ---
const DATE_STRIP_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5];

function toYYYYMMDD(d) {
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

function renderDateStrip() {
    const strip = document.getElementById("date-strip");
    if (!strip) return;
    const today = new Date();
    strip.innerHTML = "";
    DATE_STRIP_OFFSETS.forEach(offset => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        const ymd = toYYYYMMDD(d);
        const btn = document.createElement("button");
        btn.className = "date-pill" + ((offset === 0 && !selectedDate) || selectedDate === ymd ? " active" : "");
        const dow = offset === 0 ? t("date.today") : d.toLocaleDateString(appLocale(), { weekday: "short" });
        const dayNum = d.getDate();
        const mon = d.toLocaleDateString(appLocale(), { month: "short" });
        btn.innerHTML = `<span class="date-pill-dow">${dow}</span><span class="date-pill-day">${dayNum} ${mon}</span>`;
        btn.setAttribute("aria-label", d.toLocaleDateString(appLocale(), { weekday: "long", month: "long", day: "numeric" }));
        btn.addEventListener("click", () => {
            if (!isApiMode) {
                showNotification(t("notif.dateneed"), true);
                return;
            }
            selectedDate = offset === 0 ? null : ymd;
            renderDateStrip();
            loadAPIMatches();
        });
        strip.appendChild(btn);
    });
}

// --- FORMULA 1 (Jolpica Ergast API: no key, CORS-enabled) ---
const F1_API = "https://api.jolpi.ca/ergast/f1";
const F1_TTL_MS = 10 * 60 * 1000;

const F1_NATIONALITY_FLAGS = {
    "British": "gb", "Dutch": "nl", "Spanish": "es", "French": "fr", "German": "de",
    "Italian": "it", "Australian": "au", "Japanese": "jp", "American": "us", "Canadian": "ca",
    "Mexican": "mx", "Brazilian": "br", "Austrian": "at", "Finnish": "fi", "Danish": "dk",
    "Swedish": "se", "Monegasque": "mc", "Thai": "th", "Chinese": "cn", "Argentine": "ar",
    "New Zealander": "nz", "Swiss": "ch", "Belgian": "be", "Portuguese": "pt", "Indian": "in"
};

async function fetchF1(path) {
    const resp = await fetchWithTimeout(`${F1_API}${path}`, ESPN_FETCH_TIMEOUT_MS);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data || !data.MRData) throw new Error("bad F1 payload");
    return data.MRData;
}

function f1RaceDateTime(race) {
    if (!race || !race.date) return null;
    const d = new Date(race.time ? `${race.date}T${race.time}` : `${race.date}T12:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
}

function f1CountdownParts(target) {
    const ms = Math.max(0, target.getTime() - Date.now());
    return {
        days: Math.floor(ms / 86400000),
        hours: Math.floor(ms / 3600000) % 24,
        mins: Math.floor(ms / 60000) % 60
    };
}

function f1DriverName(d) {
    if (!d) return t("f1.unknown");
    return [d.givenName, d.familyName].filter(Boolean).join(" ") || t("f1.unknown");
}

async function loadF1Data(force = false) {
    if (f1Loading) return;
    if (!force && f1Data && Date.now() - f1DataAt < F1_TTL_MS) {
        if (currentSport === "f1") renderF1();
        return;
    }
    f1Loading = true;
    if (currentSport === "f1") showSkeletons(3);
    try {
        const results = await Promise.all([
            fetchF1("/current.json"),
            fetchF1("/current/driverStandings.json"),
            fetchF1("/current/last/results.json").catch(() => null) // null when no race completed yet
        ]);
        f1Data = { season: results[0], drivers: results[1], last: results[2] };
        f1DataAt = Date.now();
    } catch (err) {
        console.warn("F1 fetch failed:", err.message);
    } finally {
        f1Loading = false;
        if (currentSport === "f1") renderF1();
    }
}

function f1FlagImg(nationality) {
    const code = F1_NATIONALITY_FLAGS[nationality];
    if (!code) return "";
    return `<img class="f1-flag" src="https://flagcdn.com/w40/${code}.png" alt="" loading="lazy" onerror="this.remove()">`;
}

function renderF1() {
    matchesContainer.innerHTML = "";
    const section = document.querySelector(".live-scores-section");
    if (section) section.classList.add("f1-mode");
    const titleEl = document.querySelector(".live-scores-section .scores-header h3");
    if (titleEl) titleEl.textContent = "Formula 1";

    if (!isApiMode && !f1Data) {
        matchesContainer.innerHTML = `
            <div class="f1-note">${t("f1.demo")}</div>
            <button class="f1-retry-btn" id="f1-enable-live">Switch to Live API Mode</button>`;
        document.getElementById("f1-enable-live").addEventListener("click", () => setApiMode(true));
        return;
    }
    if (!f1Data) {
        matchesContainer.innerHTML = `
            <div class="f1-note">${t("f1.unavail")}</div>
            <button class="f1-retry-btn" id="f1-retry">Retry</button>`;
        document.getElementById("f1-retry").addEventListener("click", () => loadF1Data(true));
        return;
    }

    const seasonTable = f1Data.season && f1Data.season.RaceTable;
    const races = (seasonTable && seasonTable.Races) || [];
    const now = Date.now();
    const upcoming = races.map(r => ({ race: r, at: f1RaceDateTime(r) }))
        .filter(x => x.at && x.at.getTime() > now - 3 * 3600000);
    const next = upcoming[0];

    if (next) {
        const cd = f1CountdownParts(next.at);
        const when = next.at.toLocaleDateString(appLocale(), { weekday: "short", month: "short", day: "numeric" }) + " · " +
            next.at.toLocaleTimeString(appLocale(), { hour: "2-digit", minute: "2-digit" });
        matchesContainer.innerHTML += `
            <div class="f1-hero">
                <div class="f1-kicker">${tf("f1.next", { n: escHtml(next.race.round || "") })}</div>
                <div class="f1-race-name">${escHtml(next.race.raceName || "Grand Prix")}</div>
                <div class="f1-circuit">${escHtml((next.race.Circuit && next.race.Circuit.circuitName) || "")} · ${escHtml(when)}</div>
                <div class="f1-countdown">
                    <div class="f1-count-box"><span class="f1-count-num">${cd.days}</span><span class="f1-count-lbl">${t("f1.days")}</span></div>
                    <div class="f1-count-box"><span class="f1-count-num">${cd.hours}</span><span class="f1-count-lbl">${t("f1.hrs")}</span></div>
                    <div class="f1-count-box"><span class="f1-count-num">${cd.mins}</span><span class="f1-count-lbl">${t("f1.min")}</span></div>
                </div>
            </div>`;
    }

    const lastTable = f1Data.last && f1Data.last.RaceTable;
    const lastRaces = (lastTable && lastTable.Races) || [];
    if (lastRaces.length && lastRaces[0].Results) {
        const lr = lastRaces[0];
        let html = `<div class="f1-section-title">${tf("f1.last", { n: escHtml(lr.raceName || "") })}</div>`;
        lr.Results.slice(0, 5).forEach(r => {
            html += `<div class="f1-row"><span class="f1-pos">P${escHtml(r.position)}</span>`
                + f1FlagImg(r.Driver && r.Driver.nationality)
                + `<span class="f1-driver">${escHtml(f1DriverName(r.Driver))}</span>`
                + `<span class="f1-team">${escHtml(r.Constructor ? r.Constructor.name : "")}</span>`
                + `<span class="f1-pts">${escHtml(r.points)} pts</span></div>`;
        });
        matchesContainer.innerHTML += html;
    }

    const stTable = f1Data.drivers && f1Data.drivers.StandingsTable;
    const lists = (stTable && stTable.StandingsLists) || [];
    if (lists.length && lists[0].DriverStandings) {
        let html = `<div class="f1-section-title">${t("f1.drivers")}</div>`;
        lists[0].DriverStandings.slice(0, 8).forEach(s => {
            html += `<div class="f1-row"><span class="f1-pos">${escHtml(s.position)}</span>`
                + f1FlagImg(s.Driver && s.Driver.nationality)
                + `<span class="f1-driver">${escHtml(f1DriverName(s.Driver))}</span>`
                + `<span class="f1-team">${escHtml(s.Constructors && s.Constructors[0] ? s.Constructors[0].name : "")}</span>`
                + `<span class="f1-pts">${escHtml(s.points)}</span></div>`;
        });
        matchesContainer.innerHTML += html;
        const upd = new Date(f1DataAt);
        matchesContainer.innerHTML += `<div class="f1-note">${tf("f1.updated", { time: upd.toLocaleTimeString(appLocale(), { hour: "2-digit", minute: "2-digit" }) })}</div>`;
    }
}

// --- LEAGUE FLAG IMAGES (progressive enhancement; emoji stays as fallback) ---
const LEAGUE_FLAG_CODES = {
    EPL: "gb-eng",
    UCL: "eu",
    UEL: "eu",
    LaLiga: "es",
    SerieA: "it",
    Bundesliga: "de",
    Ligue1: "fr",
    ERE: "nl",
    POR: "pt",
    MLS: "us",
    SAU: "sa",
    BRA: "br",
    BEL: "be",
    TUR: "tr",
    SCO: "gb-sct",
    SUI: "ch",
    AUT: "at",
    DEN: "dk",
    SWE: "se",
    NOR: "no",
    GRE: "gr",
    RUS: "ru",
    UKR: "ua",
    LIGAMX: "mx",
    ARG: "ar",
    J1: "jp",
    AUS: "au",
    ISL: "in",
    LIB: "eu",
    CWC: "eu",
    WC: "eu"
};

function enhanceLeagueFlags() {
    document.querySelectorAll(".league-row").forEach(row => {
        const code = LEAGUE_FLAG_CODES[row.getAttribute("data-league-id")];
        const flagEl = row.querySelector(".league-flag");
        if (!code || !flagEl || flagEl.querySelector("img")) return;
        const emoji = flagEl.textContent;
        const img = document.createElement("img");
        img.src = `https://flagcdn.com/w40/${code}.png`;
        img.alt = "";
        img.loading = "lazy";
        img.className = "league-flag-img";
        img.onerror = () => { flagEl.textContent = emoji; };
        flagEl.textContent = "";
        flagEl.appendChild(img);
    });
}

function matchYmd(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

function matchPageUrl(m) {
    if (m && m.leagueSlug && m.espnEventId && m.date) {
        const ymd = matchYmd(m.date);
        if (ymd) return `match.html?league=${encodeURIComponent(m.leagueSlug)}&id=${encodeURIComponent(m.espnEventId)}&date=${ymd}`;
    }
    return `match.html`;
}
function openMatchPage(m) {
    try { sessionStorage.setItem("scorehub-match", JSON.stringify(m)); } catch (e) {}
    window.location.href = matchPageUrl(m);
}

function canPreviewMatch(m) {
    return !!(isApiMode && m && m.sport === "football" && m.espnEventId && m.leagueSlug && m.date
        && matchYmd(m.date) && new Date(m.date).getTime() > Date.now());
}

function previewLinkHTML(m) {
    if (!canPreviewMatch(m)) return "";
    return `<a class="stat-capsule preview-link" href="preview.html?league=${m.leagueSlug}&id=${m.espnEventId}&date=${matchYmd(m.date)}" title="Read the ScoreHub match preview">📰 Preview</a>`;
}

function canReportMatch(m) {
    return !!(isApiMode && m && m.sport === "football" && m.espnEventId && m.leagueSlug && m.date
        && matchYmd(m.date) && m.halftimeScore);
}

function reportLinkHTML(m) {
    if (!canReportMatch(m)) return "";
    return `<a class="stat-capsule report-link" href="report.html?league=${m.leagueSlug}&id=${m.espnEventId}&date=${matchYmd(m.date)}" title="Read the ScoreHub match report">📝 Report</a>`;
}

// --- STORY OF THE WEEK (auto-pick the most interesting match) ---
function scorerMinute(label) {
    const m = String(label || "").match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

function storyDramaFromScorers(homeScorers, awayScorers) {
    const all = [];
    (homeScorers || []).forEach((s) => all.push({ min: scorerMinute(s), team: "H", name: String(s).replace(/^\d+'(\+\d+')?\s*/, "").trim() }));
    (awayScorers || []).forEach((s) => all.push({ min: scorerMinute(s), team: "A", name: String(s).replace(/^\d+'(\+\d+')?\s*/, "").trim() }));
    all.sort((a, b) => a.min - b.min);
    let hs = 0, as = 0;
    const runs = all.map((g) => { if (g.team === "H") hs++; else as++; return { hs, as }; });
    const winner = hs > as ? "H" : as > hs ? "A" : null;
    let trailed = false;
    if (winner) {
        let ph = 0, pa = 0;
        runs.forEach((r) => {
            const before = ph > pa ? "H" : pa > ph ? "A" : null;
            if (before && before !== winner) trailed = true;
            ph = r.hs; pa = r.as;
        });
    }
    const tally = {};
    all.forEach((g) => { if (g.name) tally[g.name] = (tally[g.name] || 0) + 1; });
    let brace = null;
    Object.keys(tally).forEach((k) => { if (tally[k] >= 2 && (!brace || tally[k] > brace.n)) brace = { name: k, n: tally[k] }; });
    const lastMin = all.length ? all[all.length - 1].min : 0;
    return { winner, comeback: trailed, brace, lateMin: lastMin >= 85 ? lastMin : null, total: all.length };
}

function scoreStoryFinished(m) {
    const hs = Number(m.homeScore) || 0, as = Number(m.awayScore) || 0;
    const goals = hs + as;
    const d = storyDramaFromScorers(m.scorers ? m.scorers.home : [], m.scorers ? m.scorers.away : []);
    let score = goals * 2;
    const reasons = [];
    if (goals >= 5) { score += 2; reasons.push(`${tf("story.goalsthriller", { n: goals })}`); }
    if (d.winner == null && goals >= 2) { score += 3; reasons.push(t("story.shared")); }
    else if (d.winner && Math.abs(hs - as) === 1) score += 1;
    if (d.lateMin) { score += 2; reasons.push(tf("story.death", { m: d.lateMin })); }
    if (d.comeback) { score += 2; reasons.push(t("story.comeback")); }
    if (d.brace) { score += 1; reasons.push(`${d.brace.name} ${d.brace.n >= 3 ? t("story.hattrick") : t("story.braceword")}`); }
    if (!reasons.length) reasons.push(`${hs}–${as} ${d.winner ? t("story.winword") : t("story.drawword")}`);
    return { score, reason: `${hs}–${as} — ${reasons.join(" · ")}` };
}

function storyNorm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function storyOrd(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function storyPosOf(m, tables) {
    const rows = tables && tables[m.leagueId];
    if (!rows) return null;
    const find = (name, code) => rows.find((r) => storyNorm(r.team) === storyNorm(name) || (code && storyNorm(r.abbrev) === storyNorm(code))) || null;
    return { h: find(m.homeTeam, m.homeCode), a: find(m.awayTeam, m.awayCode) };
}

function pickStoryOfWeek(matches, tables) {
    const fins = (matches || []).filter((m) => isApiMode && m.sport === "football" && m.espnEventId && m.leagueSlug && m.halftimeScore);
    const ups = (matches || []).filter((m) => canPreviewMatch(m));
    let bestFin = null;
    fins.forEach((m) => {
        const s = scoreStoryFinished(m);
        if (!bestFin || s.score > bestFin.score || (s.score === bestFin.score && new Date(m.date) > new Date(bestFin.m.date))) {
            bestFin = { m, score: s.score, reason: s.reason };
        }
    });
    let bestUp = null;
    ups.forEach((m) => {
        const pos = storyPosOf(m, tables || {});
        const combined = pos && pos.h && pos.a ? pos.h.rank + pos.a.rank : 999;
        if (!bestUp || combined < bestUp.combined || (combined === bestUp.combined && new Date(m.date) < new Date(bestUp.m.date))) {
            bestUp = { m, combined, pos };
        }
    });
    if (bestFin && bestFin.score >= 8) {
        return { id: bestFin.m.id, kind: "report", reason: bestFin.reason, score: bestFin.score };
    }
    if (bestUp && bestUp.combined < 999) {
        const h = bestUp.pos.h, a = bestUp.pos.a;
        return { id: bestUp.m.id, kind: "preview", reason: tf("story.vs", { a: storyOrd(h.rank), b: storyOrd(a.rank), h: h.team, t: a.team }), score: 99 - bestUp.combined };
    }
    if (bestFin) return { id: bestFin.m.id, kind: "report", reason: bestFin.reason, score: bestFin.score };
    if (bestUp) return { id: bestUp.m.id, kind: "preview", reason: tf("story.upcoming", { h: bestUp.m.homeTeam, a: bestUp.m.awayTeam }), score: 0 };
    return null;
}

let storyPick = null;
let storyLocked = false;
const STORY_TABLE_TTL_MS = 30 * 60 * 1000;

async function ensureStoryTables() {
    try {
        const raw = sessionStorage.getItem("scorehub-story-tables-v1");
        if (raw) {
            const cached = JSON.parse(raw);
            if (cached && cached.at && Date.now() - cached.at < STORY_TABLE_TTL_MS && cached.tables) return cached.tables;
        }
    } catch (e) {}
    const codes = Object.keys(STANDINGS_TAB_SLUGS);
    const results = await Promise.all(codes.map((c) => loadLiveStandings(c).catch(() => null)));
    const tables = {};
    codes.forEach((c, i) => { if (results[i] && results[i].length) tables[c] = results[i]; });
    try { sessionStorage.setItem("scorehub-story-tables-v1", JSON.stringify({ at: Date.now(), tables })); } catch (e) {}
    return tables;
}

async function applyStoryOfWeek() {
    if (!isApiMode || storyLocked) return;
    const tables = await ensureStoryTables();
    if (storyLocked || !isApiMode) return;
    const pick = pickStoryOfWeek(apiMatches, tables);
    if (!pick || !apiMatches.some((m) => m.id === pick.id)) return;
    storyPick = pick;
    if (pick.id === spotlightMatchId) { updateStoryTag(); return; }
    setSpotlightMatch(pick.id);
}

function updateStoryTag() {
    const tag = document.getElementById("story-tag");
    const reason = document.getElementById("story-reason");
    const btn = document.getElementById("spotlight-story-btn");
    const activeMatches = isApiMode ? apiMatches : MOCK_MATCHES;
    const match = activeMatches.find((m) => m.id === spotlightMatchId);
    const isStory = !!(storyPick && match && match.id === storyPick.id);
    if (tag) tag.hidden = !isStory;
    if (reason) {
        reason.hidden = !isStory;
        if (isStory) reason.textContent = storyPick.reason;
    }
    if (btn) {
        if (match && canPreviewMatch(match)) {
            btn.hidden = false;
            btn.innerHTML = "<span>" + t("story.previewbtn") + "</span>";
            btn.href = `preview.html?league=${match.leagueSlug}&id=${match.espnEventId}&date=${matchYmd(match.date)}`;
        } else if (match && canReportMatch(match)) {
            btn.hidden = false;
            btn.innerHTML = "<span>" + t("story.reportbtn") + "</span>";
            btn.href = `report.html?league=${match.leagueSlug}&id=${match.espnEventId}&date=${matchYmd(match.date)}`;
        } else {
            btn.hidden = true;
        }
    }
}

function getMatchStatusInfo(match) {
    const timeStr = String(match.time || "");
    const htScore = String(match.halftimeScore || "");
    const isHT = timeStr === "HT" || timeStr.includes("HT") || htScore === "HT" || timeStr.includes("Half");
    const isLive = match.status === "live" && !isHT;
    const isFinished = !isLive && !isHT && (
        timeStr === "FT" || timeStr.includes("FT") || htScore.includes("FT") || htScore === "Ended" ||
        timeStr.toLowerCase().includes("ended") || timeStr.toLowerCase().includes("full")
    );
    const isToday = !isLive && !isHT && !isFinished;
    let label = "";
    let cls = "";
    let priority = 3;
    if (isLive) { label = "LIVE"; cls = "status-live"; priority = 0; }
    else if (isHT) { label = "HT"; cls = "status-ht"; priority = 1; }
    else if (isFinished) { label = "FT"; cls = "status-ft"; priority = 2; }
    else { label = timeStr || "TODAY"; cls = "status-today"; priority = 3; }
    return { isLive, isHT, isFinished, isToday, label, cls, priority };
}

function formatMatchDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    if (isToday) return { key: "today", label: "Today", short: "Today" };
    if (d.toDateString() === yesterday.toDateString()) return { key: "yesterday", label: "Yesterday", short: "Yesterday" };
    if (d.toDateString() === tomorrow.toDateString()) return { key: "tomorrow", label: "Tomorrow", short: "Tomorrow" };
    const label = d.toLocaleDateString(appLocale(), { weekday: "long", month: "short", day: "numeric" });
    const short = d.toLocaleDateString(appLocale(), { month: "short", day: "numeric" });
    const ymd = toYYYYMMDD(d);
    return { key: ymd, label, short, iso: d.toISOString() };
}

function renderMatches() {
    const scoresSection = document.querySelector(".live-scores-section");
    if (currentSport === "f1") { renderF1(); return; }
    if (scoresSection) scoresSection.classList.remove("f1-mode");
    const scoresTitle = document.querySelector(".live-scores-section .scores-header h3");
    if (scoresTitle) scoresTitle.textContent = t("scores.live");
    matchesContainer.innerHTML = "";
    
    const activeMatches = isApiMode ? apiMatches : MOCK_MATCHES;
    
    let filtered = activeMatches.filter((m) => {
        if (currentSport !== "all" && currentSport !== "worldwide" && m.sport !== currentSport) return false;
        if (currentLeague !== "all" && m.leagueId !== currentLeague) return false;
        const st = getMatchStatusInfo(m);
        if (currentFilter === "live" && !st.isLive) return false;
        if (currentFilter === "ht" && !st.isHT) return false;
        if (currentFilter === "today" && st.isFinished) return false;
        if (currentFilter === "favorites" && !m.favorites) return false;
        return true;
    });

    if (sortByLeague) {
        filtered.sort((a, b) => (a.league || "").localeCompare(b.league || ""));
    } else {
        filtered.sort((a, b) => {
            const sa = getMatchStatusInfo(a);
            const sb = getMatchStatusInfo(b);
            if (sa.priority !== sb.priority) return sa.priority - sb.priority;
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return da - db;
        });
    }

    if (filtered.length === 0) {
        matchesContainer.innerHTML = `
            <div class="no-matches" style="text-align: center; color: var(--text-secondary); padding: 40px 0; font-size: 13px;">
                ${t("scores.none")}
            </div>
        `;
        return;
    }

    // Group by date for clean info
    const groups = new Map();
    filtered.forEach(m => {
        const fmt = m.date ? formatMatchDate(m.date) : null;
        const key = fmt ? fmt.key : "today";
        if (!groups.has(key)) groups.set(key, { fmt: fmt || { key: "today", label: "Today", short: "Today" }, matches: [] });
        groups.get(key).matches.push(m);
    });

    const sortedGroupKeys = [...groups.keys()].sort((a,b) => {
        if (a === "today") return -1;
        if (b === "today") return 1;
        if (a === "yesterday" && b !== "today") return -1;
        if (b === "yesterday" && a !== "today") return 1;
        if (a === "tomorrow") return 1;
        if (b === "tomorrow") return -1;
        return a.localeCompare(b);
    });

    sortedGroupKeys.forEach(gk => {
        const group = groups.get(gk);
        const fmt = group.fmt;
        // Date header with clean info
        const dateHeader = document.createElement("div");
        dateHeader.className = "matches-date-header";
        const liveInGroup = group.matches.filter(m => getMatchStatusInfo(m).isLive).length;
        const htInGroup = group.matches.filter(m => getMatchStatusInfo(m).isHT).length;
        const ftInGroup = group.matches.filter(m => getMatchStatusInfo(m).isFinished).length;
        dateHeader.innerHTML = `
            <div class="date-header-left">
                <span class="date-header-label">${fmt.label}</span>
                ${fmt.short && fmt.label !== fmt.short ? `<span class="date-header-short">${fmt.short}</span>` : ''}
            </div>
            <div class="date-header-right">
                <span class="date-header-count">${group.matches.length} matches</span>
                ${liveInGroup ? `<span class="date-header-badge live">${liveInGroup} LIVE</span>` : ''}
                ${htInGroup ? `<span class="date-header-badge ht">${htInGroup} HT</span>` : ''}
                ${ftInGroup ? `<span class="date-header-badge ft">${ftInGroup} FT</span>` : ''}
            </div>
        `;
        matchesContainer.appendChild(dateHeader);

        group.matches.forEach((match) => {
            const card = document.createElement("div");
            const scoreDelta = scoreDeltas.get(match.id);
            const st = getMatchStatusInfo(match);
            card.className = `match-card match-status-${st.cls} ${match.id === spotlightMatchId ? 'active-spotlight' : ''}${scoreDelta ? ' scored' : ''}`;
            card.setAttribute("data-match-id", match.id);
            
            const dateInfo = match.date ? formatMatchDate(match.date) : null;
            const dateBadge = dateInfo && dateInfo.key !== "today" ? `<span class="match-date-badge">${dateInfo.short}</span>` : "";
            
            card.innerHTML = `
                <div class="match-card-header">
                    <div class="match-card-league-wrap">
                        <span class="match-card-league">${match.league}</span>
                        ${dateBadge}
                    </div>
                    <div class="match-card-status ${st.cls}">
                        ${st.isLive ? '<span class="live-indicator-dot"></span>' : ''}
                        <span class="status-label">${st.label}</span>
                        ${st.isLive || st.isHT ? `<span class="status-time">${match.time}</span>` : (st.isFinished ? `<span class="status-time">${match.time}</span>` : `<span class="status-time">${match.time}</span>`)}
                    </div>
                </div>
                
                <div class="match-card-scoreboard">
                    <div class="match-card-team-info">
                        <span class="match-team-name">${match.homeTeam}</span>
                        ${teamBadgeHTML(match.homeCode, match.homeLogo, 20)}
                    </div>
                    
                    <div class="match-card-scores">
                        <span class="${st.isLive ? 'score-live' : ''}">${scoreCell(match.homeScore, scoreDelta && scoreDelta.home ? scoreDelta.prevHome : null)}</span>
                        <span class="score-dash">-</span>
                        <span class="${st.isLive ? 'score-live' : ''}">${scoreCell(match.awayScore, scoreDelta && scoreDelta.away ? scoreDelta.prevAway : null)}</span>
                    </div>
                    
                    <div class="match-card-team-info away">
                        ${teamBadgeHTML(match.awayCode, match.awayLogo, 20)}
                        <span class="match-team-name">${match.awayTeam}</span>
                    </div>
                </div>
                
                <div class="match-card-footer">
                    <div class="match-stat-capsules">
                        <span class="stat-capsule status-capsule ${st.cls}">${st.isLive ? '🔴 LIVE' : st.isHT ? '🟠 HT' : st.isFinished ? '⚫ FT' : '🔵 ' + st.label}</span>
                        ${previewLinkHTML(match)}
                        ${reportLinkHTML(match)}
                        ${match.odds ? `<span class="stat-capsule" title="Odds ${match.homeCode}/${match.awayCode}/Draw via ${match.odds.provider}">🎲 ${oddsSummary(match.odds)}</span>` : ""}
                        <span class="stat-capsule">⚽ ${match.homeScore + match.awayScore} Goals</span>
                        <span class="stat-capsule">📊 ${match.stats.possession}% Poss</span>
                    </div>
                    
                    <button class="btn-star-fav ${match.favorites ? 'favorited' : ''}" data-match-id="${match.id}" aria-label="Favorite">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="${match.favorites ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                </div>
            `;
            
            card.addEventListener("click", (e) => {
                if (e.target.closest(".btn-star-fav") || e.target.closest(".preview-link") || e.target.closest(".report-link")) return;
                openMatchPage(match);
            });
            
            const favBtn = card.querySelector(".btn-star-fav");
            favBtn.addEventListener("click", () => {
                match.favorites = !match.favorites;
                if (match.favorites) favoriteIds.add(match.id);
                else favoriteIds.delete(match.id);
                persistFavorites();
                favBtn.classList.toggle("favorited");
                renderMatches();
                if (match.favorites) {
                    showNotification(tf("fav.added", { h: match.homeTeam, a: match.awayTeam }));
                }
            });
            
            matchesContainer.appendChild(card);
        });
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
    
    // Club logos (generated shield underneath as fallback)
    spotlightHomeLogoContainer.innerHTML = spotlightLogoHTML(match.homeCode, match.homeColor, match.homeLogo);
    spotlightAwayLogoContainer.innerHTML = spotlightLogoHTML(match.awayCode, match.awayColor, match.awayLogo);
    
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

    updateStoryTag();
}

// Render Stats Bars
function renderStatsBars(match) {
    statsBarsList.innerHTML = "";
    
    const statsConfig = [
        { key: "possession", label: t("stats.possession"), suffix: "%" },
        { key: "shots", label: t("stats.shots"), suffix: "" },
        { key: "shotsOnTarget", label: t("stats.sot"), suffix: "" },
        { key: "corners", label: t("stats.corners"), suffix: "" },
        { key: "fouls", label: t("stats.fouls"), suffix: "" },
        { key: "yellowCards", label: t("stats.yellow"), suffix: "" }
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

// --- NETWORK / STALE-DATA BANNER ---
function refreshApiModeText() {
    if (typeof apiModeText !== "undefined" && apiModeText) {
        apiModeText.textContent = t(isApiMode ? "api.live" : "api.sim");
    }
}

function showNetBanner(text, showRetry) {
    const banner = document.getElementById("net-banner");
    const label = document.getElementById("net-banner-text");
    const retry = document.getElementById("net-banner-retry");
    if (!banner || !label) return;
    label.textContent = text;
    if (retry) retry.hidden = !showRetry;
    banner.hidden = false;
}
function hideNetBanner() {
    const banner = document.getElementById("net-banner");
    if (banner) banner.hidden = true;
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

// --- SHARE + CALENDAR (spotlight match) ---
function spotlightMatch() {
    return (isApiMode ? apiMatches : MOCK_MATCHES).find(m => m.id === spotlightMatchId) || null;
}

function matchShareUrl(match) {
    const url = new URL(window.location.href.split("#")[0]);
    url.searchParams.set("match", match.id);
    return url.toString();
}

async function shareSpotlightMatch() {
    const match = spotlightMatch();
    if (!match) return;
    const shareData = {
        title: `ScoreHub — ${match.homeTeam} vs ${match.awayTeam}`,
        text: `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam} (${match.league})`,
        url: matchShareUrl(match)
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
        return;
    }
    try {
        await navigator.clipboard.writeText(shareData.url);
        showNotification(t("notif.copied"), true);
    } catch (e) {
        showNotification(shareData.url, true);
    }
}

function icsDateUTC(d) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function downloadSpotlightICS() {
    const match = spotlightMatch();
    if (!match) return;
    if (!match.date) {
        showNotification(t("notif.kickoffsim"), true);
        return;
    }
    const start = new Date(match.date);
    if (isNaN(start.getTime())) {
        showNotification(t("notif.kickoffna"), true);
        return;
    }
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ScoreHub//Match//EN", "BEGIN:VEVENT",
        `UID:${match.id}@scorehub`, `DTSTAMP:${icsDateUTC(new Date())}`,
        `DTSTART:${icsDateUTC(start)}`, `DTEND:${icsDateUTC(end)}`,
        `SUMMARY:${match.homeTeam} vs ${match.awayTeam} (${match.league})`,
        `DESCRIPTION:Follow live on ScoreHub - ${matchShareUrl(match)}`,
        "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${match.homeCode}-vs-${match.awayCode}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    showNotification(t("notif.ics"), true);
}

// Deep link: ?match=<id> spotlights + scrolls to that match (runs after data loads)
function handleDeepLinkMatch() {
    let id = null;
    try { id = new URLSearchParams(window.location.search).get("match"); } catch (e) { return; }
    if (!id) return;
    const pool = (isApiMode ? apiMatches : MOCK_MATCHES);
    if (pool.some(m => m.id === id)) {
        setSpotlightMatch(id);
        const el = document.getElementById("match-spotlight");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// --- EVENT SIMULATION LOOP ---
// Every 4 seconds, increment time on matches. Every 16 seconds, trigger an event (goals, shots, cards)
let gameSeconds = 72;

function simulationLoop() {
    // Only run in simulation mode
    if (isApiMode) return;
    // Don't rebuild lists mid-interaction (drawer / modal open / ticker swipe)
    if (document.body.classList.contains("nav-open") || document.querySelector(".modal-overlay.active")) return;
    if (typeof tickerIsDragging !== "undefined" && tickerIsDragging) return;

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
    if (typeof tickerIsDragging !== "undefined" && tickerIsDragging) return;

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
        store.set(THEME_KEY, newTheme);
        
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
        showNotification(t("notif.login"));
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

        resetMatchCentreTabs();
        mcSummaryData = null;
        mcSummaryMatchId = match ? match.id : null;

        if (match && isApiMode && match.espnEventId) {
            try {
                const data = await ensureMatchSummary(match, true);
                mcSummaryData = data;
                usingLiveCommentary = true;
                renderLiveCommentary(match, data);
                renderTimeline(match, data);
                renderLineups(match, data);
                renderPitchShots(match, data);
                if (applySummaryStats(match, data)) renderStatsBars(match);
            } catch (err) {
                usingLiveCommentary = false;
                commList.innerHTML = `<p><strong>[${match.time}]</strong> Live commentary feed unavailable — showing simulated broadcast.</p>`;
                renderTimeline(match, null);
                renderLineups(match, null);
            }
        } else {
            usingLiveCommentary = false;
            commList.innerHTML = `<p><strong>[Live]</strong> Connected to stream. Fetching tactical match feed...</p>`;
            renderTimeline(match, null);
            renderLineups(match, null);
        }
    });
    closeWatchModal.addEventListener("click", () => {
        closeModal(watchLiveModal);
        usingLiveCommentary = false;
    });
    
    // Match Centre tabs (Commentary / Timeline / Lineups)
    const mcTabs = document.querySelectorAll(".mc-tab");
    mcTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            mcTabs.forEach((t) => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            const name = tab.getAttribute("data-mc-tab");
            ["commentary", "timeline", "lineups"].forEach(n => {
                const pane = document.getElementById(`mc-pane-${n}`);
                if (pane) pane.hidden = n !== name;
            });
            // Re-render the newly shown pane from cached data (cheap, keeps it fresh)
            const current = (isApiMode ? apiMatches : MOCK_MATCHES).find(m => m.id === spotlightMatchId);
            if (!current) return;
            if (name === "timeline") renderTimeline(current, mcSummaryData);
            if (name === "lineups") renderLineups(current, mcSummaryData);
        });
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
            if (currentSport === "f1") {
                loadF1Data();
            } else if (isApiMode) {
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
    
    // Goals / Assists leaders toggle
    const leadersBtns = document.querySelectorAll(".segmented-btn");
    leadersBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            leadersBtns.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            leadersCategory = btn.getAttribute("data-leaders-cat") || "goals";
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
            searchResults.innerHTML = `<div style="padding: 10px 16px; font-size: 12px; color: var(--text-muted);">${t("search.none")}</div>`;
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
                    searchInput.value = "";
                    searchResults.style.display = "none";
                    searchInput.blur();
                    openMatchPage(m);
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
        // also close More dropdown
        const moreDD = document.querySelector(".main-nav .dropdown");
        const moreTog = document.querySelector(".main-nav .dropdown-toggle");
        if (moreDD) moreDD.classList.remove("open");
        if (moreTog) moreTog.setAttribute("aria-expanded", "false");
    };

    navToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = document.body.classList.toggle("nav-open");
        navToggleBtn.setAttribute("aria-expanded", String(isOpen));
        navToggleBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close the drawer after choosing a destination (but not when toggling More)
    mainNav.querySelectorAll("a").forEach((link) => {
        if (link.classList.contains("dropdown-toggle")) return;
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

    // Offline / online connectivity banner
    const netRetryBtn = document.getElementById("net-banner-retry");
    if (netRetryBtn) netRetryBtn.addEventListener("click", () => {
        hideNetBanner();
        if (isApiMode && !apiLoading) loadAPIMatches();
    });
    window.addEventListener("offline", () => {
        showNetBanner(t("net.offline"), false);
    });
    window.addEventListener("online", () => {
        hideNetBanner();
        showNotification(t("net.back"), true);
        if (isApiMode && !apiLoading) loadAPIMatches();
    });
    if (!navigator.onLine) {
        showNetBanner(t("net.offline"), false);
    }

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
        selectedDate = null;
        renderDateStrip();
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

    // Spotlight Share / Add-to-calendar buttons + click spotlight to open match page
    if (shareMatchBtn) shareMatchBtn.addEventListener("click", shareSpotlightMatch);
    if (addCalendarBtn) addCalendarBtn.addEventListener("click", downloadSpotlightICS);
    const spotlightCard = document.getElementById("match-spotlight");
    if (spotlightCard) {
        spotlightCard.style.cursor = "pointer";
        spotlightCard.addEventListener("click", (e) => {
            if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".btn-star-fav")) return;
            const m = spotlightMatch();
            if (m) openMatchPage(m);
        });
    }

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

    // --- More dropdown (header) — click to toggle, works on desktop + mobile ---
    const moreDropdown = document.querySelector(".main-nav .dropdown");
    const moreToggle = document.querySelector(".main-nav .dropdown-toggle");
    const closeMore = () => {
        if (moreDropdown) moreDropdown.classList.remove("open");
        if (moreToggle) moreToggle.setAttribute("aria-expanded", "false");
    };
    if (moreDropdown && moreToggle) {
        moreToggle.setAttribute("aria-expanded", "false");
        moreToggle.setAttribute("aria-haspopup", "true");
        moreToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const willOpen = !moreDropdown.classList.contains("open");
            // close other popovers
            document.querySelectorAll(".main-nav .dropdown.open").forEach(d => {
                if (d !== moreDropdown) d.classList.remove("open");
            });
            moreDropdown.classList.toggle("open", willOpen);
            moreToggle.setAttribute("aria-expanded", String(willOpen));
        });
        // Clicking a real page link inside More should navigate and close drawer
        moreDropdown.querySelectorAll(".dropdown-menu a").forEach(link => {
            link.addEventListener("click", () => {
                closeMore();
                closeMobileNav();
            });
        });
    }
    // Close More when clicking outside header or pressing Escape
    document.addEventListener("click", (e) => {
        if (moreDropdown && !e.target.closest(".main-nav .dropdown")) {
            closeMore();
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMore();
    });

    if (goToSignup) goToSignup.addEventListener("click", (e) => {
        e.preventDefault();
        showNotification("Sign-up is disabled in this demo — log in with any email", true);
    });

    // Footer deep links (index.html#live, #fixtures, #news, #teams, #leagues, #league-EPL…)
    const handleHashRoute = () => {
        const hash = (window.location.hash || "").replace("#", "");
        if (!hash) return;
        if (hash === "live") { setFilter("live"); setActiveNav(navLive); scrollToEl(".live-scores-section"); }
        else if (hash === "fixtures") { setFilter("today"); setActiveNav(navFixtures); scrollToEl(".live-scores-section"); }
        else if (hash === "news") { setActiveNav(navNews); scrollToEl(".sidebar-news"); }
        else if (hash === "teams") { setActiveNav(navTeams); scrollToEl(".standings-card"); }
        else if (hash === "leagues") { setActiveNav(navLeagues); scrollToEl(".sidebar-leagues"); }
        else if (hash.indexOf("league-") === 0) {
            const row = document.querySelector(`.league-row[data-league-id="${hash.slice(7)}"]`);
            if (row) row.click();
            else scrollToEl(".sidebar-leagues");
        }
    };
    window.addEventListener("hashchange", handleHashRoute);
    handleHashRoute();
}

// Apply the persisted theme (if any) before first render
function applyStoredTheme() {
    const saved = store.get(THEME_KEY, null);
    if (saved !== "light" && saved !== "dark") return;
    document.documentElement.setAttribute("data-theme", saved);
    const moon = document.querySelector(".moon-icon");
    const sun = document.querySelector(".sun-icon");
    if (moon) moon.classList.toggle("hidden", saved === "light");
    if (sun) sun.classList.toggle("hidden", saved !== "light");
}

// --- INITIALIZATION --- 
function init() {
    applyStoredTheme();
    initEventHandlers();
    renderDateStrip();
    enhanceLeagueFlags();
    
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
            if (currentSport === "f1") loadF1Data();
            else loadAPIMatches();
            loadLiveExtras(); // TTL-cached internally, refreshes every ~5 min
            refreshLiveMatchCentre(); // updates the open Watch Live modal
        }
    }, 60000);
    
    // Start tactical pitch broadcast animations
    setInterval(runPitchTrackerAnimation, 1200);
}

// Start everything when DOM is ready
document.addEventListener("DOMContentLoaded", init);

window.__rerenderLang = function () {
    try { refreshApiModeText(); } catch (e) {}
    try { renderDateStrip(); } catch (e) {}
    try { renderMatches(); } catch (e) {}
    try { renderTicker(); } catch (e) {}
    try { renderStandings(); } catch (e) {}
    try { renderNews(); } catch (e) {}
    try { renderScorers(); } catch (e) {}
    try { renderHighlights(); } catch (e) {}
    try { updateStoryTag(); } catch (e) {}
};

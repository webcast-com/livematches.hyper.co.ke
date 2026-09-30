/* ScoreHub sport pages — one URL per sport tab.

   The dashboard used to live at a single URL whatever sport tab was selected.
   Every tab now also has a real address (/basketball/, /tennis/, /formula-1/ …)
   that opens the very same dashboard with that tab already selected. Nothing
   about the dashboard itself changes: the pages are generated copies of
   index.html (tools/build-sport-pages.mjs) that differ only in their <head>
   (title / description / canonical), one visually-hidden heading, and the
   `window.SCOREHUB_SPORT` preset that app.js reads on boot.

   This file is the single source of truth for the sport → URL mapping. It is
   loaded by the browser (index.html + every sport page) and by the Node tooling
   (generator, sitemap, verify) — hence the UMD-style footer.

   `covered` is false for the tabs ESPN's public API has no data for today
   (see the ESPN_ENDPOINTS note in app.js and COVERAGE-AUDIT.md). Those pages
   still work — they show the same "no coverage" state the tab always did — but
   they are served `noindex` and left out of the sitemap so search engines are
   not handed empty pages. Flip the flag when coverage lands. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root && typeof root === 'object') root.SportPages = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
    'use strict';

    var ORIGIN = 'https://livematches.hyper.co.ke';

    // `all` is the home page and is never generated — its strings mirror index.html.
    var PAGES = [
        {
            sport: 'all', slug: '', name: 'All Sports', icon: '🌍', covered: true,
            title: 'ScoreHub - Every Score. Every Moment. Live Football Worldwide',
            description: 'ScoreHub - Live football scores worldwide: Premier League, LaLiga, Serie A, Bundesliga, Champions League, 120+ leagues, fixtures, standings, highlights & news.',
            keywords: 'live scores, football, soccer, Premier League, LaLiga, Serie A, Bundesliga, Champions League, live football, fixtures, standings, highlights, soccer news',
            heading: 'Live scores across every sport',
            blurb: 'Live scores, fixtures, results and standings for football, basketball, tennis, baseball, ice hockey, rugby and Formula 1 on ScoreHub.'
        },
        {
            sport: 'worldwide', slug: 'worldwide', name: 'Worldwide', icon: '🌐', covered: true,
            title: 'Worldwide Live Scores — 200+ Football Competitions | ScoreHub',
            description: 'Live scores from football competitions around the world: top European leagues, African, Asian and American leagues, cups and internationals. Fixtures, results and standings on ScoreHub.',
            keywords: 'worldwide live scores, world football scores, international football, African football, live football worldwide, fixtures, results',
            heading: 'Worldwide live football scores',
            blurb: 'Every football competition ScoreHub covers in one feed: European top flights, African, Asian and American leagues, domestic cups and international tournaments.'
        },
        {
            sport: 'football', slug: 'football', name: 'Football', icon: '⚽', covered: true,
            title: 'Live Football Scores, Fixtures & Results | ScoreHub',
            description: 'Live football (soccer) scores from 120+ leagues: Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, Champions League, Kenyan Premier League and more. Fixtures, results, tables and top scorers.',
            keywords: 'live football scores, soccer scores, Premier League, LaLiga, Serie A, Bundesliga, Champions League, football fixtures, football results, league tables',
            heading: 'Live football scores, fixtures and results',
            blurb: 'Live football scores, fixtures, results, league tables and top scorers from the Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, the Champions League, the Kenyan Premier League and over a hundred more competitions.'
        },
        {
            sport: 'basketball', slug: 'basketball', name: 'Basketball', icon: '🏀', covered: true,
            title: 'Live Basketball Scores — NBA, WNBA, EuroLeague & NCAA | ScoreHub',
            description: 'Live basketball scores, schedules and results: NBA, WNBA, EuroLeague, NBL, G League and NCAA men’s and women’s college basketball. Box scores and standings on ScoreHub.',
            keywords: 'live basketball scores, NBA scores, WNBA scores, EuroLeague, NCAA basketball, basketball fixtures, basketball results, NBA standings',
            heading: 'Live basketball scores and results',
            blurb: 'Live basketball scores, schedules, box scores and standings for the NBA, WNBA, EuroLeague, NBL, the NBA G League and NCAA men’s and women’s college basketball.'
        },
        {
            sport: 'tennis', slug: 'tennis', name: 'Tennis', icon: '🎾', covered: true,
            title: 'Live Tennis Scores — ATP & WTA Tour Results | ScoreHub',
            description: 'Live tennis scores and results from the ATP and WTA tours, including the Grand Slams. Set-by-set scores, draws and upcoming matches on ScoreHub.',
            keywords: 'live tennis scores, ATP scores, WTA scores, tennis results, Grand Slam, tennis schedule, tennis live',
            heading: 'Live tennis scores and results',
            blurb: 'Live tennis scores, set-by-set results and upcoming matches from the ATP and WTA tours and the Grand Slams.'
        },
        {
            sport: 'baseball', slug: 'baseball', name: 'Baseball', icon: '⚾', covered: true,
            title: 'Live Baseball Scores — MLB, NCAA & World Baseball Classic | ScoreHub',
            description: 'Live baseball scores, schedules and results: MLB, NCAA college baseball and softball, World Baseball Classic, Caribbean Series and winter leagues on ScoreHub.',
            keywords: 'live baseball scores, MLB scores, college baseball, college softball, World Baseball Classic, baseball results, MLB standings',
            heading: 'Live baseball scores and results',
            blurb: 'Live baseball scores, innings-by-innings results and standings for MLB, NCAA college baseball and softball, the World Baseball Classic, the Caribbean Series and the winter leagues.'
        },
        {
            sport: 'icehockey', slug: 'ice-hockey', name: 'Ice Hockey', icon: '🏒', covered: true,
            title: 'Live Ice Hockey Scores — NHL, NCAA & Olympics | ScoreHub',
            description: 'Live ice hockey scores, schedules and results: NHL, NCAA men’s and women’s college hockey, the World Cup of Hockey and the Olympic tournaments on ScoreHub.',
            keywords: 'live hockey scores, NHL scores, ice hockey results, college hockey, Olympic hockey, NHL standings, hockey schedule',
            heading: 'Live ice hockey scores and results',
            blurb: 'Live ice hockey scores, schedules, period-by-period results and standings for the NHL, NCAA college hockey, the World Cup of Hockey and the Olympic tournaments.'
        },
        {
            sport: 'rugby', slug: 'rugby', name: 'Rugby', icon: '🏉', covered: true,
            title: 'Live Rugby Scores — Six Nations, Premiership, URC & Super Rugby | ScoreHub',
            description: 'Live rugby union scores and fixtures: Six Nations, The Rugby Championship, Rugby World Cup, Premiership, United Rugby Championship, Top 14, Super Rugby Pacific and European cups.',
            keywords: 'live rugby scores, Six Nations, Rugby Championship, Rugby World Cup, Premiership Rugby, United Rugby Championship, Top 14, Super Rugby, rugby fixtures',
            heading: 'Live rugby scores and fixtures',
            blurb: 'Live rugby union scores, fixtures and results for the Six Nations, The Rugby Championship, the Rugby World Cup, Premiership Rugby, the United Rugby Championship, the Top 14, Super Rugby Pacific, Major League Rugby and the European cups.'
        },
        {
            sport: 'esports', slug: 'esports', name: 'Esports', icon: '🎮', covered: false,
            title: 'Live Esports Scores | ScoreHub',
            description: 'Esports live scores and results on ScoreHub. Coverage for esports is not available yet — football, basketball, tennis and more are live now.',
            keywords: 'esports scores, live esports, esports results',
            heading: 'Esports live scores',
            blurb: 'Esports coverage is not available on ScoreHub yet. Live football, basketball, tennis, baseball, ice hockey, rugby and Formula 1 are covered today.'
        },
        {
            sport: 'cricket', slug: 'cricket', name: 'Cricket', icon: '🏏', covered: false,
            title: 'Live Cricket Scores | ScoreHub',
            description: 'Cricket live scores and results on ScoreHub. Coverage for cricket is not available yet — football, basketball, tennis and more are live now.',
            keywords: 'cricket scores, live cricket, cricket results, IPL, Test cricket',
            heading: 'Cricket live scores',
            blurb: 'Cricket coverage is not available on ScoreHub yet. Live football, basketball, tennis, baseball, ice hockey, rugby and Formula 1 are covered today.'
        },
        {
            sport: 'volleyball', slug: 'volleyball', name: 'Volleyball', icon: '🏐', covered: false,
            title: 'Live Volleyball Scores | ScoreHub',
            description: 'Volleyball live scores and results on ScoreHub. Coverage for volleyball is not available yet — football, basketball, tennis and more are live now.',
            keywords: 'volleyball scores, live volleyball, volleyball results',
            heading: 'Volleyball live scores',
            blurb: 'Volleyball coverage is not available on ScoreHub yet. Live football, basketball, tennis, baseball, ice hockey, rugby and Formula 1 are covered today.'
        },
        {
            sport: 'handball', slug: 'handball', name: 'Handball', icon: '🤾', covered: false,
            title: 'Live Handball Scores | ScoreHub',
            description: 'Handball live scores and results on ScoreHub. Coverage for handball is not available yet — football, basketball, tennis and more are live now.',
            keywords: 'handball scores, live handball, handball results',
            heading: 'Handball live scores',
            blurb: 'Handball coverage is not available on ScoreHub yet. Live football, basketball, tennis, baseball, ice hockey, rugby and Formula 1 are covered today.'
        },
        {
            sport: 'mma', slug: 'mma', name: 'MMA', icon: '🥊', covered: false,
            title: 'Live MMA Results | ScoreHub',
            description: 'MMA live results and fight cards on ScoreHub. Coverage for MMA is not available yet — football, basketball, tennis and more are live now.',
            keywords: 'MMA results, UFC results, live MMA, fight results',
            heading: 'MMA live results',
            blurb: 'MMA coverage is not available on ScoreHub yet. Live football, basketball, tennis, baseball, ice hockey, rugby and Formula 1 are covered today.'
        },
        {
            sport: 'f1', slug: 'formula-1', name: 'Formula 1', icon: '🏎️', covered: true,
            title: 'Formula 1 — Race Schedule, Results & Driver Standings | ScoreHub',
            description: 'Formula 1 race calendar, latest race results and the current drivers’ championship standings, updated from the Jolpica F1 API on ScoreHub.',
            keywords: 'Formula 1, F1 results, F1 standings, F1 schedule, drivers championship, F1 race calendar, Grand Prix',
            heading: 'Formula 1 schedule, results and standings',
            blurb: 'The Formula 1 race calendar, the latest Grand Prix results and the current drivers’ championship standings.'
        }
    ];

    var bySport = {};
    var bySlug = {};
    PAGES.forEach(function (p) { bySport[p.sport] = p; bySlug[p.slug] = p; });

    function pathFor(sport) {
        var p = bySport[sport];
        return p && p.slug ? '/' + p.slug + '/' : '/';
    }

    function urlFor(sport) { return ORIGIN + pathFor(sport); }

    // '/basketball/' (or '/basketball', '/basketball/index.html') → 'basketball'.
    // Anything else — '/', '/index.html', '/news.html' — is the home page → 'all'.
    function sportForPath(pathname) {
        var m = /^\/([a-z0-9-]+)(?:\/(?:index\.html)?)?$/.exec(String(pathname || ''));
        var p = m ? bySlug[m[1]] : null;
        return p && p.slug ? p.sport : 'all';
    }

    /* ---------------- browser-only behaviour ---------------- */
    var doc = typeof document !== 'undefined' ? document : null;

    function meta(selector, create) {
        var el = doc.head.querySelector(selector);
        if (!el && create) {
            el = doc.createElement(create.tag);
            Object.keys(create.attrs).forEach(function (k) { el.setAttribute(k, create.attrs[k]); });
            doc.head.appendChild(el);
        }
        return el;
    }
    function setMeta(attr, key, value) {
        var el = meta('meta[' + attr + '="' + key + '"]', { tag: 'meta', attrs: (function () { var o = {}; o[attr] = key; return o; })() });
        el.setAttribute('content', value);
    }

    // Re-point the document head and the hidden heading at `sport` — used when a
    // tab is clicked (or Back/Forward is pressed) so the tab title, share preview
    // and canonical always describe the screen that is showing.
    function applyHead(sport) {
        var p = bySport[sport];
        if (!doc || !p) return;
        var url = urlFor(sport);
        doc.title = p.title;
        setMeta('name', 'description', p.description);
        setMeta('name', 'keywords', p.keywords);
        setMeta('name', 'robots', p.covered ? 'index, follow, max-image-preview:large' : 'noindex, follow');
        setMeta('property', 'og:title', p.title);
        setMeta('property', 'og:description', p.description);
        setMeta('property', 'og:url', url);
        setMeta('name', 'twitter:title', p.title);
        setMeta('name', 'twitter:description', p.description);
        var canon = meta('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' } });
        canon.setAttribute('href', url);
        var h = doc.getElementById('sport-page-heading');
        if (h) h.textContent = p.heading;
        var b = doc.getElementById('sport-page-blurb');
        if (b) b.textContent = p.blurb;
    }

    // Move the address bar to the sport's own URL without reloading.
    function navigate(sport, mode) {
        if (typeof history === 'undefined' || !history.pushState) return;
        var target = pathFor(sport);
        if (location.pathname === target) { applyHead(sport); return; }
        // A page opened as /index.html is the home page — keep it there.
        if (sport === 'all' && /\/index\.html$/.test(location.pathname)) { applyHead(sport); return; }
        try {
            history[mode === 'replace' ? 'replaceState' : 'pushState']({ sport: sport }, '', target + location.search + location.hash);
        } catch (e) { return; }
        applyHead(sport);
    }

    // These pages carry <base href="/"> so their relative links (news.html,
    // match.html?…) resolve from the site root at any depth. The one thing a
    // <base> changes is bare "#fragment" links, which would then jump to the
    // home page instead of scrolling this one — so those are handled here.
    function handleFragmentLinks() {
        if (!doc || !doc.querySelector('base[href]')) return;
        doc.addEventListener('click', function (e) {
            if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
            if (!a) return;
            e.preventDefault();
            var frag = a.getAttribute('href').slice(1);
            if (frag) location.hash = frag;
        });
    }
    handleFragmentLinks();

    return {
        ORIGIN: ORIGIN,
        pages: PAGES,
        pageFor: function (sport) { return bySport[sport] || null; },
        pathFor: pathFor,
        urlFor: urlFor,
        sportForPath: sportForPath,
        applyHead: applyHead,
        navigate: navigate
    };
});

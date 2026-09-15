/* ScoreHub i18n — UI chrome in English (default) and Kiswahili.
   Article narratives stay English in v1; this dict covers chrome + generated labels.
   Usage: t("key") for plain strings, tf("key", {name: val}) for "{name}" templates. */
var LANG = (function () {
    try { return localStorage.getItem("scorehub-lang") || "en"; } catch (e) { return "en"; }
})();
if (LANG !== "sw") LANG = "en";

function appLocale() { return LANG === "sw" ? "sw" : undefined; }

const STR = {
en: {
    "nav.home": "Home", "nav.live": "Live Scores", "nav.fixtures": "Fixtures", "nav.leagues": "Leagues",
    "nav.news": "News", "nav.teams": "Teams", "nav.stats": "Stats", "nav.more": "More",
    "nav.transfers": "Transfers", "nav.predictions": "Predictions", "nav.shop": "Shop",
    "nav.standings": "Standings", "nav.previews": "Previews", "nav.highlights": "Highlights", "nav.openmenu": "Open menu",
    "search.ph": "Search teams, matches, leagues...", "search.none": "No results found",
    "api.live": "Live API Mode", "api.sim": "Simulation Mode",
    "api.buttontitle": "Toggle Live API / Simulated Mode",
    "theme.title": "Toggle Theme", "notif.title": "Notifications", "favs.title": "View Favorites",
    "auth.login": "Login", "auth.title": "Login to ScoreHub",
    "auth.sub": "Follow your favorite teams, pin live matches, and receive instant score alerts!",
    "auth.email": "Email Address", "auth.pass": "Password", "auth.signin": "Sign In",
    "auth.noacct": "Don't have an account?", "auth.signup": "Sign Up",
    "lang.toggle": "Switch to Kiswahili", "pwa.install": "Install ScoreHub app",
    "pwa.installed": "ScoreHub is already installed on your device!",
    "pwa.guide.ios": "To install on iOS: Tap Share in Safari, then select 'Add to Home Screen' ➕",
    "pwa.guide.generic": "To install ScoreHub: Open browser menu (⋮) and tap 'Install app' or 'Add to Home screen'",
    "pwa.success": "ScoreHub installed successfully!",
    "upd.line": "Updated {time} · {n} events{day} · via {tp}",
    "net.offline": "You're offline — showing last available scores.",
    "net.failed": "Live update failed — showing last available scores.",
    "net.back": "Back online — refreshing live scores…",
    "notif.apifail": "Live data unreachable (network/CDN block). Switched to Simulation Mode.",
    "notif.dateneed": "Date browsing needs Live API Mode — tap the mode toggle up top",
    "notif.copied": "Match link copied to clipboard",
    "notif.kickoffsim": "Kickoff time unavailable in Simulation Mode — switch to Live API Mode",
    "notif.kickoffna": "Kickoff time unavailable for this match",
    "notif.ics": "Calendar file downloaded",
    "notif.login": "Successfully logged in as administrator!",
    "fav.added": "Added {h} vs {a} to Favorites",
    "scores.live": "Live Scores", "scores.none": "No matches found matching the criteria.",
    "filter.today": "Today", "filter.favs": "Favorites",
    "common.all": "All", "common.back": "← Back to Scores", "common.retry": "Retry",
    "common.viewall": "View All", "common.readmore": "Continue reading →",
    "table.viewfull": "View Full Table →", "table.team": "Team", "table.loading": "Loading table…",
    "table.err": "Couldn't load this table. Check your connection and try again.",
    "scorers.title": "Top Scorers", "scorers.goals": "Goals", "scorers.assists": "Assists",
    "leagues.title": "Popular Leagues", "league.ucl": "Champions League",
    "teams.18": "18 Teams", "teams.20": "20 Teams", "teams.32": "32 Teams",
    "stats.title": "Match Statistics", "stats.possession": "Possession", "stats.shots": "Shots",
    "stats.sot": "Shots on Target", "stats.corners": "Corners", "stats.fouls": "Fouls",
    "stats.yellow": "Yellow Cards", "news.title": "Latest News", "date.today": "Today",
    "highlights.title": "Latest Highlights", "highlights.sub": "Video highlights from worldwide leagues",
    "highlights.watch": "Watch Highlights", "card.highlights": "Highlights",
    "time.now": "Just Now", "time.12": "12 mins ago",
    "f1.next": "Next Race · Round {n}", "f1.last": "Last Race · {n}", "f1.drivers": "Driver Standings",
    "f1.days": "Days", "f1.hrs": "Hrs", "f1.min": "Min", "f1.unknown": "Unknown",
    "f1.demo": "Formula 1 data is live-only in this demo.",
    "f1.unavail": "Formula 1 data is unavailable right now.",
    "f1.updated": "Updated {time} · data: Jolpica F1 API",
    "mc.commentary": "Commentary", "mc.timeline": "Timeline", "mc.lineups": "Lineups",
        "mc.live": "Live Commentary",
    "mc.livefeed": "Live commentary will appear here once the feed updates…",
    "mc.espn": "Play-by-play commentary is available for this fixture on ESPN.",
    "mc.nolineups": "Lineups aren't published for this match yet — check back closer to kickoff.",
    "mc.unavail": "Unavailable",
    "mc.noevents": "No key events yet — goals, cards and substitutions will appear here.",
    "action.watch": "Watch Live", "action.centre": "Match Centre", "action.share": "Share",
    "sh.title": "Share this match", "cal.title": "Add to calendar (.ics)",
    "story.tag": "⭐ Story of the Week", "story.previewbtn": "📰 Preview", "story.reportbtn": "📝 Report",
    "story.goalsthriller": "{n}-goal thriller", "story.shared": "points shared in a thriller",
    "story.death": "drama at the death ({m}')", "story.comeback": "stunning comeback",
    "story.hattrick": "hat-trick", "story.braceword": "brace",
    "story.winword": "win", "story.drawword": "draw",
    "story.vs": "{a} vs {b} — {h} host {t}", "story.upcoming": "Upcoming: {h} vs {a}",
    "footer.quick": "Quick Links", "footer.leagues": "Leagues", "footer.support": "Support",
    "footer.about": "About Us", "footer.contact": "Contact Us", "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use", "footer.faq": "FAQ",
    "footer.rights": "© 2026 ScoreHub. All Rights Reserved. · Sports data: ESPN, Jolpica F1.",
    "footer.data": "© 2026 ScoreHub · Sports data: ESPN, Jolpica F1.",
    "footer.dl": "Download Our App",
    "footer.dltxt": "Get the latest scores and updates on your mobile device.",
    "brand.tag": "Every Score. Every Moment.",
    "brand.desc": "Your ultimate destination for live scores, sports news, stats and much more. Follow your favorite clubs anywhere, anytime.",
    "h1.about": "About ScoreHub", "h1.pred": "Predictions", "h1.hub": "Previews & Reports",
    "h1.privacy": "Privacy Policy", "h1.shop": "Kit Finder", "h1.standings": "Standings",
    "h1.terms": "Terms of Use", "h1.transfers": "Transfer Centre",
    "news.hubtitle": "Football News",
    "news.hubsub": "Breaking news, tactical insights, and match stories across top leagues worldwide.",
    "highlights.hubtitle": "Match Highlights",
    "highlights.hubsub": "Watch the best goals, extended match highlights and post-game reviews from worldwide competitions.",
    "lede.about": "Your front row seat to every match.",
    "lede.pred": "Pick scores on upcoming fixtures. Exact score = 3 pts · correct outcome = 1 pt. Picks lock at kickoff and settle automatically. <a href=\"previews.html\" style=\"color:var(--primary);\">Browse all previews →</a>",
    "lede.hub": "Every big match, previewed before and reported after — written by ScoreHub from the data.",
    "lede.updated": "Last updated: September 13, 2026",
    "lede.shop": "Official club stores and trusted retailers, one tap away. ScoreHub doesn't sell anything — you buy direct.",
    "lede.standings": "Complete tables — every team, updated live on matchdays. Data: ESPN.",
    "lede.transfers": "Live transfer headlines, deals and rumours from across Europe.",
    "transfers.window": "🪟 Summer window: closed 1 Sept 2026 · Winter window opens 1 Jan 2027. Free agents can still sign outside the window.",
    "transfers.loading": "Loading transfer news…",
    "transfers.empty": "No {f}transfer stories right now — check back soon.",
    "transfers.source": "Source:", "transfers.untitled": "Untitled",
    "transfers.err": "Couldn't load live transfer news. Check your connection and try again.",
    "hub.big": "⭐ Big matches", "hub.reports": "📝 Latest reports", "hub.more": "📅 More upcoming fixtures",
    "hub.readreport": "Read report →", "hub.readpreview": "Read preview →", "hub.bigmatch": "BIG MATCH",
    "hub.nobig": "No standout ties found — see all fixtures below.",
    "hub.nofin": "No finished matches in this matchweek yet.",
    "hub.nomore": "No further upcoming fixtures.",
    "hub.err": "Couldn't load fixtures. Check your connection and try again.",
    "pred.demo": "⚽ No upcoming fixtures found — showing demo matches so you can try it out.",
    "pred.simulate": "Simulate results", "pred.results": "Your results", "pred.reset": "Reset all",
    "pred.lockedset": "Locked — settling after full time", "pred.lockedko": "Locked — kicked off",
    "pred.saved": "✓ Saved", "pred.tap": "Tap a score to predict",
    "pred.empty": "No upcoming {f}fixtures right now.",
    "pred.nosettled": "No settled predictions yet — come back after kickoff.",
    "pred.loading": "Loading upcoming fixtures…",
    "pred.pts": "⭐ {n} pts", "pred.exact": "🎯 {n} exact", "pred.outcome": "✓ {n} correct outcome",
    "pred.settledn": "· {n} settled", "pred.exactlbl": "★ Exact!", "pred.outcomelbl": "✓ Outcome",
    "pred.miss": "✗ Miss", "pred.yousaid": "you said {h}–{a}",
    "story.mc": "Match centre", "story.related": "Related stories",
    "story.norel": "No related stories right now.", "story.relerr": "Couldn't load related stories.",
    "story.loadingrel": "Loading related stories…",
    "story.src": "Headline, image and summary: ESPN.", "story.full": "Read the full story on ESPN ↗",
    "story.notfound": "Story not found",
    "story.expired": "This story link has expired (open stories from the homepage or Transfer Centre).",
    "story.gohome": "Head back to <a href=\"transfers.html\">Transfer Centre</a> or <a href=\"index.html\">Scores</a> to keep reading.",
    "preview.tag": "Match Preview", "preview.lastfive": "· last five", "preview.says": "ScoreHub says",
    "preview.strong": "Strong", "preview.moderate": "Moderate", "preview.lean": "Lean",
    "preview.nodataword": "No data", "preview.confword": "confidence",
    "preview.close": "Too close to call",
    "preview.nodatareason": "There isn't enough recent form or table data to split these sides — check back closer to kickoff.",
    "preview.win": " win", "preview.draw": "Draw",
    "preview.reason": "{h} have taken {p} points from their last five to {a}'s {q}",
    "preview.higher": "{c} sit higher in the table ({a} vs {b})",
    "preview.formreads": "Form reads {f} for {n}.",
    "preview.def1": "Defensively solid of late, with ", "preview.def2": " clean sheets in their last five.",
    "preview.home": "Home", "preview.away": "Away",
    "preview.cPos": "Position", "preview.cPlayed": "Played", "preview.cGF": "Goals for",
    "preview.cGA": "Goals against", "preview.cForm": "Form points (last 5)",
    "preview.loading": "Crunching form and table data…", "preview.norecent": "No recent results found.",
    "preview.nfh1": "Preview not found",
    "preview.notfound": "Pick a fixture from <a href=\"index.html\">Scores</a> or <a href=\"predictions.html\">Predictions</a> to read its preview.",
    "preview.unh1": "Preview unavailable",
    "preview.unavail": "Couldn't find this fixture — it may have been rescheduled. Try <a href=\"index.html\">Scores</a> for the latest fixtures.",
    "preview.played1": "This match is ", "preview.underway": "underway", "preview.finished": "finished",
    "preview.played2": " — previews cover upcoming fixtures only. Follow it on <a href=\"index.html\">Scores</a>.",
    "preview.cardword": "preview",
    "report.tag": "Match Report", "report.next": "What next",
    "report.loading": "Crunching goals, cards and stats…",
    "report.nfh1": "Report not found",
    "report.notfound": "Pick a finished match from <a href=\"index.html\">Scores</a> or <a href=\"previews.html\">Previews & Reports</a>.",
    "report.unh1": "Report unavailable",
    "report.unavail": "Couldn't find this match. Try <a href=\"index.html\">Scores</a> for the latest results.",
    "report.underway": "This match is underway — the report lands at full time. Follow it on",
    "report.scoreslink": "Scores", "report.notplayed": "This match hasn't been played yet.",
    "report.cardword": "report",
    "share.title": "Share this", "share.card": "📤 Share card", "share.download": "⬇ Download",
    "share.copy": "🔗 Copy link", "share.shared": "Shared ✓", "share.downloaded": "Downloaded ✓",
    "share.dlfailed": "Download failed", "share.copied": "Copied ✓", "share.copyfailed": "Copy failed",
    "shop.ph": "Search clubs… (e.g. Arsenal)", "shop.aria": "Search clubs",
    "shop.official": "Official store ↗"
},
sw: {
    "nav.home": "Nyumbani", "nav.live": "Matokeo Live", "nav.fixtures": "Ratiba", "nav.leagues": "Ligi",
    "nav.news": "Habari", "nav.teams": "Timu", "nav.stats": "Takwimu", "nav.more": "Zaidi",
    "nav.transfers": "Uhamisho", "nav.predictions": "Utabiri", "nav.shop": "Duka",
    "nav.standings": "Msimamo", "nav.previews": "Utangulizi", "nav.highlights": "Vivutio", "nav.openmenu": "Fungua menyu",
    "search.ph": "Tafuta timu, mechi, ligi…", "search.none": "Hakuna matokeo",
    "api.live": "API Live", "api.sim": "Mfumo wa Majaribio",
    "api.buttontitle": "Badilisha API Live / Mfumo wa Majaribio",
    "theme.title": "Badilisha mandhari", "notif.title": "Arifa", "favs.title": "Tazama vipendwa",
    "auth.login": "Ingia", "auth.title": "Ingia ScoreHub",
    "auth.sub": "Fuata timu unazopenda, bandika mechi na upokee arifa za mabao papo hapo!",
    "auth.email": "Barua pepe", "auth.pass": "Nywila", "auth.signin": "Ingia",
    "auth.noacct": "Huna akaunti?", "auth.signup": "Jisajili",
    "lang.toggle": "Badilisha hadi Kiingereza", "pwa.install": "Sakinisha programu ya ScoreHub",
    "pwa.installed": "ScoreHub imesakinishwa tayari kwenye kifaa chako!",
    "pwa.guide.ios": "Kusakinisha kwenye iOS: Bonyeza Shiriki kwenye Safari, kisha chagua 'Ongeza kwenye Skrini ya Kwanza' ➕",
    "pwa.guide.generic": "Kusakinisha ScoreHub: Fungua menyu ya kivinjari (⋮) kisha uchague 'Sakinisha programu'",
    "pwa.success": "ScoreHub imesakinishwa kikamilifu!",
    "upd.line": "Imesasishwa {time} · matukio {n}{day} · kupitia {tp}",
    "net.offline": "Uko nje ya mtandao — tunaonyesha matokeo ya mwisho yaliyopatikana.",
    "net.failed": "Imeshindwa kusasisha — tunaonyesha matokeo ya mwisho.",
    "net.back": "Umerudi mtandaoni — tunapakua matokeo mapya…",
    "notif.apifail": "Data live haipatikani. Tumebadilisha hadi Mfumo wa Majaribio.",
    "notif.dateneed": "Kuvinjari tarehe kunahitaji API Live — gusa kitufe cha hali hapo juu",
    "notif.copied": "Kiungo cha mechi kimenakiliwa",
    "notif.kickoffsim": "Wakati wa kuanza haupo kwenye Mfumo wa Majaribio — badilisha hadi API Live",
    "notif.kickoffna": "Wakati wa kuanza haupo kwa mechi hii",
    "notif.ics": "Faili la kalenda limepakuliwa",
    "notif.login": "Umefanikiwa kuingia kama msimamizi!",
    "fav.added": "Umeongeza {h} vs {a} kwenye Vipendwa",
    "scores.live": "Matokeo Live", "scores.none": "Hakuna mechi zinazolingana na vigezo.",
    "filter.today": "Leo", "filter.favs": "Vipendwa",
    "common.all": "Zote", "common.back": "← Rudi kwenye Matokeo", "common.retry": "Jaribu Tena",
    "common.viewall": "Tazama Zote", "common.readmore": "Endelea kusoma →",
    "table.viewfull": "Tazama Jedwali Kamili →", "table.team": "Timu", "table.loading": "Inapakia jedwali…",
    "table.err": "Imeshindwa kupakia jedwali. Angalia muunganisho wako ujaribu tena.",
    "scorers.title": "Wafungaji Bora", "scorers.goals": "Magoli", "scorers.assists": "Asisti",
    "leagues.title": "Ligi Maarufu", "league.ucl": "Ligi ya Mabingwa",
    "teams.18": "Timu 18", "teams.20": "Timu 20", "teams.32": "Timu 32",
    "stats.title": "Takwimu za Mechi", "stats.possession": "Umiliki", "stats.shots": "Mashuti",
    "stats.sot": "Mashuti ya Lengo", "stats.corners": "Kona", "stats.fouls": "Faulo",
    "stats.yellow": "Kadi za Njano", "news.title": "Habari Mpya", "date.today": "Leo",
    "highlights.title": "Vivutio vya Hivi Punde", "highlights.sub": "Vivutio vya video kutoka ligi mbalimbali duniani",
    "highlights.watch": "Tazama Vivutio", "card.highlights": "Vivutio",
    "time.now": "Sasa hivi", "time.12": "dak 12 zilizopita",
    "f1.next": "Mbio Zijazo · Raundi {n}", "f1.last": "Mbio Zilizopita · {n}",
    "f1.drivers": "Msimamo wa Madereva",
    "f1.days": "Siku", "f1.hrs": "Saa", "f1.min": "Dak", "f1.unknown": "Haijulikani",
    "f1.demo": "Data ya Formula 1 ni ya API Live pekee.",
    "f1.unavail": "Data ya Formula 1 haipatikani sasa.",
    "f1.updated": "Imesasishwa {time} · data: Jolpica F1 API",
    "mc.commentary": "Uchambuzi", "mc.timeline": "Matukio", "mc.lineups": "Vikosi",
        "mc.live": "Uchambuzi Live",
    "mc.livefeed": "Uchambuzi live utaonekana hapa mara utakaposasishwa…",
    "mc.espn": "Uchambuzi wa hatua kwa hatua wa mechi hii unapatikana ESPN.",
    "mc.nolineups": "Vikosi havijatolewa kwa mechi hii — rudi karibu na mechi.",
    "mc.unavail": "Haipatikani",
    "mc.noevents": "Hakuna matukio muhimu bado — mabao, kadi na mabadiliko yataonekana hapa.",
    "action.watch": "Tazama Live", "action.centre": "Kituo cha Mechi", "action.share": "Shiriki",
    "sh.title": "Shiriki mechi hii", "cal.title": "Weka kwenye kalenda (.ics)",
    "story.tag": "⭐ Stori ya Wiki", "story.previewbtn": "📰 Utangulizi", "story.reportbtn": "📝 Ripoti",
    "story.goalsthriller": "thrilia ya mabao {n}", "story.shared": "alama zimeshirikiwa kwenye thrilia",
    "story.death": "drama dakika za mwisho ({m}')", "story.comeback": "marejeo ya kishindo",
    "story.hattrick": "hat-trick", "story.braceword": "mabao mawili",
    "story.winword": "ushindi", "story.drawword": "sare",
    "story.vs": "{a} vs {b} — {h} wakaribisha {t}", "story.upcoming": "Zijazo: {h} vs {a}",
    "footer.quick": "Viungo vya Haraka", "footer.leagues": "Ligi", "footer.support": "Msaada",
    "footer.about": "Kutuhusu", "footer.contact": "Wasiliana Nasi", "footer.privacy": "Sera ya Faragha",
    "footer.terms": "Masharti ya Matumizi", "footer.faq": "Maswali",
    "footer.rights": "© 2026 ScoreHub. Haki Zote Zimehifadhiwa. · Takwimu za michezo: ESPN, Jolpica F1.",
    "footer.data": "© 2026 ScoreHub · Takwimu za michezo: ESPN, Jolpica F1.",
    "footer.dl": "Pakua Programu Yetu",
    "footer.dltxt": "Pata matokeo na taarifa mpya kwenye simu yako.",
    "brand.tag": "Kila Bao. Kila Wakati.",
    "brand.desc": "Mahali pako pa matokeo live, habari za michezo, takwimu na mengi zaidi. Fuata klabu unazopenda popote, wakati wowote.",
    "h1.about": "Kuhusu ScoreHub", "h1.pred": "Utabiri", "h1.hub": "Utangulizi na Ripoti",
    "h1.privacy": "Sera ya Faragha", "h1.shop": "Kitafuta Jezi", "h1.standings": "Msimamo",
    "h1.terms": "Masharti ya Matumizi", "h1.transfers": "Kituo cha Uhamisho",
    "news.hubtitle": "Habari za Soka",
    "news.hubsub": "Habari zinazochipuka, mbinu na ripoti za mechi katika ligi bora duniani.",
    "highlights.hubtitle": "Vivutio vya Mechi",
    "highlights.hubsub": "Tazama magoli bora, vivutio na muhtasari wa mechi za ligi mbalimbali duniani.",
    "lede.about": "Kiti chako cha mbele kwa kila mechi.",
    "lede.pred": "Chagua matokeo ya mechi zijazo. Bao sahihi = alama 3 · matokeo sahihi = alama 1. Utabiri hufungwa mechi inapoanza na kuhesabiwa kiotomatiki. <a href=\"previews.html\" style=\"color:var(--primary);\">Tazama utangulizi wote →</a>",
    "lede.hub": "Kila mechi kubwa, imetangulizwa kabla na kuripotiwa baada — imeandikwa na ScoreHub kutokana na data.",
    "lede.updated": "Ilisasishwa: Septemba 13, 2026",
    "lede.shop": "Maduka rasmi ya klabu na wauzaji wanaoaminika, kwa mguso mmoja. ScoreHub haiuzi chochote — unanunua moja kwa moja.",
    "lede.standings": "Majedwali kamili — kila timu, yanasasishwa live siku za mechi. Data: ESPN.",
    "lede.transfers": "Habari za uhamisho, dili na uvumi moja kwa moja kutoka Ulaya.",
    "transfers.window": "🪟 Dirisha la kiangazi: limefungwa 1 Sept 2026 · Dirisha la baridi linafunguliwa 1 Jan 2027. Wachezaji huru bado wanaweza kusajiliwa.",
    "transfers.loading": "Inapakia habari za uhamisho…",
    "transfers.empty": "Hakuna habari za uhamisho{f} sasa — rudi baadaye.",
    "transfers.source": "Chanzo:", "transfers.untitled": "Haina kichwa",
    "transfers.err": "Imeshindwa kupakia habari za uhamisho. Angalia muunganisho wako ujaribu tena.",
    "hub.big": "⭐ Mechi kubwa", "hub.reports": "📝 Ripoti za hivi punde", "hub.more": "📅 Ratiba zaidi zijazo",
    "hub.readreport": "Soma ripoti →", "hub.readpreview": "Soma utangulizi →", "hub.bigmatch": "MECHI KUBWA",
    "hub.nobig": "Hakuna mechi zinazojitokeza — tazama ratiba zote hapa chini.",
    "hub.nofin": "Hakuna mechi zilizomalizika wiki hii bado.",
    "hub.nomore": "Hakuna ratiba zaidi zijazo.",
    "hub.err": "Imeshindwa kupakia ratiba. Angalia muunganisho wako ujaribu tena.",
    "pred.demo": "⚽ Hakuna ratiba zijazo — tunaonyesha mechi za majaribio ili ujaribu.",
    "pred.simulate": "Igiza matokeo", "pred.results": "Matokeo yako", "pred.reset": "Futa zote",
    "pred.lockedset": "Imefungwa — itahesabiwa baada ya mechi", "pred.lockedko": "Imefungwa — mechi imeanza",
    "pred.saved": "✓ Imehifadhiwa", "pred.tap": "Gusa bao kutabiri",
    "pred.empty": "Hakuna ratiba{f} hivi sasa.",
    "pred.nosettled": "Hakuna utabiri uliohesabiwa — rudi baada ya mechi kuanza.",
    "pred.loading": "Inapakia ratiba zijazo…",
    "pred.pts": "⭐ alama {n}", "pred.exact": "🎯 {n} sahihi", "pred.outcome": "✓ matokeo sahihi {n}",
    "pred.settledn": "· {n} zilizohesabiwa", "pred.exactlbl": "★ Sahihi!", "pred.outcomelbl": "✓ Matokeo",
    "pred.miss": "✗ Umekosa", "pred.yousaid": "ulisema {h}–{a}",
    "story.mc": "Kitovu cha mechi", "story.related": "Habari zinazohusiana",
    "story.norel": "Hakuna habari zinazohusiana sasa.", "story.relerr": "Imeshindwa kupakia habari zinazohusiana.",
    "story.loadingrel": "Inapakia habari zinazohusiana…",
    "story.src": "Kichwa, picha na muhtasari: ESPN.", "story.full": "Soma habari kamili ESPN ↗",
    "story.notfound": "Habari haikupatikana",
    "story.expired": "Kiungo hiki kimepitwa na wakati (fungua habari kutoka ukurasa mkuu au Kituo cha Uhamisho).",
    "story.gohome": "Rudi <a href=\"transfers.html\">Kituo cha Uhamisho</a> au <a href=\"index.html\">Matokeo</a> ili uendelee kusoma.",
    "preview.tag": "Utangulizi wa Mechi", "preview.lastfive": "· tano zilizopita", "preview.says": "ScoreHub yasema",
    "preview.strong": "Kubwa", "preview.moderate": "Wastani", "preview.lean": "Kidogo",
    "preview.nodataword": "Hakuna data", "preview.confword": "uhakika",
    "preview.close": "Ni ngumu kutabiri",
    "preview.nodatareason": "Hakuna data ya kutosha ya fomu au msimamo kutenganisha timu hizi — rudi karibu na mechi.",
    "preview.win": " atashinda", "preview.draw": "Sare",
    "preview.reason": "{h} wamechukua alama {p} katika tano zilizopita, dhidi ya {q} za {a}",
    "preview.higher": "{c} wako juu zaidi ({a} vs {b})",
    "preview.formreads": "Fomu: {f} kwa {n}.",
    "preview.def1": "Imara kiulinzi hivi karibuni, na ", "preview.def2": " clean sheets katika tano zilizopita.",
    "preview.home": "Nyumbani", "preview.away": "Ugenini",
    "preview.cPos": "Nafasi", "preview.cPlayed": "Zilizochezwa", "preview.cGF": "Yaliyofungwa",
    "preview.cGA": "Yaliyoruhusiwa", "preview.cForm": "Alama za fomu (5)",
    "preview.loading": "Tunachambua fomu na msimamo…", "preview.norecent": "Hakuna matokeo ya hivi punde.",
    "preview.nfh1": "Utangulizi haukupatikana",
    "preview.notfound": "Chagua mechi kutoka <a href=\"index.html\">Matokeo</a> au <a href=\"predictions.html\">Utabiri</a> ili usome utangulizi wake.",
    "preview.unh1": "Utangulizi haupatikani",
    "preview.unavail": "Haikupata mechi hii — huenda imepangwa upya. Jaribu <a href=\"index.html\">Matokeo</a> kwa ratiba za hivi punde.",
    "preview.played1": "Mechi hii ", "preview.underway": "inaendelea", "preview.finished": "imemalizika",
    "preview.played2": " — utangulizi ni wa mechi zijazo pekee. Ifuatilie kwenye <a href=\"index.html\">Matokeo</a>.",
    "preview.cardword": "utangulizi",
    "report.tag": "Ripoti ya Mechi", "report.next": "Nini kinafuata",
    "report.loading": "Tunachambua mabao, kadi na takwimu…",
    "report.nfh1": "Ripoti haikupatikana",
    "report.notfound": "Chagua mechi iliyomalizika kutoka <a href=\"index.html\">Matokeo</a> au <a href=\"previews.html\">Utangulizi na Ripoti</a>.",
    "report.unh1": "Ripoti haipatikani",
    "report.unavail": "Haikupata mechi hii. Jaribu <a href=\"index.html\">Matokeo</a> kwa matokeo ya hivi punde.",
    "report.underway": "Mechi hii inaendelea — ripoti itatoka baada ya filimbi. Ifuatilie kwenye",
    "report.scoreslink": "Matokeo", "report.notplayed": "Mechi hii haijachezwa.",
    "report.cardword": "ripoti",
    "share.title": "Shiriki hii", "share.card": "📤 Shiriki kadi", "share.download": "⬇ Pakua",
    "share.copy": "🔗 Nakili kiungo", "share.shared": "Imeshirikiwa ✓", "share.downloaded": "Imepakuliwa ✓",
    "share.dlfailed": "Imeshindwa kupakua", "share.copied": "Imenakiliwa ✓", "share.copyfailed": "Imeshindwa kunakili",
    "shop.ph": "Tafuta klabu… (k.m. Arsenal)", "shop.aria": "Tafuta klabu",
    "shop.official": "Duka rasmi ↗"
}};

function t(key) {
    const d = STR[LANG] || STR.en;
    if (d[key] !== undefined) return d[key];
    if (STR.en[key] !== undefined) return STR.en[key];
    return key;
}

function tf(key, map) {
    let s = t(key);
    if (map) Object.keys(map).forEach((k) => { s = s.split("{" + k + "}").join(String(map[k])); });
    return s;
}

/* Selector-driven chrome translation (no per-page HTML edits needed).
   modes: text (default) | firstText | lastText | html. `text` maps EN source → key. */
const I18N_SEL = [
    { sel: "#nav-home", key: "nav.home" }, { sel: "#nav-live", key: "nav.live" },
    { sel: "#nav-fixtures", key: "nav.fixtures" }, { sel: "#nav-leagues", key: "nav.leagues" },
    { sel: "#nav-news", key: "nav.news" }, { sel: "#nav-teams", key: "nav.teams" },
    { sel: "#nav-stats", key: "nav.stats" },
    { sel: "#api-mode-text", text: { "Simulation Mode": "api.sim", "Live API Mode": "api.live" } },
    { sel: "#login-btn", key: "auth.login" },
    { sel: ".dropdown-header", key: "notif.title" },
    { sel: ".dropdown-menu a[href=\"transfers.html\"]", key: "nav.transfers" },
    { sel: ".dropdown-menu a[href=\"predictions.html\"]", key: "nav.predictions" },
    { sel: ".dropdown-menu a[href=\"shop.html\"]", key: "nav.shop" },
    { sel: ".dropdown-menu a[href=\"standings.html\"]", key: "nav.standings" },
    { sel: ".dropdown-menu a[href=\"previews.html\"]", key: "nav.previews" },
    { sel: ".dropdown-menu a[href=\"news.html\"]", key: "nav.news" },
    { sel: ".dropdown-menu a[href=\"highlights.html\"]", key: "nav.highlights" },
    { sel: ".footer-links-col a[href=\"index.html\"]", key: "nav.home" },
    { sel: ".footer-links-col a[href=\"news.html\"]", key: "nav.news" },
    { sel: ".footer-links-col a[href=\"highlights.html\"]", key: "nav.highlights" },
    { sel: ".footer-links-col a[href=\"predictions.html\"]", key: "nav.predictions" },
    { sel: ".footer-links-col a[href=\"transfers.html\"]", key: "nav.transfers" },
    { sel: ".footer-links-col a[href=\"shop.html\"]", key: "nav.shop" },
    { sel: ".footer-links-col a[href=\"index.html#live\"]", key: "nav.live" },
    { sel: ".footer-links-col a[href=\"index.html#fixtures\"]", key: "nav.fixtures" },
    { sel: ".footer-links-col a[href=\"index.html#news\"]", key: "nav.news" },
    { sel: ".footer-links-col a[href=\"index.html#teams\"]", key: "nav.teams" },
    { sel: ".footer-links-col a[href=\"standings.html\"]", key: "nav.standings" },
    { sel: ".footer-links-col a[href=\"previews.html\"]", key: "nav.previews" },
    { sel: ".footer-links-col a[href=\"index.html#league-UCL\"]", key: "league.ucl" },
    { sel: ".footer-links-col a[href=\"about.html\"]", key: "footer.about" },
    { sel: ".footer-links-col a[href=\"about.html#contact\"]", key: "footer.contact" },
    { sel: ".footer-links-col a[href=\"privacy.html\"]", key: "footer.privacy" },
    { sel: ".footer-links-col a[href=\"terms.html\"]", key: "footer.terms" },
    { sel: ".footer-links-col a[href=\"about.html#faq\"]", key: "footer.faq" },
    { sel: ".footer-links-col h4, .footer-download-col h4", text: {
        "Quick Links": "footer.quick", "Leagues": "footer.leagues", "Support": "footer.support",
        "Download Our App": "footer.dl" } },
    { sel: ".footer-bottom p", text: {
        "© 2026 ScoreHub. All Rights Reserved. · Sports data: ESPN, Jolpica F1.": "footer.rights" } },
    { sel: ".tagline", key: "brand.tag" }, { sel: ".brand-desc", key: "brand.desc" },
    { sel: ".footer-download-info p", key: "footer.dltxt" },
    { sel: ".legal-footer a[href=\"index.html\"]", key: "nav.home" },
    { sel: ".legal-footer a[href=\"news.html\"]", key: "nav.news" },
    { sel: ".legal-footer a[href=\"highlights.html\"]", key: "nav.highlights" },
    { sel: ".legal-footer a[href=\"transfers.html\"]", key: "nav.transfers" },
    { sel: ".legal-footer a[href=\"predictions.html\"]", key: "nav.predictions" },
    { sel: ".legal-footer a[href=\"shop.html\"]", key: "nav.shop" },
    { sel: ".legal-footer a[href=\"standings.html\"]", key: "nav.standings" },
    { sel: ".legal-footer a[href=\"previews.html\"]", key: "nav.previews" },
    { sel: ".legal-footer a[href=\"about.html\"]", key: "footer.about" },
    { sel: ".legal-footer a[href=\"privacy.html\"]", key: "footer.privacy" },
    { sel: ".legal-footer a[href=\"terms.html\"]", key: "footer.terms" },
    { sel: ".legal-footer span", text: {
        "© 2026 ScoreHub · Sports data: ESPN, Jolpica F1.": "footer.data" } },
    { sel: "a.btn[href=\"index.html\"]", key: "common.back" },
    { sel: ".legal-card h1", text: {
        "About ScoreHub": "h1.about", "Predictions": "h1.pred", "Previews & Reports": "h1.hub",
        "Privacy Policy": "h1.privacy", "Kit Finder": "h1.shop", "Standings": "h1.standings",
        "Terms of Use": "h1.terms", "Transfer Centre": "h1.transfers" } },
    { sel: ".legal-updated", text: {
        "Your front row seat to every match.": "lede.about",
        "Every big match, previewed before and reported after — written by ScoreHub from the data.": "lede.hub",
        "Last updated: September 13, 2026": "lede.updated",
        "Official club stores and trusted retailers, one tap away. ScoreHub doesn't sell anything — you buy direct.": "lede.shop",
        "Complete tables — every team, updated live on matchdays. Data: ESPN.": "lede.standings",
        "Live transfer headlines, deals and rumours from across Europe.": "lede.transfers" } },
    { sel: ".legal-updated", key: "lede.pred", mode: "html",
      test: (el) => !!el.querySelector("a[href=\"previews.html\"]") },
    { sel: "button[data-league=\"All\"]", key: "common.all" },
    { sel: "button[data-league=\"UCL\"]", text: { "Champions League": "league.ucl" } },
    { sel: ".teams-count", text: {
        "18 Teams": "teams.18", "20 Teams": "teams.20", "32 Teams": "teams.32" } },
    { sel: ".view-all-link", text: {
        "View All": "common.viewall", "View Full Table →": "table.viewfull" } },
    { sel: ".filter-tab[data-filter=\"all\"]", key: "common.all" },
    { sel: ".filter-tab[data-filter=\"today\"]", key: "filter.today" },
    { sel: ".filter-tab[data-filter=\"favorites\"]", key: "filter.favs", mode: "lastText" },
    { sel: ".item-time", text: { "Just Now": "time.now", "12 mins ago": "time.12" } },
    { sel: "#share-match-btn span", key: "action.share" },
    { sel: "#net-banner-retry, #transfer-retry, #hub-retry, #standings-retry", key: "common.retry" },
    { sel: "#standings-error", key: "table.err", mode: "firstText" },
    { sel: "#transfer-error", key: "transfers.err", mode: "firstText" },
    { sel: "#hub-error", key: "hub.err", mode: "firstText" },
    { sel: ".hub-section-title", text: {
        "⭐ Big matches": "hub.big", "📝 Latest reports": "hub.reports",
        "📅 More upcoming fixtures": "hub.more" } },
    { sel: "#pred-demo span", key: "pred.demo" },
    { sel: "#pred-simulate", key: "pred.simulate" },
    { sel: ".pred-sub", text: {
        "Your results": "pred.results", "Related stories": "story.related",
        "Share this": "share.title" } },
    { sel: "#pred-clear", key: "pred.reset" },
    { sel: ".mc-tab[data-mc-tab=\"commentary\"]", key: "mc.commentary" },
    { sel: ".mc-tab[data-mc-tab=\"timeline\"]", key: "mc.timeline" },
    { sel: ".mc-tab[data-mc-tab=\"lineups\"]", key: "mc.lineups" },
    { sel: "#mc-pane-commentary h4", key: "mc.live" },
    { sel: "#mc-pane-timeline h4", key: "mc.timeline" },
    { sel: "#mc-pane-lineups h4", key: "mc.lineups" },
    { sel: "#login-modal h2", key: "auth.title" },
    { sel: "#login-modal .modal-body > p", key: "auth.sub" },
    { sel: "label[for=\"login-email\"]", key: "auth.email" },
    { sel: "label[for=\"login-password\"]", key: "auth.pass" },
    { sel: "#login-form button[type=\"submit\"]", key: "auth.signin" },
    { sel: ".auth-footer span", key: "auth.noacct", mode: "firstText" },
    { sel: "#go-to-signup", key: "auth.signup" },
    { sel: ".shop-links a[target]", text: { "Official store ↗": "shop.official" } },
    { sel: ".card-header-row h3", text: {
        "Top Scorers": "scorers.title", "Popular Leagues": "leagues.title",
        "Standings": "nav.standings", "Match Statistics": "stats.title",
        "Latest News": "news.title", "Live Scores": "scores.live" } },
    { sel: "button[data-leaders-cat=\"goals\"]", key: "scorers.goals" },
    { sel: "button[data-leaders-cat=\"assists\"]", key: "scorers.assists" },
    { sel: ".window-strip", text: {
        "🪟 Summer window: closed 1 Sept 2026 · Winter window opens 1 Jan 2027. Free agents can still sign outside the window.": "transfers.window" } }
];

function i18nNorm(s) { return String(s == null ? "" : s).trim().replace(/\s+/g, " "); }

function i18nTextNode(el, which) {
    const nodes = Array.prototype.filter.call(el.childNodes, (n) => n.nodeType === 3 && i18nNorm(n.nodeValue));
    if (!nodes.length) return null;
    return which === "first" ? nodes[0] : nodes[nodes.length - 1];
}

function applyI18nRule(rule) {
    let els = [];
    try { els = document.querySelectorAll(rule.sel); } catch (e) { return; }
    els.forEach((el) => {
        try {
            if (rule.test && !rule.test(el)) return;
            if (rule.mode === "html") { el.innerHTML = t(rule.key); return; }
            if (rule.text) {
                if (!el.dataset.i18nSrc) el.dataset.i18nSrc = i18nNorm(el.textContent);
                const key = rule.text[el.dataset.i18nSrc] || rule.text[i18nNorm(el.textContent)];
                if (key) el.textContent = t(key);
                return;
            }
            if (rule.mode === "firstText") {
                const n = i18nTextNode(el, "first");
                if (n) n.nodeValue = " " + t(rule.key) + " ";
                return;
            }
            if (rule.mode === "lastText") {
                const n = i18nTextNode(el, "last");
                if (n) n.nodeValue = " " + t(rule.key) + " ";
                return;
            }
            el.textContent = t(rule.key);
        } catch (e) {}
    });
}

function applyI18n() {
    try { document.documentElement.lang = LANG === "sw" ? "sw" : "en"; } catch (e) {}
    try {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
            el.placeholder = t(el.getAttribute("data-i18n-ph"));
        });
        document.querySelectorAll("[data-i18n-title]").forEach((el) => {
            el.title = t(el.getAttribute("data-i18n-title"));
        });
        document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
            el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
        });
    } catch (e) {}
    I18N_SEL.forEach(applyI18nRule);
    try {
        const lt = document.getElementById("lang-toggle-text");
        if (lt) lt.textContent = LANG === "sw" ? "EN" : "SW";
    } catch (e) {}
}

function setLang(l) {
    LANG = (l === "sw") ? "sw" : "en";
    try { localStorage.setItem("scorehub-lang", LANG); } catch (e) {}
    applyI18n();
    try {
        if (typeof window !== "undefined" && typeof window.__rerenderLang === "function") {
            window.__rerenderLang();
        }
    } catch (e) {}
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", function () {
        applyI18n();
        const btn = document.getElementById("lang-toggle");
        if (btn) btn.addEventListener("click", function () {
            setLang(LANG === "sw" ? "en" : "sw");
        });
    });
}

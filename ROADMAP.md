# ScoreHub Upgrade Roadmap

> Additive-only, non-breaking upgrades. Every item ships **behind the existing
> patterns** (ESPN multi-transport fetch, TTL caches, simulation fallback) so the
> app keeps working if any new data source fails. No rewrites, no hard
> dependencies on keyed/paid APIs in the core experience.

**How to read this:** each idea lists the data source, effort (S/M/L), risk, and
the graceful fallback. Phases are ordered by value ÷ risk. Each phase is
independently shippable and revertible.

> Companion roadmap: **`SEO-PERF-ROADMAP.md`** covers search visibility (only
> 3 pages indexed today), Core Web Vitals (mobile Perf 63 / BP 77) and the new
> Lighthouse Agentic Browsing category — same non-breaking rules apply there.

---

## Ground Rules (how we avoid breaking the app)

1. **Reuse the proven transport** — all new ESPN reads go through `fetchESPNPath()`
   (memoized strategy + validation). New non-ESPN hosts get their own tiny
   validator + timeout, same as today.
2. **Fallback first** — every widget keeps its current mock/simulation render as
   the default; live data only *overwrites* on success (the `liveStandings` /
   `liveNews` / `liveScorers` pattern).
3. **TTL-cache everything** — new endpoints follow `LIVE_EXTRAS_TTL_MS`-style
   caching; per-match detail follows `SUMMARY_TTL_MS`.
4. **Hide, don't error** — if a data point is missing (e.g. no lineups for a
   league), the section hides itself. No toasts for expected gaps.
5. **No keys in the client core** — keyed APIs are *optional enhancements*:
   the app must be 100% usable with zero keys configured.
6. **One phase per PR** — small diffs, `node --check` + ID-audit before merge.

### Explicitly OUT (would risk breaking the app)
- Rewriting or replacing the ESPN transport / proxy fallback chain.
- Removing Simulation Mode (it's the offline/disaster fallback).
- Login-gating, paywalling, or key-gating any existing screen.
- Heavy frameworks/build steps — stay dependency-free vanilla (single `serve.ps1`
  / static host deploy).

---

## Phase 1 — Quick Wins (no new vendors, ~1–2 days)

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 1.1 ✅ | **Persist theme + favorites in `localStorage`** (both reset on refresh today) | Browser only | S | Very low | In-memory behavior if storage blocked |
| 1.2 ✅ | **More standings tabs** — add UCL, Bundesliga, Ligue 1 alongside EPL/LaLiga/Serie A | Same ESPN standings endpoint, new slugs | S | Very low | Tab hidden if its fetch fails |
| 1.3 ✅ | **Assists leaders toggle** in Top Scorers (Goals / Assists) | Same core-API leaders endpoint, `assistsLeaders` category | S | Very low | Goals-only if category missing |
| 1.4 ✅ | **Fixtures calendar strip** — browse past/future days | ESPN scoreboard `?dates=YYYYMMDD` (same endpoint + transport) | M | Low | "No events" empty state per day |
| 1.5 ✅ | **Match timeline tab** in Watch Live modal (goals/cards/subs on a minute axis) | Already-fetched summary commentary/plays — pure render work | M | Low | Tab hidden when no play data |
| 1.6 ✅ | **Lineups + bench** in Watch Live modal | Summary `boxscore.players` / `lineups` where provided | M | Low | Section hidden when absent |
| 1.7 ✅ | **Share match** (Web Share API) + **Add to Calendar** (`.ics` download) | Browser only, guarded by feature detection | S | Very low | Buttons hidden if unsupported |
| 1.8 | **Goal alerts as system notifications** while the page is open | Notification API (permission-gated), hooks into existing `showNotification` | S | Very low | In-app toast only |
| 1.9 ✅ | **Offline + stale-data banner** (`navigator.onLine`, failed-refresh state) | Browser only | S | Very low | N/A (purely additive UI) |
| 1.10 ✅ | **SEO/social meta** (OG/Twitter tags, description, favicon) | Static HTML | S | Very low | N/A |

## Phase 2 — Deeper ESPN (same vendor, proven transport)

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 2.1 | **Team hubs** — tap a team → form, next fixture, squad list | ESPN teams + team endpoints; next fixture from scoreboard data | L | Low | Hub shows "limited data" state |
| 2.2 | **Player spotlight rows** — tap a scorer → season goals/assists/apps | Core-API athlete refs (same `$ref` resolver as today) | M | Low | Row stays non-clickable |
| 2.3 | **Form guide (last 5: W/D/L)** on match cards + team hubs | Derived from dated scoreboard fetches, cached | M | Low | Hidden until computed |
| 2.4 | **Head-to-head compare** — recent meetings + both teams' form | Same dated-scoreboard data as 2.3 | M | Low | "No recent meetings" state |
| 2.5 | **Win probability bar** where published (US sports) | ESPN summary `winProbability` | S | Very low | Hidden for soccer |
| 2.6 ✅ | **Fuller odds** — parse O/U and BTTS from ESPN odds `details` | Already-fetched `comp.odds` | S | Very low | Current 1X2 capsule |
| 2.7 | **More headlines per league tab** (news follows the standings tab) | Same news endpoint, slug per tab (already proven for `eng.1`) | S | Very low | Keep EPL feed |

> Spike note: verify each endpoint shape against the samples in `testdata/`
> (`espn-scoreboard.sample.json`, `espn-standings.sample.json`) before wiring
> UI. `node testdata/verify.mjs` checks them against the live parsers, and
> against the league lists in `sitemap.xml` / `standings.html`, in one pass.

## Phase 3 — New Free APIs (no keys, CORS-friendly)

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 3.1 ✅ | **Formula 1 tab** — schedule, standings, results (brand-new sport vertical) | [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) (Ergast mirror, free, CORS) | M | Low | Tab hidden if unreachable |
| 3.2 | **Deeper German fixtures** (BL1/BL2/DFB-Pokal history + matchdays) | [OpenLigaDB](https://api.openligadb.de) (free, no key, CORS) | M | Low | ESPN coverage remains |
| 3.3 | **Matchday weather widget** in Watch Live (temp, rain, wind at venue) | [Open-Meteo](https://open-meteo.com) (no key, CORS) + venue/city geocoding | M | Low | Widget hidden |
| 3.4 ✅ | **Country flags** on leagues/teams | [flagcdn.com](https://flagcdn.com) image CDN (hotlink, no key) | S | Very low | Emoji flags stay |
| 3.5 ✅ | **Highlights deep-links** ("Watch highlights" → YouTube search for the fixture) | Plain outbound link, zero API calls | S | Very low | N/A |

## Phase 4 — Engagement Without a Backend (all local-first)

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 4.1 | **Match predictor game** — pick winners, score points, local leaderboard | `localStorage` + existing match data | M | Very low | N/A (self-contained) |
| 4.2 | **Fan polls** (e.g. "Who wins El Clásico?") with animated results | `localStorage` | S | Very low | N/A |
| 4.3 | **Quiz of the day** from live data (top scorer? league leader?) | Generated from already-fetched data | M | Very low | N/A |
| 4.4 | **My Team mode** — pin a club: highlighted everywhere + auto-spotlight | `localStorage` + existing renders | M | Very low | N/A |
| 4.5 | **PWA installability** — manifest + service worker caching shell + last scoreboard | Browser only | M | Low | Normal website if SW rejected |

## Phase 5 — Optional Backend (only if you want accounts/sync/push)

Everything here is **opt-in and additive**: the static app remains the full
experience; the backend only adds sync + out-of-band alerts.

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 5.1 | **Real auth + favorites/predictions sync across devices** | Supabase Auth + Postgres (generous free tier) | L | Medium | Local-only mode (Phase 4) |
| 5.2 | **Push goal alerts when the tab is closed** | Web Push via Vercel/ Supabase Edge + SW | L | Medium | Foreground notifications (1.8) |
| 5.3 | **SMS goal alerts for Kenya** 🇰🇪 | [Africa's Talking](https://africastalking.com) (pay-as-you-go, needs tiny backend) | M | Medium | Push/in-app alerts |
| 5.4 | **Fan chat / match reactions** | Supabase Realtime | M | Medium | Reactions stored locally |
| 5.5 | **Keyed data upgrades (optional toggles)** — The Odds API comparison, football-data.org depth | User-supplied or server-held keys, off by default | M | Low | ESPN data stays default |

## Phase 6 — Reach, Language & Revenue

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 6.1 | **English / Kiswahili toggle** 🇰🇪 (chrome strings via small i18n dict, EN default) | Static strings | M | Very low | EN strings (keys fall back) |
| 6.2 | **Analytics** (privacy-friendly: Plausible/Umami snippet) | Third-party script, `defer` | S | Very low | N/A |
| 6.3 | **CI smoke checks** — GitHub Action: `node --check`, ID audit, dead-link scan | GitHub Actions | S | Very low | N/A |
| 6.4 | **Monetization (later)** — AdSense/display slots in sidebar gaps, affiliate odds links, "Pro" (no ads + SMS alerts) | Various | M | Low | Ad-free current UI |

---

## Suggested Build Order (first 3 PRs)

1. **PR-A — "Sticky + complete"**: 1.1 (persistence) + 1.2 (standings tabs) +
   1.3 (assists) + 1.10 (meta). All S-effort, near-zero risk, instantly visible.
2. **PR-B — "Match centre depth"**: 1.5 (timeline) + 1.6 (lineups) + 1.7
   (share/ICS) + 1.9 (offline banner). Uses data we already fetch.
3. **PR-C — "Time travel + new sport"**: 1.4 (calendar) + 3.1 (F1) + 3.4
   (flags). First new-vendor code, isolated behind the Phase-3 pattern.

## Open Questions (answer whenever — roadmap stands regardless)
- Which club/league matters most to your audience? (shapes 2.x + 4.4 defaults)
- Do you want accounts/sync at all, or stay 100% static? (gates Phase 5)
- Kiswahili + Kenyan leagues (FKF Premier League?) priority? (6.1 + data wishlist)
- Any monetization timeline? (shapes 6.4 slot placement)

## Shipped Log
- **2026-09-12 — PR-A "Sticky + complete"**: 1.1 theme/favorites persistence, 1.2 UCL/Bundesliga/Ligue 1 standings tabs, 1.3 Goals/Assists leaders toggle, 1.10 SEO/social meta.
- **2026-09-12 — PR-B "Match centre depth"**: 1.5 key-events timeline, 1.6 lineups, 1.7 share + .ics calendar export, 1.9 offline/stale-data banner.
- **2026-09-12 — PR-C "Time travel + new sport"**: 1.4 fixtures calendar (?dates=), 3.1 Formula 1 tab (Jolpica API), 3.4 flag CDN with emoji fallback.
- **2026-09-13 — Mobile hardening pass**: flex ellipsis/overflow fixes header-to-footer (match cards, spotlight, standings, timeline, lineups, F1 rows).
- **2026-09-13 — Team logos + legal/support pages**: real ESPN club logos overlaid on generated badges (match cards + spotlight, onerror fallback), footer Support/Leagues/Quick-Links wired to terms/privacy/about + index hash routes, brand logo.svg + favicon, data credit.
- **2026-09-13 — More-menu real pages**: Transfer Centre (live ESPN news, keyword-filtered + league chips), Predictions game (upcoming fixtures, localStorage picks, auto-settle scoring, demo mode), Shop kit finder (14 official stores + Jumia Kenya, search/filter); header dropdown wired, `.card` surface added (also styles legal pages).
- **2026-09-13 — Logos on Transfers/Predictions/Shop**: predictions fixtures + results use ESPN team logos (stored with picks), transfer cards show tagged clubs' crests via team-ID CDN, shop badges get runtime crest injection matched against ESPN team lists (code pills stay as fallback).
- **2026-09-13 — News + tables stay on-site**: new standings.html (complete W/D/L tables, all 6 leagues, `?league=` deep link from homepage Full Table), new story.html (hero art, club crests, live event scorecard, related stories via sessionStorage handoff); homepage news + transfer cards open stories on-site, ESPN kept as source attribution only.
- **2026-09-13 — Auto match previews**: new preview.html/js — original data-driven previews (table positions, last-5 form from date-bucket scoreboards, home/away splits, top scorers, bookmakers' favourite, stats-based verdict, all deterministic); entry links on upcoming match cards + predictions fixtures.
- **2026-09-13 — Previews hub + auto reports**: previews.html ranks the week's ties by combined table position (big matches, latest reports, all fixtures); report.html writes "How X beat Y" from goals/cards/stats/attendance with half-by-half narrative, drama detection (late winners, comebacks, braces), timeline, stat table and what-next; 📝 Report capsules on finished match cards.
- **2026-09-13 — Share cards + Story of the Week**: share.js renders 1200x630 canvas cards (Web Share API with download fallback, WhatsApp/X/Telegram/Facebook + copy link) on preview/report pages with OG tags; homepage spotlight auto-picks the week's best story (finished-thriller drama scoring, table-backed biggest-upcoming with cached tables, user-tap lock) with tag, reason line and preview/report button.

- **2026-09-13 — PWA installability + Kiswahili toggle (6.1)**: manifest + service worker (31-file precache, offline shell fallback, runtime caches) + install prompt button + generated icons (192/512/apple-touch); i18n.js EN/SW chrome dict (~170 keys) with header SW/EN toggle, locale-aware dates and per-page re-render hooks; narratives/legal prose stay EN in v1.
- **2026-09-14 — Phase 2.6 Fuller odds**: richer odds extraction across all `comp.odds` providers (not just the first entry) — decimal 1X2 triple, Over/Under line with Over/Under payouts, and Both-Teams-to-Score (Yes/No) markets where ESPN publishes them; three colour-coded stat-capsules (cyan/purple/orange with proper light-theme variants) replace the single text capsule; Goals/Possession capsules now hide on pre-match cards where they were showing "0 Goals" / "—% Poss"; same richer parser ported to match.js for the match-centre header; robust fallback — any missing market simply doesn't render.

- **2026-09-15 — Bug pass: sitemap leagues, stale caches, desktop overflow**: standings.html now renders every league `sitemap.xml` advertises (MLS, Liga MX, Brasileirão, Eredivisie, Primeira Liga, Süper Lig, Saudi Pro League — the `?league=` deep links used to fall back to the Premier League table) with conference-aware parsing, so MLS shows both Eastern and Western tables and season labels come from the payload instead of a hard-coded "2025/26"; the service worker serves same-origin assets stale-while-revalidate, so a deploy no longer needs a `SW_VERSION` bump; the unusable flattened `espn_test.json` is replaced by `testdata/` samples plus `node testdata/verify.mjs`; dead `formatDateShort()`/`scoreboardHTML()` removed from match.js; and the header no longer stretches the document at 993–1760px (it collapses to the tablet/phone layout below 1760px) with the footer's phone-mockup glow clipped so it cannot add 30px to the page.

- **2026-09-15 — Live-data fetch stops holding the homepage hostage**: a blocked or blackholed ESPN used to be swept league by league (15 for "all", 57 for "worldwide") across all five transports at a 10 s timeout each, blanking the match list behind skeletons, and only then falling back to Simulation Mode — then doing it again on the next load. Now the sweep has a 12 s watchdog while nothing has arrived (60 s hard cap once data is coming), a transport that fails twice is out of rotation for 5 min instead of being retried for every league, cards already on screen stay put instead of being replaced by skeletons, and the 60 s auto-refresh became a self-scheduling tick that probes once (one request) every 5 min while in Simulation Mode and switches back to live on its own when ESPN answers. Measured with ESPN hanging: 98 requests and still "Fetching…" at 75 s → 12 requests and a 12.3 s fallback with no skeleton blanking and no requests afterwards; with ESPN unreachable: 110 → 30 requests, 1.3 s → 0.7 s.

- **2026-09-15 — Universal Match Previews & Reports**: expanded match preview and match report eligibility to all 58 football leagues and cup competitions retrieved by the API across `app.js`, `preview.js`, `report.js`, `previews.js`, and `match.js`. Generalized `canPreviewMatch(m)` and `canReportMatch(m)` to support all scheduled and completed fixtures (removing restrictive client clock offsets and missing halftime score filters). Added unified slug normalization (`cleanLeagueSlug`) to guarantee valid ESPN fetch endpoints and seamless routing (`eng.1`, `uefa.europa`, etc.). Added resilient `sessionStorage` and simulation fallback pathways in `preview.js` and `report.js` with defensive `safeLocale()` date formatters, and added simulation fallback fixtures to `previews.js` so the hub never blanks out when offline. Verification test suite expanded to 66 passing checks.

- **2026-09-30 — Full ESPN catalogue: every competition swept, Kenya and Uganda on the home page**: the coverage audit's remaining 104 competitions are now integrated — domestic cups and super cups (Coupe de France, Copa del Rey, EFL Trophy, the Brazilian state championships), second tiers and promotion/relegation play-offs, confederation and world competitions (CONCACAF, AFC, CAF, the FIFA youth and Olympic qualifiers) and women's competitions — registered in both sweep tabs, named in `LEAGUE_NAMES` and mapped into the preview, report and match-centre pages. **218 of 218 ESPN catalogue competitions are now integrated, plus 13 the catalogue itself omits** (Kenya, Uganda, Ghana, Switzerland, Ukraine…): `LEAGUE_NAMES` went 155 → 261, the Football tab sweep 102 → 210 slugs and Worldwide 123 → 231. Display names come from ESPN's own league resources, which is how `fifa.intercontinental.cup` was caught being the Intercontinental Cup in India rather than FIFA's club event. Kenya and Uganda also get home-page "Popular Leagues" rows with `ke`/`ug` flags. The sweep was tuned for the doubled load (`CHUNK_SIZE` 6 → 8, `ESPN_SWEEP_MAX_MS` 60 s → 90 s) and a tab switch that lands mid-sweep is now queued and re-run for the newly selected tab instead of being dropped. Dead slugs stay out: `pol.1`, `kor.1` and `cro.1` return HTTP 400 and are absent from ESPN's catalogue, which is the liveness signal to keep using.
  - Verified: `node testdata/verify.mjs` 80 checks including the two-way `LEAGUE_NAMES`/`ESPN_ENDPOINTS` guard, a DOM sweep test that clicks the Football tab and sees all 210 endpoints requested with the new competitions rendering under their real names, a unit test of the queued-sweep logic, and canned + offline renders of every page with no console errors. The audit, the counts and the remaining caveats (which leagues still have no table) live in `COMPETITION-COVERAGE.md`.

- **2026-09-30 — Competition coverage audit (all countries, leagues, tournaments)**: audited every competition the site claims against ESPN's live endpoints, and found two real integration bugs. `uefa.champions_qual` (UCL Qualifiers) and `uefa.europa_qual` (UEL Qualifiers) had display names, preview/report/match-centre entries and a verifier-visible list slot, but sat in **no** sweep tab — they were advertised and never fetched. Kenya and Uganda, the two biggest leagues in the site's own region, were missing entirely even though ESPN serves live scoreboards and full tables for both: `ken.1` (Kenyan Premier League) and `uga.1` (Ugandan Premier League) are now fully integrated across the sweeps, `LEAGUE_NAMES`, previews hub, preview/report/match maps, `standings.js`, the `standings.html` chip row and `sitemap.xml` — the site now carries 157 competitions (127 football, 30 with a full table). A new verifier check keeps `LEAGUE_NAMES` and `ESPN_ENDPOINTS` in exact two-way agreement, so a league can no longer be named but never fetched (or fetched and left anonymous); it was proven to fail on the exact stranded slugs before being kept (`named but never fetched: soccer/uefa.champions_qual, soccer/uefa.europa_qual`). Standings has 30 tables (was 28), the football tab sweeps 106 slugs (was 102) and worldwide 127 (was 123). The remaining 104 uncatalogued-by-the-site competitions, why `pol.1`/`kor.1`/`cro.1` must not be added, and a recommended order for further expansion are written up in `COMPETITION-COVERAGE.md`.
  - Verified by rendering the new deep links in a DOM harness (`standings.html?league=ken.1` / `?league=uga.1` render the right heading, mark the KEN/UGA chip active and draw a table with no console errors, and the Football tab labels both leagues instead of leaking a raw slug), plus the canned and offline page renders and `node testdata/verify.mjs` at 80 checks.

- **2026-09-30 — Live data survives a reload (and so does the view)**: the sweep result and every view choice lived only in memory, so a reload threw the live scores away and dropped the user on the 54-match simulation dataset until the next sweep landed — and if ESPN was slow or blocked, that is where they stayed, behind a bare "Fetching…" line, which is the "live data disappears after reload" report. Both are now mirrored into `localStorage` (`scorehub-live-v1`, `scorehub-view-v1`) and replayed during boot: the saved matches paint immediately in Live API Mode with the real counter, then `setApiMode(true)` refreshes over the top; the status line says "Showing last saved scores from HH:MM · N events — refreshing…" until the sweep lands, and an unreachable ESPN keeps the saved scores on screen with the existing "Update failed — showing last data" banner instead of blanking to mock fixtures. The view (sport tab, filter, league, day from the fixtures calendar, standings tab, Goals/Assists toggle, spotlight pick) is restored before the first render, so a reload comes back to the screen the user left.
  - Nothing dishonest is replayed: a snapshot older than 3 h, saved for a different sport tab or day, empty, unparsable or holding junk matches is discarded; a match cached as live more than 3 h after kickoff is closed out as FT rather than left sitting on "65'"; values for controls this page does not have are ignored, so a snapshot from another page or an older build can never leave the UI with nothing selected; and Simulation Mode never overwrites the live snapshot with mock fixtures. Snapshots are also written on `pagehide` / tab-hidden, so closing the tab or reloading straight after a tap keeps it current. No new dependencies, no new requests, no service-worker bump (same files, precache list unchanged).
  - Verified by replaying a real reload in a DOM harness: before, load #2 with ESPN blocked showed Simulation Mode / 54 mock matches / "Fetching…"; now it shows Live API Mode / 26 API matches / "Update failed — showing last data", with the 30-min-old case painting "Showing last saved scores from 11:25 PM · 26 events" at 800 ms with ESPN hanging. `testdata/verify.mjs` grew 72 → 78 checks covering the round-trip, the honesty rules and the view whitelist.

- **2026-09-29 — Bug pass: totals odds + simulation stats**: two data bugs found by rendering every page against the `testdata/` samples and unit-testing the parsers.
  - **Over/Under capsule showed the wrong market.** ESPN publishes the total's prices on the odds entry itself (`overOdds`/`underOdds`, e.g. `-115`), but the parser never read them — instead, because the moneyline entry always carries the `overUnder` line, its home/away **1X2** prices were relabelled as Over/Under payouts. A match quoting 1.69 for the home win and 4.80 for the away win rendered "📈 O/U 2.5 ↑1.69 ↓4.80", and a genuine separate O/U entry was ignored because those fields had already been filled. `preview.js` had the mirror-image bug: it *did* read the entry-level fields but never converted them, printing "↑-115.00 ↓105.00". All three pages now share one rule (`espnPriceToDecimal()`): entry-level prices first (American moneylines converted to decimal, decimal prices passed through, provider probabilities like `45.31` dropped rather than shown as a fake price), and the 1X2-derived fallback only for an entry whose `details` actually name the totals market. When ESPN publishes no totals prices the capsule honestly reads "O/U 2.5" alone. Same fix for BTTS.
  - **Simulated match reports lost four of their five stats.** `simMatchToReportEvent()` emitted `statistics[].name` as `possession`/`shots`/`corners`/`fouls`, which `parseSideStats()` cannot read (it looks for ESPN's `possessionPct`/`totalShots`/`wonCorners`/`foulsCommitted`), so the offline/Simulation-Mode report rendered a one-line table — "4 | On target | 3" — while the mock match carried a full stat line. The synthetic event now uses ESPN's own statistic names, so the same parser reads it.
  - Also extracted `match.js`'s inline odds block into `oddsFromCompetition()`, so the match centre's parser is unit-testable. `testdata/verify.mjs` grew from 66 to 72 checks, including the two regressions above, a cross-file agreement test (`app.js` vs `match.js` on every market, and the three `espnPriceToDecimal` copies staying identical) and a sim-report stat round-trip.

- **2026-09-16 — Top Scorers Headshots & Unified Navigation Routing**:
  - **Top Scorers player headshots**: added real athlete headshot images (`.scorer-headshot`) to both live ESPN leaderboards and mock data rows in `app.js` and `style.css`. Supported by `resolveCoreRefAthlete(ref)` extracting headshot URLs directly from core athlete payloads, with responsive circular avatar containers (`.scorer-avatar`), `object-fit: cover`, and graceful `onerror` fallback restoring initial monograms.
  - **Unified Navigation & Dedicated News and Highlights hubs**: resolved broken links where clicking News, Predictions, Highlights, Previews, Shop, or Transfers unexpectedly redirected to the homepage or top of page.
  - Created dedicated `news.html` / `news.js` News Centre with real-time league filter chips, search input, and deep linking to on-site stories (`story.html`).
  - Created dedicated `highlights.html` / `highlights.js` Highlights Hub with video thumbnail cards, competition tags, search, and direct YouTube search routing (`matchHighlightUrl`).
  - Synchronized primary header navigation on `index.html` and secondary page navbars (`.legal-nav`) across all 12 secondary pages (`predictions.html`, `previews.html`, `news.html`, `highlights.html`, `transfers.html`, `shop.html`, `standings.html`, `match.html`, `story.html`, `report.html`, `about.html`, `privacy.html`, `terms.html`).
  - Replaced dead `href="#"` links on "View All" (News), "View Full Table" (Standings), and Popular Leagues with direct functional URLs to `news.html` and `standings.html`.
  - Registered all new pages and scripts in `sw.js` (bumped to `SW_VERSION = 'v3'`), `sitemap.xml`, and `robots.txt`, and added full EN/SW translations in `i18n.js`.
  - Added dedicated Predictions Hero Banner (`.pred-hero-banner`) with description of free daily football predictions and CTA button ("Check Today's Predictions") linking directly to `https://livescoredashboard2.vercel.app`.
  - Added featured News section (`.home-news-section`) immediately following the Highlights strip on the homepage (`index.html`), showing top football headlines with direct on-site story reading.
- **Sport pages** — every sport tab has its own flat page (`/basketball.html`, `/nfl.html`, `/tennis.html`, `/ice-hockey.html`, `/formula-1.html` …; the old `/tennis/` folder URLs are redirect stubs) opening the identical dashboard on that tab. Mapping lives in `sport-pages.js`; pages are generated from `index.html` by `tools/build-sport-pages.mjs` (run it after editing `index.html`; `testdata/verify.mjs` fails on stale pages). Sports with no ESPN data yet (esports, cricket, volleyball, handball, MMA) have pages but are `noindex` and out of the sitemap until their `covered` flag is flipped.
- **2026-10-01 — Sport pages: news, results, fixtures**: every sport page now shows its own headlines (ESPN `/news` per sport; rugby has no feed, so it shows an empty state instead of football stories), a "Results & Fixtures" hub (finished matches from the last 3 days, live + upcoming for the next 4; one `?dates=YYYYMMDD` request per league per day because ESPN rejects ranges; 5‑min cache; Simulation Mode filters the mock data; F1 shows the next races + last-race top 5). Tennis tournaments are now flattened into matches (ESPN nests them in `groupings`, which previously broke the tennis sweep), and an ESPN reply of "nothing scheduled" no longer flips the page into Simulation Mode.
- **2026-10-01 — Flat sport pages + NFL**: the sport pages are now flat files next to `news.html` / `highlights.html` — `nfl.html`, `basketball.html`, `tennis.html`, `baseball.html`, `ice-hockey.html`, `rugby.html`, `formula-1.html`, `football.html`, `worldwide.html` (+ the uncovered esports/cricket/volleyball/handball/mma). The old `/tennis/` folders remain as redirect stubs. New NFL tab/page (ESPN `football/nfl`: scoreboard, news, results + fixtures with a 7-day window each way).
- **2026-10-01 — Sport pages open from anywhere**: removed the `<base href="/">` the sport pages carried (flat pages need none). With it, any copy not served from the site root — a file:// open, a sub-path preview, an embedded viewer — loaded `/style.css`, `/app.js` … from the wrong place and came up blank/unstyled. Tab navigation now pushes a relative URL, `sportForPath()` recognises `<slug>.html` at any depth, the `/tennis/` redirect stubs point at `../tennis.html`, and the F1 hub says "could not load" instead of "Loading…" when Jolpica is unreachable. Service worker bumped to `v5`.

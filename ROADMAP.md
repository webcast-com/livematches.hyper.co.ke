# ScoreHub Upgrade Roadmap

> Additive-only, non-breaking upgrades. Every item ships **behind the existing
> patterns** (ESPN multi-transport fetch, TTL caches, simulation fallback) so the
> app keeps working if any new data source fails. No rewrites, no hard
> dependencies on keyed/paid APIs in the core experience.

**How to read this:** each idea lists the data source, effort (S/M/L), risk, and
the graceful fallback. Phases are ordered by value ÷ risk. Each phase is
independently shippable and revertible.

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
| 1.4 | **Fixtures calendar strip** — browse past/future days | ESPN scoreboard `?dates=YYYYMMDD` (same endpoint + transport) | M | Low | "No events" empty state per day |
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
| 2.6 | **Fuller odds** — parse O/U and BTTS from ESPN odds `details` | Already-fetched `comp.odds` | S | Very low | Current 1X2 capsule |
| 2.7 | **More headlines per league tab** (news follows the standings tab) | Same news endpoint, slug per tab (already proven for `eng.1`) | S | Very low | Keep EPL feed |

> Spike note: verify each endpoint shape in `espn_test.json`-style fixtures
> before wiring UI (same approach as the current integration).

## Phase 3 — New Free APIs (no keys, CORS-friendly)

| # | Idea | Source | Effort | Risk | Fallback |
|---|------|--------|--------|------|----------|
| 3.1 | **Formula 1 tab** — schedule, standings, results (brand-new sport vertical) | [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) (Ergast mirror, free, CORS) | M | Low | Tab hidden if unreachable |
| 3.2 | **Deeper German fixtures** (BL1/BL2/DFB-Pokal history + matchdays) | [OpenLigaDB](https://api.openligadb.de) (free, no key, CORS) | M | Low | ESPN coverage remains |
| 3.3 | **Matchday weather widget** in Watch Live (temp, rain, wind at venue) | [Open-Meteo](https://open-meteo.com) (no key, CORS) + venue/city geocoding | M | Low | Widget hidden |
| 3.4 | **Country flags** on leagues/teams | [flagcdn.com](https://flagcdn.com) image CDN (hotlink, no key) | S | Very low | Emoji flags stay |
| 3.5 | **Highlights deep-links** ("Watch highlights" → YouTube search for the fixture) | Plain outbound link, zero API calls | S | Very low | N/A |

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

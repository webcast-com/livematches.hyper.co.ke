# Competition coverage — which countries, leagues and tournaments are integrated

Audit + expansion run 2026-09-30, checked into the code with `node testdata/verify.mjs` (80 checks).

## Result

**Every competition in ESPN's soccer catalogue is now integrated — 218 of 218 —
plus 13 more that ESPN serves but does not list in that catalogue.**

| | Before this pass | After |
|---|---|---|
| Named competitions (`LEAGUE_NAMES`) | 155 | **261** |
| Football | 125 | **231** |
| Football tab sweep | 102 slugs | **210 slugs** |
| Worldwide tab sweep | 123 slugs | **231 slugs** |
| ESPN catalogue integrated | 114 of 218 | **218 of 218** |
| Competitions named but never fetched | 2 | **0** |
| Competitions fetched but never named | 0 | **0** |
| Full standings tables | 28 | **30** |

## How a competition becomes "integrated"

A competition only reaches the site if its ESPN slug is registered in **all** of
these places. Miss one and it silently disappears or renders a raw slug:

| # | Where | File | Purpose |
|---|-------|------|---------|
| 1 | `ESPN_ENDPOINTS.football` | `app.js` | Football tab sweep |
| 2 | `ESPN_ENDPOINTS.worldwide` | `app.js` | Worldwide tab sweep |
| 3 | `ESPN_ENDPOINTS.all` | `app.js` | All tab sweep (top competitions only) |
| 4 | `LEAGUE_NAMES` | `app.js` | Display name, badge code, sport |
| 5 | `PREVIEW_LEAGUES` | `preview.js` | Auto match previews |
| 6 | `REPORT_LEAGUES` | `report.js` | Auto match reports |
| 7 | `MATCH_LEAGUES` | `match.js` | Match centre |
| 8 | `HUB_LEAGUES` | `previews.js` | Previews hub league picker |
| 9 | `STANDINGS_LEAGUES` + `standings.html` chip + `sitemap.xml` | `standings.js`, `standings.html`, `sitemap.xml` | Full league table (the verifier keeps these three in step) |
| 10 | `LEAGUE_FLAG_CODES` | `app.js` | Flag for a home-page league row |

`testdata/verify.mjs` now enforces the important half of that contract: every
league named in `LEAGUE_NAMES` must appear in at least one sweep tab, and every
swept slug must have a name — in both directions, so neither "advertised but
never fetched" nor "fetched but anonymous" can return.

## What this pass fixed

### 1. Two competitions were named but never fetched

`uefa.champions_qual` (UCL Qualifiers) and `uefa.europa_qual` (UEL Qualifiers)
had display names, badges, and preview/report/match-centre entries, but appeared
in **no** sweep tab — so they could never appear. Both return live data from
ESPN. They are now in the Football and Worldwide sweeps, next to the Conference
League qualifier that had been added correctly.

### 2. Kenya and Uganda were missing entirely

The two biggest leagues in the site's own region were not integrated at all,
though ESPN serves both a live scoreboard and a complete standings table:

* **`ken.1` — Kenyan Premier League** (AFC Leopards, Gor Mahia, Kenya Police, …)
* **`uga.1` — Ugandan Premier League** (Vipers, KCCA, SC Villa, …)

Both are now fully integrated: sweeps, names, previews, reports, match centre,
standings table + chip + sitemap entry, previews hub, the home-page "Popular
Leagues" row and its flag (`ke`, `ug`).

### 3. The rest of ESPN's catalogue (104 competitions) is now swept

Everything ESPN lists and the site did not carry — domestic cups and super cups
(`fra.coupe_de_france`, `esp.copa_de_la_reina`, `eng.trophy`, the Brazilian state
championships), second tiers and promotion/relegation play-offs (`arg.2`,
`sco.2`, `mex.2`, `uru.2`, the `*.promotion.relegation` set), confederation and
world competitions (`concacaf.*`, `afc.*`, `caf.w.nations`, the `fifa.*` youth and
Olympic qualifiers) and women's competitions (`eng.w.fa`, `ned.w.knvb_cup`,
`uefa.wchampions_qual`, `caf.w.nations`, …) — is registered in both sweeps, named,
and mapped into the preview, report and match-centre pages.

Display names come from ESPN itself (`…/v2/sports/soccer/leagues/{slug}`), which
matters for the traps: `fifa.intercontinental.cup` is the **Intercontinental Cup
in India**, not FIFA's club event; `aff.championship` is the **ASEAN
Championship**; `nonfifa` is **Non-FIFA Friendly**; `global.pinatar_cup` is a
women's tournament.

## Caveats worth keeping

1. **ESPN's catalogue under-reports.** `ken.1`, `uga.1`, `gha.1`, `cze.1`, `sco.2`
   and others serve live data while being absent from
   `sports.core.api.espn.com/v2/sports/soccer/leagues`. The 13 such leagues the
   site already carried (Cyprus, Ireland, Iran, Malaysia, Nigeria, Romania,
   Switzerland, Thailand, Ukraine, Ghana, Kenya, Uganda, World Cup qualifying)
   are exactly why slug-derived coverage estimates should never be trusted.
2. **Some slugs are dead and were deliberately not added.** `pol.1` (Ekstraklasa),
   `kor.1` (K League) and `cro.1` (HNL) return
   `{"code":400,"message":"Failed to get events endpoint."}`. They are absent from
   ESPN's catalogue too — membership in that catalogue is a reliable liveness
   signal, absence from it is not.
3. **Not every competition needs a table.** `STANDINGS_LEAGUES` covers 30 leagues;
   cups, qualifiers and play-offs have no table to show. The remaining candidates
   for a table are top divisions the site already sweeps — `aus.1`, `gre.1`,
   `sui.1`, `aut.1`, `rus.1`, `ukr.1`, `col.1`, `chi.1`, `ind.1` — each needing a
   row in `standings.js`, a chip in `standings.html` and a URL in `sitemap.xml`.
4. **The predictions game still covers 6 leagues** (`eng.1`, `esp.1`, `ita.1`,
   `ger.1`, `fra.1`, `uefa.champions`) — a product choice, not a coverage gap.

## Load note

The sweep went from 102 to 210 endpoints on the Football tab and 123 to 231 on
Worldwide. To keep that honest the sweep was tuned with it: `CHUNK_SIZE` 6 → 8
(so a healthy sweep finishes well inside the cap instead of truncating at the
obscure end) and the hard cap `ESPN_SWEEP_MAX_MS` 60 s → 90 s. A tab switch that
lands mid-sweep is no longer dropped — the request is queued and the sweep re-runs
for the newly selected tab when the current one finishes.

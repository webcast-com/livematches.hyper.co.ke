# Competition coverage — which countries, leagues and tournaments are integrated

Audit run 2026-09-30 against the live ESPN endpoints, checked into the code with
`node testdata/verify.mjs` (80 checks).

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
| 8 | `STANDINGS_LEAGUES` + `standings.html` chip + `sitemap.xml` | `standings.js`, `standings.html`, `sitemap.xml` | Full league table (the verifier keeps these three in step) |
| 9 | `HUB_LEAGUES` | `previews.js` | Previews hub league picker |

## Counts as of this audit

| | Before | Now |
|---|---|---|
| Named competitions (`LEAGUE_NAMES`) | 155 | **157** |
| Football | 125 | **127** |
| Baseball / basketball / ice hockey / rugby / cricket / tennis | 9 / 7 / 6 / 3 / 3 / 2 | unchanged |
| Swept slugs (all tabs, deduped) | 153 | **157** |
| Football tab / worldwide tab | 102 / 123 | **106 / 127** |
| Leagues with a full standings table | 28 | **30** |
| Leagues with a predictions game | 6 | 6 |

**Every named competition is now fetched, and every fetched competition is
named** — that equality is the new verifier check, so a league can no longer be
advertised and then never requested.

## Gaps found

### 1. Two competitions were named but never fetched (fixed)

`uefa.champions_qual` (UCL Qualifiers) and `uefa.europa_qual` (UEL Qualifiers)
had display names, badges, and preview/report/match-centre entries, but appeared
in **no** sweep tab — so they could never appear. Both return live data from ESPN.
They are now in the Football and Worldwide sweeps, next to the Conference League
qualifier that had been added correctly.

### 2. Kenya and Uganda were missing entirely (fixed)

The two biggest leagues in the site's own backyard were not integrated at all,
even though ESPN serves both a live scoreboard and a complete standings table:

* **`ken.1` — Kenyan Premier League** (AFC Leopards, Gor Mahia, Kenya Police, …)
* **`uga.1` — Ugandan Premier League** (Vipers, KCCA, SC Villa, …)

Both are now fully integrated (sweeps, names, previews, reports, match centre,
standings table + chip + sitemap entry, previews hub).

### 3. Still not integrated — 104 ESPN soccer competitions (needs a decision)

ESPN's own soccer catalogue lists 218 competitions, of which 114 are integrated.
The remaining 104 fall into clear families:

* **Domestic cups and super cups (~25)** — `fra.coupe_de_france`, `esp.copa_de_la_reina`,
  `esp.joan_gamper`, `arg.copa_de_la_superliga`, `bra.camp.carioca`, `bra.camp.paulista`,
  `col.copa`, `chi.copa_chi`, `ned.supercup`, `eng.trophy`, `sco.challenge` …
* **Second tiers and promotion/relegation mini-leagues (~20)** — `arg.2`, `arg.3`,
  `sco.2`, `mex.2`, `uru.2`, and the *X.promotion.relegation* play-offs for England,
  Germany, France, Portugal, Belgium, Netherlands, Sweden, Norway, Russia, Chile, China
* **Confederation and world competitions (~18)** — `concacaf.*` (8), `afc.*` (5),
  `caf.championship`, `caf.cosafa`, `fifa.*` (world qualification play-offs, youth
  World Cups, intercontinental cups)
* **Women's competitions (~12)** — `eng.w.fa`, `eng.w.league_cup`, `ned.w.knvb_cup`,
  `uefa.wchampions_qual`, `uefa.w.europa`, `caf.w.nations`, `afc.w.asian.cup`,
  `fifa.wwc` qualification, `usa.nwsl.cup` …
* **Smaller leagues ESPN added recently (~15)** — `hon.1`, `crc.1`, `gua.1`, `slv.1`
  (Central America), `usa.usl.l1`, `usa.ncaa.m.1` / `.w.1`, `club.friendly`,
  `fifa.shebelieves`, `global.*` cups

Two important caveats:

1. **ESPN's catalogue under-reports.** `ken.1`, `uga.1`, `gha.1`, `cze.1`, `sco.2`
   and others serve live data while being absent from
   `sports.core.api.espn.com/v2/sports/soccer/leagues`. So 104 is a *floor*.
2. **Not every slug is alive.** `pol.1` (Ekstraklasa), `kor.1` (K League) and
   `cro.1` (HNL) return `{"code":400,"message":"Failed to get events endpoint."}` —
   they must not be added. Every addition needs a live check first.

### 4. Standings and predictions are thinner than the sweep

* Only **30 of 127** football competitions render a full table. Cups don't need
  one, but several top divisions the site already sweeps do — e.g. `aus.1`,
  `gre.1`, `sui.1`, `aut.1`, `rus.1`, `ukr.1`, `col.1`, `chi.1`, `ind.1`.
* The predictions game covers **6** leagues (`eng.1`, `esp.1`, `ita.1`, `ger.1`,
  `fra.1`, `uefa.champions`).

## Recommendation

Adding all 104 would roughly double the sweep and is a real load/risk change, so
it needs a decision rather than a silent edit. A safer next step is a curated
batch, in this order:

1. **Top-tier leagues that are alive but missing** — `cze.1` (live, but absent
   from ESPN's own catalogue), `sco.2`, and the Central American divisions
   `hon.1`, `crc.1`, `gua.1`, `slv.1`. The Nordic/Central European divisions
   (`sui.1`, `aut.1`, `den.1`, `swe.1`, `nor.1`, `gre.1`, `rus.1`, `ukr.1`) are
   already in the worldwide sweep.
2. **Standings for the top divisions already swept** — cheap, big SEO win, one
   row each in `standings.js` + `standings.html` + `sitemap.xml`.
3. **Domestic cups for the big five leagues** — they already have names reserved
   in `PREVIEW`/`REPORT`/`MATCH` maps (`fra.coupe_de_france`, `esp.copa_de_la_reina`
   are the notable absences).
4. **Women's competitions** — a deliberate product decision, not a gap to fill silently.

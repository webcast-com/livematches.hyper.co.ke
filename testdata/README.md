# Endpoint samples

Hand-written samples of the two ESPN payloads the site reads, kept in the repo
so a new field can be added (or a parser changed) against a known-good shape
without hitting the network. They replace `espn_test.json`, a PowerShell
`ConvertTo-Json` dump whose nested objects and arrays had been flattened into
literal strings (`team=; statistics=System.Object[]`), which made it useless for
exactly the job the roadmap asked of it.

| File | Real endpoint | Used by |
|------|---------------|---------|
| `espn-scoreboard.sample.json` | `site.api.espn.com/apis/site/v2/sports/soccer/{slug}/scoreboard?dates=YYYYMMDD` | `app.js` (match cards, odds, broadcast), `match.js` (match centre), `preview.js` / `report.js` (form, scorers) |
| `espn-standings.sample.json` | `site.web.api.espn.com/apis/v2/sports/soccer/{slug}/standings?region=us&lang=en&contentorigin=espn` | `standings.js` (tables), homepage standings widget |

Notes:

- They are **samples, not dumps**: one event, and an MLS table trimmed to a few
  clubs per conference. Values are realistic, not live.
- The standings sample is deliberately MLS (`usa.1`) because it is the awkward
  case — `children[]` holds two conferences, each with its own table ranked from
  1. It also covers the common single-table shape, which the verifier checks
  inline.
- These files are in the served root, so `robots.txt` disallows `/testdata/`.

## `live/` — recorded ESPN payloads per sport

`espn-standings.sample.json` is hand-written and soccer-shaped. The prerenderer
now also publishes tables and match snapshots for baseball, American football,
basketball and hockey, whose payloads carry different numbers (innings and
quarters, W-L-PCT-GB standings, nested box scores) — and a parser can only be
written against the real shape. `tools/collect-samples.mjs` records those
payloads:

```
node tools/collect-samples.mjs              # full collection (needs the network;
                                            # the CI job runs this step)
node tools/collect-samples.mjs --probe      # liveness check of every candidate
                                            # slug, writes manifest only
```

It writes `live/<date>/standings.<sport>.<league>.json`,
`scoreboard.<sport>.<league>.<yyyymmdd>.json`,
`summary.<sport>.<league>.<eventId>.json` and a `manifest.json` recording every
league and probe (which slugs are live, which answer 400, how many rows each
table has). The league list comes from `tools/sports.mjs`, so a fixture can
never drift from a page the prerenderer would publish.

`node tools/prerender.mjs --offline` then builds every page from these files —
soccer from the two hand-written samples, the other sports from `live/` — which
is how the sport-aware renderers are tested without network access:

```
node tools/prerender.mjs --offline --out /tmp/check
node testdata/verify.mjs
```

Trimmed: the fixtures hold the fields the parsers read, the opening dozen plays
of each match plus every scoring play, and nothing else (the full play-by-play
alone is megabytes per game).

## Verify

```
node testdata/verify.mjs
```

Runs BOM/JSON checks, asserts every field path the site reads is present and of
the right type, then loads `../standings.js` and parses the samples with the real
`parseStandingsGroups()` — proving both MLS conferences survive, that one-table
and nested payloads still produce one table, and that season labels come off the
payload rather than a hard-coded year. It cross-checks `sitemap.xml` and
`standings.html` against `STANDINGS_LEAGUES`, so the two can no longer drift
apart silently (the reason seven sitemap links used to render the Premier League
table). Since the multi-sport pass it also imports the prerenderer's parsers and
runs them over `live/<date>/` — the NFL, NHL and MLB fixtures must still yield
their conferences, their columns (W/L/PCT/GB, GP/W/L/OTL/PTS) and the right
season label (`seasonLabelForSport()` is pinned against ESPN's habit of rolling
`season.year` over before the new season starts) — and it checks that the
non-soccer table pages stay inside `tools/sports.mjs`, are self-canonical, are
listed in the sitemap, and never hand a reader off to the soccer-only
`report.html`/`preview.html` tools. No dependencies, no network; exits non-zero
on failure.

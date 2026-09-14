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

## Verify

```
node testdata/verify.mjs
```

Runs BOM/JSON checks, asserts every field path the site reads is present and of
the right type, then loads `../standings.js` and parses the samples with the real
`parseStandingsGroups()` — proving both MLS conferences survive, that one-table
and nested payloads still produce one table, and that season labels come off the
payload rather than a hard-coded year. Finally it cross-checks `sitemap.xml` and
`standings.html` against `STANDINGS_LEAGUES`, so the two can no longer drift
apart silently (the reason seven sitemap links used to render the Premier League
table). No dependencies, no network; exits non-zero on failure.

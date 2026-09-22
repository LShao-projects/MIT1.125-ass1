# Cambridge Street Safety Priorities

**Authors: Liuyixin Shao and Mingjiao Diao**

MIT 1.125 · Problem Set 1 — Data Analytics Website

[**Explore the live website →**](https://cambridge-street-safety-priorities.lynnyu.chatgpt.site/?start=2016-01-02&end=2026-09-20&metric=total&map=total)

An interactive explorer of reported crashes in Cambridge, Massachusetts, built to support one planning question: **Where should Cambridge prioritize street safety reviews?** The dashboard helps transportation planners and road safety teams compare locations, road-user groups, and time patterns to identify priorities for field reviews and further analysis.

The website is publicly hosted on ChatGPT Sites and includes the recorded presentation. Visitors can open it without running this repository locally.

## Explore the project

- **Interactive dashboard:** yearly crash trends, intersection rankings, hourly patterns, a neighborhood map, and a sortable neighborhood comparison table.
- **Filters and comparisons:** date range, year, neighborhood, road-user mode, weekday/weekend, injuries, and estimated hospitalizations. URL parameters preserve selections for sharing.
- **Findings and recommendations:** interpretations of the full source snapshot, with suggested follow-up reviews. Dashboard metrics update with filters; the written findings retain their stated full-period scope.
- **Project materials:** dataset download, data cleaning and methodology, recorded presentation, and reflection on the [deliverables page](https://cambridge-street-safety-priorities.lynnyu.chatgpt.site/deliverables.html).
- **Accessibility:** responsive layouts, keyboard controls, chart-value tables, and reduced-motion support.

## Data and limitations

The project uses a saved CSV snapshot of the [Cambridge Police Department Crash Log](https://data.cambridgema.gov/d/h6fp-bp8s), covering **January 2, 2016–September 20, 2026**, downloaded on September 21, 2026. Each row represents one reported crash. See the City's [Vision Zero information](https://www.cambridgema.gov/streetsandtransportation/policiesordinancesandplans/visionzero) for reporting context.

The website reads the included dataset in the browser; it does not refresh automatically from the source API.

- Crash counts do not measure risk per trip because traffic, walking, and cycling exposure data are unavailable.
- Unreported crashes and near misses are not captured.
- Neighborhood assignments and hospitalization counts are estimates; missing locations limit geographic comparisons.
- Road-user categories overlap, so their counts should not be added together.
- 2026 is a partial year. Compare equivalent date ranges when assessing changes over time.
- Observed associations cannot establish causes or the effects of safety interventions.

This is an independent student project, not an official City of Cambridge product.

## Run locally

The website uses plain HTML, CSS, and JavaScript. There are no runtime npm package dependencies and no `npm install` step is required.

With Python 3 installed, run from the repository root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173). If Node.js and npm are installed, `npm start` runs the same server. Press `Ctrl + C` to stop it.

Use a web server rather than opening `index.html` directly: browsers can block local CSV and GeoJSON requests when pages are opened as files.

## Build and validate

Requires Node.js 20+ and npm.

```bash
npm test
npm run build
```

The tests cover CSV parsing, date handling, street normalization, filters, missing values, map geometry, and reconciliation with independently calculated dataset totals. The build collects the website, datasets, and presentation video into `dist/`.

For optional browser checks, start the local server and run:

```bash
node tests/browser.cjs
```

These checks require Chrome and an installed Playwright package. Set `PLAYWRIGHT_MODULE` to its location if needed; `PREVIEW_URL` can override the local address. Results are written to `docs/browser-verification.json`, with screenshots in the temporary directory.

## Repository guide

| Path | Contents |
| --- | --- |
| `index.html` | Interactive dashboard, findings, and recommendations |
| `deliverables.html` | Methodology, presentation, and reflection |
| `css/` | Layout, themes, and responsive styles |
| `js/` | Data processing, shared filters, charts, and map |
| `data/` | Crash CSV and neighborhood boundary GeoJSON |
| `media/presentation.mp4` | Recorded project presentation |
| `scripts/build.mjs` | Static-site build script |
| `tests/` | Automated checks and independent reference calculations |

## Publication

The live website is hosted on **ChatGPT Sites**; this GitHub repository contains the project source. Pushing changes to GitHub does not automatically update the live website. Website changes must also be built and published through Sites.

If the dataset changes, refresh the independent calculations in `tests/oracle.json`, review the coverage dates and definitions, and rerun validation before publishing.

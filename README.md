# Cambridge Street Safety Priorities

A responsive, static data explorer for Cambridge transportation and Vision Zero planners. All metrics, charts, findings, and recommendations are calculated in the browser from `data/cambridge_crashes.csv`.

## Preview

Run `npm start` (requires Python 3), then open http://127.0.0.1:4173. A web server is needed because browsers restrict CSV fetching when opening an HTML file directly.

There are no runtime package dependencies. Run `npm run build` to collect only the deployable website and CSV into `dist/`, or serve `index.html`, `css/`, `js/`, and `data/` together. Paths are relative and support hosting in a subdirectory. This project has not been published: ChatGPT Sites returned “Sites is not yet enabled for this workspace.”

## Features

- Shared year/date, neighborhood, road-user, injury, and hospitalization filters.
- Shareable selection through URL parameters; reset, empty, loading, and retry states.
- Yearly mode trend, intersection ranking measures, hourly distribution, and sortable neighborhood comparison.
- Recalculated findings and practical review recommendations.
- Accessible chart-value tables, keyboard-native controls, reduced-motion behavior, and responsive internal scrolling.
- Visible data limitations and source/cleaning documentation.

## Validate

`npm test` runs CSV parsing, date handling, street normalization, filter, missing-value, and full-dataset reconciliation checks with Node 20+.

`tests/oracle.json` records independent Python calculations for the supplied snapshot. If replacing the CSV, refresh these reference calculations and review the data coverage and field definitions.

`tests/browser.cjs` exercises desktop, tablet, and mobile in Chrome with Playwright. Use an installed Playwright package (`PLAYWRIGHT_MODULE` can point to it), run the preview server, then run `node tests/browser.cjs`. `PREVIEW_URL` can override the preview address. Results are saved in `docs/browser-verification.json`; screenshots go to the temporary directory.

## Source and caveats

- [Cambridge CPD Crash Log](https://data.cambridgema.gov/d/h6fp-bp8s)
- [Cambridge Vision Zero](https://www.cambridgema.gov/streetsandtransportation/policiesordinancesandplans/visionzero)

This local snapshot is not automatically refreshed. Counts do not measure exposure-adjusted risk. 2026 is partial. Hospitalizations and neighborhoods are estimated; missing locations and inconsistent street naming limit comparisons. Road-user categories overlap. This is an independent student project, not an official City product.

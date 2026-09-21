# Verification

## Data and browser checks
- The Node tests validate CSV quoting, local timestamps, conservative normalization, missing numeric values, inclusive dates, combined filters, and snapshot totals against independent Python calculations.
- `browser-verification.json` records the completed Chrome checks, including selected totals, chart/table reconciliation, global filter intersections, URL restoration, sorting, invalid dates, no-results states, reset, keyboard focus, reduced motion, CSV load failure/retry, and no page-level overflow at 1440, 768, 390, and 320 CSS pixels.
- `accessibility-verification.json` records axe-core WCAG A/AA and best-practice scans at desktop and phone widths. Automated checks do not establish full accessibility conformance or replace assistive-technology testing.
- Desktop and phone screenshots were visually inspected. Native controls use the operating system's date/select popups; popup interaction across every platform is not verified.

## Supplemental static audit
The premium UI auditor recognizes native control ownership from `premium-ui.json`. Its remaining `affordance.actionless-button` findings are false positives: it detects inline handlers, but does not trace this application's external `addEventListener` bindings. Reset, metric toggles, and sort controls have functional browser coverage. The original report is preserved in `premium-audit.json`; it is not reported as a clean strict audit.

## Publication
The user's request to publish through ChatGPT Sites was attempted. Sites returned `Sites is not yet enabled for this workspace.` No Site ID, deployment, or public URL was created. The application remains available locally and can be published once hosting is enabled. Static publication output is produced with `npm run build`.

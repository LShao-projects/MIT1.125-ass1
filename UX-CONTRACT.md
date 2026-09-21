# Cambridge explorer behavior

Source: the user's website brief and `.agents/skills/ps1-data-analytics/references/assignment-guidance.md`. No existing application or sibling screen preceded this implementation.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native select in index.html | User brief; DESIGN.md | Platform popup accepted | tests/browser.cjs keyboard and filter checks |
| Date | Native date inputs | User brief; source CSV calendar coverage | Platform popup accepted | Inclusive bounds and invalid-range tests |
| Form | #filters, js/app.js | Current state shared across all results | AND filters, explicit reset | Combined-filter and URL checks |
| Scrollbar | css/styles.css global baseline | DESIGN.md | Internal chart/table scrolling | Narrow-width overflow checks |
| Tables | renderTable and semantic table | CSV aggregation | Render all neighborhoods, sort locally | Sum and sort checks |
| Feedback | #load-status, #date-error, #scope | CSV load and selection state | Loading, error/retry, live count | Browser failure/retry and empty checks |

All neighborhoods are rendered intentionally: the supplied dataset has a small finite set. No row selection, pagination, CRUD, authentication, monetary action, or external write exists. The website never sends the dataset to an external service. Only aggregate results are displayed; individual street numbers are not shown.

Filters, ranking metric, and sort are reflected in URL query parameters. Reset clears global filters, retaining independent ranking and sorting preferences. Invalid date ranges retain the last valid rendered results and show that fact in an inline error. Labels, units, unknown data, and partial periods remain visible on small screens. Source export downloads the original user-supplied CSV.

## Data semantics
One source row is one reported crash. Mode flags overlap. Injury KPI counts records with injured individuals > 0; estimated hospitalization KPI sums people, not records. Hospitalization filter selects records with estimated hospitalizations > 0. Unknown numeric data remains null. Reversed street pairs merge after conservative abbreviation normalization. Missing neighborhoods remain an explicit category. No fabricated geocoding, causal inference, or annualization.

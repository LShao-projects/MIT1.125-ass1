# Source fields and derived measures

The supplied CSV has one reported crash per row. The original download date is unknown. The site reports its coverage and quality counts directly from the loaded file.

| Source field | Handling and use |
|---|---|
| Date Time | Explicit `YYYY Mon DD hh:mm:ss AM/PM` parser; local calendar date/hour retained without timezone conversion. Invalid dates excluded and counted. |
| Intersection Street One / Two | Trim, collapse whitespace, remove periods, standardize case, expand common street-type abbreviations, alphabetically order the pair. Both required for intersection rankings. |
| Address Street Number / Name | Not displayed or used to infer an intersection. |
| Number of Motorists | Nonnegative integer or unknown; >0 means motorist-involved. |
| Number of Cyclists | Nonnegative integer or unknown; >0 means cyclist-involved. |
| Number of Pedestrians | Nonnegative integer or unknown; >0 means pedestrian-involved. |
| Number of Injured Individuals | Nonnegative integer or unknown; >0 defines an injury crash. |
| Hospitalizations (estimated) | Nonnegative integer or unknown; summed as estimated people, >0 for the hospitalization filter. |
| Neighborhood (estimated) | Whitespace trimmed; blanks mapped to Unknown / not recorded. |

Mode series overlap. Walking/cycling KPI uses an OR condition and counts each row once. Percentages use all selected crashes as denominator unless labeled as a neighborhood injury share. Unknown numeric fields do not satisfy positive-count filters. No imputation, fuzzy street matching, or causal estimation is performed. Exact duplicate rows are counted but retained because there is no unique incident identifier. The supplied file has no exact duplicates.

Trend partial-period shading covers the source's latest incomplete calendar year and years clipped by the current date filter. Partial points are disconnected. No annualized estimate or year-over-year percentage is calculated. Data supports reviewing concentrations and collecting exposure/context data; it cannot establish causes, complete crash incidence, verified hospital admissions, or individual travel risk.

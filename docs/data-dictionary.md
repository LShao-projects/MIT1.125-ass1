# Source fields and derived measures

The supplied CSV has one reported crash per row. The CSV was downloaded on September 21, 2026, as confirmed by the project team. The site reports its coverage and quality counts directly from the loaded file.

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

Trend partial-period shading covers the source's latest incomplete calendar year and years clipped by the current date filter. For this snapshot, the default 2016 view and the 2016 year selection use a note instead of a partial label: there are no January 1 records, but this does not establish whether records are missing or no crashes were reported that day. Custom ranges that further shorten 2016 are still marked partial. Partial points are disconnected. No annualized estimate or year-over-year percentage is calculated. Data supports reviewing concentrations and collecting exposure/context data; it cannot establish causes, complete crash incidence, verified hospital admissions, or individual travel risk.

Injury-field check: only one record in each of 2016, 2017, and 2018 has a positive recorded injury count. These source values are retained, but their completeness and reporting consistency are unverified. Do not interpret zero as evidence of no injury or compare injury severity across locations or years without checking the source reports.

Day type is derived from the source local calendar date: Monday–Friday is weekday, Saturday–Sunday is weekend; public holidays are not reclassified. It combines with other filters using AND and is saved in the URL. All charts retain crash-count units, without adjustment for the number of weekdays/weekend days. Full-snapshot comparison: 12,236 weekday crashes over 2,795 calendar weekdays and 3,272 weekend crashes over 1,120 calendar weekend days, including zero-record days between January 2, 2016 and September 20, 2026. Daily averages are descriptive frequencies, not travel-exposure risk rates.

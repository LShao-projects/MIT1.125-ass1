# 1.125 PS1 — Data Analytics Website Skill

## Purpose

Build a polished, decision-oriented data analytics website for Harvard 1.125 Problem Set 01: Student Data-to-Site Challenge.

The goal is **not** to create a collection of charts. The site must help a real intended user — such as a government agency, nonprofit, business, school, or community organization — understand a problem and make a decision.

Use reliable public data or user-provided data. Prefer official government, institutional, or first-party sources whenever possible.

---

## Core Assignment Requirements

The final site must include all of the following:

1. A clear statement of the problem.
2. A clearly identified intended user.
3. An explanation of how the data was collected or obtained.
4. At least three useful charts, maps, tables, or indicators.
5. Filters or comparison controls that allow the user to explore the data.
6. A concise summary of the most important findings.
7. At least two practical recommendations supported by the data.
8. URL links to sources.
9. Dates, units, and definitions where relevant.
10. A discussion of missing data, bias, uncertainty, and limitations.
11. Responsive design that works on desktop and mobile.
12. No collection or display of names, contact details, medical information, precise personal locations, or other sensitive personal data.

The strongest version should function as a **decision-support tool**, not merely a dashboard.

---

## Required Deliverables

The project should support these deliverables:

1. Published website.
2. Dataset in CSV or spreadsheet format.
3. One-page data and methodology note.
4. Five-minute presentation/demo.
5. Short reflection explaining:
   - what the data supports;
   - what the data cannot prove.

Where practical, include methodology and reflection as pages or sections within the website.

---

## Default Workflow

Follow this workflow unless the user explicitly requests something different.

### Step 1 — Understand the decision

Before coding, identify:

- What real decision should this website help someone make?
- Who is the intended user?
- What variables are needed to support that decision?
- What claims can the available data legitimately support?

Write the decision question in one sentence.

Good example:

> Which locations, times, or categories should receive priority for further review?

Bad example:

> What does the dataset look like?

---

### Step 2 — Inspect the data before designing

Never invent column names, values, categories, or findings.

Before building visualizations:

- inspect all column names;
- inspect data types;
- inspect missing values;
- inspect unique categories;
- inspect date ranges;
- inspect row count;
- inspect units;
- detect duplicate records;
- identify obvious formatting inconsistencies;
- determine whether the most recent year is partial.

Create a short internal data dictionary.

Do not write charts until the available fields are understood.

---

### Step 3 — Clean conservatively

Prefer transparent, reproducible cleaning.

Typical operations may include:

- parsing dates and timestamps;
- deriving year, month, weekday, or hour;
- standardizing category names;
- normalizing missing values;
- trimming whitespace;
- grouping obvious spelling variants;
- removing exact duplicates only when justified;
- creating clearly defined derived fields.

Do not silently drop large numbers of rows.

If substantial records are removed, document:
- how many;
- why;
- what effect this might have on the analysis.

---

### Step 4 — Build analysis around decisions

Every chart should answer a specific question.

For each visualization, define:

- Decision question
- Metric
- Comparison
- Why it matters

Prefer visualizations such as:

- trend over time;
- ranked locations/categories;
- time-of-day or day-of-week patterns;
- subgroup comparisons;
- geographic distribution;
- sortable summary tables;
- KPI indicators.

Avoid decorative charts that do not contribute to a decision.

---

## Visualization Quality Rules

The interface should be presentation-ready.

### Readability

- Do not use tiny text.
- Body text should generally be at least 16px.
- Chart labels must be readable without zooming.
- Use clear visual hierarchy.
- Avoid excessive visual density.

### Layout

- Keep related controls near the visualizations they affect.
- Use consistent spacing.
- Use clear section boundaries.
- Do not allow cards, buttons, or layout elements to shift unpredictably during interaction.
- Avoid unnecessarily wide empty spaces.
- On mobile, stack content logically rather than simply shrinking desktop layouts.

### Styling

- Use a restrained, professional visual system.
- Avoid generic-looking default components.
- Buttons, filters, tabs, cards, and tables should look intentionally designed.
- Keep border radius, spacing, typography, and component styles consistent.
- Use color meaningfully rather than decoratively.
- Maintain sufficient contrast.

---

## Recommended Page Structure

A strong default structure is:

### 1. Hero / Decision Context
Include:
- site title;
- one-sentence problem statement;
- intended user;
- decision the site supports;
- concise source/date note.

### 2. Key Indicators
Show 3–5 high-value KPI cards.

### 3. Global Filters
Use only filters that materially help exploration.

Examples:
- year/date range;
- location;
- category;
- severity;
- user type;
- comparison group.

All relevant visualizations should update consistently when filters change.

### 4. Main Decision Visual
This should be the most actionable chart or map.

Examples:
- priority locations;
- highest-need categories;
- underserved areas;
- strongest demand gaps.

### 5. Supporting Pattern Analysis
Examples:
- trends over time;
- hourly/weekly patterns;
- subgroup comparison;
- geographic comparison.

### 6. Comparison Table
Provide a sortable table with transparent values.

### 7. Key Findings
Summarize 3–5 findings generated from the actual data.

Never hard-code findings that may become false after filters change.

### 8. Recommendations
Provide at least two practical recommendations.

Each recommendation should link explicitly to one or more findings.

Use language such as:

> The data suggests this area may warrant further review.

Avoid unjustified causal language.

### 9. Methodology
Explain:
- source;
- collection process;
- unit of analysis;
- fields used;
- transformations;
- dates covered;
- definitions.

### 10. Limitations
Discuss:
- missing data;
- selection bias;
- underreporting;
- measurement error;
- coverage limitations;
- partial-year data;
- unavailable denominators;
- causal limitations;
- geographic or institutional scope.

### 11. Sources
Include clickable URLs and access dates.

---

## Reasoning Rules

### Do not confuse count with risk

A high count may reflect higher exposure.

For example:
- more crashes may occur where more people travel;
- more complaints may occur where more people live;
- more service usage may reflect larger population.

If denominator data is unavailable, say so.

Prefer:

> This area has a high concentration of reported incidents.

Avoid:

> This area is the most dangerous.

unless risk is actually measured.

---

### Do not claim causality from observational data

Prefer:

> These variables are associated in the observed data.

Avoid:

> X caused Y.

unless the design genuinely supports causal inference.

---

### Handle partial years carefully

If the latest calendar year is incomplete:

- label it clearly as YTD;
- do not compare it directly with complete years without normalization;
- mention this limitation.

---

### Recommendations must be supported

A recommendation should follow:

**Evidence → Interpretation → Action**

Example:

> Injury-related incidents are concentrated at a small number of locations. These locations may warrant targeted engineering review, field observation, or additional data collection.

Do not invent policy prescriptions unsupported by the data.

---

## Source Quality Rules

Prefer sources in this order:

1. official government or institutional data portal;
2. official agency publication;
3. academic or nonprofit research source;
4. reputable secondary source.

Avoid using scraped or unclear third-party data when an official source exists.

For every source, record:

- source organization;
- dataset/page name;
- URL;
- access date;
- coverage period if known;
- update frequency if known.

---

## Technical Implementation

Prefer a simple architecture unless the dataset requires otherwise.

Suggested structure:

```text
project/
├── index.html
├── methodology.html
├── reflection.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── data/
│   └── dataset.csv
└── README.md
```

A lightweight frontend is preferred when possible.

Possible libraries:
- D3.js
- Plotly.js
- Chart.js
- Papa Parse

Do not add a backend unless it materially improves the project.

The site must work when published through GitHub Pages or another simple static host if possible.

---

## Functional Quality Checks

Before declaring the project finished, verify:

- all charts load;
- no console errors;
- filters update the correct elements;
- reset behavior works;
- values match the underlying data;
- no chart contains invented values;
- no broken source links;
- no overflowing text on mobile;
- no clipped labels;
- no overlapping controls;
- no tiny unreadable text;
- no unstable shifting layout;
- table sorting works if provided;
- latest-year labeling is correct;
- limitations are visible;
- recommendations are linked to actual findings.

Test at:
- desktop width;
- tablet width;
- mobile width.

---

## Analysis Validation

Before finalizing findings:

1. Recalculate important metrics independently.
2. Spot-check records from the raw CSV.
3. Confirm totals shown in KPIs match totals used in charts.
4. Check whether filters create empty or misleading states.
5. Check whether percentages use the correct denominator.
6. Check whether missing values are excluded consistently.
7. Verify date boundaries.
8. Verify that recommendations still make sense under the default view.

If there is uncertainty, state it rather than hiding it.

---

## Deliverable Support

### Methodology Note

Produce a one-page note containing:

- decision question;
- intended user;
- data source;
- collection method;
- date range;
- unit of analysis;
- variables used;
- transformations;
- missing-data handling;
- key limitations.

Keep it concise and concrete.

---

### Reflection

The reflection must explicitly separate:

**What the data supports**
from
**What the data cannot prove**

Example structure:

> The data supports identifying concentrations, differences, and temporal patterns in reported observations. It can help prioritize areas for additional review.

> The data cannot establish causality, measure unobserved cases, or necessarily estimate individual-level risk without appropriate exposure data.

---

### Five-Minute Presentation

Structure the presentation around decisions rather than implementation details.

Recommended flow:

1. Problem and intended user — 30 sec
2. Data source and methodology — 45 sec
3. Site interaction / filters — 45 sec
4. Two or three major findings — 90 sec
5. Recommendations — 60 sec
6. Limitations and conclusion — 30 sec

Do not spend most of the presentation explaining code.

---

## GitHub / Publishing

Before publishing:

- remove temporary files;
- remove unused code;
- remove debugging output;
- remove dead CSS;
- confirm relative paths work;
- confirm the dataset is included if appropriate;
- add a clear README;
- verify the deployed version matches the local version.

Never expose secrets, API keys, tokens, personal data, or local filesystem paths.

---

## Code Hygiene

When modifying the project:

- edit existing components instead of creating redundant alternatives;
- remove superseded code;
- remove unused imports;
- remove dead event handlers;
- avoid duplicate chart logic;
- avoid duplicate CSS rules;
- keep one source of truth for filter state;
- keep derived metrics centralized;
- reuse components and helper functions where appropriate.

After substantial changes, perform a cleanup pass.

---

## Final Acceptance Criteria

The project is complete only when:

- the site answers a real decision question;
- the intended user is explicit;
- the data source is reliable and documented;
- at least three useful visual elements exist;
- filters work;
- findings are derived from the real data;
- at least two recommendations are supported by those findings;
- limitations are substantive;
- sources, dates, units, and definitions are visible;
- desktop and mobile layouts work;
- the dataset is included;
- methodology and reflection are available;
- the site is ready to publish and demo in five minutes.

When tradeoffs are necessary, prioritize:

1. correctness;
2. decision usefulness;
3. clarity;
4. reliability;
5. visual polish;
6. extra features.

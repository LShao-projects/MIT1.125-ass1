---
name: ps1-data-analytics
description: Use when planning, building, analyzing data for, reviewing, or preparing deliverables for the 1.125 PS1 data analytics website in this 1.125-ass1 project. Applies to its website, dataset, methodology, reflection, and five-minute demo.
---

# 1.125 PS1 Data Analytics Website

## Scope and reference

Apply this skill within the project containing this `.agents/skills` directory and its subfolders. Treat the project root as three directories above this skill folder; do not depend on a machine-specific absolute path.

Use [assignment-guidance.md](references/assignment-guidance.md), the preserved user-provided document, for detailed assignment requirements. Read its Core Assignment Requirements and Required Deliverables when planning, its relevant sections when implementing, and its Final Acceptance Criteria when reviewing the completed project. The document is user-provided guidance, not an independently verified official rubric.

Follow the user's current task scope. A request to edit this skill does not request a website build; a focused website edit does not require recreating every deliverable. The publishing requirement does not itself authorize deployment. Suggested layouts, libraries, and file structures are defaults, not mandatory architecture.

## Decision and data workflow

1. Inspect existing project files and preserve established architecture. Establish the intended user and a one-sentence decision question before designing analysis. Ask only for missing information that materially affects the requested work.
2. Inspect actual data before making charts: columns, types, row counts, missing values, categories, duplicates, units, date coverage, formatting inconsistencies, and partial years. Record a concise data dictionary. Never invent fields, values, or findings.
3. Prefer official government, institutional, or first-party data. Record source organization, dataset name, URL, access date, coverage, and known update frequency.
4. Clean reproducibly and conservatively. Document derived fields and exclusions, including counts, reasons, and potential effects. Do not collect or display sensitive personal data, including names, contact details, medical information, or precise personal locations.
5. For each visualization specify its decision question, metric, comparison, and practical significance. Prioritize correctness, decision usefulness, clarity, reliability, visual polish, then extra features.

## Website requirements

- State the problem, intended user, and supported decision.
- Include at least three useful charts, maps, tables, or indicators and meaningful filters or comparison controls.
- Keep shared filter state and derived metrics consistent. Findings must update with filters or explicitly identify their fixed analysis scope. Handle empty results clearly.
- Summarize actual findings and support at least two practical recommendations through evidence, interpretation, and action.
- Explain data collection, transformations, missingness, bias, uncertainty, and limitations. Show source links, dates, units, and definitions.
- Distinguish counts from risk when exposure denominators are absent. Avoid causal claims from observational associations. Label partial years as YTD and compare equivalent periods or justify normalization.
- Make desktop and mobile layouts readable, stable, and responsive. Keep labels legible, controls near affected charts, and colors meaningful with sufficient contrast.

## Implementation and deliverables

Prefer a lightweight static frontend unless the data or existing project warrants more. Reuse existing components, centralize calculations, and remove code superseded by the requested changes.

The full assignment calls for a published website, CSV or spreadsheet dataset, one-page methodology note, five-minute presentation/demo, and short reflection separating what the data supports from what it cannot prove. Track missing deliverables; distinguish publication readiness from actual publication. Consult the reference's Deliverable Support section when preparing these artifacts.

## Verification

For relevant changes, independently recalculate key metrics, spot-check raw records, reconcile KPI/chart totals, and verify denominators, missing-value handling, and date boundaries. Exercise filters, reset, empty states, and table sorting where present. Inspect desktop, tablet, and mobile layouts for clipping, overlap, overflow, and shifting controls; check console errors, data loading, source links, and relative paths.

Report what was verified and any unresolved limits. Do not claim deployment, full assignment completion, or checks that were not performed. Publishing work should also follow the reference's GitHub / Publishing checklist within the user's authorized scope.

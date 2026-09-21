---
version: alpha
name: Cambridge Street Safety Priorities
description: A civic planning workbench shaped by crossing markings and clear transportation diagrams.
colors:
  ink: "#183537"
  muted: "#52686b"
  primary: "#124d50"
  accent: "#167765"
  blue: "#346bb3"
  orange: "#a55820"
  paper: "#f5f8f7"
  surface: "#ffffff"
  line: "#d7e2df"
  tint: "#e8f2ee"
  warning: "#fff3df"
typography:
  display:
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif'
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
rounded:
  DEFAULT: "12px"
  control: "6px"
spacing:
  page-max: "1280px"
  section: "60px"
components:
  panel:
    rounded: "12px"
  control:
    rounded: "6px"
---
# Cambridge Street Safety Priorities

## Overview
Product register: a civic evidence workbench for Cambridge transportation and Vision Zero planners, in US English. The user's brief is the product authority; the provided CPD CSV is the numerical authority. The signature is a restrained crossing-mark motif paired with a large green title. It suggests a street review, without inventing a map or official city identity. Avoid marketing gradients, fictional maps, decorative charts, and crisis-red dashboards.

Runtime ownership: `css/styles.css` contains the canonical CSS variables. The matching colors above document those variables one-to-one; `--body`, `--display`, `--page`, and `--radius` implement typography, width, and panel shape. SVG charts consume these variables directly. No external fonts or runtime libraries are required.

## Colors
White panels on a pale green-gray canvas. Deep teal anchors navigation and recommendations; green, blue, and amber identify motorist, cyclist, and pedestrian involvement. Partial periods receive a pale amber band and text label. Color never carries a filter state or uncertainty alone. Only light mode is designed; forced colors remain operable.

## Typography
Avenir Next for display headings on supported systems, Segoe UI and sans-serif fallbacks; system sans for controls and prose. Large, tightly spaced headings contrast with quiet utility labels. Numerals are tabular. Body baseline is 16px; secondary captions may be smaller. No downloaded font changes layout after loading.

## Layout
A 1280px centered workbench. Hero precedes filter panel, four statistics, trend and intersection panels, hourly chart, comparison table, findings, limitations, and source notes. At 900px charts stack and statistics become two columns. At 600px controls rearrange and narrative content becomes one column. Tables and dense chart axes scroll inside labeled, keyboard-focusable regions; the document itself never needs horizontal scrolling.

## Elevation & Depth
Borders and tonal backgrounds establish hierarchy. No floating overlays, drop shadows, or sticky filters obscure analytical space. All content uses natural document scrolling.

## Shapes
12px panels, 6px controls, restrained small pills. Crossing stripes are the only expressive motif. Horizontal bars have small radii and share a common scale within their chart.

## Components
Native selects and date fields intentionally accept platform-owned popup geometry and keyboard behavior. All controls are labeled, pointer targets have hover and focus feedback, and date validation is inline. Loading and failure have a persistent status region with retry; filters remain disabled until valid data arrives. Empty selections receive explicit zero totals and no asserted priority.

Trend series use color and different stroke patterns. Partial-year points are disconnected from complete years. Expandable tables provide all chart values. Ranking bars show exact counts directly. Table sort headers are native buttons with `aria-sort`. Filter state and sort are shareable in the URL. No animated number counting; reduced motion disables smooth scrolling.

## Do's and Don'ts
- Keep exact quantities tied to the selected CSV records.
- Keep uncertainty next to the affected metric, not only in methodology.
- Do not infer causal effects, personal risk, or official city endorsement.
- Do not fabricate geographic relationships or hide missing locations.

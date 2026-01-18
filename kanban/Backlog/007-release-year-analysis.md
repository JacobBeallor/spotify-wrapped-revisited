# Add release year/decade analysis

---
**id:** 007  
**priority:** P1  
**size:** M  
**epic:** Data Enrichment & Analytics  
**created:** 2026-01-18  
**tags:** feature

---

## Title

Add release year/decade analysis visualization

## Dependencies

**blocked_by:** [005]  
**blocks:** []  
**parallel_with:** [006]

## Context

With track metadata enriched, we can analyze listening preferences by release decade. This reveals:
- Are you into classics (60s, 70s) or modern music?
- What's your favorite musical era?
- How have your decade preferences changed over time?

The `/api/release-years` endpoint already exists with decade grouping support.

## Acceptance Criteria

Frontend components:
- [ ] Create ReleaseYearChart component
- [ ] Show distribution by decade (bar chart or area chart)
- [ ] Display top decades with hours and percentages
- [ ] Add "All-time favorite decade" stat or callout
- [ ] Optional: Toggle between decade and year-by-year view

Features:
- [ ] Filter by listening date range (not release date)
- [ ] Handle tracks without release year data gracefully
- [ ] Show decade evolution over time (bonus feature)

Polish:
- [ ] Add section title and description
- [ ] Responsive design
- [ ] Loading and error states
- [ ] Consider adding "Hipster score" metric (preference for older music)

## Implementation Notes

**Approach:**
- Use existing `/api/release-years?groupBy=decade` endpoint
- Create component in `components/ReleaseYearChart.tsx`
- Use ECharts for visualization
- Add to dashboard in new "Music Era" section

**Key files:**
- `components/ReleaseYearChart.tsx` (new)
- `app/page.tsx` — Add component
- `app/api/release-years/route.ts` (already exists)

**Visualization options:**
1. **Bar chart** — Simple decade comparison
2. **Stacked area chart** — Show decade evolution over time
3. **Combination** — Bar for current, line for trends

**Decade labels:**
- 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, 2020s

**Bonus features:**
- Decade evolution: How decade preferences changed year-over-year
- "Hipster score": Percentage of listening from pre-2000 music
- Newest vs oldest track stats

**Considerations:**
- Some tracks may not have release year
- Need clear messaging for missing enrichment data
- Decade calculation must match backend (1970s = 1970-1979)

## Test Plan

- [ ] Test with enriched data
- [ ] Test without enrichment (show helpful message)
- [ ] Test with date range filters
- [ ] Verify decade groupings are correct
- [ ] Test decade evolution view (if implemented)
- [ ] Test on mobile and desktop
- [ ] Verify percentages sum to 100%

## Status History

- 2026-01-18: Created → Backlog (blocked by #005)


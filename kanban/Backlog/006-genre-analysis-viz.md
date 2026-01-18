# Add genre analysis visualization

---
**id:** 006  
**priority:** P1  
**size:** M  
**epic:** Data Enrichment & Analytics  
**created:** 2026-01-18  
**tags:** feature

---

## Title

Add genre analysis and visualization to dashboard

## Dependencies

**blocked_by:** [005]  
**blocks:** []  
**parallel_with:** [007]

## Context

With artist metadata enriched from Spotify API, we can now show users their genre preferences. This answers questions like:
- What genres do I listen to most?
- Am I more into rock, hip-hop, or electronic?
- How diverse are my genre preferences?

The `/api/genres` endpoint already exists and returns genre data.

## Acceptance Criteria

Frontend components:
- [ ] Create GenreChart component
- [ ] Choose visualization type (pie chart, bar chart, or treemap)
- [ ] Show top 10-15 genres
- [ ] Display hours and percentage per genre
- [ ] Add to main dashboard in appropriate section

Data handling:
- [ ] Handle genres with commas (split and dedupe)
- [ ] Filter by active date range
- [ ] Sort by hours descending
- [ ] Handle case where no enrichment data exists (show message)

Polish:
- [ ] Add section title and description
- [ ] Responsive design for mobile
- [ ] Loading and error states
- [ ] Consider color scheme for genres

## Implementation Notes

**Approach:**
- Use existing `/api/genres` endpoint
- Create new component in `components/GenreChart.tsx`
- Use ECharts (already in project) for visualization
- Add to dashboard below Artist Evolution or in new section

**Key files:**
- `components/GenreChart.tsx` (new)
- `app/page.tsx` — Add GenreChart component
- `app/api/genres/route.ts` (already exists)

**Visualization options:**
1. **Pie chart** — Good for showing proportions
2. **Bar chart** — Better for comparing many genres
3. **Treemap** — Interesting for hierarchical view

**Considerations:**
- Genre data may have inconsistencies (capitalization, spelling)
- Some tracks/artists may not have genre data
- Need to handle "no enrichment data" gracefully
- Consider limiting to top N genres for clarity

## Test Plan

- [ ] Test with enriched data (full genre list)
- [ ] Test without enrichment (should show helpful message)
- [ ] Test with date range filters
- [ ] Verify hours and percentages calculate correctly
- [ ] Test on mobile and desktop
- [ ] Test with various genre counts (few vs many)
- [ ] Verify chart colors are distinguishable

## Status History

- 2026-01-18: Created → Backlog (blocked by #005)


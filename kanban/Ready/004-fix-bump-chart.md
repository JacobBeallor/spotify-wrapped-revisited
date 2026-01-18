# Fix artist evolution bump chart styling

---
**id:** 004  
**priority:** P2  
**size:** S  
**epic:** UI/UX Improvements  
**created:** 2026-01-18  
**tags:** bug, enhancement

---

## Title

Fix artist evolution bump chart design and styling issues

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** []

## Context

The bump chart was working well but TypeScript errors led to removing some visual customizations. The chart now lacks:
- Dynamic line width (should be thicker for top ranks)
- Proper point visibility (should hide points on "..." overflow row)
- Custom grid lines (should only show ranks 1-5)

These features made the chart more readable and professional-looking.

## Acceptance Criteria

- [ ] Restore dynamic line width (top ranks = thicker lines)
- [ ] Fix point visibility (hide points on "..." row)
- [ ] Adjust grid lines to only show ranks 1-5
- [ ] Improve legend placement and readability
- [ ] Better responsive behavior on mobile
- [ ] Smoother animations/transitions

## Implementation Notes

**Approach:**
- Review Nivo ResponsiveBump prop types
- May need `any` type assertions for custom props
- Reference previous working implementation
- Test with actual data to verify visual improvements

**Key files:**
- `components/ArtistEvolutionChart.tsx`

**Reference:**
- `docs/archive/ARTIST_EVOLUTION.md` — Original design documentation
- Previous commits with working customizations

**Considerations:**
- Nivo type definitions may be incomplete
- May need to use `as any` for certain props
- Balance between type safety and functionality
- Test with different data sets (5 artists, 3 artists, etc.)

## Test Plan

- [ ] Verify dynamic line widths show properly
- [ ] Check that "..." row points are hidden
- [ ] Confirm grid lines only show for ranks 1-5
- [ ] Test responsive behavior on mobile
- [ ] Verify animations are smooth
- [ ] Test with different topN values (3, 5, 10)

## Status History

- 2026-01-18: Created → Ready


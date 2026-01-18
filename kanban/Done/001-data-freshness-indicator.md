# Add data freshness indicator to dashboard

---
**id:** 001  
**priority:** P1  
**size:** XS  
**epic:** UI/UX Improvements  
**created:** 2026-01-18  
**tags:** enhancement, quick-win

---

## Title

Add data freshness indicator to dashboard

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** [003]

## Context

Users need to know when their data was last updated to set expectations about data recency. Currently, there's no indication of how fresh the data is, which can be confusing especially after initial setup or when data hasn't been updated in a while.

This is a quick, high-visibility improvement that adds transparency.

## Acceptance Criteria

- [x] Display "Last updated: [date]" or "Data through December 2024" in header or footer
- [x] Extract date from database using `MAX(played_at)` query
- [x] Format date in user-friendly way (e.g., "December 2024" or "Dec 31, 2024")
- [x] Subtle styling that doesn't distract from main content
- [x] Works on both mobile and desktop

## Implementation Notes

**Approach:**
- Add `last_played_at` field to `/api/summary` response
- Display in Header component or KPICards footer
- Use date formatting library or native Intl.DateTimeFormat

**Key files:**
- `app/api/summary/route.ts` — Add MAX(played_at) to query
- `components/Header.tsx` OR `components/Footer.tsx` — Display formatted date

**Considerations:**
- Timezone handling (data is in Toronto timezone after ingestion)
- Date format preference (relative vs absolute)
- Placement (header vs footer vs KPI card)

## Test Plan

- [x] Verify query returns correct last played date
- [x] Check date displays correctly in UI
- [x] Test on mobile and desktop layouts
- [x] Verify styling is subtle and non-intrusive
- [x] Test with different date ranges (recent vs old data)

## Status History

- 2026-01-18: Created → Ready
- 2026-01-18: Ready → InProgress (branch: 001-data-freshness)
- 2026-01-18: InProgress → InReview (PR prepared)
- 2026-01-18: InReview → Done (PR merged to main)


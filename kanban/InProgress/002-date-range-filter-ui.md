# Improve date range filter UI

---
**id:** 002  
**priority:** P1  
**size:** M  
**epic:** UI/UX Improvements  
**created:** 2026-01-18  
**tags:** enhancement, ux

---

## Title

Improve date range filter UI with presets and custom picker

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** []

## Context

The current date filter is basic and not intuitive. Users would benefit from preset options (All Time, Last Year, Last 3 Months) as well as a custom date range picker.

This is a high-impact UX improvement that makes the dashboard much more explorable and useful for analyzing specific time periods.

## Acceptance Criteria

- [ ] Add preset buttons: "All Time", "Last Year", "Last 3 Months", "Last Month"
- [ ] Add custom date range picker (start date and end date inputs)
- [ ] Highlight active preset or custom range
- [ ] Persist selection in URL query params (shareable links)
- [ ] Update all charts when range changes (trends, top artists, top tracks, DOW, hour)
- [ ] Show selected range clearly in header or filter area
- [ ] Handle edge cases (invalid ranges, future dates, etc.)

## Implementation Notes

**Approach:**
- Add FilterControls component with preset buttons
- Use native HTML date inputs (or react-day-picker if needed)
- Store active range in React state
- Sync with URL query params using Next.js router
- Pass date range to all `useApiData` hooks

**Key files:**
- `components/FilterControls.tsx` (new) — Preset buttons + date picker
- `app/page.tsx` — State management and passing to child components
- `app/hooks/useSpotifyData.ts` — May need to handle date params

**Design mockup:**
```
┌─────────────────────────────────────────────────┐
│ [All Time] [2024] [Last 3M] [Last Month]       │
│ or Custom: [📅 Jan 2024] to [📅 Dec 2024] [Go] │
└─────────────────────────────────────────────────┘
```

**Considerations:**
- URL structure: `?start=2024-01&end=2024-12`
- Preset calculation (e.g., "Last 3 Months" from today)
- Date validation and error handling
- Mobile-friendly date pickers
- Loading states while refetching data

## Test Plan

- [ ] Test all preset buttons update date range correctly
- [ ] Test custom date picker with various ranges
- [ ] Verify URL query params update and are shareable
- [ ] Test that all charts update when range changes
- [ ] Test edge cases: invalid dates, end before start, future dates
- [ ] Test mobile responsiveness
- [ ] Test browser back/forward button with URL params

## Status History

- 2026-01-18: Created → Ready
- 2026-01-18: Ready → InProgress (branch: 002-date-range-filter)


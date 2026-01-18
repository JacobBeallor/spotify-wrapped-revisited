# Simplify date range filter UI

---
**id:** 002  
**priority:** P1  
**size:** S  
**epic:** UI/UX Improvements  
**created:** 2026-01-18  
**tags:** enhancement, ux

---

## Title

Simplify date range filter UI with all-time and custom date range options

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** []

## Context

The current month-by-month filter is basic. Simplify to a clean two-option approach: view all-time data or specify a custom date range with start and end dates.

This provides flexibility without overwhelming users with preset options.

## Acceptance Criteria

- [x] Keep "All Time" option as default
- [x] Add custom date range option with start date and end date inputs
- [x] Clearly show which mode is active (All Time vs Custom Range)
- [x] Update all charts when date range changes
- [x] Validate that end date is not before start date
- [x] Handle edge cases gracefully (invalid dates, future dates)
- [x] Works on mobile and desktop

## Implementation Notes

**Approach:**
- Replace the current month dropdown with a simpler filter control
- Two modes: "All Time" (button) and "Custom Range" (date inputs)
- Use native HTML date inputs for simplicity
- Filter data client-side based on selected range
- No need for URL params initially (can add later if needed)

**Key files:**
- `components/Header.tsx` — Update filter controls
- `app/page.tsx` — Add date range state and filtering logic

**UI mockup:**
```
┌──────────────────────────────────────────────────┐
│ ( • All Time )  ( ○ Custom Range )              │
│                                                   │
│ When Custom selected:                            │
│ From: [📅 2024-01-01] To: [📅 2024-12-31]       │
└──────────────────────────────────────────────────┘
```

**Considerations:**
- Date format: YYYY-MM-DD (native input format)
- Client-side filtering vs API changes
- Mobile date picker UX
- Clear visual distinction between modes

## Test Plan

- [x] Test "All Time" shows all data
- [x] Test custom date range filters correctly
- [x] Verify validation: end date must be after start date
- [x] Test that all charts update when range changes
- [x] Test edge cases: same start/end date, invalid dates
- [x] Test mobile date picker usability
- [x] Verify no data is shown for ranges with no records

## Status History

- 2026-01-18: Created → Ready
- 2026-01-18: Ready → InProgress (branch: 002-date-range-filter)


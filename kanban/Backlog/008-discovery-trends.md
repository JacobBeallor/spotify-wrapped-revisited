# Add discovery trends tracking and visualization

---
**id:** 008  
**priority:** P2  
**size:** L  
**epic:** Discovery & Exploration Features  
**created:** 2026-01-18  
**tags:** feature

---

## Title

Track and visualize music discovery patterns over time

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** []

## Context

Understanding when you first listened to new tracks and artists reveals your discovery patterns:
- When did you discover new music most?
- Are you in an exploration phase or sticking with favorites?
- Peak discovery periods correlate with life events

This feature detects "first listen" dates and visualizes discovery rate over time.

## Acceptance Criteria

Backend:
- [ ] Create `/api/discovery` endpoint
- [ ] Detect first listen date for each track and artist
- [ ] Aggregate new tracks/artists by month
- [ ] Calculate discovery rate metrics

Frontend:
- [ ] Create DiscoveryChart component
- [ ] Line chart showing new tracks/artists per month
- [ ] Display key stats: Total discoveries, peak period, avg rate
- [ ] Show "discovery phases" (periods of high exploration)
- [ ] Optional: Year-over-year comparison

Features:
- [ ] Filter by date range
- [ ] Toggle between tracks and artists
- [ ] Highlight peak discovery months
- [ ] Show current trend (discovering more or less lately)

## Implementation Notes

**Approach:**
- Query database for MIN(played_at) grouped by track/artist
- Aggregate first listens by month
- Create API endpoint with this data
- Build visualization component

**SQL approach:**
```sql
-- First listen detection
WITH first_listens AS (
  SELECT 
    track_name,
    artist_name,
    DATE_TRUNC('month', MIN(played_at)) as first_listen_month
  FROM plays
  GROUP BY track_name, artist_name
)
SELECT 
  first_listen_month,
  COUNT(DISTINCT track_name) as new_tracks,
  COUNT(DISTINCT artist_name) as new_artists
FROM first_listens
GROUP BY first_listen_month
ORDER BY first_listen_month
```

**Key files:**
- `app/api/discovery/route.ts` (new)
- `components/DiscoveryChart.tsx` (new)
- `app/page.tsx` — Add component

**Metrics to show:**
- Total unique tracks/artists discovered
- Peak discovery month
- Average discovery rate per month
- Current 3-month trend

**Considerations:**
- First listen ≠ release date (can discover old music)
- Large dataset might be slow (consider caching)
- Discovery rate naturally drops over time (catalog saturation)

## Test Plan

- [ ] Verify first listen detection is accurate
- [ ] Test with full date range
- [ ] Test with filtered date ranges
- [ ] Verify new tracks/artists counts are correct
- [ ] Test chart displays correctly
- [ ] Test on mobile
- [ ] Verify peak discovery month is highlighted

## Status History

- 2026-01-18: Created → Backlog


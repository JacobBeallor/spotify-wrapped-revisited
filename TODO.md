# Spotify Wrapped 2.0 — Issues & Roadmap

## 📋 Issue Labels

**Priority:**
- `P0` - Critical/Blocker
- `P1` - High priority
- `P2` - Medium priority  
- `P3` - Low priority/Nice to have

**Size:**
- `XS` - < 2 hours
- `S` - 2-4 hours
- `M` - 4-8 hours (1 day)
- `L` - 1-3 days
- `XL` - 3-5 days

**Type:**
- `bug` - Something broken
- `feature` - New functionality
- `enhancement` - Improve existing feature
- `docs` - Documentation

---

## 🎯 Epics

### Epic 1: UI/UX Improvements
Enhance user experience with better navigation, controls, and visual clarity.

### Epic 2: Data Enrichment & Analytics
Unlock new insights with Spotify API metadata (genres, release years, audio features).

### Epic 3: Discovery & Exploration Features
Add features to help users discover patterns in their listening history.

---

## 📝 Issues

### Epic 1: UI/UX Improvements

#### #1 Add data freshness indicator to dashboard
**Epic:** UI/UX Improvements  
**Priority:** `P1`  
**Size:** `XS`  
**Labels:** `enhancement`

**Description:**
Show users when their data was last updated. Helps set expectations about data recency.

**Acceptance Criteria:**
- [ ] Display "Last updated: [date]" in header or footer
- [ ] Format: "Data through December 2024" or similar
- [ ] Extract date from database (MAX(played_at))
- [ ] Subtle styling (doesn't distract from main content)

**Technical Notes:**
- Add to `/api/summary` response
- Display in Header or KPICards component

---

#### #2 Improve date range filter UI
**Epic:** UI/UX Improvements  
**Priority:** `P1`  
**Size:** `M`  
**Labels:** `enhancement`

**Description:**
Replace current basic date filter with a more intuitive UI including presets and custom range picker.

**Acceptance Criteria:**
- [ ] Add preset buttons: "All Time", "Last Year", "Last 3 Months", "Last Month"
- [ ] Add custom date range picker (start/end date)
- [ ] Highlight active preset/range
- [ ] Persist selection in URL query params
- [ ] Update all charts when range changes
- [ ] Show selected range in header

**Technical Notes:**
- Use native HTML date inputs or lightweight picker
- Update `useApiData` calls with date params
- Consider adding `react-day-picker` if needed

**Design mockup:**
```
┌─────────────────────────────────────────┐
│ [All Time] [2024] [Last 3M] [Last Month]│
│ or Custom: [Jan 2024] to [Dec 2024]     │
└─────────────────────────────────────────┘
```

---

#### #3 Add section navigation and anchor links
**Epic:** UI/UX Improvements  
**Priority:** `P2`  
**Size:** `S`  
**Labels:** `enhancement`

**Description:**
Add in-page navigation to quickly jump to different sections (trends, top artists, hour analysis, etc.).

**Acceptance Criteria:**
- [ ] Add section IDs to major components
- [ ] Add sticky nav bar or floating menu
- [ ] Smooth scroll to sections on click
- [ ] Highlight active section on scroll
- [ ] Works on mobile (hamburger menu or horizontal scroll)

**Technical Notes:**
- Use `IntersectionObserver` for active section detection
- Add `scroll-margin-top` for proper offset with sticky header

**Sections:**
- Summary
- Trends
- Top Artists
- Top Tracks
- Patterns (DOW/Hour)
- Artist Evolution

---

#### #4 Fix artist evolution bump chart design
**Epic:** UI/UX Improvements  
**Priority:** `P2`  
**Size:** `S`  
**Labels:** `bug`, `enhancement`

**Description:**
The bump chart currently has some visual issues (TypeScript errors fixed but visual customizations removed). Restore proper styling and improve clarity.

**Acceptance Criteria:**
- [ ] Restore dynamic line width (thicker for top ranks)
- [ ] Fix point visibility (hide points on "..." row)
- [ ] Adjust grid lines (only show ranks 1-5)
- [ ] Improve legend placement
- [ ] Better responsive behavior
- [ ] Smoother animations

**Technical Notes:**
- Previously removed due to Nivo type errors
- May need to use `any` type assertions or find correct Nivo types
- Reference: `docs/archive/ARTIST_EVOLUTION.md`

---

### Epic 2: Data Enrichment & Analytics

#### #5 Implement Spotify API enrichment pipeline
**Epic:** Data Enrichment & Analytics  
**Priority:** `P1`  
**Size:** `L`  
**Labels:** `feature`

**Description:**
Enable metadata enrichment from Spotify API to unlock genre analysis and release year features.

**Acceptance Criteria:**
- [x] ~~Create `scripts/enrich_metadata.py`~~ (DONE)
- [x] ~~Implement track enrichment~~ (DONE)
- [x] ~~Implement artist enrichment~~ (DONE)
- [ ] Test with production data
- [ ] Document API rate limits and best practices
- [ ] Add progress indicators for long-running enrichment
- [ ] Handle API errors gracefully

**Technical Notes:**
- Already implemented, needs testing with real credentials
- See `docs/guides/enrichment.md`
- Requires Spotify Developer credentials

**Sub-tasks:**
- Test track enrichment (50/sec expected)
- Test artist enrichment (1/sec expected)
- Verify data quality
- Document common errors

---

#### #6 Add genre analysis and visualization
**Epic:** Data Enrichment & Analytics  
**Priority:** `P1`  
**Size:** `M`  
**Labels:** `feature`

**Dependencies:** #5 (enrichment pipeline)

**Description:**
Show top genres by listening time with pie chart or bar chart.

**Acceptance Criteria:**
- [ ] Create `/api/genres` endpoint (DONE)
- [ ] Add GenreChart component
- [ ] Show top 10-15 genres
- [ ] Display hours and percentage per genre
- [ ] Add to main dashboard
- [ ] Handle genres with commas (split properly)
- [ ] Filter by date range

**Technical Notes:**
- API endpoint exists
- Need frontend component
- Consider pie chart or bar chart
- May need to clean up genre names (lowercase, dedupe)

---

#### #7 Add release year/decade analysis
**Epic:** Data Enrichment & Analytics  
**Priority:** `P1`  
**Size:** `M`  
**Labels:** `feature`

**Dependencies:** #5 (enrichment pipeline)

**Description:**
Analyze listening preferences by release decade. Are you into classics or modern music?

**Acceptance Criteria:**
- [ ] Create `/api/release-years` endpoint (DONE)
- [ ] Add ReleaseYearChart component
- [ ] Show distribution by decade (bar chart)
- [ ] Show top decades by hours
- [ ] Add "All-time favorite decade" stat
- [ ] Optionally show year-by-year breakdown
- [ ] Filter by listening date range

**Technical Notes:**
- API endpoint exists
- Group by decade: 1960s, 1970s, etc.
- Consider stacked area chart for decade evolution over time

**Bonus features:**
- Decade evolution over time (how preferences changed)
- "Hipster score" (preference for older music)

---

### Epic 3: Discovery & Exploration Features

#### #8 Add discovery trends tracking
**Epic:** Discovery & Exploration Features  
**Priority:** `P2`  
**Size:** `L`  
**Labels:** `feature`

**Description:**
Track and visualize when you first listened to new tracks and artists. Show discovery rate over time.

**Acceptance Criteria:**
- [ ] Detect "first listen" for each track/artist
- [ ] Create `/api/discovery` endpoint
- [ ] Show new tracks/artists per month
- [ ] Line chart showing discovery rate over time
- [ ] Stats: Total discoveries, peak discovery period
- [ ] Identify "discovery phases" (periods of exploration)
- [ ] Compare discovery rate year-over-year

**Technical Notes:**
```sql
-- First listen detection
SELECT 
  DATE_TRUNC('month', MIN(played_at)) as first_listen_month,
  COUNT(DISTINCT track_name) as new_tracks,
  COUNT(DISTINCT artist_name) as new_artists
FROM plays
GROUP BY track_name, artist_name
```

**Implementation approach:**
1. Add query to calculate first listen dates
2. Aggregate by month
3. Create DiscoveryChart component
4. Add to dashboard

---

#### #9 Add Spotify embedded players and links
**Epic:** Discovery & Exploration Features  
**Priority:** `P3`  
**Size:** `M`  
**Labels:** `enhancement`

**Description:**
Make top tracks and artists clickable, linking to Spotify or embedding players.

**Acceptance Criteria:**
- [ ] Add Spotify URI/URL for tracks and artists
- [ ] Make track/artist names clickable
- [ ] Open Spotify web player in new tab
- [ ] OR embed Spotify iframe player (optional)
- [ ] Add Spotify icon indicator
- [ ] Consider hover preview (show album art)

**Technical Notes:**
- Track URI: `spotify:track:xxx` → `https://open.spotify.com/track/xxx`
- Artist URI: `spotify:artist:xxx` → `https://open.spotify.com/artist/xxx`
- Spotify Embed API: https://developer.spotify.com/documentation/embeds

**Challenges:**
- Need valid Spotify URIs (already in database)
- Embedded players add page weight
- Consider privacy implications

---

## 📊 Sprint Planning

### Sprint 1: Core UX Improvements (5-7 days)
- #1 Data freshness indicator (XS)
- #2 Date range filter UI (M)
- #3 Section navigation (S)

### Sprint 2: Enrichment & Genre Analysis (3-5 days)
- #5 Test enrichment pipeline (L)
- #6 Genre analysis (M)

### Sprint 3: Release Year & Discovery (5-7 days)
- #7 Release year analysis (M)
- #8 Discovery trends (L)

### Sprint 4: Polish & Extras (2-3 days)
- #4 Fix bump chart (S)
- #9 Spotify embeds (M) - if time permits

---

## 🎯 Quick Wins (Do First)

These can be done quickly for immediate impact:

1. **#1 Data freshness indicator** - 1 hour
2. **#3 Section navigation** - 2-3 hours
3. **#4 Fix bump chart** - 3-4 hours

---

## 📈 Impact vs Effort

```
High Impact, Low Effort:
  ├─ #1 Data freshness
  ├─ #3 Section navigation
  └─ #6 Genre analysis (if enrichment done)

High Impact, High Effort:
  ├─ #2 Date range filter
  ├─ #5 Enrichment pipeline (testing)
  └─ #8 Discovery trends

Low Priority:
  └─ #9 Spotify embeds
```

---

## 🔄 Next Steps

1. Create GitHub issues from this file
2. Assign to milestones/sprints
3. Start with Sprint 1 quick wins
4. Test enrichment pipeline with real data
5. Begin Sprint 2 after enrichment validation
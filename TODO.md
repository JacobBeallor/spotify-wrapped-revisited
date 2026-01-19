# Spotify Wrapped 2.0 — Issues & Roadmap

## Issues

### 1. Section navigation
- Size: `S`  
- Add quick links and navigation between dashboard sections.
- Move filters out of header (or into sub-header?) so they only appear on applicable pages
- Tabs:
  - Overview (KPI cards, top artists, top tracks)
  - Listening Patterns (monthly trends, hour chart, week chart, discovery rates)
  - Taste Evolution (genre streamgraph, decades streamgraph, top artists evolution)
- **Filter Placement:**
  - Use dedicated sub-header below main header for page-specific filters
  - Sub-header should be sticky (positioned below sticky main header)
  - Overview page: Period Selector + Metric Toggle
  - Listening Patterns page: Metric Toggle only
  - Taste Evolution page: No filters (or metric if needed)
- **State Persistence:**
  - Use URL search params to maintain filter values across pages
  - Enables bookmarking, sharing, and browser back/forward
  - Filters should persist when navigating between pages

### 2. Migrate Hour & Day of Week charts to radial/polar form
- Size: `S`  
- Convert Hour of Day and Day of Week bar charts to radial/polar visualization for better cyclical data representation.
- Evaluate Nivo Polar Bar vs ECharts polar coordinates (decision TBD)
- Nivo: Cleaner API, React-first, better defaults (+35KB bundle)
- ECharts: Already installed, consistent with existing charts, more flexible

### 3. Fix artist evolution bump chart
- Size: `S`  
- Restore styling and clarify artist evolution chart.

### 4. Genre analysis & visualization
- Size: `M`  
- Display top genres (pie or bar chart) by listening time.

### 5. Release year/decade analysis
- Size: `M`  
- Show listening trends by release year/decade.

### 6. Discovery trends tracking
- Size: `L`  
- Track first listens and show discovery rate over time.
- Overlay/dual-axis with monthly listening trends?

### 7. Spotify embeds & links
- Size: `M`  
- Make top tracks/artists clickable with Spotify links and embeds.

---

## ✅ Completed

### 1. Data freshness indicator
- Size: `XS`   
- Show when user data was last updated.

### 2. Date range filter UI
- Size: `M`  
- Improve date filter UI with presets and range picker.

### 3. Spotify API enrichment pipeline
- Size: `L`  
- Enrich track/artist data from Spotify API for deeper analysis.

### 4. Decouple listening trends graphs from global filter & remove daily granularity option
- Size: `M`  
- Made the monthly trends, hour of day, and day of week charts independent of the main dashboard filter.
- Removed daily granularity—only support monthly aggregation in trends view.
- Charts now show all-time aggregated data for clearer pattern visualization.

---

## 📋 Issue Labels

**Size**
- `XS` - < 2hrs
- `S` - 2-4hrs
- `M` - 4-8hrs
- `L` - 1-3 days
- `XL` - 3-5 days
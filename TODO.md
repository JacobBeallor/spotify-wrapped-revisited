# Spotify Wrapped 2.0 — Issues & Roadmap

## Issues

### 1. Fix artist evolution bump chart
- Size: `S`  
- Restore styling and clarify artist evolution chart.

### 2. Genre analysis & visualization
- Size: `M`  
- Display top genres (pie or bar chart) by listening time.

### 3. Release year/decade analysis
- Size: `M`  
- Show listening trends by release year/decade.

### 4. Discovery trends tracking
- Size: `L`  
- Track first listens and show discovery rate over time.
- Overlay/dual-axis with monthly listening trends?

### 5. Spotify embeds & links
- Size: `M`  
- Make top tracks/artists clickable with Spotify links and embeds.

---

## ✅ Completed

### 1. Section navigation
- Size: `S`  
- Added tab-based navigation between three dashboard sections: Overview, Listening Habits, and Taste Evolution.
- Created modular filter components (PeriodFilter, MetricFilter) in `components/filters/`.
- Overview page: Period Selector + Metric Toggle filters at top of page content.
- Listening Habits page: Metric Toggle filter at top of page content.
- Taste Evolution page: No filters.
- Implemented using plain `useState` for simplicity - filters persist automatically when switching tabs.
- Filters scroll naturally with page content (not sticky) for cleaner UX.

### 2. Data freshness indicator
- Size: `XS`   
- Show when user data was last updated.

### 3. Date range filter UI
- Size: `M`  
- Improve date filter UI with presets and range picker.

### 4. Spotify API enrichment pipeline
- Size: `L`  
- Enrich track/artist data from Spotify API for deeper analysis.

### 5. Decouple listening trends graphs from global filter & remove daily granularity option
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
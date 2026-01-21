# Spotify Wrapped 2.0 — Issues & Roadmap

## Issues

### 1. Release year/decade analysis
- Size: `M`  
- Show listening trends by release year/decade.

### 2. Spotify embeds & links
- Size: `M`  
- Make top tracks/artists clickable with Spotify links and embeds.

---

## ✅ Completed

### 1. Artist evolution racing bar chart
- Size: `S`  
- Replaced bump chart with animated D3.js racing bar chart.
- Shows top 10 artists with all-time cumulative rankings by hours/plays.
- Auto-play with play/pause controls and manual navigation arrows.
- Smooth transitions and animations (600ms frame, 450ms transitions).
- Keyboard shortcuts support (arrow keys, spacebar).
- Includes all historical data from the beginning of Spotify history.

### 2. Section navigation
- Size: `S`  
- Added tab-based navigation between three dashboard sections: Overview, Listening Habits, and Taste Evolution.
- Created modular filter components (PeriodFilter, MetricFilter) in `components/filters/`.
- Overview page: Period Selector + Metric Toggle filters at top of page content.
- Listening Habits page: Metric Toggle filter at top of page content.
- Taste Evolution page: Metric Toggle filter at top of page content.
- Implemented using plain `useState` for simplicity - filters persist automatically when switching tabs.
- Filters scroll naturally with page content (not sticky) for cleaner UX.

### 3. Data freshness indicator
- Size: `XS`   
- Show when user data was last updated.

### 4. Date range filter UI
- Size: `M`  
- Improve date filter UI with presets and range picker.

### 5. Spotify API enrichment pipeline
- Size: `L`  
- Enrich track/artist data from Spotify API for deeper analysis.

### 6. Decouple listening trends graphs from global filter & remove daily granularity option
- Size: `M`  
- Made the monthly trends, hour of day, and day of week charts independent of the main dashboard filter.
- Removed daily granularity—only support monthly aggregation in trends view.
- Charts now show all-time aggregated data for clearer pattern visualization.

### 7. Discovery trends tracking
- Size: `L`  
- Track first listens and show discovery rate over time.
- Added monthly discovery rate chart showing percentage of listening from newly discovered tracks.
- Created `/api/discovery-rate` endpoint that calculates discovery metrics based on first listen dates.
- Discovery rate defined as: (hours/plays of tracks first heard in month X during month X) / (total hours/plays in month X) × 100.
- Chart styled consistently with other listening pattern visualizations in the Listening Habits tab.

### 8. Genre evolution visualization with artist/genre toggle
- Size: `M`  
- Added genre evolution racing bar chart showing top 28 broad genres over time.
- Created `EntityFilter` toggle component to switch between artists and genres.
- All-time cumulative calculation matching artist evolution approach.
- Leverages existing `genre_mappings` table (452 subgenres → 28 categories).
- New API endpoint: `/api/genre-evolution`.
- Updated `RacingBarChart` to handle both artists and genres generically.
- Toggle between "Artists" and "Genres" views on Taste Evolution tab.
- Provides higher-level view of musical taste evolution compared to granular artist view.

---

## 📋 Issue Labels

**Size**
- `XS` - < 2hrs
- `S` - 2-4hrs
- `M` - 4-8hrs
- `L` - 1-3 days
- `XL` - 3-5 days
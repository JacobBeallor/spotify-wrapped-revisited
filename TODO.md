# Spotify Wrapped 2.0 — Issues & Roadmap

## Issues

### 1. Release year/decade analysis
- Size: `M`  
- Show listening trends by release year/decade.

### 2. Jukebox feature?

---

## ✅ Completed

### 1. Enhanced date picker UX improvements
- Size: `S`
- Converted dual calendar view to single month view for more compact UI (450px vs 700px width).
- Added clickable month and year selectors with dropdown menus for quick navigation.
- Implemented dynamic hover range highlighting - shows preview of date range as user hovers.
- Added selected date range display in action bar showing current selection before applying.
- Improved date selection persistence - dates remain selected when navigating between months.
- Enhanced user feedback with real-time display of selected dates and quick filter names.

### 1. Date range filter with flexible date picker
- Size: `M`
- Replaced month-based `PeriodFilter` with comprehensive date range picker.
- Features dual calendar view showing two consecutive months side-by-side.
- Quick filter presets: This month, Last month, This year, Last year, All time.
- Custom date range selection with visual feedback and range highlighting.
- Glassmorphism design matching Spotify theme colors (#1DB954 green accents).
- Updated all API endpoints to accept `startDate` and `endDate` parameters (YYYY-MM-DD format).
- API routes now filter by `date` column instead of `year_month` for finer granularity.
- State management updated to use date range objects instead of period strings.
- Monthly data filtering maintains compatibility with existing charts.
- Available date range fetched from database to disable out-of-bounds dates.
- Created comprehensive documentation: `docs/architecture/date-range-filter.md`.
- Updated API documentation to reflect new date range parameters.

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

### 9. Spotify embeds & interactive player
- Size: `M`  
- Integrated Spotify iFrame API for interactive music player on Overview page.
- Swapped Top Tracks and Top Artists positions (tracks left, artists right).
- Made tracks and artists clickable - clicking updates embedded player instantly.
- Added `spotify_track_uri` field to `/api/top-tracks` endpoint (joined with `tracks` table).
- Added `spotify_artist_id` field to `/api/top-artists` endpoint (joined with `artists` table).
- Created `SpotifyEmbed` component with dynamic `loadUri()` functionality.
- Player loads paused with top track, updates smoothly without page reloads.
- Graceful degradation: non-enriched items display but aren't clickable.
- Hover effects (opacity, brightness) only on items with Spotify IDs.
- Added comprehensive architecture documentation: `docs/architecture/spotify-embeds.md`.

### 10. Thumbnail images for top artists and tracks
- Size: `M`  
- Added `album_image_url` column to tracks table for album cover thumbnails (300x300px).
- Added `image_url` column to artists table for artist profile images (300x300px).
- Updated enrichment script (`enrich_metadata.py`) to capture image URLs from Spotify API.
- Created backfill script (`backfill_images.py`) to populate image URLs for existing enriched records.
- Updated database schemas in both DuckDB (ingest) and Postgres (sync) scripts.
- Modified API routes (`/api/top-tracks` and `/api/top-artists`) to include image URLs.
- Updated TypeScript types (`TopTrack` and `TopArtist`) with optional image URL fields.
- Updated frontend components to display thumbnails:
  - `TopTracks.tsx`: Shows 40x40px square album covers with slight rounding.
  - `TopArtists.tsx`: Shows 40x40px circular artist profile photos.
- Graceful degradation: thumbnails only display when image URLs are available.
- Images served directly from Spotify CDN (stable, long-lived URLs).
- Documentation updated: database schema, enrichment guide, API routes, and new backfill guide.

### 11. Fix spotify embed not loading after switching tabs
- **Issue:** When switching from the overview tab to a different tab and back, the Spotify player would perpetually show "Loading Spotify player..." state
- **Root Cause:** Multiple issues - race conditions between cleanup/initialization, reliance on callback that only fires once, and incomplete state management
- **Fix:** Comprehensive rewrite of initialization logic in `SpotifyEmbed.tsx`:
  - Added active polling (200ms intervals, 50 retries) instead of relying solely on `onSpotifyIframeApiReady` callback
  - Introduced `isInitializing` flag alongside `isInitialized` to prevent concurrent initialization attempts
  - Enhanced cleanup to destroy controller before resetting flags, clear container DOM, and reset all state
  - Added `mounted` flag to handle async initialization after component unmount
  - Synchronized `initialUriRef` with prop changes via dedicated useEffect

---

## 📋 Issue Labels

**Size**
- `XS` - < 2hrs
- `S` - 2-4hrs
- `M` - 4-8hrs
- `L` - 1-3 days
- `XL` - 3-5 days
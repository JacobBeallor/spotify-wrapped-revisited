# Server-Side Migration Complete

## Overview

Successfully migrated Spotify Wrapped 2.0 from static JSON exports to server-side API routes with DuckDB backend.

## What Changed

### Architecture

**Before:** Python → DuckDB → JSON files → Vercel static → Browser  
**After:** Browser → Next.js API Routes → DuckDB (on-demand queries)

### Database Schema

Added three new enrichment tables:

1. **`tracks`** - Track metadata (release dates, popularity, decades)
2. **artists`** - Artist metadata (genres, followers, Spotify IDs)
3. **`audio_features`** - Audio characteristics (energy, danceability, tempo, etc.)

### API Routes Created

- `/api/summary` - Overall statistics
- `/api/trends` - Daily/weekly/monthly listening trends with auto-granularity
- `/api/top-artists` - Top artists by time period
- `/api/top-tracks` - Top tracks by time period
- `/api/dow` - Day of week analysis
- `/api/hour` - Hour of day analysis
- `/api/artist-evolution` - Artist ranking over time (bump chart data)
- `/api/genres` - Genre distribution (requires enrichment)
- `/api/release-years` - Music by release decade/year (requires enrichment)

### Frontend Updates

- Created `useApiData` hook for consistent API data fetching
- Updated `app/page.tsx` to use API calls instead of static JSON
- Removed dependencies on `/data/*.json` files
- All filtering now happens on the frontend from API data

## Benefits

✅ **Dynamic granularity** - Automatically switch between daily/weekly/monthly views  
✅ **Faster page loads** - Only fetch data you need  
✅ **Easy to extend** - Add new analyses without regenerating static files  
✅ **Future-ready** - Foundation for genre analysis, release year analysis, audio features  
✅ **Real-time updates** - Update database without rebuilding/redeploying

## Running the Application

### Data Pipeline

```bash
# Basic ingestion (no enrichment)
./scripts/run_pipeline.sh

# With Spotify API enrichment (genres, release dates)
export SPOTIFY_CLIENT_ID=your_id
export SPOTIFY_CLIENT_SECRET=your_secret
ENRICH=true ./scripts/run_pipeline.sh
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Deployment to Vercel

The app is now configured with API routes and will work on Vercel:

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables (optional, for enrichment):
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Deploy

The DuckDB database will be bundled with the deployment automatically.

## Files Removed/Modified

### Removed
- `scripts/export_aggregates.py` - No longer needed (queries run on-demand)
- `public/data/*.json` - Static JSON files replaced by API routes

### Modified
- `scripts/ingest_spotify.py` - Now creates enrichment tables
- `scripts/run_pipeline.sh` - Removed export step, added optional enrichment
- `next.config.js` - Removed static export, added webpack externals
- `app/page.tsx` - Uses API calls instead of static JSON

### Added
- `app/api/db.ts` - Database connection singleton
- `app/api/*/route.ts` - API route handlers
- `app/hooks/useSpotifyData.ts` - Data fetching hook
- `scripts/enrich_metadata.py` - Spotify API enrichment script
- `vercel.json` - Deployment configuration

## Next Steps

1. **Run enrichment** - Populate genres and release dates using Spotify API
2. **Add genre charts** - Visualize genre distribution over time
3. **Add release year analysis** - "You listen to 65% music from the 70s!"
4. **Audio feature analysis** - When Spotify API access is available
5. **Discovery trends** - Track new tracks/artists per month

## Notes

- API routes require DuckDB database at `data/spotify.duckdb`
- Environment variables only needed for enrichment (optional)
- Static JSON files can be kept for backup/comparison
- Build warnings about React hooks are cosmetic and don't affect functionality


# API Routes Documentation

Server-side endpoints for querying Spotify listening data.

## Overview

All API routes are located in `app/api/` and use Next.js App Router serverless functions.

**Base URL (local):** `http://localhost:3000/api`

**Base URL (production):** `https://your-app.vercel.app/api`

## Database Connection

**File:** `app/api/db.ts`

Automatically selects database based on environment:
- **Local dev** (no POSTGRES_URL): Uses DuckDB
- **Production** (Vercel): Uses Vercel Postgres

```typescript
import { executeQuery } from '../db'

// Usage in routes
const results = await executeQuery<YourType>(`
  SELECT * FROM plays WHERE year = 2024
`)
```

---

## Core Endpoints

### `GET /api/summary`

**Summary statistics for the entire dataset.**

**Parameters:** None

**Response:**
```json
{
  "total_hours": 4250.64,
  "total_plays": 77800,
  "unique_tracks": 16230,
  "unique_artists": 5776,
  "first_played_at": "2015-01-01T12:34:56",
  "last_played_at": "2025-12-31T23:59:59"
}
```

**Query:**
```sql
SELECT 
  ROUND(SUM(ms_played) / 1000.0 / 60 / 60, 2) as total_hours,
  COUNT(*) as total_plays,
  COUNT(DISTINCT spotify_track_uri) as unique_tracks,
  COUNT(DISTINCT artist_name) as unique_artists,
  MIN(played_at) as first_played_at,
  MAX(played_at) as last_played_at
FROM plays
```

---

### `GET /api/trends`

**Monthly listening trends over time.**

**Parameters:** None

**Response:**
```json
{
  "granularity": "monthly",
  "count": 120,
  "data": [
    {
      "year_month": "2024-01",
      "year": 2024,
      "month": 1,
      "hours": 245.5,
      "plays": 4521,
      "unique_tracks": 342,
      "unique_artists": 156
    },
    ...
  ]
}
```

**Notes:**
- Returns aggregated data for all time periods
- Always uses monthly granularity
- Not affected by date range filters

---

### `GET /api/top-artists`

**Top artists by listening time or play count.**

**Parameters:**
- `limit` (optional): Number of results (default: 50, max: 100)
- `start` (optional): Start date filter
- `end` (optional): End date filter
- `metric` (optional): `hours` | `plays` (default: `hours`)

**Response:**
```json
{
  "data": [
    {
      "artist_name": "The Band",
      "hours": 124.26,
      "plays": 1747,
      "spotify_artist_id": "0OdUWJ0sBjDrqHygGUXeCF"
    },
    ...
  ]
}
```

**Notes:**
- `spotify_artist_id` field is included if data has been enriched via Spotify API
- This field is used for interactive embeds and deep links to Spotify
- Returns `null` if artist has not been enriched yet

**Query:**
```sql
SELECT 
  p.artist_name,
  ROUND(SUM(p.ms_played) / 1000.0 / 60 / 60, 2) as hours,
  COUNT(*) as plays,
  a.spotify_artist_id
FROM plays p
LEFT JOIN artists a ON p.artist_name = a.artist_name
WHERE p.year_month >= ? AND p.year_month <= ?
GROUP BY p.artist_name, a.spotify_artist_id
ORDER BY hours DESC
LIMIT ?
```

---

### `GET /api/top-tracks`

**Top tracks by listening time or play count.**

**Parameters:**
- `limit` (optional): Number of results (default: 50, max: 100)
- `start` (optional): Start date filter
- `end` (optional): End date filter
- `metric` (optional): `hours` | `plays` (default: `hours`)

**Response:**
```json
{
  "data": [
    {
      "track_name": "The Weight",
      "artist_name": "The Band",
      "hours": 12.5,
      "plays": 87,
      "spotify_track_uri": "spotify:track:6rqhFgbbKwnb9MLmUQDhG6"
    },
    ...
  ]
}
```

**Notes:**
- `spotify_track_uri` field is included if data has been enriched via Spotify API
- This field is used for interactive embeds and deep links to Spotify
- Returns `null` if track has not been enriched yet
- URI format: `spotify:track:{trackId}`

**Query:**
```sql
SELECT 
  p.track_name,
  p.artist_name,
  ROUND(SUM(p.ms_played) / 1000.0 / 60 / 60, 2) as hours,
  COUNT(*) as plays,
  t.spotify_track_uri
FROM plays p
LEFT JOIN tracks t ON p.spotify_track_uri = t.spotify_track_uri
WHERE p.year_month >= ? AND p.year_month <= ?
GROUP BY p.track_name, p.artist_name, t.spotify_track_uri
ORDER BY hours DESC
LIMIT ?
```

---

### `GET /api/dow`

**Listening patterns by day of week.**

**Parameters:** None

**Response:**
```json
{
  "data": [
    {
      "dow": 0,
      "dow_name": "Sunday",
      "hours": 1245.2,
      "plays": 22823
    },
    ...
  ]
}
```

**DOW encoding:**
- 0 = Sunday
- 1 = Monday
- ...
- 6 = Saturday

**Notes:**
- Returns aggregated data across all time periods
- Not affected by date range filters

---

### `GET /api/hour`

**Listening patterns by hour of day.**

**Parameters:** None

**Response:**
```json
{
  "data": [
    {
      "hour": 14,
      "hours": 432.5,
      "plays": 7898
    },
    ...
  ]
}
```

**Hour encoding:** 0-23 (24-hour format, local timezone)

**Notes:**
- Returns aggregated data across all time periods
- Not affected by date range filters

---

### `GET /api/discovery-rate`

**Monthly discovery rate - percentage of listening from newly discovered tracks.**

**Parameters:** None

**Response:**
```json
{
  "data": [
    {
      "year_month": "2024-01",
      "discovery_rate_hours": 25.5,
      "discovery_rate_plays": 32.1
    },
    ...
  ]
}
```

**Definition:**
- Discovery rate = (listening from tracks first heard in month) / (total listening in month) × 100
- A track's "first listen" is determined by the earliest `played_at` timestamp for that `track_name` + `artist_name` combination
- Returns percentage values (0-100)

**Query Logic:**
```sql
WITH first_listens AS (
  SELECT track_name, artist_name, 
         MIN(played_at) as first_played_at,
         STRFTIME(MIN(played_at), '%Y-%m') as first_year_month
  FROM plays
  GROUP BY track_name, artist_name
)
-- Calculate discovery hours/plays per month
```

**Notes:**
- Returns aggregated data across all time periods
- Not affected by date range filters
- Higher percentages indicate more exploration of new music

---

### `GET /api/artist-evolution`

**Artist ranking changes over time (for artist racing bar chart).**

**Parameters:** None (removed in v2 - now returns union of top 15 by hours OR plays)

**Response:**
```json
{
  "data": [
    {
      "year_month": "2024-01",
      "artist_name": "The Band",
      "hours": 45.67,
      "plays": 542
    },
    ...
  ]
}
```

**Logic:**
- Monthly granularity starting from 2018-01
- **All-time cumulative** totals for each artist
- Returns artists that appear in **top 15 by either hours OR plays** at least once
- This union approach enables client-side metric switching without re-fetching
- Typical payload: ~35-50 artists × ~97 months = ~3,400-4,900 rows
- Data includes both hours and plays for client-side filtering

**Query approach:**
1. Aggregate listening data by month and artist
2. Calculate all-time cumulative totals
3. Rank by hours separately from plays
4. Take UNION of top 15 from each ranking
5. Return all months for those relevant artists

**Use case:**
Powers the artist view of the animated racing bar chart on the Taste Evolution page. Client switches between hours/plays metrics without additional API calls.

See [Artist Evolution docs](../archive/ARTIST_EVOLUTION.md) for implementation details.

---

### `GET /api/genre-evolution`

**Genre ranking changes over time (for genre racing bar chart).**

**Parameters:** None (removed in v2 - now returns union of top 15 by hours OR plays)

**Response:**
```json
{
  "data": [
    {
      "year_month": "2024-01",
      "genre": "Rock",
      "hours": 145.23,
      "plays": 2341
    },
    ...
  ]
}
```

**Logic:**
- Monthly granularity starting from 2018-01
- **All-time cumulative** totals for each broad genre
- Returns genres that appear in **top 15 by either hours OR plays** at least once
- Uses `genre_mappings` table to roll up 452 subgenres into 28 broad categories
- Distributes listening time equally across an artist's unique broad genres
- This union approach enables client-side metric switching without re-fetching
- Typical payload: ~15-20 genres × ~97 months = ~1,500-2,000 rows

**Query approach:**
1. Expand each play to its artist's genres
2. Deduplicate when multiple subgenres map to same broad genre
3. Distribute listening time across unique broad genres
4. Calculate all-time cumulative totals
5. Rank by hours separately from plays
6. Take UNION of top 15 from each ranking
7. Return all months for those relevant genres

**Use case:**
Powers the genre view of the racing bar chart on the Taste Evolution page. Shows how top genres have evolved using the 28 broad genre categories. Client switches between hours/plays metrics without additional API calls.

See [Genre Evolution docs](../archive/GENRE_EVOLUTION.md) and [Genre Mappings Guide](../guides/genre-mappings.md) for details.

---

## Enrichment Endpoints

*These require enriched data from Spotify API*

### `GET /api/genres`

**Genre distribution from artist metadata.**

**Requirements:** `artists` table populated via `enrich_metadata.py`

**Parameters:**
- `limit` (optional): Number of genres (default: 20)

**Response:**
```json
{
  "data": [
    {
      "genre": "indie rock",
      "hours": 456.2,
      "plays": 8234
    },
    ...
  ]
}
```

**Query:**
Joins `plays` with `artists` table, splits comma-separated genres.

---

### `GET /api/release-years`

**Listening by release year/decade.**

**Requirements:** `tracks` table populated via `enrich_metadata.py`

**Parameters:**
- `groupBy` (optional): `year` | `decade` (default: `decade`)

**Response:**
```json
{
  "data": [
    {
      "period": "1970s",
      "hours": 234.5,
      "plays": 4321
    },
    ...
  ]
}
```

**Query:**
Joins `plays` with `tracks` table on `spotify_track_uri`.

---

## Error Handling

All routes return consistent error format:

**Success:** Status 200
```json
{
  "data": [...],
  "granularity": "monthly"  // if applicable
}
```

**Error:** Status 500
```json
{
  "error": "Database query failed",
  "message": "Connection timeout"
}
```

**Common errors:**
- Database connection failed
- Invalid parameters
- Query timeout
- Missing enrichment data

---

## Performance

### Query Times (DuckDB local)
- Summary: ~5ms
- Trends: ~10-50ms
- Top artists/tracks: ~20ms
- DOW/Hour: ~30ms
- Artist evolution: ~100ms

### Query Times (Postgres production)
- Add ~20-50ms network latency
- Total: 25-150ms per query

### Caching

Routes can be cached with Next.js revalidation:

```typescript
export const revalidate = 300  // Cache for 5 minutes
```

**Benefits:**
- Reduces database queries
- Faster page loads
- Lower Vercel Postgres operations

---

## Adding New Endpoints

**Template:**

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Query database
    const results = await executeQuery<YourType>(`
      SELECT * FROM plays
      LIMIT ?
    `, [limit])
    
    // Return JSON
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Query failed:', error)
    return NextResponse.json(
      { error: 'Query failed', message: error.message },
      { status: 500 }
    )
  }
}
```

**Best practices:**
- Use TypeScript types
- Validate parameters
- Handle errors gracefully
- Add parameter limits (e.g., max 100 results)
- Consider adding caching

---

## Frontend Integration

**Custom hook:** `app/hooks/useSpotifyData.ts`

```typescript
import { useApiData } from './hooks/useSpotifyData'

// In your component
const { data, loading, error } = useApiData<SummaryData>('summary')

const { data: trends } = useApiData('trends', {
  granularity: 'monthly',
  start: '2024-01',
  end: '2024-12'
})
```

**Features:**
- Automatic loading states
- Error handling
- Type-safe responses
- Refetch on param changes

---

## See Also

- [Database Architecture](./database.md) - Schema and tables
- [Data Pipeline](./data-pipeline.md) - How data is ingested
- [Local Development](../guides/local-development.md) - Development workflow


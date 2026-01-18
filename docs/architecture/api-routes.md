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

**Listening trends over time with dynamic granularity.**

**Parameters:**
- `granularity` (optional): `daily` | `weekly` | `monthly` | `auto` (default: `auto`)
- `start` (optional): Start date (YYYY-MM-DD or YYYY-MM)
- `end` (optional): End date (YYYY-MM-DD or YYYY-MM)
- `metric` (optional): `hours` | `plays` (default: `hours`)

**Response:**
```json
{
  "granularity": "monthly",
  "data": [
    {
      "period": "2024-01",
      "hours": 245.5,
      "plays": 4521
    },
    ...
  ]
}
```

**Granularity Logic:**
- Date range ≤ 3 months → `daily`
- Date range ≤ 12 months → `weekly`
- Date range > 12 months → `monthly`

**Example requests:**
```bash
# Auto-detect granularity for last 6 months
GET /api/trends?start=2024-06&end=2024-12

# Force daily granularity
GET /api/trends?granularity=daily&start=2024-11-01&end=2024-11-30

# Get plays instead of hours
GET /api/trends?metric=plays
```

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
      "plays": 1747
    },
    ...
  ]
}
```

**Query:**
```sql
SELECT 
  artist_name,
  ROUND(SUM(ms_played) / 1000.0 / 60 / 60, 2) as hours,
  COUNT(*) as plays
FROM plays
WHERE date >= ? AND date <= ?
GROUP BY artist_name
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
      "plays": 87
    },
    ...
  ]
}
```

---

### `GET /api/dow`

**Listening patterns by day of week.**

**Parameters:**
- `start` (optional): Start date filter
- `end` (optional): End date filter
- `metric` (optional): `hours` | `plays` (default: `hours`)

**Response:**
```json
{
  "data": [
    {
      "year_month": "2024-01",
      "dow": 0,
      "dow_name": "Sunday",
      "hours": 45.2,
      "plays": 823
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

---

### `GET /api/hour`

**Listening patterns by hour of day.**

**Parameters:**
- `start` (optional): Start date filter
- `end` (optional): End date filter
- `metric` (optional): `hours` | `plays` (default: `hours`)

**Response:**
```json
{
  "data": [
    {
      "year_month": "2024-01",
      "hour": 14,
      "hours": 32.5,
      "plays": 598
    },
    ...
  ]
}
```

**Hour encoding:** 0-23 (24-hour format, local timezone)

---

### `GET /api/artist-evolution`

**Artist rank changes over time (for bump chart).**

**Parameters:**
- `topN` (optional): Number of ranks to show (default: 5)

**Response:**
```json
{
  "data": [
    {
      "quarter": "2024-Q1",
      "artist_name": "The Band",
      "rank": 1,
      "hours": 124.5
    },
    ...
  ]
}
```

**Logic:**
- Rolling 12-month window for each quarter
- Only artists with 3+ months in top N
- Fixed rank positions (1-5)
- Artists enter/exit as needed

See [Artist Evolution docs](../archive/ARTIST_EVOLUTION.md) for details.

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


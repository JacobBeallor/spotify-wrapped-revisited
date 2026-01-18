# Enrichment Guide

Add metadata from the Spotify API to unlock additional features like genre analysis and release year insights.

## What is Enrichment?

**Enrichment** adds metadata to your listening history by querying the Spotify API:

**Without enrichment:**
- Basic stats (hours, plays, top artists/tracks)
- Time-based analysis (trends, hour/day patterns)

**With enrichment:**
- 🎸 **Genre distribution** - What genres you listen to most
- 📅 **Release year/decade analysis** - Do you prefer 60s, 80s, or modern music?
- ⭐ **Popularity scores** - Track/artist popularity on Spotify
- 🎵 **Audio features** - Energy, danceability, tempo (future)

---

## Prerequisites

### 1. Spotify Developer Account

**Sign up:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Accept terms of service

### 2. Create an App

1. Click "Create app"
2. Fill in:
   - **App name:** "Spotify Wrapped Personal" (or anything)
   - **App description:** "Personal analytics dashboard"
   - **Redirect URI:** `http://localhost:3000` (required but not used)
   - **APIs used:** Check "Web API"
3. Click "Save"

### 3. Get Credentials

1. Click on your new app
2. Click "Settings"
3. Copy:
   - **Client ID** (visible)
   - **Client Secret** (click "View client secret")

**Keep these secret!** Don't commit to git or share publicly.

---

## Setup

### Set Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example
cp .env.example .env

# Edit with your credentials
code .env
```

Add your credentials to `.env`:

```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Keep these secret!** The `.env` file is already in `.gitignore`.

---

## Running Enrichment

### Basic Usage

```bash
# Activate Python environment
source venv/bin/activate

# Make sure .env file exists with credentials
# Run enrichment
python scripts/enrich_metadata.py

# Or use the helper script (recommended)
./scripts/run_enrichment.sh
```

### What It Does

#### 1. Track Enrichment

**Finds new tracks:**
```sql
SELECT DISTINCT spotify_track_uri 
FROM plays 
WHERE spotify_track_uri IS NOT NULL
  AND spotify_track_uri NOT IN (SELECT spotify_track_uri FROM tracks)
```

**Fetches metadata:**
- Release date → calculates year and decade
- Album name
- Popularity (0-100)
- Duration
- Explicit flag

**Batches:** 50 tracks per API call (Spotify limit)

**Example output:**
```
Enriching tracks...
Found 5,234 tracks to enrich
  Processed 50/5,234
  Processed 100/5,234
  ...
✓ Tracks enriched: 5,234
```

#### 2. Artist Enrichment

**Finds new artists:**
```sql
SELECT DISTINCT artist_name 
FROM plays 
WHERE artist_name NOT IN (SELECT artist_name FROM artists)
```

**Fetches metadata:**
- Genres (comma-separated)
- Popularity (0-100)
- Follower count
- Spotify artist ID

**One at a time:** 1 artist per API call (requires search)

**Example output:**
```
Enriching artists...
Found 1,892 artists to enrich
  Processed 100/1,892
  Processed 200/1,892
  ...
✓ Artists enriched: 1,892
```

### Performance

**Track enrichment:**
- ~50 tracks per second
- 5,000 tracks: ~2-3 minutes
- 10,000 tracks: ~4-6 minutes

**Artist enrichment:**
- ~1 artist per second
- 1,000 artists: ~20 minutes
- 5,000 artists: ~90 minutes

**Total time for full enrichment:** ~30-60 minutes

---

## Incremental Enrichment

**Good news:** Enrichment is incremental!

**Only new items are enriched:**
- Script checks existing `tracks` and `artists` tables
- Only fetches metadata for new items
- Safe to run multiple times

**Example:**
```bash
# First run: enriches 5,000 tracks, 2,000 artists (45 min)
python scripts/enrich_metadata.py

# Add new data
./scripts/run_pipeline.sh

# Second run: only enriches 200 new tracks, 50 artists (5 min)
python scripts/enrich_metadata.py
```

---

## Verification

### Check Enrichment Status

```bash
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')

# Count enriched tracks
tracks = con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]
print(f'Tracks enriched: {tracks:,}')

# Count enriched artists
artists = con.execute('SELECT COUNT(*) FROM artists').fetchone()[0]
print(f'Artists enriched: {artists:,}')

# Sample track
track = con.execute('''
  SELECT track_name, release_year, popularity 
  FROM tracks 
  LIMIT 1
''').fetchone()
print(f'Sample: {track[0]} ({track[1]}, popularity: {track[2]})')

# Sample artist with genres
artist = con.execute('''
  SELECT artist_name, genres, popularity 
  FROM artists 
  WHERE genres IS NOT NULL
  LIMIT 1
''').fetchone()
print(f'Sample: {artist[0]} - {artist[1]} (popularity: {artist[2]})')
"
```

---

## Features Unlocked

### 1. Genre Analysis

**API endpoint:** `/api/genres`

**What it shows:**
- Top genres by listening time
- Genre distribution pie chart
- Hours per genre

**Dashboard integration:**
```typescript
const { data: genres } = useApiData('genres', { limit: 10 })
```

### 2. Release Year/Decade Analysis

**API endpoint:** `/api/release-years`

**Parameters:**
- `groupBy=decade` - Group by decade (1960s, 1970s, etc.)
- `groupBy=year` - Group by individual year

**What it shows:**
- When your music was released
- Do you prefer classics or modern?
- Decade distribution

**Example:**
```typescript
const { data: decades } = useApiData('release-years', { 
  groupBy: 'decade' 
})
```

### 3. Popularity Insights (Future)

**Possible features:**
- Are you a hipster? (low popularity preference)
- Mainstream listener? (high popularity)
- Discovery score (how early you discover artists)

---

## Sync to Production

After enrichment, sync to Vercel Postgres:

```bash
# Sync enriched data
python scripts/sync_to_postgres.py

# Deploy
git push origin main
```

**What gets synced:**
- Updated `tracks` table
- Updated `artists` table
- All new metadata

---

## Troubleshooting

### "Missing Spotify credentials"

```bash
# Check if .env exists
ls -la .env

# Check if credentials are set
cat .env | grep SPOTIFY

# Should show your credentials
# If empty or file missing, create from template:
cp .env.example .env
# Then edit .env with your actual credentials
```

### "Rate limit exceeded"

**Symptoms:**
```
Error processing batch: 429 Too Many Requests
```

**Solution:**
- Script automatically retries with backoff
- Just wait, it will continue
- Spotify rate limits: ~100 requests per 30 seconds

### "Artist not found"

Some artists may not be found via search:
- Misspelled names in your data
- Artist removed from Spotify
- Regional availability issues

**Script behavior:**
- Logs warning
- Skips artist
- Continues with next one

**Not a problem** - rare occurrence

### Takes too long

**Options:**

1. **Run overnight:**
   ```bash
   nohup python scripts/enrich_metadata.py > enrichment.log 2>&1 &
   ```

2. **Limit artists:**
   Edit `scripts/enrich_metadata.py`:
   ```python
   # Change LIMIT 5000 to LIMIT 1000
   artists = con.execute("""
       SELECT DISTINCT artist_name
       FROM plays
       WHERE artist_name NOT IN (SELECT artist_name FROM artists)
       LIMIT 1000  -- <-- reduce this
   """).fetchall()
   ```

3. **Skip artists, only enrich tracks:**
   Comment out artist enrichment:
   ```python
   # enrich_artists(con, sp)  # Skip this
   ```

---

## Audio Features (Future)

**Status:** Not yet implemented

**What they are:**
- Danceability (0.0-1.0)
- Energy (0.0-1.0)
- Valence (0.0-1.0) - musical positivity
- Tempo (BPM)
- Acousticness, instrumentalness, etc.

**Challenge:**
- Spotify deprecated Audio Features API for new apps
- Need existing app with access OR
- Use third-party API (e.g., Reccobeats)

**If you have access:**
```python
# In enrich_metadata.py
def enrich_audio_features(con, sp):
    track_ids = [...]
    features = sp.audio_features(track_ids)
    # Store in audio_features table
```

---

## Best Practices

✅ **Run enrichment after ingestion**
```bash
./scripts/run_pipeline.sh
./scripts/run_enrichment.sh
```

✅ **Or run manually:**
```bash
source venv/bin/activate
python scripts/enrich_metadata.py
```

✅ **Keep credentials secure**
- Don't commit to git
- Use environment variables
- Don't share publicly

✅ **Run incrementally**
- Enrichment is fast on updates
- Only new items are processed
- Safe to re-run anytime

✅ **Verify before syncing**
- Check local data first
- Test in dashboard locally
- Then sync to Postgres

✅ **Monitor rate limits**
- Let script handle retries
- Don't run multiple instances
- Be patient with large datasets

---

## Cost

**Free tier limits:**
- Spotify API: Unlimited for personal use
- No cost for enrichment
- Just takes time

**Rate limits:**
- ~100 requests per 30 seconds
- Script respects limits automatically

---

## See Also

- [Data Pipeline](../architecture/data-pipeline.md) - How enrichment fits in
- [API Routes](../architecture/api-routes.md) - Genre/release year endpoints
- [Updating Data](./updating-data.md) - Full update workflow
- [Spotify API Docs](https://developer.spotify.com/documentation/web-api) - Official API reference


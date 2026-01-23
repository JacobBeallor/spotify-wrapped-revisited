# Backfill Images Guide

Populate image URLs for existing enriched tracks and artists.

## Overview

The **backfill script** updates existing database records with image URLs without re-fetching all metadata. This is useful when:

- Upgrading from a version without image URL support
- Some records are missing image URLs
- You want to refresh image URLs

## Why Backfill?

The main enrichment script (`enrich_metadata.py`) only processes **new** records that aren't already in the database. If you already have enriched tracks and artists, running the main script won't add image URLs to them.

The backfill script specifically targets records with `NULL` image URLs and updates them efficiently.

## Prerequisites

Same as regular enrichment:

1. **Spotify Developer Credentials** (Client ID and Secret)
2. **Virtual environment activated**
3. **Existing enriched data** in `data/spotify.duckdb`

See [Enrichment Guide](./enrichment.md) for credential setup.

---

## Usage

### Basic Command

```bash
# Navigate to project directory
cd spotify-wrapped-revisited

# Activate virtual environment
source venv/bin/activate

# Run backfill script
python scripts/backfill_images.py
```

### With Environment Variables

If you use a `.env` file (recommended):

```bash
# Load environment variables
source .env

# Or export manually
export SPOTIFY_CLIENT_ID=your_client_id
export SPOTIFY_CLIENT_SECRET=your_client_secret

# Run backfill
python scripts/backfill_images.py
```

---

## What It Does

### Track Images

1. **Finds tracks** with `NULL` album_image_url
2. **Fetches album art** from Spotify API (50 tracks per batch)
3. **Updates database** with image URLs
4. **Prefers 300x300px** size (medium quality)

### Artist Images

1. **Finds artists** with `NULL` image_url
2. **Fetches profile photos** from Spotify API (1 artist per call)
3. **Updates database** with image URLs
4. **Prefers 300x300px** size (medium quality)

---

## Example Output

```
======================================================================
BACKFILL IMAGE URLS
======================================================================

Connecting to database...
Initializing Spotify client...

Backfilling track album images...
Found 5,234 tracks without images
  Processed 500/5,234
  Processed 1000/5,234
  Processed 1500/5,234
  ...
  Processed 5234/5,234

Backfilling artist images...
Found 1,892 artists without images
  Processed 100/1,892
  Processed 200/1,892
  ...
  Processed 1892/1,892

======================================================================
BACKFILL COMPLETE
======================================================================

📀 TRACKS
  Total processed:      5,234
  ✅ Updated:           5,234
  ❌ Failed:            0

🎤 ARTISTS
  Total processed:      1,892
  ✅ Updated:           1,892
  ❌ Failed:            0

======================================================================

📊 Current Database State:
  Tracks with images:   5,234
  Artists with images:  1,892

======================================================================
```

---

## Performance

**Track backfilling:**
- ~50 tracks per second (batched API calls)
- 5,000 tracks: ~2-3 minutes

**Artist backfilling:**
- ~1 artist per second (individual API calls)
- 2,000 artists: ~35 minutes

**Total time:** ~30-40 minutes for full backfill

---

## Differences from Main Enrichment

| Feature | `enrich_metadata.py` | `backfill_images.py` |
|---------|---------------------|---------------------|
| **Targets** | New records only | Existing records with NULL images |
| **Fetches** | All metadata | Only image URLs |
| **Use case** | Initial enrichment | Update existing data |
| **Speed** | Slower (more data) | Faster (less data) |
| **Safe to re-run** | ✅ Yes | ✅ Yes |

---

## Verification

Check if images were successfully backfilled:

```bash
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')

# Count tracks with images
tracks = con.execute('''
  SELECT COUNT(*) FROM tracks WHERE album_image_url IS NOT NULL
''').fetchone()[0]
print(f'Tracks with images: {tracks:,}')

# Count artists with images
artists = con.execute('''
  SELECT COUNT(*) FROM artists WHERE image_url IS NOT NULL
''').fetchone()[0]
print(f'Artists with images: {artists:,}')

# Sample track with image
track = con.execute('''
  SELECT track_name, album_image_url 
  FROM tracks 
  WHERE album_image_url IS NOT NULL
  LIMIT 1
''').fetchone()
print(f'Sample track: {track[0]}')
print(f'  Image URL: {track[1][:60]}...')

# Sample artist with image
artist = con.execute('''
  SELECT artist_name, image_url 
  FROM artists 
  WHERE image_url IS NOT NULL
  LIMIT 1
''').fetchone()
print(f'Sample artist: {artist[0]}')
print(f'  Image URL: {artist[1][:60]}...')
"
```

---

## Troubleshooting

### "Missing Spotify credentials"

**Solution:** Set environment variables:
```bash
export SPOTIFY_CLIENT_ID=your_client_id
export SPOTIFY_CLIENT_SECRET=your_client_secret
```

Or create/update `.env` file (see [Enrichment Guide](./enrichment.md)).

### "Rate limit exceeded"

**Symptom:**
```
Error processing batch: 429 Too Many Requests
```

**Solution:**
- Script automatically retries with backoff
- Just wait, it will continue
- Don't run multiple instances simultaneously

### No records found to backfill

**Message:**
```
Found 0 tracks without images
Found 0 artists without images
```

**Possible reasons:**
1. ✅ All records already have images (great!)
2. ❌ No enriched data exists (run `enrich_metadata.py` first)
3. ❌ Schema columns don't exist (run database migration)

**Check:**
```bash
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
total_tracks = con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]
total_artists = con.execute('SELECT COUNT(*) FROM artists').fetchone()[0]
print(f'Total tracks enriched: {total_tracks:,}')
print(f'Total artists enriched: {total_artists:,}')
"
```

---

## After Backfilling

### Verify in Dashboard

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Check **Top Tracks** and **Top Artists** sections
4. You should see album covers and artist profile images

### Sync to Production

If deploying to Vercel:

```bash
# Sync updated data to Postgres
python scripts/sync_to_postgres.py

# Deploy
git add -A
git commit -m "Backfill image URLs"
git push origin main
```

---

## When to Re-Run

**Safe to run anytime:**
- The script only updates records with `NULL` image URLs
- Won't duplicate work or waste API calls
- Idempotent (safe to run multiple times)

**Run again if:**
- New tracks/artists are enriched without images
- Spotify updates an artist's profile photo
- You want to refresh old image URLs

---

## See Also

- [Enrichment Guide](./enrichment.md) - Main enrichment process
- [Data Pipeline](../architecture/data-pipeline.md) - Overall data flow
- [Database Architecture](../architecture/database.md) - Schema details
- [Updating Data](./updating-data.md) - Full update workflow


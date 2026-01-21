# Pipeline Quick Reference

Complete guide to the Spotify Wrapped 2.0 data pipeline.

## TL;DR

```bash
# Full pipeline (recommended)
./scripts/run_full_pipeline.sh

# Without enrichment
./scripts/run_full_pipeline.sh --no-enrich

# Sync to production
python scripts/sync_to_postgres.py
```

---

## Pipeline Flow

```
1. Ingest       → Read JSON files, create DuckDB tables
2. Enrich       → Fetch metadata from Spotify API (optional)
3. Map Genres   → 452 subgenres → 28 broad categories
4. Sync         → Copy to Vercel Postgres (for production)
5. Deploy       → Push to trigger Vercel deployment
```

---

## Scripts Overview

### `run_full_pipeline.sh` ⭐ Recommended

**Purpose:** Complete data processing in one command

**Usage:**
```bash
# Full pipeline with enrichment
./scripts/run_full_pipeline.sh

# Skip enrichment
./scripts/run_full_pipeline.sh --no-enrich

# Help
./scripts/run_full_pipeline.sh --help
```

**What it does:**
1. Ingests Spotify JSON → DuckDB
2. Enriches with Spotify API (if credentials found)
3. Maps genres (452 → 28 categories)
4. Shows summary

**Time:**
- Basic: 30-60 seconds
- With enrichment: +1-2 hours (only for new tracks/artists)

**Credentials:**
- Automatically loads from `.env` file
- Falls back to environment variables
- Shows warning if missing

---

### `run_enrichment.sh`

**Purpose:** Run enrichment + genre mapping (assumes data already ingested)

**Usage:**
```bash
./scripts/run_enrichment.sh
```

**When to use:**
- Data already ingested
- Want to add/update enrichment only

---

### `ingest_spotify.py`

**Purpose:** Raw JSON → DuckDB

**Usage:**
```bash
source venv/bin/activate
python scripts/ingest_spotify.py
```

**What it creates:**
- `plays` table (all listening history)
- `tracks` table (empty)
- `artists` table (empty)
- `audio_features` table (empty)
- `genre_mappings` table (empty)

---

### `enrich_metadata.py`

**Purpose:** Fetch metadata from Spotify API

**Requirements:**
```bash
export SPOTIFY_CLIENT_ID=xxx
export SPOTIFY_CLIENT_SECRET=yyy
```

**Usage:**
```bash
source venv/bin/activate
python scripts/enrich_metadata.py
```

**What it fetches:**
- Track metadata (release year, popularity)
- Artist metadata (genres, followers)

---

### `seed_genre_mappings.py`

**Purpose:** Categorize 452 Spotify genres → 28 broad categories

**Usage:**
```bash
source venv/bin/activate
python scripts/seed_genre_mappings.py
```

**When to run:**
- After enrichment (needs genres)
- When customizing categorization logic

**What it does:**
- Reads all genres from `artists` table
- Applies pattern-based categorization
- Stores in `genre_mappings` table

---

### `sync_to_postgres.py`

**Purpose:** DuckDB → Vercel Postgres

**Requirements:**
```bash
export POSTGRES_URL="postgres://..."
```

**Usage:**
```bash
source venv/bin/activate
python scripts/sync_to_postgres.py
```

**What it syncs:**
- plays (77k+ rows)
- tracks (19k+ rows)
- artists (5k+ rows)
- audio_features
- genre_mappings (452 rows)

**Performance:**
- ~80k rows/second
- Full sync: 2-3 seconds

---

## Workflow Examples

### Fresh Setup

```bash
# 1. Add Spotify JSON files to data_raw/

# 2. Run full pipeline
./scripts/run_full_pipeline.sh

# 3. Test locally
npm run dev

# 4. Sync to production
python scripts/sync_to_postgres.py

# 5. Deploy
git push origin main
```

---

### Update with New Data

```bash
# 1. Add new JSON files to data_raw/

# 2. Re-run pipeline
./scripts/run_full_pipeline.sh

# 3. Sync to production
python scripts/sync_to_postgres.py

# 4. Deploy
git push origin main
```

---

### Enable Enrichment

```bash
# 1. Get Spotify API credentials
# https://developer.spotify.com/dashboard

# 2. Create .env file
cat > .env << EOF
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
EOF

# 3. Run pipeline
./scripts/run_full_pipeline.sh

# Enrichment will run automatically!
```

---

### Update Genre Mappings Only

```bash
# If you customize categorization logic
python scripts/seed_genre_mappings.py

# Sync to production
python scripts/sync_to_postgres.py
```

---

## Environment Setup

### Python Virtual Environment

```bash
# Create (first time only)
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

**Method 1: .env file (recommended)**
```bash
# .env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

**Method 2: Export**
```bash
export SPOTIFY_CLIENT_ID=your_client_id
export SPOTIFY_CLIENT_SECRET=your_client_secret
```

---

## Database Tables

### plays
All listening history (77k+ rows)
- `played_at`, `ms_played`, `track_name`, `artist_name`
- Derived: `date`, `year`, `month`, `year_month`, `dow`, `hour`

### tracks
Track metadata (19k+ rows)
- `spotify_track_uri`, `track_name`, `release_year`, `popularity`

### artists
Artist metadata (5k+ rows)
- `artist_name`, `genres` (comma-separated), `popularity`, `followers`

### genre_mappings
Subgenre → broad genre (452 rows)
- `subgenre` (e.g., "folk rock")
- `broad_genre` (e.g., "Rock")
- `confidence` ("high", "medium", "low")

### audio_features
Audio characteristics (future)
- `danceability`, `energy`, `valence`, `tempo`

---

## Troubleshooting

### "No JSON files found"
```bash
# Check data_raw/
ls -la data_raw/

# Files should be named: Streaming_History_Audio_*.json
```

### "Virtual environment not found"
```bash
# Create it
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### "DuckDB locked"
```bash
# Close all connections
pkill -f "next dev"
pkill -f python

# Re-run
./scripts/run_full_pipeline.sh
```

### "Spotify API credentials not found"
```bash
# Check .env file exists
cat .env

# Or export directly
export SPOTIFY_CLIENT_ID=xxx
export SPOTIFY_CLIENT_SECRET=yyy
```

### Enrichment is slow
This is normal:
- Tracks: ~50/second (API batch limit)
- Artists: ~1/second (requires search)
- 10k tracks = ~3 minutes
- 5k artists = ~90 minutes

Run overnight for large datasets.

---

## Performance

| Operation | Time | Rate |
|-----------|------|------|
| Ingest (77k plays) | 30-60s | ~1,500 plays/sec |
| Enrich tracks (10k) | 3-4 min | ~50 tracks/sec |
| Enrich artists (5k) | 90 min | ~1 artist/sec |
| Map genres | <1s | Instant |
| Sync to Postgres | 2-3s | ~80k rows/sec |

---

## API Endpoints

After processing, these endpoints become available:

| Endpoint | Description |
|----------|-------------|
| `/api/summary` | Total stats |
| `/api/trends` | Monthly listening |
| `/api/hour` | Hour-of-day patterns |
| `/api/dow` | Day-of-week patterns |
| `/api/top-tracks` | Most-played tracks |
| `/api/top-artists` | Most-played artists |
| `/api/genres` | Granular (452 genres) |
| `/api/genres-broad` | Broad categories (28) ⭐ |
| `/api/release-years` | Release year distribution |
| `/api/artist-evolution` | Top artists over time |
| `/api/discovery-rate` | New artists per month |

---

## See Also

- [Getting Started](getting-started.md) - Initial setup
- [Data Pipeline Architecture](architecture/data-pipeline.md) - Detailed flow
- [Enrichment Guide](guides/enrichment.md) - Spotify API setup
- [Genre Mappings Guide](guides/genre-mappings.md) - Genre categorization
- [Updating Data Guide](guides/updating-data.md) - Update workflow
- [Deployment Guide](guides/deployment.md) - Vercel deployment

---

## Quick Commands Reference

```bash
# Full pipeline
./scripts/run_full_pipeline.sh

# Pipeline without enrichment
./scripts/run_full_pipeline.sh --no-enrich

# Enrichment only
./scripts/run_enrichment.sh

# Manual steps
python scripts/ingest_spotify.py
python scripts/enrich_metadata.py
python scripts/seed_genre_mappings.py
python scripts/sync_to_postgres.py

# Verify data
python -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
print('Plays:', con.execute('SELECT COUNT(*) FROM plays').fetchone()[0])
print('Tracks:', con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0])
print('Artists:', con.execute('SELECT COUNT(*) FROM artists').fetchone()[0])
print('Mappings:', con.execute('SELECT COUNT(*) FROM genre_mappings').fetchone()[0])
"

# Start dev server
npm run dev
```


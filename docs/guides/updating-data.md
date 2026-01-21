# Updating Data Guide

How to add new Spotify listening data to your dashboard.

## Overview

When you get new Spotify data exports (or request updated data), follow this workflow to update your dashboard.

## Quick Update

```bash
# 1. Add new JSON files
cp ~/Downloads/Streaming_History*.json data_raw/

# 2. Run full pipeline (ingest + enrich + map genres)
./scripts/run_full_pipeline.sh

# 3. Sync to Postgres (for production)
python scripts/sync_to_postgres.py

# 4. Deploy
git push origin main
```

---

## Detailed Steps

### Step 1: Get New Spotify Data

**Request data from Spotify:**
1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Scroll to "Download your data"
3. Select "Extended streaming history"
4. Wait 5-30 days for email
5. Download and extract ZIP file

**Data files:**
- `Streaming_History_Audio_YYYY-YYYY_N.json`
- Usually 6-8 files covering different time periods
- Each file contains array of plays

### Step 2: Add to data_raw/

```bash
# Copy new files
cp ~/Downloads/my_spotify_data/Streaming_History*.json data_raw/

# Check files
ls -lh data_raw/
# Should see all JSON files
```

**File naming:**
- Files can have any name
- Script reads all `Streaming_History_Audio_*.json`
- Old files are fine to keep

### Step 3: Run Full Pipeline

```bash
# Run complete pipeline (recommended)
./scripts/run_full_pipeline.sh

# Or skip enrichment if you don't need it
./scripts/run_full_pipeline.sh --no-enrich
```

**What happens:**
1. Drops existing `plays` table
2. Reads all JSON files from `data_raw/`
3. Filters plays < 30 seconds
4. Converts UTC → local timezone
5. Creates derived columns
6. Enriches with Spotify API (if credentials available)
7. Maps genres (452 → 28 broad categories)
8. Builds new DuckDB database

**Time:** 
- Basic ingestion: ~30-60 seconds for 100k plays
- With enrichment: +1-2 hours (only for new tracks/artists)

**Output:**
```
Connecting to data/spotify.duckdb
Processing: Streaming_History_Audio_2023-2024_0.json
  Loaded 15,234 plays
Processing: Streaming_History_Audio_2024-2025_1.json
  Loaded 18,456 plays
...
Total plays ingested: 77,800
Filtered out: 2,341 plays (< 30 seconds)
Database ready!
```

### Step 4: Verify Locally

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Check:
# - Summary stats updated
# - Date range covers new data
# - Charts show recent months
```

**Quick verification:**
```bash
# Check play count in database
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
print('Total plays:', con.execute('SELECT COUNT(*) FROM plays').fetchone()[0])
print('Date range:', con.execute('SELECT MIN(date), MAX(date) FROM plays').fetchone())
"
```

### Step 5: Enrichment (Automatic)

The full pipeline automatically runs enrichment if credentials are found:

**Credentials location:**
- `.env` file (recommended)
- Or environment variables

**If enrichment runs:**
- Finds new tracks not in `tracks` table
- Finds new artists not in `artists` table
- Fetches metadata from Spotify API
- Maps genres to broad categories
- Updates enrichment tables

**Time:** ~5-10 minutes for 1000 new tracks

**Manual enrichment only:**
```bash
./scripts/run_enrichment.sh
```

### Step 6: Sync to Postgres

```bash
# Set Postgres URL (from Vercel dashboard)
export POSTGRES_URL="postgres://..."

# Sync data
python scripts/sync_to_postgres.py
```

**What happens:**
1. Connects to local DuckDB
2. Connects to Vercel Postgres
3. **Drops and recreates** all tables
4. Bulk loads using fast COPY
5. Creates indexes

**Time:** ~2-3 seconds for 100k plays

**Output:**
```
Syncing DuckDB → Vercel Postgres
✓ plays synced: 77,800 rows in 1.0s (81k rows/sec)
✓ tracks synced: 5,234 rows in 0.2s
✓ artists synced: 1,892 rows in 0.1s
✓ genre_mappings synced: 452 rows in 0.1s
SYNC COMPLETE ✓
```

### Step 7: Deploy

```bash
# Commit (optional - data_raw is gitignored)
git add .
git commit -m "Update data to $(date +%Y-%m)"

# Push to trigger Vercel deployment
git push origin main
```

**Deployment:**
- Vercel detects push
- Builds project
- Deploys to production
- Updates live URL automatically

**Check deployment:**
1. Go to Vercel dashboard
2. View Deployments tab
3. Wait for "Ready" status
4. Visit live URL

---

## Incremental vs Full Update

### Full Re-ingestion (Recommended)

**When:** You get new data export from Spotify

**Process:**
- Drops entire `plays` table
- Re-reads all JSON files
- Rebuilds from scratch

**Pros:**
- Clean, no duplicates
- Fixes any data quality issues
- Consistent state

**Cons:**
- Takes 30-60 seconds
- Loses manual edits (if any)

### Incremental Update (Not Implemented)

**Would require:**
- De-duplication logic
- Merge instead of replace
- Handling out-of-order data

**Not recommended because:**
- Spotify exports overlap
- Risk of duplicates
- More complex code
- Full re-ingest is fast enough

---

## Data Validation

### After Ingestion

**Check play count:**
```bash
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
result = con.execute('SELECT COUNT(*) FROM plays').fetchone()
print(f'Total plays: {result[0]:,}')
"
```

**Check date range:**
```bash
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
result = con.execute('SELECT MIN(date), MAX(date) FROM plays').fetchone()
print(f'Date range: {result[0]} to {result[1]}')
"
```

**Check top artist:**
```bash
python3 -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
result = con.execute('''
  SELECT artist_name, COUNT(*) as plays
  FROM plays
  GROUP BY artist_name
  ORDER BY plays DESC
  LIMIT 1
''').fetchone()
print(f'Top artist: {result[0]} ({result[1]:,} plays)')
"
```

### After Sync

**Check Postgres:**
```bash
# Using psql (if installed)
psql $POSTGRES_URL -c "SELECT COUNT(*) FROM plays"

# Or check in Vercel dashboard
# Storage → Your Database → Query tab
```

### In Production

**Visit dashboard:**
- Check summary stats
- Verify date range
- Test filters
- Check charts render

---

## Frequency

### How Often to Update?

**Option 1: Quarterly**
- Request new export every 3 months
- Most people's preference
- Balances freshness vs effort

**Option 2: Annually**
- Once per year update
- Less work, less fresh

**Option 3: Monthly**
- Request monthly (if Spotify allows)
- Most up-to-date
- More effort

**Recommendation:** Quarterly

### Spotify Export Frequency

**Limits:**
- Can request every ~30 days
- Spotify may throttle frequent requests
- Exports take 5-30 days to receive

---

## Automation Ideas

### Semi-Automated (Built-in)

The `run_full_pipeline.sh` script already handles the full workflow:

```bash
#!/bin/bash
# Complete update workflow

# 1. Run full pipeline (ingest + enrich + map genres)
./scripts/run_full_pipeline.sh

# 2. Sync to Postgres
if [ -n "$POSTGRES_URL" ]; then
  python scripts/sync_to_postgres.py
else
  echo "⚠️  POSTGRES_URL not set, skipping sync"
fi

echo "✓ Update complete!"
echo "Next: git push origin main"
```

**Usage:**
```bash
./scripts/run_full_pipeline.sh
```

The script automatically:
- Detects credentials from `.env`
- Runs enrichment if available
- Maps genres after enrichment
- Shows warnings if credentials missing

### Fully Automated (Future)

**Would require:**
- Spotify API for recent history
- GitHub Actions for deployment
- Scheduled runs (e.g., weekly)

**Challenges:**
- Spotify API only provides last 50 tracks
- No bulk history export via API
- Extended history requires manual request

---

## Troubleshooting

### "No JSON files found"
```bash
# Check data_raw exists
ls -la data_raw/

# Verify file names
# Should be: Streaming_History_Audio_*.json
```

### "DuckDB locked"
```bash
# Close any Python/DuckDB connections
# Kill dev server if running
pkill -f "next dev"

# Re-run ingestion
./scripts/run_pipeline.sh
```

### "Postgres sync failed"
```bash
# Check POSTGRES_URL is set
echo $POSTGRES_URL

# Verify database is accessible
psql $POSTGRES_URL -c "SELECT 1"

# Check Vercel dashboard for database status
```

### Data looks wrong
```bash
# Check for duplicate files
ls -lh data_raw/

# Verify JSON format
head -50 data_raw/Streaming_History_Audio_*.json | jq

# Check timezone setting
grep LOCAL_TIMEZONE scripts/ingest_spotify.py
```

---

## Best Practices

✅ **Backup before updating**
```bash
cp data/spotify.duckdb data/spotify.duckdb.backup
```

✅ **Test locally first**
- Run ingestion
- Check data in dashboard
- Verify before syncing to Postgres

✅ **Keep old JSON files**
- Spotify exports may overlap
- Good to have redundancy
- Disk space is cheap

✅ **Document your updates**
```bash
git commit -m "Update data: 2024-01 to 2024-03"
```

✅ **Verify in production**
- Check live site after deploy
- Confirm new data appears
- Test all features

---

## See Also

- [Getting Started](../getting-started.md) - Initial setup
- [Data Pipeline](../architecture/data-pipeline.md) - How ingestion works
- [Deployment](./deployment.md) - Publishing changes
- [Enrichment](./enrichment.md) - Adding Spotify API metadata


# Timezone Handling

## Overview

Spotify provides streaming history timestamps in **UTC (Coordinated Universal Time)**. This project converts all timestamps to **America/Toronto timezone** during the ingestion process for accurate local time analysis.

## Why This Matters

Without timezone conversion, your hour-of-day analysis would show UTC times instead of your actual listening times:

```
Without Conversion (UTC)     →    With Conversion (Toronto)
────────────────────────────────────────────────────────────
2 AM: Peak listening         →    9 PM: Peak listening ✓
14:00: Moderate activity     →    9 AM: Moderate activity ✓
```

## Configuration

The timezone is configured in `scripts/ingest_spotify.py`:

```python
LOCAL_TIMEZONE = ZoneInfo('America/Toronto')  # EST/EDT
```

### Supported Timezones

To change the timezone, modify the `LOCAL_TIMEZONE` constant to any valid IANA timezone:

**Examples:**
- `America/Toronto` — EST/EDT (UTC-5/UTC-4)
- `America/New_York` — EST/EDT (UTC-5/UTC-4)
- `America/Los_Angeles` — PST/PDT (UTC-8/UTC-7)
- `America/Chicago` — CST/CDT (UTC-6/UTC-5)
- `Europe/London` — GMT/BST (UTC+0/UTC+1)
- `Asia/Tokyo` — JST (UTC+9)

See full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## How It Works

### 1. Ingestion Process

```python
# Parse Spotify's UTC timestamp
ts_string = item['ts']  # e.g., "2024-01-12T21:00:00Z"
played_at_utc = datetime.fromisoformat(ts_string)

# Convert to Toronto time
played_at_local = played_at_utc.astimezone(LOCAL_TIMEZONE)
```

### 2. Daylight Saving Time (DST)

The conversion **automatically handles DST**:
- **Winter (EST):** UTC-5 hours
- **Summer (EDT):** UTC-4 hours
- **DST transitions:** Handled by Python's `zoneinfo`

### 3. Storage

Timestamps are stored in DuckDB as **timezone-naive** values in local time:
```sql
-- Stored as local time (no timezone suffix)
played_at: "2024-01-12 16:00:00"  -- 4 PM Toronto time
```

## Migration Notes

### First-Time Setup
No migration needed — just run the pipeline with your Spotify data.

### Re-Ingesting Existing Data

If you previously ingested data **without** timezone conversion:

```bash
# Old data was in UTC
# New ingestion will be in Toronto time
# Just re-run the pipeline:

source venv/bin/activate
./scripts/run_pipeline.sh
```

**Important:** The pipeline drops and recreates the database, so all timestamps will be consistently in the new timezone.

## Verification

After ingestion, you can verify the timezone conversion:

```python
import duckdb

con = duckdb.connect('data/spotify.duckdb')

# Check hour distribution
result = con.execute("""
    SELECT hour, COUNT(*) as plays
    FROM plays
    GROUP BY hour
    ORDER BY hour
""").fetchall()

# Peak hours should align with your actual listening habits
# e.g., 8-11 PM for evening listening
```

## Impact on Analysis

### Hour-of-Day Chart
- ✅ Shows your **actual** listening hours
- ✅ Peak times match your local schedule
- ✅ Morning/evening patterns are accurate

### Day-of-Week Analysis
- ✅ Late-night listening shows on correct day
- ✅ Weekend patterns align with your calendar

### Monthly/Yearly Trends
- ⚠️ Small edge case: plays near midnight UTC may shift dates
- 📊 Overall monthly totals remain accurate

## Technical Details

### Requirements
- Python 3.9+ (for `zoneinfo` module)
- No external packages needed (stdlib only)

### Alternative: External Package

If using Python 3.8 or earlier, install `backports.zoneinfo`:

```bash
pip install backports.zoneinfo
```

Then import:
```python
from backports.zoneinfo import ZoneInfo
```

## FAQ

**Q: What if I traveled and listened in different timezones?**  
A: The current implementation uses a single timezone (Toronto). For multi-timezone support, you'd need to track location per play (using `conn_country` or `ip_addr` fields) and implement per-play timezone conversion.

**Q: Can I change the timezone after ingestion?**  
A: Yes, but you'll need to re-run the entire pipeline. The timezone conversion happens during ingestion, not at query time.

**Q: Does this affect the raw Spotify data?**  
A: No. Raw data in `data_raw/` remains unchanged. Only the DuckDB database and exported aggregates reflect the timezone conversion.

**Q: What if Spotify changes their timestamp format?**  
A: The script handles both `Z` and `+00:00` UTC indicators. If Spotify changes format, update the parsing logic in `ingest_spotify.py`.

---

**Last Updated:** January 2026  
**Timezone:** America/Toronto (EST/EDT)


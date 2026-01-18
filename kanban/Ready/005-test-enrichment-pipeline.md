# Test and validate Spotify API enrichment pipeline

---
**id:** 005  
**priority:** P1  
**size:** L  
**epic:** Data Enrichment & Analytics  
**created:** 2026-01-18  
**tags:** feature, testing

---

## Title

Test and validate Spotify API enrichment pipeline with production data

## Dependencies

**blocked_by:** []  
**blocks:** [006, 007]  
**parallel_with:** []

## Context

The enrichment scripts (`enrich_metadata.py`) are already implemented but haven't been tested with real Spotify API credentials and production data. This ticket covers:
- Getting Spotify Developer credentials
- Running enrichment on full dataset
- Validating data quality
- Documenting the process and any issues

This unblocks genre analysis and release year features.

## Acceptance Criteria

Script validation:
- [ ] Obtain Spotify API credentials (Client ID + Secret)
- [ ] Run track enrichment script successfully
- [ ] Run artist enrichment script successfully
- [ ] Verify data written to `tracks` and `artists` tables

Data quality:
- [ ] Check sample of enriched tracks for correctness
- [ ] Check sample of enriched artists for correctness
- [ ] Verify genres are properly formatted
- [ ] Verify release years are accurate

Performance:
- [ ] Document actual enrichment speed (tracks/sec, artists/sec)
- [ ] Note any rate limiting issues
- [ ] Document total time for full dataset

Documentation:
- [ ] Update `docs/guides/enrichment.md` with findings
- [ ] Document common errors and solutions
- [ ] Add troubleshooting section

## Implementation Notes

**Approach:**
1. Create Spotify Developer app at https://developer.spotify.com/dashboard
2. Set environment variables (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
3. Run: `python scripts/enrich_metadata.py`
4. Monitor progress and log any errors
5. Verify results in database
6. Sync to Postgres: `python scripts/sync_to_postgres.py`

**Key files:**
- `scripts/enrich_metadata.py` — Main enrichment script
- `docs/guides/enrichment.md` — Documentation

**Expected performance:**
- Tracks: ~50 per second (API batch limit)
- Artists: ~1 per second (requires search)
- ~10-15k tracks: 5-10 minutes
- ~5k artists: 90 minutes

**Considerations:**
- API rate limits (429 errors)
- Missing data (tracks/artists not found)
- Network timeouts
- Script needs to be idempotent (safe to re-run)

## Test Plan

Before enrichment:
- [ ] Verify Spotify credentials work (test API call)
- [ ] Check database schema is correct
- [ ] Backup database (cp spotify.duckdb spotify.duckdb.backup)

During enrichment:
- [ ] Monitor progress output
- [ ] Watch for errors or rate limit issues
- [ ] Verify data is being written

After enrichment:
- [ ] Query database to check record counts
- [ ] Sample random tracks and verify metadata
- [ ] Sample random artists and verify genres
- [ ] Check for NULL values or missing data
- [ ] Test API endpoints that use enriched data

## Status History

- 2026-01-18: Created → Ready


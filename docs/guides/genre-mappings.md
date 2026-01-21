# Genre Mappings Guide

## Overview

Spotify provides very granular genre classifications (452+ unique genres in your data!). This can make analysis difficult when you have dozens of rock subgenres like "folk rock", "classic rock", "psychedelic rock", etc.

The genre mapping system reduces these 452 specific subgenres into 28 broader categories for easier analysis and visualization.

## Stats

- **Granular genres**: 452 specific Spotify genres
- **Broad genres**: 28 high-level categories
- **Reduction**: 93.8% fewer categories to manage

## Broad Genre Categories

The system maps all subgenres to these 28 categories:

1. **Rock** (44 subgenres) - All rock variants including classic, folk, alternative, psychedelic, etc.
2. **Soul/R&B** (19 subgenres) - Soul, R&B, Motown, etc.
3. **Folk/Americana** (18 subgenres) - Folk, americana, singer-songwriter, bluegrass, etc.
4. **Jazz** (28 subgenres) - All jazz styles including fusion, bebop, smooth jazz, etc.
5. **Indie/Alternative** (20 subgenres) - Indie, alternative, bedroom pop, lo-fi, etc.
6. **Pop** (37 subgenres) - Pop and pop-adjacent genres
7. **Electronic/Dance** (52 subgenres) - House, techno, EDM, trance, etc.
8. **Hip Hop/Rap** (33 subgenres) - All hip hop and rap styles
9. **Funk** (4 subgenres) - Funk and funk-adjacent
10. **Blues** (5 subgenres) - Blues styles
11. **Metal** (23 subgenres) - All metal subgenres
12. **Country** (12 subgenres) - Country and related
13. **Punk** (4 subgenres) - Punk styles
14. **Reggae/Caribbean** (9 subgenres) - Reggae, ska, dancehall, etc.
15. **Latin** (15 subgenres) - Latin music styles
16. **Classical** (15 subgenres) - Classical and orchestral
17. **World** (26 subgenres) - World music, ethnic, traditional
18. **Gospel/Christian** (7 subgenres) - Gospel and Christian music
19. **Holiday** (2 subgenres) - Christmas and holiday music
20. **Disco** (3 subgenres)
21. **Emo/Screamo** (3 subgenres)
22. **Experimental** (6 subgenres)
23. **Easy Listening** (5 subgenres) - Lounge, yacht rock, smooth jazz
24. **Soundtrack/Score** (4 subgenres)
25. **Spoken Word/Comedy** (2 subgenres)
26. **Children's** (2 subgenres)
27. **New Age** (2 subgenres)
28. **Other** (52 subgenres) - Unmapped or very niche genres

## Usage

### Database Table

Genre mappings are stored in the `genre_mappings` table:

```sql
CREATE TABLE genre_mappings (
    subgenre TEXT PRIMARY KEY,        -- e.g., "folk rock"
    broad_genre TEXT NOT NULL,        -- e.g., "Rock"
    confidence TEXT,                  -- "high", "medium", "low"
    notes TEXT,                       -- Optional notes about the mapping
    created_at TIMESTAMP
)
```

### API Endpoint

**Endpoint**: `/api/genres-broad`

**Query Parameters**:
- `start` (optional) - Start date filter (YYYY-MM format)
- `end` (optional) - End date filter (YYYY-MM format)

**Example**:
```bash
curl http://localhost:3000/api/genres-broad
curl http://localhost:3000/api/genres-broad?start=2023-01&end=2023-12
```

**Response**:
```json
{
  "data": [
    {
      "genre": "Rock",
      "hours": 2023.72,
      "plays": 33275
    },
    {
      "genre": "Soul/R&B",
      "hours": 710.31,
      "plays": 12791
    },
    ...
  ]
}
```

### Direct SQL Query

```sql
-- Get broad genre listening stats
WITH unnested_genres AS (
  SELECT 
    UNNEST(STRING_SPLIT(a.genres, ',')) AS subgenre,
    p.ms_played
  FROM plays p
  JOIN artists a ON p.artist_name = a.artist_name
  WHERE a.genres IS NOT NULL
)
SELECT 
  COALESCE(gm.broad_genre, ug.subgenre) AS genre,
  ROUND(SUM(ug.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
  COUNT(*) AS plays
FROM unnested_genres ug
LEFT JOIN genre_mappings gm ON ug.subgenre = gm.subgenre
GROUP BY genre
ORDER BY hours DESC
```

## Maintenance

### Updating Mappings

If you want to customize the genre mappings:

1. Edit `scripts/seed_genre_mappings.py`
2. Modify the `categorize_genre()` function
3. Re-run the seed script:

```bash
cd /path/to/spotify-wrapped-revisited
source venv/bin/activate
python scripts/seed_genre_mappings.py
```

### Syncing to Production

After updating mappings locally, sync to Vercel Postgres:

```bash
./scripts/sync_to_postgres.py
```

## How It Works

The mapping uses pattern-based categorization with priority rules:

1. **Metal** checked first (very specific)
2. **Rock** variants (including grunge, britpop, etc.)
3. **Hip Hop/Rap** (including trap, drill, etc.)
4. **Electronic/Dance** (house, techno, EDM, etc.)
5. And so on...

Genres are assigned a confidence level:
- **high**: Clear, unambiguous mapping
- **medium**: Could fit multiple categories
- **low**: Fallback to "Other" category

## Examples

| Subgenre | → | Broad Genre | Confidence |
|----------|---|-------------|------------|
| folk rock | → | Rock | high |
| acid jazz | → | Jazz | high |
| yacht rock | → | Easy Listening | medium |
| bedroom pop | → | Indie/Alternative | high |
| lo-fi hip hop | → | Indie/Alternative | high |
| trap latino | → | Latin | high |

## Benefits

✅ **Easier visualization** - 28 categories instead of 452  
✅ **Better insights** - See high-level taste patterns  
✅ **Still flexible** - Original granular data preserved  
✅ **Customizable** - Edit mappings to match your preferences  
✅ **Backwards compatible** - Original `/api/genres` endpoint unchanged  

## Files Modified

- `scripts/ingest_spotify.py` - Added genre_mappings table to schema
- `scripts/seed_genre_mappings.py` - New script to populate mappings
- `scripts/sync_to_postgres.py` - Added genre_mappings to sync
- `app/api/genres-broad/route.ts` - New API endpoint
- Database tables:
  - `genre_mappings` - Stores subgenre → broad genre mappings

## Comparison

### Before (Granular)
```
folk rock:          330 hours
classic rock:       329 hours
retro soul:         287 hours
pop soul:           227 hours
yacht rock:         227 hours
southern rock:      197 hours
soft rock:          187 hours
... 445 more genres
```

### After (Broad)
```
Rock:              2024 hours  ← Combined from 44 subgenres
Soul/R&B:           710 hours  ← Combined from 19 subgenres
Folk/Americana:     639 hours  ← Combined from 18 subgenres
Jazz:               593 hours  ← Combined from 28 subgenres
... 24 more categories
```

Much easier to understand and visualize!


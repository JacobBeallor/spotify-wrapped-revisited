#!/usr/bin/env python3
"""
Ingest Spotify extended streaming history JSON files into DuckDB.

Reads all Streaming_History_Audio_*.json files from data_raw/
and creates a normalized 'plays' table in data/spotify.duckdb.
"""

import json
import duckdb
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo

# Paths
DATA_RAW_DIR = Path(__file__).parent.parent / "data_raw"
DATA_DIR = Path(__file__).parent.parent / "data"
DB_PATH = DATA_DIR / "spotify.duckdb"

# Timezone configuration
# Spotify timestamps are in UTC, convert to local timezone
LOCAL_TIMEZONE = ZoneInfo('America/Toronto')  # EST/EDT (automatically handles DST)

def main():
    # Ensure data directory exists
    DATA_DIR.mkdir(exist_ok=True)
    
    # Connect to DuckDB
    print(f"Connecting to {DB_PATH}")
    con = duckdb.connect(str(DB_PATH))
    
    # Drop existing table if present
    con.execute("DROP TABLE IF EXISTS plays")
    
    # Create table with full schema
    con.execute("""
        CREATE TABLE plays (
            played_at TIMESTAMP NOT NULL,
            ms_played BIGINT NOT NULL,
            track_name TEXT NOT NULL,
            artist_name TEXT NOT NULL,
            album_name TEXT,
            spotify_track_uri TEXT,
            -- Derived columns
            date DATE,
            year INTEGER,
            month INTEGER,
            year_month VARCHAR,
            dow INTEGER,
            dow_name VARCHAR,
            hour INTEGER
        )
    """)
    
    # Find all streaming history files
    json_files = sorted(DATA_RAW_DIR.glob("Streaming_History_Audio_*.json"))
    
    if not json_files:
        print(f"ERROR: No Streaming_History_Audio_*.json files found in {DATA_RAW_DIR}")
        print("Please place your Spotify export files in data_raw/")
        return
    
    print(f"Found {len(json_files)} file(s) to process")
    
    total_records = 0
    
    for json_file in json_files:
        print(f"Processing {json_file.name}...")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Transform records
        records = []
        for item in data:
            # Skip if missing critical fields
            if not item.get('ts') or not item.get('master_metadata_track_name'):
                continue
            
            # Parse timestamp (Spotify provides UTC)
            ts_string = item['ts']
            # Handle both 'Z' and '+00:00' UTC indicators
            ts_string = ts_string.replace('Z', '+00:00')
            played_at_utc = datetime.fromisoformat(ts_string)
            
            # Convert to local timezone (Toronto)
            played_at_local = played_at_utc.astimezone(LOCAL_TIMEZONE)
            
            # Store as ISO format string (without timezone suffix for DuckDB)
            played_at = played_at_local.replace(tzinfo=None).isoformat()
            
            records.append({
                'played_at': played_at,
                'ms_played': item.get('ms_played', 0),
                'track_name': item.get('master_metadata_track_name', 'Unknown'),
                'artist_name': item.get('master_metadata_album_artist_name', 'Unknown'),
                'album_name': item.get('master_metadata_album_album_name'),
                'spotify_track_uri': item.get('spotify_track_uri')
            })
        
        # Batch insert
        if records:
            con.executemany("""
                INSERT INTO plays (
                    played_at, ms_played, track_name, artist_name, 
                    album_name, spotify_track_uri
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, [
                (
                    r['played_at'],
                    r['ms_played'],
                    r['track_name'],
                    r['artist_name'],
                    r['album_name'],
                    r['spotify_track_uri']
                )
                for r in records
            ])
            
            total_records += len(records)
            print(f"  Inserted {len(records)} records")
    
    # Update derived columns
    print("Computing derived columns...")
    con.execute("""
        UPDATE plays
        SET 
            date = CAST(played_at AS DATE),
            year = EXTRACT(YEAR FROM played_at),
            month = EXTRACT(MONTH FROM played_at),
            year_month = STRFTIME(played_at, '%Y-%m'),
            dow = EXTRACT(DOW FROM played_at),
            dow_name = CASE EXTRACT(DOW FROM played_at)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END,
            hour = EXTRACT(HOUR FROM played_at)
    """)
    
    # Create index for performance
    con.execute("CREATE INDEX idx_plays_year_month ON plays(year_month)")
    con.execute("CREATE INDEX idx_plays_date ON plays(date)")
    
    # Print summary
    print("\n" + "="*60)
    print("INGESTION COMPLETE")
    print("="*60)
    print(f"Timezone: {LOCAL_TIMEZONE} (EST/EDT)")
    print("All timestamps converted from UTC to local time")
    print("="*60)
    
    summary = con.execute("""
        SELECT 
            COUNT(*) AS total_plays,
            MIN(played_at) AS first_play,
            MAX(played_at) AS last_play,
            COUNT(DISTINCT track_name) AS unique_tracks,
            COUNT(DISTINCT artist_name) AS unique_artists,
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS total_hours
        FROM plays
    """).fetchone()
    
    print(f"Total plays:      {summary[0]:,}")
    print(f"First play:       {summary[1]}")
    print(f"Last play:        {summary[2]}")
    print(f"Unique tracks:    {summary[3]:,}")
    print(f"Unique artists:   {summary[4]:,}")
    print(f"Total hours:      {summary[5]:,}")
    print("="*60)
    
    con.close()
    print(f"\nDatabase saved to {DB_PATH}")

if __name__ == "__main__":
    main()


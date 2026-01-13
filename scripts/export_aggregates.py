#!/usr/bin/env python3
"""
Export aggregated data from DuckDB to JSON files for the web dashboard.

Reads from data/spotify.duckdb and writes JSON files to public/data/
"""

import json
import duckdb
from pathlib import Path
from datetime import datetime

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
PUBLIC_DATA_DIR = Path(__file__).parent.parent / "public" / "data"
DB_PATH = DATA_DIR / "spotify.duckdb"

def main():
    # Ensure output directory exists
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Connect to DuckDB
    print(f"Connecting to {DB_PATH}")
    
    if not DB_PATH.exists():
        print(f"ERROR: Database not found at {DB_PATH}")
        print("Please run ingest_spotify.py first")
        return
    
    con = duckdb.connect(str(DB_PATH), read_only=True)
    
    # ========================================================================
    # 1. SUMMARY
    # ========================================================================
    print("\nExporting summary.json...")
    
    summary = con.execute("""
        SELECT 
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS total_hours,
            COUNT(*) AS total_plays,
            COUNT(DISTINCT track_name) AS unique_tracks,
            COUNT(DISTINCT artist_name) AS unique_artists,
            MIN(played_at) AS first_played_at,
            MAX(played_at) AS last_played_at
        FROM plays
    """).fetchone()
    
    summary_data = {
        "total_hours": float(summary[0]),
        "total_plays": int(summary[1]),
        "unique_tracks": int(summary[2]),
        "unique_artists": int(summary[3]),
        "first_played_at": str(summary[4]),
        "last_played_at": str(summary[5])
    }
    
    with open(PUBLIC_DATA_DIR / "summary.json", 'w') as f:
        json.dump(summary_data, f, indent=2)
    
    print(f"  Total hours: {summary_data['total_hours']:,.2f}")
    print(f"  Total plays: {summary_data['total_plays']:,}")
    
    # ========================================================================
    # 2. MONTHLY
    # ========================================================================
    print("\nExporting monthly.json...")
    
    monthly = con.execute("""
        SELECT 
            year_month,
            year,
            month,
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
            COUNT(*) AS plays,
            COUNT(DISTINCT track_name) AS unique_tracks,
            COUNT(DISTINCT artist_name) AS unique_artists
        FROM plays
        GROUP BY year_month, year, month
        ORDER BY year_month
    """).fetchall()
    
    monthly_data = [
        {
            "year_month": row[0],
            "year": int(row[1]),
            "month": int(row[2]),
            "hours": float(row[3]),
            "plays": int(row[4]),
            "unique_tracks": int(row[5]),
            "unique_artists": int(row[6])
        }
        for row in monthly
    ]
    
    with open(PUBLIC_DATA_DIR / "monthly.json", 'w') as f:
        json.dump(monthly_data, f, indent=2)
    
    print(f"  Exported {len(monthly_data)} months")
    
    # ========================================================================
    # 3. DAY OF WEEK
    # ========================================================================
    print("\nExporting dow.json...")
    
    dow = con.execute("""
        SELECT 
            year_month,
            dow,
            dow_name,
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
            COUNT(*) AS plays
        FROM plays
        GROUP BY year_month, dow, dow_name
        ORDER BY year_month, dow
    """).fetchall()
    
    dow_data = [
        {
            "year_month": row[0],
            "dow": int(row[1]),
            "dow_name": row[2],
            "hours": float(row[3]),
            "plays": int(row[4])
        }
        for row in dow
    ]
    
    with open(PUBLIC_DATA_DIR / "dow.json", 'w') as f:
        json.dump(dow_data, f, indent=2)
    
    print(f"  Exported {len(dow_data)} day-of-week records")
    
    # ========================================================================
    # 4. HOUR OF DAY
    # ========================================================================
    print("\nExporting hour.json...")
    
    hour = con.execute("""
        SELECT 
            year_month,
            hour,
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
            COUNT(*) AS plays
        FROM plays
        GROUP BY year_month, hour
        ORDER BY year_month, hour
    """).fetchall()
    
    hour_data = [
        {
            "year_month": row[0],
            "hour": int(row[1]),
            "hours": float(row[2]),
            "plays": int(row[3])
        }
        for row in hour
    ]
    
    with open(PUBLIC_DATA_DIR / "hour.json", 'w') as f:
        json.dump(hour_data, f, indent=2)
    
    print(f"  Exported {len(hour_data)} hour records")
    
    # ========================================================================
    # 5. TOP ARTISTS
    # ========================================================================
    print("\nExporting top_artists.json...")
    
    top_artists = con.execute("""
        SELECT 
            year_month,
            artist_name,
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
            COUNT(*) AS plays
        FROM plays
        GROUP BY year_month, artist_name
        ORDER BY year_month, hours DESC
    """).fetchall()
    
    top_artists_data = [
        {
            "year_month": row[0],
            "artist_name": row[1],
            "hours": float(row[2]),
            "plays": int(row[3])
        }
        for row in top_artists
    ]
    
    with open(PUBLIC_DATA_DIR / "top_artists.json", 'w') as f:
        json.dump(top_artists_data, f, indent=2)
    
    print(f"  Exported {len(top_artists_data)} artist records")
    
    # ========================================================================
    # 6. TOP TRACKS
    # ========================================================================
    print("\nExporting top_tracks.json...")
    
    top_tracks = con.execute("""
        SELECT 
            year_month,
            track_name,
            artist_name,
            ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
            COUNT(*) AS plays
        FROM plays
        GROUP BY year_month, track_name, artist_name
        ORDER BY year_month, hours DESC
    """).fetchall()
    
    top_tracks_data = [
        {
            "year_month": row[0],
            "track_name": row[1],
            "artist_name": row[2],
            "hours": float(row[3]),
            "plays": int(row[4])
        }
        for row in top_tracks
    ]
    
    with open(PUBLIC_DATA_DIR / "top_tracks.json", 'w') as f:
        json.dump(top_tracks_data, f, indent=2)
    
    print(f"  Exported {len(top_tracks_data)} track records")
    
    # ========================================================================
    # SUMMARY
    # ========================================================================
    con.close()
    
    print("\n" + "="*60)
    print("EXPORT COMPLETE")
    print("="*60)
    print(f"JSON files written to {PUBLIC_DATA_DIR}")
    print("\nFiles created:")
    for json_file in sorted(PUBLIC_DATA_DIR.glob("*.json")):
        size_kb = json_file.stat().st_size / 1024
        print(f"  {json_file.name:20s} ({size_kb:>7.1f} KB)")
    print("="*60)

if __name__ == "__main__":
    main()


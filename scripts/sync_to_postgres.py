#!/usr/bin/env python3
"""
Sync DuckDB data to Vercel Postgres for deployment.
Run this after ingestion/enrichment before deploying.
"""

import os
import sys
import duckdb
import psycopg2
import psycopg2.extras
from io import StringIO
from pathlib import Path
from datetime import datetime

def log(msg):
    """Print with immediate flush for real-time progress."""
    print(msg, flush=True)

# Get Postgres connection string from environment
POSTGRES_URL = os.getenv('POSTGRES_URL')
if not POSTGRES_URL:
    raise ValueError(
        "POSTGRES_URL environment variable not set.\n"
        "Get it from Vercel dashboard → Storage → your database → .env.local"
    )

# Local DuckDB path
DATA_DIR = Path(__file__).parent.parent / "data"
DB_PATH = DATA_DIR / "spotify.duckdb"


def create_postgres_schema(pg_cur):
    """Create Postgres tables matching DuckDB schema."""
    log("Creating Postgres schema...")
    
    # Drop existing tables
    log("  Dropping old tables if they exist...")
    pg_cur.execute("DROP TABLE IF EXISTS audio_features CASCADE")
    pg_cur.execute("DROP TABLE IF EXISTS tracks CASCADE")
    pg_cur.execute("DROP TABLE IF EXISTS artists CASCADE")
    pg_cur.execute("DROP TABLE IF EXISTS plays CASCADE")
    log("  ✓ Old tables dropped")
    
    # Create plays table
    log("  Creating plays table...")
    pg_cur.execute("""
        CREATE TABLE plays (
            played_at TIMESTAMP NOT NULL,
            ms_played BIGINT NOT NULL,
            track_name TEXT NOT NULL,
            artist_name TEXT NOT NULL,
            album_name TEXT,
            spotify_track_uri TEXT,
            date DATE,
            year INTEGER,
            month INTEGER,
            year_month VARCHAR(7),
            dow INTEGER,
            dow_name VARCHAR(20),
            hour INTEGER
        )
    """)
    
    # Create tracks table
    pg_cur.execute("""
        CREATE TABLE tracks (
            spotify_track_uri TEXT PRIMARY KEY,
            track_name TEXT NOT NULL,
            primary_artist_name TEXT NOT NULL,
            album_name TEXT,
            release_date TEXT,
            release_year INTEGER,
            release_decade TEXT,
            popularity INTEGER,
            duration_ms INTEGER,
            explicit BOOLEAN,
            enriched_at TIMESTAMP
        )
    """)
    
    # Create artists table
    pg_cur.execute("""
        CREATE TABLE artists (
            artist_name TEXT PRIMARY KEY,
            genres TEXT,
            popularity INTEGER,
            followers INTEGER,
            spotify_artist_id TEXT,
            enriched_at TIMESTAMP
        )
    """)
    
    # Create audio_features table
    pg_cur.execute("""
        CREATE TABLE audio_features (
            spotify_track_uri TEXT PRIMARY KEY,
            danceability FLOAT,
            energy FLOAT,
            valence FLOAT,
            tempo FLOAT,
            acousticness FLOAT,
            instrumentalness FLOAT,
            speechiness FLOAT,
            loudness FLOAT,
            key INTEGER,
            mode INTEGER,
            time_signature INTEGER,
            enriched_at TIMESTAMP
        )
    """)
    
    # Create indexes
    log("  Creating indexes...")
    pg_cur.execute("CREATE INDEX idx_plays_year_month ON plays(year_month)")
    pg_cur.execute("CREATE INDEX idx_plays_date ON plays(date)")
    pg_cur.execute("CREATE INDEX idx_tracks_release_year ON tracks(release_year)")
    pg_cur.execute("CREATE INDEX idx_tracks_release_decade ON tracks(release_decade)")
    
    log("✓ Schema created successfully")


def sync_table(duck_con, pg_cur, table_name):
    """Sync a table from DuckDB to Postgres using COPY (bulk load)."""
    log(f"\n{'='*60}")
    log(f"Syncing table: {table_name}")
    log(f"{'='*60}")
    
    start_time = datetime.now()
    
    # Get row count first
    count_result = duck_con.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()
    total_rows = count_result[0] if count_result else 0
    
    if total_rows == 0:
        log(f"  No data in {table_name}, skipping")
        return
    
    log(f"  Total rows to sync: {total_rows:,}")
    
    # Get all data from DuckDB
    log(f"  Fetching data from DuckDB...")
    result = duck_con.execute(f"SELECT * FROM {table_name}").fetchall()
    log(f"  ✓ Data fetched ({len(result):,} rows)")
    
    # Get column names
    columns = [desc[0] for desc in duck_con.execute(f"SELECT * FROM {table_name} LIMIT 0").description]
    
    # Use COPY for bulk loading (much faster!)
    log(f"  Bulk loading into Postgres using COPY...")
    
    # Create a StringIO buffer with CSV data
    buffer = StringIO()
    for row in result:
        # Convert row to tab-separated values, handling NULL
        csv_row = '\t'.join([
            '\\N' if val is None else str(val).replace('\t', ' ').replace('\n', ' ').replace('\r', ' ')
            for val in row
        ])
        buffer.write(csv_row + '\n')
    
    buffer.seek(0)
    
    # Use COPY to bulk load
    pg_cur.copy_from(
        buffer,
        table_name,
        columns=columns,
        sep='\t',
        null='\\N'
    )
    
    elapsed_total = (datetime.now() - start_time).total_seconds()
    rate = total_rows / elapsed_total if elapsed_total > 0 else 0
    log(f"✓ {table_name} synced: {total_rows:,} rows in {elapsed_total:.1f}s ({rate:.0f} rows/sec)")


def main():
    log("=" * 60)
    log("Syncing DuckDB → Vercel Postgres")
    log("=" * 60)
    
    if not DB_PATH.exists():
        log(f"\nERROR: DuckDB database not found at {DB_PATH}")
        log("Please run the ingestion pipeline first:")
        log("  ./scripts/run_pipeline.sh")
        return
    
    # Connect to DuckDB
    log(f"\nConnecting to DuckDB: {DB_PATH}")
    duck_con = duckdb.connect(str(DB_PATH), read_only=True)
    log("✓ Connected to DuckDB")
    
    # Connect to Postgres
    log("\nConnecting to Postgres...")
    pg_con = psycopg2.connect(POSTGRES_URL)
    pg_con.autocommit = False
    pg_cur = pg_con.cursor()
    log("✓ Connected to Postgres")
    
    try:
        # Create schema
        log("")
        create_postgres_schema(pg_cur)
        pg_con.commit()
        log("✓ Schema committed")
        
        # Sync tables
        sync_table(duck_con, pg_cur, 'plays')
        pg_con.commit()
        log("✓ Plays committed")
        
        sync_table(duck_con, pg_cur, 'tracks')
        pg_con.commit()
        log("✓ Tracks committed")
        
        sync_table(duck_con, pg_cur, 'artists')
        pg_con.commit()
        log("✓ Artists committed")
        
        sync_table(duck_con, pg_cur, 'audio_features')
        pg_con.commit()
        log("✓ Audio features committed")
        
        # Get summary
        pg_cur.execute("SELECT COUNT(*) FROM plays")
        plays_count = pg_cur.fetchone()[0]
        
        pg_cur.execute("SELECT COUNT(*) FROM tracks")
        tracks_count = pg_cur.fetchone()[0]
        
        pg_cur.execute("SELECT COUNT(*) FROM artists")
        artists_count = pg_cur.fetchone()[0]
        
        log("\n" + "=" * 60)
        log("SYNC COMPLETE ✓")
        log("=" * 60)
        log(f"Plays:   {plays_count:,}")
        log(f"Tracks:  {tracks_count:,}")
        log(f"Artists: {artists_count:,}")
        log("=" * 60)
        log("\nYour Vercel Postgres database is now ready!")
        log("You can now deploy to Vercel.")
        
    except Exception as e:
        log(f"\nERROR: {e}")
        pg_con.rollback()
        raise
    finally:
        pg_cur.close()
        pg_con.close()
        duck_con.close()


if __name__ == "__main__":
    main()


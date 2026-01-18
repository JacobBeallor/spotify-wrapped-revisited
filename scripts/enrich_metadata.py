#!/usr/bin/env python3
"""
Enrich DuckDB with Spotify API metadata.
Populates tracks, artists, and audio_features tables.
"""

import os
import duckdb
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "data"
DB_PATH = DATA_DIR / "spotify.duckdb"


def get_spotify_client():
    """Initialize Spotify API client from environment variables."""
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        raise ValueError(
            "Missing Spotify credentials. Set SPOTIFY_CLIENT_ID and "
            "SPOTIFY_CLIENT_SECRET environment variables."
        )
    
    return spotipy.Spotify(
        auth_manager=SpotifyClientCredentials(
            client_id=client_id,
            client_secret=client_secret
        )
    )


def enrich_tracks(con, sp):
    """Fetch and store track metadata. Returns (attempted, enriched, failed) counts."""
    print("\nEnriching tracks...")
    
    # Ensure primary_artist_id column exists
    try:
        con.execute("ALTER TABLE tracks ADD COLUMN primary_artist_id VARCHAR")
        print("Added primary_artist_id column to tracks table")
    except Exception:
        # Column already exists
        pass
    
    # Get unique track URIs that need enrichment
    tracks = con.execute("""
        SELECT DISTINCT spotify_track_uri
        FROM plays
        WHERE spotify_track_uri IS NOT NULL
          AND spotify_track_uri NOT IN (SELECT spotify_track_uri FROM tracks)
        LIMIT 10000
    """).fetchall()
    
    print(f"Found {len(tracks)} tracks to enrich")
    
    attempted = len(tracks)
    enriched = 0
    failed = 0
    
    # Process in batches of 50 (Spotify API limit)
    for i in range(0, len(tracks), 50):
        batch = tracks[i:i+50]
        track_ids = [uri[0].split(':')[-1] for uri in batch]
        
        try:
            tracks_data = sp.tracks(track_ids)
            
            for track in tracks_data['tracks']:
                if not track:
                    failed += 1
                    continue
                
                uri = track['uri']
                release_date = track['album']['release_date']
                
                # Extract year
                release_year = int(release_date.split('-')[0]) if release_date else None
                
                # Calculate decade
                release_decade = None
                if release_year:
                    decade_start = (release_year // 10) * 10
                    release_decade = f"{decade_start}s"
                
                # Get primary artist ID
                primary_artist_id = track['artists'][0]['id'] if track['artists'] else None
                
                con.execute("""
                    INSERT OR REPLACE INTO tracks (
                        spotify_track_uri, track_name, primary_artist_name, primary_artist_id,
                        album_name, release_date, release_year, release_decade,
                        popularity, duration_ms, explicit, enriched_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    uri,
                    track['name'],
                    track['artists'][0]['name'] if track['artists'] else None,
                    primary_artist_id,
                    track['album']['name'],
                    release_date,
                    release_year,
                    release_decade,
                    track['popularity'],
                    track['duration_ms'],
                    track['explicit'],
                    datetime.now().isoformat()
                ])
                enriched += 1
            
            print(f"  Processed {i + len(batch)}/{len(tracks)}")
            
        except Exception as e:
            print(f"  Error processing batch {i}: {e}")
            failed += len(batch)
            continue
    
    return attempted, enriched, failed


def enrich_artists(con, sp):
    """Fetch and store artist metadata. Returns (attempted, enriched, not_found, failed) counts."""
    print("\nEnriching artists...")
    
    # Get unique artists with their Spotify artist ID from enriched tracks
    artists = con.execute("""
        SELECT DISTINCT 
            p.artist_name,
            t.primary_artist_id
        FROM plays p
        JOIN tracks t ON p.spotify_track_uri = t.spotify_track_uri
        WHERE p.artist_name NOT IN (SELECT artist_name FROM artists)
          AND t.primary_artist_id IS NOT NULL
        LIMIT 5000
    """).fetchall()
    
    print(f"Found {len(artists)} artists to enrich")
    
    attempted = len(artists)
    enriched = 0
    not_found = 0
    failed = 0
    
    for i, (artist_name, artist_id) in enumerate(artists):
        try:
            # Get full artist metadata using the stored artist ID
            # This is just 1 API call per artist!
            artist = sp.artist(artist_id)
            
            if artist:
                con.execute("""
                    INSERT OR REPLACE INTO artists (
                        artist_name, genres, popularity, followers,
                        spotify_artist_id, enriched_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, [
                    artist_name,
                    ','.join(artist['genres']) if artist.get('genres') else None,
                    artist.get('popularity', 0),
                    artist.get('followers', {}).get('total', 0),
                    artist.get('id'),
                    datetime.now().isoformat()
                ])
                enriched += 1
            else:
                not_found += 1
            
            if (i + 1) % 100 == 0:
                print(f"  Processed {i + 1}/{len(artists)}")
                
        except Exception as e:
            print(f"  Error processing artist {artist_name}: {e}")
            failed += 1
            continue
    
    return attempted, enriched, not_found, failed


def main():
    print("Connecting to database...")
    con = duckdb.connect(str(DB_PATH))
    
    print("Initializing Spotify client...")
    sp = get_spotify_client()
    
    # Run enrichment
    track_attempted, track_enriched, track_failed = enrich_tracks(con, sp)
    artist_attempted, artist_enriched, artist_not_found, artist_failed = enrich_artists(con, sp)
    
    # Get total counts from database
    total_tracks_in_db = con.execute("SELECT COUNT(*) FROM tracks").fetchone()[0]
    total_artists_in_db = con.execute("SELECT COUNT(*) FROM artists").fetchone()[0]
    
    # Get counts from plays table
    total_unique_tracks = con.execute("""
        SELECT COUNT(DISTINCT spotify_track_uri) 
        FROM plays 
        WHERE spotify_track_uri IS NOT NULL
    """).fetchone()[0]
    total_unique_artists = con.execute("SELECT COUNT(DISTINCT artist_name) FROM plays").fetchone()[0]
    
    # Calculate missing
    missing_tracks = total_unique_tracks - total_tracks_in_db
    missing_artists = total_unique_artists - total_artists_in_db
    
    # Print detailed summary
    print("\n" + "=" * 70)
    print("ENRICHMENT COMPLETE")
    print("=" * 70)
    
    print("\n📀 TRACKS")
    print("-" * 70)
    print(f"  Total unique in plays:     {total_unique_tracks:,}")
    print(f"  Already enriched:          {total_tracks_in_db - track_enriched:,}")
    print(f"  Attempted this run:        {track_attempted:,}")
    print(f"  ✅ Successfully enriched:  {track_enriched:,}")
    print(f"  ❌ Failed:                 {track_failed:,}")
    print(f"  Total enriched in DB:      {total_tracks_in_db:,}")
    print(f"  Still missing:             {missing_tracks:,}")
    
    print("\n🎤 ARTISTS")
    print("-" * 70)
    print(f"  Total unique in plays:     {total_unique_artists:,}")
    print(f"  Already enriched:          {total_artists_in_db - artist_enriched:,}")
    print(f"  Attempted this run:        {artist_attempted:,}")
    print(f"  ✅ Successfully enriched:  {artist_enriched:,}")
    print(f"  ⚠️  Not found on Spotify:  {artist_not_found:,}")
    print(f"  ❌ Failed (errors):        {artist_failed:,}")
    print(f"  Total enriched in DB:      {total_artists_in_db:,}")
    print(f"  Still missing:             {missing_artists:,}")
    
    print("\n" + "=" * 70)
    
    # Show coverage percentages
    track_coverage = (total_tracks_in_db / total_unique_tracks * 100) if total_unique_tracks > 0 else 0
    artist_coverage = (total_artists_in_db / total_unique_artists * 100) if total_unique_artists > 0 else 0
    
    print(f"📊 Coverage: Tracks {track_coverage:.1f}% | Artists {artist_coverage:.1f}%")
    print("=" * 70)
    
    # Show warnings if missing data
    if missing_tracks > 0:
        print(f"\n⚠️  {missing_tracks:,} tracks still need enrichment")
        print("   Run the script again to process more tracks (limit: 10,000 per run)")
    
    if missing_artists > 0:
        print(f"\n⚠️  {missing_artists:,} artists still need enrichment")
        if artist_not_found > 0:
            print(f"   ({artist_not_found:,} artists were not found on Spotify)")
        print("   Run the script again to process more artists (limit: 5,000 per run)")
    
    con.close()



if __name__ == "__main__":
    main()


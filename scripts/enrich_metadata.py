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
    """Fetch and store track metadata."""
    print("\nEnriching tracks...")
    
    # Get unique track URIs that need enrichment
    tracks = con.execute("""
        SELECT DISTINCT spotify_track_uri
        FROM plays
        WHERE spotify_track_uri IS NOT NULL
          AND spotify_track_uri NOT IN (SELECT spotify_track_uri FROM tracks)
        LIMIT 10000
    """).fetchall()
    
    print(f"Found {len(tracks)} tracks to enrich")
    
    # Process in batches of 50 (Spotify API limit)
    for i in range(0, len(tracks), 50):
        batch = tracks[i:i+50]
        track_ids = [uri[0].split(':')[-1] for uri in batch]
        
        try:
            tracks_data = sp.tracks(track_ids)
            
            for track in tracks_data['tracks']:
                if not track:
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
                
                con.execute("""
                    INSERT OR REPLACE INTO tracks (
                        spotify_track_uri, track_name, primary_artist_name,
                        album_name, release_date, release_year, release_decade,
                        popularity, duration_ms, explicit, enriched_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    uri,
                    track['name'],
                    track['artists'][0]['name'] if track['artists'] else None,
                    track['album']['name'],
                    release_date,
                    release_year,
                    release_decade,
                    track['popularity'],
                    track['duration_ms'],
                    track['explicit'],
                    datetime.now().isoformat()
                ])
            
            print(f"  Processed {i + len(batch)}/{len(tracks)}")
            
        except Exception as e:
            print(f"  Error processing batch {i}: {e}")
            continue


def enrich_artists(con, sp):
    """Fetch and store artist metadata."""
    print("\nEnriching artists...")
    
    # Get unique artist names that need enrichment
    artists = con.execute("""
        SELECT DISTINCT artist_name
        FROM plays
        WHERE artist_name NOT IN (SELECT artist_name FROM artists)
        LIMIT 5000
    """).fetchall()
    
    print(f"Found {len(artists)} artists to enrich")
    
    for i, (artist_name,) in enumerate(artists):
        try:
            # Search for artist
            results = sp.search(q=f"artist:{artist_name}", type='artist', limit=1)
            
            if not results['artists']['items']:
                continue
            
            artist = results['artists']['items'][0]
            
            con.execute("""
                INSERT OR REPLACE INTO artists (
                    artist_name, genres, popularity, followers,
                    spotify_artist_id, enriched_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, [
                artist_name,
                ','.join(artist['genres']) if artist['genres'] else None,
                artist['popularity'],
                artist['followers']['total'],
                artist['id'],
                datetime.now().isoformat()
            ])
            
            if (i + 1) % 100 == 0:
                print(f"  Processed {i + 1}/{len(artists)}")
                
        except Exception as e:
            print(f"  Error processing artist {artist_name}: {e}")
            continue


def main():
    print("Connecting to database...")
    con = duckdb.connect(str(DB_PATH))
    
    print("Initializing Spotify client...")
    sp = get_spotify_client()
    
    enrich_tracks(con, sp)
    enrich_artists(con, sp)
    
    # Summary
    track_count = con.execute("SELECT COUNT(*) FROM tracks").fetchone()[0]
    artist_count = con.execute("SELECT COUNT(*) FROM artists").fetchone()[0]
    
    print("\n" + "=" * 60)
    print("ENRICHMENT COMPLETE")
    print("=" * 60)
    print(f"Tracks enriched:  {track_count:,}")
    print(f"Artists enriched: {artist_count:,}")
    print("=" * 60)
    
    con.close()


if __name__ == "__main__":
    main()


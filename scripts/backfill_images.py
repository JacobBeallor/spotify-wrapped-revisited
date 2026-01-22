#!/usr/bin/env python3
"""
Backfill image URLs for existing enriched records.
This script updates tracks and artists that were enriched before image URL support was added.
"""

import os
import duckdb
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from pathlib import Path

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


def backfill_track_images(con, sp):
    """Fetch and update album image URLs for existing tracks."""
    print("\nBackfilling track album images...")
    
    # Get tracks that are missing image URLs
    tracks = con.execute("""
        SELECT spotify_track_uri
        FROM tracks
        WHERE album_image_url IS NULL
        LIMIT 10000
    """).fetchall()
    
    print(f"Found {len(tracks)} tracks without images")
    
    if len(tracks) == 0:
        return 0, 0, 0
    
    updated = 0
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
                
                # Get album image URL
                album_images = track['album'].get('images', [])
                album_image_url = None
                if album_images:
                    # Get medium (300x300) or first available
                    medium_image = next((img for img in album_images if img.get('height') == 300), None)
                    album_image_url = medium_image['url'] if medium_image else album_images[0]['url']
                
                # Update only the image URL
                con.execute("""
                    UPDATE tracks 
                    SET album_image_url = ?
                    WHERE spotify_track_uri = ?
                """, [album_image_url, track['uri']])
                
                updated += 1
            
            if (i + len(batch)) % 500 == 0 or (i + len(batch)) == len(tracks):
                print(f"  Processed {i + len(batch)}/{len(tracks)}")
            
        except Exception as e:
            print(f"  Error processing batch {i}: {e}")
            failed += len(batch)
            continue
    
    return len(tracks), updated, failed


def backfill_artist_images(con, sp):
    """Fetch and update artist image URLs for existing artists."""
    print("\nBackfilling artist images...")
    
    # Get artists that are missing image URLs
    artists = con.execute("""
        SELECT artist_name, spotify_artist_id
        FROM artists
        WHERE image_url IS NULL
          AND spotify_artist_id IS NOT NULL
        LIMIT 5000
    """).fetchall()
    
    print(f"Found {len(artists)} artists without images")
    
    if len(artists) == 0:
        return 0, 0, 0
    
    updated = 0
    failed = 0
    
    for i, (artist_name, artist_id) in enumerate(artists):
        try:
            artist = sp.artist(artist_id)
            
            # Get artist image URL
            artist_images = artist.get('images', [])
            image_url = None
            if artist_images:
                # Get medium (300x300) or first available
                medium_image = next((img for img in artist_images if img.get('height') == 300), None)
                image_url = medium_image['url'] if medium_image else artist_images[0]['url']
            
            # Update only the image URL
            con.execute("""
                UPDATE artists 
                SET image_url = ?
                WHERE artist_name = ?
            """, [image_url, artist_name])
            
            updated += 1
            
            if (i + 1) % 100 == 0 or (i + 1) == len(artists):
                print(f"  Processed {i + 1}/{len(artists)}")
                
        except Exception as e:
            print(f"  Error processing artist {artist_name}: {e}")
            failed += 1
            continue
    
    return len(artists), updated, failed


def main():
    print("=" * 70)
    print("BACKFILL IMAGE URLS")
    print("=" * 70)
    
    print("\nConnecting to database...")
    con = duckdb.connect(str(DB_PATH))
    
    print("Initializing Spotify client...")
    sp = get_spotify_client()
    
    # Run backfill
    track_total, track_updated, track_failed = backfill_track_images(con, sp)
    artist_total, artist_updated, artist_failed = backfill_artist_images(con, sp)
    
    # Print summary
    print("\n" + "=" * 70)
    print("BACKFILL COMPLETE")
    print("=" * 70)
    
    print("\n📀 TRACKS")
    print(f"  Total processed:      {track_total:,}")
    print(f"  ✅ Updated:           {track_updated:,}")
    print(f"  ❌ Failed:            {track_failed:,}")
    
    print("\n🎤 ARTISTS")
    print(f"  Total processed:      {artist_total:,}")
    print(f"  ✅ Updated:           {artist_updated:,}")
    print(f"  ❌ Failed:            {artist_failed:,}")
    
    print("\n" + "=" * 70)
    
    # Verification
    total_tracks_with_images = con.execute("""
        SELECT COUNT(*) FROM tracks WHERE album_image_url IS NOT NULL
    """).fetchone()[0]
    
    total_artists_with_images = con.execute("""
        SELECT COUNT(*) FROM artists WHERE image_url IS NOT NULL
    """).fetchone()[0]
    
    print(f"\n📊 Current Database State:")
    print(f"  Tracks with images:   {total_tracks_with_images:,}")
    print(f"  Artists with images:  {total_artists_with_images:,}")
    
    print("\n" + "=" * 70)
    
    con.close()


if __name__ == "__main__":
    main()


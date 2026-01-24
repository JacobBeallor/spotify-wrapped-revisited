# Spotify Embeds Architecture

Interactive Spotify player integration using the Spotify iFrame API.

## Overview

The application uses [Spotify's iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api) to embed an interactive music player that dynamically updates when users click on tracks or artists.

**Key Benefits:**
- **Dynamic content switching** - Single `loadUri()` call updates player without DOM manipulation
- **Smooth transitions** - No page reloads or API calls when switching content
- **Better performance** - Player loads once, reuses same iframe instance
- **Interactive experience** - Click tracks/artists to instantly preview them

## Architecture

### Components

```
OverviewPage
├── TopTracks (clickable)
│   └── onTrackClick(uri) → embedController.loadUri(uri)
├── TopArtists (clickable)
│   └── onArtistClick(id, name, topTrackUri) → embedController.loadUri(topTrackUri)
└── SpotifyEmbed
    ├── Initializes controller
    └── Exposes controller ref to parent
```

### Data Flow

1. **Initial Load**
   - `OverviewPage` fetches top tracks/artists (with Spotify IDs and top track URIs)
   - `SpotifyEmbed` component initializes with first available track URI
   - Controller ref is stored in parent via `onControllerReady` callback

2. **User Clicks Track**
   - Click handler receives track URI
   - Calls `embedController.loadUri(trackUri)`
   - Player updates instantly to that specific track

3. **User Clicks Artist**
   - API response includes artist's #1 track from listening history (`top_track_uri`)
   - Click handler receives artist's top track URI
   - Calls `embedController.loadUri(topTrackUri)`
   - Player updates instantly to that track (guaranteed auto-play)
   - Falls back to artist page URI if no track available

4. **Graceful Degradation**
   - If no Spotify IDs available (data not enriched), items aren't clickable
   - Hover styles only apply to clickable items
   - Player shows default track or helpful message

## Implementation

### 1. Loading the iFrame API

**File:** `app/layout.tsx`

```typescript
import Script from 'next/script'

<Script 
  src="https://open.spotify.com/embed/iframe-api/v1" 
  strategy="lazyOnload"
/>
```

The API initializes via the global `window.onSpotifyIframeApiReady` callback.

**Important:** The callback only fires once when the script loads. To support component remounting (e.g., when navigating between tabs), the API reference is stored in `window.SpotifyIframeApi` for reuse.

### 2. SpotifyEmbed Component

**File:** `components/SpotifyEmbed.tsx`

**Props:**
- `initialUri?: string` - Spotify URI to load on mount (track or artist)
- `onControllerReady?: (controller) => void` - Callback when controller is initialized

**Key Features:**
- Client component (`'use client'`)
- Uses `useRef` to store controller instance
- Initializes once, prevents duplicate controllers
- Exposes controller to parent for dynamic updates
- Cleanup on unmount via `controller.destroy()`

**Example Usage:**

```typescript
const embedControllerRef = useRef<any>(null)

<SpotifyEmbed 
  initialUri="spotify:track:6rqhFgbbKwnb9MLmUQDhG6"
  onControllerReady={(controller) => {
    embedControllerRef.current = controller
  }}
/>
```

### 3. Dynamic Content Loading

**File:** `components/pages/OverviewPage.tsx`

```typescript
const handleTrackClick = (trackUri: string, trackName: string) => {
  embedControllerRef.current?.loadUri(trackUri)
}

const handleArtistClick = (artistId: string, artistName: string, topTrackUri?: string) => {
  // Use the artist's #1 track from their listening history if available
  // Otherwise fall back to the artist page
  const uri = topTrackUri || `spotify:artist:${artistId}`
  embedControllerRef.current?.loadUri(uri)
  
  // Auto-play after loading
  setTimeout(() => {
    embedControllerRef.current?.play()
  }, 100)
}
```

**Why this approach?**
- Track URIs reliably auto-play, artist page URIs do not
- Each artist's API response includes their #1 most-played track within the filtered date range
- Provides consistent auto-play behavior for all artists
- Falls back to artist page only if no track data available

## URI Format

Spotify uses URIs to identify content:

### Track URI
```
spotify:track:{trackId}
```

**Example:** `spotify:track:6rqhFgbbKwnb9MLmUQDhG6`

- Stored in database as `spotify_track_uri` field
- Already in correct format from enrichment pipeline
- Used directly in `loadUri()` calls

### Artist URI
```
spotify:artist:{artistId}
```

**Example:** `spotify:artist:0OdUWJ0sBjDrqHygGUXeCF`

- Database stores `spotify_artist_id` (just the ID)
- Must construct URI: `spotify:artist:${artistId}`
- Used in artist click handlers

## API Integration

### Data Enrichment

Spotify IDs are populated via the enrichment pipeline:

1. **Tracks Table** - `spotify_track_uri` field
   - Enriched via `scripts/enrich_metadata.py`
   - Joins `plays` with `tracks` on URI match

2. **Artists Table** - `spotify_artist_id` field
   - Enriched via `scripts/enrich_metadata.py`
   - Joins `plays` with `artists` on name match

### API Endpoints

**`/api/top-tracks`** - Returns `spotify_track_uri` field
```json
{
  "track_name": "Song Title",
  "artist_name": "Artist Name",
  "hours": 12.5,
  "plays": 87,
  "spotify_track_uri": "spotify:track:abc123"
}
```

**`/api/top-artists`** - Returns `spotify_artist_id` and artist's top track
```json
{
  "artist_name": "Artist Name",
  "hours": 124.26,
  "plays": 1747,
  "spotify_artist_id": "xyz789",
  "top_track_name": "Their Best Song",
  "top_track_uri": "spotify:track:abc123"
}
```

The `top_track_uri` field contains the artist's #1 most-played track within the filtered date range, enabling consistent auto-play when clicking artists.

See [API Routes Documentation](./api-routes.md) for full details.

## User Experience

### Clickable Items

**Visual Feedback:**
- Cursor changes to pointer on hover (only if Spotify ID exists)
- Opacity decreases to 80% on hover
- Progress bar brightens 110% on hover
- Smooth transitions via CSS

**Implementation:**
```typescript
const isClickable = !!track.spotify_track_uri && !!onTrackClick

<div 
  className={`group ${isClickable ? 'cursor-pointer' : ''}`}
  onClick={() => onTrackClick?.(track.spotify_track_uri)}
>
  {/* Content with hover:opacity-80 and hover:brightness-110 */}
</div>
```

### Player Behavior

- **Initial State:** Loads paused with top track
- **User Clicks:** Instantly updates to new track/artist
- **Playback Control:** Users can play/pause/seek in player
- **Smooth Transitions:** No loading spinners or page reloads

## Graceful Degradation

### Non-Enriched Data

If Spotify API enrichment hasn't been run:
- `spotify_track_uri` and `spotify_artist_id` fields will be `null`
- Items won't be clickable (no cursor change, no hover effects)
- Tracks/artists still display normally with stats
- Player shows default track or helpful message

**Check before running:**
```bash
./scripts/run_enrichment.sh
```

See [Enrichment Guide](../guides/enrichment.md) for details.

## Controller API Reference

The Spotify iFrame API controller provides these methods:

### `createController(element, options, callback)`

Initialize a new embed controller.

```typescript
IFrameAPI.createController(
  containerElement,
  { uri: 'spotify:track:abc123', height: 352 },
  (controller) => { /* controller ready */ }
)
```

### `loadUri(spotifyUri)`

Load new content into the player.

```typescript
controller.loadUri('spotify:track:6rqhFgbbKwnb9MLmUQDhG6')
controller.loadUri('spotify:artist:0OdUWJ0sBjDrqHygGUXeCF')
```

### `play()`, `pause()`, `togglePlay()`

Control playback programmatically (if needed).

### `destroy()`

Clean up controller when component unmounts.

**Full API Reference:** [Spotify iFrame API Documentation](https://developer.spotify.com/documentation/embeds/references/iframe-api)

## Layout

### Desktop (lg+)

```
┌─────────────────┬─────────────────┐
│   Top Tracks    │   Top Artists   │
│                 │                 │
│   (clickable)   │   (clickable)   │
│                 ├─────────────────┤
│                 │ Spotify Player  │
│                 │                 │
└─────────────────┴─────────────────┘
```

### Mobile

```
┌─────────────────┐
│   Top Tracks    │
│   (clickable)   │
├─────────────────┤
│   Top Artists   │
│   (clickable)   │
├─────────────────┤
│ Spotify Player  │
└─────────────────┘
```

The right column uses flexbox to stack Top Artists and Spotify Embed vertically:

```typescript
<div className="flex flex-col gap-6">
  <TopArtists />
  <SpotifyEmbed />
</div>
```

## Testing

### Manual Testing Checklist

- [ ] Player loads on page load with top track
- [ ] Clicking a track updates player instantly
- [ ] Clicking an artist updates player to artist page
- [ ] Navigate to another tab and back - player reinitializes successfully
- [ ] Hover effects show only on enriched items
- [ ] Non-enriched items display but aren't clickable
- [ ] Player controls (play/pause) work correctly
- [ ] Layout responsive on mobile/tablet/desktop
- [ ] No console errors related to Spotify API

### Enrichment Status

Check if data is enriched:

```sql
-- Check tracks enrichment
SELECT COUNT(*) as total, 
       COUNT(spotify_track_uri) as enriched,
       COUNT(spotify_track_uri) * 100.0 / COUNT(*) as pct
FROM tracks;

-- Check artists enrichment
SELECT COUNT(*) as total,
       COUNT(spotify_artist_id) as enriched, 
       COUNT(spotify_artist_id) * 100.0 / COUNT(*) as pct
FROM artists;
```

## Troubleshooting

### Player Stuck on "Loading..." After Tab Navigation

**Issue:** Player shows "Loading Spotify player..." perpetually after navigating back to Overview tab

**Root Cause:** The Spotify iFrame API's `window.onSpotifyIframeApiReady` callback only fires once when the script initially loads. When the `SpotifyEmbed` component remounts after tab navigation, the callback doesn't fire again.

**Solution (Implemented):**
- The component stores the API in `window.SpotifyIframeApi` when the callback first fires
- On subsequent mounts, the component checks for this global reference
- If found, initialization proceeds immediately without waiting for callback
- Enables seamless player reinitialization across component mount/unmount cycles

**Debug Steps:**
1. Open browser console
2. Check for initialization logs: `[SpotifyEmbed] Scheduling initialization check`
3. Verify API is found: `[SpotifyEmbed] Spotify API found in global, initializing controller`
4. Confirm success: `[SpotifyEmbed] Controller created successfully`

### Player Not Loading

**Issue:** Embed div is empty, no player appears

**Solutions:**
1. Check browser console for errors
2. Verify Spotify script loaded: `window.SpotifyIframeApi`
3. Check initial URI is valid Spotify URI format
4. Ensure container div has proper ref

### Clicks Not Working

**Issue:** Clicking tracks/artists doesn't update player

**Solutions:**
1. Verify controller ref is set: `embedControllerRef.current`
2. Check Spotify IDs exist in API response
3. Ensure click handlers are called (add console.log)
4. Verify URI format for artists includes `spotify:artist:` prefix

### Data Not Enriched

**Issue:** All items show as non-clickable

**Solutions:**
1. Run enrichment pipeline: `./scripts/run_enrichment.sh`
2. Verify `.env` has `SPOTIPY_CLIENT_ID` and `SPOTIPY_CLIENT_SECRET`
3. Check database for enriched data (see SQL queries above)
4. See [Enrichment Guide](../guides/enrichment.md)

## Performance

### Initial Load
- Script loads lazily (`strategy="lazyOnload"`)
- Controller initializes once per page view
- ~200-500ms to initialize player

### Dynamic Updates
- `loadUri()` call: ~100-300ms
- No network requests (handled by Spotify iframe)
- Smooth transitions without DOM manipulation

### Memory
- Single iframe instance (low memory footprint)
- Controller cleanup on unmount prevents leaks

## Future Enhancements

Possible improvements:

- **Playback Events:** Listen to `playback_update` events to show currently playing indicator
- **Auto-play:** Start playing on click (requires user interaction per browser policies)
- **Playlist Support:** Load playlist URIs for full top tracks list
- **Album Embeds:** Support album URIs in addition to tracks/artists
- **Persistent State:** Remember last played track across sessions

## See Also

- [API Routes Documentation](./api-routes.md) - API endpoint details
- [Enrichment Guide](../guides/enrichment.md) - How to enrich Spotify data
- [Spotify iFrame API Docs](https://developer.spotify.com/documentation/embeds/references/iframe-api) - Official API reference
- [Spotify URI Format](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) - Understanding URIs


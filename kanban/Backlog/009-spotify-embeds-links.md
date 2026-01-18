# Add Spotify embedded players and clickable links

---
**id:** 009  
**priority:** P3  
**size:** M  
**epic:** Discovery & Exploration Features  
**created:** 2026-01-18  
**tags:** enhancement

---

## Title

Make tracks and artists clickable with Spotify links or embedded players

## Dependencies

**blocked_by:** []  
**blocks:** []  
**parallel_with:** []

## Context

Currently, top tracks and artists are just text. Making them clickable adds a lot of value:
- Users can listen to tracks directly
- Easy discovery of artist pages
- More engaging and interactive dashboard

Spotify URIs are already in the database, so this is mostly a frontend enhancement.

## Acceptance Criteria

Basic functionality:
- [ ] Make track names clickable → open Spotify web player
- [ ] Make artist names clickable → open Spotify artist page
- [ ] Links open in new tab
- [ ] Add Spotify icon indicator next to clickable items

Optional enhancements:
- [ ] Embed Spotify iframe player (play preview inline)
- [ ] Show album art on hover
- [ ] Add "Listen on Spotify" button

Technical:
- [ ] Convert Spotify URIs to web URLs
- [ ] Handle missing URIs gracefully (some older data might not have them)
- [ ] Work on both top tracks and top artists lists

## Implementation Notes

**URI to URL conversion:**
- Track: `spotify:track:6rqhFgbbKwnb9MLmUQDhG6` → `https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6`
- Artist: `spotify:artist:3WrFJ7ztbogyGnTHbHJFl2` → `https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2`

**Key files:**
- `components/TopTracks.tsx` — Add links to track names
- `components/TopArtists.tsx` — Add links to artist names
- May need utility function for URI → URL conversion

**Spotify Embed API:**
- https://developer.spotify.com/documentation/embeds
- `<iframe src="https://open.spotify.com/embed/track/{id}" width="300" height="80"></iframe>`

**Considerations:**
- Spotify URIs exist in database (spotify_track_uri field)
- Artist URIs would need to be in enriched data (spotify_artist_id)
- Embedded players add page weight (~100KB per embed)
- Privacy: Embeds load Spotify scripts
- Consider making embeds optional/on-demand

## Test Plan

- [ ] Verify track links open correct Spotify pages
- [ ] Verify artist links open correct pages
- [ ] Test with tracks that have URIs
- [ ] Test graceful handling of missing URIs
- [ ] Test embedded players (if implemented)
- [ ] Test on mobile (links should work)
- [ ] Test that links open in new tab

## Status History

- 2026-01-18: Created → Backlog


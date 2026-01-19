# Spotify Wrapped 2.0 — Issues & Roadmap

## 📋 Issue Labels

**Priority**
- `P0` - Critical/Blocker
- `P1` - High
- `P2` - Medium
- `P3` - Low

**Size**
- `XS` - < 2hrs
- `S` - 2-4hrs
- `M` - 4-8hrs
- `L` - 1-3 days
- `XL` - 3-5 days

**Type**
- `bug` - Broken functionality
- `feature` - New functionality
- `enhancement` - Improve existing feature
- `docs` - Documentation

---

## Issues

### #1 Data freshness indicator ✅
Priority: `P1`  
Size: `XS`  
Type: `enhancement`  
Show when user data was last updated.

### #2 Date range filter UI ✅
Priority: `P1`  
Size: `M`  
Type: `enhancement`  
Improve date filter UI with presets and range picker.

### #3 Section navigation
Priority: `P2`  
Size: `S`  
Type: `enhancement`  
Add quick links and navigation between dashboard sections.

### #4 Fix artist evolution bump chart
Priority: `P2`  
Size: `S`  
Type: `bug`, `enhancement`  
Restore styling and clarify artist evolution chart.

### #5 Spotify API enrichment pipeline ✅
Priority: `P1`  
Size: `L`  
Type: `feature`  
Enrich track/artist data from Spotify API for deeper analysis.

### #6 Genre analysis & visualization
Priority: `P1`  
Size: `M`  
Type: `feature`  
Display top genres (pie or bar chart) by listening time.

### #7 Release year/decade analysis
Priority: `P1`  
Size: `M`  
Type: `feature`  
Show listening trends by release year/decade.

### #8 Discovery trends tracking
Priority: `P2`  
Size: `L`  
Type: `feature`  
Track first listens and show discovery rate over time.

### #9 Spotify embeds & links
Priority: `P3`  
Size: `M`  
Type: `enhancement`  
Make top tracks/artists clickable with Spotify links and embeds.

---

## Sprints (suggested order)

1. Core UX: #1, #2, #3
2. Enrichment & Genres: #5, #6
3. Release Years & Discovery: #7, #8
4. Polish & Extras: #4, #9

---

## Quick Wins

1. ~~#1 Data freshness indicator~~ ✅
2. #3 Section navigation
3. #4 Fix bump chart

---

## Impact vs Effort

- High Impact, Low Effort: #1 ✅, #3, #6
- High Impact, High Effort: #2 ✅, #5 ✅, #8
- Low Priority: #9

---

## Next Steps

- Issues tracked in this file
- Enrichment pipeline tested
- Next: Implement #6 (genres), #7 (release years), #3 (navigation), #8 (discovery)
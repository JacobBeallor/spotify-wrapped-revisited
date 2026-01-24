# Decade Streamgraph Visualization

## Overview

The decade streamgraph shows how your listening preferences across music from different release decades have evolved over time. This flowing, organic visualization makes it easy to see shifts in taste - whether you're discovering older music, staying current, or moving between different eras.

**Location:** Taste Evolution tab (below Artist/Genre Evolution racing bar chart)

## Visual Description

### What is a Streamgraph?

A streamgraph is a type of stacked area chart with:
- **Flowing layers** representing each decade (1950s, 1960s, 1970s, etc.)
- **Smooth curves** showing how listening changes month-to-month
- **Centered baseline** using D3's "wiggle" offset for aesthetic symmetry
- **Thickness** of each layer shows the volume of listening from that decade

### How to Read It

- **X-axis:** Time progression (monthly from 2018-01 onwards)
- **Layer height:** Listening volume (hours or plays) for that decade
- **Layer position:** Larger volumes are placed toward the center for visual balance
- **Colors:** Each decade has a distinct color (see Color Coding below)

### Interactions

1. **Hover over layers:** 
   - Layer highlights and becomes fully opaque
   - Tooltip shows decade name, exact value, and month
   - Other layers fade slightly for focus

2. **Hover over legend items:**
   - Corresponding layer highlights in the chart
   - Other layers fade to 20% opacity
   - Helps trace a single decade across the entire timeline

3. **Metric toggle:**
   - Switch between Hours and Plays using the global metric filter
   - Chart smoothly transitions to new values

## Color Coding

Each decade is assigned a distinct color for easy identification:

| Decade | Color | Hex |
|--------|-------|-----|
| 1950s | Orange | `#FF6B35` |
| 1960s | Yellow-Orange | `#F7931E` |
| 1970s | Teal | `#4ECDC4` |
| 1980s | Blue | `#5D69B1` |
| 1990s | Green | `#52BCA3` |
| 2000s | Spotify Green | `#1DB954` |
| 2010s | Light Green | `#99C24D` |
| 2020s | Yellow | `#E8C547` |

**Color Strategy:**
- Warmer colors (oranges, yellows) for older music (1950s-1960s)
- Cool colors (blues, teals) for 1970s-1980s
- Greens for 1990s-2000s
- Brighter accents for recent decades (2010s-2020s)

## Data Requirements

### Enrichment Dependency

This visualization **requires enriched track metadata** from the Spotify API:

1. **Field needed:** `release_decade` in the `tracks` table
2. **Source:** Track metadata from Spotify Web API
3. **Enrichment script:** `scripts/enrich_metadata.py`

**If tracks are not enriched:**
- Streamgraph will be empty
- Message displays: "No data available. Run enrichment script to populate release decade metadata."

### Data Range

- **Time range:** All available data (no start date filter)
- **Granularity:** Monthly aggregation
- **Coverage:** All tracks with non-null `release_decade` values
- **Decade filter:** Excludes pre-1950s music (release_year >= 1950)

## Technical Implementation

### Architecture

```
/api/decade-evolution → DecadeStreamgraph component → D3.js rendering
```

### D3.js Stack Layout

The streamgraph uses D3's stack layout with specific configuration:

```typescript
const stack = d3.stack<DataPoint, string>()
  .keys(decades)  // e.g., ["1960s", "1970s", "1980s", ...]
  .offset(d3.stackOffsetWiggle)  // Creates flowing, centered effect
  .order(d3.stackOrderInsideOut)  // Places larger layers in center
```

**Key D3 methods:**
- `d3.stack()`: Transforms data into stackable layers
- `d3.stackOffsetWiggle`: Centers the baseline for aesthetic flow
- `d3.stackOrderInsideOut`: Arranges layers with largest in center
- `d3.area()`: Creates the smooth curved shapes
- `d3.curveBasis`: Bezier curve interpolation for smoothness

### Data Transformation

**API response format:**
```json
[
  {"year_month": "2018-01", "decade": "1970s", "hours": 12.5, "plays": 234},
  {"year_month": "2018-01", "decade": "2010s", "hours": 45.2, "plays": 891},
  ...
]
```

**Transformed for D3 stack:**
```javascript
[
  {"month": "2018-01", "1970s": 12.5, "2010s": 45.2, ...},
  {"month": "2018-02", "1970s": 14.2, "2010s": 42.1, ...},
  ...
]
```

The component handles this transformation automatically in the `useMemo` hook.

### Performance

- **Data points:** ~80 months × 7 decades = ~560 data points
- **Rendering:** Lightweight for D3.js, renders in <50ms
- **Re-renders:** Only when `data` or `metric` props change
- **Memory:** Minimal (~50KB for typical dataset)

## Use Cases & Insights

### What You Can Discover

1. **Era preferences:**
   - Do you prefer music from a specific decade?
   - Are your tastes shifting toward newer or older music?

2. **Discovery patterns:**
   - When did you discover music from a new era?
   - Do you explore different decades at different times?

3. **Nostalgic phases:**
   - Periods where older music dominates
   - Returning to favorite decades after exploring others

4. **Currency tracking:**
   - How much of your listening is current music (2020s)?
   - Are you keeping up with new releases?

5. **Diversity measurement:**
   - Do you listen across many decades or focus on a few?
   - How balanced is your decade distribution?

### Example Insights

- "I discovered 1970s soul in early 2023 and it grew to 30% of my listening"
- "My 2010s listening decreased as I explored older music"
- "I consistently listen to 2000s indie across all months"
- "Winter months show more 1960s folk music"

## Integration with Other Visualizations

### Complementary Views

**Artist Evolution (racing bar chart):**
- Shows *who* you're listening to over time
- Decade streamgraph shows *when* that music was released

**Genre Evolution (racing bar chart):**
- Shows *what style* of music you prefer
- Decade streamgraph shows *what era* you prefer

**Together they reveal:**
- "I listen to lots of Rock (genre) mostly from the 1970s (decade)"
- "My Hip Hop phase (genre) focused on 2010s releases (decade)"
- "I discovered The Beatles (artist) which increased my 1960s listening (decade)"

### Shared Controls

The streamgraph shares the **Metric Filter** with racing bar charts:
- Toggle applies to all charts simultaneously
- Consistent metric choice across Taste Evolution tab
- Switch between Hours and Plays to see different perspectives

## Styling

### Visual Design

- **Background:** Gradient from gray-800 to gray-900
- **Border:** 1px solid gray-700
- **Padding:** 24px (p-6)
- **Border radius:** 12px (rounded-xl)
- **Height:** 520px total (400px chart + 120px legend/axes)

### Typography

- **Title:** 20px bold white text
- **Subtitle:** 14px gray-400 text
- **Axis labels:** 11px gray-400 text
- **Tooltip:** 14px white text on dark background

### Animations

- **Layer hover:** Opacity 0.85 → 1.0
- **Layer fade:** Opacity 0.85 → 0.2 (on legend hover)
- **Tooltip:** Follows cursor with 10px offset
- **Border glow:** 2px white stroke on hover

## Accessibility

### Current Features

- Distinct colors with sufficient contrast
- Large click/hover targets (layers)
- Tooltip provides exact values
- Legend as fallback for colorblind users

### Future Enhancements

- ARIA labels for each layer
- Keyboard navigation (Tab to select layers, Arrow keys to navigate)
- Screen reader announcements for tooltip values
- High contrast mode support

## Responsive Design

### Desktop (> 768px)
- Full width chart
- Horizontal legend (2 rows if needed)
- All axis labels visible

### Mobile (< 768px)
- Reduced height (300px chart area)
- Vertical legend or accordion
- X-axis shows fewer tick marks (every 12 months)
- Smaller font sizes

**Current implementation:** Optimized for desktop. Mobile improvements pending.

## API Endpoint

**Endpoint:** `GET /api/decade-evolution`

**Response:** See [API Routes documentation](./api-routes.md#get-apidecade-evolution)

## Files

**Component:** [`components/DecadeStreamgraph.tsx`](../../components/DecadeStreamgraph.tsx)

**API Route:** [`app/api/decade-evolution/route.ts`](../../app/api/decade-evolution/route.ts)

**Type Definition:** [`types.ts`](../../types.ts) - `DecadeEvolution` interface

**Integration:** [`components/pages/TasteEvolutionPage.tsx`](../../components/pages/TasteEvolutionPage.tsx)

## Troubleshooting

### Streamgraph is Empty

**Symptom:** Chart shows "No data available" message

**Causes:**
1. Tracks not enriched with Spotify metadata
2. `release_decade` field is NULL for all tracks
3. No listening data from 2018-01 onwards

**Solution:**
```bash
# Run enrichment script
cd /path/to/spotify-wrapped-revisited
source venv/bin/activate
export SPOTIFY_CLIENT_ID=your_client_id
export SPOTIFY_CLIENT_SECRET=your_client_secret
python scripts/enrich_metadata.py

# Sync to production (if using Vercel Postgres)
python scripts/sync_to_postgres.py
```

### Layers Overlapping Incorrectly

**Symptom:** Layers don't stack properly or overlap strangely

**Cause:** Data transformation issue - missing months or decades

**Solution:** Check API response format and ensure all months have values for all decades (use 0 for missing data)

### Colors Hard to Distinguish

**Symptom:** Similar colors for adjacent decades

**Solution:** Adjust color scale in `DecadeStreamgraph.tsx`:
```typescript
const colorScale = d3.scaleOrdinal<string>()
  .domain(decades)
  .range([/* your custom colors */])
```

### Tooltip Not Appearing

**Symptom:** Hover works but no tooltip shows

**Cause:** Tooltip ref not properly initialized

**Solution:** Ensure tooltip div is rendered and styled with `position: fixed`

## Related Documentation

- [API Routes](./api-routes.md) - API endpoint details
- [Database Schema](./database.md) - Data structure
- [Enrichment Guide](../guides/enrichment.md) - How to enrich tracks
- [Taste Evolution Page](../../components/pages/TasteEvolutionPage.tsx) - Integration

## Future Enhancements

1. **Zoom & Pan:** Allow users to zoom into specific time ranges
2. **Decade Filtering:** Click legend to show/hide specific decades
3. **Comparison Mode:** Show two time periods side-by-side
4. **Export:** Download as PNG or SVG
5. **Annotations:** Mark significant discovery events
6. **Decade Details:** Click layer to see top tracks from that decade

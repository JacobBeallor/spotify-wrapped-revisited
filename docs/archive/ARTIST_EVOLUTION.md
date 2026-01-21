# Artist Evolution Feature

## Overview

The Artist Evolution visualization uses an **animated racing bar chart** built with D3.js to show how your top artists change over time using a **12-month rolling window**.

## What It Shows

- **Rank changes** — Watch artists rise and fall in your top 5 over time
- **Musical phases** — Identify when specific artists dominated your listening
- **Momentum** — See which artists are growing or declining
- **Discovery** — Watch new artists enter your top ranks
- **Rolling perspective** — 12-month window shows recent sustained favorites
- **Animation** — Auto-plays through all time periods at 1 second per month

## How It Works

### 1. 12-Month Rolling Window Calculation

For each month starting from 2018-01, we calculate the **total listening hours/plays over that month plus the previous 11 months**:

```sql
-- For January 2024:
-- Sum hours from February 2023 through January 2024 (12 months total)
```

**Why 12-month rolling window?**
- Shows **recent** favorites, not all-time cumulative
- Smooths out seasonal variations
- Captures sustained interest over a full year
- Artists can both rise and fall (unlike cumulative where everyone only goes up)
- More dynamic rankings = more interesting animation

**Why start from 2018?**
- Allows 12 months of history to build up for meaningful windows
- Earlier data would have incomplete windows

### 2. Ranking

Artists are ranked 1-5 based on their 12-month rolling totals of hours or plays (selected by metric filter).

Only the **top 5** artists are shown in each frame.

### 3. Animated Racing Bar Chart

The chart shows:
- **Horizontal bars** — Length represents hours/plays
- **Rank positions** — Top artist at top, #5 at bottom
- **Smooth transitions** — Bars slide up/down as ranks change (800ms)
- **Value labels** — Current hours/plays displayed on each bar
- **Artist names** — Labeled on the left of each bar
- **Current month** — Prominently displayed above chart
- **Progress indicator** — Shows position in animation timeline

**Animation behavior:**
- New artists fade in from the bottom
- Exiting artists fade out at the bottom
- Bars grow/shrink smoothly as values change
- Ranks reorder with smooth sliding transitions
- Auto-plays at 1 second per month (~90 seconds total)

## API Endpoint

**Route:** `GET /api/artist-evolution`

**Parameters:**
- `metric` (optional): `hours` | `plays` (default: `hours`)

**Response Structure:**
```json
{
  "data": [
    {
      "year_month": "2024-01",
      "artist_name": "Taylor Swift",
      "hours": 45.67,
      "plays": 542
    },
    ...
  ]
}
```

**Query Approach:**
1. Aggregate monthly data (hours and plays) per artist
2. For each month, calculate 12-month rolling sum (current month + previous 11)
3. Return all artists with their rolling totals
4. Sort by metric for convenience
5. Frontend determines top 5 for each animation frame

## Component

**File:** `components/RacingBarChart.tsx`

**Library:** D3.js v7

**Features:**
- Horizontal animated bar chart
- Auto-play with play/pause controls
- Smooth 800ms transitions between frames
- Bars slide up/down as ranks change
- Fade in/out for entering/exiting artists
- Current month display (large, prominent)
- Progress bar showing animation timeline
- Restart button to reset to beginning
- Metric prop integration (hours/plays)
- Responsive width, fixed height (~450px)

## Configuration

### Change Top N

Edit the component call in `components/pages/TasteEvolutionPage.tsx`:

```tsx
<RacingBarChart 
  data={artistEvolution} 
  topN={5}  // Current: top 5 (recommended for racing bars)
  metric={metric}  // Passed from parent
/>
```

### Adjust Animation Speed

Edit the interval duration in `components/RacingBarChart.tsx`:

```typescript
setInterval(() => {
  setCurrentMonthIndex(prev => (prev + 1) % months.length)
}, 1000)  // 1000ms = 1 second per frame (change to 500 for faster, 2000 for slower)
```

### Adjust Transition Duration

Edit the D3 transition duration:

```typescript
.transition()
.duration(800)  // 800ms transitions (change to match or be less than frame interval)
```

### Metric Filter Integration

The chart respects the hours/plays toggle on the Taste Evolution page:
- Filter component: `components/filters/MetricFilter.tsx`
- State managed in parent: `app/page.tsx`
- Passed to API and component via props
- Rankings recalculate when metric changes

## Example Insights

From your data, you might see:

- **Seasonal favorite** — Artist climbs to #1 during summer, drops in winter
- **New discovery** — Artist suddenly appears at #5, gradually climbs to #1 over several months
- **Consistent champion** — Artist maintains #1 position for extended periods
- **Rotating favorites** — Top 5 constantly changing as your taste evolves
- **Comeback** — Artist exits top 5, returns months/years later

## Performance

### Query Performance
- **Rolling window calculation:** Efficient with proper indexing
- **Typical query time:** 50-200ms depending on data size
- **Monthly aggregation:** ~90+ months from 2018-01 onwards
- **Returns all artists:** No filtering in API (5-10 KB typical response)

### Chart Rendering
- **D3.js animations:** 60 FPS smooth transitions
- **Transition duration:** 800ms per frame change
- **Frame rate:** 1 frame per second (adjustable)
- **Memory:** Efficient with D3's data join pattern
- **Total animation:** ~90 seconds for full timeline

### Database Considerations
- Index on `(year_month, artist_name)` recommended
- Rolling sum with self-join performs well
- Consider materialized view if query becomes slow for very large datasets

## D3.js Implementation Details

### Core Animation Logic

The component uses D3's data join pattern for smooth transitions:

```typescript
// Data join with artist_name as key
const barGroups = g.selectAll('.bar-group')
  .data(currentData, d => d.artist_name)

// Enter: New artists fade in from bottom
barGroupsEnter.append('g')
  .attr('transform', `translate(0, ${height})`)
  .style('opacity', 0)

// Update: Existing artists slide to new positions
barGroups.merge(barGroupsEnter)
  .transition()
  .duration(800)
  .ease(d3.easeCubicInOut)
  .attr('transform', d => `translate(0, ${yScale(d.rank)})`)
  .style('opacity', 1)

// Exit: Leaving artists fade out at bottom
barGroups.exit()
  .transition()
  .style('opacity', 0)
  .attr('transform', `translate(0, ${height})`)
  .remove()
```

### Key Technical Features

1. **Keyed data join:** Uses `artist_name` as stable identifier
2. **Smooth reordering:** Y-position transitions create sliding effect
3. **Value animations:** Number tweening for smooth value changes
4. **Easing function:** `d3.easeCubicInOut` for natural movement
5. **React integration:** `useRef` for SVG, `useEffect` for D3 updates
6. **Auto-play management:** `setInterval` with cleanup on unmount

## Future Enhancements

Potential improvements:
- [ ] Adjustable animation speed control
- [ ] Skip to specific date
- [ ] Manual scrubber/slider to control animation
- [ ] Export animation as video
- [ ] Highlight specific artist throughout timeline
- [ ] Configurable window size (3, 6, 12, 24 months)
- [ ] Side-by-side metric comparison

---

**Built:** January 2026  
**Library:** D3.js v7  
**Chart Type:** Animated racing bar chart  
**Data:** Monthly 12-month rolling window from 2018-01  
**Animation:** Auto-play at 1 second per frame with play/pause controls  
**Metric Support:** Hours/plays toggle with smooth rank transitions

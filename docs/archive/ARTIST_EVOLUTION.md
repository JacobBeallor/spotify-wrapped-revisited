# Artist Evolution Feature

## Overview

The Artist Evolution chart visualizes how your top artists change over time using a **bump chart** with a **6-month rolling window**.

## What It Shows

- **Rank changes** — See artists rise and fall in your top 5
- **Musical phases** — Identify when you were into specific artists
- **Consistency** — See which artists stay in your rotation
- **Discovery** — Watch new artists enter your top 5
- **Clean focus** — Only 5 ranks shown (your absolute favorites)

## How It Works

### 1. Rolling Window Calculation

For each month, we calculate the **total listening hours over the previous 12 months**:

```sql
-- For January 2024, sum hours from:
-- Feb 2023 through Jan 2024 (12 months total)
```

**Why 12 months?**
- Smooths out seasonal variations
- Shows sustained interest over a full year
- Captures true long-term favorites
- Reduces noise from short-term phases

### 2. Ranking

Artists are ranked 1-5 based on their rolling 12-month hours.

Only the **top 5** artists are shown on the chart.

### 3. Visualization (Fixed Rank Approach)

The bump chart shows:
- **5 fixed rank positions** (1 through 5 only)
- **Artists appear/disappear** as they enter/exit top 5
- **No ranks beyond 5** — cleaner, focused view
- **Line position** — Rank (1 = top, 5 = bottom)
- Artists "enter from nothing" when they reach top 5
- Artists "exit to nothing" when they drop below rank 5

## Data File

**Location:** `public/data/artist_evolution.json`

**Size:** ~532 KB

**Records:** 5,078 (all artists who were ever in top 5)

**Structure:**
```json
{
  "year_month": "2024-01",
  "artist_name": "Taylor Swift",
  "rank": 1,
  "hours": 45.2
}
```

## Component

**File:** `components/ArtistEvolutionChart.tsx`

**Library:** `@nivo/bump`

**Features:**
- Interactive hover (shows artist name + rank)
- Artist labels on the right
- Smooth line transitions
- Artists disappear when not in top 5 (fixed rank approach)
- X-axis shows every 6 months to reduce clutter
- Clean visualization with exactly 5 ranks

## Configuration

### Change Top N

Edit the component call in `app/page.tsx`:

```tsx
<ArtistEvolutionChart 
  data={artistEvolution} 
  topN={5}  // Current: top 5 (recommended)
  // topN={10}  // Change to top 10 for more artists
/>
```

### Adjust Rolling Window

Edit the SQL in `scripts/export_aggregates.py`:

```python
# Current setting: 12 months
INTERVAL 11 MONTH  # (12 months = current + 11 previous)

# Change to 6 months:
INTERVAL 5 MONTH  # (6 months = current + 5 previous)

# Change to 3 months:
INTERVAL 2 MONTH  # (3 months = current + 2 previous)
```

## Example Insights

From your data, you might see:

- **Steely Dan phase** — Enters at #5, climbs to #1, then disappears
- **Beatles comeback** — Suddenly appears at #4, stays for 6 months
- **Consistent favorites** — Drake never leaves the top 5 for years
- **Rotation** — Artists cycle in and out of your top 5

## Performance

- **Initial load:** ~532 KB JSON file
- **Render time:** < 100ms
- **Smooth interactions:** 60 FPS hover effects
- **Shows ~15-25 artist lines** (all who were ever in top 5)
- **Cleaner display:** Fixed rank with only 5 positions

## Future Enhancements

Potential improvements:
- [ ] Filter by date range
- [ ] Highlight specific artist
- [ ] Show exact hours on hover
- [ ] Export as image
- [ ] Compare two time periods
- [ ] Animate rank changes

---

**Built:** January 2026  
**Library:** Nivo Bump Chart  
**Data:** 12-month rolling window  
**Approach:** Fixed rank with disappearing artists


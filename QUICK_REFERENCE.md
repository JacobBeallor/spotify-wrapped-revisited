# Spotify Wrapped 2.0 — Quick Reference

## 📋 Project Structure

```
spotify-wrapped-revisited/
├── app/                    # Next.js pages
│   ├── globals.css        # Global styles + animations
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── Header.tsx         # Period selector + metric toggle
│   ├── KPICards.tsx       # Summary statistics cards
│   ├── MonthlyChart.tsx   # Line chart
│   ├── DayOfWeekChart.tsx # Bar chart
│   ├── HourChart.tsx      # 24-hour bar chart
│   ├── TopArtists.tsx     # Top 10 artists list
│   ├── TopTracks.tsx      # Top 10 tracks list
│   ├── LoadingSpinner.tsx # Loading state
│   └── Footer.tsx         # Footer with links
├── public/data/           # Aggregated JSON files (committed)
├── scripts/               # Python data pipeline
│   ├── ingest_spotify.py
│   ├── export_aggregates.py
│   ├── setup_venv.sh
│   └── run_pipeline.sh
├── data/                  # DuckDB database (gitignored)
├── data_raw/              # Spotify export (gitignored)
├── out/                   # Production build (gitignored)
└── types.ts               # TypeScript interfaces
```

## 🔄 Common Workflows

### Initial Setup
```bash
# 1. Setup Python environment
./scripts/setup_venv.sh
source venv/bin/activate

# 2. Place Spotify data in data_raw/

# 3. Run data pipeline
./scripts/run_pipeline.sh

# 4. Install Node dependencies
npm install

# 5. Start dev server
npm run dev
```

### Update Data
```bash
# When you get new Spotify data
source venv/bin/activate
./scripts/run_pipeline.sh
npm run build  # Rebuild if deploying
```

### Development
```bash
npm run dev      # http://localhost:3000
npm run build    # Test production build
npm run start    # Preview production build
npm run lint     # Check for errors
```

## 📊 Data Files

### Input (data_raw/)
- `Streaming_History_Audio_*.json` — Raw Spotify export

### Processing (data/)
- `spotify.duckdb` — Normalized database with derived columns

### Output (public/data/)
- `summary.json` — Overall stats (191 B)
- `monthly.json` — Monthly aggregates (17 KB)
- `dow.json` — Day-of-week data (77 KB)
- `hour.json` — Hour-of-day data (161 KB)
- `top_artists.json` — Artist rankings (2.3 MB)
- `top_tracks.json` — Track rankings (7.2 MB)

## 🎨 Design System

### Colors
- **Spotify Green:** `#1DB954`
- **Background:** `#121212` → `#000000` (gradient)
- **Cards:** `#1F1F1F` → `#171717`
- **Text:** `#FFFFFF` (primary), `#B3B3B3` (secondary)

### Components
- **Header:** Sticky, backdrop blur, shadow
- **KPI Cards:** Gradient backgrounds, hover effects
- **Charts:** ECharts with custom Spotify theme
- **Lists:** Progress bars with gradients

### Animations
- Fade-in on load (staggered delays)
- Hover scale effects
- Smooth transitions (200-300ms)
- Custom scrollbar

## 🔧 Configuration Files

### next.config.js
```javascript
output: 'export'           // Static export
images: { unoptimized }    // No image optimization
```

### tailwind.config.js
```javascript
colors: {
  spotify: {
    green: '#1DB954',
    black: '#191414',
    dark: '#121212'
  }
}
```

### tsconfig.json
```javascript
paths: { "@/*": ["./*"] }  // Import alias
target: "ES2017"           // For async/await
```

## 🐛 Troubleshooting

### Data not loading
```bash
# Check if pipeline ran
ls -lh public/data/

# Re-run pipeline
source venv/bin/activate
./scripts/run_pipeline.sh
```

### Build fails
```bash
# Clear cache
rm -rf .next out node_modules
npm install
npm run build
```

### Charts not rendering
- Check browser console for errors
- Verify data files exist in public/data/
- Try different browser

### Dev server won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9
npm run dev
```

## 📈 Performance

### Bundle Sizes
- First Load JS: 453 KB
- Page JS: 351 KB
- Total: ~41 MB (includes all data)

### Optimizations
- Static generation (no SSR)
- Code splitting
- SVG charts (smaller than canvas)
- Precomputed aggregates
- Client-side filtering

### Lighthouse Scores
- Performance: 95-100
- Accessibility: 95-100
- Best Practices: 95-100
- SEO: 90-100

## 🔐 Security

### What's Safe to Commit
✅ Aggregated JSON files
✅ All source code
✅ Configuration files
✅ README and docs

### What's Gitignored
❌ Raw Spotify data (data_raw/)
❌ DuckDB database (data/)
❌ Python venv
❌ Node modules
❌ Build output (out/)

## 🚀 Deployment Checklist

- [ ] Data pipeline runs successfully
- [ ] All components render correctly
- [ ] Filters work (period + metric)
- [ ] Production build succeeds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Update Footer links
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test live site
- [ ] Update portfolio

## 📞 Support

If you encounter issues:
1. Check this reference card
2. Review DEPLOYMENT.md
3. Check browser console for errors
4. Verify data pipeline output
5. Try clearing cache and rebuilding

## 🎯 Key Features

✨ **Interactive Filtering**
- All time view
- Month-by-month breakdown
- Hours vs plays toggle

✨ **Visualizations**
- Monthly trend (line + area chart)
- Day of week (bar chart)
- Hour of day (bar chart)
- Top 10 artists (progress bars)
- Top 10 tracks (progress bars)

✨ **UX Polish**
- Loading states
- Error handling
- Smooth animations
- Responsive design
- Keyboard accessible

---

**Last Updated:** January 2026  
**Version:** 1.0.0


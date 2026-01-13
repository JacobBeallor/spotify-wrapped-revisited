# Spotify Wrapped 2.0 — TODO List

## ✅ v1.0 Complete (Deployed)
- [x] Data pipeline (Python + DuckDB)
- [x] Interactive dashboard (Next.js + TypeScript + Tailwind)
- [x] Charts & visualizations (ECharts)
- [x] Client-side filtering
- [x] Deployed to Vercel
- [x] Custom favicon

---

## 🎯 Next Up (v1.1)

### High Priority
- [ ] **Update KPI card icons** — Replace emoji with better icons/graphics
- [ ] **Review data ingestion code** — Optimize and document pipeline
- [ ] **Update data range filter UI** — Improve UX for selecting periods
- [ ] **Update monthly trends chart** — Add zoom when date range is small

### Core Features
- [ ] **YoY trend analysis** — Compare year-over-year listening patterns
- [ ] **Genre/artist evolution over time** — Visualize how tastes changed
  - Bump chart or streamgraph (research Nivo?)
- [ ] **Discovery trends** — Track new tracks/artists per month
  - "First listen" detection and visualization
- [ ] **Release year analysis** — Analyze listening by song release date
  - Distribution: 60s, 70s, 80s, 90s, 2000s, 2010s, 2020s
  - "Musical era preference" visualization
  - Nostalgia score: % of music older than 10 years
  - Track if taste skews vintage, modern, or balanced
- [ ] **Move to server-side queries** — Replace static JSON with dynamic API
  - Consider tRPC or Next.js API routes
  - Keep DuckDB for fast queries

### Documentation
- [ ] Document data pipeline architecture
- [ ] Add inline code comments
- [ ] Create data schema documentation
- [ ] Write migration guide (static → server-side)

---

## 💡 Ideas to Explore

### Spotify Integration
- [ ] Embedded Spotify widgets — Show playable tracks
- [ ] Spotify API integration — Get real-time data
  - Research API limits and authentication
  - Evaluate privacy implications

### Data Enrichment
- [ ] Genre enrichment — Use Spotify API for genre data
  - Map artists → genres
  - Create genre distribution charts
- [ ] Audio feature analysis — Energy, danceability, valence, etc.
  - Visualize audio features over time
  - Find correlations with listening patterns
  - "Musical mood" tracking

---

## 📊 Technical Notes

### Nivo Research
- React chart library with beautiful defaults
- Good for bump charts and stream graphs
- Lighter than D3, easier than ECharts for advanced layouts
- Evaluate: bundle size vs ECharts

### Server-Side Architecture Options
1. **Next.js API Routes + DuckDB**
   - Keep DuckDB for speed
   - Serverless functions query on-demand
   - Pros: Fast, familiar
   - Cons: Cold starts, function timeout

2. **tRPC + DuckDB**
   - Type-safe API layer
   - Better DX for full-stack TypeScript
   - Pros: Type safety, great DX
   - Cons: Learning curve

3. **Edge Functions + Cached Queries**
   - Deploy DuckDB queries at edge
   - Cache results with SWR/React Query
   - Pros: Fast global access
   - Cons: Complexity

### Discovery Metrics Ideas
- Track "first play" timestamp per track/artist
- Calculate discovery rate: new/(new + repeat)
- Visualize: "How adventurous am I?"
- Compare discovery rate over time

---

## 🎨 Design Improvements

### KPI Card Icons
Options to explore:
- React Icons (react-icons)
- Lucide Icons (lucide-react)
- Heroicons
- Custom SVG icons
- Phosphor Icons

### Chart Zoom Implementation
- ECharts has built-in dataZoom
- Show all data when "All Time" selected
- Auto-zoom to date range when month selected
- Add brush selection for custom ranges

---

## 🔄 Migration Plan: Static → Server-Side

### Phase 1: Hybrid Approach
1. Keep static JSON for initial load (fast)
2. Add API routes for dynamic queries
3. Use SWR for client-side data fetching

### Phase 2: Full Server-Side
1. Remove static JSON files
2. Query DuckDB on-demand
3. Implement caching strategy
4. Add loading states

### Phase 3: Optimization
1. Implement query pagination
2. Add data streaming for large results
3. Consider moving DuckDB to persistent storage

---

## 📅 Timeline

**Short term (Next 2 weeks):**
- KPI icons
- Review/document code
- Filter UI improvements

**Medium term (Next month):**
- Chart zoom functionality
- YoY analysis
- Discovery trends

**Long term (2-3 months):**
- Genre/artist evolution
- Server-side migration
- Spotify API integration

---

**Last Updated:** January 2026  
**Current Version:** 1.0.0  
**Status:** ✅ Production | 🚧 Planning v1.1

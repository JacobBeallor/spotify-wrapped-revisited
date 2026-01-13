# 🎵 Spotify Wrapped 2.0

> An interactive web dashboard visualizing personal Spotify streaming history

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

Transform your Spotify data into beautiful, interactive visualizations. This project takes your extended streaming history and creates a privacy-safe dashboard featuring:

- 📊 **Monthly listening trends** — Track your music habits over time
- 📅 **Day-of-week patterns** — See when you listen most
- ⏰ **Hour-of-day distribution** — Discover your peak listening hours
- 🎤 **Top artists & tracks** — Your most-played music
- 🔍 **Interactive filtering** — Explore by time period and metric (hours vs plays)
- 🎨 **Beautiful UI** — Spotify-inspired dark theme with smooth animations

## Architecture

**Data Pipeline (Local Only)**
1. Spotify export → `data_raw/`
2. Python + DuckDB ingest → `data/spotify.duckdb`
3. Export aggregates → `public/data/*.json`

**Web Dashboard (Deployed)**
- Next.js + Tailwind CSS + ECharts
- Reads precomputed JSON aggregates
- No raw listening data shipped

## Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- Spotify extended streaming history export

### Data Pipeline

1. Request your Spotify data at https://www.spotify.com/account/privacy/
   - Select "Extended streaming history"
   - Wait for email with download link

2. Extract the zip and place JSON files in `data_raw/`

3. Set up Python environment:
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On macOS/Linux
# or: venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

4. Run the data pipeline:
```bash
# Option A: Run everything at once
./scripts/run_pipeline.sh

# Option B: Run steps individually
python scripts/ingest_spotify.py
python scripts/export_aggregates.py
```

### Web Dashboard

1. Install dependencies:
```bash
npm install
```

2. Run dev server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Data Privacy

Only aggregated statistics are included in the published dashboard. Raw streaming history remains local and is never committed to git or deployed.

## 🛠️ Tech Stack

**Data Pipeline:**
- Python 3.8+ with DuckDB for fast data processing
- Aggregation of 80K+ plays into compact JSON files

**Frontend:**
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS for styling
- ECharts for interactive visualizations
- Static export for zero-cost hosting

**Deployment:**
- Vercel (recommended) or any static host
- Global CDN delivery
- ~2-3 MB total bundle size

## 📸 Screenshots

> Add screenshots of your dashboard here after deployment

## 🚀 Quick Start

**1. Get your Spotify data:**
```bash
# Request at: https://www.spotify.com/account/privacy/
# Wait for email (1-30 days)
# Download and extract to data_raw/
```

**2. Run the data pipeline:**
```bash
./scripts/setup_venv.sh
source venv/bin/activate
./scripts/run_pipeline.sh
```

**3. Start the dashboard:**
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 📊 Example Stats

Based on 9 years of data (2015-2024):
- **3,747 hours** of listening
- **88,063 plays**
- **17,462 unique tracks**
- **6,463 unique artists**

## 🔒 Privacy & Security

This project is designed with privacy in mind:
- ✅ Only aggregated statistics are included in the deployed site
- ✅ Raw streaming history stays local (gitignored)
- ✅ No personal identifiers or API keys
- ✅ Safe to share publicly

## 📝 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) — Complete deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) — Development notes and architecture

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt it for your own use!

## 📄 License

MIT — Feel free to use this project as inspiration for your own Spotify visualizations.

## 🙏 Acknowledgments

- Spotify for providing extended streaming history
- Next.js team for the amazing framework
- ECharts for powerful visualization library

---

**Built with ❤️ and lots of ☕**


# 🎵 Spotify Wrapped 2.0

> A personal analytics dashboard for your Spotify listening history

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

Transform your Spotify extended streaming history into beautiful, interactive visualizations.

## ✨ Features

- 📊 **Summary Statistics** — Total hours, plays, unique tracks/artists
- 📈 **Listening Trends** — Monthly, weekly, or daily patterns with dynamic granularity
- 📅 **Day/Hour Analysis** — When you listen most throughout the week and day
- 🎤 **Top Artists & Tracks** — Your most-played music with filterable time ranges
- 🎸 **Artist Evolution** — Animated racing bar chart showing your top artists over time
- 🎵 **Genre Analysis** — Discover your genre preferences (with enrichment)
- 📅 **Release Year Insights** — See if you prefer classics or modern music (with enrichment)
- 🎨 **Beautiful UI** — Spotify-inspired dark theme with smooth animations

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install
./scripts/setup_venv.sh

# 2. Add your Spotify data to data_raw/
# Request from: https://www.spotify.com/account/privacy/

# 3. Run data pipeline
./scripts/run_pipeline.sh

# 4. Start dashboard
npm run dev
# Open http://localhost:3000
```

**📖 [Full Documentation](./docs/)** — Setup, deployment, enrichment, and more

---

## 🏗️ Architecture

**Dual-Database Design:**
- **Local Development:** DuckDB (fast, no configuration)
- **Production:** Vercel Postgres (serverless-compatible)

**Data Flow:**
```
Spotify JSON → DuckDB → [Optional: Spotify API enrichment] → Postgres → API Routes → Frontend
```

**Key Technologies:**
- **Backend:** Next.js API Routes, DuckDB (local), Vercel Postgres (production)
- **Frontend:** React 18, Tailwind CSS, ECharts, Nivo
- **Data Pipeline:** Python 3.11+, spotipy

See **[Architecture Docs](./docs/architecture/)** for details.

## 📝 Documentation

**Getting Started:**
- [📖 Getting Started Guide](./docs/getting-started.md) — Setup in 5 minutes
- [💻 Local Development](./docs/guides/local-development.md) — Development workflow
- [🚀 Deployment Guide](./docs/guides/deployment.md) — Deploy to Vercel

**Architecture:**
- [🗄️ Database Architecture](./docs/architecture/database.md) — DuckDB + Postgres
- [⚙️ Data Pipeline](./docs/architecture/data-pipeline.md) — Ingestion & enrichment
- [🔌 API Routes](./docs/architecture/api-routes.md) — Server-side endpoints

**Guides:**
- [🔄 Updating Data](./docs/guides/updating-data.md) — Add new Spotify exports
- [🎵 Enrichment](./docs/guides/enrichment.md) — Add Spotify API metadata (full guide)
- [⚡ Enrichment Quick Start](./docs/guides/enrichment-quickstart.md) — Fast-track setup (5 minutes)

**[📁 Full Documentation Index](./docs/README.md)**

---

## 🔒 Privacy

This project is privacy-focused:
- ✅ Raw listening data stays local (gitignored)
- ✅ Only aggregated statistics in production
- ✅ No tracking or analytics on your data
- ✅ Self-hosted — you control everything

---

## 📊 Project Stats

Based on 10 years of listening history (2015-2025):
- **4,250 hours** of music
- **77,800 plays**
- **16,230 unique tracks**
- **5,776 unique artists**

*Your stats will appear once you run the pipeline!*

## 🙏 Acknowledgments

- Spotify for providing extended streaming history exports
- Next.js team for the amazing React framework
- ECharts & Nivo for powerful visualization libraries
- Vercel for seamless deployment platform

---

**Built with ❤️ by [Jacob Beallor](https://github.com/JacobBeallor)**


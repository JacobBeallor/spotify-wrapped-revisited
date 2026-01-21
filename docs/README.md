# Spotify Wrapped 2.0 Documentation

Complete documentation for your personal Spotify analytics dashboard.

**📂 [Documentation Structure Guide](./STRUCTURE.md)** - Map of all docs and when to use them

## 🚀 Quick Start

**New to the project?** Start here:
- **[Getting Started Guide](./getting-started.md)** - Setup in 5 minutes
- **[Pipeline Quick Reference](./PIPELINE.md)** - Complete pipeline commands ⭐
- **[Local Development](./guides/local-development.md)** - Running locally with DuckDB
- **[Deployment Guide](./guides/deployment.md)** - Deploy to Vercel

## 🏗️ Architecture

Understand how the system works:
- **[Navigation Architecture](./architecture/navigation.md)** - Tab-based navigation and filter state management
- **[Database Architecture](./architecture/database.md)** - DuckDB (local) + Postgres (production)
- **[Data Pipeline](./architecture/data-pipeline.md)** - Ingestion, enrichment, and sync
- **[API Routes](./architecture/api-routes.md)** - Server-side endpoints

## 📖 Guides

Step-by-step instructions:
- **[Updating Data](./guides/updating-data.md)** - Add new Spotify exports
- **[Enrichment](./guides/enrichment.md)** - Complete guide to Spotify API enrichment
- **[Enrichment Quick Start](./guides/enrichment-quickstart.md)** - Fast-track enrichment (5 min setup)
- **[Genre Mappings](./guides/genre-mappings.md)** - 452 subgenres → 28 categories + genre evolution viz
- **[Local Development](./guides/local-development.md)** - Development workflow

## 🗂️ Archive

Historical documentation and implementation notes:
- [Genre Evolution Feature](./archive/GENRE_EVOLUTION.md) - Artist/Genre toggle implementation
- [Artist Evolution Feature](./archive/ARTIST_EVOLUTION.md) - Racing bar chart implementation
- [Session 3 Summary](./archive/SESSION_3_SUMMARY.md) - Polish & production ready
- [Timezone Handling](./archive/TIMEZONE.md) - UTC to local conversion
- [Migration Notes](./archive/MIGRATION.md) - Server-side migration plan

## 📁 Project Structure

```
spotify-wrapped-revisited/
├── app/                    # Next.js app (App Router)
│   ├── api/               # API routes (server-side queries)
│   ├── hooks/             # React custom hooks
│   └── page.tsx           # Main dashboard page
├── components/            # React components
├── scripts/               # Python data pipeline
│   ├── ingest_spotify.py          # Raw JSON → DuckDB
│   ├── enrich_metadata.py         # Spotify API enrichment
│   ├── seed_genre_mappings.py    # Genre categorization
│   ├── sync_to_postgres.py        # DuckDB → Postgres
│   ├── run_full_pipeline.sh       # Complete pipeline ⭐
│   ├── run_enrichment.sh          # Enrichment + genres
│   └── run_pipeline.sh            # Basic pipeline (legacy)
├── data/                  # Local DuckDB database (gitignored)
├── data_raw/              # Spotify JSON exports (gitignored)
├── docs/                  # Documentation (you are here)
└── types.ts               # TypeScript type definitions
```

## 🆘 Troubleshooting

### Common Issues

**DuckDB file not found:**
```bash
./scripts/run_full_pipeline.sh
```

**Hitting Vercel Postgres quota:**
- Make sure `.env.local` is deleted (should use DuckDB locally)
- See [Database Architecture](./architecture/database.md)

**API returning errors:**
- Check that data pipeline has been run
- Verify `data/spotify.duckdb` exists and has data

## 🔗 Quick Links

- [Main README](../README.md)
- [TODO List](../TODO.md)
- [Environment Variables](../.env.example)

## 📝 Contributing

When adding new features or documentation:
1. Keep docs in the appropriate section (architecture/guides/archive)
2. Update this README with links
3. Keep implementation details in `architecture/`
4. Keep user guides in `guides/`
5. Move outdated docs to `archive/`


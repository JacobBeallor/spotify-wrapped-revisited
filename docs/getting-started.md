# Getting Started

Get your Spotify Wrapped 2.0 dashboard up and running in 5 minutes.

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Spotify Extended Streaming History** - [Request from Spotify](https://www.spotify.com/account/privacy/)

## Setup Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/JacobBeallor/spotify-wrapped-revisited.git
cd spotify-wrapped-revisited

# Install Node.js dependencies
npm install

# Set up Python virtual environment
./scripts/setup_venv.sh
```

### 2. Add Your Spotify Data

Place your Spotify JSON files in the `data_raw/` directory:

```bash
data_raw/
├── Streaming_History_Audio_2023-2024_0.json
├── Streaming_History_Audio_2024-2025_1.json
└── ...
```

**Getting Spotify Data:**
1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Request "Extended streaming history"
3. Wait 5-30 days for Spotify to email you
4. Download and extract JSON files to `data_raw/`

### 3. Run Data Pipeline

This ingests and processes your Spotify data:

```bash
./scripts/run_full_pipeline.sh
```

**What this does:**
- Reads all JSON files from `data_raw/`
- Filters out plays < 30 seconds
- Converts UTC timestamps to your local timezone
- Enriches with Spotify API metadata (if credentials available)
- Maps 452 granular genres → 28 broad categories
- Creates `data/spotify.duckdb` with your listening history

**Time:**
- Basic ingestion: ~30-60 seconds for 77k+ plays
- With enrichment: +1-2 hours (optional, skip with `--no-enrich`)

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## What You'll See

Your dashboard includes:
- **📊 Summary Stats** - Total hours, plays, unique tracks/artists
- **📈 Trends Chart** - Monthly listening patterns
- **⏰ Hour/Day Charts** - When you listen most
- **🎵 Top Lists** - Your most-played artists and tracks
- **🎸 Artist Evolution** - How your top artists change over time
- **🎭 Genre Analysis** - 28 broad genre categories (with enrichment)

## Next Steps

### Optional: Add Spotify API Enrichment

The full pipeline automatically enriches data if credentials are available.

To enable enrichment:

1. **Get Spotify API credentials:**
   - Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create an app
   - Copy Client ID and Secret

2. **Create `.env` file:**
   ```bash
   # Copy the example
   cp .env.example .env
   
   # Add your credentials
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

3. **Re-run pipeline:**
   ```bash
   ./scripts/run_full_pipeline.sh
   ```

**What enrichment adds:**
- 🎭 Genre distribution (452 subgenres → 28 categories)
- 📅 Release year/decade analysis
- ⭐ Track and artist popularity scores

See [Enrichment Guide](./guides/enrichment.md) for details.

### Deploy to Vercel

Make your dashboard publicly accessible:

1. **Sync to Postgres:**
   ```bash
   python scripts/sync_to_postgres.py
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Deploy on Vercel:**
   - Connect your GitHub repo at [vercel.com](https://vercel.com)
   - Vercel auto-deploys on every push

See [Deployment Guide](./guides/deployment.md) for full instructions.

## Project Structure

```
spotify-wrapped-revisited/
├── app/                    # Next.js application
├── components/            # React components
├── scripts/               # Python data pipeline
│   ├── ingest_spotify.py          # Main ingestion script
│   ├── enrich_metadata.py         # Spotify API enrichment
│   ├── seed_genre_mappings.py    # Genre categorization
│   ├── sync_to_postgres.py        # Sync to Vercel Postgres
│   ├── run_full_pipeline.sh       # Complete pipeline (recommended)
│   ├── run_enrichment.sh          # Enrichment + genre mapping
│   └── run_pipeline.sh            # Basic pipeline (legacy)
├── data/                  # DuckDB database (local only)
├── data_raw/              # Your Spotify JSON files
└── docs/                  # Documentation
```

## Troubleshooting

### "No such file or directory: data/spotify.duckdb"
Run the data pipeline:
```bash
./scripts/run_full_pipeline.sh
```

### "Module not found: duckdb"
Activate the Python virtual environment:
```bash
source venv/bin/activate
```

### Dev server shows "Error Loading Data"
Make sure you've run the data pipeline and `data/spotify.duckdb` exists.

### Hitting Vercel Postgres quota during local dev
Delete `.env.local` if it exists - local dev should use DuckDB:
```bash
rm -f .env.local
```

## Learn More

- **[Local Development Guide](./guides/local-development.md)** - Development workflow
- **[Database Architecture](./architecture/database.md)** - How DuckDB + Postgres work together
- **[API Routes](./architecture/api-routes.md)** - Server-side endpoints

## Need Help?

- Check the [full documentation](./README.md)
- Review [TODO.md](../TODO.md) for known issues
- Open an issue on GitHub


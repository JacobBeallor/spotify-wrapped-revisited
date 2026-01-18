#!/bin/bash
# Complete Spotify Data Enrichment Script
# This runs the enrichment process safely

set -e  # Exit on error

echo "🎵 Spotify Data Enrichment"
echo "================================"
echo ""

# Navigate to project directory
cd "$(dirname "$0")/.."

# Check if credentials file exists
if [ ! -f "scripts/spotify_env.sh" ]; then
    echo "❌ Error: scripts/spotify_env.sh not found!"
    echo "Please create it with your Spotify API credentials."
    exit 1
fi

# Load credentials
echo "🔐 Loading Spotify credentials..."
source scripts/spotify_env.sh

# Verify credentials are set
if [ -z "$SPOTIFY_CLIENT_ID" ] || [ -z "$SPOTIFY_CLIENT_SECRET" ]; then
    echo "❌ Error: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set!"
    echo "Please edit scripts/spotify_env.sh with your actual credentials."
    exit 1
fi

echo "✅ Credentials loaded"
echo ""

# Activate virtual environment
echo "🐍 Activating Python environment..."
source venv/bin/activate

# Show current status
echo "📊 Current enrichment status:"
python -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
tracks = con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]
artists = con.execute('SELECT COUNT(*) FROM artists').fetchone()[0]
total_tracks = con.execute('SELECT COUNT(DISTINCT spotify_track_uri) FROM plays WHERE spotify_track_uri IS NOT NULL').fetchone()[0]
total_artists = con.execute('SELECT COUNT(DISTINCT artist_name) FROM plays').fetchone()[0]
print(f'  Tracks:  {tracks:,} / {total_tracks:,}')
print(f'  Artists: {artists:,} / {total_artists:,}')
con.close()
"
echo ""

# Run enrichment
echo "🚀 Starting enrichment..."
echo "⏰ This will take approximately 1-2 hours"
echo "💡 You can safely cancel (Ctrl+C) and resume later"
echo ""

python scripts/enrich_metadata.py

echo ""
echo "✅ Enrichment complete!"
echo ""
echo "🔍 Verify your data:"
echo "   python -c \"import duckdb; con = duckdb.connect('data/spotify.duckdb'); print('Tracks:', con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]); print('Artists:', con.execute('SELECT COUNT(*) FROM artists').fetchone()[0])\""
echo ""
echo "📤 Next steps:"
echo "   1. Test locally: npm run dev"
echo "   2. Sync to production: python scripts/sync_to_postgres.py"
echo "   3. Deploy: git push origin main"
echo ""
echo "📖 Need help? See docs/guides/enrichment-quickstart.md"


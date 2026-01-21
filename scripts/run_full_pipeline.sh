#!/bin/bash
# Complete Spotify Data Pipeline - Ingest, Enrich, Map Genres
# This is the recommended way to process your Spotify data

set -e  # Exit on error

# Parse arguments
ENRICH=true
SKIP_GENRE_MAPPING=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-enrich)
            ENRICH=false
            shift
            ;;
        --skip-genre-mapping)
            SKIP_GENRE_MAPPING=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./scripts/run_full_pipeline.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-enrich            Skip Spotify API enrichment"
            echo "  --skip-genre-mapping   Skip genre mapping (only if enrichment disabled)"
            echo "  --help, -h             Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  SPOTIFY_CLIENT_ID      Your Spotify API client ID"
            echo "  SPOTIFY_CLIENT_SECRET  Your Spotify API client secret"
            echo ""
            echo "Examples:"
            echo "  ./scripts/run_full_pipeline.sh              # Full pipeline with enrichment"
            echo "  ./scripts/run_full_pipeline.sh --no-enrich  # Basic pipeline only"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Run with --help for usage"
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "🎵 Spotify Wrapped 2.0 - Full Pipeline"
echo "=========================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")/.."

# Check if data_raw has files
if [ ! "$(ls -A data_raw/Streaming_History_Audio_*.json 2>/dev/null)" ]; then
    echo "❌ ERROR: No Spotify data found in data_raw/"
    echo ""
    echo "Please:"
    echo "1. Request your data at https://www.spotify.com/account/privacy/"
    echo "2. Download and extract the zip file"
    echo "3. Place Streaming_History_Audio_*.json files in data_raw/"
    echo ""
    exit 1
fi

# Activate virtual environment
echo "🐍 Activating Python environment..."
if [ ! -d "venv" ]; then
    echo "❌ ERROR: Virtual environment not found!"
    echo "Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Step 1: Ingest Data
echo "=========================================="
echo "📥 Step 1: Ingesting Spotify Data"
echo "=========================================="
python scripts/ingest_spotify.py
echo ""

# Step 2: Enrichment (optional)
if [ "$ENRICH" = true ]; then
    # Check for credentials
    CREDENTIALS_FOUND=false
    
    # Try loading from .env if it exists
    if [ -f ".env" ]; then
        echo "🔐 Loading credentials from .env..."
        export $(grep -v '^#' .env | grep -E 'SPOTIFY_CLIENT_ID|SPOTIFY_CLIENT_SECRET' | xargs)
    fi
    
    # Check if credentials are set
    if [ ! -z "$SPOTIFY_CLIENT_ID" ] && [ ! -z "$SPOTIFY_CLIENT_SECRET" ]; then
        CREDENTIALS_FOUND=true
    fi
    
    if [ "$CREDENTIALS_FOUND" = true ]; then
        echo "=========================================="
        echo "🎨 Step 2: Enriching with Spotify API"
        echo "=========================================="
        echo "⏰ This may take 1-2 hours for large datasets"
        echo "💡 You can safely cancel (Ctrl+C) and resume later"
        echo ""
        
        python scripts/enrich_metadata.py
        echo ""
        
        # Step 3: Genre Mappings (only after successful enrichment)
        if [ "$SKIP_GENRE_MAPPING" = false ]; then
            echo "=========================================="
            echo "🗂️  Step 3: Mapping Genre Categories"
            echo "=========================================="
            echo "Categorizing 452 subgenres → 28 broad categories..."
            echo ""
            
            python scripts/seed_genre_mappings.py
            echo ""
        fi
    else
        echo "⚠️  WARNING: Spotify API credentials not found"
        echo ""
        echo "Enrichment provides:"
        echo "  • Genre analysis"
        echo "  • Release year insights"
        echo "  • Popularity data"
        echo ""
        echo "To enable enrichment:"
        echo "  1. Get credentials: https://developer.spotify.com/dashboard"
        echo "  2. Create .env file with:"
        echo "     SPOTIFY_CLIENT_ID=your_client_id"
        echo "     SPOTIFY_CLIENT_SECRET=your_client_secret"
        echo "  3. Re-run this script"
        echo ""
        echo "Continuing with basic ingestion only..."
        echo ""
    fi
else
    echo "⏭️  Skipping enrichment (--no-enrich flag set)"
    echo ""
fi

# Summary
echo "=========================================="
echo "✅ Pipeline Complete!"
echo "=========================================="
echo ""

# Show data summary
python -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')
plays = con.execute('SELECT COUNT(*) FROM plays').fetchone()[0]
tracks = con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]
artists = con.execute('SELECT COUNT(*) FROM artists').fetchone()[0]
mappings = con.execute('SELECT COUNT(*) FROM genre_mappings').fetchone()[0]

print('📊 Data Summary:')
print(f'   Plays:          {plays:,}')
print(f'   Tracks:         {tracks:,}')
print(f'   Artists:        {artists:,}')
print(f'   Genre mappings: {mappings:,}')
con.close()
"
echo ""

# Next steps
echo "📤 Next Steps:"
echo ""
echo "   1. Test locally:"
echo "      npm run dev"
echo "      Open http://localhost:3000"
echo ""
echo "   2. Sync to production (Vercel):"
echo "      python scripts/sync_to_postgres.py"
echo ""
echo "   3. Deploy:"
echo "      git add ."
echo "      git commit -m 'Update data'"
echo "      git push origin main"
echo ""
echo "📖 Documentation: docs/guides/updating-data.md"
echo ""


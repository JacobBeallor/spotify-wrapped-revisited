#!/bin/bash
# Quick script to run the full data pipeline

set -e

echo "=========================================="
echo "Spotify Wrapped 2.0 - Data Pipeline"
echo "=========================================="
echo ""

# Check if data_raw has files
if [ ! "$(ls -A data_raw/Streaming_History_Audio_*.json 2>/dev/null)" ]; then
    echo "ERROR: No Spotify data found in data_raw/"
    echo ""
    echo "Please:"
    echo "1. Request your data at https://www.spotify.com/account/privacy/"
    echo "2. Download and extract the zip file"
    echo "3. Place Streaming_History_Audio_*.json files in data_raw/"
    echo ""
    exit 1
fi

echo "Step 1: Ingesting data..."
python3 scripts/ingest_spotify.py

echo ""
# Optional: Enrich with Spotify API metadata
if [ "$ENRICH" = "true" ]; then
  echo "Step 2: Enriching metadata from Spotify API..."
  python3 scripts/enrich_metadata.py
  echo ""
fi

echo "=========================================="
echo "Pipeline complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Install Node.js dependencies: npm install"
echo "2. Run dev server: npm run dev"
echo ""
echo "Optional: To enrich with Spotify API metadata:"
echo "  export SPOTIFY_CLIENT_ID=your_id"
echo "  export SPOTIFY_CLIENT_SECRET=your_secret"
echo "  ENRICH=true ./scripts/run_pipeline.sh"
echo ""


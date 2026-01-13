#!/bin/bash
# Setup script for Python environment

set -e

echo "=========================================="
echo "Setting up Python environment"
echo "=========================================="
echo ""

# Check if venv already exists
if [ -d "venv" ]; then
    echo "✓ Virtual environment already exists"
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "To activate the environment in the future, run:"
echo "  source venv/bin/activate"
echo ""
echo "Next steps:"
echo "1. Place your Spotify data in data_raw/"
echo "2. Run: ./scripts/run_pipeline.sh"
echo ""


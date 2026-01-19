#!/bin/bash
# Install Backend Dependencies

set -e  # Exit on error

echo "================================================"
echo "Installing Backend Dependencies"
echo "================================================"

cd /app/backend

echo "Installing Python packages from requirements.txt..."
pip install -r requirements.txt

echo ""
echo "✅ Backend dependencies installed successfully!"
echo ""
#!/bin/bash

# Backend Installation Script with Emergent Integrations
# This script installs all backend dependencies including emergentintegrations

set -e  # Exit on error

echo "🔧 Installing backend dependencies..."

cd /app/backend

# Install standard dependencies from requirements.txt
echo "📦 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Install emergentintegrations from special index
echo "🌟 Installing emergentintegrations from Emergent repository..."
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

echo "✅ Backend dependencies installed successfully!"
echo ""
echo "Installed packages:"
pip list | grep -E "fastapi|uvicorn|motor|emergentintegrations|google"

#!/bin/bash
# Build Frontend for Production

set -e  # Exit on error

echo "================================================"
echo "Building Frontend for Production"
echo "================================================"

cd /app/frontend

echo "Building React application..."
yarn build

echo ""
echo "✅ Frontend build completed successfully!"
echo "Build output available in /app/frontend/build"
echo ""
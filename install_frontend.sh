#!/bin/bash
# Install Frontend Dependencies

set -e  # Exit on error

echo "================================================"
echo "Installing Frontend Dependencies"
echo "================================================"

cd /app/frontend

echo "Installing Node packages with Yarn..."
yarn install

echo ""
echo "✅ Frontend dependencies installed successfully!"
echo ""
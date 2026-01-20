#!/bin/bash
# Development Mode - Install and Start

set -e  # Exit on error

echo "================================================"
echo "Development Mode Setup"
echo "================================================"
echo ""

# Check if dependencies are installed
if [ ! -d "/app/frontend/node_modules" ]; then
    echo "Node modules not found. Installing dependencies..."
    bash /app/setup.sh
else
    echo "Dependencies already installed. Skipping installation."
fi

echo ""
echo "Starting services..."
bash /app/start.sh

#!/bin/bash
# Complete Setup Script - Install All Dependencies

set -e  # Exit on error

echo "================================================"
echo "MDRRMO Pio Duran File Management System"
echo "Complete Setup Script"
echo "================================================"
echo ""

# Install Backend
echo "Step 1/2: Installing Backend Dependencies..."
bash /app/install_backend.sh
echo ""

# Install Frontend
echo "Step 2/2: Installing Frontend Dependencies..."
bash /app/install_frontend.sh
echo ""

echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Run 'bash /app/start.sh' to start all services"
echo "  2. Or use 'sudo supervisorctl restart all' to restart services"
echo ""

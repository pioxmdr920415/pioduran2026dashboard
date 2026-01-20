#!/bin/bash
# Start All Services

set -e  # Exit on error

echo "================================================"
echo "Starting All Services"
echo "================================================"
echo ""

echo "Restarting services with supervisorctl..."
sudo supervisorctl restart all

echo ""
echo "Waiting for services to start..."
sleep 5

echo ""
echo "Service Status:"
sudo supervisorctl status

echo ""
echo "================================================"
echo "✅ All Services Started!"
echo "================================================"
echo ""
echo "Services:"
echo "  - Backend API: Running on port 8001"
echo "  - Frontend: Running on port 3000"
echo "  - MongoDB: Running on port 27017"
echo ""
echo "Check logs:"
echo "  - Backend: tail -f /var/log/supervisor/backend.*.log"
echo "  - Frontend: tail -f /var/log/supervisor/frontend.*.log"
echo ""

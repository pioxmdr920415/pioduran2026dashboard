# 🚀 Quick Start Guide

## Installation & Setup

```bash
# Install all dependencies (frontend + backend)
yarn install

# Check service status
yarn status

# Start all services
yarn start
```

## Build for Production

```bash
# Build frontend application
yarn build

# Output location: /app/frontend/build/
```

## 📁 Key Directories

| Directory | Description | Path |
|-----------|-------------|------|
| Frontend Source | React app source code | `/app/frontend/src/` |
| Frontend Build | Production build output | `/app/frontend/build/` |
| Backend Source | FastAPI server | `/app/backend/` |
| Tests | Test files | `/app/tests/` |

## 🔧 Common Commands

```bash
# Development
yarn dev                    # Restart all services
yarn status                 # Check service status

# Logs
yarn logs:backend          # View backend logs
yarn logs:frontend         # View frontend logs
yarn logs:backend:err      # View backend errors
yarn logs:frontend:err     # View frontend errors

# Service Control
yarn start                 # Start all services
yarn start:backend         # Start backend only
yarn start:frontend        # Start frontend only
yarn stop                  # Stop all services

# Maintenance
yarn clean                 # Clean build artifacts
yarn install              # Reinstall dependencies
```

## 🌐 Access Points

- **Frontend**: Port 3000 (internal)
- **Backend**: Port 8001 (internal)
- **Public URL**: https://dep-installer-31.preview.emergentagent.com
- **API Docs**: {backend_url}/docs

## 📦 Technology Stack

- **Frontend**: React 19 + Tailwind CSS + Radix UI
- **Backend**: FastAPI (Python 3.11+)
- **Database**: MongoDB
- **Maps**: Leaflet + OpenStreetMap
- **360° Viewer**: Pannellum
- **APIs**: Google Drive, Google Sheets

## 📖 Documentation

- Package Scripts: [PACKAGE_SCRIPTS_GUIDE.md](./PACKAGE_SCRIPTS_GUIDE.md)
- Test Results: [test_result.md](./test_result.md)
- Full README: [README.md](./README.md)

---

**Need Help?** Check the detailed guide: `PACKAGE_SCRIPTS_GUIDE.md`

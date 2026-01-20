# 📦 Package Scripts Guide

This document explains all available yarn scripts in the root `package.json` for managing the MDRRMO Pio Duran File Management System.

## 📁 Project Structure

```
/app/
├── frontend/              # React frontend application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── build/            # Production build output (generated)
│   └── package.json      # Frontend dependencies
├── backend/              # FastAPI Python backend
│   ├── server.py         # Main server file
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Backend environment variables
├── package.json          # Root package with scripts
└── tests/               # Test files
```

## 🚀 Available Scripts

### Installation Commands

#### `yarn install` or `yarn install:all`
Installs dependencies for both frontend and backend.
```bash
yarn install
```
This will:
- Install frontend dependencies (Node packages via yarn)
- Install backend dependencies (Python packages via pip)

#### `yarn install:frontend`
Install only frontend dependencies.
```bash
yarn install:frontend
```

#### `yarn install:backend`
Install only backend dependencies.
```bash
yarn install:backend
```
**Note**: This script uses a special installation script (`/app/install_backend_fixed.sh`) that properly installs `emergentintegrations` from the Emergent repository. See [EMERGENT_INTEGRATIONS_FIX.md](./EMERGENT_INTEGRATIONS_FIX.md) for details.

---

### Build Commands

#### `yarn build` or `yarn build:frontend`
Creates a production build of the frontend application.
```bash
yarn build
```
- Output directory: `/app/frontend/build/`
- Optimized for production deployment
- Minified and bundled assets

---

### Service Management

#### `yarn start`
Restart all services (backend, frontend, mongodb, nginx).
```bash
yarn start
```

#### `yarn start:frontend`
Restart only the frontend service.
```bash
yarn start:frontend
```

#### `yarn start:backend`
Restart only the backend service.
```bash
yarn start:backend
```

#### `yarn stop`
Stop all services.
```bash
yarn stop
```

#### `yarn status`
Check the status of all services.
```bash
yarn status
```

#### `yarn dev`
Restart all services and display status (development mode).
```bash
yarn dev
```

---

### Logging Commands

#### `yarn logs:frontend`
View frontend output logs in real-time.
```bash
yarn logs:frontend
```

#### `yarn logs:backend`
View backend output logs in real-time.
```bash
yarn logs:backend
```

#### `yarn logs:frontend:err`
View frontend error logs in real-time.
```bash
yarn logs:frontend:err
```

#### `yarn logs:backend:err`
View backend error logs in real-time.
```bash
yarn logs:backend:err
```

---

### Cleanup Commands

#### `yarn clean`
Clean frontend build artifacts and node_modules.
```bash
yarn clean
```

#### `yarn clean:frontend`
Remove frontend build directory and node_modules.
```bash
yarn clean:frontend
```

#### `yarn clean:backend`
Remove Python cache files (__pycache__).
```bash
yarn clean:backend
```

---

### Testing & Linting

#### `yarn test:frontend`
Run frontend tests.
```bash
yarn test:frontend
```

#### `yarn lint:frontend`
Run ESLint on frontend code.
```bash
yarn lint:frontend
```

#### `yarn format`
Format frontend code with Prettier (if configured).
```bash
yarn format
```

---

## 🔧 Common Workflows

### First Time Setup
```bash
# 1. Install all dependencies
yarn install

# 2. Check service status
yarn status

# 3. Start all services
yarn start

# 4. View logs to ensure everything is running
yarn logs:backend
# or
yarn logs:frontend
```

### After Code Changes
```bash
# Services auto-reload with hot-reload enabled
# Only restart if you:
# - Install new dependencies
# - Change .env files
# - Experience issues

yarn start
```

### Create Production Build
```bash
# Build frontend for production
yarn build

# Build output will be in: /app/frontend/build/
```

### Troubleshooting
```bash
# 1. Check service status
yarn status

# 2. View error logs
yarn logs:backend:err
yarn logs:frontend:err

# 3. Restart services
yarn start

# 4. If issues persist, clean and reinstall
yarn clean
yarn install
yarn start
```

### Full Clean Reinstall
```bash
# 1. Stop all services
yarn stop

# 2. Clean everything
yarn clean:frontend
yarn clean:backend

# 3. Reinstall dependencies
yarn install

# 4. Restart services
yarn start
```

---

## 📋 Configuration

### Port Configuration
Default ports are configured in `package.json` under `config`:
- **Frontend**: Port 3000 (internal)
- **Backend**: Port 8001 (internal)
- **MongoDB**: Port 27017

### Environment Variables

#### Frontend (`/app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://your-domain.com
REACT_APP_GOOGLE_DRIVE_API_KEY=your_drive_api_key
REACT_APP_GOOGLE_SHEETS_API_KEY=your_sheets_api_key
REACT_APP_GOOGLE_SHEET_ID=your_sheet_id
```

#### Backend (`/app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
GOOGLE_API_KEY=your_api_key
```

---

## 🏗️ Build Directory Structure

After running `yarn build`, the production files are generated in:

```
/app/frontend/build/
├── index.html           # Main HTML file
├── static/
│   ├── css/            # Compiled CSS files
│   ├── js/             # Compiled JavaScript bundles
│   └── media/          # Images and other assets
├── manifest.json       # PWA manifest
└── asset-manifest.json # Asset mapping
```

---

## 📝 Notes

1. **Hot Reload**: Frontend and backend have hot reload enabled, so changes are automatically reflected without restart.

2. **Service Management**: All services are managed by `supervisorctl`, which keeps them running in the background.

3. **Log Files**: Logs are stored in `/var/log/supervisor/`:
   - `backend.out.log` - Backend stdout
   - `backend.err.log` - Backend stderr
   - `frontend.out.log` - Frontend stdout
   - `frontend.err.log` - Frontend stderr

4. **Python Virtual Environment**: Backend uses a Python virtual environment at `/root/.venv/`.

5. **Yarn Version**: Uses Yarn 1.22.22 (specified in `packageManager` field).

---

## 🆘 Quick Reference

| Task | Command |
|------|---------|
| Install everything | `yarn install` |
| Build for production | `yarn build` |
| Start all services | `yarn start` |
| Check status | `yarn status` |
| View backend logs | `yarn logs:backend` |
| View frontend logs | `yarn logs:frontend` |
| Stop all services | `yarn stop` |
| Clean build artifacts | `yarn clean` |

---

## 🔗 Additional Resources

- Frontend README: `/app/frontend/README.md`
- Backend Server: `/app/backend/server.py`
- API Documentation: Available at backend URL `/docs`
- Test Results: `/app/test_result.md`

---

**Last Updated**: January 2025  
**Project**: MDRRMO Pio Duran File Inventory & Management System

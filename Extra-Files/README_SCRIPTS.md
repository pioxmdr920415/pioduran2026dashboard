# Installation and Build Scripts

This directory contains helpful scripts to automate the setup and build process for the MDRRMO Pio Duran File Management System.

## Available Scripts

### 🚀 Quick Start

```bash
# Complete setup (install all dependencies)
bash /app/setup.sh

# Start all services
bash /app/start.sh

# Development mode (install if needed, then start)
bash /app/dev.sh
```

### 📦 Installation Scripts

#### `install_backend.sh`
Installs all Python backend dependencies from requirements.txt

```bash
bash /app/install_backend.sh
```

#### `install_frontend.sh`
Installs all Node.js frontend dependencies using Yarn

```bash
bash /app/install_frontend.sh
```

#### `setup.sh`
Complete setup script that installs both backend and frontend dependencies

```bash
bash /app/setup.sh
```

#### `install.sh`
Alias for setup.sh - quick install command

```bash
bash /app/install.sh
```

### 🏗️ Build Scripts

#### `build_frontend.sh`
Builds the React frontend for production deployment

```bash
bash /app/build_frontend.sh
```

Output will be in `/app/frontend/build/`

### ▶️ Service Management

#### `start.sh`
Restarts all services using supervisorctl and displays status

```bash
bash /app/start.sh
```

#### `dev.sh`
Development mode: checks dependencies and starts services

```bash
bash /app/dev.sh
```

## Manual Service Commands

If you prefer to manage services manually:

```bash
# Restart all services
sudo supervisorctl restart all

# Check service status
sudo supervisorctl status

# Restart individual services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# View logs
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log
```

## Service Ports

- **Backend API**: Port 8001
- **Frontend**: Port 3000
- **MongoDB**: Port 27017

## Environment Variables

Make sure the following environment files are configured:

- `/app/backend/.env` - Backend configuration (MONGO_URL, etc.)
- `/app/frontend/.env` - Frontend configuration (REACT_APP_BACKEND_URL, etc.)

## Troubleshooting

### Dependencies not installing?

```bash
# Check Python version
python --version

# Check Node/Yarn version
node --version
yarn --version
```

### Services not starting?

```bash
# Check supervisor logs
sudo supervisorctl tail -f backend stderr
sudo supervisorctl tail -f frontend stderr

# Check service status
sudo supervisorctl status
```

### Port already in use?

```bash
# Check what's using the port
sudo lsof -i :8001
sudo lsof -i :3000
```

## Notes

- All scripts use `set -e` to exit on error
- Scripts assume they're run from any directory (use absolute paths)
- Use `yarn` instead of `npm` for frontend (as per project requirements)
- Backend uses hot reload - no need to restart after code changes
- Frontend uses hot reload - no need to restart after code changes
- Only restart services when installing new dependencies or modifying .env files

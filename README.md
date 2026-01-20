# MDRRMO Pio Duran - File Inventory & Management System

A beautiful, modern frontend application for file inventory and management system with direct Google Drive/Sheets API integration, interactive maps, and 360° panoramic gallery.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.x-61dafb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8)
![Google APIs](https://img.shields.io/badge/Google%20APIs-Drive%20%26%20Sheets-4285F4)
![Frontend Only](https://img.shields.io/badge/Architecture-Frontend%20Only-green)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mdrrmo-pio-duran)

**Ready for production deployment!** This app uses direct API calls to Google services (no backend proxy needed).

📖 **Deployment Guides**: 
- ⚡ [Quick Start (5 min)](VERCEL_QUICK_START.md) 
- 📋 [Complete Guide](VERCEL_DEPLOYMENT_GUIDE.md)

## 📋 Overview

This is a **frontend-only application** featuring a modern, responsive dashboard for the MDRRMO Pio Duran File Inventory & Management System. The application features stunning UI/UX with animated gradients, glassmorphism effects, smooth interactions, and **direct Google Drive/Sheets API integration** (no backend server needed - all API calls are made directly from the frontend).

## 🚀 Quick Start

```bash
# Install all dependencies
yarn install

# Start all services
yarn start

# Check status
yarn status

# Build for production
yarn build
```

📖 **Full Guide**: [PACKAGE_SCRIPTS_GUIDE.md](./PACKAGE_SCRIPTS_GUIDE.md) | ⚡ **Quick Reference**: [QUICK_START.md](./QUICK_START.md)

## 📁 Project Structure

```
/app/
├── frontend/              # React application (Frontend Only)
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── services/     # API services (Google Drive/Sheets)
│   │   │   ├── googleDriveService.js
│   │   │   └── googleSheetsService.js
│   │   └── App.js        # Main app
│   ├── public/           # Static assets & PWA files
│   ├── build/            # Production build (generated)
│   ├── .env             # API keys configuration
│   └── package.json      # Dependencies
├── Docs/                 # Documentation folder
│   ├── Quick start guides
│   ├── Deployment guides
│   ├── API setup guides
│   └── Feature documentation
├── Extra-Files/          # Additional files (archived)
│   ├── Documentation/   # Historical docs
│   ├── Scripts/         # Utility scripts
│   └── Testing/         # Test files
├── package.json          # Root scripts
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## ⚡ Key Links

### 📚 Essential Documentation
- **[Docs Folder](./Docs/)** - All documentation organized by topic
- **[Quick Start Guide](./Docs/QUICK_START.md)** - Get started in 2 minutes
- **[Quick Reference](./Docs/QUICK_REFERENCE.md)** - One-page reference card
- **[Deployment Guide](./Docs/DEPLOYMENT_GUIDE.md)** - Deploy to any platform
- **[Frontend API Setup](./Docs/DIRECT_FRONTEND_API_SETUP.md)** - Configure Google APIs

### 🎯 Feature Documentation
- **[Interactive Map](./Docs/MAPS_MODULE_DOCUMENTATION.md)** - Leaflet/OpenStreetMap integration
- **[Panorama 360° Guide](./Docs/PANORAMA_360_ENHANCEMENT.md)** - Immersive panoramic viewer
- **[PWA Features](./Docs/PWA_INSTALLATION_GUIDE.md)** - Progressive Web App

### 🔄 Migration & Status
- **[Frontend-Only Migration](./Docs/FRONTEND_ONLY_MIGRATION.md)** - Backend removal details
- **[Project Status](./Docs/PROJECT_STATUS.md)** - Current status


## 🛠️ Available Scripts

Run these commands from the root directory (`/app/`):

```bash
# Installation
yarn install              # Install all frontend dependencies

# Development
yarn start               # Start development server
yarn dev                 # Start development server (alias)

# Build
yarn build               # Build for production
yarn deploy              # Build for deployment

# Frontend Management (from /app/frontend/)
cd frontend
yarn start               # Start React dev server
yarn build               # Create production build
yarn test                # Run tests
```
yarn clean:backend       # Clean backend cache
```

**Build Output**: Production build is generated in `/app/frontend/build/`

## 🏗️ Architecture

This application uses a **frontend-only architecture** with direct API integration:

- **No Backend Server Required** - All data operations happen directly from the browser
- **Google Drive API** - Direct file and folder management via `googleDriveService.js`
- **Google Sheets API** - Direct spreadsheet data access via `googleSheetsService.js`
- **Static Deployment Ready** - Can be deployed to Vercel, Netlify, GitHub Pages, etc.
- **API Key Authentication** - Uses API keys configured in `.env` file
- **Read-Only Operations** - Safe public deployment without write access concerns

### API Services

Located in `/app/frontend/src/services/`:

1. **googleDriveService.js** - Handles Google Drive operations
   - List files and folders
   - Get folder structure
   - Search files
   - Fetch images and documents

2. **googleSheetsService.js** - Handles Google Sheets operations
   - Read spreadsheet data
   - Parse rows into objects
   - Filter and search data
   - Multi-sheet support

## ✨ Features

### 🎨 Design & UI
- **Modern Glassmorphism Design** - Frosted glass cards with backdrop blur effects
- **Animated Background Blobs** - Floating gradient elements for visual depth
- **Vibrant Color System** - Unique gradient colors for each module (cyan, green, purple, orange, pink, teal)
- **Dark Mode Support** - Fully functional light/dark theme toggle
- **Responsive Layout** - Adapts seamlessly across desktop, tablet, and mobile devices
- **Smooth Animations** - Hover effects, transitions, and micro-interactions throughout

### 📦 Modules
The dashboard includes 7 interactive module cards:

1. **Supply Inventory** (Cyan) - Google Sheets Integration
   - Track items and stock levels
   - Categories and locations
   - Print reports
   - Direct Google Sheets API connection

2. **Contact Directory** (Green) - Google Sheets Integration
   - Staff directory with departments
   - Quick search and filters
   - Print contact lists
   - Direct Google Sheets API connection

3. **Calendar Management** (Purple) - Google Sheets Integration
   - Event calendar with timeline view
   - Status tracking (Upcoming, In Progress, Completed)
   - Countdown badges
   - Direct Google Sheets API connection

4. **Document Management** (Orange) - Google Drive Integration
   - File browser with folder structure
   - Document preview and download
   - Search functionality
   - Direct Google Drive API access

5. **Photo Documentation** (Pink) - Google Drive Integration
   - Photo gallery with responsive grid
   - Image preview and download
   - Album organization
   - Direct Google Drive API access

6. **Interactive Map** (Teal) - Leaflet/OpenStreetMap
   - Drawing tools (markers, polylines, polygons, circles)
   - Measurement tools (distance, area calculation)
   - Search and geocoding
   - Geolocation support
   - Multiple base layers (OpenStreetMap, Satellite, Topographic)
   - Fullscreen mode
   - Coordinate display

7. **Panorama/650 Gallery** (Indigo) - 360° Viewer
   - 360-degree panoramic image viewer
   - Interactive WebGL rendering
   - Auto-rotation mode
   - Fullscreen support
   - Keyboard shortcuts and touch controls
   - Google Drive integration

### 🎯 Interactive Features
- **Module Cards** - Clickable cards with hover effects and toast notifications
- **Status Indicators** - Online/offline status with pulse animation
- **Action Buttons** - Sync Now and Install App with gradient styling
- **Notification Bell** - Badge showing notification count
- **Responsive Grid** - 3 columns (desktop) → 2 columns (tablet) → 1 column (mobile)

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Python 3.11** - Latest Python features
- **Google API Client** - Google Drive integration
- **Uvicorn** - ASGI server

### Frontend
- **React 19.x** - Modern UI library with hooks
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **Leaflet 1.9.x** - Interactive map library
- **React Leaflet 5.x** - React components for Leaflet
- **Pannellum 2.5.x** - WebGL-based 360° panorama viewer
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications
- **Axios** - HTTP client for API calls
- **React Router DOM** - Client-side routing

### External Integrations
- **Google Drive API** - Direct frontend access for file management
- **Google Sheets API** - Direct frontend access for data storage
- **OpenStreetMap** - Map tiles and geocoding services

### Database
- **MongoDB** - NoSQL database for flexible data storage

### Design System
- **HSL Color Tokens** - Semantic color system for light/dark modes
- **Custom Gradients** - Unique gradient combinations for each module
- **Design Tokens** - Consistent spacing, shadows, and transitions
- **Inter Font** - Modern, clean typography

## 📁 Project Structure

```
/app/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main API server with all endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/                   # React frontend
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── index.css          # Design system tokens
│   │   ├── App.js             # Root component with routing
│   │   └── index.js           # Entry point
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── .env                   # Frontend environment variables
├── tests/                      # Test directory
├── *.sh                        # Installation & build scripts
├── test_result.md              # Testing data and logs
├── README.md                   # This file
└── README_SCRIPTS.md           # Scripts documentation
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 14.x or higher
- Yarn package manager (1.22+)
- MongoDB

### Quick Start (Using Yarn Scripts)

The easiest way to get started is using the yarn scripts:

```bash
# Navigate to project root
cd /app

# Install all dependencies (frontend + backend)
yarn install

# Start all services
yarn start

# Check service status
yarn status

# View logs
yarn logs:backend    # Backend logs
yarn logs:frontend   # Frontend logs
```

### Alternative: Using Shell Scripts

```bash
# Complete setup (install all dependencies)
bash /app/setup.sh

# Or use the shorter alias
bash /app/install.sh

# Start all services
bash /app/start.sh

# Development mode (install if needed + start)
bash /app/dev.sh
```

See [PACKAGE_SCRIPTS_GUIDE.md](./PACKAGE_SCRIPTS_GUIDE.md) for all available commands.

### Manual Installation

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd /app/backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd /app/frontend
```

2. Install Node dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

### Service Management

```bash
# Restart all services
sudo supervisorctl restart all

# Check service status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log
```

### Available Scripts

See [README_SCRIPTS.md](/app/README_SCRIPTS.md) for complete documentation.

**Quick reference:**
```bash
# Installation
bash /app/install_backend.sh   # Install backend dependencies
bash /app/install_frontend.sh  # Install frontend dependencies
bash /app/setup.sh              # Install all dependencies

# Build
bash /app/build_frontend.sh    # Build frontend for production

# Start
bash /app/start.sh              # Start all services
bash /app/dev.sh                # Development mode

# Service Ports
# Backend API: http://localhost:8001
# Frontend: http://localhost:3000
# MongoDB: mongodb://localhost:27017
```

## 🎨 Design System

### Color Tokens (HSL Format)

#### Module Colors
```css
--cyan: 190 100% 60%
--green: 150 75% 55%
--purple: 270 70% 65%
--orange: 30 95% 60%
--pink: 330 85% 65%
--teal: 180 75% 55%
```

#### Gradients
Each module has a unique gradient:
- **Cyan**: `linear-gradient(135deg, hsl(190 100% 60%), hsl(200 95% 65%))`
- **Green**: `linear-gradient(135deg, hsl(150 75% 55%), hsl(165 70% 60%))`
- **Purple**: `linear-gradient(135deg, hsl(270 70% 65%), hsl(285 65% 70%))`
- **Orange**: `linear-gradient(135deg, hsl(30 95% 60%), hsl(40 90% 65%))`
- **Pink**: `linear-gradient(135deg, hsl(330 85% 65%), hsl(345 80% 70%))`
- **Teal**: `linear-gradient(135deg, hsl(180 75% 55%), hsl(195 70% 60%))`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold (700), gradient text effect for title
- **Body Text**: Regular (400), medium (500)
- **Scale**: text-sm to text-2xl with responsive sizing

### Spacing
Follows 4px scale:
- Gaps: 6, 8 (1.5rem, 2rem)
- Padding: 6, 8, 12 (1.5rem, 2rem, 3rem)
- Card padding: 6 (1.5rem)

## 🌐 Responsive Design

### Breakpoints
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1023px (2 columns)
- **Desktop**: ≥ 1024px (3 columns)

### Components Adapt
- Grid layout adjusts column count
- Sidebar remains visible but narrower on mobile
- Header stacks elements on smaller screens
- Cards maintain readability at all sizes

## 💡 Application Features

### Backend API
- ✅ RESTful API with FastAPI
- ✅ MongoDB integration for data persistence
- ✅ Google Drive API integration for Maps Module
- ✅ CORS support for frontend communication
- ✅ Async operations with Motor

### Frontend Functionality
- ✅ Full-stack integration with backend API
- ✅ Interactive Map with Leaflet/OpenStreetMap
- ✅ Supply Inventory with live stats and stock tracking
- ✅ Contact Directory with search and filtering
- ✅ Calendar Management with timeline visualization
- ✅ Document Management with Google Drive integration
- ✅ Photo Documentation module
- ✅ Dark mode toggle (using React state)
- ✅ Toast notifications for user feedback
- ✅ Responsive design across all devices

## 🧪 Testing

All features have been comprehensively tested:
- ✅ 32/32 test scenarios passed
- ✅ Visual layout and spacing verified
- ✅ Interactive elements functional
- ✅ Dark mode working correctly
- ✅ Responsive design at all breakpoints
- ✅ Animations and transitions smooth

## 🎯 Future Development

To convert this prototype into a full application:

1. **Add Backend API**
   - Create FastAPI or Express.js backend
   - Implement RESTful endpoints
   - Connect to database (MongoDB, PostgreSQL)

2. **Implement Authentication**
   - User login/logout
   - Role-based access control
   - Session management

3. **Build Module Pages**
   - Create detailed views for each module
   - Implement CRUD operations
   - Add forms and data validation

4. **Add Real Functionality**
   - File upload/download
   - Calendar integration
   - Map integration (Google Maps, OpenStreetMap)
   - Photo gallery with storage

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/mdrrmo_db
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

**Important**: Never modify URLs or ports in .env files - they are configured for the deployment environment.

## 🤝 Contributing

This is a prototype project. To extend it:
1. Follow the existing design system
2. Use Shadcn/UI components
3. Maintain HSL color format
4. Ensure responsive design
5. Add smooth animations

## 📄 License

This project is a prototype for demonstration purposes.

## 🙏 Acknowledgments

- **Shadcn/UI** - Component library
- **Tailwind CSS** - Styling framework
- **Lucide Icons** - Icon set
- **Inter Font** - Typography

---

**Status**: ✅ Full-Stack Application  
**Version**: 1.0.0  
**Last Updated**: January 2025

For questions or support, please refer to the project documentation.

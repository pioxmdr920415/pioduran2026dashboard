# MDRRMO Pio Duran - File Inventory & Management System

A beautiful, modern frontend prototype for a file inventory and management system dashboard.

![Dashboard Preview](https://img.shields.io/badge/Status-Frontend%20Prototype-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8)

## 📋 Overview

This is a **full-stack application** featuring a modern, responsive dashboard for the MDRRMO Pio Duran File Inventory & Management System. The application features stunning UI/UX with animated gradients, glassmorphism effects, smooth interactions, and robust backend API integration with MongoDB.

## ⚡ Quick Links

- **[Installation Scripts Documentation](README_SCRIPTS.md)** - Complete guide to setup scripts
- **[Interactive Map Documentation](MAPS_MODULE_DOCUMENTATION.md)** - Leaflet/OpenStreetMap integration
- **[Design Enhancements](DESIGN_ENHANCEMENTS.md)** - UI/UX improvements

## ✨ Features

### 🎨 Design & UI
- **Modern Glassmorphism Design** - Frosted glass cards with backdrop blur effects
- **Animated Background Blobs** - Floating gradient elements for visual depth
- **Vibrant Color System** - Unique gradient colors for each module (cyan, green, purple, orange, pink, teal)
- **Dark Mode Support** - Fully functional light/dark theme toggle
- **Responsive Layout** - Adapts seamlessly across desktop, tablet, and mobile devices
- **Smooth Animations** - Hover effects, transitions, and micro-interactions throughout

### 📦 Modules
The dashboard includes 6 interactive module cards:

1. **Supply Inventory** (Cyan)
   - Track items
   - Stock levels
   - Categories

2. **Contact Directory** (Green)
   - Staff directory
   - Departments
   - Quick search

3. **Calendar Management** (Purple)
   - Event calendar
   - Schedules
   - Planning

4. **Document Management** (Orange)
   - File access
   - Offline support
   - Organization

5. **Photo Documentation** (Pink)
   - Photo gallery
   - Media files
   - Documentation

6. **Interactive Map** (Teal)
   - Interactive Leaflet/OpenStreetMap integration
   - Drawing tools (markers, polylines, polygons, circles)
   - Measurement tools (distance, area calculation)
   - Search and geocoding
   - Geolocation support
   - Multiple base layers (OpenStreetMap, Satellite, Topographic)
   - Fullscreen mode
   - Coordinate display

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
- **Shadcn/UI** - High-quality React components
- **Leaflet** - Interactive map library
- **React Leaflet** - React components for Leaflet
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications

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
- Node.js 16.x or higher
- Yarn package manager
- MongoDB

### Quick Start (Using Scripts)

The easiest way to get started is using the automated scripts:

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

## 💡 Mock Data & Interactions

This is a **frontend-only prototype** with mock functionality:

### Mock Features
- ✅ Module data stored in `Dashboard.jsx` component
- ✅ Dark mode toggle (using React state)
- ✅ Toast notifications for button clicks
- ✅ Online status indicator (mock state)
- ✅ All UI interactions work without backend

### What's NOT Included
- ❌ No backend API
- ❌ No database integration
- ❌ No actual data persistence
- ❌ No authentication system

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

Current `.env` configuration:
```env
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

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

**Status**: ✅ Frontend Prototype Complete  
**Version**: 1.0.0  
**Last Updated**: January 2024

For questions or support, please refer to the project documentation.

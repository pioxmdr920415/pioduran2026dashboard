# 🎯 MDRRMO Pio Duran - Quick Overview

## ✅ What This Is

A **frontend-only** file inventory and management system for MDRRMO Pio Duran with direct Google Drive and Google Sheets integration.

---

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Build for production
yarn build
```

**App runs on:** http://localhost:3000

---

## 📂 Project Structure

```
/app/
├── frontend/           ← Main React app (all you need!)
├── Docs/              ← Documentation (guides & references)
├── Extra-Files/       ← Archived files (optional)
├── package.json       ← Root scripts
├── vercel.json        ← Deployment config
└── README.md          ← Full documentation
```

---

## 📚 Documentation

All guides are in the **`/app/Docs/`** folder:

### 🎯 Getting Started
- [Quick Start](./Docs/QUICK_START.md) - 2-minute setup
- [Quick Reference](./Docs/QUICK_REFERENCE.md) - One-page guide

### ⚙️ Setup
- [API Setup](./Docs/DIRECT_FRONTEND_API_SETUP.md) - Configure Google APIs
- [Google Drive Setup](./Docs/GOOGLE_DRIVE_SETUP_GUIDE.md)

### 🌐 Deployment
- [Deployment Guide](./Docs/DEPLOYMENT_GUIDE.md) - All platforms
- [Vercel Quick Start](./Docs/VERCEL_QUICK_START.md) - 5-minute deploy

### 📖 Features
- [Maps Module](./Docs/MAPS_MODULE_DOCUMENTATION.md)
- [360° Panorama](./Docs/PANORAMA_360_ENHANCEMENT.md)
- [PWA Features](./Docs/PWA_INSTALLATION_GUIDE.md)

---

## 🔑 Configuration

Edit `/app/frontend/.env`:

```env
REACT_APP_GOOGLE_DRIVE_API_KEY=your_api_key
REACT_APP_GOOGLE_SHEETS_API_KEY=your_api_key
REACT_APP_GOOGLE_SHEET_ID=your_sheet_id
```

Get API keys: https://console.cloud.google.com/

---

## ✨ Features

**7 Interactive Modules:**
1. ✅ Supply Inventory (Google Sheets)
2. ✅ Contact Directory (Google Sheets)
3. ✅ Calendar Management (Google Sheets)
4. ✅ Document Management (Google Drive)
5. ✅ Photo Documentation (Google Drive)
6. ✅ Interactive Map (Leaflet/OpenStreetMap)
7. ✅ Panorama Gallery (360° viewer)

**Plus:**
- ✅ Dark mode
- ✅ PWA (installable)
- ✅ Responsive design
- ✅ Print reports
- ✅ Search & filter

---

## 🌐 Deploy To

- **Vercel** (2 min) - Recommended
- **Netlify** (3 min)
- **GitHub Pages** (5 min)
- **Firebase Hosting** (5 min)

See [Deployment Guide](./Docs/DEPLOYMENT_GUIDE.md) for details.

---

## 📊 Architecture

**Frontend Only** - No backend or database needed!

```
React App (Browser)
        ↓
Direct API calls
        ↓
Google Services (Drive & Sheets)
```

---

## 💰 Cost

- **Hosting:** $0 (free tier)
- **Google APIs:** $0 (free tier)
- **Total:** $0/month

---

## 🎓 Tech Stack

- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Pannellum** - 360° viewer
- **Google APIs** - Data & files

---

## 📱 Browser Support

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Mobile browsers

---

## 🔗 Quick Links

- [Full README](./README.md) - Complete documentation
- [Documentation Folder](./Docs/) - All guides
- [Project Status](./Docs/PROJECT_STATUS.md) - Current state
- [Migration Info](./Docs/FRONTEND_ONLY_MIGRATION.md) - Architecture details

---

## ❓ Need Help?

1. Check [Docs folder](./Docs/) for guides
2. See [README.md](./README.md) for full details
3. Review [Quick Reference](./Docs/QUICK_REFERENCE.md)

---

**Ready to deploy?** Follow the [Deployment Guide](./Docs/DEPLOYMENT_GUIDE.md)!

**Version:** 1.0.0 (Frontend-Only)  
**Status:** ✅ Production Ready  
**License:** MIT

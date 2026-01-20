# Direct Frontend API Integration - Complete Setup Guide

## Overview

All modules in the MDRRMO Pio Duran application now use **direct frontend API connections** to Google Drive and Google Sheets, bypassing the backend for data fetching. This provides:

- ✅ **Faster data loading** - No backend proxy overhead
- ✅ **Reduced server load** - Backend not involved in data retrieval
- ✅ **Simplified architecture** - Direct client-to-Google API communication
- ✅ **Better error handling** - Clear API key configuration warnings
- ✅ **Real-time data** - Always fetches latest data from Google services

---

## 🔑 Prerequisites

### 1. Google Cloud Console Setup

You need to create API credentials in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable APIs:
   - **Google Drive API** (for file/folder access)
   - **Google Sheets API** (for spreadsheet data)

### 2. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the generated API key
4. **(Recommended)** Restrict the API key:
   - Click on the key to edit
   - Under **API restrictions**, select "Restrict key"
   - Enable only: Google Drive API, Google Sheets API
   - Under **Website restrictions**, add your domain

---

## 📝 Configuration

### Frontend Environment Variables

Add these to `/app/frontend/.env`:

```bash
# Google Drive API Key (for files/folders)
REACT_APP_GOOGLE_DRIVE_API_KEY=YOUR_API_KEY_HERE

# Google Sheets API Key (can use same key as Drive)
REACT_APP_GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE

# Google Sheet ID for data storage
REACT_APP_GOOGLE_SHEET_ID=1UtT9t2LZ5NEc-wbGv44mDeDjWLxOLBQHA5yy6jiLc7E
```

**Note**: You can use the **same API key** for both Drive and Sheets since they're from the same Google Cloud project.

### Current Configuration

The `.env` file currently has:
```bash
REACT_APP_GOOGLE_DRIVE_API_KEY=AIzaSyCDcthLGNPlbMr4AFzuK5tl0CMTzsQI9EI
REACT_APP_GOOGLE_SHEETS_API_KEY=AIzaSyCDcthLGNPlbMr4AFzuK5tl0CMTzsQI9EI
```

---

## 🗂️ Module Integration Status

### Modules Using Google Sheets (Direct Frontend)

| Module | Status | Data Source | Features |
|--------|--------|-------------|----------|
| **Supply Inventory** | ✅ Active | Google Sheets (supply tab) | Read-only, Live stats, Search |
| **Contact Directory** | ✅ Active | Google Sheets (contact tab) | Read-only, Card grid, Search |
| **Calendar Management** | ✅ Active | Google Sheets (event tab) | Read-only, Timeline view, Filter by status |

### Modules Using Google Drive (Direct Frontend)

| Module | Status | Data Source | Features |
|--------|--------|-------------|----------|
| **Document Management** | ✅ Active | Google Drive folders | Browse folders, View files, Download |
| **Photo Documentation** | ✅ Active | Google Drive folders | Image gallery, Preview, Download |
| **Maps Module** | ✅ Active | Google Drive folders | Category-based browsing, Map file viewer |
| **Panorama/650 Gallery** | ✅ Active | Google Drive folder | Image grid, Search, Full-screen preview |

### Special Modules

| Module | Status | Integration | Notes |
|--------|--------|-------------|-------|
| **Interactive Map** | ✅ Active | Leaflet/OpenStreetMap | No Google integration needed |
| **Dashboard** | ✅ Active | N/A | Navigation hub for all modules |

---

## 🔧 Services Implementation

### 1. Google Sheets Service
**Location**: `/app/frontend/src/services/googleSheetsService.js`

**Functions**:
- `isApiKeyConfigured()` - Check if API key is set
- `getSheetData(sheetName)` - Get data from any sheet tab
- `getSupplyItems()` - Get supply inventory data
- `getContactItems()` - Get contact directory data
- `getEventItems()` - Get calendar events data
- `searchInSheet(sheetName, term)` - Search within a sheet
- `getMultipleSheets([names])` - Batch fetch multiple sheets

**Example Usage**:
```javascript
import { getSupplyItems, isApiKeyConfigured } from '../services/googleSheetsService';

// Check configuration
if (!isApiKeyConfigured()) {
  console.error('API key not configured');
  return;
}

// Fetch data
const supplies = await getSupplyItems();
console.log(`Loaded ${supplies.length} items`);
```

### 2. Google Drive Service
**Location**: `/app/frontend/src/services/googleDriveService.js`

**Functions**:
- `isApiKeyConfigured()` - Check if API key is set
- `listFilesInFolder(folderId)` - Get all files in a folder
- `getFolderStructure(folderId)` - Get nested folder structure
- `searchFilesInFolder(folderId, term)` - Search files in folder
- `getImagesFromFolder(folderId)` - Get only image files
- `getFoldersInFolder(folderId)` - Get subfolders
- `getFileMetadata(fileId)` - Get detailed file info

**Example Usage**:
```javascript
import { listFilesInFolder, isApiKeyConfigured } from '../services/googleDriveService';

// Check configuration
if (!isApiKeyConfigured()) {
  console.error('API key not configured');
  return;
}

// Fetch files
const files = await listFilesInFolder('FOLDER_ID_HERE');
console.log(`Found ${files.length} files`);
```

---

## 🎨 UI/UX Features

### Connection Status Banners

All modules now display connection status banners:

**✅ Connected State** (Green):
```
🌥️ Connected to Google Sheets/Drive
Data is being fetched directly from Google services
```

**⚠️ Not Configured State** (Amber):
```
☁️ Google API Key Not Configured
Please add REACT_APP_GOOGLE_SHEETS_API_KEY to your .env file
```

### Visual Indicators

- **Gradient animations** on header text
- **Stat cards** showing live counts
- **Shimmer effects** on card hover
- **Pulse animations** for important states
- **Loading spinners** during data fetch
- **Toast notifications** for all operations

---

## 🔐 Google Sheet Permissions

### For Direct Frontend Access (API Key)

The Google Sheet must be **publicly accessible** or **shared with anyone with the link**:

1. Open the Google Sheet
2. Click **Share** button
3. Change access to **"Anyone with the link"** → **Viewer**
4. This allows API key authentication to read data

### Sheet Structure

The application expects these tabs in the Google Sheet:

| Tab Name | Columns | Purpose |
|----------|---------|---------|
| **supply** | itemName, category, quantity, unit, location, status | Supply inventory items |
| **contact** | name, position, department, phone, email | Contact directory |
| **event** | eventTask, date, time, location, status | Calendar events |

---

## 🔐 Google Drive Permissions

### For Direct Frontend Access (API Key)

Each Google Drive folder must be **publicly accessible**:

1. Right-click folder in Google Drive
2. Click **Share** → **Get link**
3. Change to **"Anyone with the link"** → **Viewer**
4. Copy the folder ID from the URL

### Folder IDs Configuration

Backend `.env` has folder IDs (for reference):
```bash
# Maps Module Folders
MAPS_ADMINISTRATIVE_FOLDER_ID=1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi
MAPS_TOPOGRAPHIC_FOLDER_ID=1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2
MAPS_HAZARD_FOLDER_ID=16xy_oUAr6sWb3JE9eNrxYJdAMDRKGYLn
MAPS_MGB_FOLDER_ID=1yQmtrKfKiMOFA933W0emzeGoexMpUDGM
MAPS_MPDC_FOLDER_ID=1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1

# Other Folders
DRIVE_FOLDER_ID=15_xiFeXu_vdIe2CYrjGaRCAho2OqhGvo
PHOTOS_FOLDER_ID=1O1WlCjMvZ5lVcrOIGNMlBY4ZuQ-zEarg
```

---

## 📊 Data Flow Architecture

### Before (Backend Proxy)
```
Frontend → Backend API → Service Account → Google Sheets/Drive → Backend → Frontend
```
**Issues**: Double network calls, backend bottleneck, service account authentication issues

### Now (Direct Frontend)
```
Frontend → Google Sheets/Drive API (with API Key) → Frontend
```
**Benefits**: Single network call, no backend involved, faster response

---

## ⚠️ Limitations

### 1. Read-Only Access with API Key

API Key authentication provides **read-only** access. For write operations (add/edit/delete):

- **Option A**: Use backend API with service account (current backend endpoints still available)
- **Option B**: Implement OAuth 2.0 for user authentication (not implemented)

### 2. Rate Limits

Google API has rate limits:
- **Sheets API**: 100 read requests per 100 seconds per user
- **Drive API**: 1000 queries per 100 seconds per user

For high-traffic applications, consider:
- Implementing client-side caching
- Debouncing search requests
- Using backend proxy for write operations

### 3. Security Considerations

- API keys are visible in frontend code/network requests
- **Never commit real API keys to public repositories**
- Use environment variables
- Restrict API keys to specific domains in Google Cloud Console
- For production, consider OAuth 2.0 or backend proxy

---

## 🧪 Testing

### 1. Test API Key Configuration

```bash
# From browser console on the app
import { isApiKeyConfigured } from './services/googleSheetsService';
console.log('Sheets API configured:', isApiKeyConfigured());

import { isApiKeyConfigured as isDriveConfigured } from './services/googleDriveService';
console.log('Drive API configured:', isDriveConfigured());
```

### 2. Test Data Fetching

Navigate to each module and check:
- ✅ Connection banner shows "Connected to Google Sheets/Drive"
- ✅ Data loads successfully
- ✅ Search/filter functions work
- ✅ Toast notifications appear
- ✅ Loading states display correctly

### 3. Test Error Handling

Remove API key from `.env` and restart:
```bash
REACT_APP_GOOGLE_SHEETS_API_KEY=
```

Expected behavior:
- ⚠️ Warning banner appears
- ❌ Data fails to load with error message
- 📝 Toast notification explains the issue

---

## 🔄 Migration from Backend API

If you want to switch back to backend API (not recommended):

1. **Supply Inventory**: Change imports from `googleSheetsService` to `axios`
2. **Contact Directory**: Change imports from `googleSheetsService` to `axios`
3. **Calendar Management**: Change imports from `googleSheetsService` to `axios`
4. Replace `getSupplyItems()` with `axios.get(BACKEND_URL + '/api/supply/items')`
5. Same pattern for other modules

**Note**: Backend endpoints are still functional and can be used for write operations.

---

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Rate Limits & Quotas](https://developers.google.com/sheets/api/limits)

---

## 🆘 Troubleshooting

### Issue: "API key not configured" error

**Solution**: Add `REACT_APP_GOOGLE_SHEETS_API_KEY` and `REACT_APP_GOOGLE_DRIVE_API_KEY` to `/app/frontend/.env`

### Issue: "Permission denied" or "404 Not Found"

**Solution**: 
1. Verify Google Sheet/Drive folder is shared publicly
2. Check folder IDs are correct
3. Ensure APIs are enabled in Google Cloud Console

### Issue: "Daily limit exceeded"

**Solution**: 
1. Check API quota in Google Cloud Console
2. Implement caching in frontend
3. Use backend proxy for high-traffic operations

### Issue: CORS errors

**Solution**: 
1. Ensure API key has proper restrictions in Google Cloud Console
2. Add your domain to allowed origins
3. For local development, API key should not have domain restrictions

---

## ✅ Restart Services

After making changes to `.env`:

```bash
# Restart frontend to load new environment variables
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status frontend
```

---

## 📋 Summary

✅ **All modules now use direct frontend API connections**
✅ **Google Sheets modules**: Supply Inventory, Contact Directory, Calendar Management
✅ **Google Drive modules**: Document Management, Photo Documentation, Maps, Panorama
✅ **Clear UI indicators** showing connection status
✅ **Read-only access** via API key (write operations available via backend)
✅ **Comprehensive error handling** and user feedback
✅ **No backend dependency** for data fetching

**Next Steps**:
1. Verify API keys are configured in `.env`
2. Test all modules to ensure data loads
3. Check connection banners display correctly
4. Enjoy faster, more responsive data loading! 🚀

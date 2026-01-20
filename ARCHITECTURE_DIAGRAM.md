# Application Architecture - Direct API Integration

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MDRRMO Pio Duran                            │
│                 File Inventory & Management System                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
│                      Port 3000 (Development)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Dashboard     │  │   Supply        │  │   Contact       │  │
│  │   Component     │  │   Inventory     │  │   Directory     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │            │
│           └────────────────────┼─────────────────────┘            │
│                                │                                  │
│  ┌─────────────────┐  ┌────────┴────────┐  ┌─────────────────┐  │
│  │   Calendar      │  │   Document      │  │   Photo         │  │
│  │   Management    │  │   Management    │  │   Documentation │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │            │
│           └────────────────────┼─────────────────────┘            │
│                                │                                  │
│  ┌─────────────────┐  ┌────────┴────────┐  ┌─────────────────┐  │
│  │   Map           │  │   Interactive   │  │   Panorama      │  │
│  │   Management    │  │   Map (Leaflet) │  │   Gallery       │  │
│  └────────┬────────┘  └─────────────────┘  └────────┬────────┘  │
│           │                                           │            │
│           └───────────────────────────────────────────┘            │
│                                │                                  │
├────────────────────────────────┼──────────────────────────────────┤
│                      SERVICE LAYER                                │
├────────────────────────────────┼──────────────────────────────────┤
│                                │                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  googleDriveService.js (Direct Google Drive API)         │    │
│  │  ✓ listFilesInFolder()                                   │    │
│  │  ✓ getFolderStructure()                                  │    │
│  │  ✓ getImagesFromFolder()                                 │    │
│  │  ✓ searchFilesInFolder()                                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  googleSheetsService.js (Direct Google Sheets API)       │    │
│  │  ✓ getSupplyItems()                                      │    │
│  │  ✓ getContactItems()                                     │    │
│  │  ✓ getEventItems()                                       │    │
│  │  ✓ getSheetData()                                        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ HTTPS (Direct API Calls)
                                │ API Keys: Read-Only Access
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Google Drive  │     │ Google Sheets │     │ OpenStreetMap │
│     API       │     │      API      │     │  (Leaflet)    │
├───────────────┤     ├───────────────┤     ├───────────────┤
│ Documents     │     │ Supply Data   │     │ Map Tiles     │
│ Photos        │     │ Contact Data  │     │ Geocoding     │
│ Maps          │     │ Event Data    │     │ Map Tools     │
│ Panorama      │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI) - OPTIONAL                     │
│                         Port 8001                                   │
├─────────────────────────────────────────────────────────────────────┤
│  • MongoDB Connection (available but not used for main data)       │
│  • Legacy endpoints (kept for backwards compatibility)             │
│  • NOT USED for data fetching in current architecture              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │   MongoDB     │
                        │   Database    │
                        └───────────────┘
```

---

## 🔄 Data Flow Diagram

### Read Operations (All Modules):

```
User Action (View/Search/Filter)
        │
        ▼
React Component
        │
        ▼
Service Layer (googleDriveService.js / googleSheetsService.js)
        │
        ▼
Direct HTTPS API Call
        │
        ▼
Google Cloud Services (Drive API / Sheets API)
        │
        ▼
Response Data (JSON)
        │
        ▼
React Component State Update
        │
        ▼
UI Render / Display
```

### No Backend Proxy:

```
❌ OLD FLOW (Removed):
Frontend → axios → Backend API → Google Service Account → Google Services

✅ NEW FLOW (Current):
Frontend → Direct API Call → Google Services (with API Key)
```

---

## 📊 Module-to-Service Mapping

| Module | Service Used | Google Service | Data Source |
|--------|--------------|----------------|-------------|
| Supply Inventory | googleSheetsService | Sheets API | Tab: 'supply' |
| Contact Directory | googleSheetsService | Sheets API | Tab: 'contact' |
| Calendar Management | googleSheetsService | Sheets API | Tab: 'event' |
| Document Management | googleDriveService | Drive API | Folder: Documents |
| Photo Documentation | googleDriveService | Drive API | Folder: Photos |
| Map Management | googleDriveService | Drive API | Folder: Maps |
| Panorama Gallery | googleDriveService | Drive API | Folder: Panorama |
| Interactive Map | Leaflet (client-side) | OpenStreetMap | OSM Tiles |

---

## 🔐 Authentication Flow

### API Key Based Authentication (Current):

```
1. API Key stored in .env file
   REACT_APP_GOOGLE_DRIVE_API_KEY
   REACT_APP_GOOGLE_SHEETS_API_KEY

2. Service layer reads API key from environment
   const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;

3. API key appended to every request
   url.searchParams.append('key', API_KEY);

4. Google validates API key and returns data
   - Read-only access
   - No user authentication required
   - Restricted by domain/IP in Cloud Console

5. Data returned to frontend
   - No backend proxy
   - Direct response handling
```

---

## 🎯 Architecture Benefits

### 1. **Simplified Stack**
```
Before: Browser → React → FastAPI → Service Account → Google APIs
After:  Browser → React → Google APIs (Direct)
```

### 2. **Reduced Latency**
- Eliminated backend proxy hop
- Direct connection to Google services
- Faster response times

### 3. **Better Reliability**
- No service account JWT issues
- No backend dependency for data
- Frontend can work independently

### 4. **Easier Maintenance**
- Fewer moving parts
- API keys easier than service accounts
- Clear separation of concerns

### 5. **Cost Effective**
- Reduced backend processing
- Lower server resource usage
- Direct API quotas

---

## 🔧 Component Architecture

```
src/
├── components/
│   ├── Dashboard.jsx                    (Main navigation)
│   ├── SupplyInventory.jsx             → googleSheetsService
│   ├── ContactDirectory.jsx            → googleSheetsService
│   ├── CalendarManagement.jsx          → googleSheetsService
│   ├── DocumentManagement.jsx          → googleDriveService
│   ├── PhotoDocumentation.jsx          → googleDriveService
│   ├── MapManagement.jsx               → googleDriveService
│   ├── PanoramaGallery.jsx             → googleDriveService
│   ├── InteractiveMap.jsx              → Leaflet/OSM
│   └── ui/                             (Reusable UI components)
│
├── services/
│   ├── googleDriveService.js           (Drive API wrapper)
│   └── googleSheetsService.js          (Sheets API wrapper)
│
└── App.js                               (Router & state management)
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Nginx Ingress                      │  │
│  │  - Routes traffic based on path                 │  │
│  │  - /api/* → Backend (Port 8001)                 │  │
│  │  - /* → Frontend (Port 3000)                    │  │
│  └──────────────────┬──────────────────────────────┘  │
│                     │                                  │
│         ┌───────────┴───────────┐                     │
│         │                       │                     │
│         ▼                       ▼                     │
│  ┌─────────────┐         ┌─────────────┐            │
│  │  Frontend   │         │  Backend    │            │
│  │  (React)    │         │  (FastAPI)  │            │
│  │  Port 3000  │         │  Port 8001  │            │
│  └─────────────┘         └──────┬──────┘            │
│         │                       │                     │
│         │                       ▼                     │
│         │                ┌─────────────┐            │
│         │                │  MongoDB    │            │
│         │                │  Port 27017 │            │
│         │                └─────────────┘            │
│         │                                             │
│         └──────────────┐                             │
│                        │                             │
└────────────────────────┼─────────────────────────────┘
                         │
                         │ Direct HTTPS API Calls
                         │ (No backend proxy)
                         │
                         ▼
                ┌────────────────────┐
                │  Google Cloud APIs │
                │  - Drive API       │
                │  - Sheets API      │
                └────────────────────┘
```

---

## 📝 Summary

✅ **Zero Backend Proxy**: All data fetching happens directly from frontend to Google APIs  
✅ **Read-Only Operations**: All modules use API keys for read-only access  
✅ **Simplified Architecture**: Removed unnecessary backend layer for data operations  
✅ **Better Performance**: Direct API calls reduce latency  
✅ **Easier Maintenance**: Fewer components to manage and debug  

**Status**: Production Ready with Direct API Integration

# Maps Module - Quick Reference

## Overview
A comprehensive map management module for the MDRRMO Pio Duran system with 5 distinct map categories and dynamic Google Drive integration.

## Map Categories & Folder IDs

| Category | Google Drive Folder ID |
|----------|----------------------|
| **Administrative Map** | `1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi` |
| **Topographic Map** | `1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2` |
| **Hazard Map** | `16xy_oUAr6sWb3JE9eNrxYJdAMDRKGYLn` |
| **MGB-Map** | `1yQmtrKfKiMOFA933W0emzeGoexMpUDGM` |
| **MPDC-Map** | `1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1` |

## Key Features

### ✅ Navigation
- **Dynamic Sidebar**: Collapsible categories with nested folder trees
- **Recursive Structure**: Unlimited folder depth support
- **Active State**: Visual feedback for selected folders
- **Breadcrumbs**: Current folder path display

### ✅ Functionality
- **Real-time Search**: Filter maps by filename
- **Refresh Sync**: Update content without reload
- **Preview Modal**: Full-screen map viewing
- **File Type Support**: Images (PNG, JPG, etc.) and PDFs
- **Grid Layout**: Responsive 1-3 column display

### ✅ User Experience
- **Loading States**: Smooth skeleton loaders
- **Toast Notifications**: User-friendly feedback
- **Dark Mode**: Full theme support
- **Mobile Responsive**: Works on all screen sizes

## API Endpoints

```
GET  /api/maps/categories           # List all map categories
GET  /api/maps/folders/{folder_id}  # Get folder structure
GET  /api/maps/files/{folder_id}    # Get files in folder
GET  /api/maps/search?query=...     # Search maps
POST /api/maps/upload/{folder_id}   # Upload new map
```

## Files Changed

### Backend
- `/app/backend/server.py` - Added Maps API routes (lines 1055-1244)
- `/app/backend/.env` - Added map folder ID references

### Frontend
- `/app/frontend/src/components/MapManagement.jsx` - New component (486 lines)
- `/app/frontend/src/App.js` - Added Maps route

### Documentation
- `/app/MAPS_MODULE_DOCUMENTATION.md` - Comprehensive guide
- `/app/MAPS_QUICK_REFERENCE.md` - This file

## Usage

1. **Access Module**: Click "Maps" card on dashboard
2. **Select Category**: Click any category in sidebar (e.g., "Administrative Map")
3. **Navigate Folders**: Expand/collapse folders to explore structure
4. **View Maps**: Click on any folder to see its maps in the grid
5. **Preview**: Click "View" button on any map card
6. **Search**: Use search bar to filter by filename
7. **Refresh**: Click refresh button to update content

## Technical Stack

- **Backend**: FastAPI + Google Drive API v3
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast)

## Design System

### Colors
- **Primary**: Teal gradient (`from-teal-500 to-teal-600`)
- **Background**: Multi-gradient (`from-blue-50 via-teal-50 to-cyan-50`)
- **Cards**: White with shadow-lg
- **Text**: Gray-900 (light) / White (dark)

### Components
- **Sidebar**: Sticky, scrollable navigation
- **Map Cards**: Thumbnail, metadata, actions
- **Tree View**: Indented, collapsible folders
- **Preview Modal**: Full-screen image viewer

## Performance

- ⚡ **Lazy Loading**: Folders load only when expanded
- 🚀 **Caching**: Folder structures cached in component state
- 📊 **Pagination**: Supports up to 1000 files per folder
- 🎨 **Optimized Rendering**: Minimal re-renders with useMemo

## Error Handling

- ✅ Backend errors logged and returned with descriptive messages
- ✅ Frontend displays toast notifications for errors
- ✅ Graceful handling of empty folders
- ✅ Loading states prevent duplicate requests

## Status

- **Backend**: ✅ Running (Port 8001)
- **Frontend**: ✅ Running (Port 3000)
- **MongoDB**: ✅ Running
- **API Tests**: ✅ All endpoints responding
- **Compilation**: ✅ No errors

## Next Steps

### Optional Enhancements
1. Upload interface for authorized users
2. Folder creation and management
3. Rename/move/delete operations
4. Batch operations (multi-select)
5. Advanced filtering (date, owner, size)
6. Favorites/bookmarks
7. Shareable links
8. Offline map downloads

## Troubleshooting

### Maps Not Loading
1. Check service account permissions in Google Drive
2. Verify folder IDs in `server.py`
3. Review backend logs: `tail -f /var/log/supervisor/backend.out.log`

### Slow Performance
1. Check Google Drive API quota
2. Verify network connectivity
3. Review folder size (large folders may take time)

### Permission Errors
1. Ensure service account has viewer access to all folders
2. Check `service_account.json` is valid
3. Verify OAuth scopes include Drive API

## Commands

```bash
# Restart backend
sudo supervisorctl restart backend

# Restart frontend  
sudo supervisorctl restart frontend

# Check logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/frontend.out.log

# Test API
curl http://localhost:8001/api/maps/categories
```

---

**Created**: January 19, 2024  
**Status**: ✅ Production Ready  
**Version**: 1.0.0

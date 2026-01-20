# Maps Module Documentation

## Overview
The Maps Module is a comprehensive map management system integrated into the MDRRMO Pio Duran File Inventory & Management System. It provides organized access to various types of maps stored in Google Drive, with an intuitive navigation interface and advanced viewing capabilities.

## Features

### 🗺️ Map Categories
The module supports 5 distinct map categories, each with its own Google Drive folder:

1. **Administrative Map** - Administrative boundaries and divisions
2. **Topographic Map** - Terrain and elevation information
3. **Hazard Map** - Natural hazard zones and risk areas
4. **MGB-Map** - Mines and Geosciences Bureau maps
5. **MPDC-Map** - Municipal Planning and Development Coordinator maps

### 📂 Dynamic Folder Navigation
- **Recursive Folder Tree**: Each category displays its complete folder structure from Google Drive
- **Collapsible/Expandable**: Folders can be expanded or collapsed using accordion-style navigation
- **Active State**: Selected folders are highlighted with visual feedback
- **Nested Navigation**: Support for unlimited folder depth with proper indentation

### 🔍 Search & Filter
- **Real-time Search**: Instantly filter maps by filename
- **Search Across Files**: Find maps quickly across large collections
- **Clear Search**: One-click to clear search and view all maps

### 📊 Map Display
- **Grid Layout**: Responsive grid showing map thumbnails (1-3 columns based on screen size)
- **File Type Badges**: Visual indicators for IMAGE and PDF file types
- **Thumbnail Preview**: High-quality thumbnails for quick identification
- **Metadata Display**: 
  - File name
  - Last modified date
  - File owner
  - File size

### 🔄 Sync & Refresh
- **Refresh Button**: Re-sync folder structure and file list without page reload
- **Loading States**: Smooth loading animations during data fetch
- **Error Handling**: User-friendly error messages via toast notifications

### 👁️ Map Viewing
- **Quick View**: Click any map thumbnail to open in preview modal
- **Full Screen Preview**: Large, detailed view of map images
- **Open in Drive**: Direct link to view/edit in Google Drive
- **Download Support**: Access to original files via Google Drive

## Technical Architecture

### Backend API Endpoints

#### Get Map Categories
```
GET /api/maps/categories
```
Returns all map categories with their folder IDs.

**Response:**
```json
{
  "administrative": {
    "name": "Administrative Map",
    "folder_id": "1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi"
  },
  "topographic": {
    "name": "Topographic Map",
    "folder_id": "1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2"
  },
  ...
}
```

#### Get Folder Structure
```
GET /api/maps/folders/{folder_id}
```
Returns the complete recursive folder structure for a category.

**Response:**
```json
{
  "id": "folder_id",
  "name": "Folder Name",
  "path": "path/to/folder",
  "modifiedTime": "2024-01-19T10:00:00Z",
  "owner": "Owner Name",
  "children": [
    {
      "id": "subfolder_id",
      "name": "Subfolder Name",
      "children": [...]
    }
  ]
}
```

#### Get Files in Folder
```
GET /api/maps/files/{folder_id}
```
Returns all map files (images and PDFs) in a specific folder.

**Response:**
```json
[
  {
    "id": "file_id",
    "name": "map_file.png",
    "mimeType": "image/png",
    "modifiedTime": "2024-01-19T10:00:00Z",
    "size": "2048576",
    "owner": "Owner Name",
    "webViewLink": "https://drive.google.com/...",
    "thumbnailLink": "https://drive.google.com/...",
    "imageMediaMetadata": {...}
  }
]
```

#### Search Maps
```
GET /api/maps/search?query={search_term}&folder_id={optional_folder_id}
```
Search for maps by filename across all categories or within a specific folder.

#### Upload Map
```
POST /api/maps/upload/{folder_id}
```
Upload a new map file (image or PDF) to a specific folder.

**Request:** multipart/form-data with file attachment

### Frontend Components

#### MapManagement.jsx
Main component managing the entire Maps module interface.

**Key Features:**
- State management for categories, folders, and files
- Dynamic sidebar with collapsible categories
- Responsive grid layout for map display
- Search functionality
- Preview modal integration

#### MapCategory Component
Handles individual map category display and folder tree loading.

**Features:**
- Lazy loading of folder structure
- Collapsible accordion interface
- Loading states and error handling

#### FolderTreeNode Component
Recursive component for displaying nested folder structures.

**Features:**
- Recursive rendering of folder children
- Visual indentation based on nesting level
- Expand/collapse functionality
- Active state highlighting
- Folder icons (open/closed)

### Styling & Design

#### Color Scheme
- Primary: Teal gradient (from-teal-500 to-teal-600)
- Accent: Cyan tones
- Background: Multi-gradient (blue-50 via-teal-50 to-cyan-50)

#### Component Styling
- **Cards**: White background with shadow-lg, hover effects
- **Sidebar**: Sticky positioning, scrollable area
- **Categories**: Gradient buttons with hover states
- **Folders**: Indented tree view with hover highlights
- **Maps Grid**: Responsive 1-3 column layout

#### Dark Mode Support
- Full dark mode compatibility
- Smooth theme transitions
- Proper contrast ratios

## Usage Guide

### Accessing the Maps Module
1. From the dashboard, click on the "Maps" card
2. The Maps Management interface will open

### Navigating Map Categories
1. On the left sidebar, click any category (e.g., "Administrative Map")
2. The category will expand showing its folder structure
3. Click on any folder to view its contents

### Viewing Maps
1. Select a folder from the sidebar
2. Maps will display in the main grid area
3. Click "View" on any map card to open the preview
4. Click "Open in Drive" to view in Google Drive

### Searching for Maps
1. Select a folder containing maps
2. Use the search bar to filter by filename
3. Clear the search with the X button

### Refreshing Content
1. Click the "Refresh" button in the header
2. The current folder's content will reload
3. To refresh folder structure, collapse and re-expand the category

## Google Drive Configuration

### Folder IDs
The module uses predefined Google Drive folder IDs configured in the backend:

```python
MAP_CATEGORIES = {
    "administrative": {
        "name": "Administrative Map",
        "folder_id": "1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi"
    },
    "topographic": {
        "name": "Topographic Map",
        "folder_id": "1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2"
    },
    "hazard": {
        "name": "Hazard Map",
        "folder_id": "16xy_oUAr6sWb3JE9eNrxYJdAMDRKGYLn"
    },
    "mgb": {
        "name": "MGB-Map",
        "folder_id": "1yQmtrKfKiMOFA933W0emzeGoexMpUDGM"
    },
    "mpdc": {
        "name": "MPDC-Map",
        "folder_id": "1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1"
    }
}
```

### Permissions Required
The service account must have:
- Read access to all map category folders
- Access to view folder structures recursively
- Permission to read file metadata and thumbnails

### Supported File Types
- **Images**: PNG, JPG, JPEG, GIF, BMP, WEBP, SVG, TIFF, HEIC, HEIF
- **Documents**: PDF (for map documents)

## Performance Considerations

### Lazy Loading
- Folder structures are loaded only when categories are expanded
- Prevents unnecessary API calls on initial load
- Improves perceived performance

### Caching Strategy
- Folder structures are cached in component state
- Re-fetching only occurs when explicitly refreshed
- Reduces API calls and improves responsiveness

### Pagination
- Current implementation loads up to 1000 files per folder
- Can be extended with pagination for very large folders

## Error Handling

### Backend Errors
- Google Drive API errors are logged and returned with appropriate HTTP status codes
- Service account authentication failures are caught and reported
- Invalid folder IDs return 500 errors with descriptive messages

### Frontend Error Handling
- Toast notifications for user-friendly error messages
- Loading states prevent multiple simultaneous requests
- Graceful degradation when folders are empty or inaccessible

## Future Enhancements

### Potential Features
1. **Map Upload**: Direct upload interface for authorized users
2. **Map Editing**: Rename, move, or delete maps
3. **Folder Management**: Create new folders within categories
4. **Batch Operations**: Select and download multiple maps
5. **Map Annotations**: Add notes or markers to maps
6. **Version History**: Track changes to map files
7. **Advanced Filters**: Filter by date, owner, file size, map type
8. **Favorites/Bookmarks**: Mark frequently accessed maps
9. **Sharing**: Generate shareable links for specific maps
10. **Offline Access**: Download maps for offline viewing

### Technical Improvements
1. **Virtual Scrolling**: Handle extremely large file lists
2. **Image Optimization**: Compress thumbnails for faster loading
3. **Progressive Loading**: Load thumbnails progressively
4. **WebSocket Updates**: Real-time updates when files change
5. **Advanced Search**: Full-text search in PDF maps
6. **Map Comparison**: Side-by-side comparison of different maps

## Maintenance

### Updating Folder IDs
To change a category's folder ID:
1. Edit `server.py` in the backend
2. Update the `MAP_CATEGORIES` dictionary
3. Optionally update `.env` file for documentation
4. Restart the backend service

### Adding New Categories
1. Add new entry to `MAP_CATEGORIES` in `server.py`
2. No frontend changes needed - categories are loaded dynamically
3. Restart backend service

### Troubleshooting

#### Maps Not Loading
- Check service account permissions in Google Drive
- Verify folder IDs are correct
- Check backend logs for API errors

#### Thumbnails Not Showing
- Ensure files have thumbnail generation enabled in Google Drive
- Check if file types are supported
- Verify service account has read permissions

#### Slow Performance
- Check network connectivity to Google Drive API
- Review API quota usage
- Consider implementing caching strategies

## API Integration Notes

### Authentication
- Uses Google Service Account credentials
- Credentials stored in `service_account.json`
- Requires proper OAuth scopes for Drive API

### Rate Limits
- Google Drive API has rate limits
- Implement exponential backoff for retries
- Monitor quota usage in Google Cloud Console

### Best Practices
1. Minimize API calls through caching
2. Use batch requests when possible
3. Implement proper error handling
4. Monitor API usage and quotas
5. Keep service account credentials secure

---

## Support & Contact

For issues or questions about the Maps Module:
1. Check backend logs: `/var/log/supervisor/backend.*.log`
2. Check frontend logs in browser console
3. Verify Google Drive API connectivity
4. Review service account permissions

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Module Status**: ✅ Fully Operational

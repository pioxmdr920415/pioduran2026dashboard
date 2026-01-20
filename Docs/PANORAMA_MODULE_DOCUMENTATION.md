# Panorama/650 Gallery Module Documentation

## Overview

The Panorama/650 module is a dedicated image gallery that displays photos from a specific Google Drive folder. It features a modern, responsive design with search capabilities, full-screen previews, and seamless integration with the dashboard's quick access buttons.

## Features

### 🎨 User Interface
- **Modern Gradient Design**: Indigo-purple-pink color scheme with animated background blobs
- **Responsive Grid Layout**: Adapts from 1 to 4 columns based on screen size
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
  - Large Desktop: 4 columns
- **Glassmorphism Effects**: Frosted glass cards with backdrop blur
- **Smooth Animations**: Hover effects, image zoom, and card transitions

### 🖼️ Image Display
- **High-Quality Thumbnails**: Automatic thumbnail generation from Google Drive
- **Image Preview Modal**: Full-screen image viewer with dark overlay
- **Image Metadata**: Display file size, dimensions, and modification date
- **Lazy Loading**: Images load as they come into view for better performance

### 🔍 Search & Filter
- **Real-time Search**: Filter images by filename
- **Instant Results**: Updates grid as you type
- **Search Count**: Shows number of filtered results

### 📊 Statistics Dashboard
Three stat cards showing:
1. **Total Images**: Total count of images in folder
2. **Showing**: Number of currently displayed/filtered images
3. **Folder Name**: Panorama/650 identifier

### 🎯 Interactive Features
- **Image Cards**: Click to open full-screen preview
- **Quick Actions**: View and Download buttons on hover
- **External Links**: Open images in Google Drive
- **Refresh Button**: Reload images from Google Drive
- **Back Button**: Return to dashboard

## Technical Implementation

### Backend API Endpoints

#### Get All Panorama Images
```http
GET /api/panorama/images
```

**Response:**
```json
[
  {
    "id": "google-drive-file-id",
    "name": "image.jpg",
    "mimeType": "image/jpeg",
    "modifiedTime": "2025-01-19T10:30:00Z",
    "size": 2048576,
    "owner": "Owner Name",
    "webViewLink": "https://drive.google.com/...",
    "webContentLink": "https://drive.google.com/...",
    "thumbnailLink": "https://drive.google.com/...",
    "imageMediaMetadata": {
      "width": 1920,
      "height": 1080
    }
  }
]
```

#### Search Panorama Images
```http
GET /api/panorama/search?query=searchterm
```

**Parameters:**
- `query` (string): Search term to filter images by name

**Response:** Same format as Get All Images

### Frontend Component

**Location:** `/app/frontend/src/components/PanoramaGallery.jsx`

**Key Components:**
1. **PanoramaGallery** - Main component with state management
2. **ImageCard** - Individual image card with hover effects
3. **ImagePreviewModal** - Full-screen image viewer
4. **ImageCardSkeleton** - Loading placeholder

**Props:**
- `onBack` (function): Callback to return to dashboard

### Google Drive Integration

**Folder ID:** `1tsbcsTEfg5RLHLJLYXR41avy9SrajsqM`

**Supported Image Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)
- SVG (.svg)
- TIFF (.tiff)
- HEIC/HEIF (.heic, .heif)

### Dashboard Integration

**Quick Access Button:**
- Location: Dashboard quick access panel (6th button)
- Icon: Image icon
- Gradient: Indigo (from-indigo-500 to-indigo-600)
- Click Action: Navigates to PanoramaGallery component

**Routing:**
- Module ID: `panorama`
- Route Handler: App.js `renderView()` function
- Navigation: `onOpenModule('panorama')`

## Usage

### Accessing the Module

1. Open the dashboard
2. Locate the "Quick Access" section
3. Click on the "Panorama" button (indigo gradient, image icon)
4. The panorama gallery will load automatically

### Viewing Images

1. **Grid View**: Browse thumbnails in the responsive grid
2. **Hover Effect**: Hover over an image to see action buttons
3. **Click to Preview**: Click any image card to open full-screen preview
4. **Close Preview**: Click X button or click outside image to close

### Searching Images

1. Use the search bar at the top of the page
2. Type image name or keywords
3. Grid updates automatically with matching images
4. Clear search to show all images

### Downloading Images

1. **From Grid**: Hover over image → Click "Open" button → Opens in Google Drive
2. **From Preview**: Click "Download Original" button in preview modal

## Known Issues

### Google Drive Authentication Error

**Status:** ❌ Critical Issue  
**Error:** `invalid_grant: Invalid JWT Signature`  
**Impact:** Cannot fetch images from Google Drive

**Details:**
- The service account JSON key at `/app/backend/service_account.json` has an invalid/corrupted JWT signature
- This affects ALL Google Drive dependent endpoints (Documents, Photos, Maps, Panorama)
- The UI is fully implemented and ready to display images once authentication is fixed

**Resolution Required:**
1. Access Google Cloud Console
2. Navigate to IAM & Admin → Service Accounts
3. Select the service account
4. Go to Keys tab
5. Create new key (JSON format)
6. Download and replace `/app/backend/service_account.json`
7. Restart backend service: `sudo supervisorctl restart backend`

Once the service account is fixed, the Panorama module will automatically start fetching and displaying images from the configured Google Drive folder.

## Future Enhancements

Potential improvements for future versions:

1. **Bulk Download**: Download multiple images at once
2. **Image Upload**: Add new images directly from the app
3. **Folder Navigation**: Browse subfolders within Panorama/650
4. **Image Editing**: Basic crop, rotate, and filter capabilities
5. **Sharing**: Generate shareable links for images
6. **Tags/Categories**: Organize images with custom tags
7. **Slideshow Mode**: Automatic image rotation
8. **Image Comparison**: Side-by-side image viewer
9. **Favorites**: Mark and filter favorite images
10. **Comments**: Add notes or descriptions to images

## File Structure

```
/app/
├── backend/
│   └── server.py                    # Panorama API endpoints (lines 1260-1343)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── PanoramaGallery.jsx  # Main panorama component
│       │   ├── Dashboard.jsx        # Quick access button integration
│       │   └── App.js               # Routing configuration
└── test_result.md                   # Testing documentation
```

## Dependencies

### Backend
- `fastapi` - API framework
- `google-api-python-client` - Google Drive API
- `google-auth` - Service account authentication
- `motor` - MongoDB async driver

### Frontend
- `react` - UI framework
- `axios` - HTTP client
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `tailwindcss` - Styling

## Testing

### Manual Testing Steps

1. **Navigation Test**
   - Click Panorama button on dashboard
   - Verify navigation to gallery
   - Click Back button
   - Verify return to dashboard

2. **UI Test** (Once auth is fixed)
   - Verify grid layout at different screen sizes
   - Check stat cards display correct counts
   - Test search functionality
   - Verify image cards display properly

3. **Image Preview Test**
   - Click on an image card
   - Verify modal opens with full-size image
   - Test close button and click-outside-to-close
   - Check download button functionality

4. **Search Test**
   - Enter search query
   - Verify filtered results
   - Clear search
   - Verify all images return

### Automated Testing

To test the backend endpoint (once auth is fixed):

```bash
# Test get all images
curl http://localhost:8001/api/panorama/images

# Test search
curl "http://localhost:8001/api/panorama/search?query=test"
```

## Support

For issues or questions:
- Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
- Check frontend logs: `tail -f /var/log/supervisor/frontend.*.log`
- Review test_result.md for latest status updates

## Version History

- **v1.0.0** (2025-01-19)
  - Initial implementation
  - Backend API endpoints created
  - Frontend gallery component with full features
  - Dashboard integration complete
  - Known issue: Google Drive authentication error

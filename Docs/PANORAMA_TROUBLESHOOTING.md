# 🔧 Panorama Viewer Troubleshooting Guide

## Common Issues and Solutions

### Issue: "The file could not be accessed" Error

This error occurs when the panorama image in Google Drive is not properly shared or accessible.

#### Solution: Make Files Publicly Accessible

Follow these steps to fix access issues:

1. **Open Google Drive**
   - Go to [drive.google.com](https://drive.google.com)
   - Navigate to your Panorama/650 folder

2. **Share the Folder or Files**
   - Right-click on the folder or individual files
   - Select "Share" from the menu
   - Or click the Share icon

3. **Change Access Settings**
   - Click on "Change" or "Restricted" at the top
   - Select **"Anyone with the link"**
   - Ensure the permission is set to **"Viewer"** (not Editor)

4. **Save Settings**
   - Click "Copy link" if needed
   - Click "Done" to save

5. **Test the Viewer**
   - Return to the panorama gallery
   - Click on an image to test if it loads now

---

## Understanding the Loading Process

The panorama viewer tries multiple methods to load your image:

1. **Method 1**: Google Drive API with API Key (Recommended)
   - Direct authenticated access
   - Best performance and reliability

2. **Method 2**: Direct Google Drive Viewer
   - Standard Google Drive link format
   - Requires public sharing

3. **Method 3**: CORS Proxy
   - Alternative route through proxy server
   - Slower but may work when others fail

4. **Method 4**: Google User Content
   - Cached version from Google servers
   - Fallback option

If all 4 methods fail, you'll see a detailed error message with instructions.

---

## Best Practices

### For Best Performance:

✅ **DO:**
- Share the entire Panorama folder with "Anyone with the link"
- Use high-resolution equirectangular panoramic images
- Keep files under 20MB for faster loading
- Use JPEG format for better compression

❌ **DON'T:**
- Use "Restricted" or "Private" sharing settings
- Mix regular photos with panoramic images in the same folder
- Use extremely large files (>50MB) as they may time out

---

## File Requirements

### Supported Formats:
- ✅ JPEG/JPG (Recommended)
- ✅ PNG
- ✅ WebP

### Image Type:
- **Equirectangular panoramas** (360° photos)
- Aspect ratio: typically 2:1 (e.g., 8192x4096, 4096x2048)
- Regular photos may not display correctly in 360° view

---

## API Configuration

### Required Environment Variables:

Make sure these are set in `/app/frontend/.env`:

```env
# Google Drive API Key
REACT_APP_GOOGLE_DRIVE_API_KEY=your_api_key_here

# Optional: Google Sheets API Key (for other modules)
REACT_APP_GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### Get API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing one
3. Enable Google Drive API
4. Create credentials → API Key
5. (Optional) Restrict the key to Google Drive API only
6. Copy the key to your `.env` file

---

## Testing Access

### Check if a File is Accessible:

1. Open the image in the gallery
2. Watch for the loading indicator
3. If it shows "Trying method X of 4", it's attempting different loading strategies
4. Success: You'll see the 360° panorama with controls
5. Failure: You'll see detailed error message with steps to fix

### Quick Test:

Try opening a file directly in your browser:
```
https://drive.google.com/file/d/YOUR_FILE_ID/view
```

If you can see it without logging in, it's properly shared!

---

## Advanced Troubleshooting

### Clear Browser Cache:
```
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear cached images and files
3. Refresh the page
```

### Check Browser Console:
```
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for error messages related to CORS or loading
4. Share these with support if needed
```

### Network Issues:
- Ensure you have stable internet connection
- Try different browser (Chrome, Firefox, Safari)
- Disable browser extensions that may block requests
- Check if firewall/proxy is blocking Google APIs

---

## Features & Controls

Once the panorama loads successfully:

### Mouse Controls:
- **Drag**: Look around in 360°
- **Scroll**: Zoom in/out
- **Double-click**: Reset view

### Keyboard Shortcuts:
- **F**: Toggle fullscreen
- **R**: Toggle auto-rotation
- **ESC**: Close viewer

### Buttons:
- 🔍 **Fullscreen**: Enter/exit fullscreen mode
- 🔄 **Auto-rotate**: Enable/disable automatic rotation
- 🧭 **Reset View**: Return to default position
- ⬇️ **Download**: Open file in Google Drive

---

## Still Having Issues?

### Check These:

1. ✅ Google Drive API key is correctly set in `.env`
2. ✅ Files are shared with "Anyone with the link"
3. ✅ Images are in equirectangular panoramic format
4. ✅ Browser allows loading content from Google APIs
5. ✅ Internet connection is stable

### Get Help:

- Review the [Panorama Module Documentation](./PANORAMA_MODULE_DOCUMENTATION.md)
- Check the [Google Drive Setup Guide](./GOOGLE_DRIVE_SETUP_GUIDE.md)
- Look at [Direct Frontend API Setup](./DIRECT_FRONTEND_API_SETUP.md)

---

## Success Indicators

You'll know everything is working when:

✅ Images load in the gallery with thumbnails
✅ Clicking an image shows "Opening 360° Panorama Viewer..." toast
✅ Loading indicator appears with smooth animation
✅ Panorama loads and you can interact with it
✅ Toast shows "360° Panorama loaded successfully!"
✅ All controls (fullscreen, auto-rotate) work smoothly

---

**Last Updated**: January 2025  
**Version**: 1.0.0

For more help, see the main [README.md](/app/README.md) or other documentation in the `/app/Docs/` folder.

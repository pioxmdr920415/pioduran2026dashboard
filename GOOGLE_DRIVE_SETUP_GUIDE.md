# Google Drive API Setup Guide

This guide will walk you through setting up Google Drive API access for the MDRRMO Pio Duran application using **API Key authentication** (direct frontend connection).

## 🎯 Overview

The application now uses **direct frontend connection** to Google Drive API, bypassing the broken backend service account. This temporary solution allows all Google Drive-dependent modules to function properly.

## 📋 Prerequisites

- A Google Cloud Project
- Google Drive folders with files you want to access
- Admin access to configure API restrictions

## 🔧 Step-by-Step Setup

### Step 1: Create/Access Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name for reference

### Step 2: Enable Google Drive API

1. In Google Cloud Console, navigate to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on **Google Drive API**
4. Click **Enable** button

### Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API key** from the dropdown
4. Your API key will be created and displayed
5. **IMPORTANT**: Copy this key immediately - you'll need it later

### Step 4: Restrict API Key (Recommended for Security)

1. After creating the key, click **RESTRICT KEY** (or click the edit icon next to your key)
2. Under **API restrictions**:
   - Select **Restrict key**
   - Check only **Google Drive API**
3. Under **Application restrictions** (optional but recommended):
   - Select **HTTP referrers (web sites)**
   - Add your domain: `https://repo-setup-37.preview.emergentagent.com/*`
   - For local development, add: `http://localhost:3000/*`
4. Click **Save**

### Step 5: Make Google Drive Folders Public (Important!)

Since we're using API Key (not OAuth), the folders must be publicly accessible:

1. Open Google Drive
2. Right-click on each folder you want to access:
   - Maps folders
   - Panorama/650 folder
   - Document Management folder
   - Photo Documentation folder
3. Click **Share**
4. Click **Change** next to "Restricted"
5. Select **Anyone with the link** can view
6. Click **Done**

**Folder IDs Currently Used:**
- **Maps - Administrative**: `1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi`
- **Maps - Topographic**: `1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2`
- **Maps - Hazard**: `16xy_oUAr6sWb3JE9eNrxYJdAMDRKG`
- **Maps - MGB**: `1yQmtrKfKiMOFA933W0emzeGoexMp`
- **Maps - MPDC**: `1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1`
- **Panorama/650**: `1tsbcsTEfg5RLHLJLYXR41avy9SrajsqM`
- **Documents**: `1SiOmUx8UZN5gdABHxHY2FI4AOz9Jney1` (example)
- **Photos**: `1XiPmUx8UZN5gdABHxHY2FI4AOz9Jney1` (example)

### Step 6: Configure Application

1. Open `/app/frontend/.env` file
2. Find the line:
   ```
   REACT_APP_GOOGLE_DRIVE_API_KEY=YOUR_API_KEY_HERE
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```
   REACT_APP_GOOGLE_DRIVE_API_KEY=AIzaSyC1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m
   ```
4. Save the file

### Step 7: Restart Frontend Service

```bash
sudo supervisorctl restart frontend
```

Wait about 30 seconds for the React app to rebuild, then refresh your browser.

## ✅ Verification

After configuration, verify the setup:

1. **Check Warning Banners**: 
   - Navigate to Maps Management module
   - If configured correctly, you should NOT see the amber warning banner about API key
   - If you see the warning, double-check your .env file

2. **Test Maps Module**:
   - Open Maps Management
   - Click on any map category (e.g., "Administrative Map")
   - Folder structure should load
   - Maps should be displayed

3. **Test Panorama Gallery**:
   - Navigate to Panorama/650 module
   - Images should load from Google Drive
   - You should see a count of images

4. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any errors related to Google Drive API
   - Common errors:
     - `API key not configured` → Check .env file
     - `Invalid API key` → Verify key in Google Cloud Console
     - `Access forbidden` → Make folders publicly accessible

## 🔍 Troubleshooting

### Issue: "Google Drive API Key Not Configured" banner appears

**Solution**: 
- Verify `.env` file has the correct key
- Ensure you've restarted the frontend service
- Clear browser cache and reload

### Issue: API calls return 403 Forbidden

**Solution**:
- Ensure API key has Google Drive API enabled in restrictions
- Verify folders are shared as "Anyone with the link"
- Check if HTTP referrer restrictions match your domain

### Issue: API calls return 400 Bad Request

**Solution**:
- Verify folder IDs are correct
- Check if folders still exist in Google Drive
- Ensure folders haven't been deleted or moved

### Issue: API key working but no files loading

**Solution**:
- Verify folders contain files
- Check folder permissions
- Try accessing folder directly via Drive link

## 📊 Modules Updated

The following modules now use direct Google Drive API:

1. **Maps Management** (`/app/frontend/src/components/MapManagement.jsx`)
   - Folder structure browsing
   - Map file listing
   - All 5 map categories

2. **Panorama/650 Gallery** (`/app/frontend/src/components/PanoramaGallery.jsx`)
   - Image gallery from folder `1tsbcsTEfg5RLHLJLYXR41avy9SrajsqM`
   - Image search and preview

3. **Document Management** (`/app/frontend/src/components/DocumentManagement.jsx`)
   - Document folder browsing
   - File listing

4. **Photo Documentation** (`/app/frontend/src/components/PhotoDocumentation.jsx`)
   - Photo folder browsing
   - Image listing

## 🔐 Security Notes

1. **API Key Protection**:
   - API keys are visible in frontend code
   - Use HTTP referrer restrictions to limit usage
   - Consider OAuth 2.0 for production (more secure)

2. **Folder Permissions**:
   - Current setup requires public folder access
   - Files are accessible to anyone with the link
   - Consider folder-level permissions for sensitive data

3. **Rate Limits**:
   - Google Drive API has quota limits
   - Monitor usage in Google Cloud Console
   - Implement caching if needed

## 🚀 Next Steps

### For Production (Recommended):

1. **Migrate to OAuth 2.0**:
   - Implement user authentication
   - Use Google OAuth for secure access
   - Requires backend implementation

2. **Implement Caching**:
   - Cache folder structures
   - Reduce API calls
   - Improve performance

3. **Add Error Boundaries**:
   - Handle API failures gracefully
   - Provide user-friendly error messages

## 📞 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify all steps in this guide were completed
3. Test with a simple folder first before using production folders
4. Check Google Cloud Console → APIs & Services → Dashboard for quota and errors

## 🔄 Reverting to Backend Service Account

When backend authentication is fixed:

1. Update components to use backend endpoints
2. Remove direct Google Drive API imports
3. Remove API key from .env
4. Restart services

## 📝 Notes

- This is a **temporary solution** to bypass backend authentication issues
- The backend service account with invalid JWT signature should be fixed for production
- API key method is simpler but less secure than OAuth 2.0
- Consider this setup as a temporary workaround until proper authentication is restored

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Temporary Solution - Direct Frontend API

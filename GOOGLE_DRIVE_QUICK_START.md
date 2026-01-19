# Quick Start - Google Drive API Setup

## ⚡ TL;DR (For Experienced Users)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Create API Key (Credentials → + CREATE CREDENTIALS → API key)
4. Restrict key to Google Drive API only
5. Make your Drive folders publicly accessible ("Anyone with the link")
6. Add key to `/app/frontend/.env`:
   ```
   REACT_APP_GOOGLE_DRIVE_API_KEY=AIzaSyC1x2y3...
   ```
7. Restart frontend: `sudo supervisorctl restart frontend`
8. Done! 🎉

## 📋 What You Need

- ✅ Google Cloud Project (free)
- ✅ Google Drive API enabled
- ✅ API Key with Drive API access
- ✅ Public or "Anyone with link" folder permissions
- ✅ 5 minutes of your time

## 🚀 Three-Minute Setup

### Step 1: Get Your API Key (2 minutes)

```
1. Visit: https://console.cloud.google.com/apis/credentials
2. Click: "+ CREATE CREDENTIALS" → "API key"
3. Copy the key immediately (e.g., AIzaSyC1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m)
4. Click: "RESTRICT KEY"
5. Under "API restrictions": Select "Google Drive API"
6. Click: "Save"
```

### Step 2: Configure Application (1 minute)

```bash
# Open the .env file
nano /app/frontend/.env

# Replace YOUR_API_KEY_HERE with your actual key:
REACT_APP_GOOGLE_DRIVE_API_KEY=AIzaSyC1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m

# Save and exit (Ctrl+O, Enter, Ctrl+X)

# Restart frontend
sudo supervisorctl restart frontend
```

### Step 3: Make Folders Accessible (2 minutes)

```
For each folder you want to access:
1. Open Google Drive
2. Right-click folder → "Share"
3. Click "Change" under "Restricted"
4. Select "Anyone with the link"
5. Click "Done"
```

**Folders to share:**
- Maps folders (all 5 categories)
- Panorama/650 folder
- Documents folder
- Photos folder

## ✅ Verification (30 seconds)

1. Open your application
2. Navigate to "Maps Management"
3. If you DON'T see an amber warning banner → ✅ SUCCESS!
4. If you DO see a warning → Check your .env file and restart frontend

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| Warning banner appears | Check .env file has correct key, restart frontend |
| "403 Forbidden" error | Make folders publicly accessible |
| "Invalid API key" | Verify key in Google Cloud Console |
| Changes not working | Clear browser cache, hard refresh (Ctrl+Shift+R) |

## 📖 Need More Help?

- **Detailed Guide**: See `/app/GOOGLE_DRIVE_SETUP_GUIDE.md`
- **Technical Details**: See `/app/GOOGLE_DRIVE_MIGRATION_SUMMARY.md`
- **Browser Console**: Press F12 → Console tab for error details

## 🎯 What Works After Setup

✅ **Maps Management** - Browse all map categories and folders  
✅ **Panorama/650** - View all images in gallery  
✅ **Document Management** - Access document folders  
✅ **Photo Documentation** - Browse photo collections  

## 🔐 Security Tips

1. **Restrict Your API Key**: 
   - In Google Cloud Console, add HTTP referrer restriction
   - Add: `https://your-domain.com/*`

2. **Monitor Usage**:
   - Check Google Cloud Console → APIs & Services → Dashboard
   - Watch quota usage

3. **Rotate Keys Periodically**:
   - Generate new key every few months
   - Delete old keys

## 💡 Pro Tips

- **Folder IDs**: Found in Google Drive URL after `/folders/`
- **Testing**: Use a test folder first before production
- **Caching**: Files/folders are fetched on demand, no caching yet
- **Quotas**: Default 10,000 requests/day (sufficient for most use cases)

## 🆘 Common Folder IDs

Update these in component files if needed:

```javascript
// MapManagement.jsx - Map category folders
administrative: '1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi'
topographic: '1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2'
hazard: '16xy_oUAr6sWb3JE9eNrxYJdAMDRKG'
mgb: '1yQmtrKfKiMOFA933W0emzeGoexMp'
mpdc: '1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1'

// PanoramaGallery.jsx
PANORAMA_FOLDER_ID: '1tsbcsTEfg5RLHLJLYXR41avy9SrajsqM'

// DocumentManagement.jsx
DOCUMENTS_ROOT_FOLDER_ID: '1SiOmUx8UZN5gdABHxHY2FI4AOz9Jney1'

// PhotoDocumentation.jsx
PHOTOS_ROOT_FOLDER_ID: '1XiPmUx8UZN5gdABHxHY2FI4AOz9Jney1'
```

---

**Last Updated**: January 2025  
**Status**: Ready for Configuration  
**Difficulty**: ⭐ Easy (5 minutes)

**Questions?** Check the detailed setup guide or console logs for more information.

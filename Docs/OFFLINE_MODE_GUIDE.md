# 📴 Offline Mode Documentation

## Overview

The MDRRMO Pio Duran app now features **full offline support** after installation as a Progressive Web App (PWA). Once installed, the app can function without an internet connection using cached data.

---

## 🎯 Features Available Offline

### ✅ Fully Functional Offline
- **App Shell** - UI and navigation
- **Dashboard** - All modules accessible
- **Cached Data** - Previously loaded data from Google Sheets
- **Maps** - Interactive map (if tiles are cached)
- **Documents** - Previously viewed documents

### ⚠️ Limited Offline
- **Google Sheets Data** - Only previously loaded data is available
- **Google Drive Files** - Only cached files are accessible
- **Images** - Only cached images will display
- **New Data** - Cannot fetch new data while offline

### ❌ Not Available Offline
- **Real-time Updates** - Data sync requires internet
- **New File Downloads** - Cannot download new files
- **API Calls** - Google APIs require internet connection

---

## 🚀 How to Use Offline

### 1. Install the App (First Time)

#### On Desktop (Chrome/Edge):
1. Visit the app in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install" or "Add to Desktop"
4. Launch the installed app

#### On Mobile (iOS/Android):
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the Share button or Menu (⋮)
3. Select "Add to Home Screen"
4. Tap "Add" to install

### 2. Pre-cache Data (While Online)
Before going offline, browse through:
- Supply Inventory
- Contact Directory
- Calendar Management
- Documents you need
- Photos you want to access

The app automatically caches this data for offline use.

### 3. Use Offline
Once data is cached:
1. Turn off your internet or go to an area without connectivity
2. Open the installed app
3. Navigate as usual - cached data will load automatically
4. You'll see an orange banner indicating offline mode

### 4. Sync When Back Online
When you reconnect to the internet:
- The app automatically syncs new data
- You'll see a green banner confirming you're back online
- All modules will refresh with latest data

---

## 🛠️ Technical Details

### Service Worker Strategy

The app uses an **enhanced service worker** with multiple caching strategies:

#### 1. Cache First (Static Assets)
- **What**: Images, icons, logos
- **Strategy**: Serve from cache, update in background
- **Benefits**: Instant loading

#### 2. Network First (API Data)
- **What**: Google Sheets, Google Drive API calls
- **Strategy**: Try network first, fallback to cache
- **Benefits**: Fresh data when online, cached data when offline

#### 3. Stale While Revalidate (Dynamic Assets)
- **What**: CSS, JavaScript, fonts
- **Strategy**: Serve cached version, update in background
- **Benefits**: Fast loading + auto-updates

### Cache Storage

The app uses three types of storage:

#### 1. Cache API (Service Worker)
- Static assets (HTML, CSS, JS)
- Images and icons
- Map tiles
- Size: ~10-50 MB

#### 2. IndexedDB
- Google Sheets data
- File metadata
- App settings
- Size: ~5-20 MB

#### 3. LocalStorage
- User preferences
- Session data
- Size: ~5-10 MB

### Cache Limits

To prevent excessive storage use:
- **Runtime Cache**: 50 items max
- **API Cache**: 100 items max
- **Image Cache**: 50 items max

Oldest items are automatically removed when limits are reached.

---

## 📊 Offline Indicators

### Visual Feedback

The app provides clear visual indicators:

#### Offline Banner (Orange)
```
🚫 You're offline. Using cached data.
```

#### Online Banner (Green)
```
✓ Back online! All features restored.
```

### Console Messages

Check the browser console for detailed offline information:
```
📱 Offline mode: Loading cached data for supply
✅ Cached supply data for offline use
```

---

## 🔍 Troubleshooting

### Problem: No Data Available Offline

**Solution:**
1. Go online
2. Open each module you want to use offline
3. Let the data load completely
4. Now you can use it offline

### Problem: Old Data Showing

**Solution:**
1. Connect to the internet
2. The app will automatically sync new data
3. Pull down to refresh if needed

### Problem: App Not Installing

**Desktop:**
- Check if your browser supports PWA (Chrome, Edge, Firefox)
- Clear browser cache and try again

**Mobile:**
- Use Safari (iOS) or Chrome (Android)
- Ensure you're not in incognito/private mode

### Problem: Service Worker Not Updating

**Solution:**
```javascript
// Open browser console and run:
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => {
    registration.unregister();
  });
}).then(() => {
  window.location.reload();
});
```

Then reinstall the app.

---

## 🧹 Clearing Offline Data

### Why Clear?
- Free up storage space
- Force fresh data download
- Fix caching issues

### How to Clear

#### Method 1: Browser DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Clear storage"
4. Select all and click "Clear site data"

#### Method 2: Browser Settings
**Chrome/Edge:**
1. Settings → Privacy and security
2. Site settings → MDRRMO app
3. Clear data

**Safari:**
1. Settings → Safari
2. Advanced → Website Data
3. Find and remove MDRRMO site

#### Method 3: In-App (Future Feature)
Settings → Clear Offline Cache

---

## 📈 Storage Usage

Monitor storage usage in DevTools:

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Storage" section

### Expected Usage
- **Initial**: ~2-5 MB
- **Light Use**: ~10-20 MB
- **Heavy Use**: ~50-100 MB
- **Maximum**: Browser limits (usually 50-100 MB for IndexedDB)

---

## 🔐 Privacy & Security

### What's Stored Offline?
- Public data from Google Sheets
- File metadata (not file contents)
- UI assets and images
- No sensitive user data

### Is Offline Data Secure?
- Data is stored locally on your device
- Not transmitted anywhere when offline
- Same security as browser cache
- Cleared when you clear browser data

### Can Others Access My Offline Data?
- Only if they have physical access to your device
- Protected by your device's security (lock screen, password)
- Not accessible across different browsers or devices

---

## 🎓 Best Practices

### For Daily Use
1. **Keep App Updated**: Install updates when prompted
2. **Sync Regularly**: Go online daily to sync fresh data
3. **Pre-cache Important Data**: Browse modules you need offline
4. **Monitor Storage**: Clear cache if running low on space

### For Field Work
1. **Pre-load Everything**: Visit all modules before going to field
2. **Download Critical Documents**: Open important docs while online
3. **Save Maps Offline**: Zoom into areas you'll need on the map
4. **Take Screenshots**: For critical data as backup

### For Low Connectivity Areas
1. **Open App Daily**: When you have brief connectivity
2. **Let It Sync**: Give it a minute to update data
3. **Don't Force Close**: Let background sync complete
4. **Use Offline First**: Better performance than slow connection

---

## 🔄 Updates & Sync

### Automatic Updates
- Service worker checks for updates every 24 hours
- New versions install in background
- You'll be prompted to refresh when ready

### Manual Sync
Force a refresh:
1. Pull down on mobile
2. Press Ctrl+R or Cmd+R on desktop
3. Close and reopen the app

### Background Sync
When you reconnect:
- Service worker automatically syncs cached data
- Updates happen in the background
- No user action required

---

## 📱 Platform-Specific Features

### iOS
- **Add to Home Screen**: Full PWA support in Safari
- **Offline Storage**: Up to 50 MB
- **Background Refresh**: Limited support

### Android
- **Install from Chrome**: Rich install experience
- **Offline Storage**: Up to 100 MB
- **Background Sync**: Full support

### Desktop
- **Install from Browser**: Works in Chrome, Edge, Firefox
- **Offline Storage**: Up to 500 MB
- **Background Sync**: Full support

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Manual refresh button
- [ ] Offline data age indicator
- [ ] Storage usage monitor
- [ ] Selective cache management
- [ ] Background sync status
- [ ] Conflict resolution for edits
- [ ] Offline form submissions queue
- [ ] Download specific modules for offline use

---

## 📞 Support

### Having Issues?
1. Check this documentation first
2. Try clearing cache and reinstalling
3. Check browser console for errors
4. Report issues with:
   - Browser and version
   - Device type
   - Steps to reproduce
   - Console error messages

---

## 📚 Additional Resources

- [Progressive Web Apps (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Workers (Google)](https://developers.google.com/web/fundamentals/primers/service-workers)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Installation Guide](./PWA_INSTALLATION_GUIDE.md)

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Fully Functional

---

Enjoy using MDRRMO Pio Duran app offline! 📴✨

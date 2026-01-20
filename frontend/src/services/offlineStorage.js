/**
 * IndexedDB helper for storing offline data
 * Used to cache Google Sheets and Drive API responses for offline access
 */

const DB_NAME = 'MDRRMO_OFFLINE_DB';
const DB_VERSION = 1;

// Store names
const STORES = {
  SHEETS_DATA: 'sheets_data',
  DRIVE_FILES: 'drive_files',
  SETTINGS: 'settings'
};

/**
 * Initialize IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.SHEETS_DATA)) {
        const sheetsStore = db.createObjectStore(STORES.SHEETS_DATA, { keyPath: 'id' });
        sheetsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DRIVE_FILES)) {
        const driveStore = db.createObjectStore(STORES.DRIVE_FILES, { keyPath: 'id' });
        driveStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Save data to IndexedDB
 */
export async function saveToOfflineStorage(storeName, data) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const dataWithTimestamp = {
      ...data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(dataWithTimestamp);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving to offline storage:', error);
    throw error;
  }
}

/**
 * Get data from IndexedDB
 */
export async function getFromOfflineStorage(storeName, id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting from offline storage:', error);
    return null;
  }
}

/**
 * Get all data from a store
 */
export async function getAllFromOfflineStorage(storeName) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting all from offline storage:', error);
    return [];
  }
}

/**
 * Delete data from IndexedDB
 */
export async function deleteFromOfflineStorage(storeName, id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting from offline storage:', error);
    throw error;
  }
}

/**
 * Clear all data from a store
 */
export async function clearOfflineStorage(storeName) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing offline storage:', error);
    throw error;
  }
}

/**
 * Cache Google Sheets data for offline use
 */
export async function cacheSheetData(sheetName, data) {
  return saveToOfflineStorage(STORES.SHEETS_DATA, {
    id: sheetName,
    data: data
  });
}

/**
 * Get cached Google Sheets data
 */
export async function getCachedSheetData(sheetName) {
  const result = await getFromOfflineStorage(STORES.SHEETS_DATA, sheetName);
  return result ? result.data : null;
}

/**
 * Cache Google Drive file metadata
 */
export async function cacheDriveFile(fileId, metadata) {
  return saveToOfflineStorage(STORES.DRIVE_FILES, {
    id: fileId,
    ...metadata
  });
}

/**
 * Get cached Drive file metadata
 */
export async function getCachedDriveFile(fileId) {
  return getFromOfflineStorage(STORES.DRIVE_FILES, fileId);
}

/**
 * Save app settings
 */
export async function saveSetting(key, value) {
  return saveToOfflineStorage(STORES.SETTINGS, {
    key: key,
    value: value
  });
}

/**
 * Get app setting
 */
export async function getSetting(key) {
  const result = await getFromOfflineStorage(STORES.SETTINGS, key);
  return result ? result.value : null;
}

export { STORES };

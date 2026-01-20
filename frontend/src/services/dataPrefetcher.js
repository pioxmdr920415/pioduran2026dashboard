/**
 * Data Prefetcher - Preloads critical data on app initialization
 * 
 * This module handles intelligent prefetching of data to improve
 * perceived performance when users navigate between modules.
 */

import * as sheetsService from './optimizedGoogleSheetsService';
import * as driveService from './optimizedGoogleDriveService';

// Known folder IDs for prefetching
const KNOWN_FOLDERS = {
  DOCUMENTS: '15_xiFeXu_vdIe2CYrjGaRCAho2OqhGvo',
  // Add more folder IDs as needed
};

// Sheets to prefetch
const PREFETCH_SHEETS = ['supply', 'contact', 'event'];

let prefetchPromise = null;
let prefetchStatus = {
  sheets: 'idle',
  folders: 'idle',
  startTime: null,
  endTime: null
};

/**
 * Initialize data prefetching
 * Call this on app mount to start loading data in background
 */
export const initializePrefetch = async () => {
  if (prefetchPromise) {
    return prefetchPromise;
  }

  prefetchStatus.startTime = Date.now();
  console.log('🚀 Starting data prefetch...');

  prefetchPromise = Promise.allSettled([
    prefetchSheets(),
    prefetchFolders()
  ]).then((results) => {
    prefetchStatus.endTime = Date.now();
    const duration = prefetchStatus.endTime - prefetchStatus.startTime;
    console.log(`✅ Prefetch complete in ${duration}ms`);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Prefetch ${index === 0 ? 'sheets' : 'folders'} failed:`, result.reason);
      }
    });

    return prefetchStatus;
  });

  return prefetchPromise;
};

/**
 * Prefetch Google Sheets data
 */
const prefetchSheets = async () => {
  prefetchStatus.sheets = 'loading';
  
  try {
    if (!sheetsService.isApiKeyConfigured()) {
      prefetchStatus.sheets = 'skipped';
      return;
    }

    await sheetsService.prefetchSheets(PREFETCH_SHEETS);
    prefetchStatus.sheets = 'complete';
    console.log('📊 Sheets prefetched:', PREFETCH_SHEETS);
  } catch (error) {
    prefetchStatus.sheets = 'error';
    throw error;
  }
};

/**
 * Prefetch Google Drive folder structure
 */
const prefetchFolders = async () => {
  prefetchStatus.folders = 'loading';
  
  try {
    if (!driveService.isApiKeyConfigured()) {
      prefetchStatus.folders = 'skipped';
      return;
    }

    // Prefetch folder structures in parallel
    const folderIds = Object.values(KNOWN_FOLDERS);
    await Promise.allSettled(
      folderIds.map(folderId => 
        driveService.getFolderStructure(folderId, 2)
      )
    );
    
    prefetchStatus.folders = 'complete';
    console.log('📁 Folders prefetched:', Object.keys(KNOWN_FOLDERS));
  } catch (error) {
    prefetchStatus.folders = 'error';
    throw error;
  }
};

/**
 * Get prefetch status
 */
export const getPrefetchStatus = () => ({ ...prefetchStatus });

/**
 * Check if prefetch is complete
 */
export const isPrefetchComplete = () => {
  return prefetchStatus.sheets !== 'loading' && prefetchStatus.folders !== 'loading';
};

/**
 * Wait for prefetch to complete (with timeout)
 */
export const waitForPrefetch = async (timeout = 5000) => {
  if (!prefetchPromise) {
    return null;
  }

  return Promise.race([
    prefetchPromise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Prefetch timeout')), timeout)
    )
  ]).catch(() => getPrefetchStatus());
};

/**
 * Prefetch specific folder (for hover/focus prefetching)
 */
export const prefetchFolder = (folderId) => {
  if (!driveService.isApiKeyConfigured()) return;
  
  // Fire and forget
  driveService.prefetchFolder(folderId);
};

/**
 * Clear all caches (useful for manual refresh)
 */
export const clearAllCaches = () => {
  sheetsService.invalidateCache();
  driveService.invalidateCache();
  prefetchPromise = null;
  prefetchStatus = {
    sheets: 'idle',
    folders: 'idle',
    startTime: null,
    endTime: null
  };
  console.log('🗑️ All caches cleared');
};

export default {
  initializePrefetch,
  getPrefetchStatus,
  isPrefetchComplete,
  waitForPrefetch,
  prefetchFolder,
  clearAllCaches
};

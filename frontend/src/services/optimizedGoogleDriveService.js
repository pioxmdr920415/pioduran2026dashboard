/**
 * Optimized Google Drive Service
 * 
 * Performance optimizations:
 * - In-memory caching with TTL
 * - Stale-while-revalidate pattern
 * - Request deduplication
 * - Parallel folder structure fetching
 * - Pagination support with cursor
 * - Prefetching for adjacent folders
 * - IndexedDB fallback for offline
 */

import { driveCache } from './cacheManager';
import { cacheDriveFile, getCachedDriveFile, saveToOfflineStorage, getFromOfflineStorage } from './offlineStorage';

const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

// Store names for IndexedDB
const OFFLINE_STORES = {
  FOLDER_STRUCTURE: 'drive_folders',
  FILE_LIST: 'drive_file_lists'
};

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = () => {
  return API_KEY && API_KEY !== 'YOUR_API_KEY_HERE';
};

/**
 * Build API URL with key
 */
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${DRIVE_API_BASE}${endpoint}`);
  url.searchParams.append('key', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

/**
 * Raw fetch files from folder
 */
const fetchFilesRaw = async (folderId, options = {}) => {
  const {
    pageSize = 100,
    orderBy = 'name',
    fields = 'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,imageMediaMetadata),nextPageToken',
    pageToken = null,
    mimeType = null
  } = options;

  let query = `'${folderId}' in parents and trashed=false`;
  if (mimeType) {
    query += ` and mimeType='${mimeType}'`;
  }

  const params = {
    q: query,
    pageSize,
    orderBy,
    fields
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const url = buildUrl('/files', params);
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch files');
  }

  return response.json();
};

/**
 * Fetch all files with automatic pagination
 */
const fetchAllFilesInFolder = async (folderId, options = {}) => {
  const allFiles = [];
  let pageToken = null;
  let pageCount = 0;
  const maxPages = options.maxPages || 10; // Safety limit

  do {
    const result = await fetchFilesRaw(folderId, { ...options, pageToken });
    allFiles.push(...(result.files || []));
    pageToken = result.nextPageToken;
    pageCount++;
  } while (pageToken && pageCount < maxPages);

  return allFiles;
};

/**
 * List files in folder with caching
 * @param {string} folderId - Google Drive folder ID
 * @param {object} options - Options
 * @returns {Promise<{data: Array, source: string}>}
 */
export const listFilesInFolder = async (folderId, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  const { forceRefresh = false, onUpdate = null, includeSubfolders = false } = options;
  const cacheKey = driveCache.generateKey('files', folderId, options.mimeType || 'all');

  if (forceRefresh) {
    driveCache.delete(cacheKey);
  }

  try {
    const result = await driveCache.staleWhileRevalidate(
      cacheKey,
      async () => {
        const files = await fetchAllFilesInFolder(folderId, options);
        
        // Cache to IndexedDB for offline
        try {
          await saveToOfflineStorage('drive_files', {
            id: `files_${folderId}`,
            folderId,
            files,
            timestamp: Date.now()
          });
        } catch (e) {
          console.warn('Failed to cache files to IndexedDB:', e);
        }
        
        return files;
      },
      onUpdate
    );

    return result;
  } catch (error) {
    console.error('Error listing files:', error);
    
    // Fallback to IndexedDB
    if (!navigator.onLine || error.message.includes('Failed to fetch')) {
      const offline = await getFromOfflineStorage('drive_files', `files_${folderId}`);
      if (offline?.files) {
        return { data: offline.files, source: 'indexeddb' };
      }
    }
    
    throw error;
  }
};

/**
 * Get folder info
 */
const getFolderInfo = async (folderId) => {
  const url = buildUrl(`/files/${folderId}`, {
    fields: 'id,name,mimeType'
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch folder info');
  }
  return response.json();
};

/**
 * Get subfolders in a folder
 */
const getSubfolders = async (folderId) => {
  const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  
  const url = buildUrl('/files', {
    q: query,
    pageSize: 100,
    orderBy: 'name',
    fields: 'files(id,name,mimeType)'
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch subfolders');
  }
  
  const data = await response.json();
  return data.files || [];
};

/**
 * Get folder structure with optimized parallel fetching
 * @param {string} folderId - Root folder ID
 * @param {number} maxDepth - Maximum depth to traverse
 * @param {object} options - Options
 * @returns {Promise<{data: Object, source: string}>}
 */
export const getFolderStructure = async (folderId, maxDepth = 3, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  const { forceRefresh = false, onUpdate = null } = options;
  const cacheKey = driveCache.generateKey('structure', folderId, maxDepth);

  if (forceRefresh) {
    driveCache.delete(cacheKey);
  }

  try {
    const result = await driveCache.staleWhileRevalidate(
      cacheKey,
      async () => {
        const structure = await buildFolderStructureOptimized(folderId, maxDepth, 0);
        
        // Cache to IndexedDB
        try {
          await saveToOfflineStorage('drive_files', {
            id: `structure_${folderId}`,
            structure,
            timestamp: Date.now()
          });
        } catch (e) {
          console.warn('Failed to cache structure to IndexedDB:', e);
        }
        
        return structure;
      },
      onUpdate
    );

    return result;
  } catch (error) {
    console.error('Error getting folder structure:', error);
    
    // Fallback to IndexedDB
    if (!navigator.onLine || error.message.includes('Failed to fetch')) {
      const offline = await getFromOfflineStorage('drive_files', `structure_${folderId}`);
      if (offline?.structure) {
        return { data: offline.structure, source: 'indexeddb' };
      }
    }
    
    throw error;
  }
};

/**
 * Optimized folder structure building with parallel fetching
 */
const buildFolderStructureOptimized = async (folderId, maxDepth, currentDepth) => {
  // Fetch folder info and subfolders in parallel
  const [folderInfo, subfolders] = await Promise.all([
    getFolderInfo(folderId),
    currentDepth < maxDepth ? getSubfolders(folderId) : Promise.resolve([])
  ]);

  const folder = {
    id: folderInfo.id,
    name: folderInfo.name,
    mimeType: folderInfo.mimeType,
    children: []
  };

  // Recursively fetch children in parallel
  if (subfolders.length > 0 && currentDepth < maxDepth) {
    const childPromises = subfolders.map(subfolder =>
      buildFolderStructureOptimized(subfolder.id, maxDepth, currentDepth + 1)
    );
    
    // Use Promise.allSettled for resilience
    const results = await Promise.allSettled(childPromises);
    folder.children = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
  }

  return folder;
};

/**
 * Get images from folder with caching
 */
export const getImagesFromFolder = async (folderId, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  const { forceRefresh = false, onUpdate = null } = options;
  const cacheKey = driveCache.generateKey('images', folderId);

  if (forceRefresh) {
    driveCache.delete(cacheKey);
  }

  try {
    const result = await driveCache.staleWhileRevalidate(
      cacheKey,
      async () => {
        const query = `'${folderId}' in parents and trashed=false and (mimeType contains 'image/')`;
        
        const url = buildUrl('/files', {
          q: query,
          pageSize: 100,
          orderBy: 'modifiedTime desc',
          fields: 'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,imageMediaMetadata)'
        });

        const response = await fetch(url);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to fetch images');
        }

        const data = await response.json();
        return data.files || [];
      },
      onUpdate
    );

    return result;
  } catch (error) {
    console.error('Error getting images:', error);
    throw error;
  }
};

/**
 * Get folders in a folder with caching
 */
export const getFoldersInFolder = async (parentFolderId, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  const { forceRefresh = false, onUpdate = null } = options;
  const cacheKey = driveCache.generateKey('folders', parentFolderId);

  if (forceRefresh) {
    driveCache.delete(cacheKey);
  }

  try {
    const result = await driveCache.staleWhileRevalidate(
      cacheKey,
      async () => getSubfolders(parentFolderId),
      onUpdate
    );

    return result;
  } catch (error) {
    console.error('Error getting folders:', error);
    throw error;
  }
};

/**
 * Search files with caching of base data
 */
export const searchFilesInFolder = async (folderId, searchTerm, options = {}) => {
  // First get all files (potentially from cache)
  const filesResult = await listFilesInFolder(folderId, options);
  
  if (!searchTerm) {
    return filesResult;
  }

  // Filter locally
  const term = searchTerm.toLowerCase();
  const filteredFiles = filesResult.data.filter(file =>
    file.name.toLowerCase().includes(term)
  );

  return { ...filesResult, data: filteredFiles };
};

/**
 * Get file metadata with caching
 */
export const getFileMetadata = async (fileId, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  const { forceRefresh = false } = options;
  const cacheKey = driveCache.generateKey('metadata', fileId);

  if (forceRefresh) {
    driveCache.delete(cacheKey);
  }

  const result = await driveCache.staleWhileRevalidate(
    cacheKey,
    async () => {
      const url = buildUrl(`/files/${fileId}`, {
        fields: 'id,name,mimeType,size,modifiedTime,createdTime,thumbnailLink,webViewLink,webContentLink,imageMediaMetadata,owners'
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch file metadata');
      }

      return response.json();
    }
  );

  return result;
};

/**
 * Get files from multiple folders in parallel
 */
export const getFilesFromMultipleFolders = async (folderIds, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  const results = {};
  
  const promises = folderIds.map(async (folderId) => {
    try {
      const result = await listFilesInFolder(folderId, options);
      results[folderId] = result;
    } catch (error) {
      console.error(`Error fetching files from ${folderId}:`, error);
      results[folderId] = { data: [], source: 'error', error };
    }
  });

  await Promise.all(promises);
  return results;
};

/**
 * Prefetch folder data (call when folder is visible but not selected)
 */
export const prefetchFolder = async (folderId) => {
  console.log(`📦 Prefetching folder: ${folderId}`);
  
  // Fire and forget - prefetch in background
  Promise.all([
    listFilesInFolder(folderId).catch(() => {}),
    getFoldersInFolder(folderId).catch(() => {})
  ]);
};

/**
 * Invalidate cache
 */
export const invalidateCache = (folderId = null) => {
  if (folderId) {
    driveCache.delete(driveCache.generateKey('files', folderId, 'all'));
    driveCache.delete(driveCache.generateKey('folders', folderId));
    driveCache.delete(driveCache.generateKey('images', folderId));
    console.log(`🗑️ Cache invalidated for folder: ${folderId}`);
  } else {
    driveCache.clear();
    console.log('🗑️ All drive cache cleared');
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => driveCache.getStats();

export default {
  isApiKeyConfigured,
  listFilesInFolder,
  getFolderStructure,
  getImagesFromFolder,
  getFoldersInFolder,
  searchFilesInFolder,
  getFileMetadata,
  getFilesFromMultipleFolders,
  prefetchFolder,
  invalidateCache,
  getCacheStats
};

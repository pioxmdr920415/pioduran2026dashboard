/**
 * Custom hooks for optimized data fetching
 * 
 * Features:
 * - Automatic caching
 * - Loading states
 * - Error handling
 * - Stale-while-revalidate updates
 * - Prefetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as sheetsService from '../services/optimizedGoogleSheetsService';
import * as driveService from '../services/optimizedGoogleDriveService';

/**
 * Generic hook for fetching cached data with stale-while-revalidate
 */
export const useCachedData = (fetchFn, deps = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const { enabled = true, onSuccess, onError } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await fetchFn({
        forceRefresh,
        onUpdate: (freshData) => {
          // Called when fresh data arrives during stale-while-revalidate
          if (mountedRef.current) {
            setData(freshData);
            setSource('network-update');
            onSuccess?.(freshData);
          }
        }
      });

      if (mountedRef.current) {
        setData(result.data);
        setSource(result.source);
        onSuccess?.(result.data);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        onError?.(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchFn, enabled, onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [...deps, fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    loading,
    error,
    source,
    isRefreshing,
    refresh,
    isFromCache: source?.startsWith('cache')
  };
};

/**
 * Hook for fetching Google Sheet data
 */
export const useSheetData = (sheetName, options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => sheetsService.getSheetData(sheetName, { ...options, ...fetchOptions }),
    [sheetName, options.range]
  );

  return useCachedData(fetchFn, [sheetName], options);
};

/**
 * Hook for fetching supply inventory
 */
export const useSupplyInventory = (options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => sheetsService.getSupplyItems(fetchOptions),
    []
  );

  return useCachedData(fetchFn, [], options);
};

/**
 * Hook for fetching contacts
 */
export const useContacts = (options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => sheetsService.getContactItems(fetchOptions),
    []
  );

  return useCachedData(fetchFn, [], options);
};

/**
 * Hook for fetching events
 */
export const useEvents = (options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => sheetsService.getEventItems(fetchOptions),
    []
  );

  return useCachedData(fetchFn, [], options);
};

/**
 * Hook for fetching files in a folder
 */
export const useFolderFiles = (folderId, options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => driveService.listFilesInFolder(folderId, { ...options, ...fetchOptions }),
    [folderId]
  );

  return useCachedData(fetchFn, [folderId], { ...options, enabled: !!folderId });
};

/**
 * Hook for fetching folder structure
 */
export const useFolderStructure = (folderId, maxDepth = 3, options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => driveService.getFolderStructure(folderId, maxDepth, fetchOptions),
    [folderId, maxDepth]
  );

  return useCachedData(fetchFn, [folderId, maxDepth], { ...options, enabled: !!folderId });
};

/**
 * Hook for fetching images from folder
 */
export const useFolderImages = (folderId, options = {}) => {
  const fetchFn = useCallback(
    (fetchOptions) => driveService.getImagesFromFolder(folderId, fetchOptions),
    [folderId]
  );

  return useCachedData(fetchFn, [folderId], { ...options, enabled: !!folderId });
};

/**
 * Hook for searching in sheet data
 */
export const useSheetSearch = (sheetName, searchTerm, searchFields = null, options = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!searchTerm) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const result = await sheetsService.searchInSheet(sheetName, searchTerm, searchFields, options);
        setResults(result.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [sheetName, searchTerm, searchFields]);

  return { results, loading };
};

/**
 * Hook for prefetching data
 */
export const usePrefetch = () => {
  const prefetchSheets = useCallback(async () => {
    await sheetsService.prefetchSheets(['supply', 'contact', 'event']);
  }, []);

  const prefetchFolder = useCallback(async (folderId) => {
    await driveService.prefetchFolder(folderId);
  }, []);

  return { prefetchSheets, prefetchFolder };
};

/**
 * Hook for cache statistics (for debugging)
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState({ sheets: null, drive: null });

  const refreshStats = useCallback(() => {
    setStats({
      sheets: sheetsService.getCacheStats(),
      drive: driveService.getCacheStats()
    });
  }, []);

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return stats;
};

export default {
  useCachedData,
  useSheetData,
  useSupplyInventory,
  useContacts,
  useEvents,
  useFolderFiles,
  useFolderStructure,
  useFolderImages,
  useSheetSearch,
  usePrefetch,
  useCacheStats
};

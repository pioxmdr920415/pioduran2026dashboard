/**
 * Optimized Google Sheets Service
 * 
 * Performance optimizations:
 * - In-memory caching with TTL
 * - Stale-while-revalidate pattern
 * - Request deduplication
 * - Batch fetching
 * - IndexedDB fallback for offline support
 * - Smart cache invalidation
 */

import { sheetsCache } from './cacheManager';
import { cacheSheetData, getCachedSheetData } from './offlineStorage';

const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID || '1UtT9t2LZ5NEc-wbGv44mDeDjWLxOLBQHA5yy6jiLc7E';

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
  const url = new URL(`${SHEETS_API_BASE}${endpoint}`);
  url.searchParams.append('key', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

/**
 * Parse sheet data from values array to objects (optimized)
 */
const parseSheetData = (values) => {
  if (!values || values.length === 0) return [];
  
  const headers = values[0];
  const headerMap = new Map();
  
  // Pre-compute normalized headers
  headers.forEach((header, i) => {
    headerMap.set(i, {
      original: header,
      normalized: header.toLowerCase().replace(/[^a-z0-9]/g, '')
    });
  });
  
  // Process rows
  const rows = values.slice(1);
  return rows.map((row, index) => {
    const obj = { row_index: index + 2 };
    
    headerMap.forEach((headerInfo, i) => {
      const value = row[i] || '';
      obj[headerInfo.original] = value;
      if (headerInfo.normalized && headerInfo.normalized !== headerInfo.original) {
        obj[headerInfo.normalized] = value;
      }
    });
    
    return obj;
  });
};

/**
 * Raw fetch from Google Sheets API
 */
const fetchSheetDataRaw = async (sheetName, range = null) => {
  const rangeParam = range || `${sheetName}!A:Z`;
  const url = buildUrl(`/${SPREADSHEET_ID}/values/${rangeParam}`);

  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch data from Google Sheets');
  }

  const data = await response.json();
  return parseSheetData(data.values || []);
};

/**
 * Get data from a Google Sheet with optimized caching
 * @param {string} sheetName - Name of the sheet tab
 * @param {object} options - Options for fetching
 * @returns {Promise<{data: Array, source: string, onUpdate: Function}>}
 */
export const getSheetData = async (sheetName, options = {}) => {
  const { 
    forceRefresh = false, 
    onUpdate = null,
    range = null 
  } = options;

  if (!isApiKeyConfigured()) {
    throw new Error('Google Sheets API key is not configured');
  }

  const cacheKey = sheetsCache.generateKey('sheet', sheetName, range);

  // Force refresh - bypass cache
  if (forceRefresh) {
    sheetsCache.delete(cacheKey);
  }

  try {
    // Try stale-while-revalidate pattern
    const result = await sheetsCache.staleWhileRevalidate(
      cacheKey,
      async () => {
        const data = await fetchSheetDataRaw(sheetName, range);
        
        // Also save to IndexedDB for offline support
        try {
          await cacheSheetData(sheetName, data);
        } catch (e) {
          console.warn('Failed to cache to IndexedDB:', e);
        }
        
        return data;
      },
      onUpdate
    );

    return result;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    
    // Fallback to IndexedDB if offline
    if (!navigator.onLine || error.message.includes('Failed to fetch')) {
      console.log('📱 Falling back to IndexedDB cache');
      const offlineData = await getCachedSheetData(sheetName);
      if (offlineData) {
        return { data: offlineData, source: 'indexeddb' };
      }
    }
    
    throw error;
  }
};

/**
 * Batch fetch multiple sheets in parallel (optimized)
 * @param {Array<string>} sheetNames - Array of sheet names
 * @param {object} options - Fetch options
 * @returns {Promise<Object>} Object with sheet names as keys
 */
export const getMultipleSheets = async (sheetNames, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Sheets API key is not configured');
  }

  const { forceRefresh = false, onUpdate = null } = options;
  const results = {};
  const fetchPromises = [];

  // Check which sheets need fetching
  for (const sheetName of sheetNames) {
    const cacheKey = sheetsCache.generateKey('sheet', sheetName, null);
    const cached = sheetsCache.get(cacheKey);

    if (cached?.isFresh && !forceRefresh) {
      // Use cached data directly
      results[sheetName] = { data: cached.data, source: 'cache-fresh' };
    } else {
      // Need to fetch
      fetchPromises.push(
        getSheetData(sheetName, { forceRefresh, onUpdate })
          .then(result => {
            results[sheetName] = result;
          })
          .catch(error => {
            console.error(`Error fetching ${sheetName}:`, error);
            results[sheetName] = { data: [], source: 'error', error };
          })
      );
    }
  }

  // Fetch remaining sheets in parallel
  await Promise.all(fetchPromises);

  return results;
};

/**
 * Get supply items with optimized caching
 */
export const getSupplyItems = async (options = {}) => {
  const result = await getSheetData('supply', options);
  
  return {
    ...result,
    data: result.data.map(item => {
      const itemName = item['Item Name'] || item.itemname || item.ItemName || '';
      const category = item['Category'] || item.category || '';
      const quantity = parseInt(item['Quantity'] || item.quantity || 0);
      const unit = item['Unit'] || item.unit || '';
      const location = item['Location'] || item.location || '';
      const status = item['Status'] || item.status || '';
      
      return {
        ...item,
        itemName,
        category,
        quantity,
        unit,
        location,
        status,
        stockLevel: quantity === 0 ? 'out-of-stock' : quantity < 10 ? 'low' : 'good'
      };
    })
  };
};

/**
 * Get contact items with optimized caching
 */
export const getContactItems = async (options = {}) => {
  const result = await getSheetData('contact', options);
  
  return {
    ...result,
    data: result.data.map(item => ({
      ...item,
      name: item['Name'] || item.name || '',
      position: item['Position'] || item.position || '',
      department: item['Department'] || item.department || '',
      phone: item['Phone'] || item.phone || '',
      email: item['Email'] || item.email || 'N/A'
    }))
  };
};

/**
 * Get event items with optimized caching
 */
export const getEventItems = async (options = {}) => {
  const result = await getSheetData('event', options);
  
  return {
    ...result,
    data: result.data.map(item => {
      const eventTask = item['Event/Task'] || item.eventtask || item.EventTask || item.taskName || '';
      const date = item['Date'] || item.date || '';
      const time = item['Time'] || item.time || '';
      const location = item['Location'] || item.location || '';
      const status = item['Status'] || item.status || 'Upcoming';
      
      return {
        ...item,
        eventTask,
        date,
        time,
        location,
        status,
        startDate: item.startDate || date || '',
        endDate: item.endDate || date || ''
      };
    })
  };
};

/**
 * Search within cached or fetched data (no additional API call if cached)
 */
export const searchInSheet = async (sheetName, searchTerm, searchFields = null, options = {}) => {
  const result = await getSheetData(sheetName, options);
  
  if (!searchTerm) return result;
  
  const term = searchTerm.toLowerCase();
  
  const filteredData = result.data.filter(item => {
    if (searchFields) {
      return searchFields.some(field => 
        String(item[field] || '').toLowerCase().includes(term)
      );
    }
    return Object.values(item).some(value =>
      String(value || '').toLowerCase().includes(term)
    );
  });

  return { ...result, data: filteredData };
};

/**
 * Invalidate cache for specific sheet
 */
export const invalidateCache = (sheetName = null) => {
  if (sheetName) {
    const cacheKey = sheetsCache.generateKey('sheet', sheetName, null);
    sheetsCache.delete(cacheKey);
    console.log(`🗑️ Cache invalidated for: ${sheetName}`);
  } else {
    sheetsCache.clearByNamespace('sheet');
    console.log('🗑️ All sheet cache cleared');
  }
};

/**
 * Prefetch sheets data (call on app load)
 */
export const prefetchSheets = async (sheetNames = ['supply', 'contact', 'event']) => {
  console.log('📦 Prefetching sheets:', sheetNames);
  return getMultipleSheets(sheetNames);
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => sheetsCache.getStats();

export default {
  isApiKeyConfigured,
  getSheetData,
  getSupplyItems,
  getContactItems,
  getEventItems,
  getMultipleSheets,
  searchInSheet,
  invalidateCache,
  prefetchSheets,
  getCacheStats,
  SPREADSHEET_ID
};

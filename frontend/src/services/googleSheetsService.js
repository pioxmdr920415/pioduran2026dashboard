/**
 * Google Sheets Service - Direct Frontend API Integration with Offline Support
 * 
 * This service provides direct access to Google Sheets API from the frontend,
 * allowing real-time data fetching and updates without backend proxy.
 * Now includes offline caching for full PWA support.
 * 
 * Prerequisites:
 * 1. Enable Google Sheets API in Google Cloud Console
 * 2. Create API Key with proper restrictions
 * 3. Add API key to .env as REACT_APP_GOOGLE_SHEETS_API_KEY
 * 4. Make sure the Google Sheet is publicly accessible or shared with service account
 */

import { cacheSheetData, getCachedSheetData } from './offlineStorage';

const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Google Sheet ID from environment or default
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
 * Parse sheet data from values array to objects
 * @param {Array<Array>} values - Raw values from Google Sheets (first row is headers)
 * @returns {Array<Object>} Array of objects with headers as keys
 */
const parseSheetData = (values) => {
  if (!values || values.length === 0) return [];
  
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map((row, index) => {
    const obj = { row_index: index + 2 }; // +2 because: +1 for header row, +1 for 1-based indexing
    headers.forEach((header, i) => {
      // Store both original header and normalized version
      obj[header] = row[i] || '';
      
      // Create normalized lowercase version
      const normalizedKey = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedKey && normalizedKey !== header) {
        obj[normalizedKey] = row[i] || '';
      }
    });
    return obj;
  });
};

/**
 * Get data from a Google Sheet tab/worksheet
 * @param {string} sheetName - Name of the sheet tab (e.g., 'supply', 'contact', 'event')
 * @param {string} range - Optional range (default: entire sheet)
 * @returns {Promise<Array<Object>>} Array of data objects
 */
export const getSheetData = async (sheetName, range = null) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Sheets API key is not configured. Please add REACT_APP_GOOGLE_SHEETS_API_KEY to your .env file.');
  }

  try {
    const rangeParam = range || `${sheetName}!A:Z`;
    const url = buildUrl(`/${SPREADSHEET_ID}/values/${rangeParam}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch data from Google Sheets');
    }

    const data = await response.json();
    return parseSheetData(data.values || []);
  } catch (error) {
    console.error('Error in getSheetData:', error);
    throw error;
  }
};

/**
 * Get supply inventory items from Google Sheets
 * @returns {Promise<Array<Object>>} Array of supply items
 */
export const getSupplyItems = async () => {
  try {
    const data = await getSheetData('supply');
    return data.map(item => {
      // Map Google Sheets columns to expected field names
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
        // Calculate stock level
        stockLevel: (() => {
          if (quantity === 0) return 'out-of-stock';
          if (quantity < 10) return 'low';
          return 'good';
        })()
      };
    });
  } catch (error) {
    console.error('Error fetching supply items:', error);
    throw error;
  }
};

/**
 * Get contact directory items from Google Sheets
 * @returns {Promise<Array<Object>>} Array of contacts
 */
export const getContactItems = async () => {
  try {
    const data = await getSheetData('contact');
    return data.map(item => ({
      ...item,
      // Map Google Sheets columns to expected field names (lowercase)
      name: item['Name'] || item.name || '',
      position: item['Position'] || item.position || '',
      department: item['Department'] || item.department || '',
      phone: item['Phone'] || item.phone || '',
      email: item['Email'] || item.email || 'N/A'
    }));
  } catch (error) {
    console.error('Error fetching contact items:', error);
    throw error;
  }
};

/**
 * Get calendar event items from Google Sheets
 * @returns {Promise<Array<Object>>} Array of events
 */
export const getEventItems = async () => {
  try {
    const data = await getSheetData('event');
    return data.map(item => {
      // Map Google Sheets columns to expected field names
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
        // Parse dates if available
        startDate: item.startDate || date || '',
        endDate: item.endDate || date || ''
      };
    });
  } catch (error) {
    console.error('Error fetching event items:', error);
    throw error;
  }
};

/**
 * Get data from multiple sheets at once
 * @param {Array<string>} sheetNames - Array of sheet names
 * @returns {Promise<Object>} Object with sheet names as keys
 */
export const getMultipleSheets = async (sheetNames) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Sheets API key is not configured');
  }

  try {
    const results = {};
    
    await Promise.all(
      sheetNames.map(async (sheetName) => {
        try {
          const data = await getSheetData(sheetName);
          results[sheetName] = data;
        } catch (error) {
          console.error(`Error fetching sheet ${sheetName}:`, error);
          results[sheetName] = [];
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error in getMultipleSheets:', error);
    throw error;
  }
};

/**
 * Search items in a sheet
 * @param {string} sheetName - Sheet name
 * @param {string} searchTerm - Search term
 * @param {Array<string>} searchFields - Fields to search in (optional)
 * @returns {Promise<Array<Object>>} Filtered results
 */
export const searchInSheet = async (sheetName, searchTerm, searchFields = null) => {
  try {
    const data = await getSheetData(sheetName);
    
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    
    return data.filter(item => {
      if (searchFields) {
        return searchFields.some(field => 
          String(item[field] || '').toLowerCase().includes(term)
        );
      }
      
      // Search all fields
      return Object.values(item).some(value =>
        String(value || '').toLowerCase().includes(term)
      );
    });
  } catch (error) {
    console.error('Error in searchInSheet:', error);
    throw error;
  }
};

/**
 * Get batch data from specific ranges
 * @param {Array<string>} ranges - Array of A1 notation ranges
 * @returns {Promise<Object>} Object with ranges as keys
 */
export const getBatchData = async (ranges) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Sheets API key is not configured');
  }

  try {
    const rangesParam = ranges.join('&ranges=');
    const url = buildUrl(`/${SPREADSHEET_ID}/values:batchGet`, {
      ranges: rangesParam
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch batch data');
    }

    const data = await response.json();
    
    const results = {};
    data.valueRanges.forEach((range, index) => {
      results[ranges[index]] = parseSheetData(range.values || []);
    });
    
    return results;
  } catch (error) {
    console.error('Error in getBatchData:', error);
    throw error;
  }
};

/**
 * Get sheet metadata (tab names, properties, etc.)
 * @returns {Promise<Object>} Sheet metadata
 */
export const getSheetMetadata = async () => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Sheets API key is not configured');
  }

  try {
    const url = buildUrl(`/${SPREADSHEET_ID}`, {
      fields: 'sheets.properties'
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch sheet metadata');
    }

    const data = await response.json();
    return data.sheets.map(sheet => sheet.properties);
  } catch (error) {
    console.error('Error in getSheetMetadata:', error);
    throw error;
  }
};

export default {
  isApiKeyConfigured,
  getSheetData,
  getSupplyItems,
  getContactItems,
  getEventItems,
  getMultipleSheets,
  searchInSheet,
  getBatchData,
  getSheetMetadata,
  SPREADSHEET_ID
};

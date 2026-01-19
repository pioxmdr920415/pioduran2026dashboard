/**
 * Google Drive Service - Direct Frontend API Integration
 * 
 * This service provides direct access to Google Drive API from the frontend,
 * bypassing the backend service account authentication issues.
 * 
 * Prerequisites:
 * 1. Enable Google Drive API in Google Cloud Console
 * 2. Create API Key with proper restrictions
 * 3. Add API key to .env as REACT_APP_GOOGLE_DRIVE_API_KEY
 */

const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

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
 * Fetch files from a Google Drive folder
 * @param {string} folderId - Google Drive folder ID
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Array of file objects
 */
export const listFilesInFolder = async (folderId, options = {}) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured. Please add REACT_APP_GOOGLE_DRIVE_API_KEY to your .env file.');
  }

  try {
    const {
      pageSize = 1000,
      orderBy = 'name',
      fields = 'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,imageMediaMetadata)',
      includeSubfolders = false
    } = options;

    let query = `'${folderId}' in parents and trashed=false`;
    
    // Filter by mime type if specified
    if (options.mimeType) {
      query += ` and mimeType='${options.mimeType}'`;
    }

    const url = buildUrl('/files', {
      q: query,
      pageSize,
      orderBy,
      fields
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch files from Google Drive');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error in listFilesInFolder:', error);
    throw error;
  }
};

/**
 * Get folder structure recursively
 * @param {string} folderId - Root folder ID
 * @param {number} maxDepth - Maximum depth to traverse (default: 3)
 * @returns {Promise<Object>} Folder structure object
 */
export const getFolderStructure = async (folderId, maxDepth = 3, currentDepth = 0) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    // Get folder info
    const folderUrl = buildUrl(`/files/${folderId}`, {
      fields: 'id,name,mimeType'
    });

    const folderResponse = await fetch(folderUrl);
    if (!folderResponse.ok) {
      throw new Error('Failed to fetch folder info');
    }
    const folderData = await folderResponse.json();

    const folder = {
      id: folderData.id,
      name: folderData.name,
      mimeType: folderData.mimeType,
      children: []
    };

    // If we haven't reached max depth, get subfolders
    if (currentDepth < maxDepth) {
      const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      
      const subfoldersUrl = buildUrl('/files', {
        q: query,
        pageSize: 100,
        orderBy: 'name',
        fields: 'files(id,name,mimeType)'
      });

      const subfoldersResponse = await fetch(subfoldersUrl);
      if (subfoldersResponse.ok) {
        const subfoldersData = await subfoldersResponse.json();
        
        // Recursively get structure for each subfolder
        if (subfoldersData.files && subfoldersData.files.length > 0) {
          const childrenPromises = subfoldersData.files.map(subfolder =>
            getFolderStructure(subfolder.id, maxDepth, currentDepth + 1)
          );
          folder.children = await Promise.all(childrenPromises);
        }
      }
    }

    return folder;
  } catch (error) {
    console.error('Error in getFolderStructure:', error);
    throw error;
  }
};

/**
 * Search files in a folder
 * @param {string} folderId - Folder ID to search in
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching files
 */
export const searchFilesInFolder = async (folderId, searchTerm) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const query = `'${folderId}' in parents and trashed=false and name contains '${searchTerm}'`;
    
    const url = buildUrl('/files', {
      q: query,
      pageSize: 100,
      fields: 'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,imageMediaMetadata)',
      orderBy: 'name'
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to search files');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error in searchFilesInFolder:', error);
    throw error;
  }
};

/**
 * Get files from multiple folders (useful for category-based browsing)
 * @param {Array<string>} folderIds - Array of folder IDs
 * @returns {Promise<Object>} Object with folder IDs as keys and file arrays as values
 */
export const getFilesFromMultipleFolders = async (folderIds) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const results = {};
    
    await Promise.all(
      folderIds.map(async (folderId) => {
        try {
          const files = await listFilesInFolder(folderId);
          results[folderId] = files;
        } catch (error) {
          console.error(`Error fetching files from folder ${folderId}:`, error);
          results[folderId] = [];
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error in getFilesFromMultipleFolders:', error);
    throw error;
  }
};

/**
 * Get file metadata
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} File metadata
 */
export const getFileMetadata = async (fileId) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const url = buildUrl(`/files/${fileId}`, {
      fields: 'id,name,mimeType,size,modifiedTime,createdTime,thumbnailLink,webViewLink,webContentLink,imageMediaMetadata,owners'
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch file metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getFileMetadata:', error);
    throw error;
  }
};

/**
 * Get only image files from a folder
 * @param {string} folderId - Folder ID
 * @returns {Promise<Array>} Array of image files
 */
export const getImagesFromFolder = async (folderId) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const query = `'${folderId}' in parents and trashed=false and (mimeType contains 'image/')`;
    
    const url = buildUrl('/files', {
      q: query,
      pageSize: 1000,
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
  } catch (error) {
    console.error('Error in getImagesFromFolder:', error);
    throw error;
  }
};

/**
 * Get folders from a parent folder
 * @param {string} parentFolderId - Parent folder ID
 * @returns {Promise<Array>} Array of folder objects
 */
export const getFoldersInFolder = async (parentFolderId) => {
  if (!isApiKeyConfigured()) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const query = `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    const url = buildUrl('/files', {
      q: query,
      pageSize: 100,
      orderBy: 'name',
      fields: 'files(id,name,mimeType,modifiedTime)'
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch folders');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error in getFoldersInFolder:', error);
    throw error;
  }
};

export default {
  isApiKeyConfigured,
  listFilesInFolder,
  getFolderStructure,
  searchFilesInFolder,
  getFilesFromMultipleFolders,
  getFileMetadata,
  getImagesFromFolder,
  getFoldersInFolder
};

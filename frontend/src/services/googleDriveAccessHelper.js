/**
 * Google Drive Access Helper
 * 
 * Provides utilities to help users configure proper file access
 * for the panorama viewer and other Google Drive integrations.
 */

/**
 * Check if a Google Drive file is publicly accessible
 * @param {string} fileId - Google Drive file ID
 * @param {string} apiKey - Google Drive API key
 * @returns {Promise<boolean>} True if file is accessible
 */
export const checkFileAccessibility = async (fileId, apiKey) => {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=permissions&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    // Check if file has public access
    if (data.permissions) {
      return data.permissions.some(
        permission => permission.type === 'anyone' && permission.role === 'reader'
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error checking file accessibility:', error);
    return false;
  }
};

/**
 * Get sharing instructions for users
 * @returns {object} Instructions object
 */
export const getSharingInstructions = () => {
  return {
    title: 'How to Make Google Drive Files Accessible',
    steps: [
      {
        step: 1,
        title: 'Open Google Drive',
        description: 'Go to drive.google.com and locate your panorama image'
      },
      {
        step: 2,
        title: 'Right-click the file',
        description: 'Select "Share" or "Get link" from the menu'
      },
      {
        step: 3,
        title: 'Change access settings',
        description: 'Click "Change to anyone with the link"'
      },
      {
        step: 4,
        title: 'Set viewer permissions',
        description: 'Ensure the role is set to "Viewer" (not Editor)'
      },
      {
        step: 5,
        title: 'Copy and save',
        description: 'Click "Copy link" and then "Done"'
      }
    ],
    tips: [
      'Files must be shared with "Anyone with the link" to work in the panorama viewer',
      'Make sure permissions are set to "Viewer" for read-only access',
      'You only need to do this once per file or folder',
      'For folders, you can share the entire Panorama folder at once'
    ]
  };
};

/**
 * Generate alternative image URLs for testing
 * @param {string} fileId - Google Drive file ID
 * @param {string} apiKey - Google Drive API key
 * @returns {Array<object>} Array of URL options with descriptions
 */
export const getAlternativeImageUrls = (fileId, apiKey) => {
  return [
    {
      url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`,
      method: 'Google Drive API (Recommended)',
      description: 'Uses your API key for authenticated access',
      corsIssue: false
    },
    {
      url: `https://drive.google.com/uc?export=view&id=${fileId}`,
      method: 'Direct Google Drive Viewer',
      description: 'Direct link for viewing (requires public sharing)',
      corsIssue: true
    },
    {
      url: `https://lh3.googleusercontent.com/d/${fileId}=w2000`,
      method: 'Google User Content',
      description: 'Cached version from Google servers',
      corsIssue: false
    },
    {
      url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
      method: 'Google Drive Thumbnail',
      description: 'Large thumbnail version (may be lower quality)',
      corsIssue: false
    }
  ];
};

/**
 * Test if an image URL is accessible
 * @param {string} url - URL to test
 * @returns {Promise<boolean>} True if accessible
 */
export const testImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  checkFileAccessibility,
  getSharingInstructions,
  getAlternativeImageUrls,
  testImageUrl
};

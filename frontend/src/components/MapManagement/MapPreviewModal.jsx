import React, { useState } from 'react';
import { X, Download, ExternalLink, Loader2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { formatFileSize, formatDate } from '../DocumentManagement/utils';

/**
 * Get high-quality Google Drive image URL
 * @param {string} fileId - Google Drive file ID
 * @param {number} size - Maximum size (default: 2000 for high quality)
 * @returns {string} Direct image URL
 */
const getGoogleDriveImageUrl = (fileId, size = 2000) => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

/**
 * Get Google Drive PDF embed URL
 */
const getGoogleDrivePDFUrl = (fileId) => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

const MapPreviewModal = ({ map, open, onClose, onDownload }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!map) return null;

  const isPDF = map.mimeType === 'application/pdf';
  const isImage = map.mimeType && map.mimeType.startsWith('image/');

  // Get appropriate preview URL
  const previewUrl = isPDF 
    ? getGoogleDrivePDFUrl(map.id)
    : getGoogleDriveImageUrl(map.id, 2000);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                {isPDF && <FileText className="w-5 h-5 text-red-500" />}
                {map.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isPDF 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                }`}>
                  {isPDF ? 'PDF' : 'IMAGE'}
                </span>
                <span>{formatFileSize(map.size)}</span>
                <span>•</span>
                <span>{formatDate(map.modifiedTime)}</span>
                {map.imageMediaMetadata && (map.imageMediaMetadata.width || map.imageMediaMetadata.height) && (
                  <>
                    <span>•</span>
                    <span>
                      {map.imageMediaMetadata.width} × {map.imageMediaMetadata.height}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="relative bg-gray-900 flex items-center justify-center overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {isPDF ? (
            // PDF Preview using Google Drive's embed viewer
            <iframe
              src={previewUrl}
              className="w-full h-full"
              style={{ minHeight: '500px' }}
              title={map.name}
              frameBorder="0"
            />
          ) : isImage ? (
            // Image Preview
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {imageError ? (
                <div className="flex flex-col items-center justify-center p-8 text-white">
                  <p className="text-lg mb-4">Failed to load image</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(map.webViewLink, '_blank')}
                    className="text-white border-white hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Drive
                  </Button>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt={map.name}
                  className="max-w-full max-h-full object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </>
          ) : (
            // Unsupported file type
            <div className="flex flex-col items-center justify-center p-8 text-white">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg mb-4">Preview not available for this file type</p>
              <Button
                variant="outline"
                onClick={() => window.open(map.webViewLink, '_blank')}
                className="text-white border-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Google Drive
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isPDF ? (
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>High-quality PDF document</span>
                </span>
              ) : (
                <span>High-quality map preview</span>
              )}
            </div>
            <div className="flex gap-2">
              {map.webContentLink && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownload(map.webContentLink, map.name)}
                  className="bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(map.webViewLink, '_blank')}
                className="bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Drive
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapPreviewModal;

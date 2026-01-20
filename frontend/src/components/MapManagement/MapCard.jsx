import React, { useState } from 'react';
import { Download, Eye, Share2, Loader2, Image as ImageIcon, ZoomIn, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { formatFileSize, formatDate } from '../DocumentManagement/utils';

/**
 * Get Google Drive thumbnail URL for maps
 */
const getMapThumbnailUrl = (fileId, mimeType) => {
  // For images, use Drive's thumbnail API
  if (mimeType && mimeType.startsWith('image/')) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }
  // For PDFs, return null (will show PDF icon)
  return null;
};

const MapCard = ({ map, onPreview, onDownload, onShare, index = 0 }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(map.id);
    } finally {
      setIsSharing(false);
    }
  };

  const isPDF = map.mimeType === 'application/pdf';
  const isImage = map.mimeType && map.mimeType.startsWith('image/');
  const thumbnailUrl = getMapThumbnailUrl(map.id, map.mimeType);

  return (
    <Card 
      className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-teal-100/50 dark:border-gray-700 hover:border-teal-400/50 dark:hover:border-teal-500/50"
      style={{
        animationDelay: `${index * 0.05}s`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardContent className="p-4">
        <div className="flex flex-col h-full relative z-10">
          {/* Map Thumbnail */}
          <div className="relative w-full h-52 mb-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden shadow-inner group-hover:shadow-lg transition-shadow">
            {isImage && !imageError && thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={map.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                onError={() => setImageError(true)}
              />
            ) : isPDF ? (
              <div className="w-full h-full flex items-center justify-center flex-col gap-3">
                <div className="p-4 bg-red-500/10 rounded-2xl">
                  <FileText className="w-16 h-16 text-red-500" />
                </div>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">PDF Document</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                <ImageIcon className="w-12 h-12 text-teal-300 dark:text-gray-600" />
                <span className="text-xs text-teal-300 dark:text-gray-500">No Preview</span>
              </div>
            )}
            
            {/* Gradient Overlay on hover */}
            {(isImage || isPDF) && (
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  onClick={() => onPreview(map)}
                >
                  <ZoomIn className="w-4 h-4 mr-2" />
                  {isPDF ? 'View PDF' : 'Quick View'}
                </Button>
              </div>
            )}
          </div>

          {/* Map Name */}
          <div className="mb-3 flex-1">
            <h3 
              className="font-bold text-sm mb-1 truncate text-gray-800 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" 
              title={map.name}
            >
              {map.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${
                isPDF 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
              }`}>
                {isPDF ? 'PDF' : (map.mimeType?.split('/')[1]?.toUpperCase() || 'MAP')}
              </span>
              <span>{formatFileSize(map.size)}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-4 space-y-1 border-t border-teal-50 dark:border-gray-700 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Modified</span>
              <span>{formatDate(map.modifiedTime)}</span>
            </div>
            {map.imageMediaMetadata && (map.imageMediaMetadata.width || map.imageMediaMetadata.height) && (
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Resolution</span>
                <span>{map.imageMediaMetadata.width} × {map.imageMediaMetadata.height}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-9 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
              onClick={() => onPreview(map)}
              data-testid={`preview-map-${map.id}`}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              View
            </Button>
            {map.webContentLink && (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                onClick={() => onDownload(map.webContentLink, map.name)}
                data-testid={`download-map-${map.id}`}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
              onClick={handleShare}
              disabled={isSharing}
              data-testid={`share-map-${map.id}`}
              title="Share"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapCard;

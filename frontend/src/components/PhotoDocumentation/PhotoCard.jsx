import React, { useState } from 'react';
import { Download, Eye, Share2, Loader2, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { formatFileSize, formatDate } from '../DocumentManagement/utils';

const PhotoCard = ({ photo, onPreview, onDownload, onShare, index = 0 }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(photo.id);
    } finally {
      setIsSharing(false);
    }
  };

  const getThumbnailUrl = () => {
    // Use Google Drive's thumbnail API for better quality and reliability
    // sz=w800 provides good quality for card thumbnails
    return `https://drive.google.com/thumbnail?id=${photo.id}&sz=w800`;
  };

  return (
    <Card 
      className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-100/50 dark:border-gray-700 hover:border-purple-400/50 dark:hover:border-purple-500/50"
      style={{
        animationDelay: `${index * 0.05}s`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardContent className="p-4">
        <div className="flex flex-col h-full relative z-10">
          {/* Image Thumbnail */}
          <div className="relative w-full h-52 mb-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden shadow-inner group-hover:shadow-lg transition-shadow">
            {!imageError && getThumbnailUrl() ? (
              <img
                src={getThumbnailUrl()}
                alt={photo.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                <ImageIcon className="w-12 h-12 text-purple-300 dark:text-gray-600" />
                <span className="text-xs text-purple-300 dark:text-gray-500">No Preview</span>
              </div>
            )}
            
            {/* Gradient Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                onClick={() => onPreview(photo)}
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>

          {/* Photo Name */}
          <div className="mb-3 flex-1">
            <h3 
              className="font-bold text-sm mb-1 truncate text-gray-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" 
              title={photo.name}
            >
              {photo.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                {photo.mimeType.split('/')[1]?.toUpperCase() || 'IMG'}
              </span>
              <span>{formatFileSize(photo.size)}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-4 space-y-1 border-t border-purple-50 dark:border-gray-700 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Modified</span>
              <span>{formatDate(photo.modifiedTime)}</span>
            </div>
            {photo.imageMediaMetadata && (photo.imageMediaMetadata.width || photo.imageMediaMetadata.height) && (
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Resolution</span>
                <span>{photo.imageMediaMetadata.width} × {photo.imageMediaMetadata.height}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-9 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
              onClick={() => onPreview(photo)}
              data-testid={`preview-photo-${photo.id}`}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              View
            </Button>
            {photo.webContentLink && (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={() => onDownload(photo.webContentLink, photo.name)}
                data-testid={`download-photo-${photo.id}`}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-gray-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              onClick={handleShare}
              disabled={isSharing}
              data-testid={`share-photo-${photo.id}`}
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

export default PhotoCard;

import React, { useState } from 'react';
import { Download, Eye, Share2, Loader2, CheckSquare, Square, MoreVertical, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { getFileIcon, getFileExtension, formatFileSize, formatDate } from './utils';
import FileActionsMenu from './FileActionsMenu';

const EnhancedFileCard = ({ 
  file, 
  onPreview, 
  onDownload, 
  onShare,
  onRename,
  onMove,
  onDelete,
  isSelected,
  onSelect,
  bulkMode,
  viewMode = 'grid',
  index = 0
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(file.id);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCardClick = (e) => {
    if (bulkMode && !e.target.closest('button')) {
      onSelect(file.id);
    }
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <Card 
        className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border ${
          isSelected 
            ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800 shadow-lg' 
            : 'border-blue-100/50 dark:border-gray-700 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10'
        } ${bulkMode ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
        style={{
          animationDelay: `${index * 0.05}s`,
          animation: 'fadeInUp 0.5s ease-out forwards'
        }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10"></div>
        
        {/* Gradient border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <CardContent className="p-5">
          <div className="flex flex-col h-full">
            {/* Selection checkbox and Actions Menu */}
            <div className="flex items-start justify-between mb-4 z-20 relative">
              {bulkMode ? (
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => onSelect(file.id)}
                  className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
              ) : (
                <div className="w-5"></div> /* Spacer */
              )}
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FileActionsMenu
                  file={file}
                  onPreview={() => onPreview(file)}
                  onDownload={onDownload}
                  onShare={handleShare}
                  onRename={onRename}
                  onMove={onMove}
                  onDelete={onDelete}
                />
              </div>
            </div>

            {/* File Icon */}
            <div className="flex items-center justify-center h-20 mb-4 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <div className="transform transition-transform group-hover:rotate-3 duration-300">
                {getFileIcon(file.mimeType)}
              </div>
            </div>

            {/* File Name */}
            <div className="mb-3 flex-1">
              <h3 
                className="font-bold text-sm mb-1 truncate text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
                title={file.name}
              >
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono uppercase tracking-wider">
                  {getFileExtension(file.name)}
                </span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="mb-4 space-y-1 border-t border-gray-100 dark:border-gray-700 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Modified</span>
                <span>{formatDate(file.modifiedTime)}</span>
              </div>
            </div>

            {/* Quick Actions (only show when not in bulk mode) */}
            {!bulkMode && (
              <div className="flex gap-2 pt-2 z-20 relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  onClick={() => onPreview(file)}
                  data-testid={`preview-file-${file.id}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
                {file.webContentLink && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    onClick={() => onDownload(file.webContentLink, file.name)}
                    data-testid={`download-file-${file.id}`}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List View
  return (
    <div 
      className={`group flex items-center p-3 rounded-lg border transition-all duration-200 ${
        isSelected 
          ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800' 
          : 'bg-white/60 dark:bg-gray-800/60 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 border-transparent hover:border-blue-100 dark:hover:border-gray-600'
      } ${bulkMode ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 0.03}s`,
        animation: 'fadeInLeft 0.3s ease-out forwards'
      }}
    >
      {/* Checkbox */}
      <div className="mr-4">
        {bulkMode ? (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onSelect(file.id)}
          />
        ) : (
          <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-50"></div>
        )}
      </div>

      {/* Icon */}
      <div className="mr-4 p-2 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
        {getFileIcon(file.mimeType)}
      </div>

      {/* Name and Info */}
      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-5">
          <h3 className="font-medium text-sm truncate text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {file.name}
          </h3>
        </div>
        <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(file.size)}
        </div>
        <div className="col-span-3 text-xs text-gray-500 dark:text-gray-400">
          {formatDate(file.modifiedTime)}
        </div>
        <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400 truncate">
          {file.owner}
        </div>
      </div>

      {/* Actions */}
      <div className="ml-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onPreview(file)}
          title="Preview"
        >
          <Eye className="w-4 h-4 text-blue-500" />
        </Button>
        {file.webContentLink && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onDownload(file.webContentLink, file.name)}
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </Button>
        )}
        <FileActionsMenu
          file={file}
          onPreview={() => onPreview(file)}
          onDownload={onDownload}
          onShare={handleShare}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default EnhancedFileCard;

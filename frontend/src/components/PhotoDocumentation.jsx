import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  X,
  Grid,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import FolderTreeItem from './DocumentManagement/FolderTreeItem';
import PhotoCard from './PhotoDocumentation/PhotoCard';
import ImagePreviewModal from './PhotoDocumentation/ImagePreviewModal';
import { getFolderStructure, getImagesFromFolder, isApiKeyConfigured } from '../services/googleDriveService';
// Photo Documentation folder ID
const PHOTOS_ROOT_FOLDER_ID = '1O1WlCjMvZ5lVcrOIGNMlBY4ZuQ-zEarg';

// Loading skeleton with shimmer
const PhotoCardSkeleton = () => (
  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm overflow-hidden border-0 shadow-sm">
    <CardContent className="p-4">
      <Skeleton className="h-48 mb-3 rounded-xl bg-purple-100/50 dark:bg-purple-900/20" />
      <Skeleton className="h-4 mb-2 w-3/4" />
      <Skeleton className="h-3 mb-3 w-1/2" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

const PhotoDocumentation = ({ onBack }) => {
  const [folderStructure, setFolderStructure] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Fetch photos in a folder
  const fetchPhotos = useCallback(async (folderId) => {
    setPhotosLoading(true);
    try {
      // Use direct Google Drive API - specifically get images
      const imagesList = await getImagesFromFolder(folderId);
      setPhotos(imagesList);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error(`Failed to load photos: ${error.message}`);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  // Fetch folder structure
  const fetchFolderStructure = useCallback(async () => {
    setLoading(true);
    try {
      // Use direct Google Drive API
      const structure = await getFolderStructure(PHOTOS_ROOT_FOLDER_ID, 3);
      setFolderStructure(structure);
      // Auto-select root folder
      if (!selectedFolderId) {
        setSelectedFolderId(structure.id);
        setSelectedFolderName(structure.name);
        fetchPhotos(structure.id);
      }
    } catch (error) {
      console.error('Error fetching folder structure:', error);
      toast.error(`Failed to load folder structure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId, fetchPhotos]);

  // Handle folder selection
  const handleSelectFolder = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    fetchPhotos(folderId);
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.info('Refreshing folder structure...');
    fetchFolderStructure();
  };

  // Handle preview
  const handlePreview = (photo) => {
    setPreviewPhoto(photo);
    setPreviewModalOpen(true);
  };

  // Handle download
  const handleDownload = (link, fileName) => {
    if (link) {
      const a = document.createElement('a');
      a.href = link;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started');
    } else {
      toast.error('Download link not available');
    }
  };

  // Handle share
  const handleShare = async (photoId) => {
    try {
      // Create shareable Google Drive link
      const shareLink = `https://drive.google.com/file/d/${photoId}/view?usp=sharing`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    }
  };

  // Filter photos based on search and filters
  const filteredPhotos = useMemo(() => {
    let result = photos;

    // Search filter
    if (searchQuery) {
      result = result.filter(photo =>
        photo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Image type filter
    if (filterType !== 'all') {
      result = result.filter(photo => {
        const mimeType = photo.mimeType.toLowerCase();
        switch (filterType) {
          case 'jpeg':
            return mimeType.includes('jpeg') || mimeType.includes('jpg');
          case 'png':
            return mimeType.includes('png');
          case 'gif':
            return mimeType.includes('gif');
          case 'webp':
            return mimeType.includes('webp');
          default:
            return true;
        }
      });
    }

    // Owner filter
    if (filterOwner !== 'all') {
      result = result.filter(photo => photo.owner === filterOwner);
    }

    return result;
  }, [photos, searchQuery, filterType, filterOwner]);

  // Get unique owners for filter
  const uniqueOwners = useMemo(() => {
    const owners = [...new Set(photos.map(photo => photo.owner))];
    return owners.sort();
  }, [photos]);

  useEffect(() => {
    fetchFolderStructure();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar with Glassmorphism */}
        <div className="w-80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-r border-purple-100 dark:border-gray-700 flex flex-col shadow-xl z-20">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-purple-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-purple-100/50 hover:text-purple-600 transition-all duration-300"
                data-testid="back-to-dashboard-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="ml-auto border-purple-200 hover:bg-purple-50 text-purple-600 dark:border-gray-600 dark:text-gray-300"
                data-testid="refresh-folders-btn"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Photo Albums
              </h2>
            </div>
          </div>

          {/* Folder Tree */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full bg-purple-100/50" />
                <Skeleton className="h-10 w-full bg-purple-100/50" />
                <Skeleton className="h-10 w-full bg-purple-100/50" />
              </div>
            ) : folderStructure ? (
              <FolderTreeItem
                folder={folderStructure}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No folders available
              </p>
            )}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-gray-900/30">
          {/* Header with Glassmorphism */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-purple-100 dark:border-gray-700 p-6 shadow-sm z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg transform rotate-3 transition-transform hover:rotate-0">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
                    Photo Documentation
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                    Album: <span className="font-semibold text-purple-700 dark:text-purple-300">{selectedFolderName || 'Select a folder'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-3 bg-white/40 dark:bg-gray-800/40 p-3 rounded-2xl border border-purple-50 dark:border-gray-700/50 backdrop-blur-sm">
              {/* Search */}
              <div className="relative flex-1 group">
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 z-10" />
                <Input
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 relative bg-white/80 dark:bg-gray-800/80 border-purple-100 focus:border-purple-400 focus:ring-purple-400/20 transition-all h-10 rounded-xl"
                  data-testid="search-photos-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {/* Image Type Filter */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/80 border-purple-100 rounded-lg" data-testid="filter-type-select">
                    <Filter className="w-4 h-4 mr-2 text-purple-500" />
                    <SelectValue placeholder="Image Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="jpeg">JPEG/JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>

                {/* Owner Filter */}
                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/80 border-purple-100 rounded-lg" data-testid="filter-owner-select">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {uniqueOwners.map(owner => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400 pl-1">
              {photosLoading ? (
                'Loading library...'
              ) : (
                <>
                  Found {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </>
              )}
            </div>
          </div>

          {/* Photo Grid */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {photosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <PhotoCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-gray-800 flex items-center justify-center mb-6 shadow-inner">
                    <ImageIcon className="w-12 h-12 text-purple-200 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    No photos found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                    {searchQuery
                      ? `No photos match your search "${searchQuery}"`
                      : 'This folder appears to be empty.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPhotos.map((photo, index) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      onShare={handleShare}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        photo={previewPhoto}
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default PhotoDocumentation;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Image as ImageIcon, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  X,
  Grid3x3,
  Maximize2,
  Download,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Loading skeleton with shimmer
const ImageCardSkeleton = () => (
  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm overflow-hidden border-0 shadow-sm">
    <CardContent className="p-4">
      <Skeleton className="h-64 mb-3 rounded-xl bg-indigo-100/50 dark:bg-indigo-900/20" />
      <Skeleton className="h-4 mb-2 w-3/4" />
      <Skeleton className="h-3 mb-3 w-1/2" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

// Image Card Component
const ImageCard = ({ image, onClick }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card 
      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(image)}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
          <img 
            src={`https://drive.google.com/thumbnail?id=${image.id}&sz=w800`}
            alt={image.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
            }}
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4 gap-2">
            <Button 
              size="sm" 
              className="bg-white/90 text-gray-900 hover:bg-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onClick(image);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                window.open(image.webViewLink, '_blank');
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Open
            </Button>
          </div>
        </div>

        {/* Image Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {image.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{formatFileSize(image.size)}</span>
            <span>{formatDate(image.modifiedTime)}</span>
          </div>
          {image.imageMediaMetadata && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {image.imageMediaMetadata.width} × {image.imageMediaMetadata.height}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Image Preview Modal
const ImagePreviewModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full">
        {/* Close button */}
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Image */}
        <div className="flex items-center justify-center h-full">
          <img 
            src={`https://drive.google.com/thumbnail?id=${image.id}&sz=w1600`}
            alt={image.name}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Image info overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-white font-semibold text-lg mb-2">{image.name}</h3>
          <div className="flex gap-4 text-sm text-gray-300">
            {image.imageMediaMetadata && (
              <span>{image.imageMediaMetadata.width} × {image.imageMediaMetadata.height}</span>
            )}
            <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>{new Date(image.modifiedTime).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => window.open(image.webViewLink, '_blank')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Original
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PanoramaGallery = ({ onBack }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredImages, setFilteredImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch images from Google Drive
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/panorama/images`);
      setImages(response.data);
      setFilteredImages(response.data);
      toast.success(`Loaded ${response.data.length} images`);
    } catch (error) {
      console.error('Error fetching panorama images:', error);
      toast.error('Failed to load panorama images');
      setImages([]);
      setFilteredImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Filter images based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredImages(images);
    } else {
      const filtered = images.filter(img => 
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredImages(filtered);
    }
  }, [searchQuery, images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Panorama / 650
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loading ? 'Loading...' : `${filteredImages.length} images`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchImages}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search images by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-shadow"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 shadow-xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Images</p>
                  <p className="text-4xl font-bold mt-2">{images.length}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl">
                  <ImageIcon className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Showing</p>
                  <p className="text-4xl font-bold mt-2">{filteredImages.length}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Grid3x3 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 border-0 shadow-xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Folder</p>
                  <p className="text-xl font-bold mt-2">Panorama/650</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Maximize2 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ImageCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No images found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search query' : 'This folder is empty'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                onClick={setPreviewImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal 
          image={previewImage} 
          onClose={() => setPreviewImage(null)} 
        />
      )}
    </div>
  );
};

export default PanoramaGallery;

import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  X,
  Grid3x3,
  Maximize2,
  Download,
  Eye,
  AlertCircle,
  Maximize,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Compass
} from 'lucide-react';
import ReactPannellum from 'react-pannellum';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { getImagesFromFolder, isApiKeyConfigured } from '../services/googleDriveService';

const PANORAMA_FOLDER_ID = '1tsbcsTEfg5RLHLJLYXR41avy9SrajsqM';

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

// 360° Panorama Viewer Modal
const PanoramaViewerModal = ({ image, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(-2);
  const [showControls, setShowControls] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);
  const [urlAttempt, setUrlAttempt] = useState(0);
  const containerRef = useRef(null);
  const pannellumRef = useRef(null);

  // Multiple URL formats to try for Google Drive images
  const getImageUrl = () => {
    if (!image) return '';
    
    const urls = [
      // Try direct download first
      `https://drive.google.com/uc?export=download&id=${image.id}`,
      // Try with CORS proxy
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${image.id}`)}`,
      // Try thumbnail at max size
      `https://drive.google.com/thumbnail?id=${image.id}&sz=w2000`,
    ];
    
    return urls[urlAttempt] || urls[0];
  };

  const imageUrl = getImageUrl();

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        setAutoRotate(prev => prev === 0 ? -2 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  // Auto-hide controls
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 3000);
    };

    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  if (!image) return null;

  const handlePanoramaLoad = () => {
    setImageLoading(false);
    setImageError(null);
    toast.success('360° Panorama loaded!');
  };

  const handlePanoramaError = (err) => {
    console.error('Panorama load error:', err, 'URL attempt:', urlAttempt);
    
    // Try next URL format
    if (urlAttempt < 2) {
      setUrlAttempt(prev => prev + 1);
      setImageLoading(true);
      setImageError(null);
      toast.info(`Trying alternative loading method (${urlAttempt + 2}/3)...`);
    } else {
      setImageLoading(false);
      setImageError(err);
      toast.error('Unable to load 360° view. Please try viewing the original image.');
    }
  };

  const config = {
    type: 'equirectangular',
    autoLoad: true,
    autoRotate: autoRotate,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    mouseZoom: true,
    draggable: true,
    keyboardZoom: true,
    friction: 0.15,
    compass: true,
    orientationOnByDefault: false,
    pitch: 0,
    yaw: 180,
    hfov: 110,
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 360° Panorama Viewer */}
      <div className="w-full h-full relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading 360° panorama...</p>
            </div>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center max-w-md p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unable to load 360° view</h3>
              <p className="text-gray-400 mb-4">
                This image may not be in panoramic format or there's a loading issue.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => window.open(image.webViewLink, '_blank')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  View Original
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ReactPannellum
            id="panorama-viewer"
            sceneId="main-scene"
            imageSource={imageUrl}
            type="equirectangular"
            pitch={0}
            yaw={180}
            hfov={110}
            autoLoad={true}
            autoRotate={autoRotate}
            showZoomCtrl={false}
            showFullscreenCtrl={false}
            mouseZoom={true}
            draggable={true}
            keyboardZoom={true}
            friction={0.15}
            compass={true}
            orientationOnByDefault={false}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </div>

      {/* Control Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 p-0 backdrop-blur-sm"
                title="Close (ESC)"
              >
                <X className="w-6 h-6" />
              </Button>
              <div>
                <h3 className="text-white font-semibold text-lg">{image.name}</h3>
                <div className="flex gap-4 text-sm text-gray-300 mt-1">
                  {image.imageMediaMetadata && (
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      {image.imageMediaMetadata.width} × {image.imageMediaMetadata.height}
                    </span>
                  )}
                  <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open(image.webViewLink, '_blank')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                title="Download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Side Control Panel */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
          <Button
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-14 h-14 p-0 backdrop-blur-sm"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            <Maximize className="w-6 h-6" />
          </Button>

          <Button
            onClick={() => setAutoRotate(prev => prev === 0 ? -2 : 0)}
            className={`rounded-full w-14 h-14 p-0 backdrop-blur-sm transition-all ${
              autoRotate !== 0 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={autoRotate !== 0 ? 'Stop Auto-Rotate (R)' : 'Auto-Rotate (R)'}
          >
            <RotateCw className={`w-6 h-6 ${autoRotate !== 0 ? 'animate-spin' : ''}`} style={autoRotate !== 0 ? {animationDuration: '4s'} : {}} />
          </Button>

          <Button
            onClick={() => {
              // Reset view to default using Pannellum API
              const viewer = ReactPannellum.getViewer('panorama-viewer');
              if (viewer) {
                viewer.setPitch(0);
                viewer.setYaw(180);
                viewer.setHfov(110);
                toast.success('View reset');
              }
            }}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-14 h-14 p-0 backdrop-blur-sm"
            title="Reset View"
          >
            <Compass className="w-6 h-6" />
          </Button>
        </div>

        {/* Bottom Instruction Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              <span>Drag to look around</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span>Scroll to zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded">F</kbd>
              <span>Fullscreen</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded">R</kbd>
              <span>Auto-rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd>
              <span>Close</span>
            </div>
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
      // Use direct Google Drive API
      const imageFiles = await getImagesFromFolder(PANORAMA_FOLDER_ID);
      setImages(imageFiles);
      setFilteredImages(imageFiles);
      toast.success(`Loaded ${imageFiles.length} images`);
    } catch (error) {
      console.error('Error fetching panorama images:', error);
      toast.error(`Failed to load panorama images: ${error.message}`);
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
      {/* API Key Warning Banner */}
      {!isApiKeyConfigured() && (
        <div className="bg-amber-500/90 backdrop-blur-sm border-b border-amber-600 px-6 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-white">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Google Drive API Key Not Configured</p>
              <p className="text-sm text-amber-100">
                Add REACT_APP_GOOGLE_DRIVE_API_KEY to your .env file to view panorama images.
              </p>
            </div>
          </div>
        </div>
      )}
      
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

      {/* Image Preview Modal - Now with 360° Panorama Viewer */}
      {previewImage && (
        <PanoramaViewerModal 
          image={previewImage} 
          onClose={() => setPreviewImage(null)} 
        />
      )}
    </div>
  );
};

export default PanoramaGallery;

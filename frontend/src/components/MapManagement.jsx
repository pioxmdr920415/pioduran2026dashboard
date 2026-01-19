import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Map as MapIcon, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  X,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import PhotoCard from './PhotoDocumentation/PhotoCard';
import ImagePreviewModal from './PhotoDocumentation/ImagePreviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Loading skeleton
const MapCardSkeleton = () => (
  <Card className="bg-white dark:bg-gray-800">
    <CardContent className="p-4">
      <Skeleton className="h-48 mb-3 rounded-lg" />
      <Skeleton className="h-4 mb-2" />
      <Skeleton className="h-3 mb-3 w-2/3" />
      <Skeleton className="h-3 mb-2" />
      <Skeleton className="h-3 mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-10" />
      </div>
    </CardContent>
  </Card>
);

// Recursive folder tree component
const FolderTreeNode = ({ folder, level = 0, onSelect, selectedFolderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;

  return (
    <div className="w-full">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          hover:bg-blue-50 dark:hover:bg-gray-700
          ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
          onSelect(folder.id, folder.name, folder.path || folder.name);
        }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="flex-shrink-0">
          {isOpen || !hasChildren ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
        </span>
        <span className="text-sm font-medium truncate">{folder.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="mt-1">
          {folder.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              level={level + 1}
              onSelect={onSelect}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Map category component
const MapCategory = ({ categoryKey, categoryData, onSelectFolder, selectedFolderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [folderStructure, setFolderStructure] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFolderStructure = async () => {
    if (folderStructure) return; // Already loaded
    
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/maps/folders/${categoryData.folder_id}`);
      setFolderStructure(response.data);
    } catch (error) {
      console.error('Error fetching folder structure:', error);
      toast.error(`Failed to load ${categoryData.name} structure`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen && !folderStructure) {
      fetchFolderStructure();
    }
    setIsOpen(!isOpen);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle} className="w-full mb-2">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white transition-all shadow-md">
          <MapIcon className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm flex-1 text-left">{categoryData.name}</span>
          {isOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        {loading ? (
          <div className="px-3 py-2">
            <Skeleton className="h-8 mb-2" />
            <Skeleton className="h-8 mb-2" />
            <Skeleton className="h-8" />
          </div>
        ) : folderStructure ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <FolderTreeNode
              folder={folderStructure}
              onSelect={onSelectFolder}
              selectedFolderId={selectedFolderId}
            />
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
};

const MapManagement = ({ onBack }) => {
  const [categories, setCategories] = useState({
    administrative: { name: 'Administrative Map', folder_id: '1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi' },
    topographic: { name: 'Topographic Map', folder_id: '1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2' },
    hazard: { name: 'Hazard Map', folder_id: '16xy_oUAr6sWb3JE9eNrxYJdAMDRKG' },
    mgb: { name: 'MGB-Map', folder_id: '1yQmtrKfKiMOFA933W0emzeGoexMp' },
    mpdc: { name: 'MPDC-Map', folder_id: '1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1' }
  });
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [selectedFolderPath, setSelectedFolderPath] = useState('');
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMap, setPreviewMap] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Fetch map categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/maps/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching map categories:', error);
        toast.error('Failed to load map categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch maps in a folder
  const fetchMaps = async (folderId) => {
    setMapsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/maps/files/${folderId}`);
      setMaps(response.data);
    } catch (error) {
      console.error('Error fetching maps:', error);
      toast.error('Failed to load maps');
      setMaps([]);
    } finally {
      setMapsLoading(false);
    }
  };

  // Handle folder selection
  const handleSelectFolder = (folderId, folderName, folderPath) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    setSelectedFolderPath(folderPath);
    fetchMaps(folderId);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (selectedFolderId) {
      fetchMaps(selectedFolderId);
      toast.success('Maps refreshed');
    }
  };

  // Handle view map
  const handleViewMap = (map) => {
    setPreviewMap(map);
    setPreviewModalOpen(true);
  };

  // Filter maps based on search
  const filteredMaps = useMemo(() => {
    if (!searchQuery.trim()) return maps;
    
    const query = searchQuery.toLowerCase();
    return maps.filter(map => 
      map.name.toLowerCase().includes(query)
    );
  }, [maps, searchQuery]);

  // Get map type badge color
  const getMapTypeBadge = (mimeType) => {
    if (mimeType === 'application/pdf') {
      return { label: 'PDF', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
    }
    return { label: 'IMAGE', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-sm border-b border-teal-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-teal-100/50 hover:text-teal-600 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <MapIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                    Maps Management
                  </h1>
                  {selectedFolderPath && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {selectedFolderPath}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={!selectedFolderId || mapsLoading}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${mapsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Map Categories */}
          <div className="lg:col-span-1">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-xl border-teal-100 dark:border-gray-700 sticky top-24">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-teal-100 dark:border-gray-700 pb-4">
                  <MapIcon className="w-5 h-5 text-teal-600" />
                  Map Categories
                </h2>
                <ScrollArea className="h-[calc(100vh-280px)] pr-2">
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full bg-teal-50" />
                      <Skeleton className="h-12 w-full bg-teal-50" />
                      <Skeleton className="h-12 w-full bg-teal-50" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(categories).map(([key, data]) => (
                        <MapCategory
                          key={key}
                          categoryKey={key}
                          categoryData={data}
                          onSelectFolder={handleSelectFolder}
                          selectedFolderId={selectedFolderId}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Maps Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6 relative group z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-teal-100 dark:border-gray-700 relative">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-500" />
                      <Input
                        placeholder="Search maps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-gray-900/50 border-teal-100 focus:border-teal-400 focus:ring-teal-400/20"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-sm font-medium text-teal-700 dark:text-teal-300 whitespace-nowrap border border-teal-100 dark:border-teal-800">
                      {filteredMaps.length} map{filteredMaps.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Maps Grid */}
            {!selectedFolderId ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-teal-100 dark:border-gray-700 backdrop-blur-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                  <MapIcon className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Select a Map Category
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center">
                  Choose a category from the sidebar to browse the available map collection
                </p>
              </div>
            ) : mapsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <MapCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredMaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-teal-100 dark:border-gray-700 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <MapIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No maps found' : 'No maps in this folder'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Try adjusting your search query' : 'This folder is currently empty'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMaps.map((map, index) => {
                  const badge = getMapTypeBadge(map.mimeType);
                  return (
                    <Card 
                      key={map.id} 
                      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-teal-100/50 overflow-hidden"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        animation: 'fadeInUp 0.5s ease-out forwards'
                      }}
                    >
                      <CardContent className="p-4">
                        {/* Thumbnail */}
                        <div 
                          className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 overflow-hidden cursor-pointer shadow-inner"
                          onClick={() => handleViewMap(map)}
                        >
                          {map.thumbnailLink ? (
                            <img
                              src={map.thumbnailLink}
                              alt={map.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700">
                              <MapIcon className="w-12 h-12 text-teal-200 dark:text-gray-600" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button size="sm" className="bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30">
                              View Map
                            </Button>
                          </div>
                        </div>

                        {/* Map Info */}
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 truncate group-hover:text-teal-600 transition-colors" title={map.name}>
                          {map.name}
                        </h3>
                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between">
                            <span>Modified:</span>
                            <span className="font-medium">{new Date(map.modifiedTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span className="font-medium">{(parseInt(map.size) / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewMap(map)}
                            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all"
                            size="sm"
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => window.open(map.webViewLink, '_blank')}
                            variant="outline"
                            className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-gray-600 dark:text-gray-300"
                            size="sm"
                          >
                            Drive
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMap && (
        <ImagePreviewModal
          open={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewMap(null);
          }}
          image={previewMap}
        />
      )}
    </div>
  );
};

export default MapManagement;

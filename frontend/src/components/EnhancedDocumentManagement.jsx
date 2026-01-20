import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  Filter,
  X,
  Upload,
  FolderPlus,
  CheckSquare,
  Square,
  Trash2,
  FolderInput,
  Download,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { getFolderStructure, listFilesInFolder, searchFilesInFolder, isApiKeyConfigured } from '../services/googleDriveService';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import EnhancedFolderTreeItem from './DocumentManagement/EnhancedFolderTreeItem';
import EnhancedFileCard from './DocumentManagement/EnhancedFileCard';
import FileUploadModal from './DocumentManagement/FileUploadModal';
import FilePreviewModal from './DocumentManagement/FilePreviewModal';
import RenameDialog from './DocumentManagement/RenameDialog';
import MoveDialog from './DocumentManagement/MoveDialog';
import CreateFolderDialog from './DocumentManagement/CreateFolderDialog';

// Document Management folder ID (Google Drive root for documents)
const DOCUMENTS_ROOT_FOLDER_ID = '15_xiFeXu_vdIe2CYrjGaRCAho2OqhGvo';

// Loading skeleton with shimmer
const FileCardSkeleton = () => (
  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm overflow-hidden">
    <CardContent className="p-6">
      <Skeleton className="h-24 mb-4 bg-blue-100/50 dark:bg-blue-900/20" />
      <Skeleton className="h-4 mb-2 w-3/4" />
      <Skeleton className="h-3 mb-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 flex-1 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

const EnhancedDocumentManagement = ({ onBack }) => {
  const [folderStructure, setFolderStructure] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentSearch, setContentSearch] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Bulk operations
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  
  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [renameItemType, setRenameItemType] = useState('File');
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveFiles, setMoveFiles] = useState([]);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState('file');

  // Fetch folder structure
  const fetchFolderStructure = async () => {
    setLoading(true);
    try {
      if (!isApiKeyConfigured()) {
        throw new Error('Google Drive API key is not configured. Please add REACT_APP_GOOGLE_DRIVE_API_KEY to your .env file.');
      }

      const structure = await getFolderStructure(DOCUMENTS_ROOT_FOLDER_ID, 3);
      setFolderStructure(structure);

      // Auto-select root folder if none selected
      if (!selectedFolderId) {
        setSelectedFolderId(structure.id);
        setSelectedFolderName(structure.name);
        fetchFiles(structure.id);
      }
    } catch (error) {
      console.error('Error fetching folder structure:', error);
      toast.error(error.message || 'Failed to load folder structure');
    } finally {
      setLoading(false);
    }
  };

  // Fetch files in a folder
  const fetchFiles = useCallback(async (folderId) => {
    setFilesLoading(true);
    try {
      if (!isApiKeyConfigured()) {
        throw new Error('Google Drive API key is not configured. Please add REACT_APP_GOOGLE_DRIVE_API_KEY to your .env file.');
      }

      const filesList = await listFilesInFolder(folderId, {
        fields: 'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,owners)'
      });

      // Normalize owner field from owners array
      const normalizedFiles = filesList.map(file => ({
        ...file,
        owner: file.owners && file.owners.length > 0 ? file.owners[0].displayName || file.owners[0].emailAddress || 'Unknown' : 'Unknown'
      }));

      setFiles(normalizedFiles);
      setSelectedFileIds(new Set()); // Clear selection when changing folders
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(error.message || 'Failed to load files');
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  // Search files
  const searchFiles = async (query, useContentSearch) => {
    if (!query.trim()) {
      fetchFiles(selectedFolderId);
      return;
    }

    setFilesLoading(true);
    try {
      if (!isApiKeyConfigured()) {
        throw new Error('Google Drive API key is not configured. Please add REACT_APP_GOOGLE_DRIVE_API_KEY to your .env file.');
      }

      // Google Drive API supports name search with API key; content search would
      // require additional scopes/OAuth, so we only support name search in SPA mode.
      if (useContentSearch) {
        toast.info('Content search is not available in read-only SPA mode. Using name search instead.');
      }

      const results = await searchFilesInFolder(selectedFolderId, query);

      const normalizedFiles = results.map(file => ({
        ...file,
        owner: file.owners && file.owners.length > 0 ? file.owners[0].displayName || file.owners[0].emailAddress || 'Unknown' : 'Unknown'
      }));

      setFiles(normalizedFiles);
      toast.success(`Found ${normalizedFiles.length} file(s)`);
    } catch (error) {
      console.error('Error searching files:', error);
      toast.error(error.message || 'Search failed');
    } finally {
      setFilesLoading(false);
    }
  };

  // Handle folder selection
  const handleSelectFolder = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    setSearchQuery(''); // Clear search when changing folders
    fetchFiles(folderId);
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.info('Refreshing...');
    fetchFolderStructure();
    if (selectedFolderId) {
      fetchFiles(selectedFolderId);
    }
  };

  // Handle preview
  const handlePreview = (file) => {
    setPreviewFile(file);
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
  const handleShare = async (fileId) => {
    try {
      // Generate a standard Google Drive shareable link
      const shareLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    }
  };

  // File operations
  const handleRenameFile = async (_fileId, _newName) => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Renaming files is not available in SPA read-only mode. Please rename files directly in Google Drive.');
  };

  const handleDeleteFile = async (_fileId) => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Deleting files is not available in SPA read-only mode. Please delete files directly in Google Drive.');
  };

  const handleMoveFile = async (_targetFolderId) => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Moving files is not available in SPA read-only mode. Please organize files directly in Google Drive.');
  };

  // Folder operations
  const handleCreateFolder = async (_folderName, _parentId) => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Creating folders is not available in SPA read-only mode. Please create folders directly in Google Drive.');
  };

  const handleRenameFolder = async (_folderId, _newName) => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Renaming folders is not available in SPA read-only mode. Please rename folders directly in Google Drive.');
  };

  const handleDeleteFolder = async (_folderId) => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Deleting folders is not available in SPA read-only mode. Please delete folders directly in Google Drive.');
  };

  // Bulk operations
  const handleSelectFile = (fileId) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFileIds.size === filteredFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleBulkDelete = async () => {
    // Write operations are not supported in SPA read-only mode
    toast.info('Bulk delete is not available in SPA read-only mode. Please delete files directly in Google Drive.');
  };

  const handleBulkMove = () => {
    const selectedFiles = files.filter(f => selectedFileIds.has(f.id));
    setMoveFiles(selectedFiles);
    setMoveDialogOpen(true);
  };

  // Search handling
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchFiles(searchQuery, contentSearch);
    } else {
      fetchFiles(selectedFolderId);
    }
  };

  // Filter files based on filters
  const filteredFiles = useMemo(() => {
    let result = files;

    // File type filter
    if (filterType !== 'all') {
      result = result.filter(file => {
        const mimeType = file.mimeType.toLowerCase();
        switch (filterType) {
          case 'pdf':
            return mimeType.includes('pdf');
          case 'word':
            return mimeType.includes('word') || mimeType.includes('document');
          case 'excel':
            return mimeType.includes('sheet') || mimeType.includes('excel');
          case 'powerpoint':
            return mimeType.includes('presentation') || mimeType.includes('powerpoint');
          case 'text':
            return mimeType.includes('text/plain');
          default:
            return true;
        }
      });
    }

    // Owner filter
    if (filterOwner !== 'all') {
      result = result.filter(file => file.owner === filterOwner);
    }

    return result;
  }, [files, filterType, filterOwner]);

  // Get unique owners for filter
  const uniqueOwners = useMemo(() => {
    const owners = [...new Set(files.map(file => file.owner))];
    return owners.sort();
  }, [files]);

  useEffect(() => {
    fetchFolderStructure();
  }, []);

  // Dialog handlers
  const openRenameDialog = (item, type) => {
    setRenameItem(item);
    setRenameItemType(type);
    setRenameDialogOpen(true);
  };

  const openDeleteConfirm = (item, type) => {
    setDeleteItem(item);
    setDeleteItemType(type);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteItemType === 'file') {
      await handleDeleteFile(deleteItem.id);
    } else {
      await handleDeleteFolder(deleteItem.id);
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="flex h-screen overflow-hidden">
        {/* Enhanced Sidebar with Glassmorphism */}
        <div className="w-80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-r border-blue-100 dark:border-gray-700 flex flex-col shadow-xl z-20">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-blue-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-blue-100/50 hover:text-blue-600 transition-all duration-300"
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
                className="ml-auto border-blue-200 hover:bg-blue-50 text-blue-600 hover:text-blue-700 dark:border-gray-600 dark:text-gray-300"
                data-testid="refresh-folders-btn"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Folder Structure
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (folderStructure) {
                    setCreateFolderParent(folderStructure);
                    setCreateFolderDialogOpen(true);
                  }
                }}
                className="text-blue-600 hover:bg-blue-100/50"
                title="Create folder in root"
              >
                <FolderPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Folder Tree */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full bg-blue-100/50" />
                <Skeleton className="h-10 w-full bg-blue-100/50" />
                <Skeleton className="h-10 w-full bg-blue-100/50" />
              </div>
            ) : folderStructure ? (
              <EnhancedFolderTreeItem
                folder={folderStructure}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
                onCreateSubfolder={(folder) => {
                  setCreateFolderParent(folder);
                  setCreateFolderDialogOpen(true);
                }}
                onRenameFolder={(folder) => openRenameDialog(folder, 'Folder')}
                onDeleteFolder={(folder) => openDeleteConfirm(folder, 'folder')}
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
          {/* Enhanced Header */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-blue-100 dark:border-gray-700 p-6 shadow-sm z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 drop-shadow-sm">
                  Document Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Current Folder: <span className="font-semibold text-blue-700 dark:text-blue-300">{selectedFolderName}</span>
                </p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                  Read-only mode: This SPA uses a Google Drive API key. To upload, rename, delete or move files and folders, please manage them directly in Google Drive.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mr-2">
                  <Button
                    variant={viewMode === 'grid' ? 'white' : 'ghost'}
                    size="sm"
                    className={`h-8 px-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'white' : 'ghost'}
                    size="sm"
                    className={`h-8 px-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <ListIcon className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                  size="sm"
                  onClick={() => toast.info('Uploading files is not available in SPA read-only mode. Please upload files directly in Google Drive.')}
                  disabled={!selectedFolderId}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`border-blue-200 hover:bg-blue-50 ${bulkMode ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
                >
                  {bulkMode ? <Square className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                  {bulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
                </Button>
              </div>
            </div>

            {/* Bulk Actions Bar with Animation */}
            {bulkMode && selectedFileIds.size > 0 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300 shadow-md">
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-200 text-orange-700 text-xs font-bold">
                    {selectedFileIds.size}
                  </span>
                  file(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMove}
                    className="border-orange-300 hover:bg-orange-100 text-orange-700"
                  >
                    <FolderInput className="w-4 h-4 mr-2" />
                    Move
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-3 bg-white/40 dark:bg-gray-800/40 p-3 rounded-2xl border border-blue-50 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 z-10" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 relative bg-white/80 dark:bg-gray-800/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 transition-all h-10 rounded-xl"
                    data-testid="search-files-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        fetchFiles(selectedFolderId);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={!searchQuery.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-blue-500/20 transition-all"
                >
                  Search
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-gray-700">
                  <Switch
                    id="content-search"
                    checked={contentSearch}
                    onCheckedChange={setContentSearch}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="content-search" className="text-sm cursor-pointer text-gray-600 dark:text-gray-300">
                    Search file content
                  </Label>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 bg-white/80 border-blue-100 rounded-lg" data-testid="filter-type-select">
                    <Filter className="w-4 h-4 mr-2 text-blue-500" />
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="word">Word</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger className="w-40 bg-white/80 border-blue-100 rounded-lg" data-testid="filter-owner-select">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {uniqueOwners.map(owner => (
                      <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bulkMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="ml-auto"
                  >
                    {selectedFileIds.size === filteredFiles.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400 pl-1">
              Showing {filteredFiles.length} {filteredFiles.length === 1 ? 'document' : 'documents'}
            </div>
          </div>

          {/* File Gallery */}
          <ScrollArea className="flex-1 p-6">
            {filesLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                  <FileCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredFiles.length > 0 ? (
              <div 
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
                data-testid="file-gallery"
              >
                {filteredFiles.map((file, index) => (
                  <EnhancedFileCard
                    key={file.id}
                    file={file}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onRename={(file) => openRenameDialog(file, 'File')}
                    onMove={(file) => {
                      setMoveFiles([file]);
                      setMoveDialogOpen(true);
                    }}
                    onDelete={(file) => openDeleteConfirm(file, 'file')}
                    isSelected={selectedFileIds.has(file.id)}
                    onSelect={handleSelectFile}
                    bulkMode={bulkMode}
                    viewMode={viewMode}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 mt-20">
                <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="w-12 h-12 text-blue-200 dark:text-gray-600" />
                </div>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No documents found</p>
                <p className="text-sm mt-2 max-w-xs text-center">
                  {searchQuery || filterType !== 'all' || filterOwner !== 'all'
                    ? 'Try adjusting your filters to find what you are looking for.'
                    : 'This folder is empty. Upload some files to get started!'}
                </p>
                {!searchQuery && (
                   <Button 
                     variant="outline" 
                     className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                     onClick={() => toast.info('Uploading files is not available in SPA read-only mode. Please upload files directly in Google Drive.')}
                   >
                     <Upload className="w-4 h-4 mr-2" />
                     Upload Now
                   </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Modals */}
      {/* Upload modal kept for UI consistency but shows read-only info */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folderId={selectedFolderId}
        folderName={selectedFolderName}
        onUploadSuccess={() => fetchFiles(selectedFolderId)}
      />

      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        onDownload={handleDownload}
      />

      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        item={renameItem}
        itemType={renameItemType}
        onRename={renameItemType === 'File' ? handleRenameFile : handleRenameFolder}
      />

      <MoveDialog
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        files={moveFiles}
        folderStructure={folderStructure}
        onMove={handleMoveFile}
      />

      {/* CreateFolderDialog remains for future backend/OAuth support but is read-only in current SPA mode */}
      <CreateFolderDialog
        isOpen={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        parentFolder={createFolderParent}
        onCreateFolder={handleCreateFolder}
      />

      {/* Delete confirmation dialog will also respect read-only mode (no real delete) */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-red-100 dark:border-red-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete {deleteItemType}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{deleteItem?.name}"</span>? 
              <br />This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnhancedDocumentManagement;

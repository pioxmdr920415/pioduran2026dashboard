import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  Filter,
  X,
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
import FileCard from './DocumentManagement/FileCard';
import { getFolderStructure, listFilesInFolder, isApiKeyConfigured } from '../services/googleDriveService';
// Default Document Management folder ID - update this with your actual folder ID
const DOCUMENTS_ROOT_FOLDER_ID = '1SiOmUx8UZN5gdABHxHY2FI4AOz9Jney1';

// Loading skeleton
const FileCardSkeleton = () => (
  <Card className="bg-white dark:bg-gray-800">
    <CardContent className="p-6">
      <Skeleton className="h-24 mb-4" />
      <Skeleton className="h-4 mb-2" />
      <Skeleton className="h-3 mb-4 w-2/3" />
      <Skeleton className="h-3 mb-2" />
      <Skeleton className="h-3 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-10" />
      </div>
    </CardContent>
  </Card>
);

const DocumentManagement = ({ onBack }) => {
  const [folderStructure, setFolderStructure] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');

  // Fetch folder structure
  const fetchFolderStructure = async () => {
    setLoading(true);
    try {
      // Use direct Google Drive API
      const structure = await getFolderStructure(DOCUMENTS_ROOT_FOLDER_ID, 3);
      setFolderStructure(structure);
      // Auto-select root folder
      setSelectedFolderId(structure.id);
      setSelectedFolderName(structure.name);
      fetchFiles(structure.id);
    } catch (error) {
      console.error('Error fetching folder structure:', error);
      toast.error(`Failed to load folder structure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files in a folder
  const fetchFiles = async (folderId) => {
    setFilesLoading(true);
    try {
      // Use direct Google Drive API
      const filesList = await listFilesInFolder(folderId);
      setFiles(filesList);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(`Failed to load files: ${error.message}`);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // Handle folder selection
  const handleSelectFolder = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    fetchFiles(folderId);
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.info('Refreshing folder structure...');
    fetchFolderStructure();
  };

  // Handle preview
  const handlePreview = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.error('Preview link not available');
    }
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
      const response = await axios.post(`${BACKEND_URL}/api/documents/share/${fileId}`);
      if (response.data.success) {
        // Copy to clipboard
        navigator.clipboard.writeText(response.data.shareLink);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    }
  };

  // Filter files based on search and filters
  const filteredFiles = useMemo(() => {
    let result = files;

    // Search filter
    if (searchQuery) {
      result = result.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
  }, [files, searchQuery, filterType, filterOwner]);

  // Get unique owners for filter
  const uniqueOwners = useMemo(() => {
    const owners = [...new Set(files.map(file => file.owner))];
    return owners.sort();
  }, [files]);

  useEffect(() => {
    fetchFolderStructure();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
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
                data-testid="refresh-folders-btn"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Document Folders
            </h2>
          </div>

          {/* Folder Tree */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : folderStructure ? (
              <FolderTreeItem
                folder={folderStructure}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No folders available
              </p>
            )}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Document Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current Folder: <span className="font-semibold">{selectedFolderName}</span>
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-files-input"
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48" data-testid="filter-type-select">
                  <Filter className="w-4 h-4 mr-2" />
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
                <SelectTrigger className="w-48" data-testid="filter-owner-select">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {uniqueOwners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Gallery */}
          <ScrollArea className="flex-1 p-6">
            {filesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <FileCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredFiles.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                data-testid="file-gallery"
              >
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No documents found</p>
                <p className="text-sm">
                  {searchQuery || filterType !== 'all' || filterOwner !== 'all'
                    ? 'Try adjusting your filters'
                    : 'This folder is empty'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Plus, Pencil, Trash2, Package, MapPin, Hash, Tags, 
  TrendingUp, AlertTriangle, CheckCircle, Box, Cloud, CloudOff, 
  Printer, LayoutGrid, List, ChevronDown, ChevronUp, Search, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Header } from './Header';
import { BackgroundBlobs } from './BackgroundBlobs';
import { getSupplyItems, isApiKeyConfigured, invalidateCache } from '../services/optimizedGoogleSheetsService';

const SupplyInventory = ({ onBack }) => {
  const [supplies, setSupplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupply, setCurrentSupply] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Office-Supplies',
    quantity: '',
    unit: 'Pieces',
    location: 'B1',
    status: 'active'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      setIsLoading(true);
      
      if (!isApiKeyConfigured()) {
        toast.error('Google Sheets API key not configured. Please add REACT_APP_GOOGLE_SHEETS_API_KEY to .env file');
        setSupplies([]);
        return;
      }
      
      const data = await getSupplyItems();
      setSupplies(data);
      toast.success(`Loaded ${data.length} items from Google Sheets!`);
    } catch (error) {
      console.error('Error fetching supplies:', error);
      toast.error(error.message || 'Failed to load supply items from Google Sheets');
      setSupplies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sorted = [...supplies].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSupplies(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary" /> 
      : <ChevronDown className="h-4 w-4 text-primary" />;
  };

  const handleOpenDialog = (supply = null) => {
    if (supply) {
      setIsEditMode(true);
      setCurrentSupply(supply);
      setFormData({
        itemName: supply.itemName,
        category: supply.category,
        quantity: supply.quantity,
        unit: supply.unit,
        location: supply.location,
        status: supply.status || 'active'
      });
    } else {
      setIsEditMode(false);
      setCurrentSupply(null);
      setFormData({
        itemName: '',
        category: 'Office-Supplies',
        quantity: '',
        unit: 'Pieces',
        location: 'B1',
        status: 'active'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentSupply(null);
    setFormData({
      itemName: '',
      category: 'Office-Supplies',
      quantity: '',
      unit: 'Pieces',
      location: 'B1',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.info('Direct write to Google Sheets not available with API key authentication. Please use backend API or service account for write operations.');
    handleCloseDialog();
  };

  const handleDelete = async (supply) => {
    toast.info('Direct delete from Google Sheets not available with API key authentication. Please use backend API or service account for write operations.');
  };

  const filteredSupplies = supplies.filter(supply =>
    (supply.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supply.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supply.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge color and icon
  const getStatusInfo = (quantity) => {
    const qty = parseInt(quantity);
    if (qty === 0) return { 
      gradient: 'from-red-500 via-red-600 to-rose-600', 
      text: 'Out of Stock',
      icon: AlertTriangle,
      pulse: true,
      color: 'red'
    };
    if (qty < 5) return { 
      gradient: 'from-yellow-500 via-orange-500 to-amber-600', 
      text: 'Low Stock',
      icon: AlertTriangle,
      pulse: true,
      color: 'orange'
    };
    return { 
      gradient: 'from-green-500 via-emerald-500 to-teal-600', 
      text: 'In Stock',
      icon: CheckCircle,
      pulse: false,
      color: 'green'
    };
  };

  // Calculate stats
  const totalItems = supplies.length;
  const lowStockItems = supplies.filter(s => parseInt(s.quantity) < 5 && parseInt(s.quantity) > 0).length;
  const outOfStockItems = supplies.filter(s => parseInt(s.quantity) === 0).length;

  // Print functionality
  const handlePrint = () => {
    window.print();
    toast.success(`Printing ${searchQuery ? 'filtered' : 'all'} supply items...`);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <BackgroundBlobs />
      <div className="relative z-10 min-h-screen flex">
        <div className="flex-1 flex flex-col">
          <Header 
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {/* Enhanced Header Section with Stats */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-indigo-500/20 blur-3xl -z-10 animate-pulse"></div>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    onClick={onBack}
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:scale-110 transition-transform duration-300 border-2 hover:border-cyan-400"
                    data-testid="back-to-dashboard-btn"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                      Supply Inventory
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                      <Box className="h-4 w-4" />
                      Manage supplies and inventory levels
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'border-cyan-400/20'}`}
                    >
                      <LayoutGrid className={`h-5 w-5 ${viewMode === 'grid' ? 'animate-pulse' : ''}`} />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      onClick={() => setViewMode('table')}
                      className={`p-2 ${viewMode === 'table' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'border-cyan-400/20'}`}
                    >
                      <List className={`h-5 w-5 ${viewMode === 'table' ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Google Sheets Connection Banner */}
                {isApiKeyConfigured() ? (
                  <div className="hidden mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Cloud className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          Connected to Google Sheets
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                          Data is being fetched directly from Google Sheets
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <CloudOff className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          Google Sheets API Key Not Configured
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          Please add REACT_APP_GOOGLE_SHEETS_API_KEY to your .env file
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">Total Items</p>
                        <p className="text-3xl font-bold mt-1">{totalItems}</p>
                      </div>
                      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Package className="h-7 w-7" />
                      </div>
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">Low Stock</p>
                        <p className="text-3xl font-bold mt-1">{lowStockItems}</p>
                      </div>
                      <div className={`h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${lowStockItems > 0 ? 'animate-pulse' : ''}`}>
                        <AlertTriangle className="h-7 w-7" />
                      </div>
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">Out of Stock</p>
                        <p className="text-3xl font-bold mt-1">{outOfStockItems}</p>
                      </div>
                      <div className={`h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${outOfStockItems > 0 ? 'animate-bounce' : ''}`}>
                        <AlertTriangle className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="🔍 Search supplies by name, category, location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 relative bg-card/50 backdrop-blur-sm border-cyan-400/20 focus:border-cyan-400 transition-all duration-300 h-12"
                      data-testid="search-supplies-input"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 h-12 px-4 print:hidden"
                    data-testid="print-supply-btn"
                  >
                    <Printer className="h-5 w-5 mr-2" />
                    Print
                  </Button>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 h-12 px-6"
                    data-testid="add-supply-btn"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Supply
                  </Button>
                </div>
              </div>

              {/* Enhanced Supplies Grid/Table Toggle */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
                  <p className="text-muted-foreground mt-4">Loading supplies...</p>
                </div>
              ) : filteredSupplies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center mb-4 animate-bounce">
                    <Package className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? 'No supplies found matching your search' : 'No supplies yet. Add your first supply item!'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="supplies-grid">
                  {filteredSupplies.map((supply, index) => {
                    const statusInfo = getStatusInfo(supply.quantity);
                    const StatusIcon = statusInfo.icon;
                    const quantity = parseInt(supply.quantity);
                    const maxQuantity = 50;
                    const percentage = Math.min((quantity / maxQuantity) * 100, 100);

                    return (
                      <Card 
                        key={supply.row_index} 
                        className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-card/50 border border-cyan-400/20 hover:border-cyan-400 hover:-translate-y-2"
                        data-testid={`supply-card-${supply.row_index}`}
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${statusInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        <CardHeader className="pb-3 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="relative group-hover:scale-110 transition-transform duration-300">
                                <div className={`absolute inset-0 bg-gradient-to-r ${statusInfo.gradient} rounded-xl ${statusInfo.pulse ? 'animate-pulse' : ''}`}></div>
                                <div className={`relative h-14 w-14 rounded-xl bg-gradient-to-br ${statusInfo.gradient} flex items-center justify-center text-white shadow-lg m-0.5`}>
                                  <Package className="h-7 w-7" />
                                </div>
                                <div className={`absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r ${statusInfo.gradient} rounded-full flex items-center justify-center ${statusInfo.pulse ? 'animate-ping' : ''}`}>
                                  <StatusIcon className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                                  {supply.itemName}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`bg-${statusInfo.color}-500/10 text-${statusInfo.color}-600 border-${statusInfo.color}-500/20 hover:bg-${statusInfo.color}-500/20`}>
                                    {statusInfo.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-cyan-400/20 hover:text-cyan-600 transition-all duration-200"
                                onClick={() => handleOpenDialog(supply)}
                                data-testid={`edit-supply-${supply.row_index}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-400/20 text-destructive transition-all duration-200"
                                onClick={() => handleDelete(supply)}
                                data-testid={`delete-supply-${supply.row_index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                                  {supply.quantity}
                                </span>
                                <span className="text-sm text-muted-foreground">{supply.unit}</span>
                              </div>
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            
                            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${statusInfo.gradient} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-cyan-400/5 to-blue-500/5 border border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                              <Tags className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground">Category</span>
                              <p className="text-sm font-semibold">{supply.category}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-400/5 to-indigo-500/5 border border-blue-400/10 hover:border-blue-400/30 transition-all duration-300">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground">Location</span>
                              <p className="text-sm font-semibold">{supply.location}</p>
                            </div>
                          </div>
                        </CardContent>
                        
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-cyan-400/20 bg-card/50 backdrop-blur-sm overflow-hidden animate-fade-in">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-cyan-400/10 transition-colors"
                          onClick={() => handleSort('itemName')}
                        >
                          <div className="flex items-center gap-2">
                            Item Name {getSortIcon('itemName')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-cyan-400/10 transition-colors"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center gap-2">
                            Category {getSortIcon('category')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-cyan-400/10 transition-colors"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center gap-2">
                            Quantity {getSortIcon('quantity')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-cyan-400/10 transition-colors"
                          onClick={() => handleSort('location')}
                        >
                          <div className="flex items-center gap-2">
                            Location {getSortIcon('location')}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSupplies.map((supply) => {
                        const statusInfo = getStatusInfo(supply.quantity);
                        const StatusIcon = statusInfo.icon;
                        const quantity = parseInt(supply.quantity);
                        const maxQuantity = 50;
                        const percentage = Math.min((quantity / maxQuantity) * 100, 100);
                        
                        return (
                          <React.Fragment key={supply.row_index}>
                            <TableRow 
                              className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-colors cursor-pointer"
                              onClick={() => setExpandedRow(expandedRow === supply.row_index ? null : supply.row_index)}
                            >
                              <TableCell className="font-medium">{supply.itemName}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                  {supply.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">{supply.quantity}</span>
                                    <span className="text-xs text-muted-foreground">{supply.unit}</span>
                                  </div>
                                  <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`absolute inset-y-0 left-0 ${statusInfo.gradient} rounded-full`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{supply.location}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}-500`} />
                                  <span className={`text-sm font-medium ${statusInfo.color}-600`}>{statusInfo.text}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-cyan-400/20 hover:text-cyan-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDialog(supply);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-400/20 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(supply);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {expandedRow === supply.row_index && (
                              <TableRow className="bg-gradient-to-r from-cyan-400/5 to-blue-500/5 animate-slide-down">
                                <TableCell colSpan={6} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-cyan-400/20">
                                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Tags className="h-4 w-4" />
                                        <span>Category Details</span>
                                      </div>
                                      <p className="text-lg font-semibold">{supply.category}</p>
                                    </div>
                                    <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-cyan-400/20">
                                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Box className="h-4 w-4" />
                                        <span>Storage Details</span>
                                      </div>
                                      <p className="text-lg font-semibold">{supply.location}</p>
                                    </div>
                                    <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-cyan-400/20">
                                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>Stock History</span>
                                      </div>
                                      <p className="text-lg font-semibold">Last updated: Today</p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border border-cyan-400/20" data-testid="supply-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {isEditMode ? '✏️ Edit Supply Item' : '➕ Add New Supply Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="itemName" className="text-sm font-semibold">Item Name *</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  required
                  className="border-cyan-400/20 focus:border-cyan-400"
                  data-testid="input-itemName"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger data-testid="select-category" className="border-cyan-400/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office-Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Safety">Safety Equipment</SelectItem>
                    <SelectItem value="Medical">Medical Supplies</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity" className="text-sm font-semibold">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    className="border-cyan-400/20 focus:border-cyan-400"
                    data-testid="input-quantity"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="unit" className="text-sm font-semibold">Unit</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => handleSelectChange('unit', value)}
                  >
                    <SelectTrigger data-testid="select-unit" className="border-cyan-400/20">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pieces">Pieces</SelectItem>
                      <SelectItem value="Boxes">Boxes</SelectItem>
                      <SelectItem value="Packs">Packs</SelectItem>
                      <SelectItem value="Sets">Sets</SelectItem>
                      <SelectItem value="Units">Units</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., B1, Warehouse A"
                  className="border-cyan-400/20 focus:border-cyan-400"
                  data-testid="input-location"
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
                className="border-cyan-400/20"
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                data-testid="submit-btn"
              >
                {isEditMode ? 'Update' : 'Add'} Supply
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            width: 0%;
          }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        /* Print Styles */
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden,
          button:not(.print-show),
          [data-testid="back-to-dashboard-btn"],
          [data-testid="add-supply-btn"],
          [data-testid="print-supply-btn"],
          [data-testid="search-supplies-input"],
          .bg-gradient-to-r.blur-3xl,
          .view-toggle-container {
            display: none !important;
          }

          .print-header {
            display: block !important;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #0891b2;
          }

          .print-header h1 {
            font-size: 28px;
            color: #0891b2;
            margin-bottom: 5px;
          }

          .print-header p {
            font-size: 14px;
            color: #666;
          }

          .print-table {
            display: table !important;
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          .print-table thead {
            display: table-header-group;
            background-color: #0891b2 !important;
            color: white !important;
          }

          .print-table th {
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
          }

          .print-table tbody {
            display: table-row-group;
          }

          .print-table tr {
            display: table-row;
            page-break-inside: avoid;
          }

          .print-table td {
            display: table-cell;
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }

          [data-testid="supplies-grid"] {
            display: none !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 {
            display: flex !important;
            gap: 10px;
            margin-bottom: 20px;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 > div {
            flex: 1;
            page-break-inside: avoid;
          }

          main {
            background: white !important;
          }

          .backdrop-blur-sm,
          .bg-card\\/50 {
            background: white !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>

      <div className="hidden print:block print-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>MDRRMO Pio Duran</h1>
            <p>Supply Inventory Report</p>
          </div>
          <div className="text-right text-sm">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p>Total Items: {filteredSupplies.length} {searchQuery && `(Filtered)`}</p>
          </div>
        </div>
      </div>

      <table className="hidden print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredSupplies.map((supply, index) => {
            const statusInfo = getStatusInfo(supply.quantity);
            return (
              <tr key={supply.row_index}>
                <td>{index + 1}</td>
                <td>{supply.itemName}</td>
                <td>{supply.category}</td>
                <td>{supply.quantity} {supply.unit}</td>
                <td>{supply.location}</td>
                <td>{statusInfo.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SupplyInventory;

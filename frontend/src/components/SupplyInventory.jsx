import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Package, MapPin, Hash, Tags, TrendingUp, AlertTriangle, CheckCircle, Box, Cloud, CloudOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Header } from './Header';
import { BackgroundBlobs } from './BackgroundBlobs';
import { getSupplyItems, isApiKeyConfigured } from '../services/googleSheetsService';

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

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      setIsLoading(true);
      
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        toast.error('Google Sheets API key not configured. Please add REACT_APP_GOOGLE_SHEETS_API_KEY to .env file');
        setSupplies([]);
        return;
      }
      
      // Fetch directly from Google Sheets
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
    supply.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supply.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supply.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge color and icon
  const getStatusInfo = (quantity) => {
    const qty = parseInt(quantity);
    if (qty === 0) return { 
      gradient: 'from-red-500 via-red-600 to-rose-600', 
      text: 'Out of Stock',
      icon: AlertTriangle,
      pulse: true 
    };
    if (qty < 5) return { 
      gradient: 'from-yellow-500 via-orange-500 to-amber-600', 
      text: 'Low Stock',
      icon: AlertTriangle,
      pulse: true 
    };
    return { 
      gradient: 'from-green-500 via-emerald-500 to-teal-600', 
      text: 'In Stock',
      icon: CheckCircle,
      pulse: false 
    };
  };

  // Calculate stats
  const totalItems = supplies.length;
  const lowStockItems = supplies.filter(s => parseInt(s.quantity) < 5 && parseInt(s.quantity) > 0).length;
  const outOfStockItems = supplies.filter(s => parseInt(s.quantity) === 0).length;

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
                </div>

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
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Input
                    type="text"
                    placeholder="🔍 Search supplies by name, category, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative bg-card/50 backdrop-blur-sm border-cyan-400/20 focus:border-cyan-400 transition-all duration-300 h-12"
                    data-testid="search-supplies-input"
                  />
                </div>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 h-12 px-6"
                  data-testid="add-supply-btn"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Supply
                </Button>
              </div>

              {/* Enhanced Supplies Grid */}
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="supplies-grid">
                  {filteredSupplies.map((supply, index) => {
                    const statusInfo = getStatusInfo(supply.quantity);
                    const StatusIcon = statusInfo.icon;
                    const quantity = parseInt(supply.quantity);
                    const maxQuantity = 50; // For progress bar visualization
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
                        {/* Animated gradient border */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${statusInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        <CardHeader className="pb-3 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Animated Icon */}
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
                                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${statusInfo.gradient} text-white font-medium shadow-md ${statusInfo.pulse ? 'animate-pulse' : ''}`}>
                                    {statusInfo.text}
                                  </span>
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
                          {/* Quantity Display with Progress Bar */}
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
                            
                            {/* Animated Progress Bar */}
                            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${statusInfo.gradient} rounded-full transition-all duration-1000 ease-out`}
                                style={{ 
                                  width: `${percentage}%`,
                                  animation: 'slideIn 1s ease-out'
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-cyan-400/5 to-blue-500/5 border border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                              <Tags className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground">Category</span>
                              <p className="text-sm font-semibold">{supply.category}</p>
                            </div>
                          </div>
                          
                          {/* Location */}
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
                        
                        {/* Decorative corner gradient */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </Card>
                    );
                  })}
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
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default SupplyInventory;
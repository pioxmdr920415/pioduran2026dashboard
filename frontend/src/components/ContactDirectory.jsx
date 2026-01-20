import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Plus, Pencil, Trash2, Phone, Mail, User, Briefcase, Building2, Users, Star, 
  Cloud, CloudOff, Printer, LayoutGrid, List, ChevronDown, ChevronUp, Search, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Header } from './Header';
import { BackgroundBlobs } from './BackgroundBlobs';
import { getContactItems, isApiKeyConfigured } from '../services/optimizedGoogleSheetsService';

const ContactDirectory = ({ onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    phone: '',
    email: 'N/A'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchContacts = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      if (!isApiKeyConfigured()) {
        toast.error('Google Sheets API key not configured. Please add REACT_APP_GOOGLE_SHEETS_API_KEY to .env file');
        setContacts([]);
        return;
      }
      
      const result = await getContactItems({
        forceRefresh,
        onUpdate: (freshData) => {
          setContacts(freshData);
          setDataSource('network-update');
          toast.success('Contacts refreshed in background!', { duration: 2000 });
        }
      });
      
      setContacts(result.data);
      setDataSource(result.source);
      
      const sourceLabel = result.source?.includes('cache') ? '⚡ (cached)' : '🌐 (live)';
      toast.success(`Loaded ${result.data.length} contacts ${sourceLabel}`, { duration: 2000 });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error(error.message || 'Failed to load contacts from Google Sheets');
      setContacts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = () => {
    fetchContacts(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sorted = [...contacts].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setContacts(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary" /> 
      : <ChevronDown className="h-4 w-4 text-primary" />;
  };

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setIsEditMode(true);
      setCurrentContact(contact);
      setFormData({
        name: contact.name,
        position: contact.position,
        department: contact.department,
        phone: contact.phone,
        email: contact.email || 'N/A'
      });
    } else {
      setIsEditMode(false);
      setCurrentContact(null);
      setFormData({
        name: '',
        position: '',
        department: '',
        phone: '',
        email: 'N/A'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentContact(null);
    setFormData({
      name: '',
      position: '',
      department: '',
      phone: '',
      email: 'N/A'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.position || !formData.department || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.info('Direct write to Google Sheets not available with API key authentication. Please use backend API or service account for write operations.');
    handleCloseDialog();
  };

  const handleDelete = async (contact) => {
    toast.info('Direct delete from Google Sheets not available with API key authentication. Please use backend API or service account for write operations.');
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phone || '').includes(searchQuery)
  );

  // Print functionality
  const handlePrint = () => {
    window.print();
    toast.success(`Printing ${searchQuery ? 'filtered' : 'all'} contacts...`);
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
              {/* Enhanced Header Section */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-500/20 to-teal-500/20 blur-3xl -z-10 animate-pulse"></div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={onBack}
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:scale-110 transition-transform duration-300 border-2 hover:border-green-400"
                      data-testid="back-to-dashboard-btn"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent animate-gradient">
                        Contact Directory
                      </h1>
                      <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Manage your contact information
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                      <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400/10 to-emerald-500/10 border border-green-400/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{filteredContacts.length}</div>
                          <div className="text-xs text-muted-foreground">Filtered Contacts</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'border-green-400/20'}`}
                        title="Grid View"
                      >
                        <LayoutGrid className={`h-5 w-5 ${viewMode === 'grid' ? 'animate-pulse' : ''}`} />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        onClick={() => setViewMode('table')}
                        className={`p-2 ${viewMode === 'table' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'border-green-400/20'}`}
                        title="Table View"
                      >
                        <List className={`h-5 w-5 ${viewMode === 'table' ? 'animate-pulse' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Sheets Connection Banner */}
              {isApiKeyConfigured() ? (
                <div className="hidden mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm">
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
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-sm">
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

              {/* Enhanced Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="🔍 Search contacts by name, position, department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 relative bg-card/50 backdrop-blur-sm border-green-400/20 focus:border-green-400 transition-all duration-300 h-12"
                      data-testid="search-contacts-input"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="border-2 border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 h-12 px-4 print:hidden"
                    data-testid="print-contact-btn"
                  >
                    <Printer className="h-5 w-5 mr-2" />
                    Print
                  </Button>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 h-12 px-6"
                    data-testid="add-contact-btn"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </div>

              {/* Enhanced Contacts Grid/Table Toggle */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-green-400 border-t-transparent"></div>
                  <p className="text-muted-foreground mt-4">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mb-4 animate-bounce">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? 'No contacts found matching your search' : 'No contacts yet. Add your first contact!'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="contacts-grid">
                  {filteredContacts.map((contact, index) => (
                    <Card 
                      key={contact.row_index} 
                      className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-card/50 border border-green-400/20 hover:border-green-400 hover:-translate-y-2"
                      data-testid={`contact-card-${contact.row_index}`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative group-hover:scale-110 transition-transform duration-300">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                              <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg m-0.5">
                                {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                                <Star className="h-2.5 w-2.5 text-white fill-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                {contact.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground font-medium">{contact.position}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-green-400/20 hover:text-green-600 transition-all duration-200"
                              onClick={() => handleOpenDialog(contact)}
                              data-testid={`edit-contact-${contact.row_index}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-400/20 text-destructive transition-all duration-200"
                              onClick={() => handleDelete(contact)}
                              data-testid={`delete-contact-${contact.row_index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground">Department</span>
                            <p className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{contact.department}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-400/5 to-emerald-500/5 border border-green-400/10 hover:border-green-400/30 transition-all duration-300">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-mono font-semibold">{contact.phone}</span>
                        </div>
                        
                        {contact.email && contact.email !== 'N/A' && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-400/5 to-teal-500/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all duration-300">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                              <Mail className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm truncate">{contact.email}</span>
                          </div>
                        )}
                      </CardContent>
                      
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-green-400/20 bg-card/50 backdrop-blur-sm overflow-hidden animate-fade-in">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-green-400/10 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Name {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-green-400/10 transition-colors"
                          onClick={() => handleSort('position')}
                        >
                          <div className="flex items-center gap-2">
                            Position {getSortIcon('position')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-green-400/10 transition-colors"
                          onClick={() => handleSort('department')}
                        >
                          <div className="flex items-center gap-2">
                            Department {getSortIcon('department')}
                          </div>
                        </TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <React.Fragment key={contact.row_index}>
                          <TableRow 
                            className="border-b border-green-400/10 hover:bg-green-400/5 transition-colors cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === contact.row_index ? null : contact.row_index)}
                          >
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                {contact.position}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                {contact.department}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">{contact.phone}</TableCell>
                            <TableCell>
                              {contact.email && contact.email !== 'N/A' ? (
                                <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline truncate block max-w-[150px]">
                                  {contact.email}
                                </a>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-green-400/20 hover:text-green-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDialog(contact);
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
                                    handleDelete(contact);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          {expandedRow === contact.row_index && (
                            <TableRow className="bg-gradient-to-r from-green-400/5 to-emerald-500/5 animate-slide-down">
                              <TableCell colSpan={6} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-green-400/20">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                      <User className="h-4 w-4" />
                                      <span>Full Name</span>
                                    </div>
                                    <p className="text-lg font-semibold">{contact.name}</p>
                                  </div>
                                  <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-green-400/20">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                      <Briefcase className="h-4 w-4" />
                                      <span>Position Details</span>
                                    </div>
                                    <p className="text-lg font-semibold">{contact.position}</p>
                                    <p className="text-sm text-muted-foreground">Department: {contact.department}</p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
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
        <DialogContent className="sm:max-w-[500px] border border-green-400/20" data-testid="contact-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              {isEditMode ? '✏️ Edit Contact' : '➕ Add New Contact'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
                className="border-green-400/20 focus:border-green-400"
                data-testid="contact-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-semibold">Position *</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g., Punong Barangay, SB Member"
                required
                className="border-green-400/20 focus:border-green-400"
                data-testid="contact-position-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold">Department *</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Brgy. Council - Agol"
                required
                className="border-green-400/20 focus:border-green-400"
                data-testid="contact-department-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 9361562854"
                required
                className="border-green-400/20 focus:border-green-400"
                data-testid="contact-phone-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className="border-green-400/20 focus:border-green-400"
                data-testid="contact-email-input"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="border-green-400/20"
                data-testid="cancel-contact-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                data-testid="save-contact-btn"
              >
                {isEditMode ? 'Update' : 'Add'} Contact
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
          [data-testid="add-contact-btn"],
          [data-testid="print-contact-btn"],
          [data-testid="search-contacts-input"],
          .bg-gradient-to-r.blur-3xl,
          .view-toggle-container {
            display: none !important;
          }

          .print-header {
            display: block !important;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #10b981;
          }

          .print-header h1 {
            font-size: 28px;
            color: #10b981;
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
            background-color: #10b981 !important;
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

          [data-testid="contacts-grid"] {
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
            <p>Contact Directory Report</p>
          </div>
          <div className="text-right text-sm">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p>Total Contacts: {filteredContacts.length} {searchQuery && `(Filtered)`}</p>
          </div>
        </div>
      </div>

      <table className="hidden print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.map((contact, index) => (
            <tr key={contact.row_index}>
              <td>{index + 1}</td>
              <td>{contact.name}</td>
              <td>{contact.position}</td>
              <td>{contact.department}</td>
              <td>{contact.phone}</td>
              <td>{contact.email || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactDirectory;

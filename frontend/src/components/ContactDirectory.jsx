import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Phone, Mail, User, Briefcase, Building2, Users, Star, Cloud, CloudOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { Header } from './Header';
import { BackgroundBlobs } from './BackgroundBlobs';
import { getContactItems, isApiKeyConfigured } from '../services/googleSheetsService';

const ContactDirectory = ({ onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/contact/items`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
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

    try {
      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/contact/items/${currentContact.row_index}`, formData);
        toast.success('Contact updated successfully');
      } else {
        await axios.post(`${BACKEND_URL}/api/contact/items`, formData);
        toast.success('Contact added successfully');
      }
      
      handleCloseDialog();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} contact`);
    }
  };

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await axios.delete(`${BACKEND_URL}/api/contact/items/${contact.row_index}`);
        toast.success('Contact deleted successfully');
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      }
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

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
                <div className="flex items-center gap-4 mb-4">
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
                  <div className="hidden md:flex items-center gap-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400/10 to-emerald-500/10 border border-green-400/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{contacts.length}</div>
                      <div className="text-xs text-muted-foreground">Total Contacts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Input
                    type="text"
                    placeholder="🔍 Search contacts by name, position, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative bg-card/50 backdrop-blur-sm border-green-400/20 focus:border-green-400 transition-all duration-300 h-12"
                    data-testid="search-contacts-input"
                  />
                </div>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 h-12 px-6"
                  data-testid="add-contact-btn"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Contact
                </Button>
              </div>

              {/* Enhanced Contacts Grid */}
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
              ) : (
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
                      {/* Animated gradient border */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Animated Avatar */}
                            <div className="relative group-hover:scale-110 transition-transform duration-300">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                              <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg m-0.5">
                                {contact.name.charAt(0).toUpperCase()}
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
                        {/* Department Badge */}
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground">Department</span>
                            <p className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{contact.department}</p>
                          </div>
                        </div>
                        
                        {/* Phone */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-400/5 to-emerald-500/5 border border-green-400/10 hover:border-green-400/30 transition-all duration-300">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-mono font-semibold">{contact.phone}</span>
                        </div>
                        
                        {/* Email */}
                        {contact.email && contact.email !== 'N/A' && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-400/5 to-teal-500/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all duration-300">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                              <Mail className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm truncate">{contact.email}</span>
                          </div>
                        )}
                      </CardContent>
                      
                      {/* Decorative corner gradient */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Card>
                  ))}
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
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactDirectory;
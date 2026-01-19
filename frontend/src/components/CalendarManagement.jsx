import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Calendar as CalendarIcon, Clock, MapPin, Tag, Sparkles, CalendarDays, Timer, Cloud, CloudOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Header } from './Header';
import { BackgroundBlobs } from './BackgroundBlobs';
import { getEventItems, isApiKeyConfigured } from '../services/googleSheetsService';

const STATUS_OPTIONS = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];

const STATUS_COLORS = {
  'Upcoming': { 
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-400'
  },
  'In Progress': { 
    gradient: 'from-yellow-500 via-orange-500 to-amber-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-400'
  },
  'Completed': { 
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-400'
  },
  'Cancelled': { 
    gradient: 'from-red-500 via-rose-500 to-pink-600',
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-400'
  }
};

const CalendarManagement = ({ onBack }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventTask: '',
    date: '',
    time: '',
    location: '',
    status: 'Upcoming'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/event/items`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setIsEditMode(true);
      setCurrentEvent(event);
      setFormData({
        eventTask: event.eventTask,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status || 'Upcoming'
      });
    } else {
      setIsEditMode(false);
      setCurrentEvent(null);
      setFormData({
        eventTask: '',
        date: '',
        time: '',
        location: '',
        status: 'Upcoming'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentEvent(null);
    setFormData({
      eventTask: '',
      date: '',
      time: '',
      location: '',
      status: 'Upcoming'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.eventTask || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/event/items/${currentEvent.row_index}`, formData);
        toast.success('Event updated successfully');
      } else {
        await axios.post(`${BACKEND_URL}/api/event/items`, formData);
        toast.success('Event added successfully');
      }
      
      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} event`);
    }
  };

  const handleDelete = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.eventTask}"?`)) {
      try {
        await axios.delete(`${BACKEND_URL}/api/event/items/${event.row_index}`);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.eventTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || event.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Calculate stats
  const upcomingCount = events.filter(e => e.status === 'Upcoming').length;
  const inProgressCount = events.filter(e => e.status === 'In Progress').length;
  const completedCount = events.filter(e => e.status === 'Completed').length;

  // Group events by month
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(event);
    return acc;
  }, {});

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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl -z-10 animate-pulse"></div>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    onClick={onBack}
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:scale-110 transition-transform duration-300 border-2 hover:border-purple-400"
                    data-testid="back-to-dashboard-btn"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 bg-clip-text text-transparent animate-gradient">
                      Calendar Management
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Manage your events and schedules
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">Upcoming</p>
                        <p className="text-3xl font-bold mt-1">{upcomingCount}</p>
                      </div>
                      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                        <Timer className="h-7 w-7" />
                      </div>
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">In Progress</p>
                        <p className="text-3xl font-bold mt-1">{inProgressCount}</p>
                      </div>
                      <div className={`h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${inProgressCount > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                        <Sparkles className="h-7 w-7" />
                      </div>
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">Completed</p>
                        <p className="text-3xl font-bold mt-1">{completedCount}</p>
                      </div>
                      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CalendarIcon className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Input
                    type="text"
                    placeholder="🔍 Search events by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative bg-card/50 backdrop-blur-sm border-purple-400/20 focus:border-purple-400 transition-all duration-300 h-12"
                    data-testid="search-events-input"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] h-12 border-purple-400/20" data-testid="filter-status-select">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 hover:from-purple-500 hover:via-violet-600 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 h-12 px-6"
                  data-testid="add-event-btn"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Event
                </Button>
              </div>

              {/* Enhanced Events Timeline */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                  <p className="text-muted-foreground mt-4">Loading events...</p>
                </div>
              ) : sortedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center mb-4 animate-bounce">
                    <CalendarIcon className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {searchQuery || filterStatus !== 'All' ? 'No events found matching your filters' : 'No events yet. Add your first event!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-8" data-testid="events-list">
                  {Object.entries(groupedEvents).map(([monthYear, monthEvents], groupIndex) => (
                    <div key={monthYear} className="relative">
                      {/* Month Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 blur-lg"></div>
                          <h2 className="relative text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent px-4 py-2">
                            {monthYear}
                          </h2>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                      </div>

                      {/* Timeline */}
                      <div className="relative pl-8 space-y-6">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-violet-500 to-fuchsia-500"></div>

                        {monthEvents.map((event, index) => {
                          const statusColor = STATUS_COLORS[event.status] || STATUS_COLORS['Upcoming'];
                          const eventDate = new Date(event.date);
                          const today = new Date();
                          const isUpcoming = eventDate > today;
                          const daysDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

                          return (
                            <div 
                              key={event.row_index}
                              className="relative"
                              style={{
                                animationDelay: `${(groupIndex * 0.2) + (index * 0.1)}s`,
                                animation: 'fadeInLeft 0.6s ease-out forwards'
                              }}
                            >
                              {/* Timeline dot */}
                              <div className={`absolute -left-8 top-6 w-4 h-4 rounded-full bg-gradient-to-r ${statusColor.gradient} shadow-lg ${event.status === 'In Progress' ? 'animate-pulse' : ''}`}>
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${statusColor.gradient} animate-ping opacity-75`}></div>
                              </div>

                              <Card 
                                className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-card/50 border-l-4 ${statusColor.border} hover:-translate-y-1`}
                                data-testid={`event-card-${event.row_index}`}
                              >
                                {/* Animated gradient border */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${statusColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
                                
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-4">
                                      {/* Event Title and Status */}
                                      <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                          <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                                            {event.eventTask}
                                          </h3>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={`${statusColor.bg} ${statusColor.text} border-0 shadow-md`}>
                                              {event.status}
                                            </Badge>
                                            {isUpcoming && daysDiff >= 0 && daysDiff <= 30 && (
                                              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md animate-pulse">
                                                {daysDiff === 0 ? 'Today!' : daysDiff === 1 ? 'Tomorrow' : `In ${daysDiff} days`}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-purple-400/20 hover:text-purple-600 transition-all duration-200"
                                            onClick={() => handleOpenDialog(event)}
                                            data-testid={`edit-event-${event.row_index}`}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-red-400/20 text-destructive transition-all duration-200"
                                            onClick={() => handleDelete(event)}
                                            data-testid={`delete-event-${event.row_index}`}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      {/* Event Details */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-400/10 to-violet-500/10 border border-purple-400/20">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg">
                                            <CalendarIcon className="h-5 w-5 text-white" />
                                          </div>
                                          <div>
                                            <span className="text-xs text-muted-foreground block">Date</span>
                                            <span className="text-sm font-semibold">{event.date}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-400/10 to-fuchsia-500/10 border border-violet-400/20">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shadow-lg">
                                            <Clock className="h-5 w-5 text-white" />
                                          </div>
                                          <div>
                                            <span className="text-xs text-muted-foreground block">Time</span>
                                            <span className="text-sm font-semibold">{event.time}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-fuchsia-400/10 to-pink-500/10 border border-fuchsia-400/20">
                                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center shadow-lg">
                                            <MapPin className="h-5 w-5 text-white" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <span className="text-xs text-muted-foreground block">Location</span>
                                            <span className="text-sm font-semibold truncate block">{event.location}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                                
                                {/* Decorative corner gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border border-purple-400/20" data-testid="event-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
              {isEditMode ? '✏️ Edit Event' : '➕ Add New Event'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventTask" className="text-sm font-semibold">Event/Task *</Label>
              <Input
                id="eventTask"
                name="eventTask"
                value={formData.eventTask}
                onChange={handleInputChange}
                placeholder="e.g., Earthquake Drill"
                required
                className="border-purple-400/20 focus:border-purple-400"
                data-testid="event-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="border-purple-400/20 focus:border-purple-400"
                  data-testid="event-date-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-semibold">Time *</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="border-purple-400/20 focus:border-purple-400"
                  data-testid="event-time-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Municipal Hall Grounds"
                required
                className="border-purple-400/20 focus:border-purple-400"
                data-testid="event-location-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">Status *</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger data-testid="event-status-select" className="border-purple-400/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="border-purple-400/20"
                data-testid="cancel-event-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 hover:from-purple-500 hover:via-violet-600 hover:to-fuchsia-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                data-testid="save-event-btn"
              >
                {isEditMode ? 'Update' : 'Add'} Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx="true">{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

export default CalendarManagement;
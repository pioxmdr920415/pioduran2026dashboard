import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import { 
  ArrowLeft, 
  Navigation,
  Ruler,
  Pencil,
  MapPin,
  Circle as CircleIcon,
  Square as SquareIcon,
  Trash2,
  Download,
  Upload,
  Layers,
  Search,
  Target,
  Info,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Pio Duran, Albay, Philippines coordinates
const PIO_DURAN_CENTER = [13.0667, 123.4667];
const DEFAULT_ZOOM = 13;

// Coordinate Display Component
const CoordinateDisplay = () => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    mousemove: (e) => {
      setPosition(e.latlng);
    },
  });

  return position ? (
    <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md rounded-full px-4 py-2 shadow-xl border border-cyan-500/20 pointer-events-none">
      <div className="flex items-center gap-3 text-xs text-white/90">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
        <span className="font-mono tracking-wider">
          {position.lat.toFixed(5)}° N, {position.lng.toFixed(5)}° E
        </span>
      </div>
    </div>
  ) : null;
};

// Drawing Layer Component
const DrawingLayer = ({ activeTool, onDrawn }) => {
  const map = useMap();
  const drawnItemsRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Initialize FeatureGroup for drawn items
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
    }

    const drawnItems = drawnItemsRef.current;

    // Remove existing draw controls
    map.eachLayer((layer) => {
      if (layer instanceof L.Control.Draw) {
        map.removeControl(layer);
      }
    });

    // Add draw control based on active tool
    if (activeTool) {
      const drawOptions = {
        position: 'topright',
        draw: {
          polyline: activeTool === 'polyline' ? {
            shapeOptions: {
              color: '#10b981',
              weight: 4,
              opacity: 0.8
            }
          } : false,
          polygon: activeTool === 'polygon' ? {
            shapeOptions: {
              color: '#8b5cf6',
              fillOpacity: 0.4,
              weight: 2
            }
          } : false,
          circle: activeTool === 'circle' ? {
            shapeOptions: {
              color: '#ec4899',
              fillOpacity: 0.4,
              weight: 2
            }
          } : false,
          rectangle: activeTool === 'rectangle' ? {
            shapeOptions: {
              color: '#f59e0b',
              fillOpacity: 0.4,
              weight: 2
            }
          } : false,
          marker: activeTool === 'marker' ? true : false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      };

      const drawControl = new L.Control.Draw(drawOptions);
      map.addControl(drawControl);
    }

    // Event handlers
    const onDrawCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      // Calculate area or length if applicable
      if (e.layerType === 'polygon') {
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        const areaInSqMeters = area.toFixed(2);
        const areaInHectares = (area / 10000).toFixed(4);
        layer.bindPopup(`<div class="p-2"><strong>Area:</strong><br/>${areaInSqMeters} m²<br/>${areaInHectares} hectares</div>`);
        toast.success(`Polygon drawn! Area: ${areaInSqMeters} m²`);
      } else if (e.layerType === 'polyline') {
        const latlngs = layer.getLatLngs();
        let distance = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
          distance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        const distanceInMeters = distance.toFixed(2);
        const distanceInKm = (distance / 1000).toFixed(2);
        layer.bindPopup(`<div class="p-2"><strong>Distance:</strong><br/>${distanceInMeters} m<br/>${distanceInKm} km</div>`);
        toast.success(`Line drawn! Distance: ${distanceInKm} km`);
      } else if (e.layerType === 'circle') {
        const radius = layer.getRadius();
        const area = Math.PI * radius * radius;
        layer.bindPopup(`<div class="p-2"><strong>Circle:</strong><br/>Radius: ${radius.toFixed(2)} m<br/>Area: ${area.toFixed(2)} m²</div>`);
        toast.success(`Circle drawn! Radius: ${radius.toFixed(2)} m`);
      }
      
      onDrawn?.(e);
    };

    const onDrawDeleted = (e) => {
      toast.info('Shapes deleted');
    };

    map.on(L.Draw.Event.CREATED, onDrawCreated);
    map.on(L.Draw.Event.DELETED, onDrawDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onDrawCreated);
      map.off(L.Draw.Event.DELETED, onDrawDeleted);
    };
  }, [map, activeTool, onDrawn]);

  return null;
};

// Search Control Component
const SearchControl = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        onSearch({ lat: parseFloat(result.lat), lng: parseFloat(result.lon), name: result.display_name });
        toast.success(`Found: ${result.display_name}`);
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition-all"
          disabled={isSearching}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

// Map Movement Handler
const MapMovementHandler = ({ searchResult }) => {
  const map = useMap();

  useEffect(() => {
    if (searchResult) {
      map.setView([searchResult.lat, searchResult.lng], 15, {
        animate: true,
        duration: 1
      });
    }
  }, [searchResult, map]);

  return null;
};

// Sidebar Component
const Sidebar = ({ 
  activeTool,
  onToolSelect,
  onLocate,
  onClearAll,
  onExport,
  onSearch,
  isDarkMode,
  searchResult
}) => {
  const tools = [
    { id: 'marker', icon: MapPin, label: 'Marker', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'polyline', icon: Pencil, label: 'Line', gradient: 'from-emerald-500 to-green-500' },
    { id: 'polygon', icon: SquareIcon, label: 'Polygon', gradient: 'from-violet-500 to-purple-500' },
    { id: 'circle', icon: CircleIcon, label: 'Circle', gradient: 'from-pink-500 to-rose-500' },
    { id: 'ruler', icon: Ruler, label: 'Measure', gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="bg-black/90 backdrop-blur-md border-r border-white/10 w-72 h-full flex flex-col p-4 overflow-y-auto">
      <div className="space-y-6">

        {/* Search Section */}
        <div className="space-y-2">
          <SearchControl onSearch={onSearch} />
        </div>

        {/* Tools Section */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider flex items-center gap-2">
            <Pencil className="w-3 h-3" /> Drawing Tools
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  className={`group relative p-3 rounded-xl transition-all duration-300 flex flex-col items-center justify-center ${
                    isActive
                      ? `bg-gradient-to-br ${tool.gradient} text-white shadow-lg ring-2 ring-white/20`
                      : 'text-gray-400 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-medium">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider flex items-center gap-2">
            <Settings className="w-3 h-3" /> Map Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={onLocate}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors backdrop-blur-sm group"
            >
              <Target className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-medium">My Location</span>
            </button>
            
            <button
              onClick={onClearAll}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors backdrop-blur-sm group"
            >
              <Trash2 className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-medium">Clear All</span>
            </button>
            
            <button
              onClick={onExport}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors backdrop-blur-sm group"
            >
              <Download className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-medium">Export Map Data</span>
            </button>
          </div>
        </div>

        {/* Legend Section */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider flex items-center gap-2">
            <Layers className="w-3 h-3" /> Map Legend
          </h3>
          <div className="space-y-3 p-3 bg-black/50 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]"></div>
              <span className="text-sm text-gray-300">Markers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></div>
              <span className="text-sm text-gray-300">Paths</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-violet-500 bg-violet-500/20 rounded-sm"></div>
              <span className="text-sm text-gray-300">Polygons</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-pink-500 bg-pink-500/20 rounded-full"></div>
              <span className="text-sm text-gray-300">Zones</span>
            </div>
          </div>
        </div>

        {/* Attribution Section */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-1.5">
              <span>©</span>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" 
                 className="text-cyan-400 hover:underline transition-colors">
                OpenStreetMap
              </a>
              <span>contributors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>©</span>
              <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" 
                 className="text-cyan-400 hover:underline transition-colors">
                CARTO
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span>©</span>
              <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer" 
                 className="text-cyan-400 hover:underline transition-colors">
                Esri
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ onBack, onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className="h-16 bg-gradient-to-r from-black/90 to-black/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all duration-300 hover:pr-6"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-300 overflow-hidden w-0 group-hover:w-auto">Back</span>
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-cyan-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-cyan-300 font-medium">System Online</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-2 border-white/20">
            <Navigation className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div className="hidden lg:block">
            <div className="text-white font-bold text-lg">MDRRMO Pio Duran Geospatial Portal</div>
            <div className="text-xs text-gray-400">Albay, Philippines</div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main Interactive Map Component
export const InteractiveMap = ({ onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          setSearchResult({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Your Location'
          });
          toast.success('Location found!');
        },
        (error) => {
          toast.dismiss();
          toast.error('Could not get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleToolSelect = (toolId) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    if (activeTool !== toolId) {
      toast.info(`${toolId.charAt(0).toUpperCase() + toolId.slice(1)} tool activated`);
    }
  };

  const handleClearAll = () => {
    toast.success('All drawings cleared');
    window.location.reload(); // Simple way to clear, can be improved
  };

  const handleExport = () => {
    toast.success('Exporting map data...');
    // Implement export functionality
  };

  const handleSearch = (result) => {
    setSearchResult(result);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* Header */}
      <Header 
        onBack={onBack} 
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            onLocate={handleLocate}
            onClearAll={handleClearAll}
            onExport={handleExport}
            onSearch={handleSearch}
            isDarkMode={isDarkMode}
            searchResult={searchResult}
          />
        )}
        
        {/* Map Container */}
        <main className="flex-1 relative p-4">
          <div className="relative h-full w-full bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <MapContainer
              center={PIO_DURAN_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              className="bg-gray-900"
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                  <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Dark Matter">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Topographic">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {/* Drawing Layer */}
              <DrawingLayer activeTool={activeTool} />

              {/* Coordinate Display */}
              <CoordinateDisplay />

              {/* Map Movement Handler */}
              <MapMovementHandler searchResult={searchResult} />

              {/* Search Result Marker */}
              {searchResult && (
                <Marker position={[searchResult.lat, searchResult.lng]}>
                  <Popup className="custom-popup">
                    <div className="font-semibold">{searchResult.name}</div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
            
            {/* Map Actions Overlay */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-3">
              <button
                onClick={handleLocate}
                className="group bg-black/80 backdrop-blur-md rounded-full p-3 shadow-2xl border border-cyan-500/20 text-white hover:bg-cyan-600 transition-all duration-300 hover:scale-105"
                title="My Location"
              >
                <Target className="w-5 h-5" />
              </button>
              <button
                onClick={handleClearAll}
                className="group bg-black/80 backdrop-blur-md rounded-full p-3 shadow-2xl border border-red-500/20 text-red-400 hover:bg-red-600 transition-all duration-300 hover:scale-105"
                title="Clear All"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InteractiveMap;

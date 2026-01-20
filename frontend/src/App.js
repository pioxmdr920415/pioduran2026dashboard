import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SupplyInventory from './components/SupplyInventory';
import ContactDirectory from './components/ContactDirectory';
import CalendarManagement from './components/CalendarManagement';
import EnhancedDocumentManagement from './components/EnhancedDocumentManagement';
import PhotoDocumentation from './components/PhotoDocumentation';
import MapManagement from './components/MapManagement';
import InteractiveMap from './components/InteractiveMap';
import PanoramaGallery from './components/PanoramaGallery';
import OfflineIndicator from './components/OfflineIndicator';
import { Toaster } from './components/ui/sonner';
import './App.css';

export const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentModule, setCurrentModule] = useState(null);

  const handleOpenModule = (moduleId) => {
    setCurrentModule(moduleId);
    setCurrentView('module');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentModule(null);
  };

  const renderView = () => {
    if (currentView === 'module') {
      switch (currentModule) {
        case 'supply':
          return <SupplyInventory onBack={handleBackToDashboard} />;
        case 'contacts':
          return <ContactDirectory onBack={handleBackToDashboard} />;
        case 'calendar':
          return <CalendarManagement onBack={handleBackToDashboard} />;
        case 'documents':
          return <EnhancedDocumentManagement onBack={handleBackToDashboard} />;
        case 'photos':
          return <PhotoDocumentation onBack={handleBackToDashboard} />;
        case 'maps':
          return <MapManagement onBack={handleBackToDashboard} />;
        case 'interactive-map':
          return <InteractiveMap onBack={handleBackToDashboard} />;
        case 'panorama':
          return <PanoramaGallery onBack={handleBackToDashboard} />;
        default:
          return <Dashboard onOpenModule={handleOpenModule} />;
      }
    }
    return <Dashboard onOpenModule={handleOpenModule} />;
  };

  return (
    <>
      <OfflineIndicator />
      {renderView()}
      <Toaster />
    </>
  );
};

export default App;

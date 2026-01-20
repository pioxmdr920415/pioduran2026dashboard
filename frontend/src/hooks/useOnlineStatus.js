import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline status
 * @returns {boolean} isOnline - true if online, false if offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ Back online!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('⚠️ You are offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

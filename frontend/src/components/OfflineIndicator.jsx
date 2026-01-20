import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * OfflineIndicator - Shows a banner when the app is offline
 * Displays at the top of the screen with animation
 */
export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [show, setShow] = React.useState(!isOnline);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "Back online" message briefly
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        show ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`px-4 py-3 text-center font-medium ${
          isOnline
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5" />
              <span>Back online! All features restored.</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 animate-pulse" />
              <span>You're offline. Using cached data.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

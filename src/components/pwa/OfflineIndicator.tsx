import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500/95 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-xl shadow-amber-500/20 animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Changes saved locally and will sync when reconnected.</span>
    </div>
  );
};

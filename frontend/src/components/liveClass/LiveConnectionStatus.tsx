import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import type { SocketConnectionStatus } from '@/hooks/useLiveClassSocket';

export interface LiveConnectionStatusProps {
  status?: SocketConnectionStatus;
  className?: string;
}

export const LiveConnectionStatus: React.FC<LiveConnectionStatusProps> = ({
  status = 'connected',
  className = '',
}) => {
  if (status === 'connected') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold ${className}`}
        title="Real-time Classroom Engine Connected"
      >
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span>Connected</span>
      </span>
    );
  }

  if (status === 'reconnecting') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold ${className}`}
        title="Reconnecting to Live Classroom stream..."
      >
        <Wifi className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Reconnecting...</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold ${className}`}
      title="Disconnected from Live Classroom"
    >
      <WifiOff className="w-3.5 h-3.5 text-rose-400" />
      <span>Disconnected</span>
    </span>
  );
};

export default LiveConnectionStatus;

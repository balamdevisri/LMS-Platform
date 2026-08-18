import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AnnouncementItem } from '@/hooks/useLiveClassSocket';

export interface LiveAnnouncementBannerProps {
  announcements: AnnouncementItem[];
}

export const LiveAnnouncementBanner: React.FC<LiveAnnouncementBannerProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  const latest = announcements[0];

  return (
    <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/40 rounded-2xl p-3.5 px-5 shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
      <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
        <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block">
            Live Announcement from {latest.senderName || 'Instructor'}
          </span>
          <span className="text-[10px] text-slate-400">
            {latest.createdAt ? new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-white truncate">
          {latest.message}
        </p>
      </div>
    </div>
  );
};

export default LiveAnnouncementBanner;

import React, { useState } from 'react';
import { Sparkles, AlertCircle, Pin, X } from 'lucide-react';
import type { AnnouncementItem } from '@/hooks/useLiveClassSocket';

export interface LiveAnnouncementBannerProps {
  announcements: (AnnouncementItem & { pinned?: boolean })[];
  onDismiss?: (id: string) => void;
}

export const LiveAnnouncementBanner: React.FC<LiveAnnouncementBannerProps> = ({ announcements, onDismiss }) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.has(a.id));
  if (!visibleAnnouncements || visibleAnnouncements.length === 0) return null;

  // Show pinned first, else newest
  const latest = visibleAnnouncements.find((a) => a.pinned) || visibleAnnouncements[0];
  const isUrgent = latest.priority === 'urgent';

  const handleDismiss = () => {
    setDismissedIds((prev) => new Set([...prev, latest.id]));
    onDismiss?.(latest.id);
  };

  return (
    <div
      className={`border rounded-2xl p-3 px-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 backdrop-blur-2xl select-none ${
        isUrgent
          ? 'bg-rose-950/80 border-rose-500/50 text-white shadow-rose-950/40'
          : 'bg-[#0b1022]/85 border-white/15 text-white shadow-black/50'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isUrgent
              ? 'bg-rose-500/25 border border-rose-400/50 text-rose-300'
              : 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-300'
          }`}
        >
          {isUrgent ? (
            <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                isUrgent ? 'text-rose-400' : 'text-indigo-300'
              }`}
            >
              {isUrgent ? '⚠️ Urgent Announcement' : 'Classroom Announcement'} from {latest.senderName || 'Instructor'}
            </span>
            {latest.pinned && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-bold">
                <Pin className="w-2.5 h-2.5 fill-current" />
                Pinned
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-mono">
              {latest.createdAt
                ? new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">{latest.message}</p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0 border border-transparent hover:border-white/10"
        title="Dismiss announcement"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LiveAnnouncementBanner;

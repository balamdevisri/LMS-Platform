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
      className={`border rounded-2xl p-3 px-4 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md ${
        isUrgent
          ? 'bg-rose-950/85 border-rose-500/60 text-white'
          : 'bg-gradient-to-r from-blue-950/85 via-indigo-950/85 to-purple-950/85 border-blue-500/40 text-white'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isUrgent
              ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
              : 'bg-blue-500/20 border border-blue-400/40 text-blue-300'
          }`}
        >
          {isUrgent ? (
            <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                isUrgent ? 'text-rose-400' : 'text-sky-400'
              }`}
            >
              {isUrgent ? '⚠️ Urgent Announcement' : 'Live Announcement'} from {latest.senderName || 'Instructor'}
            </span>
            {latest.pinned && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-0.5 font-bold">
                <Pin className="w-2.5 h-2.5 fill-current" />
                Pinned
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              {latest.createdAt
                ? new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white truncate">{latest.message}</p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        title="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LiveAnnouncementBanner;

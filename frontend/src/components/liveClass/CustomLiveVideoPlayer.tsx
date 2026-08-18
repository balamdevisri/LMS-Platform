import React, { useMemo } from 'react';
import { VideoOff, Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractYouTubeVideoId } from './YouTubePlayer';

export interface CustomLiveVideoPlayerProps {
  youtubeVideoId?: string;
  title?: string;
  status?: string; // 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  instructorName?: string;
  poster?: string;
  scheduledTimeText?: string;
}

export const CustomLiveVideoPlayer: React.FC<CustomLiveVideoPlayerProps> = ({
  youtubeVideoId,
  title = 'KaizenQ Live Classroom',
  status = 'SCHEDULED',
  instructorName = 'Lead Instructor',
  scheduledTimeText = 'Upcoming Session',
}) => {
  const cleanVideoId = useMemo(() => extractYouTubeVideoId(youtubeVideoId), [youtubeVideoId]);
  const normStatus = (status || 'SCHEDULED').toUpperCase();
  const isLive = normStatus === 'LIVE';
  const isEnded = normStatus === 'ENDED' || normStatus === 'COMPLETED';
  const isCancelled = normStatus === 'CANCELLED';
  const isScheduled = normStatus === 'SCHEDULED';

  // 1. Session Cancelled State
  if (isCancelled) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400 shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          Session Cancelled
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Live class has been cancelled</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
          The instructor has cancelled this session. Please check your course schedule for the next broadcast date.
        </p>
      </div>
    );
  }

  // 2. Session Ended State
  if (isEnded) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
          Session Concluded
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Live class has ended</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
          Thank you for joining {instructorName}'s session! The recorded replay will be accessible in your course curriculum.
        </p>
      </div>
    );
  }

  // 3. No Video ID / Stream Not Configured State
  if (!cleanVideoId) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center p-6 sm:p-8 text-center overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
          <VideoOff className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">Live stream not configured</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-4 leading-relaxed">
          The broadcast channel has not been connected yet. The stream will automatically display when {instructorName} begins transmitting.
        </p>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Auto-syncing broadcast channel</span>
        </div>
      </div>
    );
  }

  // 4. Official YouTube Embedded Video Frame
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  return (
    <div className="space-y-2">
      {/* Standby Banner for Scheduled Session */}
      {isScheduled && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <div className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Scheduled for <strong>{scheduledTimeText}</strong> — Classroom standby mode</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-extrabold uppercase tracking-wider">
            Standby
          </span>
        </div>
      )}

      {/* 16:9 Aspect Video Container */}
      <div className="relative w-full aspect-video rounded-2xl bg-black border border-slate-800 shadow-2xl overflow-hidden group">
        {/* Live Badge Overlay Header */}
        {isLive && (
          <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-xs font-extrabold tracking-wider uppercase shadow-lg shadow-red-500/20">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="w-2 h-2 rounded-full bg-white -ml-3.5" />
              <span>LIVE STREAM</span>
            </div>
          </div>
        )}

        {/* YouTube Iframe Embed */}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CustomLiveVideoPlayer;

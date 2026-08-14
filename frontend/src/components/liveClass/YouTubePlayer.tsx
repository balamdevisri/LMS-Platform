import React, { useMemo } from 'react';
import { VideoOff, Sparkles } from 'lucide-react';

interface YouTubePlayerProps {
  youtubeVideoId?: string;
  title?: string;
  isLive?: boolean;
  status?: string;
}

/**
 * Extracts standard 11-character YouTube video ID from various URL formats or raw ID.
 */
export function extractYouTubeVideoId(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex supporting:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/embed/ID
  // - youtube.com/live/ID
  // - youtube.com/v/ID
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  youtubeVideoId,
  title = 'Live Classroom Stream',
  isLive = true,
  status,
}) => {
  const cleanVideoId = useMemo(() => extractYouTubeVideoId(youtubeVideoId), [youtubeVideoId]);

  // Graceful fallback when no video ID exists
  if (!cleanVideoId) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center p-8 text-center overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute inset-0 bg-radial from-sky-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
          <VideoOff className="w-8 h-8 text-slate-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Live stream not configured</h3>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          The instructor has not connected a YouTube Live stream for this session yet. Please stay on this page or check back shortly.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          Awaiting instructor broadcast signal
        </div>
      </div>
    );
  }

  // Build official YouTube embed URL
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  const isActuallyLive = isLive || (status || '').toUpperCase() === 'LIVE';

  return (
    <div className="relative w-full aspect-video rounded-2xl bg-black border border-slate-800 shadow-2xl overflow-hidden group">
      {/* Live Badge Overlay Header */}
      {isActuallyLive && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-xs font-extrabold tracking-wider uppercase shadow-lg shadow-red-500/20">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="w-2 h-2 rounded-full bg-white -ml-3.5" />
            LIVE STREAM
          </div>
        </div>
      )}

      {/* YouTube Official Responsive Embed */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default YouTubePlayer;

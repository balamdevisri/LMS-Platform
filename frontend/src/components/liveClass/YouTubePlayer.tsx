import React, { useMemo, useState, useRef } from 'react';
import { VideoOff, Sparkles, Play, Pause, Volume2, VolumeX, Maximize, ShieldCheck, Tv } from 'lucide-react';

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

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  youtubeVideoId,
  title = 'Interactive Course Presentation',
  isLive = true,
  status,
}) => {
  const cleanVideoId = useMemo(() => extractYouTubeVideoId(youtubeVideoId), [youtubeVideoId]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const postCommand = (func: string, args: any = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      postCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      postCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      postCommand('unMute');
      setIsMuted(false);
    } else {
      postCommand('mute');
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  if (!cleanVideoId) {
    return (
      <div className="relative w-full aspect-video rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-8 text-center overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute inset-0 bg-radial from-sky-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
          <VideoOff className="w-8 h-8 text-slate-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Live stream not configured</h3>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          The instructor has not connected a video stream for this session yet. Please stay on this page or check back shortly.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          Awaiting instructor broadcast signal
        </div>
      </div>
    );
  }

  // Clean custom parameters to disable YouTube logos, controls, title, share link, and annotations
  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1${originUrl ? `&origin=${encodeURIComponent(originUrl)}` : ''}`;

  const isActuallyLive = isLive || (status || '').toUpperCase() === 'LIVE';

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl bg-black border border-slate-800 shadow-2xl overflow-hidden group select-none"
    >
      {/* 1. TOP MASKING HEADER BAR (Completely blocks YouTube Title, Share & Logo hover elements) */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-20 px-5 py-3 flex items-center justify-between pointer-events-auto transition-opacity duration-300">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 text-[11px] font-extrabold flex items-center gap-1.5 backdrop-blur-md">
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span>SHAIVIKA PLAYER</span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md tracking-wide">
            {title}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {isActuallyLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-widest uppercase shadow-md shadow-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="w-2 h-2 rounded-full bg-white -ml-3.5" />
              LIVE
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-bold backdrop-blur-md">
              HD 1080P
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Secure Stream</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER INTERACTIVE PLAY/PAUSE OVERLAY BUTTON */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xs flex items-center justify-center cursor-pointer transition-all animate-in fade-in duration-200"
        >
          <div className="w-20 h-20 rounded-full bg-sky-500/90 text-white flex items-center justify-center shadow-2xl shadow-sky-500/50 hover:scale-110 transition-transform">
            <Play className="w-10 h-10 ml-1 fill-current text-white" />
          </div>
        </div>
      )}

      {/* 3. CLEAN EMBEDDED IFRAME */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 pointer-events-auto"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* 4. CUSTOM BOTTOM CONTROL BAR OVERLAY */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 px-5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-xl bg-white/10 hover:bg-sky-500 text-white transition-all cursor-pointer backdrop-blur-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-md"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="text-xs font-mono font-medium text-slate-300">
            {isActuallyLive ? 'Live Stream Active' : '00:00 / HD'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-sky-950/80 border border-sky-800/80 px-2.5 py-1 rounded-lg">
            Custom Super Player
          </span>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-md"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  duration?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  posterUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  title = 'Interactive Lesson Video Presentation',
  duration = '12:45',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className="my-6 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl group relative">
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            className="w-full h-full object-cover"
            onClick={togglePlay}
          />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center bg-linear-to-tr from-slate-950 via-slate-900 to-sky-950/40">
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <button
              onClick={togglePlay}
              className="relative z-10 w-20 h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-cyan-300/40"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-slate-950 text-slate-950" />
              ) : (
                <Play className="w-8 h-8 fill-slate-950 text-slate-950 ml-1" />
              )}
            </button>

            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{title}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent flex items-center justify-between gap-4 text-xs text-slate-300 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono text-xs text-slate-400">00:00 / {duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeedChange}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-all cursor-pointer border border-slate-700/50"
            >
              {playbackSpeed}x
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

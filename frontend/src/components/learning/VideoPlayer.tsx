import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles, CheckCircle2 } from 'lucide-react';
import type { VideoProvider } from '../../../../shared/types/course';
import { detectVideoProvider } from '../../services/courseNormalizer';

interface VideoPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  duration?: string;
  provider?: VideoProvider;
  initialPosition?: number;
  onProgressUpdate?: (data: { currentTime: number; duration: number; percentage: number; isCompleted: boolean }) => void;
  onVideoComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  posterUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  title = 'Interactive Lesson Video Presentation',
  duration = '12:45',
  provider,
  initialPosition = 0,
  onProgressUpdate,
  onVideoComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveProvider = provider || (videoUrl ? detectVideoProvider(videoUrl) : 'direct');

  // Resume playback on initial load
  useEffect(() => {
    if (videoRef.current && initialPosition > 0 && !hasResumed) {
      videoRef.current.currentTime = initialPosition;
      setHasResumed(true);
    }
  }, [initialPosition, hasResumed]);

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
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
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

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    const pct = Math.min(100, Math.round((cur / dur) * 100));

    setCurrentTime(cur);
    setDurationSec(dur);
    setProgressPercent(pct);

    const completedNow = pct >= 90;
    if (completedNow && !isCompleted) {
      setIsCompleted(true);
      if (onVideoComplete) onVideoComplete();
    }

    if (onProgressUpdate) {
      onProgressUpdate({
        currentTime: cur,
        duration: dur,
        percentage: pct,
        isCompleted: completedNow || isCompleted,
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = (parseFloat(e.target.value) / 100) * (durationSec || 1);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderIframeEmbed = () => {
    let src = videoUrl || '';
    if (effectiveProvider === 'youtube') {
      const match = videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const yId = match ? match[1] : '';
      src = `https://www.youtube-nocookie.com/embed/${yId}?autoplay=1&enablejsapi=1`;
    } else if (effectiveProvider === 'vimeo') {
      const match = videoUrl?.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      const vId = match ? match[1] : '';
      src = `https://player.vimeo.com/video/${vId}?autoplay=1`;
    }

    return (
      <div className="w-full h-full relative aspect-video bg-black">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="my-6 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl group relative"
    >
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {effectiveProvider === 'youtube' || effectiveProvider === 'vimeo' ? (
          renderIframeEmbed()
        ) : videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              setIsCompleted(true);
              if (onVideoComplete) onVideoComplete();
            }}
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
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs font-semibold text-cyan-300 pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-xs">{title}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {isCompleted && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
            <span className="uppercase px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
              {effectiveProvider}
            </span>
          </div>
        </div>

        {/* HTML5 Controls Overlay */}
        {effectiveProvider !== 'youtube' && effectiveProvider !== 'vimeo' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Seek Bar */}
            <div className="w-full flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={handleSeek}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
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

                <span className="font-mono text-xs text-slate-400">
                  {formatSeconds(currentTime)} / {durationSec > 0 ? formatSeconds(durationSec) : duration} ({progressPercent}%)
                </span>
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
        )}
      </div>
    </div>
  );
};

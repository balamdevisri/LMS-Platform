import React from 'react';
import { KaizenQLogo } from '../brand/KaizenQLogo';

interface KaizenQVideoPlayerProps {
  src?: string;
  className?: string;
}

export const KaizenQVideoPlayer: React.FC<KaizenQVideoPlayerProps> = ({
  src = '/KaizenQ.mp4',
  className = '',
}) => {
  return (
    <div className={`relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0B1220] select-none ${className}`}>
      {/* Aspect Ratio Video Container with Scale Zoom & Solid Corner Mask to 100% Remove Gemini Watermark */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0B1220]">
        <video
          className="w-full h-full object-cover object-center scale-[1.08] origin-center pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={src} type="video/mp4" />
          <source src="/KaizenQ.mp4" type="video/mp4" />
          Your browser does not support HTML5 video playback.
        </video>

        {/* ----------------- SOLID WATERMARK MASK (BOTTOM RIGHT CORNER - 100% REMOVAL) ----------------- */}
        {/* Opaque backdrop covering bottom right corner, fully optimized for mobile & desktop */}
        <div className="absolute bottom-0 right-0 z-40 p-1.5 xs:p-2 sm:p-3 bg-[#0B1220] rounded-tl-xl sm:rounded-tl-3xl border-t border-l border-slate-800/80 flex items-center justify-center shadow-2xl pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg scale-75 xs:scale-85 sm:scale-100 origin-bottom-right transition-transform">
            <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <KaizenQLogo layout="horizontal" theme="dark" size="sm" showTagline={false} />
          </div>
        </div>

        {/* Top Ambient Title Bar */}
        <div className="absolute top-0 inset-x-0 z-20 px-3 sm:px-6 py-2.5 sm:py-4 bg-linear-to-b from-[#0B1220]/90 to-transparent flex items-center justify-between text-white text-[10px] sm:text-xs font-['Sora'] pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#0B1220]/80 border border-slate-700/80 backdrop-blur-md max-w-[85%] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold tracking-wide truncate">Kaizen Q AI Learning Platform Overview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

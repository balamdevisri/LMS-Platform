import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical' | 'icon';
  theme?: 'light' | 'dark' | 'glass';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showSubtitle = true,
  className = '',
}) => {
  // Size mapping for symbol container and text font sizes
  const symbolSizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const titleSizeMap = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const taglineSizeMap = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9.5px] sm:text-[11px] tracking-[0.24em]',
    lg: 'text-[11px] sm:text-[13px] tracking-[0.28em]',
    xl: 'text-[13px] sm:text-[15px] tracking-[0.3em]',
  };

  const symbolClass = symbolSizeMap[size] || 'w-10 h-10 sm:w-11 sm:h-11';
  const titleClass = titleSizeMap[size] || 'text-xl sm:text-2xl';
  const taglineClass = taglineSizeMap[size] || 'text-[9.5px] sm:text-[11px] tracking-[0.24em]';

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* 1. OFFICIAL TECH EMBLEM SYMBOL (LEFT) */}
      <div className={`relative flex items-center justify-center shrink-0 ${symbolClass}`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 opacity-60 blur-md group-hover:blur-lg group-hover:opacity-90 transition-all duration-300" />

        {/* Emblem */}
        <div className="relative w-full h-full rounded-2xl bg-white/90 dark:bg-slate-950 border border-blue-100 dark:border-white/15 p-1 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/15 group-hover:scale-105 transition-transform duration-300">
          <img
            src="/brand/kaizenq-logo.webp"
            alt="KaizenQ Logo"
            width="44"
            height="44"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* 2. TEXT-BASED WORDMARK & TAGLINE */}
      {layout !== 'icon' && (
        <div className="flex flex-col justify-center">
          {/* Main Title: Kaizen Q */}
          <div className={`font-black ${titleClass} tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1`}>
            <span>Kaizen</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-400">
              Q
            </span>
          </div>

          {/* Tagline: LEARN • BUILD • EVOLVE */}
          {showSubtitle && (
            <div className={`flex items-center gap-1.5 ${taglineClass} font-extrabold uppercase mt-1 text-slate-700 dark:text-zinc-200`}>
              <span className="h-[2px] w-3 sm:w-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shrink-0" />
              <span>LEARN</span>
              <span className="text-cyan-500 font-black">•</span>
              <span>BUILD</span>
              <span className="text-blue-500 font-black">•</span>
              <span>EVOLVE</span>
              <span className="h-[2px] w-3 sm:w-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shrink-0" />
            </div>
          )}
        </div>
      )}
    </Link>
  );
};

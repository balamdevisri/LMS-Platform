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
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 opacity-85 blur-[3px] group-hover:blur-[6px] group-hover:opacity-100 transition-all duration-300" />

        {/* Emblem SVG */}
        <div className="relative w-full h-full rounded-xl bg-slate-950 border border-white/25 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
          <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            <defs>
              <linearGradient id="kq_sym_grad" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="kq_sym_arrow" x1="0" y1="160" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Left AI Node Connections */}
            <g opacity="0.95">
              <line x1="10" y1="50" x2="38" y2="50" stroke="url(#kq_sym_grad)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="9" cy="50" r="4" fill="#38BDF8" />
              <polygon points="34,45 44,50 34,55" fill="#2563EB" />

              <line x1="2" y1="80" x2="34" y2="80" stroke="url(#kq_sym_grad)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="2" cy="80" r="4" fill="#38BDF8" />
              <polygon points="30,75 40,80 30,85" fill="#2563EB" />

              <line x1="14" y1="110" x2="38" y2="110" stroke="url(#kq_sym_grad)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="13" cy="110" r="4" fill="#38BDF8" />
              <polygon points="34,105 44,110 34,115" fill="#2563EB" />
            </g>

            {/* Outer Q Ring */}
            <circle cx="92" cy="80" r="52" fill="none" stroke="url(#kq_sym_grad)" strokeWidth="14" strokeLinecap="round" />

            {/* Inner K Letter */}
            <line x1="68" y1="44" x2="68" y2="116" stroke="url(#kq_sym_grad)" strokeWidth="13" strokeLinecap="round" />
            <path d="M 68 80 L 112 44" fill="none" stroke="url(#kq_sym_grad)" strokeWidth="13" strokeLinecap="round" />
            <path d="M 68 80 L 122 116 L 138 132" fill="none" stroke="url(#kq_sym_grad)" strokeWidth="13" strokeLinecap="round" />

            {/* Ascending Arrow */}
            <g transform="translate(98, 70)">
              <path d="M 0 16 L 0 0 M -5 5 L 0 -1 L 5 5" fill="none" stroke="url(#kq_sym_arrow)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
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

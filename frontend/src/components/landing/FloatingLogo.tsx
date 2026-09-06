import React from 'react';

interface FloatingLogoProps {
  className?: string;
}

/**
 * <FloatingLogo />
 * Clean, high-performance static KaizenQ hero logo:
 * - Static ambient radial glow aura
 * - Crisp KaizenQ logo with explicit width/height
 * - Static "KAIZEN Q" wordmark label
 * - Zero JavaScript animation loops (eliminates CPU/GPU battery drain)
 */
export const FloatingLogo: React.FC<FloatingLogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center group select-none ${className}`}>

      {/* Static soft ambient glow aura */}
      <div
        className="absolute rounded-full pointer-events-none w-72 h-72"
        aria-hidden="true"
      >
        {/* Light mode glow */}
        <div
          className="absolute inset-0 rounded-full dark:opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.20) 0%, rgba(37,99,235,0.12) 35%, rgba(236,72,153,0.06) 65%, transparent 80%)',
            filter: 'blur(36px)',
          }}
        />
        {/* Dark mode glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 dark:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(37,99,235,0.30) 35%, rgba(236,72,153,0.15) 65%, transparent 80%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Static logo container */}
      <div className="relative z-10 cursor-default transition-transform duration-200 hover:scale-[1.03]">
        <img
          src="/brand/kaizenq-logo.webp"
          alt="KaizenQ"
          width="224"
          height="224"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="w-44 h-44 sm:w-56 sm:h-56 object-contain select-none"
          style={{
            filter:
              'drop-shadow(0 8px 24px rgba(99,102,241,0.30)) drop-shadow(0 3px 8px rgba(0,0,0,0.12))',
          }}
        />
      </div>

      {/* "KAIZEN Q" wordmark label */}
      <div className="absolute bottom-0 translate-y-12 text-center pointer-events-none select-none">
        <span className="
          text-[14px] sm:text-[15px]
          font-semibold
          tracking-[0.32em]
          uppercase
          text-slate-600 dark:text-slate-300
          transition-colors duration-300
        ">
          KAIZEN Q
        </span>
      </div>

    </div>
  );
};

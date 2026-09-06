import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FloatingLogoProps {
  className?: string;
}

/**
 * <FloatingLogo />
 * Premium floating KaizenQ logo with:
 * - Slow up/down float animation
 * - Soft pulsing radial glow aura (theme-aware via Tailwind dark: classes)
 * - 3 orbiting accent dots (radii proportionally scaled to logo size)
 * - Hover: logo scale + intensified glow
 * - "KAIZEN Q" wordmark label below — bold, letter-spaced, premium feel
 * - prefers-reduced-motion: all animations disabled, static logo
 */
export const FloatingLogo: React.FC<FloatingLogoProps> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Orbit dots — radii scaled up ~28% to match larger logo ───────────────
  const orbitDots = [
    { color: '#2563EB', shadowColor: 'rgba(37,99,235,0.9)',   radius: 100, speed: 9,  size: 5.5, startAngle: 0   },
    { color: '#8B5CF6', shadowColor: 'rgba(139,92,246,0.9)', radius: 118, speed: 13, size: 4.5, startAngle: 120 },
    { color: '#EC4899', shadowColor: 'rgba(236,72,153,0.9)', radius: 90,  speed: 11, size: 4,   startAngle: 240 },
  ];

  const visibleDots = shouldReduceMotion ? [] : (isMobile ? orbitDots.slice(0, 1) : orbitDots);

  return (
    <div className={`relative flex items-center justify-center group ${className}`}>

      {/* ── Pulsing radial glow aura — scaled to 280px to match larger logo ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, willChange: 'transform, opacity' }}
        animate={
          shouldReduceMotion
            ? {}
            : { scale: [1, 1.09, 1], opacity: [0.55, 0.78, 0.55] }
        }
        transition={
          shouldReduceMotion
            ? {}
            : { duration: 4.5, ease: 'easeInOut', repeat: Infinity }
        }
      >
        {/* Light mode glow — soft pastel */}
        <div
          className="absolute inset-0 rounded-full dark:opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(37,99,235,0.14) 35%, rgba(236,72,153,0.08) 65%, transparent 80%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Dark mode glow — vivid */}
        <div
          className="absolute inset-0 rounded-full opacity-0 dark:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.50) 0%, rgba(37,99,235,0.34) 35%, rgba(236,72,153,0.20) 65%, transparent 80%)',
            filter: 'blur(44px)',
          }}
        />
      </motion.div>

      {/* ── Orbiting accent dots ───────────────────────────────────────────── */}
      {visibleDots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            backgroundColor: dot.color,
            boxShadow: `0 0 ${dot.size * 3}px ${dot.shadowColor}`,
            willChange: 'transform',
          }}
          animate={{ rotate: [dot.startAngle, dot.startAngle + 360] }}
          transition={{ duration: dot.speed, ease: 'linear', repeat: Infinity }}
          transformTemplate={(_props, generated) => {
            const match = generated.match(/rotate\(([^)]+)\)/);
            const deg = match ? parseFloat(match[1]) : 0;
            const rad = (deg * Math.PI) / 180;
            const x = Math.cos(rad) * dot.radius;
            const y = Math.sin(rad) * dot.radius * 0.35; // flatten to ellipse
            return `translate(${x}px, ${y}px)`;
          }}
        />
      ))}

      {/* ── Floating logo ─────────────────────────────────────────────────── */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
        transition={
          shouldReduceMotion
            ? {}
            : { duration: 5.5, ease: 'easeInOut', repeat: Infinity }
        }
        whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
        className="relative z-10 cursor-default"
      >
        {/* Hover glow intensifier */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            transform: 'scale(1.5)',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.32) 0%, rgba(37,99,235,0.18) 50%, transparent 75%)',
            filter: 'blur(22px)',
          }}
        />

        {/* Logo image — explicit dimensions to prevent CLS, high fetchPriority as hero LCP */}
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
              'drop-shadow(0 8px 28px rgba(99,102,241,0.32)) drop-shadow(0 3px 8px rgba(0,0,0,0.12))',
          }}
        />
      </motion.div>

      {/* ── "KAIZEN Q" wordmark label ─────────────────────────────────────── */}
      {/*
        Positioned below with translate-y to clear the float range (+12px).
        Bolder: font-semibold, 14px base, wide letter-spacing, high contrast.
      */}
      <div className="absolute bottom-0 translate-y-14 text-center pointer-events-none select-none">
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

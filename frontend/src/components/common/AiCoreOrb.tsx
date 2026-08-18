import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Code2, Layers, Shield, BarChart3, GraduationCap } from 'lucide-react';

// Define the 6 Floating Feature Cards configuration
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  className: string;
  delay: number;
  floatY: number;
}

const FloatingFeatureCard: React.FC<FeatureCardProps & { isLowPerformance?: boolean }> = React.memo(({ icon: Icon, title, className, delay, floatY, isLowPerformance }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isLowPerformance ? { opacity: 1, scale: 1, y: 0 } : {
        opacity: 1,
        scale: 1,
        y: [0, floatY, 0],
      }}
      transition={isLowPerformance ? { duration: 0.25 } : {
        y: {
          duration: 5 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
        opacity: { duration: 0.8 },
        scale: { duration: 0.8 },
      }}
      whileHover={{
        scale: 1.04,
        y: isLowPerformance ? -4 : floatY - 8,
        boxShadow: '0 20px 40px rgba(37, 99, 235, 0.12)',
        borderColor: 'rgba(37, 99, 235, 0.35)',
      }}
      className={`absolute z-30 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(37,99,235,0.03)] text-xs font-bold text-slate-800 dark:text-zinc-100 select-none cursor-pointer transition-colors duration-300 ${className}`}
    >
      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-heading tracking-wide uppercase text-[10px]">{title}</span>
    </motion.div>
  );
});

export const AiCoreOrb: React.FC = React.memo(() => {
  const [isLowPerformance] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return isMobile || prefersReducedMotion;
  });

  // Adapt particle density for mobile devices to maintain 60 FPS
  const particles = useMemo(() => {
    if (isLowPerformance) return [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 10 : 30;
    const arr = [];
    const colors = [
      'rgba(96, 165, 250, 0.65)',
      'rgba(168, 85, 247, 0.65)',
      'rgba(255, 255, 255, 0.8)',
    ];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = isMobile ? 90 + Math.random() * 60 : 140 + Math.random() * 120;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;

      arr.push({
        id: i,
        x: [x, x + (Math.random() * 40 - 20), x - (Math.random() * 40 - 20), x],
        y: [y, y + (Math.random() * 40 - 20), y - (Math.random() * 40 - 20), y],
        size: Math.random() * 3 + 2,
        color: colors[i % colors.length],
        duration: 12 + Math.random() * 8,
        delay: Math.random() * -10,
      });
    }
    return arr;
  }, [isLowPerformance]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible animate-pulse-slow">
      
      {/* ----------------- 1. BACKGROUND EFFECTS ----------------- */}
      
      {/* Soft Radial Ambient Glow */}
      <div className="absolute w-150 h-150 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.09)_0%,transparent_65%)] pointer-events-none z-0" />
      
      {/* Expanding Circular Wave Ripples */}
      {!isLowPerformance && [0, 1.8, 3.6].map((delay, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.55, 1.45],
            opacity: [0.22, 0],
          }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay,
          }}
          className="absolute w-90 h-90 rounded-full border border-blue-400/10 dark:border-blue-500/5 pointer-events-none z-0"
        />
      ))}
      
      {/* Light Rays Effect */}
      {!isLowPerformance && (
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center z-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="relative w-125 h-125"
          >
            {[0, 45, 90, 135].map((rot) => (
              <div
                key={rot}
                style={{ transform: `rotate(${rot}deg)` }}
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-linear-to-t from-transparent via-blue-400 to-transparent"
              />
            ))}
          </motion.div>
        </div>
      )}
      
      {/* Grid Mesh Canvas */}
      <svg className="absolute w-full h-full inset-0 z-0 pointer-events-none opacity-15 dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1" fill="rgba(37,99,235,0.8)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      
      {/* ----------------- 2. CONNECTION LINES (SVG) ----------------- */}
      {!isLowPerformance && (
        <svg className="absolute w-145 h-145 pointer-events-none z-10 overflow-visible" viewBox="0 0 580 580">
          <defs>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {/* Curved connection arcs */}
          <motion.path
            d="M 120 180 Q 200 120 290 290"
            stroke="url(#glowGrad)"
            strokeWidth="1.2"
            fill="none"
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 460 180 Q 380 120 290 290"
            stroke="url(#glowGrad)"
            strokeWidth="1.2"
            fill="none"
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.path
            d="M 120 400 Q 200 460 290 290"
            stroke="url(#glowGrad)"
            strokeWidth="1.2"
            fill="none"
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.path
            d="M 460 400 Q 380 460 290 290"
            stroke="url(#glowGrad)"
            strokeWidth="1.2"
            fill="none"
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </svg>
      )}
      
      
      {/* ----------------- 3. ANIMATED RINGS ----------------- */}
      {!isLowPerformance ? (
        <>
          {/* Ring 1 (Inner, Clockwise) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute w-90 h-90 pointer-events-none z-10"
          >
            <svg viewBox="0 0 360 360" className="w-full h-full opacity-35">
              <circle cx="180" cy="180" r="170" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5" strokeDasharray="6 12" />
            </svg>
          </motion.div>
          
          {/* Ring 2 (Counter-Clockwise) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            className="absolute w-100 h-100 pointer-events-none z-10"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-25">
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
              <circle cx="200" cy="10" r="4.5" fill="#8B5CF6" className="animate-pulse" />
              <circle cx="200" cy="390" r="4.5" fill="#8B5CF6" className="animate-pulse" />
            </svg>
          </motion.div>
          
          {/* Ring 3 (Dashed Large, Clockwise) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
            className="absolute w-110 h-110 pointer-events-none z-10"
          >
            <svg viewBox="0 0 440 440" className="w-full h-full opacity-30">
              <circle cx="220" cy="220" r="210" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="2.0" strokeDasharray="24 16" />
            </svg>
          </motion.div>
          
          {/* Ring 4 (Dotted Outer, Counter-Clockwise) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
            className="absolute w-120 h-120 pointer-events-none z-10"
          >
            <svg viewBox="0 0 480 480" className="w-full h-full opacity-20">
              <circle cx="240" cy="240" r="230" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1" strokeDasharray="3 15" />
            </svg>
          </motion.div>
          
          {/* Ring 5 (Orbit Ring, Slow Angle Rotation) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 58, repeat: Infinity, ease: 'linear' }}
            className="absolute w-130 h-130 pointer-events-none z-10"
          >
            <svg viewBox="0 0 520 520" className="w-full h-full opacity-15">
              <circle cx="260" cy="260" r="250" fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" strokeDasharray="80 15 20 15" />
            </svg>
          </motion.div>
        </>
      ) : (
        <div className="absolute w-[360px] h-[360px] rounded-full border border-blue-500/20 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-[320px] h-[320px] rounded-full border border-indigo-500/10" />
        </div>
      )}
      
      
      {/* ----------------- 4. DRIP-FLOATING PARTICLES ----------------- */}
      {!isLowPerformance && (
        <div className="absolute w-125 h-125 pointer-events-none z-10">
          {particles.map((pt) => (
            <motion.div
              key={pt.id}
              animate={{
                x: pt.x,
                y: pt.y,
              }}
              transition={{
                duration: pt.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pt.delay,
              }}
              style={{
                width: pt.size,
                height: pt.size,
                backgroundColor: pt.color,
                left: '250px',
                top: '250px',
              }}
              className="absolute rounded-full shadow-[0_0_10px_currentColor] pointer-events-none"
            />
          ))}
        </div>
      )}


      {/* ----------------- 5. PULSING CENTER AI CORE ORB (320px) ----------------- */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ width: '320px', height: '320px' }}
        className="relative rounded-full bg-white/92 dark:bg-slate-955/92 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.22),0_0_100px_rgba(139,92,246,0.18)] flex items-center justify-center z-20 group cursor-pointer"
      >
        {/* Multi-layered Spherical Glass Glow Inner Core */}
        <div className="absolute inset-4 rounded-full bg-linear-to-tr from-blue-500/10 via-sky-400/5 to-purple-500/15 border border-white/30 dark:border-white/5 shadow-inner pointer-events-none" />
        
        {/* Glow Spherical Center overlay */}
        <div className="absolute w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.45)_0%,rgba(37,99,235,0.1)_60%,transparent_100%)] pointer-events-none" />
        
        {/* Branding Logo symbol — 3D metallic glossy KaizenQ Logo */}
        <div className="relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <img
            src="/brand/kaizenq-logo.webp"
            alt="KaizenQ 3D Emblem"
            width="180"
            height="120"
            fetchPriority="high"
            decoding="async"
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_0_35px_rgba(56,189,248,0.65)] filter group-hover:drop-shadow-[0_0_55px_rgba(56,189,248,0.9)] transition-all duration-500"
          />
        </div>
      </motion.div>


      {/* ----------------- 6. FLOATING FEATURE CARDS ----------------- */}
      
      {/* 1. AI Tutor (Top Left) */}
      <FloatingFeatureCard
        icon={Bot}
        title="AI Tutor"
        className="top-[8%] left-[0%] md:left-[5%]"
        delay={0}
        floatY={-12}
        isLowPerformance={isLowPerformance}
      />

      {/* 2. Code Sandbox (Top Right) */}
      <FloatingFeatureCard
        icon={Code2}
        title="Code Sandbox"
        className="top-[7%] right-[0%] md:right-[5%]"
        delay={1}
        floatY={-14}
        isLowPerformance={isLowPerformance}
      />

      {/* 3. Skill Trees (Middle Left) */}
      <FloatingFeatureCard
        icon={Layers}
        title="Skill Trees"
        className="top-[43%] left-[-8%] md:left-[-2%]"
        delay={2}
        floatY={10}
        isLowPerformance={isLowPerformance}
      />

      {/* 4. ISO Certified (Middle Right) */}
      <FloatingFeatureCard
        icon={Shield}
        title="ISO Certified"
        className="top-[42%] right-[-8%] md:right-[-2%]"
        delay={1.5}
        floatY={12}
        isLowPerformance={isLowPerformance}
      />

      {/* 5. Adaptive Learning (Bottom Left) */}
      <FloatingFeatureCard
        icon={GraduationCap}
        title="Adaptive Learning"
        className="bottom-[12%] left-[-2%] md:left-[3%]"
        delay={0.7}
        floatY={-10}
        isLowPerformance={isLowPerformance}
      />

      {/* 6. AI Analytics (Bottom Center) */}
      <FloatingFeatureCard
        icon={BarChart3}
        title="AI Analytics"
        className="bottom-[6%] left-1/2 -translate-x-1/2"
        delay={2.5}
        floatY={-15}
        isLowPerformance={isLowPerformance}
      />

    </div>
  );
});

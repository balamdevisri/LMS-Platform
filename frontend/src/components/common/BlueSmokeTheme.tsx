import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface BlueSmokeThemeProps {
  className?: string;
  children?: React.ReactNode;
}

export const BlueSmokeTheme: React.FC<BlueSmokeThemeProps> = ({ className = '', children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollYRef = useRef(0);
  const [isLowPerformance] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return isMobile || prefersReducedMotion;
  });

  // Track global scroll percentage for the scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse coordinates for the premium cursor-follow glow spotlight (directly on DOM ref, bypassing state re-renders)
  useEffect(() => {
    if (isLowPerformance) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(650px circle at ${e.clientX}px ${e.clientY}px, rgba(37, 99, 235, 0.06), transparent 70%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLowPerformance]);

  // Set up flowing animated canvas mesh gradients
  useEffect(() => {
    if (isLowPerformance) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.getBoundingClientRect().width;
    const h = () => canvas.getBoundingClientRect().height;

    // Define control points representing floating mesh gradient hubs - Kaizen-Q Blue Theme
    const nodes = [
      { xFactor: 0.25, yFactor: 0.2, vx: 0.0005, vy: 0.0003, r: 420, r1: 37, g1: 99, b1: 235, a: 0.12 },   // Primary Blue #2563EB
      { xFactor: 0.75, yFactor: 0.35, vx: -0.0004, vy: 0.0006, r: 480, r1: 59, g1: 130, b1: 246, a: 0.10 }, // Secondary Blue #3B82F6
      { xFactor: 0.5, yFactor: 0.15, vx: 0.0003, vy: -0.0004, r: 390, r1: 96, g1: 165, b1: 250, a: 0.08 },  // Accent Blue #60A5FA
      { xFactor: 0.35, yFactor: 0.45, vx: -0.0006, vy: -0.0003, r: 520, r1: 147, g1: 197, b1: 253, a: 0.10 } // Soft Blue #93C5FD
    ];

    const animate = () => {
      const width = w();
      const height = h();

      ctx.clearRect(0, 0, width, height);

      // Fade out mesh gradient completely as scroll crosses 700px (Only keep behind Hero)
      const fadeRatio = Math.max(0, 1 - scrollYRef.current / 700);

      if (fadeRatio > 0) {
        const time = Date.now();
        nodes.forEach((node) => {
          // Slowly drift gradient coordinates using trigonometry
          const x = (width * node.xFactor) + Math.sin(time * node.vx) * (width * 0.12);
          const y = (height * node.yFactor) + Math.cos(time * node.vy) * (height * 0.08);

          ctx.save();
          const grad = ctx.createRadialGradient(x, y, 0, x, y, node.r);
          grad.addColorStop(0, `rgba(${node.r1}, ${node.g1}, ${node.b1}, ${node.a * fadeRatio})`);
          grad.addColorStop(0.5, `rgba(${node.r1}, ${node.g1}, ${node.b1}, ${(node.a * 0.35) * fadeRatio})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, node.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full min-h-screen bg-[var(--color-bg)] ${className}`}>
      
      {/* 1. Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 z-100 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 2. CSS-based Dots & Grid Texture Overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-dot-pattern opacity-100 pointer-events-none z-0" />

      {/* 3. Panel Background Radial Blue Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Left Panel Glow */}
        <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/10 to-blue-400/5 blur-[120px] mix-blend-screen" />
        {/* Right Panel Glow */}
        <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-blue-500/10 to-blue-300/5 blur-[130px] mix-blend-screen" />
      </div>

      {/* 4. Curved Abstract Shapes (Drifting Stripe/Cursor inspired curves) */}
      {!isLowPerformance && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute -top-20 -left-20 w-[600px] h-[600px] text-blue-500/5 dark:text-blue-400/5 select-none" viewBox="0 0 100 100" fill="none">
            <motion.path
              animate={{
                d: [
                  "M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z",
                  "M0,50 Q25,70 50,40 T100,50 L100,100 L0,100 Z",
                  "M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
                ]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              fill="currentColor"
            />
          </svg>
          <svg className="absolute -bottom-40 -right-20 w-[800px] h-[800px] text-blue-600/5 dark:text-blue-500/5 select-none" viewBox="0 0 100 100" fill="none">
            <motion.path
              animate={{
                d: [
                  "M0,60 Q35,40 70,60 T100,60 L100,100 L0,100 Z",
                  "M0,60 Q35,70 60,50 T100,60 L100,100 L0,100 Z",
                  "M0,60 Q35,40 70,60 L100,100 L0,100 Z"
                ]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      {/* 5. Floating Blurred Circles */}
      {!isLowPerformance && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              x: [0, 50, -30, 0],
              y: [0, -70, 50, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-300/10 dark:bg-blue-900/10 blur-[90px]"
          />
          <motion.div
            animate={{
              x: [0, -40, 60, 0],
              y: [0, 50, -70, 0],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-blue-400/10 dark:bg-blue-800/10 blur-[110px]"
          />
        </div>
      )}

      {/* 6. Tiny Glowing Particles */}
      {!isLowPerformance && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * 1200,
                y: Math.random() * 800,
                opacity: 0.1,
                scale: Math.random() * 0.6 + 0.3,
              }}
              animate={{
                y: [Math.random() * 800, Math.random() * 800 - 300],
                x: [Math.random() * 1200, Math.random() * 1200 - 150],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 18 + Math.random() * 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40 dark:bg-blue-300/40 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
            />
          ))}
        </div>
      )}

      {/* 7. Mouse-Follow Spot Radial Spotlight (Direct ref manipulation bypasses React render logic entirely) */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-0 opacity-55 dark:opacity-60 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(650px circle at -1000px -1000px, rgba(37, 99, 235, 0.06), transparent 70%)'
        }}
      />
      
      {/* 8. Canvas for volumetric flowing mesh gradients */}
      {!isLowPerformance && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
      )}
      
      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};


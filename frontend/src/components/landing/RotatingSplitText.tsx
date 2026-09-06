import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';

export interface RotatingSplitTextProps {
  words?: string[];
  /** ms each word stays visible before transitioning. Default 3000 */
  interval?: number;
  className?: string;
  showUnderline?: boolean;
}

const DEFAULT_WORDS = ['Learn.', 'Build.', 'Evolve.'];

// Brand gradient palette for sparkle particles
const SPARKLE_COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#F97316'];

interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

/** Single sparkle dot — scatters outward on exit, converges inward on enter */
const Sparkle: React.FC<{ particle: SparkleParticle; isExit: boolean }> = ({
  particle,
  isExit,
}) => {
  const tx = Math.cos(particle.angle) * particle.distance;
  const ty = Math.sin(particle.angle) * particle.distance;
  // Lightweight GPU-friendly single-layer glow
  const glow = `0 0 ${Math.round(particle.size * 2)}px ${particle.color}`;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        boxShadow: glow,
        left: particle.x,
        top: particle.y,
        translateX: '-50%',
        translateY: '-50%',
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: isExit ? 0.95 : 0, scale: isExit ? 0.4 : 1.6, x: 0, y: 0 }}
      animate={
        isExit
          ? { opacity: 0, scale: 1.1, x: tx, y: ty }
          : { opacity: 0, scale: 0, x: tx, y: ty }
      }
      // Slower: 700ms so the burst is clearly visible
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  );
};

/** Generates sparkle particles per letter at a given position */
function generateSparkles(
  charIdx: number,
  letterWidth: number,
  containerHeight: number,
  isExit: boolean,
): SparkleParticle[] {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 2 : 4;
  const particles: SparkleParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = isExit
      ? (Math.PI / count) * i - Math.PI / 2 + (Math.random() - 0.5) * 1.4
      : Math.PI / 2 + (Math.PI / count) * i + (Math.random() - 0.5) * 1.4;

    particles.push({
      id: `${charIdx}-${i}-${Date.now()}-${Math.random()}`,
      x: charIdx * letterWidth + letterWidth * 0.5,
      y: containerHeight * (0.3 + Math.random() * 0.4),
      color: SPARKLE_COLORS[(charIdx + i) % SPARKLE_COLORS.length],
      angle,
      // Larger scatter distance for visibility
      distance: 14 + Math.random() * 20,
      // 4–6px for clearly visible particles
      size: 4 + Math.random() * 2,
    });
  }

  return particles;
}

export const RotatingSplitText: React.FC<RotatingSplitTextProps> = ({
  words = DEFAULT_WORDS,
  interval = 3000,
  className = '',
  showUnderline = true,
}) => {
  const [index, setIndex] = useState(0);
  const [exitSparkles, setExitSparkles] = useState<SparkleParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      // Fire sparkle burst first, then switch word after a short delay
      if (!shouldReduceMotion && containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight || 64;
        const word = words[index] || '';
        const letterW = cw / Math.max(word.length, 1);
        const sparkles = word
          .split('')
          .flatMap((_, ci) => generateSparkles(ci, letterW, ch, true));
        setExitSparkles(sparkles);
        // Clear sparkles after 750ms (slightly longer than animation)
        setTimeout(() => setExitSparkles([]), 750);
      }
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, index, shouldReduceMotion]);

  const currentWord = words[index] || words[0] || 'Learn.';

  /* ─── Word container: stagger letters in/out ─── */
  const wordContainerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 0 : 1 },
    visible: {
      opacity: 1,
      transition: {
        // ~55ms stagger between letters on enter
        staggerChildren: shouldReduceMotion ? 0 : 0.055,
        delayChildren: 0.04,
      },
    },
    exit: {
      opacity: shouldReduceMotion ? 0 : 1,
      transition: {
        // ~55ms stagger on exit
        staggerChildren: shouldReduceMotion ? 0 : 0.055,
        staggerDirection: 1,
      },
    },
  };

  /* ─── Individual letter ─── */
  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 14,
      scale: shouldReduceMotion ? 1 : 0.40,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        // ~550ms enter animation so it is clearly tracked by eye
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,       // pull inward toward center baseline instead of fly-up
      scale: shouldReduceMotion ? 1 : 0.35,  // visibly shrink down
      transition: {
        // ~550ms exit animation
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className={`flex flex-col items-center lg:items-start select-none ${className}`}>
      {/* Heading wrapper — relative so sparkle particles position correctly */}
      <div
        ref={containerRef}
        className="relative min-h-[1.25em] flex items-center justify-center lg:justify-start"
      >
        {/* Sparkle exit burst layer */}
        {!shouldReduceMotion &&
          exitSparkles.map((p) => (
            <Sparkle key={p.id} particle={p} isExit={true} />
          ))}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWord}
              className="inline-flex whitespace-nowrap text-transparent bg-clip-text animate-gradient-shimmer"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #2563EB 0%, #6366F1 30%, #EC4899 65%, #F97316 85%, #2563EB 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              variants={wordContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {currentWord.split('').map((char, charIdx) => (
                <motion.span
                  key={`${currentWord}-${charIdx}`}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </h1>
      </div>

      {/* Gradient accent underline bar */}
      {showUnderline && (
        <div className="mt-2.5 h-[3px] w-full max-w-[200px] overflow-hidden rounded-full">
          <motion.div
            key={`bar-${currentWord}`}
            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#F97316]"
            initial={{ scaleX: 0.2, opacity: 0.5, transformOrigin: 'left' }}
            animate={{ scaleX: 1, opacity: 1, transformOrigin: 'left' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
    </div>
  );
};

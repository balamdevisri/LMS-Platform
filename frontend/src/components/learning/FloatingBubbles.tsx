import React from 'react';
import { motion } from 'framer-motion';

interface FloatingBubblesProps {
  isNightMode?: boolean;
}

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ isNightMode = false }) => {
  // Organic smoke cloud tendrils
  const smokeClouds = [
    { size: 500, top: '-10%', left: '-5%', duration: 22, delay: 0 },
    { size: 600, top: '25%', left: '60%', duration: 28, delay: 2 },
    { size: 450, top: '65%', left: '-10%', duration: 24, delay: 4 },
    { size: 550, top: '50%', left: '20%', duration: 32, delay: 1 },
    { size: 400, top: '80%', left: '50%', duration: 20, delay: 3 },
  ];

  // Floating wisps / small particles
  const wisps = Array.from({ length: 8 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Sky Blue Smoke Cloud Waves */}
      {smokeClouds.map((cloud, idx) => (
        <motion.div
          key={`smoke-${idx}`}
          className={`absolute rounded-[40%_60%_70%_30%/50%_60%_30%_70%] filter blur-3xl mix-blend-multiply ${
            isNightMode
              ? idx % 2 === 0
                ? 'bg-cyan-900/30 opacity-40 mix-blend-screen'
                : 'bg-indigo-900/30 opacity-35 mix-blend-screen'
              : idx % 3 === 0
              ? 'bg-sky-300/45 opacity-60'
              : idx % 3 === 1
              ? 'bg-cyan-200/50 opacity-65'
              : 'bg-blue-200/40 opacity-55'
          }`}
          style={{
            width: cloud.size,
            height: cloud.size * 0.8,
            left: cloud.left,
            top: cloud.top,
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 40, 0],
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating Smoke Wisps / Particles */}
      {wisps.map((_, i) => {
        const size = 120 + (i % 4) * 60;
        const left = `${(i * 13 + 7) % 90}%`;
        const initialY = `${(i * 18 + 10) % 90}%`;
        const duration = 16 + i * 2;

        return (
          <motion.div
            key={`wisp-${i}`}
            className={`absolute rounded-full filter blur-2xl ${
              isNightMode
                ? 'bg-cyan-400/15 opacity-40'
                : i % 2 === 0
                ? 'bg-sky-400/40 opacity-50'
                : 'bg-blue-300/45 opacity-45'
            }`}
            style={{
              width: size,
              height: size,
              left,
              top: initialY,
            }}
            animate={{
              y: [0, -80, 40, 0],
              x: [0, 40, -30, 0],
              scale: [0.9, 1.15, 0.85, 1],
              opacity: isNightMode ? [0.2, 0.4, 0.2] : [0.35, 0.6, 0.35],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

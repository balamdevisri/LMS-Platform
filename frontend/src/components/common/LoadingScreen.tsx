import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AnimatedKaizenQ } from './AnimatedKaizenQ';

const loadingSteps = [
  'Initializing AI Engine...',
  'Connecting to Neural Network...',
  'Loading Curriculum Models...',
  'Preparing Interactive Workspaces...',
  'Ready to Learn',
];

export const LoadingScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 800); // Give a little time to show 100% and "Ready"
          return 100;
        }
        const newProgress = prev + Math.floor(Math.random() * 8) + 2; // more natural progression
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 25) setStepIndex(0);
    else if (progress < 50) setStepIndex(1);
    else if (progress < 75) setStepIndex(2);
    else if (progress < 100) setStepIndex(3);
    else setStepIndex(4);
  }, [progress]);

  return (
    <AnimatePresence>
      <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: "easeInOut" } }}
        className="fixed inset-0 z-50 bg-linear-to-br from-slate-50 via-sky-50 to-indigo-50 flex flex-col items-center justify-center p-6 text-slate-900 select-none overflow-hidden"
      >
        {/* Background Ambient Glows */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-150 h-150 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-100 h-100 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center space-y-10">
          


          {/* Canvas Animation Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center -mt-8"
          >
            <AnimatedKaizenQ width={400} height={200} />
            <p className="text-[10px] sm:text-xs font-semibold text-[#94A3B8] uppercase tracking-[0.2em] mt-2">
              Next-Gen Education Platform
            </p>
          </motion.div>

          {/* Progress Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-64 sm:w-80 flex flex-col items-center space-y-4"
          >
            {/* Dynamic Loading Text */}
            <div className="h-4 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                <motion.span
                  key={stepIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-mono text-[#94A3B8]"
                >
                  {loadingSteps[stepIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-linear-to-r from-[#059669] via-[#10B981] to-[#34D399] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            
            {/* Percentage */}
            <span className="text-[10px] font-mono text-[#64748B]">
              {progress}%
            </span>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

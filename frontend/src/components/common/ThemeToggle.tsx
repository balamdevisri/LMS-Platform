import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { kqAppearance, setKqAppearance } = useTheme();
  const isNight = kqAppearance === 'night';

  const toggleTheme = () => {
    setKqAppearance(isNight ? 'day' : 'night');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`
        relative w-9 h-9 flex items-center justify-center rounded-xl
        border border-slate-200/80 dark:border-slate-700/60
        bg-slate-100/70 dark:bg-slate-800/60
        hover:bg-amber-50/80 dark:hover:bg-indigo-950/60
        hover:border-amber-300/60 dark:hover:border-indigo-500/40
        transition-all duration-200 cursor-pointer active:scale-95
        shadow-xs hover:shadow-amber-200/40 dark:hover:shadow-indigo-500/20
        hover:shadow-md group
        ${className}
      `}
    >
      {/* Soft circular glow on hover */}
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-amber-400/10 dark:bg-indigo-400/10 pointer-events-none" />

      <AnimatePresence mode="wait" initial={false}>
        {isNight ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  responsive?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', responsive = false }) => {
  const { kqTheme, setKqTheme, kqAppearance, setKqAppearance } = useTheme();

  return (
    <div className={`flex flex-wrap items-center ${responsive ? 'gap-1.5 xl:gap-2.5 lg:gap-1' : 'gap-2.5'} select-none ${className}`}>
      {/* Theme Selector */}
      <div className={`flex items-center ${responsive ? 'gap-0.5 xl:gap-1' : 'gap-1'}`}>
        <span className="hidden lg:inline text-[9px] font-sans font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
          THEME
        </span>
        <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200/80 bg-slate-100/50 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 shadow-xs">
          <button
            type="button"
            onClick={() => setKqTheme('coding')}
            title="⚡ CODING CHOPS"
            className={`rounded-md font-extrabold transition-all cursor-pointer flex items-center border shrink-0 ${
              responsive
                ? 'px-2 py-0.75 sm:px-2.5 sm:py-1 lg:px-1.5 lg:py-0.5 xl:px-2.5 xl:py-1 text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] gap-1 lg:gap-0.5 xl:gap-1'
                : 'px-2 py-0.75 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] gap-1'
            } ${
              kqTheme === 'coding'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <span>⚡</span>
            <span className="hidden sm:inline">CODING</span>
          </button>

          <button
            type="button"
            onClick={() => setKqTheme('field-guide')}
            title="◈ DEVELOPER FIELD GUIDE"
            className={`rounded-md font-extrabold transition-all cursor-pointer flex items-center border shrink-0 ${
              responsive
                ? 'px-2 py-0.75 sm:px-2.5 sm:py-1 lg:px-1.5 lg:py-0.5 xl:px-2.5 xl:py-1 text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] gap-1 lg:gap-0.5 xl:gap-1'
                : 'px-2 py-0.75 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] gap-1'
            } ${
              kqTheme === 'field-guide'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <span>◈</span>
            <span className="hidden sm:inline">FIELD GUIDE</span>
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className={`flex items-center ${responsive ? 'gap-0.5 xl:gap-1' : 'gap-1'}`}>
        <span className="hidden lg:inline text-[9px] font-sans font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
          MODE
        </span>
        <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200/80 bg-slate-100/50 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 shadow-xs">
          <button
            type="button"
            onClick={() => setKqAppearance('day')}
            title="☀️ GAMIFIED DAY"
            className={`rounded-md font-extrabold transition-all cursor-pointer flex items-center border shrink-0 ${
              responsive
                ? 'px-2 py-0.75 sm:px-2.5 sm:py-1 lg:px-1.5 lg:py-0.5 xl:px-2.5 xl:py-1 text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] gap-1 lg:gap-0.5 xl:gap-1'
                : 'px-2 py-0.75 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] gap-1'
            } ${
              kqAppearance === 'day'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span className="hidden sm:inline">DAY</span>
          </button>

          <button
            type="button"
            onClick={() => setKqAppearance('night')}
            title="🌙 NIGHT"
            className={`rounded-md font-extrabold transition-all cursor-pointer flex items-center border shrink-0 ${
              responsive
                ? 'px-2 py-0.75 sm:px-2.5 sm:py-1 lg:px-1.5 lg:py-0.5 xl:px-2.5 xl:py-1 text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] gap-1 lg:gap-0.5 xl:gap-1'
                : 'px-2 py-0.75 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] gap-1'
            } ${
              kqAppearance === 'night'
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span className="hidden sm:inline">NIGHT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

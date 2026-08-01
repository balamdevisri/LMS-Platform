import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border border-slate-200 bg-slate-100 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          theme === 'light'
            ? 'bg-white text-amber-500 shadow-xs ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-slate-800 text-purple-400 shadow-xs ring-1 ring-slate-700'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
};

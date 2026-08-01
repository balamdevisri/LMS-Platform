import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 dark:text-zinc-500 shrink-0 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-rose-500' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-slate-400 dark:text-zinc-500 shrink-0 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-[10px] text-rose-500 font-bold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

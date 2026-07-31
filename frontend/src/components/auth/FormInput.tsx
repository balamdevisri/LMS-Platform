import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { FormInputProps } from '@/types/auth';

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, name, error, required, icon: Icon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 font-['Sora'] text-left">
        <label htmlFor={name} className="block text-xs font-bold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500 font-extrabold">*</span>}
        </label>

        <div className="relative group">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Icon className="w-4 h-4 transition-colors" />
            </div>
          )}

          <input
            id={name}
            name={name}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
            className={`w-full bg-slate-50/70 border rounded-2xl py-3 text-xs font-medium text-slate-900 transition-all outline-hidden ${
              Icon ? 'pl-10' : 'pl-4'
            } pr-4 ${
              error
                ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/20'
                : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-500/15 hover:border-sky-300 shadow-2xs'
            } ${className}`}
            {...props}
          />
        </div>

        {helperText && !error && (
          <p id={`${name}-helper`} className="text-[11px] text-slate-500 font-normal">
            {helperText}
          </p>
        )}

        {error && (
          <div
            id={`${name}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1 duration-200 pt-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

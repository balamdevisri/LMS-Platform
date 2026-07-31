import { forwardRef, useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { PasswordInputProps } from '@/types/auth';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      name,
      error,
      required,
      helperText,
      showStrengthIndicator = false,
      className = '',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Password strength logic
    const calculateStrength = (pass: string) => {
      let score = 0;
      if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
      if (pass.length >= 8) score++;
      if (pass.length >= 12) score++;
      if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
      if (/[^A-Za-z0-9]/.test(pass)) score++;

      if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
      if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-500', text: 'text-sky-600' };
      return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    };

    const currentPassString = typeof value === 'string' ? value : '';
    const strength = calculateStrength(currentPassString);

    return (
      <div className="space-y-1.5 font-['Sora'] text-left">
        <label htmlFor={name} className="block text-xs font-bold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500 font-extrabold">*</span>}
        </label>

        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Lock className="w-4 h-4 transition-colors" />
          </div>

          <input
            id={name}
            name={name}
            type={showPassword ? 'text' : 'password'}
            ref={ref}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full bg-slate-50/70 border rounded-2xl py-3 pl-10 pr-11 text-xs font-medium text-slate-900 transition-all outline-hidden ${
              error
                ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/20'
                : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-500/15 hover:border-sky-300 shadow-2xs'
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {showStrengthIndicator && currentPassString.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Password Strength:</span>
              <span className={`font-bold ${strength.text}`}>{strength.label}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    step <= strength.score ? strength.color : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-slate-500 font-normal">{helperText}</p>
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

PasswordInput.displayName = 'PasswordInput';

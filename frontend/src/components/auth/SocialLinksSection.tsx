import React from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Code2, Globe, Link2 } from 'lucide-react';
import { FormInput } from './FormInput';
import type { StudentSignupFormData } from '@/types/auth';

interface Props {
  register: UseFormRegister<StudentSignupFormData>;
  errors: FieldErrors<StudentSignupFormData>;
}

export const SocialLinksSection: React.FC<Props> = ({ register, errors }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-sky-100/80">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-sky-600" /> Professional Profiles & Portfolio
        </span>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
          GitHub Verification Ready
        </span>
      </div>

      {/* GitHub Profile URL (Required) */}
      <FormInput
        label="GitHub Profile URL"
        required
        icon={Code2}
        placeholder="https://github.com/username"
        helperText="Required for automated GitHub repository verification & AI skill matching."
        error={errors.githubUrl?.message}
        {...register('githubUrl')}
      />

      {/* Grid for LinkedIn & Portfolio (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <FormInput
          label="LinkedIn Profile (Optional)"
          icon={Globe}
          placeholder="https://linkedin.com/in/username"
          error={errors.linkedinUrl?.message}
          {...register('linkedinUrl')}
        />

        <FormInput
          label="Portfolio Website (Optional)"
          icon={Globe}
          placeholder="https://myportfolio.dev"
          error={errors.portfolioUrl?.message}
          {...register('portfolioUrl')}
        />
      </div>
    </div>
  );
};

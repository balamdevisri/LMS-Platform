import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useSignupValidation } from '@/hooks/useSignupValidation';
import { useSignup } from '@/hooks/useSignup';
import { FormInput } from './FormInput';
import { PasswordInput } from './PasswordInput';
import { SocialLinksSection } from './SocialLinksSection';
import type { StudentSignupFormData } from '@/types/auth';

export const SignupForm: React.FC = () => {
  const { handleStudentSignup, isSubmitting, error } = useSignup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useSignupValidation();

  const passwordValue = watch('password');

  const onSubmit = async (data: StudentSignupFormData) => {
    await handleStudentSignup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 font-['Sora'] text-left">
      
      {/* Top Banner Error Notification */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <FormInput
        label="Full Name"
        required
        icon={User}
        placeholder="Jane Devson"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      {/* College Email */}
      <FormInput
        label="College Email"
        required
        type="email"
        icon={Mail}
        placeholder="jane@university.edu"
        helperText="Use your college or official educational institution email."
        error={errors.email?.message}
        {...register('email')}
      />

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordInput
          label="Password"
          required
          placeholder="Minimum 8 characters"
          showStrengthIndicator
          value={passwordValue || ''}
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Confirm Password"
          required
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      {/* Professional Social Links Section */}
      <SocialLinksSection register={register} errors={errors} />

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-blue-primary w-full py-4 justify-center text-xs font-extrabold tracking-wide shadow-xl shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating Account & Sending Email...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Secondary Login Link */}
      <div className="pt-3 text-center text-xs text-slate-600 font-medium">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-extrabold text-sky-600 hover:text-sky-700 hover:underline">
          Login
        </Link>
      </div>
    </form>
  );
};

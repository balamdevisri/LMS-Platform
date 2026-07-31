import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { motion } from 'framer-motion';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error(err?.message || 'Failed to send reset email. Please verify the email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 premium-glass-card p-8 text-slate-900 dark:text-slate-100 font-['Sora']"
    >
      
      {/* Mobile Brand Logo */}
      <div className="lg:hidden flex justify-center pb-2">
        <BrandLogo size="md" showSubtitle={true} />
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Reset Password</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Enter your registered account email and we'll send you a password recovery link.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4 text-center p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-white/5 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-[#2563EB] mx-auto" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Reset Link Dispatched</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            We sent a password recovery link to <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">{email}</span>. Please check your spam or inbox folder.
          </p>
          <Link
            to="/auth/login"
            className="btn-premium-blue w-full h-[52px] rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 hover:no-underline"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Account Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium-blue peer pl-10 pr-3"
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-300 peer-focus:text-[#2563EB] dark:peer-focus:text-[#60A5FA]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-premium-blue w-full h-[52px] rounded-full text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
        Remembered your password?{' '}
        <Link to="/auth/login" className="font-bold text-[#2563EB] hover:underline">
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;

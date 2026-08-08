import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink, RefreshCw, CheckCircle2, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

export const VerifyEmailCard: React.FC = () => {
  const location = useLocation();
  const state = location.state as { email?: string; fullName?: string; role?: string } | null;

  const email = state?.email || 'your registered email address';
  const role = state?.role || 'account';

  const [countdown, setCountdown] = useState<number>(0);
  const [isSending, setIsSending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0 || isSending) return;

    setIsSending(true);
    setResendNotice(null);

    try {
      await authService.resendVerificationEmail(email);
      toast.success('Registration confirmation email sent! Please check your inbox.');
      setResendNotice(`Confirmation email dispatched to ${email}`);
      setCountdown(60);
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend confirmation email.';
      toast.error(msg);
      setResendNotice(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 text-center font-['Sora'] py-2">
      
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      {/* Title & Message */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Wait for Admin Approval</span>
        </div>

        <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Registration Pending Approval
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-md mx-auto">
          Your {role !== 'account' ? role : ''} account has been created successfully. A registration confirmation email has been sent to{' '}
          <span className="text-blue-600 dark:text-blue-400 font-bold underline font-mono">{email}</span>.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto flex items-center gap-2 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>Your account is currently awaiting administrator review. You will receive an approval email once an admin grants access.</span>
        </div>
      </div>

      {/* Resend Success Notice */}
      {resendNotice && (
        <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>{resendNotice}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        
        {/* Button 1: Open Gmail */}
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full btn-blue-primary py-3.5 justify-center text-xs font-extrabold tracking-wide shadow-xl shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Open Gmail</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Button 2: Resend Registration Email */}
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={countdown > 0 || isSending}
          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-sky-50 text-slate-700 dark:text-slate-200 hover:text-slate-900 font-bold text-xs border border-sky-200 dark:border-slate-700 hover:border-sky-300 rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSending ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
          {isSending ? (
            <span>Sending Confirmation Email...</span>
          ) : countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <span>Resend Confirmation Email</span>
          )}
        </button>

        {/* Button 3: Back to Login */}
        <div className="pt-2">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};


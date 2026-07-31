import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ExternalLink, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

export const VerifyEmailCard: React.FC = () => {
  const location = useLocation();
  const state = location.state as { email?: string; fullName?: string } | null;

  const email = state?.email || 'your registered email address';

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
      toast.success('Verification email sent! Please check your inbox.');
      setResendNotice(`Verification email dispatched to ${email}`);
      setCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend verification email.';
      toast.error(msg);
      setResendNotice(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 text-center font-['Sora'] py-2">
      
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-sky-500 to-blue-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-sky-500/20">
        <Mail className="w-8 h-8 animate-bounce" />
      </div>

      {/* Title & Message */}
      <div className="space-y-2">
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
          Verify Your Email
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium max-w-md mx-auto">
          Your account has been created successfully. A verification email has been sent to{' '}
          <span className="text-sky-700 font-bold underline font-mono">{email}</span>.
        </p>
        <p className="text-xs text-slate-500 font-normal max-w-sm mx-auto pt-1">
          Please verify your email before logging in.
        </p>
      </div>

      {/* Resend Success Notice */}
      {resendNotice && (
        <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>{resendNotice}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        
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

        {/* Button 2: Resend Verification Email */}
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={countdown > 0 || isSending}
          className="w-full py-3.5 px-4 bg-white hover:bg-sky-50 text-slate-700 hover:text-slate-900 font-bold text-xs border border-sky-200 hover:border-sky-300 rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSending ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
          {isSending ? (
            <span>Sending Verification Email...</span>
          ) : countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <span>Resend Verification Email</span>
          )}
        </button>

        {/* Button 3: Back to Login */}
        <div className="pt-2">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

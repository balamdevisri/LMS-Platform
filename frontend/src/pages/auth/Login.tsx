import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signInWithGithub, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle email verification link parameters & pre-fill email
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isVerifiedParam = searchParams.get('verified') === 'true';
    const emailParam = searchParams.get('email');

    if (emailParam && !email) {
      setEmail(emailParam);
    }

    if (isVerifiedParam) {
      toast.success('🎉 Email verified successfully! You can now sign in to your KaizenQ account.');
    }
  }, [location.search]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && userProfile) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (userProfile.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, userProfile, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await login(email, password, rememberMe);
      toast.success('Signed in successfully!');
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'EMAIL_NOT_VERIFIED' || err?.message?.includes('verify your email')) {
        toast.error('Please verify your email before accessing KaizenQ.');
        navigate('/auth/verify-email', {
          state: { email: email.toLowerCase().trim() },
        });
      } else if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/invalid-email'
      ) {
        toast.error('Invalid email or password. Please check your credentials and try again.');
      } else {
        toast.error(err?.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubAuth = async () => {
    setIsSubmitting(true);
    try {
      const profile = await signInWithGithub();
      toast.success('Signed in with GitHub successfully!');
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('GitHub authentication error:', err);
      if (err?.code === 'auth/account-exists-with-different-credential' || err?.message?.includes('login using your password')) {
        if (err?.email) setEmail(err.email);
        toast.error('This email already exists. Please login using your password first to link your GitHub account.');
      } else {
        toast.error(err?.message || 'GitHub Authentication failed.');
      }
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
      
      {/* Brand Logo & Header */}
      <div className="flex items-center gap-3.5 pb-1">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 opacity-70 blur-md" />
          <div className="relative w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-950 border border-blue-100 dark:border-white/15 p-1 flex items-center justify-center shadow-lg shadow-blue-500/15">
            <img
              src="/brand/kaizenq-logo.webp"
              alt="KaizenQ Logo"
              width="48"
              height="48"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>
        <div className="space-y-0.5 text-left">
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white leading-tight">
            Sign In to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              KaizenQ LMS
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Enter your credentials to access your learning portal.</p>
        </div>
      </div>

      {/* GitHub Authentication Button */}
      <div>
        <button
          type="button"
          onClick={handleGithubAuth}
          disabled={isSubmitting}
          className="btn-premium-blue flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blue-100 dark:border-white/5" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-[#F7FBFF] dark:bg-slate-950 px-3 text-slate-500 dark:text-slate-400 font-medium">Or continue with Email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="input-premium-blue peer pl-10 pr-3"
            />
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-300 peer-focus:text-[#2563EB] dark:peer-focus:text-[#60A5FA]" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
            <Link to="/auth/forgot-password" className="text-[11px] text-[#2563EB] hover:underline font-bold transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-premium-blue peer pl-10 pr-10"
            />
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-300 peer-focus:text-[#2563EB] dark:peer-focus:text-[#60A5FA]" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Custom Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-300 font-medium select-none">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <motion.div
                animate={{
                  backgroundColor: rememberMe ? '#2563EB' : '#EFF6FF',
                  borderColor: rememberMe ? '#2563EB' : '#DCEEFF',
                }}
                transition={{ duration: 0.2 }}
                className="w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center transition-shadow hover:shadow-[0_0_8px_rgba(37,99,235,0.2)]"
              >
                {rememberMe && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.25 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </motion.div>
            </div>
            <span>Remember me on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-premium-blue w-full h-[52px] rounded-full text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Platform</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="space-y-3 pt-2 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Don't have an account?</p>
        <Link
          to="/auth/register"
          className="btn-premium-blue w-full h-[52px] rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:no-underline"
        >
          <span>Create Student Account</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
};

export default Login;

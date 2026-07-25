import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/common/BrandLogo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signInWithGithub, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      toast.error(err?.message || 'Failed to sign in. Please check your credentials.');
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
      toast.error(err?.message || 'GitHub Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 bg-white/95 backdrop-blur-2xl p-8 rounded-3xl border border-sky-200 shadow-2xl shadow-sky-500/15 text-slate-900 font-['Sora']">
      
      {/* Mobile Brand Logo */}
      <div className="lg:hidden flex justify-center pb-2">
        <BrandLogo size="md" showSubtitle={true} />
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h2 className="font-heading font-extrabold text-2xl text-slate-900">Sign In to Shaivika AI</h2>
        <p className="text-xs text-slate-600 font-medium">Enter your email and password to access your learning portal.</p>
      </div>

      {/* GitHub Authentication Button */}
      <div>
        <button
          type="button"
          onClick={handleGithubAuth}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs border border-sky-200 hover:border-sky-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-sky-100" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-white px-3 text-slate-500 font-medium">Or continue with Email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-50/80 border border-sky-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <Link to="/auth/forgot-password" className="text-[11px] text-sky-600 hover:underline font-bold">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50/80 border border-sky-200 rounded-xl py-2.5 pl-9 pr-10 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-50 border-sky-200 accent-sky-600 cursor-pointer"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-blue-primary w-full py-3 justify-center text-xs font-bold shadow-lg shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-600 font-medium">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-bold text-sky-600 hover:underline">
          Create Student Account
        </Link>
      </div>
    </div>
  );
};

export default Login;

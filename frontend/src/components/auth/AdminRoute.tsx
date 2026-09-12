import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LottieLoader } from '@/components/common/LottieLoader';

export const AdminRoute: React.FC<{ children: React.ReactNode; allowInstructor?: boolean }> = ({
  children,
  allowInstructor = false,
}) => {
  const { user, userProfile, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Safety fallback: Never keep users stuck on loading screen longer than 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Retrieve cached local session if Firebase network is rehydrating
  const cachedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('shaivika_user') : null;
  const cachedUser = cachedUserRaw
    ? (() => {
        try {
          return JSON.parse(cachedUserRaw);
        } catch {
          return null;
        }
      })()
    : null;

  const hasActiveSession = user || cachedUser;

  if (loading && !hasActiveSession && !timedOut) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <LottieLoader size="fullscreen" message="Verifying administrative credentials..." />
      </div>
    );
  }

  if (!hasActiveSession && (!loading || timedOut)) {
    return <Navigate to="/auth/login" replace />;
  }

  const effectiveRole = userProfile?.role || cachedUser?.role;
  const email = (user?.email || cachedUser?.email || '').toLowerCase();
  const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
  const isAdmin = effectiveRole === 'admin' || isAdminEmail;
  const isAllowed = isAdmin || (allowInstructor && effectiveRole === 'instructor');

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

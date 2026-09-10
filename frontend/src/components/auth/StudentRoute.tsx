import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LottieLoader } from '@/components/common/LottieLoader';

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Safety fallback: Never keep mobile users stuck on loading screen longer than 2.2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Retrieve cached local session if Firebase network is slow on mobile devices
  const cachedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('shaivika_user') : null;
  const cachedUser = cachedUserRaw ? (() => {
    try {
      return JSON.parse(cachedUserRaw);
    } catch {
      return null;
    }
  })() : null;

  const hasActiveSession = user || cachedUser;

  // Only show full-screen loader if loading AND no cached session exists AND within timeout window
  if (loading && !hasActiveSession && !timedOut) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <LottieLoader size="fullscreen" message="Loading student workspace..." />
      </div>
    );
  }

  // If no session after loading/timeout, redirect to login
  if (!hasActiveSession && (!loading || timedOut)) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect admins attempting to open student-only views
  const effectiveRole = userProfile?.role || cachedUser?.role;
  if (effectiveRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default StudentRoute;

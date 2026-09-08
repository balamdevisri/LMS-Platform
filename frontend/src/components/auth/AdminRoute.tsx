import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LottieLoader } from '@/components/common/LottieLoader';

export const AdminRoute: React.FC<{ children: React.ReactNode; allowInstructor?: boolean }> = ({ children, allowInstructor = false }) => {
  const { user, userProfile, loading } = useAuth();
  const activeUser = user;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <LottieLoader size="fullscreen" message="Verifying administrative credentials..." />
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/auth/login" replace />;
  }

  const isAllowed = userProfile?.role === 'admin' || (allowInstructor && userProfile?.role === 'instructor');

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode; allowInstructor?: boolean }> = ({ children, allowInstructor = false }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const isAllowed = userProfile?.role === 'admin' || (allowInstructor && userProfile?.role === 'instructor');

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

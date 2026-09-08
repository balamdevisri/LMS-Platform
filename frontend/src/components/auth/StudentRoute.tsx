import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LottieLoader } from '@/components/common/LottieLoader';

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const activeUser = user;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <LottieLoader size="fullscreen" message="Loading student workspace..." />
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect admins attempting to open student-only views
  if (userProfile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default StudentRoute;

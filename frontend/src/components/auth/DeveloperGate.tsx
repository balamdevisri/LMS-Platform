import React from 'react';
import { useDeveloperGate } from '@/contexts/DeveloperGateContext';
import { useAuth } from '@/contexts/AuthContext';
const LaunchingSoonPage = React.lazy(() => import('@/pages/prelaunch/LaunchingSoonPage').then(m => ({ default: m.LaunchingSoonPage })));

import { LottieLoader } from '@/components/common/LottieLoader';

interface DeveloperGateProps {
  children: React.ReactNode;
}

export const DeveloperGate: React.FC<DeveloperGateProps> = ({ children }) => {
  const { isPrelaunchMode, isDeveloper, isLoading: devGateLoading } = useDeveloperGate();
  const { user, loading: authLoading } = useAuth();
  const activeUser = user;

  // Show security loading animation only when initial gate check is processing
  if (devGateLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center select-none transition-colors">
        <LottieLoader size="fullscreen" message="Verifying security context..." />
      </div>
    );
  }

  // If user is authenticated (student, instructor, admin) OR developer session is active, grant access
  if (activeUser || isDeveloper) {
    return <>{children}</>;
  }

  // If prelaunch mode is enabled and visitor is unauthenticated, show Launching Soon page
  if (isPrelaunchMode) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center select-none transition-colors">
          <LottieLoader size="fullscreen" message="Verifying security context..." />
        </div>
      );
    }
    return (
      <React.Suspense fallback={null}>
        <LaunchingSoonPage />
      </React.Suspense>
    );
  }

  // Otherwise, unlock the full LMS application
  return <>{children}</>;
};

export default DeveloperGate;

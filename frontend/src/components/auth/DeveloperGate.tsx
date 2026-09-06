import React from 'react';
import { useDeveloperGate } from '@/contexts/DeveloperGateContext';
import { useAuth } from '@/contexts/AuthContext';
const LaunchingSoonPage = React.lazy(() => import('@/pages/prelaunch/LaunchingSoonPage').then(m => ({ default: m.LaunchingSoonPage })));

interface DeveloperGateProps {
  children: React.ReactNode;
}

export const DeveloperGate: React.FC<DeveloperGateProps> = ({ children }) => {
  const { isPrelaunchMode, isDeveloper, isLoading: devGateLoading } = useDeveloperGate();
  const { user, loading: authLoading } = useAuth();
  const activeUser = user;

  // Show security loading spinner only when initial gate check is processing
  if (devGateLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
          <span className="font-heading font-black text-sm">KQ</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Verifying security context...</span>
        </div>
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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 select-none">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
            <span className="font-heading font-black text-sm">KQ</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Verifying security context...</span>
          </div>
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

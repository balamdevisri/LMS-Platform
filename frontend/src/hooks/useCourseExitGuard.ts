import { useState, useCallback, useEffect, useRef } from 'react';

interface UseCourseExitGuardOptions {
  onExit: () => void;
  enabled?: boolean;
}

export function useCourseExitGuard({ onExit, enabled = true }: UseCourseExitGuardOptions) {
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingExitCallbackRef = useRef<(() => void) | null>(null);
  const isExecutingRef = useRef(false);
  const allowNavigationRef = useRef(false);

  // Request exit with optional custom destination callback
  const requestExit = useCallback((customCallback?: () => void) => {
    if (!enabled) {
      if (customCallback) customCallback();
      else onExit();
      return;
    }
    pendingExitCallbackRef.current = customCallback || null;
    setIsExitDialogOpen(true);
  }, [enabled, onExit]);

  // Confirm exit action
  const confirmExit = useCallback(() => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsProcessing(true);
    allowNavigationRef.current = true;

    setIsExitDialogOpen(false);
    const cb = pendingExitCallbackRef.current;
    pendingExitCallbackRef.current = null;

    if (cb) {
      cb();
    } else {
      onExit();
    }

    // Reset lock after navigation dispatch
    setTimeout(() => {
      isExecutingRef.current = false;
      setIsProcessing(false);
      allowNavigationRef.current = false;
    }, 500);
  }, [onExit]);

  // Cancel exit action
  const cancelExit = useCallback(() => {
    pendingExitCallbackRef.current = null;
    setIsExitDialogOpen(false);
  }, []);

  // ── Browser Refresh / Tab Close (Native beforeunload) ─────────────────
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowNavigationRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  // ── Browser Back Button (Popstate) Interception ───────────────────────
  useEffect(() => {
    if (!enabled) return;

    // Push a dummy history state so we can intercept popstate
    const stateKey = 'kq_learning_session_active';
    window.history.pushState({ [stateKey]: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      if (allowNavigationRef.current) {
        return;
      }

      // Re-push history state to keep user on learning page while dialog is shown
      window.history.pushState({ [stateKey]: true }, '');
      requestExit(() => {
        allowNavigationRef.current = true;
        window.history.back();
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, requestExit]);

  return {
    isExitDialogOpen,
    isProcessing,
    requestExit,
    confirmExit,
    cancelExit,
  };
}

export default useCourseExitGuard;

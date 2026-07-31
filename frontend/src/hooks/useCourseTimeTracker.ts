/**
 * SHAIVIKA LMS AI Platform - Custom Hook for Real-Time Active Learning Time Tracking
 * Automatically calculates time spent when student is active on course pages.
 */

import { useEffect, useRef } from 'react';
import { courseTimeService } from '@/services/courseTimeService';
import { useAuth } from '@/contexts/AuthContext';

export const useCourseTimeTracker = (courseId?: string) => {
  const { user, userProfile } = useAuth();
  const userId = userProfile?.uid || user?.uid || 'default_student';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start interval timer to increment time spent while tab is visible
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        courseTimeService.trackActiveTime(userId, courseId, 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, courseId]);
};

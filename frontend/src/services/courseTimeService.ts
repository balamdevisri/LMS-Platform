/**
 * SHAIVIKA LMS AI Platform - Course & Platform Real-Time Time Tracking Service
 * Tracks real-time active learning duration per student & per course without hardcoded fallbacks.
 */

import { AchievementService } from './achievementService';

export class CourseTimeService {
  private activeSecPrefix = 'shaivika_active_seconds_';
  private courseSecPrefix = 'shaivika_course_seconds_';
  private dailySecPrefix = 'shaivika_daily_seconds_';

  private getDaysArray(): string[] {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  private getCurrentDayName(): string {
    const dayIdx = new Date().getDay();
    // JavaScript getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[dayIdx] || 'Mon';
  }

  /**
   * Increment active time by N seconds for a student and optional course
   */
  trackActiveTime(userId = 'default_student', courseId?: string, seconds = 1): void {
    if (seconds <= 0) return;

    // 1. Total platform active seconds
    const keyTotal = `${this.activeSecPrefix}${userId}`;
    const prevTotal = Number(localStorage.getItem(keyTotal) || '0');
    const newTotal = prevTotal + seconds;
    localStorage.setItem(keyTotal, newTotal.toString());

    // 2. Course-specific active seconds
    if (courseId) {
      const keyCourse = `${this.courseSecPrefix}${userId}_${courseId}`;
      const prevCourse = Number(localStorage.getItem(keyCourse) || '0');
      localStorage.setItem(keyCourse, (prevCourse + seconds).toString());
    }

    // 3. Daily breakdown seconds
    const dayName = this.getCurrentDayName();
    const keyDaily = `${this.dailySecPrefix}${userId}`;
    let dailyMap: Record<string, number> = {};
    try {
      const stored = localStorage.getItem(keyDaily);
      if (stored) dailyMap = JSON.parse(stored);
    } catch {}

    dailyMap[dayName] = (dailyMap[dayName] || 0) + seconds;
    localStorage.setItem(keyDaily, JSON.stringify(dailyMap));

    // Also mirror to achievement practice time for XP calculation
    try {
      const achievementService = new AchievementService();
      achievementService.trackPracticeTime(seconds, userId);
    } catch {}

    // Dispatch real-time window event for reactive UI updates
    window.dispatchEvent(
      new CustomEvent('shaivika_time_updated', {
        detail: { userId, courseId, totalSeconds: newTotal },
      })
    );
  }

  /**
   * Get total active time in seconds
   */
  getTotalActiveSeconds(userId = 'default_student'): number {
    return Number(localStorage.getItem(`${this.activeSecPrefix}${userId}`) || '0');
  }

  /**
   * Get total active time in hours (decimal) combined with completed unit estimates if any
   */
  getTotalActiveHours(userId = 'default_student', completedUnitsHours = 0): number {
    const seconds = this.getTotalActiveSeconds(userId);
    const activeHours = seconds / 3600;
    // Return max of active tracked hours or completed unit estimates (strictly real calculated data)
    return Number(Math.max(activeHours, completedUnitsHours).toFixed(1));
  }

  /**
   * Get active time for a specific course in seconds
   */
  getCourseActiveSeconds(userId = 'default_student', courseId: string): number {
    return Number(localStorage.getItem(`${this.courseSecPrefix}${userId}_${courseId}`) || '0');
  }

  /**
   * Format seconds into human readable duration string
   */
  formatSecondsToReadable(seconds: number): string {
    if (seconds <= 0) return '0 mins';
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const hours = (seconds / 3600).toFixed(1);
    
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    return `${hours} hrs`;
  }

  /**
   * Get formatted course time spent
   */
  getCourseTimeFormatted(userId = 'default_student', courseId: string): string {
    const sec = this.getCourseActiveSeconds(userId, courseId);
    return this.formatSecondsToReadable(sec);
  }

  /**
   * Get weekly daily study hours breakdown (Mon - Sun)
   */
  getWeeklyHoursBreakdown(userId = 'default_student'): { day: string; hours: number }[] {
    const days = this.getDaysArray();
    const keyDaily = `${this.dailySecPrefix}${userId}`;
    let dailyMap: Record<string, number> = {};

    try {
      const stored = localStorage.getItem(keyDaily);
      if (stored) dailyMap = JSON.parse(stored);
    } catch {}

    return days.map((day) => {
      const sec = dailyMap[day] || 0;
      const hrs = Number((sec / 3600).toFixed(2));
      return { day, hours: hrs };
    });
  }

  /**
   * Clear old hardcoded or cached timer data for fresh calculation
   */
  resetOldData(userId = 'default_student'): void {
    localStorage.removeItem(`shaivika_study_hours_${userId}`);
  }
}

export const courseTimeService = new CourseTimeService();

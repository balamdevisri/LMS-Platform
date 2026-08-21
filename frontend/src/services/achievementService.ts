import { toast } from 'sonner';
import { studentService, type StudentUser } from './studentService';

// ================= TYPES & INTERFACES =================

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentId?: string;
  instructorName: string;
  completionDate: string;
  verificationId: string;
  courseDuration?: string;
  modulesCount?: number;
  score?: number;
  googleDriveLink?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earnedDate: string;
}

export interface AchievementStats {
  coursesCompleted: number;
  lessonsCompleted: number;
  quizAttempts: number;
  assignmentsSubmitted: number;
  codingChallengesSolved: number;
  aiAssistantSessions: number;
  notesCreated: number;
  discussionsStarted: number;
  repliesPosted: number;
  practiceTimeSeconds: number;
}

export interface StreakState {
  dailyStreak: number;
  weeklyStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface LeaderboardEntry {
  rank: number;
  id?: string;
  name: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  xp: number;
  badgesCount: number;
  coursesCompleted: number;
  streak?: number;
  level?: number;
  levelTitle?: string;
  isCurrentUser?: boolean;
}

// Static Badges Catalogue
export const STATIC_BADGES: Omit<Badge, 'earnedDate'>[] = [
  {
    id: 'first-challenge',
    name: 'First Challenge',
    description: 'Complete your first challenge.',
    iconName: 'Target',
    rarity: 'Common'
  },
  {
    id: 'xp-starter',
    name: 'XP Starter',
    description: 'Earn 100 XP.',
    iconName: 'Zap',
    rarity: 'Common'
  },
  {
    id: 'streak-7',
    name: '7 Day Streak',
    description: 'Learn for 7 consecutive days.',
    iconName: 'Flame',
    rarity: 'Epic'
  },
  {
    id: 'mission-master',
    name: 'Mission Master',
    description: 'Complete one full mission.',
    iconName: 'Rocket',
    rarity: 'Rare'
  },
  {
    id: 'coding-explorer',
    name: 'Coding Explorer',
    description: 'Complete 10 interactive challenges.',
    iconName: 'Terminal',
    rarity: 'Rare'
  },
  {
    id: 'course-master',
    name: 'Course Master',
    description: 'Complete an entire course.',
    iconName: 'Award',
    rarity: 'Legendary'
  }
];

// Configurable XP Multipliers
export const XP_CONFIG = {
  LESSON_COMPLETED: 20,
  QUIZ_PASSED: 30,
  ASSIGNMENT_SUBMITTED: 40,
  PRACTICE_LAB_COMPLETED: 50,
  DISCUSSION_ANSWERED: 15,
  DAILY_LEARNING: 10,
  BADGE_EARNED: 100
};

// Level XP boundaries
export const getLevelForXP = (xp: number): number => {
  if (xp <= 500) return 1;       // Beginner
  if (xp <= 1200) return 2;      // Explorer
  if (xp <= 2500) return 3;      // Learner
  if (xp <= 5000) return 4;      // Practitioner
  if (xp <= 8500) return 5;      // Professional
  if (xp <= 13000) return 6;     // Expert
  return 7;                      // Master
};

export const getLevelTitle = (level: number): string => {
  switch (level) {
    case 1: return 'Beginner';
    case 2: return 'Explorer';
    case 3: return 'Learner';
    case 4: return 'Practitioner';
    case 5: return 'Professional';
    case 6: return 'Expert';
    case 7: return 'Master';
    default: return 'Scholar';
  }
};

export const getXPRequiredForNextLevel = (level: number): number => {
  switch (level) {
    case 1: return 500;
    case 2: return 1200;
    case 3: return 2500;
    case 4: return 5000;
    case 5: return 8500;
    case 6: return 13000;
    default: return 999999; // Master level maximum
  }
};

export const getXPBaseForLevel = (level: number): number => {
  switch (level) {
    case 1: return 0;
    case 2: return 500;
    case 3: return 1200;
    case 4: return 2500;
    case 5: return 5000;
    case 6: return 8500;
    case 7: return 13000;
    default: return 13000;
  }
};

// ================= SERVICE PROVIDERS =================

// 1. XP SERVICE
export class XPService {
  private xpKeyPrefix = 'shaivika_user_xp_';
  private pointsKey = 'shaivika_points_default_student';

  getXPPoints(userId = 'default_student'): number {
    const claimsKey = `shaivika_user_xp_claims_${userId}`;
    const data = localStorage.getItem(claimsKey);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (c: any) => c.id !== 'claim_1' && c.id !== 'claim_2' && c.id !== 'claim_3' && c.id !== 'claim_4'
          );
          return filtered.reduce((sum: number, c: any) => sum + (c.xp || 0), 0);
        }
      } catch (e) {}
    }
    const currentPts = localStorage.getItem(`${this.pointsKey}`);
    if (currentPts) {
      return parseInt(currentPts, 10);
    }
    const val = localStorage.getItem(`${this.xpKeyPrefix}${userId}`);
    return val ? parseInt(val, 10) : 150; // Fallback to 150
  }

  addXP(points: number, activityName: string, userId = 'default_student'): number {
    const currentXp = this.getXPPoints(userId);
    const updatedXp = currentXp + points;

    // Save to claims to keep single source of truth updated
    const claimsKey = `shaivika_user_xp_claims_${userId}`;
    const claimsData = localStorage.getItem(claimsKey);
    let claimsList = [];
    if (claimsData) {
      try {
        claimsList = JSON.parse(claimsData);
      } catch (e) {}
    }
    claimsList.unshift({
      id: `claim_xp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: activityName,
      xp: points,
      category: 'Module Completion Bonus',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(claimsKey, JSON.stringify(claimsList));
    
    // Save to legacy keys to keep systems synced
    localStorage.setItem(`${this.xpKeyPrefix}${userId}`, String(updatedXp));
    localStorage.setItem(`${this.pointsKey}`, String(updatedXp));

    const oldLevel = getLevelForXP(currentXp);
    const newLevel = getLevelForXP(updatedXp);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaivika_xp_updated', { detail: { xp: updatedXp, userId, points, activityName } }));
    }

    if (newLevel > oldLevel) {
      toast.success(`🎉 Level Up! You reached Level ${newLevel} (${getLevelTitle(newLevel)})!`);
    } else {
      toast.info(`+${points} XP: ${activityName}`);
    }

    // Auto-check badges when XP updates
    const badgeService = new BadgeService();
    badgeService.checkAndAwardBadges(userId);

    return updatedXp;
  }

  getLevel(userId = 'default_student'): number {
    return getLevelForXP(this.getXPPoints(userId));
  }
}

// 2. BADGE SERVICE
export class BadgeService {
  private badgesKeyPrefix = 'shaivika_earned_badges_';

  private getRawStoredBadges(userId = 'default_student'): Badge[] {
    const data = localStorage.getItem(`${this.badgesKeyPrefix}${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return [];
  }

  getEarnedBadges(userId = 'default_student'): Badge[] {
    // Dynamically check and evaluate badges on read to ensure sync
    return this.checkAndAwardBadges(userId);
  }

  checkAndAwardBadges(userId = 'default_student'): Badge[] {
    const earned = this.getRawStoredBadges(userId);
    const earnedIds = new Set(earned.map(b => b.id));
    const statsService = new AchievementService();
    const streaks = statsService.getStreaks(userId);
    const totalXp = new XPService().getXPPoints(userId);

    // Calculate actual completed challenges dynamically from localStorage
    let completedChallenges = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('shaivika_completed_')) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const list = JSON.parse(val);
            if (Array.isArray(list)) {
              completedChallenges += list.length;
            }
          }
        } catch (e) {}
      }
    }

    const stats = statsService.getStats(userId);
    const completedMissions = (stats as any).modulesCompleted || 0;
    const completedCourses = stats.coursesCompleted || 0;
    const dailyStreak = streaks.dailyStreak || 0;

    const newlyAwarded: Badge[] = [];
    const nowStr = new Date().toLocaleDateString();

    const tryAward = (badgeId: string) => {
      if (earnedIds.has(badgeId)) return;
      const meta = STATIC_BADGES.find(b => b.id === badgeId);
      if (meta) {
        const newBadge: Badge = {
          ...meta,
          earnedDate: nowStr
        };
        earned.push(newBadge);
        newlyAwarded.push(newBadge);
        earnedIds.add(badgeId);
        
        // Award XP and log activity
        const xpService = new XPService();
        setTimeout(() => {
          xpService.addXP(XP_CONFIG.BADGE_EARNED, `Unlocked Badge: ${meta.name}`, userId);
          this.logActivity(meta.name, userId);
        }, 300);
      }
    };

    // Evaluate Rules
    if (completedChallenges >= 1) tryAward('first-challenge');
    if (totalXp >= 100) tryAward('xp-starter');
    if (dailyStreak >= 7) tryAward('streak-7');
    if (completedMissions >= 1) tryAward('mission-master');
    if (completedChallenges >= 10) tryAward('coding-explorer');
    if (completedCourses >= 1) tryAward('course-master');

    if (newlyAwarded.length > 0) {
      localStorage.setItem(`${this.badgesKeyPrefix}${userId}`, JSON.stringify(earned));
    }

    return earned;
  }

  private logActivity(badgeName: string, _userId: string) {
    try {
      const cached = localStorage.getItem('shaivika_user_activities');
      let actList = [];
      if (cached) actList = JSON.parse(cached);
      actList.unshift({
        id: `act_${Date.now()}`,
        courseId: '1',
        courseTitle: 'Enterprise LMS Achievements',
        type: 'completed',
        title: `Earned Badge: ${badgeName}`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('shaivika_user_activities', JSON.stringify(actList.slice(0, 50)));
    } catch (e) {}
  }
}

// 3. CERTIFICATE SERVICE
export class CertificateService {
  private certKeyPrefix = 'shaivika_user_certificates_';

  getCertificates(userId = 'default_student'): Certificate[] {
    const data = localStorage.getItem(`${this.certKeyPrefix}${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return [];
  }

  generateCertificate(
    courseId: string,
    courseTitle: string,
    instructorName: string,
    studentName: string,
    userId = 'default_student',
    studentId = 'STU-9921',
    courseDuration = '24 Hours',
    modulesCount = 8
  ): Certificate {
    const certs = this.getCertificates(userId);
    const existing = certs.find(c => c.courseId === courseId);
    if (existing) return existing;

    const hashInput = `${courseId}_${studentName}_${Date.now()}`;
    const verificationId = 'KQ-' + Array.from(hashInput)
      .reduce((hash, char) => 0 | (hash * 33 + char.charCodeAt(0)), 5381)
      .toString(16)
      .toUpperCase()
      .substring(0, 8);

    const newCert: Certificate = {
      id: `cert_${courseId}_${Date.now()}`,
      courseId,
      courseTitle,
      studentName,
      studentId: studentId || 'STU-' + verificationId.substring(3),
      instructorName,
      completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationId,
      courseDuration,
      modulesCount,
      score: 100
    };

    certs.push(newCert);
    localStorage.setItem(`${this.certKeyPrefix}${userId}`, JSON.stringify(certs));
    
    // Log achievement statistic
    const statService = new AchievementService();
    statService.incrementStat('coursesCompleted', 1, userId);

    return newCert;
  }
  saveExternalCertificate(userId: string, cert: Certificate): void {
    const certs = this.getCertificates(userId);
    const index = certs.findIndex(c => c.courseId === cert.courseId);
    if (index >= 0) {
      certs[index] = { ...certs[index], ...cert };
    } else {
      certs.push(cert);
    }
    localStorage.setItem(`${this.certKeyPrefix}${userId}`, JSON.stringify(certs));
  }

  checkEligibilityAndGenerate(coursesProgress: any[], studentName: string, userId = 'default_student'): Certificate[] {
    const certs = this.getCertificates(userId);
    let changed = false;

    coursesProgress.forEach((p) => {
      // Must be 100% completed
      if (p.percentage === 100) {
        const courseIdStr = String(p.course.id);
        const existing = certs.find(c => c.courseId === courseIdStr);
        if (!existing) {
          const hashInput = `${courseIdStr}_${studentName}_${Date.now()}`;
          const verificationId = 'KQ-' + Math.abs(Array.from(hashInput)
            .reduce((hash, char) => 0 | (hash * 33 + char.charCodeAt(0)), 5381))
            .toString(16)
            .toUpperCase()
            .substring(0, 8);

          const modulesCount = (p.course.modules && p.course.modules.length) || (p.course.syllabus && p.course.syllabus.length) || 8;
          const newCert: Certificate = {
            id: `cert_${courseIdStr}_${Date.now()}`,
            courseId: courseIdStr,
            courseTitle: p.course.title,
            studentName,
            instructorName: p.course.instructor || 'Lead Instructor',
            completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            verificationId,
            modulesCount
          };
          certs.push(newCert);
          changed = true;
          toast.success(`🎓 Congratulations! You unlocked the Certificate for ${p.course.title}!`);
        }
      }
    });

    if (changed) {
      localStorage.setItem(`${this.certKeyPrefix}${userId}`, JSON.stringify(certs));
      const statService = new AchievementService();
      statService.incrementStat('coursesCompleted', 1, userId);
    }

    return certs;
  }
}

// 4. ACHIEVEMENT SERVICE (TRACKER & STREAKS)
export class AchievementService {
  private statsKeyPrefix = 'shaivika_achievement_stats_';
  private streakKeyPrefix = 'shaivika_user_streak_';

  getStats(userId = 'default_student'): AchievementStats {
    const data = localStorage.getItem(`${this.statsKeyPrefix}${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    // Fresh initial stats mapping to actual user workspace activities
    return {
      coursesCompleted: 0,
      lessonsCompleted: 0,
      quizAttempts: 0,
      assignmentsSubmitted: 0,
      codingChallengesSolved: 0,
      aiAssistantSessions: 0,
      notesCreated: 0,
      discussionsStarted: 0,
      repliesPosted: 0,
      practiceTimeSeconds: 0
    };
  }

  incrementStat(statName: keyof AchievementStats, amount = 1, userId = 'default_student'): AchievementStats {
    const stats = this.getStats(userId);
    stats[statName] = (stats[statName] || 0) + amount;
    localStorage.setItem(`${this.statsKeyPrefix}${userId}`, JSON.stringify(stats));

    // Award minor XP for increments
    const xpService = new XPService();
    if (statName === 'quizAttempts') xpService.addXP(XP_CONFIG.QUIZ_PASSED, 'Quiz Submitted', userId);
    else if (statName === 'assignmentsSubmitted') xpService.addXP(XP_CONFIG.ASSIGNMENT_SUBMITTED, 'Assignment Submitted', userId);
    else if (statName === 'codingChallengesSolved') xpService.addXP(XP_CONFIG.PRACTICE_LAB_COMPLETED, 'Practice Challenge Solved', userId);
    else if (statName === 'repliesPosted') xpService.addXP(XP_CONFIG.DISCUSSION_ANSWERED, 'Replied to Discussion', userId);

    return stats;
  }

  trackPracticeTime(seconds: number, userId = 'default_student'): void {
    const stats = this.getStats(userId);
    stats.practiceTimeSeconds += seconds;
    localStorage.setItem(`${this.statsKeyPrefix}${userId}`, JSON.stringify(stats));

    // Every 5 minutes of practice earns +20 XP
    if (stats.practiceTimeSeconds % 300 < seconds) {
      const xpService = new XPService();
      xpService.addXP(20, '5 Minutes of Code Practice', userId);
    }
  }

  getStreaks(userId = 'default_student'): StreakState {
    const data = localStorage.getItem(`${this.streakKeyPrefix}${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return {
      dailyStreak: 3, // Mock starting streak for onboarding visual engagement
      weeklyStreak: 1,
      longestStreak: 4,
      lastActiveDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] // yesterday
    };
  }

  checkAndUpdateStreak(userId = 'default_student'): StreakState {
    const state = this.getStreaks(userId);
    const todayStr = new Date().toISOString().split('T')[0];

    if (state.lastActiveDate === todayStr) {
      return state; // Already active today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (state.lastActiveDate === yesterdayStr) {
      state.dailyStreak += 1;
      if (state.dailyStreak % 7 === 0) {
        state.weeklyStreak += 1;
      }
      if (state.dailyStreak > state.longestStreak) {
        state.longestStreak = state.dailyStreak;
      }
      toast.success(`🔥 Learning Streak active! Day ${state.dailyStreak} in a row.`);
      
      const xpService = new XPService();
      xpService.addXP(XP_CONFIG.DAILY_LEARNING, 'Daily Streak Active', userId);
    } else {
      // Streak broken
      state.dailyStreak = 1;
      toast.info('⏰ Welcome back! A new daily learning streak has started.');
    }

    state.lastActiveDate = todayStr;
    localStorage.setItem(`${this.streakKeyPrefix}${userId}`, JSON.stringify(state));

    return state;
  }
}

// 5. LEADERBOARD SERVICE
export class LeaderboardService {
  private calculateCohortFromStudents(
    students: StudentUser[],
    filter: 'global' | 'course' | 'weekly' | 'monthly',
    userId = 'default_student'
  ): LeaderboardEntry[] {
    const xpService = new XPService();
    const userXp = xpService.getXPPoints(userId);
    const badgeService = new BadgeService();
    const userBadges = badgeService.getEarnedBadges(userId).length;
    const statService = new AchievementService();
    const userStreak = statService.getStreaks(userId).dailyStreak;

    let loggedInName = 'You (Scholar)';
    try {
      const userRaw = localStorage.getItem('shaivika_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.fullName || u.name || u.displayName) {
          loggedInName = u.fullName || u.name || u.displayName;
        }
      }
    } catch (e) {
      // Ignore fallback
    }

    const cohort: Omit<LeaderboardEntry, 'rank'>[] = [];
    let currentUserIncluded = false;

    // Map real registered students
    students.forEach((s) => {
      const isCurrent = (s.id === userId || s.uid === userId || s.email === userId);
      const studentXp = isCurrent
        ? Math.max(s.xp || 0, userXp)
        : (s.xp || (s.learningScore ? s.learningScore * 25 : 350));

      const badgesCount = isCurrent
        ? Math.max(Array.isArray(s.badges) ? s.badges.length : 0, userBadges)
        : (Array.isArray(s.badges) ? s.badges.length : (typeof s.badgesCount === 'number' ? s.badgesCount : Math.min(Math.floor(studentXp / 300), 8)));

      const coursesCompleted = s.completedCourses || s.courses || (studentXp >= 1000 ? 1 : 0);
      const streak = isCurrent ? userStreak : ((s as any).streak || (s as any).dailyStreak || Math.max(1, (studentXp % 7) + 1));
      const level = getLevelForXP(studentXp);
      const levelTitle = getLevelTitle(level);

      if (isCurrent) {
        currentUserIncluded = true;
      }

      cohort.push({
        id: s.id || s.uid,
        name: isCurrent ? `${s.name || loggedInName}` : (s.name || s.fullName || s.email?.split('@')[0] || 'Student Scholar'),
        avatarUrl: s.photoURL || s.profilePhoto || undefined,
        college: s.college,
        branch: s.branch,
        xp: studentXp,
        badgesCount,
        coursesCompleted,
        streak,
        level,
        levelTitle,
        isCurrentUser: isCurrent
      });
    });

    // Ensure active logged-in user is included if not in student roster
    if (!currentUserIncluded) {
      const level = getLevelForXP(userXp);
      cohort.push({
        id: userId,
        name: loggedInName,
        xp: userXp,
        badgesCount: userBadges,
        coursesCompleted: userXp >= 2000 ? 1 : 0,
        streak: userStreak,
        level,
        levelTitle: getLevelTitle(level),
        isCurrentUser: true
      });
    }

    // Filter scaling logic
    if (filter === 'weekly') {
      cohort.forEach((c) => {
        c.xp = Math.round(c.xp * 0.25);
      });
    } else if (filter === 'monthly') {
      cohort.forEach((c) => {
        c.xp = Math.round(c.xp * 0.70);
      });
    }

    // Sort by XP
    cohort.sort((a, b) => b.xp - a.xp);

    // Assign Rank index
    return cohort.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }

  getLeaderboard(filter: 'global' | 'course' | 'weekly' | 'monthly', userId = 'default_student'): LeaderboardEntry[] {
    const students = studentService.getLocalStudents();
    return this.calculateCohortFromStudents(students, filter, userId);
  }

  async getLeaderboardAsync(filter: 'global' | 'course' | 'weekly' | 'monthly', userId = 'default_student'): Promise<LeaderboardEntry[]> {
    const students = await studentService.fetchFirestoreStudentsDirectly();
    return this.calculateCohortFromStudents(students, filter, userId);
  }

  /**
   * Real-time subscription to Cohort Leaderboard updates from Firestore & local storage telemetry.
   */
  subscribeToLeaderboard(
    filter: 'global' | 'course' | 'weekly' | 'monthly',
    userId = 'default_student',
    callback: (entries: LeaderboardEntry[]) => void
  ): () => void {
    // 1. Initial calculate from current local dataset
    const initialList = this.getLeaderboard(filter, userId);
    callback(initialList);

    // 2. Event handlers for local/state updates
    const handleLocalEvent = () => {
      const updated = this.getLeaderboard(filter, userId);
      callback(updated);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('shaivika_xp_updated', handleLocalEvent);
      window.addEventListener('shaivika_student_updated', handleLocalEvent);
      window.addEventListener('storage', handleLocalEvent);
    }

    // 3. Connect to live studentService Firestore snapshot listener
    const unsubStudents = studentService.subscribeToStudents((students) => {
      const computed = this.calculateCohortFromStudents(students, filter, userId);
      callback(computed);
    });

    // 4. Periodic background sync heartbeat (every 20s)
    const interval = setInterval(() => {
      this.getLeaderboardAsync(filter, userId).then((fresh) => {
        if (fresh && fresh.length > 0) callback(fresh);
      });
    }, 20000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('shaivika_xp_updated', handleLocalEvent);
        window.removeEventListener('shaivika_student_updated', handleLocalEvent);
        window.removeEventListener('storage', handleLocalEvent);
      }
      unsubStudents();
      clearInterval(interval);
    };
  }
}

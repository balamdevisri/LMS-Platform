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
  isCurrentUser?: boolean;
}

// Static Badges Catalogue
export const STATIC_BADGES: Omit<Badge, 'earnedDate'>[] = [
  {
    id: 'course-completed',
    name: 'Course Completed',
    description: 'Mastered a complete syllabus track.',
    iconName: 'Award',
    rarity: 'Common'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Successfully cleared 5 or more quizzes.',
    iconName: 'CheckCircle2',
    rarity: 'Rare'
  },
  {
    id: 'assignment-champion',
    name: 'Assignment Champion',
    description: 'Submitted 3 or more homework assignments.',
    iconName: 'FileText',
    rarity: 'Rare'
  },
  {
    id: 'ai-learner',
    name: 'AI Learner',
    description: 'Engaged with the AI Learning Assistant 5 or more times.',
    iconName: 'Bot',
    rarity: 'Epic'
  },
  {
    id: 'coding-expert',
    name: 'Coding Expert',
    description: 'Solved 3 or more Practice Lab sandbox tasks.',
    iconName: 'Code',
    rarity: 'Epic'
  },
  {
    id: 'practice-lab-explorer',
    name: 'Practice Lab Explorer',
    description: 'Spent over 10 minutes debugging in the Practice Lab.',
    iconName: 'Terminal',
    rarity: 'Common'
  },
  {
    id: 'fast-learner',
    name: 'Fast Learner',
    description: 'Completed a lesson unit under 30 seconds.',
    iconName: 'Zap',
    rarity: 'Common'
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Aced an assessment with a perfect score.',
    iconName: 'Star',
    rarity: 'Rare'
  },
  {
    id: 'top-performer',
    name: 'Top Performer',
    description: 'Accumulated over 2,000 learning experience points (XP).',
    iconName: 'Sparkles',
    rarity: 'Legendary'
  },
  {
    id: 'discussion-contributor',
    name: 'Discussion Contributor',
    description: 'Published 2 or more topics in the Discussion Center.',
    iconName: 'MessageSquare',
    rarity: 'Common'
  },
  {
    id: 'helpful-mentor',
    name: 'Helpful Mentor',
    description: 'Offered 3 or more feedback replies to peer discussions.',
    iconName: 'Heart',
    rarity: 'Rare'
  },
  {
    id: 'streak-7',
    name: '7-Day Learning Streak',
    description: 'Maintained a continuous daily learning streak of 7 days.',
    iconName: 'Calendar',
    rarity: 'Legendary'
  },
  {
    id: 'streak-30',
    name: '30-Day Learning Streak',
    description: 'Maintained a continuous daily learning streak of 30 days.',
    iconName: 'CalendarRange',
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
    // Check if points exist in the existing course points key
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
    
    // Save to both namespaces to keep systems synched
    localStorage.setItem(`${this.xpKeyPrefix}${userId}`, String(updatedXp));
    localStorage.setItem(`${this.pointsKey}`, String(updatedXp));

    const oldLevel = getLevelForXP(currentXp);
    const newLevel = getLevelForXP(updatedXp);

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

  getEarnedBadges(userId = 'default_student'): Badge[] {
    const data = localStorage.getItem(`${this.badgesKeyPrefix}${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return [];
  }

  checkAndAwardBadges(userId = 'default_student'): Badge[] {
    const earned = this.getEarnedBadges(userId);
    const earnedIds = new Set(earned.map(b => b.id));
    const statsService = new AchievementService();
    const stats = statsService.getStats(userId);
    const xpService = new XPService();
    const totalXp = xpService.getXPPoints(userId);
    const streaks = statsService.getStreaks(userId);

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
        setTimeout(() => {
          xpService.addXP(XP_CONFIG.BADGE_EARNED, `Unlocked Badge: ${meta.name}`, userId);
          toast.success(`🎖️ New Badge Earned: "${meta.name}"! +100 XP`);
          this.logActivity(meta.name, userId);
        }, 300);
      }
    };

    // Evaluate Rules
    if (stats.coursesCompleted >= 1) tryAward('course-completed');
    if (stats.quizAttempts >= 5) tryAward('quiz-master');
    if (stats.assignmentsSubmitted >= 3) tryAward('assignment-champion');
    if (stats.aiAssistantSessions >= 5) tryAward('ai-learner');
    if (stats.codingChallengesSolved >= 3) tryAward('coding-expert');
    if (stats.practiceTimeSeconds >= 600) tryAward('practice-lab-explorer');
    if (totalXp >= 2000) tryAward('top-performer');
    if (stats.discussionsStarted >= 2) tryAward('discussion-contributor');
    if (stats.repliesPosted >= 3) tryAward('helpful-mentor');
    if (streaks.dailyStreak >= 7) tryAward('streak-7');
    if (streaks.dailyStreak >= 30) tryAward('streak-30');

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

          const newCert: Certificate = {
            id: `cert_${courseIdStr}_${Date.now()}`,
            courseId: courseIdStr,
            courseTitle: p.course.title,
            studentName,
            instructorName: p.course.instructor || 'Lead Instructor',
            completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            verificationId
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
    if (statName === 'lessonsCompleted') xpService.addXP(XP_CONFIG.LESSON_COMPLETED, 'Lesson Completed', userId);
    else if (statName === 'quizAttempts') xpService.addXP(XP_CONFIG.QUIZ_PASSED, 'Quiz Submitted', userId);
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
        isCurrentUser: isCurrent
      });
    });

    // Ensure active logged-in user is included if not in student roster
    if (!currentUserIncluded) {
      cohort.push({
        id: userId,
        name: loggedInName,
        xp: userXp,
        badgesCount: userBadges,
        coursesCompleted: userXp >= 2000 ? 1 : 0,
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
}

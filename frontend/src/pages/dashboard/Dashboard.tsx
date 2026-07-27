import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  X,
  Zap,
  Download,
  Eye,
  Sparkles,
  PlusCircle,
  Compass,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { courseService, type XPClaimRecord } from '@/services/courseService';
import type { ICourse } from '../../../../shared/types/course';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Dynamic Courses State
  const [enrolledCourses, setEnrolledCourses] = useState<ICourse[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // XP & Claims State
  const [totalXP, setTotalXP] = useState(0);
  const [xpClaims, setXpClaims] = useState<XPClaimRecord[]>([]);

  // Completed courses check (only 100% completed courses unlock certificates)
  const completedCourses = enrolledCourses.filter((course) => {
    const checkpoint = courseService.getCourseCheckpoint(course.id, 'default_student');
    return checkpoint && checkpoint.progressPercent >= 100;
  });
  const completedCoursesCount = completedCourses.length;

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  // Certificate Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  // Fetch courses and XP claims dynamically from courseService
  const activeUserId = user?.uid || 'default_student';

  const loadDashboardData = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const enrolled = await courseService.getEnrolledCourses(activeUserId);
      const catalogResult = await courseService.getCourses({ status: 'published', limit: 8 });
      setEnrolledCourses(enrolled);
      setCatalogCourses(catalogResult.courses);

      // Load XP Points & Claims
      const xp = courseService.getUserXPPoints(activeUserId);
      const claims = courseService.getXPClaimLogs(activeUserId);
      setTotalXP(xp);
      setXpClaims(claims);
    } catch (err) {
      console.warn('Error loading dynamic dashboard courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleEnrollFree = async (course: ICourse) => {
    try {
      const res = await courseService.enrollCourse(course.id, activeUserId);
      if (res.success) {
        toast.success(`Enrolled free in "${course.title}"!`);
        await loadDashboardData();
      }
    } catch (e) {
      toast.error('Failed to enroll.');
    }
  };

  // Sample Quiz Questions
  const quizQuestions = [
    {
      question: 'Which Hook is best suited for synchronous DOM measurements before browser paint?',
      options: ['useEffect', 'useLayoutEffect', 'useCallback', 'useRef'],
      correct: 1,
    },
    {
      question: 'What is the primary benefit of React Server Components (RSC)?',
      options: ['Client bundle size reduction', 'Faster CSS execution', 'Replaces Redux', 'Eliminates HTML'],
      correct: 0,
    },
  ];

  const handleAnswerSelect = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score += 50;
    });
    setQuizScore(score);
    toast.success(`AI Evaluation Complete! You scored ${score}/100`);
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora']">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <Link to="/dashboard" className="hover:text-sky-600">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize font-semibold text-sky-600">{currentTab}</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">
            Welcome back, {userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            You are enrolled in {enrolledCourses.length} active course track{enrolledCourses.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/courses" className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20">
            <Compass className="w-4 h-4" />
            <span>Explore All Courses (Free)</span>
          </Link>
        </div>
      </div>

      {/* ------------------- 1. OVERVIEW TAB ------------------- */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card-light p-5 border-l-4 border-l-sky-600 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Tracks</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">{enrolledCourses.length}</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>

            {/* Total Claimed XP Points Card */}
            <div className="glass-card-light p-5 border-l-4 border-l-amber-500 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claimed XP</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">{totalXP} XP</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Level {Math.floor(totalXP / 100) + 1} Specialist
                </span>
              </div>
            </div>

            <div className="glass-card-light p-5 border-l-4 border-l-purple-600 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">
                  {completedCoursesCount} Earned
                </span>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {completedCoursesCount > 0 ? 'Verified' : 'Locked (0/1 Complete)'}
                </span>
              </div>
            </div>

            <div className="glass-card-light p-5 border-l-4 border-l-emerald-500 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Evaluation Score</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">94%</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Top 5%
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC: Currently Enrolled Tracks (Only displayed when student is enrolled in courses) */}
          {loadingCourses ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
                <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
              </div>
            </div>
          ) : (
            enrolledCourses.length > 0 && (
              <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> Continue Learning (Resume Exact Position)
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {enrolledCourses.length} Active Track{enrolledCourses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => {
                  const checkpoint = courseService.getCourseCheckpoint(course.id, activeUserId);
                  
                  // Calculate dynamic percentage from completed lesson IDs cache if present
                  let dynamicProgress = 0;
                  try {
                    const savedCompletedStr = localStorage.getItem(`shaivika_completed_${course.id}`);
                    if (savedCompletedStr) {
                      const completedIds: any[] = JSON.parse(savedCompletedStr);
                      const isGit = String(course.id).includes('git') || String(course.slug).includes('git');
                      const totalLessons = isGit ? 31 : 20;
                      if (completedIds && completedIds.length > 0) {
                        dynamicProgress = Math.min(100, Math.round((completedIds.length / totalLessons) * 100));
                      }
                    }
                  } catch (e) {}

                  if (dynamicProgress === 0) {
                    dynamicProgress = checkpoint?.progressPercent || course.progress || 0;
                  }

                  const lastModule = checkpoint ? checkpoint.lastModuleIdx + 1 : 1;
                  const lastSubtopicTitle = checkpoint?.lastSubtopicTitle || 'Kernel Architecture & Environment Setup';

                  return (
                    <div
                      key={course.id}
                      className="glass-card-light p-6 flex flex-col justify-between space-y-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            {course.category}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Saved Checkpoint Active
                          </span>
                        </div>

                        <h4 className="font-heading font-bold text-base text-slate-900 leading-snug">
                          {course.title}
                        </h4>
                        
                        {/* Saved Resume Position Indicator */}
                        <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-2.5 text-xs text-slate-700 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900">Last Position: </span>
                            <span className="text-sky-700 font-medium">Module {lastModule} ➔ {lastSubtopicTitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Overall Track Completion</span>
                          <span className="text-blue-600">{dynamicProgress}% Completed</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${dynamicProgress}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        to={`/course/${course.slug || course.id}?mode=learn`}
                        className="btn-blue-primary text-xs py-2.5 justify-center font-bold flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Resume Course Track (Module {lastModule})</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* DETAILED CLAIMED XP BREAKDOWN & HISTORY */}
          <div className="bg-white/95 border border-amber-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-current" />
                  <span>Claimed XP Rewards & Detailed Audit Log</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Full historical log of all earned subtopic completions, quiz rewards, and lab achievements.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold self-start sm:self-auto">
                Total Earned: {totalXP} XP
              </div>
            </div>

            <div className="space-y-2.5">
              {xpClaims.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-medium">
                  No XP claims logged yet. Complete course lessons to claim XP!
                </div>
              ) : (
                xpClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold shrink-0 border border-amber-200">
                        +{claim.xp}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{claim.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold text-slate-500">{claim.courseTitle || 'Platform Learning'}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                            {claim.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-medium text-slate-400 self-end sm:self-center shrink-0">
                      {new Date(claim.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DYNAMIC: All Admin-Created Available Courses (Free to Enroll) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Explore Available Courses (100% Free)
                </h3>
                <p className="text-xs text-slate-500 font-medium">All courses created by Admin are open for immediate enrollment</p>
              </div>
              <Link to="/courses" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All ({catalogCourses.length}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogCourses.map((course) => {
                const isEnrolled = enrolledCourses.some((e) => e.id === course.id);

                return (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold uppercase backdrop-blur-xs">
                          {course.category}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase shadow-md">
                          Free
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                        {course.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        {course.shortDescription}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600">$0.00 Free</span>
                      {isEnrolled ? (
                        <Link
                          to={`/course/${course.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnrollFree(course)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Enroll Free
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 2. ASSIGNMENTS TAB ------------------- */}
      {(currentTab === 'assignments' || quizModalOpen) && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-card-light p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Assignments & Assessment Board</h3>
                <p className="text-xs text-slate-500 font-medium">Manage pending homework submissions and quiz evaluations</p>
              </div>
              <button
                onClick={() => setQuizModalOpen(true)}
                className="btn-blue-primary text-xs py-2 px-3.5 cursor-pointer font-bold"
              >
                <Zap className="w-4 h-4" /> Start AI Quiz
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Linux Kernel Security Audit Lab</h4>
                  <p className="text-xs text-slate-500">Module 4 • Linux & Systems Track</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                  Pending Review
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 3. CERTIFICATES TAB ------------------- */}
      {(currentTab === 'certificates' || certificateModalOpen) && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-sky-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" /> Verified Course Certificates
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Official SHAIVIKA AI LMS verified digital certificates awarded upon 100% completion of technical tracks.
                </p>
              </div>
            </div>

            {completedCoursesCount === 0 ? (
              <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-sky-100 space-y-4 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200 shadow-xs">
                  <Lock className="w-7 h-7 text-purple-500" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-base text-slate-900">No Certificates Unlocked Yet</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Certificates are awarded as a final reward upon 100% completing all subtopics, labs, and evaluations of a course track.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-sky-100 space-y-1.5 text-left text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Track Completion Requirement</span>
                    <span className="text-purple-600">0% / 100% Completed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-purple-500 rounded-full w-0" />
                  </div>
                </div>

                <Link to="/dashboard?tab=overview" className="btn-blue-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" /> Continue Learning to Unlock Reward
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedCourses.map((course) => (
                  <div key={course.id} className="p-6 bg-linear-to-br from-purple-50 via-white to-sky-50 rounded-2xl border border-purple-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                        100% Verified Completion
                      </span>
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-heading font-bold text-base text-slate-900">{course.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">ISO Digital Certificate ready for download.</p>
                    <button
                      onClick={() => setCertificateModalOpen(true)}
                      className="btn-blue-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-2 w-full cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> View Verified Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading font-bold text-lg text-slate-900">AI Evaluation Quiz</h3>
              <button onClick={() => setQuizModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2">
                  <p className="text-xs font-bold text-slate-800">{qIdx + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(qIdx, oIdx)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          selectedAnswers[qIdx] === oIdx
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {quizScore !== null && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
                Score: {quizScore} / 100 — Certificate Eligible!
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuizModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
              >
                Close
              </button>
              <button onClick={submitQuiz} className="btn-blue-primary text-xs py-2 px-4 font-bold">
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 border border-slate-200 shadow-2xl text-center">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Official Certificate</span>
              <button onClick={() => setCertificateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-linear-to-b from-blue-50 via-indigo-50 to-white border-4 border-double border-indigo-200 space-y-4">
              <Award className="w-12 h-12 text-blue-600 mx-auto" />
              <h2 className="font-heading font-extrabold text-xl text-slate-900 uppercase tracking-wide">
                Certificate of Enterprise Completion
              </h2>
              <p className="text-xs text-slate-500 font-medium">This is to certify that</p>
              <h3 className="font-heading font-bold text-lg text-blue-600 underline">
                {userProfile?.name || 'Bhanu Prakash Achari'}
              </h3>
              <p className="text-xs text-slate-600 font-normal max-w-md mx-auto">
                has successfully completed the enterprise technical track in <strong>Linux Essentials & AI Platform Architecture</strong>.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => toast.success('Certificate PDF download started!')}
                className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

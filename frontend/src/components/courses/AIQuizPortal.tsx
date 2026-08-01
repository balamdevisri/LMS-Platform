import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Play,
  Pause,
  Check,
  Brain,
  History,
  Code,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { quizService } from '@/services/quizEngine';
import type {
  AIQuizQuestion,
  AIQuizConfig,
  AIQuizAttempt
} from '@/services/quizEngine';
import { courseService } from '@/services/courseService';
import type { ICourse } from '@/services/courseService';
import { useCourses } from '@/contexts/CourseContext';

interface AIQuizPortalProps {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonContent?: string;
  onClose?: () => void;
}

export const AIQuizPortal: React.FC<AIQuizPortalProps> = ({
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
  lessonContent = 'Concentric Linux operating system layers: kernel space and user space.',
  onClose
}) => {
  const { courses: contextCourses } = useCourses();

  // --- WORKSPACE MODES ---
  // 'config' | 'active' | 'summary' | 'history'
  const [workspaceMode, setWorkspaceMode] = useState<'config' | 'active' | 'summary' | 'history'>('config');

  // --- DYNAMIC COURSES STATE ---
  const [availableCourses, setAvailableCourses] = useState<ICourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>(courseTitle || '');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res: any = await courseService.getCourses();
        const serviceList: ICourse[] = Array.isArray(res) ? res : (res?.courses || []);

        const map = new Map<string, ICourse>();

        // 1. Add Context Courses first (Deduplicated by title/slug)
        if (contextCourses && contextCourses.length > 0) {
          contextCourses.forEach((c: any) => {
            const normalized = courseService.normalizeCourseToICourse(c);
            const key = (normalized.slug || normalized.title || '').toLowerCase().trim();
            map.set(key, normalized);
          });
        }

        // 2. Add Service Courses (Deduplicated by title/slug)
        serviceList.forEach((c: any) => {
          const normalized = courseService.normalizeCourseToICourse(c);
          const key = (normalized.slug || normalized.title || '').toLowerCase().trim();
          if (!map.has(key)) {
            map.set(key, normalized);
          }
        });

        const list = Array.from(map.values());
        setAvailableCourses(list);

        if (list.length > 0) {
          const match = list.find((c: ICourse) => String(c.id) === String(courseId));
          if (match) {
            setSelectedCourseId(String(match.id));
            setSelectedCourseTitle(match.title);
          } else if (!selectedCourseId || !list.some(c => String(c.id) === String(selectedCourseId))) {
            setSelectedCourseId(String(list[0].id));
            setSelectedCourseTitle(list[0].title);
          }
        }
      } catch (err) {
        console.warn('Error loading dynamic courses for AI Quiz:', err);
      }
    };
    loadCourses();
  }, [courseId, contextCourses]);

  // --- CONFIG STATE ---
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Adaptive'>('Adaptive');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mcq', 'tf', 'ms', 'blank', 'code']);
  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);

  // --- ACTIVE QUIZ STATE ---
  const [questions, setQuestions] = useState<AIQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // in seconds
  const [quizTimerActive, setQuizTimerActive] = useState<boolean>(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);

  // Adaptive tracking
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Sandbox inputs (for coding type questions)
  const [codeInputValue, setCodeInputValue] = useState<string>('');
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [runningCode, setRunningCode] = useState<boolean>(false);

  // --- RESULTS SUMMARY STATE ---
  const [activeAttempt, setActiveAttempt] = useState<AIQuizAttempt | null>(null);
  const [, setSavingAttempt] = useState<boolean>(false);

  // --- HISTORY STATE ---
  const [attemptsHistory, setAttemptsHistory] = useState<AIQuizAttempt[]>([]);

  // Update history list when entering workspace
  useEffect(() => {
    setAttemptsHistory(quizService.getHistory());
  }, [workspaceMode]);

  // Handle active countdown timer ticking
  useEffect(() => {
    if (!quizTimerActive || isTimerPaused) return;

    if (timeLeft <= 0) {
      setQuizTimerActive(false);
      toast.warning('Quiz timer expired! Auto-submitting assessment...');
      handleForceSubmitQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizTimerActive, isTimerPaused]);

  // Format timer countdown format
  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Checkbox toggle helpers
  const handleToggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      } else {
        toast.info('At least one question type must be selected.');
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // --- DYNAMIC ADAPTIVE MODE POOL GENERATOR ---
  const getPoolQuestionOfDifficulty = (diff: 'Easy' | 'Medium' | 'Hard', excludeIds: string[]): AIQuizQuestion | null => {
    // Custom questions matching concentric layers (lesson 1.1.3)
    const candidates = [
      {
        id: 'lin_e1_dyn',
        type: 'mcq',
        difficulty: 'Easy',
        question: 'Which OS layer intercepts assembly system call handlers from user programs?',
        options: ['Applications space', 'BIOS ROM', 'Operating System Kernel', 'Static Libraries'],
        answer: 'Operating System Kernel',
        explanation: 'The kernel is the absolute low-level operating system core intercepting software interrupt instructions from user space apps.',
        topic: 'Kernel Privilege Rings',
        estTime: '30s'
      },
      {
        id: 'lin_m1_dyn',
        type: 'tf',
        difficulty: 'Medium',
        question: 'True or False: The system call vector mechanism performs a hardware trap vector jump to change execution privilege rings.',
        answer: 'True',
        explanation: 'Syscalls execute software interrupts causing hardware trapping actions. The processor transitions from Ring 3 to Ring 0 execution vectors.',
        topic: 'System Calls (Syscalls)',
        estTime: '45s'
      },
      {
        id: 'lin_h1_dyn',
        type: 'mcq',
        difficulty: 'Hard',
        question: 'Which of the following describes the context transition execution timing penalty associated with syscalls?',
        options: ['Saving and restoring CPU registers', 'Flashing the entire ROM database', 'Replacing the static file allocations table', 'Pre-empting all running daemons'],
        answer: 'Saving and restoring CPU registers',
        explanation: 'Context switches require writing all user space registers, switching stacks, processing kernel routines, and restoring user registers, which impacts CPU performance.',
        topic: 'CPU Privilege Operations',
        estTime: '60s'
      }
    ] as AIQuizQuestion[];

    const matched = candidates.filter((c) => c.difficulty === diff && !excludeIds.includes(c.id));
    if (matched.length > 0) {
      return matched[Math.floor(Math.random() * matched.length)];
    }
    return null;
  };

  // --- ACTIONS ---

  // Generate quiz
  const handleLaunchQuiz = async () => {
    setLoadingQuestions(true);
    setQuestions([]);
    setUserAnswers({});
    setCheckedQuestions({});
    setCurrentIdx(0);
    setSandboxLogs([]);
    setCodeInputValue('');

    const config: AIQuizConfig = {
      numQuestions,
      difficulty,
      questionTypes: selectedTypes,
      hasTimer: enableTimer,
      timeLimitSec: enableTimer ? timeLimitMinutes * 60 : undefined
    };

    try {
      const quizQuestions = await quizService.generateQuiz(
        selectedCourseId || courseId,
        selectedCourseTitle || courseTitle,
        lessonId,
        lessonTitle,
        lessonContent,
        config
      );

      setQuestions(quizQuestions);
      setTimeLeft(timeLimitMinutes * 60);
      setQuizTimerActive(enableTimer);
      setIsTimerPaused(false);
      setQuizStartTime(Date.now());
      setAdaptiveDifficulty('Medium'); // reset starting difficulty
      setWorkspaceMode('active');
      toast.success('AI Quiz generated successfully!');
    } catch (e) {
      toast.error('Failed to generate quiz. Please check configurations.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Single Question instant feedback checking
  const handleCheckQuestionAnswer = (qId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return;

    setCheckedQuestions((prev) => ({ ...prev, [qId]: true }));

    const studentAns = userAnswers[qId];
    if (studentAns === undefined || studentAns === '' || (Array.isArray(studentAns) && studentAns.length === 0)) {
      toast.info('Question skipped. Moving to next.');
      return;
    }

    // Determine correctness
    const isCorrect = compareAnswers(studentAns, q.answer);

    if (isCorrect) {
      toast.success('Correct answer! +10 XP');
    } else {
      toast.error('Incorrect answer. Review explanation.');
    }

    // Trigger adaptive selection for next question
    if (difficulty === 'Adaptive') {
      let nextDiff: 'Easy' | 'Medium' | 'Hard' = adaptiveDifficulty;
      if (isCorrect) {
        if (adaptiveDifficulty === 'Easy') nextDiff = 'Medium';
        else if (adaptiveDifficulty === 'Medium') nextDiff = 'Hard';
      } else {
        if (adaptiveDifficulty === 'Hard') nextDiff = 'Medium';
        else if (adaptiveDifficulty === 'Medium') nextDiff = 'Easy';
      }

      setAdaptiveDifficulty(nextDiff);

      // Perform dynamic question replacement for next index
      if (currentIdx + 1 < questions.length) {
        const nextQ = questions[currentIdx + 1];
        const match = getPoolQuestionOfDifficulty(nextDiff, questions.map((x) => x.id));
        if (match) {
          const updated = [...questions];
          updated[currentIdx + 1] = {
            ...match,
            id: nextQ.id // keep original ID reference for tracking
          };
          setQuestions(updated);
        }
      }
    }
  };

  // Validation equality checker
  const compareAnswers = (student: string | string[], correct: string | string[]): boolean => {
    if (Array.isArray(student) && Array.isArray(correct)) {
      if (student.length !== correct.length) return false;
      const sSorted = [...student].sort();
      const cSorted = [...correct].sort();
      return sSorted.every((v, i) => v.toLowerCase().trim() === cSorted[i].toLowerCase().trim());
    }
    if (!Array.isArray(student) && !Array.isArray(correct)) {
      return student.toLowerCase().trim() === correct.toLowerCase().trim();
    }
    return false;
  };

  // Submit Active Quiz
  const handleForceSubmitQuiz = async () => {
    setQuizTimerActive(false);
    setSavingAttempt(true);

    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
    const config: AIQuizConfig = {
      numQuestions,
      difficulty,
      questionTypes: selectedTypes,
      hasTimer: enableTimer,
      timeLimitSec: enableTimer ? timeLimitMinutes * 60 : undefined
    };

    try {
      const attempt = await quizService.evaluateAttempt(
        courseId,
        courseTitle,
        lessonId,
        lessonTitle,
        config,
        questions,
        userAnswers,
        timeTaken
      );

      setActiveAttempt(attempt);
      setWorkspaceMode('summary');
      toast.success('Quiz submission complete! Review score card.');
    } catch (e) {
      toast.error('Evaluation failed. Storing parameters locally.');
    } finally {
      setSavingAttempt(false);
    }
  };

  // MCQ response selection
  const handleSelectOption = (qId: string, option: string, isMulti: boolean) => {
    if (checkedQuestions[qId]) return; // already locked

    const current = userAnswers[qId] || (isMulti ? [] : '');

    if (isMulti) {
      const list = Array.isArray(current) ? [...current] : [];
      if (list.includes(option)) {
        setUserAnswers((prev) => ({ ...prev, [qId]: list.filter((o) => o !== option) }));
      } else {
        setUserAnswers((prev) => ({ ...prev, [qId]: [...list, option] }));
      }
    } else {
      setUserAnswers((prev) => ({ ...prev, [qId]: option }));
    }
  };

  // Standard code run simulator
  const handleSimulateRunCode = () => {
    if (!codeInputValue.trim()) {
      toast.info('Write code instructions before executing tests.');
      return;
    }
    setRunningCode(true);
    setSandboxLogs(['[SYSTEM] Initializing GCC sandbox environment...', '[SYSTEM] Parsing symbols & function arguments...']);

    setTimeout(() => {
      setSandboxLogs((prev) => [
        ...prev,
        '[TEST 1] Testing compilation vector checks... Passed ✓',
        '[TEST 2] Verifying strace system outputs trace... Passed ✓',
        '[SUCCESS] All tests executed successfully. Output match: strace -c ls'
      ]);
      setRunningCode(false);
      // Auto register user answer
      setUserAnswers((prev) => ({ ...prev, [questions[currentIdx].id]: codeInputValue.trim() }));
      toast.success('All system test cases compiled successfully!');
    }, 1200);
  };

  // Re-review history item summary
  const handleLaunchHistoryReview = (attempt: AIQuizAttempt) => {
    setActiveAttempt(attempt);
    // Sync configuration options for summary view display
    setNumQuestions(attempt.config.numQuestions);
    setDifficulty(attempt.config.difficulty);
    setSelectedTypes(attempt.config.questionTypes);
    setEnableTimer(attempt.config.hasTimer);
    setQuestions(attempt.questions);
    setUserAnswers(attempt.userAnswers);
    // Set all checked
    const checked: Record<string, boolean> = {};
    attempt.questions.forEach((q) => {
      checked[q.id] = true;
    });
    setCheckedQuestions(checked);

    setWorkspaceMode('summary');
  };

  // Exporters
  const handleExportMarkdown = () => {
    if (!activeAttempt) return;

    const header = `# AI Assessment Report - ${activeAttempt.lessonTitle}\nCourse: ${activeAttempt.courseTitle}\nScore: ${activeAttempt.score}% (${activeAttempt.correctAnswersCount}/${activeAttempt.questions.length} Correct)\nTime Taken: ${activeAttempt.timeTakenSeconds}s\nDate: ${new Date(activeAttempt.timestamp).toLocaleDateString()}\n\n---\n\n## Recommendations\n- **Weak Topics**: ${activeAttempt.recommendations.weakTopics.join(', ')}\n- **Suggested Lessons**: ${activeAttempt.recommendations.reviewLessons.map(l => l.title).join(', ')}\n\n---\n\n## Question Details\n`;
    
    const body = activeAttempt.questions
      .map((q, idx) => {
        const studAns = activeAttempt.userAnswers[q.id] || 'Skipped';
        return `### Q${idx + 1}. [${q.difficulty}] ${q.question}\n- **Correct Answer**: ${q.answer}\n- **Your Answer**: ${studAns}\n- **Explanation**: ${q.explanation}\n`;
      })
      .join('\n');

    const blob = new Blob([header + body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_report_${activeAttempt.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Quiz report exported as Markdown (.md)');
  };

  const handleExportTxt = () => {
    if (!activeAttempt) return;

    const header = `AI Quiz Summary - ${activeAttempt.lessonTitle}\nScore: ${activeAttempt.score}% (${activeAttempt.correctAnswersCount}/${activeAttempt.questions.length} Correct)\nDate: ${new Date(activeAttempt.timestamp).toLocaleString()}\n\n========================================\n\n`;
    const body = activeAttempt.questions
      .map((q, idx) => {
        const studAns = activeAttempt.userAnswers[q.id] || 'Skipped';
        return `Q${idx + 1}. [${q.difficulty}] ${q.question}\nCorrect: ${q.answer}\nYour Answer: ${studAns}\nExplanation: ${q.explanation}\n\n`;
      })
      .join('\n');

    const blob = new Blob([header + body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_report_${activeAttempt.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Quiz report exported as Plain Text (.txt)');
  };

  return (
    <div className="w-full text-slate-800 font-sans max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white flex flex-col h-[82vh]">
      
      {/* -------------------- DYNAMIC HEADER -------------------- */}
      <header className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm flex items-center gap-2">
              AI Quiz Generator
              {workspaceMode === 'active' && difficulty === 'Adaptive' && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-extrabold border border-emerald-500/30">
                  ADAPTIVE: {adaptiveDifficulty.toUpperCase()}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs sm:max-w-md">{lessonTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {workspaceMode === 'config' && attemptsHistory.length > 0 && (
            <button
              onClick={() => setWorkspaceMode('history')}
              className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>Assessment History</span>
            </button>
          )}

          {workspaceMode !== 'config' && (
            <button
              onClick={() => {
                setQuizTimerActive(false);
                setWorkspaceMode('config');
              }}
              className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
            >
              Setup Generator
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors cursor-pointer text-slate-300 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      {/* -------------------- WORKSPACE PANELS -------------------- */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950/80 p-6 flex flex-col min-h-0 transition-colors duration-300">
        
        {/* ===================== MODE 1: CONFIGURATION ===================== */}
        {workspaceMode === 'config' && (
          <div className="space-y-6 max-w-3xl mx-auto w-full flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-1.5 py-4 text-center shadow-3xs">
                <Sparkles className="w-7 h-7 text-purple-600 dark:text-purple-400 mx-auto animate-pulse" />
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                  AI Quiz Generator Wizard
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed font-medium">
                  Select your target course and customized level of difficulty to generate dynamic practice questions.
                </p>
              </div>

              {/* ----------------- STEP 1: SELECT COURSE (OUR ADDED COURSES ONLY) ----------------- */}
              <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-3xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    <label className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-wider block">
                      Select Target Course
                    </label>
                  </div>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    {availableCourses.length} Active Courses
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {availableCourses.map((c) => {
                    const isSelected = String(c.id) === String(selectedCourseId);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCourseId(String(c.id));
                          setSelectedCourseTitle(c.title);
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/40 ring-2 ring-purple-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}>
                          <BookOpen className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 truncate">
                            {c.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                            {c.category || 'Core Track'} • {c.level || 'All Levels'}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ----------------- STEP 2: SELECT QUIZ LEVEL & TARGET ----------------- */}
              <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-3xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
                  <label className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-wider block">
                    Select Quiz Level & Difficulty Target
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'Easy', title: 'Beginner', desc: 'Core terms & concepts' },
                    { id: 'Medium', title: 'Intermediate', desc: 'Practical scenario tasks' },
                    { id: 'Hard', title: 'Advanced', desc: 'Complex code & architecture' },
                    { id: 'Adaptive', title: 'Adaptive AI', desc: 'Real-time level adjustment' }
                  ].map((lvl) => {
                    const isSelected = difficulty === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDifficulty(lvl.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                          isSelected
                            ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">
                            {lvl.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight font-medium">
                          {lvl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ----------------- STEP 3: ADDITIONAL OPTIONS ----------------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Size Config */}
                <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-3xs">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Assessment Volume
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((val) => (
                      <button
                        key={val}
                        onClick={() => setNumQuestions(val)}
                        className={`py-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          numQuestions === val
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {val} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer Config */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-3xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Countdown Timer Limit
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Auto-submits evaluation sheet on timeout.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableTimer}
                        onChange={(e) => setEnableTimer(e.target.checked)}
                        className="sr-only peer cursor-pointer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {enableTimer && (
                    <div className="flex items-center gap-2 pt-1">
                      {[5, 10, 15, 20].map((min) => (
                        <button
                          key={min}
                          onClick={() => {
                            setTimeLimitMinutes(min);
                            setNumQuestions(min);
                          }}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold cursor-pointer ${
                            timeLimitMinutes === min
                              ? 'border-slate-800 bg-slate-100 text-slate-800 font-black'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {min} Mins
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Question Formats filter */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 md:col-span-2 shadow-3xs">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Supported Question Formats
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'mcq', label: 'Multiple Choice' },
                      { id: 'tf', label: 'True / False' },
                      { id: 'ms', label: 'Multiple Select' },
                      { id: 'blank', label: 'Fill in Blank' },
                      { id: 'code', label: 'Coding Playground' }
                    ].map((type) => {
                      const isSelected = selectedTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleToggleType(type.id)}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLaunchQuiz}
              disabled={loadingQuestions}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2 mt-6 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loadingQuestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Generating AI Quiz for {selectedCourseTitle}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                  <span>Start {difficulty} Level AI Quiz ({selectedCourseTitle})</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ===================== MODE 2: ACTIVE ASSESSMENT ===================== */}
        {workspaceMode === 'active' && questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            
            {/* Left Workspace: Questions Card & Sandbox (8 Cols) */}
            <main className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto">
              
              {/* Question container */}
              <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-3xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                    Question {currentIdx + 1} of {questions.length} • {questions[currentIdx].type.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ⏱ Est: {questions[currentIdx].estTime}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      questions[currentIdx].difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : questions[currentIdx].difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {questions[currentIdx].difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed font-heading">
                  {questions[currentIdx].question}
                </p>

                {/* --- 1. MCQ OPTIONS --- */}
                {questions[currentIdx].type === 'mcq' && questions[currentIdx].options && (
                  <div className="space-y-2">
                    {questions[currentIdx].options.map((opt) => {
                      const isSelected = userAnswers[questions[currentIdx].id] === opt;
                      const isLocked = checkedQuestions[questions[currentIdx].id];

                      let style = 'border-slate-200 bg-slate-50 hover:bg-slate-100';
                      if (isSelected) style = 'border-emerald-600 bg-emerald-50 text-emerald-800';

                      return (
                        <button
                          key={opt}
                          disabled={isLocked}
                          onClick={() => handleSelectOption(questions[currentIdx].id, opt, false)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer font-medium ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* --- 2. MULTIPLE SELECT OPTIONS --- */}
                {questions[currentIdx].type === 'ms' && questions[currentIdx].options && (
                  <div className="space-y-2">
                    {questions[currentIdx].options.map((opt) => {
                      const list = Array.isArray(userAnswers[questions[currentIdx].id])
                        ? (userAnswers[questions[currentIdx].id] as string[])
                        : [];
                      const isSelected = list.includes(opt);
                      const isLocked = checkedQuestions[questions[currentIdx].id];

                      let style = 'border-slate-200 bg-slate-50 hover:bg-slate-100';
                      if (isSelected) style = 'border-emerald-600 bg-emerald-50 text-emerald-800';

                      return (
                        <button
                          key={opt}
                          disabled={isLocked}
                          onClick={() => handleSelectOption(questions[currentIdx].id, opt, true)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer font-medium ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* --- 3. TRUE / FALSE --- */}
                {questions[currentIdx].type === 'tf' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map((opt) => {
                      const isSelected = userAnswers[questions[currentIdx].id] === opt;
                      const isLocked = checkedQuestions[questions[currentIdx].id];

                      let style = 'border-slate-200 bg-slate-50 hover:bg-slate-100';
                      if (isSelected) style = 'border-emerald-600 bg-emerald-50 text-emerald-800';

                      return (
                        <button
                          key={opt}
                          disabled={isLocked}
                          onClick={() => handleSelectOption(questions[currentIdx].id, opt, false)}
                          className={`py-3.5 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* --- 4. FILL IN BLANK / SHORT ANSWER --- */}
                {(questions[currentIdx].type === 'blank' || questions[currentIdx].type === 'short') && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      disabled={checkedQuestions[questions[currentIdx].id]}
                      value={(userAnswers[questions[currentIdx].id] as string) || ''}
                      onChange={(e) =>
                        setUserAnswers((prev) => ({ ...prev, [questions[currentIdx].id]: e.target.value }))
                      }
                      placeholder="Write your answer statement here..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:outline-hidden"
                    />
                  </div>
                )}

                {/* --- 5. CODING CHALLENGE PLAYGROUND --- */}
                {questions[currentIdx].type === 'code' && (
                  <div className="space-y-4">
                    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-950 text-slate-200">
                      {/* Code editor header */}
                      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono select-none">
                        <span>solution.sh</span>
                        <Code className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      {/* Code editor content textarea */}
                      <textarea
                        value={codeInputValue}
                        onChange={(e) => setCodeInputValue(e.target.value)}
                        placeholder="# write bash diagnostic checks here..."
                        className="w-full h-32 bg-slate-950 p-4 text-xs font-mono focus:outline-hidden resize-none leading-relaxed text-slate-100"
                      />
                      {/* Sandbox footer controls */}
                      <div className="bg-slate-900 p-2 flex justify-end">
                        <button
                          onClick={handleSimulateRunCode}
                          disabled={runningCode}
                          className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[10px] font-extrabold text-white cursor-pointer transition-colors"
                        >
                          {runningCode ? 'Executing Sandbox compiler...' : 'Run Diagnostics'}
                        </button>
                      </div>
                    </div>

                    {/* Sandbox terminal outputs */}
                    {sandboxLogs.length > 0 && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-emerald-400 space-y-1 select-text">
                        {sandboxLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Instant Feedback Panel */}
                {checkedQuestions[questions[currentIdx].id] && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                    compareAnswers(userAnswers[questions[currentIdx].id] || '', questions[currentIdx].answer)
                      ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
                      : 'bg-rose-50 border-rose-200/80 text-rose-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold font-heading">
                      {compareAnswers(userAnswers[questions[currentIdx].id] || '', questions[currentIdx].answer) ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>Correct Answer Secured</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>Incorrect Response Target</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-[11px] font-medium leading-relaxed">
                      <strong>Explanation:</strong> {questions[currentIdx].explanation}
                    </p>

                    {questions[currentIdx].learningTip && (
                      <p className="text-[10px] font-medium italic text-slate-500">
                        💡 Tip: {questions[currentIdx].learningTip}
                      </p>
                    )}

                    {questions[currentIdx].relatedLessonLink && (
                      <div className="pt-1.5 border-t border-slate-200/50 text-[10px] font-bold text-sky-700">
                        Recommended lesson: {questions[currentIdx].relatedLessonLink}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation and check buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0 select-none">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((p) => p - 1)}
                    className="py-1.5 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {!checkedQuestions[questions[currentIdx].id] ? (
                      <button
                        onClick={() => handleCheckQuestionAnswer(questions[currentIdx].id)}
                        className="py-1.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer transition-colors"
                      >
                        Check & Confirm Answer
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Answer Locked
                      </span>
                    )}

                    {currentIdx + 1 < questions.length ? (
                      <button
                        onClick={() => setCurrentIdx((p) => p + 1)}
                        className="py-1.5 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleForceSubmitQuiz}
                        className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer shadow-md transition-colors"
                      >
                        Submit Graded Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </main>

            {/* Right Panel: Navigator & Sticky Timer (4 Cols) */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
              {/* Sticky Timer Card */}
              {enableTimer && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-3 flex items-center justify-between select-none shrink-0">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Time Left</span>
                      <span className="font-heading font-extrabold text-lg tracking-wider text-slate-850">
                        {formatCountdown(timeLeft)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                    title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                  >
                    {isTimerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Navigator Grid */}
              <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-3xs flex-1 flex flex-col justify-between select-none">
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Question Navigator Map
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isCurrent = idx === currentIdx;
                      const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                      const isLocked = checkedQuestions[q.id];

                      let style = 'border-slate-200 bg-slate-50 text-slate-600';
                      if (isCurrent) {
                        style = 'border-slate-900 bg-slate-900 text-white font-extrabold shadow-sm';
                      } else if (isLocked) {
                        const correct = compareAnswers(userAnswers[q.id] || '', q.answer);
                        style = correct
                          ? 'border-emerald-200 bg-emerald-500 text-white font-bold'
                          : 'border-rose-200 bg-rose-500 text-white font-bold';
                      } else if (isAnswered) {
                        style = 'border-sky-300 bg-sky-100 text-sky-800 font-bold';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`w-10 h-10 rounded-xl border text-xs flex items-center justify-center cursor-pointer transition-all ${style}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-medium space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-100 border border-sky-300" />
                    <span>Answer Draft Saved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Confirmed Correct Response</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                    <span>Confirmed Incorrect Response</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ===================== MODE 3: RESULTS SUMMARY ===================== */}
        {workspaceMode === 'summary' && activeAttempt && (
          <div className="space-y-6 max-w-4xl mx-auto w-full flex-1">
            
            {/* Scorecard banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white grid grid-cols-1 md:grid-cols-4 gap-6 select-none relative overflow-hidden">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Performance Score</span>
                <span className="font-heading font-extrabold text-3xl text-white">{activeAttempt.score}%</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {activeAttempt.correctAnswersCount} / {activeAttempt.questions.length} Correct
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Time Elapsed</span>
                <span className="font-heading font-extrabold text-2xl text-slate-200">
                  {Math.floor(activeAttempt.timeTakenSeconds / 60)}m {activeAttempt.timeTakenSeconds % 60}s
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Skipped / Wrong</span>
                <span className="font-heading font-extrabold text-2xl text-slate-200">
                  {activeAttempt.skippedAnswersCount} / {activeAttempt.incorrectAnswersCount}
                </span>
              </div>
              <div className="flex items-center md:justify-end gap-2 pt-2 md:pt-0">
                <button
                  onClick={handleExportMarkdown}
                  className="py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-[10px] font-bold text-white cursor-pointer transition-colors"
                >
                  Export MD
                </button>
                <button
                  onClick={handleExportTxt}
                  className="py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-[10px] font-bold text-white cursor-pointer transition-colors"
                >
                  Export TXT
                </button>
              </div>
            </div>

            {/* Performance distribution list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Difficulty breakdown */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-3">
                <h4 className="font-heading font-extrabold text-xs text-slate-900 uppercase">
                  Difficulty Distribution
                </h4>
                <div className="space-y-2 pt-1 select-none">
                  {Object.entries(activeAttempt.difficultyBreakdown).map(([diff, stats]) => (
                    <div key={diff} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{diff} Level</span>
                        <span>{stats.correct} / {stats.total} correct</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic performance */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-3">
                <h4 className="font-heading font-extrabold text-xs text-slate-900 uppercase">
                  Performance by Topic area
                </h4>
                <div className="space-y-2 pt-1 select-none">
                  {Object.entries(activeAttempt.topicBreakdown).map(([topic, stats]) => (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span className="truncate max-w-xs">{topic}</span>
                        <span>{stats.correct} / {stats.total} correct</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart recommendations */}
            <div className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-3xl space-y-4">
              <h4 className="font-heading font-extrabold text-xs text-slate-900 uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>AI Recommendations & Study Path</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                {/* Weak Topics */}
                <div className="p-4 bg-white border border-emerald-100 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-slate-800">Identify Weak Topics</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAttempt.recommendations.weakTopics.map((wt) => (
                      <span key={wt} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] rounded-sm font-bold">
                        {wt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Review Lessons */}
                <div className="p-4 bg-white border border-emerald-100 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-slate-800">Syllabus Review Lessons</h5>
                  <div className="space-y-1">
                    {activeAttempt.recommendations.reviewLessons.map((l) => (
                      <div key={l.id} className="text-sky-700 hover:underline cursor-pointer font-bold truncate">
                        📖 {l.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions Practice Resources */}
                <div className="p-4 bg-white border border-emerald-100 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-slate-800">Practice Suggestions</h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 font-sans leading-relaxed text-[11px]">
                    {activeAttempt.recommendations.practiceResources.map((pr, i) => <li key={i}>{pr}</li>)}
                  </ul>
                </div>

                {/* Suggested Next Steps */}
                <div className="p-4 bg-white border border-emerald-100 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-slate-800">Next study objectives</h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 font-sans leading-relaxed text-[11px]">
                    {activeAttempt.recommendations.nextSteps.map((ns, i) => <li key={i}>{ns}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Questions detail review lists */}
            <div className="space-y-3.5 pt-2">
              <h4 className="font-heading font-extrabold text-xs text-slate-900 uppercase">
                Detailed Answer Sheet Review
              </h4>
              <div className="space-y-3.5">
                {activeAttempt.questions.map((q, idx) => {
                  const sAns = activeAttempt.userAnswers[q.id] || '';
                  const correct = compareAnswers(sAns, q.answer);

                  return (
                    <div key={q.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-3xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase">Question {idx + 1}</span>
                        {correct ? (
                          <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            CORRECT
                          </span>
                        ) : (
                          <span className="text-[8px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            INCORRECT
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-850 leading-relaxed font-heading">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] leading-relaxed">
                        <div className="p-2 bg-slate-50 border rounded-xl font-medium">
                          <strong>Your Answer:</strong> {Array.isArray(sAns) ? sAns.join(', ') : sAns || 'Skipped'}
                        </div>
                        <div className="p-2 bg-emerald-50/30 border border-emerald-100 rounded-xl font-medium">
                          <strong>Correct Answer:</strong> {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-650 leading-relaxed font-medium">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== MODE 4: HISTORY VIEW ===================== */}
        {workspaceMode === 'history' && (
          <div className="space-y-4 max-w-3xl mx-auto w-full flex-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 select-none">
              <h4 className="font-heading font-extrabold text-xs text-slate-900 uppercase">
                Assessment History list
              </h4>
              <button
                onClick={() => {
                  quizService.clearHistory();
                  setAttemptsHistory([]);
                  toast.success('Quiz attempts history cleared.');
                }}
                className="text-[10px] font-bold text-rose-600 cursor-pointer hover:underline"
              >
                Clear History
              </button>
            </div>

            {attemptsHistory.length === 0 ? (
              <div className="py-16 border border-dashed rounded-3xl text-center space-y-2 bg-white shadow-3xs">
                <Brain className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-800">No attempts logged yet</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Go back to setup configurations to build your first AI generated quiz module.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto">
                {attemptsHistory.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => handleLaunchHistoryReview(att)}
                    className="p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-heading font-extrabold text-xs text-slate-950 truncate max-w-sm sm:max-w-md">
                        {att.lessonTitle}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {new Date(att.timestamp).toLocaleString()} • {att.config.difficulty} • {att.questions.length} Qs
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 select-none">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-850 block">{att.score}% Score</span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {att.correctAnswersCount}/{att.questions.length} correct
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default AIQuizPortal;

import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import {
  HelpCircle,
  Clock,
  Play,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  StopCircle,
  PlusCircle,
  Users,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentResult {
  studentId: string;
  studentName: string;
  answer: string;
  isCorrect: boolean;
  score: number;
  timeTakenSeconds: number;
}

interface LiveQuizWidgetProps {
  socket: Socket | null;
  classId: string;
  currentUser: { uid: string; name: string; role: 'instructor' | 'mentor' | 'student' | 'admin' };
}

export const LiveQuizWidget: React.FC<LiveQuizWidgetProps> = ({ socket, classId, currentUser }) => {
  const isInstructor = currentUser.role === 'instructor' || (currentUser.role as string) === 'admin' || currentUser.role === 'mentor';

  // --- Instructor Creation States ---
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard'>('create');
  const [question, setQuestion] = useState('');
  const [qType, setQType] = useState<'mcq' | 'true_false' | 'code_output'>('mcq');
  const [opts, setOpts] = useState<string[]>(['', '', '', '']);
  const [correctAns, setCorrectAns] = useState('');
  const [timer, setTimer] = useState(30);
  const [marks, setMarks] = useState(10);
  const [explanation, setExplanation] = useState('');

  // --- Live Results & Accuracy Analytics (Instructor view) ---
  const [quizStats, setQuizStats] = useState<{
    totalAnswered: number;
    correct: number;
    wrong: number;
    accuracyPercent: number;
    avgTime: number;
    studentResults: StudentResult[];
  }>({
    totalAnswered: 0,
    correct: 0,
    wrong: 0,
    accuracyPercent: 0,
    avgTime: 0,
    studentResults: [],
  });

  // --- Active Quiz State (Shared / Student view) ---
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [selectedAns, setSelectedAns] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedData, setRevealedData] = useState<{ correctAnswer?: string; status?: string } | null>(null);

  // Time tracking for response speed
  const quizStartTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!socket) return;

    // 1. Hydrate active quiz on mount / reconnect
    socket.emit('quiz:get_active', { classId, liveClassId: classId });

    socket.on('quiz:active', (res: any) => {
      if (res?.success && res.quiz) {
        const q = res.quiz;
        setActiveQuiz(q);
        setTimeLeft(q.timerSeconds || 30);
        if (q.hasSubmitted) {
          setSubmitted(true);
          setSelectedAns(q.userAnswer || '');
        }
        if (isInstructor && q.stats) {
          setQuizStats({
            totalAnswered: q.stats.totalAnswered || 0,
            correct: q.stats.correct || 0,
            wrong: q.stats.wrong || 0,
            accuracyPercent: q.stats.accuracyPercent || 0,
            avgTime: q.stats.avgTime || 0,
            studentResults: q.stats.studentResults || [],
          });
          setActiveTab('dashboard');
        }
      }
    });

    // 2. Listen for new published quiz
    const handleQuizPublished = (quiz: any) => {
      setActiveQuiz(quiz);
      setSelectedAns('');
      setSubmitted(false);
      setIsRevealed(false);
      setRevealedData(null);
      setTimeLeft(quiz.timerSeconds || 30);
      quizStartTimeRef.current = Date.now();

      toast.info(`🔔 QUIZ PUBLISHED: "${(quiz.question || '').substring(0, 35)}..."`);

      if (isInstructor) {
        setQuizStats({
          totalAnswered: 0,
          correct: 0,
          wrong: 0,
          accuracyPercent: 0,
          avgTime: 0,
          studentResults: [],
        });
        setActiveTab('dashboard');
      }

      // Start circular timer
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    socket.on('quiz_published', handleQuizPublished);
    socket.on('quiz:start', handleQuizPublished);

    // 3. Receive accuracy update (Instructor)
    socket.on('quiz:accuracy_update', (data: any) => {
      setQuizStats({
        totalAnswered: data.totalAnswered || 0,
        correct: data.correct || 0,
        wrong: data.wrong || 0,
        accuracyPercent: data.accuracyPercent || 0,
        avgTime: data.avgTime || 0,
        studentResults: data.studentResults || [],
      });
    });

    // 4. Listen for answer reveal
    const handleQuizRevealed = (data: any) => {
      setIsRevealed(true);
      setRevealedData(data);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      toast.success('Instructor has revealed the correct quiz answers!');
    };

    socket.on('quiz:revealed', handleQuizRevealed);
    socket.on('quiz_revealed', handleQuizRevealed);

    // 5. Listen for quiz end
    const handleQuizEnded = (data: any) => {
      setIsRevealed(true);
      setRevealedData(data);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      toast.info('The live quiz session has ended.');
    };

    socket.on('quiz:result', handleQuizEnded);
    socket.on('quiz_ended', handleQuizEnded);

    return () => {
      socket.off('quiz:active');
      socket.off('quiz_published');
      socket.off('quiz:start');
      socket.off('quiz:accuracy_update');
      socket.off('quiz:revealed');
      socket.off('quiz_revealed');
      socket.off('quiz:result');
      socket.off('quiz_ended');
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [socket, classId, isInstructor]);

  const handlePublishQuiz = () => {
    if (!question.trim() || !correctAns.trim() || !socket) {
      toast.error('Please enter a question and designate the correct answer.');
      return;
    }

    const filteredOptions =
      qType === 'true_false'
        ? ['True', 'False']
        : opts.filter((o) => o.trim());

    if (filteredOptions.length < 2) {
      toast.error('Please provide at least two answer options.');
      return;
    }

    const payload = {
      classId,
      liveClassId: classId,
      question: question.trim(),
      questionType: qType,
      options: filteredOptions,
      correctAnswer: correctAns.trim(),
      marks,
      timerSeconds: timer,
      title: 'Live Concept Check',
    };

    socket.emit('quiz:start', payload);
    socket.emit('publish_quiz', payload);

    setQuizStats({
      totalAnswered: 0,
      correct: 0,
      wrong: 0,
      accuracyPercent: 0,
      avgTime: 0,
      studentResults: [],
    });
    setActiveTab('dashboard');
    toast.success('Live Quiz published to all classroom participants!');

    // Reset create inputs
    setQuestion('');
    setCorrectAns('');
    setExplanation('');
  };

  const handleStudentSubmit = () => {
    if (submitted || !selectedAns || !socket || !activeQuiz) return;
    setSubmitted(true);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const timeTaken = Math.max(1, Math.round((Date.now() - quizStartTimeRef.current) / 1000));

    const payload = {
      classId,
      liveClassId: classId,
      quizId: activeQuiz.id || activeQuiz._id?.toString(),
      userId: currentUser.uid,
      userName: currentUser.name,
      answer: selectedAns,
      timeTakenSeconds: timeTaken,
    };

    socket.emit('quiz:submit', payload);
    socket.emit('submit_quiz', payload);
    toast.success('Your answer was recorded securely on the server!');
  };

  const handleRevealAnswer = () => {
    if (!socket || !activeQuiz) return;
    socket.emit('quiz:reveal', {
      classId,
      liveClassId: classId,
      quizId: activeQuiz.id || activeQuiz._id?.toString(),
    });
  };

  const handleEndQuiz = () => {
    if (!socket || !activeQuiz) return;
    socket.emit('quiz:end', {
      classId,
      liveClassId: classId,
      quizId: activeQuiz.id || activeQuiz._id?.toString(),
    });
    socket.emit('end_quiz', {
      classId,
      liveClassId: classId,
      quizId: activeQuiz.id || activeQuiz._id?.toString(),
    });
  };

  return (
    <div className="bg-white dark:bg-[#0c1122]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs font-sans text-slate-800 dark:text-slate-100 p-5 space-y-5">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Live Concept Check & Quizzes</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time audience evaluation & accuracy tracking</p>
          </div>
        </div>

        {isInstructor && (
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-[#151c33] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-[#151c33] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Results ({quizStats.totalAnswered})
            </button>
          </div>
        )}
      </div>

      {/* ─── INSTRUCTOR PORTAL ─── */}
      {isInstructor ? (
        activeTab === 'create' ? (
          /* Create Quiz Form */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Question Text</label>
              <textarea
                rows={2}
                placeholder="e.g., Which data structure provides O(1) amortized lookup complexity?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-black/30 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Question Format</label>
                <select
                  value={qType}
                  onChange={(e: any) => setQType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#12192e] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="true_false">True / False</option>
                  <option value="code_output">Code Snippet Output</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time Limit (Seconds)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={timer}
                    onChange={(e) => setTimer(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#12192e] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>

            {qType === 'true_false' ? (
              <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Designate Correct Answer:</span>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="tf_answer"
                      value="True"
                      checked={correctAns === 'True'}
                      onChange={() => setCorrectAns('True')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="tf_answer"
                      value="False"
                      checked={correctAns === 'False'}
                      onChange={() => setCorrectAns('False')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Multiple Choice Options</label>
                {opts.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...opts];
                        copy[idx] = e.target.value;
                        setOpts(copy);
                      }}
                      className="flex-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setCorrectAns(opt)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        correctAns && correctAns === opt
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300'
                      }`}
                      title="Mark as correct answer"
                    >
                      {correctAns && correctAns === opt ? 'Correct' : 'Mark Correct'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designated Correct Answer</label>
                <input
                  type="text"
                  placeholder="e.g. Hash Map"
                  value={correctAns}
                  onChange={(e) => setCorrectAns(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">XP / Marks Value</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#12192e] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePublishQuiz}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Broadcast Quiz to Classroom</span>
            </button>
          </div>
        ) : (
          /* Instructor Accuracy Dashboard */
          <div className="space-y-4">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-4 gap-2 text-center font-sans">
              <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">Responses</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{quizStats.totalAnswered}</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block uppercase tracking-wider">Correct</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{quizStats.correct}</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block uppercase tracking-wider">Incorrect</span>
                <span className="text-base font-black text-rose-700 dark:text-rose-300">{quizStats.wrong}</span>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold block uppercase tracking-wider">Accuracy</span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-300">{quizStats.accuracyPercent}%</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleRevealAnswer}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Correct Answer</span>
              </button>
              <button
                onClick={handleEndQuiz}
                className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-500/30"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Close Quiz</span>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Question</span>
              </button>
            </div>

            {/* Student Accuracy Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Student Submissions ({quizStats.studentResults.length})</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Speed: {quizStats.avgTime}s</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl divide-y divide-slate-100 dark:divide-white/10">
                {quizStats.studentResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    Awaiting student submissions...
                  </div>
                ) : (
                  quizStats.studentResults.map((r, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{r.studentName}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">selected: &quot;{r.answer}&quot;</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-400">{r.timeTakenSeconds}s</span>
                        {r.isCorrect ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> +{r.score} XP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1 text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* ─── STUDENT VIEW ─── */
        activeQuiz ? (
          <div className="space-y-4">
            {/* Question Card */}
            <div className="p-4 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                  {activeQuiz.marks || 10} XP Marks
                </span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{timeLeft}s remaining</span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {activeQuiz.question}
              </h4>
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {Array.isArray(activeQuiz.options) &&
                activeQuiz.options.map((opt: string, idx: number) => {
                  const isSelected = selectedAns === opt;
                  const isCorrect =
                    isRevealed &&
                    (revealedData?.correctAnswer?.toLowerCase() === opt.toLowerCase() ||
                      activeQuiz?.correctAnswer?.toLowerCase() === opt.toLowerCase());

                  return (
                    <button
                      key={idx}
                      disabled={submitted || timeLeft <= 0}
                      onClick={() => setSelectedAns(opt)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer disabled:cursor-not-allowed ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-200'
                          : isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                          : 'bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#161f33] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Submit Action */}
            {!submitted ? (
              <button
                type="button"
                disabled={!selectedAns || timeLeft <= 0}
                onClick={handleStudentSubmit}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-center space-y-1">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Your answer is recorded!
                </span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {isRevealed
                    ? `Correct Answer: "${revealedData?.correctAnswer || activeQuiz.correctAnswer}"`
                    : 'Awaiting instructor answer reveal...'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium">No live quiz is active right now.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Questions launched by the instructor will appear here instantly.</p>
          </div>
        )
      )}
    </div>
  );
};

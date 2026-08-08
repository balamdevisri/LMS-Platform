import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { HelpCircle, Clock, Play, Sparkles, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface LiveQuizWidgetProps {
  socket: Socket | null;
  classId: string;
  currentUser: { uid: string; name: string; role: 'instructor' | 'mentor' | 'student' };
}

export const LiveQuizWidget: React.FC<LiveQuizWidgetProps> = ({ socket, classId, currentUser }) => {
  const isInstructor = currentUser.role === 'instructor' || (currentUser.role as string) === 'admin';

  // --- Instructor States ---
  const [question, setQuestion] = useState('');
  const [qType, setQType] = useState<'mcq' | 'true_false' | 'fill_in_the_blank' | 'code_output' | 'programming' | 'multiple_correct'>('mcq');
  const [opts, setOpts] = useState<string[]>(['', '', '', '']);
  const [correctAns, setCorrectAns] = useState('');
  const [timer, setTimer] = useState(30);
  const [marks, setMarks] = useState(10);
  const [difficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [explanation, setExplanation] = useState('');

  // Live Results analytics (Instructor/Mentor view)
  const [quizStats, setQuizStats] = useState<{
    totalAnswered: number;
    correct: number;
    wrong: number;
    avgTime: number;
    fastestStudent?: string;
    fastestTime?: number;
  }>({ totalAnswered: 0, correct: 0, wrong: 0, avgTime: 0 });

  // --- Student States ---
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [selectedAns, setSelectedAns] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Time tracking for response speed
  const quizStartTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!socket) return;

    // Student: Receive Broadcasted Quiz
    socket.on('quiz_published', (quiz: any) => {
      setActiveQuiz(quiz);
      setSelectedAns('');
      setSubmitted(false);
      setTimeLeft(quiz.timerSeconds || 30);
      quizStartTimeRef.current = Date.now();
      
      // Toast notification
      toast.info(`🔔 QUIZ PUBLISHED: "${quiz.question.substring(0, 30)}..."`);

      // Start circular timer
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            // Trigger auto submit
            handleAutoSubmit(quiz.id || quiz._id?.toString());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    // Instructor: Receive response updates
    socket.on('quiz_submission_update', (data: any) => {
      setQuizStats((prev) => {
        const total = prev.totalAnswered + 1;
        const correctCount = prev.correct + (data.isCorrect ? 1 : 0);
        const wrongCount = prev.wrong + (data.isCorrect ? 0 : 1);
        const avg = Math.round(((prev.avgTime * prev.totalAnswered) + data.timeTakenSeconds) / total);

        let fastest = prev.fastestStudent;
        let fastestTime = prev.fastestTime;
        if (!fastestTime || data.timeTakenSeconds < fastestTime) {
          fastest = data.userName;
          fastestTime = data.timeTakenSeconds;
        }

        return {
          totalAnswered: total,
          correct: correctCount,
          wrong: wrongCount,
          avgTime: avg,
          fastestStudent: fastest,
          fastestTime
        };
      });
    });

    return () => {
      socket.off('quiz_published');
      socket.off('quiz_submission_update');
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [socket]);

  const handlePublishQuiz = () => {
    if (!question.trim() || !correctAns.trim() || !socket) {
      toast.error('Please enter a question and the correct answer.');
      return;
    }

    const payload = {
      classId,
      question: question.trim(),
      questionType: qType,
      options: qType === 'mcq' || qType === 'code_output' || qType === 'multiple_correct' ? opts.filter(o => o.trim()) : [],
      correctAnswer: correctAns.trim(),
      marks,
      negativeMarks: 0,
      difficulty,
      timerSeconds: timer,
      explanation: explanation.trim(),
    };

    socket.emit('publish_quiz', payload);
    
    // Reset stats for new quiz
    setQuizStats({ totalAnswered: 0, correct: 0, wrong: 0, avgTime: 0 });
    toast.success('Live Quiz published to all students!');
    
    // Clear inputs
    setQuestion('');
    setCorrectAns('');
    setExplanation('');
  };

  const handleStudentSubmit = (quizId: string) => {
    if (submitted || !socket) return;
    setSubmitted(true);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const timeTaken = Math.round((Date.now() - quizStartTimeRef.current) / 1000);

    socket.emit('submit_quiz', {
      classId,
      quizId,
      userId: currentUser.uid,
      userName: currentUser.name,
      answer: selectedAns,
      timeTakenSeconds: timeTaken,
    });
    toast.success('Quiz submission recorded!');
  };

  const handleAutoSubmit = (quizId: string) => {
    setSubmitted(true);
    if (socket) {
      const timeTaken = timer;
      socket.emit('submit_quiz', {
        classId,
        quizId,
        userId: currentUser.uid,
        userName: currentUser.name,
        answer: selectedAns || '[NO_RESPONSE]',
        timeTakenSeconds: timeTaken,
      });
      toast.warning('Time limit exceeded! Auto-submitted answer.');
    }
  };

  return (
    <div className="bg-slate-900/60 border border-sky-500/15 p-6 rounded-2xl font-['Sora'] space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-500/10 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <h3 className="font-heading font-black text-sm text-white">Live Code & Concept Quizzes</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold">
          XP System Sync
        </span>
      </div>

      {/* ─── INSTRUCTOR PORTAL ─── */}
      {isInstructor && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-sky-500/5 text-xs text-slate-300">
            
            {/* Create Panel */}
            <div className="space-y-3 pr-4 border-r border-sky-500/10">
              <p className="font-bold text-sky-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Play className="w-3.5 h-3.5 text-sky-400" /> Construct Live Quiz Question
              </p>
              
              <div>
                <label className="block mb-1 font-bold text-slate-400">Question Title</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Which command yields the system call tracing trace output in Linux?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-bold text-slate-400">Question Type</label>
                  <select
                    value={qType}
                    onChange={(e: any) => setQType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-2 text-white"
                  >
                    <option value="mcq">MCQ Option</option>
                    <option value="true_false">True / False</option>
                    <option value="fill_in_the_blank">Fill in the Blank</option>
                    <option value="code_output">Code Output</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">Timer (seconds)</label>
                  <input
                    type="number"
                    value={timer}
                    onChange={(e) => setTimer(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {(qType === 'mcq' || qType === 'code_output') && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-400">Options / Alternatives</label>
                  {opts.map((o, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={o}
                      onChange={(e) => {
                        const copy = [...opts];
                        copy[idx] = e.target.value;
                        setOpts(copy);
                      }}
                      className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-1.5 text-slate-200 focus:outline-none"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-bold text-slate-400">Correct Answer</label>
                  <input
                    type="text"
                    placeholder="e.g. strace or A"
                    value={correctAns}
                    onChange={(e) => setCorrectAns(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">Marks value</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePublishQuiz}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl shadow-lg cursor-pointer"
              >
                Broadcast Quiz
              </button>
            </div>

            {/* Results Analytics Panel */}
            <div className="space-y-4 pl-0 lg:pl-4">
              <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Real-Time Quiz Response Analytics
              </p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-sky-500/5">
                  <span className="text-[10px] text-slate-500 block font-bold">Answered</span>
                  <span className="text-sm font-black text-white">{quizStats.totalAnswered}</span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10">
                  <span className="text-[10px] text-emerald-400 block font-bold">Correct</span>
                  <span className="text-sm font-black text-emerald-400">{quizStats.correct}</span>
                </div>
                <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/10">
                  <span className="text-[10px] text-rose-400 block font-bold">Wrong</span>
                  <span className="text-sm font-black text-rose-400">{quizStats.wrong}</span>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-sky-500/10 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Average Response Speed:</span>
                  <span className="text-white font-black">{quizStats.avgTime || 0} seconds</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Accuracy Score:</span>
                  <span className="text-emerald-400 font-black">
                    {quizStats.totalAnswered > 0 ? Math.round((quizStats.correct / quizStats.totalAnswered) * 100) : 0}%
                  </span>
                </div>

                {quizStats.fastestStudent && (
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-sky-500/5">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-current" /> Fastest Student:
                    </span>
                    <span className="text-white font-black">{quizStats.fastestStudent} ({quizStats.fastestTime}s)</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── STUDENT POPUP ─── */}
      {!isInstructor && activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-sky-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-100">
            
            {/* Countdown Overlay */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Live Classroom Quiz Challenge
                </span>
              </div>
              <div className="flex items-center gap-1 text-rose-400 font-bold text-xs bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{timeLeft}s left</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-sky-500/10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question ({activeQuiz.marks} Marks)</p>
              <h4 className="font-heading font-extrabold text-sm text-white mt-1 leading-relaxed">
                {activeQuiz.question}
              </h4>
            </div>

            {/* Answers Form Selection */}
            <div className="space-y-2.5">
              {activeQuiz.options && activeQuiz.options.length > 0 ? (
                activeQuiz.options.map((opt: string, idx: number) => {
                  const optChar = String.fromCharCode(65 + idx);
                  const isSelected = selectedAns === optChar;
                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => setSelectedAns(optChar)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border ${
                        isSelected ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {optChar}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })
              ) : (
                <input
                  type="text"
                  disabled={submitted}
                  placeholder="Type your response here..."
                  value={selectedAns}
                  onChange={(e) => setSelectedAns(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              )}
            </div>

            {/* Submit Actions */}
            <div className="pt-2">
              <button
                disabled={submitted || !selectedAns}
                onClick={() => handleStudentSubmit(activeQuiz.id || activeQuiz._id?.toString())}
                className="w-full py-3.5 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
              >
                {submitted ? 'Answer Logged • Waiting for correct answer' : 'Submit Answers'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Static placeholder if student is viewing without active quiz */}
      {!isInstructor && !activeQuiz && (
        <div className="py-8 text-center text-slate-500 text-xs font-bold border border-dashed border-slate-850 rounded-xl">
          Waiting for the mentor to publish a live class quiz...
        </div>
      )}

    </div>
  );
};
export default LiveQuizWidget;

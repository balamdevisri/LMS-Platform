import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiLmsService } from '../../../services/aiLmsService';
import type {
  GeneratedQuizDoc,
  QuestionItem,
  QuizAttemptDoc,
  StudentAnalysisDoc,
} from '../../../types/aiLmsTypes';

interface Props {
  studentId?: string;
  courseId?: string;
  courseTitle?: string;
}

export const StudentAdaptiveQuizHub: React.FC<Props> = ({
  studentId = 'student_demo_user',
  courseId = 'course_linux_101',
  courseTitle = 'Fullstack Systems & Linux Engineering',
}) => {
  const [analysis, setAnalysis] = useState<StudentAnalysisDoc | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<GeneratedQuizDoc | null>(null);
  const [currentQuizAttempt, setCurrentQuizAttempt] = useState<QuizAttemptDoc | null>(null);
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [studentId, courseId]);

  const fetchAnalysis = async () => {
    try {
      const res = await aiLmsService.getStudentAnalysis(studentId, courseId);
      setAnalysis(res.analysis);
    } catch (e) {
      console.warn('Notice fetching student analysis:', e);
    }
  };

  const handleGenerateAdaptiveQuiz = async () => {
    setLoading(true);
    setQuizSubmitted(false);
    setCurrentQuizAttempt(null);
    setUserAnswers({});

    try {
      const res = await aiLmsService.generatePersonalizedQuiz({
        studentId,
        courseId,
        quizTitle: `Adaptive Knowledge Assessment - ${new Date().toLocaleDateString()}`,
        questionCount: 4,
      });

      setActiveQuiz(res.quiz);
      toast.success('Personalized adaptive quiz generated! Questions customized to your weak topics.');
    } catch (err) {
      toast.error('Failed generating personalized quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setLoading(true);

    const answersPayload = activeQuiz.questions.map((q: QuestionItem) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] || '',
    }));

    try {
      const res = await aiLmsService.submitQuiz({
        studentId,
        courseId,
        quizId: activeQuiz.id,
        answers: answersPayload,
      });

      setCurrentQuizAttempt(res.attempt);
      setQuizSubmitted(true);
      toast.success(`Quiz Completed! Score: ${res.attempt.percentage}%`);
      fetchAnalysis();
    } catch (err) {
      toast.error('Failed submitting quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-500/5 font-['Sora'] space-y-6">
      
      {/* Overview Metrics Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-linear-to-tr from-sky-600 to-indigo-600 text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Personalized Adaptive Quiz Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Student: <span className="font-bold text-slate-800">{studentId}</span> &bull; Course: <span className="font-bold text-sky-600">{courseTitle}</span>
          </p>
        </div>

        <button
          onClick={handleGenerateAdaptiveQuiz}
          disabled={loading}
          className="btn-blue-primary px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
          <span>Start Personalized Adaptive Quiz</span>
        </button>
      </div>

      {/* Student Analysis Cards */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-sky-600 text-white rounded-xl shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Learning Score</div>
              <div className="text-xl font-extrabold text-sky-700">{analysis.learningScore} / 100</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Learning Speed</div>
              <div className="text-xl font-extrabold text-emerald-700">{analysis.learningSpeed}</div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1 md:col-span-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Target Weak Topics (Priority Reinforcement)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.weakTopics.map((wt: string, idx: number) => (
                <span key={idx} className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-lg">
                  {wt}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ACTIVE QUIZ PLAYER */}
      {activeQuiz && !quizSubmitted && (
        <div className="p-6 bg-slate-50 border border-sky-200 rounded-3xl space-y-6 shadow-inner animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">{activeQuiz.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeQuiz.questions.length} Custom Questions &bull; Total Marks: {activeQuiz.totalMarks}
              </p>
            </div>
            <div className="px-3 py-1 bg-sky-100 text-sky-800 rounded-xl font-bold text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Limit: {activeQuiz.timeLimitMinutes} Mins</span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q: QuestionItem, idx: number) => (
              <div key={q.id} className="p-4 bg-white border border-sky-100 rounded-2xl space-y-3 shadow-xs">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                    Question {idx + 1} ({q.type.replace('_', ' ')})
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                    {q.difficulty} ({q.marks} Mark)
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 leading-relaxed">{q.question}</p>

                {/* MCQ / Options */}
                {q.options && q.options.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt: string, oIdx: number) => (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(q.id, opt)}
                        className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          userAnswers[q.id] === opt
                            ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Command / Input Type */
                  <div>
                    <input
                      type="text"
                      placeholder="Type command or answer..."
                      value={userAnswers[q.id] || ''}
                      onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                      className="w-full bg-slate-900 text-sky-400 font-mono p-3 rounded-xl text-xs border border-slate-700 focus:outline-hidden"
                    />
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSubmitQuiz}
              disabled={loading}
              className="btn-blue-primary px-6 py-3 text-xs font-bold shadow-lg cursor-pointer"
            >
              <span>Submit Adaptive Quiz</span>
            </button>
          </div>

        </div>
      )}

      {/* QUIZ SUBMISSION RESULTS */}
      {quizSubmitted && currentQuizAttempt && (
        <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-3xl space-y-4 animate-in fade-in duration-300 text-center">
          <Award className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">Quiz Evaluated & Auto-Graded</h3>
          
          <div className="inline-block bg-white px-6 py-3 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="text-3xl font-extrabold text-emerald-600">
              {currentQuizAttempt.percentage}%
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">
              Score: {currentQuizAttempt.score} / {currentQuizAttempt.maxScore} Marks
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={handleGenerateAdaptiveQuiz}
              className="btn-blue-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generate Next Adaptive Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!activeQuiz && (
        <div className="text-center py-12 bg-sky-50/30 border border-dashed border-sky-200 rounded-2xl">
          <Zap className="w-10 h-10 text-sky-500 mx-auto mb-2 animate-bounce" />
          <p className="text-xs font-bold text-slate-800">No Quiz Active</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
            Click "Start Personalized Adaptive Quiz" above to generate a customized quiz that focuses on your weak topics and prevents repeated questions.
          </p>
        </div>
      )}

    </div>
  );
};

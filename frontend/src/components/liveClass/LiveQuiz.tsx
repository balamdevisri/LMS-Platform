import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Clock } from 'lucide-react';
import type { ActiveQuizItem, QuizResultItem } from '@/hooks/useLiveClassSocket';

export interface LiveQuizProps {
  activeQuiz: ActiveQuizItem | null;
  quizResult: QuizResultItem | null;
  onSubmitAnswer: (quizId: string, answer: string) => Promise<void> | void;
  className?: string;
}

export const LiveQuiz: React.FC<LiveQuizProps> = ({
  activeQuiz,
  quizResult,
  onSubmitAnswer,
  className = '',
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Reset submission state when active quiz changes
    setSelectedOption('');
    setSubmitted(false);
  }, [activeQuiz?.id]);

  const handleSubmit = async () => {
    if (!activeQuiz || !selectedOption || submitted || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitAnswer(activeQuiz.id, selectedOption);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeQuiz) {
    return (
      <div className={`py-12 text-center text-slate-500 text-xs space-y-2 ${className}`}>
        <Award className="w-8 h-8 text-slate-700 mx-auto" />
        <p>No active checkpoint quiz right now.</p>
        <span className="text-[11px] text-slate-600">The instructor will launch interactive quizzes during lecture.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quiz Card Header */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>{activeQuiz.timerSeconds}s Concept Check</span>
          </span>
          <span className="text-[11px] text-purple-300 font-mono font-bold">
            +{activeQuiz.marks || 10} XP
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
          {activeQuiz.question}
        </h4>

        {/* Options List */}
        <div className="space-y-2">
          {activeQuiz.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = quizResult && opt === quizResult.correctAnswer;
            const isWrongSelected = quizResult && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => !submitted && setSelectedOption(opt)}
                disabled={submitted || activeQuiz.status === 'ENDED'}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  quizResult
                    ? isCorrect
                      ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 font-bold'
                      : isWrongSelected
                      ? 'bg-rose-950/70 border border-rose-500/60 text-rose-200'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400'
                    : isSelected
                    ? 'bg-purple-600 text-white shadow-md font-bold ring-2 ring-purple-400/40'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{opt}</span>
                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Action Button / Feedback */}
        {!submitted && activeQuiz.status === 'ACTIVE' ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOption || submitting}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : quizResult ? (
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Quiz Concluded!</span>
            <span className="text-slate-300 text-[11px]">
              Correct Answer: <strong className="text-emerald-300">{quizResult.correctAnswer}</strong> ({quizResult.accuracyPercentage}% Accuracy)
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            ✓ Answer submitted. Awaiting instructor to reveal final leaderboard results...
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveQuiz;

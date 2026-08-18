import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import type { QuestionItem } from '@/hooks/useLiveClassSocket';

export interface LiveQnAProps {
  questions: QuestionItem[];
  onAskQuestion: (question: string) => Promise<void> | void;
  onAnswerQuestion?: (questionId: string, answer: string) => Promise<void> | void;
  isInstructorOrAdmin?: boolean;
  className?: string;
}

export const LiveQnA: React.FC<LiveQnAProps> = ({
  questions,
  onAskQuestion,
  onAnswerQuestion,
  isInstructorOrAdmin = false,
  className = '',
}) => {
  const [questionInput, setQuestionInput] = useState('');
  const [replyInput, setReplyInput] = useState<{ [qId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = questionInput.trim();
    if (!clean || submitting) return;

    setSubmitting(true);
    setQuestionInput('');
    try {
      await onAskQuestion(clean);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnswer = async (qId: string) => {
    const ans = (replyInput[qId] || '').trim();
    if (!ans || !onAnswerQuestion) return;
    try {
      await onAnswerQuestion(qId, ans);
      setReplyInput((prev) => ({ ...prev, [qId]: '' }));
    } catch {
      // Handled in parent
    }
  };

  return (
    <div className={`flex flex-col h-full justify-between ${className}`}>
      {/* Question List */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0 mb-3">
        {questions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-700" />
            <p>No questions submitted yet.</p>
            <span className="text-[11px] text-slate-600">Have a doubt? Ask the instructor directly below!</span>
          </div>
        ) : (
          questions.map((q) => {
            const isAnswered = q.status === 'ANSWERED';

            return (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-white block truncate">{q.studentName || 'Student'}</span>
                    <p className="text-slate-300 break-words">{q.question}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                      isAnswered
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {isAnswered ? 'Answered' : 'Open'}
                  </span>
                </div>

                {isAnswered && q.answer && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Answer ({q.answeredBy || 'Instructor'}):
                    </span>
                    <p className="leading-relaxed">{q.answer}</p>
                  </div>
                )}

                {!isAnswered && isInstructorOrAdmin && onAnswerQuestion && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <input
                      type="text"
                      value={replyInput[q.id] || ''}
                      onChange={(e) => setReplyInput({ ...replyInput, [q.id]: e.target.value })}
                      placeholder="Type instructor answer..."
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendAnswer(q.id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                    >
                      Answer
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Form */}
      <form onSubmit={handleSubmitQuestion} className="flex items-center gap-2 pt-2 border-t border-slate-800/80 shrink-0">
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder="Ask a question to instructor..."
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!questionInput.trim() || submitting}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0 shadow-sm"
          title="Submit question"
          aria-label="Submit question"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default LiveQnA;

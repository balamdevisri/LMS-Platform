import React, { useState, useEffect } from 'react';
import { liveClassService, type LiveQuestion } from '@/services/liveClassService';
import { HelpCircle, Send, Mic, MicOff, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionsWidgetProps {
  classId: string;
  currentUser: {
    uid: string;
    name: string;
    role: 'instructor' | 'mentor' | 'student' | 'admin';
  };
}

export const LiveQuestionsWidget: React.FC<QuestionsWidgetProps> = ({ classId, currentUser }) => {
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [filterTab, setFilterTab] = useState<'pending' | 'accepted' | 'answered'>('pending');

  const isInstructor = currentUser.role === 'instructor' || currentUser.role === 'admin' || currentUser.role === 'mentor';

  useEffect(() => {
    if (!classId) return;
    const unsubscribe = liveClassService.subscribeQuestions(classId, (data) => {
      setQuestions(data);
    });
    return () => unsubscribe();
  }, [classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    await liveClassService.submitQuestion(classId, currentUser.uid, currentUser.name, inputQuestion.trim());
    toast.success('Question submitted to the lead instructor!');
    setInputQuestion('');
  };

  const handleUpdateStatus = async (qId: string, status: 'pending' | 'accepted' | 'answered', micAllowed?: boolean) => {
    await liveClassService.updateQuestionStatus(classId, qId, status, micAllowed);
    toast.info(`Question status updated to ${status}.`);
  };

  const filteredQuestions = questions.filter((q) => q.status === filterTab);

  return (
    <div className="flex flex-col h-full space-y-4 font-sans text-slate-800 dark:text-slate-100 bg-white dark:bg-[#0c1122]/95 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Live Student Q&A</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Moderated student questions & inquiries</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
          {questions.length} Total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setFilterTab('pending')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'bg-white dark:bg-[#151c33] text-amber-700 dark:text-amber-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pending ({questions.filter((q) => q.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterTab('accepted')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterTab === 'accepted'
              ? 'bg-white dark:bg-[#151c33] text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Accepted ({questions.filter((q) => q.status === 'accepted').length})
        </button>
        <button
          onClick={() => setFilterTab('answered')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterTab === 'answered'
              ? 'bg-white dark:bg-[#151c33] text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Answered ({questions.filter((q) => q.status === 'answered').length})
        </button>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[200px]">
        {filteredQuestions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
            <HelpCircle className="w-8 h-8 opacity-40 mb-2 text-slate-300 dark:text-slate-600" />
            <p>No questions currently in {filterTab} status.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl space-y-2 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                    {(q.studentName || 'S').charAt(0)}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{q.studentName || 'Student'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-white dark:bg-[#070a14] p-2.5 rounded-lg border border-slate-200/80 dark:border-white/10">
                {q.question}
              </p>

              {/* Instructor Controls */}
              {isInstructor && (
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {q.status !== 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'accepted')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[11px] font-bold cursor-pointer transition-all"
                      >
                        Accept
                      </button>
                    )}
                    {q.status !== 'answered' && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'answered')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark Answered</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(q.id, q.status, !q.micAllowed)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      q.micAllowed
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-white dark:bg-white/[0.06] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {q.micAllowed ? <Mic className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <MicOff className="w-3 h-3 text-slate-400" />}
                    <span>{q.micAllowed ? 'Mic Allowed' : 'Allow Mic'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Student Question Submission Form */}
      {!isInstructor && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask the instructor a question..."
            className="flex-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-black/30 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};

export default LiveQuestionsWidget;

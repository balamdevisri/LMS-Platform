import React, { useState, useEffect } from 'react';
import { liveClassService, type LiveQuestion } from '@/services/liveClassService';
import { HelpCircle, Send, Mic, MicOff, Clock } from 'lucide-react';
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

  const isInstructor = currentUser.role === 'instructor' || currentUser.role === 'admin';

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
    toast.success('Question submitted to the lead mentor!');
    setInputQuestion('');
  };

  const handleUpdateStatus = async (qId: string, status: 'pending' | 'accepted' | 'answered', micAllowed?: boolean) => {
    await liveClassService.updateQuestionStatus(classId, qId, status, micAllowed);
    toast.info(`Question status updated to ${status}.`);
  };

  const filteredQuestions = questions.filter((q) => q.status === filterTab);

  return (
    <div className="flex flex-col h-full space-y-4 font-['Sora'] text-slate-200">
      
      {/* Header & Sub-tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h3 className="font-heading font-black text-sm text-white">Live Student Questions</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
          {questions.length} Total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setFilterTab('pending')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterTab === 'pending' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending ({questions.filter((q) => q.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterTab('accepted')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterTab === 'accepted' ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Accepted ({questions.filter((q) => q.status === 'accepted').length})
        </button>
        <button
          onClick={() => setFilterTab('answered')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterTab === 'answered' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Answered ({questions.filter((q) => q.status === 'answered').length})
        </button>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
        {filteredQuestions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
            <HelpCircle className="w-8 h-8 opacity-40 mb-2" />
            <p>No questions in {filterTab} status.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center text-[10px]">
                    {q.studentName.charAt(0)}
                  </div>
                  <span className="font-bold text-white truncate max-w-[120px]">{q.studentName}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                {q.question}
              </p>

              {/* Instructor Controls */}
              {isInstructor && (
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {q.status !== 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'accepted')}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold cursor-pointer"
                      >
                        Accept
                      </button>
                    )}
                    {q.status !== 'answered' && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'answered')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold cursor-pointer"
                      >
                        Mark Answered
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(q.id, q.status, !q.micAllowed)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      q.micAllowed ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {q.micAllowed ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
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
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask mentor a question..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

    </div>
  );
};

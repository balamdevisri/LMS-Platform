import React, { useState } from 'react';
import {
  MessageSquare,
  HelpCircle,
  Award,
  Users,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  BarChart2,
  Hand,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveClassSocket } from '@/hooks/useLiveClassSocket';
import { toast } from 'sonner';

interface LiveClassSidebarProps {
  classId?: string;
  instructorName?: string;
  isLive?: boolean;
}

export const LiveClassSidebar: React.FC<LiveClassSidebarProps> = ({
  classId = 'class_react_101_live',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'qna' | 'quiz' | 'poll' | 'participants'>('chat');
  const { userProfile } = useAuth();

  const currentUserRole = (userProfile?.role || 'student').toUpperCase();
  const isInstructorOrAdmin = currentUserRole === 'INSTRUCTOR' || currentUserRole === 'ADMIN';

  // Real-Time Socket Hook
  const {
    connectionStatus,
    onlineCount,
    participants,
    chatMessages,
    questions,
    activePoll,
    activeQuiz,
    quizResult,
    hasRaisedHand,
    sendChat,
    deleteChat,
    askQuestion,
    toggleRaiseHand,
    votePoll,
    submitQuizAnswer,
  } = useLiveClassSocket(classId);

  // Local Inputs
  const [chatInput, setChatInput] = useState<string>('');
  const [questionInput, setQuestionInput] = useState<string>('');
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Send Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgToSend = chatInput.trim();
    setChatInput('');
    try {
      await sendChat(msgToSend);
    } catch (err: any) {
      if (err?.error === 'CHAT_RATE_LIMITED') {
        toast.warning('⚠️ ' + (err.message || 'Slow down! Chat rate limit reached.'));
      } else {
        toast.error('Failed to send message.');
      }
    }
  };

  // Submit Q&A Question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    const qText = questionInput.trim();
    setQuestionInput('');
    try {
      await askQuestion(qText);
      toast.success('Question submitted to instructor queue!');
    } catch (e) {
      toast.error('Failed to submit question.');
    }
  };

  // Submit Quiz Answer
  const handleQuizSubmit = async () => {
    if (!activeQuiz || !selectedQuizOption) {
      toast.error('Please select an option before submitting.');
      return;
    }
    try {
      await submitQuizAnswer(activeQuiz.id, selectedQuizOption);
      setQuizSubmitted(true);
      toast.success('Answer recorded on server!');
    } catch (e) {
      toast.error('Failed to submit answer.');
    }
  };

  // Vote on Poll
  const handleVotePoll = async (optionId: string) => {
    if (!activePoll) return;
    try {
      await votePoll(activePoll.id, optionId);
      toast.success('Vote submitted!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit vote.');
    }
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col shadow-2xl backdrop-blur-xl h-[540px] lg:h-[640px] overflow-hidden font-['Sora']">
      {/* Real-time connection badge bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : connectionStatus === 'reconnecting'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {connectionStatus === 'connected' ? 'Real-Time Connected' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRaiseHand}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              hasRaisedHand
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-3 h-3" />
            <span>{hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>
          <span className="text-slate-400 font-semibold">{onlineCount} online</span>
        </div>
      </div>

      {/* Sidebar Header / Tab switcher */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('qna')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'qna' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Q&A</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeTab === 'quiz' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Quiz</span>
          {activeQuiz && activeQuiz.status === 'ACTIVE' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('poll')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeTab === 'poll' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Poll</span>
          {activePoll && activePoll.status === 'ACTIVE' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'participants' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{onlineCount}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
        {/* Tab: Chat */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-2">
              {chatMessages.map((msg) => {
                const isInstructorMsg = msg.role === 'INSTRUCTOR' || msg.role === 'ADMIN';
                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-2xl text-xs space-y-0.5 ${
                      isInstructorMsg
                        ? 'bg-blue-950/60 border border-blue-800/60'
                        : 'bg-slate-800/80 border border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        {msg.userName}
                        {isInstructorMsg && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-extrabold uppercase">
                            {msg.role}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isInstructorOrAdmin && (
                          <button
                            type="button"
                            onClick={() => deleteChat(msg.id)}
                            className="text-slate-600 hover:text-rose-400 p-0.5 rounded-sm transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed break-words">{msg.message}</p>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question or share thoughts..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shrink-0"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab: Q&A */}
        {activeTab === 'qna' && (
          <div className="flex flex-col h-full justify-between space-y-3">
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {questions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No questions asked yet. Be the first to ask!
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-200">{q.question}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          q.status === 'ANSWERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    {q.status === 'ANSWERED' && q.answer && (
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-[11px]">
                        <strong className="block text-emerald-400">Answer by {q.answeredBy || 'Instructor'}:</strong>
                        <p>{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAskQuestion} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask instructor a question..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab: Quiz */}
        {activeTab === 'quiz' && (
          <div className="flex flex-col h-full justify-between overflow-y-auto space-y-4">
            {activeQuiz ? (
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    {activeQuiz.marks || 10} XP Live Challenge
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {activeQuiz.timerSeconds || 30}s
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">{activeQuiz.question}</h4>

                <div className="space-y-1.5">
                  {activeQuiz.options.map((opt: string, idx: number) => {
                    const isSelected = selectedQuizOption === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => !quizSubmitted && setSelectedQuizOption(opt)}
                        disabled={quizSubmitted || activeQuiz.status === 'ENDED'}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          quizResult
                            ? opt === quizResult.correctAnswer
                              ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 font-bold'
                              : isSelected
                              ? 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
                              : 'bg-slate-900/60 border border-slate-800 text-slate-400'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{opt}</span>
                        {quizResult && opt === quizResult.correctAnswer && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted && activeQuiz.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={handleQuizSubmit}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : quizResult ? (
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs space-y-1">
                    <span className="text-emerald-400 font-bold block">✓ Quiz Finished!</span>
                    <span className="text-slate-300 text-[11px]">
                      Correct Answer: <strong className="text-emerald-300">{quizResult.correctAnswer}</strong> ({quizResult.accuracyPercentage}% Accuracy)
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    Answer submitted. Waiting for instructor to end quiz...
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Award className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No active live quizzes at this moment.</p>
                <span className="text-[11px] text-slate-500">Instructor will launch checkpoint quizzes during lecture.</span>
              </div>
            )}
          </div>
        )}

        {/* Tab: Poll */}
        {activeTab === 'poll' && (
          <div className="flex flex-col h-full justify-between overflow-y-auto space-y-4">
            {activePoll ? (
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                    {activePoll.status === 'ACTIVE' ? 'Live Poll Active' : 'Poll Closed'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activePoll.totalVotes || 0} Total Votes
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">{activePoll.question}</h4>

                <div className="space-y-2">
                  {activePoll.options.map((opt) => {
                    const total = activePoll.totalVotes || 0;
                    const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                    const isVoted = activePoll.userVotedOptionId === opt.id;

                    return (
                      <div key={opt.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleVotePoll(opt.id)}
                          disabled={activePoll.status === 'ENDED' || !!activePoll.userVotedOptionId}
                          className={`w-full p-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                            isVoted
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{opt.text}</span>
                          <span className="font-mono text-[11px] text-slate-400">{pct}% ({opt.votes})</span>
                        </button>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <BarChart2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No live polls running right now.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Participants */}
        {activeTab === 'participants' && (
          <div className="flex flex-col h-full overflow-y-auto space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span>{participants.length} Active Participants</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1">
              {participants.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs">
                  <span className="font-medium text-slate-200">{p.name || 'Student'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 font-bold uppercase">
                    {p.role || 'student'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center shrink-0">
        <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Shaivika Socket.IO Real-Time Engine
        </span>
      </div>
    </aside>
  );
};

export default LiveClassSidebar;

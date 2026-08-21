import React, { useState } from 'react';
import { MessageSquare, HelpCircle, Award, Users, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveClassSocket } from '@/hooks/useLiveClassSocket';
import { LiveChat } from './LiveChat';
import { LiveQnA } from './LiveQnA';
import { LiveQuiz } from './LiveQuiz';
import { LivePoll } from './LivePoll';
import { ParticipantsPanel } from './ParticipantsPanel';
import { RaiseHandButton } from './RaiseHandButton';
import { toast } from 'sonner';

export interface LiveClassSidebarProps {
  classId?: string;
  instructorName?: string;
  isLive?: boolean;
  className?: string;
}

export const LiveClassSidebar: React.FC<LiveClassSidebarProps> = ({
  classId = 'class_react_101_live',
  instructorName = 'Lead Instructor',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'qna' | 'quiz' | 'poll' | 'participants'>('chat');
  const { userProfile, user } = useAuth();

  const currentUserRole = (userProfile?.role || 'student').toUpperCase();
  const isInstructorOrAdmin = currentUserRole === 'INSTRUCTOR' || currentUserRole === 'ADMIN';

  // Real-Time Socket Connection & Actions
  const {
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
    answerQuestion,
    toggleRaiseHand,
    votePoll,
    submitQuizAnswer,
  } = useLiveClassSocket(classId);

  const handleSendMessage = async (msg: string) => {
    try {
      await sendChat(msg);
    } catch (err: any) {
      if (err?.error === 'CHAT_RATE_LIMITED') {
        toast.warning('⚠️ ' + (err.message || 'Slow down! Chat rate limit reached.'));
      } else {
        toast.error('Failed to send message.');
      }
    }
  };

  const handleAskQuestion = async (qText: string) => {
    try {
      await askQuestion(qText);
      toast.success('Question submitted to instructor queue!');
    } catch {
      toast.error('Failed to submit question.');
    }
  };

  const handleAnswerQuestion = async (qId: string, answer: string) => {
    try {
      await answerQuestion(qId, answer);
      toast.success('Verified answer broadcasted to classroom!');
    } catch {
      toast.error('Failed to broadcast answer.');
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      await votePoll(pollId, optionId);
      toast.success('Vote submitted!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit vote.');
    }
  };

  const handleSubmitQuiz = async (quizId: string, answer: string) => {
    try {
      await submitQuizAnswer(quizId, answer);
      toast.success('Checkpoint answer recorded!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit quiz answer.');
    }
  };

  const handleToggleHand = async () => {
    try {
      await toggleRaiseHand();
      if (!hasRaisedHand) {
        toast.info('✋ Hand raised! Instructor was notified.');
      } else {
        toast.info('Hand lowered.');
      }
    } catch {
      toast.error('Failed to raise hand.');
    }
  };

  return (
    <aside
      className={`w-full flex flex-col bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-['Sora'] h-[560px] max-h-[75vh] ${className}`}
    >
      {/* Top Controls Toolbar: Hand Raise Button & Online Count */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2 shrink-0">
        <RaiseHandButton
          hasRaisedHand={hasRaisedHand}
          onToggleRaiseHand={handleToggleHand}
        />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-semibold text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{onlineCount || 1} online</span>
        </div>
      </div>

      {/* Tab Navigation Switcher */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qna')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'qna' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Q&A ({questions.length})</span>
        </button>

        <button
          type="button"
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
          type="button"
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
          type="button"
          onClick={() => setActiveTab('participants')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'participants' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Roster</span>
        </button>
      </div>

      {/* Tab Panels Container */}
      <div className="flex-1 min-h-0 p-3 overflow-hidden">
        {activeTab === 'chat' && (
          <LiveChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={deleteChat}
            isInstructorOrAdmin={isInstructorOrAdmin}
            currentUserId={userProfile?.uid || user?.uid}
          />
        )}

        {activeTab === 'qna' && (
          <LiveQnA
            questions={questions}
            onAskQuestion={handleAskQuestion}
            onAnswerQuestion={handleAnswerQuestion}
            isInstructorOrAdmin={isInstructorOrAdmin}
          />
        )}

        {activeTab === 'quiz' && (
          <LiveQuiz
            activeQuiz={activeQuiz}
            quizResult={quizResult}
            onSubmitAnswer={handleSubmitQuiz}
          />
        )}

        {activeTab === 'poll' && (
          <LivePoll
            activePoll={activePoll}
            onVote={handleVotePoll}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsPanel
            participants={participants}
            onlineCount={onlineCount}
            instructorName={instructorName}
          />
        )}
      </div>
    </aside>
  );
};

export default LiveClassSidebar;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Play,
  Square,
  XCircle,
  Users,
  MessageSquare,
  HelpCircle,
  Award,
  Send,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Radio,
  BookOpen,
  User,
  Clock,
  ExternalLink,
  Edit,
  Hand,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { useLiveClassSocket } from '@/hooks/useLiveClassSocket';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/liveClass/YouTubePlayer';
import { toast } from 'sonner';

export const AdminLiveControlCenter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'students' | 'chat' | 'qna' | 'quiz' | 'hands'>('overview');

  const classId = id || 'class_react_101_live';
  const role = userProfile?.role || 'student';
  const currentUserId = userProfile?.uid || user?.uid || '';
  const currentUserName = userProfile?.name || user?.displayName || 'Lead Instructor';

  // Real-Time Socket Connection & Actions
  const {
    onlineCount,
    participants,
    chatMessages: socketChatMessages,
    questions: socketQuestions,
    raisedHands,
    announcements: socketAnnouncements,
    sendChat,
    deleteChat,
    answerQuestion,
    acknowledgeHand,
    sendAnnouncement,
    startQuiz,
    updateClassStatus,
  } = useLiveClassSocket(classId, liveClass?.status);

  // Confirmation Modal State
  const [actionModal, setActionModal] = useState<'start' | 'end' | 'cancel' | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);

  // YouTube Quick Update
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [savingYoutube, setSavingYoutube] = useState<boolean>(false);

  // Live Announcements State
  const [newAnnouncement, setNewAnnouncement] = useState<string>('');
  const [postingAnnouncement, setPostingAnnouncement] = useState<boolean>(false);

  // Live Chat Moderation State
  const [chatInput, setChatInput] = useState<string>('');

  // Q&A State
  const [replyInput, setReplyInput] = useState<{ [qId: string]: string }>({});

  // Quiz Studio State
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizQuestion, setQuizQuestion] = useState<string>('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState<string>('');
  const [quizTimer, setQuizTimer] = useState<number>(30);
  const [quizPoints, setQuizPoints] = useState<number>(10);

  // Attendance/Students Roster
  const [studentsRoster] = useState<any[]>([
    { id: 'usr_std_1', name: 'Aarav Sharma', email: 'aarav@shaivika.edu', status: 'ACTIVE', joinedAt: '10:02 AM', duration: '42 mins' },
    { id: 'usr_std_2', name: 'Priya Patel', email: 'priya@shaivika.edu', status: 'ACTIVE', joinedAt: '10:04 AM', duration: '40 mins' },
    { id: 'usr_std_3', name: 'Rohan Gupta', email: 'rohan@shaivika.edu', status: 'ACTIVE', joinedAt: '10:05 AM', duration: '39 mins' },
    { id: 'usr_std_4', name: 'Ananya Reddy', email: 'ananya@shaivika.edu', status: 'ACTIVE', joinedAt: '10:08 AM', duration: '36 mins' },
    { id: 'usr_std_5', name: 'Vikram Singh', email: 'vikram@shaivika.edu', status: 'ACTIVE', joinedAt: '10:11 AM', duration: '33 mins' },
    { id: 'usr_std_6', name: 'Sneha Rao', email: 'sneha@shaivika.edu', status: 'LEFT', joinedAt: '10:00 AM', duration: '25 mins' },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cls = liveClassService.getLiveClassesSync().find((c) => c.id === classId || c.classId === classId);
      if (cls) {
        // Enforce instructor authorization: instructors cannot manage other instructors' classes
        if (role === 'instructor' && cls.instructorId !== currentUserId && cls.createdBy !== currentUserId) {
          toast.error('You are not authorized to manage this live class.');
          navigate('/admin/live-classes');
          return;
        }
        setLiveClass(cls);
        setYoutubeInput(cls.youtubeVideoId || '');
      }

      // Load Quizzes
      const qzs = await liveClassService.fetchQuizzes(classId);
      setQuizzes(qzs);
    } catch (e) {
      toast.error('Failed to load control center data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  // Status Action Handlers with Real-Time Socket Broadcast
  const handleConfirmStatusAction = async () => {
    if (!actionModal || !liveClass) return;
    setActionSubmitting(true);
    const targetId = liveClass.id || liveClass.classId;

    try {
      if (actionModal === 'start') {
        await liveClassService.startClass(targetId);
        updateClassStatus('LIVE');
        toast.success('🔴 Live stream is now active! Broadcasted to students.');
      } else if (actionModal === 'end') {
        await liveClassService.endClass(targetId);
        updateClassStatus('ENDED');
        toast.info('🏁 Live class has ended.');
      } else if (actionModal === 'cancel') {
        await liveClassService.cancelClass(targetId);
        updateClassStatus('CANCELLED');
        toast.warning('⚠️ Live class has been cancelled.');
      }
      loadData();
      setActionModal(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // YouTube ID Quick Updater
  const handleUpdateYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYouTubeVideoId(youtubeInput) || youtubeInput.trim();
    if (!cleanId) {
      toast.error('Please provide a valid YouTube Live Video ID or URL.');
      return;
    }
    setSavingYoutube(true);
    try {
      await liveClassService.updateYoutube(classId, cleanId);
      setLiveClass((prev) => (prev ? { ...prev, youtubeVideoId: cleanId } : prev));
      toast.success('YouTube Video ID updated & live stream synchronized!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update YouTube ID.');
    } finally {
      setSavingYoutube(false);
    }
  };

  // Dispatch Live Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setPostingAnnouncement(true);
    try {
      const msg = newAnnouncement.trim();
      await sendAnnouncement(msg, 'normal');
      await liveClassService.createAnnouncement(classId, msg, currentUserName);
      setNewAnnouncement('');
      toast.success('📢 Announcement broadcasted to all students via Socket.IO!');
    } catch (e) {
      toast.error('Failed to post announcement.');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  // Moderator Chat Post & Delete
  const handleSendModeratorChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    try {
      await sendChat(msg, 'normal');
    } catch (err: any) {
      toast.error('Failed to send moderator message.');
    }
  };

  const handleDeleteChatMessage = async (msgId: string) => {
    try {
      await deleteChat(msgId);
      toast.info('Message deleted by moderator.');
    } catch (err) {
      toast.error('Failed to delete chat message.');
    }
  };

  // Q&A Answer submission
  const handleAnswerQuestion = async (qId: string) => {
    const ansText = replyInput[qId];
    if (!ansText || !ansText.trim()) return;
    try {
      await answerQuestion(qId, ansText.trim());
      setReplyInput((prev) => ({ ...prev, [qId]: '' }));
      toast.success('Answer broadcasted to all students in real-time!');
    } catch (err) {
      toast.error('Failed to answer question.');
    }
  };

  // Live Quiz Creation
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion.trim() || quizOptions.some((o) => !o.trim()) || !quizCorrectAnswer.trim()) {
      toast.error('Please fill in the question, all 4 options, and select the correct answer.');
      return;
    }

    try {
      await startQuiz(
        quizQuestion.trim(),
        quizOptions.map((o) => o.trim()),
        quizCorrectAnswer.trim(),
        quizPoints,
        quizTimer,
        'Live Concept Check'
      );
      setQuizQuestion('');
      setQuizOptions(['', '', '', '']);
      setQuizCorrectAnswer('');
      toast.success('⚡ Live Quiz broadcasted to all student screens!');
    } catch (e) {
      toast.error('Failed to launch quiz.');
    }
  };

  const currentStatus = (liveClass?.status || 'SCHEDULED').toUpperCase();
  const isLive = currentStatus === 'LIVE';
  const isScheduled = currentStatus === 'SCHEDULED';
  const isEnded = currentStatus === 'ENDED' || currentStatus === 'COMPLETED';

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm font-['Sora']">Loading Live Control Center...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-['Sora'] animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/live-classes')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Classes</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/student/live-class/${classId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Student View</span>
          </button>
          <button
            onClick={() => navigate(`/admin/live-classes/${classId}/edit`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Settings</span>
          </button>
        </div>
      </div>

      {/* Control Center Banner */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                LIVE CLASS CONTROL CENTER
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-extrabold tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  🔴 LIVE
                </span>
              ) : isScheduled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold">
                  <Clock className="w-3 h-3" />
                  SCHEDULED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  ENDED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{liveClass?.courseName || 'React Fundamentals Masterclass'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              {liveClass?.title || 'Live Classroom Session'}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Instructor: <strong className="text-white">{liveClass?.instructorName || 'Lead Faculty'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Students Joined: <strong className="text-white">48</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Active Students: <strong className="text-emerald-400">44</strong></span>
              </div>
            </div>
          </div>

          {/* Master Live Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            {isScheduled && (
              <button
                onClick={() => setActionModal('start')}
                className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START CLASS</span>
              </button>
            )}

            {isLive && (
              <button
                onClick={() => setActionModal('end')}
                className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>END CLASS</span>
              </button>
            )}

            {!isEnded && (
              <button
                onClick={() => setActionModal('cancel')}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                title="Cancel Live Class"
              >
                <XCircle className="w-4 h-4" />
                <span>CANCEL</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: YouTube Preview & Control Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: YouTube Embedded Live Preview & Quick Updater */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {/* YouTube Preview Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Live Stream Output Preview
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {liveClass?.youtubeVideoId ? `ID: ${liveClass.youtubeVideoId}` : 'No Stream ID'}
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <YouTubePlayer
                youtubeVideoId={liveClass?.youtubeVideoId}
                title={liveClass?.title}
                isLive={isLive}
                status={currentStatus}
              />
            </div>

            {/* Quick YouTube Video ID Updater */}
            <form onSubmit={handleUpdateYoutube} className="pt-2 border-t border-slate-900 space-y-2">
              <label className="text-[11px] font-bold text-slate-400 block">
                Change YouTube Video ID / Live URL during stream:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="Paste new YouTube Video ID or URL"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={savingYoutube}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shrink-0"
                >
                  {savingYoutube ? 'Updating...' : 'Update ID'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Interactive Management Modules */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          {/* Navigation Tabs for Modules */}
          <div className="flex items-center bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto scrollbar-none">
            {[
              { key: 'announcements', label: 'Announce', icon: Sparkles },
              { key: 'students', label: `Students (${participants.length || onlineCount})`, icon: Users },
              { key: 'hands', label: `Hands (${raisedHands.length})`, icon: Hand },
              { key: 'chat', label: 'Chat', icon: MessageSquare },
              { key: 'qna', label: `Q&A (${socketQuestions.length})`, icon: HelpCircle },
              { key: 'quiz', label: 'Quiz Studio', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Module: Raised Hands Queue */}
          {activeTab === 'hands' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    Raised Hands Queue ({raisedHands.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Students requesting acknowledgment during live lecture.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-80 overflow-y-auto">
                {raisedHands.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No raised hands in queue right now.</p>
                ) : (
                  raisedHands.map((h, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                          <Hand className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">{h.studentName}</span>
                          <span className="text-[10px] text-slate-400">Raised at {new Date(h.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => acknowledgeHand(h.studentId)}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-xs"
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Module: Announcements */}
          {activeTab === 'announcements' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                  Broadcast Live Announcement
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Broadcast pinned messages directly to student live classroom screens via Socket.IO.
                </p>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-2">
                <textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please open Chapter 3 workbook; quiz starts in 10 minutes."
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={postingAnnouncement}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingAnnouncement ? 'Broadcasting...' : 'Broadcast via Socket.IO'}</span>
                </button>
              </form>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 max-h-60 overflow-y-auto">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Broadcast Log ({socketAnnouncements.length})
                </span>
                {socketAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No live announcements broadcasted yet.</p>
                ) : (
                  socketAnnouncements.map((ann, idx) => (
                    <div key={ann.id || idx} className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 space-y-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{ann.message}</p>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                        {ann.senderName || 'Instructor'} &bull; {new Date(ann.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Module: Students & Attendance */}
          {activeTab === 'students' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    Live Student Roster & Attendance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Real-time participant presence and duration tracking.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} Online
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-96 overflow-y-auto">
                {participants.length === 0 ? (
                  studentsRoster.map((std) => (
                    <div key={std.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{std.name}</span>
                        <span className="text-[11px] text-slate-400">{std.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {std.status}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{std.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  participants.map((std, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">{std.name}</span>
                        <span className="text-[11px] text-slate-400">{std.userId}</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {std.role?.toUpperCase() || 'STUDENT'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Module: Chat Moderation */}
          {activeTab === 'chat' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    Live Chat Moderation (Real-Time)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Moderate student inquiries and remove inappropriate comments.
                  </p>
                </div>
              </div>

              <div className="h-64 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                {socketChatMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No messages in room yet.</p>
                ) : (
                  socketChatMessages.map((msg) => (
                    <div key={msg.id} className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700 flex items-start justify-between gap-2">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">{msg.userName}</span>
                          <span className="text-[10px] px-1.5 rounded bg-blue-100 text-blue-700 font-semibold">{msg.role || 'STUDENT'}</span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-300">{msg.message}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteChatMessage(msg.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendModeratorChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Post as Instructor / Moderator..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Module: Q&A Manager */}
          {activeTab === 'qna' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                  Student Q&A Manager (Real-Time)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Answer student doubts and broadcast verified answers to the room.
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {socketQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No questions submitted by students yet.</p>
                ) : (
                  socketQuestions.map((q) => (
                    <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">{q.question}</span>
                          <span className="text-[10px] text-slate-400">Asked by {q.studentName || 'Student'}</span>
                        </div>
                      </div>

                      {q.status === 'ANSWERED' ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                          <strong className="block text-[11px]">Answered by {q.answeredBy || 'Instructor'}:</strong>
                          <p>{q.answer}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={replyInput[q.id] || ''}
                            onChange={(e) => setReplyInput({ ...replyInput, [q.id]: e.target.value })}
                            placeholder="Type verified answer..."
                            className="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs"
                          />
                          <button
                            onClick={() => handleAnswerQuestion(q.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                          >
                            Answer
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Module: Interactive Quizzes */}
          {activeTab === 'quiz' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                  Launch Interactive Live Quiz
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Broadcast real-time checkpoint questions to measure student retention.
                </p>
              </div>

              <form onSubmit={handleCreateQuiz} className="space-y-3">
                <input
                  type="text"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  placeholder="e.g. What hook is used for side effects in React?"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-hidden"
                />

                <div className="grid grid-cols-2 gap-2">
                  {quizOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...quizOptions];
                        updated[idx] = e.target.value;
                        setQuizOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={quizCorrectAnswer}
                    onChange={(e) => setQuizCorrectAnswer(e.target.value)}
                    className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="">Select Correct Answer</option>
                    {quizOptions.filter(Boolean).map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={quizTimer}
                    onChange={(e) => setQuizTimer(Number(e.target.value))}
                    className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                  >
                    <option value={15}>15 Seconds Timer</option>
                    <option value={30}>30 Seconds Timer</option>
                    <option value={60}>60 Seconds Timer</option>
                  </select>

                  <select
                    value={quizPoints}
                    onChange={(e) => setQuizPoints(Number(e.target.value))}
                    className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                  >
                    <option value={10}>10 XP Points</option>
                    <option value={20}>20 XP Points</option>
                    <option value={50}>50 XP Points</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Publish Quiz to Live Room</span>
                </button>
              </form>

              {/* Published Quizzes List */}
              {quizzes.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active & Published Quizzes ({quizzes.length})
                  </span>
                  {quizzes.map((qz, idx) => (
                    <div key={qz.id || idx} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-zinc-100">
                        <span>{qz.question}</span>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">{qz.points || 10} XP</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Correct Answer: {qz.correctAnswer}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal Dialogs */}
      {actionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  actionModal === 'start'
                    ? 'bg-rose-100 text-rose-600'
                    : actionModal === 'end'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-zinc-100 capitalize">
                  {actionModal} Live Class?
                </h3>
                <p className="text-xs text-slate-500">{liveClass?.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              {actionModal === 'start'
                ? 'Are you sure you want to start this live stream? The session will become visible as LIVE to all enrolled students.'
                : actionModal === 'end'
                ? 'Are you sure you want to end this live class? Students will see the session ended state and attendance will be closed.'
                : 'Are you sure you want to cancel this scheduled live class?'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                disabled={actionSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusAction}
                disabled={actionSubmitting}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                  actionModal === 'cancel'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : actionModal === 'end'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionSubmitting ? 'Processing...' : `Confirm ${actionModal.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveControlCenter;

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
  BarChart2,
  ShieldCheck,
  Lock,
  Unlock,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Smile,
  FileText,
  Terminal,
  Bot,
  Settings2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { useLiveClassSocket } from '@/hooks/useLiveClassSocket';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/liveClass/YouTubePlayer';
import type { ClassroomInteractionSettings } from '@/types/liveClassroomSettings';
import { toast } from 'sonner';

export const AdminLiveControlCenter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'announcements' | 'students' | 'chat' | 'qna' | 'quiz' | 'polls' | 'hands'>('overview');

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
    activePoll,
    activeQuiz,
    quizResult,
    classroomSettings,
    sendChat,
    deleteChat,
    answerQuestion,
    acknowledgeHand,
    sendAnnouncement,
    createPoll,
    endPoll,
    startQuiz,
    endQuiz,
    updateClassStatus,
    updateSettings,
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

  // Live Polls State
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '', '', '']);
  const [pollDuration, setPollDuration] = useState<number>(60);
  const [launchingPoll, setLaunchingPoll] = useState<boolean>(false);

  // Quiz Studio State
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizQuestion, setQuizQuestion] = useState<string>('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState<string>('');
  const [quizTimer, setQuizTimer] = useState<number>(30);
  const [quizPoints, setQuizPoints] = useState<number>(10);

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

  // Live Poll Handlers
  const handleLaunchPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || validOptions.length < 2) {
      toast.error('Please enter a poll question and at least 2 options.');
      return;
    }

    setLaunchingPoll(true);
    try {
      await createPoll(pollQuestion.trim(), validOptions, pollDuration);
      setPollQuestion('');
      setPollOptions(['', '', '', '']);
      toast.success('📊 Live Poll broadcasted to all students in real time!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to broadcast poll.');
    } finally {
      setLaunchingPoll(false);
    }
  };

  const handleEndActivePoll = async () => {
    if (!activePoll) return;
    try {
      await endPoll(activePoll.id);
      toast.info('Poll concluded and final results broadcasted.');
    } catch (e) {
      toast.error('Failed to end poll.');
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
                <span>Students Joined: <strong className="text-white">{participants.length || (onlineCount > 0 ? onlineCount : 0)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Active Online: <strong className="text-emerald-400">{onlineCount}</strong></span>
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
        {/* Left Column: Media & Live Classroom Controls */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {/* Interactive Classroom Direct Access Card */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-800/40 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    {liveClass?.mode === 'interactive' ? 'Kaizen Q Interactive Classroom' : 'Real-time Live Classroom'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time audio/video, interactive whiteboard, live chat, Q&A, and attendance.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                {liveClass?.mode === 'youtube' ? 'YouTube Mode' : 'Interactive Mode'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {isEnded ? (
                <button
                  type="button"
                  onClick={() => navigate(`/live-classroom/room/${classId}`)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>View Post-Class Attendance & Analytics</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/live-classroom/room/${classId}`)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Enter Live Classroom</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(`/student/live-class/${classId}`)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>
            </div>
          </div>

          {/* YouTube Preview Card (shown if YouTube mode or video ID present) */}
          {(liveClass?.youtubeVideoId || liveClass?.mode === 'youtube') && (
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
          )}
        </div>

        {/* Right Column: Interactive Management Modules */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          {/* Navigation Tabs for Modules */}
          <div className="flex items-center bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto scrollbar-none">
            {[
              { key: 'controls', label: 'Controls (18)', icon: ShieldCheck },
              { key: 'announcements', label: 'Announce', icon: Sparkles },
              { key: 'students', label: `Students (${participants.length || onlineCount})`, icon: Users },
              { key: 'hands', label: `Hands (${raisedHands.length})`, icon: Hand },
              { key: 'chat', label: 'Chat', icon: MessageSquare },
              { key: 'qna', label: `Q&A (${socketQuestions.length})`, icon: HelpCircle },
              { key: 'polls', label: activePoll ? 'Poll (Live)' : 'Polls', icon: BarChart2 },
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

          {/* Module: Granular Interaction Controls (18 Features) */}
          {activeTab === 'controls' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Interaction Permissions & Command Switchboard
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Live changes propagate to all students via Socket.IO instantaneously.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Realtime Sync</span>
                </div>
              </div>

              {/* Group 1: Communication & Messaging */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  1. Communication & Discussion
                </span>
                <div className="space-y-2">
                  {/* Chat */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.chat.enabled ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Live Chat Stream</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Allows students to post questions and replies in main room</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ chat: { ...classroomSettings.chat, enabled: !classroomSettings.chat.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.chat.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.chat.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Q&A */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.qa.enabled ? 'bg-amber-600/10 text-amber-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Structured Q&A Board</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Formal query queue with upvoting and instructor answers</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ qa: { ...classroomSettings.qa, enabled: !classroomSettings.qa.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.qa.enabled ? 'bg-amber-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.qa.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Student Questions */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.studentQuestions?.enabled ? 'bg-indigo-600/10 text-indigo-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Student Direct Questions</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Allows students to post new questions directly to instructor</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ studentQuestions: { enabled: !classroomSettings.studentQuestions?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.studentQuestions?.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.studentQuestions?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Private Questions */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.privateQuestions?.enabled ? 'bg-purple-600/10 text-purple-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Private Instructor DMs</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Private questions visible only to instructor/co-host</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ privateQuestions: { enabled: !classroomSettings.privateQuestions?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.privateQuestions?.enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.privateQuestions?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 2: Engagement & Interaction */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  2. Engagement & Interactive Activities
                </span>
                <div className="space-y-2">
                  {/* Live Polls */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.polls.enabled ? 'bg-emerald-600/10 text-emerald-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <BarChart2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Live Polls & Voting</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Real-time instant polling and vote tallying</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ polls: { enabled: !classroomSettings.polls.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.polls.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.polls.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Live Quiz */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.quiz.enabled ? 'bg-rose-600/10 text-rose-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Live Quiz Studio</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Timed knowledge checks with real-time scoring</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ quiz: { enabled: !classroomSettings.quiz.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.quiz.enabled ? 'bg-rose-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.quiz.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Raise Hand */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.raiseHand.enabled ? 'bg-amber-600/10 text-amber-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Hand className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Raise Hand Queue</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Students can raise hand for acknowledgment</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ raiseHand: { enabled: !classroomSettings.raiseHand.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.raiseHand.enabled ? 'bg-amber-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.raiseHand.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Reactions */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.reactions?.enabled ? 'bg-pink-600/10 text-pink-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Smile className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Floating Live Reactions</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Heart, clap, thumbs-up floating animations</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ reactions: { enabled: !classroomSettings.reactions?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.reactions?.enabled ? 'bg-pink-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.reactions?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Peer Interaction */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.peerInteraction?.enabled ? 'bg-teal-600/10 text-teal-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Peer-to-Peer Interaction</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Student direct replies and collaborative interaction</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ peerInteraction: { enabled: !classroomSettings.peerInteraction?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.peerInteraction?.enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.peerInteraction?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 3: Workspace & Learning Tools */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  3. Learning Tools & Practice Environments
                </span>
                <div className="space-y-2">
                  {/* Screen Interaction / Whiteboard */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.screenInteraction?.enabled ? 'bg-cyan-600/10 text-cyan-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Interactive Screen & Whiteboard</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Allows collaborative drawing and whiteboard access</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ screenInteraction: { enabled: !classroomSettings.screenInteraction?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.screenInteraction?.enabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.screenInteraction?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.notes?.enabled ? 'bg-amber-600/10 text-amber-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Personal Scratchpad Notes</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">In-classroom lecture note taking and saving</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ notes: { enabled: !classroomSettings.notes?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.notes?.enabled ? 'bg-amber-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.notes?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Resource Sharing */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.resourceSharing?.enabled ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Live Handouts & Lab Resources</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Downloadable PDFs, lab code, slides during session</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ resourceSharing: { enabled: !classroomSettings.resourceSharing?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.resourceSharing?.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.resourceSharing?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Code Sandbox */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.codePractice?.enabled ? 'bg-emerald-600/10 text-emerald-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">In-Browser Code Sandbox</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Embedded coding sandbox for hands-on exercises</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ codePractice: { enabled: !classroomSettings.codePractice?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.codePractice?.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.codePractice?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* AI Tutor */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.aiTutor?.enabled ? 'bg-violet-600/10 text-violet-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">AI Lecture Companion (Shaivika AI)</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">On-demand AI clarification without interrupting instructor</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ aiTutor: { enabled: !classroomSettings.aiTutor?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.aiTutor?.enabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.aiTutor?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Attendance */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.attendance?.enabled ? 'bg-teal-600/10 text-teal-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Automated Attendance Logging</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Records student join duration and active presence</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ attendance: { enabled: !classroomSettings.attendance?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.attendance?.enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.attendance?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 4: Student AV Devices & Classroom Security */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">
                  4. Audio/Video Media & Room Security (High Moderation)
                </span>
                <div className="space-y-2">
                  {/* Student Mic */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.studentMic?.enabled ? 'bg-emerald-600/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                        {classroomSettings.studentMic?.enabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Student Audio Microphone</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Allows students to un-mute their microphone to speak</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ studentMic: { enabled: !classroomSettings.studentMic?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.studentMic?.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.studentMic?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Student Camera */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.studentCamera?.enabled ? 'bg-emerald-600/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                        {classroomSettings.studentCamera?.enabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Student Video Camera</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Allows students to transmit webcam video stream</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ studentCamera: { enabled: !classroomSettings.studentCamera?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.studentCamera?.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.studentCamera?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Student Screen Share */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.studentScreenShare?.enabled ? 'bg-emerald-600/10 text-emerald-600' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Student Screen Sharing</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Allows students to present their screen to class</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ studentScreenShare: { enabled: !classroomSettings.studentScreenShare?.enabled } })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.studentScreenShare?.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.studentScreenShare?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Private Classroom Entry Lock */}
                  <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${classroomSettings.isLocked ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                        {classroomSettings.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">Private Classroom Entry Lock</span>
                        <span className="text-[10px] text-rose-700/80 dark:text-rose-300/80">Blocks new students from entering room while session is private</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ isLocked: !classroomSettings.isLocked })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        classroomSettings.isLocked ? 'bg-rose-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        classroomSettings.isLocked ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <Users className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                    <p className="text-xs font-semibold">No students currently in room</p>
                    <p className="text-[11px] text-slate-500">When students join from mobile or laptop, their live name & role will appear here automatically.</p>
                  </div>
                ) : (
                  participants.map((std, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs">
                          {(std.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">{std.name || 'Student'}</span>
                          <span className="text-[10px] text-slate-400">{std.userId}</span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
                  placeholder="Type an instructor message..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
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
                  Live Q&A Inquiries ({socketQuestions.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Student submitted questions requiring instructor verification.
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {socketQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No questions asked yet.</p>
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

          {/* Module: Live Polls */}
          {activeTab === 'polls' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    Live Polls & Audience Pulse
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Run quick voting rounds to gauge comprehension and student consensus.
                  </p>
                </div>
                {activePoll && activePoll.status === 'ACTIVE' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    LIVE POLL
                  </span>
                )}
              </div>

              {activePoll ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">
                      {activePoll.question}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {activePoll.totalVotes || 0} Votes
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activePoll.options.map((opt) => {
                      const total = activePoll.totalVotes || 0;
                      const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                      return (
                        <div key={opt.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-zinc-300">
                            <span>{opt.text}</span>
                            <span className="font-mono text-[11px] font-bold">{pct}% ({opt.votes})</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activePoll.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={handleEndActivePoll}
                      className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                    >
                      End Poll & Close Voting
                    </button>
                  )}
                </div>
              ) : null}

              {/* Poll Creator Form */}
              <form onSubmit={handleLaunchPoll} className="space-y-3 pt-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Create New Live Poll
                </span>

                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Is the virtual memory concept clear so far?"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pollDuration}
                    onChange={(e) => setPollDuration(Number(e.target.value))}
                    className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                  >
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={120}>2 Minutes</option>
                  </select>

                  <button
                    type="submit"
                    disabled={launchingPoll}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>{launchingPoll ? 'Launching...' : 'Broadcast Live Poll'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Module: Interactive Quizzes */}
          {activeTab === 'quiz' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    Live Quiz Studio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Broadcast checkpoint questions and review real-time response accuracy.
                  </p>
                </div>
                {activeQuiz && activeQuiz.status === 'ACTIVE' && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    QUIZ RUNNING
                  </span>
                )}
              </div>

              {/* Active Running Quiz Card */}
              {activeQuiz && (
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-purple-800 dark:text-purple-300">
                      {activeQuiz.question}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-mono">
                      {activeQuiz.marks} XP &bull; {activeQuiz.timerSeconds}s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {activeQuiz.options.map((opt, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-purple-200/50 dark:border-purple-900/50 text-slate-800 dark:text-zinc-200">
                        {opt}
                      </div>
                    ))}
                  </div>

                  {activeQuiz.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await endQuiz(activeQuiz.id);
                          toast.info('Quiz completed and final correct answers revealed.');
                        } catch (e) {
                          toast.error('Failed to conclude quiz.');
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                    >
                      End Quiz & Reveal Correct Answer
                    </button>
                  ) : quizResult ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                      <span className="font-bold block">✓ Correct Answer: {quizResult.correctAnswer}</span>
                      <span>Total Submissions: {quizResult.totalSubmissions} ({quizResult.accuracyPercentage}% Accuracy)</span>
                    </div>
                  ) : null}
                </div>
              )}

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

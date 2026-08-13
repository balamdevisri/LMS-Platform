import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Play,
  StopCircle,
  Users,
  X,
  FileSpreadsheet,
  VolumeX,
  Volume2,
  FileText,
  Upload,
  Radio,
  ExternalLink,
  HelpCircle,
  BarChart3,
  Sparkles,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, normalizeLiveClassStatus, type LiveClass, type AttendanceRecord } from '@/services/liveClassService';

interface LivePollItem {
  id: string;
  classId: string;
  question: string;
  options: { text: string; votes: number }[];
  active: boolean;
  createdAt: string;
}

interface LiveQuizItem {
  id: string;
  classId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  timerSeconds: number;
  points: number;
  active: boolean;
  totalSubmissions: number;
  createdAt: string;
}

export const LiveClassroomDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');

  // Modal & Drawer States
  const [uploadNotesModal, setUploadNotesModal] = useState<LiveClass | null>(null);
  const [uploadRecordingModal, setUploadRecordingModal] = useState<LiveClass | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<LiveClass | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Quizzes & Polls Drawer State
  const [quizPollClass, setQuizPollClass] = useState<LiveClass | null>(null);
  const [activeManagerTab, setActiveManagerTab] = useState<'polls' | 'quizzes'>('polls');

  // Form Inputs
  const [notesUrl, setNotesUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');

  // Poll Form State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollsList, setPollsList] = useState<LivePollItem[]>([]);

  // Quiz Form State
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState('');
  const [quizTimer, setQuizTimer] = useState(30);
  const [quizPoints, setQuizPoints] = useState(10);
  const [quizzesList, setQuizzesList] = useState<LiveQuizItem[]>([]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = liveClassService.subscribeLiveClasses((data) => {
      if (userProfile?.role === 'instructor') {
        const instName = (userProfile.name || userProfile.fullName || '').toLowerCase();
        const assigned = data.filter(
          (c) => c.instructorId === userProfile.uid || (instName && (c.instructorName || '').toLowerCase().includes(instName))
        );
        setClasses(assigned);
      } else {
        setClasses(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  // Load Polls & Quizzes when quizPollClass changes
  useEffect(() => {
    if (!quizPollClass) return;

    try {
      const savedPollsKey = `kaizenq_polls_${quizPollClass.id}`;
      const savedPollsStr = localStorage.getItem(savedPollsKey);
      if (savedPollsStr) {
        setPollsList(JSON.parse(savedPollsStr));
      } else {
        const defaultPolls: LivePollItem[] = [
          {
            id: `poll_sample_${Date.now()}`,
            classId: quizPollClass.id,
            question: 'How clear is the current concept breakdown?',
            options: [
              { text: 'Crystal clear! Ready for coding', votes: 14 },
              { text: 'Makes sense, need 1 recap', votes: 6 },
              { text: 'Please explain again', votes: 2 },
            ],
            active: true,
            createdAt: new Date().toISOString(),
          },
        ];
        setPollsList(defaultPolls);
        localStorage.setItem(savedPollsKey, JSON.stringify(defaultPolls));
      }

      const savedQuizzesKey = `kaizenq_quizzes_${quizPollClass.id}`;
      const savedQuizzesStr = localStorage.getItem(savedQuizzesKey);
      if (savedQuizzesStr) {
        setQuizzesList(JSON.parse(savedQuizzesStr));
      } else {
        const defaultQuizzes: LiveQuizItem[] = [
          {
            id: `quiz_sample_${Date.now()}`,
            classId: quizPollClass.id,
            question: 'Which kernel data structure manages virtual memory areas?',
            options: ['vm_area_struct', 'task_struct', 'page_frame', 'mm_struct'],
            correctAnswer: 'vm_area_struct',
            timerSeconds: 30,
            points: 10,
            active: true,
            totalSubmissions: 18,
            createdAt: new Date().toISOString(),
          },
        ];
        setQuizzesList(defaultQuizzes);
        localStorage.setItem(savedQuizzesKey, JSON.stringify(defaultQuizzes));
      }
    } catch (e) {
      console.warn('Failed to load session polls and quizzes:', e);
    }
  }, [quizPollClass]);

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const filteredClasses = useMemo(() => {
    const now = new Date();
    if (filter === 'today') return classes.filter((c) => isToday(c.startTime) || normalizeLiveClassStatus(c.status) === 'live');
    if (filter === 'upcoming') return classes.filter((c) => new Date(c.startTime) > now && normalizeLiveClassStatus(c.status) !== 'completed');
    if (filter === 'completed') return classes.filter((c) => normalizeLiveClassStatus(c.status) === 'completed');
    return classes;
  }, [classes, filter]);

  const todayCount = useMemo(() => classes.filter((c) => isToday(c.startTime) || normalizeLiveClassStatus(c.status) === 'live').length, [classes]);
  const upcomingCount = useMemo(() => classes.filter((c) => new Date(c.startTime) > new Date() && normalizeLiveClassStatus(c.status) !== 'completed').length, [classes]);
  const completedCount = useMemo(() => classes.filter((c) => normalizeLiveClassStatus(c.status) === 'completed').length, [classes]);

  const handleStartClass = async (id: string) => {
    try {
      await liveClassService.startLiveClass(id, userProfile?.uid);
      toast.success('🔴 Class status updated to LIVE! Opening Live Classroom...');
      navigate(`/live-classroom/room/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start live class');
    }
  };

  const handleEndClass = async (id: string) => {
    try {
      await liveClassService.endLiveClass(id, userProfile?.uid, userProfile?.role);
      toast.info('Session ended and status updated to Completed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to end live class');
    }
  };

  const handleDeleteClass = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the live class "${title}"?`)) return;
    try {
      await liveClassService.deleteLiveClass(id);
      toast.success(`Removed live class "${title}".`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove live class.');
    }
  };

  const handleSaveNotes = async () => {
    if (!uploadNotesModal || !notesUrl.trim()) return;
    await liveClassService.updateLiveClass(uploadNotesModal.id, { notesUrl: notesUrl.trim() });
    toast.success(`Lecture notes URL updated for "${uploadNotesModal.title}"!`);
    setUploadNotesModal(null);
    setNotesUrl('');
  };

  const handleSaveRecording = async () => {
    if (!uploadRecordingModal || !recordingUrl.trim()) return;
    await liveClassService.updateLiveClass(uploadRecordingModal.id, { recordingUrl: recordingUrl.trim() });
    toast.success(`Class recording URL attached for "${uploadRecordingModal.title}"!`);
    setUploadRecordingModal(null);
    setRecordingUrl('');
  };

  const handleToggleMuteChat = async (c: LiveClass) => {
    const newMuted = !c.isChatMuted;
    await liveClassService.updateLiveClass(c.id, { isChatMuted: newMuted });
    toast.info(newMuted ? `Chat muted for session "${c.title}"` : `Chat unmuted for session "${c.title}"`);
  };

  const handleOpenAttendance = (c: LiveClass) => {
    setAttendanceClass(c);
    const records = liveClassService.getAttendanceRecords(c.id);
    setAttendanceRecords(records);
  };

  const handleExportAttendance = (c: LiveClass) => {
    const success = liveClassService.exportAttendanceCSV(c.id, c.title);
    if (success) {
      toast.success(`Exported attendance log for "${c.title}"!`);
    } else {
      toast.info('No attendance records logged for this session yet.');
    }
  };

  // Poll Handlers
  const handleCreatePoll = () => {
    if (!quizPollClass || !pollQuestion.trim() || pollOptions.some((o) => !o.trim())) {
      toast.error('Please enter question and all poll options.');
      return;
    }
    const newPoll: LivePollItem = {
      id: `poll_${Date.now()}`,
      classId: quizPollClass.id,
      question: pollQuestion.trim(),
      options: pollOptions.map((opt) => ({ text: opt.trim(), votes: 0 })),
      active: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPoll, ...pollsList];
    setPollsList(updated);
    localStorage.setItem(`kaizenq_polls_${quizPollClass.id}`, JSON.stringify(updated));
    setPollQuestion('');
    setPollOptions(['', '']);
    toast.success('📊 Live Poll created & broadcasted to students!');
  };

  const handleTogglePollActive = (pollId: string) => {
    if (!quizPollClass) return;
    const updated = pollsList.map((p) => (p.id === pollId ? { ...p, active: !p.active } : p));
    setPollsList(updated);
    localStorage.setItem(`kaizenq_polls_${quizPollClass.id}`, JSON.stringify(updated));
    toast.info('Poll active state updated.');
  };

  const handleDeletePoll = (pollId: string) => {
    if (!quizPollClass) return;
    const updated = pollsList.filter((p) => p.id !== pollId);
    setPollsList(updated);
    localStorage.setItem(`kaizenq_polls_${quizPollClass.id}`, JSON.stringify(updated));
    toast.info('Poll deleted.');
  };

  // Quiz Handlers
  const handleCreateQuiz = () => {
    if (!quizPollClass || !quizQuestion.trim() || quizOptions.some((o) => !o.trim()) || !quizCorrectAnswer.trim()) {
      toast.error('Please complete quiz question, options, and select correct answer.');
      return;
    }
    const newQuiz: LiveQuizItem = {
      id: `quiz_${Date.now()}`,
      classId: quizPollClass.id,
      question: quizQuestion.trim(),
      options: quizOptions.map((o) => o.trim()),
      correctAnswer: quizCorrectAnswer.trim(),
      timerSeconds: quizTimer,
      points: quizPoints,
      active: true,
      totalSubmissions: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newQuiz, ...quizzesList];
    setQuizzesList(updated);
    localStorage.setItem(`kaizenq_quizzes_${quizPollClass.id}`, JSON.stringify(updated));
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectAnswer('');
    toast.success('⚡ Interactive Quiz published to Live Room!');
  };

  const handleToggleQuizActive = (quizId: string) => {
    if (!quizPollClass) return;
    const updated = quizzesList.map((q) => (q.id === quizId ? { ...q, active: !q.active } : q));
    setQuizzesList(updated);
    localStorage.setItem(`kaizenq_quizzes_${quizPollClass.id}`, JSON.stringify(updated));
    toast.info('Quiz active state updated.');
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (!quizPollClass) return;
    const updated = quizzesList.filter((q) => q.id !== quizId);
    setQuizzesList(updated);
    localStorage.setItem(`kaizenq_quizzes_${quizPollClass.id}`, JSON.stringify(updated));
    toast.info('Quiz deleted.');
  };

  return (
    <div className="space-y-6 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>INSTRUCTOR LIVE CLASSROOM STUDIO</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DATA</span>
            </div>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Instructor Live Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Launch live sessions, manage real-time interactive quizzes & polls, mute chat, and upload lecture recordings.
          </p>
        </div>
        {userProfile?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/live-control-panel')}
            className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center gap-2 font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admin Live Control Panel</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilter('today')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'today' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'}`}>Today's Classes ({todayCount})</button>
          <button onClick={() => setFilter('upcoming')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'upcoming' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'}`}>Upcoming Classes ({upcomingCount})</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'completed' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'}`}>Completed Classes ({completedCount})</button>
          <button onClick={() => setFilter('all')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'}`}>All Assigned ({classes.length})</button>
        </div>
      </div>

      {/* Class List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-xs animate-pulse">Loading assigned live classroom sessions...</div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-sky-200 shadow-xs">
          <Video className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-extrabold text-base text-slate-700">No Live Sessions Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => {
            const isLiveNow = c.status === 'Live';
            return (
              <div key={c.id} className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${isLiveNow ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-sky-200/80 hover:border-blue-400'}`}>
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img src={c.banner || c.thumbnail || 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80'} alt={c.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-bold border border-slate-700">{c.meetingProvider.toUpperCase()}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${c.status === 'Live' ? 'bg-rose-600 text-white animate-pulse' : c.status === 'Scheduled' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                      {c.status === 'Live' ? '🔴 LIVE NOW' : c.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">{c.courseName}</p>
                    <h3 className="font-heading font-extrabold text-sm text-white truncate">{c.title}</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{c.description}</p>
                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 text-xs text-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Date: {new Date(c.startTime).toLocaleDateString()}</span>
                        <span className="font-mono">{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                    {c.notesUrl && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">📄 Notes Attached</span>}
                    {c.recordingUrl && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">🎥 Recording Available</span>}
                    {c.isChatMuted && <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">🔇 Chat Muted</span>}
                  </div>
                  <div className={['space-y-2 pt-3 border-t border-slate-100', 'dark:border-zinc-800'].join(' ')}>
                    {userProfile?.role === 'admin' || userProfile?.role === 'instructor' ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          {isLiveNow ? (
                            <button onClick={() => handleEndClass(c.id)} className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                              <StopCircle className="w-4 h-4" /><span>End Session</span>
                            </button>
                          ) : (
                            <button onClick={() => handleStartClass(c.id)} className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                              <Play className="w-4 h-4" /><span>Start Live</span>
                            </button>
                          )}
                          <button onClick={() => navigate(`/live-classroom/room/${c.id}`)} className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md">
                            <ExternalLink className="w-4 h-4" /><span>Launch Room</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          <button onClick={() => setQuizPollClass(c)} className={['p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer', 'dark:bg-amber-900/20 dark:text-amber-300'].join(' ')} title="Quizzes & Polls Manager">
                            <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                            <span className="truncate w-full text-center">Quizzes/Polls</span>
                          </button>
                          <button onClick={() => handleOpenAttendance(c)} className={['p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer', 'dark:bg-emerald-900/20 dark:text-emerald-300'].join(' ')} title="Attendance Log Roster">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /><span>Attendance</span>
                          </button>
                          <button onClick={() => setUploadNotesModal(c)} className={['p-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 border border-slate-200 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer', 'dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'].join(' ')} title="Upload Notes">
                            <FileText className="w-3.5 h-3.5 text-blue-600" /><span>Notes</span>
                          </button>
                          <button onClick={() => setUploadRecordingModal(c)} className={['p-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 border border-slate-200 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer', 'dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'].join(' ')} title="Attach Recording">
                            <Upload className="w-3.5 h-3.5 text-purple-600" /><span>Recording</span>
                          </button>
                          <button onClick={() => handleToggleMuteChat(c)} className={`p-1.5 rounded-xl border text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer ${c.isChatMuted ? 'bg-rose-50 border-rose-200 text-rose-700' : ['bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700', 'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'].join(' ')}`} title={c.isChatMuted ? 'Unmute Chat' : 'Mute Chat'}>
                            {c.isChatMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{c.isChatMuted ? 'Unmute' : 'Mute Chat'}</span>
                          </button>
                          <button onClick={() => handleDeleteClass(c.id, c.title)} className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900" title="Delete Session">
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" /><span>Delete</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => navigate(`/live-classroom/room/${c.id}`)} className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${isLiveNow ? 'bg-rose-600 hover:bg-rose-700 text-white animate-bounce shadow-rose-600/30' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}>
                        <Play className="w-4 h-4 fill-current" /><span>{isLiveNow ? '🔴 JOIN LIVE ROOM NOW' : 'ENTER CLASSROOM'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUIZZES & POLLS MANAGER DRAWER */}
      {quizPollClass && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white max-w-xl w-full h-full p-6 shadow-2xl overflow-y-auto space-y-6 font-['Sora'] border-l border-sky-100 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Quizzes & Polls Studio</h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{quizPollClass.title}</p>
                </div>
              </div>
              <button onClick={() => setQuizPollClass(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
              <button onClick={() => setActiveManagerTab('polls')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeManagerTab === 'polls' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <BarChart3 className="w-4 h-4" /><span>Live Polls ({pollsList.length})</span>
              </button>
              <button onClick={() => setActiveManagerTab('quizzes')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeManagerTab === 'quizzes' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <HelpCircle className="w-4 h-4" /><span>Interactive Quizzes ({quizzesList.length})</span>
              </button>
            </div>
            {activeManagerTab === 'polls' && (
              <div className="space-y-6">
                <div className="bg-sky-50/50 border border-sky-200 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-sky-600" /> Create New Live Poll</span>
                    <span className="text-[10px] text-sky-600 font-bold">Broadcasts instantly</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Poll Question</label>
                      <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="e.g. How confident are you with kernel memory allocation?" className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-700 block">Poll Options</label>
                      {pollOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="text" value={opt} onChange={(e) => { const updated = [...pollOptions]; updated[idx] = e.target.value; setPollOptions(updated); }} placeholder={`Option ${idx + 1}`} className="flex-1 bg-white border border-sky-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-hidden" />
                          {pollOptions.length > 2 && <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="w-3.5 h-3.5" /></button>}
                        </div>
                      ))}
                      {pollOptions.length < 5 && <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer pt-1"><Plus className="w-3.5 h-3.5" /><span>Add Option</span></button>}
                    </div>
                    <button onClick={handleCreatePoll} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"><Send className="w-3.5 h-3.5" /><span>Publish Poll to Live Room</span></button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Active & Scheduled Polls</h4>
                  {pollsList.length === 0 ? <p className="text-xs text-slate-400 italic">No polls created for this session yet.</p> : pollsList.map((p) => {
                    const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0);
                    return (
                      <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900">{p.question}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{totalVotes} Total Votes</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleTogglePollActive(p.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{p.active ? 'ACTIVE' : 'INACTIVE'}</button>
                            <button onClick={() => handleDeletePoll(p.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {p.options.map((opt, idx) => {
                            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            return (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between text-[11px]"><span className="text-slate-700 font-medium">{opt.text}</span><span className="font-bold text-slate-900">{pct}% ({opt.votes})</span></div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} /></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeManagerTab === 'quizzes' && (
              <div className="space-y-6">
                <div className="bg-purple-50/50 border border-purple-200 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-purple-600" /> Create Interactive Quiz</span>
                    <span className="text-[10px] text-purple-600 font-bold">MCQ / Speed Challenge</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Quiz Question</label>
                      <textarea rows={2} value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} placeholder="e.g. What is the return value of copy_to_user() on success?" className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Timer (Seconds)</label>
                        <select value={quizTimer} onChange={(e) => setQuizTimer(Number(e.target.value))} className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-hidden">
                          <option value={15}>15 Seconds</option><option value={30}>30 Seconds</option><option value={60}>60 Seconds</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Points / XP</label>
                        <input type="number" value={quizPoints} onChange={(e) => setQuizPoints(Number(e.target.value))} className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-hidden" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-700 block">MCQ Options</label>
                      {quizOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="text" value={opt} onChange={(e) => { const updated = [...quizOptions]; updated[idx] = e.target.value; setQuizOptions(updated); if (quizCorrectAnswer === opt) setQuizCorrectAnswer(e.target.value); }} placeholder={`Option ${idx + 1}`} className="flex-1 bg-white border border-purple-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-hidden" />
                          <button onClick={() => setQuizCorrectAnswer(opt)} className={`p-2 rounded-lg text-[10px] font-bold cursor-pointer ${quizCorrectAnswer === opt && opt.trim() ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} title="Set as Correct Answer">Correct</button>
                        </div>
                      ))}
                    </div>
                    {quizCorrectAnswer && <p className="text-[11px] text-emerald-700 font-bold">Correct Answer Set: "{quizCorrectAnswer}"</p>}
                    <button onClick={handleCreateQuiz} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"><Sparkles className="w-3.5 h-3.5" /><span>Launch Quiz to Students</span></button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Session Quiz Bank</h4>
                  {quizzesList.length === 0 ? <p className="text-xs text-slate-400 italic">No quizzes published for this session yet.</p> : quizzesList.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{q.question}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-purple-600" /> {q.timerSeconds}s</span>
                            <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" /> {q.points} XP</span>
                            <span>{q.totalSubmissions} Submissions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleToggleQuizActive(q.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${q.active ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'}`}>{q.active ? 'ACTIVE' : 'INACTIVE'}</button>
                          <button onClick={() => handleDeleteQuiz(q.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, idx) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <div key={idx} className={`p-2 rounded-xl border text-[11px] font-medium flex items-center justify-between ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}>
                              <span className="truncate">{opt}</span>
                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD NOTES MODAL */}
      {uploadNotesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] border border-sky-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900">Attach Lecture Notes / PDF</h3>
              <button onClick={() => setUploadNotesModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">Attaching lecture notes for <strong>{uploadNotesModal.title}</strong>.</p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes Document URL (PDF / Drive / Link)</label>
                <input type="url" value={notesUrl} onChange={(e) => setNotesUrl(e.target.value)} placeholder="https://kaizenq.lms/notes/lecture-notes.pdf" className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setUploadNotesModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">Cancel</button>
              <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">Attach Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD RECORDING MODAL */}
      {uploadRecordingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] border border-sky-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900">Upload Session Recording URL</h3>
              <button onClick={() => setUploadRecordingModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">Attaching video stream recording for <strong>{uploadRecordingModal.title}</strong>.</p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recording Video URL (MP4 / Stream / Jitsi)</label>
                <input type="url" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} placeholder="https://meet.jit.si/recordings/session-video.mp4" className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setUploadRecordingModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">Cancel</button>
              <button onClick={handleSaveRecording} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">Save Recording</button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE DRAWER */}
      {attendanceClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white max-w-xl w-full h-full p-6 shadow-2xl overflow-y-auto space-y-5 font-['Sora'] border-l border-sky-100 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Attendance Log Roster</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{attendanceClass.title}</p>
                </div>
              </div>
              <button onClick={() => setAttendanceClass(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{attendanceRecords.length} Student Records Logged</span>
              <button onClick={() => handleExportAttendance(attendanceClass)} className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5" /><span>Export CSV</span>
              </button>
            </div>
            {attendanceRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-1"><Users className="w-8 h-8 mx-auto text-slate-300" /><p>No active attendance logged for this session yet.</p></div>
            ) : (
              <div className="space-y-2">
                {attendanceRecords.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-medium">
                    <div>
                      <p className="font-bold text-slate-900">{r.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.studentEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">{r.status}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.durationMinutes} mins active</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveClassroomDashboard;

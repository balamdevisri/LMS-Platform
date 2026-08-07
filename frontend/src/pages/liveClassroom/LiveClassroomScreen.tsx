import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Socket } from 'socket.io-client';
import { getLiveClassroomSocket } from '@/services/socket';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass, type AttendanceRecord } from '@/services/liveClassService';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Radio,
  Users,
  Clock,
  Wifi,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Trophy,
  Sparkles,
  LogOut,
  Lock,
  Unlock,
  Hand,
  Monitor,
  FileText,
  Upload,
  Pencil,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Import Widgets & Whiteboard
import { LiveChatWidget } from '@/components/liveClassroom/LiveChatWidget';
import { LivePollWidget } from '@/components/liveClassroom/LivePollWidget';
import { LiveQuizWidget } from '@/components/liveClassroom/LiveQuizWidget';
import { LeaderboardWidget } from '@/components/liveClassroom/LeaderboardWidget';
import { AIInsightsWidget } from '@/components/liveClassroom/AIInsightsWidget';
import { InteractiveWhiteboard } from '@/components/liveClassroom/InteractiveWhiteboard';
import { JitsiMeetingComponent } from '@/components/liveClassroom/JitsiMeetingComponent';

export const LiveClassroomScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveClassData, setLiveClassData] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);

  // Classroom Hardware & Feature States
  const [onlineCount, setOnlineCount] = useState(1);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Raised hands queue for mentor
  const [raisedHands, setRaisedHands] = useState<{ userId: string; userName: string; timestamp: Date }[]>([]);

  // Modals & Sidebars
  const [activeTab, setActiveTab] = useState<'chat' | 'poll' | 'quiz' | 'leaderboard' | 'ai'>('chat');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Form Inputs for Instructor Controls
  const [notesUrlInput, setNotesUrlInput] = useState('');
  const [recordingUrlInput, setRecordingUrlInput] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

  // Format Elapsed Duration (HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Real-time Firestore Subscription & Attendance Logger
  useEffect(() => {
    if (!classId) return;
    setLoading(true);

    const unsubscribeFs = liveClassService.subscribeLiveClasses((allClasses) => {
      const target = allClasses.find((c) => c.id === classId || c.classId === classId);
      if (target) {
        setLiveClassData(target);
        setIsRecording(target.status === 'Live' && target.isRecordingEnabled);
      } else {
        // Fallback default
        setLiveClassData({
          id: classId,
          classId: classId,
          title: 'Linux Kernel Monolithic Architecture & Memory Management',
          description: 'Interactive deep dive into Linux kernel memory layout, virtual address translation, and page tables.',
          courseId: 'course_linux_kernel',
          courseName: 'Advanced Linux Kernel Engineering',
          moduleId: 'mod_1',
          moduleTitle: 'Module 1: Kernel Core Architecture',
          lessonId: 'les_1',
          lessonTitle: 'Lesson 1.2: Page Tables & Memory Allocation',
          instructorId: 'inst_1',
          instructorName: 'Prof. Manoj Acharya',
          instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          meetingProvider: 'jitsi',
          meetingRoomId: `kaizenq-linux-kernel-batch-${classId}`,
          meetingUrl: `https://meet.jit.si/kaizenq-linux-kernel-batch-${classId}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 90 * 60000).toISOString(),
          duration: 90,
          status: 'Live',
          isRecordingEnabled: true,
          isQuizEnabled: true,
          isPollEnabled: true,
          isChatEnabled: true,
          isAttendanceEnabled: true,
          certificateEligible: true,
          maxParticipants: 100,
          tags: ['Linux', 'Kernel'],
          difficulty: 'Advanced',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    // Record attendance entry
    if (userProfile) {
      liveClassService.recordAttendance({
        classId,
        studentId: userProfile.uid,
        studentName: userProfile.name || userProfile.fullName || 'Student Learner',
        studentEmail: userProfile.email || 'student@kaizenq.edu',
        joinedAt: new Date().toLocaleTimeString(),
        durationMinutes: 1,
        status: 'present',
      });
    }

    // Timer Interval
    const timerInterval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      unsubscribeFs();
      clearInterval(timerInterval);
    };
  }, [classId, userProfile]);

  // 2. Realtime Socket Connection for Hand Raise & Participant Counter
  useEffect(() => {
    if (!classId || !userProfile) return;

    const socketInstance = getLiveClassroomSocket();
    socketInstance.connect();
    setSocket(socketInstance);

    const currentUserInfo = {
      uid: userProfile.uid,
      name: userProfile.name || userProfile.fullName || 'User',
      role: (userProfile.role === 'admin' ? 'instructor' : userProfile.role || 'student') as 'instructor' | 'mentor' | 'student',
    };

    socketInstance.emit('join_class', {
      classId,
      userId: currentUserInfo.uid,
      name: currentUserInfo.name,
      role: currentUserInfo.role,
    });

    socketInstance.on('participants_update', (data: { count: number }) => {
      setOnlineCount(Math.max(1, data.count));
    });

    socketInstance.on('hand_raised', (data: { userId: string; userName: string; timestamp: Date }) => {
      if (isInstructor) {
        setRaisedHands((prev) => [...prev, data]);
        toast.info(`🖐️ Hand raised by ${data.userName}!`);
      }
    });

    socketInstance.on('lock_toggled', (data: { locked: boolean }) => {
      setIsLocked(data.locked);
      toast.info(data.locked ? '🔒 Classroom is now locked by mentor.' : '🔓 Classroom is now unlocked.');
    });

    return () => {
      socketInstance.disconnect();
      socketInstance.off('participants_update');
      socketInstance.off('hand_raised');
      socketInstance.off('lock_toggled');
    };
  }, [classId, userProfile, isInstructor]);

  const handleToggleLock = () => {
    if (!socket || !isInstructor) return;
    socket.emit('toggle_lock', { classId, locked: !isLocked });
  };

  const handleRaiseHand = () => {
    if (!socket || isInstructor || !userProfile) return;
    socket.emit('raise_hand', {
      classId,
      userId: userProfile.uid,
      userName: userProfile.name || userProfile.fullName || 'Student',
    });
    toast.success('🖐️ Hand-raised notification sent to the lead mentor!');
  };

  const handleToggleRecording = async () => {
    if (!isInstructor || !liveClassData) return;
    const nextState = !isRecording;
    setIsRecording(nextState);
    await liveClassService.updateLiveClass(liveClassData.id, { isRecordingEnabled: nextState });
    toast.info(nextState ? '🔴 Stream recording started!' : '⏹️ Stream recording stopped.');
  };

  const handleSaveNotes = async () => {
    if (!liveClassData || !notesUrlInput.trim()) return;
    await liveClassService.updateLiveClass(liveClassData.id, { notesUrl: notesUrlInput.trim() });
    toast.success('📄 Lecture notes attached & published to students!');
    setIsNotesModalOpen(false);
    setNotesUrlInput('');
  };

  const handleSaveRecording = async () => {
    if (!liveClassData || !recordingUrlInput.trim()) return;
    await liveClassService.updateLiveClass(liveClassData.id, { recordingUrl: recordingUrlInput.trim() });
    toast.success('🎥 Session video recording attached & published!');
    setIsRecordingModalOpen(false);
    setRecordingUrlInput('');
  };

  const handleOpenAttendanceRoster = () => {
    if (!classId) return;
    const records = liveClassService.getAttendanceRecords(classId);
    setAttendanceRecords(records);
    setIsAttendanceOpen(true);
  };

  const handleEndSession = async () => {
    if (isInstructor && liveClassData) {
      await liveClassService.endLiveClass(liveClassData.id);
      toast.success('Classroom session completed successfully.');
      navigate('/admin/live-classroom');
    } else {
      toast.info('Left the classroom session.');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Sora']">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
          <p className="text-xs font-bold text-slate-400">Initializing Jitsi Enterprise Classroom Stream...</p>
        </div>
      </div>
    );
  }

  const currentUser = userProfile
    ? {
        uid: userProfile.uid,
        name: userProfile.name || userProfile.fullName || 'User',
        role: (userProfile.role === 'admin' ? 'instructor' : userProfile.role || 'student') as 'instructor' | 'mentor' | 'student',
      }
    : {
        uid: 'guest',
        name: 'Guest Learner',
        role: 'student' as const,
      };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Sora'] select-none overflow-x-hidden">
      
      {/* 1. MENTOR PROFILE & CLASSROOM TOP HEADER */}
      <header className="bg-slate-900 border-b border-sky-500/10 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
        
        {/* Mentor Profile Banner */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {liveClassData?.instructorAvatar ? (
              <img
                src={liveClassData.instructorAvatar}
                alt={liveClassData.instructorName}
                className="w-11 h-11 rounded-full object-cover border-2 border-sky-400 shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center border-2 border-sky-400 shadow-md">
                {liveClassData?.instructorName.charAt(0) || 'M'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-black text-sm text-white truncate">{liveClassData?.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Mentor: <strong className="text-sky-300">{liveClassData?.instructorName}</strong> • {liveClassData?.courseName} ({liveClassData?.moduleTitle || 'Core Module'})
            </p>
          </div>
        </div>

        {/* Center Live Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-mono">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Users className="w-4 h-4 text-sky-400" />
            <span>{onlineCount} Live Participants</span>
          </div>

          {isRecording && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-xl animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>REC</span>
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
            <Wifi className="w-3.5 h-3.5" />
            <span>HQ Stream</span>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSidebarOpen ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Right Panel"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={handleEndSession}
            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{isInstructor ? 'End Session' : 'Exit Room'}</span>
          </button>
        </div>

      </header>

      {/* 2. MAIN CENTER STAGE & INTERACTIVE RESPONSIVE LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden">
        
        {/* Primary Focus: Mentor Live Video & Jitsi Screen Container */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} bg-slate-900 border border-sky-500/10 rounded-3xl overflow-hidden flex flex-col justify-between relative shadow-2xl transition-all duration-300`}>
          
          {/* Jitsi Meet Interactive Frame Container */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* Embedded Jitsi Meeting Component */}
            <JitsiMeetingComponent
              roomName={liveClassData?.meetingRoomId || `kaizenq-room-${classId}`}
              displayName={currentUser.name}
              userEmail={userProfile?.email}
              isInstructor={Boolean(isInstructor)}
              onLeave={handleEndSession}
            />

            {/* Hand Raised Queue Banner (Instructor View) */}
            {isInstructor && raisedHands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 max-w-sm space-y-2 z-30"
              >
                {raisedHands.slice(-2).map((h, i) => (
                  <div key={i} className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-amber-400 fill-current animate-bounce" />
                      <span className="font-bold text-white">{h.userName} raised hand</span>
                    </div>
                    <button
                      onClick={() => setRaisedHands(raisedHands.filter((x) => x.userId !== h.userId))}
                      className="text-slate-400 hover:text-white font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Floating Resource Badges Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              {liveClassData?.notesUrl && (
                <a
                  href={liveClassData.notesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-900 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Notes</span>
                </a>
              )}

              {liveClassData?.recordingUrl && (
                <a
                  href={liveClassData.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-purple-500/30 text-purple-400 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-900 shadow-md"
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Stream Recording</span>
                </a>
              )}
            </div>

          </div>

          {/* 3. DYNAMIC TOOLBAR CONTROLS (MENTOR vs STUDENT) */}
          <footer className="bg-slate-950 border-t border-sky-500/10 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 z-10">
            
            {/* Left Controls: Hardware Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  micOn ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                }`}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
              </button>

              <button
                onClick={() => setCamOn(!camOn)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  camOn ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                }`}
                title={camOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {camOn ? <VideoIcon className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isScreenSharing ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-4.5 h-4.5" />
              </button>

              {/* Whiteboard Trigger Button */}
              <button
                onClick={() => setIsWhiteboardOpen(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                title="Open Interactive Whiteboard"
              >
                <Pencil className="w-4.5 h-4.5 text-sky-400" />
                <span className="hidden sm:inline">Whiteboard</span>
              </button>
            </div>

            {/* Center Controls: Interactive Features (Quiz, Poll, Hand, Notes, Attendance) */}
            <div className="flex items-center gap-2 flex-wrap">
              {isInstructor ? (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('quiz');
                      setIsSidebarOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-500/20 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Launch Quiz</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('poll');
                      setIsSidebarOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-500/20 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>Create Poll</span>
                  </button>

                  <button
                    onClick={() => setIsNotesModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Share Notes</span>
                  </button>

                  <button
                    onClick={() => setIsRecordingModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>Recording URL</span>
                  </button>

                  <button
                    onClick={handleOpenAttendanceRoster}
                    className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Attendance</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRaiseHand}
                    className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Hand className="w-4 h-4 text-amber-400 fill-current" />
                    <span>Raise Hand</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('quiz');
                      setIsSidebarOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Take Quiz</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('poll');
                      setIsSidebarOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>Vote Poll</span>
                  </button>
                </>
              )}
            </div>

            {/* Right Controls: Lock & Record Toggles */}
            <div className="flex items-center gap-2">
              {isInstructor && (
                <>
                  <button
                    onClick={handleToggleLock}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLocked ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300' : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4" />}
                    <span>{isLocked ? 'Locked' : 'Lock'}</span>
                  </button>

                  <button
                    onClick={handleToggleRecording}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isRecording ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{isRecording ? 'Stop Rec' : 'Record'}</span>
                  </button>
                </>
              )}
            </div>

          </footer>

        </div>

        {/* Right Side Panel: Chat / Quiz / Poll / Leaderboard / AI Insights */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 border border-sky-500/10 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300">
            
            {/* Tab Selector Header */}
            <div className="bg-slate-950/60 p-2.5 border-b border-sky-500/10 flex items-center justify-between gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-2 rounded-xl text-xs font-bold flex-1 flex items-center justify-center cursor-pointer ${
                  activeTab === 'chat' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'text-slate-400 hover:text-white'
                }`}
                title="Chat Feed"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`p-2 rounded-xl text-xs font-bold flex-1 flex items-center justify-center cursor-pointer ${
                  activeTab === 'quiz' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'text-slate-400 hover:text-white'
                }`}
                title="Live Quizzes"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('poll')}
                className={`p-2 rounded-xl text-xs font-bold flex-1 flex items-center justify-center cursor-pointer ${
                  activeTab === 'poll' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'text-slate-400 hover:text-white'
                }`}
                title="Audience Polls"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`p-2 rounded-xl text-xs font-bold flex-1 flex items-center justify-center cursor-pointer ${
                  activeTab === 'leaderboard' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'text-slate-400 hover:text-white'
                }`}
                title="Live Leaderboard"
              >
                <Trophy className="w-4 h-4" />
              </button>

              {isInstructor && (
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`p-2 rounded-xl text-xs font-bold flex-1 flex items-center justify-center cursor-pointer ${
                    activeTab === 'ai' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                  title="AI Insights"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tab Widget Content Frame */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'chat' && (
                <LiveChatWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
              )}
              {activeTab === 'quiz' && (
                <LiveQuizWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
              )}
              {activeTab === 'poll' && (
                <LivePollWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
              )}
              {activeTab === 'leaderboard' && (
                <LeaderboardWidget socket={socket} classId={classId || ''} />
              )}
              {activeTab === 'ai' && isInstructor && (
                <AIInsightsWidget classId={classId || ''} />
              )}
            </div>

          </div>
        )}

      </div>

      {/* 4. MODALS (WHITEBOARD, NOTES, RECORDING, ATTENDANCE ROSTER) */}

      {/* Interactive Whiteboard Modal */}
      {isWhiteboardOpen && (
        <InteractiveWhiteboard
          isInstructor={Boolean(isInstructor)}
          onClose={() => setIsWhiteboardOpen(false)}
        />
      )}

      {/* Attach Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-base text-white">Share Lecture Notes / PDF URL</h3>
              <button onClick={() => setIsNotesModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">Enter PDF URL or Google Drive link to attach for live participants:</p>
              <input
                type="url"
                value={notesUrlInput}
                onChange={(e) => setNotesUrlInput(e.target.value)}
                placeholder="https://kaizenq.lms/notes/linux-kernel-mem.pdf"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md">
                Publish Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach Recording URL Modal */}
      {isRecordingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-base text-white">Publish Video Recording URL</h3>
              <button onClick={() => setIsRecordingModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">Enter stream recording video link for replay access:</p>
              <input
                type="url"
                value={recordingUrlInput}
                onChange={(e) => setRecordingUrlInput(e.target.value)}
                placeholder="https://meet.jit.si/recordings/session.mp4"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsRecordingModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleSaveRecording} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md">
                Publish Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Roster Drawer */}
      {isAttendanceOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-sky-500/20 max-w-md w-full h-full p-6 shadow-2xl overflow-y-auto space-y-5 font-['Sora'] animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-base text-white">Live Attendance Roster</h3>
              </div>
              <button onClick={() => setIsAttendanceOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">{attendanceRecords.length} Student Records Active</p>

            <div className="space-y-2">
              {attendanceRecords.map((r) => (
                <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-medium">
                  <div>
                    <p className="font-bold text-white">{r.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{r.studentEmail}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveClassroomScreen;

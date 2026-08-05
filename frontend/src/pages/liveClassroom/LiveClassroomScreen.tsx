import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { getLiveClassroomSocket } from '@/services/socket';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mic, MicOff, Video, VideoOff, Radio, Users, Clock, Wifi, 
  MessageSquare, BarChart3, HelpCircle, Trophy, Sparkles, LogOut, Lock, Unlock, 
  Hand, Monitor, Terminal
} from 'lucide-react';
import { toast } from 'sonner';

// Import widgets
import { LiveChatWidget } from '@/components/liveClassroom/LiveChatWidget';
import { LivePollWidget } from '@/components/liveClassroom/LivePollWidget';
import { LiveQuizWidget } from '@/components/liveClassroom/LiveQuizWidget';
import { LeaderboardWidget } from '@/components/liveClassroom/LeaderboardWidget';
import { AIInsightsWidget } from '@/components/liveClassroom/AIInsightsWidget';

export const LiveClassroomScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Classroom status states
  const [onlineCount, setOnlineCount] = useState(1);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Timer count-up
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Hand raise notification queue
  const [raisedHands, setRaisedHands] = useState<{ userId: string; userName: string; timestamp: Date }[]>([]);

  // Right Panel tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'poll' | 'quiz' | 'leaderboard' | 'ai'>('chat');

  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

  // Format elapsed time
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3650) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // 1. Fetch Class Information
    const fetchClass = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiBaseUrl}/live-classroom/${classId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setClassInfo(data.data);
          setIsLocked(data.data.locked || false);
        } else {
          throw new Error('Simulation fallback');
        }
      } catch (err) {
        setClassInfo({
          id: classId,
          title: 'Linux Kernel Monolithic Architecture & Memory Management',
          courseName: 'Advanced Linux Kernel Engineering',
          moduleName: 'Module 1: Kernel Core Architecture',
          instructorName: 'Prof. Manoj Acharya',
          locked: false
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClass();

    // 2. Start class duration timer
    const timerInterval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [classId]);

  useEffect(() => {
    if (!classId || !userProfile) return;

    // 3. Connect Socket client
    const socketInstance = getLiveClassroomSocket();
    socketInstance.connect();
    setSocket(socketInstance);

    const currentUserInfo = {
      uid: userProfile.uid,
      name: userProfile.fullName || 'User',
      role: (userProfile.role === 'admin' ? 'instructor' : userProfile.role || 'student') as 'instructor' | 'mentor' | 'student'
    };

    // Join classroom room
    socketInstance.emit('join_class', {
      classId,
      userId: currentUserInfo.uid,
      name: currentUserInfo.name,
      role: currentUserInfo.role
    });

    // Listen for participant updates
    socketInstance.on('participants_update', (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    // Listen for hand raised
    socketInstance.on('hand_raised', (data: { userId: string; userName: string; timestamp: Date }) => {
      if (isInstructor) {
        setRaisedHands((prev) => [...prev, data]);
        toast.info(`🖐️ Hand raised by ${data.userName}!`);
      }
    });

    // Listen for classroom locks
    socketInstance.on('lock_toggled', (data: { locked: boolean }) => {
      setIsLocked(data.locked);
      toast.info(data.locked ? 'The classroom is now locked.' : 'The classroom is now unlocked.');
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
    socket.emit('raise_hand', { classId, userId: userProfile.uid, userName: userProfile.fullName });
    toast.success('Your hand-raised notification was sent to the mentor.');
  };

  const handleEndClass = async () => {
    if (!isInstructor) {
      navigate('/admin/dashboard');
      return;
    }
    
    // Complete class status
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiBaseUrl}/live-classroom/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      toast.success('Classroom session completed successfully.');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.success('Classroom session completed (Local fallback).');
      navigate('/admin/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const currentUser = userProfile ? {
    uid: userProfile.uid,
    name: userProfile.fullName || 'User',
    role: (userProfile.role === 'admin' ? 'instructor' : userProfile.role || 'student') as 'instructor' | 'mentor' | 'student'
  } : {
    uid: 'guest',
    name: 'Guest',
    role: 'student' as const
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Sora'] select-none">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="bg-slate-900 border-b border-sky-500/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Section: Live indicator & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full text-rose-400 font-extrabold text-[10px] uppercase tracking-wider animate-pulse">
            <Radio className="w-4 h-4" />
            <span>LIVE</span>
          </div>

          <div>
            <h1 className="text-sm font-black text-white truncate max-w-xs md:max-w-md">{classInfo?.title}</h1>
            <p className="text-[10px] text-slate-400 font-medium">{classInfo?.courseName} • {classInfo?.moduleName}</p>
          </div>
        </div>

        {/* Center Section: Stats/Timer */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono">{formatTime(secondsElapsed)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Users className="w-4 h-4 text-sky-400" />
            <span>{onlineCount} Active</span>
          </div>

          {isRecording && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
              REC
            </span>
          )}
        </div>

        {/* Right Section: Hardware Status */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMicOn(!micOn)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              micOn ? 'bg-sky-500 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setCamOn(!camOn)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              camOn ? 'bg-sky-500 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
            <Wifi className="w-3.5 h-3.5" />
            <span>Connected</span>
          </div>
        </div>

      </header>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 overflow-hidden">
        
        {/* Stage Area (Whiteboard, Screen Share, Code workspace) */}
        <div className="lg:col-span-3 bg-slate-900 border border-sky-500/10 rounded-3xl overflow-hidden flex flex-col justify-between relative shadow-xl">
          
          {/* Main Visual Board */}
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/60 p-8 text-center relative">
            
            {camOn ? (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-sky-500/20 relative">
                {/* Simulated Mentor Feed */}
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                  <Monitor className="w-12 h-12 text-slate-700 animate-pulse" />
                  <span className="absolute bottom-4 left-4 text-xs font-bold text-sky-400 bg-slate-950/70 py-1 px-3 rounded-md">
                    Screen Broadcasting
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mx-auto flex items-center justify-center">
                  <Terminal className="w-8 h-8" />
                </div>
                <h2 className="font-heading font-black text-lg text-white">Live Interactive Coding Sandbox</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  The mentor has initialized the Linux Kernel debugging terminal. Click bottom quiz buttons to participate in real-time.
                </p>
              </div>
            )}

            {/* Hand Raised Banner Queue (Instructor only) */}
            {isInstructor && raisedHands.length > 0 && (
              <div className="absolute top-4 right-4 max-w-sm space-y-2 z-20">
                {raisedHands.slice(-2).map((h, i) => (
                  <div key={i} className="bg-slate-900 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-amber-400 shrink-0 fill-current" />
                      <span className="text-xs font-bold text-white">{h.userName} raised a hand</span>
                    </div>
                    <button 
                      onClick={() => setRaisedHands(raisedHands.filter(x => x.userId !== h.userId))}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Toolbar Controls */}
          <footer className="bg-slate-900 border-t border-sky-500/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isInstructor ? (
                <>
                  <button 
                    onClick={handleToggleLock}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLocked 
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                        : 'bg-slate-800 border border-slate-700 text-slate-350'
                    }`}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span>{isLocked ? 'Unlock Classroom' : 'Lock Classroom'}</span>
                  </button>

                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isRecording 
                        ? 'bg-red-600 text-white' 
                        : 'bg-slate-800 border border-slate-700 text-slate-350'
                    }`}
                  >
                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRaiseHand}
                  className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-750 flex items-center gap-1.5 cursor-pointer"
                >
                  <Hand className="w-4 h-4 text-amber-400" />
                  <span>Raise Hand</span>
                </button>
              )}
            </div>

            <button
              onClick={handleEndClass}
              className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/10"
            >
              <LogOut className="w-4 h-4" />
              <span>{isInstructor ? 'End Classroom Session' : 'Exit Classroom'}</span>
            </button>
          </footer>

        </div>

        {/* Right Side panel: Chat / Quiz / Leaderboard / Poll Tabs */}
        <div className="bg-slate-900 border border-sky-500/10 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl">
          
          {/* Tab Selector Header */}
          <div className="bg-slate-950/40 p-2.5 border-b border-sky-500/10 flex items-center justify-between gap-1">
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
              title="Concept Quizzes"
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
              title="Class Leaderboard"
            >
              <Trophy className="w-4 h-4" />
            </button>
            {isInstructor && (
              <button
                onClick={() => setActiveTab('ai')}
                className={`p-2 rounded-xl text-xs font-bold flex-1 flex items-center justify-center cursor-pointer ${
                  activeTab === 'ai' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'text-slate-400 hover:text-white'
                }`}
                title="AI Analytics Insights"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Content Widget Frame */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chat' && (
              <LiveChatWidget 
                socket={socket} 
                classId={classId || ''} 
                currentUser={currentUser} 
              />
            )}
            {activeTab === 'quiz' && (
              <LiveQuizWidget 
                socket={socket} 
                classId={classId || ''} 
                currentUser={currentUser} 
              />
            )}
            {activeTab === 'poll' && (
              <LivePollWidget 
                socket={socket} 
                classId={classId || ''} 
                currentUser={currentUser} 
              />
            )}
            {activeTab === 'leaderboard' && (
              <LeaderboardWidget socket={socket} classId={classId || ''} />
            )}
            {activeTab === 'ai' && isInstructor && (
              <AIInsightsWidget classId={classId || ''} />
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
export default LiveClassroomScreen;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Socket } from 'socket.io-client';
import { socketService } from '@/services/socketService';
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
  Sparkles,
  LogOut,
  Lock,
  Unlock,
  Hand,
  Monitor,
  FileText,
  Pencil,
  FileSpreadsheet,
  X,
  ShieldAlert,
  VolumeX,
  MessageSquareOff,
  Play,
  Calendar,
  ArrowLeft,
  Megaphone,
  UserX,
  Loader2,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

// Import Widgets & Subcomponents
import { LiveChatWidget } from '@/components/liveClassroom/LiveChatWidget';
import { LivePollWidget } from '@/components/liveClassroom/LivePollWidget';
import { LiveQuizWidget } from '@/components/liveClassroom/LiveQuizWidget';
import { InteractiveWhiteboard } from '@/components/liveClassroom/InteractiveWhiteboard';
import { LiveClassConfirmModal } from '@/components/liveClassroom/LiveClassConfirmModal';
import { KaizenQClassroom } from '@/components/live-class/KaizenQClassroom';
import { DeviceSettingsModal } from '@/components/live-class/DeviceSettingsModal';
import type { MediaClient } from '@/services/liveMedia/mediaClient';
import type { MediaConnectionState } from '@/services/liveMedia/mediaTypes';
import { LiveQuestionsWidget } from '@/components/liveClassroom/LiveQuestionsWidget';
import { LiveAnnouncementBanner } from '@/components/liveClass/LiveAnnouncementBanner';
import type { AnnouncementItem } from '@/hooks/useLiveClassSocket';
import { liveClassAuthorizationService } from '@/services/liveClassAuthorizationService';
import { PostClassView } from '@/components/liveClassroom/PostClassView';
import { API_BASE_URL } from '@/config/api';

export const LiveClassroomScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();

  // Core Room & Socket States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveClassData, setLiveClassData] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected' | 'idle'>('idle');
  const [classEnded, setClassEnded] = useState(false);
  const [classEndedReason, setClassEndedReason] = useState<'ENDED' | 'CANCELLED'>('ENDED');

  // Pre-flight Start Class Action State
  const [isStartingClass, setIsStartingClass] = useState(false);

  // Classroom Telemetry & Presence States
  const [onlineCount, setOnlineCount] = useState(1);
  const [participants, setParticipants] = useState<any[]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Hardware States
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Hand Raise States
  const [raisedHands, setRaisedHands] = useState<{ userId: string; userName: string; timestamp: Date }[]>([]);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Active Speaker & Moderation State
  const [activeSpeakerInfo, setActiveSpeakerInfo] = useState<{ userId: string; name?: string; role?: string } | null>(null);
  const [unmuteRequest, setUnmuteRequest] = useState<{ instructorName: string } | null>(null);

  // Sidebar Tabs (Strict KaizenQ design: Participants, Chat, Q&A)
  const [activeTab, setActiveTab] = useState<'participants' | 'chat' | 'questions'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isPlatformStaff = userProfile?.role === 'instructor' || userProfile?.role === 'admin' || (userProfile?.role as string) === 'mentor';

  const isAssignedInstructor = useMemo(() => {
    if (userProfile?.role === 'admin') return true;
    if (!isPlatformStaff) return false;
    if (!liveClassData) return false;

    const currentUid = (user?.uid || userProfile?.uid || '').trim();
    const currentEmail = (user?.email || userProfile?.email || '').trim().toLowerCase();
    const currentName = (userProfile?.fullName || userProfile?.name || user?.displayName || '').trim().toLowerCase();

    const instId = (liveClassData.instructorId || '').trim();
    const createdBy = (liveClassData.createdBy || '').trim();
    const instEmail = ((liveClassData as any).instructorEmail || '').trim().toLowerCase();
    const instName = (liveClassData.instructorName || '').trim().toLowerCase();

    if (currentUid && (instId === currentUid || createdBy === currentUid)) return true;
    if (currentEmail && instEmail && instEmail === currentEmail) return true;
    if (currentName && instName && (instName === currentName || instName.includes(currentName) || currentName.includes(instName))) return true;
    if (['inst_kaizen', 'inst_default', 'instructor_lead', 'admin', ''].includes(instId)) return true;

    return false;
  }, [userProfile, user, liveClassData, isPlatformStaff]);

  const isInstructor = isAssignedInstructor;

  const resolvedDisplayName = useMemo(() => {
    if (userProfile?.fullName) return userProfile.fullName;
    if (userProfile?.name) return userProfile.name;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return isInstructor ? 'Lead Instructor' : 'KaizenQ Learner';
  }, [userProfile, user, isInstructor]);

  // Modals & Drawers
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isRestrictModalOpen, setIsRestrictModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isEndConfirmModalOpen, setIsEndConfirmModalOpen] = useState(false);
  const [isLeaveConfirmModalOpen, setIsLeaveConfirmModalOpen] = useState(false);

  // Form Inputs
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'urgent'>('normal');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [notesUrlInput, setNotesUrlInput] = useState('');
  const [recordingUrlInput, setRecordingUrlInput] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const mediaClientRef = useRef<MediaClient | null>(null);
  const hasJoinedRef = useRef<string | null>(null);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);
  const [mediaConnectionState, setMediaConnectionState] = useState<MediaConnectionState>('idle');

  // Authorization Check
  const authCheck = useMemo(() => {
    const res = liveClassAuthorizationService.authorizeLiveClassAccess(
      classId || '',
      userProfile
        ? { uid: userProfile.uid, role: userProfile.role, email: userProfile.email }
        : user
        ? { uid: user.uid, email: user.email || undefined }
        : null,
      liveClassData
    );
    return {
      authorized: res.allowed,
      code: res.reason,
      reason: res.message,
    };
  }, [classId, userProfile, user, liveClassData]);

  // Normalized Status Helper
  const normStatus = useMemo(() => {
    return (liveClassData?.status || 'SCHEDULED').toUpperCase();
  }, [liveClassData?.status]);

  // Format Elapsed Duration (HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Real-time Firestore Subscription & Attendance Tracking
  useEffect(() => {
    if (!classId) return;
    setLoading(true);

    const unsubscribeFs = liveClassService.subscribeLiveClasses((allClasses) => {
      const target = allClasses.find((c) => c.id === classId || c.classId === classId);
      if (target) {
        setLiveClassData(target);
        setIsRecording((target.status || '').toUpperCase() === 'LIVE' && Boolean(target.isRecordingEnabled));
      } else {
        // Fallback default scheduled session
        setLiveClassData({
          id: classId,
          classId: classId,
          title: 'Advanced AI Systems & Real-Time Engineering',
          description: 'Production Live Classroom Session on high-performance distributed systems architecture.',
          courseId: 'course_ai_systems',
          courseName: 'Advanced AI Systems Engineering',
          moduleId: 'mod_1',
          moduleTitle: 'Module 1: Real-Time Systems & Media Streams',
          lessonId: 'les_1',
          lessonTitle: 'Lesson 1.1: Live Media Architecture & WebRTC',
          instructorId: userProfile?.uid || 'instructor_lead',
          instructorName: userProfile?.role === 'instructor' ? (userProfile.name || 'Faculty Instructor') : 'Assigned Instructor',
          instructorAvatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          meetingProvider: 'kaizenq',
          meetingRoomId: `kaizenq-room-${classId}`,
          meetingUrl: `/live-classroom/room/${classId}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 90 * 60000).toISOString(),
          duration: 90,
          status: 'SCHEDULED',
          isRecordingEnabled: true,
          isQuizEnabled: true,
          isPollEnabled: true,
          isChatEnabled: true,
          isAttendanceEnabled: true,
          certificateEligible: true,
          maxParticipants: 100,
          tags: ['AI Systems', 'Realtime', 'Engineering'],
          difficulty: 'Advanced',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    // Record initial attendance entry for students
    if (userProfile && !isInstructor) {
      liveClassService.recordAttendance({
        classId,
        studentId: userProfile.uid,
        studentName: userProfile.name || userProfile.fullName || 'Student Learner',
        studentEmail: userProfile.email || 'student@kaizenq.in',
        joinedAt: new Date().toLocaleTimeString(),
        durationMinutes: 1,
        status: 'present',
      });
    }

    return () => {
      unsubscribeFs();
    };
  }, [classId, userProfile, isInstructor]);

  // Elapsed Timer — active only when LIVE
  useEffect(() => {
    if (normStatus !== 'LIVE' || classEnded) return;

    const timerInterval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [normStatus, classEnded]);

  // 2. Realtime Socket.IO Connection & Listeners
  useEffect(() => {
    if (!classId || (!user && !userProfile)) return;

    let socketInstance: Socket | null = null;
    let unsubStatus: (() => void) | null = null;

    const initSocket = async () => {
      try {
        const currentUserUid = user?.uid || userProfile?.uid || 'student_guest';
        const currentUserEmail = user?.email || userProfile?.email || '';

        if (user && typeof user.getIdToken === 'function') {
          socketInstance = await socketService.connectWithFirebaseUser(user, {
            name: resolvedDisplayName,
            role: isInstructor ? 'instructor' : 'student',
          });
        } else {
          socketInstance = socketService.connect(undefined, {
            uid: currentUserUid,
            email: currentUserEmail,
            name: resolvedDisplayName,
            role: isInstructor ? 'instructor' : 'student',
          });
        }

        setSocket(socketInstance);
        socketService.setCurrentLiveClassId(classId);

        // Connection status tracking
        unsubStatus = socketService.onStatusChange((status) => {
          setConnectionStatus(status);
        });

        // Authoritative Room Join Handler with idempotency protection
        const performAuthoritativeJoin = () => {
          if (!socketInstance) return;

          const joinKey = `${socketInstance.id || 'sock'}:${classId}:${currentUserUid}`;
          if (hasJoinedRef.current === joinKey) {
            return;
          }
          hasJoinedRef.current = joinKey;
          (socketInstance as any)._hasJoinedLiveClass = classId;

          const joinPayload = {
            classId,
            liveClassId: classId,
            userId: currentUserUid,
            name: resolvedDisplayName,
            role: isInstructor ? 'instructor' : 'student',
          };

          socketInstance.emit('join_class', joinPayload, (res: any) => {
            if (res && res.success) {
              if (res.status) {
                const upperStatus = String(res.status).toUpperCase();
                setLiveClassData((prev) => (prev ? { ...prev, status: upperStatus as any } : null));
                if (upperStatus === 'LIVE') {
                  setClassEnded(false);
                }
              }
              if (res.onlineCount !== undefined) {
                setOnlineCount(Math.max(1, res.onlineCount));
              }
              if (res.participants && Array.isArray(res.participants)) {
                setParticipants(res.participants);
              }
            } else if (res && res.error) {
              console.warn('[LiveClassroomScreen] Join error from server:', res);
              if (res.error === 'ROOM_LOCKED') {
                toast.warning('🔒 ' + (res.message || 'Classroom is currently locked.'));
              } else if (res.error === 'NOT_ENROLLED') {
                toast.error('🚫 ' + (res.message || 'You are not enrolled in this course.'));
              } else {
                toast.error(res.message || 'Failed to join classroom.');
              }
            }
          });

          // Join attendance tracking for students only
          if (!isInstructor) {
            socketInstance.emit('attendance:join', { liveClassId: classId });
          }
        };

        if (socketInstance.connected) {
          performAuthoritativeJoin();
        } else {
          socketInstance.once('connect', performAuthoritativeJoin);
        }

        // Authoritative State Snapshot on Join
        socketInstance.on('liveClass:joined', (res: any) => {
          if (res?.status) {
            const upperStatus = String(res.status).toUpperCase();
            setLiveClassData((prev) => (prev ? { ...prev, status: upperStatus as any } : null));
            if (upperStatus === 'LIVE') {
              setClassEnded(false);
            }
          }
          if (res?.onlineCount !== undefined) {
            setOnlineCount(Math.max(1, res.onlineCount));
          }
          if (res?.participants && Array.isArray(res.participants)) {
            setParticipants(res.participants);
          }
        });

        // Server Error Listener
        socketInstance.on('liveClass:error', (err: { error: string; message: string }) => {
          console.warn('[LiveClassroomScreen] Received liveClass:error:', err);
          if (err.error === 'ROOM_LOCKED') {
            toast.warning('🔒 ' + (err.message || 'This classroom is locked by the instructor.'));
          } else if (err.error === 'NOT_ENROLLED') {
            toast.error('🚫 ' + (err.message || 'You are not enrolled in this course.'));
          } else if (err.error === 'CLASS_COMPLETED') {
            setClassEndedReason('ENDED');
            setClassEnded(true);
            toast.info('🎓 ' + (err.message || 'This live class session has concluded.'));
          } else if (err.error !== 'UNAUTHORIZED_INSTRUCTOR') {
            toast.error(err.message || 'Classroom interaction notice.');
          }
        });

        // Presence & Participant Count Listeners
        socketInstance.on('participants_update', (data: { count: number; users?: any[] }) => {
          setOnlineCount(Math.max(1, data.count));
          if (data.users && Array.isArray(data.users)) {
            setParticipants(data.users);
          }
        });

        socketInstance.on('participant_count', (data: { count: number }) => {
          setOnlineCount(Math.max(1, data.count));
        });

        socketInstance.on('liveClass:presence', (data: { onlineCount: number; participants?: any[] }) => {
          if (data.onlineCount !== undefined) {
            setOnlineCount(Math.max(1, data.onlineCount));
          }
          if (data.participants && Array.isArray(data.participants)) {
            setParticipants(data.participants);
          }
        });

        socketInstance.on('student:joined', (data: { name: string; role: string }) => {
          if (isInstructor) {
            toast.info(`👋 ${data.name} (${data.role}) joined the live class`);
          }
        });

        socketInstance.on('student:left', (data: { name: string }) => {
          if (isInstructor && data.name) {
            toast.info(`🚪 ${data.name} left the live class`);
          }
        });

        // Hand Raise Listeners
        socketInstance.on('hand_raised', (data: { userId: string; userName: string; timestamp: Date }) => {
          setRaisedHands((prev) => {
            if (prev.some((h) => h.userId === data.userId)) return prev;
            return [...prev, { ...data, timestamp: new Date(data.timestamp) }];
          });
          if (data.userId === userProfile.uid) {
            setHasRaisedHand(true);
          }
          if (isInstructor) {
            toast.info(`🖐️ ${data.userName} raised their hand!`);
          }
        });

        socketInstance.on('hand:raise', (data: { studentId: string; studentName: string; timestamp: string }) => {
          setRaisedHands((prev) => {
            if (prev.some((h) => h.userId === data.studentId)) return prev;
            return [...prev, { userId: data.studentId, userName: data.studentName, timestamp: new Date(data.timestamp) }];
          });
          if (data.studentId === userProfile.uid) {
            setHasRaisedHand(true);
          }
        });

        socketInstance.on('hand:lower', (data: { studentId: string }) => {
          setRaisedHands((prev) => prev.filter((h) => h.userId !== data.studentId));
          if (data.studentId === userProfile.uid) {
            setHasRaisedHand(false);
          }
        });

        socketInstance.on('hand:acknowledge', (data: { studentId: string; acknowledgedBy?: string }) => {
          setRaisedHands((prev) => prev.filter((h) => h.userId !== data.studentId));
          if (data.studentId === userProfile.uid) {
            setHasRaisedHand(false);
            toast.success(`🎉 ${data.acknowledgedBy || 'Instructor'} acknowledged your raised hand!`);
          }
        });

        // Announcements Listeners
        socketInstance.on('announcement:receive', (ann: AnnouncementItem) => {
          setAnnouncements((prev) => [ann, ...prev]);
          toast.info(`📢 Announcement: ${ann.message}`, { duration: 7000 });
        });

        socketInstance.on('announcement_created', (ann: AnnouncementItem) => {
          setAnnouncements((prev) => {
            if (prev.some((a) => a.id === ann.id)) return prev;
            return [ann, ...prev];
          });
        });

        // Lock & Whiteboard Listeners
        socketInstance.on('lock_toggled', (data: { locked: boolean }) => {
          setIsLocked(data.locked);
          toast.info(data.locked ? '🔒 Classroom is now locked (Private).' : '🔓 Classroom is now unlocked.');
        });

        // Active Speaker & Moderation Listeners
        socketInstance.on('liveClass:speaker:changed', (data: { userId: string; name?: string; role?: string } | null) => {
          setActiveSpeakerInfo(data);
        });

        socketInstance.on('liveClass:moderation:requestUnmute', (data: { instructorName?: string }) => {
          setUnmuteRequest({ instructorName: data.instructorName || 'Instructor' });
        });

        socketInstance.on('liveClass:moderation:muteAll', () => {
          if (!isInstructor) {
            toast.warning('🔇 All student microphones have been muted by the instructor.');
            setMicOn(false);
          }
        });

        socketInstance.on('liveClass:moderation:muted', (data: { userId: string }) => {
          const myId = user?.uid || userProfile?.uid;
          if (data.userId === myId) {
            toast.warning('🔇 Your microphone was muted by the instructor.');
            setMicOn(false);
          }
        });

        socketInstance.on('liveClass:screenShare:started', (data: { name?: string }) => {
          toast.info(`🖥️ ${data.name || 'Presenter'} started sharing their screen`);
        });

        socketInstance.on('liveClass:screenShare:stopped', () => {
          toast.info('⏹️ Screen sharing ended');
        });

        socketInstance.on('mute_all_students', () => {
          if (!isInstructor) {
            if (mediaClientRef.current) {
              mediaClientRef.current.muteMicrophone().catch(() => {});
            }
            setMicOn(false);
            toast.info('🔇 Instructor has muted all student microphones.');
          }
        });

        socketInstance.on('room_chat_muted', (data: { isMuted: boolean }) => {
          setIsChatMuted(Boolean(data.isMuted));
          if (!isInstructor) {
            toast.info(data.isMuted ? '💬 Instructor disabled classroom chat.' : '💬 Classroom chat is re-enabled.');
          }
        });

        socketInstance.on('whiteboard_toggled', (data: { isOpen: boolean }) => {
          setIsWhiteboardOpen(data.isOpen);
          toast.info(data.isOpen ? '🎨 Interactive Whiteboard opened by instructor.' : '🎨 Whiteboard closed.');
        });

        // Live Class Status Changes
        socketInstance.on('liveClass:status', (data: { liveClassId: string; status: string }) => {
          const s = (data.status || '').toUpperCase();
          if (s === 'LIVE') {
            setLiveClassData((prev) => (prev ? { ...prev, status: 'LIVE' } : null));
            setClassEnded(false);
            toast.success('🔴 CLASS IS NOW LIVE! Session started.');
          } else if (s === 'ENDED' || s === 'COMPLETED' || s === 'CANCELLED') {
            setClassEndedReason(s === 'CANCELLED' ? 'CANCELLED' : 'ENDED');
            setClassEnded(true);
            setLiveClassData((prev) => (prev ? { ...prev, status: s as any } : null));
            if (classId) socketService.leaveLiveClass(classId);
            toast.info(s === 'CANCELLED' ? '❌ This live class has been cancelled.' : '🎓 The live class session has ended.');
          }
        });

        socketInstance.on('live_class_started', () => {
          setLiveClassData((prev) => (prev ? { ...prev, status: 'LIVE' } : null));
          setClassEnded(false);
          toast.success('🔴 CLASS IS NOW LIVE! Welcome to the classroom.');
        });

        socketInstance.on('live_class_ended', () => {
          setClassEndedReason('ENDED');
          setClassEnded(true);
          setLiveClassData((prev) => (prev ? { ...prev, status: 'Completed' } : null));
          if (classId) socketService.leaveLiveClass(classId);
          toast.info('🎓 The live class session has concluded.');
        });

        socketInstance.on('kicked', (data: { message?: string }) => {
          toast.error(data?.message || 'You have been removed from the classroom.');
          navigate('/dashboard/live-classroom');
        });

      } catch (err) {
        console.error('[LiveClassroomScreen] Socket initialization failed:', err);
      }
    };

    initSocket();

    // 30-second lightweight in-memory attendance heartbeat (zero database load)
    const heartbeatTimer = setInterval(() => {
      if (socketInstance && socketInstance.connected && classId && !isInstructor) {
        socketInstance.emit('attendance:ping', {
          classId,
          studentId: userProfile?.uid || user?.uid,
        });
      }
    }, 30000);

    // Browser close / unexpected tab drop beacon
    const handleBeforeUnload = () => {
      const uid = userProfile?.uid || user?.uid;
      if (classId && !isInstructor && uid && navigator.sendBeacon) {
        const payload = JSON.stringify({ userId: uid });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE_URL}/live-classes/${encodeURIComponent(classId)}/leave`, blob);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      hasJoinedRef.current = null;
      clearInterval(heartbeatTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unsubStatus) unsubStatus();
      if (socketInstance) {
        socketInstance.off('participants_update');
        socketInstance.off('participant_count');
        socketInstance.off('liveClass:presence');
        socketInstance.off('student:joined');
        socketInstance.off('student:left');
        socketInstance.off('hand_raised');
        socketInstance.off('hand:raise');
        socketInstance.off('hand:lower');
        socketInstance.off('hand:acknowledge');
        socketInstance.off('announcement:receive');
        socketInstance.off('announcement_created');
        socketInstance.off('lock_toggled');
        socketInstance.off('whiteboard_toggled');
        socketInstance.off('liveClass:status');
        socketInstance.off('live_class_started');
        socketInstance.off('live_class_ended');
        socketInstance.off('liveClass:joined');
        socketInstance.off('liveClass:error');
        socketInstance.off('kicked');
        delete (socketInstance as any)._hasJoinedLiveClass;
      }
      if (classId) socketService.leaveLiveClass(classId);
    };
  }, [classId, user?.uid, userProfile?.uid, isInstructor]);

  // --- ACTIONS ---

  // Start Live Class (Instructor Action on Scheduled Screen)
  const handleStartLiveClass = async () => {
    if (!classId || !isInstructor) return;
    setIsStartingClass(true);

    try {
      let token: string | undefined;
      if (user && typeof user.getIdToken === 'function') {
        token = await user.getIdToken().catch(() => undefined);
      }

      const userMeta = {
        uid: user?.uid || userProfile?.uid,
        role: userProfile?.role,
        email: user?.email || userProfile?.email,
        name: userProfile?.fullName || userProfile?.name || user?.displayName,
      };

      const res = await liveClassService.startClass(classId, token, userMeta);
      if (!res.success) {
        toast.error(res.error || 'Failed to start live class.');
        setIsStartingClass(false);
        return;
      }

      // Update local state to LIVE
      setLiveClassData((prev) => (prev ? { ...prev, status: 'LIVE', startedAt: new Date().toISOString() } : null));
      setClassEnded(false);

      // Emit status event to socket room
      if (socket) {
        socket.emit('liveClass:status', { liveClassId: classId, status: 'LIVE' });
      }

      toast.success('🔴 Classroom is now LIVE! Broadcast commenced.');
    } catch (err: any) {
      toast.error(err.message || 'Error starting live class.');
    } finally {
      setIsStartingClass(false);
    }
  };

  // End Live Class (Instructor Action)
  const handleConfirmEndClass = async () => {
    setIsEndConfirmModalOpen(false);
    if (!classId || !isInstructor) return;

    try {
      let token: string | undefined;
      if (user && typeof user.getIdToken === 'function') {
        token = await user.getIdToken().catch(() => undefined);
      }

      await liveClassService.endClass(classId, token);

      if (socket) {
        socket.emit('liveClass:status', { liveClassId: classId, status: 'ENDED' });
      }

      setClassEndedReason('ENDED');
      setClassEnded(true);
      setLiveClassData((prev) => (prev ? { ...prev, status: 'Completed', endedAt: new Date().toISOString() } : null));
      toast.success('Class session concluded successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to end live class.');
    }
  };

  // Leave Class (Student Action)
  const handleConfirmLeaveClass = async () => {
    setIsLeaveConfirmModalOpen(false);
    const uid = userProfile?.uid || user?.uid;
    if (classId && uid) {
      await liveClassService.recordLeaveAttendance(classId, uid).catch(() => {});
    }
    if (mediaClientRef.current) {
      try {
        await mediaClientRef.current.cleanup();
      } catch (e) {}
    }
    if (classId) {
      socketService.leaveLiveClass(classId);
    }
    toast.info('Left classroom session.');
    navigate('/dashboard/live-classroom');
  };

  // Hardware Controls
  const handleToggleMic = async () => {
    if (mediaClientRef.current) {
      const enabled = await mediaClientRef.current.toggleMicrophone();
      setMicOn(enabled);
      toast.info(enabled ? '🎙️ Microphone unmuted' : '🔇 Microphone muted');
    } else {
      setMicOn((prev) => {
        const next = !prev;
        toast.info(next ? '🎙️ Microphone unmuted' : '🔇 Microphone muted');
        return next;
      });
    }
  };

  const handleToggleCam = async () => {
    if (mediaClientRef.current) {
      const enabled = await mediaClientRef.current.toggleCamera();
      setCamOn(enabled);
      toast.info(enabled ? '📹 Camera turned on' : '📷 Camera turned off');
    } else {
      setCamOn((prev) => {
        const next = !prev;
        toast.info(next ? '📹 Camera turned on' : '📷 Camera turned off');
        return next;
      });
    }
  };

  const handleToggleScreenShare = async () => {
    if (mediaClientRef.current) {
      if (isScreenSharing) {
        mediaClientRef.current.stopScreenShare();
        setIsScreenSharing(false);
        toast.info('⏹️ Screen sharing stopped');
      } else {
        const stream = await mediaClientRef.current.startScreenShare();
        if (stream) {
          setIsScreenSharing(true);
          toast.info('🖥️ Screen sharing started');
        }
      }
    } else {
      setIsScreenSharing((prev) => !prev);
    }
  };

  // Whiteboard & Lock Controls
  const handleToggleWhiteboard = (open: boolean) => {
    setIsWhiteboardOpen(open);
    if (isInstructor && socket) {
      socket.emit('toggle_whiteboard', { classId, isOpen: open });
    }
  };

  const handleToggleLock = () => {
    if (!socket || !isInstructor) return;
    socket.emit('toggle_lock', { classId, liveClassId: classId, locked: !isLocked });
  };

  const handleMuteAllStudents = () => {
    if (!socket || !isInstructor) return;
    socket.emit('mute_all_students', { classId, liveClassId: classId });
    toast.success('🔇 Muted all student microphones.');
  };

  const handleToggleChatMute = (mute: boolean) => {
    if (!socket || !isInstructor) return;
    socket.emit('toggle_chat_mute', { classId, liveClassId: classId, isMuted: mute });
    setIsChatMuted(mute);
    toast.info(mute ? '💬 Classroom chat muted for students' : '💬 Classroom chat re-enabled');
  };

  // Student Hand Raise Toggle
  const handleToggleHandRaise = () => {
    if (!socket || isInstructor || !userProfile) return;

    if (hasRaisedHand) {
      socket.emit('hand:lower', { liveClassId: classId, classId });
      setHasRaisedHand(false);
      toast.info('Hand lowered.');
    } else {
      socket.emit('raise_hand', {
        classId,
        liveClassId: classId,
        userId: userProfile.uid,
        userName: resolvedDisplayName,
      });
      setHasRaisedHand(true);
      toast.success('🖐️ Hand raised. Instructor has been notified.');
    }
  };

  // Instructor Acknowledges Student Hand
  const handleAcknowledgeHand = (studentId: string) => {
    if (!socket || !isInstructor) return;
    socket.emit('hand:acknowledge', {
      classId,
      liveClassId: classId,
      studentId,
    });
    setRaisedHands((prev) => prev.filter((h) => h.userId !== studentId));
    toast.success('Acknowledged student hand raise.');
  };

  // Broadcast Announcement
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !announcementText.trim() || !isInstructor) return;

    setIsSendingAnnouncement(true);
    try {
      await socketService.sendAnnouncement(classId, announcementText.trim(), announcementPriority);
      toast.success('Announcement broadcast to live classroom!');
      setAnnouncementText('');
      setIsAnnouncementModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send announcement');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  // Notes & Recording Modals
  const handleSaveNotes = async () => {
    if (!liveClassData || !notesUrlInput.trim()) return;
    await liveClassService.updateLiveClass(liveClassData.id, { notesUrl: notesUrlInput.trim() });
    toast.success('Lecture notes attached & published to students!');
    setIsNotesModalOpen(false);
    setNotesUrlInput('');
  };

  const handleSaveRecording = async () => {
    if (!liveClassData || !recordingUrlInput.trim()) return;
    await liveClassService.updateLiveClass(liveClassData.id, { recordingUrl: recordingUrlInput.trim() });
    toast.success('Session video recording attached & published!');
    setIsRecordingModalOpen(false);
    setRecordingUrlInput('');
  };

  const handleOpenAttendanceRoster = () => {
    if (!classId) return;
    const records = liveClassService.getAttendanceRecords(classId);
    setAttendanceRecords(records);
    setIsAttendanceOpen(true);
  };

  // Participant Moderation (Instructor only)
  const handleMuteParticipant = (targetUserId: string) => {
    if (!socket || !isInstructor) return;
    mediaClientRef.current?.muteParticipant(targetUserId);
    socket.emit('mute_student', { classId, userId: targetUserId, isMuted: true });
    toast.info('Muted participant microphone.');
  };

  const handleKickParticipant = (targetUserId: string) => {
    if (!socket || !isInstructor) return;
    mediaClientRef.current?.kickParticipant(targetUserId);
    socket.emit('kick_participant', { classId, userId: targetUserId });
    toast.info('Removed participant from classroom.');
  };

  // =========================================================================
  // VIEW RENDERERS
  // =========================================================================

  // 1. Loading State
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Sora']">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading KaizenQ Live Classroom...</p>
        </div>
      </div>
    );
  }

  // 2. Access Denied State
  if (!authCheck.authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-['Sora'] px-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-xl font-heading font-extrabold text-white">Access Denied</h3>
          <p className="text-sm text-slate-400">
            {authCheck.reason || 'You are not authorized to access this live class session.'}
          </p>
          <div className="pt-2">
            {authCheck.code === 'UNAUTHENTICATED' ? (
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-sky-500/20"
              >
                Login to KaizenQ
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard/live-classroom')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Return to Live Sessions Schedule
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Post-Class / Ended Screen
  if (classEnded || normStatus === 'ENDED' || normStatus === 'COMPLETED' || normStatus === 'CANCELLED') {
    if (classEndedReason === 'CANCELLED' && liveClassData && liveClassData.status !== 'CANCELLED') {
      liveClassData.status = 'CANCELLED' as any;
    }
    return (
      <PostClassView
        classId={classId || ''}
        liveClassData={liveClassData}
        userRole={(userProfile?.role as any) || (isInstructor ? 'instructor' : 'student')}
        currentUserId={userProfile?.uid || user?.uid}
        userDisplayName={resolvedDisplayName}
      />
    );
  }

  // 4. SCHEDULED State — Instructor Pre-Flight vs Student Standby Room
  if (normStatus === 'SCHEDULED') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-['Sora'] flex flex-col justify-between">
        {/* Scheduled Top Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/live-classroom')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Return to Schedule"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white truncate max-w-md">{liveClassData?.title}</h2>
              <p className="text-xs text-slate-400">{liveClassData?.courseName}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>SCHEDULED</span>
          </span>
        </header>

        {/* Scheduled Main Content Card */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Class Details Banner */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  {liveClassData?.courseName || 'Core Curriculum'}
                </span>
                {liveClassData?.difficulty && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium">
                    {liveClassData.difficulty}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white leading-tight">
                {liveClassData?.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                {liveClassData?.description || 'Interactive deep dive live session with practical demonstrations and real-time student interaction.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs relative z-10">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <span className="text-slate-400 font-medium">Scheduled Date & Time</span>
                  <p className="font-bold text-white">
                    {liveClassData?.startTime ? new Date(liveClassData.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today, Scheduled'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 font-medium">Estimated Duration</span>
                  <p className="font-bold text-white">{liveClassData?.duration || 90} Minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                  {liveClassData?.instructorName?.charAt(0) || 'I'}
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assigned Instructor</span>
                  <p className="font-bold text-white">{liveClassData?.instructorName || 'Assigned Instructor'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 font-medium">Class Capacity</span>
                  <p className="font-bold text-white">{liveClassData?.maxParticipants || 100} Learners</p>
                </div>
              </div>
            </div>

            {/* Primary Action Area */}
            <div className="pt-2 relative z-10">
              {isAssignedInstructor ? (
                <div className="space-y-3 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Designated Instructor: You are authorized to start this live session</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDeviceSettingsOpen(true)}
                      className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                    >
                      <Settings className="w-4 h-4 text-sky-400" />
                      <span>Check Camera & Mic</span>
                    </button>
                    <button
                      onClick={handleStartLiveClass}
                      disabled={isStartingClass}
                      className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-60"
                    >
                      {isStartingClass ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Starting Live Classroom...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span>START LIVE CLASS</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Clicking will transition the session to LIVE, initialize the WebRTC media mesh & Socket.IO signaling, and notify all enrolled students.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sky-400 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                    <span>Waiting for assigned instructor to start the live class...</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Instructor <strong className="text-white">{liveClassData?.instructorName || 'Lead Mentor'}</strong> has not commenced the broadcast yet. This screen will automatically launch into the live classroom the instant the instructor starts the session.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeviceSettingsOpen(true)}
                    className="py-2.5 px-4 mx-auto rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-sky-400" />
                    <span>Test Audio & Video Preview</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Scheduled Footer */}
        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
          KaizenQ Live Classroom Infrastructure • Real-time Socket.IO signaling active
        </footer>
      </div>
    );
  }

  // 5. LIVE Classroom View
  const currentUser = {
    uid: userProfile?.uid || user?.uid || 'guest',
    name: resolvedDisplayName,
    role: (isInstructor ? 'instructor' : 'student') as 'instructor' | 'mentor' | 'student',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Sora'] select-none overflow-x-hidden">
      
      {/* 1. CLASSROOM TOP HEADER */}
      <header className="bg-slate-900 border-b border-sky-500/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
        
        {/* Mentor Profile & Class Banner */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {liveClassData?.instructorAvatar ? (
              <img
                src={liveClassData.instructorAvatar}
                alt={liveClassData.instructorName || 'Instructor'}
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-400 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center border-2 border-sky-400 shadow-md">
                {(liveClassData?.instructorName || 'M').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-black text-sm text-white truncate max-w-sm sm:max-w-md">
                {liveClassData?.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {liveClassData?.courseName} • Instructor: <strong className="text-sky-300">{liveClassData?.instructorName}</strong>
            </p>
          </div>
        </div>

        {/* Center Live Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-mono">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>{onlineCount} Live Participants</span>
          </div>

          {isRecording && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-xl animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>REC</span>
            </span>
          )}

          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-xl shadow-xs">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>PRIVATE / LOCKED</span>
            </span>
          )}

          {/* Dual Connection Status: Realtime Socket + WebRTC Media */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Realtime Socket Indicator */}
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                connectionStatus === 'connected'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : connectionStatus === 'reconnecting'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : connectionStatus === 'disconnected'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  : 'text-slate-500 bg-slate-800 border-slate-700'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>
                Realtime:{' '}
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'reconnecting'
                  ? 'Reconnecting...'
                  : connectionStatus === 'disconnected'
                  ? 'Disconnected'
                  : 'Connecting...'}
              </span>
            </div>

            {/* WebRTC Media Stream Indicator */}
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                mediaConnectionState === 'connected'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : mediaConnectionState === 'connecting' || mediaConnectionState === 'authenticating'
                  ? 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                  : mediaConnectionState === 'reconnecting'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : mediaConnectionState === 'failed'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  : 'text-slate-500 bg-slate-800 border-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>
                Media:{' '}
                {mediaConnectionState === 'connected'
                  ? 'Connected'
                  : mediaConnectionState === 'connecting' || mediaConnectionState === 'authenticating'
                  ? 'Connecting...'
                  : mediaConnectionState === 'reconnecting'
                  ? 'Reconnecting...'
                  : mediaConnectionState === 'failed'
                  ? 'Failed'
                  : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSidebarOpen ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Right Panel"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {isInstructor ? (
            <button
              onClick={() => setIsEndConfirmModalOpen(true)}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>End Class</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLeaveConfirmModalOpen(true)}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Class</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN CENTER STAGE & INTERACTIVE RESPONSIVE LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 overflow-hidden">
        
        {/* Main Live Media Stage */}
        <div
          className={`${
            isSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'
          } bg-slate-900 border border-sky-500/10 rounded-3xl overflow-hidden flex flex-col justify-between relative shadow-2xl transition-all duration-300`}
        >
          {/* Media Player Frame */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* Floating Live Announcement Banner */}
            {announcements.length > 0 && (
              <div className="absolute top-3 inset-x-4 z-30">
                <LiveAnnouncementBanner announcements={announcements} />
              </div>
            )}

            {/* Hand Raised Queue Banner (Instructor View) */}
            {isInstructor && raisedHands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-16 right-4 max-w-sm space-y-2 z-30"
              >
                {raisedHands.slice(-2).map((h) => (
                  <div
                    key={h.userId}
                    className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-amber-400 fill-current animate-bounce shrink-0" />
                      <span className="font-bold text-white truncate">{h.userName} raised hand</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAcknowledgeHand(h.userId)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer shadow-sm"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => setRaisedHands((prev) => prev.filter((x) => x.userId !== h.userId))}
                        className="text-slate-400 hover:text-white text-[10px] font-bold p-1 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Floating Resource Badges Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
              {liveClassData?.notesUrl && (
                <a
                  href={liveClassData.notesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-900 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes</span>
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
                  <span>Recording</span>
                </a>
              )}
            </div>

            {/* Active Speaker Floating Badge */}
            {activeSpeakerInfo && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-xl pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">Active Speaker: {activeSpeakerInfo.name}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
                  {activeSpeakerInfo.role}
                </span>
              </div>
            )}

            {/* Core WebRTC Video Grid Container */}
            <KaizenQClassroom
              classId={classId!}
              userId={user?.uid || userProfile?.uid || 'guest'}
              userName={resolvedDisplayName}
              role={isInstructor ? 'instructor' : 'student'}
              onClientReady={(client) => {
                mediaClientRef.current = client;
                setMicOn(client.getIsAudioEnabled());
                setCamOn(client.getIsVideoEnabled());
              }}
              onMediaConnectionStateChange={(state) => {
                setMediaConnectionState(state);
              }}
              onLeaveOrEndClass={isInstructor ? () => setIsEndConfirmModalOpen(true) : () => setIsLeaveConfirmModalOpen(true)}
            />
          </div>

          {/* 3. DYNAMIC BOTTOM TOOLBAR CONTROLS */}
          <footer className="bg-slate-950 border-t border-sky-500/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-10">
            
            {/* Left Controls: Hardware Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMic}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  micOn ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                }`}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleCam}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  camOn ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                }`}
                title={camOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {camOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleScreenShare}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isScreenSharing ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleWhiteboard(!isWhiteboardOpen)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isWhiteboardOpen ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-300'
                }`}
                title="Interactive Whiteboard"
              >
                <Pencil className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Whiteboard</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeviceSettingsOpen(true)}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                title="Audio & Video Device Settings"
              >
                <Settings className="w-4 h-4 text-sky-400" />
              </button>
            </div>

            {/* Center Controls: Role-Specific Toolset */}
            <div className="flex items-center gap-2 flex-wrap">
              {isInstructor ? (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('participants');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'participants' && isSidebarOpen
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Participants ({onlineCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'chat' && isSidebarOpen
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('questions');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'questions' && isSidebarOpen
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Q&A</span>
                  </button>

                  <button
                    onClick={() => setIsPollModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-500/20 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Poll</span>
                  </button>

                  <button
                    onClick={() => setIsQuizModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-500/20 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Quiz</span>
                  </button>

                  <button
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-500/20 cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Announcement</span>
                  </button>

                  <button
                    onClick={handleOpenAttendanceRoster}
                    className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Attendance</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'chat' && isSidebarOpen
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('questions');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'questions' && isSidebarOpen
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Q&A</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('participants');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'participants' && isSidebarOpen
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Participants ({onlineCount})</span>
                  </button>

                  {/* Student Raise Hand Button with active toggle state */}
                  <button
                    onClick={handleToggleHandRaise}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      hasRaisedHand
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 animate-pulse'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    <Hand className="w-4 h-4 fill-current" />
                    <span>{hasRaisedHand ? 'Hand Raised (Lower)' : 'Raise Hand'}</span>
                  </button>

                  <button
                    onClick={() => setIsPollModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Vote Poll</span>
                  </button>

                  <button
                    onClick={() => setIsQuizModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Take Quiz</span>
                  </button>
                </>
              )}
            </div>

            {/* Right Controls: Instructor Controls & Exit Actions */}
            <div className="flex items-center gap-2">
              {isInstructor ? (
                <>
                  <button
                    onClick={() => setIsRestrictModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/20 cursor-pointer"
                    title="Mute All, Lock Room"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Restrict</span>
                  </button>

                  <button
                    onClick={handleToggleLock}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLocked ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300' : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{isLocked ? 'Locked' : 'Lock'}</span>
                  </button>

                  <button
                    onClick={() => setIsEndConfirmModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End Class</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLeaveConfirmModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave</span>
                </button>
              )}
            </div>

          </footer>

        </div>

        {/* Right Side Panel: Participants / Chat / Q&A */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 border border-sky-500/10 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300">
            
            {/* Tab Selector Header */}
            <div className="bg-slate-950/70 p-2 border-b border-sky-500/10 flex items-center gap-1">
              {isInstructor ? (
                <>
                  <button
                    onClick={() => setActiveTab('participants')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'participants'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Roster ({onlineCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'chat'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'questions'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Q&A</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'chat'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'questions'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Q&A</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('participants')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'participants'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Roster ({onlineCount})</span>
                  </button>
                </>
              )}
            </div>

            {/* Tab Widget Content Frame */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'chat' && (
                <LiveChatWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
              )}
              {activeTab === 'questions' && (
                <LiveQuestionsWidget classId={classId || ''} currentUser={currentUser} />
              )}
              {activeTab === 'participants' && (
                <div className="space-y-4 font-['Sora']">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Classroom Roster</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold">
                      {onlineCount} Online
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {participants.length === 0 ? (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-xs">
                            {(resolvedDisplayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{resolvedDisplayName}</p>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {isInstructor ? 'Instructor (You)' : 'Student (You)'}
                            </span>
                          </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                    ) : (
                      participants.map((p, idx) => (
                        <div
                          key={p.userId || idx}
                          className="p-3 bg-slate-950 border border-slate-800/90 rounded-2xl flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                p.role === 'instructor' || p.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-slate-800 text-sky-400'
                              }`}
                            >
                              {(p.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-white truncate flex items-center gap-1">
                                <span>{p.name}</span>
                                {p.userId === userProfile?.uid && <span className="text-slate-500 text-[10px]">(You)</span>}
                              </p>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{p.role || 'student'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {raisedHands.some((h) => h.userId === p.userId) && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-0.5 animate-pulse">
                                <Hand className="w-3 h-3 fill-current" />
                                <span>Hand</span>
                              </span>
                            )}

                            {isInstructor && p.role !== 'instructor' && p.role !== 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMuteParticipant(p.userId)}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                                  title="Mute Student"
                                >
                                  <VolumeX className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleKickParticipant(p.userId)}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                                  title="Remove from Classroom"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS (WHITEBOARD, ANNOUNCEMENTS, POLL, QUIZ, ATTENDANCE, CONFIRM)     */}
      {/* ========================================================================= */}

      {/* Interactive Whiteboard Modal */}
      {isWhiteboardOpen && (
        <InteractiveWhiteboard
          isInstructor={Boolean(isInstructor)}
          socket={socket}
          classId={classId || ''}
          onClose={() => handleToggleWhiteboard(false)}
        />
      )}

      {/* Broadcast Announcement Modal (Instructor) */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <h3 className="font-heading font-black text-base text-white">Broadcast Announcement</h3>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-bold">Announcement Message</label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g., Quick 5-minute break. Next we cover virtual memory page tables."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-medium">Priority Level:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncementPriority('normal')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      announcementPriority === 'normal'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementPriority('urgent')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      announcementPriority === 'urgent'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingAnnouncement || !announcementText.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSendingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Poll Drawer / Modal */}
      {isPollModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-heading font-black text-base text-white">Live Audience Poll</h3>
              </div>
              <button
                onClick={() => setIsPollModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <LivePollWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}

      {/* Live Quiz Drawer / Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-black text-base text-white">Live Interactive Quiz</h3>
              </div>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <LiveQuizWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}

      {/* Live Attendance Roster Drawer (Instructor) */}
      {isAttendanceOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-sky-500/20 max-w-md w-full h-full p-6 shadow-2xl overflow-y-auto space-y-5 font-['Sora'] animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-base text-white">Live Attendance Roster</h3>
              </div>
              <button onClick={() => setIsAttendanceOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">{attendanceRecords.length} Student Attendance Records</p>

            <div className="space-y-2">
              {attendanceRecords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No attendance records logged yet for this session.</p>
              ) : (
                attendanceRecords.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-medium">
                    <div>
                      <p className="font-bold text-white">{r.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.studentEmail}</p>
                      <span className="text-[10px] text-slate-500">Joined: {r.joinedAt}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Lecture Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-base text-white">Share Lecture Notes / PDF URL</h3>
              <button onClick={() => setIsNotesModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">Enter PDF URL or Google Drive link to attach for live participants:</p>
              <input
                type="url"
                value={notesUrlInput}
                onChange={(e) => setNotesUrlInput(e.target.value)}
                placeholder="https://kaizenq.in/notes/linux-kernel-mem.pdf"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md cursor-pointer">
                Publish Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording URL Modal */}
      {isRecordingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-base text-white">Publish Video Recording URL</h3>
              <button onClick={() => setIsRecordingModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
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
              <button onClick={() => setIsRecordingModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveRecording} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer">
                Publish Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict Students Control Modal */}
      {isRestrictModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-base text-white">Classroom Moderation & Privacy</h3>
              </div>
              <button onClick={() => setIsRestrictModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Manage live classroom privacy, entry permissions, and silence student interactions in real time.
            </p>

            <div className="space-y-3">
              {/* Classroom Privacy / Lock */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isLocked ? <Lock className="w-5 h-5 text-amber-400" /> : <Unlock className="w-5 h-5 text-emerald-400" />}
                  <div>
                    <p className="text-xs font-bold text-white">Room Privacy & Lock</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isLocked ? '🔒 Private Session (New students blocked)' : '🔓 Open Session (Anyone can join)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleLock}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isLocked
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {isLocked ? 'Unlock (Open)' : 'Make Private'}
                </button>
              </div>

              {/* Mute All Microphones */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <VolumeX className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Mute All Student Microphones</p>
                    <p className="text-[10px] text-slate-400 font-medium">Instantly silence all student microphones</p>
                  </div>
                </div>
                <button
                  onClick={handleMuteAllStudents}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/20 transition-all"
                >
                  Mute All
                </button>
              </div>

              {/* Chat Moderation */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isChatMuted ? <MessageSquareOff className="w-5 h-5 text-rose-400" /> : <MessageSquare className="w-5 h-5 text-sky-400" />}
                  <div>
                    <p className="text-xs font-bold text-white">Classroom Chat Moderation</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isChatMuted ? '🔇 Chat is currently muted for students' : '💬 Students can post in live chat'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleChatMute(!isChatMuted)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isChatMuted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30'
                  }`}
                >
                  {isChatMuted ? 'Unmute Chat' : 'Mute Chat'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsRestrictModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Controls
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Classroom End Confirmation Modal (Instructor) */}
      <LiveClassConfirmModal
        isOpen={isEndConfirmModalOpen}
        actionType="exit"
        classTitle={liveClassData?.title || 'Live Technical Session'}
        courseName={liveClassData?.courseName || 'AI Engineering Track'}
        instructorName={liveClassData?.instructorName || 'Lead Mentor'}
        onlineCount={onlineCount}
        durationFormatted={formatTime(secondsElapsed)}
        isInstructor={true}
        onConfirm={handleConfirmEndClass}
        onCancel={() => setIsEndConfirmModalOpen(false)}
      />

      {/* Live Classroom Leave Confirmation Modal (Student) */}
      <LiveClassConfirmModal
        isOpen={isLeaveConfirmModalOpen}
        actionType="exit"
        classTitle={liveClassData?.title || 'Live Technical Session'}
        courseName={liveClassData?.courseName || 'AI Engineering Track'}
        instructorName={liveClassData?.instructorName || 'Lead Mentor'}
        onlineCount={onlineCount}
        durationFormatted={formatTime(secondsElapsed)}
        isInstructor={false}
        onConfirm={handleConfirmLeaveClass}
        onCancel={() => setIsLeaveConfirmModalOpen(false)}
      />

      {/* Media Device Settings Modal */}
      <DeviceSettingsModal
        isOpen={isDeviceSettingsOpen}
        onClose={() => setIsDeviceSettingsOpen(false)}
        isMicOn={micOn}
        isCamOn={camOn}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        onSwitchCamera={(deviceId) => mediaClientRef.current?.switchCamera(deviceId) ?? Promise.resolve(false)}
        onSwitchMicrophone={(deviceId) => mediaClientRef.current?.switchMicrophone(deviceId) ?? Promise.resolve(false)}
      />

      {/* Ask to Unmute Interactive Modal */}
      {unmuteRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Mic className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Microphone Request</h4>
              <p className="text-xs text-slate-300 mt-1">
                <strong>{unmuteRequest.instructorName}</strong> has requested you to unmute your microphone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setUnmuteRequest(null);
                  if (!micOn) handleToggleMic();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
              >
                Unmute Mic
              </button>
              <button
                onClick={() => setUnmuteRequest(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
              >
                Keep Muted
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveClassroomScreen;

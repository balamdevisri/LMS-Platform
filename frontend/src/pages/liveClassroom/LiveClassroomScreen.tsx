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
import type { MediaConnectionState, IMediaClient } from '@/services/liveMedia/mediaTypes';
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
  const [isInstructorOnline, setIsInstructorOnline] = useState<boolean>(false);

  // Pre-flight Start Class Action State
  const [isStartingClass, setIsStartingClass] = useState(false);

  // Classroom Telemetry & Presence States
  const [onlineCount, setOnlineCount] = useState(1);
  const [participants, setParticipants] = useState<any[]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Hardware States
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [isMicLocked, setIsMicLocked] = useState(true);
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

  // 1-to-1 Interaction Session State
  const [activeInteraction, setActiveInteraction] = useState<{
    classId: string;
    instructorId: string;
    instructorName: string;
    studentId: string;
    studentName: string;
    status: 'invited' | 'active' | 'declined' | 'ended';
    startedAt: string;
  } | null>(null);
  const [interactionInviteModal, setInteractionInviteModal] = useState<{
    classId: string;
    instructorId: string;
    instructorName: string;
    studentId: string;
  } | null>(null);

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

  // Runtime diagnostics logging (Phase 1)
  useEffect(() => {
    if (liveClassData) {
      console.log(`[LIVE_DEBUG] liveClassData: classId=${classId} status=${liveClassData.status}`);
      console.log(`[LIVE_DEBUG] instructorId: ${liveClassData.instructorId || 'NONE'} (createdBy=${liveClassData.createdBy || 'NONE'})`);
      console.log(`[LIVE_DEBUG] instructorName: ${liveClassData.instructorName || 'NONE'}`);
      console.log(`[LIVE_DEBUG] Student identity: userId=${user?.uid || userProfile?.uid} role=${userProfile?.role} isInstructor=${isInstructor}`);
      console.log(`[LIVE_DEBUG] current authenticated user role: ${userProfile?.role}`);
    }
  }, [liveClassData, user, userProfile, isInstructor, classId]);

  // Synchronize mic lock: instructors and administrators have their microphone unlocked
  useEffect(() => {
    if (isInstructor) {
      setIsMicLocked(false);
    }
  }, [isInstructor]);

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

  const mediaClientRef = useRef<IMediaClient | null>(null);
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
          instructorId: userProfile?.role === 'instructor' ? userProfile.uid : 'instructor_lead',
          instructorName: userProfile?.role === 'instructor' ? (userProfile.name || userProfile.fullName || 'Faculty Instructor') : 'Assigned Instructor',
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
    if (!classId || authLoading || (!user && !userProfile)) return;

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
          const s = socketInstance || socketService.getSocket();
          if (!s) return;

          const userRole = isInstructor ? 'instructor' : 'student';
          console.log("[Live Classroom] Socket connected:", s.id);
          console.log("[Live Classroom] Joining room:", classId);
          console.log("[Live Classroom] Role:", userRole);

          const joinKey = `${s.id || 'sock'}:${classId}:${currentUserUid}:${userRole}`;
          if (hasJoinedRef.current === joinKey) {
            return;
          }
          hasJoinedRef.current = joinKey;
          (s as any)._hasJoinedLiveClass = classId;

          const joinPayload = {
            classId,
            liveClassId: classId,
            classroomId: classId,
            userId: currentUserUid,
            senderId: currentUserUid,
            name: resolvedDisplayName,
            senderName: resolvedDisplayName,
            role: userRole,
            senderRole: userRole,
          };

          s.emit('join_class', joinPayload, (res: any) => {
            if (res && res.success) {
              console.log("[Live Classroom] Chat connection ready");
              if (res.status) {
                const upperStatus = String(res.status).toUpperCase();
                setLiveClassData((prev) => (prev ? { ...prev, status: upperStatus as any } : null));
                if (upperStatus === 'LIVE') {
                  setClassEnded(false);
                }
              }
              if (res.isInstructorOnline !== undefined) {
                setIsInstructorOnline(Boolean(res.isInstructorOnline));
              }
              if (res.onlineCount !== undefined) {
                setOnlineCount(Math.max(1, res.onlineCount));
              }
              if (res.participants && Array.isArray(res.participants)) {
                setParticipants(res.participants);
              }
              if (res.interactionSession !== undefined) {
                setActiveInteraction(res.interactionSession);
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
            s.emit('attendance:join', { liveClassId: classId });
          }
        };

        if (socketInstance.connected) {
          performAuthoritativeJoin();
        }
        socketInstance.on('connect', performAuthoritativeJoin);

        // Authoritative State Snapshot on Join
        socketInstance.on('liveClass:joined', (res: any) => {
          if (res?.status) {
            const upperStatus = String(res.status).toUpperCase();
            setLiveClassData((prev) => (prev ? { ...prev, status: upperStatus as any } : null));
            if (upperStatus === 'LIVE') {
              setClassEnded(false);
            }
          }
          if (res?.isInstructorOnline !== undefined) {
            setIsInstructorOnline(Boolean(res.isInstructorOnline));
          }
          if (res?.onlineCount !== undefined) {
            setOnlineCount(Math.max(1, res.onlineCount));
          }
          if (res?.participants && Array.isArray(res.participants)) {
            setParticipants(res.participants);
          }
          if (res?.interactionSession !== undefined) {
            setActiveInteraction(res.interactionSession);
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

        socketInstance.on('liveClass:presence', (data: { onlineCount: number; participants?: any[]; interactionSession?: any }) => {
          if (data.onlineCount !== undefined) {
            setOnlineCount(Math.max(1, data.onlineCount));
          }
          if (data.participants && Array.isArray(data.participants)) {
            setParticipants(data.participants);
          }
          if (data.interactionSession !== undefined) {
            setActiveInteraction(data.interactionSession);
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

        // Real-Time Audience Poll Listeners (Phase 12)
        const handleIncomingPoll = (poll: any) => {
          if (!poll) return;
          const questionText = poll.question || 'New audience poll';
          toast.info(`📊 Poll from instructor: "${questionText}"`, {
            duration: 9000,
            action: {
              label: 'Vote Now',
              onClick: () => setIsPollModalOpen(true),
            },
          });
          if (!isInstructor) {
            setIsPollModalOpen(true);
          }
        };

        socketInstance.on('poll:start', handleIncomingPoll);
        socketInstance.on('poll_published', handleIncomingPoll);

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

        socketInstance.on('liveClass:joined', (data: any) => {
          if (!isInstructor && data?.moderation) {
            const isGranted = data.moderation.micPermission === 'granted';
            setIsMicLocked(!isGranted);
          }
        });

        socketInstance.on('liveClass:moderation:micAllowed', (data: { userId: string }) => {
          const myId = user?.uid || userProfile?.uid;
          if (data.userId === myId) {
            setIsMicLocked(false);
            toast.success('🎙️ The instructor granted you permission to unmute!');
          }
        });

        socketInstance.on('liveClass:moderation:muteAll', () => {
          if (!isInstructor) {
            toast.warning('🔇 All student microphones have been muted and locked by the instructor.');
            setMicOn(false);
            setIsMicLocked(true);
            if (mediaClientRef.current) {
              mediaClientRef.current.muteMicrophone().catch(() => {});
            }
          }
        });

        socketInstance.on('liveClass:moderation:muted', (data: { userId: string }) => {
          const myId = user?.uid || userProfile?.uid;
          if (data.userId === myId) {
            toast.warning('🔇 Your microphone is locked by the instructor.');
            setMicOn(false);
            if (!isInstructor) {
              setIsMicLocked(true);
            }
            if (mediaClientRef.current) {
              mediaClientRef.current.muteMicrophone().catch(() => {});
            }
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
            setIsMicLocked(true);
            toast.info('🔇 Instructor has muted all student microphones.');
          }
        });

        // 1-to-1 Interaction Session Listeners
        socketInstance.on('liveClass:interaction:invited', (data: any) => {
          const myId = user?.uid || userProfile?.uid;
          if (data && data.studentId === myId) {
            setInteractionInviteModal(data);
            toast.info(`🎙️ ${data.instructorName || 'Instructor'} invited you to speak live!`, {
              duration: 10000,
            });
          }
        });

        socketInstance.on('liveClass:interaction:active', (data: any) => {
          if (data?.session) {
            setActiveInteraction(data.session);
            const myId = user?.uid || userProfile?.uid;
            if (data.session.studentId === myId) {
              setIsMicLocked(false);
              toast.success(`🎙️ You are now in 1-to-1 live interaction with ${data.session.instructorName}! Your mic is unlocked.`);
            } else if (isInstructor) {
              toast.success(`🎙️ 1-to-1 live interaction active with ${data.session.studentName}!`);
            }
          }
        });

        socketInstance.on('liveClass:interaction:declined', (data: any) => {
          if (isInstructor) {
            toast.info(`Student ${data?.studentName || 'Student'} declined the invitation to speak.`);
          }
        });

        socketInstance.on('liveClass:interaction:ended', (data: any) => {
          setActiveInteraction(null);
          const myId = user?.uid || userProfile?.uid;
          if (data?.studentId === myId) {
            setIsMicLocked(true);
            setMicOn(false);
            if (mediaClientRef.current) {
              mediaClientRef.current.muteMicrophone().catch(() => {});
            }
            toast.info('🎙️ 1-to-1 interaction session ended. Microphone locked.');
          }
        });

        socketInstance.on('liveClass:interaction:state', (data: any) => {
          if (data && data.session !== undefined) {
            setActiveInteraction(data.session);
          }
        });

        socketInstance.on('liveClass:moderation:micsLocked', (data: any) => {
          if (!isInstructor) {
            setIsMicLocked(true);
            setMicOn(false);
            if (mediaClientRef.current) {
              mediaClientRef.current.muteMicrophone().catch(() => {});
            }
            toast.warning(`🔇 All student microphones have been locked by ${data?.lockedBy || 'Instructor'}.`);
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

        // Instructor Connection Presence Listeners
        socketInstance.on('liveClass:instructor_joined', () => {
          setIsInstructorOnline(true);
          toast.success('👨‍🏫 Instructor has joined the classroom.');
        });

        socketInstance.on('instructor:connected', () => {
          setIsInstructorOnline(true);
        });

        socketInstance.on('liveClass:instructor_left', () => {
          setIsInstructorOnline(false);
          toast.info('Instructor stepped out momentarily.');
        });

        socketInstance.on('instructor:disconnected', () => {
          setIsInstructorOnline(false);
        });

        // Uniform Teardown and Auto-End Function
        const handleTeardownAndEnd = (reason: 'ENDED' | 'CANCELLED' = 'ENDED') => {
          setClassEndedReason(reason);
          setClassEnded(true);
          setLiveClassData((prev) => (prev ? { ...prev, status: reason === 'CANCELLED' ? 'CANCELLED' as any : 'Completed' } : null));

          // 1. Completely teardown student-side WebRTC media connections (peer connections, streams, tracks)
          try {
            if (mediaClientRef.current) {
              mediaClientRef.current.cleanup().catch(() => {});
            }
          } catch {}

          // 2. Stop local tracks & reset UI toggles
          setMicOn(false);
          setCamOn(false);
          setIsScreenSharing(false);

          // 3. Leave signaling room
          if (classId) {
            socketService.leaveLiveClass(classId);
          }

          // 4. Show user confirmation
          toast.info(reason === 'CANCELLED' ? '❌ Live class has been cancelled.' : '🎓 Class has ended. Returning to dashboard...', {
            duration: 3500,
          });

          // 5. Force-transition students out of classroom view automatically after brief delay
          if (!isInstructor) {
            setTimeout(() => {
              navigate('/dashboard/live-classroom');
            }, 2500);
          }
        };

        // Live Class Status Changes
        socketInstance.on('liveClass:status', (data: { liveClassId: string; status: string }) => {
          const s = (data.status || '').toUpperCase();
          if (s === 'LIVE') {
            setLiveClassData((prev) => (prev ? { ...prev, status: 'LIVE' } : null));
            setClassEnded(false);
            toast.success('🔴 CLASS IS NOW LIVE! Session started.');
          } else if (s === 'ENDED' || s === 'COMPLETED' || s === 'CANCELLED') {
            handleTeardownAndEnd(s === 'CANCELLED' ? 'CANCELLED' : 'ENDED');
          }
        });

        socketInstance.on('live_class_started', () => {
          setLiveClassData((prev) => (prev ? { ...prev, status: 'LIVE' } : null));
          setClassEnded(false);
          toast.success('🔴 CLASS IS NOW LIVE! Welcome to the classroom.');
        });

        socketInstance.on('live_class_ended', () => {
          handleTeardownAndEnd('ENDED');
        });

        socketInstance.on('session:ended', () => {
          handleTeardownAndEnd('ENDED');
        });

        socketInstance.on('liveClass:ended', () => {
          handleTeardownAndEnd('ENDED');
        });

        socketInstance.on('kicked', (data: { message?: string }) => {
          toast.error(data?.message || 'You have been removed from the classroom.');
          handleTeardownAndEnd('ENDED');
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
        socketInstance.off('poll:start');
        socketInstance.off('poll_published');
        socketInstance.off('lock_toggled');
        socketInstance.off('whiteboard_toggled');
        socketInstance.off('liveClass:instructor_joined');
        socketInstance.off('instructor:connected');
        socketInstance.off('liveClass:instructor_left');
        socketInstance.off('instructor:disconnected');
        socketInstance.off('liveClass:status');
        socketInstance.off('live_class_started');
        socketInstance.off('live_class_ended');
        socketInstance.off('session:ended');
        socketInstance.off('liveClass:ended');
        socketInstance.off('liveClass:joined');
        socketInstance.off('liveClass:error');
        socketInstance.off('liveClass:interaction:invited');
        socketInstance.off('liveClass:interaction:active');
        socketInstance.off('liveClass:interaction:declined');
        socketInstance.off('liveClass:interaction:ended');
        socketInstance.off('liveClass:interaction:state');
        socketInstance.off('liveClass:moderation:micsLocked');
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
    if (!isInstructor && isMicLocked) {
      toast.warning("Microphone is locked by the instructor. Use 'Raise Hand' to request to speak.");
      return;
    }
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
    // Auto-allow mic when instructor acknowledges raised hand
    socket.emit('liveClass:moderation:allowMic', { classId, userId: studentId });
    setRaisedHands((prev) => prev.filter((h) => h.userId !== studentId));
    toast.success('Acknowledged student & granted microphone permission.');
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
    socket.emit('liveClass:moderation:mute', { classId, userId: targetUserId });
    toast.info('Muted and locked participant microphone.');
  };

  const handleAllowMicParticipant = (targetUserId: string) => {
    if (!socket || !isInstructor) return;
    socket.emit('liveClass:moderation:allowMic', { classId, userId: targetUserId });
    toast.success('Granted participant microphone permission.');
  };

  const handleToggleChatParticipant = (targetUserId: string, allow: boolean) => {
    if (!socket || !isInstructor) return;
    if (allow) {
      socket.emit('liveClass:moderation:allowChat', { classId, userId: targetUserId });
      toast.success('Granted student chat permission.');
    } else {
      socket.emit('liveClass:moderation:muteChat', { classId, userId: targetUserId });
      toast.info('Locked student chat.');
    }
  };

  const handleKickParticipant = (targetUserId: string) => {
    if (!socket || !isInstructor) return;
    mediaClientRef.current?.kickParticipant(targetUserId);
    socket.emit('kick_participant', { classId, userId: targetUserId });
    toast.info('Removed participant from classroom.');
  };

  // 1-to-1 Interaction Actions
  const handleInviteToSpeak = (studentId: string, studentName: string) => {
    if (!socket || !isInstructor || !classId) return;
    socket.emit('liveClass:interaction:invite', {
      classId,
      studentId,
      studentName,
    });
    toast.info(`Sent 1-to-1 speaking invitation to ${studentName}`);
  };

  const handleRespondInteraction = (accepted: boolean) => {
    if (!socket || !classId) return;
    socket.emit('liveClass:interaction:respond', {
      classId,
      accepted,
    });
    setInteractionInviteModal(null);
  };

  const handleEndInteraction = () => {
    if (!socket || !classId) return;
    socket.emit('liveClass:interaction:end', {
      classId,
      studentId: activeInteraction?.studentId,
    });
    setActiveInteraction(null);
    toast.info('Ended 1-to-1 interaction session.');
  };

  const handleLockAllStudentMics = () => {
    if (!socket || !isInstructor || !classId) return;
    socket.emit('liveClass:moderation:lockMics', { classId });
    toast.warning('🔒 Locked all student microphones.');
  };

  const handleRevokeAllStudentMics = () => {
    if (!socket || !isInstructor || !classId) return;
    socket.emit('liveClass:moderation:revokeAll', { classId });
    toast.info('Revoked all student microphone permissions.');
  };

  const handleRequestUnmuteStudent = (targetUserId: string) => {
    if (!socket || !isInstructor || !classId) return;
    socket.emit('liveClass:moderation:requestUnmute', { classId, userId: targetUserId });
    toast.info('Sent unmute request to student.');
  };

  // =========================================================================
  // VIEW RENDERERS
  // =========================================================================

  // 1. Loading State
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FC] text-slate-900 font-['Sora']">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-600">Loading KaizenQ Live Classroom...</p>
        </div>
      </div>
    );
  }

  // 2. Access Denied State
  if (!authCheck.authorized) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] flex flex-col items-center justify-center text-slate-900 font-['Sora'] px-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-heading font-extrabold text-slate-900">Access Denied</h3>
          <p className="text-sm text-slate-600">
            {authCheck.reason || 'You are not authorized to access this live class session.'}
          </p>
          <div className="pt-2">
            {authCheck.code === 'UNAUTHENTICATED' ? (
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Login to KaizenQ
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard/live-classroom')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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

  // 4. Standby / Waiting Room (Scheduled OR Student Waiting for Instructor to Join)
  if (normStatus === 'SCHEDULED' || (!isInstructor && !isInstructorOnline)) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] text-slate-900 font-['Sora'] flex flex-col justify-between">
        {/* Scheduled / Waiting Room Top Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/live-classroom')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Return to Schedule"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">{liveClassData?.title}</h2>
              <p className="text-xs text-slate-500">{liveClassData?.courseName}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full border font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
            normStatus === 'LIVE'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{normStatus === 'LIVE' ? 'WAITING ROOM' : 'SCHEDULED'}</span>
          </span>
        </header>

        {/* Scheduled Main Content Card */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 relative overflow-hidden">
            {/* Class Details Banner */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  {liveClassData?.courseName || 'Core Curriculum'}
                </span>
                {liveClassData?.difficulty && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    {liveClassData.difficulty}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 leading-tight">
                {liveClassData?.title}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {liveClassData?.description || 'Interactive deep dive live session with practical demonstrations and real-time student interaction.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs relative z-10">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-slate-500 font-medium">Scheduled Date & Time</span>
                  <p className="font-bold text-slate-900">
                    {liveClassData?.startTime ? new Date(liveClassData.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today, Scheduled'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-slate-500 font-medium">Estimated Duration</span>
                  <p className="font-bold text-slate-900">{liveClassData?.duration || 90} Minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                  {liveClassData?.instructorName?.charAt(0) || 'I'}
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Assigned Instructor</span>
                  <p className="font-bold text-slate-900">{liveClassData?.instructorName || 'Assigned Instructor'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-500 font-medium">Class Capacity</span>
                  <p className="font-bold text-slate-900">{liveClassData?.maxParticipants || 100} Learners</p>
                </div>
              </div>
            </div>

            {/* Primary Action Area */}
            <div className="pt-2 relative z-10">
              {isAssignedInstructor ? (
                <div className="space-y-3 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Designated Instructor: You are authorized to start this live session</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDeviceSettingsOpen(true)}
                      className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span>Check Camera & Mic</span>
                    </button>
                    <button
                      onClick={handleStartLiveClass}
                      disabled={isStartingClass}
                      className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-60"
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
                  <p className="text-[11px] text-slate-500 text-center">
                    Clicking will transition the session to LIVE, initialize the WebRTC media mesh & Socket.IO signaling, and notify all enrolled students.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                    <span>
                      {normStatus === 'LIVE'
                        ? 'Waiting for instructor to join...'
                        : 'Waiting for assigned instructor to start the live class...'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {normStatus === 'LIVE'
                      ? `The live session is active. Instructor ${liveClassData?.instructorName || 'Lead Mentor'} is connecting. You are currently in the waiting room and will automatically enter the classroom as soon as the instructor connects.`
                      : `Instructor ${liveClassData?.instructorName || 'Lead Mentor'} has not commenced the broadcast yet. This screen will automatically launch into the live classroom the instant the instructor starts the session.`}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>In Queue • {onlineCount} connected</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDeviceSettingsOpen(true)}
                      className="py-2.5 px-4 mx-auto rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Test Audio & Video Preview</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Scheduled Footer */}
        <footer className="p-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
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
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900 flex flex-col font-['Sora'] select-none overflow-x-hidden">
      
      {/* 1. CLASSROOM TOP HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xs z-20">
        
        {/* Mentor Profile & Class Banner */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {liveClassData?.instructorAvatar ? (
              <img
                src={liveClassData.instructorAvatar}
                alt={liveClassData.instructorName || 'Instructor'}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center border-2 border-indigo-500 shadow-xs">
                {(liveClassData?.instructorName || 'M').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-black text-sm text-slate-900 truncate max-w-sm sm:max-w-md">
                {liveClassData?.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {liveClassData?.courseName} • Instructor: <strong className="text-indigo-600">{liveClassData?.instructorName}</strong>
            </p>
          </div>
        </div>

        {/* Center Live Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>{onlineCount} Live Participants</span>
          </div>

          {isRecording && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>REC</span>
            </span>
          )}

          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl shadow-xs">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>PRIVATE / LOCKED</span>
            </span>
          )}

          {/* Dual Connection Status: Realtime Socket + WebRTC Media */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Realtime Socket Indicator */}
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                connectionStatus === 'connected'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : connectionStatus === 'reconnecting'
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : connectionStatus === 'disconnected'
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : 'text-slate-500 bg-slate-50 border-slate-200'
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
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : mediaConnectionState === 'connecting' || mediaConnectionState === 'authenticating'
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  : mediaConnectionState === 'reconnecting'
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : mediaConnectionState === 'failed'
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : 'text-slate-500 bg-slate-50 border-slate-200'
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
              isSidebarOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80'
            }`}
            title="Toggle Right Panel"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {isInstructor ? (
            <button
              onClick={() => setIsEndConfirmModalOpen(true)}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>End Class</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLeaveConfirmModalOpen(true)}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-all"
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
          } bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col justify-between relative shadow-sm transition-all duration-300`}
        >
          {/* Active 1-to-1 Interactive Session Spotlight Banner */}
          {activeInteraction && activeInteraction.status === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-3 mb-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-200/80 p-3.5 rounded-2xl flex items-center justify-between shadow-xs z-30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Mic className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                      1-to-1 Spotlight Active
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    <strong className="text-indigo-600">{activeInteraction.instructorName}</strong> & <strong className="text-purple-600">{activeInteraction.studentName}</strong> are speaking live with the classroom
                  </p>
                </div>
              </div>
              {(isInstructor || activeInteraction.studentId === (user?.uid || userProfile?.uid)) && (
                <button
                  onClick={handleEndInteraction}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 ml-2"
                >
                  End Session
                </button>
              )}
            </motion.div>
          )}

          {/* Media Player Frame (Contained inside clean light frame) */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center m-2.5 rounded-2xl">
            
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
                    className="bg-white/95 backdrop-blur-md border border-amber-300 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-amber-500 fill-current animate-bounce shrink-0" />
                      <span className="font-bold text-slate-900 truncate">{h.userName} raised hand</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAcknowledgeHand(h.userId)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer shadow-xs"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => setRaisedHands((prev) => prev.filter((x) => x.userId !== h.userId))}
                        className="text-slate-400 hover:text-slate-700 text-[10px] font-bold p-1 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center gap-1.5 hover:bg-white shadow-md"
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
                  className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-purple-300 text-purple-700 font-bold text-xs flex items-center gap-1.5 hover:bg-white shadow-md"
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Recording</span>
                </a>
              )}
            </div>

            {/* Active Speaker Floating Badge */}
            {activeSpeakerInfo && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-800 shadow-md pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="truncate">Active Speaker: {activeSpeakerInfo.name}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
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
              instructorId={liveClassData?.instructorId || liveClassData?.createdBy}
              instructorName={liveClassData?.instructorName}
              initialParticipants={participants}
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
          <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-10">
            
            {/* Left Controls: Hardware Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMic}
                disabled={!isInstructor && isMicLocked}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all relative ${
                  micOn
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 cursor-pointer'
                    : !isInstructor && isMicLocked
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-rose-50 border-rose-200 text-rose-600 cursor-pointer'
                }`}
                title={
                  !isInstructor && isMicLocked
                    ? 'Microphone locked by instructor (Raise Hand to speak)'
                    : micOn
                    ? 'Mute Microphone'
                    : 'Unmute Microphone'
                }
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {!isInstructor && isMicLocked && (
                  <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500 bg-white rounded-full p-0.5 border border-slate-200 shadow-xs" />
                )}
              </button>

              <button
                onClick={handleToggleCam}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  camOn ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}
                title={camOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {camOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleScreenShare}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isScreenSharing ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleWhiteboard(!isWhiteboardOpen)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isWhiteboardOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                }`}
                title="Interactive Whiteboard"
              >
                <Pencil className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Whiteboard</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeviceSettingsOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Audio & Video Device Settings"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
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
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'participants' && isSidebarOpen
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Participants ({onlineCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'chat' && isSidebarOpen
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('questions');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'questions' && isSidebarOpen
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Q&A</span>
                  </button>

                  <button
                    onClick={() => setIsPollModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer transition-all"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Poll</span>
                  </button>

                  <button
                    onClick={() => setIsQuizModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-100 cursor-pointer transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Quiz</span>
                  </button>

                  <button
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 cursor-pointer transition-all"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Announcement</span>
                  </button>

                  <button
                    onClick={handleOpenAttendanceRoster}
                    className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
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
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'chat' && isSidebarOpen
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('questions');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'questions' && isSidebarOpen
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Q&A</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('participants');
                      setIsSidebarOpen(true);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'participants' && isSidebarOpen
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Participants ({onlineCount})</span>
                  </button>

                  {/* Student Raise Hand Button with active toggle state */}
                  <button
                    onClick={handleToggleHandRaise}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      hasRaisedHand
                        ? 'bg-amber-500 text-white font-black shadow-md shadow-amber-500/20 animate-pulse'
                        : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Hand className="w-4 h-4 fill-current" />
                    <span>{hasRaisedHand ? 'Hand Raised (Lower)' : 'Raise Hand'}</span>
                  </button>

                  <button
                    onClick={() => setIsPollModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vote Poll</span>
                  </button>

                  <button
                    onClick={() => setIsQuizModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
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
                    className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 cursor-pointer transition-all"
                    title="Mute All, Lock Room"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Restrict</span>
                  </button>

                  <button
                    onClick={handleToggleLock}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLocked ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{isLocked ? 'Locked' : 'Lock'}</span>
                  </button>

                  <button
                    onClick={() => setIsEndConfirmModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End Class</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLeaveConfirmModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
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
          <div className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300">
            
            {/* Tab Selector Header */}
            <div className="bg-slate-50 p-2 border-b border-slate-200/80 flex items-center gap-1">
              {isInstructor ? (
                <>
                  <button
                    onClick={() => setActiveTab('participants')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'participants'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Roster ({onlineCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'chat'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'questions'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
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
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'questions'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Q&A</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('participants')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'participants'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
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
              <div className={activeTab === 'chat' ? 'h-full flex flex-col' : 'hidden'}>
                <LiveChatWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
              </div>
              {activeTab === 'questions' && (
                <LiveQuestionsWidget classId={classId || ''} currentUser={currentUser} />
              )}
              {activeTab === 'participants' && (
                <div className="space-y-4 font-['Sora']">
                  <div className="space-y-3 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Classroom Roster</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold">
                        {onlineCount} Online
                      </span>
                    </div>

                    {/* Instructor Bulk Student Microphone Moderation Controls */}
                    {isInstructor && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleLockAllStudentMics}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
                          title="Lock all student microphones"
                        >
                          <Lock className="w-3 h-3 text-slate-600" />
                          <span>Lock All Mics</span>
                        </button>
                        <button
                          onClick={handleRevokeAllStudentMics}
                          className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
                          title="Revoke all student mic permissions"
                        >
                          <VolumeX className="w-3 h-3 text-rose-600" />
                          <span>Revoke All</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {participants.length === 0 ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {(resolvedDisplayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{resolvedDisplayName}</p>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
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
                          className="p-3 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl flex items-center justify-between gap-2 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                p.role === 'instructor' || p.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {(p.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-slate-900 truncate flex items-center gap-1">
                                <span>{p.name}</span>
                                {p.userId === userProfile?.uid && <span className="text-slate-400 text-[10px]">(You)</span>}
                              </p>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">{p.role || 'student'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Speaking in active 1-to-1 session badge */}
                            {activeInteraction && activeInteraction.status === 'active' && activeInteraction.studentId === p.userId && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5 border border-emerald-300">
                                <Mic className="w-3 h-3 text-emerald-600 animate-pulse" />
                                <span>Speaking</span>
                              </span>
                            )}

                            {raisedHands.some((h) => h.userId === p.userId) && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-0.5 animate-pulse border border-amber-300">
                                <Hand className="w-3 h-3 fill-current" />
                                <span>Hand</span>
                              </span>
                            )}

                            {isInstructor && p.role !== 'instructor' && p.role !== 'admin' && (
                              <div className="flex items-center gap-1">
                                {/* 1-to-1 Interactive Session Invite Button */}
                                <button
                                  onClick={() => handleInviteToSpeak(p.userId, p.name || 'Student')}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 cursor-pointer transition-all"
                                  title="Invite to 1-to-1 Speaking Interaction"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>

                                {/* Ask to Unmute Button */}
                                <button
                                  onClick={() => handleRequestUnmuteStudent(p.userId)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-pointer transition-all"
                                  title="Ask Student to Unmute"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() =>
                                    p.micPermission === 'granted' && !p.isMutedByInstructor
                                      ? handleMuteParticipant(p.userId)
                                      : handleAllowMicParticipant(p.userId)
                                  }
                                  className={`p-1.5 rounded-lg cursor-pointer transition-all border ${
                                    p.micPermission === 'granted' && !p.isMutedByInstructor
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200'
                                  }`}
                                  title={
                                    p.micPermission === 'granted' && !p.isMutedByInstructor
                                      ? 'Mute & Lock Student Mic'
                                      : 'Allow Student Mic'
                                  }
                                >
                                  {p.micPermission === 'granted' && !p.isMutedByInstructor ? (
                                    <Mic className="w-3.5 h-3.5" />
                                  ) : (
                                    <MicOff className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() =>
                                    handleToggleChatParticipant(
                                      p.userId,
                                      p.chatPermission === 'denied'
                                    )
                                  }
                                  className={`p-1.5 rounded-lg cursor-pointer transition-all border ${
                                    p.chatPermission === 'granted'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200'
                                  }`}
                                  title={p.chatPermission === 'granted' ? 'Mute Student Chat' : 'Allow Student Chat'}
                                >
                                  {p.chatPermission === 'granted' ? (
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  ) : (
                                    <MessageSquareOff className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleKickParticipant(p.userId)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 cursor-pointer transition-all"
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
          onClose={() => setIsWhiteboardOpen(false)}
        />
      )}

      {/* Broadcast Announcement Modal (Instructor) */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-indigo-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-heading font-black text-base text-slate-900">Broadcast Announcement</h3>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-700 font-bold">Announcement Message</label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g., Quick 5-minute break. Next we cover virtual memory page tables."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-medium">Priority Level:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncementPriority('normal')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      announcementPriority === 'normal'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementPriority('urgent')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      announcementPriority === 'urgent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingAnnouncement || !announcementText.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-blue-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-black text-base text-slate-900">Live Audience Poll</h3>
              </div>
              <button
                onClick={() => setIsPollModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="font-heading font-black text-base text-slate-900">Live Interactive Quiz</h3>
              </div>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              <LiveQuizWidget socket={socket} classId={classId || ''} currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}

      {/* Live Attendance Roster Drawer (Instructor) */}
      {isAttendanceOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white border-l border-slate-200 max-w-md w-full h-full p-6 shadow-2xl overflow-y-auto space-y-5 font-['Sora'] animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-base text-slate-900">Live Attendance Roster</h3>
              </div>
              <button onClick={() => setIsAttendanceOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">{attendanceRecords.length} Student Attendance Records</p>

            <div className="space-y-2">
              {attendanceRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No attendance records logged yet for this session.</p>
              ) : (
                attendanceRecords.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs font-medium">
                    <div>
                      <p className="font-bold text-slate-900">{r.studentName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{r.studentEmail}</p>
                      <span className="text-[10px] text-slate-400">Joined: {r.joinedAt}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-base text-slate-900">Share Lecture Notes / PDF URL</h3>
              <button onClick={() => setIsNotesModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">Enter PDF URL or Google Drive link to attach for live participants:</p>
              <input
                type="url"
                value={notesUrlInput}
                onChange={(e) => setNotesUrlInput(e.target.value)}
                placeholder="https://kaizenq.in/notes/linux-kernel-mem.pdf"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer">
                Publish Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording URL Modal */}
      {isRecordingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-base text-slate-900">Publish Video Recording URL</h3>
              <button onClick={() => setIsRecordingModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">Enter stream recording video link for replay access:</p>
              <input
                type="url"
                value={recordingUrlInput}
                onChange={(e) => setRecordingUrlInput(e.target.value)}
                placeholder="https://meet.jit.si/recordings/session.mp4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-purple-500 focus:bg-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setIsRecordingModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleSaveRecording} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer">
                Publish Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict Students Control Modal */}
      {isRestrictModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 font-['Sora'] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-black text-base text-slate-900">Classroom Moderation & Privacy</h3>
              </div>
              <button onClick={() => setIsRestrictModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Manage live classroom privacy, entry permissions, and silence student interactions in real time.
            </p>

            <div className="space-y-3">
              {/* Classroom Privacy / Lock */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isLocked ? <Lock className="w-5 h-5 text-amber-600" /> : <Unlock className="w-5 h-5 text-emerald-600" />}
                  <div>
                    <p className="text-xs font-bold text-slate-900">Room Privacy & Lock</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {isLocked ? '🔒 Private Session (New students blocked)' : '🔓 Open Session (Anyone can join)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleLock}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isLocked
                      ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-amber-500 hover:bg-amber-600 text-white font-black shadow-xs'
                  }`}
                >
                  {isLocked ? 'Unlock (Open)' : 'Make Private'}
                </button>
              </div>

              {/* Mute All Microphones */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <VolumeX className="w-5 h-5 text-rose-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mute All Student Microphones</p>
                    <p className="text-[10px] text-slate-500 font-medium">Instantly silence all student microphones</p>
                  </div>
                </div>
                <button
                  onClick={handleMuteAllStudents}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all"
                >
                  Mute All
                </button>
              </div>

              {/* Chat Moderation */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isChatMuted ? <MessageSquareOff className="w-5 h-5 text-rose-600" /> : <MessageSquare className="w-5 h-5 text-indigo-600" />}
                  <div>
                    <p className="text-xs font-bold text-slate-900">Classroom Chat Moderation</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {isChatMuted ? '🔇 Chat is currently muted for students' : '💬 Students can post in live chat'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleChatMute(!isChatMuted)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isChatMuted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {isChatMuted ? 'Unmute Chat' : 'Mute Chat'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsRestrictModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-emerald-200 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 font-['Sora']">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <Mic className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Microphone Request</h4>
              <p className="text-xs text-slate-600 mt-1">
                <strong>{unmuteRequest.instructorName}</strong> has requested you to unmute your microphone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setUnmuteRequest(null);
                  if (!micOn) handleToggleMic();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                Unmute Mic
              </button>
              <button
                onClick={() => setUnmuteRequest(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
              >
                Keep Muted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-to-1 Interaction Student Speaking Invitation Dialog */}
      {interactionInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-indigo-100 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 font-['Sora']">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
              <Mic className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Interactive Discussion</span>
              </div>
              <h4 className="text-lg font-black text-slate-900">1-to-1 Speaking Invitation</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Instructor <strong>{interactionInviteModal.instructorName}</strong> has invited you to speak live in 1-to-1 interactive mode. Accepting will immediately unlock your microphone so you can talk with the class.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => handleRespondInteraction(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Mic className="w-4 h-4" />
                <span>Accept & Speak</span>
              </button>
              <button
                onClick={() => handleRespondInteraction(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveClassroomScreen;


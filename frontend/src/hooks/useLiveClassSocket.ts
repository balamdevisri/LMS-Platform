import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/services/socketService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type SocketConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface ChatMessageItem {
  id: string;
  liveClassId: string;
  userId: string;
  userName: string;
  role: string;
  message: string;
  status: 'VISIBLE' | 'DELETED' | 'MODERATED';
  messageType?: 'normal' | 'announcement';
  replyToId?: string;
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  liveClassId: string;
  studentId: string;
  studentName: string;
  question: string;
  answer?: string | null;
  status: 'OPEN' | 'ANSWERED' | 'REMOVED';
  answeredBy?: string | null;
  createdAt: string;
  answeredAt?: string | null;
}

export interface RaisedHandItem {
  studentId: string;
  studentName: string;
  timestamp: string;
}

export interface AnnouncementItem {
  id: string;
  liveClassId: string;
  message: string;
  priority: 'normal' | 'urgent';
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
}

export interface ActivePollItem {
  id: string;
  liveClassId: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  durationSeconds: number;
  status: 'ACTIVE' | 'ENDED';
  createdAt: string;
  totalVotes?: number;
  userVotedOptionId?: string;
}

export interface ActiveQuizItem {
  id: string;
  liveClassId: string;
  title: string;
  question: string;
  options: string[];
  marks: number;
  timerSeconds: number;
  status: 'ACTIVE' | 'ENDED';
  createdAt: string;
  userSubmittedAnswer?: string;
}

export interface QuizResultItem {
  quizId: string;
  liveClassId: string;
  correctAnswer: string;
  totalSubmissions: number;
  correctCount: number;
  accuracyPercentage: number;
  status: 'ENDED';
}

export const useLiveClassSocket = (liveClassId?: string, initialStatus?: string) => {
  const { user, userProfile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('disconnected');
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHandItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activePoll, setActivePoll] = useState<ActivePollItem | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizItem | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultItem | null>(null);
  const [classStatus, setClassStatus] = useState<string>(initialStatus || 'SCHEDULED');
  const [hasRaisedHand, setHasRaisedHand] = useState<boolean>(false);

  const currentUserId = userProfile?.uid || user?.uid || 'student_guest';
  const currentUserName = userProfile?.name || user?.displayName || 'Student';
  const currentUserRole = userProfile?.role || 'student';
  const currentUserEmail = userProfile?.email || user?.email || '';

  // Track initialization
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!liveClassId) return;

    // Connect socket
    const socket = socketService.connect(undefined, {
      uid: currentUserId,
      name: currentUserName,
      role: currentUserRole,
      email: currentUserEmail,
    });

    setConnectionStatus(socket.connected ? 'connected' : 'reconnecting');

    const handleConnect = () => {
      setConnectionStatus('connected');
      socketService
        .joinLiveClass(liveClassId, currentUserName)
        .then((res) => {
          if (res?.onlineCount) setOnlineCount(res.onlineCount);
          if (res?.participants) setParticipants(res.participants);
          if (res?.status) setClassStatus(res.status);
        })
        .catch((err) => {
          if (err?.error === 'NOT_ENROLLED') {
            toast.error('🔒 Access Denied: You are not actively enrolled in this course.');
          } else if (err?.error === 'UNAUTHORIZED_SOCKET') {
            toast.error('🔒 Authentication required to join live classroom.');
          }
        });
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (err: any) => {
      setConnectionStatus('reconnecting');
      if (err?.message === 'UNAUTHORIZED_SOCKET') {
        toast.error('Socket authentication rejected.');
      }
    };

    const handlePresence = (data: { onlineCount: number; participants: any[] }) => {
      if (data?.onlineCount !== undefined) setOnlineCount(data.onlineCount);
      if (data?.participants) setParticipants(data.participants);
    };

    const handleStudentJoined = (data: { name: string; role: string }) => {
      // Optional subtle toast for instructors
      if (currentUserRole === 'instructor' || currentUserRole === 'admin') {
        toast.info(`👋 ${data.name} (${data.role}) joined the live class`);
      }
    };

    const handleStudentLeft = (_data: any) => {
      // Presence will update roster
    };

    const handleChatMessage = (msg: ChatMessageItem) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    const handleChatDelete = (data: { messageId: string }) => {
      setChatMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    };

    const handleChatModerate = (data: { messageId: string; action: string }) => {
      if (data.action === 'hide') {
        setChatMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      }
    };

    const handleChatError = (err: { error: string; message: string }) => {
      if (err.error === 'CHAT_RATE_LIMITED') {
        toast.warning('⚠️ ' + err.message);
      } else {
        toast.error(err.message || 'Chat error');
      }
    };

    const handleQuestion = (q: QuestionItem) => {
      setQuestions((prev) => [...prev, q]);
    };

    const handleAnswer = (data: { questionId: string; answer: string; answeredBy: string }) => {
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === data.questionId
            ? { ...item, answer: data.answer, status: 'ANSWERED', answeredBy: data.answeredBy }
            : item
        )
      );
    };

    const handleQuestionResolve = (data: { questionId: string }) => {
      setQuestions((prev) =>
        prev.map((item) => (item.id === data.questionId ? { ...item, status: 'ANSWERED' } : item))
      );
    };

    const handleQuestionRemove = (data: { questionId: string }) => {
      setQuestions((prev) => prev.filter((item) => item.id !== data.questionId));
    };

    const handleHandRaise = (data: RaisedHandItem) => {
      setRaisedHands((prev) => {
        if (prev.some((h) => h.studentId === data.studentId)) return prev;
        return [...prev, data];
      });
      if (data.studentId === currentUserId) {
        setHasRaisedHand(true);
      }
      if (currentUserRole === 'instructor' || currentUserRole === 'admin') {
        toast.info(`🙋 ${data.studentName} raised their hand`);
      }
    };

    const handleHandLower = (data: { studentId: string }) => {
      setRaisedHands((prev) => prev.filter((h) => h.studentId !== data.studentId));
      if (data.studentId === currentUserId) {
        setHasRaisedHand(false);
      }
    };

    const handleHandAcknowledge = (data: { studentId: string; acknowledgedBy: string }) => {
      setRaisedHands((prev) => prev.filter((h) => h.studentId !== data.studentId));
      if (data.studentId === currentUserId) {
        setHasRaisedHand(false);
        toast.success(`🎉 ${data.acknowledgedBy} acknowledged your raised hand!`);
      }
    };

    const handleAnnouncement = (ann: AnnouncementItem) => {
      setAnnouncements((prev) => [ann, ...prev]);
      toast.info(`📢 Announcement: ${ann.message}`, { duration: 6000 });
    };

    const handlePollStart = (poll: ActivePollItem) => {
      setActivePoll(poll);
      toast.info(`📊 Live Poll Started: "${poll.question}"`);
    };

    const handlePollUpdate = (data: { options: any[]; totalVotes: number }) => {
      setActivePoll((prev) => (prev ? { ...prev, options: data.options, totalVotes: data.totalVotes } : null));
    };

    const handlePollEnd = (data: { options: any[]; totalVotes: number }) => {
      setActivePoll((prev) => (prev ? { ...prev, options: data.options, totalVotes: data.totalVotes, status: 'ENDED' } : null));
      toast.info('📊 Live Poll has ended.');
    };

    const handleQuizStart = (quiz: ActiveQuizItem) => {
      setActiveQuiz(quiz);
      setQuizResult(null);
      toast.info(`📝 Live Quiz: "${quiz.title || quiz.question}"`);
    };

    const handleQuizResult = (res: QuizResultItem) => {
      setQuizResult(res);
      setActiveQuiz((prev) => (prev ? { ...prev, status: 'ENDED' } : null));
      toast.success(`🏁 Live Quiz Finished! Correct Answer: ${res.correctAnswer}`);
    };

    const handleLiveClassStatus = (data: { status: string }) => {
      setClassStatus(data.status);
      if (data.status === 'LIVE') {
        toast.success('🔴 CLASS IS NOW LIVE! Enjoy the session.');
      } else if (data.status === 'ENDED') {
        toast.info('✓ Live session has completed.');
      } else if (data.status === 'CANCELLED') {
        toast.warning('✕ This live session was cancelled.');
      }
    };

    // Attach listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('liveClass:presence', handlePresence);
    socket.on('student:joined', handleStudentJoined);
    socket.on('student:left', handleStudentLeft);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:delete', handleChatDelete);
    socket.on('chat:moderate', handleChatModerate);
    socket.on('chat:error', handleChatError);
    socket.on('qna:question', handleQuestion);
    socket.on('qna:answer', handleAnswer);
    socket.on('qna:resolve', handleQuestionResolve);
    socket.on('qna:remove', handleQuestionRemove);
    socket.on('hand:raise', handleHandRaise);
    socket.on('hand:lower', handleHandLower);
    socket.on('hand:acknowledge', handleHandAcknowledge);
    socket.on('announcement:receive', handleAnnouncement);
    socket.on('poll:start', handlePollStart);
    socket.on('poll:update', handlePollUpdate);
    socket.on('poll:end', handlePollEnd);
    socket.on('quiz:start', handleQuizStart);
    socket.on('quiz:result', handleQuizResult);
    socket.on('liveClass:status', handleLiveClassStatus);

    if (socket.connected && !initializedRef.current) {
      handleConnect();
      initializedRef.current = true;
    }

    // Cleanup on unmount or class change
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('liveClass:presence', handlePresence);
      socket.off('student:joined', handleStudentJoined);
      socket.off('student:left', handleStudentLeft);
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:delete', handleChatDelete);
      socket.off('chat:moderate', handleChatModerate);
      socket.off('chat:error', handleChatError);
      socket.off('qna:question', handleQuestion);
      socket.off('qna:answer', handleAnswer);
      socket.off('qna:resolve', handleQuestionResolve);
      socket.off('qna:remove', handleQuestionRemove);
      socket.off('hand:raise', handleHandRaise);
      socket.off('hand:lower', handleHandLower);
      socket.off('hand:acknowledge', handleHandAcknowledge);
      socket.off('announcement:receive', handleAnnouncement);
      socket.off('poll:start', handlePollStart);
      socket.off('poll:update', handlePollUpdate);
      socket.off('poll:end', handlePollEnd);
      socket.off('quiz:start', handleQuizStart);
      socket.off('quiz:result', handleQuizResult);
      socket.off('liveClass:status', handleLiveClassStatus);

      socketService.leaveLiveClass(liveClassId);
    };
  }, [liveClassId, currentUserId, currentUserName, currentUserRole, currentUserEmail]);

  // Action Dispatchers
  const sendChat = useCallback(
    async (message: string, messageType: 'normal' | 'announcement' = 'normal', replyToId?: string) => {
      if (!liveClassId) return;
      return socketService.sendChat(liveClassId, message, messageType, replyToId);
    },
    [liveClassId]
  );

  const deleteChat = useCallback(
    async (messageId: string) => {
      if (!liveClassId) return;
      return socketService.deleteChat(liveClassId, messageId);
    },
    [liveClassId]
  );

  const askQuestion = useCallback(
    async (question: string) => {
      if (!liveClassId) return;
      return socketService.askQuestion(liveClassId, question);
    },
    [liveClassId]
  );

  const answerQuestion = useCallback(
    async (questionId: string, answer: string) => {
      if (!liveClassId) return;
      return socketService.answerQuestion(liveClassId, questionId, answer);
    },
    [liveClassId]
  );

  const toggleRaiseHand = useCallback(async () => {
    if (!liveClassId) return;
    if (hasRaisedHand) {
      await socketService.lowerHand(liveClassId);
      setHasRaisedHand(false);
    } else {
      await socketService.raiseHand(liveClassId);
      setHasRaisedHand(true);
    }
  }, [liveClassId, hasRaisedHand]);

  const acknowledgeHand = useCallback(
    async (studentId: string) => {
      if (!liveClassId) return;
      return socketService.acknowledgeHand(liveClassId, studentId);
    },
    [liveClassId]
  );

  const sendAnnouncement = useCallback(
    async (message: string, priority: 'normal' | 'urgent' = 'normal') => {
      if (!liveClassId) return;
      return socketService.sendAnnouncement(liveClassId, message, priority);
    },
    [liveClassId]
  );

  const createPoll = useCallback(
    async (question: string, options: string[], durationSeconds?: number) => {
      if (!liveClassId) return;
      return socketService.createPoll(liveClassId, question, options, durationSeconds);
    },
    [liveClassId]
  );

  const votePoll = useCallback(
    async (pollId: string, optionId: string) => {
      if (!liveClassId) return;
      const res = await socketService.votePoll(liveClassId, pollId, optionId);
      setActivePoll((prev) => (prev ? { ...prev, userVotedOptionId: optionId } : null));
      return res;
    },
    [liveClassId]
  );

  const endPoll = useCallback(
    async (pollId: string) => {
      if (!liveClassId) return;
      return socketService.endPoll(liveClassId, pollId);
    },
    [liveClassId]
  );

  const startQuiz = useCallback(
    async (question: string, options: string[], correctAnswer: string, marks?: number, timerSeconds?: number, title?: string) => {
      if (!liveClassId) return;
      return socketService.startQuiz(liveClassId, question, options, correctAnswer, marks, timerSeconds, title);
    },
    [liveClassId]
  );

  const submitQuizAnswer = useCallback(
    async (quizId: string, answer: string) => {
      if (!liveClassId) return;
      const res = await socketService.submitQuizAnswer(liveClassId, quizId, answer);
      setActiveQuiz((prev) => (prev ? { ...prev, userSubmittedAnswer: answer } : null));
      return res;
    },
    [liveClassId]
  );

  const endQuiz = useCallback(
    async (quizId: string) => {
      if (!liveClassId) return;
      return socketService.endQuiz(liveClassId, quizId);
    },
    [liveClassId]
  );

  const updateClassStatus = useCallback(
    (status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED') => {
      if (!liveClassId) return;
      socketService.updateLiveClassStatus(liveClassId, status);
      setClassStatus(status);
    },
    [liveClassId]
  );

  return {
    connectionStatus,
    onlineCount,
    participants,
    chatMessages,
    questions,
    raisedHands,
    announcements,
    activePoll,
    activeQuiz,
    quizResult,
    classStatus,
    hasRaisedHand,
    // Actions
    sendChat,
    deleteChat,
    askQuestion,
    answerQuestion,
    toggleRaiseHand,
    acknowledgeHand,
    sendAnnouncement,
    createPoll,
    votePoll,
    endPoll,
    startQuiz,
    submitQuizAnswer,
    endQuiz,
    updateClassStatus,
  };
};

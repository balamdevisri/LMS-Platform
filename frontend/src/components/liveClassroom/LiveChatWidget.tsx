import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import {
  Send,
  Pin,
  Reply,
  MessageSquare,
  Megaphone,
  X,
  CheckCheck,
  Clock,
  AlertCircle,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';
import { socketService } from '@/services/socketService';
import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

export type ChatPermissionMode = 'everyone' | 'selected_students' | 'instructor_only' | 'disabled';
export type ChatConnectionState =
  | 'connecting'
  | 'connected'
  | 'room_joining'
  | 'ready'
  | 'disconnected'
  | 'reconnecting'
  | 'auth_failed';

export interface ChatMessage {
  id: string;
  messageId?: string;
  clientMessageId?: string;
  classId: string;
  classroomId?: string;
  userId?: string;
  senderId: string;
  userName?: string;
  senderName: string;
  role?: string;
  senderRole?: 'instructor' | 'admin' | 'mentor' | 'student' | string;
  message: string;
  messageType?: 'normal' | 'announcement';
  pinned?: boolean;
  replyToId?: string;
  replyToName?: string;
  replyToText?: string;
  createdAt: string;
  timestamp?: string;
  status?: 'sending' | 'sent' | 'failed';
}

interface LiveChatWidgetProps {
  socket: Socket | null;
  classId: string;
  currentUser: { uid: string; name: string; role: 'instructor' | 'mentor' | 'student' | 'admin' };
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ socket, classId, currentUser }) => {
  const isInstructor =
    currentUser.role === 'instructor' ||
    (currentUser.role as string) === 'admin' ||
    currentUser.role === 'mentor';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [chatMode, setChatMode] = useState<ChatPermissionMode>('everyone');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [hasNewUnread, setHasNewUnread] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Independent reactive chat connection state
  const [connectionState, setConnectionState] = useState<ChatConnectionState>(() => {
    const s = socket || socketService.getSocket();
    if (!s) return 'connecting';
    return s.connected ? 'ready' : 'connecting';
  });

  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<any>(null);

  // Scroll management
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setHasNewUnread(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const near = distanceFromBottom < 90;
    setIsNearBottom(near);
    if (near) {
      setHasNewUnread(false);
    }
  }, []);

  // 1. Initial REST Hydration + Firestore onSnapshot sync
  useEffect(() => {
    if (!classId) return;

    let isMounted = true;

    const fetchChatLogs = async () => {
      try {
        const apiBaseUrl = API_BASE_URL;
        const res = await fetch(`${apiBaseUrl}/live-classroom/chat/${encodeURIComponent(classId)}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setMessages((prev) => {
            const map = new Map<string, ChatMessage>();
            // Retain any pending optimistic messages that haven't landed in REST yet
            prev.forEach((m) => {
              const key = m.clientMessageId || m.id || (m as any)._id?.toString() || '';
              if (key) map.set(key, m);
            });
            // Merge history records
            data.data.forEach((m: any) => {
              const canonicalId = m.id || m._id?.toString() || m.messageId || '';
              const clientKey = m.clientMessageId || canonicalId;
              const formattedMsg: ChatMessage = {
                id: canonicalId,
                messageId: canonicalId,
                clientMessageId: clientKey,
                classId: m.classId || classId,
                classroomId: m.classId || classId,
                userId: m.userId || m.senderId || '',
                senderId: m.senderId || m.userId || '',
                userName: m.userName || m.senderName || 'User',
                senderName: m.senderName || m.userName || 'User',
                role: m.role || m.senderRole || 'student',
                senderRole: m.senderRole || m.role || 'student',
                message: m.message || '',
                messageType: m.messageType || 'normal',
                pinned: Boolean(m.pinned),
                replyToId: m.replyToId,
                replyToName: m.replyToName,
                replyToText: m.replyToText,
                createdAt: m.createdAt || m.timestamp || new Date().toISOString(),
                timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
                status: 'sent',
              };
              // If we already have the optimistic version, replace it with the confirmed history item
              map.set(clientKey, formattedMsg);
              if (canonicalId && clientKey !== canonicalId) {
                map.set(canonicalId, formattedMsg);
              }
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            );
          });
          // Scroll to bottom after initial load
          setTimeout(() => scrollToBottom(false), 50);
        }
      } catch (err) {
        console.warn('[LiveChat] Failed to load chat history:', err);
      }
    };

    fetchChatLogs();

    // Firestore real-time listener for cross-tab persistence
    let unsubscribeFs: (() => void) | null = null;
    if (db) {
      try {
        const chatColRef = collection(db, 'liveClasses', classId, 'chat');
        const q = query(chatColRef, orderBy('createdAt', 'asc'), limit(150));
        unsubscribeFs = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted || snapshot.empty) return;
            const fsMessages: ChatMessage[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data() as any;
              return {
                id: docSnap.id,
                messageId: docSnap.id,
                clientMessageId: data.clientMessageId || docSnap.id,
                classId: data.classId || classId,
                classroomId: data.classId || classId,
                userId: data.userId || data.senderId || '',
                senderId: data.senderId || data.userId || '',
                userName: data.userName || data.senderName || 'User',
                senderName: data.senderName || data.userName || 'User',
                role: data.role || data.senderRole || 'student',
                senderRole: data.senderRole || data.role || 'student',
                message: data.message || '',
                messageType: data.messageType || 'normal',
                pinned: Boolean(data.pinned),
                replyToId: data.replyToId,
                replyToName: data.replyToName,
                replyToText: data.replyToText,
                createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
                timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
                status: 'sent',
              };
            });

            setMessages((prev) => {
              const map = new Map<string, ChatMessage>();
              prev.forEach((m) => {
                const key = m.clientMessageId || m.id || '';
                if (key) map.set(key, m);
              });
              fsMessages.forEach((m) => {
                const clientKey = m.clientMessageId || m.id;
                map.set(clientKey, m);
                if (m.id && clientKey !== m.id) {
                  map.set(m.id, m);
                }
              });
              return Array.from(map.values()).sort(
                (a, b) =>
                  new Date(a.createdAt || a.timestamp || 0).getTime() -
                  new Date(b.createdAt || b.timestamp || 0).getTime()
              );
            });
          },
          (err) => {
            console.warn('[LiveChat] Firestore snapshot notice:', err);
          }
        );
      } catch (err) {
        console.warn('[LiveChat] Firestore setup notice:', err);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribeFs) unsubscribeFs();
    };
  }, [classId, scrollToBottom]);

  // 2. Real-time Socket.IO Connection Lifecycle & Diagnostics
  useEffect(() => {
    const s = socket || socketService.getSocket();

    const handleConnect = () => {
      const active = socket || socketService.getSocket();
      console.log('[Live Classroom] Socket connected:', active?.id);
      console.log('[Live Classroom] Joining room:', classId);
      console.log('[Live Classroom] Role:', currentUser.role);
      console.log('[Live Classroom] Chat connection ready');
      setConnectionState('ready');
    };

    const handleDisconnect = (reason: string) => {
      console.log('[Live Classroom] Socket disconnected:', reason);
      setConnectionState('disconnected');
    };

    const handleConnectError = (err: any) => {
      console.warn('[Live Classroom] Socket connect error:', err);
      if (err?.message?.includes('auth') || err?.message?.includes('token')) {
        setConnectionState('auth_failed');
      } else {
        setConnectionState('disconnected');
      }
    };

    const handleReconnectAttempt = () => {
      setConnectionState('reconnecting');
    };

    const handleJoined = () => {
      console.log('[Live Classroom] Chat connection ready');
      setConnectionState('ready');
    };

    const unsubStatus = socketService.onStatusChange((status) => {
      if (status === 'connected') {
        setConnectionState('ready');
      } else if (status === 'reconnecting') {
        setConnectionState('reconnecting');
      } else if (status === 'disconnected') {
        setConnectionState('disconnected');
      }
    });

    if (s && s.connected) {
      setConnectionState('ready');
    } else if (socketService.getConnectionStatus() === 'connected') {
      setConnectionState('ready');
    } else {
      setConnectionState('connecting');
    }

    if (s) {
      s.on('connect', handleConnect);
      s.on('disconnect', handleDisconnect);
      s.on('connect_error', handleConnectError);
      s.on('liveClass:joined', handleJoined);
      if (s.io) {
        s.io.on('reconnect_attempt', handleReconnectAttempt);
        s.io.on('reconnect', handleConnect);
      }
    }

    return () => {
      unsubStatus();
      if (s) {
        s.off('connect', handleConnect);
        s.off('disconnect', handleDisconnect);
        s.off('connect_error', handleConnectError);
        s.off('liveClass:joined', handleJoined);
        if (s.io) {
          s.io.off('reconnect_attempt', handleReconnectAttempt);
          s.io.off('reconnect', handleConnect);
        }
      }
    };
  }, [socket, classId, currentUser.role]);

  // 3. Real-time Socket.IO Listeners (Strict ID Reconciliation)
  useEffect(() => {
    const s = socket || socketService.getSocket();
    if (!s) return;

    const handleIncomingMessage = (msg: any) => {
      if (!msg) return;

      const canonicalId = msg.id || msg.messageId || (msg as any)._id?.toString() || '';
      const clientMsgId = msg.clientMessageId || canonicalId;

      const normalizedMsg: ChatMessage = {
        id: canonicalId,
        messageId: canonicalId,
        clientMessageId: clientMsgId,
        classId: msg.classId || classId,
        classroomId: msg.classroomId || msg.classId || classId,
        userId: msg.userId || msg.senderId || '',
        senderId: msg.senderId || msg.userId || '',
        userName: msg.userName || msg.senderName || 'User',
        senderName: msg.senderName || msg.userName || 'User',
        role: msg.role || msg.senderRole || 'student',
        senderRole: msg.senderRole || msg.role || 'student',
        message: msg.message || '',
        messageType: msg.messageType || 'normal',
        pinned: Boolean(msg.pinned),
        replyToId: msg.replyToId,
        replyToName: msg.replyToName,
        replyToText: msg.replyToText,
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        status: 'sent',
      };

      setMessages((prev) => {
        // 1. Direct match by clientMessageId or server ID
        const matchIndex = prev.findIndex(
          (m) =>
            (clientMsgId && (m.clientMessageId === clientMsgId || m.id === clientMsgId)) ||
            (canonicalId && (m.id === canonicalId || m.messageId === canonicalId))
        );

        if (matchIndex !== -1) {
          // Replace the optimistic entry in-place with confirmed server message
          const updated = [...prev];
          updated[matchIndex] = normalizedMsg;
          return updated;
        }

        // 2. Append new incoming message
        return [...prev, normalizedMsg];
      });

      // Handle scrolling: if user is near bottom, smoothly scroll; otherwise show floating "New messages ↓" pill
      if (isNearBottom || String(normalizedMsg.senderId) === String(currentUser.uid)) {
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        setHasNewUnread(true);
      }
    };

    s.on('chat:message', handleIncomingMessage);

    // Pinning updates
    const handleChatPinned = (data: { messageId: string; pinned: boolean }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId || m.clientMessageId === data.messageId
            ? { ...m, pinned: data.pinned }
            : m
        )
      );
      if (data.pinned) {
        toast.info('A message was pinned in chat.');
      }
    };
    s.on('chat_pinned', handleChatPinned);

    // Typing indicators
    const handleTypingReceived = (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers((prev) => Array.from(new Set([...prev, data.userName])));
      } else {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    };
    s.on('typing_received', handleTypingReceived);

    // Chat mode updates
    const handleChatModeUpdate = (data: { mode: ChatPermissionMode }) => {
      if (data?.mode) {
        setChatMode(data.mode);
        toast.info(`Chat mode updated to: ${data.mode.replace('_', ' ')}`);
      }
    };
    s.on('liveClass:chat:mode', handleChatModeUpdate);

    // Moderation events
    const handleStudentMuted = (data: { userId: string; isMuted: boolean }) => {
      if (data.userId === currentUser.uid) {
        setIsMuted(data.isMuted);
        if (data.isMuted) toast.error('You have been muted by the instructor.');
        else toast.success('Your chat access has been restored.');
      }
    };
    s.on('student_muted', handleStudentMuted);

    const handleChatAllowed = (data: { userId: string }) => {
      if (data.userId === currentUser.uid) {
        setIsMuted(false);
        toast.success('Your chat access has been granted.');
      }
    };
    s.on('liveClass:moderation:chatAllowed', handleChatAllowed);

    const handleChatMuted = (data: { userId: string }) => {
      if (data.userId === currentUser.uid) {
        setIsMuted(true);
        toast.error('You have been muted by the instructor.');
      }
    };
    s.on('liveClass:moderation:chatMuted', handleChatMuted);

    const handleChatError = (err: any) => {
      toast.error(err?.message || 'Chat error occurred.');
    };
    s.on('chat:error', handleChatError);

    return () => {
      s.off('chat:message', handleIncomingMessage);
      s.off('chat_pinned', handleChatPinned);
      s.off('typing_received', handleTypingReceived);
      s.off('liveClass:chat:mode', handleChatModeUpdate);
      s.off('student_muted', handleStudentMuted);
      s.off('liveClass:moderation:chatAllowed', handleChatAllowed);
      s.off('liveClass:moderation:chatMuted', handleChatMuted);
      s.off('chat:error', handleChatError);
    };
  }, [socket, classId, currentUser.uid, isNearBottom, scrollToBottom]);

  // 4. Message Dispatch with Optimistic Reconciliation & Retry
  const executeSend = useCallback(
    async (textToSend: string, clientMsgId: string, type: 'normal' | 'announcement' = 'normal') => {
      const liveSocket = socketService.getSocket();
      const s = (liveSocket && liveSocket.connected) ? liveSocket : (socket && socket.connected) ? socket : liveSocket || socket;

      if (!s || !s.connected) {
        toast.error('Unable to send message: not connected to live classroom server.');
        // Mark optimistic message as failed
        setMessages((prev) =>
          prev.map((m) => (m.clientMessageId === clientMsgId ? { ...m, status: 'failed' } : m))
        );
        return;
      }

      const nowIso = new Date().toISOString();
      const payload = {
        clientMessageId: clientMsgId,
        id: clientMsgId,
        liveClassId: classId,
        classId,
        classroomId: classId,
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        message: textToSend,
        messageType: type,
        replyToId: replyTo?.id || replyTo?.clientMessageId,
        replyToName: replyTo?.senderName || replyTo?.userName,
        replyToText: replyTo?.message?.substring(0, 60),
        timestamp: nowIso,
      };

      s.emit('chat:send', payload, (res: any) => {
        if (res && res.success) {
          const confirmed = res.message || {};
          const serverId = confirmed.id || confirmed.messageId || clientMsgId;

          setMessages((prev) =>
            prev.map((m) =>
              m.clientMessageId === clientMsgId
                ? {
                    ...m,
                    id: serverId,
                    messageId: serverId,
                    status: 'sent',
                    createdAt: confirmed.createdAt || m.createdAt,
                  }
                : m
            )
          );

          // Persist confirmed message to Firestore
          if (db) {
            try {
              const msgDocRef = doc(db, 'liveClasses', classId, 'chat', serverId);
              setDoc(msgDocRef, {
                ...payload,
                id: serverId,
                status: 'sent',
                createdAt: confirmed.createdAt || nowIso,
              }).catch(() => {});
            } catch (_) {}
          }
        } else {
          console.warn('[LiveChat] Message rejected by server:', res);
          toast.error(res?.message || 'Failed to deliver message.');
          setMessages((prev) =>
            prev.map((m) => (m.clientMessageId === clientMsgId ? { ...m, status: 'failed' } : m))
          );
        }
      });

      // Clear typing indicator on send
      s.emit('typing_status', { classId, userName: currentUser.name, isTyping: false });
    },
    [socket, classId, currentUser, replyTo]
  );

  const handleSend = (type: 'normal' | 'announcement' = 'normal') => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    if (!isInstructor && isMuted) {
      toast.error('Your chat is locked or restricted.');
      return;
    }

    const clientMsgId = `msg_c_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const optimisticPayload: ChatMessage = {
      id: clientMsgId,
      clientMessageId: clientMsgId,
      classId,
      classroomId: classId,
      userId: currentUser.uid,
      senderId: currentUser.uid,
      userName: currentUser.name,
      senderName: currentUser.name,
      role: currentUser.role,
      senderRole: currentUser.role,
      message: trimmed,
      messageType: type,
      pinned: false,
      replyToId: replyTo?.id || replyTo?.clientMessageId,
      replyToName: replyTo?.senderName || replyTo?.userName,
      replyToText: replyTo?.message?.substring(0, 60),
      createdAt: nowIso,
      timestamp: nowIso,
      status: 'sending',
    };

    // 1. Optimistic UI insert: immediate visual confirmation for the user
    setMessages((prev) => [...prev, optimisticPayload]);
    setInputMessage('');
    setReplyTo(null);

    // 2. Smoothly scroll to bottom on own send
    setTimeout(() => scrollToBottom(true), 30);

    // 3. Dispatch to server
    executeSend(trimmed, clientMsgId, type);
  };

  const handleRetry = (msg: ChatMessage) => {
    if (!msg.clientMessageId) return;
    setMessages((prev) =>
      prev.map((m) => (m.clientMessageId === msg.clientMessageId ? { ...m, status: 'sending' } : m))
    );
    executeSend(msg.message, msg.clientMessageId, msg.messageType);
  };

  const handleChatModeChange = (mode: ChatPermissionMode) => {
    const liveSocket = socketService.getSocket();
    const s = (liveSocket && liveSocket.connected) ? liveSocket : socket;
    if (!s || !isInstructor) return;
    setChatMode(mode);
    s.emit('liveClass:chat:setMode', {
      classId,
      liveClassId: classId,
      mode,
    });
    toast.success(`Chat mode set to: ${mode.replace('_', ' ')}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    const liveSocket = socketService.getSocket();
    const s = (liveSocket && liveSocket.connected) ? liveSocket : socket;
    if (!s || !s.connected) return;

    s.emit('typing_status', { classId, userName: currentUser.name, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const activeS = socketService.getSocket() || socket;
      if (activeS && activeS.connected) {
        activeS.emit('typing_status', { classId, userName: currentUser.name, isTyping: false });
      }
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend('normal');
    }
  };

  const togglePin = (messageId: string, currentPinned: boolean) => {
    if (!isInstructor) return;
    const s = socketService.getSocket() || socket;
    if (!s || !s.connected) return;
    const newPinned = !currentPinned;
    s.emit('chat:pin', {
      classId,
      liveClassId: classId,
      messageId,
      pinned: newPinned,
    });
    toast.info(newPinned ? 'Message pinned.' : 'Message unpinned.');
  };

  const pinnedMessages = useMemo(() => messages.filter((m) => m.pinned), [messages]);

  const renderConnectionBadge = () => {
    switch (connectionState) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected to classroom
          </span>
        );
      case 'room_joining':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Joining room...
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Connecting...
          </span>
        );
      case 'reconnecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Reconnecting...
          </span>
        );
      case 'auth_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Authentication failed
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Disconnected
          </span>
        );
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const getRoleBadge = (role?: string) => {
    const r = (role || 'student').toLowerCase();
    if (r === 'instructor') {
      return (
        <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold uppercase tracking-wider">
          Faculty
        </span>
      );
    }
    if (r === 'admin') {
      return (
        <span className="px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wider">
          Admin
        </span>
      );
    }
    if (r === 'mentor') {
      return (
        <span className="px-1.5 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[9px] font-bold uppercase tracking-wider">
          Mentor
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[9px] font-semibold uppercase tracking-wider">
        Student
      </span>
    );
  };

  return (
    <div className="flex flex-col h-130 bg-white dark:bg-[#0c1122]/95 border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden font-sans text-slate-800 dark:text-slate-100 relative">
      {/* Top Header & Permission Mode Controls */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-[#090d19]/90 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">Classroom Live Chat</h4>
              {renderConnectionBadge()}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
              {chatMode === 'everyone'
                ? 'Open to all participants'
                : chatMode === 'selected_students'
                ? 'Selected students only'
                : chatMode === 'instructor_only'
                ? 'Instructor announcements only'
                : 'Chat locked'}
            </span>
          </div>
        </div>

        {/* Instructor Chat Mode Selector */}
        {isInstructor && (
          <div className="relative shrink-0">
            <select
              value={chatMode}
              onChange={(e) => handleChatModeChange(e.target.value as ChatPermissionMode)}
              className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-[#12192e] border border-slate-200 dark:border-white/15 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs hover:border-slate-300 dark:hover:border-white/30 transition-colors"
            >
              <option value="everyone">Everyone</option>
              <option value="selected_students">Selected Students</option>
              <option value="instructor_only">Instructor Only</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        )}
      </div>

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-500/20 p-2.5 space-y-1.5 max-h-20 overflow-y-auto">
          {pinnedMessages.map((pm) => (
            <div key={pm.clientMessageId || pm.id} className="flex items-start justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold min-w-0">
                <Pin className="w-3.5 h-3.5 fill-current text-amber-600 shrink-0" />
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 dark:text-amber-400 shrink-0">Pinned:</span>
                <span className="text-slate-800 dark:text-slate-200 truncate font-normal">{pm.message}</span>
              </div>
              {isInstructor && (
                <button
                  onClick={() => togglePin(pm.id || pm.clientMessageId || '', true)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                  title="Unpin message"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages Feed (WhatsApp Style Background & Bubbles) */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#ECE5DD]/20 dark:bg-[#070a14] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">No messages yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
              Say hello or ask questions about the current lecture. Messages are shared with the whole classroom.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            // Strictly determine own message using authenticated current user's UID
            const isMe = String(m.senderId || m.userId || '').trim() === String(currentUser.uid || '').trim();
            const isAnn = m.messageType === 'announcement';
            const msgKey = m.clientMessageId || m.id || m.messageId;

            return (
              <div
                key={msgKey}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isAnn ? 'w-full text-center my-2' : ''}`}
              >
                {isAnn ? (
                  <div className="mx-auto max-w-md p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-200 rounded-2xl text-xs font-medium flex items-center gap-2.5 shadow-xs">
                    <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="text-left flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">Class Announcement</span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{m.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-[82%] sm:max-w-[75%] space-y-0.5 group relative ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Other Participant Metadata (Left Aligned Only) */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold px-1.5 mb-0.5">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold tracking-tight">
                          {m.senderName || m.userName || 'Learner'}
                        </span>
                        {getRoleBadge(m.senderRole || m.role)}
                      </div>
                    )}

                    {/* WhatsApp-Style Message Bubble */}
                    <div
                      className={`relative px-3.5 py-2 text-xs leading-relaxed shadow-2xs transition-all ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs ml-auto'
                          : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-xs border border-slate-200/90 dark:border-white/10'
                      }`}
                    >
                      {/* Quoted Reply Banner if Present */}
                      {m.replyToText && (
                        <div
                          className={`mb-1.5 px-2 py-1 rounded-lg text-[10px] border-l-2 ${
                            isMe
                              ? 'bg-indigo-700/60 border-indigo-300 text-indigo-100'
                              : 'bg-slate-100 dark:bg-slate-800 border-indigo-500 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span className="font-bold block text-[9px]">{m.replyToName || 'Reply'}:</span>
                          <span className="truncate block font-normal">{m.replyToText}</span>
                        </div>
                      )}

                      {/* Message Content with Line Break Support */}
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>

                      {/* Bubble Footer: Timestamp & Delivery Status Icons */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                          isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-[9px] font-medium">{formatMessageTime(m.createdAt || m.timestamp)}</span>

                        {isMe && (
                          <span className="inline-flex items-center ml-0.5">
                            {m.status === 'sending' && (
                              <Clock className="w-3 h-3 text-white/70 animate-spin" title="Sending..." />
                            )}
                            {m.status === 'sent' && (
                              <CheckCheck className="w-3.5 h-3.5 text-indigo-200" title="Delivered to classroom" />
                            )}
                            {m.status === 'failed' && (
                              <button
                                onClick={() => handleRetry(m)}
                                className="inline-flex items-center gap-1 text-rose-200 hover:text-white font-bold cursor-pointer underline"
                                title="Failed to deliver. Click to retry."
                              >
                                <AlertCircle className="w-3 h-3 text-rose-300" />
                                <span>Retry</span>
                              </button>
                            )}
                          </span>
                        )}
                      </div>

                      {/* WhatsApp-Style Hover Quick Actions (Reply & Pin) */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-white dark:bg-[#1f293d] border border-slate-200 dark:border-white/10 shadow-md px-1.5 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 ${
                          isMe ? '-left-16' : '-right-16'
                        }`}
                      >
                        <button
                          onClick={() => setReplyTo(m)}
                          className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-1 cursor-pointer rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
                          title="Reply to message"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                        {isInstructor && (
                          <button
                            onClick={() => togglePin(m.id || m.clientMessageId || '', Boolean(m.pinned))}
                            className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-1 cursor-pointer rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
                            title={m.pinned ? 'Unpin message' : 'Pin message'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating "New Messages ↓" Pill Button when user is scrolled up */}
      {hasNewUnread && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-18 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[11px] font-bold shadow-md flex items-center gap-1.5 cursor-pointer z-30 transition-transform active:scale-95 animate-bounce"
        >
          <span>New messages</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Real-time Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="px-3.5 py-1 bg-slate-50 dark:bg-[#090d18] border-t border-slate-100 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-medium italic animate-pulse flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
          <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
        </div>
      )}

      {/* Replying Banner */}
      {replyTo && (
        <div className="bg-indigo-50/90 dark:bg-indigo-950/50 px-3.5 py-1.5 flex items-center justify-between border-t border-indigo-200 dark:border-indigo-500/30 text-xs z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-200 truncate text-[11px]">
              Replying to <strong className="text-indigo-700 dark:text-indigo-300 font-semibold">{replyTo.senderName || replyTo.userName}</strong>: {replyTo.message}
            </span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer p-0.5 shrink-0"
            title="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* WhatsApp-Style Input Bar with Multiline & Keyboard Send */}
      <div className="p-2.5 bg-white dark:bg-[#090d18] border-t border-slate-200/90 dark:border-white/10 flex items-end gap-2 z-10">
        <div className="flex-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 rounded-xl focus-within:bg-white dark:focus-within:bg-black/30 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden flex items-center px-3 py-1.5">
          <textarea
            rows={1}
            disabled={connectionState !== 'ready' || (!isInstructor && isMuted)}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              connectionState === 'connecting'
                ? 'Connecting to classroom chat...'
                : connectionState === 'room_joining'
                ? 'Joining classroom session...'
                : connectionState === 'reconnecting'
                ? 'Reconnecting...'
                : connectionState === 'auth_failed'
                ? 'Authentication required.'
                : connectionState === 'disconnected'
                ? 'Disconnected from server.'
                : !isInstructor && isMuted
                ? 'Chat is restricted by instructor'
                : 'Type a message... (Enter to send, Shift+Enter for new line)'
            }
            className="w-full bg-transparent resize-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden max-h-24 leading-relaxed disabled:opacity-50"
          />
        </div>

        {isInstructor && (
          <button
            type="button"
            onClick={() => handleSend('announcement')}
            disabled={connectionState !== 'ready' || !inputMessage.trim()}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl cursor-pointer border border-indigo-200 dark:border-indigo-500/30 disabled:opacity-40 transition-colors shrink-0"
            title="Post Broadcast Announcement"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => handleSend('normal')}
          disabled={connectionState !== 'ready' || (!isInstructor && isMuted) || !inputMessage.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-40 cursor-pointer shadow-xs transition-transform active:scale-95 shrink-0"
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LiveChatWidget;

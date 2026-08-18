import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Pin, Reply, VolumeX, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

interface ChatMessage {
  id?: string;
  _id?: string;
  classId: string;
  userId: string;
  userName: string;
  role: string;
  message: string;
  messageType: 'normal' | 'announcement';
  pinned: boolean;
  replyToId?: string;
  emojis?: { emoji: string; users: string[] }[];
  createdAt?: string;
}

interface LiveChatWidgetProps {
  socket: Socket | null;
  classId: string;
  currentUser: { uid: string; name: string; role: 'instructor' | 'mentor' | 'student' };
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ socket, classId, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  
  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInstructor = currentUser.role === 'instructor' || (currentUser.role as string) === 'admin';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    // Fetch initial chat logs from database
    const fetchChatLogs = async () => {
      try {
        const apiBaseUrl = API_BASE_URL;
        const res = await fetch(`${apiBaseUrl}/live-classroom/chat/${classId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMessages(data.data);
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err);
      }
    };
    fetchChatLogs();
  }, [classId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('chat_received', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for pinned messages update
    socket.on('chat_pinned', (data: { messageId: string; pinned: boolean }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId || m._id?.toString() === data.messageId
            ? { ...m, pinned: data.pinned }
            : m
        )
      );
      if (data.pinned) {
        toast.info('A message was pinned in the chat.');
      }
    });

    // Listen for typing indicator
    socket.on('typing_received', (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers((prev) => Array.from(new Set([...prev, data.userName])));
      } else {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    });

    // Listen for mute status
    socket.on('student_muted', (data: { userId: string; isMuted: boolean }) => {
      if (data.userId === currentUser.uid) {
        setIsMuted(data.isMuted);
        if (data.isMuted) {
          toast.error('The instructor has muted your chat access.');
        } else {
          toast.success('Your chat access has been restored.');
        }
      }
    });

    return () => {
      socket.off('chat_received');
      socket.off('chat_pinned');
      socket.off('typing_received');
      socket.off('student_muted');
    };
  }, [socket, currentUser.uid]);

  const handleSend = (type: 'normal' | 'announcement' = 'normal') => {
    if (!inputMessage.trim() || isMuted || !socket) return;

    const payload = {
      classId,
      userId: currentUser.uid,
      userName: currentUser.name,
      role: currentUser.role,
      message: inputMessage.trim(),
      messageType: type,
      replyToId: replyTo?.id || replyTo?._id?.toString(),
    };

    socket.emit('send_chat', payload);
    setInputMessage('');
    setReplyTo(null);

    // Cancel typing status
    socket.emit('typing_status', { classId, userName: currentUser.name, isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!socket) return;

    // Send typing status
    socket.emit('typing_status', { classId, userName: currentUser.name, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_status', { classId, userName: currentUser.name, isTyping: false });
    }, 1500);
  };

  const togglePin = (messageId: string, currentPinned: boolean) => {
    if (!isInstructor || !socket) return;
    socket.emit('pin_chat', { classId, messageId, pinned: !currentPinned });
  };

  const toggleMuteStudent = (userId: string, currentMuted: boolean) => {
    if (!isInstructor || !socket) return;
    socket.emit('mute_student', { classId, userId, isMuted: !currentMuted });
    toast.success(`Student chat status updated!`);
  };

  const pinnedMessages = messages.filter((m) => m.pinned);

  return (
    <div className="flex flex-col h-125 bg-slate-900/60 border border-sky-500/15 rounded-2xl overflow-hidden font-['Sora']">
      
      {/* Pinned Messages Header (if any) */}
      {pinnedMessages.length > 0 && (
        <div className="bg-sky-500/10 border-b border-sky-500/20 p-3 space-y-2 max-h-24 overflow-y-auto">
          {pinnedMessages.map((pm) => (
            <div key={pm.id || pm._id} className="flex items-start justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                <Pin className="w-3.5 h-3.5 fill-current text-sky-400 shrink-0" />
                <span className="text-[10px] uppercase font-black tracking-wider text-sky-400">Pinned:</span>
                <span className="text-slate-200 line-clamp-1">{pm.message}</span>
              </div>
              {isInstructor && (
                <button 
                  onClick={() => togglePin(pm.id || pm._id?.toString() || '', true)} 
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Pin className="w-3 h-3 text-rose-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
            <p>Welcome to Live Chat Room!</p>
            <p className="text-[10px]">Be polite, keep coding.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.userId === currentUser.uid;
            const isAnn = m.messageType === 'announcement';

            return (
              <div 
                key={m.id || m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isAnn ? 'w-full text-center my-2' : ''}`}
              >
                {isAnn ? (
                  <div className="mx-auto max-w-sm p-3 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-2xl text-[11px] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>ANNOUNCEMENT: {m.message}</span>
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-1">
                    {/* User Metadata */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold px-1">
                      <span className={m.role === 'instructor' ? 'text-rose-400' : m.role === 'mentor' ? 'text-amber-400' : 'text-sky-400'}>
                        {m.userName}
                      </span>
                      <span className="text-[8px] bg-slate-800 text-slate-500 px-1 rounded-sm uppercase tracking-wider">{m.role}</span>
                    </div>

                    {/* Chat Bubble */}
                    <div className={`p-3 rounded-2xl text-xs relative group ${
                      isMe 
                        ? 'bg-sky-600 text-white rounded-tr-xs' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700/50'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>

                      {/* Message Hover Actions */}
                      <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-900 border border-sky-500/20 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 ${
                        isMe ? '-left-20' : '-right-20'
                      }`}>
                        <button 
                          onClick={() => setReplyTo(m)}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                          title="Reply"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                        {isInstructor && (
                          <>
                            <button 
                              onClick={() => togglePin(m.id || m._id?.toString() || '', m.pinned)}
                              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                              title="Pin message"
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => toggleMuteStudent(m.userId, false)}
                              className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                              title="Mute student"
                            >
                              <VolumeX className="w-3 h-3" />
                            </button>
                          </>
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

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 bg-slate-900/30 text-[10px] text-slate-400 font-bold italic animate-pulse">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Reply Banner */}
      {replyTo && (
        <div className="bg-slate-950 p-2.5 flex items-center justify-between border-t border-sky-500/10 text-[11px]">
          <span className="text-slate-400 font-bold">Replying to <strong className="text-sky-400">{replyTo.userName}</strong></span>
          <button onClick={() => setReplyTo(null)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
            Cancel
          </button>
        </div>
      )}

      {/* Send Input Bar */}
      <div className="p-3 bg-slate-950/60 border-t border-sky-500/15 flex items-center gap-2">
        <input
          type="text"
          disabled={isMuted}
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder={isMuted ? 'You are muted by the instructor' : 'Send message...'}
          className="flex-1 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
        />

        {isInstructor && (
          <button
            onClick={() => handleSend('announcement')}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
            title="Post Announcement"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleSend('normal')}
          disabled={isMuted || !inputMessage.trim()}
          className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl disabled:opacity-50 cursor-pointer shadow-lg shadow-sky-500/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
export default LiveChatWidget;

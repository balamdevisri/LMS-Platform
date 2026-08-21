import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import type { ChatMessageItem } from '@/hooks/useLiveClassSocket';

export interface LiveChatProps {
  messages: ChatMessageItem[];
  onSendMessage: (message: string) => Promise<void> | void;
  onDeleteMessage?: (messageId: string) => Promise<void> | void;
  isInstructorOrAdmin?: boolean;
  currentUserId?: string;
  className?: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  isInstructorOrAdmin = false,
  className = '',
}) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.trim();
    if (!clean || sending) return;

    setSending(true);
    setInput('');
    try {
      await onSendMessage(clean);
    } catch {
      // Handled via toast in parent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`flex flex-col h-full justify-between ${className}`}>
      {/* Messages Scroll Area */}
      <div ref={chatScrollRef} className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0 mb-3">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-700" />
            <p>Welcome to the live chat!</p>
            <span className="text-[11px] text-slate-600">Be respectful and stay on topic with the lecture.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isInstructor = (msg.role || '').toLowerCase() === 'instructor' || (msg.role || '').toLowerCase() === 'admin';
            const isMentor = (msg.role || '').toLowerCase() === 'mentor';

            return (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl transition-colors group flex items-start justify-between gap-2 ${
                  isInstructor
                    ? 'bg-blue-950/40 border border-blue-800/40 text-blue-100'
                    : isMentor
                    ? 'bg-purple-950/40 border border-purple-800/40 text-purple-100'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 text-slate-200'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{msg.userName}</span>
                    {isInstructor && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-400 font-extrabold uppercase tracking-wider">
                        Instructor
                      </span>
                    )}
                    {isMentor && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-400 font-bold uppercase">
                        Mentor
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 break-words leading-relaxed">{msg.message}</p>
                </div>

                {isInstructorOrAdmin && onDeleteMessage && (
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(msg.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer shrink-0"
                    title="Delete Message"
                    aria-label="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-800/80 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message to live room..."
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0 shadow-sm"
          title="Send message"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default LiveChat;

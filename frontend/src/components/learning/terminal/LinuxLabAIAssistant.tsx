import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';

interface LinuxLabAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const LinuxLabAIAssistant: React.FC<LinuxLabAIAssistantProps> = ({
  isOpen,
  onClose,
  isNightMode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am your 24/7 SHAIVIKA Linux AI Companion. Ask me to explain any bash command, debug permission errors, or suggest terminal best practices!",
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let aiText = `Great question! In Linux system administration, "${input}" is commonly used to process input streams and file system descriptors. Tip: Always verify flags with \`--help\` or \`man\`.`;
      if (input.toLowerCase().includes('mkdir')) {
        aiText = "`mkdir` stands for 'make directory'. Use `mkdir -p path/to/dir` to automatically create parent directories if they don't exist yet!";
      } else if (input.toLowerCase().includes('permission') || input.toLowerCase().includes('chmod')) {
        aiText = "Permission denied errors occur when your user lacks execution (+x) or write (+w) flags. Run `chmod +x filename` to grant execution rights!";
      }
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText }]);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`fixed bottom-12 right-6 z-50 w-full sm:w-96 rounded-3xl border shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl ${
            isNightMode
              ? 'bg-slate-950/98 border-slate-800 text-slate-100 shadow-slate-950/80'
              : 'bg-white/98 border-sky-100 text-slate-900 shadow-sky-500/15'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-sky-50/80 border-sky-100'}`}>
            <div className="flex items-center gap-2 text-cyan-400">
              <Bot className="w-5 h-5" />
              <span className="font-heading font-extrabold text-sm text-slate-100">
                Linux AI Tutor
              </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white font-medium'
                      : isNightMode
                      ? 'bg-slate-900 border border-slate-800 text-slate-200'
                      : 'bg-slate-50 border border-sky-100 text-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className={`p-3 border-t flex items-center gap-2 ${isNightMode ? 'border-slate-800 bg-slate-900' : 'border-sky-100 bg-slate-50'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about commands or errors..."
              className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none border ${
                isNightMode
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:ring-1 focus:ring-cyan-400'
                  : 'bg-white border-sky-200 text-slate-900 focus:ring-1 focus:ring-sky-500'
              }`}
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

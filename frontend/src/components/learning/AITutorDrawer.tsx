import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  courseTitle?: string;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  lessonTitle,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your SHAIVIKA AI Tutor. I can help explain concepts in **"${lessonTitle}"**, debug commands, or write custom practice code for you! What would you like assistance with?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = '';
      const lower = currentPrompt.toLowerCase();

      if (lower.includes('git') || lower.includes('commit') || lower.includes('push')) {
        aiText = `Great question about Git version control! In Git, staged changes are saved locally with \`git commit -m "your message"\`. Then use \`git push origin main\` to sync with your remote GitHub repository.`;
      } else if (lower.includes('command') || lower.includes('terminal') || lower.includes('linux')) {
        aiText = `In Linux & Bash, commands follow the syntax \`command -options target\`. For example, \`ls -la\` lists all hidden files in detailed format. Try running it in the lesson's CLI Terminal Sandbox!`;
      } else if (lower.includes('explain') || lower.includes('summary')) {
        aiText = `Here is a quick summary for **${lessonTitle}**:\n1. Understand core concepts & architecture.\n2. Execute commands in the CLI Terminal.\n3. Track history and verify outputs.`;
      } else {
        aiText = `I have analyzed your query regarding **${lessonTitle}**. You can run tests or CLI commands directly in your active lesson pane. Let me know if you want a step-by-step walkthrough!`;
      }

      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-100 bg-slate-950/95 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-2xl"
          >
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    SHAIVIKA AI Tutor <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-mono truncate max-w-60">
                    {lessonTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm bg-slate-950/90 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-linear-to-r from-cyan-500 to-sky-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-xs">{msg.text}</p>
                    <span
                      className={`text-[9px] font-mono block mt-1 text-right ${
                        msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono p-2">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>AI Tutor is thinking...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Tutor anything about this lesson..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

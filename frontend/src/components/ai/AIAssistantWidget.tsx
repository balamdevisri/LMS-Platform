import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, Zap, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Shaivika AI Tutor. Ask me anything about your enrolled courses, practice quizzes, or request code debugging assistance!',
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('');

  React.useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsOpen(true);
      
      const welcomeMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: `Hello! I am your Shaivika AI Tutor. I have loaded the context of the lesson: "${detail.lessonTitle}".\n\nAsk me anything about it, and I will answer using the lesson content!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, welcomeMsg]);
      setActiveContext(detail.lessonContent);
    };

    window.addEventListener('open-ai-tutor', handleOpen);
    return () => window.removeEventListener('open-ai-tutor', handleOpen);
  }, []);

  const quickPrompts = [
    'Summarize Module 3 of Fullstack React',
    'Generate 3 practice quiz questions',
    'Explain RAG Vector Databases in 2 sentences',
  ];

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "";
      const query = messageText.toLowerCase();

      if (activeContext) {
        // Answer using current lesson content first
        if (query.includes('commit') && activeContext.toLowerCase().includes('commit')) {
          aiResponseText = "According to this lesson, `git commit` saves staged changes permanently to local history with a descriptive commit message using the `-m` flag. It registers a snapshot of changes.";
        } else if (query.includes('init') && activeContext.toLowerCase().includes('init')) {
          aiResponseText = "Based on this lesson, `git init` initializes a new local Git repository in the current folder, creating a hidden `.git` directory containing databases.";
        } else if (query.includes('add') && activeContext.toLowerCase().includes('add')) {
          aiResponseText = "According to the lesson, `git add` stages modified or untracked files, moving them into the staging area (index) so they are ready to be committed.";
        } else if (query.includes('status') && activeContext.toLowerCase().includes('status')) {
          aiResponseText = "Based on this lesson, `git status` shows the status of files in the current working directory, indicating which files are untracked, modified, or staged.";
        } else if (query.includes('log') && activeContext.toLowerCase().includes('log')) {
          aiResponseText = "According to the lesson, `git log` displays the history of commits in the repository, listing hash, author, date, and commit message.";
        } else if (query.includes('diff') && activeContext.toLowerCase().includes('diff')) {
          aiResponseText = "Based on this lesson, `git diff` compares differences between unstaged modifications in the working directory and the last committed version.";
        } else {
          aiResponseText = `Based on the lesson context:\n\n${activeContext.split('\n').slice(0, 3).join('\n')}\n\nTo answer "${messageText}": Let me know if you would like me to explain any specific commands, configurations, or workflow concepts related to this topic!`;
        }
      } else {
        if (query.includes('quiz') || query.includes('practice')) {
          aiResponseText = "Here are 3 quick practice questions:\n1. What is the key difference between useEffect and useLayoutEffect?\n2. How do Vector Embeddings compute cosine similarity in Pinecone?\n3. Name two CSS containment properties.";
        } else if (query.includes('summarize') || query.includes('module')) {
          aiResponseText = "Module 3 Summary: You covered Asynchronous State Handling, Optimistic UI updates, and Custom Hook abstractions. Your assignment score was 98/100!";
        } else {
          aiResponseText = `I have analyzed your request: "${messageText}". In modern AI SaaS architectures, using type-safe React 19 components and high-efficiency vector search yields optimal speed and developer experience!`;
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-[#059669] to-[#10B981] text-white shadow-xl shadow-emerald-950/60 flex items-center justify-center hover:scale-110 transition-all duration-300 ${
          isOpen ? 'hidden' : 'flex'
        }`}
        title="Open Shaivika AI Tutor"
      >
        <div className="relative">
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#34D399] border-2 border-[#020617] rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#34D399] border-2 border-[#020617] rounded-full" />
        </div>
      </button>

      {/* Slide-over AI Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-5 duration-300 text-white">
          {/* Header */}
          <div className="bg-[#020617] p-4 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm flex items-center gap-1.5">
                  Shaivika AI Tutor
                  <span className="px-2 py-0.5 text-[10px] bg-[#10B981]/20 text-[#34D399] rounded-full font-sans border border-[#10B981]/30">
                    GPT-4o Engine
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8]">Contextual Mentor & Code Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#020617]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#10B981] text-white rounded-tr-none font-medium'
                      : 'bg-[#0F172A] border border-white/10 text-slate-100 shadow-sm rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-[#94A3B8]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-[#94A3B8] text-xs py-2">
                <div className="w-7 h-7 rounded-lg bg-[#10B981] text-white flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span>AI is reasoning and crafting response...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-[#0F172A] border-t border-white/10 overflow-x-auto flex gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs bg-[#020617] hover:bg-[#10B981]/20 text-[#94A3B8] hover:text-[#34D399] px-2.5 py-1.5 rounded-lg border border-white/10 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-[#10B981]" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#0F172A] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about syllabus, code, quizzes..."
                className="flex-1 bg-[#020617] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-[#10B981] disabled:opacity-50 hover:bg-[#059669] text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

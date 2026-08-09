import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, Maximize2, Minimize2 } from 'lucide-react';

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
  lessonContent?: string;
}

const generateAIResponse = (userPrompt: string, courseTitle: string, lessonTitle: string, lessonContent: string): string => {
  const promptLower = userPrompt.toLowerCase();
  const courseLower = courseTitle.toLowerCase();
  
  // Rule constraint check
  const isLinuxActive = courseLower.includes('linux') || courseLower.includes('unix');
  const isGitActive = courseLower.includes('git') || courseLower.includes('github');
  
  if (promptLower.includes('explain') || promptLower.includes('summary') || promptLower.includes('what is') || promptLower.includes('help')) {
    const cleanContent = lessonContent
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*`>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    const sentences = cleanContent.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 15);
    
    let explanation = `Here is a detailed explanation of the core concepts in **"${lessonTitle}"**:\n\n`;
    if (sentences.length > 0) {
      explanation += `💡 ${sentences[0]}.\n\n`;
      if (sentences.length > 1) {
        explanation += `🔑 **Key Principle**: ${sentences[1]}.\n\n`;
      }
      if (sentences.length > 2) {
        explanation += `🛡️ **Execution Flow**: ${sentences[2]}.\n\n`;
      }
    } else {
      explanation += `This unit covers fundamental techniques for real-world software and infrastructure platforms in the context of the ${courseTitle} track. Make sure to complete the terminal practice sandbox to solidify your understanding.\n\n`;
    }
    
    explanation += `Let me know if you would like to write some practice questions or debug a custom command together!`;
    return explanation;
  }
  
  if (courseLower.includes('database') || courseLower.includes('sql') || courseLower.includes('dbms')) {
    if (promptLower.includes('create') || promptLower.includes('table')) {
      return `To create a table in SQL, use the \`CREATE TABLE\` DDL statement. For example:\n\`\`\`sql\nCREATE TABLE employees (\n    emp_id INT PRIMARY KEY,\n    name VARCHAR(50),\n    salary DECIMAL(10,2)\n);\n\`\`\`\nThis sets up the table structure. Try executing this in your SQL Practice Terminal on the left!`;
    }
    if (promptLower.includes('select') || promptLower.includes('query')) {
      return `To retrieve records from a table, use the \`SELECT\` DML statement. For example:\n\`\`\`sql\nSELECT name, salary FROM employees WHERE salary > 50000;\n\`\`\`\nYou can query specific columns or use \`*\` to query all columns. Try running a SELECT query in the sandbox!`;
    }
    if (promptLower.includes('index') || promptLower.includes('speed')) {
      return `An index helps the database search records much faster by preventing full-table scans. You create one using:\n\`\`\`sql\nCREATE INDEX idx_emp_name ON employees(name);\n\`\`\`\nHowever, indexes add overhead for writes (INSERT/UPDATE), so only index columns used frequently in WHERE clauses.`;
    }
    return `In this DBMS lesson **"${lessonTitle}"**, we focus on relational schemas, SQL statements, and transactional safety. Let me know if you want help drafting or debugging a query!`;
  }
  
  if (courseLower.includes('python')) {
    if (promptLower.includes('def') || promptLower.includes('function')) {
      return `In Python, functions are defined using the \`def\` keyword. For example:\n\`\`\`python\ndef add_numbers(a, b):\n    return a + b\n\`\`\`\nPython uses indentation to define code blocks instead of curly braces.`;
    }
    if (promptLower.includes('loop') || promptLower.includes('for')) {
      return `To iterate over a sequence in Python, use a \`for\` loop with the \`range()\` or list objects:\n\`\`\`python\nfor i in range(5):\n    print(f"Iteration {i}")\n\`\`\``;
    }
    return `In this Python lesson **"${lessonTitle}"**, we cover standard Python structures. Let me know if you need help with variables, data types, or debugging your scripts!`;
  }
  
  if (courseLower.includes('java')) {
    if (promptLower.includes('class') || promptLower.includes('public')) {
      return `In Java, all code must reside within a class. The main entry point is always:\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n\`\`\`\nRemember that Java is strongly-typed, so every variable must be declared with a specific type.`;
    }
    return `In this Java lesson **"${lessonTitle}"**, we work with object-oriented paradigms and structured execution. Let me know if you need assistance compiling your Main class or resolving compiler warnings!`;
  }

  if (courseLower.includes('react')) {
    if (promptLower.includes('state') || promptLower.includes('use-state')) {
      return `In React, you manage dynamic values using state via the \`useState\` Hook. For example:\n\`\`\`jsx\nconst [value, setValue] = useState(initial);\n\`\`\`\nModifying the state via \`setValue\` triggers a component re-render so the UI updates automatically.`;
    }
    return `In this React lesson **"${lessonTitle}"**, we work with components, virtual DOM, and local state. Let me know if you need help building JSX interfaces or managing React properties!`;
  }

  if (isGitActive) {
    if (promptLower.includes('commit') || promptLower.includes('add')) {
      return `In Git, the standard workspace pipeline is:\n1. Stage files: \`git add <file>\`\n2. Commit changes: \`git commit -m "Commit message"\`\n3. Push to remote: \`git push origin main\`\nTry practicing git commands in your active Git Bash terminal on the left!`;
    }
    return `As your Git assistant for **"${lessonTitle}"**, I can help explain version control staging, branch merging, rebasing, or GitHub Actions. Ask me anything!`;
  }

  if (isLinuxActive) {
    if (promptLower.includes('permission') || promptLower.includes('chmod')) {
      return `Linux uses owner, group, and others permission badges. Chmod sets permissions:\n\`chmod 755 script.sh\` (rwxr-xr-x)\n\`chmod 600 key.pem\` (rw-------)\nTry inspecting file details using \`ls -la\` in the active Linux terminal!`;
    }
    return `As your Linux systems tutor for **"${lessonTitle}"**, I can guide you through kernel execution Rings, file management commands, processes, and network firewalls. What sysadmin task can we tackle?`;
  }

  return `I have analyzed your query regarding **"${lessonTitle}"** in the context of the ${courseTitle} track. You can run interactive command diagnostics directly in your active practice workspace. Let me know if you want a detailed walkthrough of this lesson's key concepts!`;
};

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  courseTitle = 'General Course',
  lessonContent = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your KaizenQ AI Tutor. I can help explain concepts in **"${lessonTitle}"**, debug commands, or write custom practice code for you! What would you like assistance with?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFull, setIsFull] = useState(false);

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
      const aiText = generateAIResponse(currentPrompt, courseTitle, lessonTitle, lessonContent);
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
            className={`fixed z-50 bg-slate-950/95 border border-slate-800 shadow-2xl flex flex-col backdrop-blur-2xl font-sans transition-all duration-300 ${
              isFull
                ? 'top-0 left-0 w-full h-full border-none rounded-none'
                : 'top-0 right-0 h-full w-full sm:w-100 border-l border-slate-800'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                    SHAIVIKA AI Tutor <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-mono truncate max-w-60">
                    {lessonTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Full Screen Toggle / Restore to Normal Mode */}
                <button
                  onClick={() => setIsFull(!isFull)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title={isFull ? 'Restore to Normal Mode' : 'Expand to Full Tab'}
                >
                  {isFull ? (
                    <Minimize2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close AI Tutor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
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

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2 shrink-0">
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Trash2,
  Copy,
  Download,
  BookOpen,
  HelpCircle,
  Award,
  AlertCircle,
  Lightbulb,
  CornerDownLeft,
  RefreshCw,
  FileText,
  ChevronRight,
  Minimize2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { mockAIProvider } from '@/services/aiProvider';
import { ChallengeProvider } from '@/services/practice/practiceEngine';
import type {
  AIChatMessage,
  LessonSummary,
  PracticeQuestion,
  InterviewPrepQuestion,
  SmartRecommendations
} from '@/services/aiProvider';

interface AIAssistantPanelProps {
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  topicId?: string;
  topicTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonType?: string;
  lessonContent?: string;
  isOpen: boolean;
  onClose: () => void;
  isDocked?: boolean; // if true, renders in-line inside learning player; else floats as slide-over drawer
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  courseId,
  courseTitle,
  moduleId = '',
  moduleTitle = '',
  topicId = '',
  topicTitle = '',
  lessonId = 'default_lesson',
  lessonTitle = 'Active Syllabus Topic',
  lessonType = 'reading',
  lessonContent = 'Syllabus content prepared.',
  isOpen,
  onClose,
  isDocked = false
}) => {
  const { userProfile, user } = useAuth();
  const currentUserId = userProfile?.uid || user?.uid || 'default_student';

  const challengeProvider = new ChallengeProvider();
  const hasChallenge = !!challengeProvider.getChallengeForLesson(lessonId);

  // --- RESIZE & LAYOUT STATES ---
  const [panelWidth, setPanelWidth] = useState<number>(380);
  const isResizingRef = useRef(false);

  // --- AI TABS SYSTEM ---
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'summary' | 'practice' | 'interview' | 'recs'>('chat');

  // --- DATA STATES (Per Lesson) ---
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Structured Tabs Data
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewPrepQuestion[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendations | null>(null);

  // Loading States for Tabs
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // MCQ state tracking
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- LOCAL PERSISTENCE KEYS ---
  const chatHistoryKey = `shaivika_ai_chat_${currentUserId}_${lessonId}`;
  const summaryKey = `shaivika_ai_summary_${currentUserId}_${lessonId}`;
  const practiceKey = `shaivika_ai_practice_${currentUserId}_${lessonId}`;
  const interviewKey = `shaivika_ai_interview_${currentUserId}_${lessonId}`;
  const recsKey = `shaivika_ai_recs_${currentUserId}_${lessonId}`;

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load chat and features history from localStorage on lessonId change
  useEffect(() => {
    if (!isOpen) return;

    // Load Chat
    const storedChat = localStorage.getItem(chatHistoryKey);
    if (storedChat) {
      try {
        setMessages(JSON.parse(storedChat));
      } catch (e) {
        setMessages([]);
      }
    } else {
      // Default welcome context
      let welcomeText = `Hello! I am your Shaivika AI Learning Assistant. 🧠\n\nI have loaded the syllabus context for "**${lessonTitle}**" (${lessonType.toUpperCase()} lesson).\n\nAsk me anything about this topic, generate practice questions, or view the lesson summary using the tabs above!`;
      if (hasChallenge) {
        welcomeText += `\n\n💻 **Practice Lab Challenge Enabled**: This topic contains a coding challenge! Try asking me:\n- *"Explain my code"*\n- *"Find bugs in my solution"*\n- *"Suggest optimizations"*\n- *"Explain space complexity"*`;
      }
      const welcome: AIChatMessage = {
        id: 'welcome_ai',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);
    }

    // Load Summary
    const storedSummary = localStorage.getItem(summaryKey);
    setSummary(storedSummary ? JSON.parse(storedSummary) : null);

    // Load Practice
    const storedPractice = localStorage.getItem(practiceKey);
    setPracticeQuestions(storedPractice ? JSON.parse(storedPractice) : []);

    // Load Interview
    const storedInterview = localStorage.getItem(interviewKey);
    setInterviewQuestions(storedInterview ? JSON.parse(storedInterview) : []);

    // Load Recs
    const storedRecs = localStorage.getItem(recsKey);
    setRecommendations(storedRecs ? JSON.parse(storedRecs) : null);

    // Reset MCQ states
    setSelectedMcqAnswers({});
    setRevealedAnswers({});
  }, [lessonId, isOpen]);

  // Save chat history to localStorage
  const saveChatHistory = (msgs: AIChatMessage[]) => {
    setMessages(msgs);
    localStorage.setItem(chatHistoryKey, JSON.stringify(msgs));
  };

  // --- DYNAMIC RESIZE HANDLER ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const computedWidth = window.innerWidth - e.clientX;
    // Constrain width
    if (computedWidth > 320 && computedWidth < 700) {
      setPanelWidth(computedWidth);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- AI API HANDLERS ---

  // Tutor Chat submit
  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim()) return;

    if (text.toLowerCase().includes('generate mcq') || text.toLowerCase().includes('generate quiz') || text.toLowerCase().includes('generate ai quiz')) {
      window.dispatchEvent(new CustomEvent('open-ai-quiz'));
      toast.success('Launching AI Quiz Generator workspace!');
      if (!customText) setInputMessage('');
      return;
    }

    if (!customText) setInputMessage('');

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowStr
    };

    const updatedHistory = [...messages, userMsg];
    saveChatHistory(updatedHistory);
    setIsTyping(true);

    try {
      const response = await mockAIProvider.sendMessage(text, updatedHistory, {
        courseId,
        courseTitle,
        moduleId,
        moduleTitle,
        topicId,
        topicTitle,
        lessonId,
        lessonTitle,
        lessonType,
        lessonContent
      });

      const aiMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      saveChatHistory([...updatedHistory, aiMsg]);
    } catch (e) {
      toast.error('AI Assistant is currently overloaded. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  // Lesson Summarizer tab loader
  const triggerGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await mockAIProvider.generateSummary(lessonId, lessonTitle, lessonContent);
      setSummary(res);
      localStorage.setItem(summaryKey, JSON.stringify(res));
      toast.success('Generated structured lesson summary!');
    } catch (e) {
      toast.error('Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Practice Questions tab loader
  const triggerGeneratePractice = async () => {
    setLoadingPractice(true);
    try {
      const res = await mockAIProvider.generatePracticeQuestions(lessonId, lessonTitle, lessonContent);
      setPracticeQuestions(res);
      localStorage.setItem(practiceKey, JSON.stringify(res));
      toast.success('Generated practice mock questions!');
    } catch (e) {
      toast.error('Failed to generate questions.');
    } finally {
      setLoadingPractice(false);
    }
  };

  // Interview Prep tab loader
  const triggerGenerateInterview = async () => {
    setLoadingInterview(true);
    try {
      const res = await mockAIProvider.generateInterviewPrep(lessonId, lessonTitle, lessonContent);
      setInterviewQuestions(res);
      localStorage.setItem(interviewKey, JSON.stringify(res));
      toast.success('Generated interview questions!');
    } catch (e) {
      toast.error('Failed to generate interview prep.');
    } finally {
      setLoadingInterview(false);
    }
  };

  // Smart Recommendations loader
  const triggerGenerateRecommendations = async () => {
    setLoadingRecs(true);
    try {
      // Fetch completed unit IDs from local tracking
      let completedIds: string[] = [];
      try {
        const stored = localStorage.getItem(`lms_completed_units_${courseId}`);
        if (stored) completedIds = Object.keys(JSON.parse(stored));
      } catch {}

      const res = await mockAIProvider.generateRecommendations(lessonId, lessonTitle, completedIds);
      setRecommendations(res);
      localStorage.setItem(recsKey, JSON.stringify(res));
      toast.success('Retrieved smart path recommendations.');
    } catch (e) {
      toast.error('Failed to fetch recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  // Load tab content dynamically on active tab change
  useEffect(() => {
    if (!isOpen) return;
    if (activeSubTab === 'summary' && !summary) triggerGenerateSummary();
    if (activeSubTab === 'practice' && practiceQuestions.length === 0) triggerGeneratePractice();
    if (activeSubTab === 'interview' && interviewQuestions.length === 0) triggerGenerateInterview();
    if (activeSubTab === 'recs' && !recommendations) triggerGenerateRecommendations();
  }, [activeSubTab, lessonId]);

  // --- ACTIONS ---
  const handleClearConversation = () => {
    localStorage.removeItem(chatHistoryKey);
    const welcome: AIChatMessage = {
      id: 'welcome_ai',
      sender: 'ai',
      text: `Conversation cleared. Ask me anything about "${lessonTitle}"!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcome]);
    toast.success('Conversation history cleared.');
  };

  const handleRegenerateResponse = async () => {
    // Find last user query
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 0) {
      toast.info('No user prompts to regenerate.');
      return;
    }
    const lastPrompt = userMsgs[userMsgs.length - 1].text;
    toast.info('Regenerating AI response...');
    await handleSendMessage(lastPrompt);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied text to clipboard.');
  };

  const handleExportMarkdown = () => {
    const header = `# AI Tutor Session - ${lessonTitle}\nCourse: ${courseTitle}\nDate: ${new Date().toLocaleDateString()}\n\n---\n\n`;
    const body = messages
      .map(m => `**[${m.sender.toUpperCase()} - ${m.timestamp}]**:\n${m.text}\n`)
      .join('\n');
    
    const blob = new Blob([header + body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_tutor_${lessonId}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported as Markdown (.md)');
  };

  const handleExportTxt = () => {
    const header = `AI Tutor Session - ${lessonTitle}\nCourse: ${courseTitle}\nDate: ${new Date().toLocaleString()}\n\n========================================\n\n`;
    const body = messages
      .map(m => `[${m.sender === 'ai' ? 'AI' : 'STUDENT'} - ${m.timestamp}]\n${m.text}\n`)
      .join('\n');

    const blob = new Blob([header + body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_tutor_${lessonId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported as plain text (.txt)');
  };

  if (!isOpen) return null;

  // Render Sidebar panel container
  const panelStyles = isDocked
    ? `shrink-0 border-l border-slate-200/80 bg-white flex flex-col justify-between h-[calc(100vh-64px)] relative select-text transition-all`
    : `fixed right-0 top-16 bottom-0 z-40 bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between h-[calc(100vh-64px)] relative select-text transition-all`;

  return (
    <aside
      style={{ width: isDocked ? `${panelWidth}px` : `${panelWidth}px` }}
      className={`${panelStyles} max-w-full`}
    >
      {/* ------------------- RESIZE DRAG HANDLE (Desktop only) ------------------- */}
      <div
        onMouseDown={handleMouseDown}
        className="hidden md:block w-1.5 hover:bg-emerald-500 cursor-col-resize absolute left-0 top-0 bottom-0 z-20 transition-colors"
        title="Drag left to resize panel width"
      />

      {/* ------------------- HEADER ------------------- */}
      <header className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md">
            <Bot className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xs flex items-center gap-1.5">
              AI Learning Assistant
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                MOCK-COGNITIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Context-Aware Smart Mentor</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            title="Minimize Panel"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------------------- LESSON CONTEXT CARD ------------------- */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 text-[10px] text-slate-500 font-mono shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-700 truncate max-w-xs">{lessonTitle}</span>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase shrink-0">
            {lessonType}
          </span>
        </div>
        <span className="text-slate-400 shrink-0">M. {moduleId || '1'}</span>
      </div>

      {/* ------------------- SUB TABS switcher ------------------- */}
      <nav className="flex border-b border-slate-200 bg-white text-xs font-bold text-slate-600 shrink-0 overflow-x-auto select-none">
        {[
          { id: 'chat', label: 'Tutor Chat' },
          { id: 'summary', label: 'Summary' },
          { id: 'practice', label: 'Practice' },
          { id: 'interview', label: 'Interview' },
          { id: 'recs', label: 'Recs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap px-3 ${
              activeSubTab === tab.id
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/10'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ------------------- MAIN CONTENT TABS PANEL ------------------- */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
        
        {/* ================= TABS 1: CHAT INTERFACE ================= */}
        {activeSubTab === 'chat' && (
          <div className="space-y-4 min-h-full flex flex-col justify-between">
            <div className="space-y-4">
              {messages.length <= 1 && (
                <div className="p-4 border border-dashed border-slate-200 rounded-2xl bg-white text-center space-y-2 py-6">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                  <h4 className="font-bold text-xs text-slate-800">Ask anything about this lesson</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Type a question or select a suggested prompt below to start learning with your AI tutor.
                  </p>
                </div>
              )}

              {/* Chat Thread */}
              <div className="space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                    )}
                    <div className="space-y-1 max-w-[85%]">
                      <div
                        className={`rounded-2xl p-3 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-3xs ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                            : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      
                      <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'ai' && msg.id !== 'welcome_ai' && (
                          <button
                            onClick={() => handleCopyText(msg.text)}
                            title="Copy Response"
                            className="hover:text-slate-700 cursor-pointer flex items-center gap-0.5"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5 items-start text-xs text-slate-400 py-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-3xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Suggested Prompts Block */}
            {messages.length <= 4 && (
              <div className="space-y-1.5 pt-4">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block px-1">
                  Suggested Learning Actions
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Explain this lesson',
                    'Summarize this lesson',
                    'Give real-world examples',
                    'Simplify this topic',
                    'Generate MCQs',
                    'What should I learn next?'
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-2 text-left rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10 text-[10px] font-bold text-slate-700 hover:text-emerald-800 transition-all cursor-pointer shadow-3xs"
                    >
                      {prompt}
                    </button>
                  ))}

                  {hasChallenge && [
                    'Explain my code',
                    'Find bugs in my solution',
                    'Suggest optimizations',
                    'Explain space complexity'
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-2 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-emerald-950/20 text-[10px] font-bold text-white hover:text-emerald-400 transition-all cursor-pointer shadow-3xs"
                    >
                      💻 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TABS 2: LESSON SUMMARIZER ================= */}
        {activeSubTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Structured Summary</span>
              </h4>
              <button
                onClick={triggerGenerateSummary}
                disabled={loadingSummary}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingSummary ? 'animate-spin' : ''}`} />
                <span>Re-generate</span>
              </button>
            </div>

            {loadingSummary ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Summarizing key content blocks...</p>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Objectives */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> Learning Objectives
                  </h5>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1 leading-relaxed">
                    {summary.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                  </ul>
                </div>

                {/* Concepts */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-500" /> Key Concepts
                  </h5>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1 leading-relaxed">
                    {summary.keyConcepts.map((conc, i) => <li key={i}>{conc}</li>)}
                  </ul>
                </div>

                {/* Important Points */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" /> Important Takeaways
                  </h5>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1 leading-relaxed">
                    {summary.importantPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                </div>

                {/* Common Mistakes */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" /> Common Traps & Mistakes
                  </h5>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1 leading-relaxed">
                    {summary.commonMistakes.map((mist, i) => <li key={i}>{mist}</li>)}
                  </ul>
                </div>

                {/* Revision Notes */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" /> Quick Revision Notes
                  </h5>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1 leading-relaxed font-mono">
                    {summary.revisionNotes.map((note, i) => <li key={i}>{note}</li>)}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TABS 3: PRACTICE SANDBOX ================= */}
        {activeSubTab === 'practice' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>Practice Simulator</span>
              </h4>
              <button
                onClick={triggerGeneratePractice}
                disabled={loadingPractice}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingPractice ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingPractice ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Generating practice questions...</p>
              </div>
            ) : practiceQuestions.length > 0 ? (
              <div className="space-y-4">
                {practiceQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Question {idx + 1} • {q.type.toUpperCase()}</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        q.difficulty === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-700'
                          : q.difficulty === 'Intermediate'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 leading-normal">
                      {q.question}
                    </p>

                    {/* MCQ Options */}
                    {q.type === 'mcq' && q.options && (
                      <div className="space-y-1.5">
                        {q.options.map(opt => {
                          const isSelected = selectedMcqAnswers[q.id] === opt;
                          const showCorrect = revealedAnswers[q.id];
                          const isCorrect = opt === q.answer;

                          let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
                          if (isSelected) {
                            btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-800';
                          }
                          if (showCorrect && isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                if (showCorrect) return;
                                setSelectedMcqAnswers(prev => ({ ...prev, [q.id]: opt }));
                              }}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Coding/Scenario inputs */}
                    {q.type !== 'mcq' && !revealedAnswers[q.id] && (
                      <div className="p-3 bg-slate-50 rounded-xl border text-[11px] text-slate-500 font-medium">
                        💡 Think about your answer, then click "Reveal Explanation" below.
                      </div>
                    )}

                    {/* Reveal feedback */}
                    {revealedAnswers[q.id] && (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                        <p className="font-bold text-emerald-800 font-mono">Answer: {q.answer}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setRevealedAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="py-1 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        {revealedAnswers[q.id] ? 'Hide Answer' : 'Reveal Answer & Explanation'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TABS 4: INTERVIEW PREP ================= */}
        {activeSubTab === 'interview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Interview Prep Workspace</span>
              </h4>
              <button
                onClick={triggerGenerateInterview}
                disabled={loadingInterview}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingInterview ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingInterview ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Drafting interview questions...</p>
              </div>
            ) : interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                {interviewQuestions.map(q => (
                  <div key={q.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-3xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Interview Target</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        q.difficulty === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-700'
                          : q.difficulty === 'Intermediate'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 leading-normal">
                      Q: {q.question}
                    </h5>

                    {!revealedAnswers[q.id] ? (
                      <button
                        onClick={() => setRevealedAnswers(prev => ({ ...prev, [q.id]: true }))}
                        className="w-full text-center py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-xl cursor-pointer"
                      >
                        Show Sample Answer
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400 uppercase">
                          <span>Sample Answer</span>
                          <button
                            onClick={() => setRevealedAnswers(prev => ({ ...prev, [q.id]: false }))}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            Hide
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {q.sampleAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TABS 5: SMART RECOMMENDATIONS ================= */}
        {activeSubTab === 'recs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                <span>Recommendations</span>
              </h4>
              <button
                onClick={triggerGenerateRecommendations}
                disabled={loadingRecs}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingRecs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingRecs ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Formulating smart recommendations...</p>
              </div>
            ) : recommendations ? (
              <div className="space-y-4">
                
                {/* Review Lessons */}
                {recommendations.reviewLessons.length > 0 && (
                  <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-500" /> Recommended Review Topics
                    </h5>
                    <div className="space-y-1.5">
                      {recommendations.reviewLessons.map(l => (
                        <div key={l.id} className="text-xs font-bold text-sky-700 bg-sky-50/50 border border-sky-100 p-2 rounded-xl flex items-center justify-between">
                          <span className="truncate">{l.title}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Lessons */}
                {recommendations.nextLessons.length > 0 && (
                  <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> What to Study Next
                    </h5>
                    <div className="space-y-1.5">
                      {recommendations.nextLessons.map(l => (
                        <div key={l.id} className="text-xs font-bold text-emerald-700 bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl flex items-center justify-between">
                          <span className="truncate">{l.title}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Topics */}
                {recommendations.relatedTopics.length > 0 && (
                  <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> Related Concepts to Explore
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations.relatedTopics.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Suggestions */}
                {recommendations.practiceSuggestions.length > 0 && (
                  <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-pink-500" /> Practice Suggestions
                    </h5>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1.5 leading-relaxed font-medium">
                      {recommendations.practiceSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ------------------- FOOTER INPUT / CHAT CONTROLS ------------------- */}
      <footer className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
        {activeSubTab === 'chat' ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your tutor anything..."
                className="flex-1 bg-slate-100 border border-slate-200 hover:bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>

            {/* Chat utilities */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 border-t border-slate-100 pt-2.5">
              <button
                onClick={handleClearConversation}
                className="hover:text-slate-700 cursor-pointer flex items-center gap-1 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear Chat</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerateResponse}
                  className="hover:text-slate-700 cursor-pointer flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
                <span className="text-slate-200">|</span>
                <div className="relative group">
                  <button className="hover:text-slate-700 cursor-pointer flex items-center gap-1 font-bold">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  {/* Export dropdown */}
                  <div className="absolute right-0 bottom-6 bg-white border border-slate-200 rounded-xl py-1.5 shadow-lg hidden group-hover:block w-28 text-left z-30 font-bold">
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full py-1.5 px-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 block text-xs cursor-pointer"
                    >
                      Export .MD
                    </button>
                    <button
                      onClick={handleExportTxt}
                      className="w-full py-1.5 px-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 block text-xs cursor-pointer"
                    >
                      Export .TXT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-[10px] text-slate-400 font-mono py-1">
            Study Assistant Hub • Active context sync
          </div>
        )}
      </footer>
    </aside>
  );
};

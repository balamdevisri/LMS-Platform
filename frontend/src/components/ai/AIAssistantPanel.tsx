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
  CheckCircle2,
  Globe,
  Gauge,
  Zap,
  Mic,
  Video,
  FileCode2,
  BookMarked
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { mockAIProvider, type AIChatMessage, type LessonSummary, type PracticeQuestion, type InterviewPrepQuestion, type SmartRecommendations, type AIFlashcard, type WeakTopicItem } from '@/services/aiProvider';
import { ChallengeProvider } from '@/services/practice/practiceEngine';

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
  isModal?: boolean; // if true, renders full size inside pop-up modal dialog
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
  isDocked = false,
  isModal = false
}) => {
  const { userProfile, user } = useAuth();
  const currentUserId = userProfile?.uid || user?.uid || 'default_student';

  const challengeProvider = new ChallengeProvider();
  const hasChallenge = !!challengeProvider.getChallengeForLesson(lessonId);

  // --- RESIZE & LAYOUT STATES ---
  const [panelWidth, setPanelWidth] = useState<number>(400);
  const isResizingRef = useRef(false);

  // --- AI TABS SYSTEM ---
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'notes' | 'quiz' | 'flashcards' | 'interview' | 'recs' | 'weakness' | 'future'>('chat');

  // --- DATA STATES (Per Lesson) ---
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // AI Notes Option State: 'summary' | 'key-points' | 'revision' | 'formula'
  const [activeNotesOption, setActiveNotesOption] = useState<'summary' | 'key-points' | 'revision' | 'formula'>('summary');

  // AI Quiz Option State: 'mcq' | 'tf' | 'fib' | 'coding'
  const [activeQuizType, setActiveQuizType] = useState<'mcq' | 'tf' | 'fib' | 'coding'>('mcq');

  // Structured Tabs Data
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewPrepQuestion[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendations | null>(null);
  
  // Flashcards & Weakness Data
  const [flashcards, setFlashcards] = useState<AIFlashcard[]>([]);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [weakTopics, setWeakTopics] = useState<WeakTopicItem[]>([]);

  // Loading States for Tabs
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [loadingWeakness, setLoadingWeakness] = useState(false);

  // MCQ & Quiz Answers Tracking
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedQuizAnswers, setRevealedQuizAnswers] = useState<Record<string, boolean>>({});
  const [fibAnswers, setFibAnswers] = useState<Record<string, string>>({});
  const [codingSubmissions, setCodingSubmissions] = useState<Record<string, string>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- LOCAL PERSISTENCE KEYS ---
  const chatHistoryKey = `shaivika_ai_chat_${currentUserId}_${lessonId}`;
  const summaryKey = `shaivika_ai_summary_${currentUserId}_${lessonId}`;
  const practiceKey = `shaivika_ai_practice_${currentUserId}_${lessonId}_${activeQuizType}`;
  const interviewKey = `shaivika_ai_interview_${currentUserId}_${lessonId}`;
  const recsKey = `shaivika_ai_recs_${currentUserId}_${lessonId}`;
  const flashKey = `shaivika_ai_flash_${currentUserId}_${lessonId}`;

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
      let welcomeText = `Hello! I am your Shaivika AI Learning Assistant. 🧠\n\nI have loaded the syllabus context for "**${lessonTitle}**" (${lessonType.toUpperCase()} lesson).\n\nAsk me anything about this topic, translate explanations, or explore custom summaries, quiz modules, and revision logs!`;
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

    // Load Interview
    const storedInterview = localStorage.getItem(interviewKey);
    setInterviewQuestions(storedInterview ? JSON.parse(storedInterview) : []);

    // Load Recs
    const storedRecs = localStorage.getItem(recsKey);
    setRecommendations(storedRecs ? JSON.parse(storedRecs) : null);

    // Load Flashcards
    const storedFlash = localStorage.getItem(flashKey);
    setFlashcards(storedFlash ? JSON.parse(storedFlash) : []);
    setActiveFlashcardIndex(0);
    setIsFlipped(false);

    // Reset Quiz states
    setSelectedAnswers({});
    setRevealedQuizAnswers({});
    setFibAnswers({});
    setCodingSubmissions({});
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
    if (computedWidth > 320 && computedWidth < 800) {
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

  // Tutor Chat submit with simulated streaming
  const handleSendMessage = async (customText?: string, promptHeader?: string) => {
    const text = customText || inputMessage;
    if (!text.trim()) return;

    if (!customText) setInputMessage('');

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptHeader ? `[${promptHeader}] ${text}` : text,
      timestamp: nowStr
    };

    const updatedHistory = [...messages, userMsg];
    saveChatHistory(updatedHistory);
    setIsTyping(true);

    try {
      let response = '';
      if (promptHeader === 'Explain in Telugu') {
        response = await mockAIProvider.generateTeluguExplanation(lessonTitle, lessonContent || '');
      } else if (promptHeader === 'Explain in English') {
        response = await mockAIProvider.generateEnglishExplanation(lessonTitle, lessonContent || '');
      } else if (promptHeader === 'Beginner Mode') {
        response = await mockAIProvider.generateBeginnerExplanation(lessonTitle, lessonContent || '');
      } else if (promptHeader === 'Advanced Mode') {
        response = await mockAIProvider.generateAdvancedExplanation(lessonTitle, lessonContent || '');
      } else if (promptHeader === 'Show Examples') {
        response = await mockAIProvider.generateExamplesExplanation(lessonTitle, lessonContent || '');
      } else {
        response = await mockAIProvider.sendMessage(text, updatedHistory, {
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
      }

      // Streaming Simulator
      let currentText = '';
      const words = response.split(' ');
      let wordIdx = 0;
      setIsTyping(false);

      const streamMessageId = `ai_stream_${Date.now()}`;
      const placeholderMsg: AIChatMessage = {
        id: streamMessageId,
        sender: 'ai',
        text: '...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const newMsgs = [...updatedHistory, placeholderMsg];
      setMessages(newMsgs);

      const interval = setInterval(() => {
        if (wordIdx < words.length) {
          currentText += (wordIdx === 0 ? '' : ' ') + words[wordIdx];
          setMessages(prev => prev.map(m => m.id === streamMessageId ? { ...m, text: currentText } : m));
          wordIdx++;
        } else {
          clearInterval(interval);
          // Commit final message to local history
          const finalHistory = newMsgs.map(m => m.id === streamMessageId ? { ...m, text: response } : m);
          saveChatHistory(finalHistory);
        }
      }, 30);

    } catch (e) {
      toast.error('AI Tutor connection timed out. Please try again.');
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
      toast.success('AI Notes compiled successfully!');
    } catch (e) {
      toast.error('Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Quiz Generator Loader
  const triggerGenerateQuiz = async () => {
    setLoadingPractice(true);
    try {
      const res = await mockAIProvider.generateQuizByType(lessonId, lessonTitle, activeQuizType);
      setPracticeQuestions(res);
      localStorage.setItem(practiceKey, JSON.stringify(res));
      toast.success(`Generated custom ${activeQuizType.toUpperCase()} Quiz!`);
      // reset answers
      setSelectedAnswers({});
      setRevealedQuizAnswers({});
      setFibAnswers({});
      setCodingSubmissions({});
    } catch (e) {
      toast.error('Failed to generate quiz.');
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
      toast.success('Compiled interview prep parameters.');
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
      let completedIds: string[] = [];
      try {
        const stored = localStorage.getItem(`lms_completed_units_${courseId}`);
        if (stored) completedIds = Object.keys(JSON.parse(stored));
      } catch {}

      const res = await mockAIProvider.generateRecommendations(lessonId, lessonTitle, completedIds);
      setRecommendations(res);
      localStorage.setItem(recsKey, JSON.stringify(res));
      toast.success('Retrieved smart study recommendations.');
    } catch (e) {
      toast.error('Failed to fetch recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  // Flashcards Loader
  const triggerGenerateFlashcards = async () => {
    setLoadingFlashcards(true);
    try {
      const res = await mockAIProvider.generateFlashcards(lessonId, lessonTitle);
      setFlashcards(res);
      localStorage.setItem(flashKey, JSON.stringify(res));
      setActiveFlashcardIndex(0);
      setIsFlipped(false);
      toast.success('Generated AI Flashcards!');
    } catch (e) {
      toast.error('Failed to generate flashcards.');
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // Weak Topic Analysis Loader
  const triggerGenerateWeakness = async () => {
    setLoadingWeakness(true);
    try {
      const res = await mockAIProvider.getWeakTopicAnalysis(currentUserId);
      setWeakTopics(res);
      toast.success('Weak Topic Analysis telemetry completed!');
    } catch (e) {
      toast.error('Failed to compile weakness analysis.');
    } finally {
      setLoadingWeakness(false);
    }
  };

  // Dynamic loaders on sub-tab changes
  useEffect(() => {
    if (!isOpen) return;
    if (activeSubTab === 'notes' && !summary) triggerGenerateSummary();
    if (activeSubTab === 'quiz' && practiceQuestions.length === 0) triggerGenerateQuiz();
    if (activeSubTab === 'flashcards' && flashcards.length === 0) triggerGenerateFlashcards();
    if (activeSubTab === 'interview' && interviewQuestions.length === 0) triggerGenerateInterview();
    if (activeSubTab === 'recs' && !recommendations) triggerGenerateRecommendations();
    if (activeSubTab === 'weakness' && weakTopics.length === 0) triggerGenerateWeakness();
  }, [activeSubTab, lessonId]);

  // Trigger quiz rebuild when type updates
  useEffect(() => {
    if (isOpen && activeSubTab === 'quiz') {
      triggerGenerateQuiz();
    }
  }, [activeQuizType]);

  // --- GENERAL ACTIONS ---
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

  // Layout & UI Style mapping
  const panelStyles = isModal
    ? `w-full h-full bg-white dark:bg-zinc-950 flex flex-col justify-between relative select-text`
    : isDocked
    ? `shrink-0 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between h-[calc(100vh-64px)] relative select-text transition-all`
    : `fixed right-0 top-16 bottom-0 z-40 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between h-[calc(100vh-64px)] relative select-text transition-all`;

  return (
    <aside
      style={!isModal ? { width: `${panelWidth}px` } : undefined}
      className={`${panelStyles} max-w-full font-['Sora']`}
    >
      {/* ------------------- RESIZE DRAG HANDLE (Desktop only) ------------------- */}
      {!isModal && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:block w-1.5 hover:bg-emerald-500 cursor-col-resize absolute left-0 top-0 bottom-0 z-20 transition-colors"
          title="Drag left to resize panel width"
        />
      )}

      {/* ------------------- HEADER ------------------- */}
      <header className="p-4 bg-slate-900 dark:bg-black text-white flex items-center justify-between border-b border-slate-800 dark:border-zinc-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Bot className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xs flex items-center gap-1.5">
              KaizenQ AI Studio
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                GPT-4o
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Cognitive Contextual Mentor</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            title="Minimize Panel"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------------------- LESSON CONTEXT CARD ------------------- */}
      <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-zinc-400 font-mono shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-700 dark:text-zinc-300 truncate max-w-xs">{lessonTitle}</span>
          <span className="text-[9px] bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-1 rounded uppercase shrink-0">
            {lessonType}
          </span>
        </div>
        <span className="text-slate-400 shrink-0">M. {moduleId || '1'}</span>
      </div>

      {/* ------------------- SUB TABS switcher ------------------- */}
      <nav className="flex border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-slate-600 dark:text-zinc-400 shrink-0 overflow-x-auto select-none scrollbar-none">
        {[
          { id: 'chat', label: 'Tutor Chat' },
          { id: 'notes', label: 'AI Notes' },
          { id: 'quiz', label: 'AI Quiz' },
          { id: 'flashcards', label: 'Flashcards' },
          { id: 'interview', label: 'Interview' },
          { id: 'recs', label: 'Recs' },
          { id: 'weakness', label: 'Weak Topics' },
          { id: 'future', label: 'Playground' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap px-4 font-bold text-[11px] ${
              activeSubTab === tab.id
                ? 'border-sky-500 text-sky-700 dark:text-sky-400 bg-sky-50/10'
                : 'border-transparent hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ------------------- MAIN CONTENT TABS PANEL ------------------- */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-zinc-900/20 space-y-4">
        
        {/* ================= TAB 1: TUTOR CHAT INTERFACE ================= */}
        {activeSubTab === 'chat' && (
          <div className="space-y-4 min-h-full flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Option Command Buttons for AI Tutor */}
              <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-3xs space-y-2">
                <span className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
                  AI Tutor Shortcut Controls
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendMessage('Explain this topic in simple Telugu language.', 'Explain in Telugu')}
                    className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950 text-sky-850 dark:text-sky-400 border border-sky-200 dark:border-sky-900 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span>Explain in Telugu</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Provide a detailed conceptual analysis in English.', 'Explain in English')}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 text-indigo-850 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3 text-indigo-500" />
                    <span>Explain in English</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Explain this to me as if I am a beginner with simple analogies.', 'Beginner Mode')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950 text-emerald-850 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Lightbulb className="w-3 h-3 text-emerald-500" />
                    <span>Beginner Mode</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Break down the advanced mechanics, systems, and low-level code parameters.', 'Advanced Mode')}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950 text-purple-850 dark:text-purple-400 border border-purple-200 dark:border-purple-900 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Gauge className="w-3 h-3 text-purple-500" />
                    <span>Advanced Mode</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Give me 3 production use cases and real-world system examples.', 'Show Examples')}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950 text-amber-850 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Show Examples</span>
                  </button>
                </div>
              </div>

              {messages.length <= 1 && (
                <div className="p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-center space-y-2 py-6">
                  <Sparkles className="w-8 h-8 text-slate-350 dark:text-zinc-700 mx-auto animate-pulse" />
                  <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200">Interactive AI Tutor Workspace</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Select a learning mode control shortcut above, or write custom queries in the textbox to begin!
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
                      <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className="space-y-1 max-w-[85%]">
                      <div
                        className={`rounded-2xl p-3 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-3xs ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 dark:bg-zinc-800 text-white rounded-tr-none font-medium'
                            : 'bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 text-slate-850 dark:text-zinc-200 rounded-tl-none'
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
                            className="hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer flex items-center gap-0.5 font-bold"
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
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl rounded-tl-none p-3 shadow-3xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Suggested Prompts Block */}
            {messages.length <= 4 && (
              <div className="space-y-1.5 pt-4">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block px-1">
                  Suggested Action Inputs
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Explain this lesson',
                    'Summarize this lesson',
                    'Give real-world examples',
                    'Simplify this topic',
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-2 text-left rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-sky-300 dark:hover:border-sky-900 text-[10px] font-bold text-slate-700 dark:text-zinc-300 transition-all cursor-pointer shadow-3xs"
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

        {/* ================= TAB 2: AI NOTES ================= */}
        {activeSubTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <BookMarked className="w-4 h-4 text-sky-500" />
                <span>AI Generated Notes</span>
              </h4>
              <button
                onClick={triggerGenerateSummary}
                disabled={loadingSummary}
                className="text-[10px] font-bold text-sky-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingSummary ? 'animate-spin' : ''}`} />
                <span>Re-compile</span>
              </button>
            </div>

            {/* Notes Options Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-[10px] font-bold">
              {[
                { id: 'summary', label: 'Summary' },
                { id: 'key-points', label: 'Key Points' },
                { id: 'revision', label: 'Revision' },
                { id: 'formula', label: 'Formula Sheet' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveNotesOption(opt.id as any)}
                  className={`py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                    activeNotesOption === opt.id
                      ? 'bg-white dark:bg-zinc-800 text-sky-700 dark:text-sky-400 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {loadingSummary ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Extracting notes and formula sheets...</p>
              </div>
            ) : summary ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {activeNotesOption === 'summary' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" /> Learning Objectives
                    </h5>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1 leading-relaxed">
                      {summary.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                )}

                {activeNotesOption === 'key-points' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-emerald-500" /> Core Key Concepts
                    </h5>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1.5 leading-relaxed">
                      {summary.keyConcepts.map((conc, i) => <li key={i}>{conc}</li>)}
                    </ul>
                  </div>
                )}

                {activeNotesOption === 'revision' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" /> Important Takeaways
                      </h5>
                      <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1 leading-relaxed">
                        {summary.importantPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-500" /> Common Mistakes & Traps
                      </h5>
                      <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1 leading-relaxed">
                        {summary.commonMistakes.map((mist, i) => <li key={i}>{mist}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {activeNotesOption === 'formula' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs font-mono">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-500" /> Command & Formula Cheat Sheet
                    </h5>
                    <ul className="list-decimal pl-4 text-[10px] text-slate-600 dark:text-zinc-400 space-y-2 leading-normal">
                      {(summary.formulaSheet || [
                        'Octal codes: chmod 400 (Read), chmod 600 (Read+Write), chmod 755 (Full owner access)',
                        'Standard Pipelines: command1 | command2 (Chaining outputs to inputs)',
                        'Stderr logs trace redirection: command 2> error.log'
                      ]).map((formula, i) => <li key={i}>{formula}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TAB 3: AI QUIZ GENERATOR ================= */}
        {activeSubTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>AI Quiz Sandbox</span>
              </h4>
              <button
                onClick={triggerGenerateQuiz}
                disabled={loadingPractice}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingPractice ? 'animate-spin' : ''}`} />
                <span>Re-generate</span>
              </button>
            </div>

            {/* Quiz Types Selectors */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-[10px] font-bold">
              {[
                { id: 'mcq', label: 'MCQ' },
                { id: 'tf', label: 'True/False' },
                { id: 'fib', label: 'Fill Blanks' },
                { id: 'coding', label: 'Coding' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveQuizType(type.id as any)}
                  className={`py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                    activeQuizType === type.id
                      ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-450 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {loadingPractice ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Generating practice challenges...</p>
              </div>
            ) : practiceQuestions.length > 0 ? (
              <div className="space-y-4">
                {practiceQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Question {idx + 1}
                      </span>
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-850 dark:text-zinc-200 leading-normal">
                      {q.question}
                    </p>

                    {/* MCQ Options */}
                    {q.type === 'mcq' && q.options && (
                      <div className="space-y-1.5">
                        {q.options.map(opt => {
                          const isSelected = selectedAnswers[q.id] === opt;
                          const showCorrect = revealedQuizAnswers[q.id];
                          const isCorrect = opt === q.answer;

                          let btnStyle = 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100';
                          if (isSelected) {
                            btnStyle = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400';
                          }
                          if (showCorrect && isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                if (showCorrect) return;
                                setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }));
                              }}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False Options */}
                    {q.type === 'tf' && q.options && (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map(opt => {
                          const isSelected = selectedAnswers[q.id] === opt;
                          const showCorrect = revealedQuizAnswers[q.id];
                          const isCorrect = opt === q.answer;

                          let btnStyle = 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 text-center hover:bg-slate-100';
                          if (isSelected) {
                            btnStyle = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400';
                          }
                          if (showCorrect && isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                if (showCorrect) return;
                                setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }));
                              }}
                              className={`w-full p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill in Blanks Options */}
                    {q.type === 'fib' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={fibAnswers[q.id] || ''}
                          onChange={(e) => setFibAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Type your answer here..."
                          disabled={revealedQuizAnswers[q.id]}
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Coding Questions */}
                    {q.type === 'coding' && (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={codingSubmissions[q.id] || ''}
                          onChange={(e) => setCodingSubmissions(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Write your code solution..."
                          disabled={revealedQuizAnswers[q.id]}
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Reveal feedback */}
                    {revealedQuizAnswers[q.id] && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400 font-mono">Correct Answer: {q.answer}</p>
                        <p className="text-[11px] text-slate-650 dark:text-zinc-400 leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setRevealedQuizAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="py-1 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold text-slate-700 dark:text-zinc-300 cursor-pointer hover:bg-slate-100"
                      >
                        {revealedQuizAnswers[q.id] ? 'Hide Answer' : 'Reveal Answer & Review'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TAB 4: AI FLASHCARDS ================= */}
        {activeSubTab === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <FileCode2 className="w-4 h-4 text-emerald-500" />
                <span>AI Memory Flashcards</span>
              </h4>
              <button
                onClick={triggerGenerateFlashcards}
                disabled={loadingFlashcards}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingFlashcards ? 'animate-spin' : ''}`} />
                <span>Reset</span>
              </button>
            </div>

            {loadingFlashcards ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Formulating flip study cards...</p>
              </div>
            ) : flashcards.length > 0 ? (
              <div className="space-y-6 flex flex-col items-center">
                {/* Flipping Card Container */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-sky-400 transition-all select-none relative"
                >
                  <div className="absolute top-3 left-4 text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                    {isFlipped ? 'Definition (Back)' : 'Term (Front)'}
                  </div>
                  
                  {isFlipped ? (
                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 leading-relaxed font-sans px-2">
                      {flashcards[activeFlashcardIndex].definition}
                    </p>
                  ) : (
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                      {flashcards[activeFlashcardIndex].term}
                    </h3>
                  )}

                  <div className="absolute bottom-3 text-[9px] text-slate-400 font-semibold uppercase animate-pulse">
                    Click card to flip
                  </div>
                </div>

                {/* Navigation and Indicators */}
                <div className="flex items-center justify-between w-full text-xs font-bold px-2">
                  <button 
                    disabled={activeFlashcardIndex === 0}
                    onClick={() => {
                      setActiveFlashcardIndex(prev => prev - 1);
                      setIsFlipped(false);
                    }}
                    className="py-1.5 px-4 bg-slate-100 dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-slate-500">
                    {activeFlashcardIndex + 1} / {flashcards.length}
                  </span>
                  <button 
                    disabled={activeFlashcardIndex === flashcards.length - 1}
                    onClick={() => {
                      setActiveFlashcardIndex(prev => prev + 1);
                      setIsFlipped(false);
                    }}
                    className="py-1.5 px-4 bg-slate-100 dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No flashcards found. Click Reset to generate.</p>
            )}
          </div>
        )}

        {/* ================= TAB 5: INTERVIEW PREPARATION ================= */}
        {activeSubTab === 'interview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Technical Interview Prep</span>
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
                <p className="text-xs text-slate-400 italic font-medium">Drafting mock interview questions...</p>
              </div>
            ) : interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                {interviewQuestions.map(q => (
                  <div key={q.id} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-3xs animate-in zoom-in-98">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Interview Target</span>
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400">
                        {q.difficulty}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-normal">
                      Q: {q.question}
                    </h5>

                    {!revealedQuizAnswers[q.id] ? (
                      <button
                        onClick={() => setRevealedQuizAnswers(prev => ({ ...prev, [q.id]: true }))}
                        className="w-full text-center py-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-[10px] font-bold text-slate-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                      >
                        Show Expert Sample Answer
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-55 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase">
                          <span>Expert Answer</span>
                          <button
                            onClick={() => setRevealedQuizAnswers(prev => ({ ...prev, [q.id]: false }))}
                            className="text-slate-400 hover:text-slate-650"
                          >
                            Hide
                          </button>
                        </div>
                        <p className="text-xs text-slate-705 dark:text-zinc-350 leading-relaxed font-medium">
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

        {/* ================= TAB 6: SMART RECOMMENDATIONS ================= */}
        {activeSubTab === 'recs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                <span>Smart Pathway Recs</span>
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
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-500 animate-pulse" /> Re-visit Recommended
                    </h5>
                    <div className="space-y-1.5">
                      {recommendations.reviewLessons.map(l => (
                        <div key={l.id} className="text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 p-2 rounded-xl flex items-center justify-between">
                          <span className="truncate">{l.title}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Lessons */}
                {recommendations.nextLessons.length > 0 && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-500 animate-pulse" /> Study Next
                    </h5>
                    <div className="space-y-1.5">
                      {recommendations.nextLessons.map(l => (
                        <div key={l.id} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 p-2 rounded-xl flex items-center justify-between">
                          <span className="truncate">{l.title}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Topics */}
                {recommendations.relatedTopics.length > 0 && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> Advanced Related Concepts
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations.relatedTopics.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TAB 7: AI WEAK TOPIC ANALYSIS ================= */}
        {activeSubTab === 'weakness' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <Gauge className="w-4 h-4 text-rose-500" />
                <span>Weak Topic Analytics</span>
              </h4>
              <button
                onClick={triggerGenerateWeakness}
                disabled={loadingWeakness}
                className="text-[10px] font-bold text-rose-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingWeakness ? 'animate-spin' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {loadingWeakness ? (
              <div className="py-12 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 italic font-medium">Auditing quiz logs and struggle times...</p>
              </div>
            ) : weakTopics.length > 0 ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-2xl text-xs text-rose-800 dark:text-rose-450 font-bold leading-normal">
                  ⚠️ AI analysis detected 3 concepts with lower-than-average completion ratios or high processing latencies. Review is strongly suggested.
                </div>

                {weakTopics.map((wt, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2.5 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-150">{wt.topic}</span>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900 font-mono">
                        Score: {wt.score}%
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-600 dark:text-zinc-400 font-medium">
                      <p><span className="font-bold text-slate-700 dark:text-zinc-300">Struggle Detail:</span> {wt.struggleReason}</p>
                      <p><span className="font-bold text-slate-700 dark:text-zinc-300">Spent time:</span> {wt.timeSpentMins} mins</p>
                    </div>

                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-450 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Action: {wt.remedyAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No weak topic telemetry logs yet.</p>
            )}
          </div>
        )}

        {/* ================= TAB 8: FUTURE PLAYGROUND ================= */}
        {activeSubTab === 'future' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Future-Ready Launchers</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {[
                { title: 'Voice Tutor Mode', desc: 'Activate real-time voice synthesis explanations in Telugu/English.', icon: Mic, badge: 'Coming Soon' },
                { title: 'AI Explanation Video', desc: 'Synthesize custom 2-minute visual explanation videos for this lesson.', icon: Video, badge: 'Architecture Prepared' },
                { title: 'AI Mock Interviews', desc: 'Real-time conversational audio interview simulation with dynamic scoring.', icon: Award, badge: 'In Development' },
                { title: 'AI Resume Reviewer', desc: 'Audit resume templates for systems administrator and developer roles.', icon: FileText, badge: 'Ready Next Release' },
                { title: 'AI Coding Assistant', desc: 'Inline code suggestions, syntax corrections, and system-level advice.', icon: FileCode2, badge: 'Integration Alpha' }
              ].map((play, i) => {
                const Icon = play.icon;
                return (
                  <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-3xs relative overflow-hidden group hover:border-sky-400 transition-all select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-200">{play.title}</span>
                      </div>
                      <span className="text-[8px] font-extrabold bg-linear-to-r from-sky-500 to-indigo-500 text-white px-2 py-0.5 rounded-full border border-sky-400/20">
                        {play.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {play.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ------------------- FOOTER INPUT / CHAT CONTROLS ------------------- */}
      <footer className="p-4 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 shrink-0 space-y-3">
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
                className="flex-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-105 focus:outline-hidden focus:border-purple-650"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>

            {/* Chat utilities */}
            <div className="flex items-center justify-between text-[10px] text-slate-450 px-1 border-t border-slate-100 dark:border-zinc-850 pt-2.5">
              <button
                onClick={handleClearConversation}
                className="hover:text-slate-750 dark:hover:text-zinc-300 cursor-pointer flex items-center gap-1 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear Chat</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerateResponse}
                  className="hover:text-slate-750 dark:hover:text-zinc-300 cursor-pointer flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
                <span className="text-slate-200">|</span>
                <div className="relative group">
                  <button className="hover:text-slate-750 dark:hover:text-zinc-300 cursor-pointer flex items-center gap-1 font-bold">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  {/* Export dropdown */}
                  <div className="absolute right-0 bottom-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-1.5 shadow-lg hidden group-hover:block w-28 text-left z-30 font-bold">
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 block text-xs cursor-pointer"
                    >
                      Export .MD
                    </button>
                    <button
                      onClick={handleExportTxt}
                      className="w-full py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 block text-xs cursor-pointer"
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

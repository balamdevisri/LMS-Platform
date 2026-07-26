import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Bot,
  Bookmark,
  Download,
  FileText,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  HelpCircle,
  Info,
  Zap,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ChallengeProvider,
  CodeExecutionProvider,
  TestRunner,
  AIReviewProvider
} from '../../services/practice/practiceEngine';
import type {
  Challenge,
  Attempt,
  ChallengeProgress,
  AIReviewAspect
} from '../../services/practice/practiceEngine';
import { courseService } from '../../services/courseService';

interface PracticeLabProps {
  challengeId?: string;
  lessonId?: string;
  lessonTitle?: string;
  courseId?: string;
  courseTitle?: string;
  onClose?: () => void;
  standalone?: boolean;
}

const challengeProvider = new ChallengeProvider();
const codeExecutor = new CodeExecutionProvider();
const testRunner = new TestRunner();
const aiReviewer = new AIReviewProvider();

export const PracticeLab: React.FC<PracticeLabProps> = ({
  challengeId,
  lessonId,
  lessonTitle: _lessonTitle = '',
  courseId = '1',
  courseTitle = 'Linux & System Administration',
  onClose: _onClose,
  standalone = false
}) => {
  // 1. Resolve Active Challenge
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengesList, setChallengesList] = useState<Challenge[]>([]);

  useEffect(() => {
    const list = challengeProvider.getChallenges();
    setChallengesList(list);

    let resolved: Challenge | undefined;
    if (challengeId) {
      resolved = challengeProvider.getChallengeById(challengeId);
    } else if (lessonId) {
      resolved = challengeProvider.getChallengeForLesson(lessonId);
    }

    // Default to first challenge if none resolved, or show selector in standalone mode
    if (resolved) {
      setActiveChallenge(resolved);
    } else if (list.length > 0) {
      setActiveChallenge(list[0]);
    }
  }, [challengeId, lessonId]);

  // 2. Editor & Console States
  const [activeLanguage, setActiveLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);

  // 3. Execution & Custom Inputs States
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Console execution result
  const [consoleLogs, setConsoleLogs] = useState<string>('');
  const [runTimeMs, setRunTimeMs] = useState<number | null>(null);
  const [memoryUsageMb, setMemoryUsageMb] = useState<number | null>(null);
  const [execError, setExecError] = useState<string | null>(null);

  // Submission results
  const [testSummary, setTestSummary] = useState<{
    submitted: boolean;
    passed: boolean;
    passedCount: number;
    failedCount: number;
    totalCount: number;
    testCases: {
      testCaseId: string;
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
      isPrivate: boolean;
    }[];
  } | null>(null);

  // 4. Lab Stats & Local Persistence Progress
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [labProgress, setLabProgress] = useState<ChallengeProgress | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  
  // 5. AI Review Sidebar State
  const [activeReviewAspect, setActiveReviewAspect] = useState<AIReviewAspect>('explain');
  const [aiReviewText, setAiReviewText] = useState<string>('');
  const [aiReviewLoading, setAiReviewLoading] = useState<boolean>(false);

  // 6. UI Collapse Toggles (Tablet / Desktop Resizable)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState<boolean>(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState<boolean>(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'description' | 'editor' | 'info' | 'output'>('editor');

  // Ref for synched editor line numbers
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);

  // Save/Load code from local storage per challenge & language
  useEffect(() => {
    if (!activeChallenge) return;
    const progress = challengeProvider.getChallengeProgress(activeChallenge.id);
    setLabProgress(progress);
    
    const attList = challengeProvider.getAttempts(activeChallenge.id);
    setAttempts(attList);

    // Retrieve saved code or fallback to template
    const savedCode = localStorage.getItem(`shaivika_lab_code_${activeChallenge.id}_${activeLanguage}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(activeChallenge.templates[activeLanguage] || '');
    }

    // Reset results & hints when switching challenges
    setConsoleLogs('');
    setRunTimeMs(null);
    setMemoryUsageMb(null);
    setExecError(null);
    setTestSummary(null);
    setHintsRevealed(0);
    setAiReviewText('');
  }, [activeChallenge, activeLanguage]);

  // Track active time spent in Lab
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync scroll for line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Safe code input change helper
  const handleCodeChange = (val: string) => {
    setCode(val);
    if (activeChallenge) {
      localStorage.setItem(`shaivika_lab_code_${activeChallenge.id}_${activeLanguage}`, val);
    }
  };

  // Keyboard editor helper rules (indentation, bracket pairs)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    if (e.key === 'Tab') {
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
      handleCodeChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      }, 0);
    } else if (['{', '[', '(', '"', "'"].includes(e.key)) {
      e.preventDefault();
      const pairs: Record<string, string> = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'" };
      const closingChar = pairs[e.key];
      const newValue = value.substring(0, selectionStart) + e.key + closingChar + value.substring(selectionEnd);
      handleCodeChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const linesBefore = value.substring(0, selectionStart).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];
      const match = currentLine.match(/^(\s*)/);
      const indent = match ? match[1] : '';
      const newValue = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      handleCodeChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + indent.length;
      }, 0);
    }
  };

  // Reset challenge code template
  const handleResetCode = () => {
    if (!activeChallenge) return;
    const confirm = window.confirm('Are you sure you want to reset your editor code to the default template?');
    if (confirm) {
      const template = activeChallenge.templates[activeLanguage] || '';
      handleCodeChange(template);
      toast.info('Editor code reset to initial template.');
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (e) {
      toast.error('Failed to copy code.');
    }
  };

  // Download Code locally
  const handleDownloadCode = () => {
    if (!activeChallenge) return;
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      c: 'c',
      cpp: 'cpp'
    };
    const ext = extensions[activeLanguage] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solution_${activeChallenge.id}.${ext}`;
    link.click();
    toast.success('Source code downloaded successfully.');
  };

  // Export as Markdown or Text formats
  const handleExportFormat = (type: 'txt' | 'md') => {
    if (!activeChallenge) return;
    const content = type === 'md' 
      ? `# Code Solution: ${activeChallenge.title}\n**Language**: ${activeLanguage}\n**Difficulty**: ${activeChallenge.difficulty}\n\n\`\`\`${activeLanguage}\n${code}\n\`\`\``
      : code;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solution_${activeChallenge.id}.${type}`;
    link.click();
    toast.success(`Solution exported as .${type}`);
  };

  // Toggle bookmarking the challenge
  const handleToggleBookmark = () => {
    if (!activeChallenge || !labProgress) return;
    const updatedBookmarked = !labProgress.bookmarked;
    challengeProvider.saveChallengeProgress(activeChallenge.id, { bookmarked: updatedBookmarked });
    setLabProgress((prev) => prev ? { ...prev, bookmarked: updatedBookmarked } : null);
    
    // Synchronize with standard LMS bookmarks under localStorage
    try {
      const userBookmarksKey = `shaivika_bookmarks_${courseId}`;
      const cached = localStorage.getItem(userBookmarksKey);
      let list = [];
      if (cached) list = JSON.parse(cached);

      if (updatedBookmarked) {
        const newBookmark = {
          id: `challenge_${activeChallenge.id}`,
          courseId,
          subtopicId: lessonId || `chal_${activeChallenge.id}`,
          subtopicTitle: `Practice Challenge: ${activeChallenge.title}`,
          moduleTitle: activeChallenge.topic,
          lessonType: 'reading',
          createdAt: new Date().toISOString()
        };
        list.push(newBookmark);
        toast.success('Challenge bookmarked to your study list!');
      } else {
        list = list.filter((bm: any) => bm.id !== `challenge_${activeChallenge.id}`);
        toast.success('Challenge bookmark removed.');
      }
      localStorage.setItem(userBookmarksKey, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Run Code against custom input
  const handleRunCode = async () => {
    if (!activeChallenge) return;
    if (!code.trim()) {
      setExecError('Source code cannot be empty.');
      setConsoleLogs('');
      return;
    }
    setIsRunning(true);
    setExecError(null);
    setConsoleLogs('[INFO] Spinning execution engine sandbox...\n');
    setActiveTabMobile('output');

    try {
      const input = useCustomInput ? customInput : activeChallenge.sampleInput;
      const res = await codeExecutor.runCode(activeChallenge.id, activeLanguage, code, input);
      setIsRunning(false);
      
      if (res.stderr) {
        setExecError(res.stderr);
        setConsoleLogs('');
      } else {
        setConsoleLogs(res.stdout);
        setRunTimeMs(res.executionTimeMs);
        setMemoryUsageMb(res.memoryUsageMb);
      }
    } catch (err: any) {
      setIsRunning(false);
      setExecError('Mock execution failure. Check syntax.');
    }
  };

  // Submit Solution against test suite
  const handleSubmitSolution = async () => {
    if (!activeChallenge || !labProgress) return;
    if (!code.trim()) {
      setExecError('Source code cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    setExecError(null);
    setActiveTabMobile('output');

    try {
      const summary = await testRunner.runTests(activeChallenge.id, activeLanguage, code);
      setIsSubmitting(false);

      setTestSummary({
        submitted: true,
        passed: summary.passed,
        passedCount: summary.passedCount,
        failedCount: summary.failedCount,
        totalCount: summary.totalCount,
        testCases: summary.testCaseResults
      });

      // Update attempt count & attempts stats
      const result: 'Passed' | 'Failed' = summary.passed ? 'Passed' : 'Failed';
      const newAttempt: Attempt = {
        id: `att_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        code,
        language: activeLanguage,
        result,
        passedCount: summary.passedCount,
        failedCount: summary.failedCount,
        totalCount: summary.totalCount,
        runTimeMs: 12 + Math.floor(Math.random() * 20),
        memoryMb: 14.2 + Math.random() * 4
      };

      challengeProvider.addAttempt(activeChallenge.id, newAttempt);
      setAttempts((prev) => [newAttempt, ...prev]);

      const best = (labProgress.bestResult === 'Passed' || result === 'Passed') ? 'Passed' : 'Failed';
      const status = result === 'Passed' ? 'Completed' : 'Attempted';
      const updatedProg = {
        attemptCount: labProgress.attemptCount + 1,
        lastAttempt: new Date().toLocaleString(),
        bestResult: best as any,
        completionStatus: status as any,
        timeSpentSeconds: labProgress.timeSpentSeconds + timeSpent
      };

      challengeProvider.saveChallengeProgress(activeChallenge.id, updatedProg);
      setLabProgress((prev) => prev ? { ...prev, ...updatedProg } : null);

      if (summary.passed) {
        toast.success(`🎉 All ${summary.passedCount} test cases PASSED! +50 XP Awarded!`);
        // Award XP using course service
        courseService.addXPPoints(50);
        // Log activity
        try {
          const cached = localStorage.getItem('shaivika_user_activities');
          let actList = [];
          if (cached) actList = JSON.parse(cached);
          actList.unshift({
            id: `act_${Date.now()}`,
            courseId,
            courseTitle,
            type: 'completed',
            title: `Practice Challenge Completed: ${activeChallenge.title}`,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('shaivika_user_activities', JSON.stringify(actList.slice(0, 50)));
        } catch (e) {}
      } else {
        toast.error(`❌ Failed ${summary.failedCount} test cases. Review code variables and constraints.`);
      }

      // Reset active timer session
      setTimeSpent(0);
    } catch (err) {
      setIsSubmitting(false);
      setExecError('Mock execution failed due to evaluation error.');
    }
  };

  // Request AI Assistant Code review
  const handleAIReview = async (aspect: AIReviewAspect) => {
    if (!activeChallenge) return;
    setActiveReviewAspect(aspect);
    setAiReviewLoading(true);
    setAiReviewText('');
    setRightPanelCollapsed(false);

    try {
      const review = await aiReviewer.requestReview(activeChallenge.id, activeLanguage, code, aspect);
      setAiReviewText(review);
      setAiReviewLoading(false);
      toast.success('AI review comments generated!');
    } catch (e) {
      setAiReviewLoading(false);
      setAiReviewText('Failed to query AI assistant. Try again.');
    }
  };

  if (!activeChallenge) {
    return (
      <div className="p-8 bg-white border border-sky-100 rounded-3xl shadow-xs text-center space-y-4 max-w-lg mx-auto my-8">
        <Info className="w-12 h-12 text-sky-500 mx-auto" />
        <h3 className="font-heading font-extrabold text-xl text-slate-900">No practice lab is available for this lesson.</h3>
        <p className="text-slate-500 text-xs leading-relaxed">
          This topic doesn't have an associated programming task. Check other curriculum segments for hands-on challenges.
        </p>
      </div>
    );
  }

  // Get lines in code editor
  const editorLines = code.split('\n');

  return (
    <div className={`flex flex-col h-full w-full font-['Sora'] bg-slate-900 text-slate-100 select-text ${
      isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-2' : ''
    }`}>
      {/* ---------------- 1. STICKY IDE TOOLBAR ---------------- */}
      <div className="h-14 shrink-0 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 gap-4 sticky top-0 z-10 select-none">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-sky-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 leading-none">PRACTICE LAB</span>
            <span className="font-heading font-extrabold text-xs text-white truncate max-w-40 sm:max-w-xs block mt-1">
              {activeChallenge.title}
            </span>
          </div>
          
          {/* Challenge Selector for Standalone Mode */}
          {standalone && (
            <div className="relative group">
              <select
                value={activeChallenge.id}
                onChange={(e) => {
                  const resolved = challengeProvider.getChallengeById(e.target.value);
                  if (resolved) setActiveChallenge(resolved);
                }}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg py-1 px-2.5 text-[11px] font-bold outline-none cursor-pointer focus:border-sky-500 transition-colors pr-6 appearance-none"
              >
                {challengesList.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none cursor-pointer focus:border-sky-500 transition-colors pr-6 appearance-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Editor Theme Font Sizes */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setFontSize('sm')}
              className={`p-1.5 rounded-md text-[10px] font-bold cursor-pointer ${fontSize === 'sm' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Small text size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`p-1.5 rounded-md text-[10px] font-bold cursor-pointer ${fontSize === 'md' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Medium text size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`p-1.5 rounded-md text-[10px] font-bold cursor-pointer ${fontSize === 'lg' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Large text size"
            >
              A+
            </button>
          </div>

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`hidden md:block p-1.5 rounded-lg border text-xs cursor-pointer font-semibold transition-all ${
              wordWrap ? 'border-sky-500 text-sky-400 bg-sky-950/20' : 'border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Word Wrap"
          >
            Wrap
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
              labProgress?.bookmarked ? 'border-amber-500 bg-amber-950/20 text-amber-500 animate-pulse' : 'border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={labProgress?.bookmarked ? 'Remove Bookmark' : 'Bookmark Challenge'}
          >
            <Bookmark className={`w-4 h-4 ${labProgress?.bookmarked ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            title="Reset code template"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            title="Copy all code"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownloadCode}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            title="Download source file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Export Selector dropdown */}
          <div className="relative group hidden sm:block">
            <button className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 text-[11px] font-bold">
              <FileText className="w-3.5 h-3.5" /> Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl hidden group-hover:block w-32 py-1 z-20">
              <button
                onClick={() => handleExportFormat('txt')}
                className="w-full text-left py-1.5 px-3 text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                As Text (.txt)
              </button>
              <button
                onClick={() => handleExportFormat('md')}
                className="w-full text-left py-1.5 px-3 text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                As Markdown (.md)
              </button>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            title="Fullscreen mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ---------------- 2. MAIN LAYOUT CONTAINER (RESPONSIVE) ---------------- */}
      
      {/* Mobile Tab Stepper header */}
      <div className="flex md:hidden bg-slate-950 border-b border-slate-800 shrink-0 text-xs font-bold text-slate-400 select-none">
        {[
          { id: 'description', label: 'Challenge' },
          { id: 'editor', label: 'Editor' },
          { id: 'info', label: 'Lab Info' },
          { id: 'output', label: 'Output Log' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabMobile(tab.id as any)}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTabMobile === tab.id
                ? 'border-sky-500 text-sky-400 bg-sky-950/10'
                : 'border-transparent hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: Challenge description */}
        <aside className={`shrink-0 border-r border-slate-800 flex flex-col overflow-y-auto bg-slate-900 transition-all duration-300 relative select-text ${
          leftPanelCollapsed ? 'w-0 border-r-0 overflow-hidden' : 'w-72 lg:w-96'
        } ${
          activeTabMobile === 'description' ? 'fixed inset-y-14 left-0 right-0 z-10 w-full block' : 'hidden md:flex'
        }`}>
          {/* Section Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between sticky top-0 z-10">
            <span className="text-[10px] font-extrabold text-sky-400 tracking-widest uppercase">Challenge Prompt</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
              activeChallenge.difficulty === 'Easy' 
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400' 
                : activeChallenge.difficulty === 'Medium' 
                ? 'bg-amber-950/60 border border-amber-800 text-amber-400' 
                : 'bg-rose-950/60 border border-rose-800 text-rose-400'
            }`}>
              {activeChallenge.difficulty}
            </span>
          </div>

          <div className="p-5 space-y-6 text-xs text-slate-300 leading-relaxed font-normal">
            
            {/* Title & Stats */}
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-base text-white">{activeChallenge.title}</h2>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est: {activeChallenge.estimatedTime}</span>
                <span>Topic: {activeChallenge.topic}</span>
              </div>
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <h4 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider">Objectives</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                {activeChallenge.learningObjectives.map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            {/* Input Format */}
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider">Input Format</h4>
              <p className="text-slate-400">{activeChallenge.inputFormat}</p>
            </div>

            {/* Output Format */}
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider">Output Format</h4>
              <p className="text-slate-400">{activeChallenge.outputFormat}</p>
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <h4 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider">Constraints</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 font-mono text-[10px]">
                {activeChallenge.constraints.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Sample input/output cases */}
            <div className="space-y-4 pt-2">
              <h4 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider">Sample Cases</h4>
              
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[10px] text-slate-400">
                <div>
                  <span className="text-sky-400 font-bold">Sample Input:</span>
                  <pre className="bg-slate-900 border border-slate-800 p-2 rounded-xl mt-1 text-slate-200 overflow-x-auto whitespace-pre-wrap">{activeChallenge.sampleInput}</pre>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Sample Output:</span>
                  <pre className="bg-slate-900 border border-slate-800 p-2 rounded-xl mt-1 text-slate-200 overflow-x-auto whitespace-pre-wrap">{activeChallenge.sampleOutput}</pre>
                </div>
                {activeChallenge.explanation && (
                  <div className="pt-2 text-[10px] text-slate-500 font-sans italic border-t border-slate-800 leading-normal">
                    <strong>Explanation:</strong> {activeChallenge.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Toggle Collapse Left Panel Icon Button */}
        <button
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-900 p-1 rounded-r-lg z-15 shadow-md items-center cursor-pointer transition-colors"
          style={{ left: leftPanelCollapsed ? '0px' : leftPanelCollapsed ? '0px' : 'none' }}
          title={leftPanelCollapsed ? 'Expand Challenge Prompt' : 'Collapse Challenge Prompt'}
        >
          {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* CENTER PANEL: Code Editor & Console Logs */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-slate-950 ${
          activeTabMobile === 'editor' ? 'block' : 'hidden md:flex'
        }`}>
          {/* Custom Code Editor */}
          <div className="flex-1 flex overflow-hidden relative" style={{ fontSize: fontSize === 'sm' ? '11px' : fontSize === 'md' ? '13px' : '15px' }}>
            
            {/* Line Numbers Column */}
            <div
              ref={lineNumRef}
              className="w-10 select-none text-right pr-2 text-slate-500 font-mono bg-slate-950 border-r border-slate-800/80 pt-3 pb-3 overflow-hidden text-right leading-relaxed h-full shrink-0"
            >
              {editorLines.map((_, idx) => (
                <div key={idx} className="h-5">{idx + 1}</div>
              ))}
            </div>

            {/* Custom Input Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder="// Write your code solution here..."
              className={`flex-1 bg-slate-950 text-slate-100 font-mono py-3 px-3 outline-none resize-none h-full leading-relaxed overflow-y-auto ${
                wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
              }`}
              spellCheck={false}
            />
          </div>

          {/* Test cases & custom inputs console wrapper */}
          <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col justify-between shrink-0">
            {/* Header switcher */}
            <div className="h-10 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between px-4 select-none shrink-0">
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                <span className="text-sky-400">CONSOLE OUTPUT</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="custom-input-check"
                    checked={useCustomInput}
                    onChange={(e) => setUseCustomInput(e.target.checked)}
                    className="cursor-pointer rounded accent-sky-500"
                  />
                  <label htmlFor="custom-input-check" className="cursor-pointer hover:text-slate-200">Custom Input</label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />}
                  <span>Run Code</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={isRunning || isSubmitting}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-950 font-extrabold rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>

            {/* Console Log Display / Custom Input fields */}
            <div className="flex-1 flex overflow-hidden font-mono text-[10px] leading-relaxed text-slate-300 p-3 select-text">
              {useCustomInput ? (
                <div className="w-full h-full flex flex-col gap-2">
                  <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Provide Custom Input Argument:</span>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder={activeChallenge.sampleInput}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 h-full">
                  {execError && (
                    <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-2xl text-rose-400 space-y-1">
                      <span className="font-bold block uppercase text-[9px]">Execution Error:</span>
                      <pre className="whitespace-pre-wrap">{execError}</pre>
                    </div>
                  )}

                  {!execError && consoleLogs && (
                    <pre className="whitespace-pre-wrap text-slate-300">{consoleLogs}</pre>
                  )}

                  {!execError && !consoleLogs && (
                    <div className="text-slate-500 flex items-center justify-center h-full gap-2">
                      <Info className="w-4 h-4 text-slate-600" />
                      <span>Console outputs are empty. Click "Run Code" or "Submit Solution" to trigger.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer telemetries (Simulated compile logs) */}
            <div className="h-8 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between px-4 text-[9px] text-slate-500 font-bold select-none shrink-0">
              <span className="text-slate-600">MOCK COMPILER (ONLINE)</span>
              <div className="flex items-center gap-4">
                {runTimeMs !== null && <span>Runtime: <span className="text-emerald-500">{runTimeMs}ms</span></span>}
                {memoryUsageMb !== null && <span>Memory: <span className="text-emerald-500">{memoryUsageMb.toFixed(2)}MB</span></span>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Stats & Attempts & AI review drawer */}
        <aside className={`shrink-0 border-l border-slate-800 flex flex-col overflow-y-auto bg-slate-900 transition-all duration-300 relative select-text ${
          rightPanelCollapsed ? 'w-0 border-l-0 overflow-hidden' : 'w-80 lg:w-96'
        } ${
          activeTabMobile === 'info' ? 'fixed inset-y-14 left-0 right-0 z-10 w-full block' : 'hidden md:flex'
        }`}>
          {/* Section Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between sticky top-0 z-10 select-none">
            <span className="text-[10px] font-extrabold text-sky-400 tracking-widest uppercase">Lab Workspace Status</span>
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>+50 XP</span>
            </div>
          </div>

          <div className="p-5 space-y-6">
            
            {/* Lab stats metrics */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs">
              <h3 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider">Your Progress</h3>
              <div className="grid grid-cols-2 gap-3.5 leading-normal">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Completion</span>
                  <span className={`font-bold mt-0.5 block ${
                    labProgress?.completionStatus === 'Completed' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {labProgress?.completionStatus || 'Unstarted'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Attempts</span>
                  <span className="font-bold text-slate-300 mt-0.5 block">{labProgress?.attemptCount || 0} Runs</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Best Result</span>
                  <span className={`font-bold mt-0.5 block ${
                    labProgress?.bestResult === 'Passed' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {labProgress?.bestResult || 'None'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Focus Time</span>
                  <span className="font-bold text-slate-300 mt-0.5 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {Math.floor((labProgress?.timeSpentSeconds || 0) / 60)}m {(labProgress?.timeSpentSeconds || 0) % 60}s
                  </span>
                </div>
                {attempts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase select-none block">Recent Runs Log</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {attempts.map((att) => (
                        <div key={att.id} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] flex items-center justify-between font-mono">
                          <span className="text-slate-500">{att.timestamp}</span>
                          <span className={att.result === 'Passed' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {att.result} ({att.passedCount}/{att.totalCount})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Run Cases Summary banner */}
            {testSummary && (
              <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                testSummary.passed 
                  ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
              }`}>
                <div className="flex items-center justify-between font-bold border-b border-slate-800/40 pb-2">
                  <span className="uppercase text-[10px]">Test Suite Summary</span>
                  <span>{testSummary.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Passed Test Cases:</span>
                  <span className="font-bold text-emerald-400 font-mono">{testSummary.passedCount}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Failed Test Cases:</span>
                  <span className="font-bold text-rose-400 font-mono">{testSummary.failedCount}</span>
                </div>
                
                {/* Specific cases scroll */}
                <div className="space-y-1.5 pt-1.5 max-h-32 overflow-y-auto">
                  {testSummary.testCases.map((tc, idx) => (
                    <div key={tc.testCaseId} className="flex items-center justify-between text-[10px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span>Test Case {idx + 1} {tc.isPrivate && <span className="text-slate-500 text-[9px]">(Hidden)</span>}:</span>
                      <span className={tc.passed ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {tc.passed ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* progressive Hint System */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Hints System</span>
              </h3>
              
              {hintsRevealed > 0 ? (
                <div className="space-y-2 pt-1">
                  {Array.from({ length: hintsRevealed }).map((_, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                      <span className="font-bold text-amber-500 block text-[10px]">Hint {idx + 1}:</span>
                      <p className="mt-1 leading-normal font-medium">{activeChallenge.hints[idx] || 'Review variables and conditionals.'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">Stuck on this challenge? Reveal hints sequentially.</p>
              )}

              {hintsRevealed < activeChallenge.hints.length && (
                <button
                  onClick={() => {
                    setHintsRevealed(hintsRevealed + 1);
                    toast.info(`Hint ${hintsRevealed + 1} unlocked!`);
                  }}
                  className="w-full py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 font-bold rounded-xl border border-amber-500/20 text-xs transition-colors cursor-pointer mt-2"
                >
                  Reveal Hint {hintsRevealed + 1}
                </button>
              )}
            </div>

            {/* AI Review Assistant actions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs">
              <h3 className="font-heading font-extrabold text-[11px] text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>AI Tutor Code Review: {activeReviewAspect.toUpperCase().replace('_', ' ')}</span>
              </h3>

              {/* Review Buttons */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <button
                  onClick={() => handleAIReview('explain')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer text-center"
                >
                  Explain Code
                </button>
                <button
                  onClick={() => handleAIReview('bugs')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer text-center"
                >
                  Find Bugs
                </button>
                <button
                  onClick={() => handleAIReview('optimize')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer text-center"
                >
                  Optimize Logic
                </button>
                <button
                  onClick={() => handleAIReview('readability')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer text-center"
                >
                  Readability
                </button>
                <button
                  onClick={() => handleAIReview('time_complexity')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer text-center"
                >
                  Time Complexity
                </button>
                <button
                  onClick={() => handleAIReview('space_complexity')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer text-center"
                >
                  Space Complexity
                </button>
              </div>

              {/* Loading indicator */}
              {aiReviewLoading && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-center space-y-2 animate-pulse text-slate-400 select-none">
                  <Sparkles className="w-5 h-5 text-emerald-400 mx-auto animate-spin" />
                  <p className="text-[10px] font-bold">Querying AI assistant review logs...</p>
                </div>
              )}

              {/* Review Text Box */}
              {!aiReviewLoading && aiReviewText && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-3 leading-relaxed whitespace-pre-wrap shadow-inner overflow-y-auto max-h-64 font-sans font-medium">
                  {aiReviewText}
                </div>
              )}
            </div>

            {/* Related lesson details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-heading font-extrabold text-[11px] text-slate-400 uppercase tracking-wider select-none">Context Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase select-none">Related Lesson</span>
                  <span className="font-bold text-slate-300 block mt-0.5 hover:underline cursor-pointer">{activeChallenge.relatedLessonTitle}</span>
                </div>
                
                {/* Resources */}
                {activeChallenge.learningResources.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase select-none block mb-1">Learning Resources</span>
                    <div className="flex flex-col gap-1.5">
                      {activeChallenge.learningResources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{res.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge Tags */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase select-none block mb-1">Challenge Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {activeChallenge.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-bold text-slate-400 select-none">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Toggle Collapse Right Panel Icon Button */}
        <button
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-900 p-1 rounded-l-lg z-15 shadow-md items-center cursor-pointer transition-colors"
          style={{ right: rightPanelCollapsed ? '0px' : rightPanelCollapsed ? '0px' : 'none' }}
          title={rightPanelCollapsed ? 'Expand Workspace Details' : 'Collapse Workspace Details'}
        >
          {rightPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

      </div>

      {/* MOBILE SCROLL CONSOLE PANEL IN MOBILE VIEWS */}
      {activeTabMobile === 'output' && (
        <div className="flex md:hidden flex-1 bg-slate-950 p-4 overflow-y-auto space-y-4 font-mono text-[11px] select-text">
          {execError ? (
            <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-2xl text-rose-400 space-y-1">
              <span className="font-bold block uppercase text-[9px]">Execution Error:</span>
              <pre className="whitespace-pre-wrap">{execError}</pre>
            </div>
          ) : consoleLogs ? (
            <pre className="whitespace-pre-wrap text-slate-300">{consoleLogs}</pre>
          ) : (
            <div className="text-slate-500 flex items-center justify-center h-full gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              <span>Console logs are empty. Click Run Code inside editor tab.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

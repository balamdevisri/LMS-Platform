import React, { useState, useRef, useMemo } from 'react';
import { PracticeChrome } from './PracticeChrome';
import {
  Play,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';
import {
  detectLanguage,
  compileAndExecute,
  SUPPORTED_LANGUAGES,
} from '../../../services/compiler/compilerService';

interface CodeEditorRunnerProps {
  title?: string;
  description?: string;
  language?: string;
  initialCode?: string;
}

export const CodeEditorRunner: React.FC<CodeEditorRunnerProps> = ({
  title,
  description,
  language = 'auto',
  initialCode,
}) => {
  // Determine if initial language is specific or auto
  const [selectedLang, setSelectedLang] = useState<string>(language || 'auto');
  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(language === 'auto' || !language);

  // Resolved initial starter code
  const resolvedInitialCode = useMemo(() => {
    if (initialCode && initialCode.trim()) return initialCode.trim();
    if (selectedLang !== 'auto' && SUPPORTED_LANGUAGES[selectedLang]) {
      return SUPPORTED_LANGUAGES[selectedLang].starterCode.trim();
    }
    return SUPPORTED_LANGUAGES.python.starterCode.trim();
  }, [initialCode, selectedLang]);

  const [code, setCode] = useState<string>(resolvedInitialCode);
  const [stdin, setStdin] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stdout, setStdout] = useState<string | null>(null);
  const [stderr, setStderr] = useState<string | null>(null);
  const [compileOutput, setCompileOutput] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [execEngine, setExecEngine] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Real-time automatic language inference from code
  const autoDetected = useMemo(() => {
    return detectLanguage(code);
  }, [code]);

  // The actual language used for compilation
  const effectiveLangKey = isAutoDetect ? autoDetected.languageKey : selectedLang;
  const currentConfig = SUPPORTED_LANGUAGES[effectiveLangKey] || SUPPORTED_LANGUAGES.python;

  const displayTitle = title || (isAutoDetect 
    ? `✨ Auto-Compiler Studio` 
    : `${currentConfig.name} Code Studio`);

  // Handle execution
  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setStdout(null);
    setStderr(null);
    setCompileOutput(null);

    try {
      const result = await compileAndExecute(code, effectiveLangKey, stdin.trim() ? stdin : undefined);
      setStdout(result.stdout || null);
      setStderr(result.stderr || null);
      setCompileOutput(result.compileOutput || null);
      setExecTime(result.executionTimeMs);
      setExecEngine(result.engine);

      if (result.success) {
        toast.success(`Executed with ${currentConfig.name}! (${result.executionTimeMs}ms)`);
      } else {
        toast.error(`Compilation issue detected in ${currentConfig.name}`);
      }
    } catch (err: any) {
      setStderr(`Execution service error: ${err.message || 'Failed to reach code execution server'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = code.substring(0, start) + '    ' + code.substring(end);
      setCode(next);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleReset = () => {
    const starter = SUPPORTED_LANGUAGES[effectiveLangKey]?.starterCode.trim() || '';
    setCode(starter);
    setStdout(null);
    setStderr(null);
    setCompileOutput(null);
    setExecTime(null);
    toast.info(`Reset to default ${currentConfig.name} template.`);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code.');
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 6) }, (_, i) => i + 1);

  // Common quick-pick languages
  const popularLangs = ['python', 'c', 'cpp', 'java', 'javascript', 'typescript', 'go', 'rust'];

  return (
    <PracticeChrome
      title={displayTitle}
      tabLabel={currentConfig.file}
      badgeText={isAutoDetect ? `AUTO: ${autoDetected.name.toUpperCase()}` : currentConfig.name.toUpperCase()}
      badgeColor={
        isAutoDetect 
          ? 'emerald' 
          : effectiveLangKey === 'python' ? 'sky' 
          : effectiveLangKey === 'c' || effectiveLangKey === 'cpp' ? 'blue' 
          : effectiveLangKey === 'java' ? 'rose' 
          : 'amber'
      }
      description={
        description ||
        `Real-time multi-language compiler with intelligent auto-detection. Write or paste any code—the compiler detects the language and runs with real GCC, G++, OpenJDK, Python & Node runtimes.`
      }
      onReset={handleReset}
      isMaximized={isMaximized}
      onToggleMaximize={() => setIsMaximized(!isMaximized)}
      rightActions={
        <div className="flex flex-wrap items-center gap-1.5">
          {/* ✨ Auto-Detect Toggle Button */}
          <button
            onClick={() => {
              setIsAutoDetect(true);
              setSelectedLang('auto');
              toast.success(`Auto-Detect active! Currently detected: ${autoDetected.name}`);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
              isAutoDetect
                ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 ring-1 ring-emerald-400'
                : 'bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title="Auto-detect programming language dynamically"
          >
            <Sparkles className={`w-3 h-3 ${isAutoDetect ? 'animate-spin' : ''}`} />
            <span>Auto Detect</span>
          </button>

          {/* Quick Select Buttons */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
            {popularLangs.map((langKey) => (
              <button
                key={langKey}
                onClick={() => {
                  setIsAutoDetect(false);
                  setSelectedLang(langKey);
                }}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer uppercase ${
                  !isAutoDetect && selectedLang === langKey
                    ? 'bg-indigo-600 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {langKey === 'cpp' ? 'C++' : langKey === 'javascript' ? 'JS' : langKey === 'typescript' ? 'TS' : langKey}
              </button>
            ))}
          </div>

          {/* Dropdown for All 16 Languages */}
          <div className="relative">
            <select
              value={isAutoDetect ? 'auto' : selectedLang}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'auto') {
                  setIsAutoDetect(true);
                  setSelectedLang('auto');
                } else {
                  setIsAutoDetect(false);
                  setSelectedLang(val);
                }
              }}
              className="bg-slate-900 border border-slate-700/90 text-slate-200 rounded-lg py-1 px-2.5 text-[11px] font-bold outline-none cursor-pointer hover:border-slate-500 transition-colors pr-6 appearance-none"
            >
              <option value="auto">✨ Auto Detect</option>
              <optgroup label="Supported Languages">
                {Object.values(SUPPORTED_LANGUAGES).map((cfg) => (
                  <option key={cfg.key} value={cfg.key}>
                    {cfg.name} ({cfg.version})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>
      }
    >
      {/* ── Active Language Information Strip ───────────────────────────────── */}
      <div className="px-4 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          {isAutoDetect ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Auto-Detected:</span>
              <strong className="text-white underline decoration-emerald-500 decoration-2">
                {autoDetected.name}
              </strong>
              <span className="text-[10px] text-emerald-300/80">({currentConfig.version})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Target Language:</span>
              <strong className="text-white">{currentConfig.name}</strong>
              <span className="text-[10px] text-indigo-300/80">({currentConfig.version})</span>
            </span>
          )}

          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[10px] hidden sm:inline">
            Entry File: <code className="text-sky-300">{currentConfig.file}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Starter Templates */}
          <select
            onChange={(e) => {
              const langKey = e.target.value;
              if (langKey && SUPPORTED_LANGUAGES[langKey]) {
                setCode(SUPPORTED_LANGUAGES[langKey].starterCode.trim());
                setIsAutoDetect(true);
                toast.info(`Loaded sample code for ${SUPPORTED_LANGUAGES[langKey].name}`);
              }
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold rounded-md px-2 py-0.5 outline-none cursor-pointer"
          >
            <option value="" disabled>Load Sample...</option>
            {Object.values(SUPPORTED_LANGUAGES).map((cfg) => (
              <option key={cfg.key} value={cfg.key}>
                {cfg.name} Sample
              </option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Editor Workspace with Line Numbers ──────────────────────────────── */}
      <div className="relative flex bg-slate-950 min-h-[220px]">
        {/* Line Numbers */}
        <div className="w-10 py-4 select-none font-mono text-xs text-slate-600 text-right pr-3 bg-slate-950/80 border-r border-slate-800/80 shrink-0">
          {lineNumbers.map((n) => (
            <div key={n} className="leading-relaxed">{n}</div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-sky-200 focus:outline-none resize-none min-h-[200px]"
          placeholder="Write or paste your code in any language (C, C++, Java, Python, Go, Rust, JS, etc.)..."
        />
      </div>

      {/* ── Optional Custom Standard Input (stdin) Drawer ──────────────────── */}
      {showStdin && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-sky-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Standard Input (stdin)
            </span>
            <span className="text-[10px] text-slate-500">
              Passed to scanf, cin, input(), Scanner etc.
            </span>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={2}
            placeholder="Type input data here (separated by newlines or spaces)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-y"
          />
        </div>
      )}

      {/* ── Action Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Press <strong>Ctrl + Enter</strong> to compile & run
          </span>

          {/* Toggle Stdin Drawer */}
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showStdin || stdin.trim()
                ? 'bg-sky-950/60 border border-sky-600/50 text-sky-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Stdin {stdin.trim() ? '(active)' : ''}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Code */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset code to default template"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Run / Compile Button */}
          <button
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling {currentConfig.name}...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compile & Run ({isAutoDetect ? autoDetected.name : currentConfig.name})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Terminal Output / Console ────────────────────────────────────────── */}
      {(stdout !== null || stderr !== null || compileOutput !== null) && (
        <div className="border-t border-slate-800 bg-slate-950 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Compiler Output
              </span>

              {stderr ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Execution Error
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Build Successful
                </span>
              )}

              {execEngine && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  <Cpu className="w-3 h-3 text-sky-400" />
                  {execEngine === 'judge0' ? 'Cloud Cluster' : execEngine === 'wandbox' ? 'Wandbox GCC' : 'Local Sandbox'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {execTime !== null && (
                <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-semibold">
                  <Clock className="w-3 h-3" /> {execTime}ms
                </span>
              )}
              <button
                onClick={() => {
                  setStdout(null);
                  setStderr(null);
                  setCompileOutput(null);
                }}
                className="text-slate-500 hover:text-slate-300 text-[10px] underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {/* Standard Output */}
            {stdout && (
              <pre className="text-slate-100 whitespace-pre-wrap leading-relaxed font-mono">
                {stdout}
              </pre>
            )}

            {/* Stderr / Compiler Diagnostic Output */}
            {stderr && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200">
                <div className="font-bold flex items-center gap-1.5 mb-1.5 text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Compiler / Runtime Diagnostic:</span>
                </div>
                <pre className="whitespace-pre-wrap text-xs font-mono text-red-300 leading-relaxed overflow-x-auto">
                  {stderr}
                </pre>
              </div>
            )}

            {/* Separate Compile Warnings / Info */}
            {compileOutput && compileOutput !== stderr && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
                <div className="font-bold text-amber-400 mb-1">Compiler Notes:</div>
                <pre className="whitespace-pre-wrap font-mono">{compileOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </PracticeChrome>
  );
};

export default CodeEditorRunner;

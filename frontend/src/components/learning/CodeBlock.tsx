import React, { useState, useEffect, useRef } from 'react';
import { Check, Copy, Code2, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { soundService } from '@/services/soundService';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  filename,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const lines = code.trim().split('\n');

  const startWalkthrough = () => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setActiveIndex(lines.length - 1);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(true);
    setActiveIndex(0);
    soundService.play('select');
  };

  const resetWalkthrough = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setActiveIndex(-1);
    soundService.play('select');
  };

  useEffect(() => {
    if (isRunning && activeIndex >= 0 && activeIndex < lines.length) {
      timerRef.current = setTimeout(() => {
        if (activeIndex < lines.length - 1) {
          setActiveIndex(activeIndex + 1);
          soundService.play('select');
        } else {
          setIsRunning(false);
          soundService.play('success');
        }
      }, 150); // 150ms per line highlight
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, activeIndex, lines.length]);

  return (
    <div className="my-6 rounded-2xl border border-slate-850/80 bg-slate-950/40 shadow-xl overflow-hidden transition-all duration-200 group">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-850/80 text-xs text-slate-450">
        <div className="flex items-center gap-2 font-mono">
          <Code2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-slate-300 font-bold">{filename || `${language}`}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Walkthrough Controls */}
          {activeIndex === -1 ? (
            <button
              onClick={startWalkthrough}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-xs"
              title="Walkthrough code lines sequentially"
            >
              <Play className="w-3 h-3 text-primary" />
              <span>Walkthrough</span>
            </button>
          ) : (
            <button
              onClick={resetWalkthrough}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-xs"
              title="Reset walkthrough state"
            >
              <RotateCcw className="w-3 h-3 text-slate-450" />
              <span>Reset</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-xs"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-550" />
                <span className="text-emerald-550 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed bg-slate-950 text-slate-100">
        <pre className="flex gap-4">
          {showLineNumbers && (
            <div className="select-none text-right text-slate-600 font-mono text-xs pr-2 border-r border-slate-800 flex flex-col">
              {lines.map((_, i) => (
                <span key={i} className="leading-6">
                  {i + 1}
                </span>
              ))}
            </div>
          )}
          <code className="flex-1 font-mono text-xs sm:text-sm text-slate-200">
            {lines.map((line, i) => {
              const isActive = i === activeIndex;
              const isHighlightActive = activeIndex !== -1;
              const lineClass = isHighlightActive
                ? isActive
                  ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2 scale-[1.01] shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                  : 'opacity-40'
                : '';

              return (
                <div 
                  key={i} 
                  className={`leading-6 hover:bg-slate-900 px-1 rounded transition-all duration-150 ${lineClass}`}
                >
                  {line || ' '}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};

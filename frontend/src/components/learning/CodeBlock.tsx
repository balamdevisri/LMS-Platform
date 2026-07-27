import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import { toast } from 'sonner';

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

  return (
    <div className="my-6 rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-500/5 overflow-hidden transition-all duration-200 group">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-sky-50/80 border-b border-sky-100 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-mono">
          <Code2 className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-slate-800 font-bold">{filename || `${language}`}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-sky-100 border border-sky-200 text-slate-700 hover:text-slate-900 transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-xs"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
              <span>Copy</span>
            </>
          )}
        </button>
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
          <code className="flex-1 font-mono text-xs sm:text-sm text-sky-200">
            {lines.map((line, i) => (
              <div key={i} className="leading-6 hover:bg-slate-900 px-1 rounded">
                {line || ' '}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

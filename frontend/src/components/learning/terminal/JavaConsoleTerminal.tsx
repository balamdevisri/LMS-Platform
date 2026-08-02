import React, { useState, useRef, useEffect } from 'react';
import { Play, RefreshCw, Code2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface JavaConsoleTerminalProps {
  onCommandRun?: (cmd: string) => void;
  isNightMode?: boolean;
}

export const JavaConsoleTerminal: React.FC<JavaConsoleTerminalProps> = ({ onCommandRun }) => {
  const [code, setCode] = useState(`public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java World!");\n        \n        int sum = 0;\n        for (int i = 1; i <= 5; i++) {\n            sum += i;\n        }\n        System.out.println("Sum of 1 to 5 is: " + sum);\n    }\n}`);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['Java Console Workspace initialized.', 'Write code in Main.java and click Compile & Run.']);
  const [isCompiling, setIsCompiling] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const handleCompileAndRun = () => {
    setIsCompiling(true);
    setConsoleLogs(prev => [...prev, '$ javac Main.java']);
    
    if (onCommandRun) {
      onCommandRun('javac Main.java && java Main');
    }

    setTimeout(() => {
      // Simple parse to look for System.out.println
      const lines = code.split('\n');
      const outputs: string[] = [];
      let hasError = false;

      // Basic syntax check: main class match
      if (!code.includes('public class Main')) {
        outputs.push('Main.java:1: error: class name must match filename (expected Main)');
        hasError = true;
      }
      
      // Basic brackets balance check
      const openCount = (code.match(/\{/g) || []).length;
      const closeCount = (code.match(/\}/g) || []).length;
      if (openCount !== closeCount) {
        outputs.push('Main.java: error: reached end of file while parsing (unmatched braces)');
        hasError = true;
      }

      if (!hasError) {
        outputs.push('[Compilation Successful. Executing Main...]');
        outputs.push('$ java Main');
        
        // Execute simulated stdout
        lines.forEach(line => {
          const match = line.match(/System\.out\.println\s*\((.*?)\)\s*;/);
          if (match) {
            const expr = match[1].trim();
            if (expr.startsWith('"') && expr.endsWith('"')) {
              outputs.push(expr.substring(1, expr.length - 1));
            } else if (expr.includes('+')) {
              // Simple string concat simulator
              const parts = expr.split('+');
              const resolved = parts.map(p => {
                const clean = p.trim();
                if (clean.startsWith('"') && clean.endsWith('"')) {
                  return clean.substring(1, clean.length - 1);
                }
                if (clean === 'sum') return '15';
                return clean;
              }).join('');
              outputs.push(resolved);
            } else {
              outputs.push(expr);
            }
          }
        });
      }

      setConsoleLogs(prev => [...prev, ...outputs]);
      setIsCompiling(false);
      if (hasError) {
        toast.error('Compilation failed with errors.');
      } else {
        toast.success('Java program executed successfully!');
      }
    }, 1000);
  };

  const handleReset = () => {
    setConsoleLogs(['Java Console Workspace initialized.', 'Write code in Main.java and click Compile & Run.']);
    toast.info('Workspace reset.');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl text-slate-100 font-sans min-h-[480px]">
      
      {/* Java Code Editor */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[280px]">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-rose-500" />
              Java Source Editor (Main.java)
            </span>
            <button
              onClick={handleCompileAndRun}
              disabled={isCompiling}
              className="py-1 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isCompiling ? 'Compiling...' : 'Compile & Run'}</span>
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-slate-900 text-white font-mono text-xs focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Compiler / Output Terminal Console */}
      <div className="w-full lg:w-80 flex flex-col border border-slate-800 bg-[#070b12] rounded-2xl overflow-hidden h-[300px] lg:h-auto">
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Output Terminal Console
          </span>
          <button 
            onClick={handleReset}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors cursor-pointer"
            title="Clear Console"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 text-slate-300">
          {consoleLogs.map((log, idx) => (
            <div key={idx} className={log.startsWith('$') ? 'text-cyan-400 font-bold' : log.includes('error') ? 'text-red-400 bg-red-950/20 px-1 py-0.5 rounded' : log.includes('[Compilation') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {log}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};

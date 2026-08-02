import React, { useState, useRef, useEffect } from 'react';
import { Play, RefreshCw, Terminal, TerminalSquare } from 'lucide-react';
import { toast } from 'sonner';

interface PythonInterpreterTerminalProps {
  onCommandRun?: (cmd: string) => void;
  isNightMode?: boolean;
}

export const PythonInterpreterTerminal: React.FC<PythonInterpreterTerminalProps> = ({ onCommandRun }) => {
  const [script, setScript] = useState('def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Student")');
  const [replInput, setReplInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Python 3.10.4 (main) [GCC 11.2.0] on linux',
    'Type "help", "copyright", "credits" or "license" for more information.',
    '>>> '
  ]);

  const [scriptOutput, setScriptOutput] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const scriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  useEffect(() => {
    if (scriptEndRef.current) {
      scriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scriptOutput]);

  const handleRunScript = () => {
    if (!script.trim()) return;

    if (onCommandRun) {
      onCommandRun('[Script Execution]');
    }

    setScriptOutput(['[running script.py...]']);
    setTimeout(() => {
      const logs: string[] = [];
      const lines = script.split('\n');

      try {
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
            const content = trimmed.substring(6, trimmed.length - 1);
            if (content.startsWith('f"') || content.startsWith('f\'')) {
              // Simulated f-string
              const inner = content.substring(2, content.length - 1);
              const resolved = inner.replace(/\{([^}]+)\}/g, (_match, p1) => {
                if (p1 === 'name') return 'Student';
                return p1;
              });
              logs.push(resolved);
            } else {
              logs.push(content.replace(/^["']|["']$/g, ''));
            }
          }
        });

        if (logs.length === 0) {
          logs.push('Script ran successfully with no print outputs.');
        }
        setScriptOutput(logs);
      } catch (err: any) {
        setScriptOutput([`SyntaxError: ${err.message || String(err)}`]);
      }
    }, 400);
  };

  const handleReplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = replInput.trim();
    if (!input) return;

    if (onCommandRun) {
      onCommandRun(input);
    }

    const nextLogs = [...consoleLogs];
    // Remove the trailing '>>> ' for the display
    if (nextLogs[nextLogs.length - 1] === '>>> ') {
      nextLogs.pop();
    }

    nextLogs.push(`>>> ${replInput}`);

    let response = '';
    const lower = input.toLowerCase();

    if (lower === 'help') {
      response = 'Type python statement/expression or print("hello").';
    } else if (lower.startsWith('print(') && lower.endsWith(')')) {
      const content = input.substring(6, input.length - 1);
      response = content.replace(/^["']|["']$/g, '');
    } else if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(input)) {
      try {
        const parts = input.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
        if (parts) {
          const num1 = Number(parts[1]);
          const op = parts[2];
          const num2 = Number(parts[3]);
          if (op === '+') response = String(num1 + num2);
          else if (op === '-') response = String(num1 - num2);
          else if (op === '*') response = String(num1 * num2);
          else if (op === '/') response = String(num1 / num2);
        } else {
          response = 'Error: Invalid math expression.';
        }
      } catch {
        response = 'Error: Invalid math expression.';
      }
    } else if (input.includes('=')) {
      const parts = input.split('=');
      response = `Defined variable ${parts[0].trim()} = ${parts[1].trim()}`;
    } else {
      response = `NameError: name '${input}' is not defined`;
    }

    if (response) {
      nextLogs.push(response);
    }
    nextLogs.push('>>> ');
    setConsoleLogs(nextLogs);
    setReplInput('');
  };

  const handleResetRepl = () => {
    setConsoleLogs([
      'Python 3.10.4 (main) [GCC 11.2.0] on linux',
      'Type "help", "copyright", "credits" or "license" for more information.',
      '>>> '
    ]);
    setScriptOutput([]);
    toast.success('Python environment restarted.');
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-5 rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl text-slate-100 font-sans min-h-[480px]">
      
      {/* Script Editor Pane */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[230px]">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TerminalSquare className="w-4 h-4 text-amber-400" />
              Python Script Editor (script.py)
            </span>
            <button
              onClick={handleRunScript}
              className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Script</span>
            </button>
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="flex-1 p-4 bg-slate-900 text-white font-mono text-xs focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Script Output Console */}
        <div className="flex-1 border border-slate-800 bg-[#0d1117] rounded-2xl p-4 font-mono text-xs overflow-auto h-[120px]">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Script Output Console</div>
          <div className="space-y-1">
            {scriptOutput.map((out, idx) => (
              <div key={idx} className={out.includes('SyntaxError') ? 'text-red-400' : 'text-slate-300'}>
                {out}
              </div>
            ))}
            <div ref={scriptEndRef} />
          </div>
        </div>
      </div>

      {/* Interactive REPL Prompt */}
      <div className="w-full md:w-80 flex flex-col border border-slate-800 bg-[#070b12] rounded-2xl overflow-hidden h-[360px] md:h-auto">
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-500" />
            Interactive REPL
          </span>
          <button 
            onClick={handleResetRepl}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors cursor-pointer"
            title="Restart Python Shell"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1">
          {consoleLogs.map((log, idx) => (
            <div key={idx} className={log.startsWith('>>>') ? 'text-cyan-400' : log.includes('NameError') ? 'text-red-400' : 'text-slate-300'}>
              {log}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>

        <form onSubmit={handleReplSubmit} className="p-2 bg-slate-950 border-t border-slate-800 flex gap-2">
          <span className="text-cyan-400 font-bold font-mono text-xs py-1.5 select-none">&gt;&gt;&gt;</span>
          <input
            type="text"
            value={replInput}
            onChange={(e) => setReplInput(e.target.value)}
            placeholder="Type code here..."
            className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs py-1"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
};

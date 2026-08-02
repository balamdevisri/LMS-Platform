import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, Layout } from 'lucide-react';
import { toast } from 'sonner';

interface ReactPlaygroundTerminalProps {
  onCommandRun?: (cmd: string) => void;
  isNightMode?: boolean;
}

export const ReactPlaygroundTerminal: React.FC<ReactPlaygroundTerminalProps> = ({ onCommandRun }) => {
  const [code, setCode] = useState(`import React, { useState } from 'react';\n\nexport default function ClickCounter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-6 text-center bg-slate-900 rounded-2xl border border-slate-800">\n      <h3 className="text-lg font-bold text-cyan-400">Interactive Counter</h3>\n      <p className="my-4 text-sm text-slate-300">Click count: {count}</p>\n      <button \n        onClick={() => setCount(count + 1)} \n        className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400 transition-all"\n      >\n        Increment Counter\n      </button>\n    </div>\n  );\n}`);

  const [simulatedCount, setSimulatedCount] = useState(0);
  const [simulatedTitle, setSimulatedTitle] = useState('Interactive Counter');

  const handleRunPlayground = () => {
    if (onCommandRun) {
      onCommandRun('npm run build');
    }
    // Simple dynamic updates based on parsing code text
    const titleMatch = code.match(/<h3[^>]*>(.*?)<\/h3>/);
    if (titleMatch && titleMatch[1]) {
      setSimulatedTitle(titleMatch[1]);
    }
    toast.success('⚛️ Preview rebuilt successfully!');
  };

  const handleReset = () => {
    setCode(`import React, { useState } from 'react';\n\nexport default function ClickCounter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-6 text-center bg-slate-900 rounded-2xl border border-slate-800">\n      <h3 className="text-lg font-bold text-cyan-400">Interactive Counter</h3>\n      <p className="my-4 text-sm text-slate-300">Click count: {count}</p>\n      <button \n        onClick={() => setCount(count + 1)} \n        className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400 transition-all"\n      >\n        Increment Counter\n      </button>\n    </div>\n  );\n}`);
    setSimulatedTitle('Interactive Counter');
    setSimulatedCount(0);
    toast.info('Playground code reset.');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl text-slate-100 font-sans min-h-[480px]">
      
      {/* React Code Editor */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[280px]">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-cyan-400" />
              React Component Editor (Component.tsx)
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset Playground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRunPlayground}
                className="py-1 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Rebuild Preview</span>
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-slate-900 text-white font-mono text-xs focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="w-full lg:w-80 flex flex-col border border-slate-800 bg-[#070b12] rounded-2xl overflow-hidden h-[300px] lg:h-auto">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            Live Preview Window
          </span>
        </div>

        <div className="flex-1 p-6 flex items-center justify-center bg-slate-950/40">
          <div className="w-full max-w-xs p-6 text-center bg-slate-905 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="text-md font-bold text-cyan-400 font-sans">{simulatedTitle}</h3>
            <p className="my-4 text-xs text-slate-400 font-sans">
              Click count: <span className="font-mono text-white font-extrabold">{simulatedCount}</span>
            </p>
            <button 
              onClick={() => setSimulatedCount(simulatedCount + 1)} 
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/10"
            >
              Increment Counter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

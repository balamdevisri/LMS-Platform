import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AITutorFloatingButtonProps {
  onClick: () => void;
}

export const AITutorFloatingButton: React.FC<AITutorFloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-linear-to-r from-cyan-500 via-sky-400 to-blue-500 text-slate-950 font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-cyan-300/40 cursor-pointer shadow-cyan-500/30 group"
      title="Ask SHAIVIKA AI Tutor"
    >
      <Bot className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
      <span className="hidden sm:inline">AI Tutor</span>
      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
    </button>
  );
};

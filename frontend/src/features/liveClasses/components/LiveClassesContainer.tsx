import React from 'react';
import { useLiveClasses } from '../hooks/useLiveClasses';
import { Radio, Users, Clock } from 'lucide-react';

export const LiveClassesContainer: React.FC = () => {
  const { classes, loading } = useLiveClasses();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-['Sora']">
        Loading Firestore Live Classroom data architecture...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-['Sora'] text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-black text-lg text-white">Live Classes Architecture Engine</h2>
        <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-full text-xs font-bold font-mono">
          {classes.length} Sessions Synchronized
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c.classId} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-extrabold flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>{c.status}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{c.branch || 'CSE'} • {c.semester || 'Sem 5'}</span>
            </div>

            <h3 className="font-bold text-sm text-white truncate">{c.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>{c.instructorName}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{c.duration} mins</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

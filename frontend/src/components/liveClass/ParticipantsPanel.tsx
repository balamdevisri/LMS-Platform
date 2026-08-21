import React from 'react';
import { Users, Shield, User } from 'lucide-react';

export interface ParticipantItem {
  userId: string;
  name: string;
  role?: string;
}

export interface ParticipantsPanelProps {
  participants: ParticipantItem[];
  onlineCount: number;
  instructorName?: string;
  className?: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  onlineCount,
  instructorName = 'Lead Faculty',
  className = '',
}) => {
  const displayCount = Math.max(participants.length, onlineCount || 1);

  return (
    <div className={`flex flex-col h-full overflow-y-auto space-y-3 ${className}`}>
      {/* Roster Header Stats */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <Users className="w-4 h-4 text-sky-400" />
          <span>{displayCount} Students Online</span>
        </div>
        <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Room
        </span>
      </div>

      {/* Faculty Lead Badge */}
      <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
            {instructorName.charAt(0)}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{instructorName}</span>
            <span className="text-[10px] text-blue-400 font-semibold">Lead Instructor</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1">
          <Shield className="w-3 h-3 text-blue-400" />
          Host
        </span>
      </div>

      {/* Participants Scroll List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
        {participants.length === 0 ? (
          <div className="p-3 text-center text-slate-500 text-xs">
            <User className="w-6 h-6 mx-auto mb-1 text-slate-600" />
            <span>Active students in room ({displayCount})</span>
          </div>
        ) : (
          participants.map((p, idx) => {
            const isInst = (p.role || '').toLowerCase() === 'instructor' || (p.role || '').toLowerCase() === 'admin';
            const isMentor = (p.role || '').toLowerCase() === 'mentor';

            return (
              <div
                key={p.userId || idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {(p.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-200 truncate max-w-[140px]">{p.name || 'Student'}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-extrabold uppercase">
                    {isInst ? 'Instructor' : isMentor ? 'Mentor' : 'Student'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParticipantsPanel;

import React from 'react';
import { Users, Mic, MicOff, Hand, UserX, ShieldCheck, X } from 'lucide-react';
import type { MediaParticipant } from '@/services/liveMedia/mediaTypes';

interface ParticipantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: MediaParticipant[];
  isInstructor: boolean;
  onMuteParticipant?: (userId: string) => void;
  onKickParticipant?: (userId: string) => void;
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  isOpen,
  onClose,
  participants,
  isInstructor,
  onMuteParticipant,
  onKickParticipant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col font-sans animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Class Participants ({participants.length})</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {participants.map((p) => (
          <div
            key={p.userId}
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                p.role === 'instructor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-cyan-400'
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{p.name}</span>
                  {p.role === 'instructor' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{p.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {p.isHandRaised && (
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 animate-pulse" title="Hand Raised">
                  <Hand className="w-3.5 h-3.5" />
                </span>
              )}

              <span className={`p-1.5 rounded-lg border ${
                p.isAudioOn ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                {p.isAudioOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </span>

              {isInstructor && p.role !== 'instructor' && (
                <>
                  {onMuteParticipant && (
                    <button
                      onClick={() => onMuteParticipant(p.userId)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Mute Participant"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onKickParticipant && (
                    <button
                      onClick={() => onKickParticipant(p.userId)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/30 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Remove Participant"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

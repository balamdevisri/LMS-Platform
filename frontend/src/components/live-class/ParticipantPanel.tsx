import React, { useState } from 'react';
import {
  Users,
  Mic,
  MicOff,
  Hand,
  UserX,
  ShieldCheck,
  X,
  VolumeX,
  Volume2,
  Pin,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import type { MediaParticipant } from '@/services/liveMedia/mediaTypes';

interface ParticipantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: MediaParticipant[];
  isInstructor: boolean;
  onMuteParticipant?: (userId: string) => void;
  onAskToUnmute?: (userId: string) => void;
  onAllowMic?: (userId: string) => void;
  onPinParticipant?: (userId: string | null) => void;
  onKickParticipant?: (userId: string) => void;
  onMuteAllStudents?: () => void;
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  isOpen,
  onClose,
  participants,
  isInstructor,
  onMuteParticipant,
  onAskToUnmute,
  onAllowMic,
  onPinParticipant,
  onKickParticipant,
  onMuteAllStudents,
}) => {
  const [confirmMuteAll, setConfirmMuteAll] = useState(false);

  if (!isOpen) return null;

  const studentCount = participants.filter((p) => p.role !== 'instructor' && p.role !== 'mentor').length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col font-sans animate-in slide-in-from-right duration-300">
      {/* Header */}
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

      {/* Instructor Mass Moderation Bar */}
      {isInstructor && studentCount > 0 && onMuteAllStudents && (
        <div className="pt-3 pb-2">
          {confirmMuteAll ? (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Mute all students in classroom?</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onMuteAllStudents();
                    setConfirmMuteAll(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-all"
                >
                  Yes, Mute All
                </button>
                <button
                  onClick={() => setConfirmMuteAll(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmMuteAll(true)}
              className="w-full py-2 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>Mute All Students ({studentCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar">
        {participants.map((p) => {
          const isParticipantInstructor = p.role === 'instructor' || p.role === 'mentor';
          const isSpeaking = Boolean(p.isSpeaking);

          return (
            <div
              key={p.userId}
              className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 text-xs ${
                isSpeaking
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : p.isPinned
                  ? 'bg-sky-950/20 border-sky-500/40'
                  : 'bg-slate-950 border-slate-800/80'
              }`}
            >
              {/* Identity & Status */}
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSpeaking
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 ring-2 ring-emerald-400/30'
                      : isParticipantInstructor
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}
                >
                  {(p.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div className="truncate">
                  <div className="font-bold text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{p.name || 'User'}</span>
                    {isParticipantInstructor && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{p.role}</span>
                    {isSpeaking && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Speaking
                      </span>
                    )}
                    {p.isPinned && (
                      <span className="text-[10px] text-sky-400 font-bold flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        Pinned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges & Instructor Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {p.isHandRaised && (
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 animate-pulse" title="Hand Raised">
                    <Hand className="w-3.5 h-3.5" />
                  </span>
                )}

                {/* Real Microphone Status Badge */}
                <span
                  className={`p-1.5 rounded-lg border ${
                    p.isMutedByInstructor
                      ? 'bg-rose-500/25 border-rose-500/50 text-rose-400'
                      : p.isAudioOn
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={
                    p.isMutedByInstructor
                      ? 'Muted by instructor'
                      : p.isAudioOn
                      ? 'Microphone active'
                      : 'Microphone muted'
                  }
                >
                  {p.isMutedByInstructor ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : p.isAudioOn ? (
                    <Mic className="w-3.5 h-3.5" />
                  ) : (
                    <MicOff className="w-3.5 h-3.5" />
                  )}
                </span>

                {/* Instructor Action Buttons */}
                {isInstructor && !isParticipantInstructor && (
                  <div className="flex items-center gap-1">
                    {/* Pin / Unpin */}
                    {onPinParticipant && (
                      <button
                        onClick={() => onPinParticipant(p.isPinned ? null : p.userId)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                          p.isPinned
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                        title={p.isPinned ? 'Unpin Participant' : 'Pin Participant'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Mute / Ask to Unmute */}
                    {p.isAudioOn ? (
                      onMuteParticipant && (
                        <button
                          onClick={() => onMuteParticipant(p.userId)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Mute Participant"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      onAskToUnmute && (
                        <button
                          onClick={() => onAskToUnmute(p.userId)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 cursor-pointer"
                          title="Ask to Unmute"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}

                    {/* Kick Participant */}
                    {onKickParticipant && (
                      <button
                        onClick={() => onKickParticipant(p.userId)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/30 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Remove Participant"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

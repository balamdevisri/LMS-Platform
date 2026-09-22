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
  Video,
  VideoOff,
  WifiOff,
  Check,
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
  onAcknowledgeHand?: (userId: string) => void;
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
  onAcknowledgeHand,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmMuteAll, setConfirmMuteAll] = useState(false);

  if (!isOpen) return null;

  const filteredParticipants = participants.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const studentCount = participants.filter((p) => p.role !== 'instructor' && p.role !== 'mentor').length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#090d1c]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl p-5 flex flex-col font-sans animate-in slide-in-from-right duration-300 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Participants</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10 text-xs font-mono font-bold">
                {participants.length}
              </span>
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/10"
          aria-label="Close Participants Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="pt-3 pb-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search participants..."
          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.08] transition-all"
        />
      </div>

      {/* Instructor Mass Moderation Bar */}
      {isInstructor && studentCount > 0 && onMuteAllStudents && (
        <div className="pt-2 pb-2">
          {confirmMuteAll ? (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-2 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Mute all students in classroom?</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onMuteAllStudents();
                    setConfirmMuteAll(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-all shadow-md"
                >
                  Yes, Mute All
                </button>
                <button
                  onClick={() => setConfirmMuteAll(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmMuteAll(true)}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <VolumeX className="w-4 h-4" />
              <span>Mute All Students ({studentCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2 kc-custom-scrollbar">
        {filteredParticipants.map((p) => {
          const isParticipantInstructor = p.role === 'instructor' || p.role === 'mentor';
          const isSpeaking = Boolean(p.isSpeaking);

          return (
            <div
              key={p.userId}
              className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 text-xs backdrop-blur-md ${
                isSpeaking
                  ? 'bg-emerald-500/10 border-emerald-400/50 shadow-md shadow-emerald-500/10'
                  : p.isPinned
                  ? 'bg-sky-500/10 border-sky-400/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10'
              }`}
            >
              {/* Identity & Status */}
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-xs shrink-0 shadow-md ${
                    isSpeaking
                      ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400 ring-2 ring-emerald-400/30'
                      : isParticipantInstructor
                      ? 'bg-gradient-to-tr from-amber-500/30 to-purple-500/20 text-amber-300 border border-amber-400/60'
                      : 'bg-gradient-to-tr from-indigo-500/30 to-violet-500/20 text-sky-300 border border-white/15'
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
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">{p.role}</span>
                    {isSpeaking && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Speaking
                      </span>
                    )}
                    {p.connectionState === 'reconnecting' && (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <WifiOff className="w-2.5 h-2.5 animate-pulse" />
                        Reconnecting
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
                  <div className="flex items-center gap-1">
                    <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse backdrop-blur-md" title="Hand Raised">
                      <Hand className="w-3.5 h-3.5" />
                    </span>
                    {isInstructor && onAcknowledgeHand && (
                      <button
                        onClick={() => onAcknowledgeHand(p.userId)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                        title="Acknowledge Hand & Allow Speak"
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>Ack</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Camera Status Badge */}
                <span
                  className={`p-1.5 rounded-xl border backdrop-blur-md ${
                    p.isVideoOn
                      ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                      : 'bg-white/[0.06] border-white/10 text-slate-500'
                  }`}
                  title={p.isVideoOn ? 'Camera Active' : 'Camera Off'}
                >
                  {p.isVideoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </span>

                {/* Real Microphone Status Badge */}
                <span
                  className={`p-1.5 rounded-xl border backdrop-blur-md ${
                    p.isMutedByInstructor
                      ? 'bg-rose-500/25 border-rose-500/50 text-rose-400'
                      : p.isAudioOn
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-white/[0.06] border-white/10 text-slate-500'
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
                        className={`p-1.5 rounded-xl border cursor-pointer transition-all backdrop-blur-md ${
                          p.isPinned
                            ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-slate-300 hover:text-white'
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
                          className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/25 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 cursor-pointer transition-all"
                          title="Mute Participant"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      onAskToUnmute && (
                        <button
                          onClick={() => onAskToUnmute(p.userId)}
                          className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-emerald-500/25 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 cursor-pointer transition-all"
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
                        className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/30 border border-white/10 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 cursor-pointer transition-all"
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

        {filteredParticipants.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">
            No participants found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Monitor, User, ShieldCheck } from 'lucide-react';
import type { MediaParticipant } from '@/services/liveMedia/mediaTypes';

interface VideoTileProps {
  participant: MediaParticipant;
  isLocal?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ participant, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream, participant.isVideoOn]);

  const isInstructor = participant.role === 'instructor';

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border ${
      isInstructor ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-800'
    } flex items-center justify-center group aspect-video transition-all`}>
      {participant.isVideoOn && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3 p-4">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover"
            />
          ) : (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isInstructor ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-cyan-400'
            }`}>
              <User className="w-8 h-8" />
            </div>
          )}
          <span className="text-xs font-bold text-slate-300 truncate max-w-[150px]">
            {participant.name} {isLocal && '(You)'}
          </span>
        </div>
      )}

      {/* Overlay Badge Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-bold text-white shadow-md">
          {isInstructor && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
          <span className="truncate max-w-[120px]">{participant.name}</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {participant.role}
          </span>
        </div>

        <div className={`p-1.5 rounded-xl backdrop-blur-md border ${
          participant.isAudioOn
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
        }`}>
          {participant.isAudioOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
};

interface VideoGridProps {
  participants: MediaParticipant[];
  screenShareStream?: MediaStream | null;
  localUserId: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  screenShareStream,
  localUserId,
}) => {
  const screenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenRef.current && screenShareStream) {
      screenRef.current.srcObject = screenShareStream;
    }
  }, [screenShareStream]);

  if (screenShareStream) {
    return (
      <div className="w-full h-full flex flex-col xl:flex-row gap-4 p-4">
        {/* Main Screen Share Frame */}
        <div className="flex-1 relative bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
          <video
            ref={screenRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-2">
            <Monitor className="w-4 h-4 animate-pulse" />
            <span>Instructor Screen Share Stream</span>
          </div>
        </div>

        {/* Floating Participant Sidebar */}
        <div className="w-full xl:w-72 shrink-0 flex xl:flex-col gap-3 overflow-x-auto xl:overflow-y-auto max-h-full">
          {participants.map((p) => (
            <VideoTile
              key={p.userId}
              participant={p}
              isLocal={p.userId === localUserId}
            />
          ))}
        </div>
      </div>
    );
  }

  const gridColsClass = 
    participants.length <= 1
      ? 'grid-cols-1 max-w-4xl'
      : participants.length <= 4
      ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl';

  return (
    <div className="w-full h-full p-4 flex items-center justify-center overflow-y-auto">
      <div className={`grid ${gridColsClass} gap-4 w-full mx-auto`}>
        {participants.map((p) => (
          <VideoTile
            key={p.userId}
            participant={p}
            isLocal={p.userId === localUserId}
          />
        ))}
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Monitor, User, ShieldCheck, Hand, Maximize2, Minimize2 } from 'lucide-react';
import type { MediaParticipant } from '@/services/liveMedia/mediaTypes';

interface VideoTileProps {
  participant: MediaParticipant;
  isLocal?: boolean;
  isHero?: boolean;
  onSpotlight?: () => void;
  isSpotlighted?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isLocal,
  isHero = false,
  onSpotlight,
  isSpotlighted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [participant.stream, participant.isVideoOn]);

  useEffect(() => {
    if (!isLocal && audioRef.current && participant.stream) {
      audioRef.current.srcObject = participant.stream;
      audioRef.current.play().catch(() => {});
    }
  }, [participant.stream, isLocal]);

  const isInstructor = participant.role === 'instructor' || participant.role === 'mentor';

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-slate-900 border transition-all duration-300 group flex items-center justify-center ${
        isSpotlighted
          ? 'ring-2 ring-sky-400 border-sky-400/80 shadow-2xl shadow-sky-500/20'
          : isInstructor
          ? 'border-amber-500/40 shadow-xl shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700 shadow-md'
      } ${isHero ? 'w-full h-full min-h-[300px] sm:min-h-[420px]' : 'aspect-video w-full'}`}
    >
      {/* Remote Audio Stream (Persists regardless of camera toggle) */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Actual Live Video Track */}
      {participant.isVideoOn && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent audio feedback loop
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        /* Professional Avatar / Offline State */
        <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center select-none">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className={`rounded-full object-cover border-2 shadow-lg ${
                isInstructor ? 'border-amber-400 w-20 h-20' : 'border-sky-400 w-16 h-16'
              }`}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center font-heading font-black shadow-lg ${
                isInstructor
                  ? 'w-20 h-20 text-2xl bg-gradient-to-tr from-amber-500/30 to-amber-600/10 border-2 border-amber-400 text-amber-300'
                  : 'w-16 h-16 text-xl bg-slate-800 text-sky-400 border border-slate-700'
              }`}
            >
              {participant.name ? participant.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px]">
              {participant.name} {isLocal && '(You)'}
            </p>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isInstructor
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isInstructor ? 'Lead Instructor' : 'Student'}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">Camera Off</span>
        </div>
      )}

      {/* Top Left Indicators: Hand Raised & Spotlight */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
        {participant.isHandRaised && (
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
            <Hand className="w-3.5 h-3.5 fill-current" />
            <span>Hand Raised</span>
          </div>
        )}
      </div>

      {/* Top Right Controls: Spotlight Toggle */}
      {onSpotlight && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onSpotlight}
            className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer shadow-md"
            title={isSpotlighted ? 'Exit Spotlight' : 'Spotlight Participant'}
          >
            {isSpotlighted ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Bottom Identity & Audio Status Overlay */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-xs font-bold text-white shadow-md max-w-[80%]">
          {isInstructor && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <span className="truncate">{participant.name} {isLocal && '(You)'}</span>
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
            {participant.role}
          </span>
        </div>

        {/* Real Audio Status Badge */}
        <div
          className={`p-2 rounded-xl backdrop-blur-md border shadow-md transition-all ${
            participant.isAudioOn
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
          }`}
          title={participant.isAudioOn ? 'Microphone Active' : 'Microphone Muted'}
        >
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
  const [spotlightedUserId, setSpotlightedUserId] = useState<string | null>(null);

  // Detect active screen share stream (either passed explicitly or from any participant with active screen share)
  const activeSharer = participants.find((p) => p.isScreenSharing);
  const activeScreenStream =
    screenShareStream ||
    activeSharer?.stream ||
    participants.find((p) => p.isScreenSharing && p.stream)?.stream ||
    null;

  useEffect(() => {
    if (screenRef.current && activeScreenStream) {
      screenRef.current.srcObject = activeScreenStream;
      screenRef.current.muted = true;
      screenRef.current.play().catch((err) => {
        console.warn('[VideoGrid] Screen share video play catch:', err);
      });
    }
  }, [activeScreenStream]);

  // Separate instructor from student participants
  const instructor = participants.find((p) => p.role === 'instructor' || p.role === 'mentor');
  const students = participants.filter((p) => p.role !== 'instructor' && p.role !== 'mentor');

  // Case A: Screen Share is Active
  if (activeScreenStream) {
    return (
      <div className="w-full h-full flex flex-col xl:flex-row gap-4 p-4 overflow-hidden">
        {/* Main Screen Share Hero Area */}
        <div className="flex-1 relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center min-h-[320px]">
          <video
            ref={screenRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-2 shadow-lg">
            <Monitor className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Shared Screen Stream • {activeSharer?.name || 'Live Presenter'}</span>
          </div>
        </div>

        {/* Participant Filmstrip alongside */}
        <div className="w-full xl:w-80 shrink-0 flex xl:flex-col gap-3 overflow-x-auto xl:overflow-y-auto max-h-full no-scrollbar">
          {participants.map((p) => (
            <div key={p.userId} className="shrink-0 w-64 xl:w-full">
              <VideoTile
                participant={p}
                isLocal={p.userId === localUserId}
                isSpotlighted={spotlightedUserId === p.userId}
                onSpotlight={() =>
                  setSpotlightedUserId((prev) => (prev === p.userId ? null : p.userId))
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Case B: User has spotlighted a participant
  if (spotlightedUserId) {
    const spotlighted = participants.find((p) => p.userId === spotlightedUserId) || participants[0];
    const others = participants.filter((p) => p.userId !== spotlightedUserId);

    return (
      <div className="w-full h-full flex flex-col xl:flex-row gap-4 p-4 overflow-hidden">
        <div className="flex-1 relative">
          <VideoTile
            participant={spotlighted}
            isLocal={spotlighted.userId === localUserId}
            isHero={true}
            isSpotlighted={true}
            onSpotlight={() => setSpotlightedUserId(null)}
          />
        </div>
        {others.length > 0 && (
          <div className="w-full xl:w-80 shrink-0 flex xl:flex-col gap-3 overflow-x-auto xl:overflow-y-auto max-h-full no-scrollbar">
            {others.map((p) => (
              <div key={p.userId} className="shrink-0 w-64 xl:w-full">
                <VideoTile
                  participant={p}
                  isLocal={p.userId === localUserId}
                  onSpotlight={() => setSpotlightedUserId(p.userId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Case C: Standard Classroom Layout — Prominent Instructor Stage + Student Grid
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-y-auto max-w-6xl mx-auto">
      {/* Prominent Instructor Hero Tile */}
      {instructor && (
        <div className="w-full max-h-[55%] min-h-[260px] sm:min-h-[380px] flex-1">
          <VideoTile
            participant={instructor}
            isLocal={instructor.userId === localUserId}
            isHero={true}
            onSpotlight={() => setSpotlightedUserId(instructor.userId)}
          />
        </div>
      )}

      {/* Student Tiles Grid */}
      {students.length > 0 && (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Students in Room ({students.length})</span>
          </div>

          <div
            className={`grid gap-3 w-full ${
              students.length === 1
                ? 'grid-cols-1 sm:grid-cols-2 max-w-md mx-auto'
                : students.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : students.length <= 4
                ? 'grid-cols-2 sm:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {students.map((p) => (
              <VideoTile
                key={p.userId}
                participant={p}
                isLocal={p.userId === localUserId}
                onSpotlight={() => setSpotlightedUserId(p.userId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback when only local student without instructor */}
      {!instructor && students.length === 0 && participants.length > 0 && (
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <VideoTile
              participant={participants[0]}
              isLocal={participants[0].userId === localUserId}
              isHero={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;

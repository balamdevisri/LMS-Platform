import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Mic, MicOff, Monitor, User, ShieldCheck, Hand, Maximize2, Minimize2, Pin, VolumeX, Volume2 } from 'lucide-react';
import type { MediaParticipant } from '@/services/liveMedia/mediaTypes';

interface VideoTileProps {
  participant: MediaParticipant;
  isLocal?: boolean;
  isHero?: boolean;
  onSpotlight?: () => void;
  isSpotlighted?: boolean;
  onTogglePin?: () => void;
  canPin?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isLocal,
  isHero = false,
  onSpotlight,
  isSpotlighted = false,
  onTogglePin,
  canPin = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [participant.stream, participant.isVideoOn]);

  useEffect(() => {
    if (!isLocal && audioRef.current && participant.stream) {
      audioRef.current.srcObject = participant.stream;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsAudioBlocked(false))
          .catch((err) => {
            console.warn('[VideoTile] Remote audio play blocked by browser autoplay policy:', err?.name);
            setIsAudioBlocked(true);
          });
      }
    }
  }, [participant.stream, isLocal]);

  // Window-level unlock: user's first click or keystroke automatically unlocks audio
  useEffect(() => {
    if (isLocal) return;
    const unlockAudio = () => {
      if (audioRef.current && participant.stream) {
        audioRef.current.play().then(() => {
          setIsAudioBlocked(false);
        }).catch(() => {});
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [participant.stream, isLocal]);

  const isInstructor = participant.role === 'instructor' || participant.role === 'mentor';
  const isSpeaking = Boolean(participant.isSpeaking);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-slate-900 border transition-all duration-300 group flex items-center justify-center ${
        isSpeaking
          ? 'ring-4 ring-emerald-400 border-emerald-400 shadow-2xl shadow-emerald-500/25'
          : participant.isPinned
          ? 'ring-2 ring-sky-400 border-sky-400/80 shadow-2xl shadow-sky-500/20'
          : isSpotlighted
          ? 'ring-2 ring-indigo-400 border-indigo-400/80 shadow-xl shadow-indigo-500/20'
          : isInstructor
          ? 'border-amber-500/40 shadow-xl shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700 shadow-md'
      } ${isHero ? 'w-full h-full min-h-[300px] sm:min-h-[420px]' : 'aspect-video w-full'}`}
    >
      {/* Remote Audio Stream (Persists regardless of camera toggle) */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Browser Autoplay Blocked Alert Badge */}
      {isAudioBlocked && !isLocal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (audioRef.current) {
              audioRef.current.play().then(() => setIsAudioBlocked(false)).catch(() => {});
            }
          }}
          className="absolute top-12 z-20 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xl cursor-pointer animate-bounce"
          title="Click to enable sound"
        >
          <Volume2 className="w-4 h-4" />
          <span>Click to Enable Audio</span>
        </button>
      )}

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
                isSpeaking
                  ? 'border-emerald-400 ring-4 ring-emerald-400/30'
                  : isInstructor
                  ? 'border-amber-400 w-20 h-20'
                  : 'border-sky-400 w-16 h-16'
              }`}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center font-heading font-black shadow-lg transition-all ${
                isSpeaking
                  ? 'w-20 h-20 text-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 ring-4 ring-emerald-400/25'
                  : isInstructor
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
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isInstructor
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isInstructor ? 'Lead Instructor' : 'Student'}
              </span>
              {isSpeaking && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Speaker
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">Camera Off</span>
        </div>
      )}

      {/* Top Left Indicators: Active Speaking, Pinned & Hand Raised */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
        {isSpeaking && (
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg animate-pulse">
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-slate-950 animate-bounce rounded-full" />
              <span className="w-0.5 h-3 bg-slate-950 animate-bounce rounded-full [animation-delay:0.15s]" />
              <span className="w-0.5 h-1.5 bg-slate-950 animate-bounce rounded-full [animation-delay:0.3s]" />
            </span>
            <span>Speaking</span>
          </div>
        )}

        {participant.isPinned && (
          <div className="px-2.5 py-1 rounded-xl bg-sky-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg">
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>Pinned</span>
          </div>
        )}

        {participant.isHandRaised && (
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
            <Hand className="w-3.5 h-3.5 fill-current" />
            <span>Hand Raised</span>
          </div>
        )}
      </div>

      {/* Top Right Controls: Pinning & Spotlight Toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPin && onTogglePin && (
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-xl border text-xs cursor-pointer shadow-md transition-all ${
              participant.isPinned
                ? 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400'
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={participant.isPinned ? 'Unpin Participant' : 'Pin Participant'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}

        {onSpotlight && (
          <button
            onClick={onSpotlight}
            className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer shadow-md"
            title={isSpotlighted ? 'Exit Spotlight' : 'Spotlight Participant'}
          >
            {isSpotlighted ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

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
            participant.isMutedByInstructor
              ? 'bg-rose-500/25 border-rose-500/50 text-rose-400'
              : participant.isAudioOn
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-800/80 border-slate-700 text-slate-500'
          }`}
          title={
            participant.isMutedByInstructor
              ? 'Microphone muted by instructor'
              : participant.isAudioOn
              ? 'Microphone Active'
              : 'Microphone Muted'
          }
        >
          {participant.isMutedByInstructor ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : participant.isAudioOn ? (
            <Mic className="w-3.5 h-3.5" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
};

interface VideoGridProps {
  participants: MediaParticipant[];
  screenShareStream?: MediaStream | null;
  localUserId: string;
  isInstructor?: boolean;
  onPinParticipant?: (userId: string | null) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  screenShareStream,
  localUserId,
  isInstructor = false,
  onPinParticipant,
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

  // Identify prioritized participants
  const pinnedParticipant = participants.find((p) => p.isPinned);
  const activeSpeaker = participants.find((p) => p.isSpeaking);
  const instructor = participants.find((p) => p.role === 'instructor' || p.role === 'mentor');

  // Automatic hero determination:
  // 1. Manually spotlighted participant
  // 2. Pinned participant
  // 3. Active speaker (auto-spotlight)
  // 4. Default instructor
  const heroParticipant = useMemo(() => {
    if (spotlightedUserId) {
      return participants.find((p) => p.userId === spotlightedUserId) || null;
    }
    if (pinnedParticipant) {
      return pinnedParticipant;
    }
    if (activeSpeaker) {
      return activeSpeaker;
    }
    return instructor || participants[0] || null;
  }, [spotlightedUserId, pinnedParticipant, activeSpeaker, instructor, participants]);

  // Subordinated grid participants
  const secondaryParticipants = useMemo(() => {
    if (!heroParticipant) return participants;
    const base = participants.filter((p) => p.userId !== heroParticipant.userId);
    // For students: suppress idle student tiles (camera off & not speaking) to eliminate visual clutter and save bandwidth
    if (!isInstructor) {
      return base.filter((p) => p.isVideoOn || p.isSpeaking || p.role === 'instructor' || p.role === 'mentor');
    }
    return base;
  }, [participants, heroParticipant, isInstructor]);

  // CASE 1: SCREEN SHARE IS ACTIVE (Highest Display Priority)
  if (activeScreenStream) {
    return (
      <div className="w-full h-full flex flex-col xl:flex-row gap-4 p-4 overflow-hidden relative">
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

        {/* Participant Filmstrip alongside: FULL for Instructor; for Students, screen share is exclusive with optional floating instructor cam */}
        {isInstructor ? (
          <div className="w-full xl:w-80 shrink-0 flex xl:flex-col gap-3 overflow-x-auto xl:overflow-y-auto max-h-full no-scrollbar">
            {participants.map((p) => (
              <div key={p.userId} className="shrink-0 w-64 xl:w-full">
                <VideoTile
                  participant={p}
                  isLocal={p.userId === localUserId}
                  isSpotlighted={spotlightedUserId === p.userId}
                  canPin={isInstructor}
                  onTogglePin={onPinParticipant ? () => onPinParticipant(p.isPinned ? null : p.userId) : undefined}
                  onSpotlight={() =>
                    setSpotlightedUserId((prev) => (prev === p.userId ? null : p.userId))
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          /* Student View: Clean screen-share only; show small PIP only if instructor camera is actively on */
          instructor && instructor.isVideoOn && (
            <div className="absolute bottom-6 right-6 w-48 sm:w-56 aspect-video z-20 shadow-2xl rounded-2xl overflow-hidden border border-sky-400/50">
              <VideoTile
                participant={instructor}
                isHero={false}
              />
            </div>
          )
        )}
      </div>
    );
  }

  // CASE 2: HERO STAGE (Active Speaker, Pinned Participant, or Instructor) + FILMSTRIP / GRID
  if (heroParticipant) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-4 overflow-y-auto max-w-6xl mx-auto">
        {/* Hero Tile */}
        <div className="w-full max-h-[58%] min-h-[280px] sm:min-h-[400px] flex-1">
          <VideoTile
            participant={heroParticipant}
            isLocal={heroParticipant.userId === localUserId}
            isHero={true}
            isSpotlighted={spotlightedUserId === heroParticipant.userId}
            canPin={isInstructor}
            onTogglePin={onPinParticipant ? () => onPinParticipant(heroParticipant.isPinned ? null : heroParticipant.userId) : undefined}
            onSpotlight={() => setSpotlightedUserId((prev) => (prev === heroParticipant.userId ? null : heroParticipant.userId))}
          />
        </div>

        {/* Secondary Participant Tiles */}
        {secondaryParticipants.length > 0 && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2 px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Classroom Participants ({participants.length})</span>
              {activeSpeaker && activeSpeaker.userId !== heroParticipant.userId && (
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {activeSpeaker.name} is speaking
                </span>
              )}
            </div>

            <div
              className={`grid gap-3 w-full ${
                secondaryParticipants.length === 1
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-md mx-auto'
                  : secondaryParticipants.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : secondaryParticipants.length <= 4
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {secondaryParticipants.map((p) => (
                <VideoTile
                  key={p.userId}
                  participant={p}
                  isLocal={p.userId === localUserId}
                  canPin={isInstructor}
                  onTogglePin={onPinParticipant ? () => onPinParticipant(p.isPinned ? null : p.userId) : undefined}
                  onSpotlight={() => setSpotlightedUserId((prev) => (prev === p.userId ? null : p.userId))}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback empty view
  return (
    <div className="w-full h-full flex items-center justify-center text-slate-500 font-sans text-xs">
      Waiting for participants to join...
    </div>
  );
};

export default VideoGrid;

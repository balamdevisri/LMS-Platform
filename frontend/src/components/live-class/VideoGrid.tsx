import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Monitor,
  User,
  ShieldCheck,
  Hand,
  Maximize2,
  Minimize2,
  Pin,
  VolumeX,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Scan,
} from 'lucide-react';
import type { MediaParticipant } from '@/services/liveMedia/mediaTypes';
import { VideoQuality } from 'livekit-client';

// ============================================================================
// ============================================================================
// NORMALIZED IDENTITY & ROLE HELPERS (PHASE 2)
// Handles various backend/socket representations (userId, uid, id, socketId)
// ============================================================================
export const getParticipantUserId = (participant: any): string => {
  if (!participant) return '';
  return String(
    participant.userId || participant.id || participant.uid || participant.socketId || ''
  ).trim();
};

export const getParticipantRole = (participant: any): string => {
  if (!participant) return 'student';
  return String(participant.role || '').trim().toLowerCase();
};

// ============================================================================
// AUTHORITATIVE INSTRUCTOR IDENTIFICATION HELPER
// Priority:
// 1. Explicit instructorId match (from backend classroom metadata)
// 2. Authoritative role: 'instructor' (case-insensitive)
// 3. Authorized staff / mentor / admin role
// NEVER returns participants[0] or a student.
// In student view, strictly ignores the local user and any student-role participant!
// ============================================================================
export const getInstructorParticipant = (
  participants: MediaParticipant[],
  instructorId?: string,
  localUserId?: string,
  isInstructorView?: boolean
): MediaParticipant | null => {
  if (!participants || participants.length === 0) {
    console.log('[LIVE_DEBUG] INSTRUCTOR_NOT_IN_PARTICIPANTS: empty participants list');
    return null;
  }

  const cleanLocalUid = (localUserId || '').trim();
  const cleanInstId = (instructorId || '').trim();

  // Filter candidate pool:
  // When in student view, NEVER allow the local student or any participant with role 'student' to be identified as instructor!
  const candidatePool = participants.filter((p) => {
    const pUid = getParticipantUserId(p);
    const pRole = getParticipantRole(p);
    if (!isInstructorView) {
      if (cleanLocalUid && pUid === cleanLocalUid) return false;
      if (pRole === 'student') return false;
    }
    return true;
  });

  // 1. Authoritative instructor ID match from backend
  if (cleanInstId) {
    if (!isInstructorView && cleanLocalUid && cleanInstId === cleanLocalUid) {
      console.warn(
        `[LIVE_DEBUG] CONFLICT: Backend instructorId (${cleanInstId}) equals local student ID! Ignoring local student as instructor candidate.`
      );
    } else {
      const byId = candidatePool.find((p) => getParticipantUserId(p) === cleanInstId);
      if (byId) {
        console.log(`[LIVE_DEBUG] instructor candidate found by ID: ${getParticipantUserId(byId)} (${byId.name})`);
        return byId;
      }
    }
  }

  // 2. Explicit instructor role check (case-insensitive)
  const byRole = candidatePool.find((p) => getParticipantRole(p) === 'instructor');
  if (byRole) {
    console.log(`[LIVE_DEBUG] instructor candidate found by role: ${getParticipantUserId(byRole)} (${byRole.name})`);
    return byRole;
  }

  // 3. Authorized staff / mentor / admin / host role
  const byStaffRole = candidatePool.find((p) =>
    ['admin', 'mentor', 'host', 'lead'].includes(getParticipantRole(p))
  );
  if (byStaffRole) {
    console.log(`[LIVE_DEBUG] instructor candidate found by staff role: ${getParticipantUserId(byStaffRole)} (${byStaffRole.name})`);
    return byStaffRole;
  }

  console.log(`[LIVE_DEBUG] INSTRUCTOR_NOT_IN_PARTICIPANTS (candidatesChecked=${candidatePool.length} totalParticipants=${participants.length})`);
  return null;
};

// ============================================================================
// ============================================================================
// NETWORK CONNECTION QUALITY SIGNAL INDICATOR
// ============================================================================
export const SignalBars: React.FC<{ quality?: string }> = ({ quality }) => {
  const q = quality || 'good';
  const bars = q === 'excellent' ? 3 : q === 'good' ? 2 : q === 'poor' ? 1 : 2;
  const color = q === 'poor' ? 'bg-rose-400' : q === 'good' ? 'bg-emerald-400' : 'bg-emerald-400';
  return (
    <div className="flex items-end gap-0.5 h-3 px-1 shrink-0" title={`Connection Quality: ${q}`}>
      <span className={`w-0.5 h-1 rounded-full ${bars >= 1 ? color : 'bg-white/25'}`} />
      <span className={`w-0.5 h-2 rounded-full ${bars >= 2 ? color : 'bg-white/25'}`} />
      <span className={`w-0.5 h-3 rounded-full ${bars >= 3 ? color : 'bg-white/25'}`} />
    </div>
  );
};

// ============================================================================
// MAIN HERO VIDEO TILE COMPONENT
// Used for displaying the primary stage content (Instructor or Spotlight)
// ============================================================================
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
  const attachedTrackRef = useRef<any>(null);

  const shouldRenderVideo = Boolean(
    participant.isVideoOn ||
    participant.isScreenSharing ||
    participant.stream?.getVideoTracks().some((track) => track.readyState === 'live')
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldRenderVideo) {
      if (attachedTrackRef.current && el) {
        try {
          attachedTrackRef.current.detach(el);
        } catch (_) {}
        attachedTrackRef.current = null;
      }
      return;
    }

    if (participant.videoLiveKitTrack && typeof participant.videoLiveKitTrack.attach === 'function') {
      if (attachedTrackRef.current === participant.videoLiveKitTrack && el.srcObject) {
        // Track is already attached to this element, do not detach or re-attach
        return;
      }
      if (attachedTrackRef.current && attachedTrackRef.current !== participant.videoLiveKitTrack) {
        try {
          attachedTrackRef.current.detach(el);
        } catch (_) {}
      }
      try {
        participant.videoLiveKitTrack.attach(el);
        attachedTrackRef.current = participant.videoLiveKitTrack;
      } catch (err) {
        console.warn(`[LIVE_DEBUG][REMOTE_VIDEO] LiveKit track.attach notice:`, err);
      }
    } else if (participant.stream) {
      if (el.srcObject !== participant.stream) {
        el.srcObject = participant.stream;
      }
      el.play()
        .then(() => {
          console.log(`[LIVE_DEBUG][REMOTE_VIDEO] SUCCESS remoteUserId=${participant.userId}`);
        })
        .catch((err) => {
          console.error(`[LIVE_DEBUG][REMOTE_VIDEO] ERROR remoteUserId=${participant.userId} errorName=${err?.name} errorMessage=${err?.message}`, err);
        });
    }
  }, [participant.stream, participant.videoLiveKitTrack, participant.isVideoOn, participant.isScreenSharing, participant.streamVersion, shouldRenderVideo, isHero]);

  // Clean up track on unmount
  useEffect(() => {
    return () => {
      if (attachedTrackRef.current && videoRef.current) {
        try {
          attachedTrackRef.current.detach(videoRef.current);
        } catch (_) {}
        attachedTrackRef.current = null;
      }
    };
  }, []);

  const isInstructorRole =
    participant.role === 'instructor' ||
    participant.role === 'mentor' ||
    (participant.role as string) === 'admin';
  const isSpeaking = Boolean(participant.isSpeaking);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-[#0a0f1d] border transition-all duration-300 group flex items-center justify-center ${
        isSpeaking
          ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.35)]'
          : participant.isPinned
          ? 'ring-2 ring-sky-400 border-sky-400/90 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
          : isSpotlighted
          ? 'ring-2 ring-indigo-400 border-indigo-400/90 shadow-[0_0_30px_rgba(124,140,255,0.25)]'
          : isInstructorRole
          ? 'border-amber-500/40 shadow-xl shadow-amber-500/10'
          : 'border-white/10 hover:border-white/20 shadow-2xl'
      } ${isHero ? 'w-full h-full min-h-[300px] sm:min-h-[400px]' : 'aspect-video w-full'}`}
    >
      {/* Actual Live Video Track (muted to avoid double audio; audio is handled by root pool) */}
      {shouldRenderVideo && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          className={`w-full h-full object-cover ${isLocal && !participant.isScreenSharing ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        /* Professional Avatar / Offline Standby State */
        <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center select-none">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className={`rounded-full object-cover border-2 shadow-xl ${
                isSpeaking
                  ? 'border-emerald-400 ring-4 ring-emerald-400/30'
                  : isInstructorRole
                  ? 'border-amber-400 w-24 h-24'
                  : 'border-sky-400 w-20 h-20'
              }`}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center font-heading font-black shadow-xl transition-all ${
                isSpeaking
                  ? 'w-24 h-24 text-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 ring-4 ring-emerald-400/25'
                  : isInstructorRole
                  ? 'w-24 h-24 text-3xl bg-gradient-to-tr from-amber-500/30 via-purple-500/20 to-indigo-500/20 border-2 border-amber-400/80 text-amber-300 shadow-amber-500/10'
                  : 'w-20 h-20 text-2xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/20 text-sky-300 border border-white/15'
              }`}
            >
              {participant.name ? participant.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-sm sm:text-base font-bold text-white truncate max-w-[240px] drop-shadow-sm">
              {participant.name} {isLocal && '(You)'}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isInstructorRole
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : 'bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {isInstructorRole ? 'Lead Instructor' : 'Student'}
              </span>
              {isSpeaking && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Active Speaker
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-slate-400/80 font-medium">Camera Off</span>
        </div>
      )}

      {/* Top Left Indicators: Active Speaking, Pinned & Hand Raised */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
        {isSpeaking && (
          <div className="px-3 py-1 rounded-full bg-emerald-500/95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md animate-pulse">
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-slate-950 animate-bounce rounded-full" />
              <span className="w-0.5 h-3 bg-slate-950 animate-bounce rounded-full [animation-delay:0.15s]" />
              <span className="w-0.5 h-1.5 bg-slate-950 animate-bounce rounded-full [animation-delay:0.3s]" />
            </span>
            <span>Speaking</span>
          </div>
        )}

        {participant.isPinned && (
          <div className="px-3 py-1 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>Pinned</span>
          </div>
        )}

        {participant.isHandRaised && (
          <div className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md animate-bounce">
            <Hand className="w-3.5 h-3.5 fill-current" />
            <span>Hand Raised</span>
          </div>
        )}
      </div>

      {/* Top Right Controls: Pinning & Spotlight Toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPin && onTogglePin && (
          <button
            onClick={onTogglePin}
            className={`p-2 rounded-xl border text-xs cursor-pointer shadow-lg backdrop-blur-xl transition-all ${
              participant.isPinned
                ? 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400'
                : 'bg-black/60 hover:bg-black/80 border-white/15 text-slate-300 hover:text-white'
            }`}
            title={participant.isPinned ? 'Unpin Participant' : 'Pin Participant'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}

        {onSpotlight && (
          <button
            onClick={onSpotlight}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/15 text-slate-300 hover:text-white cursor-pointer shadow-lg backdrop-blur-xl transition-all"
            title={isSpotlighted ? 'Exit Spotlight' : 'Spotlight Participant'}
          >
            {isSpotlighted ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Bottom Identity & Audio Status Overlay */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-black/65 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/15 text-xs font-semibold text-white shadow-xl max-w-[80%]">
          {isInstructorRole && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <span className="truncate">{participant.name} {isLocal && '(You)'}</span>
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10 shrink-0">
            {participant.role}
          </span>
          <SignalBars quality={participant.connectionQuality} />
        </div>

        {/* Real Audio Status Badge */}
        <div
          className={`p-2 rounded-2xl backdrop-blur-xl border shadow-xl transition-all ${
            participant.isMutedByInstructor
              ? 'bg-rose-500/25 border-rose-500/50 text-rose-400'
              : participant.isAudioOn
              ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
              : 'bg-black/65 border-white/15 text-slate-400'
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

// ============================================================================
// COMPACT PARTICIPANT TILE COMPONENT
// Used exclusively in the compact participant strip / roster
// Keeps student tiles small, clean, and responsive
// ============================================================================
interface CompactParticipantTileProps {
  participant: MediaParticipant;
  isLocal?: boolean;
  canPin?: boolean;
  onTogglePin?: () => void;
  onSpotlight?: () => void;
  isSpotlighted?: boolean;
}

export const CompactParticipantTile: React.FC<CompactParticipantTileProps> = ({
  participant,
  isLocal,
  canPin = false,
  onTogglePin,
  onSpotlight,
  isSpotlighted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const attachedTrackRef = useRef<any>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !participant.isVideoOn) {
      if (attachedTrackRef.current && el) {
        try {
          attachedTrackRef.current.detach(el);
        } catch (_) {}
        attachedTrackRef.current = null;
      }
      return;
    }

    if (participant.videoLiveKitTrack && typeof participant.videoLiveKitTrack.attach === 'function') {
      if (attachedTrackRef.current === participant.videoLiveKitTrack && el.srcObject) {
        return;
      }
      if (attachedTrackRef.current && attachedTrackRef.current !== participant.videoLiveKitTrack) {
        try {
          attachedTrackRef.current.detach(el);
        } catch (_) {}
      }
      try {
        participant.videoLiveKitTrack.attach(el);
        attachedTrackRef.current = participant.videoLiveKitTrack;
      } catch (err) {
        console.warn(`[CompactParticipantTile] LiveKit track.attach notice:`, err);
      }
    } else if (participant.stream) {
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [participant.stream, participant.videoLiveKitTrack, participant.isVideoOn, participant.streamVersion]);

  useEffect(() => {
    return () => {
      if (attachedTrackRef.current && videoRef.current) {
        try {
          attachedTrackRef.current.detach(videoRef.current);
        } catch (_) {}
        attachedTrackRef.current = null;
      }
    };
  }, []);

  const isInstructorRole =
    participant.role === 'instructor' ||
    participant.role === 'mentor' ||
    (participant.role as string) === 'admin';
  const isSpeaking = Boolean(participant.isSpeaking);

  return (
    <div
      className={`group relative shrink-0 w-44 sm:w-52 h-28 sm:h-32 rounded-2xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border transition-all duration-200 select-none flex flex-col justify-between p-2.5 ${
        isSpeaking
          ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
          : participant.isPinned
          ? 'ring-2 ring-sky-400 border-sky-400'
          : isSpotlighted
          ? 'ring-2 ring-indigo-400 border-indigo-400'
          : isInstructorRole
          ? 'border-amber-500/50 bg-gradient-to-b from-[#0a0e1c] to-amber-950/25 shadow-md shadow-amber-500/10'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Background: Video track or Avatar (Never an empty black box) */}
      {participant.isVideoOn && participant.stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={true}
            className={`absolute inset-0 w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className={`w-10 h-10 rounded-full object-cover border ${
                isSpeaking
                  ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                  : isInstructorRole
                  ? 'border-amber-400'
                  : 'border-white/20'
              }`}
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-black text-sm border shadow-sm ${
                isSpeaking
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 ring-2 ring-emerald-400/30'
                  : isInstructorRole
                  ? 'bg-gradient-to-tr from-amber-500/30 to-purple-500/20 text-amber-300 border-amber-400/60'
                  : 'bg-gradient-to-tr from-indigo-500/30 to-violet-500/20 text-sky-300 border-white/15'
              }`}
            >
              {participant.name ? participant.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
          )}
          <span className="text-[10px] text-slate-400/80 font-medium mt-1">Camera Off</span>
        </div>
      )}

      {/* Top Indicators & Controls */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left: Role / Live Badge */}
        <div className="flex items-center gap-1">
          {isInstructorRole ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/50 text-slate-300 border border-white/10 backdrop-blur-md">
              Student
            </span>
          )}

          {isSpeaking && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              Speaking
            </span>
          )}

          <SignalBars quality={participant.connectionQuality} />
        </div>

        {/* Right: Screen Sharing indicator & Pin/Spotlight buttons (hover) */}
        <div className="flex items-center gap-1">
          {participant.isScreenSharing && (
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md" title="Sharing Screen">
              <Monitor className="w-3 h-3 animate-pulse" />
            </span>
          )}

          {canPin && onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={`p-1 rounded-lg border text-[10px] cursor-pointer transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md ${
                participant.isPinned
                  ? 'bg-sky-500 text-slate-950 border-sky-400 opacity-100'
                  : 'bg-black/60 hover:bg-black/80 border-white/15 text-slate-300'
              }`}
              title={participant.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}

          {onSpotlight && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSpotlight();
              }}
              className={`p-1 rounded-lg border text-[10px] cursor-pointer transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md ${
                isSpotlighted
                  ? 'bg-indigo-500 text-white border-indigo-400 opacity-100'
                  : 'bg-black/60 hover:bg-black/80 border-white/15 text-slate-300'
              }`}
              title={isSpotlighted ? 'Exit Spotlight' : 'Spotlight'}
            >
              {isSpotlighted ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Name & Mic status */}
      <div className="relative z-10 flex items-center justify-between w-full gap-1 pt-1">
        <p className="text-[11px] font-semibold text-white truncate max-w-[70%] drop-shadow-md">
          {participant.name} {isLocal && '(You)'}
        </p>

        <div
          className={`p-1 rounded-lg backdrop-blur-xl border shadow-sm shrink-0 ${
            participant.isMutedByInstructor
              ? 'bg-rose-500/25 border-rose-500/50 text-rose-400'
              : participant.isAudioOn
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-black/50 border-white/15 text-slate-400'
          }`}
          title={
            participant.isMutedByInstructor
              ? 'Muted by instructor'
              : participant.isAudioOn
              ? 'Microphone Active'
              : 'Microphone Muted'
          }
        >
          {participant.isMutedByInstructor ? (
            <VolumeX className="w-3 h-3" />
          ) : participant.isAudioOn ? (
            <Mic className="w-3 h-3" />
          ) : (
            <MicOff className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PIP CAMERA VIEW COMPONENT
// Displays instructor camera in a stable picture-in-picture during screen share
// ============================================================================
interface PipCameraViewProps {
  instructor: MediaParticipant;
}

export const PipCameraView: React.FC<PipCameraViewProps> = ({ instructor }) => {
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const attachedPipTrackRef = useRef<any>(null);

  useEffect(() => {
    const el = pipVideoRef.current;
    if (!el) return;

    if (instructor.videoLiveKitTrack && typeof instructor.videoLiveKitTrack.attach === 'function') {
      if (attachedPipTrackRef.current === instructor.videoLiveKitTrack && el.srcObject) {
        return;
      }
      if (attachedPipTrackRef.current && attachedPipTrackRef.current !== instructor.videoLiveKitTrack) {
        try {
          attachedPipTrackRef.current.detach(el);
        } catch (_) {}
      }
      try {
        instructor.videoLiveKitTrack.attach(el);
        attachedPipTrackRef.current = instructor.videoLiveKitTrack;
      } catch (err) {
        console.warn('[PipCameraView] track.attach notice:', err);
      }
    } else {
      const pipStream = instructor.videoTrack
        ? new MediaStream([instructor.videoTrack])
        : instructor.stream;
      if (pipVideoRef.current && pipStream) {
        if (pipVideoRef.current.srcObject !== pipStream) {
          pipVideoRef.current.srcObject = pipStream;
        }
        pipVideoRef.current.muted = true;
        pipVideoRef.current.play().catch(() => {});
      }
    }
  }, [instructor.videoLiveKitTrack, instructor.stream, instructor.videoTrack, instructor.streamVersion, instructor.isVideoOn]);

  useEffect(() => {
    return () => {
      if (attachedPipTrackRef.current && pipVideoRef.current) {
        try {
          attachedPipTrackRef.current.detach(pipVideoRef.current);
        } catch (_) {}
        attachedPipTrackRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute bottom-4 right-4 w-44 sm:w-56 aspect-video z-20 shadow-2xl rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-[#090d1a]/95 backdrop-blur-xl">
      <video
        ref={pipVideoRef}
        autoPlay
        playsInline
        muted={true}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 border border-white/15 flex items-center gap-1.5 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="truncate max-w-[120px]">{instructor.name}</span>
      </div>
    </div>
  );
};

// ============================================================================
// SCREEN SHARE VIEWPORT COMPONENT
// Dedicated, stable viewport for rendering active screen share.
// Guards against repeated track unmounts, detaches, and layout thrashing.
// ============================================================================
interface ScreenShareViewportProps {
  activeSharer?: MediaParticipant | null;
  screenShareStream?: MediaStream | null;
  instructor?: MediaParticipant | null;
  instructorName?: string;
}

export const ScreenShareViewport: React.FC<ScreenShareViewportProps> = ({
  activeSharer,
  screenShareStream,
  instructor,
  instructorName,
}) => {
  const screenRef = useRef<HTMLVideoElement>(null);
  const attachedTrackRef = useRef<any>(null);

  const screenTrack = activeSharer?.screenLiveKitTrack;
  const activeScreenStream =
    screenShareStream ||
    activeSharer?.screenStream ||
    (activeSharer?.screenTrack ? new MediaStream([activeSharer.screenTrack]) : null) ||
    activeSharer?.stream;

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;

    if (screenTrack && typeof screenTrack.attach === 'function') {
      if (attachedTrackRef.current === screenTrack && el.srcObject) {
        // Track already attached, avoid detach/re-attach cycle causing black frames
        return;
      }
      if (attachedTrackRef.current && attachedTrackRef.current !== screenTrack) {
        try {
          attachedTrackRef.current.detach(el);
        } catch (_) {}
      }
      try {
        console.log(`[LIVEKIT_SCREEN_DEBUG] ScreenShareViewport attaching LiveKit track sid=${screenTrack.sid}`);
        const pub = (screenTrack as any)?.publication;
        if (pub && typeof pub.setVideoQuality === 'function') {
          try {
            pub.setVideoQuality(VideoQuality.HIGH);
            console.log(`[LIVEKIT_SCREEN_DEBUG] ScreenShareViewport requested VideoQuality.HIGH for sid=${screenTrack.sid}`);
          } catch (_) {}
        }
        screenTrack.attach(el);
        attachedTrackRef.current = screenTrack;
      } catch (err) {
        console.warn(`[LIVEKIT_SCREEN_DEBUG] ScreenShareViewport track.attach notice:`, err);
      }
    } else if (activeScreenStream) {
      if (el.srcObject !== activeScreenStream) {
        console.log(`[LIVEKIT_SCREEN_DEBUG] ScreenShareViewport attaching activeScreenStream id=${activeScreenStream.id}`);
        el.srcObject = activeScreenStream;
      }
      el.muted = true;
      el.play().catch((err) => {
        console.warn(`[LIVEKIT_SCREEN_DEBUG] ScreenShareViewport play notice:`, err);
      });
    }
  }, [screenTrack, activeScreenStream, activeSharer?.streamVersion]);

  // Diagnostic Quality Telemetry
  // Observes actual rendered track dimensions, videoWidth, videoHeight, clientWidth, and clientHeight
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;

    const logQuality = () => {
      const vWidth = el.videoWidth || 0;
      const vHeight = el.videoHeight || 0;
      const cWidth = el.clientWidth || 0;
      const cHeight = el.clientHeight || 0;
      const trackSid = screenTrack?.sid || 'unknown';
      const dimensions = (screenTrack as any)?.dimensions || { width: vWidth, height: vHeight };
      const codec = (screenTrack as any)?.codec || 'vp8';
      const participantId = activeSharer?.userId || 'unknown';

      if (vWidth > 0 || cWidth > 0) {
        console.log(
          `[LIVEKIT_SCREEN_RECEIVE] participantId=${participantId} trackSid=${trackSid} videoWidth=${vWidth} videoHeight=${vHeight} clientWidth=${cWidth} clientHeight=${cHeight}`
        );
        console.log(
          `[LIVEKIT_SCREEN_QUALITY] participantId=${participantId} trackSid=${trackSid} source=ScreenShare codec=${codec} width=${vWidth} height=${vHeight} dimensions=${dimensions.width}x${dimensions.height} videoElement.clientWidth=${cWidth} videoElement.clientHeight=${cHeight}`
        );
      }
    };

    el.addEventListener('loadedmetadata', logQuality);
    el.addEventListener('resize', logQuality);

    logQuality();
    const interval = setInterval(logQuality, 4000);

    return () => {
      el.removeEventListener('loadedmetadata', logQuality);
      el.removeEventListener('resize', logQuality);
      clearInterval(interval);
    };
  }, [screenTrack, activeSharer?.userId]);

  // Clean up track strictly on unmount
  useEffect(() => {
    return () => {
      if (attachedTrackRef.current && screenRef.current) {
        try {
          console.log(`[LIVEKIT_SCREEN_DEBUG] ScreenShareViewport unmounting, detaching track sid=${attachedTrackRef.current.sid}`);
          attachedTrackRef.current.detach(screenRef.current);
        } catch (_) {}
        attachedTrackRef.current = null;
      }
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === containerRef.current));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('[ScreenShareViewport] Fullscreen toggle error:', err);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);
  const toggleFitMode = () => setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));

  const sharerDisplayName = activeSharer?.name || instructor?.name || instructorName || 'Lead Instructor';

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative bg-[#070a14] rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[360px] shadow-2xl ${
        isFullscreen ? 'rounded-none border-none' : ''
      }`}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={screenRef}
          autoPlay
          playsInline
          muted={true}
          className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'} pointer-events-none select-none transition-transform duration-200`}
          style={{
            transform: `scale(${zoomLevel})`,
            imageRendering: 'auto',
            minWidth: '320px',
            minHeight: '180px',
          }}
        />
      </div>

      {/* Screen Share Live Header Badge */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/15 text-xs font-bold text-amber-300 flex items-center gap-2 shadow-xl z-10">
        <Monitor className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>
          Screen Share • {sharerDisplayName}
        </span>
      </div>

      {/* Viewport Action Controls: Zoom, Fit, Fullscreen */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 shadow-xl">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.75}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-slate-300 px-1 select-none font-bold">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 2.5}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        {zoomLevel !== 1 && (
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={toggleFitMode}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            fitMode === 'cover' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={fitMode === 'contain' ? 'Fit to Viewport (Fill)' : 'Fit to Screen (Contain)'}
          aria-label="Toggle Fit Mode"
        >
          <Scan className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px] pr-1">{isFullscreen ? 'Exit' : 'Full'}</span>
        </button>
      </div>

      {/* Floating Picture-In-Picture for Instructor Camera (if camera actively on during screenshare) */}
      {instructor && instructor.isVideoOn && (instructor.videoLiveKitTrack || instructor.stream) && (
        <PipCameraView instructor={instructor} />
      )}
    </div>
  );
};

// ============================================================================
// MAIN VIDEO GRID COMPONENT
// ============================================================================
export interface VideoGridProps {
  participants: MediaParticipant[];
  screenShareStream?: MediaStream | null;
  localUserId: string;
  isInstructor?: boolean;
  instructorId?: string;
  instructorName?: string;
  onPinParticipant?: (userId: string | null) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  screenShareStream,
  localUserId,
  isInstructor = false,
  instructorId,
  instructorName,
  onPinParticipant,
}) => {
  const [spotlightedUserId, setSpotlightedUserId] = useState<string | null>(null);

  // 1. Authoritatively resolve instructor
  const instructor = useMemo(() => {
    return getInstructorParticipant(participants, instructorId, localUserId, isInstructor);
  }, [participants, instructorId, localUserId, isInstructor]);

  // 2. Detect active screen share (from local or any remote participant)
  const activeSharer = participants.find((p) => p.isScreenSharing);
  const isScreenShareActive = Boolean(
    screenShareStream ||
    activeSharer?.screenLiveKitTrack ||
    activeSharer?.screenStream ||
    activeSharer?.screenTrack ||
    (activeSharer && activeSharer.isScreenSharing)
  );

  // Priority participants for moderation / spotlighting
  const pinnedParticipant = participants.find((p) => p.isPinned);
  const activeSpeaker = participants.find((p) => p.isSpeaking);

  // Determine Primary Participant Content:
  // INSTRUCTOR VIEW:
  // - If instructor is viewing: Hero is self (or spotlighted/pinned participant)
  // STUDENT VIEW:
  // - Instructor is ALWAYS primary!
  // - Students NEVER replace instructor as primary!
  const heroParticipant = useMemo((): MediaParticipant | null => {
    // 1. Explicit manual spotlight by instructor
    if (spotlightedUserId) {
      const sp = participants.find((p) => getParticipantUserId(p) === spotlightedUserId);
      if (sp) return sp;
    }

    // 2. Explicitly pinned participant by instructor
    if (pinnedParticipant) {
      return pinnedParticipant;
    }

    // 3. For Instructor View:
    if (isInstructor) {
      const self = participants.find((p) => getParticipantUserId(p) === localUserId);
      if (self) return self;
      return instructor || null;
    }

    // 4. For Student View:
    // ALWAYS return instructor (or null if instructor hasn't joined yet)
    // NEVER return a student or active speaker or participants[0]!
    if (!instructor) {
      console.log(
        `[LIVE_DEBUG] Student View: No remote instructor in participants (${participants.length} connected peers). Rendering 'Waiting for Instructor'.`
      );
      return null;
    }
    console.log(
      `[LIVE_DEBUG] Student View: Rendering instructor as primary hero: ${instructor.userId} (${instructor.name})`
    );
    return instructor;
  }, [spotlightedUserId, pinnedParticipant, isInstructor, localUserId, instructor, participants]);

  // Ordered participants for the compact strip:
  // Shows instructor first, then current user, then remaining students
  const stripParticipants = useMemo(() => {
    const list = [...participants];
    list.sort((a, b) => {
      const aUid = getParticipantUserId(a);
      const bUid = getParticipantUserId(b);
      const instUid = instructor ? getParticipantUserId(instructor) : '';
      const aIsInst =
        (instUid && aUid === instUid) ||
        getParticipantRole(a) === 'instructor' ||
        getParticipantRole(a) === 'mentor';
      const bIsInst =
        (instUid && bUid === instUid) ||
        getParticipantRole(b) === 'instructor' ||
        getParticipantRole(b) === 'mentor';
      if (aIsInst && !bIsInst) return -1;
      if (!aIsInst && bIsInst) return 1;
      if (aUid === localUserId) return -1;
      if (bUid === localUserId) return 1;
      return 0;
    });
    return list;
  }, [participants, instructor, localUserId]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 sm:p-4 overflow-hidden relative font-sans">
      
      {/* ================================================================== */}
      {/* 1. PRIMARY CLASSROOM STAGE AREA                                    */}
      {/* Hierarchy:                                                         */}
      {/* 1. Instructor Screen Share (if active)                             */}
      {/* 2. Instructor Video / Camera (if camera on)                        */}
      {/* 3. Instructor Avatar / Placeholder (if camera off)                 */}
      {/* 4. "Waiting for Instructor..." (if student joined before host)    */}
      {/* ================================================================== */}
      <div className="flex-1 min-h-0 relative w-full rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* CASE 1: SCREEN SHARE ACTIVE (Highest Priority) */}
        {isScreenShareActive ? (
          <ScreenShareViewport
            key={`screenshare_${activeSharer?.userId || localUserId}`}
            activeSharer={activeSharer}
            screenShareStream={screenShareStream}
            instructor={instructor}
            instructorName={instructorName}
          />
        ) : heroParticipant ? (
          /* CASE 2: INSTRUCTOR CAMERA OR AVATAR (or explicitly pinned/spotlighted user) */
          <div className="w-full h-full">
            <VideoTile
              participant={heroParticipant}
              isLocal={heroParticipant.userId === localUserId}
              isHero={true}
              isSpotlighted={spotlightedUserId === heroParticipant.userId}
              canPin={isInstructor}
              onTogglePin={
                onPinParticipant
                  ? () => onPinParticipant(heroParticipant.isPinned ? null : heroParticipant.userId)
                  : undefined
              }
              onSpotlight={() =>
                setSpotlightedUserId((prev) => (prev === heroParticipant.userId ? null : heroParticipant.userId))
              }
            />
          </div>
        ) : (
          /* CASE 3: INSTRUCTOR NOT YET CONNECTED (STUDENT VIEW STANDBY) */
          <div className="w-full h-full min-h-[320px] rounded-3xl bg-gradient-to-b from-[#0c1224] to-[#060913] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,140,255,0.08),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/10 to-indigo-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/10">
                  <User className="w-10 h-10" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-heading font-black text-white">
                  Waiting for Instructor
                </h3>
                <p className="text-xs sm:text-sm text-slate-300/80">
                  {instructorName ? (
                    <span><strong>{instructorName}</strong> is preparing to start the live session.</span>
                  ) : (
                    'The lead instructor will join the live session shortly.'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 text-[11px] text-amber-300 font-medium shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Audio & video will stream automatically when instructor connects</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* 2. COMPACT PARTICIPANT STRIP / ROSTER                              */}
      {/* Student participants remain strictly in this compact strip         */}
      {/* Format: [ Instructor ] [ Student A ] [ Student B ] ...            */}
      {/* ================================================================== */}
      {stripParticipants.length > 0 && (
        <div className="w-full shrink-0 flex flex-col gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Classroom Participants ({participants.length})</span>
            </div>
            {activeSpeaker && (
              <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[11px] lowercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{activeSpeaker.name} is speaking</span>
              </span>
            )}
          </div>

          {/* Horizontal Scrollable Participant Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {stripParticipants.map((p) => (
              <CompactParticipantTile
                key={p.userId}
                participant={p}
                isLocal={p.userId === localUserId}
                canPin={isInstructor}
                onTogglePin={
                  onPinParticipant ? () => onPinParticipant(p.isPinned ? null : p.userId) : undefined
                }
                onSpotlight={() => setSpotlightedUserId((prev) => (prev === p.userId ? null : p.userId))}
                isSpotlighted={spotlightedUserId === p.userId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;

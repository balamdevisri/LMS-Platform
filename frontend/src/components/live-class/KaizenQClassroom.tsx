import React, { useEffect, useState, useRef } from 'react';
import { roomManager } from '@/services/liveMedia/roomManager';
import type { MediaClient } from '@/services/liveMedia/mediaClient';
import type { MediaParticipant, MediaRole, MediaConnectionState } from '@/services/liveMedia/mediaTypes';
import { VideoGrid } from './VideoGrid';
import { Loader2, ShieldAlert, WifiOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface RemoteAudioPlayerProps {
  participant: MediaParticipant;
  onPlayStarted?: () => void;
  onPlayBlocked?: () => void;
}

const RemoteAudioPlayer: React.FC<RemoteAudioPlayerProps> = ({
  participant,
  onPlayStarted,
  onPlayBlocked,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // This effect re-runs whenever participant.stream reference changes (streamVersion bump)
  // OR when audioTrack/isAudioOn changes, ensuring audio is always attached and played.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !participant.stream) return;

    const stream = participant.stream;
    const audioTrackCount = stream.getAudioTracks().length;
    const firstAudioTrack = stream.getAudioTracks()[0];

    // Explicitly set audio parameters (audio must NEVER be muted or display:none)
    el.muted = false;
    el.volume = 1.0;
    el.srcObject = stream;

    console.log(
      `[LIVE_DEBUG][REMOTE_AUDIO] userId=${participant.userId} hasStream=${Boolean(participant.stream)} audioTracks=${audioTrackCount} audioTrackReadyState=${firstAudioTrack?.readyState || 'none'} muted=${el.muted} volume=${el.volume} paused=${el.paused} srcObjectTracks=${stream.getTracks().length}`
    );

    const attemptPlay = () => {
      const currentTracks = el.srcObject instanceof MediaStream
        ? el.srcObject.getAudioTracks().length
        : 0;

      if (currentTracks === 0) {
        console.log(`[LIVE_DEBUG][REMOTE_AUDIO] WAITING_FOR_TRACKS remoteUserId=${participant.userId}`);
        return;
      }
      if (!el.paused) {
        console.log(`[LIVE_DEBUG][REMOTE_AUDIO] ALREADY_PLAYING remoteUserId=${participant.userId}`);
        return;
      }
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[LIVE_DEBUG][REMOTE_AUDIO] SUCCESS remoteUserId=${participant.userId} role=${participant.role} readyState=${el.readyState}`);
            onPlayStarted?.();
          })
          .catch((err) => {
            console.error(`[LIVE_DEBUG][REMOTE_AUDIO] ERROR remoteUserId=${participant.userId} errorName=${err?.name} errorMessage=${err?.message}`, err);
            onPlayBlocked?.();
          });
      }
    };

    attemptPlay();

    // Listen for future tracks arriving on this specific stream instance
    const handleTrackAdded = (event: MediaStreamTrackEvent) => {
      if (event.track.kind === 'audio') {
        console.log(`[LIVE_DEBUG] RemoteAudioPlayer: onaddtrack fired for userId=${participant.userId}`);
        el.srcObject = stream;
        attemptPlay();
      }
    };
    stream.addEventListener('addtrack', handleTrackAdded);

    // Global document interaction unlock for browsers that block autoplay
    const unlockAudio = () => {
      if (el.paused && el.srcObject instanceof MediaStream && el.srcObject.getAudioTracks().length > 0) {
        el.play()
          .then(() => {
            console.log(`[LIVE_DEBUG] audio UNLOCKED via user gesture: userId=${participant.userId}`);
            onPlayStarted?.();
          })
          .catch(() => {});
      }
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      stream.removeEventListener('addtrack', handleTrackAdded);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant.stream, participant.streamVersion, participant.audioTrack, participant.isAudioOn]);

  return <audio ref={audioRef} autoPlay playsInline muted={false} />;
};

export interface KaizenQClassroomProps {
  classId: string;
  userId: string;
  userName: string;
  role: MediaRole;
  token?: string;
  instructorId?: string;
  instructorName?: string;
  initialParticipants?: MediaParticipant[];
  isWhiteboardOpen?: boolean;
  onToggleWhiteboard?: () => void;
  activeSidebarTab?: string | null;
  onToggleSidebarTab?: (tab: string) => void;
  unreadChatCount?: number;
  unreadQuestionCount?: number;
  onLeaveOrEndClass: () => void;
  onClientReady?: (client: MediaClient) => void;
  onMediaConnectionStateChange?: (state: MediaConnectionState) => void;
}

export const KaizenQClassroom: React.FC<KaizenQClassroomProps> = ({
  classId,
  userId,
  userName,
  role,
  token,
  instructorId,
  instructorName,
  initialParticipants,
  onLeaveOrEndClass,
  onClientReady,
  onMediaConnectionStateChange,
}) => {
  const [client, setClient] = useState<MediaClient | null>(null);
  const [participants, setParticipants] = useState<MediaParticipant[]>([]);
  const [connectionState, setConnectionState] = useState<MediaConnectionState>('idle');
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  // Diagnostics logging on participant changes
  useEffect(() => {
    console.log(`[LIVE_DEBUG] participants array count: ${participants.length}`);
    participants.forEach((p) => {
      const aTracks = p.stream ? p.stream.getAudioTracks().length : 0;
      const vTracks = p.stream ? p.stream.getVideoTracks().length : 0;
      console.log(
        `[LIVE_DEBUG] participant: userId=${p.userId} role=${p.role} name=${p.name} isLocal=${p.userId === userId} isMuted=${!p.isAudioOn} cameraEnabled=${p.isVideoOn} hasStream=${Boolean(p.stream)} audioTracks=${aTracks} videoTracks=${vTracks}`
      );
    });
  }, [participants, userId]);

  // Store latest props in refs to prevent unnecessary room leave/rejoin cycles on cosmetic re-renders
  const propsRef = useRef({
    userName,
    role,
    token,
    instructorId,
    initialParticipants,
    onLeaveOrEndClass,
    onClientReady,
    onMediaConnectionStateChange,
  });

  useEffect(() => {
    propsRef.current = {
      userName,
      role,
      token,
      instructorId,
      initialParticipants,
      onLeaveOrEndClass,
      onClientReady,
      onMediaConnectionStateChange,
    };
  });

  useEffect(() => {
    let activeClient: MediaClient | null = null;

    const initRoom = async () => {
      try {
        setConnectionState('connecting');
        propsRef.current.onMediaConnectionStateChange?.('connecting');

        activeClient = await roomManager.joinRoom({
          classId,
          userId,
          userName: propsRef.current.userName,
          role: propsRef.current.role,
          token: propsRef.current.token,
          instructorId: propsRef.current.instructorId,
          initialParticipants: propsRef.current.initialParticipants,
        });

        setClient(activeClient);
        setParticipants(activeClient.getParticipants());
        const state = activeClient.getConnectionState();
        setConnectionState(state);
        propsRef.current.onMediaConnectionStateChange?.(state);

        propsRef.current.onClientReady?.(activeClient);

        // Attach listeners
        activeClient.on('connectionStateChange', (s: MediaConnectionState) => {
          setConnectionState(s);
          propsRef.current.onMediaConnectionStateChange?.(s);
        });

        activeClient.on('participantsUpdate', (list: MediaParticipant[]) => {
          setParticipants([...list]);
        });

        activeClient.on('instructorMuteStateChange', (isMuted: boolean) => {
          if (isMuted) {
            toast.warning('You were muted by the instructor.');
          } else {
            toast.success('Your microphone access has been enabled.');
          }
        });

        activeClient.on('moderationRequestUnmute', (data: { instructorName?: string }) => {
          toast.info(`${data.instructorName || 'The instructor'} asked you to unmute your microphone.`, {
            duration: 10000,
            action: {
              label: 'Unmute',
              onClick: () => {
                activeClient?.toggleMicrophone();
              },
            },
          });
        });

        activeClient.on('mediaError', (data: { type: string; message: string }) => {
          toast.error(data.message);
        });

        activeClient.on('kicked', () => {
          toast.error('You have been removed from the live session.');
          propsRef.current.onLeaveOrEndClass();
        });
      } catch (err) {
        console.error('[KaizenQClassroom] Failed to join room:', err);
        setConnectionState('failed');
        propsRef.current.onMediaConnectionStateChange?.('failed');
      }
    };

    initRoom();

    return () => {
      roomManager.leaveRoom();
    };
  }, [classId, userId]);

  const handleManualUnlockAudio = () => {
    const audioElements = document.querySelectorAll<HTMLAudioElement>('audio');
    audioElements.forEach((el) => {
      el.play().catch(() => {});
    });
    setIsAutoplayBlocked(false);
  };

  if (connectionState === 'connecting' || connectionState === 'authenticating') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <h3 className="text-sm font-bold tracking-wide">Connecting to KaizenQ Private Classroom...</h3>
        <p className="text-xs text-slate-500">Securing WebRTC stream & room authorization token</p>
      </div>
    );
  }

  if (connectionState === 'failed') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 p-6 text-center font-sans">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h3 className="text-base font-extrabold text-white">Media Stream Connection Failed</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Unable to establish a secure media stream connection to room <strong>class_{classId}</strong>.
        </p>
        <button
          onClick={onLeaveOrEndClass}
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isInstructor = role === 'instructor' || role === 'mentor' || (role as string) === 'admin';

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden font-sans">
      {/* 1. Dedicated Persistent Remote Audio Layer (RENDERED OFFSCREEN - NEVER USE display:none) */}
      <div
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {participants
          .filter((p) => p.userId !== userId)
          .map((p) => (
            <RemoteAudioPlayer
              key={p.userId}
              participant={p}
              onPlayStarted={() => setIsAutoplayBlocked(false)}
              onPlayBlocked={() => setIsAutoplayBlocked(true)}
            />
          ))}
      </div>

      {/* 2. Global Autoplay Block Alert Badge */}
      {isAutoplayBlocked && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleManualUnlockAudio}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-2xl cursor-pointer animate-bounce border border-amber-300"
            title="Click to enable sound"
          >
            <Volume2 className="w-4 h-4" />
            <span>Click to Enable Classroom Audio</span>
          </button>
        </div>
      )}

      {/* Connection State Banner (if reconnecting) */}
      {connectionState === 'reconnecting' && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-300 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Reconnecting to classroom stream...</span>
        </div>
      )}

      {/* Main Video Grid Container */}
      <div className="flex-1 min-h-0 relative">
        <VideoGrid
          participants={participants}
          screenShareStream={client?.getLocalScreenStream() || null}
          localUserId={userId}
          isInstructor={isInstructor}
          instructorId={instructorId}
          instructorName={instructorName}
          onPinParticipant={(targetId) => client?.pinParticipant(targetId)}
        />
      </div>
    </div>
  );
};

export default KaizenQClassroom;

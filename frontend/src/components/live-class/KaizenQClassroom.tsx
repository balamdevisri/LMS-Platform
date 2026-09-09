import React, { useEffect, useState } from 'react';
import { roomManager } from '@/services/liveMedia/roomManager';
import type { MediaClient } from '@/services/liveMedia/mediaClient';
import type { MediaParticipant, MediaRole, MediaConnectionState } from '@/services/liveMedia/mediaTypes';
import { VideoGrid } from './VideoGrid';
import { Loader2, ShieldAlert, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export interface KaizenQClassroomProps {
  classId: string;
  userId: string;
  userName: string;
  role: MediaRole;
  token?: string;
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
  onLeaveOrEndClass,
  onClientReady,
  onMediaConnectionStateChange,
}) => {
  const [client, setClient] = useState<MediaClient | null>(null);
  const [participants, setParticipants] = useState<MediaParticipant[]>([]);
  const [connectionState, setConnectionState] = useState<MediaConnectionState>('idle');

  useEffect(() => {
    let activeClient: MediaClient | null = null;

    const initRoom = async () => {
      try {
        setConnectionState('connecting');
        onMediaConnectionStateChange?.('connecting');

        activeClient = await roomManager.joinRoom({
          classId,
          userId,
          userName,
          role,
          token,
        });

        setClient(activeClient);
        setParticipants(activeClient.getParticipants());
        const state = activeClient.getConnectionState();
        setConnectionState(state);
        onMediaConnectionStateChange?.(state);

        onClientReady?.(activeClient);

        // Attach listeners
        activeClient.on('connectionStateChange', (s: MediaConnectionState) => {
          setConnectionState(s);
          onMediaConnectionStateChange?.(s);
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
          onLeaveOrEndClass();
        });
      } catch (err) {
        console.error('[KaizenQClassroom] Failed to join room:', err);
        setConnectionState('failed');
        onMediaConnectionStateChange?.('failed');
      }
    };

    initRoom();

    return () => {
      roomManager.leaveRoom();
    };
  }, [classId, userId, userName, role, token]);

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

  const isInstructor = role === 'instructor' || role === 'mentor';

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden font-sans">
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
          onPinParticipant={(targetId) => client?.pinParticipant(targetId)}
        />
      </div>
    </div>
  );
};

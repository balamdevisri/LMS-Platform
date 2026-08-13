import React, { useEffect, useState } from 'react';
import { roomManager } from '@/services/liveMedia/roomManager';
import type { MediaClient } from '@/services/liveMedia/mediaClient';
import type { MediaParticipant, MediaRole, MediaConnectionState } from '@/services/liveMedia/mediaTypes';
import { VideoGrid } from './VideoGrid';
import { ParticipantPanel } from './ParticipantPanel';
import { ClassroomControls } from './ClassroomControls';
import { Loader2, ShieldAlert, WifiOff } from 'lucide-react';

export interface KaizenQClassroomProps {
  classId: string;
  userId: string;
  userName: string;
  role: MediaRole;
  token?: string;
  isWhiteboardOpen: boolean;
  onToggleWhiteboard: () => void;
  activeSidebarTab: string | null;
  onToggleSidebarTab: (tab: string) => void;
  unreadChatCount?: number;
  unreadQuestionCount?: number;
  onLeaveOrEndClass: () => void;
}

export const KaizenQClassroom: React.FC<KaizenQClassroomProps> = ({
  classId,
  userId,
  userName,
  role,
  token,
  isWhiteboardOpen,
  onToggleWhiteboard,
  activeSidebarTab,
  onToggleSidebarTab,
  unreadChatCount = 0,
  unreadQuestionCount = 0,
  onLeaveOrEndClass,
}) => {
  const [client, setClient] = useState<MediaClient | null>(null);
  const [participants, setParticipants] = useState<MediaParticipant[]>([]);
  const [connectionState, setConnectionState] = useState<MediaConnectionState>('idle');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const isInstructor = role === 'instructor' || role === 'mentor';

  useEffect(() => {
    let activeClient: MediaClient | null = null;

    const initRoom = async () => {
      try {
        activeClient = await roomManager.joinRoom({
          classId,
          userId,
          userName,
          role,
          token,
        });

        setClient(activeClient);
        setParticipants(activeClient.getParticipants());
        setConnectionState(activeClient.getConnectionState());

        // Attach listeners
        activeClient.on('connectionStateChange', (state) => setConnectionState(state));
        activeClient.on('participantsUpdate', (list: MediaParticipant[]) => setParticipants(list));
        activeClient.on('kicked', () => onLeaveOrEndClass());
      } catch (err) {
        console.error('[KaizenQClassroom] Failed to join room:', err);
      }
    };

    initRoom();

    return () => {
      roomManager.leaveRoom();
    };
  }, [classId, userId, userName, role, token]);

  const handleToggleMic = async () => {
    if (!client) return;
    const enabled = await client.toggleMicrophone();
    setIsMicOn(enabled);
  };

  const handleToggleCam = async () => {
    if (!client) return;
    const enabled = await client.toggleCamera();
    setIsCamOn(enabled);
  };

  const handleToggleScreenShare = async () => {
    if (!client) return;
    if (isScreenSharing) {
      client.stopScreenShare();
      setIsScreenSharing(false);
      setScreenStream(null);
    } else {
      const stream = await client.startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
        setScreenStream(stream);
      }
    }
  };

  const handleToggleHandRaise = () => {
    setIsHandRaised((prev) => !prev);
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
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

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
          screenShareStream={screenStream}
          localUserId={userId}
        />
      </div>

      {/* Participant Roster Drawer */}
      <ParticipantPanel
        isOpen={activeSidebarTab === 'roster'}
        onClose={() => onToggleSidebarTab('')}
        participants={participants}
        isInstructor={isInstructor}
        onMuteParticipant={(id) => client?.muteParticipant(id)}
        onKickParticipant={(id) => client?.kickParticipant(id)}
      />

      {/* Micro-animated Control Bar */}
      <ClassroomControls
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        isScreenSharing={isScreenSharing}
        isWhiteboardOpen={isWhiteboardOpen}
        isHandRaised={isHandRaised}
        isInstructor={isInstructor}
        activeSidebarTab={activeSidebarTab}
        unreadChatCount={unreadChatCount}
        unreadQuestionCount={unreadQuestionCount}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleWhiteboard={onToggleWhiteboard}
        onToggleHandRaise={handleToggleHandRaise}
        onToggleSidebarTab={onToggleSidebarTab}
        onLeaveOrEndClass={onLeaveOrEndClass}
      />
    </div>
  );
};

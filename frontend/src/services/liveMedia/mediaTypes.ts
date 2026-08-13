export type MediaRole = 'instructor' | 'mentor' | 'student';

export type MediaConnectionState = 
  | 'idle'
  | 'authenticating'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

export interface MediaParticipant {
  userId: string;
  name: string;
  role: MediaRole;
  avatarUrl?: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isMutedByInstructor?: boolean;
  connectionState: 'connected' | 'reconnecting' | 'disconnected';
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  screenTrack?: MediaStreamTrack;
  stream?: MediaStream;
}

export interface MediaRoomToken {
  token: string;
  userId: string;
  classId: string;
  roomId: string;
  role: MediaRole;
  permissions: {
    canPublishAudio: boolean;
    canPublishVideo: boolean;
    canShareScreen: boolean;
    canKickParticipants: boolean;
    canMuteOthers: boolean;
    canEndClass: boolean;
  };
  expiresAt: number;
}

export interface MediaClientConfig {
  classId: string;
  userId: string;
  userName: string;
  role: MediaRole;
  token?: string;
  iceServers?: RTCIceServer[];
}

export interface WebRTCSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'track-toggle' | 'kick' | 'mute';
  senderId: string;
  targetId?: string;
  classId: string;
  payload?: any;
}

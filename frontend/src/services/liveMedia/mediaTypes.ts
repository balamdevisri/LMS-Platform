export type MediaRole = 'instructor' | 'mentor' | 'student' | 'admin';

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
  isSpeaking?: boolean;
  audioLevel?: number;
  isPinned?: boolean;
  isMutedByInstructor?: boolean;
  micPermission?: 'prompt' | 'granted' | 'denied';
  requestedToUnmute?: boolean;
  connectionState: 'connected' | 'reconnecting' | 'disconnected';
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  screenTrack?: MediaStreamTrack;
  stream?: MediaStream;
  screenStream?: MediaStream;
  videoLiveKitTrack?: any;
  screenLiveKitTrack?: any;
  micAllowedByInstructor?: boolean;
  /** Incremented each time a track is added/removed — forces React re-renders despite stream mutation */
  streamVersion?: number;
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
  instructorId?: string;
  initialParticipants?: any[];
  iceServers?: RTCIceServer[];
}

export interface WebRTCSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'track-toggle' | 'kick' | 'mute';
  senderId: string;
  targetId?: string;
  classId: string;
  payload?: any;
}

export interface AvailableMediaDevices {
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
}

export interface IMediaClient {
  connect(): Promise<void>;
  disconnect(): void;
  cleanup(): Promise<void>;
  getParticipants(): MediaParticipant[];
  getLocalStream(): MediaStream;
  getLocalScreenStream(): MediaStream | null;
  getConnectionState(): MediaConnectionState;
  getIsAudioEnabled(): boolean;
  getIsVideoEnabled(): boolean;
  getIsScreenSharing(): boolean;
  toggleMicrophone(): Promise<boolean>;
  muteMicrophone(): Promise<void>;
  toggleCamera(): Promise<boolean>;
  startScreenShare(): Promise<MediaStream | null>;
  stopScreenShare(): Promise<void>;
  getAvailableDevices(): Promise<AvailableMediaDevices>;
  switchCamera(deviceId: string): Promise<boolean>;
  switchMicrophone(deviceId: string): Promise<boolean>;
  muteParticipant(userId: string): void;
  askToUnmuteParticipant(userId: string): void;
  allowParticipantMic(userId: string): void;
  muteAllStudents(): void;
  pinParticipant(userId: string | null): void;
  getPinnedUserId(): string | null;
  getIsMutedByInstructor(): boolean;
  kickParticipant(userId: string): void;
  startAudio?(): Promise<void>;
  on(event: string, listener: (data: any) => void): () => void;
}


import { getLiveClassroomSocket } from '@/services/socket';
import type { Socket } from 'socket.io-client';
import type { 
  MediaClientConfig, 
  MediaConnectionState, 
  MediaParticipant, 
  MediaRole 
} from './mediaTypes';

type EventListener<T = any> = (data: T) => void;

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export class MediaClient {
  private config: MediaClientConfig;
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream = new MediaStream();
  private localScreenStream: MediaStream | null = null;
  private participants: Map<string, MediaParticipant> = new Map();
  private connectionState: MediaConnectionState = 'idle';
  private eventListeners: Map<string, Set<EventListener>> = new Map();

  private isAudioEnabled = false;
  private isVideoEnabled = false;
  private isScreenSharing = false;

  constructor(config: MediaClientConfig) {
    this.config = {
      ...config,
      iceServers: config.iceServers || DEFAULT_ICE_SERVERS,
    };
  }

  public async connect(): Promise<void> {
    this.setConnectionState('connecting');

    try {
      this.socket = getLiveClassroomSocket();

      this.setupSocketListeners();

      // Emit join class request
      this.socket.emit('join_class', {
        classId: this.config.classId,
        userId: this.config.userId,
        name: this.config.userName,
        role: this.config.role,
        token: this.config.token,
      });

      // Add self as local participant
      this.participants.set(this.config.userId, {
        userId: this.config.userId,
        name: this.config.userName,
        role: this.config.role,
        isAudioOn: false,
        isVideoOn: false,
        isScreenSharing: false,
        isHandRaised: false,
        connectionState: 'connected',
        stream: this.localStream,
      });

      this.setConnectionState('connected');
    } catch (err) {
      console.error('[MediaClient] Connection failed:', err);
      this.setConnectionState('failed');
      throw err;
    }
  }

  public disconnect(): void {
    // Stop local tracks
    this.localStream.getTracks().forEach((t) => t.stop());
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => t.stop());
    }

    // Close peer connections
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    if (this.socket) {
      this.socket.emit('leave_class', {
        classId: this.config.classId,
        userId: this.config.userId,
      });
    }

    this.participants.clear();
    this.setConnectionState('disconnected');
  }

  public async toggleMicrophone(): Promise<boolean> {
    if (this.isAudioEnabled) {
      // Disable audio
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        this.localStream.removeTrack(track);
      });
      this.isAudioEnabled = false;
    } else {
      // Enable audio
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];
        this.localStream.addTrack(audioTrack);
        this.isAudioEnabled = true;
      } catch (err) {
        console.warn('[MediaClient] Microphone access denied:', err);
        return false;
      }
    }

    this.updateLocalParticipantState();
    this.broadcastMediaState();
    return this.isAudioEnabled;
  }

  public async toggleCamera(): Promise<boolean> {
    if (this.isVideoEnabled) {
      // Disable video
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        this.localStream.removeTrack(track);
      });
      this.isVideoEnabled = false;
    } else {
      // Enable video
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        this.localStream.addTrack(videoTrack);
        this.isVideoEnabled = true;
      } catch (err) {
        console.warn('[MediaClient] Camera access denied:', err);
        return false;
      }
    }

    this.updateLocalParticipantState();
    this.broadcastMediaState();
    return this.isVideoEnabled;
  }

  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      this.isScreenSharing = true;

      // Handle user stopping screen share via browser UI bar
      this.localScreenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      this.updateLocalParticipantState();
      this.broadcastMediaState();
      return this.localScreenStream;
    } catch (err) {
      console.warn('[MediaClient] Screen share cancelled or failed:', err);
      return null;
    }
  }

  public stopScreenShare(): void {
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => t.stop());
      this.localScreenStream = null;
    }
    this.isScreenSharing = false;
    this.updateLocalParticipantState();
    this.broadcastMediaState();
  }

  public muteParticipant(userId: string): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('mute_student', {
        classId: this.config.classId,
        userId,
        isMuted: true,
      });
    }
  }

  public kickParticipant(userId: string): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('kick_participant', {
        classId: this.config.classId,
        userId,
      });
    }
  }

  public getParticipants(): MediaParticipant[] {
    return Array.from(this.participants.values());
  }

  public getLocalStream(): MediaStream {
    return this.localStream;
  }

  public getLocalScreenStream(): MediaStream | null {
    return this.localScreenStream;
  }

  public getConnectionState(): MediaConnectionState {
    return this.connectionState;
  }

  public on(event: string, listener: EventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);

    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((fn) => fn(data));
    }
  }

  private setConnectionState(state: MediaConnectionState): void {
    this.connectionState = state;
    this.emit('connectionStateChange', state);
  }

  private updateLocalParticipantState(): void {
    const local = this.participants.get(this.config.userId);
    if (local) {
      local.isAudioOn = this.isAudioEnabled;
      local.isVideoOn = this.isVideoEnabled;
      local.isScreenSharing = this.isScreenSharing;
      local.stream = this.localStream;
      local.screenTrack = this.localScreenStream?.getVideoTracks()[0];
      this.emit('participantsUpdate', this.getParticipants());
    }
  }

  private broadcastMediaState(): void {
    if (this.socket) {
      this.socket.emit('webrtc_track_change', {
        classId: this.config.classId,
        userId: this.config.userId,
        isAudioOn: this.isAudioEnabled,
        isVideoOn: this.isVideoEnabled,
        isScreenSharing: this.isScreenSharing,
      });
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('user_joined', (data: { userId: string; name: string; role: MediaRole }) => {
      if (data.userId !== this.config.userId) {
        this.participants.set(data.userId, {
          userId: data.userId,
          name: data.name,
          role: data.role,
          isAudioOn: false,
          isVideoOn: false,
          isScreenSharing: false,
          isHandRaised: false,
          connectionState: 'connected',
        });
        this.emit('participantsUpdate', this.getParticipants());
        this.emit('participantJoined', data);
      }
    });

    this.socket.on('user_left', (data: { userId: string }) => {
      this.participants.delete(data.userId);
      this.peerConnections.get(data.userId)?.close();
      this.peerConnections.delete(data.userId);
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('participantLeft', data);
    });

    this.socket.on('participants_update', (data: { users: Array<{ userId: string; name: string; role: MediaRole }> }) => {
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach((u) => {
          if (!this.participants.has(u.userId)) {
            this.participants.set(u.userId, {
              userId: u.userId,
              name: u.name,
              role: u.role,
              isAudioOn: false,
              isVideoOn: false,
              isScreenSharing: false,
              isHandRaised: false,
              connectionState: 'connected',
            });
          }
        });
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    this.socket.on('webrtc_track_change', (data: { userId: string; isAudioOn: boolean; isVideoOn: boolean; isScreenSharing: boolean }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isAudioOn = data.isAudioOn;
        p.isVideoOn = data.isVideoOn;
        p.isScreenSharing = data.isScreenSharing;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    this.socket.on('student_muted', (data: { userId: string; isMuted: boolean }) => {
      if (data.userId === this.config.userId && data.isMuted && this.isAudioEnabled) {
        this.toggleMicrophone();
      }
    });

    this.socket.on('kicked', () => {
      this.disconnect();
      this.emit('kicked', true);
    });
  }
}

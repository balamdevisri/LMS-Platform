import { getLiveClassroomSocket } from '@/services/socketService';
import type { Socket } from 'socket.io-client';
import type { 
  MediaClientConfig, 
  MediaConnectionState, 
  MediaParticipant, 
  MediaRole,
  AvailableMediaDevices
} from './mediaTypes';
import { AudioActivityDetector, getOptimizedAudioConstraints } from './audioActivityDetector';

type EventListener<T = any> = (data: T) => void;

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export class MediaClient {
  private config: MediaClientConfig;
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private localStream: MediaStream = new MediaStream();
  private localScreenStream: MediaStream | null = null;
  private participants: Map<string, MediaParticipant> = new Map();
  private connectionState: MediaConnectionState = 'idle';
  private eventListeners: Map<string, Set<EventListener>> = new Map();

  private isAudioEnabled = false;
  private isVideoEnabled = false;
  private isScreenSharing = false;

  private selectedCameraId: string | null = null;
  private selectedMicrophoneId: string | null = null;

  // Active speaker & moderation state
  private audioDetector: AudioActivityDetector | null = null;
  private isMutedByInstructor = false;
  private pinnedUserId: string | null = null;

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

      // Emit join class request to socket signaling room only if not already joined
      const alreadyJoined = (this.socket as any)?._hasJoinedLiveClass === this.config.classId;
      if (!alreadyJoined) {
        if (this.socket) {
          (this.socket as any)._hasJoinedLiveClass = this.config.classId;
        }
        this.socket.emit('join_class', {
          classId: this.config.classId,
          liveClassId: this.config.classId,
          userId: this.config.userId,
          name: this.config.userName,
          role: this.config.role,
          token: this.config.token,
        });
      }

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
    if (this.audioDetector) {
      this.audioDetector.destroy();
      this.audioDetector = null;
    }

    if (this.socket && this.isAudioEnabled) {
      this.socket.emit('liveClass:speaker:stopped', {
        classId: this.config.classId,
      });
    }

    // Stop local camera and microphone tracks
    this.localStream.getTracks().forEach((t) => {
      try {
        t.stop();
      } catch {}
    });

    // Stop screen sharing tracks
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      this.localScreenStream = null;
    }

    // Close and remove all peer connections
    this.peerConnections.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    this.peerConnections.clear();
    this.pendingCandidates.clear();

    if (this.socket) {
      this.socket.emit('leave_class', {
        classId: this.config.classId,
        liveClassId: this.config.classId,
        userId: this.config.userId,
      });
    }

    this.participants.clear();
    this.setConnectionState('disconnected');
  }

  public async cleanup(): Promise<void> {
    this.disconnect();
  }

  // --- AUDIO CONTROLS ---

  public async toggleMicrophone(): Promise<boolean> {
    if (this.isMutedByInstructor && !this.isAudioEnabled) {
      this.emit('mediaError', {
        type: 'microphone',
        message: 'Your microphone is currently disabled by the instructor.',
      });
      return false;
    }

    if (this.isAudioEnabled) {
      // Clean up detector
      if (this.audioDetector) {
        this.audioDetector.destroy();
        this.audioDetector = null;
      }
      if (this.socket) {
        this.socket.emit('liveClass:speaker:stopped', {
          classId: this.config.classId,
        });
      }

      // Disable local audio tracks
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        this.localStream.removeTrack(track);
      });
      this.isAudioEnabled = false;

      const self = this.participants.get(this.config.userId);
      if (self) {
        self.isSpeaking = false;
        self.audioLevel = 0;
      }

      // Update active peer senders
      this.peerConnections.forEach((pc) => {
        const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
        if (audioSender) {
          audioSender.replaceTrack(null).catch(() => {});
        }
      });
    } else {
      // Enable microphone with high-quality echo cancellation & noise suppression
      try {
        const constraints: MediaStreamConstraints = {
          audio: getOptimizedAudioConstraints(this.selectedMicrophoneId),
        };
        const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
        const newTrack = audioStream.getAudioTracks()[0];

        if (newTrack) {
          this.localStream.addTrack(newTrack);
          this.isAudioEnabled = true;

          // Attach active speaker detector with RMS energy calculation
          this.audioDetector = new AudioActivityDetector({
            threshold: 0.02,
            attackMs: 200,
            releaseMs: 900,
            onSpeakingChange: (isSpeaking, level) => {
              const self = this.participants.get(this.config.userId);
              if (self) {
                const changed = self.isSpeaking !== isSpeaking;
                self.isSpeaking = isSpeaking;
                self.audioLevel = level;
                if (changed) {
                  this.emit('participantsUpdate', this.getParticipants());
                  if (this.socket) {
                    if (isSpeaking) {
                      this.socket.emit('liveClass:speaker:started', {
                        classId: this.config.classId,
                        audioLevel: level,
                      });
                    } else {
                      this.socket.emit('liveClass:speaker:stopped', {
                        classId: this.config.classId,
                      });
                    }
                  }
                }
              }
            },
          });
          this.audioDetector.attachTrack(newTrack);

          // Replace track on all active peer senders
          this.peerConnections.forEach((pc) => {
            const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio' || !s.track);
            if (audioSender) {
              audioSender.replaceTrack(newTrack).catch(() => {});
            } else {
              try {
                pc.addTrack(newTrack, this.localStream);
              } catch {}
            }
          });
        }
      } catch (err: any) {
        console.warn('[MediaClient] Microphone access error:', err);
        this.handleMediaError(err, 'microphone');
        return false;
      }
    }

    this.updateLocalParticipantState();
    this.broadcastMediaState();
    return this.isAudioEnabled;
  }

  public async muteMicrophone(): Promise<void> {
    if (this.isAudioEnabled) {
      await this.toggleMicrophone();
    }
  }

  // --- CAMERA CONTROLS ---

  public async toggleCamera(): Promise<boolean> {
    if (this.isVideoEnabled) {
      // Disable local video tracks
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        this.localStream.removeTrack(track);
      });
      this.isVideoEnabled = false;

      // Replace track on all active peer senders
      this.peerConnections.forEach((pc) => {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(null).catch(() => {});
        }
      });
    } else {
      // Enable camera
      try {
        const constraints: MediaStreamConstraints = {
          video: this.selectedCameraId
            ? { deviceId: { exact: this.selectedCameraId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
        };
        const videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        const newTrack = videoStream.getVideoTracks()[0];

        if (newTrack) {
          this.localStream.addTrack(newTrack);
          this.isVideoEnabled = true;

          // Replace track on all active peer senders
          this.peerConnections.forEach((pc) => {
            const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video' || !s.track);
            if (videoSender) {
              videoSender.replaceTrack(newTrack).catch(() => {});
            } else {
              try {
                pc.addTrack(newTrack, this.localStream);
              } catch {}
            }
          });
        }
      } catch (err: any) {
        console.warn('[MediaClient] Camera access error:', err);
        this.handleMediaError(err, 'camera');
        return false;
      }
    }

    this.updateLocalParticipantState();
    this.broadcastMediaState();
    return this.isVideoEnabled;
  }

  // --- SCREEN SHARING ---

  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always' as any,
          frameRate: { max: 30 },
        },
        audio: true,
      });

      this.isScreenSharing = true;
      const screenTrack = this.localScreenStream.getVideoTracks()[0];

      // Handle user stopping screen share via browser native control bar
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      // Replace video track on active peer connections with screen track
      for (const [targetUserId, pc] of this.peerConnections.entries()) {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack).catch(() => {});
        } else {
          try {
            pc.addTrack(screenTrack, this.localScreenStream!);
          } catch {}
        }

        // Trigger WebRTC renegotiation offer so remote peer updates its video track
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          this.socket?.emit('webrtc_offer', {
            classId: this.config.classId,
            targetUserId,
            offer,
          });
        } catch (negErr) {
          console.warn(`[MediaClient] Screenshare renegotiation warning for ${targetUserId}:`, negErr);
        }
      }

      this.updateLocalParticipantState();
      this.broadcastMediaState();

      if (this.socket) {
        this.socket.emit('liveClass:screenShare:start', {
          classId: this.config.classId,
        });
        this.socket.emit('screen_share_started', {
          classId: this.config.classId,
          userId: this.config.userId,
          name: this.config.userName,
        });
      }

      return this.localScreenStream;
    } catch (err) {
      console.warn('[MediaClient] Screen share cancelled or failed:', err);
      return null;
    }
  }

  public async stopScreenShare(): Promise<void> {
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      this.localScreenStream = null;
    }
    this.isScreenSharing = false;

    // Restore camera video track on peer connections if camera was enabled
    const camTrack = this.localStream.getVideoTracks()[0] || null;
    for (const [targetUserId, pc] of this.peerConnections.entries()) {
      const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(camTrack).catch(() => {});
      }

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        this.socket?.emit('webrtc_offer', {
          classId: this.config.classId,
          targetUserId,
          offer,
        });
      } catch {}
    }

    this.updateLocalParticipantState();
    this.broadcastMediaState();

    if (this.socket) {
      this.socket.emit('liveClass:screenShare:stop', {
        classId: this.config.classId,
      });
      this.socket.emit('screen_share_stopped', {
        classId: this.config.classId,
        userId: this.config.userId,
      });
    }
  }

  // --- DEVICE MANAGEMENT ---

  public async getAvailableDevices(): Promise<AvailableMediaDevices> {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return { audioInputs: [], videoInputs: [], audioOutputs: [] };
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devices.filter((d) => d.kind === 'audioinput'),
        videoInputs: devices.filter((d) => d.kind === 'videoinput'),
        audioOutputs: devices.filter((d) => d.kind === 'audiooutput'),
      };
    } catch {
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }
  }

  public async switchCamera(deviceId: string): Promise<boolean> {
    this.selectedCameraId = deviceId;
    if (this.isVideoEnabled) {
      // Re-acquire camera with specific deviceId
      await this.toggleCamera(); // turn off
      return await this.toggleCamera(); // turn on with new deviceId
    }
    return false;
  }

  public async switchMicrophone(deviceId: string): Promise<boolean> {
    this.selectedMicrophoneId = deviceId;
    if (this.isAudioEnabled) {
      // Re-acquire microphone with specific deviceId
      await this.toggleMicrophone(); // turn off
      return await this.toggleMicrophone(); // turn on with new deviceId
    }
    return false;
  }

  // --- MODERATION ACTIONS ---

  public muteParticipant(userId: string): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('liveClass:moderation:mute', {
        classId: this.config.classId,
        userId,
      });
      this.socket.emit('mute_student', {
        classId: this.config.classId,
        userId,
        isMuted: true,
      });
    }
  }

  public askToUnmuteParticipant(userId: string): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('liveClass:moderation:requestUnmute', {
        classId: this.config.classId,
        userId,
      });
    }
  }

  public allowParticipantMic(userId: string): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('liveClass:moderation:allowMic', {
        classId: this.config.classId,
        userId,
      });
    }
  }

  public muteAllStudents(): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('liveClass:moderation:muteAll', {
        classId: this.config.classId,
      });
      this.socket.emit('mute_all_students', {
        classId: this.config.classId,
      });
    }
  }

  public pinParticipant(userId: string | null): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      if (userId) {
        this.socket.emit('liveClass:pin:set', {
          classId: this.config.classId,
          userId,
        });
      } else {
        this.socket.emit('liveClass:pin:clear', {
          classId: this.config.classId,
        });
      }
    }
  }

  public getPinnedUserId(): string | null {
    return this.pinnedUserId;
  }

  public getIsMutedByInstructor(): boolean {
    return this.isMutedByInstructor;
  }

  public kickParticipant(userId: string): void {
    if (this.socket && (this.config.role === 'instructor' || this.config.role === 'mentor')) {
      this.socket.emit('kick_participant', {
        classId: this.config.classId,
        userId,
      });
    }
  }

  // --- ACCESSORS ---

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

  public getIsAudioEnabled(): boolean {
    return this.isAudioEnabled;
  }

  public getIsVideoEnabled(): boolean {
    return this.isVideoEnabled;
  }

  public getIsScreenSharing(): boolean {
    return this.isScreenSharing;
  }

  // --- EVENT EMITTER ---

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
      listeners.forEach((fn) => {
        try {
          fn(data);
        } catch (e) {
          console.error('[MediaClient] Error in listener:', e);
        }
      });
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

  // --- WEBRTC PEER CONNECTION MESH ---

  private getOrCreatePeerConnection(targetUserId: string): RTCPeerConnection {
    if (this.peerConnections.has(targetUserId)) {
      return this.peerConnections.get(targetUserId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: this.config.iceServers || DEFAULT_ICE_SERVERS,
    });

    // Add local media tracks to peer connection
    this.localStream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, this.localStream);
      } catch (e) {
        console.warn('[MediaClient] Track addition warning:', e);
      }
    });

    // If screen share is active, add screen track
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, this.localScreenStream!);
        } catch {}
      });
    }

    // ICE Candidate Generation
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc_ice_candidate', {
          classId: this.config.classId,
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Remote Track Received
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      const p = this.participants.get(targetUserId);
      if (p) {
        p.stream = remoteStream;
        p.isAudioOn = remoteStream.getAudioTracks().some((t) => t.enabled);
        p.isVideoOn = remoteStream.getVideoTracks().some((t) => t.enabled);
        this.emit('participantsUpdate', this.getParticipants());
      }
    };

    // Track connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        const p = this.participants.get(targetUserId);
        if (p) p.connectionState = 'connected';
        this.emit('participantsUpdate', this.getParticipants());
      } else if (state === 'disconnected' || state === 'failed') {
        const p = this.participants.get(targetUserId);
        if (p) p.connectionState = 'disconnected';
        this.emit('participantsUpdate', this.getParticipants());
      }
    };

    // Renegotiate when tracks change (e.g. mic, cam, screen share toggled)
    pc.onnegotiationneeded = async () => {
      try {
        if (this.config.userId > targetUserId) {
          await this.initiateOffer(targetUserId);
        }
      } catch (err) {
        console.warn('[MediaClient] Negotiation error:', err);
      }
    };

    this.peerConnections.set(targetUserId, pc);
    return pc;
  }

  private async initiateOffer(targetUserId: string): Promise<void> {
    if (!this.socket) return;
    try {
      const pc = this.getOrCreatePeerConnection(targetUserId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      this.socket.emit('webrtc_offer', {
        classId: this.config.classId,
        targetUserId,
        offer,
      });
    } catch (err) {
      console.warn(`[MediaClient] Failed to initiate offer to ${targetUserId}:`, err);
    }
  }

  private async handleReceiveOffer(senderUserId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.socket) return;
    try {
      const pc = this.getOrCreatePeerConnection(senderUserId);

      // WebRTC glare protection
      const isPolite = this.config.userId < senderUserId;
      if (pc.signalingState !== 'stable') {
        if (!isPolite) {
          // Impolite peer rejects incoming colliding offer; its own offer takes precedence
          return;
        }
        // Polite peer rolls back local description to accept remote offer
        try {
          await pc.setLocalDescription({ type: 'rollback' } as any);
        } catch {}
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush queued ICE candidates
      const queued = this.pendingCandidates.get(senderUserId) || [];
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch {}
      }
      this.pendingCandidates.delete(senderUserId);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket.emit('webrtc_answer', {
        classId: this.config.classId,
        targetUserId: senderUserId,
        answer,
      });
    } catch (err) {
      console.warn(`[MediaClient] Error handling offer from ${senderUserId}:`, err);
    }
  }

  private async handleReceiveAnswer(senderUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(senderUserId);
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // Flush queued ICE candidates
      const queued = this.pendingCandidates.get(senderUserId) || [];
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch {}
      }
      this.pendingCandidates.delete(senderUserId);
    } catch (err) {
      console.warn(`[MediaClient] Error handling answer from ${senderUserId}:`, err);
    }
  }

  private async handleReceiveIceCandidate(senderUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(senderUserId);
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('[MediaClient] Error adding ICE candidate:', e);
      }
    } else {
      // Queue candidate until remote description is set
      if (!this.pendingCandidates.has(senderUserId)) {
        this.pendingCandidates.set(senderUserId, []);
      }
      this.pendingCandidates.get(senderUserId)!.push(candidate);
    }
  }

  private handleMediaError(err: any, type: 'camera' | 'microphone'): void {
    let friendlyMessage = `Unable to access your ${type}.`;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      friendlyMessage = `${type === 'camera' ? 'Camera' : 'Microphone'} access was denied. Please allow permission in your browser URL bar settings.`;
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      friendlyMessage = `No ${type} device was found on your system.`;
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      friendlyMessage = `Your ${type} is in use by another application.`;
    }
    this.emit('mediaError', { type, message: friendlyMessage, originalError: err });
  }

  // --- SOCKET SIGNALING SETUP ---

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // A new peer joined the live class
    this.socket.on('user_joined', (data: { userId: string; name: string; role: MediaRole }) => {
      if (data.userId !== this.config.userId) {
        if (!this.participants.has(data.userId)) {
          this.participants.set(data.userId, {
            userId: data.userId,
            name: data.name,
            role: data.role,
            isAudioOn: false,
            isVideoOn: false,
            isScreenSharing: false,
            isHandRaised: false,
            connectionState: 'connecting',
          });
          this.emit('participantsUpdate', this.getParticipants());
        }
        // Exactly one peer initiates the offer deterministically
        if (this.config.userId > data.userId) {
          this.initiateOffer(data.userId);
        }
      }
    });

    // Legacy alias
    this.socket.on('student:joined', (data: { userId: string; name: string; role: MediaRole }) => {
      if (data.userId !== this.config.userId && !this.participants.has(data.userId)) {
        this.participants.set(data.userId, {
          userId: data.userId,
          name: data.name,
          role: data.role,
          isAudioOn: false,
          isVideoOn: false,
          isScreenSharing: false,
          isHandRaised: false,
          connectionState: 'connecting',
        });
        this.emit('participantsUpdate', this.getParticipants());
        if (this.config.userId > data.userId) {
          this.initiateOffer(data.userId);
        }
      }
    });

    // Participant left the classroom
    this.socket.on('user_left', (data: { userId: string }) => {
      this.handleUserLeft(data.userId);
    });

    this.socket.on('student:left', (data: { userId: string }) => {
      this.handleUserLeft(data.userId);
    });

    // Participants roster update
    this.socket.on('participants_update', (data: { users: Array<{ userId: string; name: string; role: MediaRole }> }) => {
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach((u) => {
          if (u.userId !== this.config.userId) {
            if (!this.participants.has(u.userId)) {
              this.participants.set(u.userId, {
                userId: u.userId,
                name: u.name,
                role: u.role,
                isAudioOn: false,
                isVideoOn: false,
                isScreenSharing: false,
                isHandRaised: false,
                connectionState: 'connecting',
              });
              // Initiate connection if our ID is higher
              if (this.config.userId > u.userId) {
                this.initiateOffer(u.userId);
              }
            }
          }
        });
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    // WebRTC Signaling Messages
    this.socket.on('webrtc_offer', async (data: { senderUserId: string; offer: RTCSessionDescriptionInit }) => {
      if (data.senderUserId && data.offer) {
        await this.handleReceiveOffer(data.senderUserId, data.offer);
      }
    });

    this.socket.on('webrtc_answer', async (data: { senderUserId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.senderUserId && data.answer) {
        await this.handleReceiveAnswer(data.senderUserId, data.answer);
      }
    });

    this.socket.on('webrtc_ice_candidate', async (data: { senderUserId: string; candidate: RTCIceCandidateInit }) => {
      if (data.senderUserId && data.candidate) {
        await this.handleReceiveIceCandidate(data.senderUserId, data.candidate);
      }
    });

    // Remote Track State Changes
    this.socket.on('webrtc_track_change', (data: { userId: string; isAudioOn: boolean; isVideoOn: boolean; isScreenSharing: boolean }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isAudioOn = data.isAudioOn;
        p.isVideoOn = data.isVideoOn;
        p.isScreenSharing = data.isScreenSharing;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    // Active Speaker Events
    this.socket.on('liveClass:speaker:changed', (data: { userId: string; name?: string; role?: string; audioLevel?: number } | null) => {
      this.participants.forEach((p, uid) => {
        const isThisSpeaker = Boolean(data && uid === data.userId);
        p.isSpeaking = isThisSpeaker;
        if (isThisSpeaker && typeof data?.audioLevel === 'number') {
          p.audioLevel = data.audioLevel;
        } else if (!isThisSpeaker) {
          p.audioLevel = 0;
        }
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('activeSpeakerChange', data);
    });

    this.socket.on('liveClass:speaker:started', (data: { userId: string; audioLevel?: number }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isSpeaking = true;
        p.audioLevel = data.audioLevel ?? 0.8;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    this.socket.on('liveClass:speaker:stopped', (data: { userId: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isSpeaking = false;
        p.audioLevel = 0;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    // Screen Share Events
    this.socket.on('liveClass:screenShare:started', (data: { userId: string; name: string }) => {
      this.participants.forEach((p, uid) => {
        p.isScreenSharing = uid === data.userId;
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('screenShareStateChange', { isSharing: true, sharerUserId: data.userId, sharerName: data.name });
    });

    this.socket.on('screen_share_started', (data: { userId: string; name: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isScreenSharing = true;
        this.emit('participantsUpdate', this.getParticipants());
        this.emit('screenShareStateChange', { isSharing: true, sharerUserId: data.userId, sharerName: data.name });
      }
    });

    this.socket.on('liveClass:screenShare:stopped', () => {
      this.participants.forEach((p) => {
        p.isScreenSharing = false;
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('screenShareStateChange', { isSharing: false });
    });

    this.socket.on('screen_share_stopped', (data: { userId: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isScreenSharing = false;
        this.emit('participantsUpdate', this.getParticipants());
        this.emit('screenShareStateChange', { isSharing: false });
      }
    });

    // Pinning Events
    this.socket.on('liveClass:pin:updated', (data: { pinnedUserId: string | null }) => {
      this.pinnedUserId = data.pinnedUserId;
      this.participants.forEach((p, uid) => {
        p.isPinned = Boolean(data.pinnedUserId && uid === data.pinnedUserId);
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('pinChange', data.pinnedUserId);
    });

    // Moderation: Mute All Students
    this.socket.on('liveClass:moderation:muteAll', () => {
      if (this.config.role === 'student') {
        this.isMutedByInstructor = true;
        if (this.isAudioEnabled) {
          this.toggleMicrophone().catch(() => {});
        }
        this.emit('instructorMuteStateChange', true);
      }
      this.participants.forEach((p) => {
        if (p.role === 'student') {
          p.isMutedByInstructor = true;
          p.isAudioOn = false;
          p.isSpeaking = false;
          p.audioLevel = 0;
        }
      });
      this.emit('participantsUpdate', this.getParticipants());
    });

    this.socket.on('mute_all_students', () => {
      if (this.config.role === 'student') {
        this.isMutedByInstructor = true;
        if (this.isAudioEnabled) {
          this.toggleMicrophone().catch(() => {});
        }
        this.emit('instructorMuteStateChange', true);
      }
    });

    // Moderation: Individual Mute
    this.socket.on('liveClass:moderation:muted', (data: { userId: string; mutedBy?: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isMutedByInstructor = true;
        p.isAudioOn = false;
        p.isSpeaking = false;
        p.audioLevel = 0;
      }
      if (data.userId === this.config.userId) {
        this.isMutedByInstructor = true;
        if (this.isAudioEnabled) {
          this.toggleMicrophone().catch(() => {});
        }
        this.emit('instructorMuteStateChange', true);
      }
      this.emit('participantsUpdate', this.getParticipants());
    });

    this.socket.on('student_muted', (data: { userId: string; isMuted: boolean }) => {
      if (data.userId === this.config.userId) {
        this.isMutedByInstructor = data.isMuted;
        if (data.isMuted && this.isAudioEnabled) {
          this.toggleMicrophone().catch(() => {});
        }
        this.emit('instructorMuteStateChange', data.isMuted);
      }
    });

    // Moderation: Allow Mic
    this.socket.on('liveClass:moderation:micAllowed', (data: { userId: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isMutedByInstructor = false;
        p.micPermission = 'granted';
      }
      if (data.userId === this.config.userId) {
        this.isMutedByInstructor = false;
        this.emit('instructorMuteStateChange', false);
      }
      this.emit('participantsUpdate', this.getParticipants());
    });

    // Moderation: Ask to Unmute
    this.socket.on('liveClass:moderation:requestUnmute', (data: { classId: string; instructorName?: string }) => {
      this.isMutedByInstructor = false;
      this.emit('moderationRequestUnmute', data);
    });

    // Presence & Reconnect State Synchronization
    this.socket.on('liveClass:presence', (data: any) => {
      if (data?.pinnedUserId !== undefined) {
        this.pinnedUserId = data.pinnedUserId;
      }
      if (data?.participants && Array.isArray(data.participants)) {
        data.participants.forEach((remote: any) => {
          const localP = this.participants.get(remote.userId);
          if (localP) {
            localP.isSpeaking = Boolean(remote.isSpeaking);
            localP.audioLevel = remote.audioLevel ?? 0;
            localP.isPinned = Boolean(remote.isPinned || (data.pinnedUserId && remote.userId === data.pinnedUserId));
            localP.isMutedByInstructor = Boolean(remote.isMutedByInstructor);
            localP.isScreenSharing = Boolean(remote.isScreenSharing);
          }
        });
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    this.socket.on('liveClass:reconnect:synced', (data: any) => {
      if (data?.pinnedUserId !== undefined) {
        this.pinnedUserId = data.pinnedUserId;
      }
      if (data?.moderationState) {
        this.isMutedByInstructor = Boolean(data.moderationState.mutedByInstructor);
        this.emit('instructorMuteStateChange', this.isMutedByInstructor);
      }
      if (data?.participants && Array.isArray(data.participants)) {
        data.participants.forEach((remote: any) => {
          const localP = this.participants.get(remote.userId);
          if (localP) {
            localP.isSpeaking = Boolean(remote.isSpeaking);
            localP.audioLevel = remote.audioLevel ?? 0;
            localP.isPinned = Boolean(remote.isPinned);
            localP.isMutedByInstructor = Boolean(remote.isMutedByInstructor);
            localP.isScreenSharing = Boolean(remote.isScreenSharing);
          }
        });
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    // Kicked by instructor
    this.socket.on('kicked', () => {
      this.disconnect();
      this.emit('kicked', true);
    });
  }

  private handleUserLeft(userId: string): void {
    this.participants.delete(userId);
    const pc = this.peerConnections.get(userId);
    if (pc) {
      try {
        pc.close();
      } catch {}
      this.peerConnections.delete(userId);
    }
    this.pendingCandidates.delete(userId);
    this.emit('participantsUpdate', this.getParticipants());
  }
}

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

  // WebRTC negotiation state guards to eliminate glare and race conditions
  private makingOffer: Map<string, boolean> = new Map();
  private registeredSocketListeners: Array<{ event: string; handler: (...args: any[]) => void }> = [];

  constructor(config: MediaClientConfig) {
    this.config = {
      ...config,
      iceServers: config.iceServers || DEFAULT_ICE_SERVERS,
    };
    // Default: student mic is locked by default until instructor explicitly grants permission
    if (this.config.role === 'student') {
      this.isMutedByInstructor = true;
    }

    console.log(
      `[LIVE_DEBUG] IDENTITY: local userId=${this.config.userId} local role=${this.config.role} liveClassId=${this.config.classId} instructorId=${this.config.instructorId || 'NONE'}`
    );
  }

  public async connect(): Promise<void> {
    this.setConnectionState('connecting');

    try {
      this.socket = getLiveClassroomSocket();

      console.log(
        `[LIVE_DEBUG] ROOM: socket connected=${this.socket.connected} socket id=${this.socket.id || 'pending'} classroom room=live-class:${this.config.classId}`
      );

      this.setupSocketListeners();

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

      // Seed initial participants if passed from live classroom screen
      if (this.config.initialParticipants && Array.isArray(this.config.initialParticipants)) {
        console.log(
          `[LIVE_DEBUG] ROOM: seeding ${this.config.initialParticipants.length} initial participants:`,
          this.config.initialParticipants.map((p) => `id=${p.userId} role=${p.role}`).join(', ')
        );
        this.handleRosterSync(this.config.initialParticipants);
      }

      // Query server for latest room participants and sync state
      this.socket.emit('join_class', {
        classId: this.config.classId,
        liveClassId: this.config.classId,
        userId: this.config.userId,
        name: this.config.userName,
        role: this.config.role,
        token: this.config.token,
      }, (res: any) => {
        console.log(
          `[LIVE_DEBUG] ROOM: join_class ack success=${res?.success} participantsCount=${res?.participants?.length || 0}`,
          res?.participants?.map((p: any) => `id=${p.userId || p.id} role=${p.role}`).join(', ') || 'NONE'
        );
        if (res?.participants && Array.isArray(res?.participants)) {
          this.handleRosterSync(res.participants);
        }
      });

      this.setConnectionState('connected');
    } catch (err) {
      console.error('[LIVE_DEBUG] MediaClient: Connection failed:', err);
      this.setConnectionState('failed');
      throw err;
    }
  }

  private cleanupSocketListeners(): void {
    if (this.socket && this.registeredSocketListeners.length > 0) {
      const count = this.registeredSocketListeners.length;
      for (const { event, handler } of this.registeredSocketListeners) {
        try {
          this.socket.off(event, handler);
        } catch {}
      }
      this.registeredSocketListeners = [];
      console.log(
        `[LIVE_DEBUG][SOCKET_CLEANUP] removedListeners=${count} socketConnected=${this.socket.connected}`
      );
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
    this.makingOffer.clear();

    // Clean up socket listeners
    this.cleanupSocketListeners();

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

  // --- HELPER METHODS FOR WEBRTC LOGGING & RENEGOTIATION ---

  private logSenders(context: string, targetUserId?: string): void {
    const pcs = targetUserId
      ? ([[targetUserId, this.peerConnections.get(targetUserId)]] as [string, RTCPeerConnection | undefined][]).filter(([, pc]) => !!pc)
      : Array.from(this.peerConnections.entries());

    for (const [uid, pc] of pcs) {
      if (!pc) continue;
      const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
      const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
      console.log(
        `[LIVE_DEBUG][SENDERS] context=${context} remoteUserId=${uid} audioSenderTrackId=${audioSender?.track?.id || 'null'} videoSenderTrackId=${videoSender?.track?.id || 'null'} audioTrackState=${audioSender?.track?.readyState || 'null'} videoTrackState=${videoSender?.track?.readyState || 'null'}`
      );
    }
  }

  private inspectSDP(type: 'OFFER' | 'ANSWER', sdp: string | undefined): void {
    if (!sdp) {
      console.log(`[LIVE_DEBUG] ${type} SDP: undefined`);
      return;
    }
    const hasAudio = sdp.includes('m=audio');
    const hasVideo = sdp.includes('m=video');
    console.log(
      `[LIVE_DEBUG] ${type} SDP: AUDIO SDP: ${hasAudio ? 'PRESENT' : 'MISSING'} | VIDEO SDP: ${hasVideo ? 'PRESENT' : 'MISSING'}`
    );
    const directions = sdp.match(/a=(sendrecv|sendonly|recvonly|inactive)/g) || [];
    console.log(`[LIVE_DEBUG] ${type} SDP directions:`, directions.join(', '));
  }

  private async renegotiateAllPeers(): Promise<void> {
    const isLocalInstructor =
      this.config.role === 'instructor' ||
      this.config.role === 'mentor' ||
      (this.config.role as string) === 'admin';

    for (const [targetUserId, pc] of this.peerConnections.entries()) {
      if (isLocalInstructor || this.config.userId > targetUserId) {
        if (pc.signalingState === 'stable' && !this.makingOffer.get(targetUserId)) {
          console.log(`[LIVE_DEBUG] renegotiateAllPeers: initiating offer to ${targetUserId}`);
          await this.initiateOffer(targetUserId);
        } else {
          console.log(
            `[LIVE_DEBUG] renegotiateAllPeers: deferred/waiting for ${targetUserId} (signalingState=${pc.signalingState})`
          );
        }
      }
    }
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
        console.log(`[LIVE_DEBUG] MEDIA LOCAL: stopping audio track id=${track.id}`);
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
      for (const [, pc] of this.peerConnections.entries()) {
        const audioTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'audio');
        if (audioTransceiver) {
          audioTransceiver.sender.replaceTrack(null).catch(() => {});
        } else {
          const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(null).catch(() => {});
          }
        }
      }
      this.logSenders('disableMicrophone');
      await this.renegotiateAllPeers();
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
          console.log(
            `[LIVE_DEBUG][CAPTURE] type=microphone role=${this.config.role} userId=${this.config.userId} audioTracks=${this.localStream.getAudioTracks().length} videoTracks=${this.localStream.getVideoTracks().length} trackIds=[${this.localStream.getTracks().map((t) => t.id).join(',')}] readyState=${newTrack.readyState} enabled=${newTrack.enabled}`
          );

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

          // Replace track on all active peer senders / transceivers
          for (const [targetUserId, pc] of this.peerConnections.entries()) {
            const audioTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'audio');
            if (audioTransceiver) {
              audioTransceiver.direction = 'sendrecv';
              await audioTransceiver.sender.replaceTrack(newTrack).catch((err) => {
                console.warn(`[LIVE_DEBUG] audio replaceTrack error for ${targetUserId}:`, err);
              });
            } else {
              const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
              if (audioSender) {
                await audioSender.replaceTrack(newTrack).catch(() => {});
              } else {
                try {
                  pc.addTrack(newTrack, this.localStream);
                } catch (addErr) {
                  console.warn(`[LIVE_DEBUG] audio addTrack error for ${targetUserId}:`, addErr);
                }
              }
            }
          }
          this.logSenders('enableMicrophone');
          await this.renegotiateAllPeers();
        }
      } catch (err: any) {
        console.warn('[LIVE_DEBUG] MEDIA LOCAL: getUserMedia audio failure:', err);
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
    this.localStream.getAudioTracks().forEach((t) => {
      try {
        t.enabled = false;
        t.stop();
        this.localStream.removeTrack(t);
      } catch {}
    });
    for (const [, pc] of this.peerConnections.entries()) {
      const audioTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'audio');
      if (audioTransceiver) {
        audioTransceiver.sender.replaceTrack(null).catch(() => {});
      } else {
        const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
        if (audioSender) {
          audioSender.replaceTrack(null).catch(() => {});
        }
      }
    }
    this.logSenders('muteMicrophone');
    this.isAudioEnabled = false;
    this.updateLocalParticipantState();
    this.broadcastMediaState();
    await this.renegotiateAllPeers();
  }

  // --- CAMERA CONTROLS ---

  public async toggleCamera(): Promise<boolean> {
    if (this.isVideoEnabled) {
      // Disable local video tracks
      this.localStream.getVideoTracks().forEach((track) => {
        console.log(`[LIVE_DEBUG] MEDIA LOCAL: stopping video track id=${track.id}`);
        track.enabled = false;
        track.stop();
        this.localStream.removeTrack(track);
      });
      this.isVideoEnabled = false;

      // Replace track on all active peer senders
      for (const [, pc] of this.peerConnections.entries()) {
        const videoTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'video');
        if (videoTransceiver) {
          videoTransceiver.sender.replaceTrack(null).catch(() => {});
        } else {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(null).catch(() => {});
          }
        }
      }
      this.logSenders('disableCamera');
      await this.renegotiateAllPeers();
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
          console.log(
            `[LIVE_DEBUG][CAPTURE] type=camera role=${this.config.role} userId=${this.config.userId} audioTracks=${this.localStream.getAudioTracks().length} videoTracks=${this.localStream.getVideoTracks().length} trackIds=[${this.localStream.getTracks().map((t) => t.id).join(',')}] readyState=${newTrack.readyState} enabled=${newTrack.enabled}`
          );

          // Replace track on all active peer senders / transceivers
          for (const [targetUserId, pc] of this.peerConnections.entries()) {
            const videoTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'video');
            if (videoTransceiver) {
              videoTransceiver.direction = 'sendrecv';
              await videoTransceiver.sender.replaceTrack(newTrack).catch((err) => {
                console.warn(`[LIVE_DEBUG] video replaceTrack error for ${targetUserId}:`, err);
              });
            } else {
              const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
              if (videoSender) {
                await videoSender.replaceTrack(newTrack).catch(() => {});
              } else {
                try {
                  pc.addTrack(newTrack, this.localStream);
                } catch (addErr) {
                  console.warn(`[LIVE_DEBUG] video addTrack error for ${targetUserId}:`, addErr);
                }
              }
            }
          }
          this.logSenders('enableCamera');
          await this.renegotiateAllPeers();
        }
      } catch (err: any) {
        console.warn('[LIVE_DEBUG] MEDIA LOCAL: getUserMedia camera failure:', err);
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
        audio: false, // Ensure display media does not capture tab audio or interfere with microphone track
      });

      this.isScreenSharing = true;
      const screenTrack = this.localScreenStream.getVideoTracks()[0];
      console.log(
        `[LIVE_DEBUG][SCREEN_CAPTURE] userId=${this.config.userId} screenTrackId=${screenTrack.id} readyState=${screenTrack.readyState} enabled=${screenTrack.enabled}`
      );

      // Handle user stopping screen share via browser native control bar
      screenTrack.onended = () => {
        console.log('[LIVE_DEBUG] SCREEN SHARE: native onended event fired');
        this.stopScreenShare();
      };

      // Replace video track on active peer connections with screen track
      // IMPORTANT: Do NOT touch audio transceivers/senders — microphone MUST remain intact!
      for (const [targetUserId, pc] of this.peerConnections.entries()) {
        const videoTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'video');
        if (videoTransceiver) {
          videoTransceiver.direction = 'sendrecv';
          await videoTransceiver.sender.replaceTrack(screenTrack).catch((err) => {
            console.warn(`[LIVE_DEBUG] Screenshare replaceTrack error for ${targetUserId}:`, err);
          });
        } else {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(screenTrack).catch(() => {});
          } else {
            try {
              pc.addTrack(screenTrack, this.localScreenStream!);
            } catch {}
          }
        }
      }

      this.logSenders('startScreenShare');
      await this.renegotiateAllPeers();

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
    } catch (err: any) {
      console.error(`[LIVE_DEBUG][SCREEN_CAPTURE] FAILED userId=${this.config.userId} error=${err?.name || ''} ${err?.message || err}`);
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
    const camTrack = this.isVideoEnabled ? (this.localStream.getVideoTracks()[0] || null) : null;
    console.log(
      `[LIVE_DEBUG] SCREEN SHARE: stopScreenShare - restoring camera track: id=${camTrack?.id || 'null'}`
    );

    for (const [, pc] of this.peerConnections.entries()) {
      const videoTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'video');
      if (videoTransceiver) {
        await videoTransceiver.sender.replaceTrack(camTrack).catch(() => {});
      } else {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(camTrack).catch(() => {});
        }
      }
    }

    this.logSenders('stopScreenShare');
    await this.renegotiateAllPeers();

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
    return Array.from(this.participants.values()).map((p) => ({ ...p }));
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

  // --- WEBRTC PEER CONNECTION MESH & AUTHORITATIVE TRANSCEIVER TRACK SYNC ---

  public syncRemoteTracks(targetUserId: string): void {
    const pc = this.peerConnections.get(targetUserId);
    if (!pc) return;

    let p = this.participants.get(targetUserId);
    const isTargetInstructor =
      (this.config.instructorId && targetUserId === this.config.instructorId) ||
      p?.role === 'instructor' ||
      p?.role === 'mentor';

    if (!p) {
      p = {
        userId: targetUserId,
        name: isTargetInstructor ? 'Lead Instructor' : 'Participant',
        role: isTargetInstructor ? 'instructor' : 'student',
        isAudioOn: false,
        isVideoOn: false,
        isScreenSharing: false,
        isHandRaised: false,
        connectionState: 'connected',
        stream: new MediaStream(),
        streamVersion: 0,
      };
      this.participants.set(targetUserId, p);
    } else if (isTargetInstructor && p.role !== 'instructor') {
      p.role = 'instructor';
    }

    let remoteAudioTrack: MediaStreamTrack | undefined = p.audioTrack;
    let remoteVideoTrack: MediaStreamTrack | undefined = p.videoTrack;

    const transceivers = pc.getTransceivers ? pc.getTransceivers() : [];
    for (const t of transceivers) {
      const track = t.receiver?.track;
      if (track) {
        if (track.kind === 'audio') {
          if (!remoteAudioTrack || remoteAudioTrack.id !== track.id || remoteAudioTrack.readyState === 'ended') {
            remoteAudioTrack = track;
          }
        } else if (track.kind === 'video') {
          if (!remoteVideoTrack || remoteVideoTrack.id !== track.id || remoteVideoTrack.readyState === 'ended') {
            remoteVideoTrack = track;
          }
        }

        // Attach state change listeners once to keep sync authoritative
        if (!(track as any)._hasLiveSyncListeners) {
          (track as any)._hasLiveSyncListeners = true;
          track.onunmute = () => {
            console.log(`[LIVE_DEBUG] receiver.track.onunmute: kind=${track.kind} id=${track.id} from=${targetUserId}`);
            this.syncRemoteTracks(targetUserId);
          };
          track.onmute = () => {
            console.log(`[LIVE_DEBUG] receiver.track.onmute: kind=${track.kind} id=${track.id} from=${targetUserId}`);
            this.syncRemoteTracks(targetUserId);
          };
          track.onended = () => {
            console.log(`[LIVE_DEBUG] receiver.track.onended: kind=${track.kind} id=${track.id} from=${targetUserId}`);
            this.syncRemoteTracks(targetUserId);
          };
        }
      }
    }

    // Preserve audio and video tracks together without destroying one when the other arrives
    const tracksToKeep: MediaStreamTrack[] = [];
    if (remoteAudioTrack && remoteAudioTrack.readyState !== 'ended') {
      tracksToKeep.push(remoteAudioTrack);
      p.audioTrack = remoteAudioTrack;
      p.isAudioOn = remoteAudioTrack.enabled && !remoteAudioTrack.muted;
    } else {
      p.audioTrack = undefined;
      p.isAudioOn = false;
    }

    if (remoteVideoTrack && remoteVideoTrack.readyState !== 'ended') {
      tracksToKeep.push(remoteVideoTrack);
      p.videoTrack = remoteVideoTrack;
      p.isVideoOn = remoteVideoTrack.enabled && !remoteVideoTrack.muted;
    } else {
      p.videoTrack = undefined;
      p.isVideoOn = false;
    }

    // Build brand new MediaStream object immutably and increment streamVersion
    p.stream = new MediaStream(tracksToKeep);
    p.streamVersion = (p.streamVersion || 0) + 1;

    console.log(
      `[LIVE_DEBUG][REMOTE_TRACK_SYNC] targetUserId=${targetUserId} audioTrack=${remoteAudioTrack?.id || 'null'} videoTrack=${remoteVideoTrack?.id || 'null'} audioReadyState=${remoteAudioTrack?.readyState || 'null'} videoReadyState=${remoteVideoTrack?.readyState || 'null'} streamTracks=[${p.stream.getTracks().map((t) => `${t.kind}:${t.id}:${t.readyState}`).join(',')}]`
    );

    this.emit('participantsUpdate', this.getParticipants());
  }

  private getOrCreatePeerConnection(targetUserId: string): RTCPeerConnection {
    if (this.peerConnections.has(targetUserId)) {
      const existingPc = this.peerConnections.get(targetUserId)!;
      if (existingPc.connectionState !== 'failed' && existingPc.connectionState !== 'closed') {
        console.log(
          `[LIVE_DEBUG][PC] target=${targetUserId} action=reuse connectionState=${existingPc.connectionState} signalingState=${existingPc.signalingState} iceConnectionState=${existingPc.iceConnectionState}`
        );
        return existingPc;
      }
      console.log(
        `[LIVE_DEBUG][PC] target=${targetUserId} action=close connectionState=${existingPc.connectionState} signalingState=${existingPc.signalingState} iceConnectionState=${existingPc.iceConnectionState}`
      );
      try {
        existingPc.close();
      } catch {}
      this.peerConnections.delete(targetUserId);
    }

    const pc = new RTCPeerConnection({
      iceServers: this.config.iceServers || DEFAULT_ICE_SERVERS,
    });

    console.log(
      `[LIVE_DEBUG][PC] target=${targetUserId} action=create connectionState=${pc.connectionState} signalingState=${pc.signalingState} iceConnectionState=${pc.iceConnectionState}`
    );

    const isLocalInstructor =
      this.config.role === 'instructor' ||
      this.config.role === 'mentor' ||
      (this.config.role as string) === 'admin';
    const isInitiator = isLocalInstructor || this.config.userId > targetUserId;

    console.log(
      `[LIVE_DEBUG] PEER: targetUserId=${targetUserId} initiator=${isInitiator} RTCPeerConnection created connectionState=${pc.connectionState} signalingState=${pc.signalingState} iceConnectionState=${pc.iceConnectionState} iceGatheringState=${pc.iceGatheringState}`
    );

    // Add local media tracks to peer connection
    this.localStream.getTracks().forEach((track) => {
      try {
        console.log(`[LIVE_DEBUG] adding local track kind=${track.kind} id=${track.id} to pc for ${targetUserId}`);
        pc.addTrack(track, this.localStream);
      } catch (e) {
        console.warn('[LIVE_DEBUG] Track addition warning:', e);
      }
    });

    // If screen share is active, add screen track
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((track) => {
        try {
          console.log(`[LIVE_DEBUG] adding local screen track kind=${track.kind} id=${track.id} to pc for ${targetUserId}`);
          pc.addTrack(track, this.localScreenStream!);
        } catch {}
      });
    }

    // Pre-allocate audio & video transceivers with sendrecv and stream association
    try {
      const audioTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'audio');
      if (!audioTransceiver) {
        pc.addTransceiver('audio', { direction: 'sendrecv', streams: [this.localStream] });
      }
      const videoTransceiver = pc.getTransceivers().find((t) => t.receiver.track.kind === 'video');
      if (!videoTransceiver) {
        pc.addTransceiver('video', { direction: 'sendrecv', streams: [this.localStream] });
      }
    } catch (e) {
      console.warn('[LIVE_DEBUG] Transceiver setup warning:', e);
    }
    this.logSenders('peerConnectionCreated', targetUserId);

    // ICE Candidate Generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const c = event.candidate;
        console.log(
          `[LIVE_DEBUG][ICE] target=${targetUserId} candidateType=${c.type || 'unknown'} candidate=${c.candidate || ''} iceConnectionState=${pc.iceConnectionState}`
        );
        if (this.socket) {
          this.socket.emit('webrtc_ice_candidate', {
            classId: this.config.classId,
            targetUserId,
            candidate: event.candidate,
          });
        }
      }
    };

    // ICE & Signaling State Listeners
    pc.oniceconnectionstatechange = () => {
      console.log(
        `[LIVE_DEBUG][ICE] target=${targetUserId} candidateType=none candidate=none iceConnectionState=${pc.iceConnectionState}`
      );
      if (pc.iceConnectionState === 'failed') {
        console.error(
          `[LIVE_DEBUG][ICE] ICE_FAILED target=${targetUserId} connectionState=${pc.connectionState} signalingState=${pc.signalingState}`
        );
      }
    };
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(
        `[LIVE_DEBUG] PEER: targetUserId=${targetUserId} connectionState=${state} signalingState=${pc.signalingState} iceConnectionState=${pc.iceConnectionState}`
      );
      const p = this.participants.get(targetUserId);
      if (state === 'connected') {
        if (p) {
          p.connectionState = 'connected';
        }
        this.emit('participantsUpdate', this.getParticipants());
      } else if (state === 'failed') {
        console.warn(`[LIVE_DEBUG] WEBRTC_CONNECTION_FAILED: targetUserId=${targetUserId}`);
        if (p) p.connectionState = 'disconnected';
        this.emit('participantsUpdate', this.getParticipants());
        if (isInitiator) {
          try {
            pc.restartIce();
            this.initiateOffer(targetUserId);
          } catch {}
        }
      } else if (state === 'disconnected') {
        if (p) p.connectionState = 'disconnected';
        this.emit('participantsUpdate', this.getParticipants());
      }
    };
    pc.onicegatheringstatechange = () => {
      console.log(
        `[LIVE_DEBUG][ICE] event=icegatheringstatechange remoteUserId=${targetUserId} iceConnectionState=${pc.iceConnectionState} connectionState=${pc.connectionState} iceGatheringState=${pc.iceGatheringState}`
      );
    };
    pc.onsignalingstatechange = () => {
      console.log(
        `[LIVE_DEBUG] PEER: signalingstatechange targetUserId=${targetUserId} signalingState=${pc.signalingState}`
      );
    };

    // Remote Track Received - Synchronize Authoritative Transceivers
    pc.ontrack = (event) => {
      const track = event.track;
      console.log(
        `[LIVE_DEBUG][ONTRACK] remoteUserId=${targetUserId} trackKind=${track.kind} trackId=${track.id} readyState=${track.readyState} eventStreamsLength=${event.streams.length} streamId=${event.streams[0]?.id || 'none'} audioTrackCount=${event.streams[0]?.getAudioTracks().length || (track.kind === 'audio' ? 1 : 0)} videoTrackCount=${event.streams[0]?.getVideoTracks().length || (track.kind === 'video' ? 1 : 0)}`
      );
      this.syncRemoteTracks(targetUserId);
    };

    // Renegotiate when tracks change
    pc.onnegotiationneeded = async () => {
      console.log(
        `[LIVE_DEBUG] onnegotiationneeded fired for targetUserId=${targetUserId} signalingState=${pc.signalingState} isInitiator=${isInitiator}`
      );
      if (isInitiator) {
        if (!this.makingOffer.get(targetUserId) && pc.signalingState === 'stable') {
          await this.initiateOffer(targetUserId);
        }
      }
    };

    this.peerConnections.set(targetUserId, pc);
    console.log(
      `[LIVE_DEBUG][PC_COUNT] localUserId=${this.config.userId} remoteUserId=${targetUserId} activePeerConnectionCount=${this.peerConnections.size}`
    );
    return pc;
  }

  private async initiateOffer(targetUserId: string): Promise<void> {
    if (!this.socket) return;
    if (this.makingOffer.get(targetUserId)) {
      console.log(`[LIVE_DEBUG] initiateOffer skipped for ${targetUserId} (offer already in progress)`);
      return;
    }
    try {
      this.makingOffer.set(targetUserId, true);
      const pc = this.getOrCreatePeerConnection(targetUserId);

      const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
      const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
      console.log(
        `[LIVE_DEBUG][RENEGOTIATE] target=${targetUserId} audioSenderTrack=${audioSender?.track?.id || 'null'} videoSenderTrack=${videoSender?.track?.id || 'null'} signalingState=${pc.signalingState}`
      );

      if (pc.signalingState !== 'stable') {
        console.log(
          `[LIVE_DEBUG] initiateOffer postponed: targetUserId=${targetUserId} signalingState=${pc.signalingState} - will retry on stable`
        );
        const onStable = async () => {
          if (pc.signalingState === 'stable') {
            pc.removeEventListener('signalingstatechange', onStable);
            console.log(`[LIVE_DEBUG] initiateOffer retrying now that signalingState is stable for ${targetUserId}`);
            await this.initiateOffer(targetUserId);
          }
        };
        pc.addEventListener('signalingstatechange', onStable);
        return;
      }

      console.log(`[LIVE_DEBUG] offer:create for targetUserId=${targetUserId}`);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      const audioOfferMatch = offer.sdp?.match(/m=audio[\s\S]*?(?=m=|$)/);
      const videoOfferMatch = offer.sdp?.match(/m=video[\s\S]*?(?=m=|$)/);
      const audioOfferDir = audioOfferMatch?.[0].match(/a=(sendrecv|sendonly|recvonly|inactive)/)?.[1] || 'none';
      const videoOfferDir = videoOfferMatch?.[0].match(/a=(sendrecv|sendonly|recvonly|inactive)/)?.[1] || 'none';
      console.log(
        `[LIVE_DEBUG][SDP_OFFER] target=${targetUserId} hasAudioMLine=${Boolean(audioOfferMatch)} hasVideoMLine=${Boolean(videoOfferMatch)} audioDirection=${audioOfferDir} videoDirection=${videoOfferDir}`
      );

      const sdpMediaLines = (offer.sdp || '')
        .split('\n')
        .filter((l) => l.startsWith('m=') || l.startsWith('a=send') || l.startsWith('a=recv') || l.startsWith('a=inactive'))
        .map((l) => l.trim())
        .join(' | ');
      console.log(
        `[LIVE_DEBUG][OFFER_CREATED] remoteUserId=${targetUserId} signalingState=${pc.signalingState} sdpMediaLines="${sdpMediaLines}"`
      );

      this.inspectSDP('OFFER', offer.sdp);

      if (pc.signalingState !== 'stable') return;
      console.log(`[LIVE_DEBUG] offer:setLocalDescription for targetUserId=${targetUserId}`);
      await pc.setLocalDescription(offer);

      console.log(
        `[LIVE_DEBUG][OFFER_SENT] from=${this.config.userId} to=${targetUserId} socketId=${this.socket?.id || 'unknown'}`
      );
      this.socket.emit('webrtc_offer', {
        classId: this.config.classId,
        targetUserId,
        offer,
      });

      this.logSenders('afterOffer', targetUserId);
    } catch (err) {
      console.warn(`[LIVE_DEBUG] Failed to initiate offer to ${targetUserId}:`, err);
    } finally {
      this.makingOffer.set(targetUserId, false);
    }
  }

  private async handleReceiveOffer(senderUserId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.socket) return;
    const pc = this.getOrCreatePeerConnection(senderUserId);
    console.log(
      `[LIVE_DEBUG][OFFER_RECEIVED] from=${senderUserId} to=${this.config.userId} signalingState=${pc.signalingState}`
    );
    this.inspectSDP('OFFER', offer.sdp);

    try {
      const isSenderInstructor =
        (this.config.instructorId && senderUserId === this.config.instructorId) ||
        this.participants.get(senderUserId)?.role === 'instructor' ||
        this.participants.get(senderUserId)?.role === 'mentor' ||
        this.config.role === 'student';

      const isPolite = isSenderInstructor ? true : this.config.userId < senderUserId;
      const offerCollision = this.makingOffer.get(senderUserId) || pc.signalingState !== 'stable';

      if (offerCollision) {
        if (!isPolite) {
          console.log(`[LIVE_DEBUG] Glare collision: impolite peer ignoring offer from ${senderUserId}`);
          return;
        }
        console.log(`[LIVE_DEBUG] Glare collision: polite peer rolling back for ${senderUserId}`);
        try {
          await pc.setLocalDescription({ type: 'rollback' } as any);
        } catch (rbErr) {
          console.warn('[LIVE_DEBUG] Rollback error:', rbErr);
        }
      }

      console.log(`[LIVE_DEBUG] offer:setRemoteDescription from senderUserId=${senderUserId}`);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush queued ICE candidates
      const queued = this.pendingCandidates.get(senderUserId) || [];
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
          console.log(`[LIVE_DEBUG] addIceCandidate (flushed) success for senderUserId=${senderUserId}`);
        } catch (candErr) {
          console.warn('[LIVE_DEBUG] Candidate add error:', candErr);
        }
      }
      this.pendingCandidates.delete(senderUserId);

      // Synchronize authoritative remote tracks immediately after remote offer description
      this.syncRemoteTracks(senderUserId);

      console.log(`[LIVE_DEBUG] answer:create for senderUserId=${senderUserId}`);
      const answer = await pc.createAnswer();
      this.inspectSDP('ANSWER', answer.sdp);

      const audioAnsMatch = answer.sdp?.match(/m=audio[\s\S]*?(?=m=|$)/);
      const videoAnsMatch = answer.sdp?.match(/m=video[\s\S]*?(?=m=|$)/);
      const audioAnsDir = audioAnsMatch?.[0].match(/a=(sendrecv|sendonly|recvonly|inactive)/)?.[1] || 'none';
      const videoAnsDir = videoAnsMatch?.[0].match(/a=(sendrecv|sendonly|recvonly|inactive)/)?.[1] || 'none';
      console.log(
        `[LIVE_DEBUG][SDP_ANSWER] target=${senderUserId} hasAudioMLine=${Boolean(audioAnsMatch)} hasVideoMLine=${Boolean(videoAnsMatch)} audioDirection=${audioAnsDir} videoDirection=${videoAnsDir}`
      );

      console.log(`[LIVE_DEBUG] answer:setLocalDescription for senderUserId=${senderUserId}`);
      await pc.setLocalDescription(answer);

      console.log(
        `[LIVE_DEBUG][ANSWER] ACTION=SENT from=${this.config.userId} to=${senderUserId} signalingState=${pc.signalingState}`
      );
      this.socket.emit('webrtc_answer', {
        classId: this.config.classId,
        targetUserId: senderUserId,
        answer,
      });

      this.logSenders('afterAnswer', senderUserId);
      console.log(`[LIVE_DEBUG] WebRTC negotiation answered successfully for targetUserId=${senderUserId}`);
    } catch (err) {
      console.warn(`[LIVE_DEBUG] Error handling offer from ${senderUserId}:`, err);
    }
  }

  private async handleReceiveAnswer(senderUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(senderUserId);
    if (!pc) return;
    console.log(
      `[LIVE_DEBUG][ANSWER] ACTION=RECEIVED from=${senderUserId} to=${this.config.userId} signalingState=${pc.signalingState}`
    );
    this.inspectSDP('ANSWER', answer.sdp);

    try {
      if (pc.signalingState === 'have-local-offer') {
        console.log(`[LIVE_DEBUG] answer:setRemoteDescription for senderUserId=${senderUserId}`);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        // Flush queued ICE candidates
        const queued = this.pendingCandidates.get(senderUserId) || [];
        for (const cand of queued) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
            console.log(`[LIVE_DEBUG] addIceCandidate (flushed) success for senderUserId=${senderUserId}`);
          } catch (candErr) {
            console.warn('[LIVE_DEBUG] Candidate add error:', candErr);
          }
        }
        this.pendingCandidates.delete(senderUserId);

        const audioAnsMatch = answer.sdp?.match(/m=audio[\s\S]*?(?=m=|$)/);
        const videoAnsMatch = answer.sdp?.match(/m=video[\s\S]*?(?=m=|$)/);
        const audioAnsDir = audioAnsMatch?.[0].match(/a=(sendrecv|sendonly|recvonly|inactive)/)?.[1] || 'none';
        const videoAnsDir = videoAnsMatch?.[0].match(/a=(sendrecv|sendonly|recvonly|inactive)/)?.[1] || 'none';
        console.log(
          `[LIVE_DEBUG][SDP_ANSWER] target=${senderUserId} hasAudioMLine=${Boolean(audioAnsMatch)} hasVideoMLine=${Boolean(videoAnsMatch)} audioDirection=${audioAnsDir} videoDirection=${videoAnsDir}`
        );

        this.logSenders('afterAnswerApplied', senderUserId);
        this.syncRemoteTracks(senderUserId);
        console.log(`[LIVE_DEBUG] WebRTC negotiation completed via answer from targetUserId=${senderUserId}`);
      }
    } catch (err) {
      console.warn(`[LIVE_DEBUG] Error handling answer from ${senderUserId}:`, err);
    }
  }

  private async handleReceiveIceCandidate(senderUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    console.log(`[LIVE_DEBUG] candidate:received from senderUserId=${senderUserId}`);
    const pc = this.peerConnections.get(senderUserId);
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`[LIVE_DEBUG] addIceCandidate success for senderUserId=${senderUserId}`);
      } catch (e) {
        console.warn(`[LIVE_DEBUG] addIceCandidate failure for senderUserId=${senderUserId}:`, e);
      }
    } else {
      console.log(`[LIVE_DEBUG] candidate queued for ${senderUserId} (no remoteDescription yet)`);
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

  private handleRosterSync(users: Array<any>): void {
    if (!Array.isArray(users)) return;
    console.log(`[LIVE_DEBUG] handleRosterSync: syncing ${users.length} participants`);
    users.forEach((u) => {
      const uId = u.userId || u.id || u.uid;
      if (uId && uId !== this.config.userId) {
        this.handlePeerJoined(uId, u.name, (u.role as MediaRole) || 'student');
      }
    });
  }

  private handlePeerJoined(userId: string, name: string, role: MediaRole): void {
    if (!userId || userId === this.config.userId) return;

    let resolvedRole = role || 'student';
    if (this.config.instructorId && userId === this.config.instructorId) {
      resolvedRole = 'instructor';
    }

    let p = this.participants.get(userId);
    let isNew = false;
    if (!p) {
      isNew = true;
      p = {
        userId,
        name: name || (resolvedRole === 'instructor' ? 'Lead Instructor' : 'Participant'),
        role: resolvedRole,
        isAudioOn: false,
        isVideoOn: false,
        isScreenSharing: false,
        isHandRaised: false,
        connectionState: 'connecting',
        stream: new MediaStream(),
      };
      this.participants.set(userId, p);
      this.emit('participantsUpdate', this.getParticipants());
    } else {
      if (name && p.name !== name) p.name = name;
      if (resolvedRole && p.role !== resolvedRole) p.role = resolvedRole;
    }

    const isLocalInstructor =
      this.config.role === 'instructor' ||
      this.config.role === 'mentor' ||
      (this.config.role as string) === 'admin';

    // Proactive offer initiation:
    // 1. If local user is instructor/staff, ALWAYS initiate offer to any peer
    // 2. For student-to-student or fallback, peer with higher userId initiates
    const shouldInitiateOffer = isLocalInstructor || this.config.userId > userId;

    console.log(
      `[LIVE_DEBUG] handlePeerJoined: peer=${userId} name=${name} role=${resolvedRole} isLocalInstructor=${isLocalInstructor} shouldInitiateOffer=${shouldInitiateOffer}`
    );

    if (shouldInitiateOffer) {
      const existingPc = this.peerConnections.get(userId);
      if (!existingPc || existingPc.signalingState === 'stable' || existingPc.connectionState === 'disconnected' || existingPc.connectionState === 'failed') {
        console.log(`[LIVE_DEBUG] Proactively initiating offer to ${userId}`);
        this.initiateOffer(userId);
      }
    } else {
      // Student waiting for instructor's offer:
      // If peer is an instructor and after 1.5s no offer has been received, initiate offer as student fallback
      const isPeerInstructor =
        resolvedRole === 'instructor' ||
        resolvedRole === 'mentor' ||
        (resolvedRole as string) === 'admin' ||
        (this.config.instructorId && userId === this.config.instructorId);

      if (isPeerInstructor) {
        setTimeout(() => {
          const pc = this.peerConnections.get(userId);
          if (
            !pc ||
            pc.connectionState === 'new' ||
            pc.connectionState === 'disconnected' ||
            (pc.signalingState === 'stable' && !pc.remoteDescription)
          ) {
            console.log(`[LIVE_DEBUG] Student fallback: Proactively requesting media from instructor=${userId}`);
            this.initiateOffer(userId);
          }
        }, 1500);
      }
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;
    this.cleanupSocketListeners();

    const addListener = (event: string, handler: (...args: any[]) => void) => {
      this.socket!.on(event, handler);
      this.registeredSocketListeners.push({ event, handler });
    };

    // A new peer joined the live class
    addListener('user_joined', (data: { userId: string; name: string; role: MediaRole }) => {
      console.log(`[LIVE_DEBUG] user_joined event:`, data);
      this.handlePeerJoined(data.userId, data.name, data.role);
    });

    // Legacy alias
    addListener('student:joined', (data: { userId: string; name: string; role: MediaRole }) => {
      console.log(`[LIVE_DEBUG] student:joined event:`, data);
      this.handlePeerJoined(data.userId, data.name, data.role);
    });

    // Participant left the classroom
    addListener('user_left', (data: { userId: string }) => {
      console.log(`[LIVE_DEBUG] user_left event:`, data?.userId);
      this.handleUserLeft(data.userId);
    });

    addListener('student:left', (data: { userId: string }) => {
      console.log(`[LIVE_DEBUG] student:left event:`, data?.userId);
      this.handleUserLeft(data.userId);
    });

    // Participants roster update
    addListener('participants_update', (data: { users: Array<{ userId: string; name: string; role: MediaRole }> }) => {
      console.log(`[LIVE_DEBUG] participants_update event:`, data?.users?.length);
      if (data?.users && Array.isArray(data.users)) {
        this.handleRosterSync(data.users);
      }
    });

    // Authoritative room presence & join snapshot events
    addListener('liveClass:joined', (data: any) => {
      console.log('[LIVE_DEBUG] liveClass:joined snapshot:', data?.participants?.length);
      if (data?.participants && Array.isArray(data.participants)) {
        this.handleRosterSync(data.participants);
      }
    });

    addListener('liveClass:presence', (data: any) => {
      console.log('[LIVE_DEBUG] liveClass:presence event:', data?.participants?.length);
      if (data?.participants && Array.isArray(data.participants)) {
        this.handleRosterSync(data.participants);
      }
    });

    addListener('liveClass:instructor_joined', (data: any) => {
      console.log('[LIVE_DEBUG] liveClass:instructor_joined event:', data?.instructorId, data?.name);
      if (data?.instructorId) {
        this.handlePeerJoined(data.instructorId, data.name || 'Lead Instructor', 'instructor');
      }
    });

    addListener('instructor:connected', (data: any) => {
      console.log('[LIVE_DEBUG] instructor:connected event:', data?.instructorId, data?.name);
      if (data?.instructorId) {
        this.handlePeerJoined(data.instructorId, data.name || 'Lead Instructor', 'instructor');
      }
    });

    // WebRTC Signaling Messages
    addListener('webrtc_offer', async (data: { senderUserId: string; offer: RTCSessionDescriptionInit }) => {
      if (data.senderUserId && data.offer) {
        await this.handleReceiveOffer(data.senderUserId, data.offer);
      }
    });

    addListener('webrtc_answer', async (data: { senderUserId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.senderUserId && data.answer) {
        await this.handleReceiveAnswer(data.senderUserId, data.answer);
      }
    });

    addListener('webrtc_ice_candidate', async (data: { senderUserId: string; candidate: RTCIceCandidateInit }) => {
      if (data.senderUserId && data.candidate) {
        await this.handleReceiveIceCandidate(data.senderUserId, data.candidate);
      }
    });

    // Remote Track State Changes
    addListener('webrtc_track_change', (data: { userId: string; isAudioOn: boolean; isVideoOn: boolean; isScreenSharing: boolean }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isAudioOn = data.isAudioOn;
        p.isVideoOn = data.isVideoOn;
        p.isScreenSharing = data.isScreenSharing;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    // Active Speaker Events
    addListener('liveClass:speaker:changed', (data: { userId: string; name?: string; role?: string; audioLevel?: number } | null) => {
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

    addListener('liveClass:speaker:started', (data: { userId: string; audioLevel?: number }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isSpeaking = true;
        p.audioLevel = data.audioLevel ?? 0.8;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    addListener('liveClass:speaker:stopped', (data: { userId: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isSpeaking = false;
        p.audioLevel = 0;
        this.emit('participantsUpdate', this.getParticipants());
      }
    });

    // Screen Share Events
    addListener('liveClass:screenShare:started', (data: { userId: string; name: string }) => {
      this.participants.forEach((p, uid) => {
        p.isScreenSharing = uid === data.userId;
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('screenShareStateChange', { isSharing: true, sharerUserId: data.userId, sharerName: data.name });
    });

    addListener('screen_share_started', (data: { userId: string; name: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isScreenSharing = true;
        this.emit('participantsUpdate', this.getParticipants());
        this.emit('screenShareStateChange', { isSharing: true, sharerUserId: data.userId, sharerName: data.name });
      }
    });

    addListener('liveClass:screenShare:stopped', () => {
      this.participants.forEach((p) => {
        p.isScreenSharing = false;
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('screenShareStateChange', { isSharing: false });
    });

    addListener('screen_share_stopped', (data: { userId: string }) => {
      const p = this.participants.get(data.userId);
      if (p) {
        p.isScreenSharing = false;
        this.emit('participantsUpdate', this.getParticipants());
        this.emit('screenShareStateChange', { isSharing: false });
      }
    });

    // Pinning Events
    addListener('liveClass:pin:updated', (data: { pinnedUserId: string | null }) => {
      this.pinnedUserId = data.pinnedUserId;
      this.participants.forEach((p, uid) => {
        p.isPinned = Boolean(data.pinnedUserId && uid === data.pinnedUserId);
      });
      this.emit('participantsUpdate', this.getParticipants());
      this.emit('pinChange', data.pinnedUserId);
    });

    // Moderation: Mute All Students
    addListener('liveClass:moderation:muteAll', () => {
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

    addListener('mute_all_students', () => {
      if (this.config.role === 'student') {
        this.isMutedByInstructor = true;
        if (this.isAudioEnabled) {
          this.toggleMicrophone().catch(() => {});
        }
        this.emit('instructorMuteStateChange', true);
      }
    });

    // Moderation: Individual Mute
    addListener('liveClass:moderation:muted', (data: { userId: string; mutedBy?: string }) => {
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

    addListener('student_muted', (data: { userId: string; isMuted: boolean }) => {
      if (data.userId === this.config.userId) {
        this.isMutedByInstructor = data.isMuted;
        if (data.isMuted && this.isAudioEnabled) {
          this.toggleMicrophone().catch(() => {});
        }
        this.emit('instructorMuteStateChange', data.isMuted);
      }
    });

    // Moderation: Allow Mic
    addListener('liveClass:moderation:micAllowed', (data: { userId: string }) => {
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
    addListener('liveClass:moderation:requestUnmute', (data: { classId: string; instructorName?: string }) => {
      this.isMutedByInstructor = false;
      this.emit('moderationRequestUnmute', data);
    });

    // Presence & Reconnect State Synchronization
    addListener('liveClass:presence', (data: any) => {
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

    addListener('liveClass:reconnect:synced', (data: any) => {
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
    addListener('kicked', () => {
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
      console.log(
        `[LIVE_DEBUG][PC_COUNT] localUserId=${this.config.userId} remoteUserId=${userId} activePeerConnectionCount=${this.peerConnections.size}`
      );
    }
    this.pendingCandidates.delete(userId);
    this.makingOffer.delete(userId);
    this.emit('participantsUpdate', this.getParticipants());
  }
}

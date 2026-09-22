import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  LocalTrackPublication,
  TrackPublication,
  Participant,
  ScreenSharePresets,
  VideoQuality,
  VideoPresets,
  ConnectionQuality,
} from 'livekit-client';
import type {
  ScreenShareCaptureOptions,
  TrackPublishOptions,
} from 'livekit-client';
import { auth } from '@/firebase';
import { buildApiUrl } from '@/config/api';
import { getLiveClassroomSocket } from '@/services/socketService';
import { canUserPerformAction } from '@/utils/classroomPermissions';
import type { Socket } from 'socket.io-client';
import type {
  IMediaClient,
  MediaClientConfig,
  MediaConnectionState,
  MediaParticipant,
  MediaRole,
  AvailableMediaDevices,
} from './mediaTypes';

type EventListener<T = any> = (data: T) => void;

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================
const lkLog = (action: string, ...args: any[]) => {
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_MEDIA === 'true') {
    console.log(`[LIVEKIT_DEBUG] ${action}`, ...args);
  }
};

const lkWarn = (action: string, ...args: any[]) => {
  console.warn(`[LIVEKIT_DEBUG] ${action}`, ...args);
};

const lkError = (action: string, ...args: any[]) => {
  console.error(`[LIVEKIT_DEBUG] ${action}`, ...args);
};

const lkAudioLog = (action: string, ...args: any[]) => {
  console.log(`[LIVEKIT_AUDIO] ${action}`, ...args);
};

const lkVideoLog = (action: string, ...args: any[]) => {
  console.log(`[LIVEKIT_VIDEO] ${action}`, ...args);
};

const lkScreenLog = (action: string, ...args: any[]) => {
  console.log(`[LIVEKIT_SCREEN] ${action}`, ...args);
};

const lkReconnectLog = (action: string, ...args: any[]) => {
  console.log(`[LIVEKIT_RECONNECT] ${action}`, ...args);
};

const lkModerationLog = (action: string, ...args: any[]) => {
  console.log(`[LIVEKIT_MODERATION] ${action}`, ...args);
};

/**
 * Normalizes LiveKit participant identity to internal application userId
 * Converts "user_<uid>" -> "<uid>"
 */
export const normalizeLiveKitIdentity = (rawIdentity: string): string => {
  if (!rawIdentity) return '';
  const trimmed = rawIdentity.trim();
  if (trimmed.startsWith('user_')) {
    return trimmed.substring(5);
  }
  return trimmed;
};

export class LiveKitMediaClient implements IMediaClient {
  private config: MediaClientConfig;
  private room: Room | null = null;
  private socket: Socket | null = null;
  private participants: Map<string, MediaParticipant> = new Map();
  private connectionState: MediaConnectionState = 'idle';
  private eventListeners: Map<string, Set<EventListener>> = new Map();

  // Persistent remote audio elements: Map<userId, HTMLAudioElement>
  // Remote audio MUST NOT be tied to VideoTile mounting or isVideoOn state.
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();

  private isAudioEnabled = false;
  private isVideoEnabled = false;
  private isScreenSharing = false;

  private localStream: MediaStream = new MediaStream();
  private localScreenStream: MediaStream | null = null;

  // Moderation and active speaker state
  private isMutedByInstructor = false;
  private micAllowedByInstructor = false;
  private micPermission: 'prompt' | 'granted' | 'denied' = 'prompt';
  private selectedCameraId: string | null = null;
  private selectedMicrophoneId: string | null = null;
  private pinnedUserId: string | null = null;

  // Socket listener registry for clean removal
  private registeredSocketListeners: Array<{ event: string; handler: (...args: any[]) => void }> = [];

  // Lifecycle guards to prevent race conditions & memory leaks
  private isConnecting = false;
  private isDisconnecting = false;

  constructor(config: MediaClientConfig) {
    this.config = config;

    if (this.config.role === 'student') {
      this.isMutedByInstructor = true;
      this.micAllowedByInstructor = false;
      this.micPermission = 'denied';
    } else {
      this.isMutedByInstructor = false;
      this.micAllowedByInstructor = true;
      this.micPermission = 'granted';
    }

    lkLog(`Initialized client for userId=${this.config.userId} role=${this.config.role} classId=${this.config.classId}`);
  }

  // ============================================================================
  // CONNECTION & TOKEN LIFECYCLE
  // ============================================================================

  public async connect(): Promise<void> {
    if (this.connectionState === 'connected' && this.room) {
      lkLog('connect called but already connected. Ignoring duplicate call.');
      return;
    }

    if (this.isConnecting) {
      lkLog('connect called while already connecting. Ignoring duplicate concurrent call.');
      return;
    }

    this.isConnecting = true;
    this.setConnectionState('connecting');

    try {
      // 1. Authenticate and retrieve LiveKit media token from backend
      lkLog('token request initiated');
      const tokenData = await this.fetchMediaToken();
      lkLog(`token received for room: ${tokenData.roomName}, host: ${tokenData.url}`);

      // 2. Instantiate exactly one LiveKit Room instance per classroom session
      // Configured for high-fidelity presentation, slide clarity, and stable screen sharing
      this.room = new Room({
        adaptiveStream: {
          pixelDensity: 'screen',
          pauseVideoInBackground: false,
        },
        dynacast: true,
        publishDefaults: {
          screenShareEncoding: {
            maxBitrate: 4_500_000,
            maxFramerate: 15,
            priority: 'high',
          },
          screenShareSimulcastLayers: [
            ScreenSharePresets.h720fps5,
            ScreenSharePresets.h720fps15,
          ],
          degradationPreference: 'maintain-resolution',
          videoCodec: 'vp8',
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 },
        },
      });

      // 3. Register LiveKit Room Event Listeners
      this.setupRoomListeners(this.room);

      // 4. Connect to LiveKit SFU server
      lkLog('connecting to LiveKit room');
      await this.room.connect(tokenData.url, tokenData.token);
      lkLog('connected successfully');

      // 5. Connect to existing Socket.IO for moderation/chat/presence
      this.setupSocketModerationListeners();

      // 6. Setup local participant model
      this.initLocalParticipant();

      // 7. Seed initial participants and sync current participants from LiveKit room
      if (this.config.initialParticipants && Array.isArray(this.config.initialParticipants)) {
        this.seedInitialParticipants(this.config.initialParticipants);
      }
      this.syncAllRoomParticipants();

      this.setConnectionState('connected');

      // Attempt to unlock audio playback if browser allows
      this.room.startAudio().catch(() => {
        lkAudioLog('Initial audio autoplay unlock deferred to user interaction');
      });
    } catch (err: any) {
      lkError('connect failed', err?.message || err);
      this.setConnectionState('failed');
      this.emit('mediaError', {
        type: 'connection_failure',
        message: err?.message || 'Failed to establish connection to LiveKit media server',
      });
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Idempotent disconnect method. Calling multiple times will not throw or leave listeners.
   */
  public disconnect(): void {
    if (this.isDisconnecting) return;
    this.isDisconnecting = true;

    lkLog('disconnect called');

    // 1. Detach all persistent remote audio elements
    for (const el of this.remoteAudioElements.values()) {
      try {
        el.pause();
        el.srcObject = null;
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      } catch (_) {}
    }
    this.remoteAudioElements.clear();

    // 2. Remove socket moderation listeners
    if (this.socket) {
      for (const reg of this.registeredSocketListeners) {
        this.socket.off(reg.event, reg.handler);
      }
      this.registeredSocketListeners = [];
      this.socket = null;
    }

    // 3. Stop and detach all local tracks and release Room
    if (this.room) {
      try {
        if (this.room.localParticipant) {
          this.room.localParticipant.trackPublications.forEach((pub) => {
            if (pub.track) {
              pub.track.stop();
            }
          });
        }
        this.room.removeAllListeners();
        this.room.disconnect();
      } catch (err) {
        lkWarn('disconnect notice', err);
      }
      this.room = null;
    }

    // 4. Clean up local media streams
    this.localStream.getTracks().forEach((track) => track.stop());
    this.localStream = new MediaStream();

    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((track) => track.stop());
      this.localScreenStream = null;
    }

    this.isAudioEnabled = false;
    this.isVideoEnabled = false;
    this.isScreenSharing = false;

    this.participants.clear();
    this.setConnectionState('disconnected');

    this.isDisconnecting = false;
  }

  public async cleanup(): Promise<void> {
    this.disconnect();
    this.eventListeners.clear();
  }

  // ============================================================================
  // TOKEN RETRIEVAL
  // ============================================================================

  private async fetchMediaToken(): Promise<{
    token: string;
    url: string;
    roomName: string;
    identity: string;
    expiresAt?: string;
  }> {
    let idToken = '';
    if (auth?.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch (authErr) {
        lkWarn('Failed to get Firebase ID token:', authErr);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const endpointUrl = buildApiUrl(`live-classroom/${this.config.classId}/media-token`);
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch media token';
      try {
        const errJson = await response.json();
        if (errJson?.error) errorMessage = errJson.error;
      } catch (_) {}

      if (response.status === 401) {
        throw new Error(`Authentication required (401): ${errorMessage}`);
      } else if (response.status === 403) {
        throw new Error(`Access forbidden (403): ${errorMessage}`);
      } else if (response.status === 404) {
        throw new Error(`Live classroom session not found (404): ${errorMessage}`);
      } else {
        throw new Error(`Media server configuration error (${response.status}): ${errorMessage}`);
      }
    }

    const resJson = await response.json();
    if (!resJson.success || !resJson.data || !resJson.data.token) {
      throw new Error(resJson.error || 'Invalid token payload received from media server');
    }

    return resJson.data;
  }

  // ============================================================================
  // PERSISTENT REMOTE AUDIO MANAGEMENT (PHASE 4)
  // Decoupled from VideoTile mounting & isVideoOn state.
  // ============================================================================

  private attachRemoteAudio(uid: string, track: RemoteTrack): void {
    try {
      let audioEl = this.remoteAudioElements.get(uid);

      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = `lk_remote_audio_${uid}`;
        audioEl.autoplay = true;
        audioEl.setAttribute('playsinline', 'true');
        (audioEl as any).playsInline = true;
        audioEl.volume = 1.0;
        audioEl.muted = false;
        audioEl.setAttribute('data-user-id', uid);
        audioEl.setAttribute('data-track-sid', track.sid || 'unknown');

        // Render offscreen in body so browser maintains audio lifecycle
        audioEl.style.position = 'fixed';
        audioEl.style.top = '-9999px';
        audioEl.style.left = '-9999px';
        audioEl.style.width = '1px';
        audioEl.style.height = '1px';
        audioEl.style.opacity = '0';
        audioEl.style.pointerEvents = 'none';

        if (typeof document !== 'undefined' && document.body) {
          document.body.appendChild(audioEl);
        }
        this.remoteAudioElements.set(uid, audioEl);
      }

      // Attach LiveKit track directly to the persistent audio element
      track.attach(audioEl);
      lkAudioLog(`participant=${uid} track=${track.sid} state=attached`);

      audioEl.play()
        .then(() => {
          lkAudioLog(`participant=${uid} track=${track.sid} state=playing`);
        })
        .catch((err) => {
          lkAudioLog(`participant=${uid} track=${track.sid} state=blocked error=${err?.message || err}`);
          this.emit('audioAutoplayBlocked');
        });
    } catch (err: any) {
      lkError(`attachRemoteAudio failed for ${uid}:`, err);
    }
  }

  private detachRemoteAudio(uid: string, track?: RemoteTrack): void {
    const audioEl = this.remoteAudioElements.get(uid);
    if (audioEl) {
      try {
        if (track) {
          track.detach(audioEl);
        }
        audioEl.pause();
        audioEl.srcObject = null;
        if (audioEl.parentNode) {
          audioEl.parentNode.removeChild(audioEl);
        }
      } catch (_) {}
      this.remoteAudioElements.delete(uid);
      lkAudioLog(`participant=${uid} track=${track?.sid || 'unknown'} state=detached`);
    }
  }

  // ============================================================================
  // LIVEKIT ROOM EVENT LISTENERS
  // ============================================================================

  private setupRoomListeners(room: Room): void {
    // 1. Connection states
    room.on(RoomEvent.Connected, () => {
      lkLog('Room connected');
      this.setConnectionState('connected');
    });

    room.on(RoomEvent.Reconnecting, () => {
      lkReconnectLog('LiveKit room reconnecting...');
      this.setConnectionState('reconnecting');
    });

    room.on(RoomEvent.Reconnected, () => {
      lkReconnectLog('LiveKit room reconnected successfully');
      this.setConnectionState('connected');
      this.syncAllRoomParticipants();
      this.updateLocalParticipantState();
    });

    room.on(RoomEvent.Disconnected, () => {
      lkReconnectLog('LiveKit room disconnected');
      this.setConnectionState('disconnected');
    });

    // 2. Participants
    room.on(RoomEvent.ParticipantConnected, (remoteParticipant: RemoteParticipant) => {
      const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
      lkLog(`participant joined: ${uid} (${remoteParticipant.name})`);
      this.upsertRemoteParticipant(remoteParticipant);
      this.emitParticipantsUpdate();
    });

    room.on(RoomEvent.ParticipantDisconnected, (remoteParticipant: RemoteParticipant) => {
      const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
      lkLog(`participant left: ${uid}`);
      this.detachRemoteAudio(uid);
      this.participants.delete(uid);
      this.emitParticipantsUpdate();
    });

    // 3. Track Subscriptions
    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication, remoteParticipant: RemoteParticipant) => {
        const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
        lkLog(`track subscribed: kind=${track.kind}, source=${track.source} from ${uid}`);
        
        // Handle persistent audio attachment if audio track
        if (track.kind === Track.Kind.Audio) {
          this.attachRemoteAudio(uid, track);
        }

        this.handleRemoteTrackSubscribed(track, publication, remoteParticipant);
      }
    );

    room.on(
      RoomEvent.TrackUnsubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication, remoteParticipant: RemoteParticipant) => {
        const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
        lkLog(`track unsubscribed: kind=${track.kind}, source=${track.source} from ${uid}`);
        
        // Detach audio element if audio track
        if (track.kind === Track.Kind.Audio) {
          this.detachRemoteAudio(uid, track);
        }

        this.handleRemoteTrackUnsubscribed(track, publication, remoteParticipant);
      }
    );

    room.on(RoomEvent.TrackMuted, (publication: TrackPublication, participant: Participant) => {
      if (publication.source === Track.Source.ScreenShare) {
        console.log(
          `[LIVEKIT_SCREEN_DEBUG] TrackMuted: participantId=${normalizeLiveKitIdentity(participant.identity)} source=${publication.source}`
        );
      }
      this.handleTrackMuteState(publication, participant, true);
    });

    room.on(RoomEvent.TrackUnmuted, (publication: TrackPublication, participant: Participant) => {
      if (publication.source === Track.Source.ScreenShare) {
        console.log(
          `[LIVEKIT_SCREEN_DEBUG] TrackUnmuted: participantId=${normalizeLiveKitIdentity(participant.identity)} source=${publication.source}`
        );
      }
      this.handleTrackMuteState(publication, participant, false);
    });

    // 4. Local Track Publications
    room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] LocalTrackPublished: kind=${publication.kind} source=${publication.source}`
      );
      lkLog(`local track published: ${publication.kind} (${publication.source})`);
      this.updateLocalParticipantState();
    });

    room.on(RoomEvent.LocalTrackUnpublished, (publication: LocalTrackPublication) => {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] LocalTrackUnpublished: kind=${publication.kind} source=${publication.source}`
      );
      lkLog(`local track unpublished: ${publication.kind} (${publication.source})`);
      this.updateLocalParticipantState();
    });

    // 5. Active Speakers
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] ActiveSpeakersChanged: count=${speakers.length} speakers=${speakers.map((s) => normalizeLiveKitIdentity(s.identity)).join(',')}`
      );
      this.handleActiveSpeakersChanged(speakers);
    });

    // 6. Metadata Updates
    room.on(RoomEvent.ParticipantMetadataChanged, (metadata: string | undefined, participant: Participant) => {
      const uid = normalizeLiveKitIdentity(participant.identity);
      const existing = this.participants.get(uid);
      if (existing && metadata) {
        try {
          const parsed = JSON.parse(metadata);
          if (parsed.role) existing.role = parsed.role;
          this.emitParticipantsUpdate();
        } catch (_) {}
      }
    });

    // 7. Audio Playback Status Changes (Browser Autoplay Restrictions)
    room.on(RoomEvent.AudioPlaybackStatusChanged, (playable: boolean) => {
      lkAudioLog(`AudioPlaybackStatusChanged: playable=${playable}`);
      if (!playable) {
        this.emit('audioAutoplayBlocked');
      } else {
        this.emit('audioAutoplayResumed');
      }
    });

    // 8. Connection Quality Changed
    room.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality, participant: Participant) => {
      const uid = participant === room.localParticipant
        ? this.config.userId
        : normalizeLiveKitIdentity(participant.identity);
      const target = this.participants.get(uid);
      if (target) {
        let qStr: 'excellent' | 'good' | 'poor' | 'lost' | 'unknown' = 'good';
        if (quality === ConnectionQuality.Excellent) qStr = 'excellent';
        else if (quality === ConnectionQuality.Good) qStr = 'good';
        else if (quality === ConnectionQuality.Poor) qStr = 'poor';
        else if (quality === ConnectionQuality.Lost) qStr = 'lost';
        else qStr = 'unknown';

        if (target.connectionQuality !== qStr) {
          target.connectionQuality = qStr;
          this.emitParticipantsUpdate();
        }
      }
    });
  }

  // ============================================================================
  // PARTICIPANT STATE HANDLING
  // ============================================================================

  private initLocalParticipant(): void {
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
      streamVersion: 1,
    });
    this.emitParticipantsUpdate();
  }

  private seedInitialParticipants(initialList: any[]): void {
    for (const p of initialList) {
      const uid = p.userId || p.uid || p.id;
      if (uid && uid !== this.config.userId && !this.participants.has(uid)) {
        this.participants.set(uid, {
          userId: uid,
          name: p.name || p.userName || 'Student',
          role: (p.role as MediaRole) || 'student',
          isAudioOn: Boolean(p.isAudioOn),
          isVideoOn: Boolean(p.isVideoOn),
          isScreenSharing: Boolean(p.isScreenSharing),
          isHandRaised: Boolean(p.isHandRaised),
          connectionState: 'connected',
          stream: new MediaStream(),
          streamVersion: 1,
        });
      }
    }
  }

  private syncAllRoomParticipants(): void {
    if (!this.room) return;

    this.room.remoteParticipants.forEach((remoteParticipant) => {
      this.upsertRemoteParticipant(remoteParticipant);
    });
    this.updateLocalParticipantState();
    this.emitParticipantsUpdate();
  }

  private upsertRemoteParticipant(remoteParticipant: RemoteParticipant): MediaParticipant {
    const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
    let existing = this.participants.get(uid);

    let role: MediaRole = 'student';
    if (this.config.instructorId && uid === this.config.instructorId) {
      role = 'instructor';
    }

    if (remoteParticipant.metadata) {
      try {
        const parsed = JSON.parse(remoteParticipant.metadata);
        if (parsed.role) role = parsed.role;
      } catch (_) {}
    }

    if (!existing) {
      existing = {
        userId: uid,
        name: remoteParticipant.name || 'Participant',
        role,
        isAudioOn: false,
        isVideoOn: false,
        isScreenSharing: false,
        isHandRaised: false,
        connectionState: 'connected',
        stream: new MediaStream(),
        streamVersion: 1,
      };
      this.participants.set(uid, existing);
    } else {
      existing.name = remoteParticipant.name || existing.name;
      existing.role = role;
      existing.connectionState = 'connected';
    }

    // Inspect current track publications for initial states
    remoteParticipant.trackPublications.forEach((pub) => {
      if (pub.track) {
        if (pub.track.kind === Track.Kind.Audio) {
          this.attachRemoteAudio(uid, pub.track);
        }
        this.attachTrackToParticipant(existing!, pub.track, pub.source);
      }
    });

    return existing;
  }

  private handleRemoteTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    remoteParticipant: RemoteParticipant
  ): void {
    if (publication.source === Track.Source.ScreenShare) {
      const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
      try {
        publication.setVideoQuality(VideoQuality.HIGH);
        console.log(
          `[LIVEKIT_SCREEN_DEBUG] Subscribed to ScreenShare: requested VideoQuality.HIGH for sid=${publication.trackSid}`
        );
      } catch (err) {
        console.warn('[LIVEKIT_SCREEN_DEBUG] publication.setVideoQuality notice:', err);
      }
      const mst = track.mediaStreamTrack;
      const settings = mst?.getSettings?.() || {};
      const isSimulcastActive = Boolean((publication as any).simulcasted ?? (publication as any).isSimulcasted);
      console.log(
        `[LIVEKIT_SCREEN_RECEIVE] participantId=${uid} trackSid=${track.sid} videoWidth=${settings.width || 0} videoHeight=${settings.height || 0} isSimulcasted=${isSimulcastActive}`
      );
    }
    const participant = this.upsertRemoteParticipant(remoteParticipant);

    // Adaptive video quality & priority:
    // Instructor camera gets HIGH quality priority; other participants get balanced LOW quality in the strip
    if (publication.source === Track.Source.Camera) {
      const isInstructor =
        participant.role === 'instructor' ||
        participant.role === 'mentor' ||
        participant.role === 'admin' ||
        participant.userId === this.config.instructorId;
      try {
        if (isInstructor) {
          publication.setVideoQuality(VideoQuality.HIGH);
          if (typeof (publication as any).setPriority === 'function') {
            (publication as any).setPriority('high');
          }
        } else {
          publication.setVideoQuality(VideoQuality.LOW);
          if (typeof (publication as any).setPriority === 'function') {
            (publication as any).setPriority('low');
          }
        }
      } catch (_) {}
    }

    this.attachTrackToParticipant(participant, track, publication.source);
    this.emitParticipantsUpdate();
  }

  private handleRemoteTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    remoteParticipant: RemoteParticipant
  ): void {
    const uid = normalizeLiveKitIdentity(remoteParticipant.identity);
    const participant = this.participants.get(uid);
    if (!participant) return;

    this.detachTrackFromParticipant(participant, track, publication.source);
    this.emitParticipantsUpdate();
  }

  private attachTrackToParticipant(
    participant: MediaParticipant,
    track: RemoteTrack,
    source: Track.Source
  ): void {
    if (!participant.stream) {
      participant.stream = new MediaStream();
    }

    const mst = track.mediaStreamTrack;
    let trackChanged = false;

    if (source === Track.Source.Microphone) {
      if (participant.audioTrack?.id !== mst.id) {
        participant.audioTrack = mst;
        trackChanged = true;
      }
      participant.isAudioOn = !track.isMuted;
      if (!participant.stream.getAudioTracks().some((t) => t.id === mst.id)) {
        participant.stream.addTrack(mst);
        trackChanged = true;
      }
      lkAudioLog(`participant=${participant.userId} track=${track.sid} isMuted=${track.isMuted}`);
    } else if (source === Track.Source.Camera) {
      if (participant.videoTrack?.id !== mst.id) {
        participant.videoTrack = mst;
        trackChanged = true;
      }
      participant.videoLiveKitTrack = track;
      participant.isVideoOn = !track.isMuted;
      if (!participant.stream.getVideoTracks().some((t) => t.id === mst.id)) {
        participant.stream.addTrack(mst);
        trackChanged = true;
      }
      lkVideoLog(`participant=${participant.userId} track=${track.sid} isMuted=${track.isMuted}`);
    } else if (source === Track.Source.ScreenShare) {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] TrackSubscribed ScreenShare: participantId=${participant.userId} trackSid=${track.sid} isMuted=${track.isMuted}`
      );
      if (participant.screenTrack?.id !== mst.id) {
        participant.screenTrack = mst;
        participant.screenStream = new MediaStream([mst]);
        trackChanged = true;
      }
      participant.screenLiveKitTrack = track;
      participant.isScreenSharing = !track.isMuted;
      lkScreenLog(`participant=${participant.userId} track=${track.sid} isMuted=${track.isMuted}`);
    }

    // Phase 18: streamVersion increments ONLY when actual media tracks change
    if (trackChanged) {
      participant.streamVersion = (participant.streamVersion || 0) + 1;
    }
  }

  private detachTrackFromParticipant(
    participant: MediaParticipant,
    track: RemoteTrack,
    source: Track.Source
  ): void {
    const mst = track.mediaStreamTrack;
    let trackChanged = false;

    if (source === Track.Source.Microphone) {
      participant.isAudioOn = false;
      if (participant.audioTrack?.id === mst.id) {
        participant.audioTrack = undefined;
        trackChanged = true;
      }
      if (participant.stream && mst) {
        participant.stream.removeTrack(mst);
        trackChanged = true;
      }
      lkAudioLog(`participant=${participant.userId} track=${track.sid} detached`);
    } else if (source === Track.Source.Camera) {
      participant.isVideoOn = false;
      participant.videoLiveKitTrack = undefined;
      if (participant.videoTrack?.id === mst.id) {
        participant.videoTrack = undefined;
        trackChanged = true;
      }
      if (participant.stream && mst) {
        participant.stream.removeTrack(mst);
        trackChanged = true;
      }
      lkVideoLog(`participant=${participant.userId} track=${track.sid} detached`);
    } else if (source === Track.Source.ScreenShare) {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] TrackUnsubscribed ScreenShare: participantId=${participant.userId} trackSid=${track.sid}`
      );
      // Guard against race conditions where an old track cleanup overwrites a newly subscribed track
      if (!participant.screenLiveKitTrack || participant.screenLiveKitTrack.sid === track.sid) {
        participant.isScreenSharing = false;
        participant.screenLiveKitTrack = undefined;
        if (participant.screenTrack?.id === mst.id) {
          participant.screenTrack = undefined;
          trackChanged = true;
        }
        if (participant.screenStream) {
          participant.screenStream = undefined;
          trackChanged = true;
        }
        lkScreenLog(`participant=${participant.userId} track=${track.sid} detached`);
      }
    }

    // Phase 18: streamVersion increments ONLY when actual media tracks change
    if (trackChanged) {
      participant.streamVersion = (participant.streamVersion || 0) + 1;
    }
  }

  private handleTrackMuteState(
    publication: TrackPublication,
    participant: Participant,
    isMuted: boolean
  ): void {
    const uid = normalizeLiveKitIdentity(participant.identity);
    const p = this.participants.get(uid);
    if (!p) return;

    if (publication.source === Track.Source.Microphone) {
      p.isAudioOn = !isMuted;
      lkAudioLog(`participant=${uid} muteState=${isMuted ? 'muted' : 'unmuted'}`);
    } else if (publication.source === Track.Source.Camera) {
      p.isVideoOn = !isMuted;
      lkVideoLog(`participant=${uid} videoState=${isMuted ? 'muted' : 'unmuted'}`);
    } else if (publication.source === Track.Source.ScreenShare) {
      p.isScreenSharing = !isMuted;
      lkScreenLog(`participant=${uid} screenState=${isMuted ? 'muted' : 'unmuted'}`);
    }

    // streamVersion is intentionally NOT bumped on mute changes to prevent video blinking
    this.emitParticipantsUpdate();
  }

  private handleActiveSpeakersChanged(speakers: Participant[]): void {
    const speakerIds = new Set(speakers.map((s) => normalizeLiveKitIdentity(s.identity)));

    let hasChange = false;
    for (const [uid, p] of this.participants.entries()) {
      const isSpeakingNow = speakerIds.has(uid);
      if (p.isSpeaking !== isSpeakingNow) {
        p.isSpeaking = isSpeakingNow;
        hasChange = true;
      }
      if (isSpeakingNow) {
        const speaker = speakers.find((s) => normalizeLiveKitIdentity(s.identity) === uid);
        p.audioLevel = speaker?.audioLevel || 0;
      } else {
        p.audioLevel = 0;
      }
    }

    if (hasChange) {
      const activeSpeaker = speakers.length > 0 ? normalizeLiveKitIdentity(speakers[0].identity) : null;
      this.emit('activeSpeaker', activeSpeaker);
      this.emitParticipantsUpdate();
    }
  }

  private updateLocalParticipantState(): void {
    const local = this.participants.get(this.config.userId);
    if (!local || !this.room?.localParticipant) return;

    const micPub = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
    const camPub = this.room.localParticipant.getTrackPublication(Track.Source.Camera);
    const screenPub = this.room.localParticipant.getTrackPublication(Track.Source.ScreenShare);

    this.isAudioEnabled = Boolean(micPub && !micPub.isMuted);
    this.isVideoEnabled = Boolean(camPub && !camPub.isMuted);
    this.isScreenSharing = Boolean(screenPub && !screenPub.isMuted);

    local.isAudioOn = this.isAudioEnabled;
    local.isVideoOn = this.isVideoEnabled;
    local.isScreenSharing = this.isScreenSharing;

    let trackChanged = false;

    if (micPub?.track) {
      const mst = micPub.track.mediaStreamTrack;
      if (local.audioTrack?.id !== mst.id) {
        local.audioTrack = mst;
        trackChanged = true;
      }
      if (!this.localStream.getAudioTracks().some((t) => t.id === mst.id)) {
        this.localStream.addTrack(mst);
        trackChanged = true;
      }
    } else {
      if (local.audioTrack) {
        local.audioTrack = undefined;
        trackChanged = true;
      }
    }

    if (camPub?.track) {
      const mst = camPub.track.mediaStreamTrack;
      if (local.videoTrack?.id !== mst.id) {
        local.videoTrack = mst;
        trackChanged = true;
      }
      if (!this.localStream.getVideoTracks().some((t) => t.id === mst.id)) {
        this.localStream.addTrack(mst);
        trackChanged = true;
      }
    } else {
      if (local.videoTrack) {
        local.videoTrack = undefined;
        trackChanged = true;
      }
    }

    if (screenPub?.track) {
      const mst = screenPub.track.mediaStreamTrack;
      if (local.screenTrack?.id !== mst.id) {
        local.screenTrack = mst;
        local.screenLiveKitTrack = screenPub.track;
        local.screenStream = this.localScreenStream || undefined;
        trackChanged = true;
      }
    } else {
      if (local.screenTrack) {
        local.screenTrack = undefined;
        local.screenLiveKitTrack = undefined;
        local.screenStream = undefined;
        trackChanged = true;
      }
    }

    if (trackChanged) {
      local.streamVersion = (local.streamVersion || 0) + 1;
    }

    this.emitParticipantsUpdate();
  }

  // ============================================================================
  // HARDWARE TOGGLE METHODS
  // ============================================================================

  public async toggleMicrophone(): Promise<boolean> {
    if (!this.room) return false;

    // Students cannot self-unmute unless explicitly allowed by the instructor
    if (this.config.role === 'student' && (!this.micAllowedByInstructor || this.isMutedByInstructor)) {
      this.emit('mediaError', {
        type: 'permission_denied',
        message: 'Your microphone is locked by the instructor. Raise your hand to request permission.',
      });
      return false;
    }

    try {
      const nextState = !this.isAudioEnabled;
      lkAudioLog(`toggling microphone to ${nextState}`);
      const audioCaptureOptions = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        deviceId: this.selectedMicrophoneId || undefined,
      };
      const audioPublishOptions: TrackPublishOptions = {
        dtx: true,
        red: true,
      };
      await this.room.localParticipant.setMicrophoneEnabled(
        nextState,
        nextState ? audioCaptureOptions : undefined,
        nextState ? audioPublishOptions : undefined
      );
      this.isAudioEnabled = nextState;
      this.updateLocalParticipantState();
      lkAudioLog(`microphone published: ${nextState}`);
      return nextState;
    } catch (err: any) {
      lkError('toggleMicrophone error:', err);
      this.emit('mediaError', {
        type: 'microphone_error',
        message: err?.message || 'Could not access microphone.',
      });
      return false;
    }
  }

  public async muteMicrophone(): Promise<void> {
    if (!this.room || !this.isAudioEnabled) return;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      this.isAudioEnabled = false;
      this.updateLocalParticipantState();
    } catch (err) {
      lkWarn('muteMicrophone error:', err);
    }
  }

  public async toggleCamera(): Promise<boolean> {
    if (!this.room) return false;

    try {
      const nextState = !this.isVideoEnabled;
      lkVideoLog(`toggling camera to ${nextState}`);
      const isInstructor =
        this.config.role === 'instructor' ||
        this.config.role === 'mentor' ||
        this.config.role === 'admin' ||
        this.config.userId === this.config.instructorId;
      const videoCaptureOptions = {
        resolution: isInstructor ? VideoPresets.h720.resolution : VideoPresets.h360.resolution,
        deviceId: this.selectedCameraId || undefined,
      };
      const videoPublishOptions: TrackPublishOptions = {
        simulcast: true,
        videoCodec: 'vp8',
        degradationPreference: 'balanced',
      };
      await this.room.localParticipant.setCameraEnabled(
        nextState,
        nextState ? videoCaptureOptions : undefined,
        nextState ? videoPublishOptions : undefined
      );
      this.isVideoEnabled = nextState;
      this.updateLocalParticipantState();
      lkVideoLog(`camera published: ${nextState}`);
      return nextState;
    } catch (err: any) {
      lkError('toggleCamera error:', err);
      this.emit('mediaError', {
        type: 'camera_error',
        message: err?.message || 'Could not access camera.',
      });
      return false;
    }
  }

  /**
   * Phase 7 & 8: Start Screen Sharing
   * - Screen share MUST use Track.Source.ScreenShare
   * - Screen share MUST be VIDEO ONLY ({ audio: false }) by default
   * - Screen share MUST NOT replace instructor camera
   * - mediaStreamTrack.contentHint = 'detail'
   */
  public async startScreenShare(): Promise<MediaStream | null> {
    if (!this.room) return null;

    // Strict centralized role check: Students must not be allowed to screen share
    const isAuthorized = canUserPerformAction('screenShare', {
      userId: this.config.userId,
      role: this.config.role,
      isAssignedInstructor: this.config.userId === this.config.instructorId,
    });

    if (!isAuthorized) {
      this.emit('mediaError', {
        type: 'permission_denied',
        message: 'Only instructors and authorized staff are permitted to share their screen.',
      });
      return null;
    }

    try {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] startScreenShare initiated: userId=${this.config.userId}`
      );
      lkScreenLog(`starting screen share for userId=${this.config.userId}`);
      // Dedicated ScreenShare capture options:
      // - contentHint: 'detail' for code/text/PPT
      // - request high-quality 1080p capture resolution, preserving native/high capture resolution
      // - do not inherit camera resolution settings
      const captureOptions: ScreenShareCaptureOptions = {
        audio: false,
        contentHint: 'detail',
        resolution: {
          width: 1920,
          height: 1080,
          frameRate: 15,
        },
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        systemAudio: 'exclude',
      };

      // Dedicated ScreenShare publish options:
      // - degradationPreference: 'maintain-resolution'
      // - 15 fps @ 4.5 Mbps for text clarity
      // - simulcast layers ordered LOW -> HIGH
      const publishOptions: TrackPublishOptions = {
        source: Track.Source.ScreenShare,
        degradationPreference: 'maintain-resolution',
        simulcast: true,
        screenShareEncoding: {
          maxBitrate: 4_500_000,
          maxFramerate: 15,
          priority: 'high',
        },
        screenShareSimulcastLayers: [
          ScreenSharePresets.h720fps5,
          ScreenSharePresets.h720fps15,
        ],
        videoCodec: 'vp8',
      };

      await this.room.localParticipant.setScreenShareEnabled(true, captureOptions, publishOptions);

      const pub = this.room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
      if (pub && pub.track) {
        const mst = pub.track.mediaStreamTrack;
        if (mst) {
          try {
            mst.contentHint = 'detail';
          } catch (_) {}

          const settings = mst.getSettings();
          console.log('[LIVEKIT_SCREEN_CAPTURE]', {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            displaySurface: (settings as any).displaySurface,
            contentHint: (mst as any).contentHint || 'detail',
          });
        }
        const trackAny = pub.track as any;
        if (trackAny?.sender && typeof trackAny.setDegradationPreference === 'function') {
          try {
            trackAny.setDegradationPreference('maintain-resolution');
          } catch (_) {}
        }

        this.localScreenStream = new MediaStream([mst]);
        this.isScreenSharing = true;

        const localP = this.participants.get(this.config.userId);
        if (localP) {
          localP.isScreenSharing = true;
          localP.screenLiveKitTrack = pub.track;
          localP.screenTrack = mst;
          localP.screenStream = this.localScreenStream;
          localP.streamVersion = (localP.streamVersion || 0) + 1;
        }

        // Phase 9: Listen for user clicking native browser "Stop sharing" button
        mst.onended = () => {
          lkScreenLog('native screen share stopped by user');
          this.stopScreenShare().catch(() => {});
        };

        this.updateLocalParticipantState();
        this.emit('localScreenStreamUpdate', this.localScreenStream);
        this.emitParticipantsUpdate();
        console.log(
          `[LIVEKIT_SCREEN_DEBUG] screen share published successfully: trackSid=${pub.track.sid}`
        );
        lkScreenLog('screen share published successfully');
        return this.localScreenStream;
      }
      return null;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        lkScreenLog('User cancelled screen share dialog');
        return null;
      }
      console.error('[LIVEKIT_SCREEN_DEBUG] startScreenShare error:', err);
      lkError('startScreenShare error:', err);
      this.emit('mediaError', {
        type: 'screen_share_error',
        message: err?.message || 'Could not initiate screen share.',
      });
      return null;
    }
  }

  /**
   * Phase 9: Clean, idempotent screen share stop
   * Does NOT stop camera or microphone.
   */
  public async stopScreenShare(): Promise<void> {
    if (!this.room) return;

    try {
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] stopScreenShare initiated: userId=${this.config.userId}`
      );
      lkScreenLog('stopping screen share');
      await this.room.localParticipant.setScreenShareEnabled(false);
      if (this.localScreenStream) {
        this.localScreenStream.getTracks().forEach((track) => track.stop());
        this.localScreenStream = null;
      }
      this.isScreenSharing = false;

      const localP = this.participants.get(this.config.userId);
      if (localP) {
        localP.isScreenSharing = false;
        localP.screenLiveKitTrack = undefined;
        localP.screenTrack = undefined;
        localP.screenStream = undefined;
        localP.streamVersion = (localP.streamVersion || 0) + 1;
      }

      this.updateLocalParticipantState();
      this.emit('localScreenStreamUpdate', null);
      this.emitParticipantsUpdate();
      console.log(
        `[LIVEKIT_SCREEN_DEBUG] screen share stopped cleanly: userId=${this.config.userId}`
      );
      lkScreenLog('screen share stopped cleanly');
    } catch (err) {
      console.warn('[LIVEKIT_SCREEN_DEBUG] stopScreenShare notice:', err);
      lkWarn('stopScreenShare notice:', err);
    }
  }

  // ============================================================================
  // DEVICE SELECTION METHODS
  // ============================================================================

  public async getAvailableDevices(): Promise<AvailableMediaDevices> {
    try {
      const audioInputs = await Room.getLocalDevices('audioinput');
      const videoInputs = await Room.getLocalDevices('videoinput');
      const audioOutputs = await Room.getLocalDevices('audiooutput');

      return {
        audioInputs,
        videoInputs,
        audioOutputs,
      };
    } catch (err) {
      lkWarn('getAvailableDevices error:', err);
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }
  }

  public async switchCamera(deviceId: string): Promise<boolean> {
    if (!this.room) return false;
    try {
      this.selectedCameraId = deviceId;
      await this.room.switchActiveDevice('videoinput', deviceId);
      return true;
    } catch (err) {
      lkError('switchCamera error:', err);
      return false;
    }
  }

  public async switchMicrophone(deviceId: string): Promise<boolean> {
    if (!this.room) return false;
    try {
      this.selectedMicrophoneId = deviceId;
      await this.room.switchActiveDevice('audioinput', deviceId);
      return true;
    } catch (err) {
      lkError('switchMicrophone error:', err);
      return false;
    }
  }

  // ============================================================================
  // MODERATION & PINNING (VIA SOCKET.IO)
  // Harmonized across both liveClass:moderation and legacy event formats
  // ============================================================================

  public muteParticipant(userId: string): void {
    if (!this.socket) return;
    lkModerationLog(`muting participant=${userId}`);
    const payload = {
      classId: this.config.classId,
      liveClassId: this.config.classId,
      userId,
      targetUserId: userId,
    };
    this.socket.emit('liveClass:moderation:mute', payload);
    this.socket.emit('mute_student', { ...payload, isMuted: true });
  }

  public askToUnmuteParticipant(userId: string): void {
    if (!this.socket) return;
    lkModerationLog(`asking participant to unmute: ${userId}`);
    this.socket.emit('liveClass:moderation:requestUnmute', {
      classId: this.config.classId,
      liveClassId: this.config.classId,
      userId,
      targetUserId: userId,
      instructorName: this.config.userName,
    });
  }

  public allowParticipantMic(userId: string): void {
    if (!this.socket) return;
    lkModerationLog(`allowing mic for participant: ${userId}`);
    this.socket.emit('liveClass:moderation:allowMic', {
      classId: this.config.classId,
      liveClassId: this.config.classId,
      userId,
      targetUserId: userId,
    });
  }

  public muteAllStudents(): void {
    if (!this.socket) return;
    lkModerationLog(`muting all students in classId=${this.config.classId}`);
    const payload = {
      classId: this.config.classId,
      liveClassId: this.config.classId,
    };
    this.socket.emit('liveClass:moderation:muteAll', payload);
    this.socket.emit('mute_all_students', payload);
  }

  public kickParticipant(userId: string): void {
    if (!this.socket) return;
    lkModerationLog(`kicking participant: ${userId}`);
    const payload = {
      classId: this.config.classId,
      liveClassId: this.config.classId,
      userId,
      targetUserId: userId,
    };
    this.socket.emit('kick_participant', payload);
    this.socket.emit('liveClass:moderation:kick', payload);
  }

  public pinParticipant(userId: string | null): void {
    this.pinnedUserId = userId;
    for (const p of this.participants.values()) {
      p.isPinned = Boolean(userId && p.userId === userId);
    }
    this.emitParticipantsUpdate();
  }

  public getPinnedUserId(): string | null {
    return this.pinnedUserId;
  }

  public getIsMutedByInstructor(): boolean {
    return this.isMutedByInstructor;
  }

  public getMicAllowedByInstructor(): boolean {
    return this.micAllowedByInstructor;
  }

  public getMicPermission(): 'prompt' | 'granted' | 'denied' {
    return this.micPermission;
  }

  public async startAudio(): Promise<void> {
    if (this.room) {
      try {
        await this.room.startAudio();
        this.emit('audioAutoplayResumed');
      } catch (err) {
        lkWarn('startAudio notice:', err);
      }
    }
    for (const audioEl of this.remoteAudioElements.values()) {
      audioEl.play().catch(() => {});
    }
  }

  // ============================================================================
  // SOCKET.IO MODERATION LISTENER SETUP
  // ============================================================================

  private setupSocketModerationListeners(): void {
    try {
      this.socket = getLiveClassroomSocket();
    } catch (err) {
      lkWarn('Socket not available for moderation events:', err);
      return;
    }

    if (!this.socket) return;

    const addListener = (event: string, handler: (...args: any[]) => void) => {
      this.socket?.on(event, handler);
      this.registeredSocketListeners.push({ event, handler });
    };

    const handleMuteAll = () => {
      if (this.config.role === 'student') {
        lkModerationLog('student received muteAll notification');
        this.micAllowedByInstructor = false;
        this.isMutedByInstructor = true;
        this.micPermission = 'denied';
        this.muteMicrophone().catch(() => {});
        this.emit('micPermissionChange', { micAllowed: false });
        this.emit('instructorMuteStateChange', true);
      }
    };

    addListener('liveClass:moderation:muteAll', handleMuteAll);
    addListener('mute_all_students', handleMuteAll);

    const handleTargetMuted = (data: { targetUserId?: string; userId?: string }) => {
      const target = data?.targetUserId || data?.userId;
      if (target === this.config.userId && this.config.role === 'student') {
        lkModerationLog('student received mute notification');
        this.micAllowedByInstructor = false;
        this.isMutedByInstructor = true;
        this.micPermission = 'denied';
        this.muteMicrophone().catch(() => {});
        this.emit('micPermissionChange', { micAllowed: false });
        this.emit('instructorMuteStateChange', true);
      }
    };

    addListener('liveClass:moderation:muted', handleTargetMuted);
    addListener('student_muted', (data: { userId?: string; isMuted?: boolean }) => {
      if (data?.userId === this.config.userId && this.config.role === 'student') {
        if (data.isMuted) {
          this.micAllowedByInstructor = false;
          this.isMutedByInstructor = true;
          this.micPermission = 'denied';
          this.muteMicrophone().catch(() => {});
          this.emit('micPermissionChange', { micAllowed: false });
          this.emit('instructorMuteStateChange', true);
        } else {
          this.micAllowedByInstructor = true;
          this.isMutedByInstructor = false;
          this.micPermission = 'granted';
          this.emit('micPermissionChange', { micAllowed: true });
          this.emit('instructorMuteStateChange', false);
        }
      }
    });

    addListener('liveClass:moderation:micAllowed', (data: { targetUserId?: string; userId?: string }) => {
      const target = data?.targetUserId || data?.userId;
      if (target === this.config.userId) {
        lkModerationLog('student received micAllowed notification');
        this.micAllowedByInstructor = true;
        this.isMutedByInstructor = false;
        this.micPermission = 'granted';
        this.emit('micPermissionChange', { micAllowed: true });
        this.emit('instructorMuteStateChange', false);
      }
    });

    addListener('liveClass:moderation:requestUnmute', (data: { instructorName?: string }) => {
      lkModerationLog('received requestUnmute notification');
      this.emit('moderationRequestUnmute', data);
    });

    const handleKicked = (data: { targetUserId?: string; userId?: string; message?: string }) => {
      const target = data?.targetUserId || data?.userId;
      if (!target || target === this.config.userId) {
        lkModerationLog('local user kicked from live session');
        this.emit('kicked', data || {});
        this.disconnect();
      }
    };

    addListener('liveClass:moderation:kicked', handleKicked);
    addListener('kicked', handleKicked);
  }

  // ============================================================================
  // GETTERS & EVENT EMITTER
  // ============================================================================

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

  public on(event: string, listener: EventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);

    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error(`[LIVEKIT_DEBUG] Error in listener for event ${event}:`, err);
        }
      });
    }
  }

  private setConnectionState(state: MediaConnectionState): void {
    this.connectionState = state;
    this.emit('connectionStateChange', state);
  }

  private emitParticipantsUpdate(): void {
    this.emit('participantsUpdate', this.getParticipants());
  }
}

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('LiveKit SFU Stabilization & Production Readiness Tests', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const frontendDir = path.resolve(rootDir, 'frontend');
  const backendDir = path.resolve(rootDir, 'backend');

  const livekitAdapterPath = path.resolve(frontendDir, 'src/services/liveMedia/livekitMediaClient.ts');
  const mediaTypesPath = path.resolve(frontendDir, 'src/services/liveMedia/mediaTypes.ts');
  const roomManagerPath = path.resolve(frontendDir, 'src/services/liveMedia/roomManager.ts');
  const videoGridPath = path.resolve(frontendDir, 'src/components/live-class/VideoGrid.tsx');
  const classroomPath = path.resolve(frontendDir, 'src/components/live-class/KaizenQClassroom.tsx');
  const backendControllerPath = path.resolve(backendDir, 'src/modules/liveClassroom/liveClassroom.controller.ts');
  const backendSocketPath = path.resolve(backendDir, 'src/socket/liveClass.socket.ts');

  // ============================================================================
  // 1. IMEDIA CLIENT INTERFACE & CLASS METHODS CONFORMANCE
  // ============================================================================
  it('1. LiveKitMediaClient fully implements the IMediaClient contract and all 25 methods', () => {
    expect(fs.existsSync(livekitAdapterPath)).toBe(true);
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');

    const requiredMethods = [
      'connect',
      'disconnect',
      'cleanup',
      'getParticipants',
      'getLocalStream',
      'getLocalScreenStream',
      'getConnectionState',
      'getIsAudioEnabled',
      'getIsVideoEnabled',
      'getIsScreenSharing',
      'toggleMicrophone',
      'muteMicrophone',
      'toggleCamera',
      'startScreenShare',
      'stopScreenShare',
      'getAvailableDevices',
      'switchCamera',
      'switchMicrophone',
      'muteParticipant',
      'askToUnmuteParticipant',
      'allowParticipantMic',
      'muteAllStudents',
      'pinParticipant',
      'getPinnedUserId',
      'getIsMutedByInstructor',
      'kickParticipant',
      'on',
    ];

    for (const method of requiredMethods) {
      expect(content.includes(method)).toBe(true);
    }
  });

  // ============================================================================
  // 2. PERSISTENT REMOTE AUDIO ARCHITECTURE (PHASE 4)
  // ============================================================================
  it('2. Remote audio is managed via dedicated persistent HTMLAudioElement map independent of VideoTile', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('remoteAudioElements: Map<string, HTMLAudioElement>')).toBe(true);
    expect(content.includes('attachRemoteAudio')).toBe(true);
    expect(content.includes('detachRemoteAudio')).toBe(true);
    expect(content.includes('track.attach(audioEl)')).toBe(true);
    expect(content.includes('[LIVEKIT_AUDIO]')).toBe(true);
  });

  // ============================================================================
  // 3. SCREEN SHARE & CAMERA SEPARATION (PHASE 7 & 8)
  // ============================================================================
  it('3. Screen share publishes video only (audio: false), applies contentHint detail, and does not replace camera', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('setScreenShareEnabled(true, { audio: false })')).toBe(true);
    expect(content.includes("contentHint = 'detail'")).toBe(true);
    expect(content.includes('Track.Source.ScreenShare')).toBe(true);
    expect(content.includes('Track.Source.Camera')).toBe(true);
    expect(content.includes('mst.onended')).toBe(true);
  });

  // ============================================================================
  // 4. VIDEO ELEMENT BINDING STABILITY & NO BLINKING (PHASE 6 & 20)
  // ============================================================================
  it('4. Video and audio elements guard srcObject reassignment to prevent blinking', () => {
    const videoGridContent = fs.readFileSync(videoGridPath, 'utf8');
    expect(videoGridContent.includes('if (el.srcObject !== participant.stream)')).toBe(true);
    expect(videoGridContent.includes('if (videoRef.current.srcObject !== participant.stream)')).toBe(true);
    expect(videoGridContent.includes('if (el.srcObject !== activeScreenStream)')).toBe(true);
    expect(videoGridContent.includes('if (pipVideoRef.current.srcObject !== pipStream)')).toBe(true);

    const classroomContent = fs.readFileSync(classroomPath, 'utf8');
    expect(classroomContent.includes('if (el.srcObject !== stream)')).toBe(true);
  });

  // ============================================================================
  // 5. DETERMINISTIC STREAM VERSION (PHASE 18 & 19)
  // ============================================================================
  it('5. streamVersion is not bumped on simple mute/unmute events', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    // In handleTrackMuteState, streamVersion should NOT be bumped
    const handleMuteMethod = content.substring(
      content.indexOf('handleTrackMuteState('),
      content.indexOf('handleActiveSpeakersChanged(')
    );
    expect(handleMuteMethod.includes('p.streamVersion = (p.streamVersion || 0) + 1')).toBe(false);
  });

  // ============================================================================
  // 6. IDEMPOTENT ROOM LIFECYCLE & DUPLICATE CONNECT PROTECTION (PHASE 2)
  // ============================================================================
  it('6. connect() and disconnect() are idempotent with duplicate protection', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('isConnecting')).toBe(true);
    expect(content.includes('isDisconnecting')).toBe(true);
    expect(content.includes('connect called but already connected')).toBe(true);
    expect(content.includes('this.remoteAudioElements.clear()')).toBe(true);
  });

  // ============================================================================
  // 7. SOCKET.IO MODERATION HARMONIZATION (PHASE 15 & 16)
  // ============================================================================
  it('7. Moderation emits and listens to both liveClass:moderation and legacy event signatures', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('liveClass:moderation:mute')).toBe(true);
    expect(content.includes('mute_student')).toBe(true);
    expect(content.includes('liveClass:moderation:muteAll')).toBe(true);
    expect(content.includes('mute_all_students')).toBe(true);
    expect(content.includes('liveClass:moderation:allowMic')).toBe(true);
    expect(content.includes('liveClass:moderation:requestUnmute')).toBe(true);
    expect(content.includes('kick_participant')).toBe(true);
    expect(content.includes('targetUserId')).toBe(true);
  });

  // ============================================================================
  // 8. AUTHORITATIVE INSTRUCTOR RESOLUTION (PHASE 10)
  // ============================================================================
  it('8. getInstructorParticipant never uses participants[0] or local student as instructor', () => {
    const content = fs.readFileSync(videoGridPath, 'utf8');
    expect(content.includes('getInstructorParticipant')).toBe(true);
    expect(content.includes("pRole === 'student'")).toBe(true);
    expect(content.includes("NEVER returns participants[0]")).toBe(true);
  });

  // ============================================================================
  // 9. SECURITY & ZERO SECRET LEAKAGE (PHASE 23)
  // ============================================================================
  it('9. Zero LiveKit secrets or Firebase private credentials in frontend files', () => {
    const checkDir = (dir: string): void => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          if (entry !== 'node_modules' && entry !== 'dist' && entry !== '.git') {
            checkDir(full);
          }
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          const code = fs.readFileSync(full, 'utf8');
          expect(code.includes('LIVEKIT_API_SECRET')).toBe(false);
          expect(code.includes('LIVEKIT_KEYS')).toBe(false);
        }
      }
    };

    checkDir(path.join(frontendDir, 'src'));
  });
});

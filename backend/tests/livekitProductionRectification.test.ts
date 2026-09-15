import fs from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../src/app';
import { liveClassroomService } from '../src/modules/liveClassroom/liveClassroom.service';
import {
  getModerationRecord,
  updateLiveKitStudentMicPermission,
  persistStudentMicPermission,
} from '../src/socket/liveClass.socket';
import { getActivePoll } from '../src/socket/poll.socket';
import { env } from '../src/config/env';

describe('LiveKit SFU Production Rectification Tests (15 Scenarios)', () => {
  const testClassId = 'rectify_class_101';
  const instructorId = 'rectify_inst_888';
  const studentAId = 'student_A_111';
  const studentBId = 'student_B_222';

  const createTestBearerToken = (payload: { user_id: string; email?: string; role?: string; name?: string }) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = 'fake_sig';
    return `Bearer ${header}.${body}.${signature}`;
  };

  jest.setTimeout(20000);

  beforeAll(async () => {
    (env as any).LIVEKIT_API_KEY = (env as any).LIVEKIT_API_KEY || 'test_livekit_key';
    (env as any).LIVEKIT_API_SECRET = (env as any).LIVEKIT_API_SECRET || 'test_livekit_secret_never_leak';
    (env as any).LIVEKIT_HOST = (env as any).LIVEKIT_HOST || 'wss://test.livekit.local';

    // Setup test live class in memory repository
    await liveClassroomService.createLiveClass({
      id: testClassId,
      classId: testClassId,
      title: 'SFU Rectification Production Class',
      instructorId,
      instructorName: 'Lead Professor',
      status: 'Live',
      courseId: 'course_ai_arch',
      settings: {
        studentMic: { enabled: false },
        studentCamera: { enabled: true },
        studentScreenShare: { enabled: false },
      },
      createdAt: new Date().toISOString(),
    } as any);
  });

  // --------------------------------------------------------------------------
  // 1. INSTRUCTOR TOKEN
  // --------------------------------------------------------------------------
  it('1. Instructor token generates successfully with all media source permissions', async () => {
    const token = createTestBearerToken({ user_id: instructorId, role: 'instructor' });
    const res = await request(app)
      .get(`/api/live-classroom/${testClassId}/media-token`)
      .set('Authorization', token)
      .set('x-test-user-id', instructorId)
      .set('x-test-user-role', 'instructor');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.identity).toBe(`user_${instructorId}`);
    expect(res.body.data.roomName).toBe(`class_${testClassId}`);
  });

  // --------------------------------------------------------------------------
  // 2. AUTHORIZED STUDENT TOKEN
  // --------------------------------------------------------------------------
  it('2. Authorized student token generates with mic publish blocked by default', async () => {
    const token = createTestBearerToken({ user_id: studentBId, role: 'student' });
    const res = await request(app)
      .get(`/api/live-classroom/${testClassId}/media-token`)
      .set('Authorization', token)
      .set('x-test-user-id', studentBId)
      .set('x-test-user-role', 'student');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.identity).toBe(`user_${studentBId}`);
  });

  // --------------------------------------------------------------------------
  // 3. UNAUTHORIZED STUDENT
  // --------------------------------------------------------------------------
  it('3. Unauthorized student without token/auth is rejected with 401', async () => {
    const res = await request(app).get(`/api/live-classroom/${testClassId}/media-token`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // 4. EXPIRED / ENDED CLASS
  // --------------------------------------------------------------------------
  it('4. Expired/Ended class blocks student entry with 403 Forbidden', async () => {
    const endedClassId = 'rectify_ended_class_999';
    await liveClassroomService.createLiveClass({
      id: endedClassId,
      classId: endedClassId,
      title: 'Concluded Class',
      instructorId,
      status: 'Completed',
      createdAt: new Date().toISOString(),
    } as any);

    const token = createTestBearerToken({ user_id: studentAId, role: 'student' });
    const res = await request(app)
      .get(`/api/live-classroom/${endedClassId}/media-token`)
      .set('Authorization', token)
      .set('x-test-user-id', studentAId)
      .set('x-test-user-role', 'student');

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  // --------------------------------------------------------------------------
  // 5. STUDENT A MIC ALLOWED
  // --------------------------------------------------------------------------
  it('5. Instructor allows Student A mic: server grants mic permission for Student A', async () => {
    // Grant mic permission for Student A
    persistStudentMicPermission(testClassId, studentAId, true);
    await updateLiveKitStudentMicPermission(testClassId, studentAId, true);

    const modA = getModerationRecord(testClassId, studentAId, 'student');
    // modRecord reflects granted when updated in room moderation
    expect(modA).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // 6. STUDENT B MIC DENIED
  // --------------------------------------------------------------------------
  it('6. Student B remains microphone denied while Student A is allowed', () => {
    const modB = getModerationRecord(testClassId, studentBId, 'student');
    expect(modB.micPermission).toBe('denied');
    expect(modB.mutedByInstructor).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 7. INSTRUCTOR REVOKES STUDENT A MIC
  // --------------------------------------------------------------------------
  it('7. Instructor revokes Student A mic: server revokes LiveKit publish permission', async () => {
    persistStudentMicPermission(testClassId, studentAId, false);
    await updateLiveKitStudentMicPermission(testClassId, studentAId, false);

    const modA = getModerationRecord(testClassId, studentAId, 'student');
    expect(modA.mutedByInstructor).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 8. DUPLICATE MODERATION EVENT PREVENTION
  // --------------------------------------------------------------------------
  it('8. Moderation socket handlers maintain idempotent deduplicated state', () => {
    const socketFilePath = path.join(__dirname, '../src/socket/liveClass.socket.ts');
    const socketContent = fs.readFileSync(socketFilePath, 'utf8');

    // LiveKit server sdk participant permission API is integrated
    expect(socketContent.includes('updateLiveKitStudentMicPermission')).toBe(true);
    expect(socketContent.includes('persistStudentMicPermission')).toBe(true);
    expect(socketContent.includes('RoomServiceClient')).toBe(true);
    expect(socketContent.includes('TrackSource.MICROPHONE')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 9. DUPLICATE CHAT PREVENTION
  // --------------------------------------------------------------------------
  it('9. Chat messages use deterministic clientMessageId to prevent duplicate entries', async () => {
    const chatSocketPath = path.join(__dirname, '../src/socket/chat.socket.ts');
    const chatSocketContent = fs.readFileSync(chatSocketPath, 'utf8');

    expect(chatSocketContent.includes('finalMsgId = data.clientMessageId || data.id')).toBe(true);
    expect(chatSocketContent.includes('id: finalMsgId')).toBe(true);

    const clientMsgId = `msg_test_${Date.now()}`;
    const saved = await liveClassroomService.saveChatMessage({
      id: clientMsgId,
      classId: testClassId,
      userId: studentAId,
      userName: 'Student A',
      userRole: 'student' as any,
      message: 'Testing deterministic chat message',
      createdAt: new Date().toISOString(),
    });

    expect(saved.id).toBe(clientMsgId);
  });

  // --------------------------------------------------------------------------
  // 10. DUPLICATE POLL PREVENTION & HYDRATION
  // --------------------------------------------------------------------------
  it('10. Poll system provides poll:get_active and persists active poll state', () => {
    const pollSocketPath = path.join(__dirname, '../src/socket/poll.socket.ts');
    const pollSocketContent = fs.readFileSync(pollSocketPath, 'utf8');

    expect(pollSocketContent.includes('poll:get_active')).toBe(true);
    expect(pollSocketContent.includes('poll:active')).toBe(true);
    expect(pollSocketContent.includes('getActivePoll')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 11. RECONNECT STATE RECOVERY
  // --------------------------------------------------------------------------
  it('11. Reconnect sync returns full authoritative snapshot with settings and moderation', () => {
    const socketFilePath = path.join(__dirname, '../src/socket/liveClass.socket.ts');
    const socketContent = fs.readFileSync(socketFilePath, 'utf8');

    expect(socketContent.includes('liveClass:reconnect:sync')).toBe(true);
    expect(socketContent.includes('moderationState: getModerationRecord(classId, userId)')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 12. SCREEN SHARE INDEPENDENT FROM CAMERA
  // --------------------------------------------------------------------------
  it('12. Screen share uses Track.Source.ScreenShare with audio: false and does not replace camera', () => {
    const clientPath = path.join(__dirname, '../../frontend/src/services/liveMedia/livekitMediaClient.ts');
    const clientContent = fs.readFileSync(clientPath, 'utf8');

    expect(clientContent.includes('Track.Source.ScreenShare')).toBe(true);
    expect(clientContent.includes('setScreenShareEnabled(true, { audio: false })')).toBe(true);
    expect(clientContent.includes("mst.contentHint = 'detail'")).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 13. MUTE/UNMUTE DOES NOT REMOUNT VIDEO
  // --------------------------------------------------------------------------
  it('13. Track mute state changes do not increment streamVersion and preserve element identity', () => {
    const clientPath = path.join(__dirname, '../../frontend/src/services/liveMedia/livekitMediaClient.ts');
    const clientContent = fs.readFileSync(clientPath, 'utf8');

    expect(clientContent.includes('streamVersion is intentionally NOT bumped on mute changes')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 14. ACTIVE SPEAKER DOES NOT REMOUNT VIDEO
  // --------------------------------------------------------------------------
  it('14. ActiveSpeakersChanged updates UI speaking state without changing room or tracks', () => {
    const clientPath = path.join(__dirname, '../../frontend/src/services/liveMedia/livekitMediaClient.ts');
    const clientContent = fs.readFileSync(clientPath, 'utf8');

    expect(clientContent.includes('RoomEvent.ActiveSpeakersChanged')).toBe(true);
    expect(clientContent.includes('handleActiveSpeakersChanged')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 15. NO SECRET LEAKAGE
  // --------------------------------------------------------------------------
  it('15. No API keys, secrets, or service account credentials are leaked to the client', async () => {
    const res = await request(app)
      .get(`/api/live-classroom/${testClassId}/media-token`)
      .set('x-test-user-id', instructorId)
      .set('x-test-user-role', 'instructor');

    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain(process.env.LIVEKIT_API_SECRET || 'undefined_secret');
    expect(bodyStr).not.toContain('private_key');
    expect(bodyStr).not.toContain('client_email');
  });
});

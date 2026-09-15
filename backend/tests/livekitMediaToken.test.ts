import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { liveClassroomService } from '../src/modules/liveClassroom/liveClassroom.service';
import { env } from '../src/config/env';
import * as admin from 'firebase-admin';

// Helper to generate a test JWT for auth.middleware fallback
const createTestBearerToken = (payload: { user_id: string; email?: string; role?: string; name?: string }) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'fake_sig';
  return `Bearer ${header}.${body}.${signature}`;
};

describe('Phase 2: LiveKit SFU Token Generation API — Security & Permission Tests', () => {
  const mockClassId = 'test_class_101';
  const instructorUid = 'instructor_manoj_456';
  const authorizedStudentUid = 'student_alice_789';
  const unauthorizedStudentUid = 'student_bob_999';

  const mockLiveClass = {
    id: mockClassId,
    title: 'LiveKit SFU Masterclass',
    instructorId: instructorUid,
    instructorName: 'Instructor Manoj',
    status: 'live',
    targetAudience: 'restricted',
    allowedStudents: [authorizedStudentUid],
    courseId: 'course_cloud_arch',
    settings: {
      studentMic: { enabled: false },
      studentCamera: { enabled: false },
      studentScreenShare: { enabled: false },
    },
  };

  let getLiveClassByIdSpy: any;
  let verifyCourseEnrollmentSpy: any;

  beforeAll(() => {
    // Set LiveKit test credentials
    (env as any).LIVEKIT_API_KEY = 'test_livekit_key';
    (env as any).LIVEKIT_API_SECRET = 'test_livekit_secret_never_leak';
    (env as any).LIVEKIT_HOST = 'wss://kaizenq.in/livekit';

    getLiveClassByIdSpy = jest.spyOn(liveClassroomService, 'getLiveClassById').mockImplementation(async (id: string) => {
      if (id === mockClassId) {
        return mockLiveClass as any;
      }
      return null;
    });

    verifyCourseEnrollmentSpy = jest.spyOn(liveClassroomService, 'verifyCourseEnrollment').mockImplementation(
      async (userId: string) => {
        if (userId === authorizedStudentUid) {
          return { isEnrolled: true };
        }
        return { isEnrolled: false, reason: 'Not enrolled in this course.' };
      }
    );
  });

  afterAll(async () => {
    getLiveClassByIdSpy.mockRestore();
    verifyCourseEnrollmentSpy.mockRestore();
    await Promise.all(admin.apps.map((app) => app?.delete()));
  });

  // ============================================================================
  // TEST A: Unauthenticated request -> 401
  // ============================================================================
  it('A. Should reject unauthenticated request with 401', async () => {
    const res = await request(app).get(`/api/live-classroom/${mockClassId}/media-token`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  // ============================================================================
  // TEST B: Authenticated unauthorized student -> 403
  // ============================================================================
  it('B. Should reject authenticated unauthorized student with 403', async () => {
    const studentToken = createTestBearerToken({
      user_id: unauthorizedStudentUid,
      email: 'bob@example.com',
      role: 'student',
      name: 'Bob Student',
    });

    const res = await request(app)
      .get(`/api/live-classroom/${mockClassId}/media-token`)
      .set('Authorization', studentToken);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  // ============================================================================
  // TEST C: Authorized student -> valid subscriber token
  // ============================================================================
  it('C. Should return valid subscriber token for authorized student', async () => {
    const studentToken = createTestBearerToken({
      user_id: authorizedStudentUid,
      email: 'alice@example.com',
      role: 'student',
      name: 'Alice Student',
    });

    const res = await request(app)
      .get(`/api/live-classroom/${mockClassId}/media-token`)
      .set('Authorization', studentToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.roomName).toBe(`class_${mockClassId}`);
    expect(res.body.data.identity).toBe(`user_${authorizedStudentUid}`);
    expect(res.body.data.url).toBe('wss://kaizenq.in/livekit');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.expiresAt).toBeDefined();

    // Decode LiveKit JWT payload and verify student subscriber grants
    const tokenParts = res.body.data.token.split('.');
    expect(tokenParts.length).toBe(3);
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));

    expect(payload.video).toBeDefined();
    expect(payload.video.room).toBe(`class_${mockClassId}`);
    expect(payload.video.canSubscribe).toBe(true);
    // Student publishing must be false since class settings disabled mic/camera
    expect(payload.video.canPublish).toBe(false);

    // Verify safe metadata
    const metadata = JSON.parse(payload.metadata);
    expect(metadata.userId).toBe(authorizedStudentUid);
    expect(metadata.role).toBe('student');
    expect(metadata.liveClassId).toBe(mockClassId);
  });

  // ============================================================================
  // TEST D: Authorized instructor -> valid publisher/subscriber token
  // ============================================================================
  it('D. Should return valid publisher/subscriber token for authorized instructor', async () => {
    const instructorToken = createTestBearerToken({
      user_id: instructorUid,
      email: 'instructor@example.com',
      role: 'instructor',
      name: 'Instructor Manoj',
    });

    const res = await request(app)
      .get(`/api/live-classroom/${mockClassId}/media-token`)
      .set('Authorization', instructorToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.roomName).toBe(`class_${mockClassId}`);
    expect(res.body.data.identity).toBe(`user_${instructorUid}`);

    // Decode LiveKit JWT payload and verify instructor grants
    const tokenParts = res.body.data.token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));

    expect(payload.video.room).toBe(`class_${mockClassId}`);
    expect(payload.video.canSubscribe).toBe(true);
    expect(payload.video.canPublish).toBe(true);
    expect(payload.video.canPublishData).toBe(true);

    const metadata = JSON.parse(payload.metadata);
    expect(metadata.userId).toBe(instructorUid);
    expect(metadata.role).toBe('instructor');
  });

  // ============================================================================
  // TEST E: Invalid classId -> 404
  // ============================================================================
  it('E. Should return 404 if classId does not exist', async () => {
    const instructorToken = createTestBearerToken({
      user_id: instructorUid,
      email: 'instructor@example.com',
      role: 'instructor',
    });

    const res = await request(app)
      .get('/api/live-classroom/non_existent_class_999/media-token')
      .set('Authorization', instructorToken);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  // ============================================================================
  // TEST F: Missing LiveKit credentials -> controlled 500 error
  // ============================================================================
  it('F. Should return controlled 500 if LiveKit credentials are missing', async () => {
    const originalKey = env.LIVEKIT_API_KEY;
    const originalSecret = env.LIVEKIT_API_SECRET;

    (env as any).LIVEKIT_API_KEY = '';
    (env as any).LIVEKIT_API_SECRET = '';

    const instructorToken = createTestBearerToken({
      user_id: instructorUid,
      email: 'instructor@example.com',
      role: 'instructor',
    });

    const res = await request(app)
      .get(`/api/live-classroom/${mockClassId}/media-token`)
      .set('Authorization', instructorToken);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/LiveKit media credentials not configured/i);

    // Restore
    (env as any).LIVEKIT_API_KEY = originalKey;
    (env as any).LIVEKIT_API_SECRET = originalSecret;
  });

  // ============================================================================
  // TEST G: Verify secret is NEVER returned except indirectly through signed JWT
  // ============================================================================
  it('G. Should never leak LIVEKIT_API_SECRET in response body or headers', async () => {
    const instructorToken = createTestBearerToken({
      user_id: instructorUid,
      email: 'instructor@example.com',
      role: 'instructor',
    });

    const res = await request(app)
      .get(`/api/live-classroom/${mockClassId}/media-token`)
      .set('Authorization', instructorToken);

    expect(res.status).toBe(200);

    const stringifiedBody = JSON.stringify(res.body);
    const stringifiedHeaders = JSON.stringify(res.headers);

    expect(stringifiedBody.includes('test_livekit_secret_never_leak')).toBe(false);
    expect(stringifiedHeaders.includes('test_livekit_secret_never_leak')).toBe(false);
  });
});

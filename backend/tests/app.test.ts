import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import * as admin from 'firebase-admin';

describe('GET / Endpoint', () => {
  it('should return 200 OK with service status', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      service: 'KaizenQ Backend',
      status: 'running',
    });
  });

  it('should return 200 OK on GET /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.version).toBe('1.0.0');
    expect(typeof response.body.uptime).toBe('number');
  });
});

afterAll(async () => {
  await Promise.all(admin.apps.map((app) => app?.delete()));
});

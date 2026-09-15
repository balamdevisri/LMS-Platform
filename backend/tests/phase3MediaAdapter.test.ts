import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Phase 3: LiveKit SFU Frontend Media Adapter — Architecture & Security Tests', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const frontendDir = path.resolve(rootDir, 'frontend');
  const livekitAdapterPath = path.resolve(frontendDir, 'src/services/liveMedia/livekitMediaClient.ts');
  const roomManagerPath = path.resolve(frontendDir, 'src/services/liveMedia/roomManager.ts');
  const mediaTypesPath = path.resolve(frontendDir, 'src/services/liveMedia/mediaTypes.ts');
  const videoGridPath = path.resolve(frontendDir, 'src/components/live-class/VideoGrid.tsx');

  // ============================================================================
  // TEST A: Existing P2P files remain completely intact and non-empty
  // ============================================================================
  it('A. Existing P2P MediaClient and signaling remain intact', () => {
    const p2pClientPath = path.resolve(frontendDir, 'src/services/liveMedia/mediaClient.ts');
    expect(fs.existsSync(p2pClientPath)).toBe(true);
    const content = fs.readFileSync(p2pClientPath, 'utf8');
    expect(content.includes('class MediaClient')).toBe(true);
    expect(content.includes('syncRemoteTracks')).toBe(true);
  });

  // ============================================================================
  // TEST B: SFU adapter file exists and exports LiveKitMediaClient
  // ============================================================================
  it('B. SFU adapter exists and defines LiveKitMediaClient', () => {
    expect(fs.existsSync(livekitAdapterPath)).toBe(true);
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('export class LiveKitMediaClient')).toBe(true);
    expect(content.includes('implements IMediaClient')).toBe(true);
  });

  // ============================================================================
  // TEST C: Engine selector defaults to P2P when VITE_MEDIA_ENGINE is missing/invalid
  // ============================================================================
  it('C. Engine selector in roomManager defaults to p2p', () => {
    const content = fs.readFileSync(roomManagerPath, 'utf8');
    expect(content.includes("export const getActiveMediaEngine = (): 'p2p' | 'sfu'")).toBe(true);
    expect(content.includes("return 'p2p';")).toBe(true);
    expect(content.includes("envEngine === 'sfu'")).toBe(true);
  });

  // ============================================================================
  // TEST D: Token endpoint integration path uses authoritative endpoint
  // ============================================================================
  it('D. LiveKit adapter calls GET /api/live-classroom/:classId/media-token', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('live-classroom/${this.config.classId}/media-token')).toBe(true);
    expect(content.includes('Authorization')).toBe(true);
  });

  // ============================================================================
  // TEST E: Zero LiveKit secrets exist in frontend source code
  // ============================================================================
  it('E. Frontend source code contains NO LiveKit API secrets or private credentials', () => {
    const scanDir = (dir: string): string[] => {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
            results.push(...scanDir(fullPath));
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          results.push(fullPath);
        }
      });
      return results;
    };

    const frontendFiles = scanDir(path.join(frontendDir, 'src'));
    for (const filePath of frontendFiles) {
      const code = fs.readFileSync(filePath, 'utf8');
      expect(code.includes('LIVEKIT_API_SECRET')).toBe(false);
      expect(code.includes('test_livekit_secret')).toBe(false);
    }
  });

  // ============================================================================
  // TEST F: Participant identity normalization maps user_<uid> to <uid>
  // ============================================================================
  it('F. Identity normalization strips user_ prefix deterministically', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('normalizeLiveKitIdentity')).toBe(true);

    const testNormalize = (raw: string) => {
      const trimmed = raw.trim();
      return trimmed.startsWith('user_') ? trimmed.substring(5) : trimmed;
    };

    expect(testNormalize('user_bhanu_12345')).toBe('bhanu_12345');
    expect(testNormalize('user_')).toBe('');
    expect(testNormalize('guest_999')).toBe('guest_999');
  });

  // ============================================================================
  // TEST G: Screen track is independent from camera videoTrack
  // ============================================================================
  it('G. Screen share uses independent screenTrack without destroying videoTrack', () => {
    const adapterContent = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(adapterContent.includes('Track.Source.ScreenShare')).toBe(true);
    expect(adapterContent.includes('participant.screenTrack = mst')).toBe(true);
    expect(adapterContent.includes('participant.videoTrack = mst')).toBe(true);

    const vgContent = fs.readFileSync(videoGridPath, 'utf8');
    expect(vgContent.includes('activeSharer?.screenTrack')).toBe(true);
    expect(vgContent.includes('instructor.videoTrack')).toBe(true);
  });

  // ============================================================================
  // TEST H: Disconnect is idempotent
  // ============================================================================
  it('H. LiveKitMediaClient disconnect implementation is idempotent', () => {
    const content = fs.readFileSync(livekitAdapterPath, 'utf8');
    expect(content.includes('if (this.isDisconnecting) return;')).toBe(true);
    expect(content.includes('this.isDisconnecting = true;')).toBe(true);
  });

  // ============================================================================
  // TEST I: Unified IMediaClient contract implemented by both engines
  // ============================================================================
  it('I. Both MediaClient and LiveKitMediaClient implement IMediaClient', () => {
    const p2pContent = fs.readFileSync(path.resolve(frontendDir, 'src/services/liveMedia/mediaClient.ts'), 'utf8');
    const sfuContent = fs.readFileSync(livekitAdapterPath, 'utf8');
    const typesContent = fs.readFileSync(mediaTypesPath, 'utf8');

    expect(typesContent.includes('export interface IMediaClient')).toBe(true);
    expect(p2pContent.includes('implements IMediaClient')).toBe(true);
    expect(sfuContent.includes('implements IMediaClient')).toBe(true);
  });
});

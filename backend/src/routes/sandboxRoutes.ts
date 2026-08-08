import { Router, Request, Response } from 'express';
import { GitLabSandboxService } from '../services/sandbox/GitLabSandboxService';
import { SecurityValidator } from '../services/sandbox/SecurityValidator';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const sandboxService = GitLabSandboxService.getInstance();

/**
 * Execute Git command in isolated student sandbox.
 */
router.post('/git/execute', verifyFirebaseToken as any, async (req: Request, res: Response) => {
  const { studentId, command, sessionId } = req.body;

  if (!studentId || typeof command !== 'string') {
    return res.status(400).json({ error: 'Missing studentId or command parameter.' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || undefined;
  const result = await sandboxService.executeCommand(studentId, command, sessionId, clientIp);
  return res.json(result);
});

/**
 * Get current structured Git repository state.
 */
router.post('/git/state', verifyFirebaseToken as any, async (req: Request, res: Response) => {
  const { studentId, sessionId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Missing studentId parameter.' });
  }

  const session = sandboxService.getOrCreateSession(studentId, sessionId);
  const state = await sandboxService.getRepoState(session.workspacePath);
  return res.json({ state, sessionId: session.sessionId });
});

/**
 * Initialize / start a new student sandbox workspace session.
 */
router.post('/session/start', verifyFirebaseToken as any, (req: Request, res: Response) => {
  const { studentId, sessionId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Missing studentId parameter.' });
  }

  const session = sandboxService.getOrCreateSession(studentId, sessionId);
  return res.json({ session });
});

/**
 * Destroy & cleanup student sandbox workspace session.
 */
router.post('/session/destroy', verifyFirebaseToken as any, (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (sessionId) {
    sandboxService.destroySession(sessionId);
  }
  return res.json({ success: true, message: 'Session destroyed successfully.' });
});

/**
 * Get security audit logs (Admin Inspection).
 */
router.get('/audit-logs', verifyFirebaseToken as any, requireRole('admin') as any, (_req: Request, res: Response) => {
  const logs = SecurityValidator.getAuditLogs();
  return res.json({ logs, count: logs.length });
});

export default router;

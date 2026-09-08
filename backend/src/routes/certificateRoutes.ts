import { Router } from 'express';
import { certificateController } from '../controllers/certificateController';
import { verifyFirebaseToken, requireRole, extractOptionalUser } from '../middleware/auth.middleware';
import { certificateRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Canonical certificate generation route & queue triggering (Rate Limited + Authenticated)
router.post('/generate', verifyFirebaseToken, certificateRateLimiter, (req, res) => certificateController.handleCompletionAndDeliver(req, res));
router.post('/complete-and-deliver', verifyFirebaseToken, certificateRateLimiter, (req, res) => certificateController.handleCompletionAndDeliver(req, res));

// Real-time queue status endpoints (Authenticated & Ownership Checked)
router.get('/jobs/:jobId', verifyFirebaseToken, (req, res) => certificateController.getJobStatus(req, res));
router.get('/job/status', verifyFirebaseToken, (req, res) => certificateController.getJobByParams(req, res));

// Direct authenticated certificate download (Authenticated & Ownership Checked)
router.get('/download', verifyFirebaseToken, (req, res) => certificateController.downloadCertificate(req, res));

// Direct authenticated certificate preview (Authenticated & Ownership Checked)
router.get('/preview', verifyFirebaseToken, (req, res) => certificateController.previewCertificate(req, res));

// Authenticated current student certificates list
router.get('/my-certificates', verifyFirebaseToken, (req, res) => certificateController.getMyCertificates(req, res));

// Certificates by email query (Owner/Admin or graceful empty fallback)
router.get('/student/:studentEmail', extractOptionalUser as any, (req, res) => certificateController.getCertificatesByEmail(req, res));

// Public Certificate Verification (Sanitized Public DTO - No secrets/PII exposed)
router.get('/verify/:certificateId', (req, res) => certificateController.verifyCertificate(req, res));

// Sync student learning state to Firestore for backend validation
router.post('/sync-state', verifyFirebaseToken, (req, res) => certificateController.syncState(req, res));

// Admin Certificate Lifecycle Management (Revoke & Restore)
router.post('/:certificateId/revoke', verifyFirebaseToken as any, requireRole('admin') as any, (req, res) => certificateController.revokeCertificate(req, res));
router.post('/:certificateId/restore', verifyFirebaseToken as any, requireRole('admin') as any, (req, res) => certificateController.restoreCertificate(req, res));

// Test endpoint to trigger automated certificate delivery for diagnostic testing
router.get('/test-delivery', verifyFirebaseToken, (req, res) => certificateController.testDelivery(req, res));

export default router;

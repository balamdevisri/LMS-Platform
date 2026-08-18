import { Router } from 'express';
import { certificateController } from '../controllers/certificateController';
import { verifyFirebaseToken } from '../middleware/auth.middleware';

const router = Router();

// Trigger automated certificate delivery upon 100% course completion
router.post('/complete-and-deliver', verifyFirebaseToken, (req, res) => certificateController.handleCompletionAndDeliver(req, res));

// Test endpoint to trigger automated certificate delivery for diagnostic testing
router.get('/test-delivery', (req, res) => certificateController.testDelivery(req, res));

// Route to download generated PDF certificate directly from server
router.get('/download', (req, res) => certificateController.downloadCertificate(req, res));

// Route to preview generated PDF certificate inline
router.get('/preview', (req, res) => certificateController.previewCertificate(req, res));

// Route to verify generated certificate ID against Google Sheets registry
router.get('/verify/:certificateId', (req, res) => certificateController.verifyCertificate(req, res));

// Route to get all certificates for a specific student email
router.get('/student/:studentEmail', (req, res) => certificateController.getCertificatesByEmail(req, res));

// Route to sync student learning state to Firestore for backend validation
router.post('/sync-state', verifyFirebaseToken, (req, res) => certificateController.syncState(req, res));

export default router;

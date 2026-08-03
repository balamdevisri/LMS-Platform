import { Router } from 'express';
import { certificateController } from '../controllers/certificateController';

const router = Router();

// Trigger automated certificate delivery upon 100% course completion
router.post('/complete-and-deliver', (req, res) => certificateController.handleCompletionAndDeliver(req, res));

// Test endpoint to trigger automated certificate delivery for diagnostic testing
router.get('/test-delivery', (req, res) => certificateController.testDelivery(req, res));

export default router;

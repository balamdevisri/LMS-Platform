import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

// Public Password Reset via Nodemailer SMTP Backend
router.post('/forgot-password', (req, res, next) => controller.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => controller.forgotPassword(req, res, next));

export default router;

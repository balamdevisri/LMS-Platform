import { Router } from 'express';
import { AuthController as LegacyAuthController } from './auth.controller';
import { AuthController } from '../../controllers/authController';

const router = Router();
const legacyController = new LegacyAuthController();
const controller = new AuthController();

// Public Password Reset via Nodemailer SMTP Backend
router.post('/forgot-password', (req, res, next) => legacyController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => legacyController.forgotPassword(req, res, next));

// Registration Workflows
router.post('/student-register', (req, res, next) => controller.studentRegister(req, res, next));
router.post('/lecturer-register', (req, res, next) => controller.lecturerRegister(req, res, next));

export default router;

import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

// Firebase Authentication Endpoints
router.post('/signup/student', (req, res) => controller.studentSignup(req, res));
router.post('/signup/lecturer', (req, res) => controller.lecturerSignup(req, res));
router.post('/login/admin', (req, res) => controller.adminLogin(req, res));
router.post('/verify-token', (req, res) => controller.verifyToken(req, res));

// Public Password Reset via Nodemailer SMTP Backend
router.post('/forgot-password', (req, res, next) => controller.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => controller.forgotPassword(req, res, next));

export default router;

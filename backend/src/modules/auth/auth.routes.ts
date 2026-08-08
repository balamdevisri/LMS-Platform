import { Router } from 'express';
import { AuthController as LegacyAuthController } from './auth.controller';
import { AuthController } from '../../controllers/authController';

const router = Router();
const legacyController = new LegacyAuthController();
const controller = new AuthController();

// Firebase Authentication Endpoints
router.post('/signup/student', (req, res) => legacyController.studentSignup(req, res));
router.post('/signup/lecturer', (req, res) => legacyController.lecturerSignup(req, res));
router.post('/login/admin', (req, res) => legacyController.adminLogin(req, res));
router.post('/verify-token', (req, res) => legacyController.verifyToken(req, res));

// Public Password Reset via Nodemailer SMTP Backend
router.post('/forgot-password', (req, res, next) => legacyController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => legacyController.forgotPassword(req, res, next));

// Registration Workflows
router.post('/student-register', (req, res, next) => controller.studentRegister(req, res, next));
router.post('/lecturer-register', (req, res, next) => controller.lecturerRegister(req, res, next));

export default router;

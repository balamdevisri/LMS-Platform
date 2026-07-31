import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../../firebase';
import { EmailService } from '../../services/email/EmailService';
import { EmailEventType } from '../../types/emailTypes';
import logger from '../../config/logger';

const emailService = new EmailService();

export class AuthController {
  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;
    console.log("\n===== FORGOT PASSWORD REQUEST =====");
    console.log("Email:", email);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    let resetUrl = `https://shaivika-lms.vercel.app/auth/login?reset=true&email=${encodeURIComponent(normalizedEmail)}`;
    try {
      if (adminAuth && typeof adminAuth.generatePasswordResetLink === 'function') {
        resetUrl = await adminAuth.generatePasswordResetLink(normalizedEmail);
      }
    } catch (linkErr: any) {
      logger.warn(`Admin Auth generatePasswordResetLink notice for ${normalizedEmail}: ${linkErr?.message || linkErr}`);
    }

    console.log("Generated Reset Link:", resetUrl);
    console.log("Sending Password Reset Email via Nodemailer SMTP...");

    try {
      const emailResult = await emailService.sendEventEmail(
        EmailEventType.PASSWORD_RESET,
        normalizedEmail,
        {
          userName: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          resetUrl,
          expiresInMinutes: 15,
        }
      );

      console.log("Mail Info:", emailResult);
      console.log("===== FORGOT PASSWORD COMPLETED =====\n");

      res.status(200).json({
        success: true,
        message: 'Password reset link sent successfully via Nodemailer SMTP.',
        emailResult,
      });
    } catch (err: any) {
      console.error("FORGOT PASSWORD EMAIL ERROR:", err);
      res.status(500).json({
        success: false,
        error: 'Failed sending password reset email via Nodemailer SMTP.',
        message: err?.message || String(err),
      });
    }
  }
}

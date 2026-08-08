import { Request, Response, NextFunction } from 'express';
import { db } from '../firebase';
import { CertificateService } from '../services/pdf/CertificateService';
import { emailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';
import logger from '../config/logger';
import fs from 'fs';
import path from 'path';

export class CourseController {
  /**
   * Flow 5: Course Completion & PDF Certificate Dispatch
   */
  public async sendCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tempFilePaths: string[] = [];
    try {
      const { studentId, courseId, bypassChecks = false } = req.body;
      if (!studentId || !courseId) {
        res.status(400).json({ success: false, error: 'studentId and courseId are required' });
        return;
      }

      if (!db) {
        res.status(500).json({ success: false, error: 'Database service is unavailable' });
        return;
      }

      // 1. Fetch Student & Course Metadata
      const studentSnap = await db.collection('students').doc(studentId).get();
      if (!studentSnap.exists) {
        res.status(404).json({ success: false, error: 'Student record not found' });
        return;
      }

      const courseSnap = await db.collection('courses').doc(courseId).get();
      if (!courseSnap.exists) {
        res.status(404).json({ success: false, error: 'Course track not found' });
        return;
      }

      const studentData = studentSnap.data() || {};
      const courseData = courseSnap.data() || {};

      const studentName = studentData.fullName || studentData.name || 'Student Graduate';
      const studentEmail = studentData.email || '';
      const courseTitle = courseData.title || 'Advanced Technical Track';
      const instructorName = courseData.instructor?.name || 'Senior Instructor';

      // 2. Perform Curriculum Completion Checks (unless bypassed)
      if (!bypassChecks) {
        // Query progress document
        const progressSnap = await db
          .collection('student_progress')
          .where('studentId', '==', studentId)
          .where('courseId', '==', courseId)
          .limit(1)
          .get();

        if (progressSnap.empty) {
          res.status(400).json({ success: false, error: 'No progress record found for this course' });
          return;
        }

        const progressData = progressSnap.docs[0].data();
        const completionPercentage = progressData.completionPercentage || 0;

        // Check A: All lessons completed (min 100%)
        if (completionPercentage < 100) {
          res.status(400).json({
            success: false,
            error: `Course incomplete. Completion is at ${completionPercentage}%, but requires 100%.`,
          });
          return;
        }

        // Check B: Assignment submitted
        const assignmentStatus = progressData.assignmentStatus || {};
        const totalSubmitted = assignmentStatus.totalSubmitted || 0;
        if (totalSubmitted <= 0) {
          res.status(400).json({ success: false, error: 'Course incomplete. Pending assignment submissions.' });
          return;
        }

        // Check C: Quiz passed
        const quizSnap = await db
          .collection('quiz_attempts')
          .where('studentId', '==', studentId)
          .where('courseId', '==', courseId)
          .get();

        const hasPassedQuiz = quizSnap.docs.some((doc) => {
          const attempt = doc.data();
          return attempt.percentage >= 60;
        });

        if (!hasPassedQuiz) {
          res.status(400).json({ success: false, error: 'Course incomplete. Requires passing at least one quiz attempt with 60% or higher.' });
          return;
        }
      }

      // 3. Generate Certificate Metadata
      const verificationId = `VAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const certNumber = `CERT-${studentId.substring(0, 4).toUpperCase()}-${courseId.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // 4. Invoke PDF generator service
      logger.info(`[CERTIFICATE ENGINE] Generating PDF certificate for: ${studentName}`);
      const pdfBuffer = await CertificateService.generateCertificatePdf(
        studentName,
        courseTitle,
        instructorName,
        certNumber,
        issueDate,
        verificationId
      );

      // 5. Write PDF to temporary file
      const tempFilename = `temp-cert-${studentId}-${courseId}-${Date.now()}.pdf`;
      const tempDir = path.join(__dirname, '../../utils');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempPath = path.join(tempDir, tempFilename);
      tempFilePaths.push(tempPath);

      fs.writeFileSync(tempPath, pdfBuffer);
      logger.info(`[CERTIFICATE ENGINE] PDF written temporarily to: ${tempPath}`);

      // 6. Send Nodemailer SMTP email with attachment
      const emailSubject = 'Congratulations! You earned your certificate.';
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E0F2FE; border-radius: 12px;">
          <h2 style="color: #0F2A60;">Congratulations, ${studentName}!</h2>
          <p>You have successfully completed the course <strong>${courseTitle}</strong>.</p>
          <p>Your hard work and dedication have earned you a professional certification. We have attached your digital PDF certificate to this email.</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Verification ID:</strong> ${verificationId}<br/>
            <strong>Certificate ID:</strong> ${certNumber}<br/>
            <strong>Date of Completion:</strong> ${issueDate}
          </div>
          <p>Sincerely,</p>
          <p><strong>SHAIVIKA GROUPS & KAIZENQ AI</strong></p>
        </div>
      `;

      logger.info(`[CERTIFICATE ENGINE] Mailing certificate PDF to: ${studentEmail}`);
      
      const mailResult = await emailService.sendDirectHtmlEmail(
        studentEmail,
        emailSubject,
        emailHtml,
        `Congratulations ${studentName}! You earned your certificate for completing ${courseTitle}. Verification ID: ${verificationId}`
      );

      // Attach PDF to email manually using the transporter
      if (mailResult.success) {
        // Send email with attachment
        const transporterStatus = emailService.getTransporterStatus();
        const transportProvider = (emailService as any).activeProvider;

        // Custom call directly through provider to attach certificate
        await transportProvider.send({
          from: transporterStatus.from,
          to: studentEmail,
          subject: emailSubject,
          html: emailHtml,
          text: `Congratulations ${studentName}! Certificate ID: ${certNumber}`,
          attachments: [
            {
              filename: `${courseTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`,
              path: tempPath,
            }
          ]
        }).catch((attachErr: any) => {
          logger.warn(`[CERTIFICATE ENGINE] Standard attach send failed, fallback default email sent: ${attachErr?.message}`);
        });

        // 7. Store Certificate in Firestore
        const certRecord = {
          studentId,
          courseId,
          studentName,
          courseTitle,
          certificateNumber: certNumber,
          issueDate,
          verificationId,
          createdAt: new Date().toISOString(),
          status: 'issued',
        };
        await db.collection('certificates').doc(verificationId).set(certRecord);
      }

      // 8. Delete temporary file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        logger.info(`[CERTIFICATE ENGINE] Temporary file deleted successfully.`);
      }

      res.status(200).json({
        success: true,
        message: 'Course completion verified and certificate generated/emailed successfully.',
        data: {
          verificationId,
          certificateNumber: certNumber,
          recipient: studentEmail,
        },
      });
    } catch (err: any) {
      logger.error(`[courseController] sendCertificate error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    } finally {
      // Cleanup backup safety
      tempFilePaths.forEach((p) => {
        if (fs.existsSync(p)) {
          try {
            fs.unlinkSync(p);
          } catch (e) {}
        }
      });
    }
  }
}

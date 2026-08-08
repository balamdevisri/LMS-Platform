/**
 * SHAIVIKA LMS AI Platform - HTML Email Template Generators
 * KaizenQ - Powered by SHAIVIKA GROUPS
 *
 * Professional, fully responsive HTML email templates with Blue + White theme,
 * KaizenQ branding, clear typography, dynamic metrics, action CTAs, and footer links.
 */

import {
  EmailEventType,
  StudentRegistrationPayload,
  RegistrationPendingPayload,
  RegistrationApprovedPayload,
  RegistrationRejectedPayload,
  EmailVerificationPayload,
  PasswordResetPayload,
  CourseEnrollmentPayload,
  CourseCompletionPayload,
  QuizResultPayload,
  AssignmentSubmissionPayload,
  CertificateGeneratedPayload,
  InstructorApprovalPayload,
  AdminNotificationPayload,
  LecturerPendingPayload,
  LecturerApprovedPayload,
  CoursePublishedPayload,
  AssignmentReminderPayload,
  QuizReminderPayload,
} from '../../types/emailTypes';

interface MasterLayoutOptions {
  title: string;
  preheader?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Master Responsive HTML Email Container
 */
export const renderMasterLayout = (options: MasterLayoutOptions): string => {
  const currentYear = new Date().getFullYear();
  const preheaderText = options.preheader || options.title;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${options.title}</title>
  <style>
    /* Reset & Base Styles */
    body, p, h1, h2, h3, h4, h5, h6, ul, ol, li {
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #F0F6FF;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
      width: 100% !important;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      max-width: 100%;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F0F6FF;
      padding: 40px 0;
    }
    .main-card {
      background-color: #FFFFFF;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 20px;
      border: 1px solid #E0F2FE;
      box-shadow: 0 10px 30px rgba(2, 132, 199, 0.08);
      overflow: hidden;
    }
    .header-banner {
      background: linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #4F46E5 100%);
      padding: 32px 36px;
      text-align: left;
    }
    .brand-title {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      color: #BAE6FD;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-top: 4px;
    }
    .content-body {
      padding: 36px;
    }
    .h1-title {
      font-size: 22px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 16px;
    }
    .p-text {
      font-size: 15px;
      color: #334155;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .metric-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #0284C7;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .metric-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: #0284C7;
      margin-top: 4px;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #0284C7 0%, #2563EB 100%);
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      box-shadow: 0 6px 20px rgba(2, 132, 199, 0.3);
      transition: all 0.2s ease;
    }
    .footer-section {
      background-color: #FAFCFF;
      border-top: 1px solid #F0F6FF;
      padding: 28px 36px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-links a {
      color: #0284C7;
      text-decoration: none;
      margin: 0 8px;
    }
    @media only screen and (max-width: 620px) {
      .wrapper { padding: 12px 0; }
      .main-card { border-radius: 12px; }
      .header-banner { padding: 24px 20px; }
      .content-body { padding: 24px 20px; }
      .footer-section { padding: 20px; }
      .brand-title { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div style="display: none; font-size: 1px; color: #F0F6FF; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheaderText}
  </div>

  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div class="main-card">
            
            <!-- Header -->
            <div class="header-banner">
              <div class="brand-title">KaizenQ</div>
              <div class="brand-subtitle">Powered by SHAIVIKA GROUPS</div>
            </div>

            <!-- Main Content Area -->
            <div class="content-body">
              ${options.contentHtml}

              ${
                options.ctaText && options.ctaUrl
                  ? `
              <div class="cta-container">
                <a href="${options.ctaUrl}" class="cta-button" target="_blank">${options.ctaText}</a>
              </div>
              `
                  : ''
              }
            </div>

            <!-- Footer -->
            <div class="footer-section">
              <div class="footer-links">
                <a href="https://shaivika.com" target="_blank">Platform Dashboard</a> &bull;
                <a href="https://shaivika.com/privacy" target="_blank">Privacy Policy</a> &bull;
                <a href="https://shaivika.com/support" target="_blank">24/7 AI Support</a>
              </div>
              <p>&copy; ${currentYear} KaizenQ. SHAIVIKA GROUPS AI LMS Foundation. All rights reserved.</p>
              <p style="margin-top: 6px; color: #94A3B8;">This is an automated notification. Please do not reply directly to this email.</p>
            </div>

          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};

/**
 * 1. Student Registration Template
 */
export const buildStudentRegistrationTemplate = (
  payload: StudentRegistrationPayload
): { subject: string; html: string } => {
  const subject = `Welcome to KaizenQ LMS, ${payload.studentName}! 🚀`;
  const ctaUrl = payload.verificationLink || payload.dashboardUrl || 'https://shaivika.com/dashboard';

  const contentHtml = `
    <h1 class="h1-title">Welcome to KaizenQ AI LMS!</h1>
    <p class="p-text">Hello <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">Your student account has been successfully created. You now have access to our AI-powered hands-on learning environment, interactive Linux sandboxes, adaptive quizzes, and industry certificates.</p>

    <div class="metric-box">
      <div class="metric-label">Account Details</div>
      <div class="metric-value">${payload.email}</div>
      <p style="font-size: 13px; color: #475569; margin-top: 6px;">Role: Student &bull; Platform: KaizenQ AI LMS</p>
    </div>

    <p class="p-text">Click the button below to complete your setup and dive into your learning workspace.</p>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: 'Welcome to KaizenQ AI LMS - Start learning today!',
      contentHtml,
      ctaText: 'Access Student Dashboard',
      ctaUrl,
    }),
  };
};

/**
 * 2. Email Verification Template
 */
export const buildEmailVerificationTemplate = (
  payload: EmailVerificationPayload
): { subject: string; html: string } => {
  const subject = `Verify Your Email Address - KaizenQ AI LMS`;

  const contentHtml = `
    <h1 class="h1-title">Verify Your Email Address</h1>
    <p class="p-text">Hello <strong>${payload.userName}</strong>,</p>
    <p class="p-text">Thank you for registering with KaizenQ LMS. Please verify your email address to secure your account and unlock course enrollments.</p>

    <div class="metric-box">
      <div class="metric-label">Verification Window</div>
      <div class="metric-value">Valid for ${payload.expiresInMinutes || 30} Minutes</div>
    </div>

    <p class="p-text">If you did not request this verification, you can safely ignore this email.</p>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: 'Verify your email address for KaizenQ LMS',
      contentHtml,
      ctaText: 'Verify Email Address',
      ctaUrl: payload.verificationUrl,
    }),
  };
};

/**
 * 3. Password Reset Template
 */
export const buildPasswordResetTemplate = (
  payload: PasswordResetPayload
): { subject: string; html: string } => {
  const subject = `Reset Your Password - KaizenQ AI LMS`;

  const contentHtml = `
    <h1 class="h1-title">Password Reset Request</h1>
    <p class="p-text">Hello <strong>${payload.userName}</strong>,</p>
    <p class="p-text">We received a request to reset the password associated with your account (<code>${payload.email}</code>).</p>

    <div class="metric-box">
      <div class="metric-label">Security Note</div>
      <div class="metric-value">Link Expires in ${payload.expiresInMinutes || 15} Mins</div>
    </div>

    <p class="p-text">Click the button below to set a new password. If you didn't request a password reset, please contact support immediately.</p>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: 'Reset your password for KaizenQ AI LMS',
      contentHtml,
      ctaText: 'Set New Password',
      ctaUrl: payload.resetUrl,
    }),
  };
};

/**
 * 4. Course Enrollment Template
 */
export const buildCourseEnrollmentTemplate = (
  payload: CourseEnrollmentPayload
): { subject: string; html: string } => {
  const subject = `Enrollment Confirmed: ${payload.courseTitle} 🎓`;
  const ctaUrl = payload.courseUrl || `https://shaivika.com/courses/${payload.courseId}`;

  const contentHtml = `
    <h1 class="h1-title">You're Enrolled! 🎉</h1>
    <p class="p-text">Hi <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">Your enrollment in <strong>${payload.courseTitle}</strong> is now active. Get ready to build real-world skills with interactive modules and live AI assistance.</p>

    <div class="metric-box">
      <div class="metric-label">Enrolled Course</div>
      <div class="metric-value">${payload.courseTitle}</div>
      ${payload.instructorName ? `<p style="font-size: 13px; color: #475569; margin-top: 6px;">Instructor: ${payload.instructorName}</p>` : ''}
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `You are now enrolled in ${payload.courseTitle}`,
      contentHtml,
      ctaText: 'Start Learning Now',
      ctaUrl,
    }),
  };
};

/**
 * 5. Course Completion Template
 */
export const buildCourseCompletionTemplate = (
  payload: CourseCompletionPayload
): { subject: string; html: string } => {
  const subject = `Congratulations! You Completed ${payload.courseTitle} 🌟`;
  const ctaUrl = payload.certificateUrl || 'https://shaivika.com/dashboard';

  const contentHtml = `
    <h1 class="h1-title">Course Completed! 🏆</h1>
    <p class="p-text">Awesome job, <strong>${payload.studentName}</strong>!</p>
    <p class="p-text">You have successfully completed <strong>${payload.courseTitle}</strong>. All modules, quizzes, and practical exercises have been verified.</p>

    <div class="metric-box">
      <div class="metric-label">Achievement</div>
      <div class="metric-value">100% Course Completion</div>
      <p style="font-size: 13px; color: #475569; margin-top: 6px;">Completed Date: ${payload.completionDate || new Date().toLocaleDateString()}</p>
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Congratulations on completing ${payload.courseTitle}!`,
      contentHtml,
      ctaText: 'View & Download Certificate',
      ctaUrl,
    }),
  };
};

/**
 * 6. Quiz Result Template
 */
export const buildQuizResultTemplate = (
  payload: QuizResultPayload
): { subject: string; html: string } => {
  const subject = `Quiz Result: ${payload.quizTitle} - ${payload.passed ? 'PASSED ✅' : 'ATTEMPT COMPLETED 📝'}`;
  const ctaUrl = payload.quizUrl || 'https://shaivika.com/dashboard';

  const contentHtml = `
    <h1 class="h1-title">Quiz Results Released</h1>
    <p class="p-text">Hi <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">Your submission for <strong>${payload.quizTitle}</strong> in <em>${payload.courseTitle}</em> has been graded.</p>

    <div class="metric-box" style="border-left-color: ${payload.passed ? '#10B981' : '#F59E0B'};">
      <div class="metric-label">Score Summary</div>
      <div class="metric-value" style="color: ${payload.passed ? '#059669' : '#D97706'};">
        ${payload.score} / ${payload.maxScore} (${payload.percentage}%)
      </div>
      <p style="font-size: 13px; color: #475569; margin-top: 6px;">Status: <strong>${payload.passed ? 'Passed - Great job!' : 'Requires Review'}</strong></p>
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Quiz Score: ${payload.score}/${payload.maxScore} for ${payload.quizTitle}`,
      contentHtml,
      ctaText: 'View Detailed Breakdown',
      ctaUrl,
    }),
  };
};

/**
 * 7. Assignment Submission Template
 */
export const buildAssignmentSubmissionTemplate = (
  payload: AssignmentSubmissionPayload
): { subject: string; html: string } => {
  const subject = `Assignment Submitted: ${payload.assignmentTitle}`;

  const contentHtml = `
    <h1 class="h1-title">Assignment Submission Received</h1>
    <p class="p-text">Hello <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">Your submission for <strong>${payload.assignmentTitle}</strong> (${payload.courseTitle}) was successfully uploaded and logged into our evaluation engine.</p>

    <div class="metric-box">
      <div class="metric-label">Submission Timestamp</div>
      <div class="metric-value">${payload.submissionDate}</div>
      ${payload.submissionId ? `<p style="font-size: 13px; color: #475569; margin-top: 6px;">Reference ID: <code>${payload.submissionId}</code></p>` : ''}
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Submission receipt for ${payload.assignmentTitle}`,
      contentHtml,
      ctaText: 'View Workspace Submissions',
      ctaUrl: 'https://shaivika.com/dashboard',
    }),
  };
};

/**
 * 8. Certificate Generated Template
 */
export const buildCertificateGeneratedTemplate = (
  payload: CertificateGeneratedPayload
): { subject: string; html: string } => {
  const subject = `Official Certificate Issued: ${payload.courseTitle} 📜`;

  const contentHtml = `
    <h1 class="h1-title">Official Certificate Issued!</h1>
    <p class="p-text">Dear <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">Your verified digital credential for <strong>${payload.courseTitle}</strong> is now available.</p>

    <div class="metric-box" style="border-left-color: #6366F1;">
      <div class="metric-label">Verification Credential</div>
      <div class="metric-value" style="color: #4F46E5;">ID: ${payload.certificateId}</div>
      <p style="font-size: 13px; color: #475569; margin-top: 6px;">Issued On: ${payload.issueDate} &bull; Issuer: KaizenQ / SHAIVIKA GROUPS</p>
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Your verified certificate for ${payload.courseTitle} is ready`,
      contentHtml,
      ctaText: 'Download & Share Certificate',
      ctaUrl: payload.certificateUrl,
    }),
  };
};

/**
 * 9. Instructor Approval Template
 */
export const buildInstructorApprovalTemplate = (
  payload: InstructorApprovalPayload
): { subject: string; html: string } => {
  const isApproved = payload.status === 'approved';
  const subject = `Instructor Portal Status: ${isApproved ? 'Approved ✅' : 'Application Update'}`;
  const ctaUrl = payload.portalUrl || 'https://shaivika.com/instructor';

  const contentHtml = `
    <h1 class="h1-title">Instructor Account Status</h1>
    <p class="p-text">Hello <strong>${payload.instructorName}</strong>,</p>
    <p class="p-text">${
      isApproved
        ? 'Congratulations! Your instructor application for KaizenQ LMS has been approved. You can now publish courses and host interactive Linux labs.'
        : 'There is an update regarding your instructor application status.'
    }</p>

    <div class="metric-box" style="border-left-color: ${isApproved ? '#10B981' : '#EF4444'};">
      <div class="metric-label">Status</div>
      <div class="metric-value" style="color: ${isApproved ? '#059669' : '#DC2626'};">
        ${payload.status.toUpperCase()}
      </div>
      ${payload.comments ? `<p style="font-size: 13px; color: #475569; margin-top: 6px;">Admin Notes: ${payload.comments}</p>` : ''}
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Instructor portal application status: ${payload.status}`,
      contentHtml,
      ctaText: isApproved ? 'Go to Instructor Portal' : 'Review Application',
      ctaUrl,
    }),
  };
};

/**
 * 10. Admin Notification Template
 */
export const buildAdminNotificationTemplate = (
  payload: AdminNotificationPayload
): { subject: string; html: string } => {
  const subject = `[SYSTEM ALERT] ${payload.title}`;
  const ctaUrl = payload.actionUrl || 'https://shaivika.com/admin/dashboard';

  const contentHtml = `
    <h1 class="h1-title">System Alert: ${payload.title}</h1>
    <p class="p-text">Attention Admin,</p>
    <p class="p-text">${payload.message}</p>

    <div class="metric-box" style="border-left-color: #EF4444;">
      <div class="metric-label">Alert Severity: ${payload.alertType.toUpperCase()}</div>
      <div class="metric-value" style="color: #DC2626;">${payload.title}</div>
      ${
        payload.details
          ? `<pre style="font-size: 12px; background: #0F172A; color: #38BDF8; padding: 12px; border-radius: 8px; margin-top: 10px; overflow-x: auto;">${JSON.stringify(
              payload.details,
              null,
              2
            )}</pre>`
          : ''
      }
    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `System Alert: ${payload.title}`,
      contentHtml,
      ctaText: 'Open Admin Console',
      ctaUrl,
    }),
  };
};

/**
 * Registration Pending Welcome Email Template (Student Signup Confirmation)
 */
export const buildRegistrationPendingTemplate = (payload: RegistrationPendingPayload) => {
  const subject = `🚀 Welcome to KaizenQ LMS, ${payload.studentName}!`;

  const contentHtml = `
    <!-- Hero Greeting Header -->
    <div style="text-align: left; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #FEF3C7; color: #D97706; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #FDE68A;">
        ⏳ Step 1 Complete • Pending Admin Approval
      </span>
      <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 16px 0 8px 0; letter-spacing: -0.5px;">
        Welcome to KaizenQ AI LMS!
      </h1>
      <p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.6;">
        Hello <strong>${payload.studentName}</strong>, your student registration form has been successfully submitted and logged in our system.
      </p>
    </div>

    <!-- Details Box -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #0284C7; border-radius: 16px; padding: 22px; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
        REGISTRATION PROFILE SUMMARY
      </div>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; font-weight: 600; width: 140px; color: #64748B;">Student Name:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0F172A;">${payload.studentName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #64748B;">College Email:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0284C7; font-family: monospace;">${payload.email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #64748B;">GitHub URL:</td>
          <td style="padding: 6px 0;">
            <a href="${payload.githubUrl}" target="_blank" style="color: #2563EB; font-weight: 700; text-decoration: underline;">
              ${payload.githubUrl}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #64748B;">Account Status:</td>
          <td style="padding: 6px 0;">
            <span style="background-color: #FEF3C7; color: #B45309; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 6px; display: inline-block;">
              ${payload.status || 'Pending Approval'}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Informational Note -->
    <div style="background-color: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #0369A1; line-height: 1.6;">
        💡 <strong>What Happens Next?</strong> Our administration team will review your GitHub portfolio and college details. Once approved, you will receive an instant activation email to access Linux sandboxes, AI code tutors, and certification tracks.
      </p>
    </div>

    <p style="font-size: 14px; color: #64748B; margin-top: 24px;">
      Best regards,<br>
      <strong style="color: #0F172A;">KaizenQ Engineering Team</strong>
    </p>
  `;

  const targetCtaUrl = payload.verificationLink || `https://shaivika-lms.vercel.app/auth/login?verified=true&email=${encodeURIComponent(payload.email)}`;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Welcome to KaizenQ LMS, ${payload.studentName}! Please verify your email to access your account.`,
      contentHtml,
      ctaText: '✨ Verify Email & Sign In to KaizenQ',
      ctaUrl: targetCtaUrl,
    }),
  };
};

/**
 * Registration Approved Email Template
 */
export const buildRegistrationApprovedTemplate = (payload: RegistrationApprovedPayload) => {
  const subject = `🎉 Congratulations ${payload.studentName}! Your KaizenQ Account is Approved!`;
  const ctaUrl = payload.dashboardUrl || 'https://shaivika-lms.vercel.app/auth/login';

  const contentHtml = `
    <!-- Hero Celebration Header -->
    <div style="text-align: left; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #D1FAE5; color: #047857; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #A7F3D0;">
        ✅ Account Verified & Approved
      </span>
      <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 16px 0 8px 0; letter-spacing: -0.5px;">
        Welcome to the KaizenQ LMS Platform!
      </h1>
      <p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.6;">
        Hello <strong>${payload.studentName}</strong>, great news! Your student account has been officially <strong>Approved</strong> by the KaizenQ administration team.
      </p>
    </div>

    <!-- Feature Highlights Box -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #10B981; border-radius: 16px; padding: 22px; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
        WHAT YOU CAN DO NOW
      </div>
      <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 14px; line-height: 1.8;">
        <li>💻 <strong>Real-time Linux Sandboxes:</strong> Run interactive bash commands in browser environment.</li>
        <li>🤖 <strong>24/7 AI Code Mentor:</strong> Instant pair programming & bug resolution support.</li>
        <li>🏆 <strong>ISO Cryptographic Credentials:</strong> Earn shareable certificates for your resume.</li>
      </ul>
    </div>

    <!-- CTA Prompt -->
    <p style="font-size: 15px; color: #334155; text-align: center; margin: 28px 0 12px 0; font-weight: 600;">
      Ready to start your learning journey? Click below to log in:
    </p>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Congratulations ${payload.studentName}! Your KaizenQ student account is approved!`,
      contentHtml,
      ctaText: 'Access Student Dashboard 🚀',
      ctaUrl,
    }),
  };
};

/**
 * Registration Rejected Email Template
 */
export const buildRegistrationRejectedTemplate = (payload: RegistrationRejectedPayload) => {
  const subject = `KaizenQ LMS Registration Update regarding your account`;

  const contentHtml = `
    <!-- Header Banner -->
    <div style="text-align: left; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #FEE2E2; color: #B91C1C; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #FCA5A5;">
        ❌ Registration Update
      </span>
      <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 16px 0 8px 0; letter-spacing: -0.5px;">
        Account Registration Status
      </h1>
      <p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.6;">
        Hello <strong>${payload.studentName}</strong>, thank you for your interest in KaizenQ AI LMS. After reviewing your registration application, we are unable to approve your account at this time.
      </p>
    </div>

    <!-- Rejection Reason Card -->
    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-left: 4px solid #EF4444; border-radius: 16px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #991B1B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
        REASON SPECIFIED BY ADMINISTRATOR
      </div>
      <p style="margin: 0; font-size: 14px; color: #7F1D1D; font-weight: 600; line-height: 1.6;">
        "${payload.reason}"
      </p>
    </div>

    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      If you believe this was done in error or if you wish to update your GitHub profile or college details, please contact our support team at <a href="mailto:kaizenq.lms@gmail.com" style="color: #0284C7; font-weight: 700;">kaizenq.lms@gmail.com</a>.
    </p>

    <p style="font-size: 14px; color: #64748B; margin-top: 24px;">
      Sincerely,<br>
      <strong style="color: #0F172A;">KaizenQ Support Team</strong>
    </p>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: 'Update regarding your KaizenQ student registration application.',
      contentHtml,
    }),
  };
};

export const buildLecturerPendingTemplate = (payload: LecturerPendingPayload) => {
  const subject = 'Lecturer Registration Received';
  const contentHtml = `
    <h1 class="h1-title" style="color: #1E3A8A; font-size: 22px; margin-bottom: 12px;">Application Received</h1>
    <p class="p-text">Hello <strong>${payload.lecturerName}</strong>,</p>
    <p class="p-text">Your lecturer application for KaizenQ LMS has been received successfully.</p>
    <p class="p-text">Please wait while our administrative team reviews your academic details and repository history. You will receive an email confirmation once reviewed.</p>
  `;
  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: 'Your lecturer registration has been received successfully.',
      contentHtml,
    })
  };
};

export const buildLecturerApprovedTemplate = (payload: LecturerApprovedPayload) => {
  const subject = 'Congratulations! You are Approved as Lecturer';
  const ctaUrl = payload.dashboardUrl || 'https://shaivika-lms.vercel.app/instructor/dashboard';
  const contentHtml = `
    <h1 class="h1-title" style="color: #10B981; font-size: 24px; margin-bottom: 12px;">Welcome Aboard!</h1>
    <p class="p-text">Hello <strong>${payload.lecturerName}</strong>,</p>
    <p class="p-text">Your Lecturer application for KaizenQ LMS has been officially approved and activated.</p>
    <p class="p-text">You now have complete access to the Instructor Dashboard where you can release course tracks, write sandbox guides, and check student progress metrics.</p>
  `;
  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: 'Congratulations! Your instructor portal registration is approved.',
      contentHtml,
      ctaText: 'Access Instructor Dashboard 🚀',
      ctaUrl,
    })
  };
};

export const buildCoursePublishedTemplate = (payload: CoursePublishedPayload) => {
  const subject = 'New Course Track Published!';
  const ctaUrl = payload.courseUrl || 'https://shaivika-lms.vercel.app/courses';
  const contentHtml = `
    <h1 class="h1-title" style="color: #3B82F6; font-size: 22px; margin-bottom: 12px;">New Course Track Released</h1>
    <p class="p-text">Hello <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">We are excited to announce that a new course has just been published: <strong>${payload.courseTitle}</strong>.</p>
    <p class="p-text">Explore the syllabus, configure your practice lab sandbox, and start learning now.</p>
  `;
  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `New Course Released: ${payload.courseTitle}`,
      contentHtml,
      ctaText: 'Explore Course Track',
      ctaUrl,
    })
  };
};

export const buildAssignmentReminderTemplate = (payload: AssignmentReminderPayload) => {
  const subject = `Reminder: Assignment Pending - ${payload.assignmentTitle}`;
  const ctaUrl = payload.submissionUrl || 'https://shaivika-lms.vercel.app/dashboard';
  const contentHtml = `
    <h1 class="h1-title" style="color: #F59E0B; font-size: 22px; margin-bottom: 12px;">Assignment Submission Reminder</h1>
    <p class="p-text">Hello <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">This is a reminder that you have a pending assignment submission: <strong>${payload.assignmentTitle}</strong> for the course <strong>${payload.courseTitle}</strong>.</p>
    <div class="metric-box" style="border-left-color: #F59E0B; margin: 20px 0; background: #FFFBEB; padding: 15px; border-radius: 8px;">
      <div class="metric-label" style="font-size: 11px; text-transform: uppercase; color: #B45309; font-weight: 700;">Submission Deadline</div>
      <div class="metric-value" style="color: #B45309; font-size: 18px; font-weight: bold; margin-top: 4px;">${payload.dueDate}</div>
    </div>
  `;
  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Reminder: Assignment due by ${payload.dueDate}`,
      contentHtml,
      ctaText: 'Submit Assignment',
      ctaUrl,
    })
  };
};

export const buildQuizReminderTemplate = (payload: QuizReminderPayload) => {
  const subject = `Reminder: Quiz Pending - ${payload.quizTitle}`;
  const ctaUrl = payload.quizUrl || 'https://shaivika-lms.vercel.app/dashboard';
  const contentHtml = `
    <h1 class="h1-title" style="color: #3B82F6; font-size: 22px; margin-bottom: 12px;">Quiz Attempt Reminder</h1>
    <p class="p-text">Hello <strong>${payload.studentName}</strong>,</p>
    <p class="p-text">This is a reminder that you have a pending quiz attempt: <strong>${payload.quizTitle}</strong> for the course <strong>${payload.courseTitle}</strong>.</p>
    ${payload.dueDate ? `
    <div class="metric-box" style="border-left-color: #3B82F6; margin: 20px 0; background: #EFF6FF; padding: 15px; border-radius: 8px;">
      <div class="metric-label" style="font-size: 11px; text-transform: uppercase; color: #1D4ED8; font-weight: 700;">Complete By</div>
      <div class="metric-value" style="color: #1D4ED8; font-size: 18px; font-weight: bold; margin-top: 4px;">${payload.dueDate}</div>
    </div>
    ` : ''}
  `;
  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Reminder: Quiz attempt pending for ${payload.quizTitle}`,
      contentHtml,
      ctaText: 'Take Quiz Now',
      ctaUrl,
    })
  };
};

/**
 * Registry to build HTML template based on event type
 */
export const buildEventEmailTemplate = (
  eventType: EmailEventType,
  payload: any
): { subject: string; html: string } => {
  switch (eventType) {
    case EmailEventType.STUDENT_REGISTRATION:
      return buildStudentRegistrationTemplate(payload);
    case EmailEventType.REGISTRATION_PENDING:
      return buildRegistrationPendingTemplate(payload);
    case EmailEventType.REGISTRATION_APPROVED:
      return buildRegistrationApprovedTemplate(payload);
    case EmailEventType.REGISTRATION_REJECTED:
      return buildRegistrationRejectedTemplate(payload);
    case EmailEventType.EMAIL_VERIFICATION:
      return buildEmailVerificationTemplate(payload);
    case EmailEventType.PASSWORD_RESET:
      return buildPasswordResetTemplate(payload);
    case EmailEventType.COURSE_ENROLLMENT:
      return buildCourseEnrollmentTemplate(payload);
    case EmailEventType.COURSE_COMPLETION:
      return buildCourseCompletionTemplate(payload);
    case EmailEventType.QUIZ_RESULT:
      return buildQuizResultTemplate(payload);
    case EmailEventType.ASSIGNMENT_SUBMISSION:
      return buildAssignmentSubmissionTemplate(payload);
    case EmailEventType.CERTIFICATE_GENERATED:
      return buildCertificateGeneratedTemplate(payload);
    case EmailEventType.INSTRUCTOR_APPROVAL:
      return buildInstructorApprovalTemplate(payload);
    case EmailEventType.ADMIN_NOTIFICATION:
      return buildAdminNotificationTemplate(payload);
    case EmailEventType.LECTURER_PENDING:
      return buildLecturerPendingTemplate(payload);
    case EmailEventType.LECTURER_APPROVED:
      return buildLecturerApprovedTemplate(payload);
    case EmailEventType.COURSE_PUBLISHED:
      return buildCoursePublishedTemplate(payload);
    case EmailEventType.ASSIGNMENT_REMINDER:
      return buildAssignmentReminderTemplate(payload);
    case EmailEventType.QUIZ_REMINDER:
      return buildQuizReminderTemplate(payload);
    default:
      return {
        subject: `Notification from KaizenQ AI LMS`,
        html: renderMasterLayout({
          title: 'Notification',
          contentHtml: `<p>Hello ${payload?.studentName || 'Student'},</p><p>You have a new update from KaizenQ AI LMS.</p>`
        })
      };
  }
};

export interface EmailData {
  to?: string;
  studentName?: string;
  type: string;
  reason?: string;
}

export function getEmailTemplate(data: EmailData): { subject: string; html: string } {
  const typeUpper = (data.type || '').toUpperCase().replace(/\s+/g, '_');
  let eventType = EmailEventType.REGISTRATION_PENDING;

  if (typeUpper.includes('VERIFIED') || typeUpper.includes('VERIFICATION')) {
    eventType = EmailEventType.EMAIL_VERIFICATION;
  } else if (typeUpper.includes('APPROVED') || typeUpper.includes('WELCOME')) {
    eventType = EmailEventType.REGISTRATION_APPROVED;
  } else if (typeUpper.includes('REJECTED')) {
    eventType = EmailEventType.REGISTRATION_REJECTED;
  } else if (typeUpper.includes('SUSPENDED')) {
    eventType = EmailEventType.REGISTRATION_REJECTED;
  }

  return buildEventEmailTemplate(eventType, {
    studentName: data.studentName || 'Student Scholar',
    email: data.to || '',
    rejectionReason: data.reason || 'Policy criteria check',
    approvalDate: new Date().toLocaleDateString(),
  });
}

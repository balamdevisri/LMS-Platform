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
  EmailVerificationPayload,
  PasswordResetPayload,
  CourseEnrollmentPayload,
  CourseCompletionPayload,
  QuizResultPayload,
  AssignmentSubmissionPayload,
  CertificateGeneratedPayload,
  InstructorApprovalPayload,
  AdminNotificationPayload,
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
 * Registry to build HTML template based on event type
 */
export const buildEventEmailTemplate = (
  eventType: EmailEventType,
  payload: any
): { subject: string; html: string } => {
  switch (eventType) {
    case EmailEventType.STUDENT_REGISTRATION:
      return buildStudentRegistrationTemplate(payload);
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
    default:
      throw new Error(`Unsupported email event type: ${eventType}`);
  }
};

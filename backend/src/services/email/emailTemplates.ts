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
  InstructorRegistrationPendingPayload,
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

export const buildInstructorApprovalTemplate = (
  payload: InstructorApprovalPayload
): { subject: string; html: string } => {
  const isApproved = payload.status === 'approved';
  const subject = isApproved 
    ? '🎉 Welcome to KaizenQ LMS Platform — You are Approved!' 
    : 'Instructor Application Status Update | KaizenQ LMS';
  const ctaUrl = payload.portalUrl || 'https://shaivika-lms.vercel.app/auth/login';

  const contentHtml = `
    <!-- Dark Theme Container -->
    <div style="background-color: #0F172A; border-radius: 16px; border: 1px solid #1E293B; padding: 28px 32px; color: #F8FAFC; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
      
      <!-- Gradient Logo Banner -->
      <div style="background: linear-gradient(135deg, ${isApproved ? '#1E40AF 0%, #4F46E5 50%, #7C3AED 100%' : '#DC2626 0%, #EF4444 100%'}); padding: 22px 28px; border-radius: 14px; margin-bottom: 28px; text-align: center;">
        <div style="font-size: 11px; color: #A5B4FC; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Powered by Shaivika Groups</div>
        <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px;">KaizenQ LMS</div>
        <div style="font-size: 11px; color: #C7D2FE; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Faculty Instructor Portal</div>
      </div>

      <!-- Greeting -->
      <h2 style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 0 0 16px 0;">
        Hello ${payload.instructorName},
      </h2>

      ${
        isApproved
          ? `
      <!-- Welcome Headline -->
      <p style="font-size: 22px; font-weight: 900; color: #34D399; margin: 0 0 8px 0;">🎉 Welcome to KaizenQ LMS Platform!</p>
      <p style="font-size: 14px; color: #A5B4FC; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 1px;">Powered by Shaivika Groups</p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        We are thrilled to inform you that your Instructor application has been <strong style="color: #34D399;">officially approved</strong> by the KaizenQ administration team.
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 20px 0;">
        You now have full access to the <strong style="color: #FFFFFF;">KaizenQ Instructor Dashboard</strong> where you can manage courses, monitor student progress, and deliver world-class education.
      </p>

      <!-- Welcome Feature Highlights -->
      <div style="background-color: #1E293B; border-radius: 14px; padding: 22px 24px; margin: 20px 0;">
        <p style="font-size: 13px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Your Instructor Access Includes</p>
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">📚</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">Full Instructor Dashboard &amp; Course Management</p>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">📊</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">Student Progress Tracking &amp; Analytics</p>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">🎓</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">Certificate Issuance &amp; Live Classroom Tools</p>
        </div>
        <div style="display: flex; align-items: flex-start;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">🤝</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">Dedicated Instructor Support from Shaivika Groups</p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0 24px 0;">
        <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); color: #FFFFFF; font-size: 16px; font-weight: 800; text-decoration: none; padding: 16px 40px; border-radius: 14px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4); letter-spacing: 0.5px;">
          Access KaizenQ Dashboard 🚀
        </a>
      </div>

      <!-- Branding Tag -->
      <div style="text-align: center; background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(124,58,237,0.1) 100%); border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; padding: 14px 20px; margin: 16px 0;">
        <p style="font-size: 13px; color: #A5B4FC; font-weight: 700; margin: 0;">KaizenQ LMS Platform &bull; Powered by Shaivika Groups</p>
        <p style="font-size: 12px; color: #64748B; margin: 4px 0 0 0;">Empowering Education Through Technology</p>
      </div>
      `
          : `
      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Thank you for your interest in joining <strong style="color: #FFFFFF;">KaizenQ LMS</strong> as a Faculty Instructor.
      </p>
      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 20px 0;">
        After careful administrative review, we are currently unable to approve your instructor account at this time. ${payload.comments ? `<br><strong style="color: #F87171;">Reason:</strong> ${payload.comments}` : ''}
      </p>
      <p style="font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px 0;">
        You may re-apply in the future or contact us for further clarification.
      </p>
      `
      }

      <!-- Footer & Support Section -->
      <div style="border-top: 1px solid #1E293B; margin-top: 28px; padding-top: 20px; font-size: 13px; color: #94A3B8;">
        <p style="margin: 0 0 12px 0;">Questions? Reach us at <a href="mailto:kaizenq.lms@gmail.com" style="color: #38BDF8; text-decoration: underline;">kaizenq.lms@gmail.com</a></p>
        <p style="margin: 0; font-size: 14px; color: #E2E8F0; font-weight: 700;">
          Warm regards,<br>
          <span style="color: #818CF8;">KaizenQ LMS Team</span><br>
          <span style="font-size: 12px; color: #64748B; font-weight: 400;">Powered by Shaivika Groups</span>
        </p>
      </div>

    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: isApproved 
        ? `Welcome ${payload.instructorName}! You are approved on KaizenQ LMS Platform powered by Shaivika Groups.` 
        : `Update regarding your KaizenQ LMS instructor application.`,
      contentHtml,
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
  const subject = `Welcome to SHAIVIKA LMS – Registration Received`;

  const contentHtml = `
    <!-- Dark Theme Card Container -->
    <div style="background-color: #0F172A; border-radius: 16px; border: 1px solid #1E293B; padding: 28px 32px; color: #F8FAFC; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
      
      <!-- Gradient Logo Header -->
      <div style="background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); padding: 20px 24px; border-radius: 12px; margin-bottom: 24px;">
        <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px;">SHAIVIKA LMS</div>
        <div style="font-size: 11px; color: #E0E7FF; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Learning Management System</div>
      </div>

      <!-- Greeting -->
      <h2 style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 0 0 16px 0;">
        Hello ${payload.studentName},
      </h2>

      <!-- Message Content -->
      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Thank you for registering with <strong>SHAIVIKA Learning Management System</strong>.
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Your registration has been received successfully.
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Your account is currently under administrator review.
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Once approved, you will receive another email confirming your account activation.
      </p>

      <!-- Status Highlight Box -->
      <div style="background-color: #1E293B; border-left: 4px solid #38BDF8; border-radius: 10px; padding: 18px; margin: 20px 0;">
        <p style="font-size: 13.5px; color: #38BDF8; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          ⏳ Status: Pending Administrator Approval
        </p>
        <p style="font-size: 14px; color: #94A3B8; margin: 0; line-height: 1.5;">
          Registered Email: <span style="color: #F8FAFC; font-family: monospace; font-weight: 600;">${payload.email}</span>
        </p>
      </div>

      <!-- Warning Note -->
      <p style="font-size: 14px; color: #F8FAFC; font-weight: 600; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); padding: 14px 18px; border-radius: 10px; margin: 20px 0 24px 0; line-height: 1.5;">
        ⚠️ Please do not create another account while waiting.
      </p>

      <!-- Footer & Support Section -->
      <div style="border-top: 1px solid #1E293B; margin-top: 28px; padding-top: 20px; font-size: 13px; color: #94A3B8;">
        <p style="margin: 0 0 12px 0;">Need assistance? Contact support at <a href="mailto:kaizenq.lms@gmail.com" style="color: #38BDF8; text-decoration: underline;">kaizenq.lms@gmail.com</a></p>
        <p style="margin: 0; font-size: 14px; color: #E2E8F0; font-weight: 700;">
          Regards,<br>
          <span style="color: #38BDF8;">SHAIVIKA LMS Team</span>
        </p>
      </div>

    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Hello ${payload.studentName}, your registration with SHAIVIKA LMS has been received and is under review.`,
      contentHtml,
    }),
  };
};

/**
 * Instructor Registration Pending Email Template
 */
export const buildInstructorRegistrationPendingTemplate = (payload: InstructorRegistrationPendingPayload) => {
  const subject = `Application Received — Awaiting Admin Approval | KaizenQ LMS`;

  const contentHtml = `
    <!-- Dark Theme Card Container -->
    <div style="background-color: #0F172A; border-radius: 16px; border: 1px solid #1E293B; padding: 28px 32px; color: #F8FAFC; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
      
      <!-- Gradient Logo Header -->
      <div style="background: linear-gradient(135deg, #1E40AF 0%, #4F46E5 50%, #7C3AED 100%); padding: 22px 28px; border-radius: 14px; margin-bottom: 28px; text-align: center;">
        <div style="font-size: 11px; color: #A5B4FC; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Powered by Shaivika Groups</div>
        <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px;">KaizenQ LMS</div>
        <div style="font-size: 11px; color: #C7D2FE; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Faculty Instructor Portal</div>
      </div>

      <!-- Greeting -->
      <h2 style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 0 0 16px 0;">
        Hello ${payload.instructorName},
      </h2>

      <!-- Message Content -->
      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Thank you for registering as a Faculty Instructor on <strong style="color: #FFFFFF;">KaizenQ LMS</strong>, powered by <strong style="color: #A5B4FC;">Shaivika Groups</strong>.
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Your application has been <strong style="color: #34D399;">successfully received</strong> and is currently under review by our administration team.
      </p>

      <!-- Wait for Approval Box (prominent) -->
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(251, 191, 36, 0.08) 100%); border: 1.5px solid #F59E0B; border-radius: 14px; padding: 22px 24px; margin: 24px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 24px; margin-right: 10px;">⏳</span>
          <p style="font-size: 15px; color: #FCD34D; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Waiting for Admin Approval</p>
        </div>
        <p style="font-size: 14px; color: #94A3B8; margin: 0 0 10px 0; line-height: 1.6;">
          Your account is <strong style="color: #FCD34D;">not yet active</strong>. Please do not try to log in until you receive your approval confirmation email.
        </p>
        <p style="font-size: 13px; color: #64748B; margin: 0; font-family: monospace;">
          Registered Email: <span style="color: #F8FAFC; font-weight: 600;">${payload.email}</span>
        </p>
      </div>

      <!-- What Happens Next -->
      <div style="background-color: #1E293B; border-radius: 12px; padding: 20px 24px; margin: 20px 0;">
        <p style="font-size: 13px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0;">What Happens Next?</p>
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">1️⃣</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">Our admin team reviews your instructor application</p>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">2️⃣</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">Upon approval, you'll receive a <strong style="color: #34D399;">Welcome Email</strong> with your login credentials</p>
        </div>
        <div style="display: flex; align-items: flex-start;">
          <span style="font-size: 18px; margin-right: 12px; min-width: 24px;">3️⃣</span>
          <p style="font-size: 14px; color: #CBD5E1; margin: 0; line-height: 1.5;">You'll gain full access to the KaizenQ Instructor Dashboard</p>
        </div>
      </div>

      <!-- Footer & Support Section -->
      <div style="border-top: 1px solid #1E293B; margin-top: 28px; padding-top: 20px; font-size: 13px; color: #94A3B8;">
        <p style="margin: 0 0 12px 0;">Questions? Contact us at <a href="mailto:kaizenq.lms@gmail.com" style="color: #38BDF8; text-decoration: underline;">kaizenq.lms@gmail.com</a></p>
        <p style="margin: 0; font-size: 14px; color: #E2E8F0; font-weight: 700;">
          Warm regards,<br>
          <span style="color: #818CF8;">KaizenQ LMS Team</span><br>
          <span style="font-size: 12px; color: #64748B; font-weight: 400;">Powered by Shaivika Groups</span>
        </p>
      </div>

    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Hello ${payload.instructorName} — your KaizenQ LMS instructor application has been received. Please wait for admin approval.`,
      contentHtml,
    }),
  };
};

/**
 * Registration Approved Email Template (Student)
 */
export const buildRegistrationApprovedTemplate = (payload: RegistrationApprovedPayload) => {
  const subject = `Congratulations! Your SHAIVIKA LMS Account is Approved`;
  const ctaUrl = payload.dashboardUrl || 'https://shaivika-lms.vercel.app/auth/login';

  const contentHtml = `
    <!-- Dark Theme Container -->
    <div style="background-color: #0F172A; border-radius: 16px; border: 1px solid #1E293B; padding: 28px 32px; color: #F8FAFC; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
      
      <!-- Gradient Logo Banner -->
      <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); padding: 20px 24px; border-radius: 12px; margin-bottom: 24px;">
        <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px;">SHAIVIKA LMS</div>
        <div style="font-size: 11px; color: #D1FAE5; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Account Activation &bull; Student Portal</div>
      </div>

      <!-- Greeting -->
      <h2 style="font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 0 0 16px 0;">
        Hello ${payload.studentName},
      </h2>

      <!-- Message -->
      <p style="font-size: 16px; font-weight: 700; color: #10B981; margin: 0 0 12px 0;">
        🎉 Congratulations!
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 14px 0;">
        Your account has been approved.
      </p>

      <p style="font-size: 15px; color: #CBD5E1; line-height: 1.7; margin: 0 0 20px 0;">
        You can now login to <strong>SHAIVIKA LMS</strong> and start learning.
      </p>

      <!-- Dashboard Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);">
          Access Student Dashboard 🚀
        </a>
      </div>

      <!-- Footer & Support -->
      <div style="border-top: 1px solid #1E293B; margin-top: 28px; padding-top: 20px; font-size: 13px; color: #94A3B8;">
        <p style="margin: 0 0 12px 0;">Need support? Contact us at <a href="mailto:kaizenq.lms@gmail.com" style="color: #38BDF8; text-decoration: underline;">kaizenq.lms@gmail.com</a></p>
        <p style="margin: 0; font-size: 14px; color: #E2E8F0; font-weight: 700;">
          Regards,<br>
          <span style="color: #10B981;">SHAIVIKA LMS Team</span>
        </p>
      </div>

    </div>
  `;

  return {
    subject,
    html: renderMasterLayout({
      title: subject,
      preheader: `Congratulations ${payload.studentName}! Your SHAIVIKA LMS account is approved!`,
      contentHtml,
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
    case EmailEventType.INSTRUCTOR_REGISTRATION_PENDING:
      return buildInstructorRegistrationPendingTemplate(payload);
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

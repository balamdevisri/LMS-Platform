export interface EmailData {
  to: string;
  studentName: string;
  type: 'REGISTRATION_RECEIVED' | 'EMAIL_VERIFIED' | 'APPROVAL_GRANTED' | 'APPLICATION_REJECTED' | 'ACCOUNT_SUSPENDED' | 'WELCOME_KAIZENQ';
  reason?: string;
}

export function getEmailTemplate(data: EmailData): { subject: string; html: string } {
  const brandHeader = `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
      <h1 style="color: #ffffff; font-family: 'Sora', sans-serif; font-size: 26px; margin: 0; font-weight: 800; tracking: -0.02em;">
        Kaizen<span style="color: #6366f1;">Q</span> <span style="font-size: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 4px 10px; border-radius: 20px; font-weight: 600;">ENTERPRISE AI LMS</span>
      </h1>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 8px; margin-bottom: 0;">Empowering Next-Gen AI & System Engineering Scholars</p>
    </div>
  `;

  const brandFooter = `
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 8px 0; font-weight: 600;">KaizenQ AI LMS • Enterprise Academic Platform</p>
      <p style="margin: 0;">This is an automated system notification. Need assistance? Contact <a href="mailto:support@kaizenq.ai" style="color: #6366f1; text-decoration: none;">support@kaizenq.ai</a></p>
    </div>
  `;

  let subject = '';
  let bodyContent = '';

  switch (data.type) {
    case 'REGISTRATION_RECEIVED':
      subject = 'Application Received - KaizenQ AI LMS';
      bodyContent = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to KaizenQ, ${data.studentName}!</h2>
        <p style="color: #334155; line-height: 1.6;">Your student application has been successfully submitted. Please complete email verification to submit your profile for administrator review.</p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">Status: Pending Email Verification</p>
        </div>
      `;
      break;

    case 'EMAIL_VERIFIED':
      subject = 'Email Verified - Pending Admin Approval';
      bodyContent = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Email Verification Complete!</h2>
        <p style="color: #334155; line-height: 1.6;">Hi ${data.studentName}, your email address has been verified. Your application is now queued for Admin approval.</p>
        <p style="color: #475569; line-height: 1.6;">Our admissions team will review your academic and GitHub details shortly. You will receive an email once approved.</p>
      `;
      break;

    case 'APPROVAL_GRANTED':
    case 'WELCOME_KAIZENQ':
      subject = '🎉 Application Approved! Welcome to KaizenQ AI LMS';
      bodyContent = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Congratulations, ${data.studentName}!</h2>
        <p style="color: #334155; line-height: 1.6;">Your KaizenQ AI LMS student account has been <strong>approved</strong> by the administrator!</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #166534; font-weight: 700;">Account Status: Fully Approved & Active</p>
          <p style="margin: 8px 0 0 0; color: #15803d; font-size: 13px;">You now have full access to interactive courses, AI tutoring lab, and terminal sandboxes.</p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://kaizenq.ai/login" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">Log In to Dashboard</a>
        </div>
      `;
      break;

    case 'APPLICATION_REJECTED':
      subject = 'Update Regarding Your KaizenQ Application';
      bodyContent = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Application Status Update</h2>
        <p style="color: #334155; line-height: 1.6;">Hi ${data.studentName}, thank you for your interest in KaizenQ AI LMS. After administrative review, we regret to inform you that your registration application was not approved at this time.</p>
        ${data.reason ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-weight: 600;">Reason:</p>
            <p style="margin: 4px 0 0 0; color: #b91c1c; font-size: 13px;">${data.reason}</p>
          </div>
        ` : ''}
        <p style="color: #475569; font-size: 13px;">If you believe this decision was made in error or wish to update your details, please reply to this email.</p>
      `;
      break;

    case 'ACCOUNT_SUSPENDED':
      subject = '⚠️ Account Status Notice - Account Suspended';
      bodyContent = `
        <h2 style="color: #991b1b; margin-top: 0; font-size: 20px;">Account Notice for ${data.studentName}</h2>
        <p style="color: #334155; line-height: 1.6;">Your student account on KaizenQ AI LMS has been temporarily suspended by an administrator.</p>
        ${data.reason ? `
          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #9a3412; font-weight: 600;">Administrative Reason:</p>
            <p style="margin: 4px 0 0 0; color: #c2410c; font-size: 13px;">${data.reason}</p>
          </div>
        ` : ''}
        <p style="color: #475569; font-size: 13px;">Please contact support@kaizenq.ai for account resolution.</p>
      `;
      break;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px 0; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); overflow: hidden;">
        ${brandHeader}
        <div style="padding: 32px 28px;">
          ${bodyContent}
        </div>
        ${brandFooter}
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

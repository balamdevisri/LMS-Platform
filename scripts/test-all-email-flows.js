const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const nodemailer = require('nodemailer');

const port = parseInt(process.env.SMTP_PORT || '465', 10);
const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
const user = (process.env.SMTP_USER || process.env.SMTP_EMAIL || 'kaizenqlms@gmail.com').trim();
const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || 'gmjv leoa tadp vdyg').trim().replace(/\s+/g, '');
const from = process.env.SMTP_FROM || 'KaizenQ <no-reply@kaizenq.in>';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: port,
  secure: isSecure,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

const targetEmail = 'kaizenqlms@gmail.com';

async function testFlows() {
  console.log('====================================================');
  console.log('🧪 KAIZENQ DIRECT SMTP SUITE — ALL APPLICATION FLOWS');
  console.log('====================================================\n');

  // Verification
  console.log('1️⃣ Transporter Verification...');
  await transporter.verify();
  console.log('✅ [EMAIL] SMTP connection successful\n');

  // Flow 1: Student Welcome
  console.log('2️⃣ Flow 1: Student Signup Welcome Email...');
  const res1 = await transporter.sendMail({
    from,
    to: targetEmail,
    subject: 'Welcome to KaizenQ LMS! 🚀',
    html: `
      <div style="font-family: Arial; padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0;">
        <h2 style="color: #0284c7;">Welcome to KaizenQ AI LMS</h2>
        <p>Hi Student, your account has been registered successfully on <strong>kaizenq.in</strong>.</p>
        <p><a href="https://www.kaizenq.in/dashboard" style="background: #0284c7; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Go to Dashboard</a></p>
      </div>
    `
  });
  console.log('✅ Sent! MsgID:', res1.messageId, '| Response:', res1.response, '\n');

  // Flow 2: Instructor Approval
  console.log('3️⃣ Flow 2: Instructor Approval Email...');
  const res2 = await transporter.sendMail({
    from,
    to: targetEmail,
    subject: '🎉 Congratulations! Your KaizenQ Faculty Profile is Approved',
    html: `
      <div style="font-family: Arial; padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0;">
        <h2 style="color: #10b981;">Faculty Profile Approved</h2>
        <p>Congratulations, your instructor credentials have been approved by KaizenQ Administration.</p>
        <p><a href="https://www.kaizenq.in/instructor/dashboard" style="background: #10b981; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Access Faculty Studio</a></p>
      </div>
    `
  });
  console.log('✅ Sent! MsgID:', res2.messageId, '| Response:', res2.response, '\n');

  // Flow 3: Password Reset Link
  console.log('4️⃣ Flow 3: Password Reset Action Link Email...');
  const res3 = await transporter.sendMail({
    from,
    to: targetEmail,
    subject: 'Password Reset Request - KaizenQ AI LMS',
    html: `
      <div style="font-family: Arial; padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0;">
        <h2 style="color: #ef4444;">Reset Your Password</h2>
        <p>We received a password reset request for your KaizenQ account. Click below within 15 minutes:</p>
        <p><a href="https://www.kaizenq.in/auth/login?reset=true&email=${encodeURIComponent(targetEmail)}" style="background: #ef4444; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Reset Password</a></p>
      </div>
    `
  });
  console.log('✅ Sent! MsgID:', res3.messageId, '| Response:', res3.response, '\n');

  // Flow 4: Live Class Alert
  console.log('5️⃣ Flow 4: Live Class Broadcast Alert...');
  const res4 = await transporter.sendMail({
    from,
    to: targetEmail,
    subject: '🔴 Live Class Alert: Python & AI Mastery',
    html: `
      <div style="font-family: Arial; padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0;">
        <h2 style="color: #dc2626;">🔴 Live Class Starting Now</h2>
        <p>Session "Python & AI Mastery" is live. Click below to join the classroom room.</p>
        <p><a href="https://www.kaizenq.in/live-classroom" style="background: #dc2626; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Join Live Room</a></p>
      </div>
    `
  });
  console.log('✅ Sent! MsgID:', res4.messageId, '| Response:', res4.response, '\n');

  console.log('====================================================');
  console.log('🎉 ALL 5 DIRECT SMTP FLOWS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

testFlows().catch(err => {
  console.error('❌ Flow testing error:', err);
  process.exit(1);
});
